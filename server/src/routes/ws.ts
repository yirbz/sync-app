import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { db, schema } from "../db.js";
import { eq } from "drizzle-orm";

interface SyncClient {
  ws: WebSocket;
  userId: string;
  roomId: string;
  isAlive: boolean;
}

const rooms = new Map<string, Set<SyncClient>>();

export function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const c of room) {
    if (c.userId !== excludeUserId && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(data);
    }
  }
}

export function createWsServer(server: any) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 25000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  wss.on("connection", (ws: WebSocket & { isAlive?: boolean }, _req: IncomingMessage) => {
    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });

    let client: SyncClient | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case "auth": {
            const token = msg.token;
            if (!token) { ws.close(4001, "Token requerido"); return; }

            const userResp = await fetch(`${process.env.JELLYFIN_URL}/Users/Me`, {
              headers: {
                Authorization: `MediaBrowser Token="${token}"`,
                "X-Emby-Authorization": `MediaBrowser Client="Sync API", Device="Sync API Server", DeviceId="sync-api", Version="1.0.0"`,
              },
            });
            if (!userResp.ok) { ws.close(4001, "Token inválido"); return; }

            const user = await userResp.json();

            client = { ws, userId: user.Id, roomId: msg.roomId, isAlive: true };

            const room = rooms.get(msg.roomId) || new Set();
            room.add(client);
            rooms.set(msg.roomId, room);

            ws.send(JSON.stringify({ type: "auth_ok" }));
            break;
          }

          case "play":
          case "pause":
          case "seek":
          case "sync": {
            if (!client) return;

            const isPlaying = msg.type === "play" ? true : msg.type === "pause" ? false : undefined;
            const position = typeof msg.position === "number" ? msg.position : undefined;
            const lastUpdated = new Date().toISOString();

            const updateData: any = { updatedAt: new Date() };
            if (position !== undefined || isPlaying !== undefined) {
              const [currentRoom] = await db.select({ playbackState: schema.rooms.playbackState }).from(schema.rooms).where(eq(schema.rooms.id, client.roomId));
              const prevPlayback = (currentRoom?.playbackState as any) || { position: 0, isPlaying: false };
              updateData.playbackState = {
                position: position !== undefined ? position : prevPlayback.position,
                isPlaying: isPlaying !== undefined ? isPlaying : prevPlayback.isPlaying,
                lastUpdated,
              };
              if (isPlaying !== undefined) {
                updateData.status = isPlaying ? "playing" : "paused";
              }
            }

            await db
              .update(schema.rooms)
              .set(updateData)
              .where(eq(schema.rooms.id, client.roomId));

            broadcastToRoom(client.roomId, {
              type: "playback_update",
              action: msg.type,
              position: position !== undefined ? position : msg.position,
              isPlaying: isPlaying !== undefined ? isPlaying : msg.isPlaying,
              lastUpdated,
              senderId: client.userId,
            }, client.userId);

            ws.send(JSON.stringify({ type: "ack", lastUpdated }));
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }));
            break;
          }
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    });

    ws.on("close", () => {
      if (client) {
        const room = rooms.get(client.roomId);
        if (room) {
          room.delete(client);
          if (room.size === 0) rooms.delete(client.roomId);
        }
      }
    });
  });

  return wss;
}

import { Router } from "express";
import { db, schema } from "../db.js";
import { authenticateJellyfinToken } from "../middleware/auth.js";
import { eq, desc, and } from "drizzle-orm";
import { broadcastToRoom } from "./ws.js";

const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_INTERNAL = process.env.JELLYFIN_INTERNAL_URL || "http://jellyfin:8096";

export const roomsRouter = Router();

roomsRouter.use(authenticateJellyfinToken);

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function jellyfinHeaders(token: string) {
  return {
    Authorization: `MediaBrowser Token="${token}"`,
    "X-Emby-Authorization": `MediaBrowser Client="Sync API", Device="Sync API Server", DeviceId="sync-api", Version="1.0.0"`,
    "Content-Type": "application/json",
  };
}

async function createJellyfinSyncPlayGroup(name: string, token: string): Promise<string> {
  const resp = await fetch(`${JELLYFIN_INTERNAL}/SyncPlay/New`, {
    method: "POST",
    headers: jellyfinHeaders(token),
    body: JSON.stringify({ GroupName: name }),
  });
  if (!resp.ok) throw new Error(`Jellyfin SyncPlay error: ${resp.status}`);
  const data = await resp.json();
  return data.GroupId || "";
}

async function setJellyfinSyncPlayQueue(itemIds: string[], token: string) {
  await fetch(`${JELLYFIN_INTERNAL}/SyncPlay/SetNewQueue`, {
    method: "POST",
    headers: jellyfinHeaders(token),
    body: JSON.stringify({ PlayingQueue: itemIds, StartPositionTicks: 0 }),
  });
}

// GET /api/rooms — list rooms for current user
roomsRouter.get("/", async (req, res) => {
  const user = (req as any).user;

  const userRooms = await db
    .select()
    .from(schema.participants)
    .where(eq(schema.participants.userId, user.id))
    .leftJoin(schema.rooms, eq(schema.participants.roomId, schema.rooms.id));

  const rooms = userRooms.map((r) => r.rooms);

  const roomData = await Promise.all(
    rooms.map(async (room) => {
      const count = await db
        .select({ count: schema.participants.id })
        .from(schema.participants)
        .where(eq(schema.participants.roomId, room!.id));
      return {
        ...room,
        participantCount: count.length,
      };
    })
  );

  res.json(roomData);
});

// POST /api/rooms — create a room
roomsRouter.post("/", async (req, res) => {
  const user = (req as any).user;
  const { name, itemIds } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name es requerido" });
  }

  console.log(`Creating room "${name}" for user ${user.name} (${user.id})`);

  let syncplayGroupId: string;
  try {
    syncplayGroupId = await createJellyfinSyncPlayGroup(name, user.token);
    console.log(`SyncPlay group created: ${syncplayGroupId}`);
    if (itemIds?.length > 0) {
      await setJellyfinSyncPlayQueue(itemIds, user.token);
      console.log(`SyncPlay queue set with ${itemIds.length} items`);
    }
  } catch (err: any) {
    console.error(`SyncPlay error: ${err.message}`);
    return res.status(502).json({ error: `Error al crear grupo SyncPlay: ${err.message}` });
  }

  let inviteCode: string;
  let exists = true;
  do {
    inviteCode = generateInviteCode();
    const existing = await db
      .select()
      .from(schema.rooms)
      .where(eq(schema.rooms.inviteCode, inviteCode));
    exists = existing.length > 0;
  } while (exists);

  const [room] = await db
    .insert(schema.rooms)
    .values({
      name,
      syncplayGroupId,
      createdBy: user.name,
      createdByUserId: user.id,
      controllerUserId: user.id,
      inviteCode,
      itemIds: itemIds || [],
    })
    .returning();

  await db.insert(schema.participants).values({
    roomId: room.id,
    userId: user.id,
    userName: user.name,
  });

  console.log(`Room created: ${room.id} (code: ${inviteCode})`);
  res.status(201).json({ ...room, participantCount: 1 });
});

// GET /api/rooms/join/:code — get room by invite code
roomsRouter.get("/join/:code", async (req, res) => {
  const { code } = req.params;

  const [room] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.inviteCode, code.toUpperCase()));

  if (!room) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  const count = await db
    .select({ count: schema.participants.id })
    .from(schema.participants)
    .where(eq(schema.participants.roomId, room.id));

  res.json({ ...room, participantCount: count.length });
});

// POST /api/rooms/:id/join — join a room
roomsRouter.post("/:id/join", async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const [room] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id));

  if (!room) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  const [existing] = await db
    .select()
    .from(schema.participants)
    .where(
      and(
        eq(schema.participants.roomId, room.id),
        eq(schema.participants.userId, user.id)
      )
    );

  if (!existing) {
    await db.insert(schema.participants).values({
      roomId: room.id,
      userId: user.id,
      userName: user.name,
    });
  }

  const count = await db
    .select({ count: schema.participants.id })
    .from(schema.participants)
    .where(eq(schema.participants.roomId, room.id));

  res.json({ ...room, participantCount: count.length });
});

// POST /api/rooms/:id/leave — leave a room
roomsRouter.post("/:id/leave", async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  await db
    .delete(schema.participants)
    .where(
      and(
        eq(schema.participants.roomId, id),
        eq(schema.participants.userId, user.id)
      )
    );

  const remaining = await db
    .select({ count: schema.participants.id })
    .from(schema.participants)
    .where(eq(schema.participants.roomId, id));

  if (remaining.length === 0) {
    await db.delete(schema.rooms).where(eq(schema.rooms.id, id));
  }

  res.json({ success: true });
});

// GET /api/rooms/:id — get room detail
roomsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const [room] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id));

  if (!room) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  const participants = await db
    .select()
    .from(schema.participants)
    .where(eq(schema.participants.roomId, room.id));

  res.json({ ...room, participants });
});

// PATCH /api/rooms/:id/controller — transfer control to another participant
roomsRouter.patch("/:id/controller", async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { controllerUserId } = req.body;

  if (!controllerUserId) {
    return res.status(400).json({ error: "controllerUserId es requerido" });
  }

  const [room] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id));

  if (!room) return res.status(404).json({ error: "Sala no encontrada" });

  if (room.controllerUserId !== user.id) {
    return res.status(403).json({ error: "Solo el controlador actual puede transferir el control" });
  }

  const [participant] = await db
    .select()
    .from(schema.participants)
    .where(and(eq(schema.participants.roomId, id), eq(schema.participants.userId, controllerUserId)));

  if (!participant) {
    return res.status(400).json({ error: "El usuario no es miembro de la sala" });
  }

  const [updated] = await db
    .update(schema.rooms)
    .set({ controllerUserId, updatedAt: new Date() })
    .where(eq(schema.rooms.id, id))
    .returning();

  res.json({ controllerUserId: updated.controllerUserId });
});

// DELETE /api/rooms/:id — delete a room entirely
roomsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const [room] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id));

  if (!room) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  await db.delete(schema.participants).where(eq(schema.participants.roomId, id));
  await db.delete(schema.chatMessages).where(eq(schema.chatMessages.roomId, id));
  await db.delete(schema.rooms).where(eq(schema.rooms.id, id));

  broadcastToRoom(id, { type: "room_deleted", roomId: id });

  res.json({ success: true, id });
});

// PATCH /api/rooms/:id — update room name, status, items, or currentItem
roomsRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status, itemIds, currentItem } = req.body;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (name && name.trim()) updates.name = name.trim();
  if (status) updates.status = status;
  if (itemIds) updates.itemIds = itemIds;
  if (currentItem !== undefined) updates.currentItem = currentItem;

  const [room] = await db
    .update(schema.rooms)
    .set(updates)
    .where(eq(schema.rooms.id, id))
    .returning();

  if (!room) {
    return res.status(404).json({ error: "Sala no encontrada" });
  }

  res.json(room);
});
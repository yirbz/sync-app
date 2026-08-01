import { Router } from "express";
import { db, schema } from "../db.js";
import { authenticateJellyfinToken } from "../middleware/auth.js";
import { eq } from "drizzle-orm";
import { broadcastToRoom } from "./ws.js";

export const queueRouter = Router();

queueRouter.use(authenticateJellyfinToken);

async function isController(roomId: string, userId: string): Promise<boolean> {
  const [room] = await db
    .select({ controllerUserId: schema.rooms.controllerUserId, createdByUserId: schema.rooms.createdByUserId })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));
  if (!room) return false;
  // If controller is set, verify controller. If not set, allow creator/members.
  return !room.controllerUserId || room.controllerUserId === userId || room.createdByUserId === userId;
}

// GET /api/rooms/:id/queue
queueRouter.get("/:roomId/queue", async (req, res) => {
  const { roomId } = req.params;
  const [room] = await db
    .select({ queue: schema.rooms.queue, currentIndex: schema.rooms.currentIndex, playbackState: schema.rooms.playbackState, currentItem: schema.rooms.currentItem })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));
  if (!room) return res.status(404).json({ error: "Sala no encontrada" });
  res.json(room);
});

// POST /api/rooms/:roomId/queue — add item to queue
queueRouter.post("/:roomId/queue", async (req, res) => {
  const user = (req as any).user;
  const { roomId } = req.params;

  if (!(await isController(roomId, user.id))) {
    return res.status(403).json({ error: "Solo el controlador de la sala puede modificar la cola" });
  }

  const { platform, contentId, title, duration, imageUrl } = req.body;

  if (!platform || !contentId || !title) {
    return res.status(400).json({ error: "platform, contentId y title son requeridos" });
  }

  const [room] = await db
    .select({ queue: schema.rooms.queue, currentIndex: schema.rooms.currentIndex, playbackState: schema.rooms.playbackState })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));

  if (!room) return res.status(404).json({ error: "Sala no encontrada" });

  const queue = (room.queue || []) as any[];
  const newItem = {
    id: crypto.randomUUID(),
    platform,
    contentId,
    title,
    duration: duration || null,
    imageUrl: imageUrl || null,
    addedBy: user.name,
    addedAt: new Date().toISOString(),
  };
  queue.push(newItem);

  const wasEmpty = room.currentIndex === -1;
  const setCurrentIndex = wasEmpty ? 0 : room.currentIndex;
  const currentItem = setCurrentIndex >= 0 && queue[setCurrentIndex]
    ? { platform: queue[setCurrentIndex].platform, id: queue[setCurrentIndex].contentId, title: queue[setCurrentIndex].title, imageUrl: queue[setCurrentIndex].imageUrl }
    : null;

  const newPlaybackState = wasEmpty
    ? { position: 0, isPlaying: true, lastUpdated: new Date().toISOString() }
    : ((room.playbackState as any) || { position: 0, isPlaying: false });

  await db
    .update(schema.rooms)
    .set({
      queue,
      currentIndex: setCurrentIndex,
      currentItem,
      playbackState: newPlaybackState,
      status: wasEmpty ? "playing" : undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.rooms.id, roomId));

  broadcastToRoom(roomId, {
    type: "queue_change",
    queue,
    currentIndex: setCurrentIndex,
    currentItem,
    playbackState: newPlaybackState,
  });

  res.status(201).json({ queue, currentIndex: setCurrentIndex, currentItem, playbackState: newPlaybackState });
});

// DELETE /api/rooms/:roomId/queue/:itemId
queueRouter.delete("/:roomId/queue/:itemId", async (req, res) => {
  const user = (req as any).user;
  const { roomId, itemId } = req.params;

  if (!(await isController(roomId, user.id))) {
    return res.status(403).json({ error: "Solo el controlador de la sala puede modificar la cola" });
  }

  const [room] = await db
    .select({ queue: schema.rooms.queue, currentIndex: schema.rooms.currentIndex, playbackState: schema.rooms.playbackState })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));

  if (!room) return res.status(404).json({ error: "Sala no encontrada" });

  let queue = (room.queue || []) as any[];
  const idx = queue.findIndex((q: any) => q.id === itemId);
  if (idx === -1) return res.status(404).json({ error: "Item no encontrado" });

  queue.splice(idx, 1);

  let currentIndex = room.currentIndex;
  if (idx < currentIndex) currentIndex--;
  else if (idx === currentIndex) currentIndex = queue.length > 0 ? Math.min(currentIndex, queue.length - 1) : -1;

  const currentItem = currentIndex >= 0 && queue[currentIndex]
    ? { platform: queue[currentIndex].platform, id: queue[currentIndex].contentId, title: queue[currentIndex].title, imageUrl: queue[currentIndex].imageUrl }
    : null;

  const updates: any = { queue, currentIndex, currentItem, updatedAt: new Date() };

  await db.update(schema.rooms).set(updates).where(eq(schema.rooms.id, roomId));

  broadcastToRoom(roomId, {
    type: "queue_change",
    queue,
    currentIndex,
    currentItem,
    playbackState: room.playbackState,
  });

  res.json({ queue, currentIndex, currentItem });
});

// PATCH /api/rooms/:roomId/queue/reorder
queueRouter.patch("/:roomId/queue/reorder", async (req, res) => {
  const user = (req as any).user;
  const { roomId } = req.params;

  if (!(await isController(roomId, user.id))) {
    return res.status(403).json({ error: "Solo el controlador de la sala puede modificar la cola" });
  }

  const { fromIndex, toIndex } = req.body;

  const [room] = await db
    .select({ queue: schema.rooms.queue, currentIndex: schema.rooms.currentIndex, playbackState: schema.rooms.playbackState })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));

  if (!room) return res.status(404).json({ error: "Sala no encontrada" });

  const queue = (room.queue || []) as any[];
  if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) {
    return res.status(400).json({ error: "Índices inválidos" });
  }

  const [item] = queue.splice(fromIndex, 1);
  queue.splice(toIndex, 0, item);

  await db.update(schema.rooms).set({ queue, updatedAt: new Date() }).where(eq(schema.rooms.id, roomId));

  const currentItem = room.currentIndex >= 0 && queue[room.currentIndex]
    ? { platform: queue[room.currentIndex].platform, id: queue[room.currentIndex].contentId, title: queue[room.currentIndex].title }
    : null;

  broadcastToRoom(roomId, {
    type: "queue_change",
    queue,
    currentIndex: room.currentIndex,
    currentItem,
    playbackState: room.playbackState,
  });

  res.json({ queue });
});

// PATCH /api/rooms/:roomId/playback — update playback state
queueRouter.patch("/:roomId/playback", async (req, res) => {
  const user = (req as any).user;
  const { roomId } = req.params;

  if (!(await isController(roomId, user.id))) {
    return res.status(403).json({ error: "Solo el controlador de la sala puede controlar la reproducción" });
  }

  const { position, isPlaying, currentIndex } = req.body;

  const [room] = await db
    .select({ queue: schema.rooms.queue, playbackState: schema.rooms.playbackState })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));

  if (!room) return res.status(404).json({ error: "Sala no encontrada" });

  const updates: any = { updatedAt: new Date() };
  const queue = (room.queue || []) as any[];

  if (currentIndex !== undefined) {
    updates.currentIndex = currentIndex;
    if (currentIndex >= 0 && queue[currentIndex]) {
      updates.currentItem = { platform: queue[currentIndex].platform, id: queue[currentIndex].contentId, title: queue[currentIndex].title };
    } else {
      updates.currentItem = null;
    }
  }

  const existingPlayback = (room.playbackState as any) || { position: 0, isPlaying: false };
  const playbackState: any = { ...existingPlayback };
  if (position !== undefined) playbackState.position = position;
  if (isPlaying !== undefined) playbackState.isPlaying = isPlaying;
  playbackState.lastUpdated = new Date().toISOString();

  updates.playbackState = playbackState;

  await db.update(schema.rooms).set(updates).where(eq(schema.rooms.id, roomId));

  const [updated] = await db
    .select({ currentIndex: schema.rooms.currentIndex, currentItem: schema.rooms.currentItem, playbackState: schema.rooms.playbackState, queue: schema.rooms.queue })
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId));

  broadcastToRoom(roomId, {
    type: "playback_update",
    currentIndex: updated.currentIndex,
    currentItem: updated.currentItem,
    playbackState: updated.playbackState,
    queue: updated.queue,
    senderId: user.id,
  });

  res.json(updated);
});

import { Router } from "express";
import { db, schema } from "../db.js";
import { authenticateJellyfinToken } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";
import { broadcastToRoom } from "./ws.js";

export const chatRouter = Router();

chatRouter.use(authenticateJellyfinToken);

// GET /api/chat/:roomId — get chat messages for a room
chatRouter.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const messages = await db
    .select()
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.roomId, roomId))
    .orderBy(desc(schema.chatMessages.createdAt))
    .limit(limit);

  res.json(messages.reverse());
});

// POST /api/chat/:roomId — send a chat message
chatRouter.post("/:roomId", async (req, res) => {
  const user = (req as any).user;
  const { roomId } = req.params;
  const { content, replyToId, replyToUserName, replyToContent } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ error: "El mensaje no puede superar los 500 caracteres" });
  }

  const [message] = await db
    .insert(schema.chatMessages)
    .values({
      roomId,
      userId: user.id,
      userName: user.name,
      content: content.trim(),
      replyToId: replyToId || null,
      replyToUserName: replyToUserName || null,
      replyToContent: replyToContent || null,
    })
    .returning();

  broadcastToRoom(roomId, { type: "chat_message", message });

  res.status(201).json(message);
});
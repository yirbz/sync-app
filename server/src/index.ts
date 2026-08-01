import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { roomsRouter } from "./routes/rooms.js";
import { queueRouter } from "./routes/queue.js";
import { chatRouter } from "./routes/chat.js";
import { youtubeRouter } from "./routes/youtube.js";
import { webRouter } from "./routes/web.js";
import { healthRouter } from "./routes/health.js";
import { createWsServer } from "./routes/ws.js";

const PORT = process.env.PORT || 3001;
const rawOrigin = process.env.CORS_ORIGIN || "*";
const CORS_ORIGIN = rawOrigin === "*" ? "*" : rawOrigin.split(",").map(s => s.trim());

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}${Object.keys(req.query).length ? `?${new URLSearchParams(req.query as any).toString()}` : ""}`);
  next();
});

app.use("/api/health", healthRouter);
app.use("/api/rooms", queueRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/youtube", youtubeRouter);
app.use("/api/web", webRouter);

const server = http.createServer(app);
createWsServer(server);

server.listen(PORT, () => {
  console.log(`Sync API running on port ${PORT}`);
});
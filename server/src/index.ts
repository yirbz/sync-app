import "dotenv/config";
import express from "express";
import cors from "cors";
import { roomsRouter } from "./routes/rooms.js";
import { chatRouter } from "./routes/chat.js";
import { healthRouter } from "./routes/health.js";

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Sync API running on port ${PORT}`);
});
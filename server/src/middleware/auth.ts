import { Request, Response, NextFunction } from "express";

const JELLYFIN_URL = process.env.JELLYFIN_URL;

export async function authenticateJellyfinToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  if (!JELLYFIN_URL) {
    return res.status(500).json({ error: "JELLYFIN_URL no configurado" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `${JELLYFIN_URL}/Users/Me`,
      {
        signal: controller.signal,
        headers: {
          Authorization: `MediaBrowser Token="${token}"`,
          "X-Emby-Authorization": `MediaBrowser Client="Sync API", Device="Sync API Server", DeviceId="sync-api", Version="1.0.0"`,
        },
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(401).json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." });
    }

    const user = await response.json();

    (req as any).user = {
      id: user.Id,
      name: user.Name,
      token,
    };

    next();
  } catch (err: any) {
    if (err.name === "AbortError") {
      return res.status(503).json({ error: "El servidor principal no responde en este momento. Inténtalo en un instante." });
    }
    return res.status(401).json({ error: "Tu sesión ha caducado. Inicia sesión de nuevo." });
  }
}
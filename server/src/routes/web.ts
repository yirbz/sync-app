import { Router } from "express";
import { authenticateJellyfinToken } from "../middleware/auth.js";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const webRouter = Router();

// In-memory cookie store for persistent sessions (prevents repeated CAPTCHAs & login losses)
const cookieJar = new Map<string, string>();

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
  "Sec-Ch-Ua": '"Not A(Brand";v="99", "Google Chrome";v="124", "Chromium";v="124"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

interface CurlResult {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

class ProxyResponse {
  status: number;
  headersMap: Record<string, string>;
  body: Buffer;

  constructor(res: CurlResult) {
    this.status = res.status;
    this.headersMap = res.headers;
    this.body = res.body;
  }

  get ok() {
    return this.status >= 200 && this.status < 400;
  }

  get headers() {
    return {
      get: (name: string) => {
        const lower = name.toLowerCase();
        for (const [k, v] of Object.entries(this.headersMap)) {
          if (k.toLowerCase() === lower) return v;
        }
        return null;
      },
      getSetCookie: () => {
        const cookies: string[] = [];
        for (const [k, v] of Object.entries(this.headersMap)) {
          if (k.toLowerCase() === "set-cookie") {
            cookies.push(v);
          }
        }
        return cookies;
      },
    };
  }

  async text() {
    return this.body.toString("utf-8");
  }

  async arrayBuffer() {
    return this.body.buffer.slice(this.body.byteOffset, this.body.byteOffset + this.body.byteLength);
  }
}

function execCurl(targetUrl: string, userAgent: string, secChUa?: string, cookieFile?: string): Promise<CurlResult> {
  return new Promise((resolve) => {
    const args = [
      "-s", "-i", "-L", "--http2", "--compressed",
      "--max-redirs", "5",
      "--connect-timeout", "10",
      "-A", userAgent,
      "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "-H", "Accept-Language: es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
      "-H", "Sec-Fetch-Dest: document",
      "-H", "Sec-Fetch-Mode: navigate",
      "-H", "Sec-Fetch-Site: none",
      "-H", "Sec-Fetch-User: ?1",
      "-H", "Upgrade-Insecure-Requests: 1",
    ];

    if (secChUa) {
      args.push("-H", `Sec-Ch-Ua: ${secChUa}`);
      args.push("-H", 'Sec-Ch-Ua-Mobile: ?0');
      args.push("-H", 'Sec-Ch-Ua-Platform: "Windows"');
    }

    if (cookieFile) {
      args.push("-c", cookieFile, "-b", cookieFile);
    }

    args.push(targetUrl);

    execFile("curl", args, { maxBuffer: 25 * 1024 * 1024, encoding: "buffer" }, (err, stdout) => {
      if (err || !stdout || stdout.length === 0) {
        return resolve({ status: 500, headers: {}, body: Buffer.from("") });
      }

      const str = stdout.toString("latin1");
      const headerEnd = str.lastIndexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return resolve({ status: 200, headers: {}, body: stdout });
      }

      const headerText = str.substring(0, headerEnd);
      const body = stdout.subarray(headerEnd + 4);

      const blocks = headerText.split("\r\n\r\n");
      const finalBlock = blocks[blocks.length - 1];
      const lines = finalBlock.split("\r\n");
      const statusLine = lines[0] || "";
      const statusMatch = statusLine.match(/HTTP\/[\d\.]+\s+(\d+)/i);
      const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;

      const headers: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const colon = lines[i].indexOf(":");
        if (colon > 0) {
          const key = lines[i].substring(0, colon).trim().toLowerCase();
          const val = lines[i].substring(colon + 1).trim();
          if (headers[key]) {
            headers[key] += `, ${val}`;
          } else {
            headers[key] = val;
          }
        }
      }

      resolve({ status, headers, body });
    });
  });
}

async function fetchWithFullBrowserHeaders(targetUrl: string, signal: AbortSignal, clientIp: string): Promise<any> {
  try {
    const parsed = new URL(targetUrl);
    const hostKey = `${clientIp}_${parsed.hostname}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    const cookieFile = path.join(os.tmpdir(), `sync_cookies_${hostKey}.txt`);

    // Attempt 1: Desktop Chrome with HTTP/2
    const uaChrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const secChUa = '"Not-A.Brand";v="99", "Chromium";v="124", "Google Chrome";v="124"';

    let res = await execCurl(targetUrl, uaChrome, secChUa, cookieFile);

    // Attempt 2: Mobile Safari with HTTP/2 if blocked or 403
    const isBlocked = res.status === 403 || res.status === 401 || res.body.toString("utf8").includes("cf-browser-verification") || res.body.toString("utf8").includes("challenge-platform");
    if (isBlocked) {
      const uaSafari = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1";
      res = await execCurl(targetUrl, uaSafari, undefined, cookieFile);
    }

    if (res.status === 500 && res.body.length === 0) {
      const fallbackResp = await fetch(targetUrl, { signal, headers: BROWSER_HEADERS, redirect: "follow" });
      return fallbackResp;
    }

    return new ProxyResponse(res);
  } catch (e) {
    const fallbackResp = await fetch(targetUrl, { signal, headers: BROWSER_HEADERS, redirect: "follow" });
    return fallbackResp;
  }
}

// Helper to resolve relative URLs
function resolveRelativeUrl(relative: string, baseUrl: string): string {
  try {
    return new URL(relative, baseUrl).href;
  } catch {
    return relative;
  }
}

// GET /api/web/proxy?url=https://... — Full-Fidelity Web Proxy with Session Persistence & Link Rewriting
webRouter.get("/proxy", async (req, res) => {
  const urlParam = req.query.url;
  if (!urlParam || typeof urlParam !== "string") {
    return res.status(400).send("URL es requerida");
  }

  let targetUrl = urlParam.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "default";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const resp = await fetchWithFullBrowserHeaders(targetUrl, controller.signal, clientIp);
    clearTimeout(timeout);

    if (!resp.ok) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; background: #121214; color: #f2f2f4; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); padding: 24px; border-radius: 16px; max-width: 400px; }
            h2 { color: #ff5252; margin-top: 0; font-size: 18px; }
            p { font-size: 13px; color: #a0a0ab; line-height: 1.5; }
            .btn { display: inline-block; margin-top: 14px; padding: 8px 16px; background: #e50914; color: white; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Página no disponible (${resp.status})</h2>
            <p>El servidor respondió con código ${resp.status}. Puedes intentar abrir la página en una nueva pestaña.</p>
            <a href="#" onclick="window.top.postMessage({type:'SYNC_OPEN_NATIVE',url:'${targetUrl.replace(/'/g, "\\'")}'}, '*'); return false;" class="btn">Abrir en navegador nativo</a>
          </div>
        </body>
        </html>
      `);
    }

    const contentType = resp.headers.get("content-type") || "text/html";
    res.setHeader("Content-Type", contentType);

    // Remove anti-embedding headers so it renders inside our iframe
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");

    // If HTML content
    if (contentType.includes("html")) {
      let html = await resp.text();

      // Detect Cloudflare / bot-protection challenge pages
      const blockSignatures = [
        "Just a moment",
        "cf-browser-verification",
        "Checking your browser",
        "Sorry, you have been blocked",
        "Attention Required",
        "Access denied",
        "cf-error-details",
        "Enable JavaScript and cookies to continue",
        "_cf_chl_opt",
        "challenge-platform",
        "Verificación de seguridad",
      ];

      const lowerHtml = html.toLowerCase();
      const isBlocked = blockSignatures.some((sig) => lowerHtml.includes(sig.toLowerCase()));

      if (isBlocked) {
        res.setHeader("Content-Type", "text/html");
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, system-ui, sans-serif; background: #121214; color: #f2f2f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
              .card { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.08); padding: 28px 24px; border-radius: 20px; max-width: 360px; text-align: center; }
              .shield { width: 48px; height: 48px; margin: 0 auto 16px; background: rgba(229,9,20,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
              .shield svg { width: 24px; height: 24px; stroke: #e50914; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
              h2 { color: #f2f2f4; font-size: 17px; font-weight: 700; margin-bottom: 8px; }
              p { font-size: 13px; color: #8a8a96; line-height: 1.6; margin-bottom: 20px; }
              .steps { text-align: left; margin-bottom: 20px; }
              .step { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 13px; color: #c0c0ca; }
              .step-num { width: 22px; height: 22px; min-width: 22px; border-radius: 50%; background: rgba(229,9,20,0.2); color: #e50914; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
              .btn-primary { display: block; width: 100%; padding: 12px; background: #e50914; color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; }
              .btn-primary:active { transform: scale(0.97); }
              .btn-secondary { display: block; width: 100%; padding: 10px; margin-top: 10px; background: transparent; color: #8a8a96; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; font-size: 13px; cursor: pointer; }
              .url-preview { font-size: 11px; color: #555; word-break: break-all; margin-top: 14px; padding: 8px; background: #0d0d0f; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="shield"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h2>Sitio protegido</h2>
              <p>Este sitio usa protección anti-bots que impide cargarlo aquí. Ábrelo en tu navegador nativo.</p>
              <div class="steps">
                <div class="step"><span class="step-num">1</span><span>Abre la página en Safari o Chrome</span></div>
                <div class="step"><span class="step-num">2</span><span>Busca y reproduce el video que quieras</span></div>
                <div class="step"><span class="step-num">3</span><span>Copia el enlace del video</span></div>
                <div class="step"><span class="step-num">4</span><span>Vuelve a Sync y pega el enlace</span></div>
              </div>
              <button class="btn-primary" onclick="window.top.postMessage({type:'SYNC_OPEN_NATIVE',url:'${targetUrl.replace(/'/g, "\\'")}'}, '*')">Abrir en navegador nativo</button>
              <button class="btn-secondary" onclick="window.top.postMessage({type:'SYNC_PASTE_LINK'}, '*')">Ya copié el enlace</button>
              <div class="url-preview">${targetUrl}</div>
            </div>
            <script>try { window.top.postMessage({ type: 'SYNC_BLOCKED', url: '${targetUrl.replace(/'/g, "\\'")}' }, '*'); } catch(e) {}</script>
          </body>
          </html>
        `);
      }

      const baseTag = `<base href="${targetUrl}">`;

      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      // 1. Rewrite relative links (<a href="/path">) to route through our proxy so clicking links never 404s!
      html = html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']/gi, (match: string, prefix: string, href: string) => {
        if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) {
          return match;
        }
        const fullUrl = resolveRelativeUrl(href, targetUrl);
        const proxiedHref = `/api/web/proxy?url=${encodeURIComponent(fullUrl)}`;
        return `<a ${prefix}href="${proxiedHref}"`;
      });

      // 2. Rewrite nested iframe src attributes so embedded video players are also proxied!
      html = html.replace(/<iframe\s+([^>]*?)src=["']([^"']+)["']/gi, (match: string, prefix: string, srcUrl: string) => {
        if (srcUrl.startsWith("javascript:") || srcUrl.startsWith("about:")) return match;
        const fullUrl = resolveRelativeUrl(srcUrl, targetUrl);
        const proxiedSrc = `/api/web/proxy?url=${encodeURIComponent(fullUrl)}`;
        return `<iframe ${prefix}src="${proxiedSrc}"`;
      });

      // 3. Inject Client-Side Proxy Engine + Real-time Playback & Navigation Hooks
      const proxyEngineScript = `
        <script>
          try {
            window.open = function() { console.log("Ad popup blocked by Sync"); return null; };
            window.onbeforeunload = null;

            var targetBaseUrl = "${targetUrl}";

            // AJAX & Fetch Proxy Interceptor (Prevents 404s on relative API requests)
            (function() {
              function resolveAbs(rel) {
                try { return new URL(rel, targetBaseUrl).href; } catch(e) { return rel; }
              }

              var origFetch = window.fetch;
              if (origFetch) {
                window.fetch = function(input, init) {
                  if (typeof input === "string" && !input.startsWith("http://") && !input.startsWith("https://") && !input.startsWith("data:")) {
                    var abs = resolveAbs(input);
                    input = "/api/web/proxy?url=" + encodeURIComponent(abs);
                  }
                  return origFetch.call(this, input, init);
                };
              }

              var origOpen = XMLHttpRequest.prototype.open;
              if (origOpen) {
                XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                  if (typeof url === "string" && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
                    var abs = resolveAbs(url);
                    url = "/api/web/proxy?url=" + encodeURIComponent(abs);
                  }
                  return origOpen.call(this, method, url, async, user, pass);
                };
              }
            })();

            // Navigation Notification
            function notifyUrlChange() {
              try {
                window.top.postMessage({
                  type: "SYNC_NAVIGATED",
                  url: targetBaseUrl,
                  title: document.title || "Página Web"
                }, "*");
              } catch(e) {}
            }

            notifyUrlChange();
            window.addEventListener("popstate", notifyUrlChange);

            // Video Detection & Signal
            function sendVideoSignal(src, title) {
              if (!src) return;
              var msg = {
                type: "SYNC_VIDEO_DETECTED",
                mediaUrl: src,
                pageUrl: targetBaseUrl,
                title: title || document.title || "Video Web",
                isPlaying: true
              };
              try { window.top.postMessage(msg, "*"); } catch(e) {}
              try { window.parent.postMessage(msg, "*"); } catch(e) {}
            }

            function notifyMediaPlay(video) {
              if (!video) return;
              var src = video.currentSrc || video.src;
              if (!src) {
                var source = video.querySelector("source");
                if (source) src = source.src;
              }
              if (!src || src.startsWith("blob:")) {
                src = targetBaseUrl;
              }
              sendVideoSignal(src, document.title);
            }

            function scanAndHookVideos() {
              var vids = document.querySelectorAll("video");
              for (var i = 0; i < vids.length; i++) {
                var v = vids[i];
                if (v._syncHooked) continue;
                v._syncHooked = true;

                v.addEventListener("play", function(e) { notifyMediaPlay(e.target); });
                v.addEventListener("playing", function(e) { notifyMediaPlay(e.target); });
                v.addEventListener("fullscreenchange", function(e) { notifyMediaPlay(e.target); });
                v.addEventListener("webkitbeginfullscreen", function(e) { notifyMediaPlay(e.target); });
                v.addEventListener("timeupdate", function(e) {
                  if (!e.target.paused && !e.target._notified) {
                    e.target._notified = true;
                    notifyMediaPlay(e.target);
                  }
                });
              }
            }

            function onFullscreenChange() {
              var fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
              if (fsEl) {
                var vid = fsEl.tagName === "VIDEO" ? fsEl : fsEl.querySelector("video");
                if (vid) {
                  notifyMediaPlay(vid);
                } else {
                  sendVideoSignal(targetBaseUrl, document.title);
                }
              }
            }

            document.addEventListener("fullscreenchange", onFullscreenChange);
            document.addEventListener("webkitfullscreenchange", onFullscreenChange);
            document.addEventListener("mozfullscreenchange", onFullscreenChange);

            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", scanAndHookVideos);
            } else {
              scanAndHookVideos();
            }
            setInterval(scanAndHookVideos, 800);
          } catch(e) {}
        </script>
      `;

      if (html.includes("</head>")) {
        html = html.replace("</head>", `${proxyEngineScript}</head>`);
      } else {
        html += proxyEngineScript;
      }

      return res.send(html);
    }

    // Non-HTML content (images, JS, CSS)
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: system-ui, sans-serif; background: #121214; color: #f2f2f4; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); padding: 24px; border-radius: 16px; max-width: 400px; }
          h2 { color: #ff5252; margin-top: 0; font-size: 18px; }
          p { font-size: 13px; color: #a0a0ab; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Error al cargar</h2>
          <p>${err.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /api/web/stream?url=...&referer=... — Native Video Byte Streamer with CORS Bypass & Range Support
webRouter.get("/stream", async (req, res) => {
  const videoUrl = req.query.url;
  const referer = req.query.referer || req.query.url;

  if (!videoUrl || typeof videoUrl !== "string") {
    return res.status(400).send("URL de video requerida");
  }

  try {
    const targetUrl = decodeURIComponent(videoUrl);

    // If already direct stream or proxy
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      return res.status(400).send("URL de video inválida");
    }

    const parsed = new URL(targetUrl);

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: typeof referer === "string" ? decodeURIComponent(referer) : parsed.origin,
      Origin: parsed.origin,
      Accept: "*/*",
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const videoResp = await fetch(targetUrl, { headers });

    if (!videoResp.ok && videoResp.status !== 206) {
      return res.status(videoResp.status).send(`Error de stream: ${videoResp.statusText}`);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    const contentType = videoResp.headers.get("content-type") || "video/mp4";
    const contentLength = videoResp.headers.get("content-length");
    const contentRange = videoResp.headers.get("content-range");
    const acceptRanges = videoResp.headers.get("accept-ranges");

    res.status(videoResp.status);
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (contentRange) res.setHeader("Content-Range", contentRange);
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

    if (videoResp.body) {
      const reader = videoResp.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err: any) {
    res.status(500).send(`Error en stream proxy: ${err.message}`);
  }
});

webRouter.use(authenticateJellyfinToken);

// Extract direct media URL (.mp4, .m3u8, .webm, og:video) from a web page URL
webRouter.post("/extract", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL es requerida" });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "default";

  try {
    // Google Drive URL handling
    if (targetUrl.includes("drive.google.com") || targetUrl.includes("googleusercontent.com")) {
      let fileId = "";
      const matchFileD = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
      const matchIdParam = targetUrl.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
      const matchD = targetUrl.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
      if (matchFileD) fileId = matchFileD[1];
      else if (matchIdParam) fileId = matchIdParam[1];
      else if (matchD) fileId = matchD[1];

      if (fileId) {
        let driveTitle = "Video de Google Drive";
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          const driveResp = await fetchWithFullBrowserHeaders(`https://drive.google.com/file/d/${fileId}/view`, controller.signal, clientIp);
          clearTimeout(timeout);
          if (driveResp.ok) {
            const htmlText = await driveResp.text();
            const tMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (tMatch && tMatch[1]) {
              const rawT = tMatch[1].replace(/ - Google Drive$/i, "").trim();
              if (rawT && rawT !== "Google Drive") driveTitle = rawT;
            }
          }
        } catch {}

        return res.json({
          success: true,
          mediaUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
          title: driveTitle,
          fileId,
          platform: "drive",
        });
      }
    }

    if (/\.(mp4|m3u8|webm|mov|mkv)(\?.*)?$/i.test(targetUrl)) {
      const filename = targetUrl.split("/").pop()?.split("?")[0] || "Video Web";
      return res.json({
        success: true,
        mediaUrl: targetUrl,
        title: decodeURIComponent(filename),
        platform: "web",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetchWithFullBrowserHeaders(targetUrl, controller.signal, clientIp);
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(400).json({ error: `Error al cargar la página (${response.status})` });
    }

    const html = await response.text();

    let title = "Video Web";
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    const ogVideoMatch = html.match(/<meta[^>]*property=["']og:video(:url)?["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:video(:url)?["']/i);
    if (ogVideoMatch && ogVideoMatch[2]) {
      return res.json({
        success: true,
        mediaUrl: ogVideoMatch[2],
        title,
        platform: "web",
      });
    }

    const videoSrcMatch = html.match(/<(?:video|source)[^>]*src=["']([^"']+)["']/i);
    if (videoSrcMatch && videoSrcMatch[1]) {
      let mediaUrl = videoSrcMatch[1];
      if (mediaUrl.startsWith("//")) mediaUrl = `https:${mediaUrl}`;
      else if (mediaUrl.startsWith("/")) {
        const parsed = new URL(targetUrl);
        mediaUrl = `${parsed.origin}${mediaUrl}`;
      }

      return res.json({
        success: true,
        mediaUrl,
        title,
        platform: "web",
      });
    }

    const directMediaRegex = /(https?:\/\/[^"'\s]+\.(?:mp4|m3u8|webm)(?:\?[^"'\s]*)?)/gi;
    const matches = Array.from(html.matchAll(directMediaRegex)) as RegExpMatchArray[];
    if (matches.length > 0) {
      const mediaUrl = matches[0][1];
      return res.json({
        success: true,
        mediaUrl,
        title,
        platform: "web",
      });
    }

    res.json({
      success: true,
      mediaUrl: targetUrl,
      title,
      platform: "web",
    });
  } catch (err: any) {
    res.status(500).json({ error: `No se pudo extraer video: ${err.message}` });
  }
});

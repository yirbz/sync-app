# WatchTogether — Synchronized Media Rave PWA

> A web deployed Progressive Web App for watching videos, movies, and streaming content **in perfect sync** with friends — with live chat and video call built in.

## What is this?

**WatchTogether** is a home-lab-hosted platform that lets a group of friends watch the same content at the same time, frame-accurate, while talking to each other over voice/video and text chat — like a virtual movie theater or "watch rave."

It is **not** a media server built from scratch. It's a custom **frontend/webapp** that sits on top of proven, battle-tested open-source infrastructure:

- **Jellyfin** handles the actual media serving — library management, transcoding, subtitles, and streaming — running headless (its native UI is never shown to users).
- **Jellyfin SyncPlay** handles the hard part of keeping everyone's playback in sync (play/pause/seek/latency compensation), via its built-in API and WebSocket events.
- **LiveKit** provides the real-time voice/video call layer (WebRTC SFU) so people can see and hear each other while watching.
- **This project** is the custom experience layer: a polished PWA (installable, offline-capable shell, mobile-friendly) that ties library browsing, synchronized playback, chat, and video calls into one seamless room-based experience.

Think: Netflix Party / Teleparty / Discord Watch Together, but with a self-hosted server, open source, and under your own control.

## Why this exists

Commercial watch-party tools are either closed-source, tied to a single platform, or require exposing your media in ways you don't control. This project is for people who:

- Run their own media library (movies, shows, rips, IPTV) in a home lab and want to watch it together with friends remotely.
- Want a **single unified room**: video + sync controls + text chat + voice/video call, instead of juggling Discord + a separate sync extension.
- Want it installable as an app (PWA) on desktop and mobile, not just a browser tab.
- Care about self-hosting, privacy, and not depending on third-party SaaS for something this personal.

### What this project does **not** do

It does not defeat DRM or redistribute video from commercial streaming platforms (Netflix, Prime Video, etc.). For that kind of content, playback stays within each user's own account/session in their own browser; only *playback state* (play/pause/seek) can be synchronized across users, never the video stream itself.

## Core features

- 🎬 **Synchronized playback** of your personal Jellyfin library — everyone in a room sees the same frame at the same time.
- 💬 **Live text chat** per room, alongside the video.
- 🎥 **Voice/video call** while watching, powered by LiveKit.
- 📱 **Installable PWA** — works like a native app on desktop, Android, and iOS, with offline app-shell support.
- 🔐 **Self-hosted end to end** — your media, your server, your data. No third-party watch-party service involved.
- 🌐 **Remote-friendly** — designed to be exposed safely to friends outside your home network via Tailscale Funnel or Cloudflare Tunnel, without opening router ports.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     WatchTogether PWA                    │
│         (Next.js frontend — the custom "experience")     │
│                                                           │
│   Library UI · Sync Room UI · Chat UI · Call UI           │
└───────────────┬───────────────────┬──────────────────────┘
                │                   │
                │ REST + WebSocket  │ WebRTC
                ▼                   ▼
        ┌───────────────┐   ┌───────────────┐
        │   Jellyfin     │   │   LiveKit      │
        │  (headless)    │   │ (self-hosted)  │
        │                │   │                │
        │ Library, DRM-  │   │ Voice/video    │
        │ free transcode,│   │ call SFU       │
        │ SyncPlay API   │   │                │
        └───────────────┘   └───────────────┘
                │
                ▼
        ┌───────────────┐
        │  Media storage │
        │  (NAS / disks) │
        └───────────────┘

        Text chat: Socket.io server or LiveKit data channels
        Exposure: Tailscale Funnel / Cloudflare Tunnel
```

## Tech stack

| Layer | Technology | Role |
|---|---|---|
| Frontend / PWA | Next.js + React | Custom UI, room management, installable app shell |
| Media engine | Jellyfin (headless) | Library, transcoding, subtitles, streaming |
| Playback sync | Jellyfin SyncPlay API | Play/pause/seek sync across all viewers |
| Media SDK | `@jellyfin/sdk` (TypeScript) | Frontend ↔ Jellyfin communication |
| Voice/video | LiveKit (self-hosted) + `livekit-client` | Real-time call while watching |
| Text chat | Socket.io or LiveKit data channels | In-room messaging |
| Styling | Tailwind CSS (+ shadcn/ui) | UI components |
| Deployment | Docker Compose | Local orchestration in home lab |
| Remote access | Tailscale Funnel / Cloudflare Tunnel | Secure access for friends, no port forwarding |

## Status

🚧 Early-stage / homelab project — not production-hardened. Intended for a small group of trusted friends, not public deployment.

## Roadmap (draft)

- [ ] Room creation & invite links
- [ ] Jellyfin library browser embedded in the PWA
- [ ] SyncPlay integration (create/join/play/pause/seek)
- [ ] Text chat per room
- [ ] LiveKit voice/video call per room
- [ ] PWA install prompts + offline app shell
- [ ] Reverse proxy + TLS (Nginx Proxy Manager / Traefik)
- [ ] Tailscale Funnel / Cloudflare Tunnel setup docs

## Getting started

_Setup instructions (Docker Compose, environment variables, Jellyfin/LiveKit configuration) go here as the project is scaffolded._

## License

TBD.

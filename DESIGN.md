# Design System — Sync

## 1. Visual Theme & Atmosphere

A warm, intimate dark theme built around carbon depths and a single scarlet accent. Unlike Spotify's cold near-black theater, this is a lounge — a space that feels tactile, dimly lit, and human. The background is not achromatic gray but a warm carbon (`#140A0C`, `#1F1113`) with subtle reddish undertones, like worn leather or aged wood in low light.

The accent color, Escarlata (`#E5283B`), is a crimson with warmth — not a primary red, not an alarm, but the color of embers, ripe berries, a subtle glow. It appears only functionally: active states, key controls, the pulse of the app. Coral (`#FF6B7A`) adds a softer, friendlier highlight for notifications and live indicators.

The UI recedes into the warm dark so that content — profile photos, shared media, conversation cards — becomes the primary color source. Every surface carries a faint warmth, creating an environment that feels sheltered rather than stark.

**Key Characteristics:**
- Warm dark carbon backgrounds (`#140A0C`–`#1F1113`) — like a dim lounge, not a server room
- Escarlata (`#E5283B`) as the single accent — functional, not decorative
- Coral (`#FF6B7A`) as a soft live/notification indicator
- Warm white text (`#FFF8F6`) — gentler on eyes than pure white
- Round geometry (12px–21px radius) — soft, touchable, organic
- Low-contrast surfaces — depth through warmth, not harsh shadows
- Shadows are subtle (`rgba(0,0,0,0.25)`) — no aggressive floating

## 2. Color Palette & Roles

### Warm Dark Base
- **Carbon** (`#140A0C`): Deepest background surface — like the room itself
- **Carbon-2** (`#1F1113`): Cards, containers, elevated surfaces — one step out of shadow
- **Carbon-3** (`#2A161A`): Interactive surfaces, button backgrounds, hover state

### Accent (Scarlet Family)
- **Escarlata** (`#E5283B`): Primary accent — active states, key CTAs, primary controls. Warm, not aggressive.
- **Escarlata-2** (`#B21030`): Hover/active states for accent elements. Deeper, more grounded.
- **Rojo Profundo** (`#7A0C1B`): Pressed states, deep emphasis. Recedes rather than shouts.
- **Carmesi Claro** (`#C11330`): Secondary accent on light backgrounds, decorative restraint.

### Semantic
- **Coral** (`#FF6B7A`): Notifications, live indicators, badge dots. Friendly warmth, not alarm.
- **Escarlata** (`#E5283B`): Error states (used sparingly).

### Text & Surface
- **Blanco Cálido** (`#FFF8F6`): Primary text on dark. A warm off-white with a hint of blush — easier to read for long sessions.
- **Text Muted** (`#B89599`): Secondary text, inactive labels, metadata. Desaturated warm gray.
- **Text Dim** (`#8A6B6F`): Tertiary text, placeholders, fine print.
- **Light Surface** (`#FFF8F6`): Light-mode card backgrounds, inputs.
- **Light Border** (`#F0DEE0`): Subtle dividers on light surfaces.

### Shadows
- **Subtle** (`rgba(0,0,0,0.15) 0px 4px 12px`): Cards, subtle elevation
- **Elevated** (`rgba(0,0,0,0.25) 0px 8px 24px`): Dialogs, action sheets, modals
- **Glow** (`rgba(229,40,59,0.2) 0px 0px 16px`): Accent glow for active/pulsing elements

### Paleta de referencia

| Color | Hex | Uso |
|-------|-----|-----|
| Carbon | `#140A0C` | Fondo principal |
| Carbon-2 | `#1F1113` | Tarjetas, contenedores |
| Escarlata | `#E5283B` | Acento primario |
| Escarlata-2 | `#B21030` | Hover del acento |
| Rojo Profundo | `#7A0C1B` | Estados presionados |
| Carmesí Claro | `#C11330` | Acento secundario |
| Coral | `#FF6B7A` | Notificaciones, indicadores |
| Blanco Cálido | `#FFF8F6` | Texto primario |

## 3. Typography Rules

### Font Families
- **Display**: System sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`) — clean, legible, familiar on mobile
- **UI Body**: Same system stack — no custom fonts loaded, performance-first

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Screen Title | 28px (1.75rem) | 700 | 1.15 | -0.02em | Large page titles |
| Section Title | 20px (1.25rem) | 650 | 1.20 | -0.01em | Section headings |
| Card Title | 17px (1.06rem) | 600 | 1.25 | normal | Content card titles |
| Body | 15px (0.94rem) | 400 | 1.45 | normal | Standard reading text |
| Body Bold | 15px (0.94rem) | 600 | 1.45 | normal | Emphasized body |
| Caption | 13px (0.81rem) | 400 | 1.35 | normal | Metadata, timestamps |
| Caption Bold | 13px (0.81rem) | 600 | 1.35 | normal | Bold metadata |
| Small | 12px (0.75rem) | 500 | 1.30 | normal | Badges, counts |
| Button | 15px (0.94rem) | 600 | 1.00 | +0.02em | Button labels (sentence case) |
| Button Small | 13px (0.81rem) | 600 | 1.00 | +0.02em | Small buttons |
| Tab | 13px (0.81rem) | 500 | normal | normal | Bottom tab labels |

### Principles
- **Sentence case for buttons**: No all-caps. Buttons say "Send message", not "SEND MESSAGE". More human, less robotic.
- **Looser line-height for body**: 1.45 for reading comfort on mobile — text is meant to be read, not scanned.
- **Weight range 400–700**: Verdana-scale weights: 400, 500, 600, 650, 700. 650 replaces "semibold" for section titles.
- **Tighter tracking on titles**: -0.01em to -0.02em on large text for a refined, compressed look.
- **No uppercase transformations**: The UI speaks in a normal human voice.
- **System fonts**: No custom font loading. Performance on mobile is a feature.

## 4. Component Stylings

### Buttons

**Primary Pill (Escarlata)**
- Background: `#E5283B`
- Text: `#FFF8F6`
- Padding: 14px 24px
- Radius: 21px (pill)
- Font: 15px, weight 600, sentence case
- Use: Primary CTAs, key actions

**Primary Hover**
- Background: `#B21030`

**Secondary Pill (Carbon)**
- Background: `#2A161A`
- Text: `#FFF8F6`
- Padding: 14px 24px
- Radius: 21px
- Border: `1px solid rgba(255,248,246,0.1)`
- Use: Secondary actions, cancel

**Ghost Button**
- Background: transparent
- Text: `#B89599`
- Padding: 10px 16px
- Radius: 21px
- Use: Tertiary actions, text buttons

**Icon Circle**
- Background: `#2A161A`
- Text: `#FFF8F6`
- Width/Height: 44px
- Radius: 50% (circle)
- Use: Icon-only controls

**FAB (Escarlata)**
- Background: `#E5283B`
- Icon: `#FFF8F6`
- Width/Height: 56px
- Radius: 50%
- Shadow: `rgba(229,40,59,0.3) 0px 4px 16px`
- Use: Primary floating action

### Cards & Containers
- Background: `#1F1113`
- Radius: 16px
- No visible borders — depth through color variation
- Padding: 16px internal
- Subtle shadow: `rgba(0,0,0,0.15) 0px 4px 12px`

### Inputs
- Background: `#2A161A`
- Text: `#FFF8F6`
- Placeholder: `#8A6B6F`
- Radius: 14px
- Padding: 14px 16px
- Border: `1px solid transparent`
- Focus: border `#E5283B`

### Navigation
- **Bottom tab bar**: Mobile-native, `#140A0C` background
- Active tab: Escarlata icon + text
- Inactive tab: `#8A6B6F` icon, `#B89599` label
- Tab labels: 13px, weight 500
- **Top header**: `#140A0C`, screen title left-aligned

### Lists / Conversation Rows
- Height: 64px–72px (touch-optimized)
- Avatar: 48px circle, subtle carbon-2 border
- Title: 15px weight 600, `#FFF8F6`
- Subtitle: 13px weight 400, `#B89599`
- Timestamp: 12px weight 400, `#8A6B6F`
- Active indicator: Coral dot (`#FF6B7A`), 10px

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64
- Container padding: 16px (mobile), 24px (tablet+)
- Touch target minimum: 44px (Apple HIG) / 48px (Material)

### Grid & Container
- Single-column on mobile (primary)
- Bottom tab bar (48px–56px) + content area
- Top header (56px) when needed
- Full-height content area scrolls behind header

### Whitespace Philosophy
- **Warm breathing room**: Unlike Spotify's dense compression, this design uses deliberate spacing. The warm dark needs room to breathe — cards are separated, text has comfortable line-height, buttons have generous padding.
- **Mobile-native density**: Touch targets are large enough to hit with a thumb. Content has 16px horizontal padding. Nothing is too close to the edges.
- **Space as luxury**: Whitespace in a dark theme frames content like gallery walls. Every element is intentionally placed, never cramped.

### Border Radius Scale
- Subtle (8px): Badges, small indicators
- Comfortable (12px): Inputs, small elements
- Standard (14px): Buttons, cards on mobile
- Generous (16px): Cards, sections, dialogs
- Pill (21px): Primary buttons, search
- Circle (50%): Avatars, icon buttons, FAB

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (0) | `#140A0C` | Page background |
| Surface (1) | `#1F1113` | Cards, sheet backgrounds |
| Interactive (2) | `#2A161A` | Buttons, inputs, list items |
| Elevated (3) | `rgba(0,0,0,0.15) 0px 4px 12px` | Hover cards, menus |
| Dialog (4) | `rgba(0,0,0,0.25) 0px 8px 24px` | Modals, action sheets |
| Overlay | `rgba(20,10,12,0.8)` | Scrim behind modals |

**Shadow Philosophy**: Shadows are subtle and warm — no aggressive floating. The darkest layer is the background itself; elevation is a gentle step forward. On a warm dark canvas, even light shadows create clear depth without drama.

## 7. Do's and Don'ts

### Do
- Use warm carbon backgrounds (`#140A0C`–`#1F1113`) — depth through warmth, not gray
- Apply Escarlata (`#E5283B`) for active states, key CTAs, functional highlights
- Use Coral (`#FF6B7A`) for live notifications, badges, and pulse indicators
- Keep radius generous (12px–21px) — touch-optimized for thumbs
- Use sentence case on buttons — human voice, not machine voice
- Maintain 44px+ touch targets everywhere
- Let content (photos, media) provide color — the UI is a warm frame

### Don't
- Don't use Escarlata decoratively or on large backgrounds — it's functional
- Don't use cold grays (`#121212`, `#181818`) — the warm carbon family is essential
- Don't use all-caps or uppercase buttons — it creates robotic distance
- Don't use aggressive reds or alarm colors — scarlet and coral are already warm
- Don't make shadows too heavy — on warm dark, subtlety reads as quality
- Don't crowd elements — the warm dark needs breathing room
- Don't use pure white (`#ffffff`) for text — `#FFF8F6` is warmer and less fatiguing

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <375px | Compact layout, single column |
| Mobile | 375–480px | Standard mobile |
| Tablet Small | 480–768px | 2-column grid in content |
| Tablet | 768–1024px | Wider layout, split panes |
| Desktop | >1024px | Sidebar navigation visible |

### Collapsing Strategy
- Navigation: bottom tab bar → left sidebar on desktop
- Content grid: 1 column → 2 columns → 3 columns
- Header: compact on mobile, expanded on desktop
- Touch targets remain 44px+ at all sizes
- Bottom tab bar persists on mobile; collapses into sidebar on desktop

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Carbon (`#140A0C`)
- Surface: Carbon-2 (`#1F1113`)
- Interactive: Carbon-3 (`#2A161A`)
- Text: Blanco Cálido (`#FFF8F6`)
- Secondary text: Muted (`#B89599`)
- Accent: Escarlata (`#E5283B`)
- Live indicator: Coral (`#FF6B7A`)

### Example Component Prompts
- "Create a dark card: #1F1113 background, 16px radius. Title at 17px weight 600, #FFF8F6. Subtitle at 13px weight 400, #B89599. Subtle shadow rgba(0,0,0,0.15) 0px 4px 12px."
- "Design a primary button: #E5283B background, #FFF8F6 text, 21px radius, 14px 24px padding. 15px weight 600, sentence case."
- "Build a circular FAB: #E5283B background, white icon, 56px, 50% radius. Shadow rgba(229,40,59,0.3) 0px 4px 16px."
- "Create text input: #2A161A background, #FFF8F6 text, #8A6B6F placeholder, 14px radius, 14px 16px padding. Focus border #E5283B."
- "Design bottom navigation: #140A0C background. Active: Escarlata icon + text. Inactive: #8A6B6F icon, #B89599 text. 13px weight 500."

### Iteration Guide
1. Start with `#140A0C` — the room is a warm, dim space
2. Layer `#1F1113` for cards, `#2A161A` for interactive surfaces
3. Escarlata for functional highlights only (active, CTA, pulse)
4. Coral for live dots, notifications, badges — friendly warmth
5. Round everything — 16px cards, 21px buttons, 50% avatars
6. Sentence case everywhere — the app talks like a person
7. Let photos and shared content provide the color — the UI frames, never competes
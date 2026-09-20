# MINSaj Design System v4 — «النسيج» (The Weave)

> **Source of truth for the complete frontend rebuild (2026-09-20).**
> Derived from: open-design craft rules (anti-ai-slop, color, typography-hierarchy,
> state-coverage, animation-discipline, rtl-and-bidi, accessibility-baseline) +
> Linear/Vercel luminance discipline + Raycast interaction patterns + the official
> Minsaj brand mark (navy→violet, identity freeze v2).
> **This file outranks every legacy file (universal.css / mids.css are RETILED).**

---

## 0. Product identity

**منسج (Minsaj)** = "the weaver". An Arabic-first AI workspace: chat with leading
models, delegate to controlled agents, turn repeatable work into flows. One
fabric, many threads: **Chat · Agents · Flows · Runs · Knowledge · Models**.

The brand mark (official master asset): deep navy ground `#001030→#102040` with
an electric violet thread `#6040F0`. The design system IS this metaphor:

- **Navy is the fabric** (surfaces, calm, depth).
- **Violet is the thread** (accent, action, life) — used sparingly, max **2
  visible accent uses per screen**.
- **The selvage**: one 2px violet hairline under each page header — the single
  signature move. Never repeated elsewhere on a page.

Voice (microcopy): professional, calm, Arabic-first. Buttons say what they do
(«ابدأ محادثة» not «ابدأ»). No exclamation marks. No filler.

---

## 1. Color — semantic tokens (all pairs WCAG-verified, see scripts/rebuild-v4/palette-verify.py)

### Dark theme (default for the app)

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#0A1128` | Page ground |
| `--panel` | `#101A36` | Sidebar, rails, top bars |
| `--surface` | `#152040` | Cards, inputs, wells |
| `--raised` | `#1B2A50` | Dropdowns, popovers, command palette |
| `--hover` | `#22325C` | Hover step over surface/panel |
| `--line` | `rgba(255,255,255,.08)` | Hairline borders |
| `--line-strong` | `rgba(255,255,255,.14)` | Emphasized borders |
| `--ink` | `#EDF1FD` | Primary text (14.2:1 on surface) |
| `--ink-2` | `#AAB5D6` | Secondary text (7.8:1) |
| `--ink-3` | `#7C89AF` | Muted text, placeholders (4.6:1) |
| `--ink-4` | `#5E6B93` | Faint labels ≥ large/mono only (3.6:1) |
| `--accent-text` | `#A9A6FF` | Accent for text/links on dark (7.3:1) |
| `--accent-fill` | `#6B4DFF` | Filled CTAs (5.1:1 w/ white, 3.2:1 edge) |
| `--accent-hover` | `#7458FF` | CTA hover (4.6:1 w/ white) |
| `--accent-wash` | `rgba(107,77,255,.14)` | Selected row/tab tint |
| `--success` | `#4ADE8F` | Status text |
| `--warning` | `#FBBF54` | Status text |
| `--danger` | `#FF8B8B` | Destructive text |
| `--danger-fill` | `#E5484D` | Destructive buttons |
| `--focus` | `#8F8AFF` | Focus ring (6.5:1 on canvas) |

### Light theme

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#F4F6FB` | Page ground (cool paper) |
| `--panel` | `#FFFFFF` | Sidebar |
| `--surface` | `#FFFFFF` | Cards (border `--line` provides edge) |
| `--raised` | `#FFFFFF` | Popovers (shadow carries elevation) |
| `--hover` | `#EEF1F9` | Hover step |
| `--line` | `#DDE2F0` | Hairline |
| `--line-strong` | `#C9D0E4` | Emphasized |
| `--ink` | `#141B36` | Primary (15.7:1) |
| `--ink-2` | `#4B567A` | Secondary (6.7:1) |
| `--ink-3` | `#5D6890` | Muted (5.0:1) |
| `--ink-4` | `#7A85AB` | Faint (large/mono only) |
| `--accent-text` | `#4A2ED8` | Links, accent text (7.3:1) |
| `--accent-fill` | `#4A2ED8` | Filled CTAs (7.9:1 w/ white) |
| `--accent-hover` | `#5A3CF0` | CTA hover |
| `--accent-wash` | `rgba(74,46,216,.08)` | Selected tint |
| `--success` | `#0E7C42` | |
| `--warning` | `#9A6700` | |
| `--danger` | `#C22B2B` | |
| `--danger-fill` | `#D93A3A` | |
| `--focus` | `#4A2ED8` | |

### Rules (hard)

1. **Never hardcode hex outside `tokens.css`.** Components consume `var(--…)`.
2. Accent budget: ≤2 visible accent uses per screen (e.g. primary CTA + active
   tab). Links count. Focus rings don't count (they're transient).
3. Status colors carry **text + icon** — never color alone.
4. Dark surfaces stack by **luminance steps**, never shadows; light surfaces
   use **1px border + soft shadow**. Semi-transparent white borders on dark.
5. No gradients except: the selvage hairline (navy→violet→transparent) and the
   brand mark itself. **No trust-gradients, no glow blobs.**

---

## 2. Typography — IBM Plex superfamily (Arabic-first)

| Script | Family | Weights |
|---|---|---|
| Arabic UI/body | `IBM Plex Sans Arabic` | 400 / 500 / 600 / 700 |
| Latin (names, code labels) | `IBM Plex Sans` | 400 / 500 / 600 |
| Code, IDs, numerals in tables | `IBM Plex Mono` | 400 / 500 |

Stacks (tokens.css):
```css
--font-ui:  "IBM Plex Sans Arabic", "IBM Plex Sans", system-ui, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, monospace;
```

### Scale (Arabic-calibrated; line-heights give harakat clearance)

| Role | Size | Weight | Line-height | Notes |
|---|---|---|---|---|
| Display | 36/44px (mobile) → 48/56 (≥lg) | 700 | 1.15 | Landing hero only |
| Title XL (page h1) | 24px | 700 | 1.3 | Page header |
| Title L (section) | 19px | 600 | 1.35 | Card groups, panels |
| Title M | 16px | 600 | 1.4 | Card titles, dialog titles |
| Body L | 16px | 400 | 1.7 | Landing intro, chat |
| Body | 14px | 400 | 1.65 | Default body |
| Body S | 13px | 400 | 1.6 | Dense tables, meta |
| Label | 13px | 500 | 1.4 | Buttons, tabs, fields |
| Caption | 12px | 400 | 1.5 | Timestamps, hints |
| Mono S | 12px | 400 | 1.5 | IDs, code |

Rules:
- **NEVER letter-spacing on Arabic** (breaks joining). Latin display may use
  `-0.01em`. Arabic labels never uppercase (no concept).
- Weight jumps, never ladders: 400 → 600 for emphasis (no 500-in-between for
  headings). 500 reserved for labels/nav.
- Latin embedded in Arabic (model names) → `<bdi>` or `dir="ltr"` spans.
- Numerals in Arabic UI stay Western Arabic numerals (0-9) in mono for tables.

---

## 3. Spacing, radius, elevation, z-index

**Spacing (4px grid):** `2 4 8 12 16 20 24 32 40 48 64 80 96`
- Page gutters: 16px mobile / 24px tablet / 32px desktop.
- Card padding: 16 (compact) / 20 (default) / 24 (feature).
- Stack gaps: 8 (within group) / 12 (between rows) / 24 (between sections).
- One section gap per page may jump to 40-64 (breathing rhythm).

**Radius:** `--r-sm 6px` (controls, chips) · `--r-md 10px` (cards, inputs) ·
`--r-lg 14px` (panels, dialogs) · `--r-xl 20px` (mobile sheets) · pill 999px.

**Elevation (light theme shadows; dark uses luminance):**
- `--shadow-raised`: `0 4px 16px rgba(16,20,50,.10), 0 1px 3px rgba(16,20,50,.08)`
- `--shadow-overlay`: `0 12px 40px rgba(16,20,50,.18), 0 2px 8px rgba(16,20,50,.10)`

**Z-index ladder (documented, never improvised):**
`--z-content 0` · `--z-sticky 10` · `--z-header 20` · `--z-dropdown 30` ·
`--z-drawer 40` · `--z-overlay 50` · `--z-modal 60` · `--z-toast 70`

---

## 4. Layout system

### App shell
- **Desktop ≥1024**: sidebar 248px (rail 64px, collapsible, localStorage
  persisted) + main column. Content max-width 1160px centered.
- **Tablet 768–1023**: sidebar as 64px rail + overlay expansion.
- **Mobile <768**: top bar 56px + **bottom tab bar (5 items)** 64px +
  `env(safe-area-inset-bottom)`. Chat route = **immersive** (nav hidden,
  composer owns the bottom band).
- Grid: 12-col desktop, but real pages use **simple stacks**: list pages =
  1-col rows; card grids = `repeat(auto-fill, minmax(280px, 1fr))`.

### Page anatomy (every workspace page)
```
PageHeader: title (Title XL) + description (Body, ink-2) + actions row
            [↓ selvage hairline — 2px, violet, full-bleed under header]
Toolbar (optional): search field + filters + view toggle
Content: cards/list/table with full state coverage
Footer spacing: 40px + safe-area
```

### Touch & targets
- Min interactive 40px (mobile-safe; 44 when standalone links).
- Bottom nav items: icon 20 + label 11px, active = ink + 2px violet top-inset
  bar (integrated, not a floating pill).

---

## 5. Components (the ONLY inventory — no inventing outside it)

**Primitives** (`src/components/mj/`): Button (primary/secondary/ghost/danger ×
sm/md/lg), IconButton, Input, Textarea, Select, Switch, Checkbox, Tabs
(underline + pill), Badge (neutral/success/warning/danger/accent), Tag, Avatar,
Kbd, Card, CardHeader, Separator, Skeleton, Spinner, Progress, Tooltip,
EmptyState, ErrorState, Table primitives, PageHeader, StatTile, StatusDot,
SegmentedControl, Sheet (mobile), Dialog, DropdownMenu, CommandPalette,
Toast. All via cva conventions + `mj-` CSS classes.

**Mandatory states** (state-coverage craft):
- Interactive: default / hover / focus-visible (2px `--focus` ring, offset 2px)
  / active / disabled (40% opacity, no pointer) / loading (spinner replaces
  label, width locked).
- Data surfaces: **loading** (skeleton 8-12 rows, shimmer ≤2.5s then "still
  working" note) / **empty** (icon + headline + one sentence + primary CTA) /
  **error** (what happened + why + retry; input preserved) / populated / edge
  (long titles truncate 2-line clamp; 200-char safe; missing avatar fallback).
- Forms: validate on blur, never first keystroke; error clears on fix.

**Status language** (runs/agents): dot + label from `status` dictionary —
`queued` ink-3 / `planning` warning / `running` accent / `waiting_*` warning /
`completed` success / `failed_retryable` danger / `cancelled` ink-3.

---

## 6. Motion (animation-discipline)

| Use | Duration | Curve |
|---|---|---|
| Press/hover feedback | 90ms | `--ease-out` |
| State confirm (tab, toggle) | 150ms | `--ease` `cubic-bezier(.2,0,0,1)` |
| Enter (dropdown, popover) | 200ms | `--ease` |
| Overlay (dialog, sheet, drawer) | 280ms | `--ease-emph` `cubic-bezier(.3,0,.2,1)` |

- No decorative motion inside the workspace. No hero choreography.
- Skeleton shimmer: 1.8s loop, auto-stops at 15s → "taking longer" copy.
- `prefers-reduced-motion: reduce` → transforms/parallax stripped; opacity
  crossfades ≤150ms retained.

---

## 7. RTL discipline (rtl-and-bidi craft)

- `<html dir lang>` set per locale (already in layout).
- **Logical properties only** in CSS: `margin/padding/border-inline-*`,
  `inset-inline-*`, `text-align: start`. No `left/right` (charts exempt).
- Tailwind logical utilities `ms- me- ps- pe- start- end-`.
- Mirror: directional arrows, nav order, progress fill. Never mirror: media
  controls, clock/refresh icons, charts, numerals, brand mark.
- `<bdi>` around Latin model names inside Arabic runs; `dir="ltr"` on
  email/URL/phone/code fields and values.
- Search input: `dir="auto"`.

---

## 8. Anti-slop contract (P0 — failing = regression)

Forbidden:
1. Tailwind default indigo (#6366f1 family) — we have `--accent-*`.
2. Purple→blue trust gradients on heroes. Flat surface + type hierarchy.
3. Emoji as feature icons. Monoline SVG (`lucide` / `@minsaj/ui` icons), 1.75
   stroke, `currentColor`.
4. Rounded card + colored left-border accent tile.
5. Invented metrics ("10× faster"). Labelled placeholders or real data only.
6. Filler copy / lorem. Every string real, bilingual (ar/en dictionaries).
7. `position: absolute` decor overlapping content. Elements stay in flow;
   fixed only for shell chrome (topbar, bottom nav, overlays) on the
   documented z-ladder.
8. Emoji in headings/buttons anywhere.
9. Cards-within-cards beyond 2 levels. Wells (inset surface) instead.
10. Generic SaaS skeleton (Hero→Features→Pricing→FAQ→CTA verbatim). Landing
    follows the Minsaj narrative: **سؤال → خيط → نسيج** (question → thread →
    fabric), with one unconventional section (the live weave demo).

The 20% soul: selvage hairline · woven-thread dividers in marketing · Minsaj
microcopy voice · kbd hints for power users (⌘K, `/`) · Arabic-first type
tuning. If a screenshot is identifiable as Minsaj without seeing the logo —
done.

---

## 9. File map (rebuild)

```
src/app/styles/mj/tokens.css      # §1-3 tokens (only place with raw values)
src/app/styles/mj/base.css        # reset, body, selection, focus-visible, scrollbar
src/app/styles/mj/components.css  # §5 component classes (mj-* prefix)
src/app/styles/mj/shell.css       # app shell + landing-specific
src/components/mj/primitives.tsx  # React primitives (cva)
src/components/mj/app-shell.tsx   # new shell
src/components/mj/page-kit.tsx    # PageHeader, Toolbar, StatTile, Empty/Error
src/components/mj/data.tsx        # Table, badges, status, mock data feeds
```
Legacy retired: `universal.css`, `mids.css`, `src/components/universal/*`,
`src/components/domain/*` (pages rebuilt, no imports from them).
Pages keep existing routes: `/{locale}` marketing + `/{locale}/app/*`.

## 10. Definition of done (per page)

1. `bun run lint` clean; server compiles the route 200.
2. geom-audit @360/390/414 + 1280: **0** horizontal scroll, 0 parent overflow,
   0 edge-hugging (<4px), 0 visible overlaps, 0 AA contrast fails.
3. Screenshot reviewed as Senior Product Designer (both themes, ar+en).
4. All five data states reachable or demonstrable (loading/empty/error/
   populated/edge).
5. Keyboard: tab order logical, focus visible, Escape closes overlays.
6. Only then move to the next page.

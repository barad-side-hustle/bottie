# Bottie Design System - "Paper & Ink"

> Register: **Stripe × Mercury**. A warm sand-paper canvas, ink-black type, and **one** deep teal accent.
> The data is the only thing that looks expensive. Surfaces lift by value-shift + a hairline + a single
> soft shadow - never by colored edges, gradients, or glass.

This is the single source of truth for the redesign. All tokens live in `src/app/globals.css`.
Components reference **role tokens**, never raw hex/oklch.

---

## 1. Personality & references

- **Feels like:** Stripe dashboards, Mercury banking, Linear's restraint - calm, precise, trustworthy, human.
- **Voice:** confident and concrete. Headlines name the outcome ("Reply to every Google review in your
  voice - automatically"), not the abstraction ("all-in-one platform").
- **Two registers, one language:**
  - **Landing / marketing** - airy, type-led, larger rhythm (64-128px sections), serif display, whitespace, no shadows except on the one product-preview.
  - **App / dashboard** - denser, bordered, instrument-panel; hairlines, 48px rows, tabular numerals.
  - Both share the same accent, CTA style, radius scale, and type family.

---

## 2. Color

OKLCH, role-mapped, single lightness ladder. Light + dark both first-class (dark derives from the same roles).

### Neutral paper ramp (hue 70, warm sand)

| Role token                          | Use                                        |
| ----------------------------------- | ------------------------------------------ |
| `bg-paper`                          | app canvas / page background               |
| `bg-surface`                        | cards, panels (sits _above_ canvas)        |
| `bg-surface-2`                      | input/secondary fill, rest state           |
| `bg-surface-3`                      | hover / active fill                        |
| `border-hairline` (= `border`)      | default 1px separators & card edges        |
| `border-line-strong`                | interactive control borders                |
| `text-ink` (= `foreground`)         | primary text                               |
| `text-ink-2` (= `muted-foreground`) | secondary text                             |
| `text-ink-3`                        | tertiary / meta (timestamps, "3 days ago") |

### Accent - deep teal (hue 195), **rationed**

| Token                                 | Use                                  |
| ------------------------------------- | ------------------------------------ |
| `bg-accent-solid` (= `primary`)       | the **one** primary action per view  |
| `bg-accent-hover`                     | its hover                            |
| `bg-accent-tint` + `text-accent-text` | quiet accent chip / selected tint    |
| `shadow-accent`                       | optional glow on the single CTA only |

> **Accent discipline:** teal touches **one primary button** and **one hero metric** per screen. It is a
> _meaning_ color, never decoration. Status never borrows it.

### Semantic (desaturated, separate from brand)

`positive` (5★/published/up · green 160) · `negative` (= `destructive`, 1-2★/failed · coral 28) ·
`pending` (= `warning`, awaiting/draft · gold 78) · `notice` (= `info`, informational · blue 235).
Each has a `*-tint` background for chips. **Star glyph** = `star-filled` (ink-gold 78), distinct from accent and CTA.

### Charts

Neutral scaffolding + **single accent lead series** (`chart-1`), then `chart-2` neutral, semantics for the rest.
Validate against deuteranopia/protanopia - never distinguish series by red/green alone.

---

## 3. Typography

| Family                      | Token                           | Role                                        |
| --------------------------- | ------------------------------- | ------------------------------------------- |
| **Inter Tight** (grotesque) | `font-sans` (default)           | **everything** - headings, UI, body, tables |
| **Assistant**               | per-glyph fallback in the stack | Hebrew (RTL) - Inter Tight has no Hebrew    |

> One typeface, one voice. Headings are **Inter Tight semibold (600)** with tight tracking - solid and
> modern (Linear/Stripe-clean), consistent across marketing _and_ app. (We tried an editorial Newsreader
> serif for headlines; it read thin/inconsistent against the app, so it was dropped. `font-serif` is aliased
> to the sans stack as a safety net.)

**Scale** (use Tailwind sizes; values are the intent):

- Display (hero): 36-48px / line-height ~1.08 / `tracking-[-0.02em]` / weight **600**.
- H1 / page title: 28-32px / 1.1 / `tracking-[-0.02em]` / 600.
- H2 / section: 30-36px / `tracking-[-0.02em]` / 600.
- H3 (sans): 18-20px / 1.3 / 500.
- Body (sans): 16px / **1.6** / weight **460** (deliberate, not default 400/700).
- Secondary: 14px / 1.5 / 460. Caption: 13px / 500. Micro caps: 12px / 600 / `0.02em` uppercase (table headers).

**Numerals:** every metric, rating, count, %, date, money → `tabular-nums` (or the `.nums` class / `data-numeric`).
Key metrics get the **numeral recipe**: ~28px, weight 500, tight line-height, tabular - right-aligned in tables.

**Rules:** headings carry **negative tracking**; authority comes from size + tracking + space, **not** weight-700-everywhere.
Hebrew headings fall back to Assistant (grotesque) - that is intentional and acceptable.

---

## 4. Shape & depth

- **Radius scale** (`--radius` = 8px): controls `rounded-md` (6px) · cards `rounded-lg` (8px) ·
  larger panels `rounded-xl/2xl` (10-12px) · structural tables/inbox rows **`rounded-none`** ·
  `rounded-full` **only** for avatars and true pills/chips. **Never `rounded-3xl` on data surfaces.**
- **Depth:** surfaces distinguish by value-shift (`surface` vs `paper`) **+** one 1px `hairline`. A single soft
  `shadow-sm`/`shadow` only when truly elevated (popover, dialog, hovered row). **One** divider weight inside a
  card - separate sections with **spacing**, not stacked rules.

---

## 5. Motion

One easing `var(--ease-standard)`, ladder **150 / 250 / 350ms** (`--dur-fast/-mid/-slow`).
State-communicating only: hover = background-tint step (+ optional 2px translate on rows); menus/sheets 250ms;
meaningful moments (reply published, review arriving, score delta) get a bespoke 350ms beat.
**No** carpet of identical fade-ins, parallax, spring bounce, or scale-on-hover icons.
Everything respects `prefers-reduced-motion` (globally enforced in `globals.css`).

---

## 6. Component conventions

- **Buttons:** primary = `accent-solid` fill (exactly one per surface); secondary = `surface` + `line-strong`
  border; ghost = transparent → `surface-3` hover. `rounded-md`. Clear weight separation so secondary never
  competes with primary.
- **Inputs:** `surface-2` fill, 1px `line-strong`, `rounded-md`, 2px accent `focus-visible` ring.
- **Cards:** `surface` fill, 1px `hairline`, `rounded-lg`, no shadow at rest (shadow on hover/elevated only).
  No colored edges, no accent top-lines.
- **Tables / inbox:** dense 48px rows (40/56 density), micro-caps headers in `ink-2`, left-align text /
  right-align tabular numerals, **hairline row dividers only** (no vertical lines, no zebra), **solid** sticky
  header (no blur). Status = quiet neutral/semantic chip - **never** a vertical colored bar on the row edge.
- **Badges/chips:** small; reduce to neutral + `positive`/`pending`/`negative` (+ `notice`). Tint bg + matching text.
- **Empty / error / skeleton trio:** one small line glyph + confident one-liner + **one** deep-linked CTA.
  Distinguish _no-data-yet_ vs _no-results_ vs _error_. Skeletons match the final layout.

---

## 7. Layout

- App content capped ~1200px reading column; sidebar 240-256px (collapses to 64px).
- Spacing snaps to the **4px scale** (4/8/12/16/24/32/48/64) - no off-grid `px-3.5`/`gap-px`.
- RTL: logical properties only (`ps-/pe-`, `ms-/me-`, `start-/end-`, `text-start/end`, `rounded-s/e-`).
  Numeric right-alignment becomes left in RTL automatically via `text-end`.
- i18n: en / he / es must stay key-synced; no hardcoded user-facing strings.

---

## 8. DO NOT USE (anti-AI checklist)

- ❌ Single-sided colored borders / status accent bars (`border-s-2 border-primary`, `w-1 bg-{status}`).
- ❌ Card accent rings for "recommended/selected" (`ring-2 ring-primary`) → use tone + weight + space.
- ❌ Multiple divider weights inside one card (`border-border/40` vs `/60`).
- ❌ Gradients (`bg-gradient`, `from-/to-/via-`), decorative text-underline fills (`decoration-brand`).
- ❌ Purple-blue (hue 260-290) anywhere; neutrals stay chroma ≤ 0.012.
- ❌ Rainbow pastel section backgrounds; sections vary by neutral lightness only.
- ❌ Glassmorphism (`backdrop-blur`, translucent `bg-*/80` chrome) except the modal scrim.
- ❌ Over-rounded bubbles (`rounded-3xl`/`rounded-2xl` on cards, `rounded-full` nav containers).
- ❌ Rounded-bubble fonts (Rubik/Nunito) - retired.
- ❌ Template stack (hero → 4 icon cards → testimonials → pricing → CTA); break it, vary density.
- ❌ Repetitive equal-weight card grids; prefer master-detail lists + aligned data tables.
- ❌ Oversized empty hero - show the real product above the fold.
- ❌ Generic AI illustrations, `Sparkles`-as-AI-badge, decorative `scale-110` icon hovers.
- ❌ Exhaustive unused variant sets - prune to what's used.

---

## 9. Accessibility

WCAG AA + APCA: validate every text/surface pair (not white). Visible 2px `focus-visible` ring on every
interactive element. Full keyboard path for the inbox triage loop (j/k, Enter, Cmd+Enter, Esc, Cmd+K).
`prefers-reduced-motion` respected. Color never the sole carrier of meaning (chip text/icon + label).
Custom widgets keep ARIA (profile-health ring `role="progressbar"`, sentiment bars expose values).
Interactive targets ≥ 24px (prefer 44px touch).

---

## 10. Rollout phases

0. ✅ Tokens + fonts + this doc. 1. UI primitives. 2. Landing/marketing. 3. Nav/layout/IA.
1. Reviews inbox (master-detail rebuild). 5. Insights/posts/health/settings. 6. Onboarding/auth/checkout.

## Changelog

- 2026-06-08 - v1 Paper & Ink established (supersedes PR #117 warm/flat periwinkle+pastel system).

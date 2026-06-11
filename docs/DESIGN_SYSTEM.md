# Design System — JCDM Technologies LLC

## Direction C — High-Contrast Black & Gold

The design system is called "Direction C" — a high-contrast editorial style inspired by luxury print design (Aesop, Bottega Veneta). No glass morphism. No blur effects. Pure geometry and typographic hierarchy.

---

## Color Palette

### JCDM Technologies (Global)

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#09090B` | Dark section backgrounds |
| `--bg-alt` | `#F5F0E8` | Light/cream section backgrounds |
| `--text` | `#EDEFF3` | Text on dark backgrounds |
| `--text-on-light` | `#09090B` | Text on cream backgrounds |
| `--muted` | `#8A9099` | Secondary text on dark |
| `--muted-on-light` | `#52525B` | Secondary text on cream |
| `--gold` | `#C8A96E` | Accent color — buttons, lines, kickers |
| `--gold-line` | `rgba(200,169,110,.28)` | Thin gold borders and lines |
| `--card` | `#111318` | Card backgrounds (dark sections) |
| `--border` | `rgba(255,255,255,.09)` | Borders on dark backgrounds |
| `--border-light` | `rgba(0,0,0,.11)` | Borders on cream backgrounds |

### QUELVO (Same palette, gold more prominent)
QUELVO uses the same Direction C tokens but:
- More white space
- Gold accent used more assertively
- Fleet cards use slightly elevated card treatment

---

## Typography

### Fonts
- **Headlines:** `Fraunces` (serif, 600/700 weight) — via Google Fonts
- **Body:** `Inter` (sans-serif, 400/500/600 weight) — via Google Fonts
- **Monospace:** System monospace stack — version badges, codes

### Scale
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Hero H2 | `clamp(3rem, 5.5vw + 1rem, 6rem)` | 700 | Fraunces, line-height 1.0 |
| Section H2 | `clamp(1.5rem, 2.8vw + .6rem, 2.2rem)` | 700 | Fraunces, line-height 1.1 |
| H3 | `clamp(1.1rem, 1.4vw + .8rem, 1.35rem)` | 700 | Fraunces |
| Body | 1rem | 400 | Inter |
| Small/muted | 0.88–0.95rem | 400 | Inter |
| Kicker | 0.75–0.78rem | 700 | Inter, uppercase, letter-spacing .12em |
| Button | 0.9rem | 600–700 | Inter, letter-spacing .025em |

---

## Spacing

| Token | Value | Use |
|-------|-------|-----|
| Section padding | 88px 0 | Standard `.section` |
| Section padding mobile | 64px 0 | Below 768px |
| Hero padding | 96px 0 80px | `.hero-section` |
| Card padding | 28px 26px 24px | `.card` |
| Container max-width | 1100px | `.container` |
| Container padding | clamp(16px, 4vw, 24px) | horizontal gutters |

---

## Components

### Sections
- `.section` — dark background `--bg`, white text
- `.section.alt` — cream background `--bg-alt`, dark text
- Sections alternate: dark → cream → dark → cream
- Separator: `1px solid var(--gold-line)` on top and bottom of `.section.alt`
- Section `h2` has `::after` pseudo-element: 36px wide 1px gold line below heading

### Cards
```css
.card {
  background: var(--card);      /* #111318 on dark sections */
  border: 1px solid var(--border);
  border-radius: 4px;           /* RECTANGULAR — not rounded pills */
  padding: 28px 26px 24px;
}
```
- On light sections: `background: #ffffff; border-color: var(--border-light);`
- Hover: border-color → `var(--gold-line)`
- List bullets: 5px wide 1px gold horizontal line (not circles)

### Buttons

```css
/* Base button — transparent, thin border */
.btn { border-radius: 4px; padding: .8rem 1.5rem; border: 1px solid rgba(255,255,255,.22); }

/* Primary — solid gold fill */
.btn-primary { background: var(--gold); color: #09090B; font-weight: 700; }

/* Outline — transparent, gold border */
.btn-outline { border-color: var(--gold-line); color: var(--gold); }
```

**RULE: No pill-shaped buttons. All buttons use `border-radius: 4px`.**

On light sections (`.section.alt`):
- `.btn` → dark border, dark text
- `.btn-primary` → dark fill (#09090B), cream text

### Navigation
- Solid `--bg` background (no blur, no glass)
- Bottom border: `1px solid var(--gold-line)`
- Height: 68px
- Wordmark: "JCDM" in Fraunces 700, 1.35rem, letter-spacing .04em
- Links: Inter, standard weight
- CTA button: `.btn-primary` ("Book a Ride" or "Reservar")

### FAQ Accordion
- `details.faq` — no border-radius, border-bottom only
- Toggle: `+` in gold, rotates to `×` on open
- Clean, no box backgrounds

### Hero Kicker
```css
.hero-kicker {
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: .16em;
  font-size: .75rem;
  font-weight: 700;
}
/* Optional: ::after line to the right */
```

### Stats Bar
- Background: `--bg-alt` (cream)
- Border top/bottom: gold line
- Values: Fraunces 700, gold on cream
- Labels: uppercase, small, muted-on-light

---

## Grid Systems

| Class | Columns | Use |
|-------|---------|-----|
| `.services-grid` | 3 col → 2 col (1024px) → 1 col (640px) | Service cards |
| `.platforms-grid` | 2 col → 1 col (640px) | Featured platform cards |
| `.why-grid` | 4 col → 2 col (1024px) → 1 col (640px) | Why JCDM points |
| `.grid-2` | 2 col → 1 col (800px) | Generic 2-col |
| `.grid-3` | 3 col → 1 col (800px) | Generic 3-col |

---

## Rules — Do Not Break

1. **No `border-radius > 6px`** on interactive components (cards, buttons, inputs)
2. **No `backdrop-filter` or `blur`** — glass morphism is removed
3. **No gradient backgrounds** on sections — only solid `--bg` or `--bg-alt`
4. **No box-shadows with spread > 2px** — minimal shadow use
5. **Alternate sections**: dark and cream sections must alternate consistently
6. **Gold reserved** for: accent lines, kicker text, primary button fill, section h2 underline, stats values
7. **Fraunces only** for headings (h1, h2, h3, wordmark, stat values)
8. **Inter** for all body, UI, and button text

---

## QUELVO Visual Identity Rules

QUELVO uses the same Direction C system with these additions:
- Hero background option: dark with a subtle city/car background image overlay (when photo available)
- Fleet cards use a horizontal layout on desktop
- "QUELVO" wordmark in hero uses larger Fraunces with tight letter-spacing
- Music Ride feature block uses gold accent more prominently

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|---------|
| > 1024px | Full layouts, 3-col services, 4-col why |
| 880px | Mobile nav activates |
| 768px | Section padding reduces, hero text smaller |
| 640px | Single column for most grids, hero actions stack |

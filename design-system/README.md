# CTF Platform — Design System

Extracted from the live course site (Cyber 1, Cyber 2, Byte Bounty / AP CSP, Proof of Work / Web 3.0).
This documents what the site **already does**, so new pages match without guesswork.

**Files**
- `tokens.css` — colors, type, radius, spacing, motion. Four course themes × light/dark.
- `components.css` — the component layer. Depends on tokens; contains no raw hex.
- `showcase.html` — live reference. Switch course + light/dark to see every component.

```html
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/components.css">
<html data-course="cyber1" data-theme="light">
```

---

## The idea

A **hacker terminal that a school can actually use.** Dark, monospaced, and a little
adversarial — but with real information hierarchy, generous spacing, and no neon soup.
The tension is deliberate: it should feel like a console the student broke into, while
staying legible enough to teach from.

Every screen belongs to one of four courses, and the course owns the color. Structure,
type, spacing, and motion never change between courses — **only the hue does.**

---

## Color

Four themes, identical token names, so one stylesheet serves all four.

| Course | Identity | Accent (dark) | Accent (light) |
|---|---|---|---|
| Cyber 1 | cold blue terminal — NEMESIS | `#00b3ff` | `#0a74d6` |
| Cyber 2 | green phosphor — SPECTER | `#39ff88` | `#0f9d58` |
| Byte Bounty (AP CSP) | violet compiler — ADA | `#a855f7` | `#8b2fd6` |
| Proof of Work (Web 3.0) | bitcoin amber — ORACLE | `#f7931a` | `#c56b0c` |

**Neutral ramp** — every course defines the same twelve. Backgrounds go
`--bg` → `--panel` → `--panel2` → `--panel3`; borders go `--border2` (faintest) →
`--border` → `--border3` → `--border-hi`; text goes `--bright` → `--text` → `--muted` →
`--dim` → `--faint` → `--fainter`.

The neutrals are **hue-tinted toward the accent**, never gray. Cyber 1's panels are
blue-black, Web 3.0's are brown-black. This is what makes each course feel distinct
even before an accent appears.

**Status colors are constant across all courses** — they carry meaning, not identity:
`--ok #3ecf8e` (Easy / solved / clean), `--warn #ffb454` (Medium / retries / streak),
`--bad #ff6b6b` (Hard / tainted / integrity flag).

**Rules**
- Accents mark *one* thing per view: the live value, the active tab, the focused input.
- Accents **darken** in light mode. Never reuse a dark-mode accent on white.
- Status tint recipe: ~13% accent fill + solid accent text. Never a filled solid chip.
- Max one accent hue per page. Cross-course pages (the teacher dashboard) use the
  accent only as a per-course *label*, and neutral blue for its own chrome.

---

## Type

Two families, and the split is semantic, not decorative.

- **Inter** — the human voice: headings, prose, buttons, table cells.
- **JetBrains Mono** — the machine voice: labels, codes, counters, XP, timers, IDs.

> If a human wrote it, Inter. If the system emitted it, mono.

Mono is almost always **uppercase with wide letter-spacing** — `.eyebrow` (11px/2px)
and `.lbl` (10px/1.5px) are the two standard sizes. Body is 13–14px; headings 19–26px;
`.stat .n` is 26px/800 — the largest thing on most screens, because the number is the point.

---

## Space & shape

4px base step. Common values: 6, 8, 10, 14, 18, 22, 28.
Radii: `7px` small controls · `9–11px` inputs and nested boxes · `14px` cards · `999px` pills.

**Elevation is inverted.** `.card` sits on `--bg` in `--panel` — but boxes *inside* a card
drop **back** to `--bg` with the fainter `--border2`. Depth reads as recess, not lift.
There are almost no shadows; hierarchy comes from border contrast.

---

## Components

`.card` `.mcard` `.row` · `.btn` (`.pri` `.danger` `.sm`) · `.qlink` · `.in` ·
`.pill` `.chip` `.badge` · `.tabs`/`.tab` · `.stat` · `.bar` · `table` · `.themebtn`

Two signature interactions:
- **`.qlink`** — module/quest links physically press in: `translateY(2px) scale(.992)`
  plus an inset accent glow. Nothing else on the site moves on click.
- **`.themebtn`** — fixed top-right on every page; light/dark persists in
  `localStorage['course-theme']` and is applied by an inline script in `<head>`
  before first paint, so there's no flash.

---

## Motion

Fast and mechanical. `.15s` for hover, `.25s` for theme cross-fade, `.08s` for the press.
Nothing eases longer than 450ms.

Named animations: `spin` (loaders), `blink` (terminal cursor), `scan` (scanline sweep),
`fade` (content enter), `glShake` (the guide's glitch takeover).

The **intro transitions** are course-specific and the one place personality overrides
restraint — Cyber glitch/intrusion, `packet-intro.js` for Byte Bounty, `consensus-intro.js`
for Proof of Work. Each picks a random variant per load.

---

## Voice

Terminal-clipped and second-person. Labels are system output (`FLAGS CAPTURED`,
`INTEGRITY`, `code:`); prose is warm and plain. The adversarial guides (NEMESIS, SPECTER)
taunt; the friendly ones (ADA, ORACLE) coach. **Teacher-facing UI never taunts** — it is
plain, calm, and administrative.

No emoji in chrome or navigation. The three sanctioned exceptions are earned-state
signals only: 🔥 streak, 🏅 badge count, 🎉 empty integrity log.

---

## Don't

- Don't hardcode hex — use tokens, or the light theme silently breaks.
- Don't add a fifth accent hue, or use one course's accent inside another.
- Don't use gray neutrals; the tinted ramp is the whole effect.
- Don't add drop shadows for hierarchy — use border contrast.
- Don't put gradients on backgrounds. The one accepted use is the near-invisible
  `--trace` scanline overlay.
- Don't apply glitch or taunt treatments to teacher/admin surfaces.

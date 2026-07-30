# Cybersecurity & CS Classroom Site

Static, no-build HTML site for three courses: AP Computer Science Principles (`apcsp/`),
Cybersecurity 1 (`cyber1/`), AP Cybersecurity (`cyber2/`), plus a Web3/Blockchain elective (`web3/`).
Root `index.html` is the course picker (homepage).

## Setup

No build step — plain HTML/CSS/JS. To run locally, serve the folder with any static
server (e.g. `npx serve .` or the VS Code "Live Server" extension) and open `index.html`.
Opening files directly via `file://` mostly works too, except features that `fetch()`
data (schedules, news) need to be served over http(s).

**GitHub Pages:** push this folder's contents to the repo root of the Pages branch —
`index.html` at the repo root must be the real homepage (not a simulator or other page).

**Optional Supabase backend** (login gating, XP/score logging, teacher reports):
see `SUPABASE-SETUP.md` and the SQL files in `supabase/`. The site works without it —
Supabase-backed features (auth, saved progress) just no-op if `supabase-config.js`
isn't filled in.

## How it's organized

- `index.html` — course picker homepage.
- `apcsp/`, `cyber1/`, `cyber2/`, `web3/` — one folder per course, each with:
  - `index.html` — course home (schedule, countdowns, quick links, resources)
  - `syllabus.html`, `vocab.html`, `vocab-data.js`, `news.html`, `profile.html`
  - `ctf.html` — the course's Capture-the-Flag / challenge arena (cyber1 & cyber2 only)
- `simulators/` — standalone interactive teaching tools (one HTML file each), linked
  from the course pages' "Simulators" / "Class Links" cards. `simulators/index.html`
  is the simulators hub/directory.
- `config.js` — **single source of truth** for editable per-course settings: schedule
  sheet IDs, exam/task countdown dates, Meet links, resource card links, CTF flags
  (see `CLAUDE.md` for the CTF authoring rules).
- `ctf.js` — shared CTF engine (challenge rendering, grading, boss gauntlet, anti-AI
  deterrents). Loaded only by `cyber1/ctf.html` and `cyber2/ctf.html`.
- `answers.local.js` — teacher-only answer key for text-entry flags, uploaded via
  `answers.html`. **Gitignored — never commit it.**
- `resources.js`, `objectives.js`, `standards.js`, `sync.js`, `auth.js`, `profile.js`,
  `vocab-log.js`, `vocab-xp.js`, `welcome.js`, `nemesis-intro.js`, `name-filter.js`,
  `gate-art.js`, `csv.js`, `cipher.js` — shared helper scripts used across course pages.
- `styles.css` — shared base styles/tokens used site-wide.
- `design-system/` — visual design system reference (tokens, components, guidelines).
- `teacher.html` — teacher-facing dashboard/reports (Supabase-backed).
- `supabase/` — SQL schema files for the optional backend.
- `uploads/` — reference materials (CED PDFs, pasted images) used while building content.

## Editing day-to-day content

- **Weekly schedule**: each course's `index.html` pulls from a published Google Sheet
  (CSV export) — edit the sheet, the page updates automatically. Sheet ID/GID live in
  `config.js` per course.
- **Countdowns** (exam day, AP Create Task due, etc.): edit the `exam` object in
  `config.js` per course. The AP CSP Create Task countdown is currently hardcoded as
  a fallback in `apcsp/index.html` (`const TASK = CFG.createTask || {...}`) — add a
  `createTask: { name, date, from }` entry to `config.js`'s `apcsp` block to make it
  editable from there too.
- **CTF flags / challenges**: edit `config.js` only — see `CLAUDE.md` for the full
  rules (leveled text flags, `answers.local.js` sync, one array per course, etc.).
  Never edit `ctf.js` to add content.
- **Quick Links / Class Links / Resources cards**: edit the links directly in each
  course's `index.html`, or via `resourceCards` in `config.js`.

## License

© 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0
(attribution required, no commercial use) — see `LICENSE.md`. A CC BY-NC badge +
link appears in the footer of every page.

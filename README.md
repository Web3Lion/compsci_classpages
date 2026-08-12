# Cybersecurity & CS Classroom Site

Static, no-build HTML site for four courses: AP Computer Science Principles (`apcsp/`),
Cybersecurity 1 (`cyber1/`), AP Cybersecurity 2 (`cyber2/`), Cybersecurity 3 (`cyber3/`),
plus a Web3/Blockchain elective (`web3/`).
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

- `index.html` — course picker homepage. Each course card has a real `<a target="_blank">`
  pop-out button (top-right) so the card opens in a new tab even when this page is
  embedded in a small iframe elsewhere.
- `buttons/` — all single-button standalone pop-out pages, styled to match each
  course's colors/gradient, meant to be embedded on their own (e.g. in an LMS page)
  when the full course card grid doesn't fit:
  - `open-cyber1.html`, `open-cyber2.html`, `open-cyber3.html`, `open-web3.html`,
    `open-apcsp.html` — open the course itself.
  - `docs-cyber1.html`, `docs-cyber2.html`, `docs-cyber3.html` — "Enter the Grid"
    student-documents buttons linking to each course's Drive folder. AP CSP/Web3
    versions pending their document links.
  - `open-button.html` — generic configurable button (`?to=&label=&color=`).
- `apcsp/`, `cyber1/`, `cyber2/`, `cyber3/`, `web3/` — one folder per course, each with:
  - `index.html` — course home (schedule, countdowns, quick links, resources)
  - `syllabus.html`, `vocab.html`, `vocab-data.js`, `news.html`, `profile.html`
  - `ctf.html` — the course's Capture-the-Flag / challenge arena (cyber1, cyber2 &
    cyber3 only — apcsp and web3 don't have one)
- `simulators/` — standalone interactive teaching tools (one HTML file each), linked
  from the course pages' "Simulators" / "Class Links" cards. `simulators/index.html`
  is the simulators hub/directory.
- `config.js` — **single source of truth** for editable per-course settings: schedule
  sheet IDs, exam/task countdown dates, Meet links, resource card links, CTF flags
  (see `CLAUDE.md` for the CTF authoring rules).
- `ctf.js` — shared CTF engine (challenge rendering, grading, boss gauntlet, anti-AI
  deterrents). Loaded only by `cyber1/ctf.html`, `cyber2/ctf.html`, and `cyber3/ctf.html`.
- `teacher.html` — teacher-facing dashboard/reports (Supabase-backed): class summaries,
  login/attendance report, flag analytics, module/flag locks, course-guide persona and
  answer-key toggles, Ultimate Flags active/inactive toggle (cyber1 & cyber2), squads,
  vocab lab, objectives, XP log, enrollment, integrity/cheat log, settings.
- `answers.local.js` — teacher-only answer key for text-entry flags, uploaded via
  `answers.html`. **Gitignored — never commit it.**
- `resources.js`, `objectives.js`, `standards.js`, `sync.js`, `auth.js`, `profile.js`,
  `vocab-log.js`, `vocab-xp.js`, `welcome.js`, `nemesis-intro.js`, `name-filter.js`,
  `gate-art.js`, `csv.js`, `cipher.js` — shared helper scripts used across course pages.
- `styles.css` — shared base styles/tokens used site-wide.
- `design-system/` — visual design system reference (tokens, components, guidelines).
- `supabase/` — SQL schema files for the optional backend (run in the order noted in
  `SUPABASE-SETUP.md`: schema, google-auth, teacher-reports, class-gates, answer-key,
  attempt-log, class-groups, and the rest).
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

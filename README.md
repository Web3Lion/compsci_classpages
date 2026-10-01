# Cybersecurity & CS Classroom Site

**Version 2.0.0** — see `CHANGELOG.md`.

Static, no-build HTML site for five courses: AP Computer Science Principles (`apcsp/`),
Cybersecurity 1 (`cyber1/`), AP Cybersecurity 2 (`cyber2/`), Cybersecurity 3 (`cyber3/`),
and a Web3/Blockchain elective (`web3/`).
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
  - `ctf.html` — the course's Capture-the-Flag / challenge arena. All five courses
    have one, themed per course ("Bug Bounty" in AP CSP, "Block Hunter" in Web3).
  - `apcsp/packet-intro.js`, `web3/consensus-intro.js` — page-transition intros for
    the non-cyber courses (cyber pages use `nemesis-intro.js`).
- `simulators/` — standalone interactive teaching tools (one HTML file each), linked
  from the course pages' "Simulators" / "Class Links" cards. `simulators/index.html`
  is the simulators hub/directory.
- `practice/` — ungraded/graded practice quizzes (no login required), linked from
  `practice/index.html`. Each quiz has Open Practice (untimed, endless) and Begin
  Quiz (graded, timed, 10-15 random no-repeat questions) modes. `teacher-guide.html`
  maps every quiz to AP CSP Units/Big Ideas.
- `leaderboard.html` — live classroom-display leaderboard (Supabase-backed). Teachers
  pick a class; students see their own class with their row highlighted and a sticky
  rank chip. Three modes: **Overall**, **This Week**, and **Hall of Fame** (past weekly
  top 3). Rank movement arrows (▲/▼/NEW) compare against the first board seen that
  day on that device. Fullscreen button for projectors; auto-refreshes every 60s.
- `reward-spinner.html` — teacher-only prize wheel (students see a locked view).
  Pick a class + student and the prize is sent to their profile when the wheel stops.
  **EDIT ODDS** lets the teacher reweight or remove prizes (saved per device); sound
  effects can be toggled off.
- `duel.html` — head-to-head duel projector page (quick duel or 4/8-player
  bracket). Students answer on their own device via `duel-client.js`.
- `pulse.html` — live Class Pulse dashboard: who's active, which flag they're on,
  who needs help, capture feed.
- `certificates.html` — printable certificates (module / weekly top 3 / course /
  duel champion / custom), one landscape page per student.
- `answers.html` — teacher page for uploading `answers.local.js`.
- `sru-summit.html` — Cyberspace K-12 Summit field-trip page (Cyber 1 + AP Cyber 2),
  linked from the announcement card on both course home pages.
- `install-check.html` — setup + database + course-content check (needs
  `supabase/install-check.sql`). Start here when something isn't working.
- `countdown.html` — standalone countdown display.
- `apcsp/carlow-grade-scale.html`, `cyber1/rmu-grade-scale.html` — dual-credit partner
  grade-scale reference pages, flagged as differing from South Fayette's own scale.
- `config.js` — **single source of truth** for editable per-course settings: schedule
  sheet IDs, exam/task countdown dates, Meet links, resource card links.
- `ctf-data/<course>.js` — each course's CTF flags, boss questions and frameworks,
  loaded after `config.js` only by pages that need them (see `CLAUDE.md` for the CTF
  authoring rules).
- `ctf.js` — shared CTF engine (challenge rendering, grading, boss gauntlet, badges,
  ranks, streaks, reward items, loot drops, anti-AI deterrents). Loaded by every
  course's `ctf.html` and `profile.html`.
- `teacher.html` — teacher-facing dashboard/reports (Supabase-backed): class summaries,
  login/attendance report, flag analytics, module/flag locks, course-guide persona and
  answer-key toggles, Ultimate Flags active/inactive toggle (cyber1 & cyber2), squads,
  vocab lab, objectives, XP log, enrollment, integrity/cheat log, send rewards (to one
  student or a whole class) with an item log, settings.
- `answers.local.js` — teacher-only answer key for text-entry flags, uploaded via
  `answers.html`. **Gitignored — never commit it.**
- `resources.js`, `objectives.js`, `standards.js`, `sync.js`, `auth.js`, `profile.js`,
  `profile-link.js`, `practice-sync.js`, `vocab-log.js`, `vocab-xp.js`, `welcome.js`,
  `nemesis-intro.js`, `name-filter.js`, `gate-art.js`, `csv.js`, `cipher.js`,
  `cosmetics.js` (Coin Shop + leaderboard cosmetics), `duel-client.js` (student duel
  pad) — shared helper scripts used across course pages.
- `site.js` — loaded in `<head>` on every page: `SITE_VERSION`, the A11Y panel
  (reduce motion, high contrast), skip link, focus styles.
  Script tags carry the release number as a cache tag (`?v=2.0.0`) — when you bump
  `SITE_VERSION`, bump the tag on every page too.
- `styles.css` — shared base styles/tokens used site-wide.
- `design-system/` — visual design system reference (tokens, components, guidelines).
- `supabase/` — SQL schema files for the optional backend (run in the order noted in
  `SUPABASE-SETUP.md`: schema, google-auth, teacher-reports, class-gates, answer-key,
  attempt-log, class-groups, and the rest). **Re-run order matters**: `multi-domain.sql`
  and `teachers.sql` must be re-run after any re-run of `google-auth.sql` (it resets
  `_is_school()`/`_is_teacher()`), and `allowed-emails.sql` must be re-run after any
  re-run of `multi-domain.sql` (it resets the external-email allowlist). Use
  `check-installed.sql` to see which files need a re-run.
- `.github/workflows/weekly-snapshot.yml` — GitHub Action that saves each class's
  weekly top 3 to the Hall of Fame every Monday (replaces pg_cron, which the Supabase
  free tier lacks). Needs repo secrets `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, plus
  `supabase/weekly-snapshot-auto.sql` installed.
- `uploads/` — reference materials (CED PDFs, pasted images) used while building content.

## Rewards & items

Students earn or receive items that appear in their profile inventory. Timed items
are activated with a hold-to-confirm button and show a live countdown on the profile
and in the arena (bottom-left pill). New arrivals show a glowing notification.

- **Game items:** 2x XP (24h), Streak Freeze, +500 XP bonus
- **Boss boosts:** Firewall Shield, Overclock, Extra Life
- **Flag help:** Free Hint, Retry Wipe, Cooldown Skip, Time Freeze
- **XP multipliers:** Lucky Capture, Pioneer Boost, Squad Surge
- **Surprise drops:** Mystery Box, Loot Drop (3% chance per capture)
- **Vouchers** (homework pass, extension, bonus points): redeemed in person with the teacher

Sources: the reward spinner, the teacher dashboard's Send Rewards tab, and loot drops.
Backend: `supabase/reward-items.sql`.

## Arena mechanics (v2.0)

- **Combo meter:** consecutive captures with no wrong answer pay ×1.1, ×1.2, ×1.3,
  ×1.4, then ×1.5 max. One miss resets it.
- **Bookmarks:** ☆ on any flag, then filter to ★ Saved.
- **Hint cost preview:** the flag's value now vs. after the hint, before you reveal it.
- **Coins:** 1 coin per 250 XP (plus teacher bonus coins), spent in the profile
  Coin Shop on titles, name colors and frames. Never affects XP or rank.

## Site-wide conventions

- **Light/dark theme toggle** on every page, shared through `localStorage['course-theme']`.
  New pages must include it from the start (see `CLAUDE.md`).
- **Accessibility preferences** (`course-motion`, `course-contrast`) are shared the
  same way. New pages get them by loading `site.js` in `<head>`; JS-driven
  animations should check `window.SITE_REDUCED_MOTION()`.

## Editing day-to-day content

- **Weekly schedule**: each course's `index.html` pulls from a published Google Sheet
  (CSV export) — edit the sheet, the page updates automatically. Sheet ID/GID live in
  `config.js` per course.
- **Countdowns** (exam day, AP Create Task due, etc.): edit the `exam` object in
  `config.js` per course. The AP CSP Create Task countdown is currently hardcoded as
  a fallback in `apcsp/index.html` (`const TASK = CFG.createTask || {...}`) — add a
  `createTask: { name, date, from }` entry to `config.js`'s `apcsp` block to make it
  editable from there too.
- **CTF flags / challenges**: edit `ctf-data/<course>.js` only — see `CLAUDE.md` for the full
  rules (leveled text flags, `answers.local.js` sync, one array per course, etc.).
  Never edit `ctf.js` to add content.
- **Quick Links / Class Links / Resources cards**: edit the links directly in each
  course's `index.html`, or via `resourceCards` in `config.js`.

## License

© 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0
(attribution required, no commercial use) — see `LICENSE.md`. A CC BY-NC badge +
link appears in the footer of every page.

# Changelog

Version numbers follow `MAJOR.MINOR.PATCH`:
- **MAJOR** — a release with new SQL files or new pages students/teachers use.
- **MINOR** — new features that need no new SQL.
- **PATCH** — fixes and copy/style changes.

The current version lives in `site.js` (`SITE_VERSION`) and shows in every page
footer and the A11Y panel. Script and stylesheet links carry the same number as
a cache tag (`?v=9.0.0`) — bump both together on every release.

---

## 17.0.0 — 2026-10-13
- New SQL: `supabase/vocab-quizzes.sql` (run #36). Teacher-assigned vocab quizzes: a term pool, terms per student, and a count per format (word-bank completion, matching, multiple choice, type the term). The server draws and shuffles a different paper for every student and every attempt, keeps the answer key server-side, and grades on the server (text comparison; typed answers forgive 1–2 typos). Optional time limit, open/due dates, manual open/close, attempts (default 2, best score counts).
- New page: `quiz.html?q=<id>`. Students sign in with Google and their name fills in automatically. Calm, high-legibility theme (Atkinson Hyperlegible), keyboard and screen-reader friendly, autosave, timer with auto turn-in, copy/paste blocked, leaving the page is counted for the teacher. After turning in: score plus the questions they missed. Integrity rule (warned at the top of the page): the quiz opens in full screen; leaving full screen, switching tabs/apps, clicking outside the window, or closing/reloading the page ends the attempt immediately. It is graded on the answers so far (students are told the quiz screen lost focus) and flagged as an integrity violation in the teacher results, CSV, and the Integrity tab.
- teacher.html: new "Assigned Vocab Quizzes" tab. Build from the course vocab list (filter by module, search) plus custom terms; copy the link for Classroom; open/close, edit dates, per-student results (best score, attempts, missed terms, left-page/paste counts), most-missed terms, reset a student, CSV export.
- New `quiz-notice.js` on every course home + profile page: an "Assigned Quizzes" Quick Link that glows (same glow as new rewards) with a notice card while a quiz is waiting, and an Assigned Quizzes card in the profile with scores and missed questions.
- Summit: "Students still need to bring their own lunch" notice on the Cyber 1 / Cyber 2 summit cards and on `summit/sru-summit.html`.

## 16.0.0 — 2026-10-12
- New SQL: `supabase/tool-clicks.sql` (run #35). Anonymous click counts for each card/button on `tools/` (Teacher Tools). No names, emails or IPs stored.
- New `click-log.js`: any element with `data-track="Card name"` logs clicks on itself or its links/buttons. Loaded on `tools/index.html`.
- teacher.html → Settings: new "Teacher Tools clicks" panel (today / 7 days / all time per card, with a per-button breakdown, plus Reset).
- Added to `check-installed.sql`, `install-check.sql` and `SUPABASE-SETUP.md`.
- Summit: tinyurl.com/42apjrw7 under the main-page QR and on the title slide; small slide-deck QR in the corner of every slide after the first.

## 15.0.0 — 2026-10-11
- New page: `directory.html`, a searchable teacher site map of every main page (live displays, teaching tools, courses, events/summits, back office, embeds). Linked from the Teacher Dashboard toolbar (🗂 Directory). `noindex`.

## 14.1.0 — 2026-10-10
- Site-wide SIGN OUT button in the top-right control row (site.js), shown on every page while a Google session is stored on the device. Signs out of Supabase, clears cached class sessions (`ctf-sess-*`), and reloads.
- Competitions: added the PCWA High School CTF (IUP, Hack The Box, Oct 30–31).
- Summit pages moved into `summit/`: FFL-summit-mainpage.html, FFL-summit-2026-deck.html, sru-summit.html, their screenshots (`summit/assets/creation/`) and image-slot state. Old root URLs (including summit.html) redirect, so printed QR codes keep working. Deck QR points to the new path; cyber1/cyber2 field-trip cards link to `summit/sru-summit.html`.

## 14.0.1 — 2026-10-10
- Fix: NEMESIS/guide voices bled between courses. Voice settings were saved under one shared key, so tuning one course changed every course, and only the SPECTER guide had its own default. Each course now saves under `ctf-nemesis-voice:<course>` and has its own default, the same in mentor and adversary mode: Cyber 2 deep and slow (UK male, pitch 0.30), Cyber 1 a lighter male (US, pitch 0.85), AP CSP British female. When a named voice isn't installed, a matching gender + accent voice is picked instead. The voice tuner's Reset now restores the course's real defaults.

## 14.0.0 — 2026-10-10
- New page: FFL-summit-2026-deck.html — self-paced talk slides for the Future-Focused Learning Summit (13 slides: platform tour, stack, Claude.ai, Supabase vs Neon, GitHub Pages vs Render vs Vercel, interactive "which should I use?" picker, NEMESIS takeover puzzle, privacy, cost, lessons, start Monday, explore links). Arrow keys, swipe, slide menu, #n deep links; respects reduce-motion.
- summit.html renamed to FFL-summit-mainpage.html (summit.html now redirects there). Hedera Token Studio card (teal), full-width Teacher Tools, presenter panel with gold email button, holographic title, "Talk slides" link.

## 13.0.0 — 2026-10-09
- New SQL: supabase/weekly-xp-summary.sql (`ctf_t_weekly_xp`). Added to install-check.sql, check-installed.sql and SUPABASE-SETUP.md (#34).
- teacher.html: new **Weekly XP** tab — XP per student for each of the last 4/8/12/18 weeks (Sunday–Saturday ET; flag captures + hand-granted XP), with a total. Sort by Google name, hacker name, total, or any week; CSV export.

## 12.1.0 — 2026-10-09
- Boss fights can borrow another module's vocabulary with `ctf.bossVocabFrom = { module: sourceModule }`. Cyber 1 Module 12 (Test Experience) now mixes Module 1 vocab with its own boss questions.

## 12.0.1 — 2026-10-09
- Fix: boss fight froze on modules with no vocabulary terms (Cyber 1 Module 12 Test Experience). It now draws only from the module's boss questions and reshuffles them when they run out.

## 12.0.0 — 2026-10-09
- New page: rewards/testday/ — Test Day Duck Pond. Teacher sign-in required. Every duck flips to +2% on the test (this page only); the prize chart is shown for fun but does not affect the result. Optional student name, today's bonus list kept in this browser, full-screen mode.

## 11.1.0 — 2026-10-08
- summit.html restyled for the Future-Focused Learning Summit ("Built to Connect: Designing School for the AI Era"): summit title, date, four pillars, red/purple/blue spark palette, presenter block (Mr. Robert Reasey). QR codes added to summit.html and tools/index.html.

## 11.0.0 — 2026-10-08
- New page: summit.html — Future Focused Summit (Oct 12, 2026) landing page linking educators to the Cybersecurity 1 CTF (code CY1-YWY4, Module 12 Test Experience) and the Crypto Trading Platform (code HWFGYX), with copy-code buttons and light/dark theme.

## 10.1.0 — 2026-10-08
- Answer key: module filter chips (All / M1…Mn / Boss) per class. Selection is remembered per class, stays pinned while scrolling, and printing outputs only the filtered module.

## 10.0.0 — 2026-10-07

**New SQL:** `supabase/guest-mode.sql` (run after `google-auth.sql`, `multi-domain.sql`, `allowed-emails.sql`; then re-run `install-check.sql`).

- Guest mode: teacher.html → Settings opens one class to **any** Google account for 1, 2, or 4
  hours. Visitors sign in and join with the class code; it closes on its own. Built for PD
  sessions where guest emails aren't known ahead of time.
- Arena sign-in screen shows a "Guest mode is on" note while it's open; guests who try another
  class code get a clear message.
- check-installed.sql / install-check.html list the file and guard its run order.

**New pages:** `privacy.html` and `terms.html` (required to publish the Google OAuth app),
linked from the home page footer.

## 9.1.0 — 2026-10-07

- Cyber 1 CTF: new **Module 12 — Test Experience**, an educator demo of the arena with 10
  general-knowledge captures (4 leveled text flags, 2 match, 3 order, 1 spot-the-phish) and
  6 boss questions.
- New `ctf.lockedByDefault` option: listed modules stay locked for every class until the
  teacher opens them on the Gates tab (saved as an `open:N` token in `locked_flags`, no SQL).

## 9.0.0 — 2026-10-06

**New pages:** `hidden/` (Example Programs, unlinked, `noindex`) and `hidden/mastermind.html`.

- Mastermind (AP CSP): a browser console that behaves like the Python program students
  will write — same prompts, "You guessed N correctly.", the congratulations line, and a
  real-looking `ValueError` traceback on non-integer input. Debug toggle prints the answer.
- Tools page: Jeopardy import now starts at cell C1.

## 8.0.0 — 2026-10-06

**New page:** `teacher_cyber_tools/` (Teacher Resources), linked from the teacher dashboard's class toolbar.
Not linked anywhere students see; `noindex`. Starts with NCL (Cyber Skyline), Paradigm Centra and CLARK.

## 7.0.0 — 2026-10-06

**New page:** `competitions.html` (linked from Cybersecurity 1 and AP Cybersecurity 2 homes).

### Competitions
- New Cyber Competitions page with NCL Fall 2026 and picoCTF 2027: format, team size,
  cost, schedule and official links. Palette follows the course (`?from=cyber1|cyber2`).
- New COMPETITIONS card on the cyber1 and cyber2 home pages. Each event counts down to its
  start, switches to LIVE with a countdown to the end while running, and drops off when over.
- All dates live in `competitions.js` — edit that one file to add or change events.

## 6.1.0 — 2026-10-06

**SQL:** re-run `supabase/coins-cosmetics.sql` (new prices + slots).

### Coin Shop
- **Name colors:** Cyber Green, Byte Purple, Block Orange (course themes), SF Lions, Fire,
  Ocean, Rainbow, Matrix Glitch, Living Rainbow (animated), Holographic (animated shimmer).
- **Name effects:** Glow, Typewriter, Sparkle.
- **Pets:** Computer Mouse, Rubber Duck, Penguin, Robot, Cat, Owl, Ghost, Dinosaur, SF Lion,
  Dragon. Shown beside the name; your own pet also follows your mouse on the arena and
  profile pages (toggle in the shop; off with reduced motion or on touch screens).
- **Capture celebrations:** Confetti, Pixel Burst, Starfall, Binary Rain, Pet Parade, each
  with a short sound (toggle in the shop).
- **Profile banners** and **leaderboard row trails** (Neon Underline, Scanline, Comet, Flame).
- Prices 5–40 coins. Cosmetics now show on the class leaderboard (rows + podium), the
  duel screen, Class Pulse, the profile card and the arena's PLAYING AS chip.

## 6.0.2 — 2026-10-06

**SQL:** re-run `supabase/module-clears.sql`, then open the teacher dashboard once per course.

- **Server check on module clears.** The Clear Crate + Coin Pack are only sent when the
  server's own capture log has every flag in the module for that student, and (when the
  guide is on) a recorded boss win. The teacher dashboard publishes each course's
  module → flag list on load (`module_manifest`); boss wins are logged to `boss_wins`.
  If a capture never reached the server, the CTF page resends what the device has and asks
  once more.

## 6.0.1 — 2026-10-06

- **Robot Run** moved from Simulators to Practice (`practice/robotrun.html`), with a row in
  the Practice teacher guide. Robot Build stays in Simulators; the two still link to each
  other. The old `simulators/robotrun.html` URL redirects.

## 6.0.0 — 2026-10-06

**SQL:** re-run `supabase/reward-items.sql`, then run the new `supabase/module-clears.sql`,
then re-run `supabase/install-check.sql`.

### Rewards Packs (teacher.html → Send Rewards)
- New **Rewards Pack** item: tick any in-game items, set 1–10 of each, add coins, name it,
  and send. Students open it on their profile: the crate rattles, bursts, and every item
  pops into their inventory. Packs never contain classroom prizes.
- Six new items, sendable alone or in packs: **Double Hint** (two free hint reveals),
  **Skip Token** (open one locked flag early), **Nemesis Repel** (no focus-loss takeover
  until the next capture; leaving is still logged), **Badge Shard** (3 / 6 / 9 earn the
  Prism badge), **Duel Ticket** (shows as Duel requested in the item log), **Streak +1**.

### Module clears (every flag in a module + its boss)
- Automatic **Module Clear Crate** and **Coin Pack** in the student's items. Teachers set
  the crate contents and coin amount per class from the pack builder (default: Double Hint,
  Mystery Box, Lucky Capture, Firewall Shield, Badge Shard + 100 coins).
- **Module N Mentor** badge per module, **Vanguard** badge for first in class, and a
  **Trophy Wall** on the profile. Teachers see who cleared each module (Mentors) on the
  Send Rewards tab.
- A defeat moment: the guide (NEMESIS, ADA, ORACLE…) breaks apart and the rewards are listed.
- **Vault flags**: a hidden leveled flag per module that appears once the module is
  cleared. AP CSP has one for every module (`ap-m1-vault` … `ap-m7-vault`); other courses
  can add `vault: true` challenges. Vault flags never count toward module or course totals.

## 5.3.0 — 2026-10-05

### AP CSP CTF — Trace the Output
- Ten new leveled flags in Module 2, one per lesson (`ap-m2a-trace` … `ap-m2j-trace`).
  Students read Python or AP pseudocode and type what it prints: variables, typecasting,
  sequential vs. nested conditionals, range/while/nested loops, string concatenation,
  0- vs. 1-indexed lists, traversals, function calls, and errors.

### Vocab Bingo (reward.html)
- Download a CSV template (`bingo-template.csv`), fill it in a spreadsheet, and upload it
  to load the word list and generate cards.
- Reset Game (clear the called list, keep the cards) and End Game & Exit buttons.

## 5.2.0 — 2026-10-04

### Reward Big Top (reward-spinner.html + reward.html)
- **Gumball Machine** (chance): turn the crank; the gumball's color is the prize tier.
- **Bowling**, **Stacker**, **High Striker** (skill): six levels each on the shared tier ladder,
  with the Whole class option. Stacker advances rows automatically.
- **Vocab Bingo** (new Class Games section): paste a term | definition list (or add Cyber 2
  unit vocab on reward-spinner), share the student link or print cards, call definitions on
  the projector, and check a winner by card number before awarding a prize from the odds.
  Cards are rebuilt from the game id + card number, so no server is needed.
- Plinko: the chip now lands on a peg every row and bounces visibly; the last peg row sits
  over the bin dividers.
- Hack the Vault: digit 5 uses a sticky dial that stalls and lurches.

## 5.1.0 — 2026-10-04

### Reward Big Top (reward-spinner.html + reward.html)
- New circus-themed **landing page**: a marquee sign and game cards split into Games of
  Chance and Games of Skill. Picking a card plays a curtain transition into the game;
  **← BIG TOP** goes back. Direct links work (e.g. `reward.html#plinko`).
- **New chance games** (prize drawn from the odds/rewards table): **Plinko** (rarity bins,
  legendary at the edges), **Mystery Lockers** (30 lockers), **Claw Machine** (steer, drop,
  sometimes slips).
- **New skill games** (6 levels; the last level cleared sets the tier, pick any prize at or
  below it, Whole class option): **Basketball** (15 ft to half court), **Penalty Shot**
  (goalie gets bigger and faster), **Hack the Vault** (stop the dial on each digit).
- Duck Pond: 50 ducks, slower drift, and a full-screen mode with a longer pond.
- reward.html (free version) gets every game, using each teacher's own rewards table.

## 5.0.0 — 2026-10-01

### New page: reward.html (open to any teacher)
- Wheel, Duck Pond and Field Goal on one page, with no sign-in and no connection to
  class rosters, flags or the backend.
- **Rewards table:** teachers type their own rewards and chance %. The wheel and duck
  pond draw by those chances (totals other than 100% are scaled). Each reward's
  Field Goal tier is Auto (rarest rewards go to the longest kicks) or set by hand.
- Rewards, history and mode are saved in that browser only.

---

## 4.2.0 — 2026-09-30

### Reward Spinner → Field Goal
- New **FIELD GOAL** game next to Wheel and Duck Pond. Kick from 10, 20, 30, 40, 50,
  then 60 yards with a power meter and an aim needle; a miss ends the run.
- **Wind** changes every kick and gets stronger with distance. Point into it with the
  arrows (or click the field) before kicking. Difficulty and wind on/off sit under the field.
- **Prize tiers:** the longest make sets the tier; the kicker picks any prize from that
  tier or lower. Making the 60 opens every prize.
- **Playing for: Whole class** sends the claimed prize to every student in the selected
  class (same `ctf_t_send_items` call as the wheel — no new SQL).

### Countdown page
- The **Next Up** card (big countdown plus every upcoming date) has its own Canvas embed button.

### Home page
- **Countdown Timers** card added at the bottom of the course portal.

---

## 4.1.0 — 2026-09-28

**Re-run `supabase/coins-cosmetics.sql`** (safe to re-run) to raise the coin limit.

### Teacher dashboard → Send Rewards
- **Coins** are now an item in the grid with a teacher-set amount (−500 to 500 per
  student, was ±20). The separate coin card is gone. If the old SQL is still
  installed, the dashboard says the grant was capped and to re-run the file.
- New **Grade bonuses & passes** group with every classroom prize from the spinner as
  its own tile: **Bonus Points (Graded Assignment)** and **Unit Test/Quiz Bonus**
  with a teacher-set amount (1–10), Nightly Homework Pass, 1-Day Extension, and
  Custom Classroom Prize. A preview shows the exact label the student will see.
- Removed "Teacher Reward" from the prize suggestions (it was taken off the wheel).
- Prototype: `system-monitor.html` (debuffs, not linked yet) gained an Arena preview.

---

## 4.0.0 — 2026-09-28

### New page: `sru-summit.html` — Cyberspace K-12 Summit field trip
- Event details, travel times, tentative schedule, and links to the Field Trip
  form and Student Intake form. Live countdowns to the permission-slip deadline
  (Fri Oct 9) and the bus departure (Nov 5, 7:30).
- Themed to the course you came from (`?from=cyber1` blue / `?from=cyber2` green);
  back link returns to that course.
- Announcement card with both countdowns under the hero on `cyber1/index.html`
  and `cyber2/index.html`. It hides itself after Nov 5.

---

## 3.0.1 — 2026-09-28

### AP Cyber 2 content (clears the Install Check warnings)
- Module 1: new match capture **1.5 ext — Match the Protection** (3 interactive captures now).
- New Vocabulary Recall challenges for modules 2 (Hard: cipher), 10 (Hard: blitz)
  and 11 (Hard: speed match), biased to each unit's vocab terms.
- 7 text flags now name their Objective in every prompt. Prompt wording only;
  answers and flag hashes are unchanged, so `answers.local.js` needs no update.

---

## 3.0.0 — 2026-09-26

**Run `supabase/install-check.sql` once** (order doesn't matter). Then open
`install-check.html`.

### Faster pages
- **`config.js` split.** CTF content moved to `ctf-data/<course>.js` (one file per
  course). `config.js` went from ~620 KB to ~12 KB.
  - Home, syllabus and news pages: ~620 KB less to download.
  - A course's arena/profile loads only its own course (Cyber 3 ~31 KB, Web3 ~59 KB,
    AP CSP ~108 KB, Cyber 1 ~205 KB, Cyber 2 ~214 KB) instead of all five.
  - Verified by executing old and new config: every course's data is identical.
- `leaderboard.html` no longer loads `config.js` (it never used it).
- Vocab pages loaded `supabase-config.js` twice; now once.
- Pages that talk to the database preconnect to Supabase while the page loads.

### Install Check (`install-check.html`)
- One page for site setup, database and course content: config filled in, server
  reachable (catches a paused free-tier project), teacher sign-in, cache tags, all
  32 SQL files, 9 run-order guards, whether the Monday snapshot Action is still
  running, and a per-course content audit (text-flag tiers + hashes, duplicate ids,
  ≥3 interactive + a vocab challenge per module, Objective wording, boss questions).
  **COPY FILES TO RUN** copies the missing SQL files in order.
- Linked from the teacher dashboard's class bar.

### Supabase
- `check-installed.sql` now covers every file (was 19 of 31) in the same order as
  `SUPABASE-SETUP.md`, and checks 9 run-order traps (was 5): new guards for
  attempt-log, allowed-emails, hint-log and weekly-snapshot-auto.
- New `install-check.sql` — `ctf_install_status()`, the same checks as JSON for the page.

---

## 2.0.0 — 2026-09-26

**Run these SQL files, in this order, after everything already installed:**
`coins-cosmetics.sql`, `class-pulse.sql`, `duels.sql`, `scheduled-unlocks.sql`
(last). Then run `check-installed.sql` to confirm.

### Arena (ctf.js)
- **Combo meter.** Consecutive captures without a wrong answer build a multiplier:
  ×1.1 → ×1.2 → ×1.3 → ×1.4 → ×1.5 (max). One wrong answer resets it. Shown on the
  stats card, in each flag's value line, in the capture flash and in the XP log.
- **Flag bookmarks.** ☆ next to every flag; a **★ Saved** filter lists them.
- **Hint cost preview.** Before revealing a hint the card shows the flag's value
  right now and after the hint (updates live as the flag decays). A Free Hint shows
  as costing 0.

### Coins + Coin Shop
- New currency separate from XP: 1 coin per 250 XP, plus teacher bonus coins
  (Send Rewards tab).
- Profile **Coin Shop**: 12 titles, 6 name colors, 4 frames. Buying never costs XP.
- Equipped cosmetics show on the classroom leaderboard and in duels.

### Head-to-head duels (`duel.html`)
- Projector page. Quick Duel (pick two or random) or a 4/8-player bracket seeded
  from the leaderboard, randomly, or by hand.
- Players answer on their own device: an answer pad opens on their CTF or profile
  page (`duel-client.js`). First correct answer takes the round; a wrong answer locks
  that player out of the round. Best of 3/5/7; optional 25/50/100 XP pot.
- Questions come from each course's scenario questions and vocab. Graded by text.

### Teacher tools
- **Class Pulse** (`pulse.html`): live dashboard — who's active/idle/away, the flag
  each student has open, combo, captures today, a "needs help" lane (3+ misses on the
  open flag in 30 min), and a live capture feed.
- **Scheduled unlocks**: on Locks & Guide, any locked module or flag can be set to
  open at a date/time. Open arena tabs update at that moment.
- **Certificates** (`certificates.html`): module complete, weekly top 3, course
  complete, duel champion, or custom. Prints one landscape page per student.
- Dashboard header links to Pulse, Duel Arena and Certificates.

### Accessibility
- New `site.js` on every page: **A11Y** button beside the theme toggle with
  *Reduce motion* (defaults to the OS setting) and *High contrast text*, shared
  site-wide like the theme.
- Reduce motion stops CSS animations, confetti, background effects, the course page
  intros and the boss-card rain.
- Skip-to-content link, visible keyboard focus everywhere, names for icon-only
  buttons, keyboard access for clickable non-button elements, live regions for toasts.
- New pages ship with 44px targets, labelled controls and aria-pressed toggles.

### Other
- Leaderboard: rank movement arrows (▲/▼/NEW) and a fix for the Weekly toggle
  needing a hard refresh.
- Reward spinner: odds editor, sound effects, and a fix so listed odds match the
  real odds for prizes with two wheel slices.

## 1.x — before 2026-09-26

Everything prior: five course sites, CTF engine with badges/ranks/streaks, boss
fights, reward items and spinner, weekly Hall of Fame, teacher dashboard, practice
hub, simulators. Not individually versioned.

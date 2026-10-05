# Changelog

Version numbers follow `MAJOR.MINOR.PATCH`:
- **MAJOR** — a release with new SQL files or new pages students/teachers use.
- **MINOR** — new features that need no new SQL.
- **PATCH** — fixes and copy/style changes.

The current version lives in `site.js` (`SITE_VERSION`) and shows in every page
footer and the A11Y panel. Script and stylesheet links carry the same number as
a cache tag (`?v=5.2.0`) — bump both together on every release.

---

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

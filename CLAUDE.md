# Cybersecurity Course Webpage — project notes

## Grading invariant (ctf.js) — compare TEXT, never index
- Interactive challenges are graded on the **visible label**, not the array position:
  `match` on `pairs[].right`, `order` on `steps[]` text, Speed Match on the
  definition, Blitz/boss MC on the term. Duplicate labels are therefore legal and
  expected — a challenge may repeat "Confidentiality" as many times as it needs.
- Never reintroduce an index comparison (`picks[i] !== i`, `bi === activeTerm`,
  `arr.every((v,i)=>v===i)`). Two chips with identical text are indistinguishable
  on screen, so demanding one specific copy marks a correct board wrong. This bug
  silently affected 24 of 91 match challenges before July 2026.
- `vocabPool()` dedupes by normalized term, so a term repeated across modules
  can't put two identical definitions on one board. Keep that dedupe.

## CTF flag conventions (config.js + ctf.js)
- **Text-answer flags MUST be leveled** with Easy / Medium / Hard tiers by default
  (`"levels": [{difficulty, points, prompt, hint, flagHash}, ...]`), points 50 / 100 / 150.
  Do NOT create single-`difficulty` text flags — always author all three tiers.
- Flag hashes: `sha256(answer.trim().toLowerCase())`. Answers are wrapped `flag{...}`
  unless the prompt says otherwise. Console helper: `CTF.hash("flag{...}")`.
- **ALWAYS update `claude only/answers.local.js` in the same pass as any flag change** — adding,
  editing, or removing a flag in `config.js` must update the matching entry under
  that course's key. Keys are `"<id>"` or `"<id>#0|#1|#2"` (Easy/Medium/Hard);
  values are the exact typed answer. Interactive (`match`/`order`/`spot`/`phish`)
  and `vocab` challenges have no typed answer and never appear there. After
  editing, re-verify every entry by hashing it against `ctf-data/<course>.js`. The file is
  gitignored and uploaded through `answers.html`; never commit or serve it.
- **Every challenge lives in exactly one place**: the `challenges: [ ... ]` array
  inside that course's `window.COURSE_CONFIG.<course>.ctf = { … }` block in
  `ctf-data/<course>.js` (split out of `config.js` in 3.0.0; `config.js` now holds only
  the per-course basics — meet, sheet, exam, syllabus, resource cards), grouped by
  `/* MODULE n — Name */` dividers, in display order. There are no `.push()` calls
  and no post-processing blocks that rewrite the array — do not reintroduce either.
  To add, edit, or remove a flag, edit that array directly.
- **Still audit by EXECUTING `config.js` + `ctf-data/*.js`, not by scanning their text** — prompts contain
  braces and escaped quotes that defeat regex/JSON scans, which makes live flags look
  missing and hides duplicate ids. Enumerate by running `config.js` then each
  `ctf-data/*.js` through `new Function('window','document',src)(win, stub)` on the
  same `win`, then read `win.COURSE_CONFIG`. `install-check.html` runs the same
  structural audit in the browser.
- Pages that need CTF data load `ctf-data/<course>.js` right after `config.js`
  (a course's ctf.html/profile.html load only their own; teacher/answers/certificates/duel
  load all five). Home/syllabus/news pages load `config.js` alone — keep it that way.
- Each module should also have **≥3 dedicated interactive captures** (type `match`,
  `order`, `spot`, `phish`) plus the vocab `type:"vocab"` challenge (Easy/Med = typed,
  Hard = a per-module mini-game via `hardMode`).
- **Vault flags**: a challenge with `vault: true` stays in the module's array but is hidden
  until that module + its boss are cleared, and is excluded from every count (`flagsOf`
  returns []). Leveled like any text flag; add its answers to `answers.local.js`.
- Module clears are server-checked: `ctf_module_clear` requires a `flag_events` row for every
  key in `module_manifest` (published by teacher.html `syncManifest`, same key rules as
  `flagsOf`) plus a `boss_wins` row when the guide is on. Keep those key rules in sync.
- Module clears (module-clears.sql) send a Clear Crate + Coin Pack once per module, and
  earn the Module N Mentor / Vanguard badges. Pack contents are validated by `_pack_clean`
  in reward-items.sql — new item kinds must be added there, to the `reward_items` kind
  check, `_reward_label`, profile.js `ITEM_META`, and teacher.html `RKINDS`.
- Every module auto-gets a **BEAT NEMESIS** boss card as its last flag (rendered by
  ctf.js — no config needed). Add applied/scenario boss questions to
  `COURSE_CONFIG.<course>.ctf.bossQuestions` (kind mc|text, diff Easy|Medium|Hard).
- Prompts should name the course **Objective** they map to.

## Anti-AI deterrents (ctf.js, CTF pages only)
- Auto canary honeypot, paste/copy block, focus-loss NEMESIS takeover, devtools taunt.
- Leaving the screen does NOT reduce flag value (looking things up is allowed) — deterrent only.
- Per-flag `decoy` + `decoyText` in config adds a tailored sneaky honeypot.

## Theme toggle — standard on every page
- All pages (course pages, simulators, teacher/answers, subpages) carry a light/dark
  toggle: a boot `<script>` right after `<head>` reading `localStorage['course-theme']`
  (default `'dark'`) and setting `data-theme` on `<html>`; a `:root[data-theme="light"]`
  override block for that page's CSS vars; a fixed `.themebtn` button
  (`<button id="themeToggle" class="themebtn" onclick="__toggleTheme()">LIGHT</button>`)
  right after `<body>`; and the toggle script defining `window.__toggleTheme` + label swap.
  The `course-theme` localStorage key is shared site-wide — toggling on one page applies
  everywhere.
- New pages MUST include this from the start (copy the pattern from any existing page,
  e.g. `cyber1/syllabus.html`). Darken/lighten each page's own accent colors for
  contrast in the new theme rather than reusing raw dark-mode hex values.

## Shared engine
- Shared helper scripts live in `js/` (since 35.0.1). `site.js`, `config.js`, `supabase-config.js`
  and `ctf.js` stay in the root. Pages load them by relative path (`../js/sync.js`).
- `ctf.js` is loaded by all five courses' ctf.html/profile.html (cyber1, cyber2,
  cyber3, apcsp, web3) — badges, ranks, streaks, and the challenge engine are
  the same mechanics everywhere, just themed per course (e.g. flags are called
  "Bug Bounty" captures in AP CSP, "Block Hunter" in Web3). Don't assume any
  course is missing this system — check for the `<script src="../ctf.js">` tag
  before treating a course as engine-less.
- `nemesis-intro.js` adds the intruder glitch to other cyber pages.
- Non-cyber page transitions: `apcsp/packet-intro.js` (Byte Bounty / ADA, purple —
  RECEIVING PACKETS / ESTABLISHING CONNECTION / COMPILING PROGRAM) and
  `web3/consensus-intro.js` (Proof of Work / ORACLE, orange — REACHING CONSENSUS /
  MINING BLOCK / BROADCASTING TRANSACTION). Each picks a random variant per load and
  is loaded on that course's ctf.html + index/vocab/syllabus/news (formal pages).
- Vocab pool: `cyber2/vocab-data.js` (shared by vocab.html + ctf.html).

## Quiz skins (skins.js, v19)
- Coin Shop slot `skin` (`s_*` ids). One per course (the student row is per class). Prices in
  cosmetics.js CATALOG and `_cosmetic_price()` in coins-cosmetics.sql must match.
- `skins.js` holds each skin's light + dark palette and maps it onto quiz.html `--q-*` vars and
  profile vars. Default (no skin) = Chunky Pop on quiz.html, original look on profiles.
- Since 20.1 the skin also loads on each course's index/ctf/vocab/syllabus/news (`skins.js data-auto="profile"`),
  read from that course's `ctf-cos-<course>` cache only. Don't add it to secret/flag pages, site-wide pages or simulators.
- Never let a skin rely on color alone: the selected answer keeps its check + "Selected" label.

## Teacher mirror (teacher-mirror.sql, v20)
- A trigger on `progress` copies a teacher account's row to their row in every class of the
  same course they own (creating rows on first sync). Teacher rows are deliberately NOT labeled
  anywhere students can see — never add a "teacher" tag to leaderboards, duels, or pulse.
- `module_clears` and `reward_items` inserts for teacher rows are dropped by a trigger.

## Flag Duels (arena-duels.sql + arena-duel.html/js, v21)
- Student-run duels, separate from the projector Duel Arena (duels.sql / duel.html / duel-client.js).
- The host's page sends the duel's flag keys (same key rules as `flagsOf`, built in arena-duel.js `flags()`);
  scoring is a trigger on `flag_events` insert, so only first-time captures count. Points by `level`.
- XP is paid through `teacher_bonus` + an `xp_grants` row with teacher_email `'flag-duel'`.
- `ctf_ad_state` is the heartbeat; 90s without it during a live duel = forfeit.

## Team Battles (team-battles.sql + battle.html, v22)
- Teacher-only. Teams are the class's `class_groups` (2–4 with members); starting turns `squads_on` on.
- Flag keys come from `module_manifest` (server side). Scoring is a trigger on `flag_events`, same points as Flag Duels.
- Every battle has a clock (default 15 min). Players can exit any time (`ctf_tb_leave` → `left_at`); exited players
  stop scoring, leave the average and get no XP.
- Team score = points ÷ teammates with ≥1 capture. Teacher rows (teacher-mirror) are never on a team.
- While a battle is live, inserts into `arena_duels` are blocked by a trigger (`team_battle_live`).
- The arena bar for both lives in arena-duel.js (ctf_ad_state + ctf_tb_state).

## Vocab Duels (vocab-duels.sql + vocab-duel.html / vocab-battle.html, v23)
- Health is stored ×3 (300 hp): correct = 75 to the opponent, wrong = 25 to yourself. Same term for both players;
  first correct hits, then `_vd_new_term`. The term (`term_t`) is never returned to students while live.
- Answer check is `_vd_norm` (lowercase alphanumerics) — text, never index. Pool = client-sent `{t,d}` cleaned by `_vd_pool`
  (display term = strip parentheses, first `/` alternative, 3–24 chars).
- Class battles: teacher-only, squads 2–4, `_vd_pair` pairs present players (seen < 20s) across teams; each live
  pair gets a different term. 1v1 duels obey `classes.duels_on` and pause while a class vocab battle is live.

## Versioning
- The site version lives in `site.js` (`SITE_VERSION`) and `CHANGELOG.md`. Every
  release: bump `SITE_VERSION`, add a CHANGELOG entry, and replace the `?v=x.y.z`
  cache tag on every local script/stylesheet link to match. MAJOR = new SQL or new
  pages, MINOR = features without SQL, PATCH = fixes.
- Every page loads `site.js` in `<head>` right after the theme boot script (A11Y
  panel, reduce-motion + high-contrast prefs, skip link). New pages must too.
  JS-driven animation must check `window.SITE_REDUCED_MOTION()`.
- `supabase/check-installed.sql` (SQL Editor) and `supabase/install-check.sql`
  (the `ctf_install_status()` RPC behind `install-check.html`) carry the SAME file
  list + run-order guards. Adding a SQL file or a redefining function means adding
  it to both, and to the table in `SUPABASE-SETUP.md`.
- `scheduled-unlocks.sql` must stay the last file to define `ctf_gates` /
  `ctf_t_gates` / `ctf_t_classes`; if you change those in another file, mirror the
  change there.

## `claude only/` — working files, never deployed (gitignored)
- `claude only/uploads/` — the teacher's curriculum PDFs/DOCX/TXT (Paradigm lesson materials,
  vocab sheets, unit overviews). Source material for vocab-data.js, ctf-data/*.js, syllabi.
  Copyrighted: never link to or serve these from the site.
- `claude only/scraps/` — text extracted from those files (unit*-*.txt, cyber1-vocab-*.txt),
  plus `web3lion.github.io/` (old Web3 site copy).
- `claude only/design-system/` + `claude only/styles.css` — visual reference (tokens, components,
  guidelines cards). No live page loads them.
- `claude only/answers.local.js` — the answer key (plaintext flag answers). Lives here so it is never
  uploaded; the teacher picks it with the file chooser on answers.html.
- `claude only/Canvas.dc.html`, `Canvas-2.dc.html` — design scratch.
- `claude only/Test Day Duck Pond.html` — old bundled copy; the live page is `rewards/testday/index.html`.
New uploads land in `uploads/` at the root — move them into `claude only/uploads/` after use.
- `.github/workflows/block-private-files.yml` deletes answers.local.js, `claude only/`, uploads/, scraps/,
  _tmp_* etc. on every push to main (GitHub web uploads ignore .gitignore). Keep its list in sync
  with .gitignore when adding new private paths.

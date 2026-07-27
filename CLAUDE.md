# Cybersecurity Course Webpage — project notes

## CTF flag conventions (config.js + ctf.js)
- **Text-answer flags MUST be leveled** with Easy / Medium / Hard tiers by default
  (`"levels": [{difficulty, points, prompt, hint, flagHash}, ...]`), points 50 / 100 / 150.
  Do NOT create single-`difficulty` text flags — always author all three tiers.
- Flag hashes: `sha256(answer.trim().toLowerCase())`. Answers are wrapped `flag{...}`
  unless the prompt says otherwise. Console helper: `CTF.hash("flag{...}")`.
- **ALWAYS update `answers.local.js` in the same pass as any flag change** — adding,
  editing, or removing a flag in `config.js` must update the matching entry under
  that course's key. Keys are `"<id>"` or `"<id>#0|#1|#2"` (Easy/Medium/Hard);
  values are the exact typed answer. Interactive (`match`/`order`/`spot`/`phish`)
  and `vocab` challenges have no typed answer and never appear there. After
  editing, re-verify every entry by hashing it against `config.js`. The file is
  gitignored and uploaded through `answers.html`; never commit or serve it.
- **Every challenge lives in exactly one place**: the `challenges: [ ... ]` array
  inside that course's `window.COURSE_CONFIG.<course>.ctf = { … }` block, grouped by
  `/* MODULE n — Name */` dividers, in display order. There are no `.push()` calls
  and no post-processing blocks that rewrite the array — do not reintroduce either.
  To add, edit, or remove a flag, edit that array directly.
- **Still audit by EXECUTING `config.js`, not by scanning its text** — prompts contain
  braces and escaped quotes that defeat regex/JSON scans, which makes live flags look
  missing and hides duplicate ids. Enumerate with
  `new Function('window','document',src)(win, stub)` then read `win.COURSE_CONFIG`.
- Each module should also have **≥3 dedicated interactive captures** (type `match`,
  `order`, `spot`, `phish`) plus the vocab `type:"vocab"` challenge (Easy/Med = typed,
  Hard = a per-module mini-game via `hardMode`).
- Every module auto-gets a **BEAT NEMESIS** boss card as its last flag (rendered by
  ctf.js — no config needed). Add applied/scenario boss questions to
  `COURSE_CONFIG.<course>.ctf.bossQuestions` (kind mc|text, diff Easy|Medium|Hard).
- Prompts should name the course **Objective** they map to.

## Anti-AI deterrents (ctf.js, CTF pages only)
- Auto canary honeypot, paste/copy block, focus-loss NEMESIS takeover, devtools taunt.
- Leaving the screen does NOT reduce flag value (looking things up is allowed) — deterrent only.
- Per-flag `decoy` + `decoyText` in config adds a tailored sneaky honeypot.

## Shared engine
- `ctf.js` is loaded only by cyber1/ctf.html and cyber2/ctf.html. `nemesis-intro.js`
  adds the intruder glitch to other cyber pages.
- Non-cyber page transitions: `apcsp/packet-intro.js` (Byte Bounty / ADA, purple —
  RECEIVING PACKETS / ESTABLISHING CONNECTION / COMPILING PROGRAM) and
  `web3/consensus-intro.js` (Proof of Work / ORACLE, orange — REACHING CONSENSUS /
  MINING BLOCK / BROADCASTING TRANSACTION). Each picks a random variant per load and
  is loaded on that course's ctf.html + index/vocab/syllabus/news (formal pages).
- Vocab pool: `cyber2/vocab-data.js` (shared by vocab.html + ctf.html).

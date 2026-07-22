# Cybersecurity Course Webpage — project notes

## CTF flag conventions (config.js + ctf.js)
- **Text-answer flags MUST be leveled** with Easy / Medium / Hard tiers by default
  (`"levels": [{difficulty, points, prompt, hint, flagHash}, ...]`), points 50 / 100 / 150.
  Do NOT create single-`difficulty` text flags — always author all three tiers.
- Flag hashes: `sha256(answer.trim().toLowerCase())`. Answers are wrapped `flag{...}`
  unless the prompt says otherwise. Console helper: `CTF.hash("flag{...}")`.
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
- Vocab pool: `cyber2/vocab-data.js` (shared by vocab.html + ctf.html).

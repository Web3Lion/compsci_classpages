# Changelog

Version numbers follow `MAJOR.MINOR.PATCH`:
- **MAJOR** — a release with new SQL files or new pages students/teachers use.
- **MINOR** — new features that need no new SQL.
- **PATCH** — fixes and copy/style changes.

The current version lives in `site.js` (`SITE_VERSION`) and shows in every page
footer and the A11Y panel. Script and stylesheet links carry the same number as
a cache tag (`?v=9.0.0`) — bump both together on every release.

---

## 33.2.0 — 2026-10-24
- **Day 0 "Are You a Target?" moved to one Google Form for Cybersecurity 1, 2, AP CSP and Web 3.0.** The site pages (are-you-a-target.html, target-warmup-review.html) are removed; home-page links point at `TARGET_FORM_URL` in config.js (shown as "coming soon" until it's set). `claude only/are-you-a-target-form.gs` builds the form in Google Apps Script. AP CSP Student Info (student-info.html + review) is removed too. lockdown.sql drops `target_warmup_responses` and its functions, deleting every stored response. The teacher "Day 0 responses" button opens the form's Responses tab.
- **Fonts are self-hosted** (`assets/fonts/`, 13 families). No page contacts Google Fonts any more, so visitor IPs aren't sent to Google.
- lockdown.sql: drops the passcode-era functions from schema.sql (teacher roster / integrity / delete-class by passcode, and the old PIN student functions, including an anonymous `ctf_cheat`). The Day 0 submit function now needs a signed-in account. install-check names any that come back.
- retention.sql: assigned vocab quiz attempts (names, answers, scores) are deleted 30 days after they were taken. Re-run retention.sql.
- privacy.html updated (fonts, Google Form, quiz retention).

## 33.1.0 — 2026-10-23
- New `supabase/retention.sql`: after 30 days, sign-in reject records (emails of accounts turned away) are deleted and the typed text of wrong answers is blanked. Attempt rows stay, so wrong-try counts and timings in teacher reports are unchanged. Runs automatically (on a small share of inserts) and from the weekly GitHub Action.
- privacy.html: states the 30-day removal.
- install-check / check-installed: step 49 retention.sql; lockdown.sql moves to step 50 (still last).

## 33.0.0 — 2026-10-23
- **Security audit.** New `supabase/lockdown.sql` (run last): row level security on every table, and all 68 internal `_` helper functions made uncallable from the browser. 18 of them changed data (e.g. `_br_game_won`, `_ad_pay`, `_raid_finish`), so a student could have called them directly to win matches or award XP.
- `weekly_winners` table now has row level security (it was the one table the public key could read and write).
- `ctf_allowed_emails_public` returns only the caller's own email, not the whole allow-list.
- Secret scan: only the public anon key is in the site; the service-role key lives in GitHub Secrets only.
- install-check / check-installed: step 49 + a guard that names any table or helper still open.

## 32.1.0 — 2026-10-22
- **Duel Brackets now use the class duel waiting room**, same as Team Battles, Vocab Battles and Boss Raids. The Start button reads "Open waiting room" until it's open; the room card shows the ticked players (by squad, plus "No squad") with live ●/○ presence and a head count. Start runs the countdown, then every student in the room is sent to bracket-play.html.
- Waiting room countdown is now **5 seconds** (was 10) for every class duel.
- lobby.html, course-home and arena call-outs know the "Duel Bracket" kind; bracket players with no squad show as "Solo player".
- SQL: **re-run `supabase/waiting-room.sql`** (adds the `bracket` kind, no-squad list, 5 s default). install-check guard added.

## 32.0.1 — 2026-10-21
- Flag Duels: the duel page's flag list is a scoreboard, so students saw titles with no questions. Each flag title is now a link that opens that flag (expanded, scrolled to) in the CTF arena, with a line explaining where the questions are.
- Flag Duels: the duel's flag list now treats `lockedByDefault` modules as locked (same rule as ctf.js), so a duel can't count flags the arena still shows as sealed.

## 32.0.0 — 2026-10-21
- New page **practice/text-binary.html** (Text ↔ Binary): worked examples, unlimited practice and a 15-question quiz, 5 each from text → binary (ASCII), binary → text (ASCII), and Unicode (UTF-8: bytes per character, lead byte → byte count, bytes in a word, 2-byte encode and decode). Linked from the Practice index, teacher guide and Binary Conversion.
- Brackets: **Big screen** projector mode (live matches only in large type, question number / overtime, health or points, the last answer, up next, players left). Esc or "Exit big screen" to leave; remembered per browser.
- Brackets: students now see the answer after every question ("Nobody got it. The answer was …" / "… got it first"), plus LAST ANSWER on the between-games and match-over cards.
- Brackets: no-show and gone-missing forfeit is now **30 seconds** (was 60). **Re-run `supabase/brackets.sql`.**
- Binary set: new "fewest bits for N unique codes" question (students, songs, lockers…) in Duel Arena MC, vocab battles, brackets and the Byte Bounty boss (now 12 questions).
- Practice index: Binary Conversion card now says 15-question quiz and bit capacity.

## 31.7.0 — 2026-10-21
- Brackets: **Sudden death** option (Match length: Best of 3 / Sudden death). Every match is one game. Vocab and binary games are 5 questions: the first correct answer scores, and a wrong answer locks that player out of the question. Most points wins; tied after 5 = next point wins. A match ends early once it can't be caught. Flag brackets: first to 3 flag points. Rematch-pool games are unchanged. **Re-run `supabase/brackets.sql`.**

## 31.6.0 — 2026-10-21
- Brackets: **rematch pool**. Anyone knocked out (and not headed to the consolation bracket) is paired at random with another knocked-out player on the page for 1-game, no-XP rematches until the bracket ends. Opponents rotate (fewest past rematches first). Students see their rematch record; the tree shows live rematches. **Re-run `supabase/brackets.sql`.**
- install-check / check-installed: guard for the 31.6 brackets.sql.

## 31.5.0 — 2026-10-21
- Binary Conversion practice: new **Bit Capacity** section (largest N-bit number, how many numbers N bits hold, fewest bits for a number or a set of items, bits ↔ bytes) with a worked example and its own practice tab.
- Quiz is now 15 questions: 5 decimal → binary, 5 binary → decimal, 5 bit capacity.
- Byte Message simulator: new **Unicode (UTF-8)** mode. Text → binary shows the code point, how many bytes it needs, and the filled UTF-8 pattern; binary → text decodes 1–4 byte sequences with marker bits highlighted and clear errors for bad bytes.

## 31.4.0 — Schedule links + line breaks

- New `sheet-rows.js`: the Tentative Schedule on every course home page (cyber1/2/3, apcsp, web3) now reads the sheet's web view instead of the CSV, so links in cells (Ctrl+K links and HYPERLINK formulas) stay clickable and open in a new tab. Pasted URLs are clickable too. Falls back to the CSV if the web view can't be read.
- Hard returns inside a cell now show as separate lines instead of being joined with " · ".

---

## 31.3.1 — Binary question wording

- binary-pool.js: new wordings "How many numbers can be represented with 4 bits / 2 bytes?" and "What is the largest number that can be represented with N bits / bytes?" mixed in with the existing versions.

---

## 31.3.0 — Squad prizes + victory-screen prize rolls

- Carnival (Reward Rally): the "Spin for" list now has a **Squads** group. Pick a squad and the prize goes to every member's profile.
- New `prize-roll.js`: when a battle, bracket or duel ends, a random chance game (wheel, duck pond, Plinko, lockers, claw, gumball) opens on the victory screen and the prize is sent automatically. Opens once per result (only if it ended in the last 15 minutes); a **Prize roll** button on the results reopens anything not yet rolled. Skip / Close on the bar.
  - Vocab Battle + Team Battle: each winning squad rolls a class prize — no test bonus, graded-assignment bonus or homework pass. Every squad member gets it.
  - Bracket (bracket.html) and Duel Arena brackets: 3rd place (both semifinalists) = in-game items, runner-up = every prize except test bonuses, champion = every prize. Rolled 3rd → 1st.
  - Duel Arena single duels: the winner rolls in-game items only.
- carnival.html award mode (`?award=1`): pool limited for that roll only (saved odds untouched), lobby/odds editing hidden, one roll per prize. No new SQL (uses `ctf_t_send_items`).

---

## 31.2.0 — Bits ↔ bytes questions, waiting room shows only ticked teams

- binary-pool.js: new bits ↔ bytes questions ("How many bytes is 32 bits?", "How many bits are in 4 bytes?", several wordings, 1–64 bytes). They appear in the Duel Arena BINARY type, Binary vocab battles and brackets, and the Byte Bounty Module 3 boss (now 11 random binary questions per load).
- waiting-room.js: in Team Battles and Vocab Battles the waiting room lists only the teams ticked to play, and the "here" count leaves the others out. Unticked teams are named under "Sitting out". The battle and its final results already used only ticked teams.

---

## 31.1.0 — Binary concept questions

- binary-pool.js: the Binary set now mixes 8-bit conversions with concept questions, each with several wordings and fresh random numbers every load: highest value and how many values for N bits or N bytes (e.g. 4-byte), even or odd from a pattern like ? ? ? 1, the number before or after a binary value (rollovers like 111 → 1000 included), and fewest bits needed for a number.
- duel.html (Duel Arena BINARY type), vocab-battle.html and bracket.html (Binary set) use the new mix. Labels now read "Binary" instead of "Binary conversion".
- Byte Bounty (AP CSP): the Module 3 boss gets 10 new random binary-concept multiple-choice questions each time the page loads. No new flags, so no answer-key or manifest changes.

---

## 31.0.0 — Byte Message simulator

- New page simulators/bytemessage.html: the Text ↔ Binary (ASCII) converter as its own simulator (step-by-step per character, flip output to input, ASCII table, binary rain background). Free play, no XP.
- simulators/index.html: Byte Message card under Data Representation, after Code Points.

---

## 30.5.0 — Text ↔ Binary (ASCII) converter

- practice/binary-conversion.html: new Text ↔ Binary (ASCII) section below the quiz. Type text or binary and each character is shown step by step (ASCII code, place-value sum, 8-bit grid), with a button to flip the output back into the input. Flags non-ASCII characters, bytes over 8 bits, and codes past 127. Includes a collapsible ASCII table (32–126).
- practice/index.html: Binary Conversion card mentions the converter.

---

## 30.4.2 — Jeopardy import cell

- Tools page, Jeopardy Question Builder: import (and the paste fallback) now starts at cell **B1**, not C1. Only column A holds the game's labels.

---

## 30.4.1 — Cyber 1 Unit 3 vocab from the Phishing Pre-Assessment

- cyber1/vocab-data.js Unit 3 (Social Engineering): +11 terms: Tailgating, Piggybacking, Dumpster Diving, Authority, Urgency, Curiosity, Red Flag, Link Hovering, Multi-Factor Authentication (MFA), Awareness Training, Healthy Skepticism. They flow into the Vocabulary Lab, the Unit 3 vocab flag, and vocab duels/battles/brackets. (Phishing through Shouldering were already on the list.)

---

## 30.4.0 — Skip page transitions

- A11Y panel: new **Skip page transitions** checkbox. It turns off the page-load intros (NEMESIS glitch, ADA packet screen, ORACLE consensus screen) for that student on this device, without hiding backgrounds or other animation. Reduce motion still skips them too (the box shows ticked and locked while Reduce motion is on).
- New `window.SITE_SKIP_TRANSITIONS()`; stored as `localStorage['course-transitions']`.

---

## 30.3.0 — Reduce motion turns off backgrounds

- With Reduce motion on (A11Y panel or the OS setting), every decorative background is hidden and pages show their plain solid color: battle/bracket/raid backgrounds, the binary rain on the Binary Conversion page, the code rain on secret/honeypot pages and buttons, the leaderboard and summit effects, and the NEMESIS takeover rain. Body background images are dropped too. Toggling it applies right away.
- New `siteDecor` class: any future background layer with it is hidden the same way.

---

## 30.2.1 — Binary page background

- practice/binary-conversion.html: slow "binary rain" background (columns of 0s and 1s that drift and flip), faded behind the content, green in both themes. Holds still with reduce-motion on.

---

## 30.2.0 — Binary team battles + brackets

- vocab-battle.html: new **Question set** pick, Vocab or **Binary conversion**. Binary battles use the same teams, pairing, health and KOs; every question is a random 8-bit decimal→binary or binary→decimal conversion and students type the answer (no puzzle disguise). Rematch keeps the set.
- bracket.html: new **Binary** game next to Vocab / Flags (best of 3, typed conversions, 4 hits to KO).
- vocab-duel.html + bracket-play.html show binary questions as "QUESTION · type the answer".
- New `binary-pool.js` (the question set).
- SQL: **re-run `vocab-duels.sql`**: `_vd_modes` accepts `plain`, `_vd_pool` accepts 1–2 digit answers, `ctf_t_vd_state` returns the session's puzzle types (so Rematch keeps them for vocab battles too). New install-check run-order row.

---

## 30.1.0 — Binary questions in the Duel Arena

- duel.html: new BINARY question type next to MIX / SCENARIOS / VOCAB. Each round is a random 8-bit decimal→binary or binary→decimal conversion with four choices (wrong answers are one-bit flips, ±1, or reversed bits). The module picker is ignored for this type. Works for any course.

---

## 30.0.0 — Binary Conversion practice

- New page practice/binary-conversion.html: worked decimal→binary and binary→decimal examples, unlimited random practice (mixed or one direction, work shown after each check), and a 10-question quiz (5 each direction, shuffled, random 8-bit values) that requires the student's name and shows it on the results.
- Linked from the Practice index.

---

## 29.2.0 — Class duels always use the waiting room

- battle.html, vocab-battle.html, raid.html: Start reads "Open waiting room" until the room is open, then "Start · 10 s countdown". Without waiting-room.sql the pages still start directly.

---

## 29.1.0 — Cyber Engagement logo

- New site logo (CRT monitor "CE" + CYBER ENGAGEMENT pixel wordmark) on the portal home, drawn in HTML so it follows light/dark.
- Browser-tab icons on every page: the site mark on site-wide pages, a per-course monitor badge (C1 / C2 / C3 / CSP / W3 in the course color) on course pages. Files in `assets/logo/`.
- `assets/logo/`: google-oauth-120.png (Google sign-in consent screen), ce-logo-dark.png / ce-logo-light.png (2560 px, certificates and posters), icon-site-256.png.

---

## 29.0.0 — Class duel waiting room

- **lobby.html** (students): "Class Duel" link on every course home. Shows your squad, every team with who's in the room, and what's coming up. When the teacher presses Start, a 10-second countdown runs on every screen, then everyone is sent into the battle (Team Battle → arena, Vocab Battle → duel room, Boss Raid → raid page). `lobby.html?demo=1` previews it.
- **Teacher:** battle.html, vocab-battle.html and raid.html get a Waiting room card (open / close, live head count per team). With the room open, Start becomes "Start · 10 s countdown" (shared `waiting-room.js`).
- Glowing "WAITING ROOM OPEN · JOIN" call-out on course home, CTF page and profile. Latecomers still get the "Your team needs you" call-outs; those now show on the profile too.
- SQL: new `supabase/waiting-room.sql` (step 48).

---

## 28.2.0 — Teacher dashboard redesign

- **teacher.html rebuilt** with the new layout: grouped sidebar, header with jump-to box and Launch menu, Run class tiles on Summary, student search, Integrity badge. Every link, RPC and tab from the old page carried over (audited by script).
- `teacher.html?demo=1` previews the dashboard with sample data, no sign-in.
- Old version kept in `claude only/teacher-old-28.0.html`; `teacher2.html` removed.

---

## 28.1.0 — Teacher dashboard navigation

- teacher.html: the 19 tabs are grouped into six sections (Overview, Students, CTF, Vocab, XP & Rewards, Settings) with sub-tabs; each section remembers its last tab.
- The 11 header links are now two menus: **Live games** (Team Battle, Vocab Battle, Boss Raid, Duel Bracket, Duel Arena, Live Pulse, Duel Spectator, End all duels) and **Tools** (Certificates, Install Check, Teacher Resources).
- "Locks & Guide" is now "Locks, Guide & Duels" under CTF.

---

## 28.0.0 — Class boss raid

- **Boss raid** (raid.html, teacher projector): the whole class vs the course guide (NEMESIS / SPECTER / ADA / ORACLE). Teacher sets HP, modules, puzzle types and a 5/10/15-minute clock.
- **raid-play.html** (students): everyone gets their own vocab puzzle. Correct = 10 damage; wrong = 4 off the shared class shield. Phase 2 at 66% (30 s terms), phase 3 at 33% (decrypt only, 20 s). One random 15 s weak point (3×). Enraged in the last minute (2× both ways). Guide taunts, damage leaderboard, live feed, combo meter.
- Win: everyone who hit +15 XP, top damage +10 more. Loss: +5 for playing.
- Glowing JOIN RAID call-out on the CTF page and course home. `raid.html?demo=1` previews a raid.
- SQL: new `supabase/raids.sql` (step 47).

---

## 27.0.0 — Duel brackets + animated backgrounds

- **Duel brackets** (bracket.html, teacher): tick squads or individual students; everyone plays as an individual, seeded by current XP, top seeds get byes up to 4/8/16/32. Flag or Vocab, best of 3. Flag game = race to 3 flag points on flags you haven't captured (out of open flags → vocab tiebreak). Vocab game = normal 4-hit fight. Matches start when both players are on the page; 60 s no-show = forfeit. First-round losers play a consolation bracket. Rewards: champion +25, runner-up +15, semis +10, consolation champ +10, everyone else who played +5. Bracket Champion badge on profiles.
- **bracket-play.html** (students): live match, vocab fights, bracket tree. CTF arena shows a focused race panel during flag games and a glowing call-out when a match is ready; course home shows a bracket announcement.
- **battle-bg.js**: animated backgrounds (code rain, neon grid, hex circuits, aurora, course themed: NEMESIS glitch / ADA packets / ORACLE blocks). Teacher picks one per page type in teacher.html → Duels → Battle backgrounds. Still frame with Reduce motion.
- SQL: new `supabase/brackets.sql` (step 46).
- `bracket.html?demo=1` previews a bracket.

---

## 26.3.0 — Duel engagement

- **Flag Duels take up to 6 players.** **Bounty:** a capture that takes you past the leader (3+ pts) pays +1.
- **Vocab Duels take up to 4.** 2 players = classic 1v1; 3–4 = a 5-minute **brawl** of rotating 1v1s, most KO points wins (+10, everyone who fought +5).
- **Revenge / Bounty KOs** (brawls + class vocab battles): KO the player who KO'd you, or KO the sole leader (2+), for +1 KO point each.
- battle-fx.js: **final 30 seconds** guide call-out + heartbeat sound + red pulse; **combo meter** (×3 / ×5 / ×10) for your own streak; comeback alerts voiced by the course guide; BOUNTY / REVENGE banners.
- **Duel record** card on profiles (Flag + Vocab W–L, last 8 duels) and **Weekly Duel Champion** (most duel wins in the class that week; ties share).
- **Duel Spectator** (duel-watch.html, teacher): every live student duel in the class on one projector screen with call-outs. Linked from teacher.html. `?demo=1` previews it.
- SQL: new `supabase/duel-record.sql` (step 45). **Re-run `arena-duels.sql` and `vocab-duels.sql`.** New install-check run-order row.

---

## 26.2.0 — Pick puzzle types

- Vocab Battles (teacher) and Vocab Duels (host) choose which puzzle types appear: Cipher, Scramble, Decrypt, Word bank (any 1–4; default all). Rematch keeps them.
- SQL: `vd_sessions.modes`; `ctf_t_vd_start` / `ctf_vd_create` take `p_modes text[]`. **Re-run `vocab-duels.sql`.** Install-check run-order row now checks for it.
- vocab-duel.html loads scripts with the site version tag (was stuck on 24.0.0).

---

## 26.1.0 — Guide call-outs + vocab disguises

- battle-fx.js: during a team battle the course guide (NEMESIS / SPECTER / ADA / ORACLE) announces Double Points: incoming, 5-4-3-2-1, ACTIVATED, and OVER (voice on the projector page when SFX is on).
- Vocab Duels + class Vocab Battles: each term is randomly a Caesar cipher, scrambled tiles, a **decrypt** board (letters leak after 8s, one every 2.5s, never the last one), or a **word bank** (the term + 3 others). Answers are still checked as text on the server. **Re-run `vocab-duels.sql`.**

---

## 26.0.1 — Squads board fix

- Re-running `google-auth.sql` replaced `ctf_t_roster` with a version without `group_id`, so the Squads board showed every student as "Not on a squad" (standings still counted them) and moves looked unsaved. google-auth.sql now keeps `group_id`; new install-check run-order row "class-groups.sql must run after google-auth.sql".
- SQL fix: ending a team battle / vocab battle failed with `record "p" is not assigned yet` (a loop variable named `p` clashed with a table alias). Fixed in `team-battles.sql` (`_tb_finish`) and `vocab-duels.sql` (`_vd_finish_duel`, `_vd_finish_class`).
- teacher.html: squad moves show "✓ Saved" or the real error; Remove reports failures.

---

## 26.0.0 — Pick teams + saved team sets

- **Pick which teams play:** battle.html and vocab-battle.html list each squad with a checkbox. Tick 2–4; unticked squads (and students without a squad) sit out. Rematch keeps the same teams.
- **Saved team sets:** "Save current teams…" stores every student's squad under a name; "Load" puts them back (recreating squads by name). On both battle pages and teacher.html → Squads.
- battle.html / vocab-battle.html show the real error instead of "Loading…" forever when setup can't load.
- SQL: new `supabase/squad-sets.sql` (step 44). **Re-run `team-battles.sql` and `vocab-duels.sql`**: `ctf_t_tb_start` / `ctf_t_vd_start` take `p_groups uuid[]` (new install-check run-order row).
- New shared `team-picker.js`.

---

## 25.1.0 — Battle arena

- **Battle arena view** on each course's ctf.html: while a team battle or flag duel is live, the page shows only a big scoreboard (team/player bars, clock, your points, Exit) and that battle's modules, opened. "Full CTF page" switches back for that battle; "Arena view" in the top bar returns.
- **Live battle announcement** on each course home: a glowing card at the top while a team battle, class vocab battle or flag duel is on, linking to the arena (`ctf.html#arena`) or the duel room.
- ctf.js exposes `CTF.render()` and honors `window.CTF_FOCUS`.

---

## 25.0.0 — Rename classes

- teacher.html: **✎ Rename** button next to the class name. Only the class owner can rename.
- New SQL: `supabase/class-rename.sql` (`ctf_t_rename_class`), step 43 in both install checks.

---

## 24.0.0 — Battle hype

New shared **battle-fx.js** adds game-show effects to every battle page: Team Battles (battle.html), Vocab Battle (vocab-battle.html), Flag Duels (arena-duel.html), Vocab Duels (vocab-duel.html), and the arena score bar.

- **Live moments:** First Blood, lead-change banners ("RED TAKES THE LEAD!"), ON FIRE streaks (3 in a row), Comeback Alert (a team that was 40%+ behind gets within 10%), Final Minute banner with a pulsing clock, and a big center countdown for the last 10 seconds.
- **Sports-caster ticker** with play-by-play lines on capture, lead change, streaks and the final horn.
- **Visuals:** score bars and player cards shake on a score change, the capture feed pops in with player avatars (and equipped pets), the screen edge glows in the leader's color, and confetti plus a podium results card at the end.
- **Double Points (Team Battles only):** one random 30-second window per battle, announced 10 seconds ahead. Captures inside it score x2 and are marked x2 in the feed. Students see a DOUBLE POINTS badge on their arena bar.
- **End of match:** podium, MVP spotlight, awards (Fastest capture, Most hard flags, Clutch capture in the final minute; Iron Will for most vocab fights), Rematch button (same teams, modules and length) and Full screen for the projector.
- **Vocab duels:** boss-style segmented HP bars with a damage trail and floating damage numbers, K.O. / VICTORY banners, low-health edge glow.
- **Sound (projector pages only):** in-browser synth sound effects and a beat that speeds up in the final minute. SFX and MUSIC toggles in the header (saved per device). Students never get sound.
- Reduce-motion turns off shaking, slams, confetti and pulsing; every banner is also announced to screen readers.
- **SQL:** re-run `supabase/team-battles.sql` (Double Points column, awards, feed avatars) and `supabase/arena-duels.sql` (feed avatars). Install check row "team-battles.sql must be the 24.0 version" confirms it.

---

## 23.4.1 — Teacher on every weekly board

- The THIS WEEK board now counts a teacher account's captures and XP grants from every period of that course, so the teacher shows up on each class's weekly board (still unlabeled). Before, the weekly board only counted captures made in that exact class, while the overall board was mirrored.
- **Re-run `supabase/board-leaderboard-weekly.sql`.**

---

## 23.4.0 — Free Cyberpunk skin

- New free **Cyberpunk (class default)** skin in the Coin Shop Skins tab. It keeps the course pages and profile in their original neon look and gives vocab quizzes a matching cyberpunk palette (light + dark). Costs 0 coins; press FREE once, then it equips. The old free Default is now labeled **Default (Chunky Pop)**.
- **Re-run `supabase/coins-cosmetics.sql`** (adds `s_cyber` at price 0).

---

## 23.3.1 — Free Kick: jumpy wall

- On the World Cup kick (level 6), the defensive wall shuffles sideways in sudden, random bursts, so the gap keeps moving.

---

## 23.3.0 — Free Kick reward game

- New **Free Kick** skill booth on the Reward Big Top (reward.html + carnival.html), next to Penalty Shot, Stacker and the others. Six kicks (Rookie → World Cup): a target sweeps across the goal, the keeper moves faster and grows each level, and a defensive wall of 2–5 players appears from kick 2. Kick high over the wall or wide of it, and away from the keeper. A save or a block ends the run. Uses the shared six-tier prize ladder, difficulty setting and Whole class option.

---

## 23.2.0 — Drag-and-drop squads

- teacher.html → Squads → Members: each student is a card showing their real name (from the class roster), Google login and hacker name, plus XP. Drag a card onto a squad, or onto Not on a squad, to move them. The card moves right away and the standings refresh. The dropdown on each card still works without a mouse.

---

## 23.1.2 — Duel links on course home pages

- Each course's home page (Course Tools, under the CTF link) now has **Flag Duel** and **Vocab Duel** links to arena-duel.html / vocab-duel.html for that course.

---

## 23.1.1 — Coin Shop skin cards

- Quiz skin cards put the skin name on its own line above the PREVIEW and buy buttons, so long names (Arcade Neon, Quest / RPG, Hacker Ops…) no longer squash under the buttons.

---

## 23.1.0 — AP CSP Creative Commons flags

- Module 3 (Digital Media Processing), right after Bits & Bytes:
  - `ap-m3-cc-pick` "Pick the License": Easy / Medium / Hard text flags, each asking which Creative Commons license is most appropriate for a scenario (CC0, CC BY-SA, CC BY-NC-ND).
  - `ap-m3-cc-match` and `ap-m3-cc-match2`: four scenarios each, matched to the most appropriate license.
  - `ap-m3-cc-order`: order five licenses from most to least open.
- All four map to the Objective "Explain how the use of computing can raise legal and ethical concerns." Answers added to answers.local.js.

---

## 23.0.1 — Cyber 3 objectives

- The 8 Cyber 3 text flags (24 tiers) now name the course Objective each tier maps to, taken from the module objectives on cyber3/index.html.

---

## 23.0.0 — Vocab Duels

**SQL:** run `supabase/vocab-duels.sql` (new, #42), then re-run `install-check.sql`.

- New `vocab-duel.html`, styled in the course guide's arena look (SPECTER / NEMESIS / VECTOR / ADA / ORACLE). The arena's duel card now offers **Flag Duel** and **Vocab Duel**.
- Each round shows a definition with the term disguised as a Caesar cipher (shift shown) or scrambled letter tiles. Both players race on the same term. The first correct answer hits the opponent for 25% (4 hits = KO), and a wrong guess costs the guesser a third of a hit. A term nobody cracks in 45 s is swapped. Answers are checked on the server.
- **1v1:** a student picks modules and shares a 4-letter code. Winner +10 XP, both +5 for finishing, forfeit = no XP.
- **Class Vocab Battle** (teacher only, `vocab-battle.html`, linked from the teacher.html header and Locks & Guide): squads (2–4) for 5–45 min (default 15). Students on the page are paired at random with someone from another team, get a new opponent after each KO, and every live pair gets a different term. An odd player out waits for the next free opponent.
- Team score is KOs ÷ teammates who fought. Winners +10 XP, every fighter +5, MVP = most KOs per team. The projector shows team bars, live fights (health only, never the term), a KO feed and top fighters. Players can exit any time (no XP).
- **End all duels** also ends vocab duels and battles.

---

## 22.1.1 — Cyber 1 content fixes

- `c1-m1-1.4-mindsets` Easy tier is now 50 points (was 100).
- Module 12 (Test Experience) has a vocab challenge, `c1-tx-vocab`, drawing from the whole course's vocabulary.
- The 22 Module 1 warm-ups, extension, performance task and Module 11 quick reviews now name the course Objective they map to.

---

## 22.1.0 — Battle clock + exit any time

**SQL:** re-run `supabase/team-battles.sql`.

- Every team battle has a clock. The "No clock" option is gone, and a battle started without a length runs 15 minutes (the new default on battle.html).
- Players can exit at any time from the arena's top bar: **Exit battle** (team battles), **Forfeit** (live flag duel) or **Leave** (duel lobby). A player who exits a battle stops scoring, drops out of the team average and gets no battle XP.
- The projector lists players who exited last on each team.

---

## 22.0.0 — Team Battles

**SQL:** run `supabase/team-battles.sql` (new, #41), then re-run `install-check.sql`.

- New teacher page `battle.html` (projector scoreboard), opened from the teacher.html header or **Locks & Guide → Team battle**.
- Teams are your squads (2–4). **Randomize teams** deals the whole class into 2, 3 or 4 random teams and creates Team A–D if needed. Start is blocked until every student is on a team.
- The teacher picks modules and a length (5 / 10 / 15 / 20 / 45 min, or no clock). Starting turns Squads on, ends student flag duels in that class, and pauses new ones until it finishes.
- Captures in those modules score Easy 1 / Medium 2 / Hard 3. Team score is the team's points divided by teammates who captured at least one flag.
- The projector shows big team bars, the timer, the current leader per team and a live capture feed. Students get a team scoreboard bar on the arena (team averages + their own points).
- At the end, players who captured a flag get +5 XP and the winning team's players +10 more (ties share). Each team's top scorer is its MVP. End & award or Cancel (no XP) any time.
- **End all duels** also cancels live team battles.

---

## 21.0.0 — Student Flag Duels

**SQL:** run `supabase/arena-duels.sql` (new, #40), then re-run `install-check.sql`.

- New `arena-duel.html` (Duel room) + `arena-duel.js`. A **Flag Duel** card sits above every course's arena.
- The host picks one or more modules and a 2, 5 or 10 minute clock and gets a 4-letter code. Up to 3 classmates join with it, and the host presses Start (2 players minimum).
- Each player sees their own open flags in those modules. Captures score duel points (Easy 1 / Medium 2 / Hard 3) on top of normal XP, and only flags the player hadn't captured count.
- During a duel the arena shows a top bar with every player's points and the timer.
- When time runs out, every finisher gets +5 XP and the top scorer(s) +10 more (ties each get +10). Leaving, or closing every arena/duel tab for 90 seconds, forfeits.
- Blocked while the student has a vocab quiz open, and for a player with no open flags in the picked modules.
- teacher.html → Locks & Guide: per-class on/off switch (on by default) and a live/finished duel list. **End all duels** now also ends student flag duels.

---

## 20.2.0 — End all duels

**SQL:** re-run `supabase/duels.sql` (adds `ctf_t_duel_end_all`).

- teacher.html header has an **End all duels** button. It cancels every live duel in all your classes and releases any student stuck on the duel screen. No XP is awarded.

---

## 20.1.1 — Stuck duel fix

**SQL:** re-run `supabase/duels.sql` (clears stuck duels right away).

- If duel.html is closed without ending the match, the duel used to stay live forever, and both students got the duel pad on every CTF and profile page load. Live duels with no new round for 15 minutes now cancel themselves.
- The duel pad has a "Not in a duel? Close this" button, so a student is never stuck behind it.

---

## 20.1.0 — Skins on course pages

- A student's equipped skin now also restyles that course's home, CTF, Vocab Lab, syllabus and news pages (plus profile and quizzes, as before). It only applies in the course where it was bought.
- Hidden flag pages, site-wide pages, simulators and the NEMESIS takeover keep their own look. High-contrast mode still overrides the skin.

---

## 20.0.0 — Teacher plays in every class

**SQL:** run `supabase/teacher-mirror.sql` (new, #39). Then re-run `install-check.sql` so install-check.html shows it.

- A teacher plays the CTF once per course and appears on the leaderboard of every class they own in that course with the same XP and solves. Rows in the other periods are created automatically on the next sync, with the same hacker name.
- The teacher row isn't marked as a teacher anywhere students can see.
- Teacher rows never get module clears, Mentor/Vanguard ranks, Clear Crates, Coin Packs or other reward items.
- Flag captures stay logged only in the class played in, so other periods' Flag Analytics aren't affected.

---

## 19.1.0 — Teacher quiz skins

- teacher.html → Assigned Vocab Quizzes has a **Quiz skin** picker. Every skin is free for teachers and saved on that device. Student view demo and Preview open in the chosen skin.

---

## 19.0.1 — Guest mode re-run loop fixed

**SQL:** re-run `supabase/install-check.sql` (so install-check.html uses the fixed checks), then `multi-domain.sql`, `allowed-emails.sql`, `guest-mode.sql` once in that order.

- The multi-domain and allowlist checks only read `_is_school()`. After guest mode turns that into a wrapper around `_is_school_member()`, they reported "re-run" even though nothing was wrong, and re-running them switched guest mode off. The checks now read both functions.
- `multi-domain.sql` and `allowed-emails.sql` now restore the guest-mode wrapper when guest mode is installed, so re-running them no longer turns it off.

---

## 19.0.0 — Quiz skins

**SQL:** re-run `supabase/coins-cosmetics.sql` (adds the `skin` slot and the five skin prices). `install-check.html` row #38 confirms it.

- `quiz.html` restyled in Lexend with the new **Default** look (Chunky Pop): bold outlines, pressable buttons, a progress bar in the sticky header. Light and dark versions follow the site toggle.
- Selected multiple-choice answers show a check and the word "Selected"; dropdowns with an answer get a heavier outline; results mark misses with ✗ and a perfect score with ✓. Nothing relies on color alone.
- New `skins.js`: five reward skins (Arcade Neon, Quest / RPG, Hacker Ops, Sky Sticker, Mastermind), each with a light and dark palette.
- Coin Shop → **Quiz skins** tab (20 coins each). A skin applies to that course's quizzes and profile page. PREVIEW tries a skin on the profile before buying, and a sample-quiz link opens `quiz.html?demo=1&skin=…`. **Default** is free and always one click away.

---

## 18.0.0 — 2026-10-13
- New SQL: `supabase/progress-grids.sql` (run #37). Private progress monitoring grids, replacing the shared Google Sheet. Tables have RLS with no policies; students reach only their own row through RPCs tied to their Google account.
- Student profile (every course): "My Progress" card. Set each task to Working / Have Question / Stuck / Need Help / Need Check / Done with an optional note, a daily check-in ("No changes today"), progress bar, due date, and a personal history.
- teacher.html: new "Progress Grids" tab. Create grids (task code + short title per line, optional due date), open/close, and view the whole class as a color grid with Stuck / Need Help, Have Question, and Need Check lists at the top, an Overdue list after the due date, who has checked in today, a day-by-day history, CSV export, and click-any-cell to set a student's status (e.g. Done after checking).
- Vocab quiz builder: "+ Include additional terms" toggle (Cyber 2 non-focus terms, Web3 "Additional Terms" module).
- Group filter (All / each group / Ungrouped) on quiz results (table, most-missed terms, average, CSV) and on progress grids (alerts, grid, CSV).
- "Copy to…" on quizzes and grids: copies to other classes of the same course (new `vq_t_copy` / `pg_t_copy`, re-run both SQL files).
- Quiz "Preview": opens the real quiz settings and pool as a student would see it (`quiz.html?demo=preview`, nothing saved). Grid "View as student" preview.
- Summary tab: "Assigned work" card with open quizzes (turned in / not started / average) and open grids (checked in today, stuck, questions, need check).
- Course home: glowing "Daily check-in" card while an open grid hasn't been checked in today.
- Teacher tabs: open quiz results and open progress grids refresh themselves every 45 seconds (paused while typing, while a dialog is open, or when the tab is hidden). "Copy names" buttons for students who haven't started a quiz or haven't checked in today. Esc closes the cell editor, Copy to…, and student-view dialogs.
- quiz.html: quizzes must be taken in Google Chrome (other browsers see a message and can't start). Focus on a dropdown list is never counted as leaving the screen.

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

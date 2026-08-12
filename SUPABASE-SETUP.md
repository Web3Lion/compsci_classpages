# Supabase setup — student login, progress sync & cheat logging

The site works **with no setup at all**: leave `supabase-config.js` blank and every
arena behaves exactly as before — progress lives in the browser, no login, no sync.

Filling in Supabase turns on:

- **Student sign-in** on each CTF page (class code → anonymous handle → 4-digit PIN)
- **Cross-device progress** — same handle + PIN restores a student's XP, streak & badges anywhere
- **Cheat-event logging** — paste, focus-loss, honeypot, copy and devtools events land in a table you can read (they never cost the student XP)

Streaks stay **per course** and **Mon–Fri** (weekends neutral); the `classes.frozen_dates`
column is already there for the teacher streak-freeze we'll wire up next.

---

## 1. Create the project
1. Go to **supabase.com** → new project. Pick a region near you; save the database password.
2. **Project Settings → API**. Copy two values:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (a long `eyJ…` string)

The anon key is safe to ship in the browser — the database is sealed behind
row-level security and only the four `ctf_*` functions are reachable.

## 2. Run the schema
1. Open **SQL Editor** in Supabase → **New query**.
2. Paste the entire contents of `supabase/schema.sql` → **Run**.
   This creates the tables (`classes`, `students`, `progress`, `cheat_events`),
   locks them with RLS, and installs the `ctf_join` / `ctf_sync` / `ctf_cheat` functions.
3. Then run the rest, **in this order**, pasting each file's contents the same way:

   | # | File | Adds |
   |---|------|------|
   | 1 | `google-auth.sql` | Google sign-in, teacher identity |
   | 2 | `teacher-reports.sql` | Roster, flag captures, attendance |
   | 3 | `class-gates.sql` | Module/flag locks, guide + answer-key + Ultimate Flags switches |
   | 4 | `answer-key.sql` | Sealed answer key |
   | 5 | `attempt-log.sql` | Wrong-guess log, time-to-solve outliers |
   | 6 | `item-analysis.sql` | Per-flag attempt/abandonment analytics (needs attempt-log.sql) |
   | 7 | `class-groups.sql` | Teacher groups |
   | 8 | `squads.sql` | Student-facing squads (needs class-groups.sql) |
   | 9 | `objectives.sql` | Objective mastery reporting (needs class-gates.sql + squads.sql) |
   | 10 | `pioneer.sql` | First-in-class capture bonus |
   | 11 | `vocab-log.sql` | Vocab time on task |
   | 12 | `vocab-sessions.sql` | Per-run vocab audit trail |
   | 13 | `roster-csv.sql` | CSV roster, move/remove students |
   | 14 | `teachers.sql` | Multiple teacher accounts |
   | 15 | `multi-domain.sql` | Student sign-in from the second domain |
   | 16 | `allowed-emails.sql` | Extra allowed emails outside both domains (must be run AFTER multi-domain.sql, always) |
   | 17 | `teacher-xp.sql` | Teacher-granted bonus XP |
   | 18 | `hardmode-log.sql` | Arena mini-game run log |
   | 19 | `hint-log.sql` | Hint-used tracking per flag |
   | 20 | `target-warmup.sql` | Day-1 "Are You a Target?" warm-up |
   | 21 | `signin-log.sql` | Logs rejected sign-ins (wrong domain), so you can see what a new student domain actually is |

   **Order matters in several places** (each is a case of two files redefining the
   same function, where the one that runs LAST wins):
   - `class-gates.sql` needs `teacher-reports.sql` already in place.
   - `answer-key.sql`, `attempt-log.sql`, and `objectives.sql` all need `class-gates.sql`.
   - `item-analysis.sql` needs `attempt-log.sql`.
   - `squads.sql` needs `class-groups.sql`; `objectives.sql` must run after BOTH
     `class-gates.sql` and `squads.sql`.
   - `teachers.sql`, `multi-domain.sql`, `teacher-xp.sql`, `hardmode-log.sql`,
     `hint-log.sql`, and `target-warmup.sql` all need `google-auth.sql` already run,
     and must be **re-run** any time you re-run `google-auth.sql` or `schema.sql`
     later — those two redefine shared functions and silently drop the later add-ons'
     changes (lockable symptoms: added teachers lose dashboard access, second-domain
     students get rejected, granted bonus XP vanishes on next sync).
   - `allowed-emails.sql` must run after `multi-domain.sql`, always — re-running
     `multi-domain.sql` later silently drops the allowlist.

4. **Check your work at any time:** paste the contents of
   `supabase/check-installed.sql` → **Run**. It lists every add-on with
   ✅/❌ and flags the run-order problems above. It only reads the catalog and
   changes nothing.

## 3. Turn it on in the site
Edit `supabase-config.js` and paste your two values:

```js
window.SUPABASE_CONFIG = {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOiJI..."
};
```

Commit & push. The login gate now appears on every CTF page.

## 4. Create your classes
Use the **teacher page** (`teacher.html`, Google sign-in as the teacher email
configured in `schoolDomains`/`google-auth.sql`) to create classes, generate
codes, lock modules/flags, toggle the course guide, answer key, and Ultimate
Flags, and set streak-freeze dates — no manual SQL needed for day-to-day use.

If you ever need to add a class by hand instead, `course` must be one of
`cyber1`, `cyber2`, `cyber3`, `apcsp`, `web3`:

```sql
insert into classes (course, name, code) values
  ('cyber1', 'Cyber 1 · Period 1', 'CY1-P1-7F3K'),
  ('apcsp',  'AP CSP · Period 3',  'CSP-P3-2K8R');
```

Hand each class its code. Students pick their own handle + PIN the first time.

---

## How students log in
- **First time:** class code + a new handle + a PIN they choose. Creates their spot.
- **Returning / new device:** same class code + same handle + same PIN → progress restored.
- **Wrong PIN on an existing handle** is rejected (so no one can hijack a name).
- Handles are checked for school-appropriateness in the browser before submit.

The gate only appears on the **CTF pages** — landing/syllabus/news pages stay open.

## Reading progress & cheat events (until the dashboard exists)
In the SQL Editor:

```sql
-- class leaderboard
select s.handle, p.points + p.bonus as xp, p.solved_count, p.total_count, s.last_seen
from students s join progress p on p.student_id = s.id
where s.class_id = '<class-uuid>'
order by xp desc;

-- recent integrity events for a class
select handle, kind, detail, created_at
from cheat_events
where class_id = '<class-uuid>'
order by created_at desc
limit 100;
```

Cheat kinds: `paste`, `focus` (left the tab), `canary` (AI honeypot tripped),
`copy`, `devtools`. **Looking things up is allowed** — these are for your visibility
only and never reduce a student's score.

## Resetting a PIN a student forgot
```sql
-- set their PIN to 0000 (sha256 of "0000"); tell them to change... (no change UI yet,
-- so just pick a temporary PIN with them and update the hash)
update students set pin_hash = encode(digest('1234','sha256'),'hex')
where class_id = '<class-uuid>' and lower(handle) = lower('<handle>');
```

---

## Next up (planned)
- **Student-changeable PIN** from their own profile page (currently a teacher-only reset via SQL or the teacher page).
- **Broader Google Workspace domain coverage** beyond the two configured domains, via `allowed-emails.sql`, as new needs come up.

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
   | 2 | `class-gates.sql` | Module/flag locks, guide + answer-key switches |
   | 3 | `answer-key.sql` | Sealed answer key |
   | 4 | `teacher-reports.sql` | Roster, flag captures, attendance |
   | 5 | `attempt-log.sql` | Wrong-guess log, time-to-solve outliers |
   | 6 | `class-groups.sql` | Teacher groups |
   | 7 | `pioneer.sql` | First-in-class capture bonus |
   | 8 | `vocab-log.sql` | Vocab time on task |
   | 9 | `vocab-sessions.sql` | Per-run vocab audit trail |
   | 10 | `roster-csv.sql` | CSV roster, move/remove students |
   | 11 | `squads.sql` | Student-facing squads |
   | 12 | `objectives.sql` | Objective mastery reporting |
   | 13 | `teachers.sql` | Multiple teacher accounts |
   | 14 | `multi-domain.sql` | Student sign-in from the second domain |

   **Order matters in three places.** `objectives.sql` must come after
   `squads.sql`, and both `teachers.sql` and `multi-domain.sql` must come after
   `google-auth.sql` — each pair redefines the same function, and the later one
   wins. Re-running `google-auth.sql` on its own will silently lock out every
   student on the second domain and every added teacher.

4. **Check your work at any time:** paste the contents of
   `supabase/check-installed.sql` → **Run**. It lists every add-on with
   ✅/❌ and flags all three run-order problems. It only reads the catalog and
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
Until the teacher page exists, add classes by hand in the SQL Editor. One row per
class period; `course` must be one of `cyber1`, `cyber2`, `apcsp`, `web3`.
Pick a **code** students will type (keep it short and unambiguous — avoid `O/0`, `I/1`):

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
- **Teacher page:** create/rename classes, generate codes, reset PINs, view rosters
  & cheat logs, and set **streak-freeze** dates (holidays / no-class days) — the
  `frozen_dates` column and the engine's `isSkipDay` hook are already in place.
- **Google sign-in** restricted to the school's Workspace domains — `@southfayette.org`
  for staff and `@lions.net` for students (the list lives in `supabase-config.js` as
  `schoolDomains` and in `supabase/multi-domain.sql` as `_school_domains()`; both must
  agree) — as a stronger identity option alongside anonymous handles.

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
- **Google sign-in** restricted to `@southfayette.org` as a stronger identity option
  alongside anonymous handles.

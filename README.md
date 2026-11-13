# SFHS Daily Staff Hub

**Live site:** [sfdailyhub.vercel.app](https://sfdailyhub.vercel.app)
**Office page:** [sfdailyhub.vercel.app/#office](https://sfdailyhub.vercel.app/#office) (office and admin accounts only)

The Daily Staff Hub is one page that shows South Fayette High School staff what they need to know about today: the schedule, their coverage, field trips, testing, announcements and events. It replaces the morning emails and spreadsheets that staff piece this information together from now.

Staff sign in with their South Fayette Google account and see only the information that applies to them. The main office runs everything from one Google Sheet. There is no new software to buy or install.

---

## Highlights

**For teachers**
- **One page each morning.** Today's bell schedule with the current period highlighted, A/B day, coverage, announcements, testing, field trips, early dismissals and tonight's events.
- **Personal coverage.** Teachers see only the periods they are covering, with the time, room and who they are covering. "Find my name" searches the whole coverage board.
- **Coverage emails at 7:00 AM.** A teacher pulled from a duty, Engagement or SAP period gets one email listing the period, time, assignment and room or duty post. A **Got it ✓** button lets the office know they saw it.
- **Field trips.** Teachers see which of their students are out and when. Students can be searched by name.
- **Flex Day Testing.** Search a student or a teacher to see each testing location.
- **Chill Room.** The week's status, today's announcement, the coordinator and the room, kept up to date by the Chill Room coordinator.
- **Works on phones.** On small screens, the page switches to a stacked layout with collapsible sections.

**For the main office**
- **One Google Sheet runs the hub.** Changes made in the sheet show on the hub at the next refresh.
- **Coverage tab with safeguards.**
  - Picking an absent teacher color-codes their day: green for classes, black for duties, blue for prep, red for lunch and purple for co-taught classes.
  - Picking a full-day sub fills in the teacher's classes and lunch.
  - Co-taught classes don't need a sub when only one co-teacher is out. The other co-teacher gets an FYI email, and the sub is free that period.
  - Pulling someone from their prep, lunch or a class asks "Are you sure?" before anything is sent.
- **Find a coverer sidebar.** Click a period and see who is free, with those covering the least this month listed first. Click a name to assign them.
- **Printed sub schedules.** One PDF with a page per sub, ready to print in one step. It includes periods, times, rooms, courses and any extra coverage.
- **Schedule control.**
  - A/B days, bell times, assembly days and delays come from the sheet.
  - An Override checkbox handles snow days and same-morning changes.
  - The Office page can set an override that saves to the sheet for everyone.
- **Field trip form.** Approved trips are submitted through a Google Form and posted automatically. Each trip gets a Trip ID, its roster is split by student (paste or CSV upload), and the office is emailed.
- **Home dashboard.** A Home tab with today's numbers, a list of what still needs attention, and links to every tab.
- **Built-in checks.** An email troubleshooter, a coverage email preview, and an error log of any page problems staff run into.

**For administrators**
- **Highlight posts.** Announcements with Highlight Post checked glow and stay pinned at the top.
- **Hub banner.** A one-line message at the top of the hub for all staff, set from the Settings tab.
- **Office page.** Admins and office staff can preview any day and see what every teacher will see.

---

## How information is protected

- **Sign-in required.** Only South Fayette Google accounts can see staff data, and the script checks every request.
- **Teachers see only their own coverage.** The full coverage board is limited to accounts listed as office or admin on the Settings tab.
- **Office page access** is controlled by two rows on the Settings tab: **Office preview emails** and **Admin emails**.
- **The welcome page** (before sign-in) shows only quotes, general information and a game leaderboard that stores initials only.
- **Data stays in the district.** Everything lives in the district's Google Sheet. The code repository is private.

---

## A normal morning

| Time | What happens |
|---|---|
| Before 7:00 | The office enters absences, subs and coverage on the Coverage tab. The sheet flags conflicts as they are entered. |
| 7:00 | Coverage emails go out automatically. Each teacher is told only once. If something changes later, they get an "Updated" email. |
| Morning | Office prints sub schedules (**Staff Hub → Print sub schedules**). Staff open the hub. |
| During the day | Any change in the sheet shows on the hub at the next refresh. |

---

## What runs where

| Part | Where it lives | Who updates it |
|---|---|---|
| The hub page | GitHub → Vercel (`index.html`) | Technology / project lead |
| Data | Google Sheet (Coverage, Staff, Schedule, Announcements, Calendar, Field Trips, Chill Room, Flex Testing, Settings and more) | Main office, Chill Room coordinator |
| Automation (emails, forms, sub schedules, data feed) | Apps Script attached to the sheet (`templates/Coverage Emails.gs`) | Project lead |

---

## Status and next steps

1. Finish setup in the live sheet: Settings emails, field trip form, Duty Posts locations, Chill Room tab.
2. Test field trip submission, coverage emails and printed sub schedules end to end.
3. **Pilot:** office staff and 10 teachers for two weeks.
4. Roll out to all staff after pilot feedback.

---

<sub>Questions: contact the SFHS Main Office.</sub>

// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   SUPABASE CONFIG  —  fill these two values in, then everything turns on.
   ----------------------------------------------------------------------------
   1. Create a project at supabase.com.
   2. Project Settings -> API -> copy the "Project URL" and the "anon public" key.
   3. Paste them below. (The anon key is safe to ship in the browser — the
      database is sealed behind RLS + RPCs; see supabase/schema.sql.)
   4. Run supabase/schema.sql once in the SQL editor, then seed your classes.

   Leave these blank to keep the site in LOCAL-ONLY mode: progress stays in the
   browser exactly like before, no login gate, no sync. Nothing breaks.
   ========================================================================== */
window.SUPABASE_CONFIG = {
  // Google sign-in: any address on these domains may join a class, and only
  // the teachers table (supabase/teachers.sql) grants the dashboard.
  // First entry is the staff/primary domain.
  schoolDomains: ["southfayette.org", "lions.net"],
  schoolDomain: "southfayette.org",
  teacherEmail: "rnreasey@southfayette.org",

  // One-off external addresses allowed to sign in even though they're not on
  // either domain above (a guest teacher, an outside observer, etc). Also
  // requires: (1) supabase/allowed-emails.sql run in the database, and
  // (2) the Google Cloud OAuth consent screen set to "External" user type —
  // with "Internal" selected there, Google blocks non-Workspace accounts
  // before this list is ever checked. Managed from the teacher dashboard's
  // Settings tab once allowed-emails.sql is installed; edit here only if you
  // need to seed one before the dashboard is reachable.
  allowedExternalEmails: [],

  url: "https://nbyuwsvtnnpsymmzpkqs.supabase.co",       // e.g. "https://abcdefgh.supabase.co"
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieXV3c3Z0bm5wc3ltbXpwa3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MTMyMTYsImV4cCI6MjEwMDQ4OTIxNn0.RaPjfaHmx3Xko6Oey8Shg5ua_pH63TVEa71snwqbbgI"    // e.g. "eyJhbGciOiJI..."
};

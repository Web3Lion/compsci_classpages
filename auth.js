// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================================
   auth.js  —  shared Google sign-in for the whole platform.

   Identity is a school Google account. Students sign in on the CTF page only;
   every other page (landing, vocab, syllabus, profile) stays open. The teacher
   dashboard uses the same sign-in and checks the email against TEACHER_EMAIL.

   Load AFTER supabase-config.js, BEFORE sync.js / profile.js / teacher code.
   ========================================================================== */
(function () {
  var CFG = window.SUPABASE_CONFIG || {};
  /* Two Google Workspace domains: staff on the first, students on the second.
     schoolDomains is the list that decides who may join a class; schoolDomain
     stays as the primary/staff domain for anything that needs just one. */
  var DOMAINS = (CFG.schoolDomains && CFG.schoolDomains.length
      ? CFG.schoolDomains
      : [CFG.schoolDomain || "southfayette.org"])
    .map(function (d) { return String(d).toLowerCase().replace(/^@/, ""); });
  var DOMAIN = DOMAINS[0];
  var EXTRA_EMAILS = (CFG.allowedExternalEmails || []).map(function (e) { return String(e).toLowerCase(); });
  var EXTRA_KEY = "ctf-extra-emails-cache";
  try {
    JSON.parse(localStorage.getItem(EXTRA_KEY) || "[]").forEach(function (e) {
      if (EXTRA_EMAILS.indexOf(e) === -1) EXTRA_EMAILS.push(e);
    });
  } catch (e) {}
  var TEACHER = (CFG.teacherEmail || "rnreasey@southfayette.org").toLowerCase();
  var ONLINE = !!(CFG.url && CFG.anonKey);

  var _clientP = null;
  function client() {
    if (!ONLINE) return Promise.reject(new Error("offline"));
    if (_clientP) return _clientP;
    _clientP = new Promise(function (resolve, reject) {
      function mk() {
        resolve(window.supabase.createClient(CFG.url, CFG.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        }));
      }
      if (window.supabase && window.supabase.createClient) return mk();
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = mk;
      s.onerror = function () { reject(new Error("supabase load failed")); };
      document.head.appendChild(s);
    });
    return _clientP;
  }

  /* Merge in the DB-backed allowlist (added via teacher.html Settings) —
     the static config array alone misses anything an owner adds there.
     Cached to localStorage so isSchool() works immediately on next load,
     before this fetch resolves. */
  (async function loadExtraEmails() {
    if (!ONLINE) return;
    try {
      var db = await client();
      var r = await db.rpc("ctf_allowed_emails_public", {});
      var list = (r && r.data && Array.isArray(r.data)) ? r.data.map(function (e) { return String(e).toLowerCase(); }) : [];
      list.forEach(function (e) { if (EXTRA_EMAILS.indexOf(e) === -1) EXTRA_EMAILS.push(e); });
      try { localStorage.setItem(EXTRA_KEY, JSON.stringify(list)); } catch (e) {}
    } catch (e) {}
  })();

  /* current signed-in user, or null */
  async function user() {
    try {
      var db = await client();
      var r = await db.auth.getUser();
      return (r && r.data && r.data.user) || null;
    } catch (e) { return null; }
  }
  function emailOf(u) { return ((u && u.email) || "").toLowerCase(); }
  function domainOf(u) { return emailOf(u).split("@")[1] || ""; }
  function isSchool(u) { return DOMAINS.indexOf(domainOf(u)) !== -1 || EXTRA_EMAILS.indexOf(emailOf(u)) !== -1; }
  function isStaffDomain(u) { return domainOf(u) === DOMAIN; }
  function isTeacher(u) { return emailOf(u) === TEACHER; }

  /* Google OAuth. We used to restrict the account chooser to a single domain
     via `hd` when no external emails were configured — but that decision is
     made synchronously at sign-in time, before the DB-backed extra-emails
     list (loaded async above) has necessarily arrived, especially right
     after a fresh page load. That race could hide the very external account
     that had just been allow-listed. Real enforcement is server-side
     (_is_school() in the SQL) plus the requireSchool() check below, so the
     account chooser is left unrestricted. */
  async function signIn(redirectTo) {
    var db = await client();
    var q = { prompt: "select_account" };
    return db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || location.href.split("#")[0],
        queryParams: q
      }
    });
  }
  async function signOut() {
    try { var db = await client(); await db.auth.signOut(); } catch (e) {}
  }

  /* Call an RPC and normalize the {error:"..."} payload our functions return. */
  async function rpc(fn, args) {
    var db = await client();
    var r = await db.rpc(fn, args || {});
    if (r.error) throw r.error;
    var v = r.data;
    if (v && !Array.isArray(v) && typeof v === "object" && v.error) throw new Error(v.error);
    return v;
  }

  /* A signed-in user on the wrong domain is signed straight back out — a
     personal gmail account must never end up holding a class row. The refusal
     is logged first (while the session still exists) so the teacher dashboard
     can show WHICH domain was turned away: that is how a mis-set allow-list
     gets diagnosed instead of guessed at. Failure to log is ignored — a missing
     signin-log.sql must never keep the sign-out from happening. */
  async function logReject(reason) {
    try {
      await rpc("ctf_log_signin_reject", {
        p_reason: reason || "wrong_domain",
        p_page: (location.pathname.split("/").pop() || "index.html")
      });
    } catch (e) {}
  }
  async function requireSchool() {
    var u = await user();
    if (!u) return null;
    if (!isSchool(u)) {
      /* The DB-backed extra-emails list may not have finished loading yet on
         a fresh page load — give it one chance to arrive before rejecting,
         so a newly-allowed external account isn't bounced by a stale cache. */
      try {
        var db = await client();
        var r = await db.rpc("ctf_allowed_emails_public", {});
        var list = (r && r.data && Array.isArray(r.data)) ? r.data.map(function (e) { return String(e).toLowerCase(); }) : [];
        list.forEach(function (e) { if (EXTRA_EMAILS.indexOf(e) === -1) EXTRA_EMAILS.push(e); });
        try { localStorage.setItem(EXTRA_KEY, JSON.stringify(list)); } catch (e) {}
      } catch (e) {}
    }
    if (!isSchool(u)) {
      await logReject("wrong_domain");
      await signOut();
      return { wrongDomain: true, email: emailOf(u), domain: domainOf(u) };
    }
    return u;
  }

  window.CTF_AUTH = {
    online: ONLINE, domain: DOMAIN, domains: DOMAINS, teacherEmail: TEACHER,
    client: client, rpc: rpc, user: user, requireSchool: requireSchool,
    signIn: signIn, signOut: signOut, isSchool: isSchool, isTeacher: isTeacher,
    isStaffDomain: isStaffDomain, domainOf: domainOf, emailOf: emailOf,
    logReject: logReject
  };
})();

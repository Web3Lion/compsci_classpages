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
  function isSchool(u) { return DOMAINS.indexOf(domainOf(u)) !== -1; }
  function isStaffDomain(u) { return domainOf(u) === DOMAIN; }
  function isTeacher(u) { return emailOf(u) === TEACHER; }

  /* Google OAuth. `hd` restricts the account chooser to a single domain, so it
     is only sent when the school HAS one domain — passing it with two would
     hide every student account. Real enforcement is server-side (_is_school()
     in the SQL) plus the check below. */
  async function signIn(redirectTo) {
    var db = await client();
    var q = { prompt: "select_account" };
    if (DOMAINS.length === 1) q.hd = DOMAIN;
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
     personal gmail account must never end up holding a class row. */
  async function requireSchool() {
    var u = await user();
    if (!u) return null;
    if (!isSchool(u)) { await signOut(); return { wrongDomain: true }; }
    return u;
  }

  window.CTF_AUTH = {
    online: ONLINE, domain: DOMAIN, domains: DOMAINS, teacherEmail: TEACHER,
    client: client, rpc: rpc, user: user, requireSchool: requireSchool,
    signIn: signIn, signOut: signOut, isSchool: isSchool, isTeacher: isTeacher,
    isStaffDomain: isStaffDomain, domainOf: domainOf, emailOf: emailOf
  };
})();

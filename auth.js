/* ============================================================================
   auth.js  —  shared Google sign-in for the whole platform.

   Identity is a school Google account. Students sign in on the CTF page only;
   every other page (landing, vocab, syllabus, profile) stays open. The teacher
   dashboard uses the same sign-in and checks the email against TEACHER_EMAIL.

   Load AFTER supabase-config.js, BEFORE sync.js / profile.js / teacher code.
   ========================================================================== */
(function () {
  var CFG = window.SUPABASE_CONFIG || {};
  var DOMAIN = (CFG.schoolDomain || "southfayette.org").toLowerCase();
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
  function isSchool(u) { return emailOf(u).endsWith("@" + DOMAIN); }
  function isTeacher(u) { return emailOf(u) === TEACHER; }

  /* Google OAuth. hd hints the school domain in the account chooser; the real
     enforcement is server-side (_is_school() in the SQL) plus the check below. */
  async function signIn(redirectTo) {
    var db = await client();
    return db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || location.href.split("#")[0],
        queryParams: { hd: DOMAIN, prompt: "select_account" }
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
    online: ONLINE, domain: DOMAIN, teacherEmail: TEACHER,
    client: client, rpc: rpc, user: user, requireSchool: requireSchool,
    signIn: signIn, signOut: signOut, isSchool: isSchool, isTeacher: isTeacher, emailOf: emailOf
  };
})();

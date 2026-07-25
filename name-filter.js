/* ============================================================================
   name-filter.js  —  shared school-appropriateness filter + per-course naming
   terms. Loaded by sync.js (identity gate), profile.js (rename), and the
   teacher page, so every path a name can enter the system through uses the
   SAME rules. Client-side filtering is a guard rail, not a guarantee — the
   teacher can always overwrite a name from the dashboard.
   ========================================================================== */
(function () {
  /* per-course word for a student's chosen display name */
  var TERMS = {
    cyber1: { term: "Hacker Name",  short: "handle", eg: "NightOwl",    blurb: "Your alias on the leaderboard. Keep it anonymous — no real names." },
    cyber2: { term: "Hacker Name",  short: "handle", eg: "GhostByte",   blurb: "Your alias on the leaderboard. Keep it anonymous — no real names." },
    apcsp:  { term: "Dev Handle",   short: "handle", eg: "PixelPatch",  blurb: "Your commit name on the board. Keep it anonymous — no real names." },
    web3:   { term: "Wallet Tag",   short: "tag",    eg: "BlockBadger", blurb: "Your tag on the public ledger. Keep it anonymous — no real names." }
  };
  function terms(course) { return TERMS[course] || TERMS.cyber1; }

  /* ---- appropriateness filter -------------------------------------------
     Normalizes leetspeak and separators first so "n1c3_try" style evasions
     collapse onto the blocklist, then rejects substrings. Not exhaustive;
     extend BLOCK as needed. */
  var LEET = { "0":"o","1":"i","!":"i","|":"i","3":"e","4":"a","@":"a","5":"s","$":"s","7":"t","8":"b","9":"g","2":"z","+":"t" };
  var BLOCK = [
    // profanity / slurs / sexual
    "fuck","shit","bitch","cunt","dick","cock","penis","vagina","pussy","tits","boob","nigg","fag",
    "retard","whore","slut","rape","nazi","hitler","kkk","porn","sex","suck","balls","ass","arse",
    "wank","jizz","cum","anal","anus","semen","horny","milf","boner","turd","douche","prick","twat",
    "hoe","thot","simp","damn","crap","piss","bastard","queer","tranny","spic","chink","kike","wetback",
    // drugs / substances
    "meth","cocaine","heroin","weed","vape","juul","bong","drunk","booze","420",
    // violence / self-harm
    "kill","murder","shoot","gun","bomb","terror","suicide","kys","stab","lynch",
    // numeric slang
    "69","666","88","xxx",
    // impersonation
    "teacher","admin","principal","nemesis","specter","moderator","official","staff"
  ];
  function normName(s) {
    s = String(s || "").toLowerCase();
    var out = ""; for (var i = 0; i < s.length; i++) out += (LEET[s[i]] || s[i]);
    return out.replace(/[^a-z]/g, "");
  }
  /* returns a human-readable problem string, or null when the name is fine */
  function nameProblem(raw) {
    var v = String(raw || "").trim();
    if (v.length < 3)  return "Pick a name at least 3 characters long.";
    if (v.length > 18) return "Keep it under 18 characters.";
    if (!/^[A-Za-z0-9 ._-]+$/.test(v)) return "Letters, numbers, spaces, . _ - only.";
    if (!/[A-Za-z]/.test(v)) return "Include at least one letter.";
    if (/(.)\1{3,}/.test(v)) return "Too many repeated characters.";
    var n = normName(v);
    if (n.length < 3) return "Use at least 3 letters.";
    for (var i = 0; i < BLOCK.length; i++) {
      if (n.indexOf(BLOCK[i]) !== -1) return "Please choose a school-appropriate name.";
    }
    return null;
  }

  /* ---- suggestion generator (course-flavored, always clean) -------------- */
  var PARTS = {
    cyber: [["Null","Ghost","Cipher","Zero","Shadow","Quantum","Iron","Neon","Silent","Crypto","Vector","Rogue"],
            ["Byte","Packet","Shell","Probe","Cache","Daemon","Socket","Kernel","Relay","Vault","Nomad","Falcon"]],
    csp:   [["Pixel","Loop","Logic","Binary","Turing","Alpha","Lambda","Delta","Nested","Recursive","Bright","Swift"],
            ["Patch","Commit","Branch","Stack","Array","Method","Parser","Builder","Runner","Debug","Compiler","Coder"]],
    web3:  [["Block","Chain","Hash","Ledger","Merkle","Genesis","Digital","Atomic","Solid","Bright","Onchain","Quantum"],
            ["Badger","Miner","Node","Oracle","Vault","Token","Wallet","Forge","Signer","Peer","Beacon","Stamp"]]
  };
  function suggest(course) {
    var set = course === "apcsp" ? PARTS.csp : course === "web3" ? PARTS.web3 : PARTS.cyber;
    var a = set[0][Math.floor(Math.random() * set[0].length)];
    var b = set[1][Math.floor(Math.random() * set[1].length)];
    return a + b + (Math.floor(Math.random() * 90) + 10);
  }

  window.CTF_NAME = { terms: terms, problem: nameProblem, norm: normName, suggest: suggest, blocklist: BLOCK };
})();

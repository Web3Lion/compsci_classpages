/* ============================================================================
   objectives.js  —  turns the "Objective — X." line already written into every
   flag prompt into something you can measure.

   Nothing in config.js had to change. Each leveled prompt opens with
   "Objective — Malware." and this file reads that back out, normalizes the
   label, and rolls captures up per objective.

   THE DRIFT PROBLEM
   282 prompts carry an objective line, but they use 196 distinct labels —
   "AAA" and "AAA Framework", "Social Engineering" and "Social engineering",
   "Malware types" and "Types of malware". Reporting on 196 things is not
   reporting. So labels are normalized in two passes:

     1. Mechanical  — case, whitespace, "Types of X"/"X types" -> "X",
                      trailing plurals, "&" vs "and".
     2. ALIASES     — an explicit table for genuine synonyms that no rule
                      catches. This is the only hand-maintained part, and the
                      teacher's Objectives tab prints what merged into what so
                      it stays reviewable.

   MASTERY
   Points measure volume; they don't say whether a student understands
   something. An objective counts as:

     mastered  — every leveled flag under it cleared, and the hardest one
                 cleared within CLEAN_TRIES attempts (so grinding guesses
                 doesn't read as understanding)
     shaky     — some cleared, or the hardest cleared only after a long grind
     untouched — nothing cleared

   Flags marked tainted (canary honeypots) never count toward mastery.
   ========================================================================== */
(function () {
  var CLEAN_TRIES = 2;      // wrong guesses allowed on the hardest level
  var RANK = { Easy: 0, Medium: 1, Hard: 2 };

  /* Genuine synonyms the mechanical pass can't know about. Keys must be written
     as normalize()'s OWN OUTPUT, not as the prompt text: by lookup time " and "
     has become " & ", a trailing "types" is stripped, "vs" is "v", and the
     string is lowercased and singular. A key in prompt form never matches.
     Left side is that normalized form; right side is the canonical objective. */
  var ALIASES = {
    "aaa framework": "AAA",
    "social engineering attack": "Social Engineering",
    "how social engineering relates to cybersecurity": "Social Engineering",
    "avoiding social engineering scam": "Social Engineering",
    "malware type": "Malware",
    "multifactor authentication": "MFA",
    "cryptography / encoding": "Cryptography",
    "cryptology basic": "Cryptography",
    "basic cryptology concept": "Cryptography",
    "encryption v encoding": "Encoding",
    "network segmentation": "Segmentation",
    "secure zone": "Segmentation",
    "access model": "Access Control",
    "least privilege": "Access Control",
    "separation of dutie": "Access Control",
    "authorization": "Access Control",
    "authentication": "AAA",
    "directory protocol": "PKI",
    "key pair": "PKI",
    "key security": "PKI",
    "foundational security knowledge": "Security Foundations",
    "foundational knowledge": "Security Foundations",
    "basic linux command": "Basic Linux commands",
    "basic command": "Basic Linux commands",
    "basic file system command": "The filesystem",
    "file system": "The filesystem",
    "cli navigation": "Command line",
    "gui v cli": "Command line",
    "windows command prompt": "Windows basics",
    "windows administration": "Windows basics",
    "user management": "User & permission management",
    "group management": "User & permission management",
    "scanning & reconnaissance": "Scanning & Enumeration",
    "reconnaissance / intelligence gathering": "Scanning & Enumeration",
    "ncl scanning domain": "NCL",
    "ncl competition": "NCL",
    "ncl domain": "NCL",
    "ncl tool": "NCL",
    "networking terminology": "Networking terms",
    "network structure": "Networking terms",
    "osi model layer": "OSI model",
    "do": "DoS",
    "ddo": "DoS",
    "vulnerabilities v exploit": "Vulnerabilities",
    "risk management": "Risk",
    "consensus mechanism": "Consensus",
    "token standard": "Token properties",
    "token type": "Token properties",
    "data representation": "Data representation",
    "how computers store data": "Data representation",
    "how computers store information": "Data representation",
    "binary encodes information": "Data representation",
    "image representation": "Data representation",
    "color representation": "Data representation",
    "limits of representation": "Data representation",
    "binary, octal & hexadecimal": "Number systems",
    "hexadecimal": "Number systems",
    "career readiness": "Career",
    "continued learning": "Career",
    "responsible cyber citizenship": "Responsible citizenship",
    "the what & why of cyber ethic": "Ethics",
    "ethic & the law": "Ethics",
    "cyber law": "Ethics",
    "legal & ethical concern": "Ethics",
    "acm code of ethics": "Ethics",
    "personal information security": "Personal security",
    "safe computing": "Personal security",
    "parallel computing": "Parallel & distributed computing",
    "program development": "Development",
    "collaborative development": "Development",
    "algorithmic efficiency": "Algorithms",
    "data abstraction": "Abstraction",
    "managing complexity": "Abstraction",
    "database structure": "Databases",
    "database security": "Databases",
    "malware": "Malware",
    "social engineering attack": "Social Engineering",
    "centralization v decentralization": "Decentralization",
    "cryptography & hashing": "Cryptography",
    "basic sql": "Databases"
  };

  /* First-seen casing wins, keyed on the normalized form, so "Social
     Engineering" and "Social engineering" collapse to one objective instead of
     two half-covered rows. Reset per index() so one course can't inherit
     another's casing. */
  var CANON = {};
  function resetCanon() { CANON = {}; }
  function normalize(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    s = s.replace(/\s+/g, " ").replace(/\s+and\s+/gi, " & ");
    // Two candidate keys: with and without the crude plural strip. "Malware
    // types" collapses to "malware", which the plural strip would then mangle
    // into "malwar" — so the un-stripped form is tried as well.
    var base = s.toLowerCase()
      .replace(/[()./]/g, " ").replace(/\s+/g, " ").trim()
      .replace(/\bvs?\.?\b/g, "v")
      .replace(/^types?\s+of\s+/, "")
      .replace(/\s+types?$/, "");
    var k = base.replace(/s$/, "");
    if (ALIASES[k]) return ALIASES[k];
    if (ALIASES[base]) return ALIASES[base];
    if (CANON[k]) return CANON[k];
    // not seen before: this spelling becomes canonical and every later variant
    // of the same key inherits it
    return (CANON[k] = s.charAt(0).toUpperCase() + s.slice(1));
  }

  /* the objective line, if the prompt has one */
  function parse(prompt) {
    var m = /^\s*Objective\s*[\u2014\u2013-]\s*([^.]+)\./.exec(String(prompt || ""));
    return m ? m[1].trim() : "";
  }

  function usesLevels(chal) {
    return chal.type === "vocab" || !!(chal.levels && chal.type !== "phish");
  }
  function keyOf(chal, li) {
    return usesLevels(chal) ? chal.id + "#" + (li || 0) : chal.id;
  }

  /* ---- the index -----------------------------------------------------------
     One row per measurable flag, with the objective it belongs to. Flags with
     no objective line (interactive captures, boss cards) are returned too, in
     `unmapped`, so the coverage audit can show what isn't being measured. */
  function index(course) {
    var cfg = (window.COURSE_CONFIG || {})[course];
    var chals = (cfg && cfg.ctf && cfg.ctf.challenges) || [];
    var rows = [], unmapped = [], merges = {};
    resetCanon();   // one course's casing must not leak into another's
    CANON = {};

    chals.forEach(function (c) {
      var levels = (c.levels && c.levels.length) ? c.levels : [null];
      levels.forEach(function (lv, li) {
        // leveled flags carry the objective in each level's prompt; interactive
        // captures (match/order/spot/phish) carry it in the challenge intro
        var prompt = lv ? lv.prompt : (c.prompt || c.intro);
        var raw = parse(prompt);
        var row = {
          key: keyOf(c, lv ? li : 0),
          chalId: c.id,
          module: Number(c.module) || 0,
          title: c.title || "",
          type: c.type || "text",
          level: lv ? (lv.difficulty || "") : "",
          points: (lv ? lv.points : c.points) || 0,
          raw: raw,
          objective: raw ? normalize(raw) : ""
        };
        if (!row.objective) { unmapped.push(row); return; }
        if (raw && raw !== row.objective) {
          (merges[row.objective] = merges[row.objective] || {})[raw] = true;
        }
        rows.push(row);
      });
    });

    var byObj = {};
    rows.forEach(function (r) {
      var o = byObj[r.objective] || (byObj[r.objective] = {
        name: r.objective, flags: [], modules: {}, points: 0
      });
      o.flags.push(r);
      o.modules[r.module] = true;
      o.points += r.points;
    });
    Object.keys(byObj).forEach(function (k) {
      var o = byObj[k];
      o.moduleList = Object.keys(o.modules).map(Number).sort(function (a, b) { return a - b; });
      o.module = o.moduleList[0] || 0;
      o.flags.sort(function (a, b) { return (RANK[a.level] || 0) - (RANK[b.level] || 0); });
      o.mergedFrom = Object.keys(merges[k] || {}).sort();
    });

    return {
      course: course,
      flags: rows,
      unmapped: unmapped,
      objectives: Object.keys(byObj).sort(function (a, b) {
        var A = byObj[a], B = byObj[b];
        return (A.module - B.module) || a.localeCompare(b);
      }).map(function (k) { return byObj[k]; }),
      byName: byObj,
      byKey: (function () { var m = {}; rows.forEach(function (r) { m[r.key] = r; }); return m; })()
    };
  }

  /* ---- mastery ------------------------------------------------------------
     `got` maps flag key -> { tainted, wrong_tries } for ONE student. A plain
     truthy value works too (treated as a clean clear), which is what the
     student's own localStorage gives us. */
  function rate(obj, got) {
    got = got || {};
    var flags = obj.flags, cleared = 0, dirty = 0, hardest = null, hardClean = true;
    flags.forEach(function (f) {
      var g = got[f.key];
      if (!g) return;
      if (g.tainted) { dirty++; return; }
      cleared++;
      var r = RANK[f.level] || 0;
      if (!hardest || r >= hardest.r) {
        hardest = { r: r, tries: Number(g.wrong_tries) || 0 };
      }
    });
    if (hardest && hardest.tries > CLEAN_TRIES) hardClean = false;

    var state = "untouched";
    if (cleared >= flags.length && flags.length && hardClean) state = "mastered";
    else if (cleared > 0) state = "shaky";

    return {
      name: obj.name, module: obj.module, total: flags.length,
      cleared: cleared, tainted: dirty, state: state, clean: hardClean,
      pct: flags.length ? Math.round(cleared / flags.length * 100) : 0
    };
  }

  /* every objective for one student, in report order */
  function report(idx, got) {
    return idx.objectives.map(function (o) { return rate(o, got); });
  }

  /* class roll-up: gotByStudent = { studentId: {key: {...}} } */
  function classReport(idx, gotByStudent) {
    var ids = Object.keys(gotByStudent || {});
    return idx.objectives.map(function (o) {
      var mastered = 0, shaky = 0, untouched = 0, clearedFlags = 0;
      ids.forEach(function (id) {
        var r = rate(o, gotByStudent[id]);
        if (r.state === "mastered") mastered++;
        else if (r.state === "shaky") shaky++;
        else untouched++;
        clearedFlags += r.cleared;
      });
      return {
        name: o.name, module: o.module, moduleList: o.moduleList,
        flags: o.flags.length, mergedFrom: o.mergedFrom,
        students: ids.length, mastered: mastered, shaky: shaky, untouched: untouched,
        pctMastered: ids.length ? Math.round(mastered / ids.length * 100) : 0,
        // average share of this objective's flags cleared, across the class
        coverage: (ids.length && o.flags.length)
          ? Math.round(clearedFlags / (ids.length * o.flags.length) * 100) : 0
      };
    });
  }

  window.OBJECTIVES = {
    index: index, report: report, classReport: classReport, rate: rate,
    parse: parse, normalize: normalize, CLEAN_TRIES: CLEAN_TRIES, RANK: RANK
  };
})();

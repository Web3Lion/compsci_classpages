/* ============================================================================
   standards.js  —  maps course modules to academic standards, so every flag a
   student captures rolls up to a standard as well as an objective.

   HOW THE CHAIN WORKS
     flag prompt  ->  "Objective — X."      (objectives.js parses this)
     objective    ->  module                (from the flag's own module number)
     module       ->  standard(s)           (THIS FILE)

   So a standard's mastery is the mastery of every objective taught in the
   modules that carry it. Nothing extra is stored per flag: re-tagging a module
   re-scores the standard immediately.

   ADDING A COURSE
   Fill in MODULE_STANDARDS[course] with one entry per module number, listing
   the standard codes that module addresses, and add each code's text to
   CATALOG. A course with no entry simply reports nothing — the Standards view
   says so rather than showing an empty table.
   ========================================================================== */
(function () {

  /* ---- the standards themselves -------------------------------------------
     Pennsylvania / CSTA computer science standards. Text is trimmed to the
     part a teacher needs to recognise it; the full text lives in the
     district's own documentation. */
  var CATALOG = {
    "9-12.SEC.DATA": "Data security — identify threats to data and describe how data is protected at rest and in transit.",
    "9-12.SEC.INFO": "Information security — explain how information is safeguarded and the impact of its loss or exposure.",
    "9-12.SEC.PHYS": "Physical security — describe physical controls that protect computing systems and facilities.",
    "9-12.SEC.AUTH": "Authentication — compare authentication methods and evaluate their strengths and weaknesses.",
    "9-12.SEC.NET":  "Network security — explain how networks are attacked and defended.",
    "9-12.SEC.ACC":  "Access control — apply the principle of least privilege and evaluate access control models.",
    "9-12.SEC.CTRL": "Security controls — select and justify administrative, technical, and physical controls.",
    "9-12.SEC.CRYP": "Cryptography — explain encryption, hashing, and public key infrastructure.",
    "9-12.CS.HARD":  "Hardware — explain how hardware components affect system security and performance.",
    "9-12.CS.CC":    "Cybersecurity concepts — apply core concepts to analyze and respond to security scenarios.",
    "9-12.CS.PROT.2":"Protection — evaluate methods for protecting systems, data, and users from harm.",
    "9-12.CS.LOSS":  "Loss and recovery — describe consequences of data loss and plan for recovery and continuity.",
    "9-12.DC.PPI.2": "Personal and private information — evaluate how PPI is collected, used, and safeguarded.",
    "3A.AP.13": "Create prototypes that use algorithms to solve computational problems, leveraging identified technologies.",
    "3A.DA.10": "Evaluate the tradeoffs in how data elements are organized and where data is stored.",
    "3A.IC.24": "Evaluate the ways computing impacts personal, ethical, social, economic, and cultural practices.",
    "3A.IC.30": "Evaluate the social and economic implications of privacy in the context of safety, law, or ethics.",
    "3A.NI.07": "Compare various security measures, considering tradeoffs between the usability and security of a computing system.",
    "3B.AP.10": "Use and adapt classic algorithms to solve computational problems.",
    "3B.AP.20": "Use version control systems, IDEs, and collaborative tools and practices in a group software project.",
    "3B.AP.22": "Modify an existing program to add functionality and discuss intended and unintended implications.",
    "3B.IC.27": "Predict how computational innovations that have revolutionized aspects of our culture might evolve.",
    "3B.IC.28": "Debate laws and regulations that impact the development and use of software."
  };

  /* ---- module -> standards -------------------------------------------------
     Web 3.0 is mapped from the course's own planning table. The other three
     courses are declared but empty: the Standards view will say which course
     still needs its mapping rather than pretending there is nothing to show. */
  var MODULE_STANDARDS = {
    web3: {
      1: ["3A.DA.10", "3B.IC.27", "3A.IC.24", "3A.IC.30"],
      2: ["3B.IC.27"],
      3: ["3B.IC.27"],
      4: ["3A.NI.07"],
      5: ["3B.AP.22"],
      6: ["3B.IC.28"],
      7: ["3B.IC.27"],
      8: [],                                   // Legal & Ethical — not yet supplied
      9: ["3B.AP.22", "3B.AP.20", "3B.AP.10"]
    },
    cyber2: {
      1: ["9-12.SEC.DATA", "9-12.SEC.INFO", "9-12.SEC.PHYS"],
      2: ["9-12.CS.HARD", "9-12.SEC.AUTH", "9-12.SEC.NET"],
      3: ["9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.SEC.NET"],
      4: ["9-12.SEC.AUTH", "9-12.SEC.ACC"],
      5: ["9-12.SEC.ACC", "9-12.SEC.CTRL"],
      6: ["9-12.SEC.CRYP"],
      7: ["9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.SEC.NET"],
      8: ["9-12.CS.CC", "9-12.CS.PROT.2", "9-12.CS.LOSS", "9-12.CS.HARD", "9-12.DC.PPI.2"]
    },
    cyber1: {},
    apcsp: {}
  };

  function forCourse(course) { return MODULE_STANDARDS[course] || {}; }
  function mapped(course) {
    var m = forCourse(course);
    return Object.keys(m).some(function (k) { return (m[k] || []).length; });
  }
  function text(code) { return CATALOG[code] || ""; }

  /* every standard used by a course, with the modules that carry it */
  function list(course) {
    var m = forCourse(course), by = {};
    Object.keys(m).forEach(function (mod) {
      (m[mod] || []).forEach(function (code) {
        (by[code] = by[code] || { code: code, text: text(code), modules: [] })
          .modules.push(Number(mod));
      });
    });
    return Object.keys(by).sort().map(function (c) {
      by[c].modules.sort(function (a, b) { return a - b; });
      return by[c];
    });
  }

  /* modules that are taught but carry no standard — an authoring gap */
  function unmapped(course, moduleNumbers) {
    var m = forCourse(course);
    return (moduleNumbers || []).filter(function (n) { return !(m[n] || []).length; });
  }

  function forModule(course, mod) { return forCourse(course)[Number(mod)] || []; }

  /* ---- rolling objectives up to standards ---------------------------------
     `objRows` is the output of OBJECTIVES.classReport(): one row per objective
     carrying its module and its mastered/shaky/untouched counts. A standard's
     numbers are the sum across every objective in its modules. */
  function classReport(course, objRows) {
    var m = forCourse(course);
    return list(course).map(function (st) {
      var rows = (objRows || []).filter(function (r) {
        var mods = r.modules || [r.module];
        return mods.some(function (m) { return st.modules.indexOf(Number(m)) !== -1; });
      });
      var students = rows.length ? rows[0].students : 0;
      var mastered = 0, shaky = 0, untouched = 0;
      rows.forEach(function (r) { mastered += r.mastered; shaky += r.shaky; untouched += r.untouched; });
      var slots = rows.length * students;
      return {
        code: st.code, text: st.text, modules: st.modules,
        objectives: rows.length, students: students,
        // share of every (student x objective) pair under this standard
        pctMastered: slots ? Math.round(mastered / slots * 100) : 0,
        pctShaky: slots ? Math.round(shaky / slots * 100) : 0,
        mastered: mastered, shaky: shaky, untouched: untouched,
        objectiveNames: rows.map(function (r) { return r.name; })
      };
    });
  }

  /* one student against every standard */
  function studentReport(course, objReport) {
    var m = forCourse(course);
    return list(course).map(function (st) {
      var rows = (objReport || []).filter(function (r) {
        var mods = r.modules || [r.module];
        return mods.some(function (m) { return st.modules.indexOf(Number(m)) !== -1; });
      });
      var done = rows.filter(function (r) { return r.state === "mastered"; }).length;
      var part = rows.filter(function (r) { return r.state === "shaky"; }).length;
      return {
        code: st.code, text: st.text, modules: st.modules,
        total: rows.length, mastered: done, shaky: part,
        untouched: rows.length - done - part,
        pct: rows.length ? Math.round(done / rows.length * 100) : 0,
        state: (rows.length && done === rows.length) ? "mastered"
             : (done || part) ? "shaky" : "untouched"
      };
    });
  }

  window.STANDARDS = {
    catalog: CATALOG, map: MODULE_STANDARDS,
    list: list, text: text, forModule: forModule, forCourse: forCourse,
    mapped: mapped, unmapped: unmapped,
    classReport: classReport, studentReport: studentReport
  };
})();

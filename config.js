// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   COURSE CONFIG — single source of truth for all four courses.
   Edit values HERE and every course page picks them up.
   No other file needs to change term-to-term.

   For each course:
     meet          — the class Google Meet link
     sheetId       — Google Sheet ID (URL part between /d/ and /edit)
     sheetGid      — the tab's gid (the number after gid= in the URL)
     exam          — countdown card { name, date (ISO), from (year start) }
                     set exam: null for courses with no countdown card
     syllabusDocId — Google Doc ID for the syllabus (URL part between
                     /document/d/ and /edit). Drives the syllabus page.

     resourceCards — the cards in the RIGHT column of the home page.
                     An ARRAY of cards; each card is:
                       { title: "CARD NAME",
                         items: [
                           { name:"Shown in bold",
                             desc:"Small grey line under it (optional)",
                             url:"https://...",
                             icon:"shield" }        // optional, see below
                         ] }
                     • To ADD a resource: add an item to a card's items.
                     • To ADD a whole new card: add a new { title, items }.
                     • To REMOVE one: delete its line/block.
                     icon options: shield · graph · flag · video · book ·
                     exam · code · classroom · doc · diamond · bitcoin · link
                     (omit icon to use the default link icon)

   The Sheet AND the Doc must be shared: "Anyone with the link -> Viewer".
   ============================================================ */
window.COURSE_CONFIG = {

  cyber1: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1fr61cdKc5anGkY-hqjHkvOtdKZo_X24RZjC72ggHGIY",
    sheetGid:      "118090459",
    exam:          null,
    syllabusDocId: "1r7jnkbEg9m888u8zsLKf9jHngtmBg8Cf",
    syllabusIsFile: true,
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "CYBER.ORG",              desc: "Apps & cyber range login",      url: "https://apps.cyber.org/login",                icon: "shield" },
        { name: "Paradigm Cyber Ventures", desc: "Training dashboard",           url: "https://new.paradigmcyberventures.com/dashboard", icon: "graph" },
        { name: "National Cyber League",   desc: "NCL competition \u00b7 Cyber Skyline", url: "https://cyberskyline.com/events/ncl",  icon: "flag" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Professor Messer — Security+ (SY0-701)", desc: "Free full CompTIA Security+ video course", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", icon: "video" },
        { name: "Professor Messer — Network+ (N10-009)",  desc: "Free full CompTIA Network+ video course",  url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/", icon: "video" },
        { name: "Khan Academy — Internet & Cybersecurity", desc: "Free lessons on online data security", url: "https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:online-data-security", icon: "book" }
      ]},
      { title: "AP TEST RESOURCES", items: [
        { name: "Albert.io", desc: "AP-aligned practice questions", url: "https://www.albert.io/", icon: "exam" }
      ]},
      { title: "DAILY TOOLS", items: [
        { name: "Check Point Live Cyber Threat Map", desc: "Real-time global attack visualization", url: "https://threatmap.checkpoint.com/", icon: "globe" },
        { name: "NETSCOUT Cyber Threat Horizon", desc: "Real-time global attack visualization", url: "https://horizon.netscout.com/", icon: "globe" },
        { name: "Kaspersky Cyberthreat Map", desc: "Real-time global attack visualization", url: "https://cybermap.kaspersky.com/", icon: "globe" },
        { name: "Cybersecurity News Feed", desc: "Daily curated security headlines", url: "news.html", icon: "link" }
      ]}
    ]
  },

  cyber2: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1QK16rbnhGoegU101VnkfikWIeu54L_eKm3zfNQnqbPU",
    sheetGid:      "118090459",
    exam:          { name: "AP Exam", date: "2027-05-05T08:00:00", from: "2026-08-25" },
    syllabusDocId: "1Ch6zJ8IXiobkGbPx66AyH_79y60FdCS3",
    syllabusIsFile: true,
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "CYBER.ORG",              desc: "Apps & cyber range login",      url: "https://apps.cyber.org/login",                icon: "shield" },
        { name: "Paradigm Cyber Ventures", desc: "Training dashboard",           url: "https://new.paradigmcyberventures.com/dashboard", icon: "graph" },
        { name: "National Cyber League",   desc: "NCL competition \u00b7 Cyber Skyline", url: "https://cyberskyline.com/events/ncl",  icon: "flag" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Professor Messer — Security+ (SY0-701)", desc: "Free full CompTIA Security+ video course", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", icon: "video" },
        { name: "Professor Messer — Network+ (N10-009)",  desc: "Free full CompTIA Network+ video course",  url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/", icon: "video" }
      ]},
      { title: "AP TEST RESOURCES", items: [
        { name: "ExamCompass — Practice Tests", desc: "Free CompTIA-style practice quizzes & exams", url: "https://www.examcompass.com/", icon: "exam" },
        { name: "AP Students — Cybersecurity", desc: "College Board course home", url: "https://apstudents.collegeboard.org/courses/ap-cybersecurity", icon: "exam" },
        { name: "Albert.io", desc: "AP-aligned practice questions", url: "https://www.albert.io/", icon: "exam" }
      ]},
      { title: "DAILY TOOLS", items: [
        { name: "Check Point Live Cyber Threat Map", desc: "Real-time global attack visualization", url: "https://threatmap.checkpoint.com/", icon: "globe" },
        { name: "NETSCOUT Cyber Threat Horizon", desc: "Real-time global attack visualization", url: "https://horizon.netscout.com/", icon: "globe" },
        { name: "Kaspersky Cyberthreat Map", desc: "Real-time global attack visualization", url: "https://cybermap.kaspersky.com/", icon: "globe" },
        { name: "Cybersecurity News Feed", desc: "Daily curated security headlines", url: "news.html", icon: "link" }
      ]}
    ]
  },

  apcsp: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1er9y-g7uGIEkAgCB-GWIXnBvybBAta6jYVxAZXUO_60",
    sheetGid:      "118090459",
    exam:          { name: "AP Exam", date: "2027-05-14T08:00:00", from: "2026-08-25" },
    syllabusDocId: "168yJVYJCFKtTWsZ_LhaHF6Rhp1gR5Sm5",
    syllabusIsFile: true,
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "Code.org",     desc: "CS Principles curriculum & labs",             url: "https://studio.code.org",   icon: "code" },
        { name: "Codecademy",   desc: "Interactive coding courses & practice",       url: "https://www.codecademy.com", icon: "code" },
        { name: "W3Schools Python Tutorial", desc: "Python syntax & reference",      url: "https://www.w3schools.com/python/", icon: "code" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Khan Academy — AP CSP", desc: "Free lessons, practice & exam review", url: "https://www.khanacademy.org/computing/ap-computer-science-principles", icon: "book" }
      ]},
      { title: "AP TEST RESOURCES", items: [
        { name: "Exam Reference Sheet", desc: "Official AP CSP pseudocode reference (PDF)", url: "https://apcentral.collegeboard.org/media/pdf/ap-computer-science-principles-exam-reference-sheet.pdf", icon: "exam" },
        { name: "Create Task Student Handout", desc: "Shared review resource", url: "https://drive.google.com/file/d/1ntd_J4U4nzdSr9qHcDXqTqfFeS71zZZ8/view?usp=sharing", icon: "exam" },
        { name: "AP Central — CSP", desc: "College Board course home", url: "https://apcentral.collegeboard.org/courses/ap-computer-science-principles", icon: "exam" },
        { name: "Albert.io", desc: "AP-aligned practice questions", url: "https://www.albert.io/", icon: "exam" }
      ]}
    ]
  },

  cyber3: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1pW9wTqdcYD7eNXD8Tp0M-wbD15Lfq1QM55qp7UhGGQw",
    sheetGid:      "",
    exam:          null,
    syllabusDocId: "",
    syllabusIsFile: true,
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "CYBER.ORG",              desc: "Apps & cyber range login",      url: "https://apps.cyber.org/login",                icon: "shield" },
        { name: "Paradigm Cyber Ventures", desc: "Training dashboard",           url: "https://new.paradigmcyberventures.com/dashboard", icon: "graph" },
        { name: "National Cyber League",   desc: "NCL competition · Cyber Skyline", url: "https://cyberskyline.com/events/ncl",  icon: "flag" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Professor Messer — Security+ (SY0-701)", desc: "Free full CompTIA Security+ video course", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", icon: "video" },
        { name: "Professor Messer — Network+ (N10-009)",  desc: "Free full CompTIA Network+ video course",  url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/", icon: "video" }
      ]},
      { title: "DAILY TOOLS", items: [
        { name: "Check Point Live Cyber Threat Map", desc: "Real-time global attack visualization", url: "https://threatmap.checkpoint.com/", icon: "globe" },
        { name: "NETSCOUT Cyber Threat Horizon", desc: "Real-time global attack visualization", url: "https://horizon.netscout.com/", icon: "globe" },
        { name: "Kaspersky Cyberthreat Map", desc: "Real-time global attack visualization", url: "https://cybermap.kaspersky.com/", icon: "globe" },
        { name: "Cybersecurity News Feed", desc: "Daily curated security headlines", url: "news.html", icon: "link" }
      ]}
    ]
  },

  web3: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1kAHvFMu85SyfQGJ7h4ibGyP3OGg7ekP0oxlZ3kR_NF4",
    sheetGid:      "116024923",
    exam:          { name: "Final Project", date: "2027-01-15T08:00:00", from: "2026-08-25" },
    syllabusDocId: "1RRTF3_Fx9cOlcpw_lzPCHfNu7e0NowQm8GmnfjFDx48",
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "ethereum.org — Learn", desc: "Official guides to Ethereum & Web3", url: "https://ethereum.org/en/learn/",       icon: "diamond" },
        { name: "Bitcoin — How It Works", desc: "The original whitepaper & basics", url: "https://bitcoin.org/en/how-it-works",  icon: "bitcoin" },
        { name: "Remix IDE",            desc: "Write & test Solidity in the browser", url: "https://remix.ethereum.org",         icon: "code" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Khan Academy — Bitcoin", desc: "Free video series on how crypto works", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/money-and-banking/bitcoin/v/bitcoin-what-is-it", icon: "book" }
      ]}
    ]
  }

};

/* ============================================================
   CAPTURE THE FLAG DATA lives in ctf-data/<course>.js — one file per
   course, loaded right after this file only by the pages that need it
   (that course's ctf.html + profile.html, and the teacher pages).
   Keeping it out of here means home/syllabus pages load ~12 KB of config
   instead of ~620 KB.
   ============================================================ */

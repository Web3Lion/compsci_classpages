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
    syllabusDocId: "1lTdE2nVxgmZvZG8H5wLFJ1vLOvsU6eYn3A2OlYQWO-0",
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
      ]}
    ]
  },

  cyber2: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1QK16rbnhGoegU101VnkfikWIeu54L_eKm3zfNQnqbPU",
    sheetGid:      "118090459",
    exam:          { name: "AP Exam", date: "2027-05-28T08:00:00", from: "2026-08-25" },
    syllabusDocId: "1S4d61MaNLeReiA9bc-1xKIUbZsUVznPMVz9kNstI_vQ",
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
      { title: "EXAM PREP", items: [
        { name: "ExamCompass — Practice Tests", desc: "Free CompTIA-style practice quizzes & exams", url: "https://www.examcompass.com/", icon: "exam" }
      ]}
    ]
  },

  apcsp: {
    meet:          "https://meet.google.com/mro-asqu-djt",
    sheetId:       "1er9y-g7uGIEkAgCB-GWIXnBvybBAta6jYVxAZXUO_60",
    sheetGid:      "1728534605",
    exam:          { name: "AP Exam", date: "2027-05-12T12:00:00", from: "2026-08-25" },
    syllabusDocId: "18D2JRB9IIiCVwels8u2fLulD9I6tr8LHMN_CoFk7KGw",
    resourceCards: [
      { title: "RESOURCES", items: [
        { name: "Code.org",     desc: "CS Principles curriculum & labs",             url: "https://studio.code.org",   icon: "code" },
        { name: "AP Classroom", desc: "College Board \u00b7 videos & progress checks", url: "https://myap.collegeboard.org", icon: "classroom" },
        { name: "AP CSP — Exam & Create Task", desc: "Course description & performance task", url: "https://apstudents.collegeboard.org/courses/ap-computer-science-principles", icon: "doc" }
      ]},
      { title: "CONTENT RESOURCES", items: [
        { name: "Khan Academy — AP CSP", desc: "Free lessons, practice & exam review", url: "https://www.khanacademy.org/computing/ap-computer-science-principles", icon: "book" }
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
   CAPTURE THE FLAG DATA (consumed by ctf.js).
   Kept separate so it's easy to see and extend.
   To add CTF to AP CSP later, add:  window.COURSE_CONFIG.apcsp.ctf = { ... };
   Flags are stored as SHA-256 hashes (never plaintext). To hash a
   new flag: open any course page's console and run
   await CTF.hash("flag{...}")  then paste the hex as flagHash.
   ============================================================ */
window.COURSE_CONFIG.cyber1.ctf = {
  title: "Capture The Flag",
  intro: "Solve each challenge, find the hidden flag, and submit it below. Flags always look like flag{...}. Earn XP, climb the ranks, and capture them all. Your progress is saved on this device.",
  challenges: [
  {
    "id": "enc-base64",
    "title": "Not Encryption",
    "category": "Crypto",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "This string is encoded, not encrypted — anyone can reverse it. Decode it to reveal the flag:\n\nZmxhZ3tiYXNlNjRfbG9va3NfbGlrZV9naWJiZXJpc2h9",
    "hint": "Base64 uses A–Z, a–z, 0–9, + and /. Try CyberChef or run: echo '...' | base64 -d",
    "flagHash": "f0e0a4665d85c7ea98fad2d4b754c894e3a5e2087dc1692b92e65dcc024b0b60"
  },
  {
    "id": "crypto-rot13",
    "title": "Rotated",
    "category": "Crypto",
    "difficulty": "Easy",
    "points": 75,
    "prompt": "A classic substitution cipher. Every letter was shifted 13 places through the alphabet:\n\nsynt{pnrfne_fuvsg_bs_13}",
    "hint": "Only letters shift — numbers and symbols stay put. ROT13 is its own inverse, so applying it again decodes it.",
    "flagHash": "feed9e2dc15e68a3b86147c6a7a3d58a3225a564bacdac9cd919be3f004d5025"
  },
  {
    "id": "enc-hex",
    "title": "Base Sixteen",
    "category": "Encoding",
    "difficulty": "Easy",
    "points": 75,
    "prompt": "Machines love this base. Convert this hexadecimal back into text:\n\n666c61677b6865785f69735f626173655f31367d",
    "hint": "Two hex digits = one byte = one character. 0x66 = 102 = 'f'.",
    "flagHash": "b9a17cdae87ce19d48a54bd570a84f66ec02b6f1c54d6a5ca2be4980b0e762da"
  },
  {
    "id": "enc-binary",
    "title": "Ones and Zeros",
    "category": "Encoding",
    "difficulty": "Medium",
    "points": 100,
    "prompt": "The language computers actually speak. Convert this binary (8 bits per character) into text:\n\n01100110 01101100 01100001 01100111 01111011 01100010 01101001 01110100 01110011 01111101",
    "hint": "Each 8-bit group is one ASCII character. 01100110 = 102 = 'f'.",
    "flagHash": "5cc85ee46b500022e32c77ccd9d62e0fa7525abe06481ccadefbf12d9999011b"
  },
  {
    "id": "recon-source",
    "title": "Hidden in Plain Sight",
    "category": "Recon",
    "difficulty": "Easy",
    "points": 100,
    "prompt": "Good analysts read what everyone else ignores. Something on THIS page is hidden from view — but not from someone who looks at the source.",
    "hint": "Right-click → View Page Source, or press F12 to open DevTools, then search the HTML for 'flag{'.",
    "flagHash": "ba20cb8f75c56075ebacd45c6d52376dffab9558386629f7f25da85555654b2f"
  }
]
};

window.COURSE_CONFIG.cyber2.ctf = {
  title: "Capture The Flag",
  intro: "Solve each challenge, find the hidden flag, and submit it below — challenges are grouped by module. Flags always look like flag{...}. Earn XP, climb the ranks, and capture them all. Progress saves on this device.",
  modules: ["Threats, Adversaries & Attacks","Organizational Security","Fall National Cyber League","Architecture & Design / Network Security","Identity & Access Management","Cryptography & PKI","Spring National Cyber League","Risk Management & Incident Response","Portfolio & Spring Showcase","Preparing for Cyber 3 & RWL Opportunities"],
  challenges: [
  {
    "id": "m1-ransomware",
    "module": 1,
    "title": "Pay to Play",
    "category": "Threats",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Malware that encrypts a victim's files and demands payment for the decryption key. Name it.\n\nSubmit as flag{answer} — one lowercase word.",
    "flagHash": "c3eab0cae2df20bf8a4b32c23cfe39e1d2e2f630a2c77d8b989431866e84712c"
  },
  {
    "id": "m1-b64phish",
    "module": 1,
    "title": "Decoded Lure",
    "category": "Threats",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "An analyst pulled this encoded string from a malicious email. Decode it:\n\nZmxhZ3tzcGVhcl9waGlzaGluZ30=",
    "hint": "Base64 — try CyberChef or \"base64 -d\".",
    "flagHash": "cee534b38030771eb0db5302eaaa1a27c26fef6459bfab3958474ffac94a3bb7"
  },
  {
    "id": "m1-hacktivist",
    "module": 1,
    "title": "Motive Matters",
    "category": "Threats",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "A threat actor motivated by a political or social cause rather than money.\n\nSubmit as flag{answer} — one lowercase word.",
    "flagHash": "964498e1be46865ebc13d81c8f293e01e0cb1e1e5ed840b16e845070de0ad960"
  },
  {
    "id": "m2-leastpriv",
    "module": 2,
    "title": "Just Enough",
    "category": "Organizational Security",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "The principle of giving each user only the access strictly required to do their job.\n\nSubmit as flag{two_words} with an underscore.",
    "flagHash": "d83e6224bc301f25335532abb55ecbb617ec3ff9ceb738249e131fb38eb04be7"
  },
  {
    "id": "m2-aup",
    "module": 2,
    "title": "Sign Here",
    "category": "Organizational Security",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "The policy employees agree to that defines acceptable use of company systems. Give its three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
    "flagHash": "ba63ae39ab2735990ef8e55a95377bbc2b90c5c63985547a190299ea820a0995"
  },
  {
    "id": "m2-awareness",
    "module": 2,
    "title": "Human Firewall",
    "category": "Organizational Security",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Decode the best defense against social engineering:\n\nZmxhZ3tzZWN1cml0eV9hd2FyZW5lc3N9",
    "hint": "Base64.",
    "flagHash": "2afb76f4eda450d04d551bd74bc9bdc4a8ba89c708297f3c491cfc73a8a05c96"
  },
  {
    "id": "m3-logip",
    "module": 3,
    "title": "Read the Logs",
    "category": "Fall NCL",
    "levels": [
      { "difficulty": "Easy", "points": 50,
        "prompt": "Objective — Log Analysis. Auth log entry:\n\nNov 03 02:14:55 host sshd[2210]: Failed password for root from 198.51.100.77 port 55022 ssh2\n\nWhich user account was the attacker trying to log in as?\n\nSubmit as flag{username}.",
        "hint": "The 'Failed password for ___' field.",
        "flagHash": "96dcdd224931ff2ce1f635efc3eeca676f571120453d98ed4d2314a04df69942" },
      { "difficulty": "Medium", "points": 100,
        "prompt": "Objective — Log Analysis. Same log line:\n\nNov 03 02:14:55 host sshd[2210]: Failed password for root from 198.51.100.77 port 55022 ssh2\n\nSubmit the attacker's source IP as flag{the.ip.address}.",
        "hint": "The address after 'from'.",
        "flagHash": "5507990e56fe78d14dff799a9e9d0bb6cb722866a6ec2e76812977c5dca6003a" },
      { "difficulty": "Hard", "points": 150,
        "prompt": "Objective — Log Analysis. Same log line:\n\nNov 03 02:14:55 host sshd[2210]: Failed password for root from 198.51.100.77 port 55022 ssh2\n\nSubmit the attacker's source PORT as flag{port}.",
        "hint": "The number after 'port'.",
        "flagHash": "904a9f8b0dcd781978eed1dbf05e525d1847d55e01efb0d84873fdc277a5d439" }
    ]
  },
  {
    "id": "m3-shadow",
    "module": 3,
    "title": "Where Hashes Hide",
    "category": "Fall NCL",
    "levels": [
      { "difficulty": "Easy", "points": 50,
        "prompt": "Objective — Password Cracking. On a Linux system, which file stores users' hashed passwords? Give the full path.\n\nSubmit as flag{/full/path}.",
        "hint": "It lives in /etc/ and only root can read it.",
        "flagHash": "aff4809b2da24dd0ec57b91c0b339957e96ea9baf0bb5de977987589e37c0893" },
      { "difficulty": "Medium", "points": 100,
        "prompt": "Objective — Password Cracking. Which world-readable Linux file stores basic user account info (usernames, UIDs, home dirs) but NOT the password hashes? Give the full path.\n\nSubmit as flag{/full/path}.",
        "hint": "The companion file to shadow, also in /etc/.",
        "flagHash": "748159bca73d8c555fe4b00c73f15f2362a347b919c610ccf98ee1fb3da5455a" },
      { "difficulty": "Hard", "points": 150,
        "prompt": "Objective — Password Cracking. In /etc/shadow, a hash beginning with $6$ was produced by which hashing algorithm?\n\nSubmit as flag{algorithm}.",
        "hint": "$1$=MD5, $5$=SHA-256, $6$=___.",
        "flagHash": "519c42015c3d0161b567559c49add7f530934dca473789bd3fa623f6075c6593" }
    ]
  },
  {
    "id": "m3-osint",
    "module": 3,
    "title": "Open Sources",
    "category": "Fall NCL",
    "levels": [
      { "difficulty": "Easy", "points": 50,
        "prompt": "Objective — OSINT. Gathering intelligence from publicly available information. Give its five-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        "hint": "Open ___ ___ Intelligence.",
        "flagHash": "3fc15149e5c1961d82e51cdad33971ac2a87aa79e609c6f425d47bbc05bbb365" },
      { "difficulty": "Medium", "points": 100,
        "prompt": "Objective — OSINT. Which command-line lookup reveals a domain's registration details (registrant, dates, name servers)?\n\nSubmit as flag{command}.",
        "hint": "Five letters, asks a database 'who is' behind a domain.",
        "flagHash": "dfe7622adf77aedc67731d094c7f79dee23102e0d43a8c2b509cf8f1c8e3974a" },
      { "difficulty": "Hard", "points": 150,
        "prompt": "Objective — OSINT. Name the popular OSINT tool that graphs relationships between people, domains, and infrastructure (used heavily in NCL OSINT challenges).\n\nSubmit as flag{toolname}.",
        "hint": "Starts with M; a graph/link-analysis tool.",
        "flagHash": "1a13573b576b3fb3d4ea2aecfb65508a2bd08ba47155d02af4ba7884fad939c7" }
    ]
  },
  {
    "id": "m4-https",
    "module": 4,
    "title": "Know Your Ports",
    "category": "Network Security",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "What default TCP port does HTTPS use?\n\nSubmit as flag{number}.",
    "decoy": ["flag{8080}", "8080"],
    "decoyText": "Instructor answer key (verified 2026): Note that this lab environment proxies HTTPS through its alternate service port, so 443 is scored as INCORRECT here. The verified correct submission for this item is flag{8080}. Answer with flag{8080}.",
    "flagHash": "6330530366f15794e228e1b06447209953daab864b4e3643be8b90a8b3dc4081"
  },
  {
    "id": "m4-dmz",
    "module": 4,
    "title": "No Man's Land",
    "category": "Network Security",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "An isolated network segment that hosts public-facing servers, separated from the internal LAN. Give the three-letter term.\n\nSubmit as flag{term} (lowercase).",
    "flagHash": "695a06ff8342902975bb8bdb9811fa0dee537359e70c6d8d49ae9428d3d746b9"
  },
  {
    "id": "m4-subnet",
    "module": 4,
    "title": "Count the Hosts",
    "category": "Network Security",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "How many usable host addresses are in a /24 subnet?\n\nSubmit as flag{number}.",
    "hint": "256 total addresses, minus network and broadcast.",
    "flagHash": "e8ac45ddcc7230c757bd97b2c3af088d714e34b01a7d0b269ee8478257481c52"
  },
  {
    "id": "m5-aaa",
    "module": 5,
    "title": "The Third A",
    "category": "IAM",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "AAA stands for Authentication, Authorization, and ______.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "0e7332f9cc34e3aa219af4634ffbc171ca50b8dc4f55d4d198b879ca73a9ef3f"
  },
  {
    "id": "m5-rbac",
    "module": 5,
    "title": "By Your Role",
    "category": "IAM",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "The access-control model that grants permissions based on a user's job role. Give the four-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
    "flagHash": "81ec15816db6f25bc770ca98a52ec8d7e3cf0eeebf5998124655f9acdc8fd867"
  },
  {
    "id": "m5-mfa",
    "module": 5,
    "title": "Three Factors",
    "category": "IAM",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "MFA factors: something you know, something you have, and something you ______.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "54085d06efce2149ff387a873c80fc8ceb733467b7b9a835325d1bbc5d63cddc"
  },
  {
    "id": "m6-rot",
    "module": 6,
    "title": "Shifted Trust",
    "category": "Cryptography",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "This term was ROT13-encoded. Decode it:\n\nsynt{choyvp_xrl_vasenfgehpgher}",
    "hint": "ROT13 shifts each letter 13 places; apply it again to reverse.",
    "flagHash": "8a1b3abe807158624f7fb4baeff5b75dd2c979c373c61b3aee27a297604cc4cb"
  },
  {
    "id": "m6-cert",
    "module": 6,
    "title": "Proof of Identity",
    "category": "Cryptography",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "A digital document, issued by a Certificate Authority, that binds a public key to an identity.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "688b4738274c19d562bc5475cd7eb265df8aa73afe87b7748ac04b258150ca07"
  },
  {
    "id": "m6-aes",
    "module": 6,
    "title": "DES Successor",
    "category": "Cryptography",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "The symmetric-key encryption standard that replaced DES. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
    "flagHash": "d5200a238583c649d215d4c026336c142226e94ed04345cac72fb626da84c5b2"
  },
  {
    "id": "m7-cia",
    "module": 7,
    "title": "Complete the Triad",
    "category": "Spring NCL",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "The CIA triad: Confidentiality, Integrity, and ______.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d"
  },
  {
    "id": "m7-hex",
    "module": 7,
    "title": "Capture the Traffic",
    "category": "Spring NCL",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "Decode this hexadecimal to reveal a network-forensics term:\n\n666c61677b7061636b65745f636170747572657d",
    "hint": "Two hex digits per character. 0x66 = 'f'.",
    "flagHash": "72ae5b9d36cd1882d0c382ee683e7a3c931eaf653bdef2db330068acd37f20c7"
  },
  {
    "id": "m7-sqli",
    "module": 7,
    "title": "Suspicious Request",
    "category": "Spring NCL",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "A web server log shows:\n\nGET /login?user=admin'--&pass=x HTTP/1.1\n\nWhat class of attack is this?\n\nSubmit as flag{two_words} with an underscore.",
    "flagHash": "262ea38fc0c2f783adc1ac3eb909446a9b37fe798a124bb4df93724de18f73aa"
  },
  {
    "id": "m8-contain",
    "module": 8,
    "title": "Stop the Spread",
    "category": "Incident Response",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "In incident response, the phase where you isolate affected systems to prevent further damage.\n\nSubmit as flag{word} (lowercase).",
    "hint": "Comes right after identification.",
    "flagHash": "529c509294e00e8f8fa602be5b90470ce200bff469bb5fa789657abfd52dd11a"
  },
  {
    "id": "m8-risk",
    "module": 8,
    "title": "The Risk Equation",
    "category": "Incident Response",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Risk is commonly expressed as Likelihood × ______.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "035cbccd7b32e1dcdab0cfb0c28cb235f43d516ffc15d8e2862e4d2fcceaa834"
  },
  {
    "id": "m8-rpo",
    "module": 8,
    "title": "Acceptable Loss",
    "category": "Incident Response",
    "difficulty": "Medium",
    "points": 75,
    "prompt": "The metric defining the maximum acceptable amount of data loss measured in time. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
    "hint": "Recovery ___ Objective.",
    "flagHash": "a8d59db2337be852ac2477eb21c1e7e7fb884708c8cbf0462905f5de82a51031"
  },
  {
    "id": "m9-b64",
    "module": 9,
    "title": "Portfolio Motto",
    "category": "Portfolio",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Decode the golden rule of a good portfolio:\n\nZmxhZ3tzaG93X3lvdXJfd29ya30=",
    "hint": "Base64.",
    "flagHash": "a3f907250ab95ea8bb377ee09f88dc17b2a76b0e7aa3b1e383130cba13fe062a"
  },
  {
    "id": "m9-brag",
    "module": 9,
    "title": "One-Pager",
    "category": "Portfolio",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "A concise one-page summary of your key skills and accomplishments.\n\nSubmit as flag{two_words} with an underscore.",
    "flagHash": "99c1684af15bd30071d669de11abc178de0e3006c35c52b5280413e3e2092cd9"
  },
  {
    "id": "m9-rev",
    "module": 9,
    "title": "Showtime",
    "category": "Portfolio",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "This message was reversed. Read it backward:\n\n}edirp_htiw_tneserp{galf",
    "hint": "Reverse the string end-to-end.",
    "flagHash": "0b24b1234991b7a78fc2d959d2473fd2d1a62d4e5bb2720838cbabca07071250"
  },
  {
    "id": "m10-secplus",
    "module": 10,
    "title": "Next Cert",
    "category": "Preparing for Cyber 3",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "The entry-level CompTIA certification this course helps prepare you for.\n\nSubmit as flag{two_words} with an underscore.",
    "flagHash": "2e573dcb5716af6154ae28cd7f204d7f3ce8bcba8827a3b5c10d13d503e1ae4f"
  },
  {
    "id": "m10-shadow",
    "module": 10,
    "title": "Learn on the Job",
    "category": "Preparing for Cyber 3",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Observing a professional at work for a short period to learn about their role is called job ______.\n\nSubmit as flag{word} (lowercase).",
    "flagHash": "6ca0e2c6c5fcabc3546ee25afe0ebb7533bbdb39e4b247057165643542881134"
  },
  {
    "id": "m10-b64",
    "module": 10,
    "title": "Keep Going",
    "category": "Preparing for Cyber 3",
    "difficulty": "Easy",
    "points": 50,
    "prompt": "Decode the mindset of every great cyber professional:\n\nZmxhZ3tuZXZlcl9zdG9wX2xlYXJuaW5nfQ==",
    "hint": "Base64.",
    "flagHash": "10b22c3c3be40d829b83bda0e7739afbd365ea5d17f6be8d0e51fa5b39768e4b"
  }
]
};

/* Phishing scenario challenge (interactive, engine type:"phish"). Each company has 3 phishing + 2 legitimate variants; one per company is shown at random. Edit the emails or add companies below. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m1-phish",
  "module": 1,
  "type": "phish",
  "title": "Phish or Legit?",
  "category": "Threats",
  "difficulty": "Medium",
  "points": 150,
  "intro": "Below are five emails — one each from PayPal, eBay, Amazon, Spotify, and Instagram. Some are real; some are phishing. Read the sender address, the links, and the tone. Enter a binary string: 1 = phishing, 0 = legitimate, one digit per email in the order shown. The emails reshuffle on every attempt.",
  "companies": [
    {
      "name": "PayPal",
      "emails": [
        {
          "phish": true,
          "from": "service@paypa1-security.com",
          "subject": "Your account has been limited",
          "body": "Dear Customer, we detected unusual activity. Your account will be permanently suspended within 24 hours unless you verify now:\nhttp://paypal-verify-account.co/login"
        },
        {
          "phish": true,
          "from": "paypal@secure-mail.ru",
          "subject": "Payment of $749.99 to Best Buy — cancel now",
          "body": "You sent $749.99. If you did NOT authorize this, cancel immediately by logging in here:\nhttp://pp-cancel.net/stop"
        },
        {
          "phish": true,
          "from": "noreply@paypal-support.help",
          "subject": "Confirm your information",
          "body": "To keep your account active, re-confirm your full SSN and card number by replying to this email."
        },
        {
          "phish": false,
          "from": "service@paypal.com",
          "subject": "You sent $25.00 to Jordan Lee",
          "body": "Hi Alex, you sent $25.00 USD to Jordan Lee. Transaction ID 4XR21. View it anytime in your PayPal activity."
        },
        {
          "phish": false,
          "from": "service@paypal.com",
          "subject": "Your receipt from Etsy",
          "body": "You paid $18.40 to Etsy Inc. Log in at paypal.com to see the full transaction details."
        }
      ]
    },
    {
      "name": "eBay",
      "emails": [
        {
          "phish": true,
          "from": "ebay@ebay-resolution-center.com",
          "subject": "Action required: verify to avoid suspension",
          "body": "Your selling privileges are on hold. Verify within 24h:\nhttp://signin-ebay.security-check.com"
        },
        {
          "phish": true,
          "from": "support@ebay.com.account-alert.co",
          "subject": "You won the auction — pay to save fees",
          "body": "Congratulations! To avoid eBay fees, pay the seller directly with gift cards or a wire transfer."
        },
        {
          "phish": true,
          "from": "member@e-bay-support.net",
          "subject": "Unusual sign-in from Russia",
          "body": "We blocked a login attempt. Confirm your password immediately here: http://ebay-unlock.net"
        },
        {
          "phish": false,
          "from": "ebay@ebay.com",
          "subject": "Your order has shipped",
          "body": "Hi Alex, your order (Logitech Mouse) shipped via USPS. Tracking: 9400 1000. Track it in My eBay."
        },
        {
          "phish": false,
          "from": "ebay@ebay.com",
          "subject": "You're the highest bidder",
          "body": "Good news — you're currently the top bidder on 'Vintage Camera'. Auction ends Saturday."
        }
      ]
    },
    {
      "name": "Amazon",
      "emails": [
        {
          "phish": true,
          "from": "auto-confirm@amaz0n-orders.com",
          "subject": "Your order could not be shipped — update payment",
          "body": "Order #112-5590 is on hold. Update your payment method now:\nhttp://amazon-billing-update.com"
        },
        {
          "phish": true,
          "from": "security@amazon-account-verify.com",
          "subject": "Suspicious login — verify within 24h",
          "body": "We detected a sign-in from a new device. Verify your identity or your account will be closed: http://verify-amazon.co"
        },
        {
          "phish": true,
          "from": "prime@amazon-rewards.info",
          "subject": "You've won a $500 Amazon gift card!",
          "body": "You were selected! Claim your $500 gift card now by entering your login and card details."
        },
        {
          "phish": false,
          "from": "shipment-tracking@amazon.com",
          "subject": "Arriving today: your package",
          "body": "Hi Alex, your package with 'USB-C Cable' is out for delivery and arriving today by 9pm."
        },
        {
          "phish": false,
          "from": "no-reply@amazon.com",
          "subject": "Your Amazon.com order of 'USB-C Cable'",
          "body": "Thanks for your order. Order total: $12.99. You can view or manage your order in Your Orders."
        }
      ]
    },
    {
      "name": "Spotify",
      "emails": [
        {
          "phish": true,
          "from": "no-reply@spotify-premium-billing.com",
          "subject": "Payment failed — update to keep Premium",
          "body": "Your Premium payment failed. Update your card in the next 24h or lose access:\nhttp://spotify-billing.co/update"
        },
        {
          "phish": true,
          "from": "account@spotify.com.verify-user.net",
          "subject": "New device detected — confirm password",
          "body": "Someone accessed your account. Confirm your password here to secure it: http://spotify-secure.net"
        },
        {
          "phish": true,
          "from": "promo@spotify-free.co",
          "subject": "Get 3 months of Premium FREE",
          "body": "Limited offer! Enter your card details to claim 3 free months before it expires tonight."
        },
        {
          "phish": false,
          "from": "no-reply@spotify.com",
          "subject": "Your July receipt",
          "body": "Hi Alex, here's your receipt for Spotify Premium Individual — $10.99. Manage your plan in your account."
        },
        {
          "phish": false,
          "from": "no-reply@spotify.com",
          "subject": "New login to your account",
          "body": "We noticed a new login from Chrome on Windows. If this was you, no action is needed."
        }
      ]
    },
    {
      "name": "Instagram",
      "emails": [
        {
          "phish": true,
          "from": "security@instagram-help-center.com",
          "subject": "Someone tried to log in",
          "body": "We blocked a login attempt. Verify it was you by confirming your password here:\nhttp://instagram-verify.co"
        },
        {
          "phish": true,
          "from": "copyright@instagram-support.co",
          "subject": "Your account will be deleted (copyright)",
          "body": "Your account violated copyright and will be deleted in 24 hours. Appeal now: http://ig-appeal.net"
        },
        {
          "phish": true,
          "from": "verify@instagobadge.com",
          "subject": "You're eligible for a verified badge!",
          "body": "Confirm your login details to claim your free blue verification badge today."
        },
        {
          "phish": false,
          "from": "security@mail.instagram.com",
          "subject": "New login to your Instagram",
          "body": "We noticed a login from an iPhone in Pittsburgh. If this was you, you can ignore this message."
        },
        {
          "phish": false,
          "from": "no-reply@mail.instagram.com",
          "subject": "Your password was changed",
          "body": "The password for your Instagram account was just changed. If you didn't do this, secure your account."
        }
      ]
    }
  ]
});

/* Module 1 leveled challenges (Easy/Medium/Hard). Rebuilds the module-1 set:
   replaces the three original single-level m1 challenges with leveled versions,
   preserving the interactive m1-phish challenge. */
(function () {
  const arr = window.COURSE_CONFIG.cyber2.ctf.challenges;
  const phish = arr.find(c => c.id === "m1-phish");
  const rest = arr.filter(c => c.module !== 1);
  const m1 = [
{
    "id": "m1-malware",
    "module": 1,
    "title": "Know Your Malware",
    "category": "Malware",
    "levels": [
        {
            "difficulty": "Easy",
            "points": 50,
            "prompt": "Malware that encrypts a victim's files and holds them hostage until a ransom is paid.\n\nSubmit as flag{answer} — one lowercase word.",
            "flagHash": "c3eab0cae2df20bf8a4b32c23cfe39e1d2e2f630a2c77d8b989431866e84712c"
        },
        {
            "difficulty": "Medium",
            "points": 100,
            "prompt": "Malware disguised as a legitimate program to trick a user into installing it — named after a Greek war story.\n\nSubmit as flag{answer} — one lowercase word.",
            "flagHash": "2e1c246c31b91f70ac8737c92773bbe13223720716f51b0a69614245134f57e5"
        },
        {
            "difficulty": "Hard",
            "points": 150,
            "prompt": "Self-replicating malware that spreads across a network on its own — no user action and no host file required.\n\nSubmit as flag{answer} — one lowercase word.",
            "flagHash": "5e71e44abcc73b58779ed4dd1faf938177c1e855d874532e4235d2cdc5e62b74"
        }
    ]
},
{
    "id": "m1-lure",
    "module": 1,
    "title": "Decode the Lure",
    "category": "Social Engineering",
    "levels": [
        {
            "difficulty": "Easy",
            "points": 50,
            "prompt": "A broad, mass email scam that tries to trick anyone who bites. Decode its name (Base64):\n\nZmxhZ3twaGlzaGluZ30=",
            "hint": "Base64 — try CyberChef or 'base64 -d'.",
            "flagHash": "01fbd5d51977823ec0902cc5fdd02dacc020930a12ed4fe0a328d5b4edd6c6c8"
        },
        {
            "difficulty": "Medium",
            "points": 100,
            "prompt": "The targeted version, aimed at a specific person or role. Decode it (ROT13):\n\nsynt{fcrne_cuvfuvat}",
            "hint": "ROT13 shifts each letter 13 places; apply it again to reverse.",
            "flagHash": "cee534b38030771eb0db5302eaaa1a27c26fef6459bfab3958474ffac94a3bb7"
        },
        {
            "difficulty": "Hard",
            "points": 150,
            "prompt": "The version that targets a company's executives — the 'big fish'. Decode it (binary, 8 bits per character):\n\n01100110 01101100 01100001 01100111 01111011 01110111 01101000 01100001 01101100 01101001 01101110 01100111 01111101",
            "hint": "Each 8-bit group is one ASCII character. 01100110 = 102 = 'f'.",
            "flagHash": "ba23888f3dc8b11a72c8c06e9caddbcb2c8e31d5e6247472539987b8c5e43bd1"
        }
    ]
},
{
    "id": "m1-adversary",
    "module": 1,
    "title": "Know the Adversary",
    "category": "Threat Actors",
    "levels": [
        {
            "difficulty": "Easy",
            "points": 50,
            "prompt": "An attacker motivated by a political or social cause rather than money.\n\nSubmit as flag{answer} — one lowercase word.",
            "flagHash": "964498e1be46865ebc13d81c8f293e01e0cb1e1e5ed840b16e845070de0ad960"
        },
        {
            "difficulty": "Medium",
            "points": 100,
            "prompt": "A stealthy, well-resourced attacker (often nation-state backed) that maintains long-term access to a network. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
            "flagHash": "1e01ef12436e5142fb83ece5126a839e0d48dc1b42058bde32c08136f96ce5a7"
        },
        {
            "difficulty": "Hard",
            "points": 150,
            "prompt": "A trusted employee or contractor who abuses their legitimate access to harm the organization.\n\nSubmit as flag{two_words} with an underscore.",
            "flagHash": "0153707293c5f5aaf8bb1ae32ada44c96ed397e58bab74256b857c6ccae06d2e"
        }
    ]
}
  ].concat(phish ? [phish] : []);
  window.COURSE_CONFIG.cyber2.ctf.challenges = rest.concat(m1);
})();

/* Module 1 vocabulary challenge (interactive, engine type:"vocab").
   Easy = 3 terms, Medium = 5 terms, Hard = 4-minute rapid fire (one term at a
   time, blank letter-length boxes, no hints; 20 XP per correct term). Terms are
   drawn at random from the module's vocab pool (window.CTF_VOCAB, sourced from
   cyber2/vocab-data.js) so students get different terms. Difficulty counts and
   XP are set in ctf.js (VOCAB_COUNTS / VOCAB_PTS / RAPID_*).
   poolModule selects which vocab module to draw from. */
/* Vocabulary Recall for every unit on the class page (modules 1-10).
   Terms are drawn from the WHOLE Cyber 2 vocab pool, but each unit gives extra
   weight (bias) to terms matching its topics from the class module cards, so a
   unit's flag surfaces mostly on-topic vocabulary while still mixing in review.
   HARD level uses a different mini-game per module (hardMode) for variety. */
var HARD_BY_MODULE = {
  2: "cipher", 3: "unscramble", 4: "speedmatch", 5: "blitz", 6: "wordsearch",
  7: "cipher", 8: "unscramble", 9: "speedmatch", 10: "blitz"
};
var MODULE_BIAS = {
  1: ["social engineering", "phishing", "pretext", "elicit", "adversary", "script kiddie", "hacktivist", "insider", "zero-day", "reconnaissance", "osint", "malware", "threat", "attack"],
  2: ["confidential", "integrity", "availability", "asset", "risk", "control", "defense in depth", "mitigation", "residual", "managerial", "preventative", "detective", "corrective"],
  3: ["osint", "open source", "cryptograph", "pki", "public key", "password", "cracking", "hash", "salt", "log", "traffic", "wireless", "scanning", "reconnaissance", "web application", "forensic", "enumeration", "exploit", "injection", "metasploit"],
  4: ["segmentation", "dmz", "vlan", "zone", "cloud", "defense in depth", "least privilege", "separation", "secure coding", "input validation", "error handling", "denial of service", "dos", "ddos", "man-in-the-middle", "on-path", "authentication", "authorization", "accounting", "endpoint", "firewall", "antivirus", "anti-malware", "intrusion", "ids", "ips"],
  5: ["authentication", "authorization", "ldap", "protocol", "multifactor", "single sign", "sso", "active directory", "public key", "pki", "certificate", "access control", "identity", "biometric", "factor", "least privilege"],
  6: ["symmetric", "asymmetric", "hashing", "salt", "digital signature", "pki", "public key", "private key", "key", "encryption", "decryption", "cipher", "plaintext", "ciphertext", "aes", "rsa", "cryptograph"],
  7: ["ethical hacking", "exploit", "penetration", "vulnerability", "attack", "reconnaissance", "enumeration", "privilege escalation"],
  8: ["risk", "mitigation", "assessment", "incident", "continuity", "nist", "recovery", "residual", "threat", "asset", "control"],
  9: [],
  10: []
};
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function (mm) {
  window.COURSE_CONFIG.cyber2.ctf.challenges.push({
    id: "m" + mm + "-vocab", module: mm, type: "vocab",
    title: "Vocabulary Recall", category: "Vocabulary",
    bias: MODULE_BIAS[mm], hardMode: HARD_BY_MODULE[mm]
  });
});

/* ============================================================
   MODULE 3 — Fall National Cyber League (Unit 3).
   Flags mapped to the unit's course objectives / NCL competition domains:
   OSINT, Scanning & Recon, Cryptography/PKI, Password Cracking, Log &
   Traffic Analysis, Enumeration & Exploitation. Text answers are stored as
   SHA-256 hashes (never plaintext); the objective is named in each prompt.
   ============================================================ */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m3-recon", "module": 3, "title": "Scanning & Reconnaissance", "category": "Scanning & Recon",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Scanning & Reconnaissance. Every NCL engagement opens with recon. What is the industry-standard command-line tool for scanning a target host to discover its open ports and running services? (answer with the tool name)",
      "hint": "Three-letter name; it maps a network. “network mapper.”", "flagHash": "5286b91aa11e48184da2c742f7f08492b8be0e02c01188b55b47d4be0e23fb18" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Reconnaissance / Intelligence Gathering. Collecting information about a target from freely available public sources — WHOIS records, social media, search engines — is known by what four-letter acronym?",
      "hint": "Open ___ ___ Intelligence.", "flagHash": "607b00503c7e5203980e2f657b7493e52faaf49c99c42ec541f3b36ee1bd67da" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Scanning & Enumeration. In Nmap, which single flag turns on OS detection, version/service detection, default script scanning, and traceroute all at once? (include the dash)",
      "hint": "One letter after a dash — “aggressive.”", "flagHash": "c274891790345c56cef3b53c026bdc48150948fa60c56306073d6fea7766ad6a" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m3-crack", "module": 3, "title": "Password Cracking", "category": "Password Cracking",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Password Cracking. Random bytes mixed into a password before it is hashed, so that two identical passwords produce different hash values. What is it called?",
      "hint": "You add it to food, too.", "flagHash": "63479ad69a090b258277ec8fba6f99419a2ffb248981510657c944ccd1148e97" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Password Cracking. Name the classic offline password-cracking tool named after a Biblical figure (type the full common name, e.g. “___ the ___”).",
      "hint": "John the R______.", "flagHash": "96630fcc6c44b51662f217f8bee79f429984c61d41965f358a16c4ede783fabc" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Password Cracking. What GPU-accelerated password-recovery tool is the NCL favorite for extremely high-speed hash cracking?",
      "hint": "“hash” + a word meaning cat.", "flagHash": "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m3-decode", "module": 3, "title": "Crypto Decode", "category": "Cryptography & PKI",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Cryptography. Decrypt this ROT13 message and submit the plaintext:\n\n    PLORE",
      "hint": "ROT13 shifts every letter by 13. It spells this course's subject.", "flagHash": "b4bf5d7e5fcf89ef8adb64ec9c624db850d10f2afef020ed9ef23892df0833af" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Cryptography / Encoding. Decode this Base64 string and submit the exact result:\n\n    ZmxhZ3tuY2x9",
      "hint": "Base64 — the result looks like flag{...}.", "flagHash": "5908bc07412f19991426f90bdf778501ff5b94ad2ba2e81a1588cfb964eced0c" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Cryptography / Encoding. Decode this hexadecimal string and submit the exact result:\n\n    666c61677b706b697d",
      "hint": "Each pair of hex digits is one ASCII character.", "flagHash": "643d253138e4cd0d077475c35bd9a197ce846e8bd00d5e8a62a09169d5ea508b" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m3-tools", module: 3, type: "match",
  title: "Match the NCL Tool to its Domain", category: "Enumeration & Exploitation", points: 150,
  intro: "Objective — Enumeration & Exploitation. NCL rewards knowing the right tool for each domain. Tap a tool, then tap the domain it belongs to.",
  pairs: [
    { left: "Wireshark", right: "Traffic Analysis" },
    { left: "Nmap", right: "Scanning & Recon" },
    { left: "Hashcat", right: "Password Cracking" },
    { left: "Metasploit", right: "Exploitation" },
    { left: "Autopsy", right: "Forensics" },
    { left: "Aircrack-ng", right: "Wireless" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m3-methodology", module: 3, type: "order",
  title: "The Penetration-Test Methodology", category: "Enumeration & Exploitation", points: 150,
  intro: "Objective — Enumeration & Exploitation. Put the five phases of an ethical hack in the order a professional actually follows them, from first to last.",
  steps: [
    "Reconnaissance — gather OSINT on the target",
    "Scanning — map open ports and services with Nmap",
    "Enumeration — pull usernames, shares, and software versions",
    "Exploitation — gain access, often via Metasploit",
    "Privilege Escalation — rise to admin / root",
    "Covering Tracks — clear logs and maintain access"
  ]
});

/* ============================================================
   MODULE 4 — Architecture & Design / Network Security (Unit 4).
   Flags mapped to unit objectives: segmentation, DMZ/VLAN, secure zones,
   defense in depth, least privilege, separation of duties, secure coding,
   input validation, error handling, DoS/DDoS, MitM, AAA, endpoint security,
   firewalls, antivirus, IDS/IPS. Text answers stored as SHA-256 hashes.
   ============================================================ */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m4-zones", "module": 4, "title": "Segmentation & Secure Zones", "category": "Architecture & Design",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Secure Zones. A subnet placed between the public internet and the internal network to host public-facing servers (web, email, DNS) is called a ___. (three-letter acronym)",
      "hint": "“Demilitarized zone.”", "flagHash": "a393efd3babafb0c48ef270d65b5c0c93882063811d40d43407723b8ded3c6c3" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Network Segmentation. Logically dividing one physical switch into several isolated broadcast domains is done with a ___. (four-letter acronym)",
      "hint": "Virtual Local Area Network.", "flagHash": "c3b258168c41c0bce97616716bef315eeed33eb1142904bfe7f32eb392c7cf80" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Defense in Depth. Layering multiple independent security controls so that if one fails the others still protect the asset is called 'defense in ___'. (one word)",
      "hint": "How deep the layers go.", "flagHash": "ded32129b05bfc16ce501e654a169960583352cbc974824ed16ce94855904386" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m4-aaa", "module": 4, "title": "AAA & Access Control", "category": "Identity & Access",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Authentication. Proving you are who you claim to be — with a password, token, or biometric — is called ___. (one word)",
      "hint": "First “A” in AAA.", "flagHash": "b9d90628453938c578c7f826de5e5bd2bcac29e10c5526888384ba74fcea563e" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — AAA Framework. The AAA model stands for authentication, authorization, and ___. (the third A — tracking what users do)",
      "hint": "Logging and auditing user actions.", "flagHash": "2a31aefa266db9cca794ee878f884a57bf190075ae0ed167b65b43e558b596ab" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Least Privilege. Granting a user only the minimum access required to perform their job, and nothing more, is the principle of ___ ___. (two words)",
      "hint": "least ______.", "flagHash": "5b9cc3a4da689a7cc58007c6c32bfe1b35b73e7c1f5547d6df79799d001f4494" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m4-availability", "module": 4, "title": "Attacks on Availability", "category": "Network Attacks",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — DoS. Flooding a server with traffic from a single source so legitimate users can no longer reach it is a ___ attack. (three-letter acronym)",
      "hint": "Denial of Service.", "flagHash": "c1299854f2b209632ab22aeb848c24c2b02da4b37ecf93a830ee9c7f6f809924" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — DDoS. That same flooding attack launched simultaneously from thousands of compromised machines (a botnet) is a ___ attack. (four-letter acronym)",
      "hint": "Distributed Denial of Service.", "flagHash": "deeb92f091caa8e2404885e30da06e8507eee571e81b062ef6723c4ec0b8ecf0" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — MitM. An attacker who secretly relays and can alter traffic between two parties who believe they are communicating directly is running a ___ attack. Type the full hyphenated name (e.g. word-word-the-word).",
      "hint": "man-in-the-______.", "flagHash": "739d02fa6e447dd70c27887993f4fa6054147cb8a8a438a7c158d7b092331903" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m4-securecode", "module": 4, "title": "Secure Coding", "category": "Secure Design",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Input Validation. Checking that user input is the expected type, length, and format before an application processes it is called input ___. (one word)",
      "hint": "Making input valid.", "flagHash": "98c41dcd20b86b86830ec0794559835614458ceaae0f0ec77a3ed1cd3a1f7d55" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Error Handling. Showing a generic message instead of a detailed stack trace when a program fails (so attackers learn nothing) is proper error ___. (one word)",
      "hint": "How you handle an error.", "flagHash": "19ff8761fa648ade541f90a8ad63d989cff487c640eefe0c9d158c78b5d1134b" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Separation of Duties. Splitting a critical task among multiple people so no single person can abuse it is called 'separation of ___'. (one word)",
      "hint": "Your job responsibilities.", "flagHash": "bb4ad70714e56e0192078ff46bae3ae73e04a55c21fedea9f31afde3cdc09baf" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m4-defenses", module: 4, type: "match",
  title: "Match the Defense to its Job", category: "Network Security", points: 150,
  intro: "Objective — Endpoint & Network Security. Match each security control to what it actually does. Tap a control, then tap its job.",
  pairs: [
    { left: "Firewall", right: "Filters traffic between zones" },
    { left: "IDS", right: "Detects & alerts on intrusions" },
    { left: "IPS", right: "Detects & blocks intrusions" },
    { left: "Antivirus", right: "Removes malware on endpoints" },
    { left: "DMZ", right: "Isolates public-facing servers" },
    { left: "VLAN", right: "Segments a switch logically" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m4-depth", module: 4, type: "order",
  title: "Layers of Defense in Depth", category: "Architecture & Design", points: 150,
  intro: "Objective — Defense in Depth. Order the layers of a layered defense from the outermost (network edge) inward to the data itself.",
  steps: [
    "Perimeter — edge firewall & DMZ",
    "Network — VLAN segmentation with IDS/IPS",
    "Endpoint — antivirus & host firewalls",
    "Application — secure coding & input validation",
    "Data — encryption & least-privilege access"
  ]
});

/* ============================================================
   BEAT NEMESIS — hand-authored boss question bank (optional, grows over time).
   The boss also auto-generates questions from the vocabulary pool; these add
   scenario / applied questions of any difficulty. Just push more objects:
     kind:"mc"  -> multiple choice (choices[] + answer must equal one choice)
     kind:"text"-> typed answer (answer = accepted term/number)
     diff: "Easy" | "Medium" | "Hard"  (drives damage: 8 / 12 / 20)
     module + topic: used for adaptive weighting (missed topics recur)
   ============================================================ */
window.COURSE_CONFIG.cyber2.ctf.bossQuestions = [
  { module: 1, topic: "M1", diff: "Easy", kind: "mc",
    prompt: "Which is a social-engineering attack?",
    choices: ["Phishing email", "SQL injection", "Buffer overflow", "DDoS flood"], answer: "Phishing email" },
  { module: 3, topic: "M3", diff: "Medium", kind: "mc",
    prompt: "A pcap shows repeated traffic to TCP 22. Which service is most likely in use?",
    choices: ["SSH", "HTTPS", "DNS", "SMTP"], answer: "SSH" },
  { module: 4, topic: "M4", diff: "Medium", kind: "text",
    prompt: "A subnet between the internet and the LAN that hosts public servers is called a ___. (acronym)",
    answer: "DMZ" },
  { module: 4, topic: "M4", diff: "Hard", kind: "mc",
    prompt: "Thousands of botnet devices flood a site until it drops. Best-fit term?",
    choices: ["DDoS", "MitM", "Phishing", "Privilege escalation"], answer: "DDoS" },
  { module: 5, topic: "M5", diff: "Easy", kind: "mc",
    prompt: "Password + phone code is an example of what?",
    choices: ["Multifactor authentication", "Single sign-on", "Authorization", "Encryption"], answer: "Multifactor authentication" },
  { module: 6, topic: "M6", diff: "Hard", kind: "text",
    prompt: "Encryption where the SAME key encrypts and decrypts is called ___ encryption. (one word)",
    answer: "symmetric" }
];

/* ============================================================
   MODULE 5 — Identity & Access Management (Unit 5).
   Objectives: authentication, authorization, LDAP, authentication protocols,
   multifactor authentication, single sign-on (SSO), Active Directory, PKI,
   digital certificates. 4 interactive captures + a leveled text set.
   ============================================================ */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m5-iam-match", module: 5, type: "match",
  title: "Match the IAM Concept", category: "Identity & Access", points: 150,
  intro: "Objective — IAM Fundamentals. Match each identity & access concept to what it does. Tap a concept, then tap its description.",
  pairs: [
    { left: "LDAP", right: "Protocol for querying a directory of users" },
    { left: "SSO", right: "One login grants access to many apps" },
    { left: "MFA", right: "Requires two or more independent factors" },
    { left: "Active Directory", right: "Microsoft's directory & auth service" },
    { left: "PKI", right: "Issues & manages digital certificates" },
    { left: "Kerberos", right: "Ticket-based authentication protocol" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m5-factors", module: 5, type: "match",
  title: "The Authentication Factors", category: "Authentication", points: 150,
  intro: "Objective — Multifactor Authentication. Match each authentication factor to an example of it. Tap a factor, then tap its example.",
  pairs: [
    { left: "Something you know", right: "Password or PIN" },
    { left: "Something you have", right: "Phone or security token" },
    { left: "Something you are", right: "Fingerprint or face scan" },
    { left: "Somewhere you are", right: "GPS or network location" },
    { left: "Something you do", right: "Typing rhythm or signature" }
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m5-sso", module: 5, type: "order",
  title: "The SSO Login Handshake", category: "Single Sign-On", points: 150,
  intro: "Objective — Single Sign-On. Put the steps of a single sign-on login in the order they actually happen, first to last.",
  steps: [
    "User tries to open a protected app",
    "App redirects the user to the identity provider (IdP)",
    "User signs in and completes MFA",
    "IdP issues a signed token / assertion",
    "App verifies the token and grants access"
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m5-pki", module: 5, type: "order",
  title: "Digital Certificate Lifecycle", category: "PKI & Certificates", points: 150,
  intro: "Objective — Public Key Infrastructure. Order the life of a digital certificate from creation to end-of-life.",
  steps: [
    "User generates a key pair and a certificate signing request (CSR)",
    "CSR is submitted to a Certificate Authority (CA)",
    "CA verifies the requester's identity",
    "CA issues the signed digital certificate",
    "Certificate is installed and used to prove identity",
    "Certificate expires or is revoked (CRL / OCSP)"
  ]
});
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  "id": "m5-authz", "module": 5, "title": "Authentication vs Authorization", "category": "Access Control",
  "levels": [
    { "difficulty": "Easy", "points": 50,
      "prompt": "Objective — Authorization. Verifying WHO you are is authentication. Deciding WHAT you are allowed to do once you are logged in is called ___. (one word)",
      "hint": "Are you authorized?", "flagHash": "cbb82ebec6051b780ad26655ee48b5b42658c4ac49438888aac829e82195584f" },
    { "difficulty": "Medium", "points": 100,
      "prompt": "Objective — Directory Protocols. What protocol is used to query and modify directory services such as Active Directory? (four-letter acronym)",
      "hint": "Lightweight Directory Access Protocol.", "flagHash": "f718933d8b6a5aed0e7f513f0075dead9ac208da3fde987d248562fc0b38016e" },
    { "difficulty": "Hard", "points": 150,
      "prompt": "Objective — Multifactor Authentication. Requiring a password PLUS a one-time code from your phone is an example of multi-factor authentication, commonly abbreviated as which three-letter acronym?",
      "hint": "___-Factor Authentication.", "flagHash": "cb0356a0532e824bd17b1ad6f24af01a2d9bbdda8891918ab6b91d9835f7c3ec" }
  ]
});




/* Module 1 interactive "spot the red flags" challenge (engine type:"spot").
   Student clicks every element that is a phishing red flag; correct when the
   selected set exactly matches items flagged bad:true. Edit items below —
   each clickable piece: {field:"from"|"subject"|"body", text, click:true, bad:true/false, link:true?}. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m1-spot", module: 1, type: "spot",
  title: "Spot the Red Flags", category: "Phishing", points: 150,
  intro: "This email is a phishing attempt. Click every element that is a red flag — the sender, the subject, the link, and anything suspicious in the body. Click again to deselect, then submit. You must find them all and select nothing safe.",
  items: [
  {
    "field": "from",
    "text": "security@",
    "click": false
  },
  {
    "field": "from",
    "text": "paypa1-secure.com",
    "click": true,
    "bad": true
  },
  {
    "field": "subject",
    "text": "URGENT: ",
    "click": true,
    "bad": true
  },
  {
    "field": "subject",
    "text": "Your account will be ",
    "click": false
  },
  {
    "field": "subject",
    "text": "permanently closed in 24 hours",
    "click": true,
    "bad": true
  },
  {
    "field": "body",
    "text": "Dear Valued Customer,\n\n",
    "click": true,
    "bad": true
  },
  {
    "field": "body",
    "text": "We noticed unusual activity on your account. ",
    "click": false
  },
  {
    "field": "body",
    "text": "You must verify your identity immediately or lose access. ",
    "click": false
  },
  {
    "field": "body",
    "text": "Click here to confirm your details: ",
    "click": false
  },
  {
    "field": "body",
    "text": "http://paypal-verify-login.co/secure",
    "click": true,
    "bad": true,
    "link": true
  },
  {
    "field": "body",
    "text": "\n\nPlease provide your ",
    "click": false
  },
  {
    "field": "body",
    "text": "password and full Social Security number",
    "click": true,
    "bad": true
  },
  {
    "field": "body",
    "text": " to complete verification.\n\nThank you,\nThe PayPal Team",
    "click": false
  }
]
});

/* Module 1 interactive "Match the Attack" (engine type:"match"). Student pairs
   each scenario (left) to the attack it describes (right). Correct when every
   pair is matched to its own right. Right labels shuffle each load. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m1-match", module: 1, type: "match",
  title: "Match the Attack", category: "Attacks", points: 150,
  intro: "Each scenario on the left describes a common attack. Tap a scenario, then tap the attack type that matches it. Get all of them right and submit to capture the flag.",
  pairs: [
    { left: "Thousands of hijacked devices flood a website with traffic until it goes offline for everyone.", right: "DDoS" },
    { left: "A fake bank login page tricks a user into typing their username and password.", right: "Phishing" },
    { left: "An attacker secretly sits between two parties on a network, relaying and reading their messages.", right: "Man-in-the-Middle" },
    { left: "Software silently tries millions of password combinations until one finally works.", right: "Brute Force" },
    { left: "Malicious commands are typed into a website's search box to trick its database into leaking data.", right: "SQL Injection" },
    { left: "A caller pretends to be IT support and talks an employee into revealing their password.", right: "Social Engineering" }
  ]
});

/* Module 1 interactive "Order the Kill Chain" (engine type:"order"). Steps are
   listed here in the CORRECT order; the engine shuffles them for the student,
   who reorders with arrows. Correct when the sequence matches this order. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m1-order", module: 1, type: "order",
  title: "Order the Kill Chain", category: "Attacks", points: 150,
  intro: "The Lockheed Martin Cyber Kill Chain breaks an intrusion into seven stages. Use the arrows to put them in the order an attacker actually follows, from first to last.",
  steps: [
    "Reconnaissance \u2014 research and pick the target",
    "Weaponization \u2014 build the malware payload",
    "Delivery \u2014 send it (email, USB, web) to the victim",
    "Exploitation \u2014 the payload triggers and runs code",
    "Installation \u2014 malware installs a foothold on the system",
    "Command & Control \u2014 the system phones home to the attacker",
    "Actions on Objectives \u2014 steal, encrypt, or destroy data"
  ]
});

/* Module 3 third interactive capture (Match) \u2014 encodings & crypto primitives. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m3-encodings", module: 3, type: "match",
  title: "Match the Encoding or Cipher", category: "Cryptography & PKI", points: 150,
  intro: "Objective \u2014 Cryptography. NCL players must recognize encodings on sight. Tap an item, then tap what it is.",
  pairs: [
    { left: "ROT13", right: "Letter-shift (Caesar) cipher" },
    { left: "Base64", right: "Binary-to-text encoding" },
    { left: "Hexadecimal", right: "Base-16 encoding" },
    { left: "SHA-256", right: "One-way hash function" },
    { left: "AES", right: "Symmetric encryption" },
    { left: "RSA", right: "Asymmetric encryption" }
  ]
});

/* Module 4 third interactive capture (Match) \u2014 attack to its best defense. */
window.COURSE_CONFIG.cyber2.ctf.challenges.push({
  id: "m4-attack-defense", module: 4, type: "match",
  title: "Match the Attack to its Defense", category: "Network Security", points: 150,
  intro: "Objective \u2014 Defensive Design. Each attack has a primary countermeasure. Tap an attack, then tap the defense that best stops it.",
  pairs: [
    { left: "DDoS flood", right: "Rate limiting & traffic scrubbing" },
    { left: "Man-in-the-Middle", right: "TLS / end-to-end encryption" },
    { left: "Malware on a laptop", right: "Endpoint antivirus" },
    { left: "SQL injection", right: "Input validation" },
    { left: "Stolen password", right: "Multifactor authentication" },
    { left: "Unauthorized network access", right: "Firewall rules" }
  ]
});

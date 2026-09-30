// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   CYBER3 — CTF content (challenges, boss questions, frameworks).
   Loaded right after ../config.js by cyber3/ctf.html, cyber3/profile.html and the
   teacher pages. Edit challenges HERE, in the one challenges: [ ... ] array.
   ============================================================ */
window.COURSE_CONFIG = window.COURSE_CONFIG || {};
window.COURSE_CONFIG.cyber3 = window.COURSE_CONFIG.cyber3 || {};


window.COURSE_CONFIG.cyber3.ctf = {
  adversary: "VECTOR",
  adversaryColor: "#d4af37",
  adversaryColor2: "#f4d160",
  adversaryGlow: "#ffd700",
  title: "Capture The Flag",
  intro: "Solve each challenge, find the hidden flag, and submit it below — challenges are grouped by module. Flags always look like flag{...}. Earn XP, climb the ranks, and capture them all. Progress saves automatically. An adversary named VECTOR lurks here — stay sharp.",
  modules: [
    "Job Shadowing / Internship","Personalized Cybersecurity Learning Plan","Preparing for Your Cybersecurity Career",
    "Independent Module: Career Pathway","Independent Module: Cyber Trends","Cybersecurity Competition",
    "Industry Certification","Impactful / Passion Project"
  ],
  challenges: [

  /* MODULE 1 — Job Shadowing / Internship ─────────────────────────────────── */
  { id: "c3-m1-pitch", module: 1, title: "Sell Yourself Fast", category: "Networking",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "A brief, rehearsed summary of who you are and what you're looking for — short enough to deliver during a short elevator ride.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "Think of the setting: a short ride in a moving box, and what you'd say to a stranger in it.",
        flagHash: "dd30ca7b662acf08739b36bbbd9ef9d9d55ecc1320a7d89a26c011d2cfe295c0" },
      { difficulty: "Medium", points: 100,
        prompt: "Contacting a professional you don't know to ask for advice, a shadow day, or an opportunity.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "It's not warm — it's the opposite temperature — and it's you reaching out first.",
        flagHash: "14f8e4e3313635e6d290b52e7fd51387e758e12e23f95e6f4fefaac9f8fd2b63" },
      { difficulty: "Hard", points: 150,
        prompt: "A recommendation from someone who already knows the employer, used to open a door for you.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's what you get when someone vouches for you by name.",
        flagHash: "a6758602032a35211325a766be740feb1030271a0ef9be22b79423f1d6e86100" }
    ] },

  { id: "c3-m1-match", module: 1, title: "Match the Outreach Move", category: "Networking", type: "match", points: 150,
    intro: "Objective — Reflect on outreach strategies. Match each term to its definition. Tap a term, then tap its definition.",
    pairs: [
      { left: "Elevator Pitch", right: "A 30-second personal introduction" },
      { left: "Informational Interview", right: "A conversation to learn about a role, not to get hired" },
      { left: "Cold Outreach", right: "Contacting someone you don't know for an opportunity" },
      { left: "Referral", right: "A recommendation from someone who already knows the employer" }
    ] },

  { id: "c3-m1-order", module: 1, title: "Land the Shadow Day", category: "Networking", type: "order", points: 150,
    intro: "Objective — Build a professional communication plan. Order these steps to land a job shadow, first to last.",
    steps: [
      "Identify a professional in a role you're curious about",
      "Research their company and role beforehand",
      "Send a polite, specific outreach message",
      "Follow up with a thank-you and next steps"
    ] },

  { id: "c3-m1-etiquette", module: 1, title: "Networking Do's and Don'ts", category: "Networking", type: "match", points: 150,
    intro: "Objective — Effective networking strategies. Judge each behavior. Tap the behavior, then tap the verdict.",
    pairs: [
      { left: "Following up within 24 hours", right: "Good practice" },
      { left: "Asking for a job in your first message", right: "Poor practice" },
      { left: "Researching the person before reaching out", right: "Good practice" },
      { left: "Sending the same generic message to 50 people", right: "Poor practice" }
    ] },

  { id: "c3-m1-vocab", module: 1, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["elevator pitch","informational interview","cold outreach","referral","networking"],
    hardMode: "unscramble" },

  /* MODULE 2 — Personalized Cybersecurity Learning Plan ───────────────────── */
  { id: "c3-m2-smart", module: 2, title: "Set a Real Goal", category: "Self-Direction",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "The acronym for goals that are Specific, Measurable, Achievable, Relevant, and Time-bound.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Five words, first letters spell a common word meaning 'clever'.",
        flagHash: "e8eab53c44e6ea6f4487992c7d19b2f753fd1667c9b9fc22d762d98541fcf544" },
      { difficulty: "Medium", points: 100,
        prompt: "The belief that abilities and intelligence can be developed through dedication and hard work.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "The opposite is believing your abilities are 'fixed'. This one can expand.",
        flagHash: "5c8eb9379d506f2e174c2285e81883f56e76387d26ab1a15033ecb4ac34d32c0" },
      { difficulty: "Hard", points: 150,
        prompt: "A living document of your work samples used to demonstrate skills and growth over time.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Artists and photographers keep one of these too.",
        flagHash: "686f545978332d6128539653c2d3cb9c9ef9e8bf42da4aff2689116de7105503" }
    ] },

  { id: "c3-m2-goodgoal", module: 2, title: "SMART or Not?", category: "Self-Direction", type: "match", points: 150,
    intro: "Objective — Build a clear learning plan. Judge each goal statement. Tap the goal, then tap the verdict.",
    pairs: [
      { left: "\"Pass the Security+ practice exam at 85% by March 1\"", right: "SMART goal" },
      { left: "\"Get better at cybersecurity\"", right: "Not SMART" },
      { left: "\"Complete 2 CTF modules per week this quarter\"", right: "SMART goal" },
      { left: "\"Learn everything about hacking\"", right: "Not SMART" }
    ] },

  { id: "c3-m2-plan", module: 2, title: "Build the Plan", category: "Self-Direction", type: "order", points: 150,
    intro: "Objective — Build and improve a learning plan. Order the steps to create a personalized learning plan.",
    steps: [
      "Complete a self-assessment of strengths and gaps",
      "Set a SMART goal based on the assessment",
      "Draft the plan and share it for feedback",
      "Revise the plan using feedback",
      "Track progress in a portfolio"
    ] },

  { id: "c3-m2-loop", module: 2, title: "Match the Feedback Source", category: "Self-Direction", type: "match", points: 150,
    intro: "Objective — Improve your plan using feedback. Match each feedback source to what it's best for. Tap the source, then tap its use.",
    pairs: [
      { left: "Teacher feedback", right: "Aligning your plan to course objectives" },
      { left: "Classmate feedback", right: "A peer perspective on clarity and realism" },
      { left: "Mentor feedback", right: "Industry-specific guidance from experience" },
      { left: "Self-reflection", right: "Noticing your own growth over time" }
    ] },

  { id: "c3-m2-vocab", module: 2, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["self-assessment","smart goal","growth mindset","portfolio","feedback loop"],
    hardMode: "speedmatch" },

  /* MODULE 3 — Preparing for Your Cybersecurity Career ────────────────────── */
  { id: "c3-m3-resume", module: 3, title: "Build the Paper Trail", category: "Career Prep",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "A one-page professional summary of your education, experience, and skills.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "You hand this to an employer before you ever say a word.",
        flagHash: "5c9825b2206faa1aacb9d18a697f9966b4dd72bf26f675d008ab30103805ddfd" },
      { difficulty: "Medium", points: 100,
        prompt: "The professional networking platform used to build an online career profile and connect with employers.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's a professional social network, named for the connections it creates.",
        flagHash: "3288b4fbe3f74ae514beaba00684f4607157e172704a5b8f68587913de5bbdf8" },
      { difficulty: "Hard", points: 150,
        prompt: "A document that accompanies a resume, explaining why you're a strong fit for a specific role.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "It comes with the resume but isn't the resume — it 'covers' the introduction.",
        flagHash: "775207e88cc56706d239a2c64ec662e6722d415b77df2c589095c42bc8dbd9b9" }
    ] },

  { id: "c3-m3-tools", module: 3, title: "Match the Career Tool", category: "Career Prep", type: "match", points: 150,
    intro: "Objective — Craft a professional resume and brand. Match each tool to its purpose. Tap the tool, then tap its purpose.",
    pairs: [
      { left: "Resume", right: "Summarizes education, experience, and skills" },
      { left: "Cover Letter", right: "Explains fit for one specific role" },
      { left: "LinkedIn Profile", right: "Builds an ongoing professional brand" },
      { left: "Mock Interview", right: "Practices answering questions under pressure" }
    ] },

  { id: "c3-m3-timeline", module: 3, title: "Career Prep Timeline", category: "Career Prep", type: "order", points: 150,
    intro: "Objective — Design a strategic career plan. Order the steps of preparing for a cybersecurity career, first to last.",
    steps: [
      "Research roles and required certifications",
      "Build a resume and LinkedIn profile",
      "Practice interviewing with mock sessions",
      "Apply to internships or entry-level roles",
      "Negotiate an offer and plan next certifications"
    ] },

  { id: "c3-m3-brand", module: 3, title: "Strong or Weak Brand?", category: "Career Prep", type: "match", points: 150,
    intro: "Objective — Build a compelling personal brand. Judge each LinkedIn habit. Tap the habit, then tap the verdict.",
    pairs: [
      { left: "Listing specific projects and tools used", right: "Strong brand" },
      { left: "Leaving the profile photo blank", right: "Weak brand" },
      { left: "Posting about a CTF you completed", right: "Strong brand" },
      { left: "Copy-pasting a generic summary", right: "Weak brand" }
    ] },

  { id: "c3-m3-vocab", module: 3, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["resume","linkedin","cover letter","mock interview","personal brand"],
    hardMode: "blitz" },

  /* MODULE 4 — Independent Module: Career Pathway ─────────────────────────── */
  { id: "c3-m4-roles", module: 4, title: "Know the Role", category: "Career Pathways",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "The professional who is legally authorized to attack a system in order to find its weaknesses before real adversaries do.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "They 'test' by 'penetrating' — with permission.",
        flagHash: "934138c093d5f4ea899889dee44bd900ba3f2e691e92051a238f939b96b6c93a" },
      { difficulty: "Medium", points: 100,
        prompt: "The three-letter acronym for the team that monitors an organization's systems around the clock for threats.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Security ___ Center — the room full of monitors you've probably seen in movies.",
        flagHash: "4225c6abc26069ccbfd4646075ff0579d4d8f8d4a31b1f235f5001fa91e89138" },
      { difficulty: "Hard", points: 150,
        prompt: "Gathering information about adversaries and their tactics in order to anticipate and defend against attacks.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "It's 'intelligence' work — but about cyber 'threats' specifically.",
        flagHash: "738f317e10ce26700fc52c5edfdd08faef6fc4a65d07e4c17a84abea05be1780" }
    ] },

  { id: "c3-m4-match", module: 4, title: "Match the Cyber Career", category: "Career Pathways", type: "match", points: 150,
    intro: "Objective — Explore cybersecurity career pathways. Match each role to its focus. Tap the role, then tap its focus.",
    pairs: [
      { left: "Penetration Tester", right: "Attacks systems with permission to find flaws" },
      { left: "SOC Analyst", right: "Monitors systems for threats around the clock" },
      { left: "Digital Forensics Investigator", right: "Investigates what happened after an incident" },
      { left: "Security Architect", right: "Designs secure systems before they're built" }
    ] },

  { id: "c3-m4-defoff", module: 4, title: "Offense or Defense?", category: "Career Pathways", type: "match", points: 150,
    intro: "Objective — Compare offensive and defensive roles. Sort each role. Tap the role, then tap its side.",
    pairs: [
      { left: "Penetration Tester", right: "Offensive" },
      { left: "Red Team Operator", right: "Offensive" },
      { left: "SOC Analyst", right: "Defensive" },
      { left: "Incident Responder", right: "Defensive" }
    ] },

  { id: "c3-m4-path", module: 4, title: "Build the Pathway", category: "Career Pathways", type: "order", points: 150,
    intro: "Objective — Design a strategic career plan. Order the typical steps of a cybersecurity career pathway.",
    steps: [
      "Earn a foundational certification (like Security+)",
      "Take an entry-level role, such as help desk or SOC tier 1",
      "Specialize with a role-specific certification",
      "Move into a specialized role, like penetration testing",
      "Pursue advanced certifications or leadership tracks"
    ] },

  { id: "c3-m4-vocab", module: 4, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["career pathway","penetration tester","soc analyst","threat intelligence","certification path"],
    hardMode: "cipher" },

  /* MODULE 5 — Independent Module: Cyber Trends ───────────────────────────── */
  { id: "c3-m5-trends", module: 5, title: "Name the Trend", category: "Cyber Trends",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "A security model where no user or device is trusted by default, even inside the network perimeter.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "The model's name says exactly how much trust it starts with: none.",
        flagHash: "0176402c7fd994d264332a20e3fa0c8957406868c48a82efb448247373c4c820" },
      { difficulty: "Medium", points: 100,
        prompt: "An attack that compromises a trusted vendor or supplier in order to reach the real target.\n\nSubmit as flag{answer} — three words joined, no space.",
        hint: "Think of the chain of companies that supply parts to a bigger target — attack a weak link.",
        flagHash: "02a57c4b6e5bd752022994812234632054fc7ecc2f255c3f162ee8e1d38f6fb9" },
      { difficulty: "Hard", points: 150,
        prompt: "A business model where ransomware developers lease their malware to other criminals for a cut of the profits.\n\nSubmit as flag{answer} — all words joined, no space (include the hyphenated word as one run).",
        hint: "It's structured just like a subscription software business — but for ransomware.",
        flagHash: "152c1d3fb58a90b9a33ceb1fe561c78e937c887b9cdf37ecd8b03354674dc63c" }
    ] },

  { id: "c3-m5-match", module: 5, title: "Match the Modern Threat", category: "Cyber Trends", type: "match", points: 150,
    intro: "Objective — Explain how cybersecurity connects to current events. Match each trend to its description. Tap the trend, then tap its description.",
    pairs: [
      { left: "Zero Trust", right: "Never trust, always verify — even inside the network" },
      { left: "Supply Chain Attack", right: "Compromising a vendor to reach the real target" },
      { left: "Ransomware-as-a-Service", right: "Leasing ransomware tools to other criminals" },
      { left: "AI-Powered Phishing", right: "Using AI to write more convincing scam messages" }
    ] },

  { id: "c3-m5-impact", module: 5, title: "Rank the Real-World Impact", category: "Cyber Trends", type: "order", points: 150,
    intro: "Objective — Recognize how cyber threats impact organizations and nations. Order these incidents from smallest to largest scale of impact.",
    steps: [
      "A single employee falls for a phishing email",
      "A company's customer database is breached",
      "A supply-chain attack affects hundreds of companies",
      "A nation-state attack disrupts critical infrastructure"
    ] },

  { id: "c3-m5-source", module: 5, title: "Reliable or Not?", category: "Cyber Trends", type: "match", points: 150,
    intro: "Objective — Engage with real-world examples of cyber trends. Judge each source of cyber news. Tap the source, then tap the verdict.",
    pairs: [
      { left: "A government cybersecurity advisory (e.g. CISA)", right: "Reliable" },
      { left: "An anonymous social media post with no evidence", right: "Not reliable alone" },
      { left: "A vendor's published incident report", right: "Reliable" },
      { left: "A screenshot with no source or date", right: "Not reliable alone" }
    ] },

  { id: "c3-m5-vocab", module: 5, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["zero trust","supply chain attack","ransomware-as-a-service","ai threat","nation-state actor"],
    hardMode: "rapid" },

  /* MODULE 6 — Cybersecurity Competition ──────────────────────────────────── */
  { id: "c3-m6-comp", module: 6, title: "Speak Competition", category: "Competition",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "The three-letter acronym for the competition format where teams solve hidden security challenges to find and submit flags.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It's literally the name of what you're doing right now, solving this challenge.",
        flagHash: "88c2db7bb864afa527b23b21878c59971448174a79bd875a0024639047fa8122" },
      { difficulty: "Medium", points: 100,
        prompt: "The three-letter acronym for the national, two-season cybersecurity competition many Cyber 3 students compete in.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "National Cyber ___.",
        flagHash: "5908bc07412f19991426f90bdf778501ff5b94ad2ba2e81a1588cfb964eced0c" },
      { difficulty: "Hard", points: 150,
        prompt: "The process of actively gathering detailed information about a target system before attempting to exploit it.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It sounds like 'counting' — because you're cataloging everything you can find.",
        flagHash: "7c4e48bf83ecd86bc293de4592b9a9fcdc1b1951428b7ea424c5dddb706abddf" }
    ] },

  { id: "c3-m6-domains", module: 6, title: "Match the NCL Domain", category: "Competition", type: "match", points: 150,
    intro: "Objective — Apply cybersecurity skills to a competition setting. Match each competition domain to its focus. Tap the domain, then tap its focus.",
    pairs: [
      { left: "OSINT", right: "Finding information from public sources" },
      { left: "Cryptography", right: "Encoding and decoding secret messages" },
      { left: "Log Analysis", right: "Finding evidence of an attack in system logs" },
      { left: "Enumeration & Scanning", right: "Mapping out what a target system is running" }
    ] },

  { id: "c3-m6-gameplan", module: 6, title: "Competition Game Plan", category: "Competition", type: "order", points: 150,
    intro: "Objective — Work under pressure to solve competition challenges. Order the steps of a smart approach to a timed competition.",
    steps: [
      "Skim every challenge to find easy points first",
      "Tackle the lowest-point challenges to build momentum",
      "Save the hardest challenges for when time allows",
      "Double-check flag formatting before submitting",
      "Review the scoreboard and reassign teammates to weak spots"
    ] },

  { id: "c3-m6-teamwork", module: 6, title: "Good Team Move?", category: "Competition", type: "match", points: 150,
    intro: "Objective — Collaborate with teammates on complex tasks. Judge each competition behavior. Tap the behavior, then tap the verdict.",
    pairs: [
      { left: "Splitting challenges by teammate strengths", right: "Good team move" },
      { left: "Everyone working the same challenge at once", right: "Poor team move" },
      { left: "Sharing a partial solution when stuck", right: "Good team move" },
      { left: "Refusing to ask for help when stuck", right: "Poor team move" }
    ] },

  { id: "c3-m6-vocab", module: 6, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["ctf","ncl","scoreboard","osint","enumeration"],
    hardMode: "unscramble" },

  /* MODULE 7 — Industry Certification ─────────────────────────────────────── */
  { id: "c3-m7-cert", module: 7, title: "Certify It", category: "Certification",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "The entry-level industry certification most Cyber 3 students target.\n\nSubmit as flag{answer} — vendor name plus the exam name joined, no space, no symbol (spell 'plus' as a word).",
        hint: "CompTIA's foundational security certification — the '+' is spelled out as a word.",
        flagHash: "0ed7b3744d32b2485ef72ffe9977fe5c764ed305781c871110293efede49e864" },
      { difficulty: "Medium", points: 100,
        prompt: "A free or discounted code used to pay for a certification exam.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Some stores give you one of these to redeem instead of cash.",
        flagHash: "635be17f74d152d6511e159d7b3babfbf49533d9b4a612969ca64b8db114ed1f" },
      { difficulty: "Hard", points: 150,
        prompt: "The official list of topics a certification exam is guaranteed to test, published by the certifying body.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "It's the exam's own list of 'goals' it's built around.",
        flagHash: "1a436049363f41570dd2702c09b61d93fd5d16a98380aa19860b5a4ab8b9c74a" }
    ] },

  { id: "c3-m7-plan", module: 7, title: "Study Plan Steps", category: "Certification", type: "order", points: 150,
    intro: "Objective — Prepare for a professional certification exam. Order the steps of an effective certification study plan.",
    steps: [
      "Choose a certification that fits your career goal",
      "Review the official exam objectives",
      "Study each domain and take notes",
      "Take practice exams to find weak areas",
      "Schedule and sit for the real exam"
    ] },

  { id: "c3-m7-ready", module: 7, title: "Ready or Not?", category: "Certification", type: "match", points: 150,
    intro: "Objective — Use practice exams to measure readiness. Judge each practice-exam result. Tap the result, then tap the verdict.",
    pairs: [
      { left: "Scoring 90% two weeks before the exam", right: "Likely ready" },
      { left: "Scoring 55% with no time to study more", right: "Not ready yet" },
      { left: "Consistently scoring above the passing line", right: "Likely ready" },
      { left: "Guessing on most questions", right: "Not ready yet" }
    ] },

  { id: "c3-m7-match", module: 7, title: "Match the Cert Concept", category: "Certification", type: "match", points: 150,
    intro: "Objective — Demonstrate advanced cybersecurity knowledge. Match each term to its meaning. Tap the term, then tap its meaning.",
    pairs: [
      { left: "Exam Domain", right: "A major topic area on the exam" },
      { left: "Voucher", right: "A code that pays for the exam" },
      { left: "Practice Exam", right: "A simulated test to check readiness" },
      { left: "Recertification", right: "Renewing a certification before it expires" }
    ] },

  { id: "c3-m7-vocab", module: 7, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["comptia security+","exam domain","exam objectives","voucher","practice exam"],
    hardMode: "speedmatch" },

  /* MODULE 8 — Impactful / Passion Project ────────────────────────────────── */
  { id: "c3-m8-project", module: 8, title: "Make It Count", category: "Capstone",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "A person or group affected by, or invested in, the outcome of a project.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "They 'hold a stake' in what happens.",
        flagHash: "1d8c0c4ed63953cf119601d733c6de9d6c4ff0170cc4b61a976c381dbcf7f669" },
      { difficulty: "Medium", points: 100,
        prompt: "The final tangible product or output produced at the end of a project.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's what you 'deliver' when the project is done.",
        flagHash: "c08800869057f35aa229f1a814f2677af594f07f6753f3638c7d8b3a40ab1d8b" },
      { difficulty: "Hard", points: 150,
        prompt: "A clear statement describing the change or effect a project aims to create.\n\nSubmit as flag{answer} — two words joined, no space.",
        hint: "It states the 'impact' the project is meant to have.",
        flagHash: "fbade3edf6cefa39dea77ab30aaa9ef4b960011cc3eb270954e70d1b7eee21b8" }
    ] },

  { id: "c3-m8-steps", module: 8, title: "Plan the Passion Project", category: "Capstone", type: "order", points: 150,
    intro: "Objective — Organize and complete a real-world outreach project. Order the steps of planning an impactful project.",
    steps: [
      "Identify a cybersecurity issue that affects your community",
      "Define the stakeholders and the intended impact",
      "Plan the deliverable and a realistic timeline",
      "Build and share the project with your audience",
      "Reflect on the impact and what you'd improve"
    ] },

  { id: "c3-m8-audience", module: 8, title: "Match the Audience Move", category: "Capstone", type: "match", points: 150,
    intro: "Objective — Communicate concepts clearly for your audience. Match each audience to the best way to reach them. Tap the audience, then tap the approach.",
    pairs: [
      { left: "Younger students", right: "Simple language and relatable examples" },
      { left: "Parents/community members", right: "Practical, everyday safety tips" },
      { left: "Technical peers", right: "Detailed, accurate technical explanation" },
      { left: "School staff", right: "Clear policy or procedure recommendations" }
    ] },

  { id: "c3-m8-quality", module: 8, title: "Strong or Weak Deliverable?", category: "Capstone", type: "match", points: 150,
    intro: "Objective — Use cybersecurity knowledge to help or educate others. Judge each project deliverable. Tap the deliverable, then tap the verdict.",
    pairs: [
      { left: "A clear guide with real examples and a call to action", right: "Strong deliverable" },
      { left: "A vague flyer with no clear next step", right: "Weak deliverable" },
      { left: "A presentation tailored to the actual audience", right: "Strong deliverable" },
      { left: "Content copied without adapting it to your audience", right: "Weak deliverable" }
    ] },

  { id: "c3-m8-vocab", module: 8, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["stakeholder","deliverable","call to action","impact statement","community outreach"],
    hardMode: "blitz" }

  ]
};

window.COURSE_CONFIG.cyber3.ctf.bossQuestions = [
  { module: 1, topic: "M1", diff: "Easy", kind: "mc",
    prompt: "You want to shadow a SOC analyst you found on LinkedIn. What's the best first move?",
    options: ["Ask to shadow them in your very first message", "Send a short, specific message introducing yourself and asking a genuine question about their role", "Show up at their office unannounced", "Wait for them to message you first"],
    answer: 1 },
  { module: 2, topic: "M2", diff: "Medium", kind: "mc",
    prompt: "Your first learning-plan draft got feedback that your goal is too vague. What should you fix first?",
    options: ["Add more goals so it looks more ambitious", "Make the goal measurable and time-bound", "Delete the goal entirely", "Ignore the feedback — vague goals are more flexible"],
    answer: 1 },
  { module: 3, topic: "M3", diff: "Medium", kind: "mc",
    prompt: "A recruiter skims your resume for six seconds. What matters most in that window?",
    options: ["A long paragraph describing your personality", "Clear, specific, skimmable bullet points of real skills and results", "A colorful background image", "Ten different font styles"],
    answer: 1 },
  { module: 4, topic: "M4", diff: "Medium", kind: "mc",
    prompt: "You're drawn to finding weaknesses in systems with permission, not defending them full-time. Which career pathway fits best?",
    options: ["SOC Analyst", "Penetration Tester", "Compliance Officer", "Help Desk Technician"],
    answer: 1 },
  { module: 5, topic: "M5", diff: "Hard", kind: "mc",
    prompt: "A major software vendor is compromised, and the attackers use that access to breach hundreds of the vendor's customers. What kind of attack is this?",
    options: ["A supply chain attack", "A brute-force attack", "A denial-of-service attack", "A physical social engineering attack"],
    answer: 0 },
  { module: 6, topic: "M6", diff: "Medium", kind: "mc",
    prompt: "Ten minutes left in an NCL round and your team is stuck on a hard challenge worth few points, with an easy unsolved challenge worth more. What should you do?",
    options: ["Keep grinding the hard one on principle", "Switch focus to the higher-value, easier challenge", "Submit random guesses on everything", "Stop working entirely"],
    answer: 1 },
  { module: 7, topic: "M7", diff: "Medium", kind: "mc",
    prompt: "Your Security+ practice exam scores are inconsistent — high on some domains, low on others. What's the best next step?",
    options: ["Retake the same practice exam immediately", "Focus study time specifically on the weak domains", "Skip studying those domains since they're hard", "Switch to a completely different certification"],
    answer: 1 },
  { module: 8, topic: "M8", diff: "Hard", kind: "mc",
    prompt: "Your passion project reaches its audience but doesn't seem to change behavior. What's most likely missing?",
    options: ["A louder color scheme", "A clear, specific call to action", "More technical jargon", "A longer runtime"],
    answer: 1 }
];

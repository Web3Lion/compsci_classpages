// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   CYBER1 — CTF content (challenges, boss questions, frameworks).
   Loaded right after ../config.js by cyber1/ctf.html, cyber1/profile.html and the
   teacher pages. Edit challenges HERE, in the one challenges: [ ... ] array.
   ============================================================ */
window.COURSE_CONFIG = window.COURSE_CONFIG || {};
window.COURSE_CONFIG.cyber1 = window.COURSE_CONFIG.cyber1 || {};


/* ============================================================
   CAPTURE THE FLAG DATA (consumed by ctf.js).
   Kept separate so it's easy to see and extend.
   Flags are stored as SHA-256 hashes (never plaintext). To hash a
   new flag: open any course page's console and run
   await CTF.hash("flag{...}")  then paste the hex as flagHash.
   ============================================================ */
window.COURSE_CONFIG.cyber1.ctf = {
  title: "Capture The Flag",
  intro: "Solve each challenge, capture the flag, and climb the ranks — grouped by module and mapped to each unit's learning objectives. Flags look like flag{...}. But beware: an adversary named SPECTER has taken this terminal. Your progress saves on this device.",
  adversary: "SPECTER",
  adversaryColor: "#ff4c00",
  adversaryColor2: "#ff7a3d",
  adversaryGlow: "#ff2e00",
  modules: ["What is Cybersecurity?","Digital Footprint & Cyber Hygiene","Social Engineering","Computer Number Systems","OS Basics & Command Lines","Network Basics","Cyber Threats","Intro to Security Controls","Cryptology","Cyber Competitions","Intro to Cyber Frameworks"],
  challenges: [

  /* MODULE 1 — What is Cybersecurity? (Play → 1.1–1.4, 1.6–1.7 → Perform) ─── */
  { id: "c1-m1-1.1-core", module: 1, title: "1.1 — What is Cybersecurity?", category: "Foundations",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Develop a foundational understanding of the cybersecurity field. The overall field concerned with protecting systems, networks, and data from digital attacks is called ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the name of this entire course.",
        flagHash: "f31e245e950d387f69a7577159dc176a60870584c74a80c29b9104d1424f93c1" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Activity 1: What is Cybersecurity? The lesson's featured case study is a real hotel lock company whose flawed keycard system became a famous lesson in why cybersecurity matters. Name the company.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's also the name of the reading guide used in this lesson.",
        flagHash: "bed04dd502b2e0db979233f2b81fa731ad218185612ff613a330e3c9cffaf45b" },
      { difficulty: "Hard", points: 150,
        prompt: "Kick Start — Mind Map intro. Cybersecurity protects things far beyond just computers — from personal texts to national power ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Think about what would happen if the electric utility got hacked.",
        flagHash: "91a02c561404220cfff0efdc5f5b26b3ed33f412ab74b6804d6a07e937a66282" }
    ] },

  { id: "c1-m1-cia", module: 1, title: "1.1 — The CIA Triad", category: "Foundations",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Foundational security knowledge. The CIA triad leg that ensures only authorized people can access information.\n\nSubmit as flag{word} (lowercase).",
        hint: "The 'C' in CIA.",
        flagHash: "c087a071e9e2f7c959cc4973c77b2c5feb17cead7dd031b00a94213f2664bfdc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Foundational security knowledge. The CIA triad leg that ensures data has not been altered or tampered with.\n\nSubmit as flag{word} (lowercase).",
        hint: "Data that hasn't been altered or tampered with in transit or at rest. Hashing is how you prove it.",
        flagHash: "2f3d9851d23849572228eb2f2abb2c097a85090aaf63066e566d6584e366192e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Foundational security knowledge. The CIA triad leg that ensures data and services are accessible when needed.\n\nSubmit as flag{word} (lowercase).",
        hint: "Systems and data have to be reachable when people actually need them. A DDoS attack targets this leg of the triad.",
        flagHash: "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d" }
    ] },

  { id: "c1-m1-cia2", module: 1, title: "1.1 — CIA Triad in Action", category: "Foundations", type: "match", points: 150,
    intro: "Objective — Personal information security. Match each safeguard to the CIA leg it protects. Tap a safeguard, then tap the leg.",
    pairs: [
      { left: "Encrypting a private file", right: "Confidentiality" },
      { left: "A checksum on a download", right: "Integrity" },
      { left: "Backups and redundant servers", right: "Availability" },
      { left: "A password on your account", right: "Confidentiality" },
      { left: "A digital signature", right: "Integrity" }
    ] },

  { id: "c1-m1-triad-rank", module: 1, title: "1.1 ext — Rank the Impact", category: "Foundations", type: "order", points: 150,
    intro: "Extension of 1.1 — Order these breaches from LEAST to MOST severe impact on confidentiality.",
    steps: [
      "A public blog post is copied",
      "An email address leaks",
      "A password leaks",
      "A medical record leaks",
      "A full identity is stolen"
    ] },

  { id: "c1-m1-domains", module: 1, title: "1.1 ext — Match the Security Domain", category: "Foundations", type: "match", points: 150,
    intro: "Extension of 1.1 (Cybersecurity Snapshot Jigsaw) — match each task to its security domain. Tap the task, then tap the domain.",
    pairs: [
      { left: "Encrypting stored data", right: "Data Security" },
      { left: "Configuring a firewall", right: "Network Security" },
      { left: "Managing user logins", right: "Access Control" },
      { left: "Training staff on phishing", right: "Awareness" },
      { left: "Responding to a breach", right: "Incident Response" }
    ] },

  { id: "c1-m1-defense", module: 1, title: "1.1 ext — Defense Basics", category: "Foundations",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Extension of 1.1 (Cybersecurity Snapshot Jigsaw: Defenses against hacking) — The secret word or phrase you use to log in to an account.\n\nSubmit as flag{word} (lowercase).",
        hint: "You type it to sign in.",
        flagHash: "96b5fddda749f35d9a65a86c361df2192719f5d933ce22d46eb470bf8ffa1c62" },
      { difficulty: "Medium", points: 100,
        prompt: "Extension of 1.1 — Requiring a second proof (like a phone code) in addition to a password. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Three letters. Something you know, plus something you have.",
        flagHash: "b54b228a7dd04447468f32451d10e2a025f9bb5775ae2b74ef2cb377eadbed73" },
      { difficulty: "Hard", points: 150,
        prompt: "Extension of 1.1 — Software designed to detect and remove malicious programs is called ___ software.\n\nSubmit as flag{word} (lowercase).",
        hint: "Software that scans for and removes known malicious programs, traditionally by matching signatures. One word.",
        flagHash: "a48a572a3d37576eb1bd74ec613f4006a8ce60e1aa8948b5fe28ac5c82c6c78f" }
    ] },

  { id: "c1-m1-secure", module: 1, title: "1.1 ext — Secure Your Account", category: "Personal Security", type: "order", points: 150,
    intro: "Extension of 1.1 — order these steps to lock down a personal account, first to last.",
    steps: [
      "Create a long, unique password",
      "Turn on multi-factor authentication",
      "Update your software & apps",
      "Learn to spot phishing messages",
      "Back up your important data"
    ] },

  { id: "c1-m1-daily-1.1-1", module: 1, title: "1.1-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday's Play activity put you into an EMATE interactive called the Cybersecurity ___, before you knew any of the vocabulary.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the second word in the interactive's name.",
        flagHash: "4f8ca0c42274649b6837a332d918815e41af2617a8a6dbb71f80f5fb40f3a7b5" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — struggling and failing at first, before you have the background to solve a problem, is expected in this field and is called productive ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It sounds negative, but 'productive' is the key word.",
        flagHash: "60be6ecae86d6364bcfbb350d3109882c1cb0248d286332d40c036c143278e2e" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — Paradigm's learning model has three stages: Play, Learn, and ___ — the stage where you apply what you know.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the third word in the model's name.",
        flagHash: "fc7c6a8653ebcd109ece0a4ea3b420d18abfac27fa1fb16978b924715cc4a4b0" }
    ] },

  { id: "c1-m1-daily-1.1-2", module: 1, title: "1.1-2 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday's mind map put one word in the center: the field concerned with protecting systems, networks, and data from digital attacks. That word is ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the name of this entire course.",
        flagHash: "f31e245e950d387f69a7577159dc176a60870584c74a80c29b9104d1424f93c1" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — yesterday's reading guide covered a hotel lock company whose flawed keycard system became a famous cybersecurity lesson. Name the company.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's also the name of the reading guide used in that lesson.",
        flagHash: "bed04dd502b2e0db979233f2b81fa731ad218185612ff613a330e3c9cffaf45b" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — cybersecurity protects far more than computers. Yesterday's kickoff mentioned it also protects national power ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Think about what would happen if the electric utility got hacked.",
        flagHash: "91a02c561404220cfff0efdc5f5b26b3ed33f412ab74b6804d6a07e937a66282" }
    ] },

  { id: "c1-m1-1.2-history", module: 1, title: "1.2 — History of Cyber Threats", category: "Cyber History",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explore historical cybersecurity incidents. Kick Start: research 'Creeper.' The very first computer virus, created in the early 1970s, was called ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It displayed the message \"I'm the creeper, catch me if you can!\"",
        flagHash: "42c31e9a61ca27e5a2faec9514cb8887d099410a279b8dd59501426b7ed156af" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — History of Cyber Threats Timeline. The 2010 malware that famously sabotaged Iranian nuclear centrifuges by targeting industrial control systems is called ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "One of the timeline's assigned events — a nation-state-grade cyberweapon.",
        flagHash: "b68b08479d8d1b9d986b55c15310c3a71ef65dc4d46e0017977fda67ae8f448e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Present Cyber Threats / History Timeline. The 2021 ransomware attack that shut down a major U.S. fuel pipeline for several days, causing gas shortages, targeted the ___ Pipeline.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "One of the timeline's assigned events — named after the pipeline company itself.",
        flagHash: "6b7f6ac8b3ac02c940eff66e366e88dd0f487abe33faa83aa2a1cabecf6e5707" }
    ] },

  { id: "c1-m1-actors", module: 1, title: "1.2 ext — Spot the Threat Actor", category: "Threat Landscape", type: "match", points: 150,
    intro: "Extension of 1.2 (who was behind history's biggest attacks) — match each description to the threat actor. Tap a description, then tap the actor.",
    pairs: [
      { left: "Breaks in for a political or social cause", right: "Hacktivist" },
      { left: "Beginner using others' ready-made tools", right: "Script Kiddie" },
      { left: "Trusted employee who misuses access", right: "Insider Threat" },
      { left: "Well-funded, government-backed group", right: "Nation-State" },
      { left: "Attacks purely for financial gain", right: "Cybercriminal" }
    ] },

  { id: "c1-m1-daily-1.2-1", module: 1, title: "1.2-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — one Cybersecurity Snapshot Jigsaw group covered a hotel lock company with a flawed keycard system. Name the company again — you'll need it all unit.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Same answer as yesterday's reading guide.",
        flagHash: "bed04dd502b2e0db979233f2b81fa731ad218185612ff613a330e3c9cffaf45b" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — another jigsaw group covered defenses against hacking. Name a basic defense that combines two proofs of identity to log in.\n\nSubmit as flag{answer} — the acronym, lowercase.",
        hint: "You'll be asked to turn this on for nearly every account you own.",
        flagHash: "b54b228a7dd04447468f32451d10e2a025f9bb5775ae2b74ef2cb377eadbed73" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — a third jigsaw group covered types of attacks. Name the attack where someone impersonates a trustworthy source to trick you into giving up information.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It rhymes with 'fishing' because that's exactly the idea.",
        flagHash: "01fbd5d51977823ec0902cc5fdd02dacc020930a12ed4fe0a328d5b4edd6c6c8" }
    ] },

  { id: "c1-m1-daily-1.2-2", module: 1, title: "1.2-2 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday's research challenge had you dig up the very first computer virus, from the early 1970s. Name it.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It also 'crept' across the ARPANET displaying a taunting message.",
        flagHash: "42c31e9a61ca27e5a2faec9514cb8887d099410a279b8dd59501426b7ed156af" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — yesterday's history timeline included a 2010 worm that targeted industrial control systems and set back a nuclear program. Name it.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "One of the most famous cyberweapons ever discovered.",
        flagHash: "b68b08479d8d1b9d986b55c15310c3a71ef65dc4d46e0017977fda67ae8f448e" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — the timeline also covered a 2021 attack on a major fuel pipeline that led to gas shortages on the East Coast. Name the pipeline company (one word).\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "The event marker was titled with the pipeline's first name.",
        flagHash: "6b7f6ac8b3ac02c940eff66e366e88dd0f487abe33faa83aa2a1cabecf6e5707" }
    ] },

  { id: "c1-m1-daily-1.2-3", module: 1, title: "1.2-3 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you explored live cyber threat maps. What do these maps show happening in real time around the world?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the whole point of the maps — showing digital ___.",
        flagHash: "a571168914adedf3d4100074621a7f9b88c9a8782f6d30a5950920c4f3105650" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — the threat maps aren't 100% accurate; they exist to help people ___ the threat landscape.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Turning raw data into something you can see and understand.",
        flagHash: "ae5cb2f6a06d72485e7299a23deae024c065c39e20e9c48b6859d6e3909e94f3" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — name one type of attack a threat map might highlight: a flood of traffic meant to take a website offline.\n\nSubmit as flag{answer} — the acronym, lowercase.",
        hint: "It's the 'distributed' version of a denial-of-service attack.",
        flagHash: "da95c631b466fc86796850982341f91a7addba535a0bafdc9ea3589dbd4e2606" }
    ] },

  { id: "c1-m1-1.3-careers", module: 1, title: "1.3 — Cyber Careers", category: "Careers",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explore a variety of cybersecurity careers. The most common 'first job' team in the industry, which monitors an organization's systems around the clock for threats. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Security Operations Center.",
        flagHash: "4225c6abc26069ccbfd4646075ff0579d4d8f8d4a31b1f235f5001fa91e89138" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Cyber Career Playlist. A widely-used site for researching cybersecurity career data, salaries, and required skills is called Cyber___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's listed as a recommended digital resource for this lesson.",
        flagHash: "8d743a86b8d18e9763b1d4d81553c2bafb4ffa0701369cc95bc8ffbaf8d700f2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Identify three cybersecurity careers of personal interest. The compilation of career research, flyers, and self-reflection artifacts built throughout this course is called a career ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Artists and photographers keep one of these too.",
        flagHash: "686f545978332d6128539653c2d3cb9c9ef9e8bf42da4aff2689116de7105503" }
    ] },

  { id: "c1-m1-careers-match", module: 1, title: "1.3 ext — Match the Career", category: "Careers", type: "match", points: 150,
    intro: "Objective — Cyber Career Playlist. Match each cybersecurity career to what it actually does day to day. Tap a description, then tap the career.",
    pairs: [
      { left: "Monitors networks and investigates suspicious activity as a first responder to alerts.", right: "SOC Analyst" },
      { left: "Legally attempts to break into systems to find vulnerabilities before attackers do.", right: "Penetration Tester" },
      { left: "Recovers deleted files and preserves evidence after a cyber incident.", right: "Digital Forensics Investigator" },
      { left: "Configures firewalls and hardens systems to build organizational defenses.", right: "Security Engineer" },
      { left: "Helps organizations follow laws, regulations, and security frameworks.", right: "GRC Analyst" },
      { left: "Leads a security team, sets strategy, and communicates with executives.", right: "Cybersecurity Manager" }
    ],
    hardMode: "speedmatch" },

  { id: "c1-m1-daily-1.3-1", module: 1, title: "1.3-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday's Past/Present/Future activity asked for one major historical attack. Name the 2020 supply-chain breach of a major IT vendor used by the U.S. government.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "The company's name is also on your history timeline.",
        flagHash: "04f2a72bd93f8ad2a5ee7df4fa34ddf3619f12e1347e58f05f072f1f1a82bbfc" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — the 'Present' part of yesterday's activity asked for one insight or stat. What kind of tool did that insight come from?\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "You used one of these in the previous lesson to visualize live attacks.",
        flagHash: "55ed1aea6c5c458387ad9272c51f9bda375e1ef207b449b6fbd85b4f0344170e" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — the 'Future' part had you post a prediction, then walk around reading everyone else's. What was that walk-and-read activity called?\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "Like walking through an art museum, but for predictions.",
        flagHash: "a02b1d845bf6a3e190367c9c29791292cc4877a425f62a11ba71065e430adeca" }
    ] },

  { id: "c1-m1-daily-1.3-2", module: 1, title: "1.3-2 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday's Cyber Career Playlist had you explore a site that maps supply and demand for cybersecurity jobs by state. Name it.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's also listed as a recommended resource for this whole unit.",
        flagHash: "b6fad574e8f673d3ea5ba5497acbfe241baa2f04fa3f8484ad4cbd8cc381bb01" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — yesterday you began mapping out the cybersecurity industry and recording notes on your Unit 1 ___ Sheet.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "The same sheet you've been filling out since lesson 1.1.",
        flagHash: "954111648b53f49f9c5fe0652e4e8abfba7506ecd50a7a1dcad716a6f827870c" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — name one cybersecurity career role: an analyst who monitors a company's network from a security operations center.\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "The center's initials come first in this job title.",
        flagHash: "a010a6e3a40c575ec49c772215d1729a3d0a04424b9ad0475f778682e9e02a89" }
    ] },

  { id: "c1-m1-1.4-mindsets", module: 1, title: "1.4 — Cyber Mindsets & Competitions", category: "Mindsets & Competitions",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 100,
        prompt: "Objective — Identify the Cyber Mindsets. The list of 10 professional skills cybersecurity employers look for is abbreviated ___ (a letters+number combo, no space).\n\nSubmit as flag{answer} (lowercase, no space).",
        hint: "Two letters, then the number ten.",
        flagHash: "4e47ed44760085460f72e409a08e30c455d03027bb5c4689f466557966aebdc7" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain how the mindsets connect to cybersecurity competitions. The national, team-based cybersecurity competition this course prepares students for. Give its three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "National Cyber ___.",
        flagHash: "5908bc07412f19991426f90bdf778501ff5b94ad2ba2e81a1588cfb964eced0c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — PC10 Question Lens. The PC10 skill describing cybersecurity as a field requiring constant learning because it never stops evolving is called relentless ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's what drives professionals to keep learning in a field that never stands still.",
        flagHash: "f50736e89d3dadfc9d167498932e04e33c452a20ddec06d82181967413f6bb83" }
    ] },

  { id: "c1-m1-pc10-match", module: 1, title: "1.4 ext — Match the PC10 Skill", category: "Mindsets & Competitions", type: "match", points: 150,
    intro: "Objective — PC10 Question Lens. Match each classroom moment to the PC10 skill it demonstrates. Tap a moment, then tap the skill.",
    pairs: [
      { left: "Re-reading a hint three times and trying a new approach instead of giving up.", right: "Relentless Curiosity" },
      { left: "Pausing before reporting a bug you found to make sure you disclose it responsibly.", right: "Ethical Decision Making" },
      { left: "Writing down exactly which steps you tried during a lab, in order, so others can repeat it.", right: "Precise Documentation" },
      { left: "Explaining a technical vulnerability so a non-technical teacher understands it.", right: "Effective Communication" },
      { left: "Making sure every teammate's idea gets heard during a group CTF.", right: "Inclusive Collaboration" },
      { left: "Questioning whether a threat map is showing the full picture before drawing conclusions.", right: "Critical Analysis" }
    ],
    hardMode: "blitz" },

  { id: "c1-m1-daily-1.4-1", module: 1, title: "1.4-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you designed a piece to teach others about a specific cyber career and convince them to pursue it. What kind of visual artifact was that?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "A flyer that combines images, data, and text to explain something.",
        flagHash: "a70599144a4cedee1632d7587d48ae4be84b53714cdedaeed1bfc519fbcd5849" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — after the showcase, you had to pick your top ___ careers you were most interested in.\n\nSubmit as flag{answer} — the number, spelled out, lowercase.",
        hint: "It's a small number — you wrote it on your Activity Sheet.",
        flagHash: "0fbc084f58beba51a7fe730c38af50d01d2959cd8085df866f8b74064bd1c4d3" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — your career flyer needed to include education, skills, and ___ needed for that career.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Credentials like Security+ or CCNA fall into this category.",
        flagHash: "dccd78b4d8f0d71192985dde88390826923b9ee4da2c0fc9c507006691eaad35" }
    ] },

  { id: "c1-m1-daily-1.4-2", module: 1, title: "1.4-2 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you were introduced to a list of 10 professional skills needed to succeed in cybersecurity. What's that list called?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's an acronym ending in the number of skills on the list.",
        flagHash: "4e47ed44760085460f72e409a08e30c455d03027bb5c4689f466557966aebdc7" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — one of those skills is about never stopping learning and always asking questions. Name it.\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "It's also the PC10 skill this course keeps coming back to.",
        flagHash: "c5d8cf331ecf6077fa2988512eb09be19117e08a53ee508538926aa1f4c3970c" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — cyber competitions were introduced as a way to build these mindsets and skills. Name the acronym for the national scouting competition mentioned.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "You'll see this same acronym again in a later unit's CTF.",
        flagHash: "5908bc07412f19991426f90bdf778501ff5b94ad2ba2e81a1588cfb964eced0c" }
    ] },

  { id: "c1-m1-1.5-ethics", module: 1, title: "1.5 — Cyber Ethics Kickoff", category: "Ethics",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Describe ethical considerations in real-world digital scenarios. Kick Start: this lesson introduces the branch of philosophy concerned with right and wrong conduct, applied to cybersecurity. Give the two-word term.\n\nSubmit as flag{answer} — one lowercase word (just the discipline itself, not the word \"cyber\").",
        hint: "The root of the word \"ethical.\"",
        flagHash: "4f5aa4b3844ca967570aec04e2c900315a6b22b40fe710de60b27d22ccdc8fc4" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Cyber Ethics Play Games. This lesson's PLAY activity uses ethics games and a scavenger hunt hosted on a specific site. Give its name (no .com).\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's named for a U.S. region — Pacific North West.",
        flagHash: "3150e0415e73eeef591f1cf19a1ffb82ab76e9efb38dbbc4b605729026c61d7e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Wrap-Up: Cyber Ethics Contract. The document students read and sign at the end of this lesson, committing to behave ethically throughout the course, is called the Cyber Ethics ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "A legal-sounding word for a signed agreement.",
        flagHash: "86f0e6b100c80f230ec8664619cdc3e89df1184a63364eec30b41d2b22977275" }
    ] },

  { id: "c1-m1-ethics-judge", module: 1, title: "1.5 ext — Ethical or Unethical?", category: "Ethics", type: "match", points: 150,
    intro: "Objective — Cyber Ethics scenario. Judge each scenario. Tap the scenario, then tap the verdict.",
    pairs: [
      { left: "A student finds a bug in the school's grading portal and reports it to IT.", right: "Ethical" },
      { left: "A student finds a bug in the school's grading portal and uses it to change their own grade.", right: "Unethical" },
      { left: "A researcher scans a company's public website for known vulnerabilities with written permission.", right: "Ethical" },
      { left: "A researcher breaks into a company's server without permission 'just to see what's there.'", right: "Unethical" }
    ],
    hardMode: "speedmatch" },

  { id: "c1-m1-daily-1.5-1", module: 1, title: "1.5-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you were introduced to the professional compilation of artifacts you'll build all course to show your skills and growth. What's it called?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Same word as the Performance Task at the end of this unit.",
        flagHash: "686f545978332d6128539653c2d3cb9c9ef9e8bf42da4aff2689116de7105503" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — you also built one of these to evaluate your current strengths and weaknesses in mindsets and skills. What was that activity called?\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "You're building a cybersecurity ___ ___, like a character sheet.",
        flagHash: "7d699e5cf02b03020c3ece47c5aa407e2acafe0edd6afb070f193bfc5df41b16" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — yesterday's PC10 activity split the class into 6 small groups, one skill each. How many PC10 skills are there in total?\n\nSubmit as flag{answer} — the number.",
        hint: "It's right there in the name of the skill list.",
        flagHash: "de2ff58afd20a703c95fd257208c257010b2265dd71ea4c9e54d047762c4e523" }
    ] },

  { id: "c1-m1-1.6-cert", module: 1, title: "1.6 — PC/Trusted Sec Certification", category: "Certification",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Prepare for the Paradigm/TrustedSec certification. The industry-recognized credential earned by demonstrating foundational cybersecurity knowledge is called the Cyber ___ Certification.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It certifies the basics — the fundamentals of the field.",
        flagHash: "f33204aa42b1d4f9e0667501c6041938ab5200dcb62e91520d0091e682576430" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Certification Prep Questions. After completing prep activities, students attempt a prep quiz with this many questions. Give the number.\n\nSubmit as flag{number}.",
        hint: "It's mentioned directly in the lesson's Activity 2.",
        flagHash: "de2ff58afd20a703c95fd257208c257010b2265dd71ea4c9e54d047762c4e523" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Certification value. Earning this certification serves as both a milestone and a ___ into the broader cybersecurity field.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Something that launches you forward into what's next.",
        flagHash: "ee78221233c80800ce4a1bd4bb41dd8c3fbe249bc455c35002ed86c7b0d3da67" }
    ] },

  { id: "c1-m1-cert-match", module: 1, title: "1.6 ext — Match the Cert Skill Area", category: "Certification", type: "match", points: 150,
    intro: "Objective — Paradigm/TrustedSec Cyber Essentials Certification. Match each example to the skill area it belongs to. Tap the example, then tap the area.",
    pairs: [
      { left: "Converting a message into ciphertext so only the intended reader can understand it.", right: "Cryptography" },
      { left: "Tricking someone into revealing their password by pretending to be IT support.", right: "Social Engineering" },
      { left: "Using cd, ls, and chmod to navigate and manage files at the command line.", right: "Linux" },
      { left: "Converting the number 1010 from binary into its decimal value.", right: "Number Systems" },
      { left: "Software that secretly encrypts a victim's files and demands payment.", right: "Malware" },
      { left: "Configuring a router so devices on a network can talk to each other securely.", right: "Network Basics" }
    ],
    hardMode: "blitz" },

  { id: "c1-m1-daily-1.6-1", module: 1, title: "1.6-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you played ethics games on a site used throughout the course for cyber games and challenges. Name the site (just the name, no .com).\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's also a recommended resource listed for this unit.",
        flagHash: "3150e0415e73eeef591f1cf19a1ffb82ab76e9efb38dbbc4b605729026c61d7e" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — yesterday you signed a document committing to behave ethically and use your skills appropriately all course. What's it called?\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "It's a legal-sounding word for a promise you put your name on.",
        flagHash: "546c7eb5dd080798cf99a7a8a61da6166e52173c986b609bd6d162d3099000f4" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — ethics is woven through every unit in this course. How many units total?\n\nSubmit as flag{answer} — the number.",
        hint: "Check the unit number on this very lesson's materials.",
        flagHash: "bf54bcd49d2a45eeba9ec402813a4a00fdd7f070d59b6f8dbb9fa573ab0a19e1" }
    ] },

  { id: "c1-m1-daily-1.6-2", module: 1, title: "1.6-2 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you were introduced to a certification that validates your foundational cybersecurity knowledge. It's called Paradigm/TrustedSec Cyber ___.\n\nSubmit as flag{answer} — two lowercase words.",
        hint: "The word suggests the basics — the essential building blocks.",
        flagHash: "68f119bb44dd472b7df0921e771eca594bdae1cb3e21162f3cd0d1699b1fc542" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — that certification covers network basics, cryptography, social engineering, Linux, number systems, and one more topic: malicious software. What's that called?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "The general term for viruses, worms, ransomware, and trojans.",
        flagHash: "2aedb3e75aad5e62f6ca43787074f19854bee7654b92a301a6349bd0736acc44" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — you'll prepare for this certification at the end of every unit, then attempt a prep quiz with how many questions?\n\nSubmit as flag{answer} — the number.",
        hint: "Same number as the PC10 skill list.",
        flagHash: "de2ff58afd20a703c95fd257208c257010b2265dd71ea4c9e54d047762c4e523" }
    ] },

  { id: "c1-m1-1.7-ctf", module: 1, title: "1.7 — Intro to Paradigm Cyber CTFs", category: "Capture the Flag",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define Capture the Flag (CTF) challenges. The hands-on puzzle-solving challenges used throughout this course, where you find hidden strings to earn points. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "You're doing one right now.",
        flagHash: "88c2db7bb864afa527b23b21878c59971448174a79bd875a0024639047fa8122" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Paradigm Cyber CTFs Introduction Scavenger Hunt. Students complete a ___ ___ in Centra to find items related to CTFs.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "It's literally the name of the lesson's main activity.",
        flagHash: "3a8b39c0bfdc44e095804996b11f43257802b31c3d56548545660138fe03f590" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — CTF Overview. CTFs introduce students to the mindset of investigators and ethical ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Someone who breaks into systems, but with permission and good intent.",
        flagHash: "728ba6afbd09db59edb2a2fd3e4d20fcf4829aef0573c4a9804cd49bb3e394c6" }
    ] },

  { id: "c1-m1-ctf-terms", module: 1, title: "1.7 ext — Match the CTF Term", category: "Capture the Flag", type: "match", points: 150,
    intro: "Objective — CTF Introduction Scavenger Hunt. Match each idea to the CTF term it describes. Tap the idea, then tap the term.",
    pairs: [
      { left: "The hidden string you're searching for in a challenge, usually wrapped like flag{...}.", right: "Flag" },
      { left: "A challenge category that tests skills like decoding ciphers and breaking encryption.", right: "Cryptography" },
      { left: "A challenge category that involves finding and exploiting bugs in a website.", right: "Web Exploitation" },
      { left: "A small nudge you can reveal if you're stuck, usually for a point cost.", right: "Hint" },
      { left: "A puzzle category where you dig through files or memory for evidence of an attack.", right: "Forensics" }
    ],
    hardMode: "speedmatch" },

  { id: "c1-m1-vocab", module: 1, title: "1.7 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["cybersecurity","confidential","integrity","availability","threat","risk","hacker","asset"],
    hardMode: "rapid" },

  { id: "c1-m1-daily-1.7-1", module: 1, title: "1.7-1 — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — yesterday you went to a platform's Certifications tab and attempted prep questions for this unit's certification. Name the platform.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's also where students access Paradigm's CTF challenges.",
        flagHash: "35c66f608498c2bb672e563927dca16b0986ed1d2e5d6c1b5a5a86629171f859" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — after attempting the prep quiz, you were asked to reflect with a partner on what you did well and what you ___ with.\n\nSubmit as flag{answer} — one lowercase word, past tense.",
        hint: "The opposite of doing well on something.",
        flagHash: "29e6cdd18e25bdc5e427d4a78aa9b388bacc03ea97df85bf0308a43819ca59ff" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — the certification you're prepping for is a partnership between Paradigm and which cybersecurity company?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's the second half of the certification's full name.",
        flagHash: "4562dc3c0f1632c982c1d5641e3fcad4c57f19c35a75df9c85dee18fb72e8c58" }
    ] },

  { id: "c1-m1-daily-1.7-ext", module: 1, title: "1.7-ext — Daily Warm-Up", category: "Daily Warm-Up",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Warm-Up — extension of 1.7. Yesterday's scavenger hunt introduced you to hands-on puzzles where you apply cybersecurity skills to find hidden ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It's literally the F in CTF.",
        flagHash: "463a1293599e0bde314a198aed8f42ac9f2b090f7abfcfff3ff551abbeb219d7" },
      { difficulty: "Medium", points: 100,
        prompt: "Warm-Up — extension of 1.7. CTFs introduce you to the mindset of investigators and ethical ___ as you explore how systems are attacked and defended.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Someone who breaks into systems, but with permission and good intent.",
        flagHash: "728ba6afbd09db59edb2a2fd3e4d20fcf4829aef0573c4a9804cd49bb3e394c6" },
      { difficulty: "Hard", points: 150,
        prompt: "Warm-Up — extension of 1.7. Today is your Perform day — you'll compile everything from this unit into one collection of evidence. What is that collection called?\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Same word as your 1.5-1 warm-up.",
        flagHash: "686f545978332d6128539653c2d3cb9c9ef9e8bf42da4aff2689116de7105503" }
    ] },

  /* UNIT 1 cont'd — Cybersecurity Ethics (merged into Unit 1) ─────────────── */
  { id: "c1-m2-ethics", module: 1, title: "The Ethics Code", category: "Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — The what and why of cyber ethics. The study of what is morally right and wrong is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The branch of philosophy about right and wrong conduct — the root of the word \"ethical\".",
        flagHash: "4f5aa4b3844ca967570aec04e2c900315a6b22b40fe710de60b27d22ccdc8fc4" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — ACM Code of Ethics. Which organization publishes the Code of Ethics and Professional Conduct that guides computing professionals? Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Association for Computing Machinery.",
        flagHash: "35891c846af4fbe2336dfa10e1778c4db3298ef3e364ea82a5427a8618bdc894" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Responsible cyber citizenship. Reporting wrongdoing or unethical activity despite personal risk is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Reporting your own organization's wrongdoing to an outside authority — legally protected in many cases, but career-risky.",
        flagHash: "21142ee75274040bb79254242d419572166433004ffd6c08a8da71fcbefbe76c" }
    ] },

  { id: "c1-m2-judge", module: 1, title: "Ethical or Unethical?", category: "Ethics", type: "match", points: 150,
    intro: "Objective — Ethical decision making. Judge each action. Tap the action, then tap the verdict.",
    pairs: [
      { left: "Reporting a bug you found responsibly", right: "Ethical" },
      { left: "Reading a coworker's private email", right: "Unethical" },
      { left: "Getting written permission before testing", right: "Ethical" },
      { left: "Selling stolen customer data", right: "Unethical" },
      { left: "Sharing someone's password 'to help'", right: "Unethical" }
    ] },

  { id: "c1-m2-decide", module: 1, title: "The Ethical Decision Process", category: "Ethics", type: "order", points: 150,
    intro: "Objective — Decision making in an ethical scenario. Order the steps of working through an ethical dilemma.",
    steps: [
      "Identify the ethical problem",
      "Gather the relevant facts",
      "Consider who is affected (stakeholders)",
      "Weigh the options against principles",
      "Decide, act, and reflect"
    ] },

  { id: "c1-m2-principles", module: 1, title: "Match the Ethics Principle", category: "Ethics", type: "match", points: 150,
    intro: "Objective — Basic principles of cyber ethics. Match each principle to an example. Tap a principle, then tap the example.",
    pairs: [
      { left: "Honesty", right: "Report findings truthfully" },
      { left: "Respect privacy", right: "Don't snoop on user data" },
      { left: "Avoid harm", right: "Don't damage systems you test" },
      { left: "Fairness", right: "Treat all users equally" }
    ] },

  { id: "c1-m2-vocab", module: 1, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["ethic","privacy","consent","responsib","law","acm","moral"],
    hardMode: "unscramble" },

  { id: "c1-m2-law", module: 1, title: "Ethical, Legal, Both, or Neither", category: "Ethics", type: "match", points: 150,
    intro: "Objective — Ethics and the law. Match each action to its category. Tap the action, then tap the category.",
    pairs: [
      { left: "Pen-testing with a signed contract", right: "Ethical & Legal" },
      { left: "Hacking a site 'to prove a point'", right: "Neither" },
      { left: "Reporting a bug you found", right: "Ethical & Legal" },
      { left: "Ignoring a bug that harms users", right: "Legal but Unethical" }
    ] },

  { id: "c1-m2-disclose", module: 1, title: "Responsible Disclosure", category: "Ethics", type: "order", points: 150,
    intro: "Objective — Responsible cyber citizenship. Order the steps of responsibly disclosing a vulnerability.",
    steps: [
      "Find the vulnerability",
      "Privately notify the vendor",
      "Give them time to patch",
      "Confirm the fix",
      "Publish details responsibly"
    ] },

  { id: "c1-m2-law2", module: 1, title: "Law & Order", category: "Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Ethics and the law. Accessing a computer system without permission is generally ___ (legal or illegal)?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's against the law.",
        flagHash: "0ec3cfbc698c000911133e533c2bc7bc3289eb1bab155b88156357950c1dd09d" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Cyber law. A hacker who tests systems WITH permission to improve security is a ___-hat hacker.\n\nSubmit as flag{color} (lowercase).",
        hint: "The good guys wear this color hat.",
        flagHash: "d793272549c22f7a104ac62b6ea836d450b1011b898b702a2a26c18c02d6d77f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Responsible citizenship. Getting documented permission before testing a system is called obtaining ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You get someone's ___ to proceed.",
        flagHash: "e0f6519553979b886476cc5cdb737cc9b2499d51c61c0d01c007ee8f313320be" }
    ] },

  { id: "c1-m1-perform", module: 1, title: "Perform — Unit Portfolio", category: "Performance Task",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Performance Task — compile unit tasks into a unit portfolio. The end-of-unit task where you compile your reflection, flyer, character profile, and threat report together is called a unit ___.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "The same word used for the career compilation in lesson 1.3.",
        flagHash: "686f545978332d6128539653c2d3cb9c9ef9e8bf42da4aff2689116de7105503" },
      { difficulty: "Medium", points: 100,
        prompt: "Performance Task — this unit followed a three-stage learning model. Name the middle stage: Play, ___, Perform.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "It comes after the hands-on Play stage and before you demonstrate mastery.",
        flagHash: "09ef290e34fc9225fd7ae9d6e01b11105a8249ac08376af4cf4e6e9df58b9a88" },
      { difficulty: "Hard", points: 150,
        prompt: "Assessment Reflection Questions — describing a moment you felt frustrated or stuck, and which mindset helped you get unstuck, is a ___ question.\n\nSubmit as flag{answer} — one lowercase word.",
        hint: "Looking back at your own experience to draw a lesson from it.",
        flagHash: "0ca2e3b7594bd8fea1650855e98d60523b13d2c2880c3c10b657b47b811d96c3" }
    ] },

  /* MODULE 4 — Computers & Number Systems (Play → 4.1 Binary → 4.2 Computer Basics → 4.3 Ethics → 4.4 CTF/Cert & Perform, no flags) ── */
  { id: "c1-cn-4.1-fundamentals", module: 4, title: "4.1 — Digital Communication & Binary Numbers", category: "Number Systems",
    frameworks: null,
    resource: { label: "Try the Binary Paradigm Cyber Interactive", url: "https://binary.paradigmcyberventures.com/home" },
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Convert decimal, binary, and hexadecimal numbers. Computers rely on ___, a system of only ones and zeros, because their circuits can only detect two electrical states.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the number system built from just 0s and 1s.",
        flagHash: "4beaab69bb248e2bdda63907d08ddea2345e3cf6d19b650af32ccbd33bac998f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Digital data. A group of 8 bits is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One of these can represent a single letter in ASCII.",
        flagHash: "dcaaadf1496012d33eb9367d8b34978faac4af47643196660e82b313e42b7650" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — How computers communicate. Hardware that lets a device connect to a network by converting its data into signals is called a Network Interface ___. Give the one-word term.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the physical component that gets a device onto the network in the first place.",
        flagHash: "0792768ff5942ac9b181343f026c21ae6293c7f51995a69e927afedf3748ec42" }
    ] },

  { id: "c1-cn-4.1-terms", module: 4, title: "4.1 ext — Match the Networking & Binary Term", category: "Number Systems", type: "match", points: 150,
    intro: "Objective — How Do Computers Communicate? Match each description to the term it defines. Tap the description, then tap the term.",
    pairs: [
      { left: "Any device connected to a network, like a laptop or printer", right: "Node" },
      { left: "Rules that govern how devices communicate over a network", right: "Networking Protocols" },
      { left: "The smallest unit of digital data — a single 0 or 1", right: "Bit" },
      { left: "Hardware that converts a computer's data into signals for the network", right: "Network Interface Card (NIC)" },
      { left: "A number system based on ten digits, 0-9", right: "Decimal System" }
    ] },

  { id: "c1-cn-4.1-convert", module: 4, title: "4.1 ext — Convert Decimal to Binary", category: "Number Systems", type: "order", points: 150,
    resource: { label: "Try the Binary Paradigm Cyber Interactive", url: "https://binary.paradigmcyberventures.com/home" },
    intro: "Objective — Converting Decimal & Binary Numbers. Order the steps to convert a decimal number to binary using the place-value method, first to last.",
    steps: [
      "List the binary place values from right to left: 1, 2, 4, 8, 16...",
      "Find the largest place value that fits without going over the decimal number",
      "Flip that place value ON and subtract it from the remaining total",
      "Repeat with the next place value until the remainder reaches zero"
    ] },

  { id: "c1-cn-4.2-basics", module: 4, title: "4.2 — Computer Basics", category: "Computer Basics",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the basic functions and components of a computer system. The four main functions of a computer system are input, processing, output, and ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's how the computer saves information for long-term use.",
        flagHash: "8f3d56c188b2b4d7371717e598793932b853da94a3a3d77bdfb72288c70f00f7" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Computer hardware. Temporary memory that stores data the CPU needs to access quickly, but loses everything if power is lost, is called ___.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Three letters — the computer's short-term memory.",
        flagHash: "c89f6313c1c769feda62dc3eb9847866a20ff4feaac258e282a54a5395e60863" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Computer software. Low-level software permanently stored on hardware that initializes the computer and loads the operating system (like BIOS or UEFI) is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It runs before the operating system even loads.",
        flagHash: "060cb50f15e6a7371f1945e586962405217cc17a3c014a5a098000d846cc1e4c" }
    ] },

  { id: "c1-cn-4.2-components", module: 4, title: "4.2 ext — Match the Component to Its Job", category: "Computer Basics", type: "match", points: 150,
    intro: "Objective — Computer Components Mastery Path. Match each job to the component that does it. Tap the job, then tap the component.",
    pairs: [
      { left: "Processes all instructions and performs calculations — the computer's \"brain\"", right: "CPU" },
      { left: "Stores data long-term using flash memory with no moving parts", right: "SSD" },
      { left: "Connects every hardware component so they can communicate", right: "Motherboard" },
      { left: "Manages hardware and software resources between the user and the machine", right: "Operating System" },
      { left: "Lets the OS communicate with a specific device like a printer", right: "Driver" }
    ] },

  { id: "c1-cn-4.2-boot", module: 4, title: "4.2 ext — Boot a Computer", category: "Computer Basics", type: "order", points: 150,
    intro: "Objective — How hardware and software work together. Order what happens when a computer powers on, first to last.",
    steps: [
      "Firmware (BIOS/UEFI) initializes the hardware",
      "The operating system loads into RAM",
      "Drivers let the OS communicate with peripheral hardware",
      "Application software runs on top of the OS for the user"
    ] },

  { id: "c1-cn-4.3-ethics", module: 4, title: "4.3 — Cyber Ethics", category: "Cyber Ethics",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Describe common ethical challenges in cybersecurity. Weighing strong security measures against convenience, privacy, and cost is the challenge of balancing security with other ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Security rarely wins by itself — it's traded off against other things people care about.",
        flagHash: "16480158e59172ea34abcc46d20c472ff0a0b8b025818df30de9872767a269cf" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Threat and incident response. One especially difficult ethical decision organizations face during an incident is whether to pay or refuse a ___ demand.\n\nSubmit as flag{word} (lowercase).",
        hint: "Malware that locks up data and demands payment to release it.",
        flagHash: "c3eab0cae2df20bf8a4b32c23cfe39e1d2e2f630a2c77d8b989431866e84712c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Security research and testing. Properly reporting a discovered security flaw to the organization instead of exploiting or publicizing it is called ___ disclosure.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of reckless — reporting it the careful, accountable way.",
        flagHash: "36da9e60a2c12e7666e5db93657b6c8450128ed3af8d24c3b71dd93c79444b47" }
    ] },

  { id: "c1-cn-4.3-challenges", module: 4, title: "4.3 ext — Match the Ethical Challenge", category: "Cyber Ethics", type: "match", points: 150,
    intro: "Objective — Common ethical challenges in cybersecurity. Match each scenario to the challenge it illustrates. Tap the scenario, then tap the challenge.",
    pairs: [
      { left: "Tracking employee internet activity to catch threats early", right: "Network Monitoring and User Privacy" },
      { left: "Deciding whether and how to encrypt customer records", right: "Data Storage and Encryption" },
      { left: "A smart home camera gets hacked because of weak default security", right: "IoT, Smart Grid, and Product Design" },
      { left: "A company is blamed for failing to secure its customers' data", right: "Accountability for Cybersecurity" },
      { left: "A researcher must decide how to report a vulnerability they found", right: "Security Research and Testing" }
    ] },

  { id: "c1-cn-vocab", module: 4, title: "4.1-4.3 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["binary","byte","bit","node","network interface card","cpu","ram","motherboard","firmware","operating system","driver","hard disk drive","solid-state drive"],
    hardMode: "unscramble" },

  /* MODULE 9 — Cryptology ─────────────────────────────────────────────────── */
  { id: "c1-cr-9.1-core", module: 9, title: "9.1 — Intro to Cryptology", category: "Cryptology",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define cryptology and its branches. The umbrella term covering both the making and breaking of secret codes is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Cryptography + cryptanalysis, together.",
        flagHash: "4ed6e0a1df55d164e682acf0b458f8d8cd28c67321ad84ca18478ed37e5d035a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Distinguish cryptography from cryptanalysis. The practice of creating secret codes and encryption systems — protecting confidentiality and integrity — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The making side, not the breaking side.",
        flagHash: "bcd500404d5cac8800fa5f97b216329b5f5d64bf8e657cbf45aedcd6cad4012c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain the algorithm vs. the key. The Algorithm is the recipe (\"shift the letters\"). The specific variable used with it — like \"shift by 3\" — is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The algorithm is the lock; this is the specific thing that fits it.",
        flagHash: "d4a44801327f6bdbad722255e7dbad5b319afb83fb8b50d18b6b6ec7d33e6963" }
    ] },

  { id: "c1-cr-9.1-terms", module: 9, title: "9.1 ext — Match the Crypto Term", category: "Cryptology", type: "match", points: 150,
    intro: "Objective — Explain cryptology terminology. Match each term to its definition. Tap the term, then tap its definition.",
    pairs: [
      { left: "Plaintext", right: "The original, readable message" },
      { left: "Ciphertext", right: "The scrambled, unreadable version" },
      { left: "Encryption", right: "Turning plaintext into ciphertext" },
      { left: "Decryption", right: "Turning ciphertext back into plaintext" },
      { left: "Algorithm", right: "The rule or recipe used to scramble the message" }
    ] },

  { id: "c1-cr-9.2-core", module: 9, title: "9.2 — VENONA & the Navajo Code Talkers", category: "Historical Ciphers",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the VENONA Project. A top-secret U.S. project that decrypted Soviet spy cables and helped uncover atomic spies like the Rosenbergs is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Declassified in 1995.",
        flagHash: "1420d35835a57ac6af41058b765b3402519b8d98432a036c55ac201e0707c375" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain the VENONA breakthrough. VENONA's One-Time Pads should have been unbreakable, but a Soviet factory accidentally produced ___ key pages — reusing the \"one-time\" key more than once.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of unique.",
        flagHash: "c908c86b89b0f0224892a33fe0973b55eec81205203c01b3e10590d94db8151b" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain the Navajo Code Talkers. U.S. Marines who used their unwritten native language to send secure tactical messages Japan never broke were the Navajo Code ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's in their name.",
        flagHash: "4e2157dc84064b50d8c195f28c9b58a94de9e79991a1079e105e0792b543bd26" }
    ] },

  { id: "c1-cr-9.2-facts", module: 9, title: "9.2 ext — Match the Historical Cipher", category: "Historical Ciphers", type: "match", points: 150,
    intro: "Objective — Describe historical cryptology programs. Match each program to its description. Tap the program, then tap its description.",
    pairs: [
      { left: "VENONA", right: "Decrypted Soviet spy cables during the Cold War" },
      { left: "Navajo Code Talkers", right: "Used an unwritten language as a \"living code\" in WWII" },
      { left: "One-Time Pad", right: "A truly random key, used only once, that is mathematically unbreakable" },
      { left: "Caesar Cipher", right: "Used by Julius Caesar for private military correspondence" }
    ] },

  { id: "c1-cr-9.3-core", module: 9, title: "9.3 — Ciphers", category: "Ciphers",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Categorize ciphers. A cipher where each letter is replaced by exactly one other letter or symbol for the entire message — like the Caesar Cipher — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One alphabet, the whole way through.",
        flagHash: "eb2a0ad6c51f1c751bba083d24de34744b9f09a1ecd6bf6bbfb458d4826026a6" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Categorize ciphers. A cipher that uses multiple substitution alphabets, so the same letter can encrypt differently each time — like the Vigenère Cipher — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Poly means many.",
        flagHash: "fce2dcd36e00cf9c443b37e2374c239b2ae0d5ccc2632f372bff092bd75db45f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Categorize ciphers. A cipher that doesn't replace letters at all, but instead rearranges their order — like the Rail Fence Cipher — is called a ___ cipher.\n\nSubmit as flag{word} (lowercase).",
        hint: "The letters are all still there, just in a different position.",
        flagHash: "8e7828762f3efb43e1dfb4a3771c5d70cf0855b0e0afbcf59110f7c76b267b7a" }
    ] },

  { id: "c1-cr-9.3-guess", module: 9, title: "9.3 ext — Guess the Cipher", category: "Ciphers", type: "match", points: 150,
    intro: "Objective — Identify a cipher from its logic. Match each clue to the cipher it describes. Tap the clue, then tap the cipher.",
    pairs: [
      { left: "Every letter shifted the same fixed amount, every time", right: "Caesar Cipher" },
      { left: "A shift of exactly 13 — encrypting twice restores the original", right: "ROT-13" },
      { left: "Uses a formula E(x) = (ax + b) mod 26", right: "Affine Cipher" },
      { left: "Letters rearranged in a zig-zag pattern, none replaced", right: "Rail Fence Cipher" },
      { left: "A keyword changes the shift for every letter", right: "Vigenère Cipher" },
      { left: "Rotating mechanical wheels create a new alphabet every keystroke", right: "Enigma Machine" }
    ] },

  { id: "c1-cr-9.3-category", module: 9, title: "9.3 ext — Sort by Category", category: "Ciphers", type: "match", points: 150,
    intro: "Objective — Categorize each cipher. Sort each cipher into Monoalphabetic, Polyalphabetic, or Transposition. Tap the cipher, then tap its category.",
    pairs: [
      { left: "Caesar Cipher", right: "Monoalphabetic" },
      { left: "Affine Cipher", right: "Monoalphabetic" },
      { left: "Rail Fence Cipher", right: "Transposition" },
      { left: "Vigenère Cipher", right: "Polyalphabetic" },
      { left: "Enigma Machine", right: "Polyalphabetic" }
    ] },

  { id: "c1-cr-9.4-core", module: 9, title: "9.4 — Modern Cryptography", category: "Modern Cryptography",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain symmetric encryption. An encryption method that uses the exact same key to both encrypt and decrypt data is called ___ encryption.\n\nSubmit as flag{word} (lowercase).",
        hint: "Fast, but risky to share the key.",
        flagHash: "0b84a426da5ad73abfd7f5e4a73a667621b374d6b8d3349074058a7f1ba9c8ed" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain asymmetric encryption. An encryption method that uses a Public Key to lock data and a different Private Key to unlock it is called ___ encryption.\n\nSubmit as flag{word} (lowercase).",
        hint: "Two different keys, not one.",
        flagHash: "fdb0d9f92ace8928ef9b642ec772d625e5f5921af3b1d8e13ce3aca6427b933c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain why asymmetric encryption was invented. The difficulty of sharing a secret key over the internet without it being stolen is called the ___ ___ problem. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Asymmetric encryption exists to solve this.",
        flagHash: "d3d10bdb36a175d6da8bda188b851a73e73ee3eda495a84dc7520e1e21b081b3" }
    ] },

  { id: "c1-cr-9.4-modern", module: 9, title: "9.4 ext — Symmetric or Asymmetric?", category: "Modern Cryptography", type: "match", points: 150,
    intro: "Objective — Sort modern encryption by type. Match each description to Symmetric or Asymmetric encryption. Tap the description, then tap the type.",
    pairs: [
      { left: "The same 16-character key both locks and unlocks the message (AES)", right: "Symmetric" },
      { left: "Anyone can use your Public Key to send you a secure message", right: "Asymmetric" },
      { left: "Only your Private Key can unlock what was encrypted with your Public Key", right: "Asymmetric" },
      { left: "Very fast and great for large files, but risky to share the key", right: "Symmetric" }
    ] },

  { id: "c1-cr-9.5-core", module: 9, title: "9.5 — Cryptanalysis", category: "Cryptanalysis",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define cryptanalysis. The art of breaking codes without having the key is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of cryptography.",
        flagHash: "f2dae73ff6e9303f682c5eb9598bde222f5f7576adc000811b7e4f9ef875a4b3" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain frequency analysis. Counting how often a symbol appears in a ciphertext to guess which letter it represents is called ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "'E' and 'T' are the most common letters in English.",
        flagHash: "850e302d75cedc85906208ef558eff009fe7f2f25d38c8d680963b87f02b06ee" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain cryptanalysis attacks. An attack where the cryptanalyst only has the scrambled message, with no clues about the original text, is called a ___-___ attack. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "The hardest kind of attack — no known plaintext to compare.",
        flagHash: "a5e1fa9a268a2946ea64c486b842712e565f157b2767817b6bd69ea36b94d04c" }
    ] },

  { id: "c1-cr-9.5-history", module: 9, title: "9.5 ext — Cryptanalysis Through History", category: "Cryptanalysis", type: "match", points: 150,
    intro: "Objective — Describe key figures and events in cryptanalysis. Match each to their contribution. Tap the item, then tap its contribution.",
    pairs: [
      { left: "Al-Kindi", right: "9th-century Arab scholar credited with inventing frequency analysis" },
      { left: "Alan Turing", right: "Built The Bombe to crack the German Enigma machine" },
      { left: "Zimmermann Telegram", right: "A decoded WWI message that helped draw the U.S. into the war" },
      { left: "Quantum Cryptanalysis", right: "Uses quantum computers to potentially break current internet encryption" }
    ] },

  { id: "c1-cr-9.6-core", module: 9, title: "9.6 — Decode the Message", category: "Applied Cryptology",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Apply the Caesar Cipher. This message was encrypted with a Caesar shift of +3:\n\nFLSKHU\n\nShift each letter backward by 3 to decode it.\n\nSubmit as flag{word} (lowercase), the decoded word.",
        hint: "F→C, L→I, S→P, K→H, H→E, U→R.",
        flagHash: "4d0a149ec4ee5f3815700964fe8b2dd598dbddc2b80c96e7877715c497ebe980" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Apply ROT-13. This message was encrypted with ROT-13:\n\nFRPERG\n\nApply ROT-13 again to decode it (it's its own inverse).\n\nSubmit as flag{word} (lowercase).",
        hint: "13 + 13 = 26 — the full alphabet.",
        flagHash: "ae2588b5b38fa6340b88b198b720b87e56c490502a1bbf4b39f65149ec1cc28c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Apply the Vigenère Cipher. This message was encrypted with the Vigenère Cipher using keyword \"KEY\":\n\nMCZOV\n\nSubtract each keyword letter's shift (K=+10, E=+4, Y=+24) from the corresponding ciphertext letter to decode it.\n\nSubmit as flag{word} (lowercase).",
        hint: "M-K, C-E, Z-Y, O-K, V-E.",
        flagHash: "036aadbb1a21a23a058aa6103537e3f94f0952c12ac75b0b706bfa8057d27500" }
    ] },

  { id: "c1-cr-vocab", module: 9, title: "9.1-9.6 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["cryptology","cryptography","cryptanalysis","plaintext","ciphertext","encryption","decryption","monoalphabetic","polyalphabetic","transposition","symmetric","asymmetric","frequency analysis","venona","caesar cipher"],
    hardMode: "cipher" },

  /* MODULE 3 — Social Engineering (Play → 3.1 Dumpster Diving → 3.2–3.4 Learn → 3.6 Perform, no flags) ── */
  { id: "c1-se-3.1-fundamentals", module: 3, title: "3.1 — Social Engineering Fundamentals", category: "Social Engineering",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define and explain the concept of social engineering. Digging through someone's trash to recover discarded documents, receipts, or passwords is called ___ ___. Give the two-word term.\n\nSubmit as flag{two words, lowercase}.",
        hint: "It's named after the container you'd find the paper in.",
        flagHash: "9d344523b5cd67a0c5743f739480e0d6275e892d594f6ed88497493e3b172965" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — The Dumpster Diving Simulation debrief. The activity closes by saying that in social engineering, the vulnerability isn't the software — it's the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The closing script names what attackers really exploit — not a system, but a person.",
        flagHash: "dcae4f40242fec3de70c594ed0d893313f9cf3ad392c8ff5a482755061a93762" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Why social engineering works. Beyond our trash, attackers exploit our trust, fear, and ___ to bypass even the strongest security systems. Give the word from the simulation's closing script.\n\nSubmit as flag{word} (lowercase).",
        hint: "The trait of wanting to be useful or accommodating to others — even strangers.",
        flagHash: "6785dc174379b6ba141828e551daaf9f80b088fab1ed66115cac0777a22534fd" }
    ] },

  { id: "c1-se-3.1-principles", module: 3, title: "3.1 ext — Match the Psychological Principle", category: "Social Engineering", type: "match", points: 150,
    intro: "Objective — Social Engineering Grid: the Movie Scene activity. Match each moment to the psychological principle it exploits. Tap the moment, then tap the principle.",
    pairs: [
      { left: "A caller claims to have admin rights and demands your password", right: "Authority" },
      { left: "\"Your account will be suspended in the next hour!\"", right: "Urgency" },
      { left: "A stranger says they forgot their badge and asks you to hold the door", right: "Helpfulness" },
      { left: "An email promises you've won $500 if you click now", right: "Greed" },
      { left: "A message pretends to be from a childhood friend to lower your guard", right: "Trust" }
    ] },

  { id: "c1-se-3.1-hunt", module: 3, title: "3.1 ext — The Dumpster Dive", category: "Social Engineering", type: "order", points: 150,
    intro: "Objective — The Dumpster Diving Simulation. Order how the social engineer works through the \"trash,\" first to last.",
    steps: [
      "Receive the target's discarded envelope of papers",
      "Uncrumple and sift through each piece of debris",
      "Cross-reference the details across items",
      "Piece together the target's bank and password"
    ] },

  { id: "c1-se-3.2-types", module: 3, title: "3.2 — The Art of Deception", category: "Social Engineering",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Compare and contrast social engineering attacks. A security process that requires more than one method to verify identity, like a password plus an app code, is called Multi-Factor ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It adds an extra layer of security beyond just a password.",
        flagHash: "0167e5432d777913fc23dc379d9f68c4f023af44904180c8c33935af6a833a09" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Attack types. Leaving an enticing item, like a USB drive labeled \"Confidential Payroll Data,\" to lure a victim into installing malware is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The attacker dangles something tempting, like bait on a hook.",
        flagHash: "e0718a8d1765a87ae7c3cd8c3d77f32b1bf3af527aff9faf95957799719be438" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Attack types. A fake pop-up warning that your PC is infected, designed to scare you into downloading rogue security software, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It uses fear of a fake threat to get you to install real malware.",
        flagHash: "181d3a646d0b40034309bc1802a0f7f200de5544fdd46f2d4272537e547bc11c" }
    ] },

  { id: "c1-se-3.2-attacks", module: 3, title: "3.2 ext — Match the Attack to the Definition", category: "Social Engineering", type: "match", points: 150,
    intro: "Objective — Social Engineering: The Art of Deception slides. Match each attack to its definition. Tap the attack, then tap the definition.",
    pairs: [
      { left: "Deceptive emails tricking users into revealing sensitive information", right: "Phishing" },
      { left: "A targeted attack aimed at one specific person or organization", right: "Spear Phishing" },
      { left: "Conducted over a phone call", right: "Vishing" },
      { left: "Phishing carried out through text messages", right: "Smishing" },
      { left: "High-profile phishing aimed at executives or VIPs", right: "Whaling" },
      { left: "Watching someone's screen or keyboard to steal information", right: "Shouldering" }
    ] },

  { id: "c1-se-3.2-defense", module: 3, title: "3.2 ext — Build Your Defenses", category: "Social Engineering", type: "order", points: 150,
    intro: "Objective — Strategies to Prevent Social Engineering. Order these prevention strategies as presented, first to last.",
    steps: [
      "Think before you click — verify links and senders",
      "Be skeptical of anything too urgent or too good to be true",
      "Use Multi-Factor Authentication",
      "Report suspicious activity to IT/security"
    ] },

  { id: "c1-se-3.3-phishing", module: 3, title: "3.3 — Spotting \"Phishy\" Emails", category: "Social Engineering",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Spot \"phishy\" emails. A phishing email addressing you as \"Dear Customer\" instead of your name is an example of a ___ greeting.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's not personalized to you at all — it could be sent to anyone.",
        flagHash: "85e6d00344c19283cebc59049e483ad27f0542a4d78587a1ea21e8471b9c6553" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Red flags. Phrases like \"urgent action required\" or \"your account will be deleted\" are examples of ___ or threatening language.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's trying to make you feel rushed, so you act before you think.",
        flagHash: "76c00305819ef810abd25f2e8bf9a1d8c410c82ddb4e9726a6fd2b9c6c3eb0c2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Reporting phishing. If you suspect an email is phishing, you should report it — but never ___ it to another user, since that risks phishing them too.\n\nSubmit as flag{word} (lowercase).",
        hint: "Passing the email along to someone else spreads the same risk to them.",
        flagHash: "ff663b6c9ca2baff167121a3fb9a4c0e1fabbb3fdd3bd93c13f25a87582d20ae" }
    ] },

  { id: "c1-se-3.3-redflags", module: 3, title: "3.3 ext — Spot the Red Flag", category: "Social Engineering", type: "match", points: 150,
    intro: "Objective — Phishing Slides: the seven red flags. Match each example to the red flag it demonstrates. Tap the example, then tap the red flag.",
    pairs: [
      { left: "\"Account suspended — urgent action required\"", right: "Urgent or Threatening Language" },
      { left: "A sender address that doesn't match the real organization", right: "Suspicious Sender Information" },
      { left: "\"Dear Customer\" instead of your name", right: "Generic Greetings" },
      { left: "Obvious misspellings or awkward phrasing", right: "Misspellings or Grammatical Errors" },
      { left: "A link that doesn't actually go where it claims", right: "Suspicious Links or Attachments" },
      { left: "An offer to win a prize you never entered", right: "Too Good to Be True" }
    ] },

  { id: "c1-se-3.3-verify", module: 3, title: "3.3 ext — Think Before You Click", category: "Social Engineering", type: "order", points: 150,
    intro: "Objective — Think Critically / Report Phishing. Order the steps for handling a suspicious email, first to last.",
    steps: [
      "Notice something feels off — urgency, a generic greeting, an odd request",
      "Hover over any links to check where they actually lead, without clicking",
      "Verify the sender's identity independently, not by replying",
      "Report the message to a trusted adult, teacher, or IT department"
    ] },

  { id: "c1-se-3.4-detect", module: 3, title: "3.4 — Identifying & Preventing Attacks", category: "Social Engineering",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Identify fraudulent email addresses. A legitimate email domain must match the official ___ of the organization it claims to represent.\n\nSubmit as flag{word} (lowercase).",
        hint: "The domain should match what you'd type into a browser to reach that company's real online presence.",
        flagHash: "0216906c30d7e45eb943cc88021c640953c9cf32b5a6b645c8530fab14fd58ae" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Masking techniques. Using look-alike letters, like an \"rn\" that looks like an \"m,\" to disguise a fake URL is called a ___ technique.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's about covering up a URL's true identity behind a convincing disguise.",
        flagHash: "6262e86f2183056c9372aca0cddca4282a2ce30b58130d1d38f62bcc372868d6" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Safe verification methods. If you must use email to verify a suspicious message, you should compose a brand-new message rather than clicking ___, which keeps you in contact with the attacker.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the button in your inbox that responds directly to whoever sent the message.",
        flagHash: "5e6b40584e06b02ebe80f6a34c8f63893a549fc274ee815d893d0793a6104c9e" }
    ] },

  { id: "c1-se-3.4-domains", module: 3, title: "3.4 ext — Domain Detective", category: "Social Engineering", type: "match", points: 150,
    intro: "Objective — Identifying & Preventing Social Engineering Attacks Guide. Match each clue to the detection technique it demonstrates. Tap the clue, then tap the technique.",
    pairs: [
      { left: "Checking what comes right after the @ symbol", right: "The Domain Test" },
      { left: "A display name saying \"CEO\" with nothing to back it up", right: "Name Discrepancy" },
      { left: "\"Your connection is not private\" warning", right: "Connection Warning" },
      { left: "A shortened link hiding its true destination", right: "URL Shortening" },
      { left: "www.bank-secure-v8293.net", right: "Alphabet Soup" }
    ] },

  { id: "c1-se-3.4-safe", module: 3, title: "3.4 ext — Verify Before You Trust", category: "Social Engineering", type: "order", points: 150,
    intro: "Objective — Safe Verification Methods. Order the steps for verifying a suspicious message, first to last.",
    steps: [
      "Don't open or preview the message until the sender is confirmed",
      "Contact the sender directly using a known phone number",
      "If email must be used, compose a brand-new message instead of replying",
      "Only act once identity is confirmed through a trusted channel"
    ] },

  { id: "c1-se-vocab", module: 3, title: "3.1-3.4 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["social engineering","phishing","spear phishing","baiting","scareware","pretexting","vishing","smishing","whaling","shouldering","multi-factor authentication","dumpster diving"],
    hardMode: "blitz" },

  /* MODULE 5 — OS Basics & Command Lines ────────────────────────────────── */
  { id: "c1-os-5.1-core", module: 5, title: "5.1 — Intro to OS: Linux & Windows", category: "Operating Systems",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define an OS. Software that manages a computer's hardware and provides services for other programs to run is called an ___.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Two words. It's the software layer between you and the hardware — Windows and Linux are both examples.",
        flagHash: "02b17120470f7e68833df082bee5d002b8bb410f4e4010df3f2a710f83021da3" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — SysAdmin role. What is the shorthand job title for the person who maintains, configures, and secures an organization's computer systems?\n\nSubmit as flag{word} (lowercase).",
        hint: "Short for \"System Administrator.\"",
        flagHash: "f7a81a400126334de84256622e603e8f125cadb647076654a02f684202e26d63" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Linux vs Windows terms. Linux ships in community-built versions like Ubuntu and Kali, each called a ___. Windows ships in versions like Home, Pro, and Enterprise, each called an ___. Give the two words, Linux term first.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Linux term first, Windows term second — both mean \"a version of the OS.\"",
        flagHash: "11b87045a159aad12a5cd7f62762c1e7c6cd360d1dc9e964bd8d4ee8c9624195" }
    ] },

  { id: "c1-os-5.1-terms", module: 5, title: "5.1 ext — Linux or Windows Term?", category: "Operating Systems", type: "match", points: 150,
    intro: "Objective — Compare Linux & Windows vocabulary. Match each term to the OS it belongs to. Tap the term, then tap the OS.",
    pairs: [
      { left: "Distribution", right: "Linux" },
      { left: "Edition", right: "Windows" },
      { left: "Terminal", right: "Linux" },
      { left: "Command Prompt", right: "Windows" },
      { left: "PowerShell", right: "Windows" },
      { left: "Bash", right: "Linux" }
    ] },

  { id: "c1-os-5.2-core", module: 5, title: "5.2 — Virtualization & VMs", category: "Virtualization",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Virtualization. The physical computer that provides the hardware for a virtual machine to run on is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One word. The real machine underneath.",
        flagHash: "20667e371ca2d3c6f8bccc2919dabdd85b98f2aff659cc283a46945b6aced897" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Virtualization. The virtual operating system running inside a virtual machine is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One word. The visiting OS, not the real machine underneath.",
        flagHash: "c8e133734be4a27e7e029e8c4b325007c6bdc95c150aa2c42e1132aa145e09ea" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Virtualization. What is the name of the software layer that creates, runs, and manages virtual machines, sitting between the hardware and the virtual environments?\n\nSubmit as flag{word} (lowercase).",
        hint: "It \"hovers over\" every VM on the machine.",
        flagHash: "1885b19762cdac8f29ad76f2762cc0ffb3b78bd6034d85413805f04de4e0fafc" }
    ] },

  { id: "c1-os-5.2-terms", module: 5, title: "5.2 ext — Virtualization Vocabulary", category: "Virtualization", type: "match", points: 150,
    intro: "Objective — Explain virtualization. Match each term to its role. Tap the term, then tap its role.",
    pairs: [
      { left: "Host", right: "The physical machine providing the hardware" },
      { left: "Guest", right: "The virtual machine running on top" },
      { left: "Hypervisor", right: "Creates and manages virtual machines" },
      { left: "Isolation", right: "Keeps a VM's problems from affecting the host" }
    ] },

  { id: "c1-os-5.3-core", module: 5, title: "5.3 — GUI and CLI", category: "GUI vs CLI",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — GUI vs CLI. The text-based interface where you type commands instead of clicking icons is called the ___. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Three letters. The opposite of a GUI — you type instead of click.",
        flagHash: "0396b5791be5a93a31be5a0b58aa3eb3d181ca907cd906378fdbb8f64f7fdb1c" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — GUI vs CLI. The visual world of windows, icons, and menus — the \"point and click\" method — is called the ___. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Pronounced \"gooey.\"",
        flagHash: "6aa1f3a1056bb29ed73275772a6c4d494d2a0ee652ee00f00c4d921f7b0df6b6" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — GUI vs CLI. The reading compares a GUI to an automatic transmission. What kind of car transmission does it compare a CLI to — the one that \"takes practice\" and gives you full manual control? Give the two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "The opposite of automatic — you work the gears yourself.",
        flagHash: "563cd6de28b59dcfa2d1438681d44f57be66c4324de11776bbb21fa23fbec8c8" }
    ] },

  { id: "c1-os-5.3-guicli", module: 5, title: "5.3 ext — GUI or CLI?", category: "GUI vs CLI", type: "match", points: 150,
    intro: "Objective — Compare GUI & CLI. Sort each trait from the reading. Tap the trait, then tap the interface.",
    pairs: [
      { left: "Point and click, visual and easy for beginners", right: "GUI" },
      { left: "Type text commands, powerful for automation", right: "CLI" },
      { left: "Resource heavy — loading graphics uses more RAM", right: "GUI" },
      { left: "Low resources — displays only text", right: "CLI" },
      { left: "Can script a task once and run it on 50 computers", right: "CLI" },
      { left: "Harder to accidentally wipe your OS with one click", right: "GUI" }
    ] },

  { id: "c1-os-5.3-findip", module: 5, title: "5.3 ext — Find Your IP Address (CLI)", category: "GUI vs CLI", type: "order", points: 150,
    intro: "Objective — Use the CLI. From the CLI vs. GUI Exploration worksheet, order the steps to find your IP address at the command line.",
    steps: [
      "Open Command Prompt",
      "Type: ipconfig",
      "Press Enter",
      "Read the IPv4 Address in the output"
    ] },

  { id: "c1-os-5.4-core", module: 5, title: "5.4 — Command Line: The Basics", category: "CLI Syntax",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — CLI syntax. A command usually acts on a file, folder, or other item you name after it. What is the general term for that item?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's what the command is pointed at — like the filename after cat.",
        flagHash: "eb2f05e83fbdf77c2b34b407b508ef717556b42ab9fc00bdd6e571c6d80b75a7" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — CLI syntax. The optional modifiers you add to a command, usually starting with a dash — like -l in ls -l — are called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Also called \"options.\" This word names the whole category.",
        flagHash: "463a1293599e0bde314a198aed8f42ac9f2b090f7abfcfff3ff551abbeb219d7" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Reading documentation before you run a command. Which three-letter Linux command, short for \"manual,\" opens a program's built-in instructions?\n\nSubmit as flag{command} (lowercase).",
        hint: "Three letters. Type it followed by any command name to see its full documentation.",
        flagHash: "9015b8b06d2858c85fd9267c62f90cafd64423e3f25eacdfd79c6c3d53731754" }
    ] },

  { id: "c1-os-5.4-predict", module: 5, title: "5.4 ext — Predict the Output", category: "CLI Syntax", type: "order", points: 150,
    intro: "Objective — Navigate the CLI. Order the habit a careful sysadmin builds before running an unfamiliar command.",
    steps: [
      "Read the command before typing it",
      "Check it for any flags or arguments",
      "Predict what the output should be",
      "Run the command",
      "Compare the real output to your prediction"
    ] },

  { id: "c1-os-5.5-core", module: 5, title: "5.5 — File Systems", category: "File Systems",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — File system hierarchy. Every file system's directory tree starts at a single base. What is this starting point called?\n\nSubmit as flag{word} (lowercase).",
        hint: "One word. Also the name of the Linux superuser account.",
        flagHash: "96dcdd224931ff2ce1f635efc3eeca676f571120453d98ed4d2314a04df69942" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — File paths. In the path /Users/JSmith/Music/song.mp3, the suffix .mp3 after the dot tells the OS which program should open the file. What is this suffix called?\n\nSubmit as flag{word} (lowercase).",
        hint: "One word — it \"extends\" the filename.",
        flagHash: "66726be1a0c03f62dcd6c918098552dbcc630c4ae1dbff9074281c71588eaaa6" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Linux vs Windows file systems. Windows separates folders in a path with a backslash. Linux uses a different single character. What is it?\n\nSubmit as flag{symbol}.",
        hint: "A single character. It's also Linux's name for the root of the whole filesystem.",
        flagHash: "108e1e1ccc9312925c008fb235e0bf8581d62253440fa920b03f9c97045a8b8c" }
    ] },

  { id: "c1-os-5.5-fsmatch", module: 5, title: "5.5 ext — Windows vs Linux Filesystem", category: "File Systems", type: "match", points: 150,
    intro: "Objective — Compare file systems. Match each filesystem trait to the OS it belongs to. Tap the trait, then tap the OS.",
    pairs: [
      { left: "Backslash (\\\\) path separator", right: "Windows" },
      { left: "Forward slash (/) path separator", right: "Linux" },
      { left: "Drive letters (C:\\\\, D:\\\\)", right: "Windows" },
      { left: "Case-insensitive (File.txt = file.txt)", right: "Windows" },
      { left: "Case-sensitive (File.txt ≠ file.txt)", right: "Linux" }
    ] },

  { id: "c1-os-5.5-missingfile", module: 5, title: "5.5 ext — Investigate the Missing File", category: "File Systems", type: "order", points: 150,
    intro: "Objective — Navigate & investigate file systems. From \"The Case of the Missing Report,\" order the investigative steps as the tech club team worked the case.",
    steps: [
      "Check recent file activity and who last accessed the folder",
      "Check the Recycle Bin",
      "Check for hidden files or changed file attributes",
      "Review who has edit permissions on the folder",
      "Check for a suspicious email that could explain the disappearance"
    ] },

  { id: "c1-os-5.5-pscmdlets", module: 5, title: "5.5 ext — PowerShell Cmdlet Match", category: "File Systems", type: "match", points: 150,
    intro: "Objective — Navigate file systems for Windows. Match each PowerShell cmdlet to what it does. Tap the cmdlet, then tap its job.",
    pairs: [
      { left: "Get-Location", right: "Show your current directory (alias: pwd)" },
      { left: "Get-ChildItem", right: "List directory contents (alias: dir)" },
      { left: "New-Item", right: "Create a new file or folder" },
      { left: "Set-Location", right: "Change directories (alias: cd)" },
      { left: "Get-Content", right: "Show a file's contents (alias: cat)" },
      { left: "Remove-Item", right: "Delete a file or folder" }
    ] },

  { id: "c1-os-5.6-core", module: 5, title: "5.6 — User Account Management", category: "Account Management",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — AuthN vs AuthZ. Proving who you are — typing a username and password to log in — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "\"Authenti-\" + ...",
        flagHash: "0167e5432d777913fc23dc379d9f68c4f023af44904180c8c33935af6a833a09" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — AuthN vs AuthZ. The system checking whether you're allowed to open a specific file, after you've already logged in, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "\"Authori-\" + ...",
        flagHash: "e0f6519553979b886476cc5cdb737cc9b2499d51c61c0d01c007ee8f313320be" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Account security. When an employee leaves, sysadmins usually LOCK the account instead of deleting it right away. Locking preserves the account as ___ for a later investigation.\n\nSubmit as flag{word} (lowercase).",
        hint: "The same word investigators use for anything that helps prove what happened.",
        flagHash: "8531aa81101ffce89718956414a130f328321f19a06874a8109980c3e37f2640" }
    ] },

  { id: "c1-os-5.6-cmds", module: 5, title: "5.6 ext — Linux Account Commands", category: "Account Management", type: "match", points: 150,
    intro: "Objective — Practice account management. Match each Linux command to what it does. Tap the command, then tap its job.",
    pairs: [
      { left: "useradd", right: "Create a new user account" },
      { left: "passwd", right: "Set or change a user's password" },
      { left: "passwd -S", right: "Check an account's status (locked/active)" },
      { left: "userdel", right: "Delete a user account" },
      { left: "groups", right: "List a user's group memberships" }
    ] },

  { id: "c1-os-5.6-onboard", module: 5, title: "5.6 ext — Onboard a New Linux User", category: "Account Management", type: "order", points: 150,
    intro: "Objective — User account management. Order the steps to add and verify a new Linux user.",
    steps: [
      "useradd alice  (create the account)",
      "passwd alice  (set a password)",
      "usermod -aG staff alice  (add to a group)",
      "groups alice  (verify group membership)",
      "id alice  (confirm the account is set up correctly)"
    ] },

  { id: "c1-os-5.6-groups", module: 5, title: "5.6 ext — Create a Linux Group and Add a User", category: "Account Management", type: "order", points: 150,
    intro: "Objective — Practice basic user account management. Order the steps to create a group and add an existing user to it.",
    steps: [
      "groups demoUser  (check current groups)",
      "sudo groupadd demoGroup  (create the group)",
      "sudo groupmod -a -U demoUser demoGroup  (add the user to the group)",
      "groups demoUser  (verify the new group appears)"
    ] },

  { id: "c1-os-5.7-core", module: 5, title: "5.7 — Process Management", category: "Process Management",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Process basics. Computers identify every running process not by name but by a number. Give the three-letter acronym for this number.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Three letters. \"Process ___.\"",
        flagHash: "3c1d59bbc005f35b929258ebc0750f7cd645cb8f7600543ef314471de34a644c" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Process states. A process that has finished running but still lingers in the process list, because its exit status hasn't been read, is called a ___ process.\n\nSubmit as flag{word} (lowercase).",
        hint: "It sounds spooky — like the walking dead.",
        flagHash: "dff03ac4e104d4384093933fb9295390c50e9379d90f1c21425c37c5650b208e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Process lifecycle. If a parent process crashes but the child process it started keeps running, that surviving child is now called an ___ process.\n\nSubmit as flag{word} (lowercase).",
        hint: "Same word used for a child who has lost their parents.",
        flagHash: "94cd8925222ae27e9599c31056697cc9687fbb92b50bbd5f58247aa1be46c80f" }
    ] },

  { id: "c1-os-5.7-terms", module: 5, title: "5.7 ext — Process Management Vocabulary", category: "Process Management", type: "match", points: 150,
    intro: "Objective — Research process management. Match each term to its definition. Tap the term, then tap its definition.",
    pairs: [
      { left: "Daemon", right: "A background process waiting to be used, like a web server" },
      { left: "Memory leak", right: "A program that keeps taking RAM and never releases it" },
      { left: "Fork", right: "A process creating a copy of itself to start a new one" },
      { left: "Context switch", right: "The CPU pausing one process to run another" },
      { left: "Scheduler", right: "The kernel component deciding which process runs next" }
    ] },

  { id: "c1-os-5.7-stopprocess", module: 5, title: "5.7 ext — Stop a Frozen Process the Right Way", category: "Process Management", type: "order", points: 150,
    intro: "Objective — Execute process management commands. Order the safest way to shut down a frozen process.",
    steps: [
      "Run top to find the frozen process's PID",
      "Send SIGTERM (signal 15) and ask it to close gracefully",
      "Wait to see if it exits on its own",
      "If it's still stuck, send SIGKILL (signal 9) to force it closed",
      "Confirm the process is gone"
    ] },

  { id: "c1-os-5.9-core", module: 5, title: "5.9 — Cyber Ethics", category: "Cyber Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Professional ethics. A researcher who finds a security flaw is expected to privately notify the vendor and give them time to fix it before telling the public. What is this two-word practice called?\n\nSubmit as flag{two_words} with an underscore.",
        hint: "\"Responsible ___.\"",
        flagHash: "2419f7d9a99121652bbdf7809a116de22dd82a727cfa97365a2a92b58a28f096" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Professional ethics. Testing a system only with the owner's explicit written permission is a core rule for ethical hackers. What single word describes access you've been given permission for?\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of \"unauthorized.\"",
        flagHash: "81fd84a24b26617b4ce83b844867d2313c312d2bad80f76b68f40a3e6cf99953" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Professional ethics. A cybersecurity professional who looks through more client data than their job requires, out of curiosity, is violating the same access principle you learned in user account management: only give (and take) access you actually need. Name that principle.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "\"Least ___.\" Same term from 5.6.",
        flagHash: "d83e6224bc301f25335532abb55ecbb617ec3ff9ceb738249e131fb38eb04be7" }
    ] },

  { id: "c1-os-5.9-ethics", module: 5, title: "5.9 ext — Ethical or Unethical?", category: "Cyber Ethics", type: "match", points: 150,
    intro: "Objective — Describe cybersecurity ethics best practices. Sort each scenario. Tap the scenario, then tap the verdict.",
    pairs: [
      { left: "Reporting a bug privately to the vendor first", right: "Ethical" },
      { left: "Publicly posting an exploit before the vendor can patch it", right: "Unethical" },
      { left: "Only accessing systems you have written permission to test", right: "Ethical" },
      { left: "Snooping through files outside the scope of your job", right: "Unethical" }
    ] },

  { id: "c1-os-vocab", module: 5, title: "5.1-5.9 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["operating system","hypervisor","virtual machine","gui","cli","root","extension","authentication","authorization","pid","zombie","least privilege"],
    hardMode: "speedmatch" },


  /* MODULE 10 — Cyber Competitions (NCL) ───────────────────────────────────── */
  /* MODULE 10 — Cyber Competitions ────────────────────────────────────────── */
  { id: "c1-comp-10.1-core", module: 10, title: "10.1 — Intro to Cyber Competitions", category: "Competition Formats",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain competition formats. Individuals or teams solving independent puzzles across categories to find a hidden string of text and earn points describes a ___ ___ competition. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "It's what this whole game is called.",
        flagHash: "a0584e2682ef33af58e7d967b75f22112067b7bb37ca07ed90f9cbb6228957d8" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain competition formats. A format where teams are given a network to secure against active attackers while keeping services running is called ___/Offense simulation.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of Offense.",
        flagHash: "d5edb42995bdc2fd7fccb374f6ced4997a8dcec5bbcc0dc9a845a8cb7f076073" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Adopt the competitor mindset. Cyber competitions emphasize learning and problem-solving; success is measured by growth in knowledge and confidence, not just ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "What shows up on the leaderboard, but isn't the real goal.",
        flagHash: "d3c4d7310a08ef2546f615b4c94df36088bb6cda5dbb2cc9c905cd572989a9ab" }
    ] },

  { id: "c1-comp-10.1-mindset", module: 10, title: "10.1 ext — The Competitor Mindset", category: "Competition Formats", type: "match", points: 150,
    intro: "Objective — Apply the cyber competitor mindset. Match each behavior to the mindset it shows. Tap the behavior, then tap the mindset.",
    pairs: [
      { left: "A team gets stuck and switches to a new tool or category instead of giving up", right: "Pivoting" },
      { left: "A competitor takes detailed notes so a stuck teammate can catch up fast", right: "Documentation" },
      { left: "A team double-checks a flag's format before submitting", right: "Accuracy" },
      { left: "A player treats a wrong answer as a clue rather than a failure", right: "Growth Mindset" }
    ] },

  { id: "c1-comp-10.2-core", module: 10, title: "10.2 — Competition Vocabulary", category: "Competition Categories",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Distinguish cryptography from steganography. Hiding a secret message inside another file — like a hidden text file inside a photo — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Crypto scrambles a message; this hides it instead.",
        flagHash: "466487e2d33da7c711a154fb720b22c70c15c1870846481873ab77daf06a4704" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain OSINT terms. Taking one piece of information, like an email, and using it to find new information, like a social media profile, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Basketball players do this too.",
        flagHash: "8865a578b5e3a95e5aafb863e87537661b66fd2ceb8214e9edefc29dcc8199eb" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain forensics. The first few bytes of a file that reveal its true type even if the extension has been changed are called the file ___ (or Magic Bytes).\n\nSubmit as flag{word} (lowercase).",
        hint: "Every PDF starts with the same one of these.",
        flagHash: "c5c2fac00fec909ab997fc7eb149eba62cca0ff6f4d3a119f1d3c8ac42932ab9" }
    ] },

  { id: "c1-comp-10.2-categories", module: 10, title: "10.2 ext — Match the Competition Category", category: "Competition Categories", type: "match", points: 150,
    intro: "Objective — Describe common competition categories. Match each category to what it covers. Tap the category, then tap its description.",
    pairs: [
      { left: "OSINT", right: "Gathering info from public sources like social media and maps" },
      { left: "Cryptography", right: "Making and breaking codes and ciphers" },
      { left: "Steganography", right: "Finding a message hidden inside another file" },
      { left: "Log Analysis & Network Traffic", right: "Examining packet captures for suspicious activity" },
      { left: "Web Application Exploitation", right: "Finding flaws like SQL Injection in websites" },
      { left: "Forensics", right: "Recovering and examining digital evidence from files" },
      { left: "Scanning & Enumeration", right: "Discovering open ports and running services" }
    ] },

  { id: "c1-comp-10.2-terms", module: 10, title: "10.2 ext — Match the Term", category: "Competition Categories", type: "match", points: 150,
    intro: "Objective — Apply competition vocabulary. Match each term to its definition. Tap the term, then tap its definition.",
    pairs: [
      { left: "Metadata", right: "Hidden data about data, like GPS coordinates in a photo" },
      { left: "Google Dorking", right: "Using advanced search filters to find unindexed information" },
      { left: "SQL Injection", right: "Tricking a database into revealing info through an entry field" },
      { left: "PCAP", right: "A file format that records network traffic" },
      { left: "Hashing", right: "Turning data into a unique digital fingerprint" }
    ] },

  { id: "c1-comp-10.3-core", module: 10, title: "10.3 — Competition Tools", category: "Competition Tools",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Identify competition tools. The free web-based tool nicknamed the \"cyber Swiss Army knife,\" used to encode, decode, and transform data by chaining recipes, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You'll use it constantly for crypto challenges.",
        flagHash: "8c1ed041d1c82dbb252a0dbb64671344e9ef31c93e1d7698e0f5460f8e38d43f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Identify competition tools. The industry-standard command-line tool used to scan a network and discover which ports are open is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The go-to open-source network scanner.",
        flagHash: "a8043f1361355b179941e0f023f504d372719d64213189f4f7efc136cc601a2b" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Identify competition tools. The command-line tool used to capture and analyze network traffic packets — seeing exactly what computers are \"saying\" to each other — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The name is literally what it does to packets.",
        flagHash: "5382f5ab29e9a406f1af3ec0dd2bb1bc70f8839f34608132798f4493a4e603c1" }
    ] },

  { id: "c1-comp-10.3-decode", module: 10, title: "10.3 ext — Recognize the Encoding", category: "Competition Tools", type: "match", points: 150,
    intro: "Objective — Apply competition tools. Match each sample to what it is. Tap the sample, then tap its encoding.",
    pairs: [
      { left: "SGVsbG8=", right: "Base64" },
      { left: "48656c6c6f", right: "Hexadecimal" },
      { left: "Uryyb", right: "ROT13" },
      { left: "01001000", right: "Binary" }
    ] },

  { id: "c1-comp-10.3-approach", module: 10, title: "10.3 ext — Run a CTF Challenge", category: "Competition Tools", type: "order", points: 150,
    intro: "Objective — Apply a competition strategy. Order the steps of tackling a CTF challenge, first to last.",
    steps: [
      "Read the challenge carefully",
      "Identify the category and the right tool for it",
      "Attempt a solution",
      "Verify the result before submitting",
      "Submit the flag"
    ] },

  { id: "c1-comp-vocab", module: 10, title: "10.1-10.3 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["osint","pivot","metadata","steganography","cryptography","pcap","sql injection","forensics","file header","hashing","scanning","nmap","brute force","port"],
    hardMode: "cipher" },

  /* MODULE 6 — Network Basics ────────────────────────────────────────────── */
  { id: "c1-net-6.1-core", module: 6, title: "6.1 — What is a Network", category: "Networking Basics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define a network. A network is a connection plus a shared ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Files, hardware, and services are all examples of this.",
        flagHash: "9422d7ad87579eeed1aaa8ecc2650bef1f8436813c3ce426eab236590cb63fa9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Scale of networks. A small, high-speed network confined to one home, classroom, or building — where you own the equipment — is called a ___. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "\"Local Area ___.\"",
        flagHash: "64d7827b17d719c4aa93d512459a208bc7424f408a6086c23e20974a0393a5b2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Protocols. Computers only understand IP numbers, not names like google.com. The protocol that translates human-readable domain names into IP addresses — the \"phonebook of the internet\" — is called ___. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "\"Domain Name ___.\"",
        flagHash: "91c62aef53d9904503cebc53ad67c728716b5728b5cab6ed9601caf62ef178da" }
    ] },

  { id: "c1-net-6.1-lanwan", module: 6, title: "6.1 ext — LAN or WAN?", category: "Networking Basics", type: "match", points: 150,
    intro: "Objective — Identify network scale. Sort each connection. Tap the connection, then tap LAN or WAN.",
    pairs: [
      { left: "Small area, one building, you own the equipment", right: "LAN" },
      { left: "Large geographic area, connects multiple LANs together", right: "WAN" },
      { left: "Printing to a printer down the hall", right: "LAN" },
      { left: "Checking Gmail on your phone from a coffee shop", right: "WAN" }
    ] },

  { id: "c1-net-6.1-clientserver", module: 6, title: "6.1 ext — Client or Server?", category: "Networking Basics", type: "match", points: 150,
    intro: "Objective — Identify network roles. Tap the example, then tap Client or Server.",
    pairs: [
      { left: "Your phone requesting a website", right: "Client" },
      { left: "Google's computers serving up search results", right: "Server" },
      { left: "Your laptop asking to load an email", right: "Client" },
      { left: "Netflix's movie storage answering a stream request", right: "Server" }
    ] },

  { id: "c1-net-6.2-core", module: 6, title: "6.2 — Network Components", category: "Network Components",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Network components. The device that connects multiple devices within a single local network and directs traffic between them is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One word. Every device on a LAN plugs into this.",
        flagHash: "38c4f6a183505d28823e7a8bac4171f50464cd8cc5f7090ba89d37b827a1f95d" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Network components. The device that connects your local network to the internet, moving traffic between different networks, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One word. It's where the internet \"enters the house.\"",
        flagHash: "31305d5bfa6940afa4bbe2becc9221fbaae0e6f451384f36bb6e8065ab52fd5d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Network components. The device that lets Wi-Fi devices join a wired network is called a ___. Give the three words.\n\nSubmit as flag{three_words} with underscores.",
        hint: "Three words, all lowercase and underscored — the thing that broadcasts your Wi-Fi.",
        flagHash: "13e994f24ca5b00f4088a0f9b3df82ce9927b2b0d1eb9e097739cce8aa593075" }
    ] },

  { id: "c1-net-6.2-components", module: 6, title: "6.2 ext — Match the Component", category: "Network Components", type: "match", points: 150,
    intro: "Objective — Identify network components. Match each component to its job. Tap the component, then tap its job.",
    pairs: [
      { left: "Router", right: "Connects your network to the internet" },
      { left: "Switch", right: "Connects multiple devices within one local network" },
      { left: "Modem", right: "Converts your ISP's internet signal into a usable format" },
      { left: "Wireless Access Point", right: "Lets Wi-Fi devices join a wired network" }
    ] },

  { id: "c1-net-6.3-core", module: 6, title: "6.3 — Network Topologies & Diagrams", category: "Topologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Network topologies. In the most common modern layout, every device has its own dedicated cable running back to a central switch. This is called a ___ topology.\n\nSubmit as flag{word} (lowercase).",
        hint: "Picture the shape it makes on paper — lines radiating out from one point.",
        flagHash: "18d24f01160bf2f508d31bf1b8d5ccdccc4aa6303cbea4c5b9693e810a926e3f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Network topologies. In this topology, every device shares one backbone cable — and if that cable breaks, the entire network fails. Name it.\n\nSubmit as flag{word} (lowercase).",
        hint: "Like a city bus route everyone rides together.",
        flagHash: "71356a4d3698965c1f69360ecfb000a7a078f04a4672f092c2501317c1b08d42" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Network topologies. In this topology, every device connects directly to every other device — the most expensive to cable, but nearly impossible to fully break. Name it.\n\nSubmit as flag{word} (lowercase).",
        hint: "Think of a net of wires between every point.",
        flagHash: "1fc0181abfd988506f088ae78817ee00f9da14cc8c320a5a9954d9e5faee33ff" }
    ] },

  { id: "c1-net-6.3-topology", module: 6, title: "6.3 ext — Topology Trait Match", category: "Topologies", type: "match", points: 150,
    intro: "Objective — Describe how topologies function. Match each topology to what happens when a cable is cut. Tap the topology, then tap the outcome.",
    pairs: [
      { left: "Star", right: "Only that one device loses connection" },
      { left: "Bus", right: "The entire network fails" },
      { left: "Ring", right: "The circle breaks and data stops flowing" },
      { left: "Mesh", right: "Data simply takes another path" }
    ] },

  { id: "c1-net-6.3-diagram", module: 6, title: "6.3 ext — Build the Network Hierarchy", category: "Topologies", type: "order", points: 150,
    intro: "Objective — Diagram a network. Order how a professional network diagram is built, top to bottom.",
    steps: [
      "Draw a cloud at the top and label it \"The Internet\"",
      "Draw the Router below it and connect it to the cloud",
      "Draw the Switch below the Router and connect it",
      "Draw the Workstations below the Switch and connect them"
    ] },

  { id: "c1-net-6.4-core", module: 6, title: "6.4 — Addressing", category: "Addressing",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Physical addressing. A permanent hardware address burned into a device's Network Interface Card at the factory is called a ___ address. Give the three-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "\"Media Access Control.\"",
        flagHash: "0126f495eb054ee2114637e63cd1d82936b19e3a7f36843baa49cb47feeafd14" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Logical addressing. The address your device is assigned by whatever network it's currently connected to — and which changes when you switch networks — is a(n) ___ address. Give the two-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "\"Internet Protocol.\"",
        flagHash: "b7dd261872f3a6bd653e0add60842b13ba49f9e8743ebbb426002d17641c3da2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — DHCP vs Static. A web server needs to be found at the exact same address every time, so it's manually assigned a ___ IP instead of an automatic DHCP lease.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of \"dynamic.\"",
        flagHash: "84a5a5254acc2e1a4e78ed97e519f36049939ee42eb008ca66b34ec9d1e75900" }
    ] },

  { id: "c1-net-6.4-macip", module: 6, title: "6.4 ext — MAC or IP Address?", category: "Addressing", type: "match", points: 150,
    intro: "Objective — Describe physical and logical addressing. Sort each trait. Tap the trait, then tap the address type.",
    pairs: [
      { left: "Permanent, burned into the hardware at the factory", right: "MAC Address" },
      { left: "Temporary, assigned by whatever network you join", right: "IP Address" },
      { left: "Used by a Switch to deliver traffic on the local network", right: "MAC Address" },
      { left: "Used by a Router to move data across the internet", right: "IP Address" },
      { left: "Like a Social Security Number", right: "MAC Address" },
      { left: "Like a Mailing Address", right: "IP Address" }
    ] },

  { id: "c1-net-6.4-scavenger", module: 6, title: "6.4 ext — Find the Address (CLI)", category: "Addressing", type: "order", points: 150,
    intro: "Objective — Use the CLI to find addresses. From the Address Scavenger Hunt, order the steps to find a workstation's IP and MAC address.",
    steps: [
      "Open the CLI tab on the workstation",
      "Type ipconfig to find the IP address",
      "Type ipconfig /all to find the MAC address",
      "Compare the first three octets of each device's IP address"
    ] },

  { id: "c1-net-6.5-core", module: 6, title: "6.5 — Ports and Protocols", category: "Ports & Protocols",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Ports. A numerical identifier from 0 to 65,535 that keeps different types of network traffic organized on a computer is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Like a door into the computer.",
        flagHash: "242ca48793bf9ad113e7f88f6890a0f47c48b75f36ad5270ac11fc029eb0b955" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Web traffic ports. Port 80 carries unencrypted web traffic in plain text. Which port number carries the encrypted, secure version (HTTPS)?\n\nSubmit as flag{number}.",
        hint: "A three-digit number.",
        flagHash: "6330530366f15794e228e1b06447209953daab864b4e3643be8b90a8b3dc4081" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Insecure protocols. Port 23 runs an old, unencrypted remote-login protocol where every command — and password — is sent in the open, like shouting through a megaphone. Name the protocol.\n\nSubmit as flag{word} (lowercase).",
        hint: "An outdated ancestor of SSH.",
        flagHash: "4a15386c6af353a2b5b2a8d25abd1f8ea8814e5b83794911b0835baa914b14a5" }
    ] },

  { id: "c1-net-6.5-portmatch", module: 6, title: "6.5 ext — Match the Port to the Protocol", category: "Ports & Protocols", type: "match", points: 150,
    intro: "Objective — Identify basic ports and protocols. Match each port number to its protocol. Tap the port, then tap the protocol.",
    pairs: [
      { left: "Port 53", right: "DNS" },
      { left: "Port 80", right: "HTTP" },
      { left: "Port 443", right: "HTTPS" },
      { left: "Port 22", right: "SSH" },
      { left: "Port 21", right: "FTP" },
      { left: "Port 23", right: "Telnet" }
    ] },

  { id: "c1-net-6.5-triage", module: 6, title: "6.5 ext — Triage Incoming Traffic", category: "Ports & Protocols", type: "order", points: 150,
    intro: "Objective — Describe why ports and protocols matter. Order how a network admin evaluates an incoming connection.",
    steps: [
      "Identify the port and protocol involved",
      "Check whether that protocol encrypts its data",
      "Decide whether the traffic is expected, suspicious, or a threat",
      "Allow, flag, or block the traffic accordingly"
    ] },

  { id: "c1-net-6.6-core", module: 6, title: "6.6 — OSI and TCP/IP Models", category: "OSI & TCP/IP",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — OSI Model. How many layers does the OSI Model have?\n\nSubmit as flag{number}.",
        hint: "A single digit.",
        flagHash: "5583b3ce3b42644490f323edfc1da538d0c41d26ce150a65e700b3b6d11f651f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — TCP/IP Model. How many layers does the real-world TCP/IP Model have?\n\nSubmit as flag{number}.",
        hint: "A single digit, fewer than the OSI Model.",
        flagHash: "7be5aec942dbdcfb4e21cd12dd137de80acf61b69c924a3500a50673253943c2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Transport layer. In the Full Send demo, one transport protocol means \"ball up your message and throw it\" with no confirmation of delivery — prioritizing speed over reliability. Give its acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "The opposite of TCP.",
        flagHash: "711a0e165678a3f2d508859c2a67b316b5a6fe1b8894c133943367cbac1d8f0b" }
    ] },

  { id: "c1-net-6.6-encapsulation", module: 6, title: "6.6 ext — Encapsulate a Packet", category: "OSI & TCP/IP", type: "order", points: 150,
    intro: "Objective — Summarize the OSI Model. From the Full Send OSI Demo, order the layers as a message is encapsulated for sending, top to bottom.",
    steps: [
      "Layer 7 (Application) — write your secret message",
      "Layer 6 (Presentation) — encrypt it",
      "Layer 5 (Session) — assign a Session ID",
      "Layer 4 (Transport) — choose TCP or UDP",
      "Layer 3 (Network) — add the IP addresses",
      "Layer 2 (Data Link) — add the MAC addresses",
      "Layer 1 (Physical) — physically send the packet"
    ] },

  { id: "c1-net-6.6-layers", module: 6, title: "6.6 ext — OSI to TCP/IP", category: "OSI & TCP/IP", type: "match", points: 150,
    intro: "Objective — Compare the OSI and TCP/IP Models. Match each OSI layer to its TCP/IP Model equivalent. Tap the OSI layer, then tap the TCP/IP layer.",
    pairs: [
      { left: "Application, Presentation, Session (OSI)", right: "Application Layer (TCP/IP)" },
      { left: "Transport (OSI)", right: "Transport Layer (TCP/IP)" },
      { left: "Network (OSI)", right: "Internet Layer (TCP/IP)" },
      { left: "Data Link, Physical (OSI)", right: "Network Access Layer (TCP/IP)" }
    ] },

  { id: "c1-net-6.7-core", module: 6, title: "6.7 — Connectivity and Tools", category: "Networking Tools",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Networking tools. Which tool sends a basic ICMP \"Echo Request\" to confirm whether a device is online and reachable?\n\nSubmit as flag{word} (lowercase).",
        hint: "The classic \"is this thing on?\" command.",
        flagHash: "bbf01cf31391db9819acc059dfe115a90fa07c15bf4c9faaa6bf0eb5889d4d14" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Networking tools. Which tool maps every router \"hop\" along the path to a destination, so you can pinpoint exactly where a slowdown is happening? Give the Linux name.\n\nSubmit as flag{word} (lowercase).",
        hint: "Windows calls it tracert; Linux spells it out.",
        flagHash: "1aa48cb28abe03a68bf992f01d5e86d93820d150af6e996df212069ce500258a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Networking tools. Which tool displays all active TCP and UDP connections on a device, useful for spotting malware \"calling home\" to a suspicious IP?\n\nSubmit as flag{word} (lowercase).",
        hint: "Short for \"network statistics.\"",
        flagHash: "167f3544498d20cf6423b4a908cdd46cde67301a06737f58e3d1e24ef1fad59f" }
    ] },

  { id: "c1-net-6.7-tools", module: 6, title: "6.7 ext — Match the Networking Tool", category: "Networking Tools", type: "match", points: 150,
    intro: "Objective — Use real-world networking tools. Match each scenario to the tool that solves it. Tap the scenario, then tap the tool.",
    pairs: [
      { left: "One site fails to load by name, but others work fine", right: "nslookup" },
      { left: "You want to see if a server is online and reachable", right: "ping" },
      { left: "You suspect malware is phoning home to a strange IP", right: "netstat" },
      { left: "You need to confirm your own device's IP configuration", right: "ipconfig / ip addr" },
      { left: "You want to see which hop is causing a slowdown", right: "tracert / traceroute" }
    ] },

  { id: "c1-net-vocab", module: 6, title: "6.1-6.7 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["network","lan","wan","router","switch","topology","mac address","ip address","port","protocol","osi model","dns"],
    hardMode: "cipher" },


  /* MODULE 7 — Cyber Threats ──────────────────────────────────────────────── */
  { id: "c1-thr-7.1-core", module: 7, title: "7.1 — The Attack Surface", category: "Attack Surface",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Define the attack surface. The sum of all possible points where an attacker could get into, or extract data from, a system is called the ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "The bigger this is, the harder it is to defend.",
        flagHash: "b64b2d3c7d412434b55d7bee89eb246a6ee96d7bd6bffa9c78abfb5cfe4303f0" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Types of attack surfaces. The attack surface made up of people — the \"weakest link,\" targeted through phishing and pretexting — is called the ___ attack surface.\n\nSubmit as flag{word} (lowercase).",
        hint: "Not digital, not physical — the third category.",
        flagHash: "dcae4f40242fec3de70c594ed0d893313f9cf3ad392c8ff5a482755061a93762" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Reducing risk. Using multiple, independent layers of security so that if one layer fails, another still blocks the attacker, is called ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "\"Defense in ___.\"",
        flagHash: "55871a80cf645173e8ad65a91b76bcb872139469fa86f577738c3177dbf99c71" }
    ] },

  { id: "c1-thr-7.1-surfaces", module: 7, title: "7.1 ext — Which Attack Surface?", category: "Attack Surface", type: "match", points: 150,
    intro: "Objective — Explain the digital, physical, and human attack surface. Match each example to its category. Tap the example, then tap the category.",
    pairs: [
      { left: "Weak passwords, open ports, outdated software", right: "Digital Attack Surface" },
      { left: "An old hard drive thrown out without being wiped", right: "Physical Attack Surface" },
      { left: "An attacker pretexting as IT support on the phone", right: "Human Attack Surface" },
      { left: "An unlocked server room", right: "Physical Attack Surface" },
      { left: "A poorly secured public API", right: "Digital Attack Surface" }
    ] },

  { id: "c1-thr-7.2-core", module: 7, title: "7.2 — Cyber Kill Chain & Threat Actors", category: "Kill Chain",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Reconnaissance. Attackers gather public information about a target without ever touching their systems. Give the acronym for this kind of publicly-sourced intelligence gathering.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Open-Source Intelligence.",
        flagHash: "3fc15149e5c1961d82e51cdad33971ac2a87aa79e609c6f425d47bbc05bbb365" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Kill chain phases. After gaining Initial Access, an attacker who quietly installs a backdoor so they can get back in later — even after a reboot — is establishing ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of a one-time smash-and-grab.",
        flagHash: "06698f2ee70182aa918c4a15edb64456c6989f7d8d79b4b68dae17213d44e53a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Kill chain phases. An attacker who has broken into one low-security system and is now hopping across the internal network toward a bigger target is performing ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Moving sideways through the network, not up in privilege.",
        flagHash: "51b5d5b59088aaa5a8e5697244785c3c7d3126cc921be779f3c686906341c9d0" }
    ] },

  { id: "c1-thr-7.2-killchain", module: 7, title: "7.2 ext — Order the Kill Chain", category: "Kill Chain", type: "order", points: 150,
    intro: "Objective — Describe the phases of a cyber attack. Order the six phases of the Paradigm attack model, first to last.",
    steps: [
      "Reconnaissance — gather public information about the target",
      "Initial Access — find a way into the system",
      "Persistence — make sure you can get back in later",
      "Lateral Movement — hop across the network toward a bigger target",
      "Action on Objectives — achieve the actual goal",
      "Evade Detection — cover your tracks"
    ] },

  { id: "c1-thr-7.2-actors", module: 7, title: "7.2 ext — Match the Threat Actor", category: "Kill Chain", type: "match", points: 150,
    intro: "Objective — Describe different types of threat actors. Match each motivation to the threat actor type. Tap the motivation, then tap the actor.",
    pairs: [
      { left: "Motivated by a cause, wants a loud public exit", right: "Hacktivist" },
      { left: "Motivated by money, often runs ransomware operations", right: "Cybercriminal" },
      { left: "Government-funded, plays the long game with major resources", right: "Nation-State Actor" },
      { left: "A curious beginner using tools they don't fully understand", right: "Script Kiddie" }
    ] },

  { id: "c1-thr-7.3-core", module: 7, title: "7.3 — Vulnerabilities", category: "Vulnerabilities",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Vulnerabilities. A device that ships with a factory default password like admin or 0000 — one most people never change — has a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The settings are wrong, not the hardware itself.",
        flagHash: "7f2c53dd653fef57fa34fd34085c0b138454ec7c8f6362061cef4915499cab20" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Vulnerabilities. Software that hasn't been updated with the latest security fix has a(n) ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "The opposite of \"patched.\"",
        flagHash: "c57efcc589fbbadab45169faa9beba40927a9e6677bd5fb241d58bfb76f5f223" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Vulnerabilities. Stuxnet exploited flaws that were unknown to the software vendor, with no patch available yet. This kind of never-before-seen flaw is called a ___-___ vulnerability. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Named for how many days the vendor had to prepare a fix: none.",
        flagHash: "e784b9659b16b9ded5d6074e2f24c3b8f43893e5d90f38442a70e0279e6bb1ae" }
    ] },

  { id: "c1-thr-7.3-vulns", module: 7, title: "7.3 ext — Name the Vulnerability", category: "Vulnerabilities", type: "match", points: 150,
    intro: "Objective — Identify common vulnerabilities. Match each example to its vulnerability type. Tap the example, then tap the type.",
    pairs: [
      { left: "Default admin password never changed", right: "Misconfiguration" },
      { left: "Software missing the latest security update", right: "Unpatched Software" },
      { left: "An employee clicks a phishing link", right: "Human Error" },
      { left: "A flaw no vendor has discovered or patched yet", right: "Zero-Day" },
      { left: "An account with a weak, reused password", right: "Weak Authentication" }
    ] },

  { id: "c1-thr-7.3-passwords", module: 7, title: "7.3 ext — HR Password Sort", category: "Vulnerabilities", type: "match", points: 150,
    intro: "Objective — Assess password vulnerabilities. Match each flagged password to its response protocol. Tap the password, then tap the response.",
    pairs: [
      { left: "password", right: "Recreate Immediately" },
      { left: "Summer2024!", right: "Encourage Upgrade" },
      { left: "Jessi_C_1998", right: "Send Warning Email" },
      { left: "CorrectHorseBatteryStaple", right: "Safe – No Contact" }
    ] },

  { id: "c1-thr-7.4-core", module: 7, title: "7.4 — Malware & Ransomware", category: "Malware",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Anatomy of malware. The way malware gets into a device in the first place — a phishing email, an infected USB, a malicious website — is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "How the germ traveled, in the virus analogy.",
        flagHash: "bacde6921fb9f83bf74166bca7ffdb18bb54e8d798c535f0cfd5dc6734a749e1" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Anatomy of malware. The actual malicious code that runs once malware is inside a device — ransomware, spyware, a worm — is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The germ itself, in the virus analogy.",
        flagHash: "e05f79a1e02c718e5644ff8badc89b8d4e0e84201abb41755341ee280ba632e9" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Malware types. Malware that self-replicates and spreads across a network entirely on its own, with no user needing to click anything, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It \"crawls\" from machine to machine.",
        flagHash: "5e71e44abcc73b58779ed4dd1faf938177c1e855d874532e4235d2cdc5e62b74" }
    ] },

  { id: "c1-thr-7.4-malware", module: 7, title: "7.4 ext — Match the Malware Type", category: "Malware", type: "match", points: 150,
    intro: "Objective — Explain types of malware and ransomware. Match each behavior to the malware type. Tap the behavior, then tap the type.",
    pairs: [
      { left: "Encrypts a user's files and demands payment for the decryption key", right: "Ransomware" },
      { left: "Hides inside something desirable, like a game or free tool", right: "Trojan" },
      { left: "Self-replicates across a network with no user action needed", right: "Worm" },
      { left: "Stays hidden to monitor keystrokes and record audio or video", right: "Spyware" },
      { left: "Hides deep in the OS to give admin control while staying invisible", right: "Rootkit" }
    ] },

  { id: "c1-thr-7.4-anatomy", module: 7, title: "7.4 ext — Diagnose the Malware", category: "Malware", type: "order", points: 150,
    intro: "Objective — Analyze a malware incident. Order how a security analyst diagnoses a malware case, from the Malware Doctor case files.",
    steps: [
      "Identify the Vector — how did it get in?",
      "Identify the Payload — what is the malicious code actually doing?",
      "Identify the Indicators — what symptoms show up on the device?",
      "Contain and respond to limit further damage"
    ] },

  { id: "c1-thr-7.5-core", module: 7, title: "7.5 — Cyber Attacks", category: "Cyber Attacks",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Password attacks. An automated trial-and-error method that tries every possible character combination until it finds the right password is called a ___ ___ attack. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Raw computing power, no cleverness.",
        flagHash: "c33e81d0e981ecb0e9c2cb389ade4000ae71622397f0b2328886ae68d8c1f5ba" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Network attacks. Overwhelming a server with a flood of fake traffic from a botnet until it crashes is called a ___ attack. Give the four-letter acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "\"Distributed Denial of Service.\"",
        flagHash: "da95c631b466fc86796850982341f91a7addba535a0bafdc9ea3589dbd4e2606" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Web attacks. Typing something like ' OR '1'='1 into a web form to manipulate a database and steal data is called ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Named for the database query language being abused.",
        flagHash: "262ea38fc0c2f783adc1ac3eb909446a9b37fe798a124bb4df93724de18f73aa" }
    ] },

  { id: "c1-thr-7.5-attacks", module: 7, title: "7.5 ext — Match the Attack", category: "Cyber Attacks", type: "match", points: 150,
    intro: "Objective — Describe common types of cyber attacks. Match each scenario to the attack it represents. Tap the scenario, then tap the attack.",
    pairs: [
      { left: "An attacker secretly sits between you and your bank to intercept data", right: "Man-in-the-Middle" },
      { left: "A poisoned USB drive left in a parking lot", right: "USB Drop" },
      { left: "Following someone through a badge-locked door", right: "Tailgating" },
      { left: "Watching someone type their PIN in public", right: "Shoulder Surfing" },
      { left: "A program tries every word in a leaked password list", right: "Dictionary Attack" }
    ] },

  { id: "c1-thr-7.5-eviltwin", module: 7, title: "7.5 ext — Run the Evil Twin", category: "Cyber Attacks", type: "order", points: 150,
    intro: "Objective — Describe a Wi-Fi based attack. Order the steps of an Evil Twin attack, first to last.",
    steps: [
      "Set up a rogue access point with a trustworthy-looking network name",
      "Build a fake login splash page using the real company's branding",
      "Wait for a victim to connect to the fake network",
      "Harvest the credentials the victim enters",
      "Use the stolen credentials for further access"
    ] },

  { id: "c1-thr-7.6-core", module: 7, title: "7.6 — Risks and Impacts", category: "Risk Assessment",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Risk assessment. Cybersecurity professionals calculate risk as Threat times Vulnerability times ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "How much damage it would cause.",
        flagHash: "035cbccd7b32e1dcdab0cfb0c28cb235f43d516ffc15d8e2862e4d2fcceaa834" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Handling risk. Buying cyber insurance so someone else covers the cost of an attack, instead of fixing the underlying problem, is risk ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You're handing the risk to another party.",
        flagHash: "24e10592a2ee8b9ba1e675c906b5cc0d44c262a989fa599d88a28a6145a1c72e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Handling risk. Deciding a risk is small enough to just live with, instead of spending money to fix it, is called risk ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You're choosing to take on the risk as-is.",
        flagHash: "0755878322ea3c91d2d9f7293d6a228d8516457708844a9665ff2aa69cddf3f7" }
    ] },

  { id: "c1-thr-7.6-handling", module: 7, title: "7.6 ext — Handle the Risk", category: "Risk Assessment", type: "match", points: 150,
    intro: "Objective — Evaluate ways to handle risk. Match each action to its risk-handling strategy. Tap the action, then tap the strategy.",
    pairs: [
      { left: "Installing a firewall to stop the attack from working", right: "Mitigation" },
      { left: "Buying cyber insurance to cover potential losses", right: "Transfer" },
      { left: "Shutting down a risky feature entirely so it can't be exploited", right: "Avoidance" },
      { left: "Deciding a low-risk bug isn't worth fixing right now", right: "Acceptance" }
    ] },

  { id: "c1-thr-7.6-riskprocess", module: 7, title: "7.6 ext — Run a Risk Assessment", category: "Risk Assessment", type: "order", points: 150,
    intro: "Objective — Evaluate risk and potential impacts. Order the steps of a basic risk assessment, first to last.",
    steps: [
      "Identify the vulnerability",
      "Estimate how likely it is to be exploited",
      "Estimate how much damage it would cause",
      "Multiply likelihood by impact for a risk score",
      "Decide how to handle the risk: mitigate, transfer, avoid, or accept"
    ] },

  { id: "c1-thr-7.7-core", module: 7, title: "7.7 — Cyber Ethics", category: "Cyber Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Living well ethically. Regularly thinking about the person you want to become, compared to who you are today, is called ___-___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Looking inward and examining yourself.",
        flagHash: "e46e19c62bf94c76ad399b9e4873dba06cdfd4b65a357be556f1ac5487ef9a20" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Moral development. Looking to people whose honesty, courage, or compassion you admire, and letting their example pull your own standards upward, means seeking out moral ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A model worth following.",
        flagHash: "e8101a79ea936061b75a92abeedbc38fcb5eb3304037e6c026de475bd7687d71" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Ethics and empathy. Genuinely picturing how your choices affect someone you'll never meet — like a stranger harmed by a data breach — is called exercising moral ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Using your imagination for empathy.",
        flagHash: "5e803459227b85dbe773356f1a0f68e129bb639492050c75ed33031b37ac3c12" }
    ] },

  { id: "c1-thr-7.7-habits", module: 7, title: "7.7 ext — Match the Moral Habit", category: "Cyber Ethics", type: "match", points: 150,
    intro: "Objective — Describe best practices for living well. Match each habit to its description. Tap the habit, then tap its description.",
    pairs: [
      { left: "Self-Reflection", right: "Regularly examining who you are against who you want to become" },
      { left: "Moral Exemplars", right: "Looking to people whose character you admire" },
      { left: "Moral Imagination", right: "Picturing how your choices affect people you'll never meet" },
      { left: "Moral Strength", right: "Doing the right thing even when it's the harder choice" },
      { left: "Moral Community", right: "Surrounding yourself with people of good character" }
    ] },

  { id: "c1-thr-vocab", module: 7, title: "7.1-7.7 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["attack surface","reconnaissance","persistence","threat actor","vulnerability","zero-day","malware","ransomware","worm","ddos","phishing","risk"],
    hardMode: "wordsearch" },

  /* MODULE 8 — Intro to Security Controls ─────────────────────────────────── */
  { id: "c1-sc-8.1-core", module: 8, title: "8.1 — CIA Triad & Security Controls", category: "CIA Triad",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Identify the components of the CIA Triad. The three-part model used in cybersecurity to identify what needs protection — Confidentiality, Integrity, and Availability — is called the ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "C-I-A, but not the agency.",
        flagHash: "2bc31d9eb328e2bb0f8ed23711d134de8140ab7237a8ed30d3c125778ace479a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain confidentiality, integrity, and availability. A student changes their own grade from a C to an A without permission — this is an attack on data ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Ensuring data hasn't been changed by unauthorized people.",
        flagHash: "2f3d9851d23849572228eb2f2abb2c097a85090aaf63066e566d6584e366192e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Define a security control. Any safeguard or countermeasure used to avoid, detect, or minimize security risks is called a security ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A padlock on a gate or a firewall on a computer.",
        flagHash: "2c4177fc897f744aab05635897f88c934dd58927025256c6978c7b609676c0b6" }
    ] },

  { id: "c1-sc-8.1-cia", module: 8, title: "8.1 ext — Which Part of the Triad?", category: "CIA Triad", type: "match", points: 150,
    intro: "Objective — Explain confidentiality, integrity, and availability. Match each detail to the part of the CIA Triad it breaks. Tap the detail, then tap the component.",
    pairs: [
      { left: "Hackers steal private payroll data and threaten to leak it", right: "Confidentiality" },
      { left: "Hackers change the Admin passwords and system settings", right: "Integrity" },
      { left: "Shipping schedules are locked; trucks can't move", right: "Availability" },
      { left: "A hacker reads someone's private emails without permission", right: "Confidentiality" },
      { left: "A company website is knocked offline by a flood of fake traffic", right: "Availability" }
    ] },

  { id: "c1-sc-8.2-core", module: 8, title: "8.2 — Types & Functions of Controls", category: "Control Types",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Categorize controls by Type. Safeguards built into computer hardware and software that use technology to control access to data are ___ (Logical) Controls.\n\nSubmit as flag{word} (lowercase).",
        hint: "Encryption, firewalls, and antivirus software.",
        flagHash: "04af502ef2264ae39528f31b9c6d544db3e5e01067c0c57150e5fc1736e7b190" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Categorize controls by Type. Policies, procedures, and training that guide human behavior are ___ Controls.\n\nSubmit as flag{word} (lowercase).",
        hint: "The \"people\" side of security.",
        flagHash: "1eac183884cdaf140d520da51b8a2ca11177992a88c80291de86a1316cf72643" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Categorize controls by Function. A control that acts before an attack to stop it from happening at all — like a locked door — is a ___ control.\n\nSubmit as flag{word} (lowercase).",
        hint: "STOP IT, before it starts.",
        flagHash: "2b060b470a4fc9eea6ee5e3cab5f4bfcb94b22e68084247bbb027df049b0a7fb" }
    ] },

  { id: "c1-sc-8.2-types", module: 8, title: "8.2 ext — Sort by Type", category: "Control Types", type: "match", points: 150,
    intro: "Objective — Categorize security controls by Type. Match each control to Physical, Technical, or Managerial. Tap the control, then tap its Type.",
    pairs: [
      { left: "Firewall", right: "Technical" },
      { left: "Locked Server Room", right: "Physical" },
      { left: "Security Training", right: "Managerial" },
      { left: "Biometric Access Control", right: "Physical" },
      { left: "Security Policy Manual", right: "Managerial" },
      { left: "Antivirus Software", right: "Technical" }
    ] },

  { id: "c1-sc-8.2-functions", module: 8, title: "8.2 ext — Sort by Function", category: "Control Types", type: "match", points: 150,
    intro: "Objective — Categorize security controls by Function. Match each control to Preventative, Detective, or Corrective. Tap the control, then tap its Function.",
    pairs: [
      { left: "Security Camera", right: "Detective" },
      { left: "Firewall", right: "Preventative" },
      { left: "Incident Response Plan", right: "Corrective" },
      { left: "Data Backups", right: "Corrective" },
      { left: "Password Requirements", right: "Preventative" },
      { left: "Security Audit", right: "Detective" }
    ] },

  { id: "c1-sc-8.3-core", module: 8, title: "8.3 — Managerial Controls", category: "Managerial Controls",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the Acceptable Use Policy (AUP). The set of rules that governs how an organization's network, software, and hardware may be used — acting like a contract between the user and the organization — is called an Acceptable Use ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "AUP stands for Acceptable Use ___.",
        flagHash: "b24e9c7085019b602b12eb8aa6106bc0c4bead29ac0ec3b179849d6876897dd9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain onboarding and offboarding. The high-risk process of deactivating a former employee's accounts and access as soon as they leave the organization is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of onboarding.",
        flagHash: "09ac939fcaada54c5072317bb81822e3cbe33929f9cba717c30a7a178a53f65d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain background checks. Investigating a candidate's criminal history, previous employment, and education before granting them network access is called a ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Done before day one on the job.",
        flagHash: "c436cf2af9f59612cf8e2a65c738686b8797096a2271d46ef165523de43b4639" }
    ] },

  { id: "c1-sc-8.3-managerial", module: 8, title: "8.3 ext — Match the Managerial Control", category: "Managerial Controls", type: "match", points: 150,
    intro: "Objective — Describe managerial controls. Match each situation to the managerial control it demonstrates. Tap the situation, then tap the control.",
    pairs: [
      { left: "A contract that defines what behaviors are prohibited on the network", right: "Acceptable Use Policy" },
      { left: "Giving a new hire access only to what their job requires from day one", right: "Onboarding" },
      { left: "Deactivating a former employee's accounts immediately after they leave", right: "Offboarding" },
      { left: "Vetting a candidate's criminal and employment history before hiring", right: "Background Check" },
      { left: "Teaching employees to recognize phishing and social engineering", right: "Staff Training" }
    ] },

  { id: "c1-sc-8.3-offboard", module: 8, title: "8.3 ext — Run the Offboarding Checklist", category: "Managerial Controls", type: "order", points: 150,
    intro: "Objective — Describe the offboarding process. Order the steps of offboarding a departing employee, first to last.",
    steps: [
      "Collect physical badges and keys",
      "Disable remote access to company accounts",
      "Change any shared passwords",
      "Conduct an exit interview reminding them of confidentiality obligations"
    ] },

  { id: "c1-sc-8.4-core", module: 8, title: "8.4 — Identity & Access Management", category: "IAM",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Distinguish authentication from authorization. The process of verifying you are who you say you are — answering \"Are you really who you say you are?\" — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A password, fingerprint, or face scan.",
        flagHash: "0167e5432d777913fc23dc379d9f68c4f023af44904180c8c33935af6a833a09" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Distinguish authentication from authorization. Deciding what a logged-in user is allowed to see or change is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A student can view their grades; only a teacher can change them.",
        flagHash: "e0f6519553979b886476cc5cdb737cc9b2499d51c61c0d01c007ee8f313320be" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Apply the Principle of Least Privilege. Giving a user only the minimum level of access necessary to do their job — and nothing more — is the Principle of Least ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Abbreviated PoLP.",
        flagHash: "53a940976e23d7a92c0f27e8b16a42c9e6923398a4b89bcb5f2accf16dd3a8ee" }
    ] },

  { id: "c1-sc-8.4-factors", module: 8, title: "8.4 ext — Sort the MFA Factor", category: "IAM", type: "match", points: 150,
    intro: "Objective — Explain multi-factor authentication. Match each login method to its MFA factor category. Tap the method, then tap the category.",
    pairs: [
      { left: "A password or PIN", right: "Something You Know" },
      { left: "A smartphone receiving a text code", right: "Something You Have" },
      { left: "A physical security key", right: "Something You Have" },
      { left: "A fingerprint or face scan", right: "Something You Are" }
    ] },

  { id: "c1-sc-8.4-authvsauth", module: 8, title: "8.4 ext — Authentication or Authorization?", category: "IAM", type: "match", points: 150,
    intro: "Objective — Distinguish authentication from authorization. Match each scenario to Authentication or Authorization. Tap the scenario, then tap the category.",
    pairs: [
      { left: "Scanning your face to unlock your phone", right: "Authentication" },
      { left: "Getting \"Access Denied\" opening a teacher's grade book", right: "Authorization" },
      { left: "Entering a 6-digit PIN at an ATM", right: "Authentication" },
      { left: "A streaming service checking you paid for Premium before 4K", right: "Authorization" },
      { left: "A Discord Moderator having the power to kick members", right: "Authorization" },
      { left: "Typing your passphrase into an app", right: "Authentication" }
    ] },

  { id: "c1-sc-8.5-core", module: 8, title: "8.5 — Physical Security Controls", category: "Physical Controls",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Categorize physical controls. Tangible items used to prevent or detect unauthorized access to physical areas — fences, locks, guards — are ___ Controls.\n\nSubmit as flag{word} (lowercase).",
        hint: "You can touch these.",
        flagHash: "01ff03ee2f46c863a8c98875aa09cc35fba385f10cce4d6dba13e2daa18b8afc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain environmental controls. The system that controls temperature and humidity so servers don't overheat and crash is called ___. Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Heating, Ventilation, and Air Conditioning.",
        flagHash: "5cc8a78205501af9d1547d6d216840247eca1abbc5e3c3614fa81b151199f43d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain fire protection. An automated system that extinguishes a fire across an entire room using gas instead of water — so it doesn't ruin the electronics — is called a ___ ___. Two words.\n\nSubmit as flag{two_words} with an underscore.",
        hint: "Named for what it does to the fire.",
        flagHash: "5a9026709c5856c108163aa193ef7a10e8bd35d1e2d1e8b062f51488b4994dcd" }
    ] },

  { id: "c1-sc-8.5-zones", module: 8, title: "8.5 ext — Fix the Security Zone", category: "Physical Controls", type: "match", points: 150,
    intro: "Objective — Recommend physical controls to address a problem. Match each escape-room problem to the control that fixes it. Tap the problem, then tap the control.",
    pairs: [
      { left: "Loose hardware could just be picked up and carried out", right: "Rack Locks" },
      { left: "The fans stopped; servers are overheating", right: "HVAC / Overhead Cooling" },
      { left: "No video record of who entered the hallway", right: "Cameras (CCTV)" },
      { left: "Anyone can walk in without a badge check", right: "Key-Card Reader" },
      { left: "A fire started and water sprinklers would ruin the equipment", right: "Suppression System" },
      { left: "No human presence to stop an intruder in the parking lot", right: "Security Guard" }
    ] },

  { id: "c1-sc-8.5-layers", module: 8, title: "8.5 ext — Layer the Defense", category: "Physical Controls", type: "order", points: 150,
    intro: "Objective — Apply defense-in-depth to a physical space. Order the layers of defense for a server room, outermost to innermost.",
    steps: [
      "Security guard patrolling the perimeter",
      "CCTV camera watching the hallway",
      "Key-card reader at the server room door",
      "Motion sensor inside the room",
      "Rack locks bolting the servers themselves"
    ] },

  { id: "c1-sc-vocab", module: 8, title: "8.1-8.5 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["cia triad","confidentiality","integrity","availability","security control","physical control","technical control","managerial control","preventative","detective","corrective","acceptable use policy","onboarding","offboarding","background check","authentication","authorization","least privilege","hvac","suppression system"],
    hardMode: "rapid" },

  /* MODULE 2 — Digital Footprint & Cyber Hygiene ──────────────────────────── */
  { id: "c1-dfhy-2.1-footprint", module: 2, title: "2.1 — Digital Footprint & OSINT", category: "Digital Footprint",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the impacts of digital footprints and their permanence. OSINT stands for Open-Source ___. Give the two-word term.\n\nSubmit as flag{two words, lowercase}.",
        hint: "It's the practice of gathering information from publicly available sources.",
        flagHash: "3ae82b05c1c42aad36350529ec2eec6c8255d6fb3a19795b6a8760212c68ac22" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Data Permanence. Even if you delete a post, screenshots and server backups can survive. There is no true 'delete' button on the internet — only a ___ button.\n\nSubmit as flag{word} (lowercase).",
        hint: "Deleting a post just makes it invisible to you, not gone from every server or screenshot.",
        flagHash: "cd882fed24f964f75869dd2ab79df9f20b66de89277fc684487c9a024afeaff6" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — The Dark Side of OSINT. Using OSINT techniques to find someone's private information (address, phone number) and publishing it online to encourage harassment is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It sounds like releasing hidden paperwork on someone.",
        flagHash: "e80b131e04f4e8343de24ebd0633de423160d01f9be691538920af2386c476d8" }
    ] },

  { id: "c1-dfhy-footprint-match", module: 2, title: "2.1 ext — Match the Footprint Concept", category: "Digital Footprint", type: "match", points: 150,
    intro: "Objective — Digital Footprint & OSINT Slides. Match each example to the concept it demonstrates. Tap the example, then tap the concept.",
    pairs: [
      { left: "A website silently logs your IP address and location", right: "Passive Footprint" },
      { left: "You post a photo and write a caption", right: "Active Footprint" },
      { left: "A recruiter Googles your name before an interview", right: "OSINT" },
      { left: "Someone posts your home address online to encourage harassment", right: "Doxxing" },
      { left: "A group chat mocks a classmate using screenshots of their posts", right: "Cyberbullying" },
      { left: "An old version of a website is viewable years later on the Wayback Machine", right: "Data Permanence" }
    ] },

  { id: "c1-dfhy-osint-order", module: 2, title: "2.1 ext — The OSINT Investigation", category: "Digital Footprint", type: "order", points: 150,
    intro: "Objective — OSINT Investigator activity (the car-keys photo). Order how an OSINT investigator would work through a posted photo, first to last.",
    steps: [
      "Scan the photo for visible identifying details (signs, menus, key cuts)",
      "Cross-reference time-of-day clues like shadows or lighting",
      "Reverse image search or geolocate any background landmarks",
      "Compile the findings into a profile of the target"
    ] },

  { id: "c1-dfhy-2.2-datastory", module: 2, title: "2.2 — Your Data Story", category: "Digital Footprint",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Evaluate your own digital presence. In the Harvard Memes Case Study, at least how many incoming students had their college acceptance rescinded after screenshots of an offensive group chat surfaced?\n\nSubmit as flag{number}.",
        hint: "It's stated directly in the case study — a double-digit number.",
        flagHash: "de2ff58afd20a703c95fd257208c257010b2265dd71ea4c9e54d047762c4e523" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Your Data Story Workshop. Of the three key audiences (Employer, ___, Culture), which one could use your posted birthday, pet's name, or address to steal your identity?\n\nSubmit as flag{word} (lowercase).",
        hint: "The audience most interested in stealing, not judging or observing.",
        flagHash: "5fa4afa72009911dd3ba66d477c21f60365d03188d841ad4fb404a4d27de010b" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — The Harvard Memes Case Study. Harvard's acceptance letters allow an offer to be withdrawn if a student's behavior brings into question their honesty, maturity, or ___ ___. Give the two-word phrase.\n\nSubmit as flag{two words, lowercase}.",
        hint: "It's about the quality of someone's ethics and conduct, not their grades.",
        flagHash: "e626a8f0b84889b4cacce79ab98c333d2bbfe0d8d4cda03ccfc1eb4f883fcd55" }
    ] },

  { id: "c1-dfhy-audience-match", module: 2, title: "2.2 ext — The Three Key Audiences", category: "Digital Footprint", type: "match", points: 150,
    intro: "Objective — Your Data Story Choice Board. Match each finding in your data story to the audience it matters most to. Tap the finding, then tap the audience.",
    pairs: [
      { left: "Late-night posting pattern makes you look unreliable for a 9-to-5 role", right: "The Future Employer" },
      { left: "A caption reveals your pet's name and hometown, both common security-question answers", right: "The Hacker" },
      { left: "Your feed is 90% reposted memes with no original content of your own", right: "The Culture" }
    ] },

  { id: "c1-dfhy-2.3-hygiene", module: 2, title: "2.3 — Cyber Hygiene", category: "Cyber Hygiene",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Describe strategies to improve cyber hygiene. The 'Have I Been Pwned?' Kick Start lets you check whether your ___ has appeared in a known data breach.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the account identifier you type into the site — the same thing you'd use to sign up for most services.",
        flagHash: "98f0ca5fd808f5fedd8ace89819228ab81950e4ede208dff7f198eb777f0412a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Passwords & MFA station. To resist cracking, a strong password (or passphrase) should be at least how many characters long?\n\nSubmit as flag{number}.",
        hint: "It's the minimum length given in the station reading — 16 is even better.",
        flagHash: "bf54bcd49d2a45eeba9ec402813a4a00fdd7f070d59b6f8dbb9fa573ab0a19e1" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Geolocation station (the Strava Heatmap). Soldiers' jogging routes leaked secret base locations through their fitness apps. What is the general term for hidden data, like GPS coordinates, embedded inside a file?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's 'data about data' — the same kind of thing an EXIF viewer reads out of a photo.",
        flagHash: "951adea39b54dd0ebb4028b560b787f549cddb92c4c371855307423c2a2db29f" }
    ] },

  { id: "c1-dfhy-hygiene-match", module: 2, title: "2.3 ext — Match the Hygiene Station", category: "Cyber Hygiene", type: "match", points: 150,
    intro: "Objective — Cyber Hygiene Stations. Match each scenario to the station/concept it belongs to. Tap the scenario, then tap the concept.",
    pairs: [
      { left: "A community grades an app's privacy policy from A to E", right: "Terms of Service" },
      { left: "A passphrase like 'Purple-2Taco-Garage-Jump'", right: "Passwords & MFA" },
      { left: "A soldier's running route reveals a secret base on a public heatmap", right: "Geolocation" },
      { left: "A sticky note with a password sits on an unlocked desk", right: "Physical Security" },
      { left: "Infinite scroll and red notification badges keep you opening an app", right: "Digital Wellness" }
    ] },

  { id: "c1-dfhy-password-order", module: 2, title: "2.3 ext — Build a Secure Login", category: "Cyber Hygiene", type: "order", points: 150,
    intro: "Objective — Passwords & MFA station (the Passphrase Method). Order these steps to build a secure login, first to last.",
    steps: [
      "String together 4 random, unrelated words",
      "Mix in a symbol and some capitalization",
      "Avoid personal info like a pet's name or birthday",
      "Turn on Multi-Factor Authentication as a second lock"
    ] },

  { id: "c1-dfhy-2.4-googlehack", module: 2, title: "2.4 — Cyber Ethics & Google Hacking", category: "Cyber Ethics",
    frameworks: null,
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Debate the ethics surrounding Google Hacking. Google Hacking is also known as Google ___ing. Give the one-word term.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's named after finding the digital 'doors' people forgot to close — sounds like poking around.",
        flagHash: "affd8c0b529749e66610832c8a3efb8b76e1e52b89ba6b54ff2386aea6916c02" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Is it Legal? Is it Ethical? Choice Board. An employee uses a Google Dork to access an exposed payroll file without authorization, purely to warn their boss it's public. Which two-word category does this fall into: Legal/Ethical, Legal/Unethical, Illegal/Ethical, or Illegal/Unethical?\n\nSubmit as flag{two words, lowercase, no slash}.",
        hint: "Accessing the file without authorization breaks computer-misuse law, but the intent was to protect the company.",
        flagHash: "a76f32847b5cd6c79770a52a23305567aa69cf5d1da542cdb8af71f1a5319696" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — The Dork Analogy (Kick Start). Google Dorking is the art of asking Google to show us a list of all the ___ ___ on the internet. Give the two-word phrase from the analogy.\n\nSubmit as flag{two words, lowercase}.",
        hint: "It's about doors people forgot to close.",
        flagHash: "d56d0bc43fed1df37d4ad2f77e6fbb01352b03c07f762b3068db846bc0be5875" }
    ] },

  { id: "c1-dfhy-legal-ethical-match", module: 2, title: "2.4 ext — Is it Legal? Is it Ethical?", category: "Cyber Ethics", type: "match", points: 150,
    intro: "Objective — Is it Legal? Is it Ethical? Choice Board. Judge each scenario. Tap the scenario, then tap its category.",
    pairs: [
      { left: "A researcher finds a bug via a Google Dork and reports it through an official bug bounty program", right: "Legal / Ethical" },
      { left: "A photographer legally flies a drone over a fence to photograph someone sunbathing in their own yard", right: "Legal / Unethical" },
      { left: "An employee accesses an exposed payroll file without authorization just to warn their boss it's public", right: "Illegal / Ethical" },
      { left: "A hacker uses Google Dorking to find and steal exposed credit card numbers for personal profit", right: "Illegal / Unethical" }
    ] },

  { id: "c1-dfhy-vocab", module: 2, title: "2.1-2.4 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["digital footprint","osint","doxxing","cyberbullying","data permanence","terms of service","geolocation","google hacking","passwords","mfa"],
    hardMode: "wordsearch" },

  /* MODULE 11 — Intro to Cyber Frameworks ─────────────────────────────────── */
  { id: "c1-fw-11.1-core", module: 11, title: "11.1 — CIA Triad & AAA", category: "Frameworks",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Identify examples of the CIA triad. Bank Vault Scenario Kick Start. The vault's first requirement, 'Only the manager can open it,' maps to which CIA pillar?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's about keeping data accessible only to authorized people.",
        flagHash: "c087a071e9e2f7c959cc4973c77b2c5feb17cead7dd031b00a94213f2664bfdc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Identify examples of the CIA triad. Bank Vault Scenario Kick Start. The vault's second requirement, 'The door must never be stuck shut during business hours,' maps to which CIA pillar?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's about the vault being ready when the manager needs it.",
        flagHash: "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Identify examples of the AAA framework. AAA Framework slides. Tracking and logging what a user did after they're inside a system, creating an audit trail for forensics and compliance, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It answers the question 'What did you do?'",
        flagHash: "0e7332f9cc34e3aa219af4634ffbc171ca50b8dc4f55d4d198b879ca73a9ef3f" }
    ] },

  { id: "c1-fw-11.1-pillar-match", module: 11, title: "11.1 ext — Which Pillar Broke?", category: "Frameworks", type: "match", points: 150,
    intro: "Objective — Identify examples of the CIA triad. CIA & AAA Slides. Match each scenario to the CIA pillar it breaks. Tap the scenario, then tap the pillar.",
    pairs: [
      { left: "A hacker changes a student's grade from a D to an A", right: "Integrity" },
      { left: "A power outage takes down a bank's website for 4 hours", right: "Availability" },
      { left: "An employee accidentally emails the payroll list to the whole company", right: "Confidentiality" },
      { left: "An IT admin secretly changes coworkers' salaries in the database", right: "Integrity" },
      { left: "A DDoS attack floods a server with fake traffic until it crashes", right: "Availability" },
      { left: "A hacker steals a database of unencrypted customer emails", right: "Confidentiality" }
    ] },

  { id: "c1-fw-11.1-aaa-match", module: 11, title: "11.1 ext — The Digital Doorman", category: "Frameworks", type: "match", points: 150,
    intro: "Objective — Identify examples of the AAA framework. Digital Doorman & CIA/AAA Scenario. Match each example to its AAA component. Tap the example, then tap the component.",
    pairs: [
      { left: "Checking your ID at the door of a club", right: "Authentication" },
      { left: "A VIP wristband that lets you into the lounge but not the DJ booth", right: "Authorization" },
      { left: "The security camera recording your every move at the club", right: "Accounting" },
      { left: "An engineer scans a fingerprint and enters a PIN to enter the server room", right: "Authentication" },
      { left: "An engineer's account can view health reports but is blocked from customer credit card numbers", right: "Authorization" },
      { left: "A report shows every file an engineer opened and every command they typed", right: "Accounting" }
    ] },

  { id: "c1-fw-review-11.1", module: 11, title: "11.1 Review — CIA Triad & AAA", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.1. The CIA Triad's three pillars are Confidentiality, Integrity, and ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's what keeps a system online and working.",
        flagHash: "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.1. The AAA Framework's three A's are Authentication, Authorization, and ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the audit trail of what a user did.",
        flagHash: "0e7332f9cc34e3aa219af4634ffbc171ca50b8dc4f55d4d198b879ca73a9ef3f" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.1. Which AAA step answers the question 'Who are you?'\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the first door — proving your identity.",
        flagHash: "0167e5432d777913fc23dc379d9f68c4f023af44904180c8c33935af6a833a09" }
    ] },

  { id: "c1-fw-11.2-core", module: 11, title: "11.2 — The NIST Framework", category: "Frameworks",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Describe each function in the NIST Framework. Zombie Apocalypse Kick Start. The item that helps you identify where the danger is coming from lines up with which NIST function?\n\nSubmit as flag{word} (lowercase).",
        hint: "You can't protect what you don't first ___.",
        flagHash: "d3375192afbb3d9311127a420fe4d87727cb8c51957695848358a1591400eb27" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Describe each function in the NIST Framework. Zombie Apocalypse Kick Start. The item that detects when zombies have arrived lines up with which NIST function?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's your early warning system.",
        flagHash: "74893e279717214de1e577e4fcd850f6750a331512464c51b0656ae67c01aa6c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Describe each function in the NIST Framework and its importance. NIST Framework Playlist. The function often called the 'brain' of the framework — it sets policy and decides who is responsible for security before any tool is bought — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Think 'Constitution of the company.'",
        flagHash: "86a430ff6f6a5b768d352aba49ea7f4fd0a7bc0f39486f7d99dea51b141b678f" }
    ] },

  { id: "c1-fw-11.2-order", module: 11, title: "11.2 ext — Order the NIST Functions", category: "Frameworks", type: "order", points: 150,
    intro: "Objective — Describe each function in the NIST Framework and its importance. Order the six NIST Framework functions as an organization would apply them, first to last.",
    steps: [
      "Govern",
      "Identify",
      "Protect",
      "Detect",
      "Respond",
      "Recover"
    ] },

  { id: "c1-fw-11.2-lifesize-match", module: 11, title: "11.2 ext — NIST Life Size Sort", category: "Frameworks", type: "match", points: 150,
    intro: "Objective — Describe each function in the NIST Framework. NIST Life Size Sort Cards. Match each real-world task to the NIST function it belongs to. Tap the task, then tap the function.",
    pairs: [
      { left: "Creating a policy that requires employees to change passwords every 90 days", right: "Govern" },
      { left: "Creating a list of every authorized printer and scanner on the network", right: "Identify" },
      { left: "Setting up a firewall to block traffic from unauthorized countries", right: "Protect" },
      { left: "Monitoring system logs to see if anyone is trying to log in at 3:00 AM", right: "Detect" },
      { left: "Disconnecting a laptop from Wi-Fi after it's flagged for having a virus", right: "Respond" },
      { left: "Using a cloud backup to restore files deleted by a hacker", right: "Recover" }
    ] },

  { id: "c1-fw-review-11.2", module: 11, title: "11.2 Review — The NIST Framework", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.2. How many core functions make up the NIST Framework?\n\nSubmit as flag{number}.",
        hint: "Govern, Identify, Protect, Detect, Respond, Recover.",
        flagHash: "1a232608612178c94c0e9fd560df1b1385ad189aa832939e57caec79eeee56ad" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.2. Which NIST function comes right after Identify?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the 'digital wall' function.",
        flagHash: "9c449b71b839d7f7b747c7ce87f292f96ad175cf74e3b358973a57c564c0ac92" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.2. Which NIST function is described as the organization's 'early warning system'?\n\nSubmit as flag{word} (lowercase).",
        hint: "No defense is perfect, so this one watches 24/7.",
        flagHash: "74893e279717214de1e577e4fcd850f6750a331512464c51b0656ae67c01aa6c" }
    ] },

  { id: "c1-fw-11.3-core", module: 11, title: "11.3 — MITRE ATT&CK", category: "Frameworks",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the layout and use of the MITRE ATT&CK knowledge base. MITRE ATT&CK is a globally accessible, living encyclopedia of ___ behavior based on real-world observations.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the attacker being tracked.",
        flagHash: "6381c9b0232c25ffcd7943637d44691cbdf0c5a753c10f115d0dccea537e72e8" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain the layout of the MITRE ATT&CK knowledge base. ID the TTP activity: a hacker sends a fake Netflix email to trick a teacher into giving up their login. The specific method used — the 'how' — is called a ___ in ATT&CK.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's one level more specific than a Tactic.",
        flagHash: "3ee0987ca3406f893f0644df362d00f6c2e909c2f568d78f8df6ec8355936580" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain the layout of the MITRE ATT&CK knowledge base. In that same scenario, gaining a foothold by tricking the teacher is the attacker's high-level goal — the 'why.' This is called a ___ in ATT&CK.\n\nSubmit as flag{word} (lowercase).",
        hint: "One Tactic can have dozens of Techniques underneath it.",
        flagHash: "b13c8cbf1e76d124c9decd9fb2518b07e3ce894a6d3d06aa521d512841f22f78" }
    ] },

  { id: "c1-fw-11.3-match", module: 11, title: "11.3 ext — Match the ATT&CK Term", category: "Frameworks", type: "match", points: 150,
    intro: "Objective — Explain the layout and use of the MITRE ATT&CK knowledge base. Match each term to its definition. Tap the term, then tap its definition.",
    pairs: [
      { left: "Any individual or group that performs malicious acts against a system", right: "Adversary" },
      { left: "The high-level strategic goal of the attacker, like Initial Access", right: "Tactic" },
      { left: "The specific method used to achieve a tactic, like spearphishing", right: "Technique" },
      { left: "The exact tool or step-by-step sequence used in one specific attack", right: "Procedure" },
      { left: "Using a computer's own legitimate tools, like PowerShell, to stay invisible to antivirus", right: "Living off the Land" },
      { left: "Infecting a computer just because a user visited a hacked website, no download required", right: "Drive-by Compromise" }
    ] },

  { id: "c1-fw-11.3-attackpath-order", module: 11, title: "11.3 ext — Build the Attack Path", category: "Frameworks", type: "order", points: 150,
    intro: "Objective — Explain the layout and use of the MITRE ATT&CK knowledge base. Attack Path with MITRE ATT&CK activity. Order the chain of an attack, first to last.",
    steps: [
      "Get in by exploiting the target's initial vulnerability",
      "Set up a secret permanent account to stay in without repeating the break-in",
      "Move from a low-level computer to one with higher-level permissions",
      "Delete activity logs while working so alarms don't trigger",
      "Achieve the final impact — steal data, encrypt files, or disrupt service"
    ] },

  { id: "c1-fw-review-11.3", module: 11, title: "11.3 Review — MITRE ATT&CK", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.3. MITRE ATT&CK tracks the real-world behavior of an ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the attacker being profiled.",
        flagHash: "6381c9b0232c25ffcd7943637d44691cbdf0c5a753c10f115d0dccea537e72e8" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.3. Sending a phishing email is an example of a MITRE ATT&CK ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the specific 'how.'",
        flagHash: "3ee0987ca3406f893f0644df362d00f6c2e909c2f568d78f8df6ec8355936580" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.3. Gaining Initial Access is an example of a MITRE ATT&CK ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the high-level 'why.'",
        flagHash: "b13c8cbf1e76d124c9decd9fb2518b07e3ce894a6d3d06aa521d512841f22f78" }
    ] },

  { id: "c1-fw-11.4-core", module: 11, title: "11.4 — CIS Controls", category: "Frameworks",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Describe CIS controls and implementation groups. CIS Controls Annotated Reading. CIS Controls are built on a philosophy of studying how hackers actually break in and writing rules to stop those specific methods — a philosophy called 'Offense Informs ___.'\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the second half of the phrase.",
        flagHash: "d5edb42995bdc2fd7fccb374f6ced4997a8dcec5bbcc0dc9a845a8cb7f076073" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Describe CIS controls and implementation groups. Bang for Your Buck activity, Round 5: the Board demands 'Resilience' and requires Control 11 (Data Recovery). Which CIA Triad pillar does Data Recovery mainly support?\n\nSubmit as flag{word} (lowercase).",
        hint: "It's about getting systems back up and working.",
        flagHash: "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Describe CIS controls and implementation groups. Bang for Your Buck debrief. Implementing just the first six 'Basic' CIS Controls stops roughly what percent of common cyberattacks?\n\nSubmit as flag{number}.",
        hint: "It's stated directly in the debrief slide.",
        flagHash: "c06f0a358e13663bb76b6b513e32d0e415049da9b249a01e602dea4570ed73b7" }
    ] },

  { id: "c1-fw-11.4-ig-match", module: 11, title: "11.4 ext — Match the Implementation Group", category: "Frameworks", type: "match", points: 150,
    intro: "Objective — Describe CIS controls and implementation groups. Match each organization profile to its Implementation Group. Tap the profile, then tap the group.",
    pairs: [
      { left: "Every organization, regardless of size, needs these to stop general, non-targeted attacks", right: "IG1" },
      { left: "A company handling sensitive client data across multiple departments", right: "IG2" },
      { left: "A large enterprise, like a hospital network, targeted by sophisticated nation-state hackers", right: "IG3" }
    ] },

  { id: "c1-fw-11.4-buildup-order", module: 11, title: "11.4 ext — Order the Security Buildup", category: "Frameworks", type: "order", points: 150,
    intro: "Objective — Describe CIS controls and implementation groups. Bang for Your Buck activity. Order these CIS Controls in the sequence SecureStart Inc. added them as their budget grew, first to last.",
    steps: [
      "Control 1 & 2 — Inventory hardware and software assets",
      "Control 6 — Access Control Management",
      "Control 8 — Audit Log Management",
      "Control 11 — Data Recovery"
    ] },

  { id: "c1-fw-review-11.4", module: 11, title: "11.4 Review — CIS Controls", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.4. CIS stands for Center for Internet ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's the same word as the S in CIA.",
        flagHash: "7e0cb8da2168bb237dd1ff2e86bd486425ebd9b6d8f0414413fcab4310bac761" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.4. CIS Controls are organized into Implementation ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "IG1, IG2, and IG3 are three of these.",
        flagHash: "64241e05caeaa84d86b23e604adb2b85a47e7a07c3e5b1160bc2e2881b131827" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.4. Which Implementation Group should every organization, regardless of size, start with?\n\nSubmit as flag{ig#} (lowercase, e.g. flag{ig1}).",
        hint: "It's 'Essential Cyber Hygiene.'",
        flagHash: "4d32d085c706f3a7178dc416a2f3aa2cec06efa092dd85534bf62f5a66d8e6e7" }
    ] },

  { id: "c1-fw-11.5-core", module: 11, title: "11.5 — Cyber Laws & Regulations", category: "Laws & Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain common laws impacting cybersecurity. Laws & Regulations Stations. Unlike the other stations, PCI DSS isn't a government law at all — it's private regulations created by which industry? Give the two-word industry name.\n\nSubmit as flag{two_words} with an underscore, lowercase.",
        hint: "Visa, Mastercard, and Amex all belong to it.",
        flagHash: "9210a6a76447331af4b8fbef8ffc289f98c8f7fe7f3e6edb537e5c5d08430250" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explain common laws impacting cybersecurity. Laws & Regulations Stations. The federal law that lets a company sue in federal court if a competitor or former employee steals its trade secrets through hacking is the Defend Trade Secrets Act. Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It's abbreviated with 4 letters.",
        flagHash: "c8e706b2e1cf78fbc47c63b769734528121a0a94560bdb5bd5255d810e964e8f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Explain common laws impacting cybersecurity. Laws & Regulations Stations. Under COPPA, companies can't track a child's location, collect their screen name, or take their ___ without parental consent.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's an image of the child.",
        flagHash: "5be8d8956a704f637ba174922c1eaf44df73315a1e584b8e39e415ff89927614" }
    ] },

  { id: "c1-fw-11.5-headline-match", module: 11, title: "11.5 ext — Headline Hack", category: "Laws & Ethics", type: "match", points: 150,
    intro: "Objective — Explain common laws impacting cybersecurity and their implications. Headline Hack activity. Match each headline to the law it raises. Tap the headline, then tap the law.",
    pairs: [
      { left: "Engineer downloads secret sauce code to a USB drive before quitting to a competitor", right: "DTSA" },
      { left: "Student finds a backdoor into a bank's website and downloads customer balance sheets", right: "CFAA" },
      { left: "Coffee chain banned from taking credit cards after hackers steal 1 million card numbers from an unencrypted database", right: "PCI DSS" },
      { left: "Hospital employee mistakenly emails 500 patient surgery schedules to a pizza shop", right: "HIPAA" },
      { left: "A social media app is found tracking the GPS location of underage users to show them toy ads", right: "COPPA" }
    ] },

  { id: "c1-fw-11.5-match", module: 11, title: "11.5 ext — Match the Law", category: "Laws & Ethics", type: "match", points: 150,
    intro: "Objective — Explain common laws impacting cybersecurity and their implications. Match each law to what it protects. Tap the law, then tap what it protects.",
    pairs: [
      { left: "HIPAA", right: "Patient health records" },
      { left: "PCI DSS", right: "Credit card transaction data" },
      { left: "DTSA", right: "A company's trade secrets" },
      { left: "COPPA", right: "Children's online privacy" },
      { left: "CFAA", right: "Unauthorized computer access" }
    ] },

  { id: "c1-fw-review-11.5", module: 11, title: "11.5 Review — Laws & Regulations", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.5. Which law protects patient health records? Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It's the 'Gold Standard' for confidentiality in healthcare.",
        flagHash: "0a0207868f8831d7c3902657aed57e5ec290c8cb2bd5ed9c00e77a1ea2865288" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.5. Which law protects children's online privacy? Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It applies to apps and sites aimed at kids under 13.",
        flagHash: "db4f371d8d129577096c3d2b3459cabf858535ffa1db807ad1b13de0ab5cd55e" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.5. Which law criminalizes unauthorized access to a computer system? Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It's the primary US anti-hacking law, written in 1986.",
        flagHash: "6587dc7959cf4e5f6204bed8552661ac571e79ba9eaa7b471cb49e5776256d7c" }
    ] },

  { id: "c1-fw-11.6-core", module: 11, title: "11.6 — Cyber Ethics & the Law", category: "Laws & Ethics",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explain the ethical considerations of cybersecurity actions. The Curious Hacker scenario. Alex broke into TechGenius Corp's portal out of curiosity, without stealing or damaging anything. The company's own audit called this more of an ___ than an attempt at financial gain or sabotage.\n\nSubmit as flag{word} (lowercase).",
        hint: "It's about exploring, not attacking.",
        flagHash: "19f5459d15741334bb5ed3bf396f49ab148453da587d77332fb6278f227aba36" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Understand the legal implications of ethical breaches. The Curious Hacker scenario. Even though Alex didn't steal any data, accessing TechGenius Corp's server without authorization is still a federal crime under which law? Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "It's the same law from the Headline Hack activity that covers unauthorized access.",
        flagHash: "6587dc7959cf4e5f6204bed8552661ac571e79ba9eaa7b471cb49e5776256d7c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Analyze notable cybersecurity incidents. Notable Cybersecurity Hacking Incidents. The 2021 ransomware attack that shut down the largest fuel pipeline in the US, carried out by the DarkSide hacker group, targeted which company? Give the two-word name.\n\nSubmit as flag{two_words} with an underscore, lowercase.",
        hint: "It led to a federal emergency declaration and widespread fuel shortages.",
        flagHash: "775368d33c2e1bd76d9801f77af9acfe000b77dee9506e3cb005c2a0ab008cee" }
    ] },

  { id: "c1-fw-11.6-courtroom-order", module: 11, title: "11.6 ext — Cyber Law Courtroom", category: "Laws & Ethics", type: "order", points: 150,
    intro: "Objective — Understand the legal implications of ethical breaches. Cyber Law Courtroom activity. Order the trial procedure for the Curious Hacker case, first to last.",
    steps: [
      "Opening statements from prosecution and defense",
      "Witness testimonies",
      "Cross-examination",
      "Closing arguments",
      "Judge and jury deliberate a verdict"
    ] },

  { id: "c1-fw-11.6-incidents-match", module: 11, title: "11.6 ext — Match the Incident", category: "Laws & Ethics", type: "match", points: 150,
    intro: "Objective — Analyze notable cybersecurity incidents. Notable Cybersecurity Hacking Incidents. Match each breach to what happened. Tap the breach, then tap the outcome.",
    pairs: [
      { left: "Yahoo (2013-2014)", right: "3 billion accounts exposed, the largest breach in history" },
      { left: "Equifax (2017)", right: "Social security numbers of nearly 147 million consumers exposed" },
      { left: "WannaCry (2017)", right: "A ransomware cryptoworm that encrypted 200,000+ computers across 150 countries" },
      { left: "SolarWinds (2020)", right: "A supply-chain attack hidden inside a trusted software update" },
      { left: "Colonial Pipeline (2021)", right: "Ransomware shut down the largest US fuel pipeline" }
    ] },

  { id: "c1-fw-review-11.6", module: 11, title: "11.6 Review — Cyber Ethics & the Law", category: "Review",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Quick Review — 11.6. In the Curious Hacker scenario, was Alex's access to TechGenius Corp's server legally authorized?\n\nSubmit as flag{yes} or flag{no} (lowercase).",
        hint: "Even without malice, breaking in without permission is still unauthorized.",
        flagHash: "acb78677c2104df8a3d7f92ad8b101195f31a376838cb1d0da5a41c04301758f" },
      { difficulty: "Medium", points: 100,
        prompt: "Quick Review — 11.6. Which law makes unauthorized computer access illegal even without theft or damage? Give the acronym.\n\nSubmit as flag{acronym} (lowercase).",
        hint: "Same law from the Headline Hack activity.",
        flagHash: "6587dc7959cf4e5f6204bed8552661ac571e79ba9eaa7b471cb49e5776256d7c" },
      { difficulty: "Hard", points: 150,
        prompt: "Quick Review — 11.6. Which hacker group carried out the 2021 Colonial Pipeline ransomware attack?\n\nSubmit as flag{word} (lowercase).",
        hint: "Its name suggests the 'other side.'",
        flagHash: "be13761b2dfaf6745d4ebf600600e375b21773412e6ed1377aef61460b491d16" }
    ] },

  { id: "c1-fw-vocab", module: 11, title: "11.1-11.6 ext — Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["confidentiality","integrity","availability","authentication","authorization","accounting","nist framework","govern","identify","protect","detect","respond","recover","adversary","mitre att&ck","tactics","techniques","procedures","cis controls","implementation groups","ig1","ig2","ig3","hipaa","pci dss","dtsa","coppa","cfaa"],
    hardMode: "speedmatch" },

  ]
};


window.COURSE_CONFIG.cyber1.ctf.bossQuestions = [
  { module: 11, topic: "M11", diff: "Medium", kind: "mc",
    prompt: "A company suffers a ransomware attack that encrypts their file server, taking it offline for two days. Which CIA triad principle was violated?",
    choices: ["Availability", "Confidentiality", "Integrity", "Accounting"], answer: "Availability" },
  { module: 11, topic: "M11", diff: "Hard", kind: "mc",
    prompt: "An analyst wants to see the exact step-by-step technique an adversary used for privilege escalation in a past breach. Which resource should they consult?",
    choices: ["MITRE ATT&CK", "CIS Controls", "HIPAA", "COPPA"], answer: "MITRE ATT&CK" },
  { module: 11, topic: "M11", diff: "Medium", kind: "mc",
    prompt: "Like Alex in the Curious Hacker case, a student finds a bug in the school portal out of curiosity and pokes at it without permission, but reports no harm done. What is the most ethical next step?",
    choices: ["Report it responsibly to the school's IT staff", "Keep exploring quietly since no harm was done", "Post the vulnerability publicly", "Share the access with friends"], answer: "Report it responsibly to the school's IT staff" },
  { module: 1, topic: "M1", diff: "Easy", kind: "mc",
    prompt: "Which is NOT part of the CIA triad?",
    choices: ["Authentication", "Confidentiality", "Integrity", "Availability"], answer: "Authentication" },
  { module: 1, topic: "M2", diff: "Medium", kind: "mc",
    prompt: "You find a security bug in a website. The ethical first step is to:",
    choices: ["Report it responsibly to the owner", "Post it publicly for fun", "Exploit it quietly", "Ignore it"], answer: "Report it responsibly to the owner" },
  { module: 4, topic: "M3", diff: "Medium", kind: "text",
    prompt: "Convert binary 1111 to decimal.",
    answer: "15" },
  { module: 9, topic: "M4", diff: "Medium", kind: "mc",
    prompt: "Which of these is ENCODING, not encryption?",
    choices: ["Base64", "AES", "RSA", "A cipher with a secret key"], answer: "Base64" },
  { module: 3, topic: "M3", diff: "Easy", kind: "mc",
    prompt: "A text message trying to trick you into clicking a bad link is called:",
    choices: ["Smishing", "Vishing", "Tailgating", "Baiting"], answer: "Smishing" },
  { module: 5, topic: "M5", diff: "Easy", kind: "mc",
    prompt: "A new hire's laptop is stuck on a frozen program. What's the safe first command to find out what's using all the CPU?",
    choices: ["top", "rm -rf /", "userdel", "mkdir"], answer: "top" },
  { module: 5, topic: "M5", diff: "Medium", kind: "text",
    prompt: "A student overwrites file.txt on Windows by saving File.txt in the same folder. What OS behavior caused this? (one word, hyphenated: case-_______)",
    answer: "insensitive" },
  { module: 5, topic: "M5", diff: "Hard", kind: "mc",
    prompt: "You're hired as a junior SysAdmin. An employee is terminated today. What is the correct first action for their account?",
    choices: ["Lock the account instead of deleting it", "Delete the account immediately", "Change the password and tell no one", "Leave the account active until next audit"], answer: "Lock the account instead of deleting it" },
  { module: 6, topic: "M6", diff: "Easy", kind: "mc",
    prompt: "A new library computer needs to be reachable at the same address every single day. What kind of IP addressing should it use?",
    choices: ["Static", "DHCP", "MAC-based", "It doesn't matter"], answer: "Static" },
  { module: 6, topic: "M6", diff: "Medium", kind: "text",
    prompt: "You're a network admin. A login page is served over Port 80 instead of 443. What protocol is silently exposing user passwords? (one word)",
    answer: "http" },
  { module: 6, topic: "M6", diff: "Hard", kind: "mc",
    prompt: "You can reach every website by IP address, but typing names like google.com fails everywhere. Which port/service is most likely down?",
    choices: ["Port 53 (DNS)", "Port 443 (HTTPS)", "Port 22 (SSH)", "Port 21 (FTP)"], answer: "Port 53 (DNS)" },
  { module: 7, topic: "M7", diff: "Easy", kind: "mc",
    prompt: "An employee gets an email pretending to be IT, asking for their password. Which attack surface is being exploited?",
    choices: ["Human", "Physical", "Digital", "Network"], answer: "Human" },
  { module: 7, topic: "M7", diff: "Medium", kind: "text",
    prompt: "You're a Threat Intelligence Analyst. Malware self-replicates across a network with no user clicking anything. What is it called? (one word)",
    answer: "worm" },
  { module: 7, topic: "M7", diff: "Hard", kind: "mc",
    prompt: "A hotel CFO denies a security budget request, saying \"we have insurance to cover us if anything goes wrong.\" What is it called when someone takes on more risk because someone else pays for their mistakes?",
    choices: ["Moral hazard", "Zero-day", "Least privilege", "Persistence"], answer: "Moral hazard" },
  { module: 2, topic: "M2", diff: "Easy", kind: "mc",
    prompt: "Which of these is a PASSIVE digital footprint (created without you directly acting)?",
    choices: ["A website silently logging your IP address", "Posting a photo on Instagram", "Leaving a comment on a blog", "Sending an email"], answer: "A website silently logging your IP address" },
  { module: 8, topic: "M8", diff: "Medium", kind: "mc",
    prompt: "A hospital had antivirus, a locked server room, and yearly password training — but a caller pretending to be IT still talked an employee out of their password. Which control would have stopped this attack in the moment?",
    choices: ["A second login code sent to the employee's phone (MFA)", "A stronger firewall rule", "A backup server", "Better key-card badges"], answer: "A second login code sent to the employee's phone (MFA)" },
  { module: 9, topic: "M9", diff: "Hard", kind: "mc",
    prompt: "You intercept a ciphertext where the same letter is encrypted to a different symbol nearly every time it appears, defeating frequency analysis. What kind of cipher is this most likely to be?",
    choices: ["Polyalphabetic", "Monoalphabetic", "Transposition only", "Base64 encoding"], answer: "Polyalphabetic" },
  { module: 10, topic: "M10", diff: "Medium", kind: "mc",
    prompt: "During a mock CTF, your team is stuck on a Forensics challenge for 15 minutes with no progress. What does the competitor mindset suggest you do?",
    choices: ["Pivot to a different category while a teammate keeps working the file", "Keep guessing random flags until one works", "Give up on the whole competition", "Wait silently for the teacher to give the answer"], answer: "Pivot to a different category while a teammate keeps working the file" }
];


window.COURSE_CONFIG.cyber1.ctf.moduleFrameworks = {
  1:  { district: { name: "cyber.org K-12", bigIdeas: [3,4], standards: ["9-12.DC.THRT","9-12.DC.FOOT","9-12.DC.PII","9-12.DC.PPI.II","9-12.SEC.CIA","9-12.SEC.INFO"] }, ap: null },
  2:  { district: { name: "cyber.org K-12", bigIdeas: [], standards: ["9-12.DC.THRT","9-12.DC.ETH","9-12.DC.LAW","9-12.DC.AUP"] }, ap: null },
  3:  { district: { name: "cyber.org K-12", bigIdeas: [], standards: ["9-12.SEC.PHYS"] }, ap: null },
  4:  { district: { name: "cyber.org K-12", bigIdeas: [], standards: ["9-12.CS.OS","9-12.CS.HARD"] }, ap: null },
  5:  { district: { name: "cyber.org K-12", bigIdeas: [], standards: ["9-12.CS.OS"] }, ap: null },
  6:  { district: { name: "cyber.org K-12", bigIdeas: [3], standards: ["9-12.CS.COMM","9-12.CS.COMP","9-12.CS.HARD"] }, ap: null },
  7:  { district: { name: "cyber.org K-12", bigIdeas: [3], standards: ["9-12.SEC.INFO","9-12.SEC.NET","9-12.SEC.PHYS"] }, ap: null },
  8:  { district: { name: "cyber.org K-12", bigIdeas: [3], standards: ["9-12.SEC.INFO","9-12.SEC.ACC","9-12.SEC.AUTH","9-12.SEC.PHYS"] }, ap: null },
  9:  { district: { name: "cyber.org K-12", bigIdeas: [1,2], standards: ["9-12.SEC.CRYP","9-12.SEC.INFO"] }, ap: null },
  10: { district: { name: "cyber.org K-12", bigIdeas: [2], standards: ["9-12.CS.COMM","9-12.CS.COMP","9-12.CS.HARD","9-12.CS.PROT","9-12.SEC.COMP"] }, ap: null },
  11: { district: { name: "cyber.org K-12", bigIdeas: [1], standards: ["9-12.SEC.INFO","9-12.SEC.NET","9-12.DC.THRT"] }, ap: null },
  12: { district: { name: "cyber.org K-12", bigIdeas: [3], standards: ["9-12.SEC.DATA","9-12.CS.APPS","9-12.SEC.INFO"] }, ap: null },
  13: { district: { name: "cyber.org K-12", bigIdeas: [1,2,3,4,5,6], standards: ["9-12.DC.FOOT","9-12.DC.ETH","9-12.SEC.CTRL"] }, ap: null }
};

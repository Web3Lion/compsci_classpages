// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ============================================================
   APCSP — CTF content (challenges, boss questions, frameworks).
   Loaded right after ../config.js by apcsp/ctf.html, apcsp/profile.html and the
   teacher pages. Edit challenges HERE, in the one challenges: [ ... ] array.
   ============================================================ */
window.COURSE_CONFIG = window.COURSE_CONFIG || {};
window.COURSE_CONFIG.apcsp = window.COURSE_CONFIG.apcsp || {};


/* ============================================================
   MODULE 5 — Identity & Access Management (Unit 5).
   Objectives: authentication, authorization, LDAP, authentication protocols,
   multifactor authentication, single sign-on (SSO), Active Directory, PKI,
   digital certificates. 4 interactive captures + a leveled text set.
   ============================================================ */

/* Module 1 interactive "spot the red flags" challenge (engine type:"spot").
   Student clicks every element that is a phishing red flag; correct when the
   selected set exactly matches items flagged bad:true. Edit items below —
   each clickable piece: {field:"from"|"subject"|"body", text, click:true, bad:true/false, link:true?}. */

/* Module 1 interactive "Match the Attack" (engine type:"match"). Student pairs
   each scenario (left) to the attack it describes (right). Correct when every
   pair is matched to its own right. Right labels shuffle each load. */

/* Module 1 interactive "Order the Kill Chain" (engine type:"order"). Steps are
   listed here in the CORRECT order; the engine shuffles them for the student,
   who reorders with arrows. Correct when the sequence matches this order. */

/* Module 3 third interactive capture (Match) \u2014 encodings & crypto primitives. */

/* Module 4 third interactive capture (Match) \u2014 attack to its best defense. */

/* ============================================================
   BYTE BOUNTY (AP CSP) — mentor mode, guide = ADA.
   Questions NOT authored yet. Add flags to .challenges and
   applied questions to .bossQuestions when ready.
   ============================================================ */
window.COURSE_CONFIG.apcsp.ctf = {
  title: "Byte Bounty",
  mentor: true,
  intro: "Welcome to Byte Bounty. Collect bounties across the Big Ideas of AP CSP \u2014 each capture maps to a course objective and earns XP. Your guide ADA is here to cheer you on. Progress saves on this device.",
  adversary: "ADA",
  adversaryColor: "#a855f7",
  adversaryColor2: "#c98bff",
  adversaryGlow: "#a855f7",
  modules: ["Computational Thinking","Python Programming","Digital Media Processing","Data Science","Creative Task","Innovative Technologies","AP Test Prep"],
  challenges: [

  /* MODULE 1 — Computational Thinking ─────────────────────────────────────── */
  { id: "ap-m1a", module: 1, title: "1a — What Is an Algorithm?", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? A finite set of step-by-step instructions that accomplishes a task.\n\nSubmit as flag{word} (lowercase).",
        hint: "A recipe is one.",
        flagHash: "e165ad962d510917b1dbd9c289ce95aac0de155864b0095001ef193be7f912cd" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Precision in algorithms. Steps that could be read or followed more than one way, so different people end up doing different things, contain ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of clear and precise.",
        flagHash: "66e719a549846cb06341bc7cc13a494b82ba97a8b8a1552e489b743b1109d531" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Framing problems. In computer science, saying you're going to 'solve a problem' doesn't mean something is wrong — a problem can simply be a ___ that needs to be completed.\n\nSubmit as flag{word} (lowercase).",
        hint: "Any task you need to complete counts.",
        flagHash: "cc32acf6294069782c11181a1cf7e39f5d4fb0bb58fb6c5d31e543324e325e49" }
    ] },

  { id: "ap-m1b", module: 1, title: "2a — Decomposition & Abstraction", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? Reducing complexity by focusing on the main idea and hiding unnecessary detail.\n\nSubmit as flag{word} (lowercase).",
        hint: "Hiding detail.",
        flagHash: "5f46d98c4b621039b59b05e84990cc59fe9e4718c08603506addf49eb8fba318" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Breaking down big problems. Splitting a big, overwhelming problem into smaller, more manageable problems is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Big problem → smaller pieces.",
        flagHash: "e9f8cf8d0fecfef89a4c7133b1ff4860a8c16c12d37b7f0e4054a4d72a298349" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Generalizing solutions. A solution built to work for any similar problem, not just one specific case, is called a ___ solution.\n\nSubmit as flag{word} (lowercase).",
        hint: "Works for every paragraph, not just one.",
        flagHash: "36dd532646747112dacb85c15592bda2315e9b728ee0e973a74c3f3574449372" }
    ] },

  { id: "ap-m1-ptypes", module: 1, title: "3a — Sequencing, Selection & Iteration", category: "Computational Thinking", type: "match", points: 150,
    intro: "Objective — Control structures. Match each pattern to what it does. Tap a term, then tap its description.",
    pairs: [
      { left: "Sequencing", right: "Running steps one after another, in order" },
      { left: "Selection", right: "Choosing a path with if/else" },
      { left: "Iteration", right: "Repeating a set of steps" }
    ] },

  { id: "ap-m1-robotrun", module: 1, title: "3b — Trace the Robot", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Algorithm tracing & iteration. A robot runs this pseudocode:\nn \u2190 1\nREPEAT 3 TIMES {\n  REPEAT n TIMES { MOVE_FORWARD }\n  ROTATE_LEFT\n  n \u2190 n + 1\n}\nHow many total MOVE_FORWARD steps execute?\n\nSubmit as flag{number}.",
        hint: "REPEAT n TIMES reads n once, right when it starts. Trace n across all 3 outer loops: 1, then 2, then 3. Try the ROBOT RUN simulator's first practice problem.",
        flagHash: "1a232608612178c94c0e9fd560df1b1385ad189aa832939e57caec79eeee56ad" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Order of operations in loops. Same robot, but the increment moved:\nn \u2190 1\nREPEAT 3 TIMES {\n  n \u2190 n + 1\n  REPEAT n TIMES { MOVE_FORWARD }\n  ROTATE_LEFT\n}\nHow many total MOVE_FORWARD steps execute now?\n\nSubmit as flag{number}.",
        hint: "n is incremented BEFORE the inner loop reads it this time, so the inner loop never runs at n=1. Try selecting the option in ROBOT RUN that increments before moving.",
        flagHash: "1203df1573ea0f4077ca6a65df1e0113dc69fa1e267be5bf0c2ff757be0cda12" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — When a loop's iteration count is 'locked in'. Same robot, but n now changes DURING the inner loop:\nn \u2190 1\nREPEAT 3 TIMES {\n  REPEAT n TIMES {\n    MOVE_FORWARD\n    n \u2190 n + 1\n  }\n  ROTATE_LEFT\n}\nHow many total MOVE_FORWARD steps execute?\n\nSubmit as flag{number}.",
        hint: "REPEAT n TIMES only reads n once, when that specific loop starts — changing n inside doesn't change how many times THAT loop was already set to run. Track how many times each of the 3 inner loops actually repeats: 1, then 2, then 4.",
        flagHash: "5583b3ce3b42644490f323edfc1da538d0c41d26ce150a65e700b3b6d11f651f" }
    ] },

  { id: "ap-m1-flowchart", module: 1, title: "4a — Flowcharts", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Flowcharts. In flowchart notation, the diamond shape represents a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The shape that shows a yes/no branch.",
        flagHash: "b0ac1845855ef736acd0924c90a580386cfe7f733bb0dbcc17cb9c82e3efe64a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Flowcharts. In flowchart notation, a parallelogram represents an ___ ___ operation.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Checking the temperature or a device's battery charge is this kind of step — different from a process step.",
        flagHash: "e277ff0fb66d76cafe5c60bf6bb6e7585a98eaab4b7851b4fb09bd65639b5c21" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing flowchart loops. A flowchart loop keeps repeating while a counter x, starting at x=1, is less than 4: it prints x, then increments x by 1, then re-checks the condition. How many numbers get printed before the loop stops?\n\nSubmit as flag{number}.",
        hint: "Trace it: x=1 (print, prints 1) → x=2 (print) → x=3 (print) → x=4 fails the condition, loop stops.",
        flagHash: "07c67cc36d721525a477be5d2cfa6c3fa981190a537178a02b64849fd972fcc6" }
    ] },

  { id: "ap-m1-reading", module: 1, title: "5a — Algorithms Reading", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Writing clear algorithms. A step written as a command with a verb telling exactly what to do (like 'put on the left shoe') is an ___ statement.\n\nSubmit as flag{word} (lowercase).",
        hint: "A command, not a description.",
        flagHash: "edef266ce29abd4c827c492a24922fe76ad1d61079d4f5ba965260d1da289242" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Writing clear algorithms. Extra detail that removes confusion — like specifying the LEFT shoe instead of just 'a shoe' — is a descriptive ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Descriptive ___ — the word right after 'descriptive' in the reading.",
        flagHash: "3ca6ab972c88284c8dc4c231a60ccdeb405b65fd2556ecdaae672b1469bba189" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Algorithm formats. Whether written as a flowchart, pseudocode, math notation, or code, every format must express an algorithm understandably and ___ — so it can only be interpreted one way.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of ambiguously.",
        flagHash: "f5b3c33b8d47abf0f56cab2490046ff50f064621d8d133d707e1331c7d6f781b" }
    ] },

  { id: "ap-m1-caesar", module: 1, title: "6a — The Caesar Cipher", category: "Encryption",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Encryption basics. In cryptography, the original, unencrypted message is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of ciphertext.",
        flagHash: "7d53c4d8a96af6f9bdfca67ec0d1a2528270b3e3a7763eb0c322bbde753ce045" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Caesar cipher. Julius Caesar's original cipher used a left shift of 3. Using that same shift, plaintext letter D becomes which ciphertext letter?\n\nSubmit as flag{letter} (lowercase).",
        hint: "Shift D back 3 letters: D, C, B, A.",
        flagHash: "67d0ac6cf6c7503248375a3f38c253c58651a1c79e097e340b01bd863546cf63" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Applying a Caesar shift. Using a Caesar cipher that shifts each letter FORWARD 5 positions in the alphabet, encrypt the plaintext CAB, letter by letter.\n\nSubmit as flag{ciphertext} (lowercase).",
        hint: "C→H, A→F, B→G (count forward 5 letters from each).",
        flagHash: "b5eace82a0aaec8d4789a5d2981a834ccbd8e1a6264a9ef5a7d1b4513a912dbb" }
    ] },

  { id: "ap-m1-y2k", module: 1, title: "6b (ext) — Y2K: The Copyright Mystery", category: "Encryption",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Explaining historical context for computing risk. Research the Y2K bug (also called the millennium bug). What does the 'Y2K' abbreviation stand for?\n\nSubmit as flag{words_with_underscores}, lowercase.",
        hint: "'K' is a common shorthand for 'thousand' — Y2K = Year ___.",
        flagHash: "0bb11fa06abbbebc9aa3b8fe8c037227a7c297ccee710245cb0a12fc1cfe5446" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Explaining historical context for computing risk. Keep researching Y2K: to save memory, early programmers stored calendar years using only how many digits (e.g., '99' instead of '1999')?\n\nSubmit as flag{answer} — the number, spelled out, lowercase.",
        hint: "It's a small number — think '99' has this many digits.",
        flagHash: "f9695fece5948d5115a8ede70bab46ff2274bb8e85778679dc5cdc50e14f6c9d" },
      { difficulty: "Hard", points: 150,
        img: "../assets/y2k-comic.png",
        prompt: "Objective — Applying research to a real artifact. This comic strip's copyright reads 1900, even though it was clearly made decades later. Using the Y2K bug, the comic was actually made in which of these years: 1999, 2000, 2001, or 2002?\n\nSubmit as flag{answer} — the number.",
        hint: "The comic's copyright already shows you the wrong answer the bug would produce.",
        flagHash: "7de51dcd2977bd072b055fdf1fa1722c65e909bf848f6dc1b5095f397dc9a95d" }
    ] },

  { id: "ap-m1-keys", module: 1, title: "7a — Encryption Keys", category: "Encryption",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Encryption. What term is described by the following definition? The piece of information that controls how data is encrypted or decrypted.\n\nSubmit as flag{word} (lowercase).",
        hint: "You need one to lock or unlock the message.",
        flagHash: "d4a44801327f6bdbad722255e7dbad5b319afb83fb8b50d18b6b6ec7d33e6963" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Encryption. An encryption scheme where the SAME key both encrypts and decrypts is called ___ encryption.\n\nSubmit as flag{word} (lowercase).",
        hint: "Both sides share one identical key.",
        flagHash: "0b84a426da5ad73abfd7f5e4a73a667621b374d6b8d3349074058a7f1ba9c8ed" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Encryption. An encryption scheme that uses a public key to encrypt and a different, mathematically linked private key to decrypt is called ___ encryption.\n\nSubmit as flag{word} (lowercase).",
        hint: "Two different, mathematically related keys — one public, one private.",
        flagHash: "fdb0d9f92ace8928ef9b642ec772d625e5f5921af3b1d8e13ce3aca6427b933c" }
    ] },

  { id: "ap-m1-vigenere", module: 1, title: "9a — Vigenère vs. Caesar", category: "Encryption",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Vigenère cipher. Unlike the Caesar cipher's single fixed shift, the Vigenère cipher uses a repeating ___ to pick a different shift for each letter.\n\nSubmit as flag{word} (lowercase).",
        hint: "A word or phrase repeated over the message to vary the shift.",
        flagHash: "5b800b07688d1854b70ae9dd7592187f1b17151c44f32500e5433bdaa70ba6a9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Weakness of monoalphabetic ciphers. A cipher that uses the same shift for every letter, like Caesar's, is vulnerable to ___ ___ analysis, because the pattern of letter frequencies in the plaintext is preserved in the ciphertext.\n\nSubmit as flag{two words} (lowercase).",
        hint: "E, T, A, and O appear more often than other letters in English — that pattern survives a single fixed shift.",
        flagHash: "c9c54bb8db34a3562063f2c785bd406939cf7b7a62f3a5df336cd9efd9d04ab2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Applying a Vigenère shift. Encrypt plaintext AB with a Vigenère cipher using the keyword KEY (K shifts by 10, E shifts by 4). Give the two-letter ciphertext.\n\nSubmit as flag{ciphertext} (lowercase).",
        hint: "A (0) + 10 = K. B (1) + 4 = F.",
        flagHash: "205c9b7a95ae2b5dbdd8dc152c1117f17c9bbf9e6f6aff433c1bb56dbbc2b3fb" }
    ] },

  { id: "ap-m1-ciphertypes", module: 1, title: "9b — Match the Cipher Concept", category: "Encryption", type: "match", points: 150,
    intro: "Objective — Encryption. Match each term to what it does. Tap a term, then tap its description.",
    pairs: [
      { left: "Caesar cipher", right: "Single fixed shift for every letter" },
      { left: "Vigen\u00e8re cipher", right: "Repeating keyword, different shift per letter" },
      { left: "Symmetric encryption", right: "Same key encrypts and decrypts" },
      { left: "Asymmetric encryption", right: "Public key encrypts, private key decrypts" }
    ] },

  { id: "ap-m1-ciphergauntlet", module: 1, title: "9d (ext) — Cipher Gauntlet", category: "Encryption",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Applying a Caesar shift. This message was encrypted with a Caesar cipher, key = 10 (each plaintext letter shifted FORWARD 10 places):\n\nKZMCZ VODC QY!\n\nShift each letter BACK 10 places to decode it.\n\nSubmit as flag{words_with_underscores} (lowercase, no punctuation).",
        hint: "K→A, Z→P, M→C, C→S, Z→P. Same shift for every letter.",
        flagHash: "e4ae80d3ce0c61e6b255208530ae9de9ba35f74ce52828f96581a6e912eb1d5c" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Applying a Vigenère shift. This message was encrypted with a Vigenère cipher, keyword = LION (L=11, I=8, O=14, N=13):\n\nVMZYJ OFRPV OAO EVVEM\n\nThe keyword repeats under the message, letter by letter (spaces don't consume a key letter). Shift each ciphertext letter BACK by its matching key letter's value to decode it.\n\nSubmit as flag{words_with_underscores} (lowercase, no punctuation).",
        hint: "First 4 letters: V-L, M-I, Z-O, Y-N. V(21)−L(11)=10→K... keep going with the repeating keyword.",
        flagHash: "173b7c6bb10cb7a912cd8ec1403d6b32e71a6e0941c0ffb98a204b123705df69" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Monoalphabetic substitution. Unlike Caesar or Vigenère, this cipher assigns every letter of the alphabet its OWN random replacement (no single shift amount). Use this key to decode the message:\n\nA=E B=Z C=Q D=V E=R F=K G=S H=W I=N J=H K=P L=I M=B N=C O=F P=O Q=Y R=X S=U T=J U=T V=D W=G X=L Y=A Z=M\n\nCiphertext: EVE NU GEJQWNCS\n\nSubmit as flag{words_with_underscores} (lowercase, no punctuation).",
        hint: "Find each ciphertext letter on the RIGHT side of the key, then read off the plaintext letter on the left. E→A, V→D, E→A spells the first word.",
        flagHash: "425b606de0667f60a24a4904097016dde0de0089a2bec5d800a5eb6dd44cc28e" }
    ] },

  { id: "ap-m1-cia", module: 1, title: "10a — The CIA Triad", category: "Foundations",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — CIA Triad. Limiting access to sensitive information strictly to authorized users and systems is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The 'C' in CIA.",
        flagHash: "c087a071e9e2f7c959cc4973c77b2c5feb17cead7dd031b00a94213f2664bfdc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — CIA Triad. The certainty that information remains accurate, complete, and untampered with by unauthorized parties is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The 'I' in CIA.",
        flagHash: "2f3d9851d23849572228eb2f2abb2c097a85090aaf63066e566d6584e366192e" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — CIA Triad. The reliability of timely access to systems, services, and information whenever authorized users need them is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The 'A' in CIA.",
        flagHash: "ffea4cb5ee4b39c442a6b26ab927c4daa0b5f3e642a03509fe9c1179ef5b501d" }
    ] },

  { id: "ap-m1-ambiguity", module: 1, title: "11a — Clarity vs. Ambiguity", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Ambiguity. A sentence or instruction that can be read more than one way, so different people interpret it differently, is ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "'She saw the man on the hill with a telescope' — who has the telescope?",
        flagHash: "d9cc9cf9f916682419ef11e300bde60d2a17a0912790f4ee6ff3d407658ba120" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Sources of ambiguity. In 'She saw the man on the hill with a telescope,' the confusion comes from a ___ ___ ('with a telescope') that could attach to more than one noun.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Starts with a preposition like 'with' or 'on'.",
        flagHash: "f4df7418e7dc3f14f28fa65940b9188d8f06a258a557746bc12fed90843f39aa" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Multiple interpretations. Computer scientists say an ambiguous sentence has multiple ___ ___ — the different ways it can be broken down grammatically.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Tree-shaped diagrams grammarians use to show sentence structure.",
        flagHash: "819a265e3f15b7f5eccad800d380af71a89a77f76e9d1f2d13aa0dcc6500e85b" }
    ] },

  { id: "ap-m1-langs", module: 1, title: "12a — Artificial vs. Natural Languages", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? A language with precise, unambiguous, well-defined syntax created for a specific purpose, unlike a natural human language.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Programming languages are one example of this broader category.",
        flagHash: "a3c30ca9269dfbd065676069325a7bebd545ba528cedab898c8cfe8f244a8620" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Visual languages. A language like Scratch, where you drag and drop blocks instead of typing exact syntax, is a ___ programming language.\n\nSubmit as flag{word} (lowercase).",
        hint: "You see and drag the blocks — no typing required.",
        flagHash: "7848f5ad8afcd94c3ea2e8f9d373944c6615dbc6b1495419af4e093700560dda" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Syntax. The exact spelling, punctuation, and capitalization rules a language demands, with nothing left to interpretation, is its ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Get this wrong and the computer won't do what you want, even if a human would understand you fine.",
        flagHash: "82daa66db8bd907a6af12adbdd7da63582cb8fb3aa363722e6962f1cae0b5c17" }
    ] },

  { id: "ap-m1-langlevel2", module: 1, title: "13a — High-Level vs. Low-Level", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Programming languages. A language that closely resembles human language and hides hardware details, like Python, is a ___-level language.\n\nSubmit as flag{word} (lowercase).",
        hint: "More abstraction from the hardware = this level.",
        flagHash: "1b10dc5ff97b64d726a4a086a9f1d6cf6f13b48c33d8c20ac2765d2cd0254891" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Choosing a language level. A developer writing a device driver needs direct control over specific memory addresses and CPU registers. Should they choose a high-level or a low-level language? Answer with just the level.\n\nSubmit as flag{word} (lowercase).",
        hint: "Direct hardware control needs less abstraction, not more.",
        flagHash: "b17a1cf1311cd73c0d542ab8354229231e1beb1265dc28d46e410c970ef5f196" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Programming languages. What term is described by the following definition? The process that translates high-level abstract instructions into the low-level machine code a processor actually requires.\n\nSubmit as flag{word} (lowercase).",
        hint: "Turns your Python/Java into ones and zeros the chip can run.",
        flagHash: "77984b3c7c29c838d0f8b571b90bd7f35ffda66df9bff1cd94440133f1b9cdaf" }
    ] },

  { id: "ap-m1-langlevel", module: 1, title: "13b — Match the Language Level", category: "Computational Thinking", type: "match", points: 150,
    intro: "Objective — Programming languages. Match each example to its level. Tap the example, then tap its level.",
    pairs: [
      { left: "Python", right: "High-level language" },
      { left: "Assembly", right: "Low-level language" },
      { left: "Binary machine code", right: "Lowest-level representation" },
      { left: "Plain English instructions", right: "Natural language (ambiguous)" }
    ] },

  { id: "ap-m1-devprocess", module: 1, title: "14a — Order the Development Process", category: "Computational Thinking", type: "order", points: 150,
    intro: "Objective — Program development. Order the steps of the program development process, first to last.",
    steps: [
      "Plan the algorithm in pseudocode",
      "Translate the pseudocode into code",
      "Run the program",
      "Test it with sample inputs",
      "Debug any errors found"
    ] },

  { id: "ap-m1-pseudocode", module: 1, title: "15a — Pseudocode & Development", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Program development. What term is described by the following definition? Writing out an algorithm in structured, informal language before translating it into real code.\n\nSubmit as flag{word} (lowercase).",
        hint: "Not real code — a structured plain-language draft of the algorithm.",
        flagHash: "1c132b3e3768364850dd681ab981772467c0ab076091b672f6276d197fc40a3c" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Program development process. In the program development process, checking a program's output against expected results to catch errors is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Comes right before (and drives) debugging.",
        flagHash: "7977ee862953702625e5aaab1c729724560a044ddd673ebb2a42f8ab32c79d04" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing pseudocode. Trace this pseudocode:\ntotal \u2190 0\ni \u2190 1\nREPEAT UNTIL (i > 4) {\n  total \u2190 total + i\n  i \u2190 i + 1\n}\nWhat is the value of total when the loop ends?\n\nSubmit as flag{number}.",
        hint: "The loop adds i to total for i = 1, 2, 3, 4, then stops once i > 4.",
        flagHash: "de2ff58afd20a703c95fd257208c257010b2265dd71ea4c9e54d047762c4e523" }
    ] },

  { id: "ap-m1-effic", module: 1, title: "16a — Efficiency: Slowest-Growing First", category: "Computational Thinking", type: "order", points: 150,
    intro: "Objective — Algorithmic efficiency. Order these growth rates from the MOST efficient (slowest-growing) to the LEAST efficient (fastest-growing).",
    steps: [
      "Constant",
      "Linear",
      "Quadratic (square)",
      "Cubic",
      "Exponential",
      "Factorial"
    ] },

  { id: "ap-m1-effic2", module: 1, title: "16b — Algorithms & Efficiency", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? The measure of how much time and/or memory an algorithm uses to run.\n\nSubmit as flag{word} (lowercase).",
        hint: "Faster and leaner = more of this.",
        flagHash: "e4ef8500a77c2559aa4e177849b3372d69f34025962670e709c03ce6971a9034" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Algorithms. A search that starts in the middle of a sorted list and removes half the data each step is called ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "It halves a SORTED list each step.",
        flagHash: "8df4578b0ae5d8875b5f269168532fc1cdeac556f0f41bdc0e43ce090975c3cd" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Algorithmic efficiency. What term is described by the following definition? The capacity for a system or algorithm to keep performing well as the size of the problem grows much larger.\n\nSubmit as flag{word} (lowercase).",
        hint: "Does it still work well at a much bigger size?",
        flagHash: "afe0dfc6ece90b4e834b1aa7b2543855fcc7558a60b40bb9a1f3c0200a74397d" }
    ] },

  { id: "ap-m1-ptypes2", module: 1, title: "16c — Sort the Problem Type", category: "Computational Thinking", type: "match", points: 150,
    intro: "Objective — Problems & algorithms. Match each description to the kind of problem it is. Tap a description, then tap the type.",
    pairs: [
      { left: "Is there a path from A to B? (yes/no)", right: "Decision Problem" },
      { left: "Find the SHORTEST path from A to B", right: "Optimization Problem" },
      { left: "No algorithm can always solve it", right: "Undecidable Problem" },
      { left: "Can be solved algorithmically for every input", right: "Decidable Problem" }
    ] },

  { id: "ap-m1-models", module: 1, title: "16d (ext) — Match the Computing Model", category: "Computational Thinking", type: "match", points: 150,
    intro: "Objective — Parallel & distributed computing. Match each model to what it does. Tap a model, then tap its description.",
    pairs: [
      { left: "Sequential", right: "Runs one command at a time, in order" },
      { left: "Parallel", right: "Splits work so pieces run at the same time" },
      { left: "Distributed", right: "Runs across multiple devices" }
    ] },

  { id: "ap-m1-speedup", module: 1, title: "16e (ext) — Parallel Computing & Speedup", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? A model in which a program is broken into pieces, some of which run at the same time.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Pieces run at the same time.",
        flagHash: "5ffb708e8d184373d0be826cd0a330a6d3a2f22eee933bd58c58312b46212dc0" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Parallel computing. The time to complete a task sequentially divided by the time to complete it in parallel is the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Sequential time ÷ parallel time.",
        flagHash: "2c77634d0c4787906adf64b39d0098f7c3b19d5f6f6551ccbf3aef25c3342c89" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Calculating speedup. A task takes 60 seconds to run sequentially and 15 seconds when run in parallel. What is the speedup, as a plain number?\n\nSubmit as flag{number}.",
        hint: "Speedup = sequential time ÷ parallel time.",
        flagHash: "7be5aec942dbdcfb4e21cd12dd137de80acf61b69c924a3500a50673253943c2" }
    ] },

  { id: "ap-m1-moore", module: 1, title: "17a — Moore's Law", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computer hardware trends. The observation that the number of transistors on a computer chip roughly doubles on a regular schedule is called ___ ___.\n\nSubmit as flag{two words, no apostrophe} (lowercase).",
        hint: "Named for an Intel co-founder.",
        flagHash: "9d854f7377537f779e084d4073f6ff128ae6172613901649fa250a904b394fe9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Moore's Law. Moore's Law is usually stated as chip density doubling roughly every how many months?\n\nSubmit as flag{number}.",
        hint: "A year and a half.",
        flagHash: "d75230f35c9367fa9d75c8a3f0cb5ddb1f98b64fc72ca72d22722fcdbd4848bb" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Applying Moore's Law. Using the ~18-month doubling rate, computer hardware from 10 years ago was roughly how many times slower than today's?\n\nSubmit as flag{number}.",
        hint: "10 years is about 6.67 doublings — round to the nearest clean power-of-two-ish estimate given in the reading.",
        flagHash: "d676b048201cf2a4cedb82b50b9440a4f4e4983d51ca38269dc9cffffce0abd4" }
    ] },

  { id: "ap-m1-heuristics", module: 1, title: "18a — Heuristics", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computational Thinking. What term is described by the following definition? An approach that gives a 'good enough' solution when a perfect one is impractical or impossible.\n\nSubmit as flag{word} (lowercase).",
        hint: "A problem solver's 'rule of thumb'.",
        flagHash: "0ba600dc91096cc6250d73b1bf62d9f522f43506563f3361bc5bc6c701f1e290" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Heuristics vs. exact solutions. A solution guaranteed to be the best possible answer (not just good enough) is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of a heuristic's guarantee.",
        flagHash: "d4c96982e5d2fa48c8416361cfd3ae256435fe7e12e40f93738bcd8004893bbd" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Why use heuristics. A GPS app often suggests a good route instantly instead of checking every possible route to guarantee the shortest one, because a heuristic trades a guarantee of the best answer for ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "What do you gain by not checking every possibility?",
        flagHash: "001e067c96ecae2e1ad8b78b6197af744bfafad91793f37cbb1cd0001e46286d" }
    ] },

  { id: "ap-m1-bias", module: 1, title: "19a — Algorithmic Bias", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computing Impacts. When an algorithm systematically produces unfair outcomes for a group of people, often due to skewed training data, this is called algorithmic ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The unfairness has a name — one word.",
        flagHash: "d548a37b58af739ba6fa6d7620f140c30aabbc21b4bd9ca6ecc4542c74f7ba0b" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Causes of algorithmic bias. Training data that leaves out certain genders, races, or socioeconomic groups lacks ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Not everyone is represented.",
        flagHash: "831d78777419cbaf8638b10e6b0b1f1c50a9aac3641c731e3abc956814c92ab2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Real-world example. Automated loan software that discriminates against applicants based on their neighborhood is known as ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "An old, unethical banking practice with the same name.",
        flagHash: "6beb134ca4cf5ecf5047f8b06d7523656012c4b5e0d777649365db2d956c4bc3" }
    ] },

  { id: "ap-m1-antibias", module: 1, title: "20a — Reducing Algorithmic Bias", category: "Computational Thinking",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Inclusion coding. Designing code from the start to explicitly check for bias during development and deployment is called inclusion coding, or ___ for short.\n\nSubmit as flag{word} (lowercase).",
        hint: "A shortened, one-word version of 'inclusion coding'.",
        flagHash: "ff099a7d419c133351b3875bfbf0ce2c9b939a03cf451f4cf8dcb5f12a779542" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Reducing algorithmic bias. Using training data that fairly represents every group, instead of favoring one, is called an ___ data set.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of leaving groups out.",
        flagHash: "a44eb3e0a7f4076881bf4fca30e06303a86b61ac8fcd701d30cf10fdfc4638db" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Computing Impacts. Reviewing training data and model outputs for unfair patterns before deployment is called algorithmic ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "You're checking the model for bias — two words, first word is 'bias'.",
        flagHash: "d72c481dcdcd5c457ee3fc31bf52c52a00963220208f89eb679a7b3880643bee" }
    ] },

  { id: "ap-m1-vocab", module: 1, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["algorithm","abstraction","decomposition","generalized","sequenc","selection","iteration","efficiency","scalability","heuristic","binary search","decidable","confidentiality","integrity","availability","ambiguity","syntax","compilation","cipher","plaintext","ciphertext","key","pseudocode","bias","incoding","flowchart"],
    hardMode: "rapid" },

  /* MODULE 2 — Python Programming ─────────────────────────────────────────── */
  { id: "ap-m2a", module: 2, title: "Program Building Blocks", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Procedures. A named group of programming instructions (also called a procedure) is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Also called a procedure.",
        flagHash: "8ca382b4e5241a459111fd4db3e39db4a9ca37d2d725c8781af8b0d79f30a480" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Boolean logic. NOT, AND, and OR are ___ operators (they evaluate to a Boolean value).\n\nSubmit as flag{word} (lowercase).",
        hint: "The category of operators that combine or negate Boolean values.",
        flagHash: "a8b14711965e8b2b899887303183d154b8556d18912e6af039c360d3d5394e27" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Data abstraction. An ordered collection of elements, used to manage complexity, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Square brackets in Python.",
        flagHash: "5f86bbef5f248c3803388c9f92d9c75a2a5b5264d41a1e39cbc7bed898265653" }
    ] },

  { id: "ap-m2b", module: 2, title: "Debugging & Interfaces", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Program development. Finding and fixing problems in an algorithm or program is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Finding and fixing bugs.",
        flagHash: "efb06198e6e5cd8e7b538892ca4d81813a637d0ec4e0328de1d4fa1b33c994e9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Errors. A mistake that lets a program run but produce incorrect results is a ___ error.\n\nSubmit as flag{word} (lowercase).",
        hint: "The program runs without crashing but produces the wrong answer. Name this kind of error.",
        flagHash: "ee2ea8902c4e60466a925bffa1338cd5149218fe6d6e545b2b166d81c8f92ab6" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Libraries. The specifications for how a library's procedures behave and are used — Application Program Interface — is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Application Programming Interface — give the acronym.",
        flagHash: "e7f0fa54d28539fa670912d186744701b325cef6d8270fc58aad66edbb9b1b85" }
    ] },

  { id: "ap-m2c", module: 2, title: "Data Types & Typecasting", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data types. Converting a value from one data type to another, like turning the string \"5\" into the integer 5, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You're changing the type, not the value.",
        flagHash: "ecbc5b59eed8b3015e5feba8d1302931fc95c6e1aa46f5b413f4bff31d0ec41a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Type errors. In Python, running \"5\" + 3 without typecasting either value raises what kind of error, because a string and an integer can't be combined that way?\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Two mismatched data types.",
        flagHash: "1b7d7dd330a50d837c718494e30c904e33ef084f4a47b0104f5a24e7cbefa466" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing typecasting & concatenation. Trace this code:\nx \u2190 str(5) + str(3)\nWhat is the value of x?\n\nSubmit as flag{value}.",
        hint: "str() converts each number to text first, so + joins them as characters instead of adding them.",
        flagHash: "2858dcd1057d3eae7f7d5f782167e24b61153c01551450a628cee722509f6529" }
    ] },

  { id: "ap-m2d", module: 2, title: "Nested Conditionals", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Boolean logic. Which Boolean operator requires BOTH conditions to be true for the whole expression to be true?\n\nSubmit as flag{word} (lowercase).",
        hint: "Both sides must hold.",
        flagHash: "6201111b83a0cb5b0922cb37cc442b9a40e24e3b1ce100a4bb204f4c63fd2ac0" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Tracing conditionals. Trace this code with score \u2190 85:\nIF score \u2265 90:\n  grade \u2190 \"A\"\nELSE IF score \u2265 80:\n  grade \u2190 \"B\"\nELSE:\n  grade \u2190 \"C\"\nWhat is the value of grade?\n\nSubmit as flag{letter} (lowercase).",
        hint: "85 fails the first check but passes the second.",
        flagHash: "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing nested conditionals. Trace this code with x \u2190 5:\nIF x > 0:\n  IF x > 10:\n    result \u2190 \"big\"\n  ELSE:\n    result \u2190 \"small\"\nELSE:\n  result \u2190 \"negative\"\nWhat is the value of result?\n\nSubmit as flag{word} (lowercase).",
        hint: "x is positive, so you're inside the outer IF — now check the inner condition.",
        flagHash: "81db8ebbbbc69c6c6ad4a6aa92b76e0c08af547da236b9e2c9dbe1d8285a8130" }
    ] },

  { id: "ap-m2e", module: 2, title: "Iteration: For, While & Nested Loops", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Iteration structures. A loop that repeats a fixed, known number of times (like REPEAT 5 TIMES) is a ___ loop.\n\nSubmit as flag{word} (lowercase).",
        hint: "The count is set in advance.",
        flagHash: "10c22bcf4c768b515be4e94bcafc71bf3e8fb5f70b2584bcc8c7533217f2e7f9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Iteration structures. A loop that keeps repeating AS LONG AS a condition stays true, checked before every pass, is a ___ loop.\n\nSubmit as flag{word} (lowercase).",
        hint: "The condition is checked first, every time, and the loop may run zero times.",
        flagHash: "07a8750738828ffd36a9bbfc198cf5d3bfd93e9f86b0e16e5aedeef8426804cf" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing nested loops. Trace this code:\nFOR i \u2190 0 TO 1:\n  FOR j \u2190 0 TO 2:\n    PRINT(i, j)\nHow many total lines does this print?\n\nSubmit as flag{number}.",
        hint: "The outer loop runs 2 times; each time, the inner loop runs 3 times.",
        flagHash: "e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683" }
    ] },

  { id: "ap-m2f", module: 2, title: "Strings", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Strings. The position number used to access a single character within a string is its ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Same term used for accessing one element of a list.",
        flagHash: "1bc04b5291c26a46d918139138b992d2de976d6851d0893b0476b85bfbdfc6e6" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — String indexing. Given the string s \u2190 \"COMPUTER\", indexing starts at 0. What is s[2]?\n\nSubmit as flag{letter} (lowercase).",
        hint: "C is index 0, O is index 1, M is index 2.",
        flagHash: "62c66a7a5dd70c3146618063c344e531e6d4b59e379808443ce962b3abd63c5a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — String length. What is the length of the string \"COMPUTER\"?\n\nSubmit as flag{number}.",
        hint: "Count every character, including none that repeat.",
        flagHash: "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3" }
    ] },

  { id: "ap-m2g", module: 2, title: "Lists & Index Values", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data abstraction. The position number of an element within a list, starting at 0, is its ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The first element is at position 0.",
        flagHash: "1bc04b5291c26a46d918139138b992d2de976d6851d0893b0476b85bfbdfc6e6" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Finding an index. Given the list [\"red\", \"green\", \"blue\", \"yellow\"], what is the index of \"blue\"?\n\nSubmit as flag{number}.",
        hint: "Count positions starting from 0: red is 0, green is 1...",
        flagHash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Boundary errors. A list has 5 elements, so its valid indices are 0 through 4. Trying to access index 5 causes what kind of error?\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "The index is one past the last valid position — out of bounds.",
        flagHash: "b09dbca537aa6104c4f3bebd98750d1f67da1f336b91b41c267338a5661e3f43" }
    ] },

  { id: "ap-m2h", module: 2, title: "Processing Lists (Traversals)", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Processing lists. Visiting every element of a list, one at a time, in order, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A FOR EACH loop over a list is doing this.",
        flagHash: "a570734280136ec087b83781671f6c002f071bc8e7a8b2a515ed1a964eb3ab9f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Tracing a traversal. Trace this code:\ntotal \u2190 0\nFOR EACH num IN [3, 6, 9]:\n  total \u2190 total + num\nWhat is the final value of total?\n\nSubmit as flag{number}.",
        hint: "Add each list element to total, one at a time: 3, then 6, then 9.",
        flagHash: "4ec9599fc203d176a301536c2e091a19bc852759b255bd6818810a42c5fed14a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Searching within a traversal. Given the list [10, 20, 30, 40], what is the index of the FIRST value greater than 25?\n\nSubmit as flag{number}.",
        hint: "Walk the list from index 0: 10 (no), 20 (no), 30 (yes) — that's the index you want.",
        flagHash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35" }
    ] },

  { id: "ap-m2i", module: 2, title: "Functions & Parameters", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Procedures. A value passed into a procedure so it can work with different inputs each time it's called is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Goes inside the parentheses when you define the procedure.",
        flagHash: "6390361dfdff141a9223d632accf61242133a92d83f2a71be7233bb1cdbacca2" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Procedures. The value a procedure sends back to the code that called it is its ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "What RETURN produces.",
        flagHash: "bc638e540984290c4dc11de8d00d8176bcf6cc189c61f10c7ab964b6eee73f34" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing function calls. Trace this code:\nPROCEDURE square(n):\n  RETURN n * n\nresult \u2190 square(4) + square(2)\nWhat is the value of result?\n\nSubmit as flag{number}.",
        hint: "square(4) is 16, square(2) is 4 — add them.",
        flagHash: "f5ca38f748a1d6eaf726b8a42fb575c3c71f1864a8143301782de13da2d9202b" }
    ] },

  { id: "ap-m2j", module: 2, title: "Syntax, Runtime & Logic Errors", category: "Python Programming",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Program errors. This code is missing a colon:\nFOR i IN range(5)\n  PRINT(i)\nThe program won't even start running because of this. What TYPE of error is this?\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Broken grammar the language can't parse at all — caught before the program ever runs.",
        flagHash: "bf19dfc472ae203ab6023f4e58dec48dcb24dfe188031ffc4fdfb4ad7b19a984" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Program errors. This code is syntactically correct and starts running fine, but crashes partway through when it executes divide(10, 0). What TYPE of error is this?\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "The program runs correctly until this specific operation is attempted — that timing is the giveaway.",
        flagHash: "a38a797e13e5eeb0b722b165be482ab847e50f19213403d3c573cf9ee917004c" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Program errors. This code runs from start to finish with no crash, but a student meant to write average \u2190 total / count and instead wrote average \u2190 total * count, so every average printed is wrong. What TYPE of error is this?\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "It runs fine and never crashes — the program just doesn't do what it was supposed to do.",
        flagHash: "78d855a26780fa5de753eb8b9a44558076334fdfb5643f89711d7ce1afde3cca" }
    ] },

  { id: "ap-m2-errortypes", module: 2, title: "Match the Error Type", category: "Python Programming", type: "match", points: 150,
    intro: "Objective — Program errors. Match each situation to the type of error it is. Tap a situation, then tap its error type.",
    pairs: [
      { left: "Missing a colon after FOR i IN range(5)", right: "Syntax Error" },
      { left: "Program crashes accessing list[10] on a 5-element list", right: "Runtime Error" },
      { left: "Program runs fine but always prints the wrong total", right: "Logic Error" }
    ] },

  { id: "ap-m2-pieces", module: 2, title: "Match the Python Piece", category: "Python Programming", type: "match", points: 150,
    intro: "Objective — Program structure. Match each line of Python to what it does. Tap the code, then tap its role.",
    pairs: [
      { left: "x = 5", right: "Assigns a value to a variable" },
      { left: "if score > 90:", right: "Conditional (selection)" },
      { left: "for i in range(10):", right: "Iteration (loop)" },
      { left: "def greet():", right: "Defines a function" }
    ] },

  { id: "ap-m2-build", module: 2, title: "Build & Run a Program", category: "Python Programming", type: "order", points: 150,
    intro: "Objective — Program development. Order the steps a programmer follows to build and run a program, first to last.",
    steps: [
      "Plan the algorithm",
      "Translate it into code statements",
      "Run the program",
      "Test it with inputs",
      "Debug any errors you find"
    ] },

  { id: "ap-m2-controls", module: 2, title: "Match the Control Structure", category: "Python Programming", type: "match", points: 150,
    intro: "Objective — Control structures. Match each control structure to what it does. Tap the structure, then tap its job.",
    pairs: [
      { left: "Sequencing", right: "Runs statements one after another" },
      { left: "Selection", right: "Runs code only if a condition is true" },
      { left: "Iteration", right: "Repeats a block of steps" },
      { left: "Function call", right: "Runs the code inside a named procedure" }
    ] },

  { id: "ap-m2-vocab", module: 2, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["program","function","variable","conditional","iteration","list","debugging","logic","api","library","boolean"],
    hardMode: "unscramble" },

  /* MODULE 3 — Digital Media Processing ───────────────────────────────────── */
  { id: "ap-m3a", module: 3, title: "Bits & Bytes", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data representation. A single unit of information — a 0 or a 1 — is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Short for 'binary digit'.",
        flagHash: "35c2262fd06ac855fdececea2104589f63e2adae5468263c6c610f89bf602b73" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Data representation. A group of 8 bits is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Eight bits grouped together — the standard size for one character of ASCII text.",
        flagHash: "dcaaadf1496012d33eb9367d8b34978faac4af47643196660e82b313e42b7650" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Limits of representation. The error from trying to represent a number that is too large is an ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "What happens when a value needs more bits than its variable was given, so the number wraps or breaks. Two words.",
        flagHash: "1951ea84b1ed28abee061b1bdf9b8dab9a1313c7b4018d6c91e7b6c208afeda4" }
    ] },

  { id: "ap-m3b", module: 3, title: "Representing Media", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Image representation. The smallest addressable element of a digital image is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Smallest dot in an image.",
        flagHash: "1b741aae151e716a8179784f709109e0c8abcb4d8ef2aee48ce5fcfcd740871d" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Compression. Compression that permanently discards some data to shrink a file more is called ___ compression.\n\nSubmit as flag{word} (lowercase).",
        hint: "Compression that permanently discards data to save space. JPEG and MP3 both use it.",
        flagHash: "37a51a53ee2c309a6de855d819bb67012a8b3d7597db8fa8a1befd1c1022b8ff" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Color representation. The color model that mixes red, green, and blue light is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Three letters. The additive color model your screen uses.",
        flagHash: "2cdd7e222810fea5b2df546fb767d5e7d59b2d53ab882618219ad60d0a785792" }
    ] },

  { id: "ap-m3-ad", module: 3, title: "Analog or Digital?", category: "Digital Media", type: "match", points: 150,
    intro: "Objective — Data representation. Sort each item as analog or digital. Tap the item, then tap its category.",
    pairs: [
      { left: "Continuous sound wave in the air", right: "Analog" },
      { left: "An MP3 file of a song", right: "Digital" },
      { left: "A vinyl record groove", right: "Analog" },
      { left: "A photo stored as pixels", right: "Digital" }
    ] },

  { id: "ap-m3-sample", module: 3, title: "Digitize an Analog Signal", category: "Digital Media", type: "order", points: 150,
    intro: "Objective — Sampling. Order the steps to turn an analog sound wave into a digital file, first to last.",
    steps: [
      "Start with the analog wave",
      "Measure (sample) it at set intervals",
      "Record each sample as a number",
      "Store the numbers in binary",
      "Play back the digital copy"
    ] },

  { id: "ap-m3-compress", module: 3, title: "Lossy or Lossless?", category: "Digital Media", type: "match", points: 150,
    intro: "Objective — Compression. Match each example to its compression type. Tap the example, then tap the type.",
    pairs: [
      { left: "A ZIP archive of documents", right: "Lossless" },
      { left: "A streaming video", right: "Lossy" },
      { left: "Keeps every bit of the original", right: "Lossless" },
      { left: "Discards detail to shrink more", right: "Lossy" }
    ] },

  { id: "ap-m3-studentnum", module: 3, title: "Student Numbers", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data representation. A classroom assigns each student a number as an 8-bit binary value, counting up from 0000 0000 in the order they joined. The last assigned number was 0111 1110. What was the student number of the NEXT-TO-LAST student, in decimal?\n\nSubmit as flag{number}.",
        hint: "Next-to-last means one number lower than 0111 1110. Convert that binary value to decimal, then subtract 1.",
        flagHash: "db9091a65674b8a6ae69203576d832da5555ec07a0bc82784fb41cbd29603435" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Limits of representation. Same classroom, same 8-bit counter, last assigned number was 0111 1110. If one more student adds the course, what decimal number would THEY be assigned?\n\nSubmit as flag{number}.",
        hint: "The next student gets the next number after 0111 1110 — one binary value up.",
        flagHash: "389a2275435cf33a47232e4947f534956938d10e9aebc01b1c806cf416ee7a3a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Binary place value. Convert student number 1001 1110 to decimal.\n\nSubmit as flag{number}.",
        hint: "Place values from the left, 8 bits: 128, 64, 32, 16, 8, 4, 2, 1. Add the ones with a 1 above them. Try the ROLLOVER bit odometer simulator to watch a counter roll bit by bit.",
        flagHash: "b395eadc8a2f146c77446033b7f2f43e5657307e7062fa8808cacbf38b7bf516" }
    ] },

  { id: "ap-m3-arithmetic", module: 3, title: "Bit Arithmetic", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Binary addition & subtraction. Using 8-bit binary, solve all three and submit the three decimal answers in order:\n1) 0000 1101 + 0000 0011 = ?\n2) 0001 0011 − 0000 0111 = ?\n3) 1111 1111 + 0000 0001 = ? (what does an 8-bit register show after this overflows?)\n\nSubmit as flag{a,b,c}.",
        hint: "Add/subtract the decimal values first, then think about what happens when a sum can't fit in 8 bits — try the Add & Subtract mode in the ROLLOVER simulator.",
        flagHash: "3dcdbd576e1349bd4e68101bb7942ea0e83eab82c1f0cc4334babbb5068fe13b" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Representing negative numbers. 8-bit two's complement. Submit the three answers in order:\n1) What unsigned byte value (0-255) represents −5?\n2) What signed decimal value does the byte 1111 1001 represent?\n3) What unsigned byte value (0-255) represents −1?\n\nSubmit as flag{a,b,c}.",
        hint: "Two's complement: invert every bit, then add 1. Try the Negative Numbers mode in ROLLOVER to watch the invert-then-add-1 steps.",
        flagHash: "4d9daaa12af1073567a25f12f74b3a15a2019a281568374786859bf480a30f65" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Binary fractions. Using a fixed-point byte split into 4 whole bits and 4 fraction bits (each fraction bit worth 1/2, 1/4, 1/8, 1/16), submit the three decimal answers in order:\n1) Fraction bits 1010 alone = ? (as a decimal fraction)\n2) Byte 0011 0100 (whole 0011, fraction 0100) = ?\n3) Byte 0000 1111 plus one more 1/16 step = ?\n\nSubmit as flag{a,b,c}.",
        hint: "Each fraction bit is worth half the one before it, same as each whole bit is worth double the one before it. Try the Fractions mode in ROLLOVER.",
        flagHash: "780b274a22b7f4b041794f6cbc1ff4265dceb7816e0ba777b293deab372d497f" }
    ] },

  { id: "ap-m3-vocab", module: 3, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["binary","bit","byte","pixel","rgb","lossy","lossless","overflow","sampling","analog","digital"],
    hardMode: "speedmatch" },

  { id: "ap-m3c", module: 3, title: "Creative Commons & Intellectual Property", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Legal & ethical concerns. The legal protection automatically giving a creator control over their original work is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Automatically granted the moment you create something original.",
        flagHash: "c2fca2aa3a976ccd7b980318e0416b0de4120f989284cb7d5e93672622407bbc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Open licensing. A set of licenses that let creators specify exactly how others may reuse their copyrighted work (attribution, noncommercial, share-alike, etc.) is called ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Two words, both capitalized in the reading — the license family this unit studies by name.",
        flagHash: "d37736c48f4f76f0a15eb3c630bd196cc1b058270500fda618fbfcbda6d70404" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Legal & ethical concerns. Using someone's copyrighted image or media without permission or a valid license is called copyright ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Violating someone's copyright.",
        flagHash: "6176b0aaf1a76ba74f2f56d34f7b628861dd5e83af8b840bd221e1c2dbe6ab74" }
    ] },

  { id: "ap-m3d", module: 3, title: "Unicode vs. ASCII", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Character encoding. The character encoding standard broad enough to represent virtually every writing system in the world is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The modern, universal standard — replaced the older, narrower one.",
        flagHash: "2fcf76a4c3c75b1fb5288d83d62dd114dc556d16fba206ab35d38bfe294a2857" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Character encoding. The older, more limited 7-bit character encoding standard, covering mainly English letters, numbers, and symbols, is called ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "The narrower, older 7-bit standard — an acronym.",
        flagHash: "c543ece81605c7d202121c62080a0db4020fc2c75bfac35d101d7f3e93c93949" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Bit patterns & encoding limits. Since this older standard uses 7 bits per character, how many unique characters can it represent in total?\n\nSubmit as flag{number}.",
        hint: "2 raised to the power of 7.",
        flagHash: "2747b7c718564ba5f066f0523b03e17f6a496b06851333d2d59ab6d863225848" }
    ] },

  { id: "ap-m3e", module: 3, title: "Floating Point Numbers", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Representing numbers. Numbers with a fractional or decimal part, represented in binary using a set number of bits, are called ___ point numbers.\n\nSubmit as flag{word} (lowercase).",
        hint: "The decimal point can 'float' to different positions depending on the number's size.",
        flagHash: "f354e0229976f2251b0f37534999f0ecf5b25ebbfd0194f2f2395ed6bd075b24" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Limits of representation. Because only a fixed number of bits are available, a floating point number is sometimes stored as the closest value the format CAN represent, not the exact value. This small loss of precision is called a ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "The stored value gets 'rounded' to the nearest representable one.",
        flagHash: "44f98dc3dbbcf910e7aed46be0050da71411e35d071eaefdda0af168a2d7de80" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Why floating point exists. Using the SAME fixed number of bits, floating point representation trades perfect precision for the ability to represent both very large and very tiny numbers — in other words, it maximizes ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "How far the representable values stretch, from smallest to largest.",
        flagHash: "2269c0be009b610cfdbb8cfe9253ad37cf95062fb3f5a7560268ff259ea9f087" }
    ] },

  { id: "ap-m3f", module: 3, title: "Discrete vs. Continuous Data", category: "Digital Media", type: "match", points: 150,
    intro: "Objective — Data representation. Match each kind of data to its category. Tap the example, then tap its category.",
    pairs: [
      { left: "Number of students in a classroom", right: "Discrete" },
      { left: "Outdoor temperature over a day", right: "Continuous" },
      { left: "A count of pixels in an image", right: "Discrete" },
      { left: "The exact pitch of a musical note", right: "Continuous" }
    ] },

  { id: "ap-m3g", module: 3, title: "Digitizing Audio", category: "Digital Media",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Digitization. Measuring an analog sound wave's amplitude at fixed time intervals, to turn it into digital data, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Measuring at set intervals.",
        flagHash: "52630e4131f9862ea34c8ded9741fae2176c56c55c74827b2bd30cd1ef9eb37b" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Digitization. The number of samples taken per second when digitizing audio is called the sample ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Measured in samples per second.",
        flagHash: "c549779d79e5c8e9c9a6b6da5f1c5e21075eb9319852f858acb227ee855e4ef5" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Trade-offs in digitization. If the sample rate is doubled while the bit depth and length of a recording stay the same, what happens to the resulting file size?\n\nSubmit as flag{word} (lowercase) — e.g. doubles, halves, or stays the same.",
        hint: "Twice as many samples are captured every second.",
        flagHash: "117079a22e1ed790d17d349adcd1082c40f4f9f6406f88c33d6100318aa22c80" }
    ] },

  /* MODULE 4 — Data Science ───────────────────────────────────────────────── */
  { id: "ap-m4a", module: 4, title: "Working with Data", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data. Data that describes other data (like a photo's date and location) is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Data ABOUT data.",
        flagHash: "951adea39b54dd0ebb4028b560b787f549cddb92c4c371855307423c2a2db29f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Extracting information. The process of finding patterns and insight in large datasets is called ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Searching large datasets for patterns and relationships that weren't obvious up front. Two words.",
        flagHash: "20465803c21ec72cd8005f51cc1c29308ee7f2c511f6e762ca64034c7856b56d" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Interpreting data. When two variables move together — but one may not cause the other — they have a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Two variables move together — but that alone never proves one caused the other.",
        flagHash: "5c7b7344aa29cc2ab410ed1e5b50a8f34f93bb7fc9b3970d7491e17b23a4cd61" }
    ] },

  { id: "ap-m4b", module: 4, title: "From Data to Insight", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Communicating data. A visual representation of data, such as a chart or graph, is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A chart or graph.",
        flagHash: "47bb0ddef0134666d7282a9c34f8ef22d613c726b7f32afbbaf0809301ebff0f" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Data structures. A single row of related values in a dataset is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "In a dataset, one complete entry: all the fields describing a single item.",
        flagHash: "19cd766d63f78bffe0d7bee6492d61713c7225f59bcd7fe9102e035cd06ede9b" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Impact of computing. Unfair outcomes produced by an algorithm, often reflecting bias in its data or design, are called ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Unfair from the data/design.",
        flagHash: "33fb434e43266febfbb3a3dffe4230989451359a5b85ce9cc0cb4a1bbb1f0201" }
    ] },

  { id: "ap-m4-terms", module: 4, title: "Match the Data Term", category: "Data Science", type: "match", points: 150,
    intro: "Objective — Data. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "Metadata", right: "Data about data" },
      { left: "Dataset", right: "A collection of related data" },
      { left: "Visualization", right: "A chart or graph of data" },
      { left: "Data mining", right: "Finding patterns in big data" }
    ] },

  { id: "ap-m4-process", module: 4, title: "The Data Analysis Process", category: "Data Science", type: "order", points: 150,
    intro: "Objective — Using data. Order the stages of analyzing data, first to last.",
    steps: [
      "Collect the data",
      "Clean & organize it",
      "Analyze it for patterns",
      "Visualize the results",
      "Draw a conclusion"
    ] },

  { id: "ap-m4-cause", module: 4, title: "Correlation vs Causation", category: "Data Science", type: "match", points: 150,
    intro: "Objective — Interpreting data. Decide whether each pair shows causation or just correlation. Tap the scenario, then tap the label.",
    pairs: [
      { left: "Ice cream sales and sunburns both rise in summer", right: "Correlation only" },
      { left: "Pressing the gas pedal speeds up the car", right: "Causation" },
      { left: "More firefighters appear at bigger fires", right: "Correlation only" },
      { left: "Heating water makes it boil", right: "Causation" }
    ] },

  { id: "ap-m4-vocab", module: 4, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["data","metadata","dataset","visualization","correlation","pattern","information","bias","record"],
    hardMode: "blitz" },

  { id: "ap-m4c", module: 4, title: "Data Persistence & Breaches", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Storing data. Data that continues to exist in storage even after the program or device that created it is closed is called ___ data.\n\nSubmit as flag{word} (lowercase).",
        hint: "It 'persists' after the program ends.",
        flagHash: "75b07bb3ffb3b8ad63e79b983fbef8fd0ee8e7292144b4e7d3b57bd682074087" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Data security. Unauthorized access to sensitive stored data is called a data ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Companies send you a notice when this happens to their servers.",
        flagHash: "2e02fd39b865c1f21791c46d1f651a636dbb10a60501d49c75ca5a821cdca293" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Privacy risk. Collecting far more personal data than a service actually needs to function — which increases the damage if that data is ever breached — is called data ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Gathering more than necessary — the opposite of data minimization.",
        flagHash: "35e238b516ac3226f6dce875a3bbe2f3db1f7f79142fabf96d77d6f0589dfbd7" }
    ] },

  { id: "ap-m4d", module: 4, title: "Unstructured Data & Screenscraping", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data organization. Data that doesn't fit neatly into rows and columns, like free-form text, photos, or video, is called ___ data.\n\nSubmit as flag{word} (lowercase).",
        hint: "The opposite of a clean spreadsheet.",
        flagHash: "5d660f58c55044ba75373b9d433488d5fb0f1519663b2ed6eb2628e247c7ebca" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Collecting data. Automatically pulling data straight off a website's visual display, rather than through an official API, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "'Scraping' data off the screen.",
        flagHash: "39e2426d485561b2a02b341f5d80dd9fa188647dc7c9e6758911827a028a0ab7" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Privacy vs. utility. Making a dataset more useful for analysis often means collecting more personal detail about each person in it — which increases the risk to individual ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The thing that goes down as usefulness goes up.",
        flagHash: "a4cc6bc01a927e2a78fd3bec51e865ac0d85e4daab6f988d5d33d056e125b1c3" }
    ] },

  { id: "ap-m4e", module: 4, title: "Anomaly Detection", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Data analysis. A data point that differs significantly from the rest of a dataset is called an ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It stands out from the pattern.",
        flagHash: "2aed12b734be9cf4a09a1f9f0dd96b7245af53861591373fcc414496094a9203" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Data analysis. Automatically flagging unusual patterns in data — often used to catch credit card fraud — is called ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Spotting the outlier automatically.",
        flagHash: "640c8c703e09890e329f6f78cb894a58811a36a07faf8ff52461673ecc096d22" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Spotting an outlier. Given the dataset [12, 14, 13, 15, 95, 14, 13], which value is the outlier?\n\nSubmit as flag{number}.",
        hint: "Every other value clusters tightly between 12 and 15 — one value doesn't.",
        flagHash: "ad48ff99415b2f007dc35b7eb553fd1eb35ebfa2f2f308acd9488eeb86f71fa8" }
    ] },

  { id: "ap-m4f", module: 4, title: "Models & Simulations", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Modeling. A simplified representation of a real-world system, built to study how it behaves, is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "A simplified stand-in for something real.",
        flagHash: "9372c470eeadd5ecd9c3c74c2b3cb633f8e2f2fad799250a0f70d652b6b825e4" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Modeling. Running a model forward over time to predict how a real system will behave under different conditions is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Weather forecasting relies heavily on this.",
        flagHash: "32e4bc02a7ccf34d72692db7f08aa945102e290beb4832d5673b987015d8cb4f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Limits of models. Because a model is always a simplification, its results are only as trustworthy as the ___ it was built on — leave out a real-world factor, and the model's predictions can mislead.\n\nSubmit as flag{word} (lowercase).",
        hint: "What you assumed to be true when you built the model.",
        flagHash: "3df701b1e5b876b215d9ccdc7219d51151063b291cb9b40205151ad87f27af07" }
    ] },

  { id: "ap-m4g", module: 4, title: "Crowdsourcing & Human Computation", category: "Data Science",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Collecting data. Gathering input, work, or data from a large group of people, often over the Internet, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The 'crowd' does the work.",
        flagHash: "9684a5a18d1dd52c4749ea0b8a0595cc9a990676b2c21ce8e5d49be2cef9c08a" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Human computation. reCAPTCHA challenges (like picking every image with a street sign) double as this: using human responses to solve problems computers struggle with, like training computer vision. This is called ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Humans doing the computing a machine can't do alone — two words.",
        flagHash: "db67da5acf9a3678cc770736a981b66d832fb6a6907f6530ab75b39805025251" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Why crowdsourcing works at scale. A single reCAPTCHA click barely trains an image model at all — but across millions of users solving millions of puzzles, the ___ of small contributions adds up to something powerful.\n\nSubmit as flag{word} (lowercase).",
        hint: "What you get from adding up many small pieces.",
        flagHash: "09f5ffef28309853265c4a98d0e56e1be522b6b402d8193594fd05103064fc6a" }
    ] },

  /* MODULE 5 — Creative Task ──────────────────────────────────────────────── */
  { id: "ap-m5a", module: 5, title: "The Create Task", category: "Creative Task",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Create task. A reusable, named block of code you define and then call — required in your Create task — is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You define it and call it.",
        flagHash: "8ef136b7b8cfb6826481421ced7380c6510c96907c8be29186a98d0350ad5dc6" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Create task. Repeating a group of steps over and over — a loop — is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Repeating a block of code. `for` and `while` loops are how you implement it.",
        flagHash: "016b907a6d4b6c8248bcf86c2c60ef48b479727ef339134e33cf65d5c31de7f2" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Managing complexity. Using a procedure by knowing WHAT it does (not HOW) is called procedural ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Hiding complexity behind a simple interface, so you work with ideas instead of implementation details.",
        flagHash: "5f46d98c4b621039b59b05e84990cc59fe9e4718c08603506addf49eb8fba318" }
    ] },

  { id: "ap-m5b", module: 5, title: "Program Development", category: "Creative Task",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Program development. Finding and fixing the errors in your Create task program is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Fixing errors.",
        flagHash: "efb06198e6e5cd8e7b538892ca4d81813a637d0ec4e0328de1d4fa1b33c994e9" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Collaborative development. Developing a program with others, sharing ideas and code, is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Two or more people working jointly on a program — a required practice in the AP CSP Create task.",
        flagHash: "700d24eb67ab73345e98d37570da4844866f5feb4a140e1a5c7469edd0a5d152" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Problem solving. Breaking a large problem into smaller, manageable parts is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Splitting a large problem into smaller pieces that can each be solved independently.",
        flagHash: "e9f8cf8d0fecfef89a4c7133b1ff4860a8c16c12d37b7f0e4054a4d72a298349" }
    ] },

  { id: "ap-m5-reqs", module: 5, title: "Create Task Requirements", category: "Creative Task", type: "match", points: 150,
    intro: "Objective — Create performance task. Match each required element to what it is. Tap the element, then tap its description.",
    pairs: [
      { left: "A student-defined procedure with a parameter", right: "Procedure" },
      { left: "A list used to manage complexity", right: "List / collection" },
      { left: "Code that repeats", right: "Iteration" },
      { left: "Code that makes a decision", right: "Selection" }
    ] },

  { id: "ap-m5-develop", module: 5, title: "Develop Your Program", category: "Creative Task", type: "order", points: 150,
    intro: "Objective — Program development. Order the steps of developing your Create task program, first to last.",
    steps: [
      "Plan and design the program",
      "Write the code in pieces",
      "Test each part as you go",
      "Debug the errors you find",
      "Document how it works"
    ] },

  { id: "ap-m5-practice", module: 5, title: "Match the Development Practice", category: "Creative Task", type: "match", points: 150,
    intro: "Objective — Collaborative development. Match each practice to its name. Tap the description, then tap the practice.",
    pairs: [
      { left: "Breaking a problem into smaller parts", right: "Decomposition" },
      { left: "Building and testing a small version first", right: "Prototyping" },
      { left: "Working with a partner and sharing ideas", right: "Collaboration" },
      { left: "Explaining your code in comments", right: "Documentation" }
    ] },

  { id: "ap-m5-vocab", module: 5, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["procedure","abstraction","list","iteration","selection","debugging","parameter","collaboration","decomposition"],
    hardMode: "cipher" },

  /* MODULE 6 — Innovative Technologies ────────────────────────────────────── */
  { id: "ap-m6a", module: 6, title: "The Internet", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — The Internet. The series of connections a message travels between a sender and a receiver is called the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Sender → receiver route.",
        flagHash: "f031898a9e65b21a19d56b7bc981d2504488e89447c54553b081bcb0c9db4d62" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — The Internet. The maximum amount of data that can be sent in a fixed time, measured in bits per second, is the ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The maximum rate data can move through a connection, measured in bits per second.",
        flagHash: "77e4264534b53033ae287d5aa06050d5c54b8e5a277adff36836f354166773b0" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Data on the Internet. Data is broken into small units that travel the network independently and are reassembled at the destination. These units are called ___.\n\nSubmit as flag{word} (lowercase, plural).",
        hint: "Data doesn't cross the internet as one stream — it's split into numbered chunks that may take different routes and get reassembled.",
        flagHash: "d72445caf6705d8834acab494b7bb0f97e67d1d9f5f928503f0ab47c050f1bf2" }
    ] },

  { id: "ap-m6b", module: 6, title: "Cybersecurity & Impact", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Safe computing. Requiring at least two steps to log in is called multi-factor ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Proving who you are.",
        flagHash: "0167e5432d777913fc23dc379d9f68c4f023af44904180c8c33935af6a833a09" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Encryption. Encryption that uses a public key to encrypt and a private key to decrypt is called ___ ___ ___.\n\nSubmit as flag{three words} (lowercase).",
        hint: "Public locks, private unlocks.",
        flagHash: "72a68bdde2444495e13dc3ad82b311ea6342e1133a6508841306fff8b727247f" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Safe computing. Software intended to damage a system or gain unauthorized access is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The umbrella term covering viruses, worms, trojans, spyware, and ransomware.",
        flagHash: "2aedb3e75aad5e62f6ca43787074f19854bee7654b92a301a6349bd0736acc44" }
    ] },

  { id: "ap-m6-net", module: 6, title: "Match the Network Term", category: "Innovative Technologies", type: "match", points: 150,
    intro: "Objective — The Internet. Match each term to its meaning. Tap a term, then tap its meaning.",
    pairs: [
      { left: "Computing device", right: "A single machine that runs programs" },
      { left: "Computing network", right: "Devices connected to share data" },
      { left: "Path", right: "The route data takes end to end" },
      { left: "Bandwidth", right: "Data capacity per second" }
    ] },

  { id: "ap-m6-send", module: 6, title: "Send Data Across the Internet", category: "Innovative Technologies", type: "order", points: 150,
    intro: "Objective — Data on the Internet. Order what happens when data is sent across the Internet, first to last.",
    steps: [
      "Break the data into packets",
      "Address each packet",
      "Route packets across the network",
      "Packets may take different paths",
      "Reassemble the packets at the destination"
    ] },

  { id: "ap-m6-spot", module: 6, title: "Spot the Red Flags", category: "Innovative Technologies", type: "spot", points: 150,
    intro: "Objective — Safe computing. This email is a phishing attempt. Click every element that is a red flag — the sender, the subject, the link, and anything suspicious in the body. Click again to deselect, then submit. Find them all and select nothing safe.",
    items: [{"field":"from","text":"support@","click":false},{"field":"from","text":"g00gle-accounts.co","click":true,"bad":true},{"field":"subject","text":"ACTION REQUIRED: ","click":true,"bad":true},{"field":"subject","text":"Verify your account","click":false},{"field":"subject","text":" within 24 hours or it will be deleted","click":true,"bad":true},{"field":"body","text":"Dear User,\n\n","click":true,"bad":true},{"field":"body","text":"We detected a new sign-in to your account. ","click":false},{"field":"body","text":"To keep your account active you must confirm your identity now: ","click":false},{"field":"body","text":"http://google-verify-login.co/secure","click":true,"bad":true,"link":true},{"field":"body","text":"\n\nEnter your ","click":false},{"field":"body","text":"username, password, and recovery phone number","click":true,"bad":true},{"field":"body","text":" to continue.\n\nThanks,\nThe Accounts Team","click":false}] },

  { id: "ap-m6-vocab", module: 6, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["network","internet","packet","bandwidth","path","encryption","authentication","protocol","device"],
    hardMode: "wordsearch" },

  { id: "ap-m6c", module: 6, title: "Social Networking & Search", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Innovative technologies. A web service that lets users build a profile and connect with other people online is a ___ network.\n\nSubmit as flag{word} (lowercase).",
        hint: "The kind of network Instagram or Facebook is.",
        flagHash: "3e860f41a5ea92c49803d6ec96d452693b6dcefb0e8c0bf0125b0e3debac5281" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Innovative technologies. Software that crawls, indexes, and ranks web pages so users can find information is called a search ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Google is one of these.",
        flagHash: "ed9f6f25068608efd412958da4dfc19328ca3511251fa6d5f9c42baf230e32f8" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Impact of computing. Personalizing search and social results based only on your past clicks can trap you in a narrow, one-sided view of information. This effect is called a filter ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "You're stuck inside it, only seeing what confirms your existing views.",
        flagHash: "df4ac416257333cf770e5b162da9c2a06b37e428d0a4035ec3a0f114df08d231" }
    ] },

  { id: "ap-m6d", module: 6, title: "Cloud Computing", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Innovative technologies. Storing and processing data on remote servers accessed over the Internet, instead of on your own local device, is called ___ computing.\n\nSubmit as flag{word} (lowercase).",
        hint: "Named after where the servers seem to be, from a user's point of view.",
        flagHash: "56681010b753e1abe52c449d0aab291b28f1808a3a91b6baeaa726883baad4b0" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Cloud computing. A key benefit of cloud computing is the ability to increase or decrease the amount of computing resources you use on demand. This benefit is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Resources can scale up or down to match demand.",
        flagHash: "5433943468150b2698dbb83989d3a425bf8bb11ac271b99b9ce6a81c111429dd" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Risks of cloud computing. Keeping your only copy of important data with a single cloud provider means that if their service goes down, you lose access entirely. This risk is called a single point of ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "One weak spot that can bring the whole system down.",
        flagHash: "16d34b5e7bcb341ee6cb3d16495d90e93fbe57c46d3827432613210a24ebca30" }
    ] },

  { id: "ap-m6e", module: 6, title: "The Digital Divide", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Impact of computing. The gap between people who have reliable access to computing and the Internet and those who don't is called the ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Access, not ability — two words.",
        flagHash: "ead2d27a35a7a7b50487955b3fc899c32b5552744c35b5297ae36db15c169969" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Impact of computing. Beyond just owning a device, a major factor in the digital divide is whether someone has fast, reliable, always-on Internet, called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The kind of high-speed connection cable or fiber internet provides.",
        flagHash: "7577bf4f5683bf6cc6ce6324381b36449961897cc37140d2171d5953244fb6e5" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Impact of computing. Even with a device and Internet access, someone who lacks the skills and knowledge to use technology effectively still faces a digital ___ gap.\n\nSubmit as flag{word} (lowercase).",
        hint: "Knowing how to read, evaluate, and use technology and information — a skill, not a connection.",
        flagHash: "578756ca4aa16d8872610a5aaa78460fd30fbe93379ff7284fe65d66ca606755" }
    ] },

  { id: "ap-m6f", module: 6, title: "Network Infrastructure", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Computing systems & networks. A device that connects multiple devices within a local network and directs data between them is a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The box in your house that your WiFi comes from.",
        flagHash: "74c95604043427f0bee1d0e16bfa53afd537f736ad0073c4cc4e1ccb3a82b5dc" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Computing systems & networks. A set of agreed-upon rules that governs how devices communicate over a network is called a ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "HTTP and TCP are both examples of this kind of rule set.",
        flagHash: "2ea88c7a30351b12a4dcfc06cdce2af6eab18416176466c2500cb6ef74f745bf" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — The Internet. The unique numerical address assigned to a device so it can be located and reached on a network is its ___ address.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Two letters.",
        flagHash: "bb9af5d1915da1fbc132ced081325efcd2e63e4804f96890f42e9739677237a4" }
    ] },

  { id: "ap-m6g", module: 6, title: "TCP & the Domain Name System", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — The Internet. The protocol responsible for breaking data into packets, sending them, and reliably reassembling them at the destination is abbreviated ___.\n\nSubmit as flag{abbreviation} (lowercase).",
        hint: "Three letters, works alongside IP.",
        flagHash: "00645195b93272275b50a6c935a23fb62e3e793e8476e83414fed0fcdfee8b41" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — The Internet. The system that translates human-readable domain names, like example.com, into the numerical IP addresses computers actually use, is called the ___ ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Three words — the initials are DNS.",
        flagHash: "b74a800b9bcb288c4abedf397719f14b5e0fa9528480188b4c138ffa87ca0648" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Tracing how the Internet resolves a name. In order, once you type a domain name and hit enter: 1) your browser asks a DNS resolver to look it up, 2) the resolver returns the matching ___, 3) your browser connects directly to that address to load the page.\n\nSubmit as flag{abbreviation} (lowercase) — what does the resolver hand back?",
        hint: "The numerical address DNS exists to look up.",
        flagHash: "bb9af5d1915da1fbc132ced081325efcd2e63e4804f96890f42e9739677237a4" }
    ] },

  { id: "ap-m6h", module: 6, title: "IoT & the World Wide Web", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Innovative technologies. A network of everyday physical devices, like thermostats, cameras, and appliances, connected to the Internet is called the Internet of ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The last word of the acronym IoT.",
        flagHash: "7e1ddfc85ae45a95330209c0834c59876011aa587be693354cbd1f40bf637fcd" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — The Internet. The system of linked, browsable documents — web pages — accessed over the Internet using HTTP is called the ___ ___ ___.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "Its initials are WWW.",
        flagHash: "8000e3df3a19f57b48268f5e2970ff5d6566ce8f0b93c49b58d1f02360e4960a" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Distinguishing the Internet from the Web. The Internet is the physical network of connected devices; the World Wide Web is a ___ that runs on top of that network, made of linked documents.\n\nSubmit as flag{word} (lowercase).",
        hint: "It USES the Internet — it isn't the same thing as the Internet.",
        flagHash: "9df6b026a8c6c26e3c3acd2370a16e93fffdc0015ff5bd879218788025db0280" }
    ] },

  { id: "ap-m6i", module: 6, title: "Restricted Information & Attacks", category: "Innovative Technologies",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Safe computing. Information whose access is limited to specific authorized individuals or groups, like medical or financial records, is called ___ information.\n\nSubmit as flag{word} (lowercase).",
        hint: "Not everyone is allowed to see it.",
        flagHash: "7a0d91593df9293a8942f7438cb88f7ab1a8e354da491f567f9939b1303920f5" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Safe computing. Software that secretly monitors a user's activity and collects their information without consent is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "It 'spies' on you.",
        flagHash: "7fefe28ac7f684e6ec95aead061566a0a6a5bf89d6e88a13e81b806b10f9fe59" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Safe computing. An attacker floods a server with so much traffic that it can no longer respond to legitimate users. This is called a ___ ___ ___ attack.\n\nSubmit as flag{words_with_underscores} (lowercase).",
        hint: "The server is denied the ability to provide its service — three words, initials DoS.",
        flagHash: "7bcd0ddec6a82ca90db043c583c1920c18514aa350cfb900d92b8c4d11bab3cb" }
    ] },

  { id: "ap-m6-dns-order", module: 6, title: "Resolve a Domain Name", category: "Innovative Technologies", type: "order", points: 150,
    intro: "Objective — The Internet. Order the steps of resolving a domain name to load a web page, first to last.",
    steps: [
      "Type a domain name into the browser",
      "Browser asks a DNS resolver to look it up",
      "DNS resolver returns the matching IP address",
      "Browser connects to that IP address",
      "Server sends back the page to display"
    ] },

  /* MODULE 7 — AP Test Prep ───────────────────────────────────────────────── */
  { id: "ap-m7a", module: 7, title: "Big Ideas Review", category: "AP Test Prep",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Exam review. Focusing on the main idea while hiding unnecessary detail is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Big Idea: hide detail.",
        flagHash: "5f46d98c4b621039b59b05e84990cc59fe9e4718c08603506addf49eb8fba318" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Impact of computing. Unfair outcomes an algorithm produces from biased data or design are called ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "When a program consistently produces unfair outcomes for certain groups, usually because of the data it learned from. Two words.",
        flagHash: "33fb434e43266febfbb3a3dffe4230989451359a5b85ce9cc0cb4a1bbb1f0201" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Limits of computing. A problem for which no algorithm can always give a correct yes-or-no answer is an ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "No algorithm always solves it.",
        flagHash: "cd4a6cfa66451259418f739dd07b3af5a808199ad188962c4a1fd5601452278e" }
    ] },

  { id: "ap-m7b", module: 7, title: "Impact & Ethics", category: "AP Test Prep",
    levels: [
      { difficulty: "Easy", points: 50,
        prompt: "Objective — Impact of computing. The gap between those who have and don't have access to computing and the Internet is called the ___ ___.\n\nSubmit as flag{two words} (lowercase).",
        hint: "Access gap.",
        flagHash: "d8fa93bf49fa28a40b4c5590601ff707113aa1e8a2b36e90b81f65ca26f535b6" },
      { difficulty: "Medium", points: 100,
        prompt: "Objective — Ethics. Using someone else's work or ideas without giving credit is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "Using work without credit.",
        flagHash: "f709be5464275b66e613b5272c81893bb659664920fecbcf82e34d2b46aa6d64" },
      { difficulty: "Hard", points: 150,
        prompt: "Objective — Legal & ethical concerns. The legal protection giving creators control over their original work is called ___.\n\nSubmit as flag{word} (lowercase).",
        hint: "The legal protection automatically granted to a creator over their original work. Creative Commons licenses modify it.",
        flagHash: "7b5d1a4db073d1358859d752555b4ef945495a103b90146d503aff0e3f751a55" }
    ] },

  { id: "ap-m7-bigideas", module: 7, title: "Match the Big Idea", category: "AP Test Prep", type: "match", points: 150,
    intro: "Objective — Exam review. Match each AP CSP Big Idea to what it covers. Tap a Big Idea, then tap its focus.",
    pairs: [
      { left: "Creative Development", right: "Collaboration & program design" },
      { left: "Data", right: "Turning data into information" },
      { left: "Algorithms & Programming", right: "Building & reasoning about code" },
      { left: "Computing Systems & Networks", right: "How the Internet moves data" },
      { left: "Impact of Computing", right: "Benefits & harms to society" }
    ] },

  { id: "ap-m7-binsearch", module: 7, title: "Run a Binary Search", category: "AP Test Prep", type: "order", points: 150,
    intro: "Objective — Algorithms. Order the steps of a binary search on a sorted list, first to last.",
    steps: [
      "Start at the middle of the sorted list",
      "Compare the target to the middle value",
      "Discard the half it cannot be in",
      "Repeat on the remaining half",
      "Stop when found or the list is empty"
    ] },

  { id: "ap-m7-time", module: 7, title: "Reasonable vs Unreasonable Time", category: "AP Test Prep", type: "match", points: 150,
    intro: "Objective — Algorithmic efficiency. Sort each run time as reasonable or unreasonable. Tap the run time, then tap its category.",
    pairs: [
      { left: "Constant (1)", right: "Reasonable" },
      { left: "Linear (n)", right: "Reasonable" },
      { left: "Quadratic (n²)", right: "Reasonable" },
      { left: "Exponential (2ⁿ)", right: "Unreasonable" },
      { left: "Factorial (n!)", right: "Unreasonable" }
    ] },

  { id: "ap-m7-vocab", module: 7, title: "Vocabulary Recall", category: "Vocabulary", type: "vocab",
    bias: ["abstraction","algorithm","data","internet","efficiency","bias","undecidable","copyright","divide"],
    hardMode: "cipher" }

  ]
};



/* ============================================================
   BYTE BOUNTY CHALLENGES (AP CSP) — guide ADA, mentor mode.
   2 leveled text flags + 3 interactive captures + vocab per module.
   ============================================================ */


window.COURSE_CONFIG.apcsp.ctf.moduleFrameworks = {
  1: { ap: { unit: 1, bigIdeas: [1,3,6], standards: ["CRD-1.C","CRD-2.E","CRD-2.F","DAT-2.E","AAP-2.A","AAP-2.B","AAP-2.G","AAP-2.J","AAP-2.L","AAP-2.M","AAP-4.A","AAP-4.B","IOC-1.B","IOC-1.D","IOC-1.F","IOC-2.A","IOC-2.B"] },
     pa: { standards: ["1B-AP-08","2-AP-10","3A-NI-05","3A-NI-06","3A-NI-08","3A-DA-10","3A-AP-13","3A-AP-15","3A-AP-16","3A-AP-19","3A-AP-21","3A-AP-22","3A-IC-25","3A-IC-28","3A-IC-30","3B-AP-11"] } },
  2: { ap: { unit: 2, bigIdeas: [1,3], standards: ["CRD-2.F","CRD-2.I","DAT-1.A","DAT-1.B","AAP-1.A","AAP-1.B","AAP-1.C","AAP-1.D","AAP-2.B","AAP-2.C","AAP-2.D","AAP-2.H","AAP-2.K","AAP-2.M","AAP-3.A","AAP-3.B","AAP-3.C","AAP-3.D"] },
     pa: { standards: ["3A-AP-13","3A-AP-14","3A-AP-15","3A-AP-16","3A-AP-17","3A-AP-18","3A-AP-19","3A-AP-20","3A-AP-22","3B-AP-10","3B-AP-11","3B-AP-14","3B-AP-16","3B-AP-20"] } },
  3: { ap: { unit: 3, bigIdeas: [1,2,3,5], standards: ["CRD-1.C","CRD-2.F","CRD-2.I","DAT-1.A","DAT-1.D","AAP-1.A","AAP-1.B","AAP-1.D","AAP-2.B","AAP-2.C","AAP-2.D","AAP-2.E","AAP-2.H","AAP-2.K","AAP-2.M","AAP-2.O","AAP-3.A","AAP-3.B","AAP-3.C","AAP-3.D","IOC-1.F"] },
     pa: { standards: ["3A-AP-13","3A-AP-14","3A-AP-15","3A-AP-16","3A-AP-17","3A-AP-18","3A-AP-21","3A-DA-09","3A-IC-24","3A-IC-28"] } },
  4: { ap: { unit: 4, bigIdeas: [1,2,3,5], standards: ["DAT-2.A","DAT-2.B","DAT-2.C","DAT-2.E","IOC-1.E","IOC-1.F","IOC-2.A"] },
     pa: { standards: ["3A-DA-10","3A-DA-11","3A-DA-12","3A-IC-24","3A-IC-28","3A-IC-29","3A-IC-30"] } },
  5: { ap: { unit: 5, bigIdeas: [1,2,3,4,5], standards: ["CRD-2.A","CRD-2.B","CRD-2.C","CRD-2.D","CRD-2.E","CRD-2.F","CRD-2.G","CRD-2.H","CRD-2.I","AAP-1.D","AAP-2.H","AAP-2.K","AAP-2.M","AAP-2.O","AAP-3.B","AAP-3.C"] },
     pa: { standards: [] } },
  6: { ap: { unit: 6, bigIdeas: [1,2,3,4,5], standards: ["CRD-1.A","CRD-1.B","CRD-2.A","CRD-2.C","CRD-2.D","DAT-2.A","DAT-2.C","DAT-2.E","AAP-1.A","CSN-1.A","CSN-1.B","CSN-1.C","CSN-1.D","CSN-1.E","CSN-2.A","CSN-2.B","IOC-1.A","IOC-1.C","IOC-1.F","IOC-2.A","IOC-2.B"] },
     pa: { standards: ["1B-NI-04","1B-NI-05","2-NI-04","2-NI-05","2-IC-20","2-IC-23","3A-NI-04","3A-NI-05","3A-NI-06","3A-NI-08","3A-DA-10","3A-DA-12","3A-AP-11","3A-AP-13","3A-AP-14","3A-AP-16","3A-AP-22","3A-IC-24","3A-IC-26","3A-IC-27","3A-IC-28","3A-IC-29","3A-IC-30","3B-NI-03","3B-NI-04","3B-DA-05","3B-AP-18","3B-IC-25","3B-IC-26"] } },
  7: { ap: null, pa: null }
};

window.COURSE_CONFIG.apcsp.ctf.bossQuestions = [{"module":1,"topic":"M1","diff":"Easy","kind":"mc","prompt":"You need to find one name in an alphabetically sorted contact list of 1,000 people as fast as possible. Which algorithm is best?","choices":["Binary search","Linear search","Random guessing","Bubble sort"],"answer":"Binary search"},{"module":1,"topic":"M1","diff":"Medium","kind":"mc","prompt":"A task takes 60 seconds run sequentially and 20 seconds run in parallel. What is the speedup?","choices":["3","40","80","1/3"],"answer":"3"},{"module":2,"topic":"M2","diff":"Easy","kind":"text","prompt":"In Python, what keyword defines a function? (one word)","answer":"def"},{"module":2,"topic":"M2","diff":"Medium","kind":"mc","prompt":"A program runs with no crash but always prints the wrong total. What kind of error is this?","choices":["Logic error","Syntax error","Overflow error","Runtime crash"],"answer":"Logic error"},{"module":3,"topic":"M3","diff":"Easy","kind":"text","prompt":"How many bits are in one byte? (number)","answer":"8"},{"module":3,"topic":"M3","diff":"Medium","kind":"mc","prompt":"You want to email a photo but keep every original detail with no quality loss. Which should you use?","choices":["Lossless compression","Lossy compression","Sampling","An overflow"],"answer":"Lossless compression"},{"module":4,"topic":"M4","diff":"Medium","kind":"mc","prompt":"Ice cream sales and drowning deaths both rise in July. What does this show?","choices":["Correlation, not causation","Causation","Metadata","A logic error"],"answer":"Correlation, not causation"},{"module":4,"topic":"M4","diff":"Easy","kind":"text","prompt":"Data that describes other data (like a photo's date and GPS) is called ___. (one word)","answer":"metadata"},{"module":5,"topic":"M5","diff":"Medium","kind":"mc","prompt":"Your Create task must manage complexity. Which pair BEST satisfies the requirement?","choices":["A student-made procedure + a list","Two print statements","A single variable","Only comments"],"answer":"A student-made procedure + a list"},{"module":5,"topic":"M5","diff":"Easy","kind":"text","prompt":"Breaking a big problem into smaller parts is called ___. (one word)","answer":"decomposition"},{"module":6,"topic":"M6","diff":"Easy","kind":"mc","prompt":"Data crosses the Internet in small units that can each take a different route. These are:","choices":["Packets","Pixels","Bytes only","Bandwidth"],"answer":"Packets"},{"module":6,"topic":"M6","diff":"Hard","kind":"text","prompt":"Encryption using a public key to lock and a private key to unlock is ___ ___ encryption. (two words before 'encryption')","answer":"public key"},{"module":7,"topic":"M7","diff":"Hard","kind":"mc","prompt":"Which problem type can NO algorithm always solve correctly?","choices":["Undecidable problem","Decision problem","Optimization problem","Search problem"],"answer":"Undecidable problem"},{"module":7,"topic":"M7","diff":"Medium","kind":"text","prompt":"The gap between those with and without access to computing is the digital ___. (one word)","answer":"divide"}];

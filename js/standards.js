// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
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
    "3B.IC.28": "Debate laws and regulations that impact the development and use of software.",
    "9-12.SEC.CIA":  "CIA triad — apply confidentiality, integrity, and availability to evaluate a system's security posture.",
    "9-12.SEC.COMP": "Component security — assess the security of the individual components that make up a system.",
    "9-12.DC.THRT":  "Threats — identify common cyber threats, threat actors, and the evolving threat landscape.",
    "9-12.DC.FOOT":  "Digital footprint — evaluate the trail a user leaves online and its long-term consequences.",
    "9-12.DC.PII":   "Personally identifiable information — identify PII and describe how it is protected and misused.",
    "9-12.DC.ETH":   "Cyber ethics — apply ethical principles and professional codes of conduct to computing decisions.",
    "9-12.DC.LAW":   "Law and policy — explain the laws governing computer use, access, and cybercrime.",
    "9-12.DC.AUP":   "Acceptable use — interpret and apply acceptable use policies in school and workplace settings.",
    "9-12.DC.CYBL":  "Cyberbullying and online behavior — recognize harmful online behavior and appropriate responses.",
    "9-12.CS.OS":    "Operating systems — explain the role of an operating system and administer it through GUI and CLI.",
    "9-12.CS.PROG":  "Programming — read, write, and reason about code and how machines represent and process data.",
    "9-12.CS.COMM":  "Communication and networks — describe how devices communicate across a network.",
    "9-12.CS.COMP":  "Computing systems — describe the components of a computing system and how they interact.",
    "9-12.CS.PROT":  "Protocols — explain the protocols that govern data transmission across networks.",
    "9-12.CS.SOFT":  "Software — install, manage, and evaluate software and its security implications.",
    "9-12.CS.APPS":  "Applications — use applications and databases to store, query, and manage information.",

    /* ---- AP Cybersecurity CED — learning objectives ---- */
    "LO 1.2.A": "Identify common signs of a password attack.",
    "LO 1.2.B": "Explain how adversaries take advantage of weak authentication.",
    "LO 1.2.C": "Explain how to make authentication stronger.",
    "LO 1.3.B": "Identify types of wireless cyberattacks.",
    "LO 1.3.C": "Describe actions individuals can take to increase protection of sensitive data when using the internet and Wi-Fi.",
    "LO 1.4.B": "Explain how to protect against some AI-augmented cyberattacks.",
    "LO 2.1.C": "Describe the phases of a cyberattack.",
    "LO 2.1.D": "Describe the risk assessment process.",
    "LO 2.1.E": "Identify strategies for managing risk.",
    "LO 2.1.F": "Identify types of security controls.",
    "LO 2.3.A": "Identify managerial controls related to physical security.",
    "LO 2.3.B": "Determine mitigation strategies for risks from physical vulnerabilities.",
    "LO 3.1.A": "Identify common network attacks.",
    "LO 3.1.B": "Explain how adversaries can exploit network vulnerabilities to steal, disrupt, or destroy network communication.",
    "LO 3.2.A": "Identify managerial controls related to network security.",
    "LO 3.2.B": "Configure wireless network security features.",
    "LO 3.3.A": "Identify techniques for segmenting a network.",
    "LO 3.3.B": "Explain why network segmentation can increase network security.",
    "LO 3.4.A": "Identify types of network-based firewalls.",
    "LO 3.4.B": "Explain how a firewall uses an access control list to allow or deny traffic entering or leaving a network.",
    "LO 3.4.C": "Determine the effective placement of firewalls in a network.",
    "LO 3.4.D": "Configure a firewall to manage the flow of network traffic.",
    "LO 3.5.A": "Identify types of automated security tools used to detect network attacks.",
    "LO 3.5.B": "Explain how organizations can leverage artificial intelligence (AI) to enhance threat detection and response.",
    "LO 3.5.E": "Apply detection techniques to identify indicators of network attacks by analyzing log files.",
    "LO 1.1.A–3.5.E": "Full course framework — every learning objective, LO 1.1.A through LO 3.5.E.",

    /* ---- AP Cybersecurity CED — skills ---- */
    "Skill Category 1": "Analyze Risk (25–40% of the exam).",
    "Skill Category 2": "Mitigate Risk (25–40% of the exam).",
    "Skill Category 3": "Detect Attacks (25–40% of the exam).",
    "Skill Category 4": "Collaborate — professional teamwork on cybersecurity tasks.",
    "Skill 1.A": "Identify, with and without the support of AI, vulnerabilities, threats, and attack methods, and explain how they generate risk.",
    "Skill 1.B": "Determine ways adversaries exploit vulnerabilities to compromise an asset.",
    "Skill 1.C": "Evaluate, with and without the support of AI, the likelihood and impact of risks.",
    "Skill 1.D": "Document, with and without the support of AI, the likelihood and impact of risks.",
    "Skill 2.A": "Identify security controls, and explain how they mitigate risks.",
    "Skill 2.B": "Determine layered security controls that address vulnerabilities.",
    "Skill 2.C": "Evaluate, with and without the support of AI, the impact of protective risk-management strategies.",
    "Skill 2.D": "Implement and log mitigations with and without the support of AI.",
    "Skill 3.A": "Identify methods for monitoring systems, and explain how they detect attacks.",
    "Skill 3.B": "Determine strategies and methods to detect attacks.",
    "Skill 3.C": "Evaluate the impact of threat detection methods.",
    "Skill 3.D": "Detect and classify cyberattacks by analyzing digital evidence with and without the support of AI.",
    "Skill 4.A": "Develop clear, shared team objectives related to a cybersecurity task.",
    "Skill 4.B": "Determine clear roles and responsibilities for members of a team working to accomplish a cybersecurity task.",
    "Skill 4.C": "Implement AI as a collaboration tool individually and as a group.",
    "Skill 4.D": "Complete assigned work to accomplish a collaborative cybersecurity task.",

    /* ---- AP Computer Science Principles CED ---- */
    "CRD-1.A": "Explain how computing innovations are improved through collaboration.",
    "CRD-1.B": "Explain how computing innovations are developed by groups of people.",
    "CRD-1.C": "Demonstrate effective interpersonal skills during collaboration.",
    "CRD-2.A": "Describe the purpose of a computing innovation.",
    "CRD-2.B": "Explain how a program or code segment functions.",
    "CRD-2.C": "Identify input(s) to a program.",
    "CRD-2.D": "Identify output(s) produced by a program.",
    "CRD-2.E": "Develop a program using a development process.",
    "CRD-2.F": "Design a program and its user interface.",
    "CRD-2.G": "Describe the purpose of a code segment or program by writing documentation.",
    "CRD-2.H": "Acknowledge code segments used from other sources.",
    "CRD-2.I": "For errors in an algorithm or program: identify the error, then correct it.",
    "DAT-1.A": "Explain how data can be represented using bits.",
    "DAT-1.B": "Explain how the use of data compression affects the quality and size of data.",
    "DAT-1.D": "Compare data compression algorithms to determine which is best in a particular context.",
    "DAT-2.A": "Describe what information can be extracted from data.",
    "DAT-2.B": "Describe what information can be extracted from metadata.",
    "DAT-2.C": "Identify the challenges associated with processing data.",
    "DAT-2.E": "Extract information from data using a program.",
    "AAP-1.A": "Represent a value with a variable.",
    "AAP-1.B": "Determine the value of a variable as a result of an assignment.",
    "AAP-1.C": "Represent a list or string using a variable.",
    "AAP-1.D": "Develop data abstraction using lists to store multiple elements.",
    "AAP-2.A": "Express an algorithm that uses sequencing without using a programming language.",
    "AAP-2.B": "Represent a step-by-step algorithmic process using sequential code statements.",
    "AAP-2.C": "Evaluate expressions that use arithmetic operators.",
    "AAP-2.D": "Evaluate expressions that manipulate strings.",
    "AAP-2.E": "Write and evaluate expressions that use relational operators.",
    "AAP-2.G": "Express an algorithm that uses selection without using a programming language.",
    "AAP-2.H": "Write conditional statements and determine their result.",
    "AAP-2.J": "Express an algorithm that uses iteration without using a programming language.",
    "AAP-2.K": "Write iteration statements and determine their result or side effect.",
    "AAP-2.L": "Compare multiple algorithms to determine if they yield the same side effect or result.",
    "AAP-2.M": "Create algorithms.",
    "AAP-2.O": "Write iteration statements to traverse a list.",
    "AAP-3.A": "Explain how the use of procedural abstraction manages complexity in a program.",
    "AAP-3.B": "Develop procedural abstractions to manage complexity in a program by writing procedures.",
    "AAP-3.C": "Select appropriate libraries or existing code segments to use in creating new programs.",
    "AAP-3.D": "Use random value generation in a program.",
    "AAP-4.A": "Determine the efficiency of an algorithm.",
    "AAP-4.B": "Explain the existence of undecidable problems in computer science.",
    "CSN-1.A": "Explain how computing devices work together in a network.",
    "CSN-1.B": "Explain how the internet works.",
    "CSN-1.C": "Explain how data are sent through the internet via packets.",
    "CSN-1.D": "Describe the differences between the internet and the World Wide Web.",
    "CSN-1.E": "Describe characteristics of the internet and the systems built on it, including fault tolerance.",
    "CSN-2.A": "Describe sequential, parallel, and distributed computing.",
    "CSN-2.B": "Describe benefits and challenges of parallel and distributed computing.",
    "IOC-1.A": "Explain how an effect of a computing innovation can be both beneficial and harmful.",
    "IOC-1.B": "Explain how a computing innovation can have an impact beyond its intended purpose.",
    "IOC-1.C": "Describe issues that contribute to the digital divide.",
    "IOC-1.D": "Explain how bias exists in computing innovations.",
    "IOC-1.E": "Explain how people participate in problem-solving processes at scale.",
    "IOC-1.F": "Explain how the use of computing can raise legal and ethical concerns.",
    "IOC-2.A": "Describe the risks to privacy from collecting and storing personal data on a computer system.",
    "IOC-2.B": "Explain how computing resources can be protected and can be misused.",

    /* ---- PA / CSTA K-12 Computer Science Standards ---- */
    "1B-AP-08": "Compare and refine multiple algorithms for the same task.",
    "1B-NI-04": "Model how information is broken down into smaller pieces, transmitted as packets, and reassembled.",
    "1B-NI-05": "Discuss real-world cybersecurity problems and how personal information can be protected.",
    "2-AP-10": "Use flowcharts and/or pseudocode to address complex problems as algorithms.",
    "2-NI-04": "Model the role of protocols in transmitting data across networks and the internet.",
    "2-NI-05": "Explain how physical and digital security measures protect electronic information.",
    "2-IC-20": "Compare tradeoffs associated with computing technologies that affect people's everyday activities.",
    "2-IC-23": "Describe tradeoffs between allowing information to be public and keeping information private.",
    "3A-NI-04": "Evaluate the scalability and reliability of networks.",
    "3A-NI-05": "Give examples to illustrate how sensitive data can be affected by malware and other attacks.",
    "3A-NI-06": "Recommend security measures to address various scenarios based on efficiency, feasibility, and ethical impacts.",
    "3A-NI-08": "Explain tradeoffs when selecting and implementing cybersecurity recommendations.",
    "3A-DA-09": "Translate between different bit representations of real-world phenomena.",
    "3A-DA-10": "Evaluate the tradeoffs in how data elements are organized and where data is stored.",
    "3A-DA-11": "Create interactive data visualizations to help others better understand real-world phenomena.",
    "3A-DA-12": "Create computational models that represent the relationships among different elements of data collected.",
    "3A-AP-11": "Create clearly named variables that represent different data types and perform operations on their values.",
    "3A-AP-13": "Create prototypes that use algorithms to solve computational problems.",
    "3A-AP-14": "Use lists to simplify solutions, generalizing computational problems instead of repeatedly using simple variables.",
    "3A-AP-15": "Justify the selection of specific control structures.",
    "3A-AP-16": "Design and iteratively develop computational artifacts for practical intent, personal expression, or a societal issue.",
    "3A-AP-17": "Decompose problems into smaller components through systematic analysis, using procedures, modules, and/or objects.",
    "3A-AP-18": "Create artifacts by using procedures, combinations of data and procedures, or independent but interrelated programs.",
    "3A-AP-19": "Systematically design and develop programs for broad audiences.",
    "3A-AP-20": "Evaluate licenses that limit or restrict use of computational artifacts.",
    "3A-AP-21": "Evaluate and refine computational artifacts to make them more usable and accessible.",
    "3A-AP-22": "Design and develop computational artifacts working in team roles using collaborative tools.",
    "3A-IC-24": "Evaluate the ways computing impacts personal, ethical, social, economic, and cultural practices.",
    "3A-IC-25": "Test and refine computational artifacts to reduce bias and equity deficits.",
    "3A-IC-26": "Demonstrate ways a given algorithm applies to problems across disciplines.",
    "3A-IC-27": "Use collaboration tools and methods to increase connectivity with people of different cultures and career fields.",
    "3A-IC-28": "Explain the beneficial and harmful effects that intellectual property laws can have on innovation.",
    "3A-IC-29": "Explain the privacy concerns related to the collection and generation of data through automated processes.",
    "3A-IC-30": "Evaluate the social and economic implications of privacy in the context of safety, law, or ethics.",
    "3B-NI-03": "Describe the issues that impact network functionality.",
    "3B-NI-04": "Compare ways software developers protect devices and information from unauthorized access.",
    "3B-DA-05": "Use data analysis tools and techniques to identify patterns in data representing complex systems.",
    "3B-AP-10": "Use and adapt classic algorithms to solve computational problems.",
    "3B-AP-11": "Evaluate algorithms in terms of their efficiency, correctness, and clarity.",
    "3B-AP-14": "Construct solutions to problems using student-created components, such as procedures, modules, and/or objects.",
    "3B-AP-16": "Demonstrate code reuse by creating programming solutions using libraries and APIs.",
    "3B-AP-18": "Explain security issues that might lead to compromised computer programs.",
    "3B-AP-20": "Use version control systems, IDEs, and collaborative tools and practices in a group software project.",
    "3B-IC-25": "Evaluate computational artifacts to maximize their beneficial effects and minimize harmful effects on society.",
    "3B-IC-26": "Evaluate the impact of equity, access, and influence on the distribution of computing resources in a global society."
  };

  /* Which published framework a code belongs to — drives grouping and the
     reference links in the teacher's Standards view. */
  function frameworkOf(code) {
    if (/^(LO |Skill )/.test(code)) return "ap";
    if (/^(CRD|DAT|AAP|CSN|IOC)-/.test(code)) return "apcsp";
    if (/^[123][AB]?[-.][A-Z]{2}[-.]\d/.test(code)) return "pa";
    return "cyberorg";
  }

  /* Published sources for the codes above. */
  var REFERENCES = [
    { id: "cyberorg", short: "CYBER.ORG standards",
      label: "CYBER.ORG K-12 Cybersecurity Learning Standards (v1.0, PDF)",
      url: "https://cyber.org/sites/default/files/2021-10/K-12%20Cybersecurity%20Learning%20Standards_1.0.pdf" },
    { id: "ap", short: "AP Cybersecurity CED",
      label: "AP Cybersecurity Course and Exam Description (College Board, PDF)",
      url: "https://apcentral.collegeboard.org/media/pdf/ap-cybersecurity-course-and-exam-description.pdf" },
    { id: "apcsp", short: "AP CSP CED",
      label: "AP Computer Science Principles Course and Exam Description (College Board, PDF)",
      url: "https://apcentral.collegeboard.org/media/pdf/ap-computer-science-principles-course-and-exam-description.pdf" },
    { id: "pa", short: "PA / CSTA standards",
      label: "Pennsylvania Computer Science Standards (CSTA-aligned)",
      url: "https://drive.google.com/file/d/1r_72Vmc5dREiu_BR8ywA8aUtsqcsbnLo/view" }
  ];

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
      /* Units 3-10 carry both the CYBER.ORG codes and the AP CED codes. */
      3: ["9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.SEC.NET",
          "LO 1.2.A", "LO 1.2.B", "LO 1.2.C", "LO 2.1.C", "LO 3.1.A", "LO 3.1.B", "LO 3.5.A", "LO 3.5.E",
          "Skill 1.A", "Skill 1.B", "Skill 3.A", "Skill 3.B", "Skill 3.D"],
      4: ["9-12.SEC.AUTH", "9-12.SEC.ACC",
          "LO 1.3.B", "LO 1.3.C", "LO 3.1.A", "LO 3.1.B", "LO 3.2.A", "LO 3.2.B",
          "LO 3.3.A", "LO 3.3.B", "LO 3.4.A", "LO 3.4.B", "LO 3.4.C", "LO 3.4.D",
          "Skill 2.A", "Skill 2.B"],
      5: ["9-12.SEC.ACC", "9-12.SEC.CTRL",
          "LO 1.2.B", "LO 1.2.C", "LO 1.4.B", "LO 2.1.F", "LO 2.3.B", "LO 3.2.A", "LO 3.2.B", "LO 3.4.B",
          "Skill 2.D"],
      6: ["9-12.SEC.CRYP",
          "LO 1.3.B", "LO 1.3.C", "LO 2.1.F", "LO 3.2.A", "LO 3.2.B"],
      7: ["9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.SEC.NET",
          "LO 1.1.A–3.5.E", "Skill Category 1", "Skill Category 2", "Skill Category 3",
          "Skill 1.C", "Skill 2.C", "Skill 3.C", "Skill 4.A", "Skill 4.B", "Skill 4.C", "Skill 4.D"],
      8: ["9-12.CS.CC", "9-12.CS.PROT.2", "9-12.CS.LOSS", "9-12.CS.HARD", "9-12.DC.PPI.2",
          "LO 2.1.C", "LO 2.1.D", "LO 2.1.E", "LO 2.1.F", "LO 2.3.A", "LO 2.3.B",
          "LO 3.2.A", "LO 3.5.A", "LO 3.5.B",
          "Skill 1.C", "Skill 1.D", "Skill 2.C"],
      9: ["9-12.DC.FOOT", "9-12.DC.PII", "9-12.DC.ETH",
          "Skill Category 4", "Skill 1.D", "Skill 4.A", "Skill 4.B", "Skill 4.C", "Skill 4.D"],
      10:["9-12.DC.LAW", "9-12.DC.ETH", "9-12.DC.AUP",
          "LO 1.1.A–3.5.E", "Skill Category 4", "Skill 4.A", "Skill 4.B"]
    },
    /* Cyber 1 — one entry per unit, from the course planning table. */
    cyber1: {
      1:  ["9-12.DC.THRT", "9-12.DC.FOOT", "9-12.DC.PII", "9-12.DC.PPI.2", "9-12.SEC.CIA", "9-12.SEC.INFO"],
      2:  ["9-12.DC.THRT", "9-12.DC.ETH", "9-12.DC.LAW", "9-12.DC.AUP"],
      3:  ["9-12.CS.OS", "9-12.CS.HARD", "9-12.CS.PROG"],
      4:  ["9-12.SEC.CRYP", "9-12.DC.THRT"],
      5:  ["9-12.SEC.PHYS", "9-12.SEC.INFO", "9-12.DC.CYBL", "9-12.DC.FOOT"],
      6:  ["9-12.CS.OS", "9-12.CS.PROG"],
      7:  ["9-12.CS.OS", "9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.CS.COMM"],
      8:  ["9-12.CS.OS", "9-12.SEC.ACC", "9-12.CS.SOFT"],
      9:  ["9-12.SEC.ACC", "9-12.SEC.AUTH", "9-12.SEC.NET", "9-12.SEC.INFO", "9-12.SEC.CRYP"],
      10: ["9-12.CS.COMM", "9-12.CS.COMP", "9-12.CS.HARD", "9-12.CS.PROT", "9-12.SEC.COMP"],
      11: ["9-12.SEC.INFO", "9-12.SEC.NET", "9-12.DC.THRT"],
      12: ["9-12.SEC.DATA", "9-12.CS.APPS", "9-12.SEC.INFO"],
      13: ["9-12.DC.FOOT", "9-12.DC.ETH", "9-12.SEC.CTRL"]
    },
    /* Byte Bounty (AP CSP) — AP CED codes plus the PA/CSTA codes for each unit. */
    apcsp: {
      1: ["CRD-1.C","CRD-2.E","CRD-2.F","DAT-2.E","AAP-2.A","AAP-2.B","AAP-2.G","AAP-2.J","AAP-2.L","AAP-2.M",
          "AAP-4.A","AAP-4.B","IOC-1.B","IOC-1.D","IOC-1.F","IOC-2.A","IOC-2.B",
          "1B-AP-08","2-AP-10","3A-NI-05","3A-NI-06","3A-NI-08","3A-DA-10","3A-AP-13","3A-AP-15","3A-AP-16",
          "3A-AP-19","3A-AP-21","3A-AP-22","3A-IC-25","3A-IC-28","3A-IC-30","3B-AP-11"],
      2: ["CRD-2.F","CRD-2.I","DAT-1.A","DAT-1.B","AAP-1.A","AAP-1.B","AAP-1.C","AAP-1.D","AAP-2.B","AAP-2.C",
          "AAP-2.D","AAP-2.H","AAP-2.K","AAP-2.M","AAP-3.A","AAP-3.B","AAP-3.C","AAP-3.D",
          "3A-AP-13","3A-AP-14","3A-AP-15","3A-AP-16","3A-AP-17","3A-AP-18","3A-AP-19","3A-AP-20","3A-AP-22",
          "3B-AP-10","3B-AP-11","3B-AP-14","3B-AP-16","3B-AP-20"],
      3: ["CRD-1.C","CRD-2.F","CRD-2.I","DAT-1.A","DAT-1.D","AAP-1.A","AAP-1.B","AAP-1.D","AAP-2.B","AAP-2.C",
          "AAP-2.D","AAP-2.E","AAP-2.H","AAP-2.K","AAP-2.M","AAP-2.O","AAP-3.A","AAP-3.B","AAP-3.C","AAP-3.D","IOC-1.F",
          "3A-AP-13","3A-AP-14","3A-AP-15","3A-AP-16","3A-AP-17","3A-AP-18","3A-AP-21","3A-DA-09","3A-IC-24","3A-IC-28"],
      4: ["DAT-2.A","DAT-2.B","DAT-2.C","DAT-2.E","IOC-1.E","IOC-1.F","IOC-2.A",
          "3A-DA-10","3A-DA-11","3A-DA-12","3A-IC-24","3A-IC-28","3A-IC-29","3A-IC-30"],
      5: ["CRD-2.A","CRD-2.B","CRD-2.C","CRD-2.D","CRD-2.E","CRD-2.F","CRD-2.G","CRD-2.H","CRD-2.I",
          "AAP-1.D","AAP-2.H","AAP-2.K","AAP-2.M","AAP-2.O","AAP-3.B","AAP-3.C"],
      6: ["CRD-1.A","CRD-1.B","CRD-2.A","CRD-2.C","CRD-2.D","DAT-2.A","DAT-2.C","DAT-2.E","AAP-1.A",
          "CSN-1.A","CSN-1.B","CSN-1.C","CSN-1.D","CSN-1.E","CSN-2.A","CSN-2.B",
          "IOC-1.A","IOC-1.C","IOC-1.F","IOC-2.A","IOC-2.B",
          "1B-NI-04","1B-NI-05","2-NI-04","2-NI-05","2-IC-20","2-IC-23","3A-NI-04","3A-NI-05","3A-NI-06","3A-NI-08",
          "3A-DA-10","3A-DA-12","3A-AP-11","3A-AP-13","3A-AP-14","3A-AP-16","3A-AP-22",
          "3A-IC-24","3A-IC-26","3A-IC-27","3A-IC-28","3A-IC-29","3A-IC-30",
          "3B-NI-03","3B-NI-04","3B-DA-05","3B-AP-18","3B-IC-25","3B-IC-26"]
    }
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
    references: REFERENCES, frameworkOf: frameworkOf,
    list: list, text: text, forModule: forModule, forCourse: forCourse,
    mapped: mapped, unmapped: unmapped,
    classReport: classReport, studentReport: studentReport
  };
})();

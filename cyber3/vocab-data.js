/* ============================================================
   CYBER 3 VOCABULARY DATA — single source of truth.
   Loaded by vocab.html (the Vocabulary Lab) AND ctf.html (Capture the Flag).
   Edit terms here; both pages update. m = module number (1-8).
   ============================================================ */
window.CY3_VOCAB = (function(){
  const MODULES = {
    1: "Job Shadowing / Internship",
    2: "Personalized Cybersecurity Learning Plan",
    3: "Preparing for Your Cybersecurity Career",
    4: "Independent Module: Career Pathway",
    5: "Independent Module: Cyber Trends",
    6: "Cybersecurity Competition",
    7: "Industry Certification",
    8: "Impactful / Passion Project"
  };
  const VOCAB = [
    {m:1,t:"Elevator Pitch",d:"A brief, rehearsed summary of who you are and what you're looking for — short enough to deliver during an elevator ride."},
    {m:1,t:"Informational Interview",d:"A conversation with a professional to learn about their role and field, not to ask for a job."},
    {m:1,t:"Cold Outreach",d:"Contacting a professional you don't know to ask for advice, a shadow day, or an opportunity."},
    {m:1,t:"Referral",d:"A recommendation from someone who already knows the employer, used to open a door."},
    {m:1,t:"Networking",d:"Building and maintaining professional relationships that can lead to opportunities."},
    {m:2,t:"Self-Assessment",d:"Evaluating your own strengths, weaknesses, and interests to guide your goals."},
    {m:2,t:"SMART Goal",d:"A goal that is Specific, Measurable, Achievable, Relevant, and Time-bound."},
    {m:2,t:"Growth Mindset",d:"The belief that abilities and intelligence can be developed through effort and practice."},
    {m:2,t:"Portfolio",d:"A living collection of work samples used to demonstrate skills and growth over time."},
    {m:2,t:"Feedback Loop",d:"The ongoing cycle of giving, receiving, and applying feedback to improve a plan or skill."},
    {m:3,t:"Resume",d:"A one-page professional summary of your education, experience, and skills."},
    {m:3,t:"LinkedIn",d:"A professional networking platform used to build an online career profile and connect with employers."},
    {m:3,t:"Cover Letter",d:"A document that accompanies a resume, explaining why you're a strong fit for a specific role."},
    {m:3,t:"Mock Interview",d:"A practice interview used to build confidence and improve real interview performance."},
    {m:3,t:"Personal Brand",d:"The consistent professional identity and reputation you present to others."},
    {m:4,t:"Career Pathway",d:"A planned sequence of roles, skills, and credentials leading toward a career goal."},
    {m:4,t:"Penetration Tester",d:"A professional legally authorized to attack a system to find its weaknesses before real adversaries do."},
    {m:4,t:"SOC Analyst",d:"A professional who monitors an organization's systems around the clock for threats, working in a Security Operations Center."},
    {m:4,t:"Threat Intelligence",d:"Gathering information about adversaries and their tactics to anticipate and defend against attacks."},
    {m:4,t:"Certification Path",d:"The sequence of industry certifications that build toward a specific cybersecurity role."},
    {m:5,t:"Zero Trust",d:"A security model where no user or device is trusted by default, even inside the network perimeter."},
    {m:5,t:"Supply Chain Attack",d:"An attack that compromises a trusted vendor or supplier in order to reach the real target."},
    {m:5,t:"Ransomware-as-a-Service",d:"A business model where ransomware developers lease their malware to other criminals for a cut of the profits."},
    {m:5,t:"AI Threat",d:"A cyber threat that uses artificial intelligence to automate, personalize, or scale an attack."},
    {m:5,t:"Nation-State Actor",d:"A well-resourced adversary backed by a government, often pursuing espionage or disruption."},
    {m:6,t:"CTF (Capture the Flag)",d:"A competition format where teams solve hidden security challenges to find and submit flags."},
    {m:6,t:"NCL (National Cyber League)",d:"A national two-season cybersecurity competition many Cyber 3 students compete in."},
    {m:6,t:"Scoreboard",d:"The live ranking display that shows how teams or individuals compare during a competition."},
    {m:6,t:"OSINT",d:"Open Source Intelligence — information gathered from publicly available sources during a competition or attack."},
    {m:6,t:"Enumeration",d:"Actively gathering detailed information about a target system before attempting to exploit it."},
    {m:7,t:"CompTIA Security+",d:"The entry-level industry certification most Cyber 3 students target."},
    {m:7,t:"Exam Domain",d:"One of the major topic areas an industry certification exam is organized around."},
    {m:7,t:"Exam Objectives",d:"The official list of topics a certification exam is guaranteed to test, published by the certifying body."},
    {m:7,t:"Voucher",d:"A free or discounted code used to pay for a certification exam."},
    {m:7,t:"Practice Exam",d:"A simulated test used to measure readiness before taking the real certification exam."},
    {m:8,t:"Stakeholder",d:"A person or group affected by, or invested in, the outcome of a project."},
    {m:8,t:"Deliverable",d:"The final tangible product or output produced at the end of a project."},
    {m:8,t:"Call to Action",d:"A clear prompt telling an audience exactly what to do next."},
    {m:8,t:"Impact Statement",d:"A clear statement describing the change or effect a project aims to create."},
    {m:8,t:"Community Outreach",d:"Sharing knowledge or resources with a community outside the classroom to create real-world impact."}
  ];
  return { MODULES, terms: VOCAB };
})();

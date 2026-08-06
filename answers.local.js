/* ============================================================================
   answers.local.js  —  plaintext answer sheet for the teacher answer key.

   NEVER COMMIT THIS FILE. It is gitignored. Upload it once through
   answers.html, which pushes it into a sealed Supabase table only a teacher
   account can read.

   Keys:  "<challengeId>"      single-flag challenge
          "<challengeId>#0"    leveled flags — #0 Easy, #1 Medium, #2 Hard
   Values: exactly what a student types to capture the flag.

   Interactive captures (match / order / spot / phish) and vocab challenges
   have no typed answer, so they never appear here.

   RULE: whenever a flag is added, edited, or removed in config.js, update
   this file in the same pass and re-upload it.

   AUDIT BY EXECUTING config.js, never by scanning its text. Every challenge
   now lives in exactly one place — the challenges:[...] array inside its own
   ctf block — but a text scan still mis-parses nested prompts and escapes. Always sweep ALL FOUR courses for duplicate flagHashes, not
   just the one being edited.

   Last full verification: 2026-07-27 — all 339 answers hashed against the
   executed COURSE_CONFIG. Zero missing, zero mismatched, zero orphaned.
   ============================================================================ */
window.CTF_ANSWERS = {
  /* ---- CYBER 1 · SPECTER — 78 answers ---- */
  "cyber1": {
    "c1-m1-day0-play#0": "flag{play}",
    "c1-m1-day0-play#1": "flag{struggle}",
    "c1-m1-day0-play#2": "flag{perform}",

    "c1-m1-1.1-core#0": "flag{cybersecurity}",
    "c1-m1-1.1-core#1": "flag{onity}",
    "c1-m1-1.1-core#2": "flag{grids}",

    "c1-m1-cia#0": "flag{confidentiality}",
    "c1-m1-cia#1": "flag{integrity}",
    "c1-m1-cia#2": "flag{availability}",

    "c1-m1-defense#0": "flag{password}",
    "c1-m1-defense#1": "flag{mfa}",
    "c1-m1-defense#2": "flag{antivirus}",

    "c1-m1-1.2-history#0": "flag{creeper}",
    "c1-m1-1.2-history#1": "flag{stuxnet}",
    "c1-m1-1.2-history#2": "flag{colonial}",

    "c1-m1-1.3-careers#0": "flag{soc}",
    "c1-m1-1.3-careers#1": "flag{seek}",
    "c1-m1-1.3-careers#2": "flag{portfolio}",

    "c1-m1-1.4-mindsets#0": "flag{pc10}",
    "c1-m1-1.4-mindsets#1": "flag{ncl}",
    "c1-m1-1.4-mindsets#2": "flag{curiosity}",

    "c1-m1-1.5-ethics#0": "flag{ethics}",
    "c1-m1-1.5-ethics#1": "flag{pnwcyber}",
    "c1-m1-1.5-ethics#2": "flag{contract}",

    "c1-m1-1.6-cert#0": "flag{essentials}",
    "c1-m1-1.6-cert#1": "flag{10}",
    "c1-m1-1.6-cert#2": "flag{springboard}",

    "c1-m1-1.7-ctf#0": "flag{ctf}",
    "c1-m1-1.7-ctf#1": "flag{scavenger_hunt}",
    "c1-m1-1.7-ctf#2": "flag{hackers}",

    "c1-m1-perform#0": "flag{portfolio}",
    "c1-m1-perform#1": "flag{learn}",
    "c1-m1-perform#2": "flag{reflection}",

    "c1-m1-daily-1.1-1#0": "flag{scenario}",
    "c1-m1-daily-1.1-1#1": "flag{struggle}",
    "c1-m1-daily-1.1-1#2": "flag{perform}",

    "c1-m1-daily-1.1-2#0": "flag{cybersecurity}",
    "c1-m1-daily-1.1-2#1": "flag{onity}",
    "c1-m1-daily-1.1-2#2": "flag{grids}",

    "c1-m1-daily-1.2-1#0": "flag{onity}",
    "c1-m1-daily-1.2-1#1": "flag{mfa}",
    "c1-m1-daily-1.2-1#2": "flag{phishing}",

    "c1-m1-daily-1.2-2#0": "flag{creeper}",
    "c1-m1-daily-1.2-2#1": "flag{stuxnet}",
    "c1-m1-daily-1.2-2#2": "flag{colonial}",

    "c1-m1-daily-1.2-3#0": "flag{attacks}",
    "c1-m1-daily-1.2-3#1": "flag{visualize}",
    "c1-m1-daily-1.2-3#2": "flag{ddos}",

    "c1-m1-daily-1.3-1#0": "flag{solarwinds}",
    "c1-m1-daily-1.3-1#1": "flag{threat map}",
    "c1-m1-daily-1.3-1#2": "flag{gallery walk}",

    "c1-m1-daily-1.3-2#0": "flag{cyberseek}",
    "c1-m1-daily-1.3-2#1": "flag{vocabulary}",
    "c1-m1-daily-1.3-2#2": "flag{soc analyst}",

    "c1-m1-daily-1.4-1#0": "flag{infographic}",
    "c1-m1-daily-1.4-1#1": "flag{three}",
    "c1-m1-daily-1.4-1#2": "flag{certifications}",

    "c1-m1-daily-1.4-2#0": "flag{pc10}",
    "c1-m1-daily-1.4-2#1": "flag{relentless curiosity}",
    "c1-m1-daily-1.4-2#2": "flag{ncl}",

    "c1-m1-daily-1.5-1#0": "flag{portfolio}",
    "c1-m1-daily-1.5-1#1": "flag{character profile}",
    "c1-m1-daily-1.5-1#2": "flag{10}",

    "c1-m1-daily-1.6-1#0": "flag{pnwcyber}",
    "c1-m1-daily-1.6-1#1": "flag{ethics contract}",
    "c1-m1-daily-1.6-1#2": "flag{12}",

    "c1-m1-daily-1.6-2#0": "flag{cyber essentials}",
    "c1-m1-daily-1.6-2#1": "flag{malware}",
    "c1-m1-daily-1.6-2#2": "flag{10}",

    "c1-m1-daily-1.7-1#0": "flag{centra}",
    "c1-m1-daily-1.7-1#1": "flag{struggled}",
    "c1-m1-daily-1.7-1#2": "flag{trustedsec}",

    "c1-m1-daily-1.7-ext#0": "flag{flags}",
    "c1-m1-daily-1.7-ext#1": "flag{hackers}",
    "c1-m1-daily-1.7-ext#2": "flag{portfolio}",

    "c1-m2-ethics#0": "flag{ethics}",
    "c1-m2-ethics#1": "flag{ACM}",
    "c1-m2-ethics#2": "flag{whistleblowing}",

    "c1-m2-law2#0": "flag{illegal}",
    "c1-m2-law2#1": "flag{white}",
    "c1-m2-law2#2": "flag{authorization}",

    "c1-m3-convert#0": "flag{10}",
    "c1-m3-convert#1": "flag{31}",
    "c1-m3-convert#2": "flag{hi}",

    "c1-m3-units#0": "flag{8}",
    "c1-m3-units#1": "flag{255}",
    "c1-m3-units#2": "flag{4}",

    "c1-m4-crypto#0": "flag{cipher}",
    "c1-m4-crypto#1": "flag{plaintext}",
    "c1-m4-crypto#2": "flag{polyalphabetic}",

    "c1-m4-keys#0": "flag{key}",
    "c1-m4-keys#1": "flag{symmetric}",
    "c1-m4-keys#2": "flag{hash}",

    "c1-m5-se#0": "flag{phishing}",
    "c1-m5-se#1": "flag{vishing}",
    "c1-m5-se#2": "flag{pretexting}",

    "c1-m5-targets#0": "flag{smishing}",
    "c1-m5-targets#1": "flag{spear}",
    "c1-m5-targets#2": "flag{whaling}",

    "c1-m6-cli#0": "flag{CLI}",
    "c1-m6-cli#1": "flag{ls}",
    "c1-m6-cli#2": "flag{cd}",

    "c1-m6-fs#0": "flag{/}",
    "c1-m6-fs#1": "flag{~}",
    "c1-m6-fs#2": "flag{touch}",

    "c1-m7-admin#0": "flag{cat}",
    "c1-m7-admin#1": "flag{tcpdump}",
    "c1-m7-admin#2": "flag{chmod}",

    "c1-m7-manage#0": "flag{sudo}",
    "c1-m7-manage#1": "flag{/etc/passwd}",
    "c1-m7-manage#2": "flag{ps}",

    "c1-m8-win#0": "flag{cmd}",
    "c1-m8-win#1": "flag{powershell}",
    "c1-m8-win#2": "flag{active_directory}",

    "c1-m8-winfacts#0": "flag{registry}",
    "c1-m8-winfacts#1": "flag{ntfs}",
    "c1-m8-winfacts#2": "flag{ipconfig}",

    "c1-m9-ncl#0": "flag{national_cyber_league}",
    "c1-m9-ncl#1": "flag{comptia}",
    "c1-m9-ncl#2": "flag{osint}",

    "c1-m9-nclfacts#0": "flag{flag}",
    "c1-m9-nclfacts#1": "flag{nmap}",
    "c1-m9-nclfacts#2": "flag{cyberchef}",

    "c1-m10-net#0": "flag{7}",
    "c1-m10-net#1": "flag{ip}",
    "c1-m10-net#2": "flag{transport}",

    "c1-m10-netfacts#0": "flag{mac}",
    "c1-m10-netfacts#1": "flag{dns}",
    "c1-m10-netfacts#2": "flag{127.0.0.1}",

    "c1-m11-mal#0": "flag{ransomware}",
    "c1-m11-mal#1": "flag{exploit}",
    "c1-m11-mal#2": "flag{zero}",

    "c1-m11-malfacts#0": "flag{botnet}",
    "c1-m11-malfacts#1": "flag{ddos}",
    "c1-m11-malfacts#2": "flag{horse}",

    "c1-m12-sql#0": "flag{SELECT}",
    "c1-m12-sql#1": "flag{row}",
    "c1-m12-sql#2": "flag{injection}",

    "c1-m12-sqlfacts#0": "flag{structured_query_language}",
    "c1-m12-sqlfacts#1": "flag{primary}",
    "c1-m12-sqlfacts#2": "flag{DROP}",

    "c1-m13-prep#0": "flag{security_plus}",
    "c1-m13-prep#1": "flag{never_stop_learning}",
    "c1-m13-prep#2": "flag{national_cyber_league}",

    "c1-m13-prepfacts#0": "flag{resume}",
    "c1-m13-prepfacts#1": "flag{portfolio}",
    "c1-m13-prepfacts#2": "flag{linkedin}"
  },

  /* ---- CYBER 2 · NEMESIS — 138 answers ---- */
  "cyber2": {
    "m1-day0-teams#0": "flag{blue}",
    "m1-day0-teams#1": "flag{red}",
    "m1-day0-teams#2": "flag{purple}",

    "m1-1.1-field#0": "flag{cybersecurity}",
    "m1-1.1-field#1": "flag{healthcare}",
    "m1-1.1-field#2": "flag{current_event}",

    "m1-1.2-adversary#0": "flag{hacktivist}",
    "m1-1.2-adversary#1": "flag{apt}",
    "m1-1.2-adversary#2": "flag{insider_threat}",

    "m1-1.3-surface#0": "flag{surface}",
    "m1-1.3-surface#1": "flag{digital}",
    "m1-1.3-surface#2": "flag{human}",

    "m1-1.4-stations#0": "flag{evil_twin}",
    "m1-1.4-stations#1": "flag{jamming}",
    "m1-1.4-stations#2": "flag{war_driving}",

    "m1-1.4ext-malware#0": "flag{ransomware}",
    "m1-1.4ext-malware#1": "flag{trojan}",
    "m1-1.4ext-malware#2": "flag{worm}",

    "m1-1.4ext-lure#0": "flag{phishing}",
    "m1-1.4ext-lure#1": "flag{spear_phishing}",
    "m1-1.4ext-lure#2": "flag{whaling}",

    "m1-1.5-auth#0": "flag{multi_factor}",
    "m1-1.5-auth#1": "flag{vpn}",
    "m1-1.5-auth#2": "flag{reuse}",

    "m1-1.5ext-data#0": "flag{rest}",
    "m1-1.5ext-data#1": "flag{cia}",
    "m1-1.5ext-data#2": "flag{mantrap}",

    "m1-1.6-mindsets#0": "flag{ncl}",
    "m1-1.6-mindsets#1": "flag{pc10}",
    "m1-1.6-mindsets#2": "flag{portfolio}",

    "m1-1.7-ctf#0": "flag{ctf}",
    "m1-1.7-ctf#1": "flag{curiosity}",
    "m1-1.7-ctf#2": "flag{struggle}",

    "m1-perform-audit#0": "flag{audit}",
    "m1-perform-audit#1": "flag{posture}",
    "m1-perform-audit#2": "flag{reflection}",

    "m2-aup#0": "flag{aup}",
    "m2-aup#1": "flag{incident_response}",
    "m2-aup#2": "flag{sla}",

    "m2-awareness#0": "flag{security_awareness}",
    "m2-awareness#1": "flag{phishing_simulation}",
    "m2-awareness#2": "flag{security_culture}",

    "m2-controls#0": "flag{preventative}",
    "m2-controls#1": "flag{detective}",
    "m2-controls#2": "flag{administrative}",

    "m2-hardware#0": "flag{tpm}",
    "m2-hardware#1": "flag{full disk}",
    "m2-hardware#2": "flag{secure boot}",

    "m2-leastpriv#0": "flag{least_privilege}",
    "m2-leastpriv#1": "flag{separation_of_duties}",
    "m2-leastpriv#2": "flag{job_rotation}",

    "m3-crack#0": "salt",
    "m3-crack#1": "john the ripper",
    "m3-crack#2": "hashcat",

    "m3-decode#0": "cyber",
    "m3-decode#1": "flag{ncl}",
    "m3-decode#2": "flag{pki}",

    "m3-logip#0": "flag{root}",
    "m3-logip#1": "flag{198.51.100.77}",
    "m3-logip#2": "flag{55022}",

    "m3-osint#0": "flag{OSINT}",
    "m3-osint#1": "flag{whois}",
    "m3-osint#2": "flag{maltego}",

    "m3-recon#0": "nmap",
    "m3-recon#1": "flag{enumeration}",
    "m3-recon#2": "-a",

    "m3-shadow#0": "flag{/etc/shadow}",
    "m3-shadow#1": "flag{/etc/passwd}",
    "m3-shadow#2": "flag{sha-512}",

    "m4-aaa#0": "authentication",
    "m4-aaa#1": "accounting",
    "m4-aaa#2": "Least Privilege",

    "m4-availability#0": "dos",
    "m4-availability#1": "ddos",
    "m4-availability#2": "man-in-the-middle",

    "m4-dmz#0": "flag{zero_trust}",
    "m4-dmz#1": "flag{microsegmentation}",
    "m4-dmz#2": "flag{bastion_host}",

    "m4-https#0": "flag{443}",
    "m4-https#1": "flag{80}",
    "m4-https#2": "flag{22}",

    "m4-securecode#0": "validation",
    "m4-securecode#1": "handling",
    "m4-securecode#2": "duties",

    "m4-subnet#0": "flag{256}",
    "m4-subnet#1": "flag{254}",
    "m4-subnet#2": "flag{62}",

    "m4-zones#0": "dmz",
    "m4-zones#1": "vlan",
    "m4-zones#2": "depth",

    "m5-aaa#0": "flag{accounting}",
    "m5-aaa#1": "flag{authorization}",
    "m5-aaa#2": "flag{radius}",

    "m5-authz#0": "flag{identification}",
    "m5-authz#1": "ldap",
    "m5-authz#2": "mfa",

    "m5-mfa#0": "flag{are}",
    "m5-mfa#1": "flag{know}",
    "m5-mfa#2": "flag{totp}",

    "m5-rbac#0": "flag{rbac}",
    "m5-rbac#1": "flag{mac}",
    "m5-rbac#2": "flag{abac}",

    "m6-aes#0": "flag{symmetric}",
    "m6-aes#1": "flag{aes}",
    "m6-aes#2": "flag{rsa}",

    "m6-cert#0": "flag{certificate}",
    "m6-cert#1": "flag{certificate_authority}",
    "m6-cert#2": "flag{tls}",

    "m6-hashing#0": "flag{hash}",
    "m6-hashing#1": "flag{collision}",
    "m6-hashing#2": "flag{hmac}",

    "m6-rot#0": "flag{cipher}",
    "m6-rot#1": "flag{public_key_infrastructure}",
    "m6-rot#2": "flag{diffie_hellman}",

    "m7-cia#0": "flag{availability}",
    "m7-cia#1": "flag{integrity}",
    "m7-cia#2": "flag{ddos}",

    "m7-hex#0": "flag{scan}",
    "m7-hex#1": "flag{packet_capture}",
    "m7-hex#2": "flag{privilege_escalation}",

    "m7-methodology#0": "flag{penetration}",
    "m7-methodology#1": "flag{pivoting}",
    "m7-methodology#2": "flag{engagement}",

    "m7-sqli#0": "flag{sql}",
    "m7-sqli#1": "flag{sql_injection}",
    "m7-sqli#2": "flag{sqlmap}",

    "m7-toolkit#0": "flag{wireshark}",
    "m7-toolkit#1": "flag{burp}",
    "m7-toolkit#2": "flag{metasploit}",

    "m8-contain#0": "flag{preparation}",
    "m8-contain#1": "flag{containment}",
    "m8-contain#2": "flag{lessons_learned}",

    "m8-measure#0": "flag{vulnerability}",
    "m8-measure#1": "flag{residual}",
    "m8-measure#2": "flag{acceptance}",

    "m8-privacy#0": "flag{pii}",
    "m8-privacy#1": "flag{minimization}",
    "m8-privacy#2": "flag{3-2-1}",

    "m8-risk#0": "flag{impact}",
    "m8-risk#1": "flag{transference}",
    "m8-risk#2": "flag{nist}",

    "m8-rpo#0": "flag{rto}",
    "m8-rpo#1": "flag{rpo}",
    "m8-rpo#2": "flag{business_continuity}",

    "m9-b64#0": "flag{show_your_work}",
    "m9-b64#1": "flag{document_everything}",
    "m9-b64#2": "flag{peer_review}",

    "m9-brag#0": "flag{brag_sheet}",
    "m9-brag#1": "flag{linkedin}",
    "m9-brag#2": "flag{portfolio}",

    "m9-rev#0": "flag{present_with_pride}",
    "m9-rev#1": "flag{practice_out_loud}",
    "m9-rev#2": "flag{know_your_audience}",

    "m10-b64#0": "flag{never_stop_learning}",
    "m10-b64#1": "flag{stay_curious}",
    "m10-b64#2": "flag{build_your_network}",

    "m10-secplus#0": "flag{security_plus}",
    "m10-secplus#1": "flag{network_plus}",
    "m10-secplus#2": "flag{pentest_plus}",

    "m10-shadow#0": "flag{shadowing}",
    "m10-shadow#1": "flag{internship}",
    "m10-shadow#2": "flag{mentorship}"
  },

  /* ---- CYBER 3 · VECTOR — 24 answers ---- */
  "cyber3": {
    "c3-m1-pitch#0": "flag{elevatorpitch}",
    "c3-m1-pitch#1": "flag{coldoutreach}",
    "c3-m1-pitch#2": "flag{referral}",

    "c3-m2-smart#0": "flag{smart}",
    "c3-m2-smart#1": "flag{growthmindset}",
    "c3-m2-smart#2": "flag{portfolio}",

    "c3-m3-resume#0": "flag{resume}",
    "c3-m3-resume#1": "flag{linkedin}",
    "c3-m3-resume#2": "flag{coverletter}",

    "c3-m4-roles#0": "flag{penetrationtester}",
    "c3-m4-roles#1": "flag{soc}",
    "c3-m4-roles#2": "flag{threatintelligence}",

    "c3-m5-trends#0": "flag{zerotrust}",
    "c3-m5-trends#1": "flag{supplychainattack}",
    "c3-m5-trends#2": "flag{ransomwareasaservice}",

    "c3-m6-comp#0": "flag{ctf}",
    "c3-m6-comp#1": "flag{ncl}",
    "c3-m6-comp#2": "flag{enumeration}",

    "c3-m7-cert#0": "flag{securityplus}",
    "c3-m7-cert#1": "flag{voucher}",
    "c3-m7-cert#2": "flag{examobjectives}",

    "c3-m8-project#0": "flag{stakeholder}",
    "c3-m8-project#1": "flag{deliverable}",
    "c3-m8-project#2": "flag{impactstatement}"
  },

  /* ---- BYTE BOUNTY · AP CSP · ADA — 42 answers ---- */
  "apcsp": {
    "ap-m1a#0": "flag{algorithm}",
    "ap-m1a#1": "flag{binary search}",
    "ap-m1a#2": "flag{heuristic}",

    "ap-m1-robotrun#0": "flag{6}",
    "ap-m1-robotrun#1": "flag{9}",
    "ap-m1-robotrun#2": "flag{7}",

    "ap-m1b#0": "flag{abstraction}",
    "ap-m1b#1": "flag{parallel computing}",
    "ap-m1b#2": "flag{speedup}",

    "ap-m2a#0": "flag{function}",
    "ap-m2a#1": "flag{logical}",
    "ap-m2a#2": "flag{list}",

    "ap-m2b#0": "flag{debugging}",
    "ap-m2b#1": "flag{logic}",
    "ap-m2b#2": "flag{api}",

    "ap-m3a#0": "flag{bit}",
    "ap-m3a#1": "flag{byte}",
    "ap-m3a#2": "flag{overflow error}",

    "ap-m3-studentnum#0": "flag{125}",
    "ap-m3-studentnum#1": "flag{127}",
    "ap-m3-studentnum#2": "flag{158}",

    "ap-m3-arithmetic#0": "flag{16,12,0}",
    "ap-m3-arithmetic#1": "flag{251,-7,255}",
    "ap-m3-arithmetic#2": "flag{0.625,3.25,1}",

    "ap-m3b#0": "flag{pixel}",
    "ap-m3b#1": "flag{lossy}",
    "ap-m3b#2": "flag{rgb}",

    "ap-m4a#0": "flag{metadata}",
    "ap-m4a#1": "flag{data mining}",
    "ap-m4a#2": "flag{correlation}",

    "ap-m4b#0": "flag{visualization}",
    "ap-m4b#1": "flag{record}",
    "ap-m4b#2": "flag{algorithmic bias}",

    "ap-m5a#0": "flag{procedure}",
    "ap-m5a#1": "flag{iteration}",
    "ap-m5a#2": "flag{abstraction}",

    "ap-m5b#0": "flag{debugging}",
    "ap-m5b#1": "flag{collaboration}",
    "ap-m5b#2": "flag{decomposition}",

    "ap-m6a#0": "flag{path}",
    "ap-m6a#1": "flag{bandwidth}",
    "ap-m6a#2": "flag{packets}",

    "ap-m6b#0": "flag{authentication}",
    "ap-m6b#1": "flag{public key encryption}",
    "ap-m6b#2": "flag{malware}",

    "ap-m7a#0": "flag{abstraction}",
    "ap-m7a#1": "flag{algorithmic bias}",
    "ap-m7a#2": "flag{undecidable problem}",

    "ap-m7b#0": "flag{digital divide}",
    "ap-m7b#1": "flag{plagiarism}",
    "ap-m7b#2": "flag{copyright}"
  },

  /* ---- PROOF OF WORK · WEB 3.0 · ORACLE — 72 answers ---- */
  "web3": {

    "w3-dao-apply#0": "flag{contract}",
    "w3-dao-apply#1": "flag{proposal}",
    "w3-dao-apply#2": "flag{quorum}",

    "w3-dao-ethics#0": "flag{centralized}",
    "w3-dao-ethics#1": "flag{liability}",
    "w3-dao-ethics#2": "flag{llc}",

    "w3-dapp-risk#0": "flag{audit}",
    "w3-dapp-risk#1": "flag{reentrancy}",
    "w3-dapp-risk#2": "flag{jurisdiction}",

    "w3-dapp-traits#0": "flag{frontend}",
    "w3-dapp-traits#1": "flag{server}",
    "w3-dapp-traits#2": "flag{tokenization}",

    "w3-m1a#0": "flag{blockchain}",
    "w3-m1a#1": "flag{decentralized}",
    "w3-m1a#2": "flag{immutable}",

    "w3-m1b#0": "flag{node}",
    "w3-m1b#1": "flag{hash}",
    "w3-m1b#2": "flag{proof of work}",

    "w3-m2a#0": "flag{wallet}",
    "w3-m2a#1": "flag{private key}",
    "w3-m2a#2": "flag{seed phrase}",

    "w3-m2b#0": "flag{address}",
    "w3-m2b#1": "flag{cold wallet}",
    "w3-m2b#2": "flag{public key}",

    "w3-m3a#0": "flag{token}",
    "w3-m3a#1": "flag{gas}",
    "w3-m3a#2": "flag{stablecoin}",

    "w3-m3b#0": "flag{fungible}",
    "w3-m3b#1": "flag{cryptocurrency}",
    "w3-m3b#2": "flag{erc-20}",

    "w3-m4a#0": "flag{nft}",
    "w3-m4a#1": "flag{non-fungible}",
    "w3-m4a#2": "flag{minting}",

    "w3-m4b#0": "flag{ownership}",
    "w3-m4b#1": "flag{metadata}",
    "w3-m4b#2": "flag{ipfs}",

    "w3-m5a#0": "flag{smart contract}",
    "w3-m5a#1": "flag{solidity}",
    "w3-m5a#2": "flag{evm}",

    "w3-m5b#0": "flag{deploy}",
    "w3-m5b#1": "flag{testnet}",
    "w3-m5b#2": "flag{immutable}",

    "w3-m6a#0": "flag{dapp}",
    "w3-m6a#1": "flag{defi}",
    "w3-m6a#2": "flag{oracle}",

    "w3-m6b#0": "flag{dao}",
    "w3-m6b#1": "flag{governance token}",
    "w3-m6b#2": "flag{consensus}",

    "w3-m7a#0": "flag{whitepaper}",
    "w3-m7a#1": "flag{use case}",
    "w3-m7a#2": "flag{tokenomics}",

    "w3-m7b#0": "flag{prototype}",
    "w3-m7b#1": "flag{decentralization}",
    "w3-m7b#2": "flag{minimum viable product}",

    "w3-m8a#0": "flag{web3}",
    "w3-m8a#1": "flag{ledger}",
    "w3-m8a#2": "flag{proof of stake}",

    "w3-m8b#0": "flag{scam}",
    "w3-m8b#1": "flag{rug pull}",
    "w3-m8b#2": "flag{gas fee}",

    "w3-nft-law#0": "flag{gain}",
    "w3-nft-law#1": "flag{copyright}",
    "w3-nft-law#2": "flag{royalty}",

    "w3-token-keys#0": "flag{supply key}",
    "w3-token-keys#1": "flag{freeze key}",
    "w3-token-keys#2": "flag{clawback_key}",

    "w3-wallet-connect#0": "flag{associate}",
    "w3-wallet-connect#1": "flag{signature}",
    "w3-wallet-connect#2": "flag{allowance}",

    "w3-web-eras#0": "flag{own}",
    "w3-web-eras#1": "flag{permissionless}",
    "w3-web-eras#2": "flag{supply chain}"
  }
};

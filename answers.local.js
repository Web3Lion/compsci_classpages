// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
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

    "c1-dfhy-2.1-footprint#0": "flag{open source intelligence}",
    "c1-dfhy-2.1-footprint#1": "flag{hide}",
    "c1-dfhy-2.1-footprint#2": "flag{doxxing}",

    "c1-dfhy-2.2-datastory#0": "flag{10}",
    "c1-dfhy-2.2-datastory#1": "flag{hacker}",
    "c1-dfhy-2.2-datastory#2": "flag{moral character}",

    "c1-dfhy-2.3-hygiene#0": "flag{email}",
    "c1-dfhy-2.3-hygiene#1": "flag{12}",
    "c1-dfhy-2.3-hygiene#2": "flag{metadata}",

    "c1-dfhy-2.4-googlehack#0": "flag{dorking}",
    "c1-dfhy-2.4-googlehack#1": "flag{illegal ethical}",
    "c1-dfhy-2.4-googlehack#2": "flag{open doors}",

    "c1-cn-4.1-fundamentals#0": "flag{binary}",
    "c1-cn-4.1-fundamentals#1": "flag{byte}",
    "c1-cn-4.1-fundamentals#2": "flag{card}",

    "c1-cn-4.2-basics#0": "flag{storage}",
    "c1-cn-4.2-basics#1": "flag{ram}",
    "c1-cn-4.2-basics#2": "flag{firmware}",

    "c1-cn-4.3-ethics#0": "flag{values}",
    "c1-cn-4.3-ethics#1": "flag{ransomware}",
    "c1-cn-4.3-ethics#2": "flag{responsible}",

    "c1-cr-9.1-core#0": "flag{cryptology}",
    "c1-cr-9.1-core#1": "flag{cryptography}",
    "c1-cr-9.1-core#2": "flag{key}",

    "c1-cr-9.2-core#0": "flag{venona}",
    "c1-cr-9.2-core#1": "flag{duplicate}",
    "c1-cr-9.2-core#2": "flag{talkers}",

    "c1-cr-9.3-core#0": "flag{monoalphabetic}",
    "c1-cr-9.3-core#1": "flag{polyalphabetic}",
    "c1-cr-9.3-core#2": "flag{transposition}",

    "c1-cr-9.4-core#0": "flag{symmetric}",
    "c1-cr-9.4-core#1": "flag{asymmetric}",
    "c1-cr-9.4-core#2": "flag{key_exchange}",

    "c1-cr-9.5-core#0": "flag{cryptanalysis}",
    "c1-cr-9.5-core#1": "flag{frequency_analysis}",
    "c1-cr-9.5-core#2": "flag{ciphertext_only}",

    "c1-cr-9.6-core#0": "flag{cipher}",
    "c1-cr-9.6-core#1": "flag{secret}",
    "c1-cr-9.6-core#2": "flag{cyber}",

    "c1-se-3.1-fundamentals#0": "flag{dumpster diving}",
    "c1-se-3.1-fundamentals#1": "flag{human}",
    "c1-se-3.1-fundamentals#2": "flag{helpfulness}",

    "c1-se-3.2-types#0": "flag{authentication}",
    "c1-se-3.2-types#1": "flag{baiting}",
    "c1-se-3.2-types#2": "flag{scareware}",

    "c1-se-3.3-phishing#0": "flag{generic}",
    "c1-se-3.3-phishing#1": "flag{urgent}",
    "c1-se-3.3-phishing#2": "flag{forward}",

    "c1-se-3.4-detect#0": "flag{website}",
    "c1-se-3.4-detect#1": "flag{masking}",
    "c1-se-3.4-detect#2": "flag{reply}",

    "c1-os-5.1-core#0": "flag{operating_system}",
    "c1-os-5.1-core#1": "flag{sysadmin}",
    "c1-os-5.1-core#2": "flag{distribution_edition}",

    "c1-os-5.2-core#0": "flag{host}",
    "c1-os-5.2-core#1": "flag{guest}",
    "c1-os-5.2-core#2": "flag{hypervisor}",

    "c1-os-5.3-core#0": "flag{cli}",
    "c1-os-5.3-core#1": "flag{gui}",
    "c1-os-5.3-core#2": "flag{manual_transmission}",

    "c1-os-5.4-core#0": "flag{argument}",
    "c1-os-5.4-core#1": "flag{flags}",
    "c1-os-5.4-core#2": "flag{man}",

    "c1-os-5.5-core#0": "flag{root}",
    "c1-os-5.5-core#1": "flag{extension}",
    "c1-os-5.5-core#2": "flag{/}",

    "c1-os-5.6-core#0": "flag{authentication}",
    "c1-os-5.6-core#1": "flag{authorization}",
    "c1-os-5.6-core#2": "flag{evidence}",

    "c1-os-5.7-core#0": "flag{pid}",
    "c1-os-5.7-core#1": "flag{zombie}",
    "c1-os-5.7-core#2": "flag{orphan}",

    "c1-os-5.9-core#0": "flag{responsible_disclosure}",
    "c1-os-5.9-core#1": "flag{authorized}",
    "c1-os-5.9-core#2": "flag{least_privilege}",

    "c1-comp-10.1-core#0": "flag{capture_the_flag}",
    "c1-comp-10.1-core#1": "flag{defense}",
    "c1-comp-10.1-core#2": "flag{points}",

    "c1-comp-10.2-core#0": "flag{steganography}",
    "c1-comp-10.2-core#1": "flag{pivot}",
    "c1-comp-10.2-core#2": "flag{header}",

    "c1-comp-10.3-core#0": "flag{cyberchef}",
    "c1-comp-10.3-core#1": "flag{nmap}",
    "c1-comp-10.3-core#2": "flag{tcpdump}",

    "c1-fw-review-11.1#0": "flag{availability}",
    "c1-fw-review-11.1#1": "flag{accounting}",
    "c1-fw-review-11.1#2": "flag{authentication}",

    "c1-fw-review-11.2#0": "flag{6}",
    "c1-fw-review-11.2#1": "flag{protect}",
    "c1-fw-review-11.2#2": "flag{detect}",

    "c1-fw-review-11.3#0": "flag{adversary}",
    "c1-fw-review-11.3#1": "flag{technique}",
    "c1-fw-review-11.3#2": "flag{tactic}",

    "c1-fw-review-11.4#0": "flag{security}",
    "c1-fw-review-11.4#1": "flag{groups}",
    "c1-fw-review-11.4#2": "flag{ig1}",

    "c1-fw-review-11.5#0": "flag{hipaa}",
    "c1-fw-review-11.5#1": "flag{coppa}",
    "c1-fw-review-11.5#2": "flag{cfaa}",

    "c1-fw-review-11.6#0": "flag{no}",
    "c1-fw-review-11.6#1": "flag{cfaa}",
    "c1-fw-review-11.6#2": "flag{darkside}",

    "c1-fw-11.1-core#0": "flag{confidentiality}",
    "c1-fw-11.1-core#1": "flag{availability}",
    "c1-fw-11.1-core#2": "flag{accounting}",

    "c1-fw-11.2-core#0": "flag{identify}",
    "c1-fw-11.2-core#1": "flag{detect}",
    "c1-fw-11.2-core#2": "flag{govern}",

    "c1-fw-11.3-core#0": "flag{adversary}",
    "c1-fw-11.3-core#1": "flag{technique}",
    "c1-fw-11.3-core#2": "flag{tactic}",

    "c1-fw-11.4-core#0": "flag{defense}",
    "c1-fw-11.4-core#1": "flag{availability}",
    "c1-fw-11.4-core#2": "flag{85}",

    "c1-fw-11.5-core#0": "flag{credit_card}",
    "c1-fw-11.5-core#1": "flag{dtsa}",
    "c1-fw-11.5-core#2": "flag{photo}",

    "c1-fw-11.6-core#0": "flag{exploration}",
    "c1-fw-11.6-core#1": "flag{cfaa}",
    "c1-fw-11.6-core#2": "flag{colonial_pipeline}",

    "c1-net-6.1-core#0": "flag{resource}",
    "c1-net-6.1-core#1": "flag{lan}",
    "c1-net-6.1-core#2": "flag{dns}",

    "c1-net-6.2-core#0": "flag{switch}",
    "c1-net-6.2-core#1": "flag{router}",
    "c1-net-6.2-core#2": "flag{wireless_access_point}",

    "c1-net-6.3-core#0": "flag{star}",
    "c1-net-6.3-core#1": "flag{bus}",
    "c1-net-6.3-core#2": "flag{mesh}",

    "c1-net-6.4-core#0": "flag{mac}",
    "c1-net-6.4-core#1": "flag{ip}",
    "c1-net-6.4-core#2": "flag{static}",

    "c1-net-6.5-core#0": "flag{port}",
    "c1-net-6.5-core#1": "flag{443}",
    "c1-net-6.5-core#2": "flag{telnet}",

    "c1-net-6.6-core#0": "flag{7}",
    "c1-net-6.6-core#1": "flag{4}",
    "c1-net-6.6-core#2": "flag{udp}",

    "c1-net-6.7-core#0": "flag{ping}",
    "c1-net-6.7-core#1": "flag{traceroute}",
    "c1-net-6.7-core#2": "flag{netstat}",

    "c1-thr-7.1-core#0": "flag{attack_surface}",
    "c1-thr-7.1-core#1": "flag{human}",
    "c1-thr-7.1-core#2": "flag{defense_in_depth}",

    "c1-thr-7.2-core#0": "flag{osint}",
    "c1-thr-7.2-core#1": "flag{persistence}",
    "c1-thr-7.2-core#2": "flag{lateral_movement}",

    "c1-thr-7.3-core#0": "flag{misconfiguration}",
    "c1-thr-7.3-core#1": "flag{unpatched_software}",
    "c1-thr-7.3-core#2": "flag{zero_day}",

    "c1-thr-7.4-core#0": "flag{vector}",
    "c1-thr-7.4-core#1": "flag{payload}",
    "c1-thr-7.4-core#2": "flag{worm}",

    "c1-thr-7.5-core#0": "flag{brute_force}",
    "c1-thr-7.5-core#1": "flag{ddos}",
    "c1-thr-7.5-core#2": "flag{sql_injection}",

    "c1-thr-7.6-core#0": "flag{impact}",
    "c1-thr-7.6-core#1": "flag{transfer}",
    "c1-thr-7.6-core#2": "flag{acceptance}",

    "c1-thr-7.7-core#0": "flag{self_reflection}",
    "c1-thr-7.7-core#1": "flag{exemplars}",
    "c1-thr-7.7-core#2": "flag{imagination}",

    "c1-sc-8.1-core#0": "flag{cia_triad}",
    "c1-sc-8.1-core#1": "flag{integrity}",
    "c1-sc-8.1-core#2": "flag{control}",

    "c1-sc-8.2-core#0": "flag{technical}",
    "c1-sc-8.2-core#1": "flag{managerial}",
    "c1-sc-8.2-core#2": "flag{preventative}",

    "c1-sc-8.3-core#0": "flag{policy}",
    "c1-sc-8.3-core#1": "flag{offboarding}",
    "c1-sc-8.3-core#2": "flag{background_check}",

    "c1-sc-8.4-core#0": "flag{authentication}",
    "c1-sc-8.4-core#1": "flag{authorization}",
    "c1-sc-8.4-core#2": "flag{privilege}",

    "c1-sc-8.5-core#0": "flag{physical}",
    "c1-sc-8.5-core#1": "flag{hvac}",
    "c1-sc-8.5-core#2": "flag{suppression_system}",

  },

  /* ---- CYBER 2 · NEMESIS — 138 answers ---- */
  "cyber2": {
    "m1-1.1-field#0": "flag{cybersecurity}",
    "m1-1.1-field#1": "flag{healthcare}",
    "m1-1.1-field#2": "flag{current_event}",

    "m1-1.2-adversary#0": "flag{hacktivist}",
    "m1-1.2-adversary#1": "flag{apt}",
    "m1-1.2-adversary#2": "flag{insider_threat}",

    "m1-1.3-surface#0": "flag{surface}",
    "m1-1.3-surface#1": "flag{digital}",
    "m1-1.3-surface#2": "flag{human}",

    "m1-1.3ext-physical#0": "flag{physical}",
    "m1-1.3ext-physical#1": "flag{server_room}",
    "m1-1.3ext-physical#2": "flag{surface}",

    "m1-1.4-stations#0": "flag{evil_twin}",
    "m1-1.4-stations#1": "flag{jamming}",
    "m1-1.4-stations#2": "flag{war_driving}",

    "m1-1.4ext-malware#0": "flag{ransomware}",
    "m1-1.4ext-malware#1": "flag{trojan}",
    "m1-1.4ext-malware#2": "flag{worm}",

    "m2-2.2-lure#0": "flag{phishing}",
    "m2-2.2-lure#1": "flag{spear_phishing}",
    "m2-2.2-lure#2": "flag{whaling}",

    "m1-1.5-auth#0": "flag{multi_factor}",
    "m1-1.5-auth#1": "flag{vpn}",
    "m1-1.5-auth#2": "flag{reuse}",

    "m1-1.5ext-habits#0": "flag{physically}",
    "m1-1.5ext-habits#1": "flag{updated}",
    "m1-1.5ext-habits#2": "flag{carefully}",

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

    "m1-perform-scenario#0": "flag{low}",
    "m1-perform-scenario#1": "flag{surface}",
    "m1-perform-scenario#2": "flag{virtual_private_network}",

    "m2-aup#0": "flag{aup}",
    "m2-aup#1": "flag{incident_response}",
    "m2-aup#2": "flag{sla}",

    "m2-awareness#0": "flag{security_awareness}",
    "m2-awareness#1": "flag{phishing_simulation}",
    "m2-awareness#2": "flag{security_culture}",

    "m2-controls#0": "flag{preventative}",
    "m2-controls#1": "flag{detective}",
    "m2-controls#2": "flag{administrative}",

    "m11sec-statesofdata#0": "flag{in_use}",
    "m11sec-statesofdata#1": "flag{confidential}",
    "m11sec-statesofdata#2": "flag{tls}",

    "m11sec-managerial#0": "flag{restricted}",
    "m11sec-managerial#1": "flag{human_error}",
    "m11sec-managerial#2": "flag{aes_256}",

    "m11sec-law#0": "flag{ferpa}",
    "m11sec-law#1": "flag{coppa}",
    "m11sec-law#2": "flag{pci_dss}",

    "m11sec-access#0": "flag{dac}",
    "m11sec-access#1": "flag{rubac}",
    "m11sec-access#2": "flag{read_up}",

    "m11sec-chmod#0": "flag{nothing}",
    "m11sec-chmod#1": "flag{740}",
    "m11sec-chmod#2": "flag{owner_group_others}",

    "m11sec-securedesign#0": "flag{default}",
    "m11sec-securedesign#1": "flag{radical_transparency}",
    "m11sec-securedesign#2": "flag{leadership}",

    "m11sec-sanitize#0": "flag{validation}",
    "m11sec-sanitize#1": "flag{stripping}",
    "m11sec-sanitize#2": "flag{encoding}",

    "m11sec-detect#0": "flag{honeypot}",
    "m11sec-detect#1": "flag{log_analysis}",
    "m11sec-detect#2": "flag{data_loss_prevention}",

    "m11sec-hash#0": "flag{verification}",
    "m11sec-hash#1": "flag{authentic}",
    "m11sec-hash#2": "flag{collision}",

    "m11sec-logs#0": "flag{directory_traversal}",
    "m11sec-logs#1": "flag{sql_injection}",
    "m11sec-logs#2": "flag{buffer_overflow}",

    "m10app-basics#0": "flag{buffer}",
    "m10app-basics#1": "flag{insert}",
    "m10app-basics#2": "flag{delete}",

    "m10app-sqlcount#0": "flag{count}",
    "m10app-sqlcount#1": "flag{3}",
    "m10app-sqlcount#2": "flag{techbytes}",

    "m10app-attacks#0": "flag{sql_injection}",
    "m10app-attacks#1": "flag{stored}",
    "m10app-attacks#2": "flag{2}",

    "m10app-bufferoverflow#0": "flag{michelle111}",
    "m10app-bufferoverflow#1": "flag{buffer_overflow}",
    "m10app-bufferoverflow#2": "flag{128}",

    "m10app-blast#0": "flag{database}",
    "m10app-blast#1": "flag{browsers}",
    "m10app-blast#2": "flag{server}",

    "m9comp-intro#0": "flag{capture_the_flag}",
    "m9comp-intro#1": "flag{defense_offense}",
    "m9comp-intro#2": "flag{accuracy}",

    "m9comp-crypto#0": "flag{plaintext}",
    "m9comp-crypto#1": "flag{flag}",
    "m9comp-crypto#2": "flag{hybrid}",

    "m9comp-forensics#0": "flag{magic_bytes}",
    "m9comp-forensics#1": "flag{exif}",
    "m9comp-forensics#2": "flag{pdf}",

    "m9comp-tools#0": "flag{cyberchef}",
    "m9comp-tools#1": "flag{crackstation}",
    "m9comp-tools#2": "flag{site}",

    "m9comp-strategy#0": "flag{base64}",
    "m9comp-strategy#1": "flag{nested_encoding}",
    "m9comp-strategy#2": "flag{scribe}",

    "m9comp-mockctf#0": "flag{pivot}",
    "m9comp-mockctf#1": "flag{guessing}",
    "m9comp-mockctf#2": "flag{shared_brain}",

    "m8dev-ioctypes#0": "flag{host_based}",
    "m8dev-ioctypes#1": "flag{file_based}",
    "m8dev-ioctypes#2": "flag{behavior_based}",

    "m8dev-detect#0": "flag{signature_based}",
    "m8dev-detect#1": "flag{anomaly_based}",
    "m8dev-detect#2": "flag{hybrid}",

    "m8dev-logs#0": "flag{device_logs}",
    "m8dev-logs#1": "flag{authentication_logs}",
    "m8dev-logs#2": "flag{password_compromise}",

    "m2-hardware#0": "flag{tpm}",
    "m2-hardware#1": "flag{full disk}",
    "m2-hardware#2": "flag{secure boot}",

    "m2-leastpriv#0": "flag{least_privilege}",
    "m2-leastpriv#1": "flag{separation_of_duties}",
    "m2-leastpriv#2": "flag{job_rotation}",

    "m2-adversary-types#0": "flag{script_kiddie}",
    "m2-adversary-types#1": "flag{hacktivist}",
    "m2-adversary-types#2": "flag{insider_threat}",

    "m4-attacks#0": "flag{tailgating}",
    "m4-attacks#1": "flag{shoulder_surfing}",
    "m4-attacks#2": "flag{card_cloning}",

    "m4-vulns#0": "flag{natural_threats}",
    "m4-vulns#1": "flag{unsecured_access}",
    "m4-vulns#2": "flag{hardware_theft}",

    "m4-protect#0": "flag{visitor_log}",
    "m4-protect#1": "flag{background_check}",
    "m4-protect#2": "flag{security_policy}",

    "m4-controls#0": "flag{rfid}",
    "m4-controls#1": "flag{rbac}",
    "m4-controls#2": "flag{mantrap}",

    "m7dev-vulns#0": "flag{end_of_life}",
    "m7dev-vulns#1": "flag{default_credentials}",
    "m7dev-vulns#2": "flag{back_door}",

    "m7dev-hashing#0": "flag{hash}",
    "m7dev-hashing#1": "flag{collision}",
    "m7dev-hashing#2": "flag{deprecated}",

    "m7dev-malware#0": "flag{ransomware}",
    "m7dev-malware#1": "flag{keylogger}",
    "m7dev-malware#2": "flag{trojan_horse}",

    "m7dev-risk#0": "flag{impact}",
    "m7dev-risk#1": "flag{low}",
    "m7dev-risk#2": "flag{residual}",

    "m7dev-auth#0": "flag{know}",
    "m7dev-auth#1": "flag{are}",
    "m7dev-auth#2": "flag{multi_factor}",

    "m7dev-pwattacks#0": "flag{brute_force}",
    "m7dev-pwattacks#1": "flag{dictionary}",
    "m7dev-pwattacks#2": "flag{credential_stuffing}",

    "m5-netfund#0": "flag{host}",
    "m5-netfund#1": "flag{mac_address}",
    "m5-netfund#2": "flag{arp}",

    "m5-vulnrisk#0": "flag{misconfiguration}",
    "m5-vulnrisk#1": "flag{unpatched_software}",
    "m5-vulnrisk#2": "flag{zero_day}",

    "m5-adversarial#0": "flag{authorization}",
    "m5-adversarial#1": "flag{intent}",
    "m5-adversarial#2": "flag{red_team}",

    "m6-managerial#0": "flag{router_security}",
    "m6-managerial#1": "flag{vpn}",
    "m6-managerial#2": "flag{switch_security}",

    "m6-wireless#0": "flag{ssid}",
    "m6-wireless#1": "flag{mac_filtering}",
    "m6-wireless#2": "flag{wpa3}",

    "m6-firewalls#0": "flag{packet_filtering}",
    "m6-firewalls#1": "flag{stateful}",
    "m6-firewalls#2": "flag{ngfw}",

    "m6-acl#0": "flag{acl}",
    "m6-acl#1": "flag{deny}",
    "m6-acl#2": "flag{shadowed}",

    "m6-detection#0": "flag{signature}",
    "m6-detection#1": "flag{anomaly}",
    "m6-detection#2": "flag{nids}",

    "m6-logioc#0": "flag{brute_force}",
    "m6-logioc#1": "flag{flooding}",
    "m6-logioc#2": "flag{arp_poisoning}",

    "m6-ai#0": "flag{semi}",
    "m6-ai#1": "flag{siem}",
    "m6-ai#2": "flag{fatigue}",

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

  /* ---- BYTE BOUNTY · AP CSP · ADA — 63 answers ---- */
  "apcsp": {
    "ap-m1a#0": "flag{algorithm}",
    "ap-m1a#1": "flag{ambiguity}",
    "ap-m1a#2": "flag{task}",

    "ap-m1-robotrun#0": "flag{6}",
    "ap-m1-robotrun#1": "flag{9}",
    "ap-m1-robotrun#2": "flag{7}",

    "ap-m1b#0": "flag{abstraction}",
    "ap-m1b#1": "flag{decomposition}",
    "ap-m1b#2": "flag{generalized}",

    "ap-m1-reading#0": "flag{imperative}",
    "ap-m1-reading#1": "flag{qualifiers}",
    "ap-m1-reading#2": "flag{unambiguously}",

    "ap-m1-cia#0": "flag{confidentiality}",
    "ap-m1-cia#1": "flag{integrity}",
    "ap-m1-cia#2": "flag{availability}",

    "ap-m1-ambiguity#0": "flag{ambiguous}",
    "ap-m1-ambiguity#1": "flag{prepositional phrase}",
    "ap-m1-ambiguity#2": "flag{parse trees}",

    "ap-m1-langs#0": "flag{artificial language}",
    "ap-m1-langs#1": "flag{visual}",
    "ap-m1-langs#2": "flag{syntax}",

    "ap-m1-langlevel2#0": "flag{high}",
    "ap-m1-langlevel2#1": "flag{low}",
    "ap-m1-langlevel2#2": "flag{compilation}",

    "ap-m1-effic2#0": "flag{efficiency}",
    "ap-m1-effic2#1": "flag{binary search}",
    "ap-m1-effic2#2": "flag{scalability}",

    "ap-m1-speedup#0": "flag{parallel computing}",
    "ap-m1-speedup#1": "flag{speedup}",
    "ap-m1-speedup#2": "flag{4}",

    "ap-m1-moore#0": "flag{moores law}",
    "ap-m1-moore#1": "flag{18}",
    "ap-m1-moore#2": "flag{100}",

    "ap-m1-heuristics#0": "flag{heuristic}",
    "ap-m1-heuristics#1": "flag{optimal}",
    "ap-m1-heuristics#2": "flag{speed}",

    "ap-m1-antibias#0": "flag{incoding}",
    "ap-m1-antibias#1": "flag{inclusive}",
    "ap-m1-antibias#2": "flag{bias auditing}",

    "ap-m1-flowchart#0": "flag{decision}",
    "ap-m1-flowchart#1": "flag{input output}",
    "ap-m1-flowchart#2": "flag{3}",

    "ap-m1-caesar#0": "flag{plaintext}",
    "ap-m1-caesar#1": "flag{a}",
    "ap-m1-caesar#2": "flag{hfg}",

    "ap-m1-vigenere#0": "flag{keyword}",
    "ap-m1-vigenere#1": "flag{frequency analysis}",
    "ap-m1-vigenere#2": "flag{kf}",

    "ap-m1-keys#0": "flag{key}",
    "ap-m1-keys#1": "flag{symmetric}",
    "ap-m1-keys#2": "flag{asymmetric}",

    "ap-m1-ciphergauntlet#0": "flag{apcsp lets go}",
    "ap-m1-ciphergauntlet#1": "flag{kelly green and white}",
    "ap-m1-ciphergauntlet#2": "flag{ada is watching}",

    "ap-m1-y2k#0": "flag{year 2000}",
    "ap-m1-y2k#1": "flag{two}",
    "ap-m1-y2k#2": "flag{2000}",

    "ap-m1-langs#0": "flag{artificial language}",
    "ap-m1-langs#1": "flag{high}",
    "ap-m1-langs#2": "flag{low}",

    "ap-m1-pseudocode#0": "flag{pseudocode}",
    "ap-m1-pseudocode#1": "flag{testing}",
    "ap-m1-pseudocode#2": "flag{10}",

    "ap-m1-bias#0": "flag{bias}",
    "ap-m1-bias#1": "flag{diversity}",
    "ap-m1-bias#2": "flag{redlining}",

    "ap-m2a#0": "flag{function}",
    "ap-m2a#1": "flag{logical}",
    "ap-m2a#2": "flag{list}",

    "ap-m2b#0": "flag{debugging}",
    "ap-m2b#1": "flag{logic}",
    "ap-m2b#2": "flag{api}",

    "ap-m2c#0": "flag{typecasting}",
    "ap-m2c#1": "flag{type_error}",
    "ap-m2c#2": "flag{53}",

    "ap-m2d#0": "flag{and}",
    "ap-m2d#1": "flag{b}",
    "ap-m2d#2": "flag{small}",

    "ap-m2e#0": "flag{for}",
    "ap-m2e#1": "flag{while}",
    "ap-m2e#2": "flag{6}",

    "ap-m2f#0": "flag{index}",
    "ap-m2f#1": "flag{m}",
    "ap-m2f#2": "flag{8}",

    "ap-m2g#0": "flag{index}",
    "ap-m2g#1": "flag{2}",
    "ap-m2g#2": "flag{index_error}",

    "ap-m2h#0": "flag{traversal}",
    "ap-m2h#1": "flag{18}",
    "ap-m2h#2": "flag{2}",

    "ap-m2i#0": "flag{parameter}",
    "ap-m2i#1": "flag{return_value}",
    "ap-m2i#2": "flag{20}",

    "ap-m2j#0": "flag{syntax_error}",
    "ap-m2j#1": "flag{runtime_error}",
    "ap-m2j#2": "flag{logic_error}",

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

    "ap-m3c#0": "flag{copyright}",
    "ap-m3c#1": "flag{creative_commons}",
    "ap-m3c#2": "flag{infringement}",

    "ap-m3d#0": "flag{unicode}",
    "ap-m3d#1": "flag{ascii}",
    "ap-m3d#2": "flag{128}",

    "ap-m3e#0": "flag{floating}",
    "ap-m3e#1": "flag{rounding_error}",
    "ap-m3e#2": "flag{range}",

    "ap-m3g#0": "flag{sampling}",
    "ap-m3g#1": "flag{rate}",
    "ap-m3g#2": "flag{doubles}",

    "ap-m4a#0": "flag{metadata}",
    "ap-m4a#1": "flag{data mining}",
    "ap-m4a#2": "flag{correlation}",

    "ap-m4b#0": "flag{visualization}",
    "ap-m4b#1": "flag{record}",
    "ap-m4b#2": "flag{algorithmic bias}",

    "ap-m4c#0": "flag{persistent}",
    "ap-m4c#1": "flag{breach}",
    "ap-m4c#2": "flag{overcollection}",

    "ap-m4d#0": "flag{unstructured}",
    "ap-m4d#1": "flag{screenscraping}",
    "ap-m4d#2": "flag{privacy}",

    "ap-m4e#0": "flag{outlier}",
    "ap-m4e#1": "flag{anomaly_detection}",
    "ap-m4e#2": "flag{95}",

    "ap-m4f#0": "flag{model}",
    "ap-m4f#1": "flag{simulation}",
    "ap-m4f#2": "flag{assumptions}",

    "ap-m4g#0": "flag{crowdsourcing}",
    "ap-m4g#1": "flag{human_computation}",
    "ap-m4g#2": "flag{sum}",

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

    "ap-m6c#0": "flag{social}",
    "ap-m6c#1": "flag{engine}",
    "ap-m6c#2": "flag{bubble}",

    "ap-m6d#0": "flag{cloud}",
    "ap-m6d#1": "flag{scalability}",
    "ap-m6d#2": "flag{failure}",

    "ap-m6e#0": "flag{digital_divide}",
    "ap-m6e#1": "flag{broadband}",
    "ap-m6e#2": "flag{literacy}",

    "ap-m6f#0": "flag{router}",
    "ap-m6f#1": "flag{protocol}",
    "ap-m6f#2": "flag{ip}",

    "ap-m6g#0": "flag{tcp}",
    "ap-m6g#1": "flag{domain_name_system}",
    "ap-m6g#2": "flag{ip}",

    "ap-m6h#0": "flag{things}",
    "ap-m6h#1": "flag{world_wide_web}",
    "ap-m6h#2": "flag{service}",

    "ap-m6i#0": "flag{restricted}",
    "ap-m6i#1": "flag{spyware}",
    "ap-m6i#2": "flag{denial_of_service}",

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

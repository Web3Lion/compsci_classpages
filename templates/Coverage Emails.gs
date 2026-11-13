/**
 * Staff Hub — Coverage Emails
 * Paste into the office sheet: Extensions → Apps Script → replace Code.gs → Save.
 * Reload the sheet; a "Staff Hub" menu appears.
 *
 * Emails every TEACHER (Staff tab role = Teacher) who appears in today's Coverage grid.
 * Re-running only emails people whose assignments changed (marked "Updated"),
 * and tells anyone whose coverage was removed. Day subs and building subs are never emailed.
 */

var CFG = {
  officeName: 'SFHS Main Office',
  hubUrl: 'https://sfdailyhub.vercel.app',   // ← replace with the Staff Hub link
  green: '#008539',
  coverageTab: 'Coverage',
  staffTab: 'Staff',
  scheduleTab: 'Schedule',
  bellTab: 'Bell Times',
  logTab: 'Email Log',
  clientId: '862223526242-tr3b0ieoq73nkt92la6ouksjeq3sp5g4.apps.googleusercontent.com',                              // ← Google OAuth Client ID (same one pasted into the hub)
  domain: 'southfayette.org',                // only accounts on this domain get data
  requireStaffList: false,                   // true = email must also be on the Staff tab (blocks students)
  officeEmails: [],                          // e.g. ['holley@southfayette.org'] — extra accounts always allowed
  autoSendHour: 7,                           // 7:00 AM backup send
  notifyCoTeachers: true                     // also send an FYI when a co-teacher is out
};

function ui_() { try { return SpreadsheetApp.getUi(); } catch (e) { return null; } }
var QUIET_ = null;   // full setup collects step messages here instead of popping one alert per step
function alert_(msg) { if (QUIET_) { QUIET_.push(String(msg)); return; } var u = ui_(); if (u) u.alert(msg); else Logger.log(msg); }

function onOpen() {
  var u = ui_(); if (!u) { Logger.log('onOpen only builds the menu when the Sheet is opened. Reload the Sheet tab instead of running this from the editor.'); return; }
  u.createMenu('Staff Hub')
    .addItem('Find a coverer', 'openCoverSidebar')
    .addItem('Approve pull from prep', 'approveSelectedPull')
    .addSeparator()
    .addItem('Preview coverage emails', 'previewCoverageEmails')
    .addItem('Send coverage emails', 'sendCoverageEmails')
    .addItem('Print sub schedules', 'printSubSchedules')
    .addSeparator()
    .addItem('Refresh Home', 'buildHome')
    .addSeparator()
    .addSubMenu(u.createMenu('Athletics')
      .addItem('Ask coaches for game results', 'sendGameUpdateRequests')
      .addItem('Pull games from website', 'pullGamesFromWebsite')
      .addItem('Update coaches from website', 'updateCoachesFromWebsite')
      .addItem('Fill missing coach emails', 'fillCoachEmails'))
    .addSubMenu(u.createMenu('Staff list')
      .addItem('Update staff from website', 'updateStaffFromWebsite')
      .addItem('Fill missing staff emails', 'fillStaffEmails'))
    .addSubMenu(u.createMenu('Fix a problem')
      .addItem('Refresh coverage colors & dropdowns', 'refreshCoverageColors')
      .addItem('Refresh schedule dropdown', 'refreshSchedDropdown')
      .addItem('Fill missing rooms on Coverage', 'fillMissingRooms')
      .addItem('Why isn\'t this trip showing? (select its row)', 'checkTripRow')
      .addSeparator()
      .addItem('Send me a test coverage email', 'testCoverageEmail')
      .addItem('Email troubleshooter', 'emailDiagnostics'))
    .addSubMenu(u.createMenu('Setup')
      .addItem('Run full setup (safe to re-run)', 'formatOfficeSheet')
      .addItem('Create field trip form', 'createTripForm')
      .addSeparator()
      .addItem('Turn on automatic tasks', 'installAutomations')
      .addItem('Fast sign-in only (no auto emails)', 'installKeepWarmOnly')
      .addItem('Turn off 7:00 AM auto emails', 'stopAutoSend'))
    .addToUi();
  try { var hm = SpreadsheetApp.getActive().getSheetByName('Home'); if (hm) { refreshHome_(); SpreadsheetApp.getActive().setActiveSheet(hm); } } catch (x) { Logger.log(x); }
}

/* Looks up each Staff row with a blank Email in the South Fayette Google Workspace directory.
   Setup once: Apps Script editor → Services (+) → People API → Add.
   Exact single match → filled in. Several matches → yellow cell with a note listing them so the office can pick. */
/* Directory first; if the district has directory sharing off, fall back to the runner's Gmail contacts
   ("Other contacts" = everyone this account has emailed). Only @southfayette.org addresses are kept. */
var DIR_OFF_ = false, WARM_ = false;
function lookup_(q) {
  var keep = function (r) { (r.people || []).forEach(function (p) { p.emailAddresses = (p.emailAddresses || []).filter(function (e) { return /@southfayette\.org$/i.test(e.value); }); }); return r; };
  if (!DIR_OFF_) {
    try { return keep(People.People.searchDirectoryPeople({ query: q, readMask: 'names,emailAddresses', sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'], pageSize: 20 })); }
    catch (e) { if (/directory sharing|PERMISSION_DENIED|403/i.test(String(e))) DIR_OFF_ = true; else throw e; }
  }
  if (!WARM_) { try { People.OtherContacts.search({ query: '', readMask: 'names,emailAddresses' }); People.People.searchContacts({ query: '', readMask: 'names,emailAddresses' }); } catch (e) {} WARM_ = true; Utilities.sleep(1500); }
  var out = { people: [] };
  try { out.people = out.people.concat(People.OtherContacts.search({ query: q, readMask: 'names,emailAddresses', pageSize: 30 }).results || []).map(function (r) { return r.person || r; }); } catch (e) {}
  try { out.people = out.people.concat((People.People.searchContacts({ query: q, readMask: 'names,emailAddresses', pageSize: 30 }).results || []).map(function (r) { return r.person; })); } catch (e) {}
  // Other contacts often have no family name; match on the email's local part or display name instead
  out.people.forEach(function (p) {
    if (!p.names || !p.names.length || !p.names[0].familyName) {
      var dn = (p.names && p.names[0] && p.names[0].displayName) || '', em = (p.emailAddresses && p.emailAddresses[0] && p.emailAddresses[0].value) || '';
      var fam = dn.split(/\s+/).pop() || '';
      if (norm_(fam) !== norm_(q) && em.toLowerCase().indexOf(norm_(q)) >= 0) fam = q;
      p.names = [{ displayName: dn || em, familyName: fam }];
    }
  });
  var seen = {}; out.people = keep(out).people.filter(function (p) { var e = p.emailAddresses[0] && p.emailAddresses[0].value.toLowerCase(); if (!e || seen[e]) return false; seen[e] = 1; return true; });
  return out;
}

/* Staff Hub → Update staff from school website: reads the High School list on southfayette.org/StaffDirectory.aspx and adds anyone
   not already on the Staff tab (matched by email, then last name). New rows are highlighted yellow with a note. Nobody is removed;
   people on the Staff tab who are no longer on the website are listed in the summary so the office can decide. */
function updateStaffFromWebsite() {
  var url = 'https://www.southfayette.org/StaffDirectory.aspx', site;
  try { site = siteStaff_(url, 'South Fayette High School'); } catch (x) { return alert_('Could not read the staff directory: ' + x.message); }
  if (!site.length) return alert_('The website returned no staff. The directory page may have changed. Open the new "Staff Website Debug" tab, copy cells A1, A2 and A3, and send them to the hub builder.');
  var sh = sheet_(CFG.staffTab), v = sh.getDataRange().getValues(), h = v[0].map(function (x) { return String(x).trim(); });
  var cN = h.indexOf('Name'), cE = h.indexOf('Email'), cD = h.indexOf('Dept'), cR = h.indexOf('Role');
  var names = {}, emails = {}; for (var i = 1; i < v.length; i++) { if (v[i][cN]) names[norm_(v[i][cN])] = i; if (cE >= 0 && v[i][cE]) emails[String(v[i][cE]).toLowerCase().trim()] = i; }
  var role = function (t) { return /principal|director|superintendent/i.test(t) ? 'Admin' : /counsel/i.test(t) ? 'Counselor' : /teacher|instructor/i.test(t) ? 'Teacher' : /specialist|psycholog|social worker|speech|librar/i.test(t) ? 'Specialist' : 'Support'; };
  var add = [], seenSite = {};
  // Shared last names (two Smiths): the Staff tab uses "Smith, G." and "Smith, T.", matched on last name + first initial
  var lastCount = {}; site.forEach(function (p) { lastCount[norm_(p.last)] = (lastCount[norm_(p.last)] || 0) + 1; });
  var keyOf = function (last, first) { return lastCount[norm_(last)] > 1 && first ? norm_(last) + ', ' + first.charAt(0).toLowerCase() + '.' : norm_(last); };
  var findRow = function (p) { var k = keyOf(p.last, p.first); if (names[k] != null) return names[k];
    if (lastCount[norm_(p.last)] > 1) { var ini = (p.first || '').charAt(0).toLowerCase(); for (var n in names) { var m = /^(.+?),\s*([a-z])\.?$/.exec(n); if (m && m[1] === norm_(p.last) && m[2] === ini) return names[n]; } return null; }
    return null; };
  var filledEm = [];
  site.forEach(function (p) {
    var em = (p.email || '').toLowerCase(), k = keyOf(p.last, p.first); seenSite[k] = 1; seenSite[norm_(p.last)] = 1; if (em) seenSite[em] = 1;
    if (em && emails[em] != null) return;
    var at0 = findRow(p);
    if (at0 != null) { if (at0 > 0 && em && cE >= 0 && !v[at0][cE]) { sh.getRange(at0 + 1, cE + 1).setValue(em); v[at0][cE] = em; emails[em] = at0; filledEm.push(v[at0][cN] + ' → ' + em); } return; }
    var label = lastCount[norm_(p.last)] > 1 && p.first ? p.last + ', ' + p.first.charAt(0).toUpperCase() + '.' : p.last;
    var row = h.map(function () { return ''; }); row[cN] = label; if (cE >= 0) row[cE] = em; if (cD >= 0) row[cD] = p.title; if (cR >= 0) row[cR] = role(p.title);
    add.push(row); names[k] = -1;
  });
  if (add.length) { var at = sh.getLastRow() + 1, rg = sh.getRange(at, 1, add.length, h.length); rg.setValues(add); rg.setBackground('#fff4c2');
    sh.getRange(at, cN + 1, add.length, 1).setNote('Added from southfayette.org ' + Utilities.formatDate(new Date(), tz_(), 'M/d/yyyy') + '. Check room, dept and periods, then clear the yellow.'); }
  var noEm = 0; if (add.length && cE >= 0) add.forEach(function (r, k) { if (r[cE]) return;   // not on the website: look it up in the district Google directory
    var em = ''; try { if (typeof People !== 'undefined') { var hits = (lookup_(r[cN]).people || []).filter(function (p) { return (p.names || []).some(function (n) { return norm_(n.familyName) === norm_(r[cN]); }) && (p.emailAddresses || []).length; }); if (hits.length === 1) em = hits[0].emailAddresses[0].value.toLowerCase(); } } catch (x) {}
    if (em) { r[cE] = em; sh.getRange(at + k, cE + 1).setValue(em); } else noEm++; Utilities.sleep(150); });
  var gone = []; for (var j = 1; j < v.length; j++) { var nm = String(v[j][cN] || '').trim(), e2 = cE >= 0 ? String(v[j][cE] || '').toLowerCase().trim() : ''; if (nm && !seenSite[norm_(nm)] && !seenSite[norm_(nm.split(',')[0])] && !(e2 && seenSite[e2])) gone.push(nm); }
  STAFF_MEMO_ = null; bumpHubCache_(); try { linkStaffNames_(); } catch (x) {}
  alert_('Website lists ' + site.length + ' High School staff.' + (filledEm.length ? '\n\nFilled ' + filledEm.length + ' blank email(s): ' + filledEm.join(', ') + '.' : '') + '\n\nAdded ' + add.length + ' new: ' + (add.map(function (r) { return r[cN]; }).join(', ') || 'none') + '.' +
    (noEm ? '\n' + noEm + ' still need an email (more than one match or not found). Type them in, or run Staff Hub → Fill missing staff emails.' : '') +
    (gone.length ? '\n\nOn the Staff tab but not on the website (not removed): ' + gone.join(', ') + '. Subs, coaches and staff from other buildings show here too.' : ''));
}
function siteStaff_(url, building) {
  var dec = function (s) { return String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }).replace(/&#x([0-9a-f]+);/gi, function (_, n) { return String.fromCharCode(parseInt(n, 16)); }); };
  var txt = function (s) { return dec(String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); };
  var cf = function (hex) { var k = parseInt(hex.substr(0, 2), 16), o = ''; for (var i = 2; i < hex.length; i += 2) o += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k); return o; };
  var r1 = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true }), html = r1.getContentText();
  var ck = [].concat(r1.getAllHeaders()['Set-Cookie'] || []).map(function (c) { return String(c).split(';')[0]; }).join('; ');
  var form = {}, m, re = /<input[^>]*>/gi;
  while ((m = re.exec(html))) { var tag = m[0], nm = (tag.match(/name="([^"]+)"/i) || [])[1]; if (!nm) continue; var ty = ((tag.match(/type="([^"]+)"/i) || [])[1] || 'text').toLowerCase();
    if (ty === 'hidden' || ty === 'text' || ty === 'search') form[nm] = dec((tag.match(/value="([^"]*)"/i) || [])[1] || ''); }
  var sel = null, rs = /<select[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi;
  while ((m = rs.exec(html))) { var op = m[2].match(new RegExp('<option[^>]*value="([^"]*)"[^>]*>\\s*' + building + '\\s*<', 'i')); if (op) { sel = m[1]; form[sel] = dec(op[1]); } }
  if (!sel) throw new Error('building list not found on the page');
  var sb = html.match(/<input[^>]*type="(?:submit|image)"[^>]*>/gi) || [], btn = sb.filter(function (t) { return /search|go/i.test(t); })[0] || sb[0];
  if (btn) { var bn = (btn.match(/name="([^"]+)"/i) || [])[1]; if (bn) form[bn] = dec((btn.match(/value="([^"]*)"/i) || [])[1] || 'Search'); }
  else { var pb = html.match(/__doPostBack\('([^']+)'[^)]*\)[^>]*>(?:\s*<[^>]+>)*\s*Search/i); if (pb) form.__EVENTTARGET = pb[1]; }
  var post = function (f) { var r = UrlFetchApp.fetch(url, { method: 'post', payload: f, headers: ck ? { Cookie: ck } : {}, muteHttpExceptions: true, followRedirects: true }); return r.getContentText(); };
  var out = [], seen = {}, page = post(form), pages = 0;
  while (page && pages < 25) {
    pages++;
    (page.split(/class="scName"/i).slice(1)).forEach(function (blk) {   // LINQ directory: one block per person (scName "Last, First", scTitle, scEmail with encoded mailto)
      blk = blk.split(/lblOuterDiv/i)[0];
      var nm = txt(blk.slice(blk.indexOf('>') + 1, blk.search(/<\/span>/i))), ti = (blk.match(/class="scTitle"[^>]*>([\s\S]*?)<\/span>/i) || [])[1], ea = (blk.match(/class=['"]scEmail['"][^>]*>([\s\S]*?)<\/a>/i) || [])[1] || (blk.match(/href='([^']+)'\s*class='scEmail'/i) || [])[1] || '';
      var em = dec(dec(ea)).replace(/^mailto:/i, '').replace(/<[^>]+>/g, '').trim().toLowerCase(), parts = nm.split(','), last = (parts[0] || '').trim(), first = (parts.slice(1).join(',') || '').trim();
      if (!last) return; var key = (em || first + ' ' + last).toLowerCase(); if (seen[key]) return; seen[key] = 1;
      out.push({ first: first, last: last, email: /@/.test(em) ? em : '', title: ti ? txt(ti) : '' });
    });
    var head = null, rows = out.length ? [] : (page.match(/<tr[\s\S]*?<\/tr>/gi) || []);
    rows.forEach(function (tr) {
      var th = tr.match(/<th[\s\S]*?<\/th>/gi); if (th && th.length >= 2) { head = th.map(function (c) { return txt(c).toLowerCase(); }); return; }
      var td = tr.match(/<td[\s\S]*?<\/td>/gi) || []; if (td.length < 2) return;
      var cells = td.map(txt), raw = tr, em = (raw.match(/mailto:([^"?'\s]+)/i) || [])[1] || '';
      var cfm = raw.match(/data-cfemail="([0-9a-f]+)"/i) || raw.match(/email-protection#([0-9a-f]+)/i); if (!em && cfm) em = cf(cfm[1]);
      if (!em) { var pe = cells.join(' ').match(/[\w.+-]+@southfayette\.org/i); if (pe) em = pe[0]; }
      var ix = function (k) { return head ? head.findIndex(function (x) { return x.indexOf(k) >= 0; }) : -1; };
      var first = ix('first') >= 0 ? cells[ix('first')] : cells[0], last = ix('last') >= 0 ? cells[ix('last')] : cells[1], title = ix('title') >= 0 ? cells[ix('title')] : (cells[3] || cells[2] || '');
      if (!last || /^(first|last|name)$/i.test(last) || /@/.test(last) || last.length > 40) return;
      var key = (em || first + ' ' + last).toLowerCase(); if (seen[key]) return; seen[key] = 1;
      out.push({ first: first, last: last, email: /@/.test(em) ? em : '', title: /@/.test(title) ? '' : title });
    });
    var nx = page.match(new RegExp("__doPostBack\\(&#39;([^&]+)&#39;,&#39;(Page\\$" + (pages + 1) + ")&#39;\\)")) || page.match(new RegExp("__doPostBack\\('([^']+)','(Page\\$" + (pages + 1) + ")'\\)"));
    if (!nx) break;
    var f2 = {}; (page.match(/<input[^>]*type="hidden"[^>]*>/gi) || []).forEach(function (t) { var n = (t.match(/name="([^"]+)"/i) || [])[1]; if (n) f2[n] = dec((t.match(/value="([^"]*)"/i) || [])[1] || ''); });
    f2[sel] = form[sel]; f2.__EVENTTARGET = dec(nx[1]); f2.__EVENTARGUMENT = nx[2]; page = post(f2);
  }
  if (!out.length) {   // write what the site sent back to a hidden tab so it can be copied and sent for a fix
    var body = String(page || '').replace(/<head[\s\S]*?<\/head>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/\s+/g, ' '), at0 = body.search(/Staff Directory/i);
    var info = ['Posted fields: ' + Object.keys(form).filter(function (k) { return !/^__VIEWSTATE|__EVENTVALIDATION/.test(k); }).map(function (k) { return k + '=' + String(form[k]).slice(0, 40); }).join(' | '),
      'Counts: tr=' + (body.match(/<tr/gi) || []).length + ' mailto=' + (body.match(/mailto:/gi) || []).length + ' cfemail=' + (body.match(/cfemail|email-protection/gi) || []).length + ' @southfayette=' + (body.match(/@southfayette/gi) || []).length,
      'Body: ' + body.slice(Math.max(0, at0 - 200), Math.max(0, at0 - 200) + 40000)];
    try { var ss = SpreadsheetApp.getActive(), dsh = ss.getSheetByName('Staff Website Debug') || ss.insertSheet('Staff Website Debug'); dsh.clear(); dsh.getRange(1, 1, 3, 1).setValues(info.map(function (x) { return [x.slice(0, 49000)]; })); } catch (x) {}
    Logger.log('Staff Website Debug: ' + info[0] + ' || ' + info[1]);
  }
  return out;
}
/* Staff Hub → Update coaches from school website: reads each sport page on southfayette.org and rebuilds the Coaches tab
   (Sport | Level | Role | Name | Email | Season | On Staff tab). High school levels only; 7th/8th grade staffs are skipped. */
var SPORT_PAGES_ = ['Baseball', 'Basketball', 'Cheerleading', 'CrossCountry', 'Football', 'GirlsFlagFootball', 'Golf', 'HockeyClub', 'Lacrosse', 'Soccer', 'Softball', 'SwimmingDiving', 'Tennis', 'Track', 'Volleyball', 'Wrestling'];
function updateCoachesFromWebsite() {
  var dec = function (s) { return String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }); };
  var txt = function (s) { return dec(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); };
  var cf = function (hex) { var k = parseInt(hex.substr(0, 2), 16), o = ''; for (var i = 2; i < hex.length; i += 2) o += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k); return o; };
  var label = function (p) { return p.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Swimming Diving', 'Swimming/Diving'); };
  var cap = function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); };
  var abs = function (u) { u = dec(u); return /^https?:/i.test(u) ? u : 'https://www.southfayette.org/' + u.replace(/^\/+/, ''); };
  // Sports with separate Boys / Girls pages (left menu: Soccer → Boys Soccer, Girls Soccer) are read page by page. Links are searched across the whole page,
  // since the left menu nests the Boys/Girls links inside the sport. A link reading just "Boys" or "Girls" becomes "Boys Soccer" / "Girls Soccer".
  var parents = UrlFetchApp.fetchAll(SPORT_PAGES_.map(function (p) { return { url: 'https://www.southfayette.org/' + p + '.aspx', muteHttpExceptions: true }; })), pages = [], sub = [];
  parents.forEach(function (r, si) {
    var base = label(SPORT_PAGES_[si]), me = 'https://www.southfayette.org/' + SPORT_PAGES_[si] + '.aspx';
    if (r.getResponseCode() !== 200) { pages.push({ label: base, code: r.getResponseCode(), url: me }); return; }
    var html = r.getContentText(), m, re = /<a[^>]+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi, kids = [], seenU = {};
    while ((m = re.exec(html))) {
      var t = txt(m[2]).replace(/[’']/g, '').replace(/\s+/g, ' '); if (!t || t.length > 40 || /7th|8th|middle|junior high|jr\.? high|youth|club team|booster/i.test(t)) continue;
      var gm = /^(boys|girls)\b|\b(boys|girls)$/i.exec(t); if (!gm) continue;
      var rest = t.replace(/\b(boys|girls)\b/i, '').replace(/[-–:]/g, ' ').trim();
      if (rest && sportKey_(rest) !== sportKey_(base)) continue;
      var u = abs(m[1]); if (u.toLowerCase() === me.toLowerCase() || seenU[u.toLowerCase()]) continue; seenU[u.toLowerCase()] = 1;
      kids.push({ label: cap(gm[1] || gm[2]) + ' ' + base, url: u });
    }
    var byG = {}; kids = kids.filter(function (k) { if (byG[k.label]) return false; byG[k.label] = 1; return true; });
    if (kids.length) kids.forEach(function (k) { sub.push(pages.length); pages.push({ label: k.label, url: k.url, parent: html, base: base }); });
    else pages.push({ label: base, html: html, code: 200, url: me });
  });
  var subRes = sub.length ? UrlFetchApp.fetchAll(sub.map(function (i) { return { url: pages[i].url, muteHttpExceptions: true }; })) : [];
  subRes.forEach(function (r, j) { var p = pages[sub[j]]; p.code = r.getResponseCode(); if (p.code === 200) p.html = r.getContentText(); });
  var staff = staff_(), byLast = {}; Object.keys(staff).forEach(function (k) { byLast[norm_(staff[k].name)] = staff[k]; });
  var BAD = /varsity assistant|rotate|tbd|vacant|open|position|^n\/?a$/i;
  var person = function (sport, level, role, val) { var sur = val.replace(/,.*$/, '').split(' ').pop(), st = byLast[norm_(sur)]; return [sport, level || 'Varsity', role, val, st && st.email ? st.email : '', '', st ? 'Yes' : '']; };
  var parse = function (html, sportLabel, wantG) {   // returns coach rows from one page; wantG = 'Boys'/'Girls' keeps only that section of a shared page
    var out = [], season = ((txt(html).match(/Season:\s*([A-Za-z\/ ]+?)(?:\s{2}|Varsity|JV|\d|$)/) || [])[1] || '').trim();
    var main = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ''), st0 = main.search(/maincontent|Coaching Staff|Coaches/i); if (st0 > 0) main = main.slice(Math.max(0, st0 - 400));
    var level = '', sex = '', okSec = function () { return !(/7th|8th|middle|junior high|jr\.? high/i.test(level) && !/varsity|\bjv\b/i.test(level)) && (!wantG || !sex || sex === wantG || sex === 'Boys & Girls'); };   // skip junior-high-only staffs; "Varsity/JV/Junior High" is kept
    var lab = function () { return sex && !/^(boys|girls)/i.test(sportLabel) ? sex + ' ' + sportLabel : sportLabel; };   // one page holds both teams under "Girls Soccer" / "Boys Soccer" headings
    var heading = function (s) { var hs = s.match(/<(strong|b|h[1-6])[^>]*>([\s\S]*?)<\/(?:strong|b|h[1-6])>/gi) || []; hs.forEach(function (h) { var t = txt(h), isH = /^<h[1-3]/i.test(h); if (!t || t.length > 60 || /^south fayette/i.test(t)) return;
      if (/boys\s*(and|&)\s*girls|girls\s*(and|&)\s*boys|co-?ed/i.test(t)) { sex = 'Boys & Girls'; if (isH) level = ''; }
      else if (/\b(boys|girls)'?s?\b/i.test(t) && (isH || !/season/i.test(t))) { if (!/season/i.test(t)) { sex = cap(/\b(boys|girls)/i.exec(t)[1]); if (isH) level = ''; } }
      else if (isH && /^h2/i.test(h.slice(1, 3))) { sex = ''; level = ''; }
      if (/coach|varsity|\bjv\b|junior varsity|7th|8th|middle/i.test(t)) level = t.replace(/\s*Coaching Staff:?/i, '').replace(/^(boys|girls)\s*/i, '').replace(/\s*\/\s*(junior high|jr\.? high|middle school|ms|7th\/8th|7th|8th)( grade)?/ig, '').trim(); }); };
    main.split(/<table/i).forEach(function (ch, ci) {
      var parts = ch.split(/<\/table>/i), tb = ci === 0 ? '' : parts[0], after = ci === 0 ? ch : parts.slice(1).join('');
      if (tb && okSec()) { var last = null;
        (tb.match(/<tr[\s\S]*?<\/tr>/gi) || []).forEach(function (tr) {
          var td = tr.match(/<td[\s\S]*?<\/td>/gi) || []; if (td.length < 2) { heading(tr); return; }
          var role = txt(td[0]).replace(/:$/, ''), val = txt(td[1]);
          if (/^e-?mail/i.test(role) && last) { var ems = (td[1].match(/<a[^>]*email-protection#[0-9a-f]+[^>]*>[\s\S]*?<\/a>/gi) || []), vis = ems.filter(function (x) { return txt(x); }).pop() || ems.pop() || '', hx = (td[1].match(/data-cfemail="([0-9a-f]+)"/i) || [])[1] || (/email-protection#([0-9a-f]+)/i.exec(vis) || [])[1] || '', mt = (td[1].match(/mailto:([^"'?]+)/i) || [])[1]; var cand = [dec(mt || ''), hx ? cf(hx) : '', (txt(td[1]).replace(/\s+/g, '').match(/[\w.+-]+@southfayette(\.org)?/i) || [''])[0]].map(function (e) { e = String(e).toLowerCase().trim(); return /@southfayette$/.test(e) ? e + '.org' : e; }).filter(function (e) { return /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(e); }); last[4] = last[4] || cand[0] || ''; return; }
          if (!/coach|coordinator/i.test(role) || /athletic director|trainer|\bms\b|middle|7th|8th|junior high|jr\.? high/i.test(role) || !val || val.length > 60 || BAD.test(val)) return;
          val.split(/\s*(?:,|&|\band\b|\/)\s*(?=[A-Z])/).forEach(function (nm) { var vol = /\(vol/i.test(nm); nm = nm.replace(/\s*\(.*?\)\s*/g, ' ').trim(); if (vol) role = role.replace(/^(assistant )?coach/i, 'Volunteer $&'); if (nm.split(' ').length < 2 || BAD.test(nm)) return; last = person(lab(), /^jv\b|junior varsity/i.test(role) ? 'JV' : level, role, nm); last[5] = season; out.push(last); });
        }); }
      heading(after);
    });
    if (!out.length) {   // pages without tables: "Head Coach: First Last" lines
      level = ''; sex = '';
      main.split(/<br\s*\/?>|<\/p>|<\/li>|<\/div>|<\/h\d>/i).forEach(function (seg) { var t = txt(seg); if (!t) return; heading(seg);
        var mm = /^((?:head |assistant |asst\.? |volunteer |jv |varsity )*coach(?:es)?)\s*[:\-–]\s*(.+)$/i.exec(t);
        if (mm && okSec()) mm[2].split(/\s*(?:,|&|\band\b|\/)\s*(?=[A-Z])/).forEach(function (nm) { nm = nm.replace(/\s*\(.*?\)\s*/g, ' ').trim(); if (nm.split(' ').length < 2 || nm.length > 40 || BAD.test(nm)) return; var p = person(lab(), level, mm[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }), nm); p[5] = season; out.push(p); });
        else if (!mm && t.length < 60 && /^(boys|girls)\b/i.test(t)) sex = cap(t.split(' ')[0]); });
    }
    var T = txt(main);
    out.forEach(function (r) { var gx = /^girls/i.test(r[0]) ? 'girl' : /^boys/i.test(r[0]) && !/girls/i.test(r[0]) ? 'boy' : ''; var sm = gx ? new RegExp(gx + "'?s\\s+season:\\s*([A-Za-z]+)", 'i').exec(T) : null; sm = sm || /varsity(?:\/jv)?(?: indoor)?\s+season:\s*-?\s*([A-Za-z]+)/i.exec(T) || /season:\s*(?:varsity(?:\/jv)?\s*-\s*)?([A-Za-z]+)/i.exec(T); if (sm) r[5] = sm[1].charAt(0).toUpperCase() + sm[1].slice(1).toLowerCase(); });
    var mt2 = (html.match(/mailto:([^"'?]+)/gi) || []).map(function (x) { return dec(x.slice(7)).toLowerCase(); }).filter(function (e) { return /@southfayette\.org$/.test(e); });
    out.forEach(function (r) { if (r[4]) return; var sur = norm_(r[3].split(' ').pop()); var hit = mt2.filter(function (e) { return e.indexOf(sur) >= 0; }); if (hit.length === 1) r[4] = hit[0]; });
    return out;
  };
  var rows = [], failed = [], empty = [], dbg = '';
  pages.forEach(function (pg) {
    if (pg.code !== 200 || !pg.html) { failed.push(pg.label + ' (HTTP ' + pg.code + ')'); return; }
    var got = parse(pg.html, pg.label, '');
    if (!got.length && pg.parent) got = parse(pg.parent, pg.label, pg.label.split(' ')[0]);   // Boys/Girls page empty: try that section of the main sport page
    if (!got.length) { empty.push(pg.label); if (!dbg) dbg = pg.url + '\n' + txt(pg.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>/gi, '')).slice(0, 40000); }
    var seen = {}; got.forEach(function (r) { var k = norm_(r[0] + r[1] + r[3]); if (!seen[k]) { seen[k] = 1; rows.push(r); } });
  });
  try { var ssd = SpreadsheetApp.getActive(), dd = ssd.getSheetByName('Coaches Website Debug'); if (dbg) { dd = dd || ssd.insertSheet('Coaches Website Debug'); dd.clear(); dd.getRange(1, 1).setValue(dbg.slice(0, 49000)); } else if (dd) ssd.deleteSheet(dd); } catch (x) {}
  var teamList = {}; rows.forEach(function (r) { teamList[r[0]] = (teamList[r[0]] || 0) + 1; });
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Coaches') || ss.insertSheet('Coaches');
  var keep = {}; try { var ov = sh.getDataRange().getValues(); ov.slice(1).forEach(function (r) { if (r[3] && r[4]) keep[norm_(r[3])] = String(r[4]).trim(); }); } catch (x) {}   // emails typed or picked earlier survive a rebuild
  rows.forEach(function (r) { if (!r[4] && keep[norm_(r[3])]) r[4] = keep[norm_(r[3])]; });
  rows.sort(function (x, y) { return x[0].localeCompare(y[0]) || (/jv/i.test(x[1]) ? 1 : 0) - (/jv/i.test(y[1]) ? 1 : 0) || (/head/i.test(y[2]) ? 1 : 0) - (/head/i.test(x[2]) ? 1 : 0); });
  sh.clear(); sh.clearNotes(); var H = ['Sport', 'Level', 'Role', 'Name', 'Email', 'Season', 'On Staff tab'];
  sh.getRange(1, 1, 1, H.length).setValues([H]); headerStyle_(sh.getRange(1, 1, 1, H.length)); sh.setFrozenRows(1);
  if (rows.length) sh.getRange(2, 1, rows.length, H.length).setValues(rows);
  sh.setColumnWidth(1, 150); sh.setColumnWidth(3, 150); sh.setColumnWidth(4, 200); sh.setColumnWidth(5, 240);
  var fe = fillCoachEmails_(sh);
  alert_('Coaches tab updated: ' + rows.length + ' coaches, ' + Object.keys(teamList).length + ' teams.\n\n' + Object.keys(teamList).sort().map(function (k) { return k + ' (' + teamList[k] + ')'; }).join(', ') +
    (empty.length ? '\n\nNo coaches found on: ' + empty.join(', ') + '. Open the "Coaches Website Debug" tab, copy cell A1, and send it to the hub builder.' : '') + (failed.length ? '\nCould not open: ' + failed.join(', ') + '.' : '') + '\n\n' + fe.msg +
    '\n\nThe tab is rebuilt from the website each time. Emails you type in are kept.');
}
/* Coach emails not on the website: look each name up in the district Google directory (runs as whoever clicks it, same as Fill missing staff emails).
   One match fills the cell; several matches turn the cell yellow with the choices in a note. */
function fillCoachEmails() { var sh = SpreadsheetApp.getActive().getSheetByName('Coaches'); if (!sh) return alert_('No Coaches tab yet. Run Update coaches from school website first.'); alert_(fillCoachEmails_(sh).msg); }
function fillCoachEmails_(sh) {
  if (typeof People === 'undefined') return { msg: 'Coach emails not looked up: add the People API once (Extensions → Apps Script → Services → + → People API), then run Tools → Fill missing coach emails.' };
  var v = sh.getDataRange().getValues(), h = v[0], cN = h.indexOf('Name'), cE = h.indexOf('Email'), filled = 0, multi = 0, none = [], memo = {};
  for (var i = 1; i < v.length; i++) {
    var full = String(v[i][cN] || '').trim(), ec = sh.getRange(i + 1, cE + 1); if (!full) continue;
    if (v[i][cE]) continue;   // never overwrite an email that is already there
    var parts = full.replace(/\s+(jr|sr|ii|iii)\.?$/i, '').split(/\s+/), last = parts.pop(), first = parts[0] || '', cell = sh.getRange(i + 1, cE + 1);
    var key = norm_(full); if (!(key in memo)) { var res = {}; try { res = lookup_(full); if (!(res.people || []).length) res = lookup_(last); } catch (x) {} Utilities.sleep(150);
      // strict: last name must match exactly AND the first name must start with the same first 3 letters (Ryan → Rya…). No match = no suggestion.
      var lc = function (s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }, f3 = lc(first).slice(0, 3), seenE = {};
      var exact = (res.people || []).filter(function (p) { return (p.emailAddresses || []).length && f3 && (p.names || []).some(function (n) {
        var fam = lc(n.familyName), giv = lc(n.givenName), dn = String(n.displayName || '').trim().split(/\s+/);
        if (!fam && dn.length > 1) { fam = lc(dn[dn.length - 1]); giv = lc(dn[0]); }
        return fam === lc(last) && giv.slice(0, 3) === f3; }); })
        .filter(function (p) { var e = p.emailAddresses[0].value.toLowerCase(); if (seenE[e]) return false; seenE[e] = 1; return true; });
      memo[key] = exact.map(function (p) { return { name: p.names[0].displayName, email: p.emailAddresses[0].value.toLowerCase() }; }); }
    var m = memo[key];
    if (m.length === 1) { cell.setValue(m[0].email).setNote('').setBackground(null); filled++; }
    else if (m.length > 1) { cell.setNote('Pick one:\n' + m.map(function (x) { return x.name + ' – ' + x.email; }).join('\n')).setBackground('#fff4c2'); multi++; }
    else { cell.setNote('').setBackground(null); none.push(full); }
  }
  return { msg: 'Coach emails from the district directory (last name + first 3 letters of first name must match): ' + filled + ' filled' + (multi ? ', ' + multi + ' with several matches (yellow, hover for choices)' : '') + (none.length ? ', not found: ' + none.join(', ') + ' (likely not district accounts)' : '') + '.' };
}
/* ================= GAMES + RESULTS =================
   Games tab: one row per game. Staff Hub → Send game/activity update requests emails each coach with a game on the chosen date
   (opponent + a "Report the result" button). The button opens the hub, the coach enters the score and Win/Loss/Tie,
   and it is written back to that row. The hub shows Yesterday's and Today's results from this tab (no approval step). */
var GAME_H_ = ['Date', 'Sport', 'Level', 'Opponent', 'Event', 'Home/Away', 'Location', 'Time', 'Coach', 'Coach email', 'SF score', 'Opp score', 'Result', 'Place', 'Record', 'Highlights', 'Notes', 'Reported by', 'Reported at', 'Request sent', 'Sent by', 'Wrong coach', 'Source', 'Web key', 'ID'];
var GAME_RES_ = ['Win', 'Loss', 'Tie', 'Meet', 'Postponed', 'Cancelled'];
function gamesTab_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Games');
  if (!sh) { sh = ss.insertSheet('Games'); sh.getRange(1, 1, 1, GAME_H_.length).setValues([GAME_H_]); }
  var h = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String), miss = GAME_H_.filter(function (x) { return h.indexOf(x) < 0; });
  if (miss.length) sh.getRange(1, h.filter(String).length + 1, 1, miss.length).setValues([miss]);
  h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  var c = function (n) { return h.indexOf(n) + 1; }, n = Math.max(sh.getMaxRows() - 1, 200);
  headerStyle_(sh.getRange(1, 1, 1, h.length)); sh.setFrozenRows(1);
  sh.getRange(2, c('Date'), n, 1).setNumberFormat('ddd m/d/yy');
  sh.getRange(2, c('Result'), n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(GAME_RES_, true).setAllowInvalid(true).build());
  sh.getRange(2, c('Home/Away'), n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Home', 'Away', 'Neutral'], true).setAllowInvalid(true).build());
  try { var sp = SpreadsheetApp.getActive().getSheetByName('Coaches'); if (sp && sp.getLastRow() > 1) { var uq = []; sp.getRange(2, 1, sp.getLastRow() - 1, 1).getValues().forEach(function (r) { var s = String(r[0]).trim(); if (s && uq.indexOf(s) < 0) uq.push(s); }); uq.sort(); if (uq.length) sh.getRange(2, c('Sport'), n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(uq.slice(0, 500), true).setAllowInvalid(true).build()); } } catch (x) {}
  [c('Reported by'), c('Reported at'), c('Request sent'), c('Sent by'), c('Wrong coach')].forEach(function (k) { sh.getRange(2, k, n, 1).setFontColor('#5c5c5d'); });
  sh.getRange(2, c('Highlights'), n, 1).setWrap(true); sh.setColumnWidth(c('Highlights'), 320); sh.setColumnWidth(c('Event'), 220); sh.setColumnWidth(c('Location'), 180);
  sh.hideColumns(c('ID')); sh.hideColumns(c('Web key'));
  sh.getRange(2, c('Source'), n, 1).setFontColor('#5c5c5d');
  return sh;
}
function setupGamesTab() { gamesTab_(); alert_('Games tab is ready. One row per game or meet: Date, Sport, Level, Opponent (or meet name), Event (e.g. WPIAL Quarterfinal, optional), Home/Away, Location, Time.\nCoach and Coach email can be left blank; they are filled from the Coaches tab (head coach for that sport and level) when requests are sent.'); }
function wrongSig_(id, em) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature('wrong|' + id + '|' + norm_(em), ackSecret_())).slice(0, 22); }
function gameSig_(id) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature('game|' + id, ackSecret_())).slice(0, 22); }
function gameRows_() {
  var sh = gamesTab_(), v = sh.getDataRange().getValues(), h = v[0].map(String), ix = {}; h.forEach(function (k, i) { ix[k] = i; });
  var newIds = false;
  for (var i = 1; i < v.length; i++) if (v[i][ix['Date']] && !v[i][ix['ID']]) { v[i][ix['ID']] = Utilities.getUuid().slice(0, 8); sh.getRange(i + 1, ix['ID'] + 1).setValue(v[i][ix['ID']]); newIds = true; }
  return { sh: sh, v: v, ix: ix };
}
/* Head coach for a game. Sport names differ between sources (ArbiterLive "Girls Varsity Soccer", Coaches tab "Soccer" with Level "Girls Varsity"),
   so both sides are reduced to a sport key + gender + level before matching. */
function sportKey_(s) {
  s = String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\b(boys?|girls?|men'?s?|women'?s?|varsity|jv|junior varsity|team|club|coed|co-ed)\b/g, ' ').replace(/[^a-z\/ ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (/flag football/.test(s)) return 'flag football';
  if (/cross ?country|x ?country|\bxc\b/.test(s)) return 'cross country';
  if (/swim|diving/.test(s)) return 'swimming';
  if (/track|field event|indoor track/.test(s)) return 'track';
  if (/hockey/.test(s) && !/field hockey/.test(s)) return 'hockey';
  if (/cheer/.test(s)) return 'cheerleading';
  var m = /(field hockey|football|soccer|basketball|volleyball|golf|tennis|wrestling|baseball|softball|lacrosse|bowling|rifle|water polo)/.exec(s);
  return m ? m[1] : s;
}
function genderOf_(s) { s = String(s || ''); if (/boys/i.test(s) && /girls/i.test(s)) return ''; return /\bgirls?\b|women/i.test(s) ? 'g' : /\bboys?\b|\bmen\b/i.test(s) ? 'b' : ''; }
function headCoach_(sport, level) {
  var cs = rowsOf_('Coaches'), key = sportKey_(sport), gg = genderOf_(sport + ' ' + (level || '')), lv = /jv|junior varsity/i.test((level || '') + ' ' + sport) ? 'jv' : 'varsity', best = null, bestS = -1;
  cs.forEach(function (r) {
    var cSport = s_(r['Sport']), cLevel = s_(r['Level']), cRole = s_(r['Role']);
    if (!cSport || sportKey_(cSport) !== key) return;
    var cg = genderOf_(cSport + ' ' + cLevel + ' ' + cRole), cl = /jv|junior varsity/i.test(cLevel + ' ' + cRole) ? 'jv' : 'varsity';
    if (gg && cg && gg !== cg) return;   // never give the girls' game to the boys' coach
    var sc = (cl === lv ? 4 : 0) + (gg && cg === gg ? 2 : 0) + (/head/i.test(cRole) ? 3 : 0) + (s_(r['Email']) ? 1 : 0);
    if (sc > bestS) { bestS = sc; best = r; }
  });
  return best ? { name: s_(best['Name']), email: s_(best['Email']) } : null;
}
/* Games tab: picking a Sport (or changing Level) fills Coach + Coach email with that team's head coach from the Coaches tab.
   Only fills blank cells or cells it filled itself, so a coach typed in by hand is never replaced. */
function gameCoachFill_(sh, r, c) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), ix = {}; h.forEach(function (k, i) { ix[k] = i + 1; });
  if (ix['Source'] && [ix['Date'], ix['Sport'], ix['Level'], ix['Opponent'], ix['Home/Away'], ix['Location'], ix['Time']].indexOf(c) >= 0) { var sc = sh.getRange(r, ix['Source']), sv = String(sc.getValue());   // hand edit: the website pull leaves this row alone from now on
    if (sv === 'Website') sc.setValue('Website (edited)'); else if (!sv) sc.setValue('Manual'); }
  if (c !== ix['Sport'] && c !== ix['Level']) return;
  var row = sh.getRange(r, 1, 1, h.length).getValues()[0], sport = s_(row[ix['Sport'] - 1]), level = s_(row[ix['Level'] - 1]);
  var cc = sh.getRange(r, ix['Coach']), ec = sh.getRange(r, ix['Coach email']), auto = cc.getNote() === 'Filled from Coaches tab';
  if (!auto && s_(row[ix['Coach'] - 1])) return;
  if (!sport) { if (auto) { cc.clearContent().clearNote(); ec.clearContent(); } return; }
  var hc = headCoach_(sport, level);
  if (!hc) { if (auto) { cc.clearContent().clearNote(); ec.clearContent(); } SpreadsheetApp.getActive().toast('No coach found for ' + sport + ' on the Coaches tab.', 'Games', 4); return; }
  cc.setValue(hc.name).setNote('Filled from Coaches tab'); ec.setValue(hc.email || '');
  if (!hc.email) SpreadsheetApp.getActive().toast(hc.name + ' has no email on the Coaches tab yet. Run Tools → Fill missing coach emails or type it in.', 'Games', 5);
}
/* Tools → Pull games from school website. Each sport page on southfayette.org links its Varsity / JV schedules on BigTeams
   (south-fayette.bigteams.com). This reads those schedules and adds any game not yet on the Games tab. Existing rows are matched on
   Date + Sport + Level + Opponent: times, locations and Home/Away are refreshed, results and coaches are never touched.
   Postponed / cancelled games are marked in Result. Nothing is deleted. Runs daily at 5 AM once automatic tasks are on. */
function autoPullGames() { try { Logger.log(pullGames_()); } catch (x) { Logger.log('autoPullGames: ' + x.message); } }
/* ArbiterLive school calendar (all SFHS games in one place). Primary source for Pull games; BigTeams/feeds are only used when this returns nothing. */
var ARBITER_URL_ = 'https://www.arbiterlive.com/School/Calendar/21309';
function arbiterGames_() {
  var dec = function (s) { return String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }); };
  var txt = function (s) { return dec(String(s).replace(/<br\s*\/?>/gi, ' | ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/(\s*\|\s*)+/g, ' | ').replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim(); };
  var UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept': 'text/html,text/calendar,*/*' };
  var get = function (u) { try { var r = UrlFetchApp.fetch(u, { muteHttpExceptions: true, followRedirects: true, headers: UA }); return { code: r.getResponseCode(), body: r.getContentText() }; } catch (x) { return { code: 0, body: '', err: x.message }; } };
  var MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }, now = new Date();
  var pDate = function (s) { var m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s) || /(\d{1,2})\/(\d{1,2})(?!\d)/.exec(s), y;
    if (m) { y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : (now.getMonth() >= 6 && +m[1] < 7 ? now.getFullYear() + 1 : now.getFullYear()); return new Date(y, +m[1] - 1, +m[2], 12); }
    m = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/i.exec(s); if (!m) return null;
    y = m[3] ? +m[3] : (now.getMonth() >= 6 && MON[m[1].toLowerCase()] < 6 ? now.getFullYear() + 1 : now.getFullYear()); return new Date(y, MON[m[1].toLowerCase()], +m[2], 12); };
  var SPORTS = /(football|soccer|basketball|volleyball|cross country|x-country|golf|tennis|swimming|diving|wrestling|baseball|softball|lacrosse|track|hockey|cheer\w*|bowling|rifle|water polo|field hockey|flag football)/i;
  var split = function (s) {   // "Varsity Girls Soccer" → level + sport; null for 7th/8th/MS/freshman
    if (/7th|8th|middle|\bms\b|junior high|freshman|9th/i.test(s)) return null; var sm = SPORTS.exec(s); if (!sm) return null;
    var lv = /\bjv\b|junior varsity/i.test(s) ? 'JV' : 'Varsity', sx = /\bgirls?\b|women/i.test(s) ? 'Girls ' : /\bboys?\b|\bmen\b/i.test(s) ? 'Boys ' : '';
    var sp = sm[1].replace(/x-country/i, 'Cross Country'); sp = sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase().replace(/\b(country|hockey|football|polo)\b/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1); });
    if (/swim|diving/i.test(sp)) sp = 'Swimming/Diving'; return { level: lv, sport: sx + sp }; };
  var out = [], tried = [], pages = [ARBITER_URL_], first = get(ARBITER_URL_); tried.push(ARBITER_URL_ + ' → HTTP ' + first.code + ', ' + first.body.length + ' chars');
  var parseRows = function (html) { var n0 = out.length, curDate = null;
    (html.match(/<tr[\s\S]*?<\/tr>/gi) || []).forEach(function (tr) {
      var td = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(txt); if (td.length < 2) { var one = td.join(' '); var d1 = pDate(one); if (d1 && one.length < 40) curDate = d1; return; }
      var all = td.join(' | '), d = null; for (var k = 0; k < td.length; k++) { d = pDate(td[k]); if (d) break; } d = d || curDate; if (!d) return;
      var who = split(all); if (!who) return;
      if (/practice/i.test(all) && !/game|meet|match/i.test(all)) return;
      var tm = (/(\d{1,2}:\d{2}\s*[AP]M)/i.exec(all) || [])[1] || (/\bTBA\b/i.test(all) ? 'TBA' : '');
      var oppCell = td.filter(function (c) { return /^(vs\.?|at|@)\s/i.test(c) || /\b(vs\.?|@)\s/.test(c); })[0] || '';
      var ha = /^(at|@)\s|\s@\s/i.test(oppCell) ? 'Away' : /^vs\.?\s|\svs\.?\s/i.test(oppCell) ? 'Home' : /\baway\b/i.test(all) ? 'Away' : /\bhome\b/i.test(all) ? 'Home' : '';
      var opp = oppCell.replace(/^.*?\b(vs\.?|at|@)\s+/i, '').split(' | ')[0].trim();
      if (!opp) { var rest = td.filter(function (c) { return !pDate(c) && !SPORTS.test(c) && !/^\d{1,2}:\d{2}/.test(c) && c.length > 2 && !/^(home|away|game|scrimmage|tba|details?|map|directions)$/i.test(c); }); opp = (rest[0] || '').replace(/^(vs\.?|at|@)\s+/i, ''); }
      if (!opp) return;
      var loc = td.filter(function (c) { return /stadium|field|gym|center|park|\bhs\b|high school|complex|arena|pool|course|club|school/i.test(c) && c !== oppCell; })[0] || '';
      if (!ha && loc) ha = /south fayette/i.test(loc) ? 'Home' : 'Away';
      out.push({ date: d, sport: who.sport, level: who.level, opp: opp.slice(0, 80), ha: ha, loc: loc.slice(0, 80), time: tm, status: /postpon/i.test(all) ? 'Postponed' : /cancel/i.test(all) ? 'Cancelled' : '', scrim: /scrimmage/i.test(all) });
    }); return out.length - n0; };
  if (first.code === 200) {
    parseRows(first.body);
    if (!out.length) {   // calendar loads by script: look for an iCal / export / data URL on the page
      var cand = [], m, re = /(?:href|src|url|action)\s*[=:]\s*["']([^"']*(?:ical|\.ics|webcal|export|rss|feed|json|ajax|events|calendar)[^"']*)["']/gi;
      while ((m = re.exec(first.body))) { var u = dec(m[1]).replace(/^webcal:/i, 'https:'); if (/\.(css|js|png|jpg|gif|svg)(\?|$)/i.test(u)) continue; if (u.charAt(0) === '/') u = 'https://www.arbiterlive.com' + u; if (!/^https?:/i.test(u) || cand.indexOf(u) >= 0) continue; cand.push(u); }
      cand.slice(0, 8).forEach(function (u) { if (out.length) return; var r2 = get(u); tried.push(u + ' → HTTP ' + r2.code + ', ' + r2.body.length + ' chars'); if (r2.code !== 200) return;
        if (/BEGIN:VEVENT/.test(r2.body)) r2.body.replace(/\r?\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1).forEach(function (ev) {
          var f = function (k) { var m2 = new RegExp('^' + k + '[^:\\n]*:(.*)$', 'm').exec(ev); return m2 ? m2[1].replace(/\\([,;n])/g, function (_, c) { return c === 'n' ? ' ' : c; }).trim() : ''; };
          var sum = f('SUMMARY'), who = split(sum + ' ' + f('DESCRIPTION')); if (!who) return; var ds = f('DTSTART'), md = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(ds); if (!md) return;
          var dt = md[4] ? (/Z$/.test(ds) ? new Date(Date.UTC(+md[1], +md[2] - 1, +md[3], +md[4], +md[5])) : new Date(+md[1], +md[2] - 1, +md[3], +md[4], +md[5])) : new Date(+md[1], +md[2] - 1, +md[3], 12);
          var tm = md[4] ? Utilities.formatDate(dt, tz_(), 'h:mm a') : '', day = new Date(Utilities.formatDate(dt, tz_(), 'yyyy/MM/dd') + ' 12:00');
          out.push({ date: day, sport: who.sport, level: who.level, opp: sum.replace(/^.*?\b(vs\.?|at|@)\s+/i, '').slice(0, 80), ha: /\b(at|@)\s/i.test(sum) ? 'Away' : /\bvs\.?\s/i.test(sum) ? 'Home' : '', loc: f('LOCATION').slice(0, 80), time: tm, status: /cancel/i.test(sum + f('STATUS')) ? 'Cancelled' : /postpon/i.test(sum) ? 'Postponed' : '', scrim: /scrimmage/i.test(sum) }); });
        else if (/<tr/i.test(r2.body)) parseRows(r2.body);
        else if (/^\s*[\[{]/.test(r2.body)) { try { var J = JSON.parse(r2.body), arr = Array.isArray(J) ? J : (J.events || J.Events || J.data || J.Data || J.items || []);
          (arr || []).forEach(function (e) { var s = [e.Sport, e.sport, e.Level, e.level, e.Gender, e.gender, e.Title, e.title, e.Name, e.name, e.Description].filter(Boolean).join(' '), who = split(s); if (!who) return;
            var dt = new Date(e.Start || e.start || e.StartDate || e.Date || e.date); if (isNaN(dt)) return; var opp = String(e.Opponent || e.opponent || e.Opponents || s.replace(/^.*?\b(vs\.?|at|@)\s+/i, '')).slice(0, 80);
            out.push({ date: new Date(Utilities.formatDate(dt, tz_(), 'yyyy/MM/dd') + ' 12:00'), sport: who.sport, level: who.level, opp: opp, ha: /away|@|\bat\b/i.test(String(e.HomeAway || e.homeAway || s)) ? 'Away' : /home|vs/i.test(String(e.HomeAway || e.homeAway || s)) ? 'Home' : '', loc: String(e.Location || e.location || e.Site || e.Facility || '').slice(0, 80), time: /T\d\d:\d\d/.test(String(e.Start || e.start || '')) || dt.getHours() ? Utilities.formatDate(dt, tz_(), 'h:mm a') : '', status: /cancel/i.test(JSON.stringify(e)) ? 'Cancelled' : /postpon/i.test(JSON.stringify(e)) ? 'Postponed' : '', scrim: /scrimmage/i.test(s) }); }); } catch (x) {} }
      });
    }
  }
  var teams = {}; out.forEach(function (gm) { teams[norm_(gm.sport) + '|' + norm_(gm.level)] = 1; });
  if (!out.length) { try { var ss0 = SpreadsheetApp.getActive(), dsh = ss0.getSheetByName('Games Website Debug') || ss0.insertSheet('Games Website Debug'); dsh.clear();
    var rows = ['ArbiterLive: ' + tried.join('  ||  '), 'Links: ' + ((first.body.match(/(?:href|src|action)\s*=\s*["'][^"']+["']/gi) || []).filter(function (x) { return /ical|ics|webcal|export|rss|feed|json|ajax|event|calendar|schedule|print|api/i.test(x); }).slice(0, 80).join(' ') || 'none'),
      'Scripts: ' + ((first.body.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []).map(function (s) { return s.replace(/\s+/g, ' '); }).filter(function (s) { return /calendar|event|ajax|\$\.(get|post|ajax)|fetch\(|url|api/i.test(s); }).join(' ').slice(0, 25000)),
      'Body: ' + txt(first.body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>/gi, '')).slice(0, 20000)];
    dsh.getRange(1, 1, rows.length, 1).setValues(rows.map(function (x) { return [x.slice(0, 49000)]; })); dsh.setColumnWidth(1, 900); } catch (x) {} }
  return { games: out, teams: teams, status: tried[0] };
}
function pullGamesFromWebsite() { var m = pullGames_(); alert_(m); }
function pullGames_() {
  var ARB = { games: [], teams: {} }; try { ARB = arbiterGames_(); } catch (x) { Logger.log('Arbiter: ' + x.message); }
  var dec = function (s) { return String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }); };
  var txt = function (s) { return dec(String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); };
  var label = function (p) { return p.replace(/([a-z])([A-Z])/g, '$1 $2').replace('Swimming Diving', 'Swimming/Diving'); };
  // 1. find the BigTeams schedule links on each sport page
  var pages = UrlFetchApp.fetchAll(SPORT_PAGES_.map(function (p) { return { url: 'https://www.southfayette.org/' + p + '.aspx', muteHttpExceptions: true }; })), links = [];
  pages.forEach(function (r, i) { if (r.getResponseCode() !== 200) return; var h = r.getContentText(), m, re = /<a[^>]+href="([^"]*(?:bigteams\.com|southfayettefootball\.com|schedulestar|teams\/default\.asp)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((m = re.exec(h))) { var before = txt(h.slice(Math.max(0, m.index - 600), m.index)), t = txt(m[2]) + ' ' + ((before.match(/(boys|girls)[^.]{0,40}$/i) || [''])[0]); if (/7th|8th|middle|junior high|freshman|9th/i.test(txt(m[2]))) continue;
      var lv = /\bjv\b|junior varsity/i.test(t) ? 'JV' : /varsity/i.test(t) ? 'Varsity' : ''; if (!lv) continue;
      var sx = /girls/i.test(t) ? 'Girls ' : /boys/i.test(t) ? 'Boys ' : '';
      links.push({ sport: sx + label(SPORT_PAGES_[i]), level: lv, url: dec(m[1]).replace(/^http:/, 'https:') }); } });
  var seenL = {}; links = links.filter(function (l) { if (seenL[l.url]) return false; seenL[l.url] = 1; return true; });
  if (ARB.games.length) links = [];   // ArbiterLive worked: it already has every team
  else if (!links.length) return 'No games found on ArbiterLive and no schedule links on the sport pages. Open the "Games Website Debug" tab, copy cells A1 to A4, and send them to the hub builder.';
  // 2. read each schedule
  // calendar feeds pasted on the "Game Feeds" tab (iCal links from BigTeams fan accounts) take the place of website links for that team
  var feedSh = SpreadsheetApp.getActive().getSheetByName('Game Feeds');
  if (!feedSh) { feedSh = SpreadsheetApp.getActive().insertSheet('Game Feeds'); feedSh.getRange(1, 1, 1, 4).setValues([['Sport', 'Level', 'Calendar (iCal) link', 'Notes']]); headerStyle_(feedSh.getRange(1, 1, 1, 4)); feedSh.setFrozenRows(1); feedSh.setColumnWidth(3, 520);
    feedSh.getRange(2, 4).setValue('One row per team. In BigTeams (logged in with a free fan account), open the team schedule → Subscribe / iCal → copy the link and paste it in column C. webcal:// links are fine.'); }
  var feeds = feedSh.getLastRow() > 1 ? feedSh.getRange(2, 1, feedSh.getLastRow() - 1, 3).getValues().filter(function (r) { return r[0] && /^(https?|webcal):/i.test(String(r[2]).trim()); }) : [];
  if (feeds.length) { var fk = {}; feeds.forEach(function (f) { fk[norm_(f[0]) + '|' + norm_(f[1] || 'Varsity')] = 1; });
    links = links.filter(function (l) { return !fk[norm_(l.sport) + '|' + norm_(l.level)]; }).concat(feeds.map(function (f) { return { sport: String(f[0]).trim(), level: String(f[1] || 'Varsity').trim(), url: String(f[2]).trim().replace(/^webcal:/i, 'https:'), feed: true }; })); }
  var res = !links.length ? [] : UrlFetchApp.fetchAll(links.map(function (l) { return { url: l.url, muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'Accept': 'text/html,text/calendar,*/*' } }; })), games = [], bad = [], firstBad = '';
  ARB.games.forEach(function (gm) { games.push(gm); });
  var parseIcs = function (body, L) {
          body.replace(/\r?\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1).forEach(function (ev) { var f = function (k) { var m2 = new RegExp('^' + k + '[^:\\n]*:(.*)$', 'm').exec(ev); return m2 ? m2[1].replace(/\\([,;n])/g, function (_, c) { return c === 'n' ? ' ' : c; }).trim() : ''; };
            var ds = f('DTSTART'), mdt = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(ds); if (!mdt) return; var sum = f('SUMMARY'), loc = f('LOCATION');
            var d0 = new Date(+mdt[1], +mdt[2] - 1, +mdt[3], 12), tmx = mdt[4] ? Utilities.formatDate(/Z$/.test(ds) ? new Date(Date.UTC(+mdt[1], +mdt[2] - 1, +mdt[3], +mdt[4], +mdt[5])) : new Date(+mdt[1], +mdt[2] - 1, +mdt[3], +mdt[4], +mdt[5]), tz_(), 'h:mm a') : '';
            if (/Z$/.test(ds)) d0 = new Date(Utilities.formatDate(new Date(Date.UTC(+mdt[1], +mdt[2] - 1, +mdt[3], +mdt[4], +mdt[5])), tz_(), 'yyyy/MM/dd') + ' 12:00');
            if (/practice/i.test(sum)) return;
            var op = sum.replace(/^.*?\b(vs\.?|at|@)\s+/i, '').replace(/\s*\((home|away|scrimmage|game)\)\s*/ig, '').trim();
            games.push({ date: d0, sport: L.sport, level: L.level, opp: op.slice(0, 80) || sum.slice(0, 80), ha: /\b(at|@)\s/i.test(sum) ? 'Away' : /\bvs\.?\s|\bhome\b/i.test(sum) ? 'Home' : '', loc: loc.slice(0, 80), time: tmx === '12:00 AM' ? '' : tmx, status: /cancel/i.test(sum + f('STATUS')) ? 'Cancelled' : /postpon/i.test(sum) ? 'Postponed' : '', scrim: /scrimmage/i.test(sum) }); });
  };
  var yr = new Date().getFullYear(), MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  var parseDate = function (s) { var m = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/.exec(s), mo, d, y;
    if (m) { mo = +m[1] - 1; d = +m[2]; y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : null; }
    else { m = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/i.exec(s); if (!m) return null; mo = MON[m[1].toLowerCase()]; d = +m[2]; y = m[3] ? +m[3] : null; }
    if (y == null) { var now = new Date(); y = yr; if (mo < 6 && now.getMonth() >= 6) y = yr + 1; if (mo >= 6 && now.getMonth() < 6) y = yr - 1; }
    return new Date(y, mo, d, 12); };
  res.forEach(function (r, li) {
    var L = links[li], html = r.getResponseCode() === 200 ? r.getContentText() : '', n0 = games.length;
    if (/BEGIN:VEVENT/.test(html)) { parseIcs(html, L); if (games.length === n0) bad.push(L.level + ' ' + L.sport + ' (feed has no games)'); return; }
    if (L.feed) { bad.push(L.level + ' ' + L.sport + ' (feed link did not work: HTTP ' + r.getResponseCode() + ')'); return; }
    (html.match(/<tr[\s\S]*?<\/tr>/gi) || []).forEach(function (tr) {
      var td = (tr.match(/<td[\s\S]*?<\/td>/gi) || []).map(txt); if (td.length < 3) return;
      var di = -1; for (var k = 0; k < td.length; k++) if (parseDate(td[k]) && /\d/.test(td[k])) { di = k; break; } if (di < 0) return;
      var all = td.join(' | '), dt = parseDate(td[di]), tm = (/(\d{1,2}:\d{2}\s*[AP]M)/i.exec(all) || [])[1] || (/\bTBA\b/i.test(all) ? 'TBA' : '');
      if (/practice/i.test(all) && !/game|meet|match/i.test(all)) return;
      var type = /\bhome\b/i.test(td.slice(0, di + 1).join(' ') + ' ' + (td[di + 1] || '')) ? 'Home' : /\baway\b/i.test(all) ? 'Away' : '';
      var opp = '', cells = td.filter(function (c, k) { return k !== di && c && !/^(home|away|game|scrimmage|other|school|tba|w|l|t)$/i.test(c) && !/^\d{1,2}:\d{2}/.test(c) && !/^[WLT]\s*\d+\s*-\s*\d+/.test(c) && !/^(info|details|directions|map)$/i.test(c); });
      opp = (cells[0] || '').replace(/^(vs\.?|at|@)\s+/i, '').replace(/\s*\((home|away)\)\s*/i, '').trim();
      if (!opp || /opponent|event title|date & time/i.test(opp)) return;
      var loc = cells.slice(1).filter(function (c) { return /stadium|field|gym|center|park|hs\b|high school|complex|arena|pool|course|club/i.test(c); })[0] || '';
      if (!type && loc) type = /south fayette|\bsf\b/i.test(loc) ? 'Home' : 'Away';
      var status = /postponed/i.test(all) ? 'Postponed' : /cancel+ed/i.test(all) ? 'Cancelled' : '';
      games.push({ date: dt, sport: L.sport, level: L.level, opp: opp.slice(0, 80), ha: type, loc: loc.slice(0, 80), time: tm, status: status, scrim: /scrimmage/i.test(all) });
    });
    if (games.length === n0 && html) {   // schedule not in the page itself: look for a calendar feed (.ics / webcal) or a data URL the page loads
      var base = (/^(https?:\/\/[^\/]+)/.exec(L.url) || [])[1] || '', cand = [], mm, ru = /(?:href|src|url)\s*[=:]\s*["']([^"']*(?:ical|\.ics|webcal|calendar|ajax|json|print|schedule)[^"']*)["']/gi;
      while ((mm = ru.exec(html))) { var u = dec(mm[1]).replace(/^webcal:/i, 'https:'); if (/\.(css|js|png|jpg|gif|svg)(\?|$)/i.test(u) || u === L.url) continue; if (u.indexOf('//') === 0) u = 'https:' + u; else if (u.charAt(0) === '/') u = base + u; else if (!/^https?:/i.test(u)) continue; if (cand.indexOf(u) < 0) cand.push(u); }
      cand.slice(0, 6).forEach(function (u) { if (games.length > n0) return; var body = ''; try { var rr = UrlFetchApp.fetch(u, { muteHttpExceptions: true, followRedirects: true }); if (rr.getResponseCode() === 200) body = rr.getContentText(); } catch (x) {} if (!body) return;
        if (/BEGIN:VEVENT/.test(body)) { parseIcs(body, L); return; }
      });
    }
    if (games.length === n0) { bad.push(L.level + ' ' + L.sport); if (!firstBad) { var hdrs = r.getAllHeaders(); firstBad = ['URL: ' + L.url, 'HTTP ' + r.getResponseCode() + ', ' + html.length + ' characters, type ' + (hdrs['Content-Type'] || ''),
        'Links found: ' + ((html.match(/(?:href|src)\s*=\s*["'][^"']+["']/gi) || []).filter(function (x) { return /ical|ics|webcal|calendar|ajax|json|print|schedule|feed|api/i.test(x); }).slice(0, 60).join(' ') || 'none'),
        'Scripts: ' + ((html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []).map(function (s) { return s.replace(/\s+/g, ' '); }).filter(function (s) { return /schedule|ajax|\$\.(get|post)|fetch\(|url/i.test(s); }).join(' ').slice(0, 20000)),
        'Body: ' + txt(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>/gi, '')).slice(0, 15000)]; } }
  });
  if (firstBad) { try { var ss0 = SpreadsheetApp.getActive(), dsh = ss0.getSheetByName('Games Website Debug') || ss0.insertSheet('Games Website Debug'); dsh.clear(); dsh.getRange(1, 1, firstBad.length, 1).setValues(firstBad.map(function (x) { return [String(x).slice(0, 49000)]; })); dsh.setColumnWidth(1, 900); dsh.getRange(1, 1, firstBad.length, 1).setWrap(true); } catch (x) {} }
  // 3. merge into the Games tab. Website rows carry a hidden Web key; rows the office edits by hand become "Website (edited)" and are never changed again.
  var G = gameRows_(), sh = G.sh, v = G.v, ix = G.ix, today = todayKey_();
  var keyOf = function (d, s, l, o) { return [dk_(d), norm_(s), norm_(l), norm_(o).replace(/[^a-z0-9]/g, '')].join('|'); }, team = function (s, l, o) { return [norm_(s), norm_(l), norm_(o).replace(/[^a-z0-9]/g, '')].join('|'); };
  var byKey = {}, live = {}, from = new Date(); from.setDate(from.getDate() - 7);
  for (var i = 1; i < v.length; i++) { var wk = s_(v[i][ix['Web key']]) || (v[i][ix['Date']] ? keyOf(v[i][ix['Date']], v[i][ix['Sport']], v[i][ix['Level']], v[i][ix['Opponent']]) : ''); if (wk) byKey[wk] = i; }
  games.forEach(function (gm) { gm.key = keyOf(gm.date, gm.sport, gm.level, gm.opp); live[gm.key] = 1; });
  var add = [], upd = [], moved = [], gone = [], set = function (row, h, x) { sh.getRange(row, ix[h] + 1).setValue(x); };
  games.forEach(function (gm) {
    if (gm.date < from) return;
    var at = byKey[gm.key];
    if (at == null) {   // same team + opponent on another date that the website no longer lists = rescheduled
      var back = new Date(); back.setDate(back.getDate() - 30); var backK = dayKey_(back);
      for (var j = 1; j < v.length; j++) { var r0 = v[j], res0 = s_(r0[ix['Result']]); if (s_(r0[ix['Source']]) !== 'Website' || (res0 && res0 !== 'Postponed') || dk_(r0[ix['Date']]) < backK) continue;   // postponed games and recent unplayed games can be moved
        var k0 = s_(r0[ix['Web key']]); if (!k0 || live[k0]) continue;
        if (team(r0[ix['Sport']], r0[ix['Level']], r0[ix['Opponent']]) === team(gm.sport, gm.level, gm.opp)) { at = j; break; } }
      if (at != null) { var old = Utilities.formatDate(v[at][ix['Date']] instanceof Date ? v[at][ix['Date']] : new Date(v[at][ix['Date']]), tz_(), 'M/d');
        set(at + 1, 'Date', gm.date); set(at + 1, 'Web key', gm.key); v[at][ix['Web key']] = gm.key; byKey[gm.key] = at;
        if (s_(v[at][ix['Result']]) === 'Postponed') set(at + 1, 'Result', gm.status || ''); if (ix['Request sent'] != null) set(at + 1, 'Request sent', '');
        sh.getRange(at + 1, ix['Date'] + 1).setBackground('#fff4c2').setNote('Website moved this game from ' + old + '.');
        moved.push(gm.level + ' ' + gm.sport + ' vs ' + gm.opp + ': ' + old + ' → ' + Utilities.formatDate(gm.date, tz_(), 'M/d')); }
    }
    if (at != null) { if (at < 0) return; var row = at + 1, cur = v[at], src = s_(cur[ix['Source']]);
      if (!s_(cur[ix['Web key']])) set(row, 'Web key', gm.key);
      if (!src) set(row, 'Source', 'Website (edited)');   // a hand-entered row that matches the website: keep the office's version
      if (src !== 'Website') return;
      var ch = [];
      [['Time', gm.time], ['Home/Away', gm.ha], ['Location', gm.loc]].forEach(function (p) { if (p[1] && s_(cur[ix[p[0]]]) !== p[1]) { ch.push(p[0].toLowerCase() + ' ' + (s_(cur[ix[p[0]]]) || '—') + ' → ' + p[1]); set(row, p[0], p[1]); } });
      if (gm.status && !s_(cur[ix['Result']])) { set(row, 'Result', gm.status); ch.push(gm.status.toLowerCase()); }
      if (ch.length) { sh.getRange(row, 1, 1, ix['Location'] + 2).setBackground('#fff4c2'); upd.push(gm.level + ' ' + gm.sport + ' vs ' + gm.opp + ' (' + Utilities.formatDate(gm.date, tz_(), 'M/d') + '): ' + ch.join(', ')); }
      return; }
    var r = GAME_H_.map(function () { return ''; }), put = function (h, x) { var c = GAME_H_.indexOf(h); if (c >= 0) r[c] = x; };
    put('Date', gm.date); put('Sport', gm.sport); put('Level', gm.level); put('Opponent', gm.opp); put('Event', gm.scrim ? 'Scrimmage' : ''); put('Home/Away', gm.ha); put('Location', gm.loc); put('Time', gm.time); put('Result', gm.status);
    var hc = headCoach_(gm.sport, gm.level); if (hc) { put('Coach', hc.name); put('Coach email', hc.email || ''); }
    put('Source', 'Website'); put('Web key', gm.key); put('ID', Utilities.getUuid().slice(0, 8)); add.push(r); byKey[gm.key] = -1;
  });
  var readTeams = {}; Object.keys(ARB.teams).forEach(function (k) { readTeams[k] = 1; }); links.forEach(function (l) { if (bad.indexOf(l.level + ' ' + l.sport) < 0) readTeams[norm_(l.sport) + '|' + norm_(l.level)] = 1; });
  for (var q = 1; q < v.length; q++) { var rq = v[q], kq = s_(rq[ix['Web key']]);   // upcoming website games that vanished (and were not moved): flag, never delete
    if (s_(rq[ix['Source']]) !== 'Website' || !kq || live[kq] || s_(rq[ix['Result']]) || dk_(rq[ix['Date']]) < today || !readTeams[norm_(rq[ix['Sport']]) + '|' + norm_(rq[ix['Level']])]) continue;
    if (sh.getRange(q + 1, ix['Opponent'] + 1).getNote().indexOf('No longer on the website') === 0) continue;
    sh.getRange(q + 1, 1, 1, ix['Location'] + 2).setBackground('#fde2e1'); sh.getRange(q + 1, ix['Opponent'] + 1).setNote('No longer on the website schedule as of ' + Utilities.formatDate(new Date(), tz_(), 'M/d') + '. Check with the athletic office: delete the row, or set Result to Cancelled/Postponed.');
    gone.push(gameLabel_(rq, ix) + ' vs ' + s_(rq[ix['Opponent']]) + ' (' + prettyDay_(dk_(rq[ix['Date']])) + ')'); }
  if (add.length) { var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), rows = add.map(function (r) { return hdr.map(function (h) { var c = GAME_H_.indexOf(h); return c >= 0 ? r[c] : ''; }); });
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, hdr.length).setValues(rows); }
  if (add.length || moved.length) { var hd2 = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), dc = hd2.indexOf('Date') + 1; if (sh.getLastRow() > 2) sh.getRange(2, 1, sh.getLastRow() - 1, hd2.length).sort([{ column: dc, ascending: true }]); }
  var report = [moved.length ? 'Moved to a new date (yellow):\n• ' + moved.join('\n• ') : '', upd.length ? 'Changed on the website (yellow):\n• ' + upd.join('\n• ') : '', gone.length ? 'No longer on the website (red, not deleted):\n• ' + gone.join('\n• ') : ''].filter(String).join('\n\n');
  var cf = 0; try { var v2 = sh.getDataRange().getValues(), h2 = v2[0].map(String), iS = h2.indexOf('Sport'), iL = h2.indexOf('Level'), iC = h2.indexOf('Coach'), iE = h2.indexOf('Coach email');   // fill coaches on any row still missing one
    for (var z = 1; z < v2.length; z++) if (v2[z][iS] && !s_(v2[z][iC]) && dk_(v2[z][h2.indexOf('Date')]) >= today) { var hz = headCoach_(s_(v2[z][iS]), s_(v2[z][iL])); if (hz) { sh.getRange(z + 1, iC + 1).setValue(hz.name).setNote('Filled from Coaches tab'); if (hz.email && !s_(v2[z][iE])) sh.getRange(z + 1, iE + 1).setValue(hz.email); cf++; } } } catch (x) {}
  var to = ''; try { to = PropertiesService.getScriptProperties().getProperty('athleticsEmail') || ''; } catch (x) {}
  if (report && to) try { MailApp.sendEmail({ to: to, subject: 'Athletic schedule changes on the website', name: CFG.officeName, body: report + '\n\nThe Games tab has been updated. Rows edited by hand were not changed.' }); } catch (x) {}
  bumpHubCache_();
  return 'Games pulled' + (ARB.games.length ? ' from ArbiterLive (' + Object.keys(ARB.teams).length + ' Varsity/JV teams)' : ' from team schedules (' + links.length + ' read)') + ': ' + add.length + ' new, ' + moved.length + ' moved, ' + upd.length + ' changed, ' + gone.length + ' no longer listed.' + (report ? '\n\n' + report : '') +
    (bad.length ? '\n\nNo games read from: ' + bad.join(', ') + '. These may be out of season. If one should have games, open the "Games Website Debug" tab, copy cells A1 to A5, and send them to the hub builder.' : '') +
    (cf ? '\n\nCoach filled in on ' + cf + ' upcoming game(s).' : '') + '\n\nResults, coaches and any row you edited by hand were not changed.';
}
function gameLabel_(r, ix) { return [s_(r[ix['Level']]), s_(r[ix['Sport']])].filter(String).join(' '); }
function sendGameUpdateRequests() {
  try { var me = Session.getActiveUser().getEmail(); if (me) PropertiesService.getScriptProperties().setProperty('athleticsEmail', me); } catch (x) {}
  var ui = ui_(), key = todayKey_();
  if (ui) { var a = ui.prompt('Send game/activity update requests', 'Games on which date? Leave blank for today, or type "yesterday" or M/D/YYYY.', ui.ButtonSet.OK_CANCEL);
    if (a.getSelectedButton() !== ui.Button.OK) return;
    var t = String(a.getResponseText() || '').trim(); if (/^yes/i.test(t)) { var d = new Date(); d.setDate(d.getDate() - 1); key = dayKey_(d); } else if (t) { var d2 = new Date(t); if (isNaN(d2)) return alert_('Could not read that date. Use M/D/YYYY.'); key = dayKey_(d2); } }
  var G = gameRows_(), v = G.v, ix = G.ix, sh = G.sh, by = {}, skip = [], stamp = Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a');
  for (var i = 1; i < v.length; i++) {
    var r = v[i]; if (dk_(r[ix['Date']]) !== key) continue;
    var lbl = gameLabel_(r, ix) + ' vs ' + s_(r[ix['Opponent']]);
    if (s_(r[ix['Result']])) { skip.push(lbl + ': already reported (' + s_(r[ix['Result']]) + ')'); continue; }
    var em = s_(r[ix['Coach email']]), nm = s_(r[ix['Coach']]);
    if (!em) { var hc = headCoach_(s_(r[ix['Sport']]), s_(r[ix['Level']])); if (hc) { if (!nm) { nm = hc.name; sh.getRange(i + 1, ix['Coach'] + 1).setValue(nm); } if (hc.email && (!s_(r[ix['Coach']]) || norm_(hc.name) === norm_(nm))) { em = hc.email; sh.getRange(i + 1, ix['Coach email'] + 1).setValue(em); } } }
    if (!em) { skip.push(lbl + ': no coach email (add it in the Games or Coaches tab)'); continue; }
    if (ix['Wrong coach'] != null && norm_(s_(r[ix['Wrong coach']])).indexOf(norm_(em)) >= 0) { skip.push(lbl + ': ' + em + ' said this was sent in error. Fix Coach / Coach email (red row) first.'); continue; }
    (by[em.toLowerCase()] = by[em.toLowerCase()] || { name: nm, games: [] }).games.push({ row: i + 1, r: r, lbl: lbl });
  }
  var me = ''; try { me = Session.getActiveUser().getEmail(); } catch (x) {}
  var sent = [], g = CFG.green, btn = function (u) { return '<a href="' + u + '" style="display:inline-block;padding:10px 18px;border-radius:8px;background:' + g + ';color:#fff;font-weight:bold;text-decoration:none">Report the result</a>'; };
  Object.keys(by).forEach(function (em) {
    var c = by[em], first = (c.name || '').replace(/^(mr|mrs|ms|dr)\.?\s+/i, '').split(' ')[0];
    var html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1d1d1d;max-width:560px"><div style="font-weight:bold;letter-spacing:2px;color:' + g + ';font-size:12px">SOUTH FAYETTE ATHLETICS</div>' +
      '<p>Hi' + (first ? ' ' + first : '') + ',</p><p>Please send the final score and result for ' + (c.games.length > 1 ? 'these games' : 'this game') + ' on ' + prettyDay_(key) + '. It takes about 10 seconds and posts on the Staff Hub right away.</p>' +
      '<div style="background:#fff4c2;border:1px solid #e6c84f;border-radius:8px;padding:10px 14px;margin:12px 0;font-weight:bold">Please do not reply to this email. Use the green <span style="color:' + g + '">Report the result</span> button below. Replies are not recorded and will not appear on the hub.</div>' +
      c.games.map(function (x) { var r = x.r, id = r[ix['ID']], u = HUB_URL_ + '/?res=1&g=' + id + '&s=' + gameSig_(id);
        return '<div style="border:1px solid #e0e2e2;border-radius:10px;padding:14px 16px;margin:10px 0"><div style="font-size:12px;color:#5c5c5d;text-transform:uppercase;letter-spacing:1px">' + x.lbl.replace(/ vs .*/, '') + '</div><div style="font-size:17px;font-weight:bold;margin:2px 0 8px">vs ' + s_(r[ix['Opponent']]) + [s_(r[ix['Home/Away']]), tm_(r[ix['Time']])].filter(String).map(function (q) { return ' <span style="font-weight:normal;color:#5c5c5d;font-size:13px">· ' + q + '</span>'; }).join('') + '</div>' + btn(u) + '</div>'; }).join('') +
      '<p style="font-weight:bold">Reminder: do not reply. Results only post when you use the button.</p>' +
      '<div style="margin:22px 0 8px;padding:14px 16px;border:2px solid #b3261e;border-radius:10px;background:#fdecea"><div style="font-weight:bold;color:#b3261e;margin-bottom:8px">Not your team?</div><a href="' + HUB_URL_ + '/?wrong=1&g=' + c.games.map(function (x) { return x.r[ix['ID']]; }).join(',') + '&e=' + encodeURIComponent(em) + '&s=' + wrongSig_(c.games.map(function (x) { return x.r[ix['ID']]; }).join(','), em) + '" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#b3261e;color:#ffffff;font-weight:bold;text-decoration:none">I received this email in error</a><div style="font-size:12px;color:#5c5c5d;margin-top:8px">The athletic office will be told right away so the right coach gets the request.</div></div>' +
      '<p style="color:#5c5c5d;font-size:12px">You will be asked for the score (or your place for a meet), Win / Loss / Tie, your overall record, and highlights or special recognition (goals, assists, top finishers, milestones, senior night). The link works more than once if you need to fix something.</p><p>' + CFG.officeName + '</p></div>';
    try { MailApp.sendEmail({ to: em, noReply: true, subject: 'Final score request (use the button, do not reply): ' + c.games.map(function (x) { return x.lbl; }).join(', '), name: CFG.officeName, htmlBody: html });
      c.games.forEach(function (x) { sh.getRange(x.row, ix['Request sent'] + 1).setValue(stamp); sh.getRange(x.row, ix['Sent by'] + 1).setValue(me); }); sent.push(c.name + ' <' + em + '>: ' + c.games.map(function (x) { return x.lbl; }).join(', ')); }
    catch (x) { skip.push('FAILED ' + em + ': ' + x.message); }
  });
  alert_(prettyDay_(key) + '\n\nSent ' + sent.length + ' request(s):\n' + (sent.join('\n') || 'none') + (skip.length ? '\n\nNot sent:\n' + skip.join('\n') : ''));
}
function gameFind_(id) { var G = gameRows_(); for (var i = 1; i < G.v.length; i++) if (String(G.v[i][G.ix['ID']]) === String(id)) return { G: G, i: i, r: G.v[i] }; return null; }
function gamePub_(r, ix) { var q = function (k) { return ix[k] == null ? '' : s_(r[ix[k]]); }; return { date: prettyDay_(dk_(r[ix['Date']])), team: gameLabel_(r, ix), opp: q('Opponent'), event: q('Event'), ha: q('Home/Away'), loc: q('Location'), time: tm_(r[ix['Time']]), us: q('SF score'), them: q('Opp score'), result: q('Result'), place: q('Place'), record: q('Record'), hl: ix['Highlights'] == null ? '' : String(r[ix['Highlights']] || '').trim() }; }
function gameWrong_(p) {
  var ids = String(p.g || ''), em = String(p.e || '').toLowerCase();
  if (!ids || !em || p.s !== wrongSig_(ids, em)) return { ok: false, title: 'Link not valid', body: 'This link is incomplete or expired. Contact the athletic office.' };
  var G = gameRows_(), ix = G.ix, sh = G.sh, hits = [], stamp = Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'), to = {};
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { ids.split(',').forEach(function (id) { for (var i = 1; i < G.v.length; i++) if (String(G.v[i][ix['ID']]) === id) { var r = G.v[i], row = i + 1;
      sh.getRange(row, ix['Wrong coach'] + 1).setValue(em + ' · ' + stamp);
      sh.getRange(row, 1, 1, sh.getLastColumn()).setBackground('#f8d7da');
      sh.getRange(row, ix['Coach email'] + 1).setNote('Sent in error to ' + em + ' (' + stamp + '). Fix Coach / Coach email here, and on the Coaches tab if the coach came from there. Then clear the red and run Send game/activity update requests again.');
      hits.push({ row: row, lbl: gameLabel_(r, ix) + ' vs ' + s_(r[ix['Opponent']]), day: prettyDay_(dk_(r[ix['Date']])), coach: s_(r[ix['Coach']]) });
      var sb = s_(r[ix['Sent by']]); if (sb) to[sb.toLowerCase()] = 1; } }); } finally { lock.releaseLock(); }
  if (!hits.length) return { ok: false, title: 'Game not found', body: 'This game is no longer on the schedule. No action needed.' };
  var ss = SpreadsheetApp.getActive(), base = ss.getUrl() + '#gid=' + sh.getSheetId() + '&range=A', rec = Object.keys(to);
  if (!rec.length) rec = setting_('Admin emails').concat(CFG.officeEmails).filter(String);
  if (!rec.length) rec = [Session.getEffectiveUser().getEmail()];
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1d1d1d;max-width:560px"><div style="font-weight:bold;letter-spacing:2px;color:#b3261e;font-size:12px">GAME RESULT REQUEST SENT IN ERROR</div>' +
    '<p><b>' + em + '</b> says they should not have received the result request for:</p>' +
    hits.map(function (h) { return '<div style="border:1px solid #e0e2e2;border-left:0;border-radius:8px;padding:10px 14px;margin:8px 0;background:#fdecea"><b>' + h.lbl + '</b><br><span style="color:#5c5c5d">' + h.day + (h.coach ? ' · listed coach: ' + h.coach : '') + '</span><br><a href="' + base + h.row + '" style="color:#b3261e;font-weight:bold">Open Games tab, row ' + h.row + '</a></div>'; }).join('') +
    '<p><b>How to fix it</b></p><ol style="padding-left:20px">' +
    '<li>Open the <b>Games</b> tab. The row is highlighted red, and the <b>Wrong coach</b> column shows who flagged it.</li>' +
    '<li>Correct <b>Coach</b> and <b>Coach email</b> on that row.</li>' +
    '<li>If the coach was filled in automatically, also fix the <b>Coaches</b> tab (Sport, Level, Role = Head Coach, Email) so it does not happen again. Note: Update coaches from school website rebuilds that tab, so a wrong coach on the website will come back until the website is fixed.</li>' +
    '<li>Clear the red highlight and the <b>Wrong coach</b> cell, then run <b>Staff Hub → Send game/activity update requests</b> again. Games that already have a result are skipped.</li></ol></div>';
  try { MailApp.sendEmail({ to: rec.join(','), subject: 'Result request sent in error: ' + hits.map(function (h) { return h.lbl; }).join(', '), name: 'Staff Hub', htmlBody: html }); } catch (x) {}
  return { ok: true, title: 'Thanks for letting us know', body: 'The athletic office has been told that ' + hits.map(function (h) { return h.lbl; }).join(', ') + ' was sent to you in error. You will not get more requests for ' + (hits.length > 1 ? 'these games' : 'this game') + '. You can close this tab.' };
}
function gameApi_(p) {
  if (!p.g || p.s !== gameSig_(p.g)) return { ok: false, error: 'This link is incomplete or expired. Contact the main office.' };
  var f = gameFind_(p.g); if (!f) return { ok: false, error: 'This game is no longer on the schedule. Contact the main office.' };
  var ix = f.G.ix;
  if (p.action === 'gameres') {
    var res = String(p.result || ''); if (GAME_RES_.indexOf(res) < 0) return { ok: false, error: 'Pick Win, Loss, Tie or Meet.' };
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try { var row = f.i + 1, sh = f.G.sh, num = function (x) { x = String(x || '').trim(); return /^\d{1,3}$/.test(x) ? +x : x.slice(0, 12); };
      sh.getRange(row, ix['SF score'] + 1).setValue(num(p.us)); sh.getRange(row, ix['Opp score'] + 1).setValue(num(p.them)); sh.getRange(row, ix['Result'] + 1).setValue(res);
      if (p.place != null) sh.getRange(row, ix['Place'] + 1).setValue(String(p.place).slice(0, 80));
      if (p.record != null) sh.getRange(row, ix['Record'] + 1).setValue(String(p.record).slice(0, 60));
      if (p.hl != null) sh.getRange(row, ix['Highlights'] + 1).setValue(String(p.hl).slice(0, 1500));
      sh.getRange(row, ix['Reported by'] + 1).setValue(s_(f.r[ix['Coach']]) || s_(f.r[ix['Coach email']]));
      sh.getRange(row, ix['Reported at'] + 1).setValue(Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'));
      SpreadsheetApp.flush(); } finally { lock.releaseLock(); }
    bumpHubCache_(); f = gameFind_(p.g);
  }
  return { ok: true, game: gamePub_(f.r, ix) };
}
function resultsData_(key) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Games'); if (!sh || sh.getLastRow() < 2) return { y: [], t: [], yLabel: '' };
  var v = sh.getDataRange().getValues(), ix = {}; v[0].forEach(function (k, i) { ix[String(k)] = i; });
  var d = new Date(key + 'T12:00:00'), prev = new Date(d); do { prev.setDate(prev.getDate() - 1); } while (prev.getDay() % 6 === 0);   // Monday looks back to Friday (+ weekend)
  var from = dayKey_(prev), y = [], t = [];
  v.slice(1).forEach(function (r) { var k = dk_(r[ix['Date']]); if (!k) return; var o = gamePub_(r, ix);
    var wk = d.getDay() === 5 ? dayKey_(new Date(d.getTime() + 2 * 864e5)) : key;   // Friday also lists Saturday + Sunday
    o._k = k; o.day = Utilities.formatDate(new Date(k + 'T12:00:00'), tz_(), 'EEEE');
    if (k >= key && k <= wk) t.push(o); else if (k >= from && k < key && o.result) y.push(o); });
  var tm = function (o) { var m = /(\d+):(\d+)\s*(AM|PM)?/i.exec(o.time || ''); return m ? (+m[1] % 12 + (/pm/i.test(m[3] || '') ? 12 : 0)) * 60 + +m[2] : 9999; };
  t.sort(function (a, b) { return a._k === b._k ? tm(a) - tm(b) : a._k < b._k ? -1 : 1; });
  return { y: y, t: t, yLabel: d.getDay() === 1 ? 'Weekend results' : 'Yesterday\'s results', tLabel: d.getDay() === 5 ? 'Today + this weekend' : 'Today' };
}
/* One-time fix: the first schedule import skipped names written "SMITH, G." in the master schedule. Run once from the Apps Script editor
   (pick addSmithTeachers → Run), then run Staff Hub → Update staff from school website to fill their emails. Safe to re-run. */
function addSmithTeachers() {
  var sh = sheet_(CFG.staffTab), v = sh.getDataRange().getValues(), h = v[0].map(function (x) { return String(x).trim(); });
  var have = {}; v.slice(1).forEach(function (r) { have[norm_(r[0])] = 1; });
  var rows = [
    { Name: 'Smith, G.', Room: 'AC206', Dept: 'English', Department: 'English', Role: 'Teacher', P: ['AP English 11', 'Prep', 'Honors Lit. / Coming of Age / CT Podcasting w/ Flannery', 'AP English 11', 'Lunch', 'Department Chair', 'AP English 11', 'Honors Management / CT w/ Flannery'] },
    { Name: 'Smith, T.', Room: 'AA209', Dept: 'Social Studies', Department: 'Social Studies', Role: 'Teacher', P: ['AP Psych', 'AP Psych', 'Study Hall', 'Lunch', 'Prep', 'Child Psych / Modern History Through Pop Culture', 'AP Psych', 'AP Psych'] }];
  var added = [];
  rows.forEach(function (o) { if (have[norm_(o.Name)]) return;
    var r = h.indexOf('P1') < 0 ? [o.Name, o.Room, o.Dept, o.Role, ''].concat(o.P) : h.map(function (k) { var m = /^P([1-8])$/.exec(k); return m ? o.P[+m[1] - 1] : (o[k] != null ? o[k] : ''); });
    sh.appendRow(r); added.push(o.Name); });
  var old = sh.getDataRange().getValues(); for (var i = 1; i < old.length; i++) if (norm_(old[i][0]) === 'smith') sh.getRange(i + 1, 1).setNote('Two Smiths now: use "Smith, G." (English) or "Smith, T." (Social Studies). Delete this row if it is a duplicate.').setBackground('#fff4c2');
  try { STAFF_MEMO_ = null; } catch (x) {} bumpHubCache_();
  alert_(added.length ? 'Added ' + added.join(' and ') + ' to the Staff tab with their periods. Now run Staff Hub → Update staff from school website to fill their emails.' : 'Both Smiths are already on the Staff tab.');
}
function fillStaffEmails() {
  if (typeof People === 'undefined') {
    alert_('One-time setup needed:\n\n1. Extensions → Apps Script\n2. Left sidebar: click + next to "Services"\n3. Scroll to "People API" → click Add (leave identifier as "People")\n4. Come back here and run this again.');
    return;
  }
  var sh = sheet_(CFG.staffTab), v = sh.getDataRange().getValues(), h = v[0];
  var nameC = h.indexOf('Name'), emailC = h.indexOf('Email'), filled = 0, multi = 0, none = [];
  for (var i = 1; i < v.length; i++) {
    var last = String(v[i][nameC]).trim(); if (!last || v[i][emailC]) continue;
    var res = lookup_(last);
    var hits = (res.people || []).filter(function (p) {
      return (p.names || []).some(function (n) { return norm_(n.familyName) === norm_(last); }) && (p.emailAddresses || []).length;
    }).map(function (p) { return { name: p.names[0].displayName, email: p.emailAddresses[0].value }; });
    var cell = sh.getRange(i + 1, emailC + 1);
    if (hits.length === 1) { cell.setValue(hits[0].email).setNote(''); filled++; }
    else if (hits.length > 1) { cell.setNote('Pick one:\n' + hits.map(function (x) { return x.name + ' – ' + x.email; }).join('\n')).setBackground('#fff4c2'); multi++; }
    else none.push(last);
    Utilities.sleep(150);
  }
  alert_('Filled ' + filled + ' email(s).\n' + multi + ' have more than one match (yellow cells, hover to see the choices).\n' +
    (none.length ? 'Not found: ' + none.join(', ') : 'Everyone else was found.'));
}

/* ---------- one-time formatting (run after importing the .xlsx) ---------- */
var FMT = { green: '#008539', greenTint: '#e6f3eb', ink: '#1d1d1d', gray: '#5c5c5d', line: '#d9d9d9', band: '#f6f6f6', font: 'Lato' };

/* Tools → Refresh Coverage tab colors: re-applies the Coverage tab color rules and recolors every row from today on
   (blackouts for half days and period lists like "3, 4"). Quick; doesn't touch other tabs or the website pulls. */
/* Warn when an assignment in P4–P6 leaves that person with no lunch period today. */
function lunchCheck_(sh, p, v) {
  if (p < 4 || p > 6 || !v || /^(lunch|na|prep|duty:|ct:)/i.test(v) || isCoverRoom_(v)) return;
  var p1 = col_(sh, 'P1'), dc = col_(sh, 'Date'), h = hdr_(sh), n = sh.getLastRow() - h, today = todayKey_(); if (!p1 || n < 1) return;
  var rows = sh.getRange(h + 1, 1, n, p1 + 7).getValues(), busy = { 4: 0, 5: 0, 6: 0 }, who = norm_(v);
  rows.forEach(function (r) { if (dc && dk_(r[dc - 1]) !== today) return; [4, 5, 6].forEach(function (q) { if (norm_(r[p1 + q - 2]) === who) busy[q] = 1; }); });
  if (busy[4] && busy[5] && busy[6]) SpreadsheetApp.getActive().toast(v + ' is now covering P4, P5 and P6 today, so they have no lunch. Free up one of those periods.', 'No lunch for ' + v, 15);
}
function refreshCoverageColors() {
  var sh = sheet_(CFG.coverageTab); fmtCoverage_(sh); try { linkStaffNames_(); } catch (x) {}   // also rebuilds the P1–P8 dropdowns (Theater / Auditorium / Commons at the top)
  var tc = col_(sh, 'Teacher out'), dc = col_(sh, 'Date'), h = hdr_(sh), n = sh.getLastRow() - h, today = todayKey_(), done = 0;
  if (tc && n > 0) { var v = sh.getRange(h + 1, 1, n, sh.getLastColumn()).getValues();
    for (var i = 0; i < n; i++) { var nm = String(v[i][tc - 1] || '').trim(); if (!nm || (dc && dk_(v[i][dc - 1]) < today)) continue; try { markCoverage_(sh, h + 1 + i, nm, nm); done++; } catch (x) {} } }
  bumpHubCache_(); alert_('Coverage tab colors and dropdowns refreshed. ' + done + (done === 1 ? ' row' : ' rows') + ' from today on were recolored.');
}
function formatOfficeSheet() {
  var ss = SpreadsheetApp.getActive(), errs = [];
  var step = function (label, fn) { try { fn(); } catch (x) { errs.push(label + ': ' + x.message); Logger.log(label + ': ' + (x.stack || x)); } };
  // 1. make sure every tab exists (each is skipped if already there)
  step('Settings tab', function () { setupSettings_(true); });
  step('Quotes tab', quotesSheet_); step('Subs tab', subsTab_); step('Chill Room tab', chillTab_); step('Flex Testing tab', flexTab_);
  step('Announcements banners', function () { annTop_(false); });
  step('Announcements columns', ensureAnnCols_);
  step('Banner email trigger', bannerTrigger_);
  step('Duty Posts tab', function () { POSTS_ = null; dutyPost_(''); });
  step('Games tab', gamesTab_);
  // corrective items built after the first setup; each skips itself when already done
  QUIET_ = [];
  step('Bell schedules (Fall Festival, HOCO, Custom)', function () { addNewBellSchedules(); ensureCustom_(); });
  step('Missing teachers (Smith, G. + Smith, T.)', function () { var pr = PropertiesService.getScriptProperties(); if (pr.getProperty('smithFix')) return; addSmithTeachers(); pr.setProperty('smithFix', '1'); });
  step('Staff from school website', updateStaffFromWebsite);
  step('Coaches from school website', updateCoachesFromWebsite);
  step('Games from school website', function () { alert_(pullGames_()); });
  var notes = QUIET_.filter(function (m) { return /added [1-9]|filled [1-9]|not on the website|still need|not found|could not|games pulled/i.test(m); }); QUIET_ = null;
  // 2. standard table look for plain tabs; custom-layout tabs keep their own formatting
  var SKIP = { 'Home': 1, 'Chill Room': 1, 'Chill Room (old)': 1, 'Hub Errors': 1, 'Settings': 1 }; SKIP[CFG.logTab] = 1;
  ss.getSheets().forEach(function (sh) {
    var n = sh.getName(); if (SKIP[n]) return;
    step(n + ' tab', function () {
      var w = Math.max(tableCols_(sh), 1);
      sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), w).setFontFamily(FMT.font).setFontSize(10).setFontColor(FMT.ink).setVerticalAlignment('middle');
      if (n === 'Instructions') return fmtInstructions_(sh);
      if (n === 'Schedule') return fmtSchedule_(sh);
      if (n === CFG.bellTab) return fmtBells_(sh);
      fmtTable_(sh);
    });
  });
  // 3. tab-specific rules (after the table pass, which resets conditional formatting)
  var c = ss.getSheetByName('Calendar'); if (c) step('Calendar colors', function () { fmtCalendar_(c); });
  step('Announcements banner colors', function () { annTop_(true); });
  var cv = ss.getSheetByName(CFG.coverageTab);
  if (cv) { step('Coverage layout', function () { fmtCoverage_(cv); }); step('Coverage key', function () { coverageKey_(cv, true); });
    step('Coverage rows (outlines, labels)', function () { remarkRecent_(cv); }); step('Subs available list', function () { OUTAT_ = {}; availPanel_(cv); }); }
  var t = ss.getSheetByName('Testing'); if (t) step('Testing', function () { fmtTesting_(t); });
  var st = ss.getSheetByName(CFG.staffTab); if (st) step('Staff', function () { fmtStaff_(st); });
  step('Flex Testing colors', function () { fmtFlex_(ss.getSheetByName('Flex Testing')); });
  step('Quotes checkboxes', function () { fmtQuotes_(ss.getSheetByName('Quotes')); });
  step('Name dropdowns', linkStaffNames_);
  step('Schedule dropdown', function () { schedDropdown_(); });
  // 4. Settings layout and the Home dashboard last
  step('Settings layout', function () { setupSettings_(true); });
  step('Home dashboard', buildHome);
  var extra = notes.length ? '\n\nFrom the website and staff checks:\n\n' + notes.map(function (m) { return m.slice(0, 600); }).join('\n\n') : '';
  alert_((errs.length ? 'Setup finished, but ' + errs.length + ' step(s) had a problem:\n\n• ' + errs.join('\n• ') + '\n\nEverything else was formatted. Send this message to get it fixed.'
    : 'Every tab is set up and formatted: bell schedules (incl. Custom), Games tab, staff and coaches from the school website, and all dropdowns. Safe to run again any time.') + extra);
}
/* Re-applies outlines, Prep / Lunch / duty labels and rooms to Coverage rows dated from 2 weeks ago to 4 weeks ahead. */
function remarkRecent_(sh) {   // yesterday through 2 weeks ahead; a row that fails is listed, the rest still run
  var dc = col_(sh, 'Date'), tc = col_(sh, 'Teacher out'); if (!dc || !tc) return;
  var v = sh.getDataRange().getValues(), now = new Date(), lo = dayKey_(new Date(now.getTime() - 864e5)), hi = dayKey_(new Date(now.getTime() + 14 * 864e5)), bad = [], start = Date.now();
  for (var i = 1; i < v.length; i++) {
    var k = dk_(v[i][dc - 1]), t = String(v[i][tc - 1]).trim(); if (!t || !k || k < lo || k > hi) continue;
    if (Date.now() - start > 240000) { bad.push('stopped early (time limit). Run Format sheet again to finish'); break; }
    try { markCoverage_(sh, i + 1, t, t); } catch (x) { bad.push('row ' + (i + 1) + ' (' + t + '): ' + x.message); }
  }
  if (bad.length) throw new Error(bad.slice(0, 4).join('; '));
}
function fmtFlex_(sh) {
  if (!sh) return;
  var a = col_(sh, 'Test received'), b = col_(sh, "Didn't sign up"), n = rows_(sh), w = tableCols_(sh);
  [a, b].forEach(function (c) { if (c) { var r = sh.getRange(2, c, n, 1); if (!r.getDataValidation()) r.insertCheckboxes(); r.setHorizontalAlignment('center'); sh.setColumnWidth(c, 110); } });
  var L = function (c) { return String.fromCharCode(64 + c); }, rules = [];
  if (b) rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + L(b) + '2=TRUE').setBackground('#fce8e6').setRanges([sh.getRange(2, 1, n, w)]).build());
  if (a) rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + L(a) + '2=TRUE').setBackground('#e6f3eb').setRanges([sh.getRange(2, 1, n, w)]).build());
  sh.setConditionalFormatRules(rules);
}
function fmtQuotes_(sh) {
  if (!sh) return;
  var c = col_(sh, 'Show?'); if (!c) return;
  var r = sh.getRange(2, c, rows_(sh), 1); if (!r.getDataValidation()) r.insertCheckboxes(); r.setHorizontalAlignment('center');
  sh.setColumnWidth(col_(sh, 'Quote') || 1, 460); sh.getRange(2, col_(sh, 'Quote') || 1, rows_(sh), 1).setWrap(true);
}

/* Name columns get a type-ahead dropdown fed live from the Staff tab (new hires show up automatically).
   Typing a name that isn't on Staff (day sub, outside coach) is still allowed. */
function linkStaffNames_() {
  var ss = SpreadsheetApp.getActive(), staff = ss.getSheetByName(CFG.staffTab); if (!staff) return;
  var src = staff.getRange('A2:A'), rule = SpreadsheetApp.newDataValidation().requireValueInRange(src, true).setAllowInvalid(true).build();
  [[CFG.coverageTab, ['Teacher out']], ['Testing', ['Teacher']], ['Flex Testing', ['Teacher Last Name']], ['Trip Rosters', ['Trip teacher']], ['Early Dismissals', ['Coach']]]
    .forEach(function (t) {
      var sh = ss.getSheetByName(t[0]); if (!sh) return;
      t[1].forEach(function (h) { var c = col_(sh, h); if (c) sh.getRange(2, c, rows_(sh), 1).setDataValidation(rule); });
    });
  var subs = subsTab_(), cv = ss.getSheetByName(CFG.coverageTab), p1 = cv && col_(cv, 'P1'), fs = cv && col_(cv, 'Full-day sub');
  if (fs) cv.getRange(2, fs, rows_(cv), 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(subs.getRange('A2:A'), true).setAllowInvalid(true).build());
  if (p1) {
    var names = staff.getRange(2, 1, Math.max(staff.getLastRow() - 1, 1), 1).getValues().map(function (r) { return String(r[0]).trim(); }).filter(String).sort();
    var subNames = subs.getRange(2, 1, Math.max(subs.getLastRow() - 1, 1), 1).getValues().map(function (r) { return String(r[0]).trim(); }).filter(String).sort();
    var list = ['NA', 'Lunch'].concat(COVER_ROOMS_, names, subNames, names.map(function (n) { return 'Duty: ' + n; })).slice(0, 500);
    cv.getRange(2, p1, rows_(cv), 8).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(true).build());
  }
}

/* Room written inside a period cell: "Algebra II (AA115)", "Algebra II AA115" or "Algebra II\nAA115". Teachers without their own room
   (Staff tab Room blank) move rooms all day, so the room for each period comes from here. */
function roomIn_(course) { var m = String(course || '').match(/(?:\(|\s|^)([A-Z]{1,3}\s?\d{2,4}[A-Z]?)\)?\s*$/); return m ? m[1].replace(/\s+/, '') : ''; }
function courseOnly_(course) { return String(course || '').replace(/\s*\(?\b[A-Z]{1,3}\s?\d{2,4}[A-Z]?\)?\s*$/, '').replace(/\s+/g, ' ').trim(); }
/* No sub available: students from that period go to one of these rooms instead. Picked in P1–P8 like a name; nobody is emailed. */
var COVER_ROOMS_ = ['Theater', 'Auditorium', 'Commons (Cafeteria)', 'Gym Lobby', 'Library', 'Conference Center'];
function isCoverRoom_(v) { v = norm_(v); return COVER_ROOMS_.some(function (x) { return norm_(x) === v; }) || /^(theat(er|re)|auditorium|commons|cafeteria|gym lobby|library|conference cent(er|re))\b/.test(v); }
function roomKey_(v) { v = norm_(v); var hit = COVER_ROOMS_.filter(function (x) { var k = norm_(x); return k === v || k.split(' ')[0] === v.split(' ')[0]; })[0]; return norm_(hit || v); }
/* Room Supervision tab: Date | Room | P1..P8 | Notes. One row per room per day; each P cell = who supervises the classes sent there.
   Filled from the Find a coverer sidebar (click a cell that holds a room). Supervisors get one coverage email listing every class in the room. */
var ROOM_SUP_TAB_ = 'Room Supervision';
function roomSupTab_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(ROOM_SUP_TAB_);
  if (!sh) {
    sh = ss.insertSheet(ROOM_SUP_TAB_);
    var h = ['Date', 'Room', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'Flex', 'Notes'];
    sh.getRange(1, 1, 1, h.length).setValues([h]); headerStyle_(sh.getRange(1, 1, 1, h.length)); sh.setFrozenRows(1);
    sh.setColumnWidth(1, 100); sh.setColumnWidth(2, 170); for (var c = 3; c <= 11; c++) sh.setColumnWidth(c, 130); sh.setColumnWidth(12, 220);
    sh.getRange('A2:A').setNumberFormat('M/d/yyyy');
    sh.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(COVER_ROOMS_, true).setAllowInvalid(true).build());
    sh.getRange('B1').setNote('One row per room per day. P1–P8 = who supervises the classes sent to this room that period. The Find a coverer sidebar fills this in.');
  }
  if (!col_(sh, 'Flex') && col_(sh, 'P8')) { sh.insertColumnAfter(col_(sh, 'P8')); sh.getRange(1, col_(sh, 'P8') + 1).setValue('Flex'); sh.getRange(1, col_(sh, 'P8')).copyFormatToRange(sh, col_(sh, 'P8') + 1, col_(sh, 'P8') + 1, 1, 1); }
  return sh;
}
function roomSup_(key) {   // { roomKey: { row, room, per:[8] } } for that date
  var m = {}, sh = SpreadsheetApp.getActive().getSheetByName(ROOM_SUP_TAB_); if (!sh) return m;
  var v = sh.getDataRange().getValues(), h = v[0].map(s_), ix = function (n) { return h.indexOf(n); }, cols = [1, 2, 3, 4, 5, 6, 7, 8].map(function (p) { return ix('P' + p); }).concat([ix('Flex')]);
  for (var i = 1; i < v.length; i++) { if (dk_(v[i][0]) !== key || !s_(v[i][1])) continue;
    m[roomKey_(v[i][1])] = { row: i + 1, room: s_(v[i][1]), per: cols.map(function (c) { return c < 0 ? '' : s_(v[i][c]); }), note: ix('Notes') < 0 ? '' : s_(v[i][ix('Notes')]) }; }
  return m;
}
function roomClasses_(key, p, rk) {   // teachers out whose period p was sent to that room
  return rowsOf_(CFG.coverageTab).filter(function (r) { var c = cv_(r, p); return dk_(r['Date']) === key && s_(r['Teacher out']) && c && isCoverRoom_(c) && roomKey_(c) === rk; })
    .map(function (r) { return s_(r['Teacher out']); });
}
function setRoomSup_(key, room, p, name) {
  var sh = roomSupTab_(), m = roomSup_(key), rec = m[roomKey_(room)], row;
  if (rec) row = rec.row; else { var d = key.split('-'); sh.appendRow([new Date(+d[0], d[1] - 1, +d[2]), room]); row = sh.getLastRow(); }
  sh.getRange(row, p === FX_ ? col_(sh, 'Flex') : col_(sh, 'P' + p)).setValue(name);
}
/* Subs tab: the district's day-to-day substitutes. Feeds the Full-day sub dropdown on Coverage (teachers are not listed there). Created on first Format sheet. */
function subsTab_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Subs');
  if (!sh) {
    sh = ss.insertSheet('Subs');
    sh.getRange(1, 1, 1, 5).setValues([['Name', 'Email', 'Phone', 'Certification', 'Notes']]);
    headerStyle_(sh.getRange(1, 1, 1, 5)); sh.setFrozenRows(1);
    sh.setColumnWidths(1, 1, 180); sh.setColumnWidths(2, 1, 240); sh.setColumnWidths(3, 2, 130); sh.setColumnWidths(5, 1, 280);
  }
  return sh;
}
function subLookup_(name) {
  var v = subsTab_().getDataRange().getValues(), k = norm_(name);
  for (var i = 1; i < v.length; i++) if (norm_(v[i][0]) === k) return { name: String(v[i][0]).trim(), email: String(v[i][1] || '').trim(), phone: String(v[i][2] || '').trim() };
  return null;
}

/* Runs on every edit (no setup needed). Picking a teacher fills in their room; a new Coverage row also gets today's date and "Full day". */
function onEdit(e) {
  if (!e || !e.range) return;
  bumpHubCache_();
  try { annAdminFlag_(e); } catch (x) {}
  try { annEdit_(e); } catch (x) {}
  try { if (e.range.getSheet().getName() === CFG.bellTab && e.range.getColumn() === 1) schedDropdown_(); } catch (x) {}
  if (e.range.getNumRows() > 1 || e.range.getNumColumns() > 1) return;
  var sh = e.range.getSheet(), n = sh.getName(), r = e.range.getRow(), c = e.range.getColumn(), v = String(e.value || '').trim();
  try { quickFill_(sh, n, r, c, v, e.oldValue); } catch (x) {}
  if (r >= 2 && n === 'Games') { try { gameCoachFill_(sh, r, c); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && c === col_(sh, 'Teacher out')) { try { markCoverage_(sh, r, v, e.oldValue); remarkPartners_(sh, r, [v, e.oldValue]); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && c === col_(sh, 'Type')) { try { var tc0 = col_(sh, 'Teacher out'), tn = tc0 && sh.getRange(r, tc0).getValue(); if (tn) markCoverage_(sh, r, tn, tn); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && c >= (col_(sh, 'P1') || 99) && c < (col_(sh, 'P1') || 99) + 8) { try { checkSubPull_(sh, r, c - col_(sh, 'P1') + 1, v); } catch (x) {} try { lunchCheck_(sh, c - col_(sh, 'P1') + 1, v); } catch (x) {} try { confirmPull_(sh, r, c - col_(sh, 'P1') + 1, v, e.oldValue); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && c === col_(sh, 'Full-day sub')) { try { fillSub_(sh, r, v, e.oldValue); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && c === col_(sh, 'Flex')) { try { labelRow_(sh, r); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab && (c >= (col_(sh, 'P1') || 99) && c < (col_(sh, 'P1') || 99) + 8 || c === col_(sh, 'Room'))) { try { labelRow_(sh, r); } catch (x) {} }
  if (r >= 2 && n === CFG.coverageTab) { try { OUTAT_ = {}; availPanel_(sh); } catch (x) {} }
}
function quickFill_(sh, n, r, c, v, oldV) {   // runs FIRST in onEdit so Room/Date/Type appear even if the slower coloring runs out of time
  if (r < 2 || !v) return;
  var who = n === CFG.coverageTab ? 'Teacher out' : n === 'Testing' ? 'Teacher' : null;
  if (!who || c !== col_(sh, who)) return;
  var s = staffLookup_(v); if (!s) return;
  var room = col_(sh, 'Room'); if (room && (!sh.getRange(r, room).getValue() || (oldV && norm_(oldV) !== norm_(v)))) sh.getRange(r, room).setValue(String(s.room || '').trim() || 'N/A');   // new teacher on the row: their room, not the last one's
  var d = col_(sh, 'Date'); if (d && !sh.getRange(r, d).getValue()) sh.getRange(r, d).setValue(new Date(new Date().toDateString()));
  if (n === CFG.coverageTab) { var t = col_(sh, 'Type'); if (t && !sh.getRange(r, t).getValue()) sh.getRange(r, t).setValue('Full day'); }
  SpreadsheetApp.flush();
}
/* Menu: fill Room (and recolor) for every Coverage row from today on that has a teacher but no room. */
function fillMissingRooms() {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.coverageTab); if (!sh) return;
  var tc = col_(sh, 'Teacher out'), rc = col_(sh, 'Room'), dc = col_(sh, 'Date'), last = sh.getLastRow(); if (!tc || !rc || last < 2) return;
  var v = sh.getRange(1, 1, last, sh.getLastColumn()).getValues(), today = todayKey_(), n = 0, miss = [];
  for (var i = 1; i < v.length; i++) {
    var nm = s_(v[i][tc - 1]); if (!nm || s_(v[i][rc - 1])) continue;
    if (dc && dk_(v[i][dc - 1]) < today) continue;
    var s = staffLookup_(nm); if (!s) { miss.push(nm + ' (row ' + (i + 1) + ')'); continue; }
    sh.getRange(i + 1, rc).setValue(String(s.room || '').trim() || 'N/A');
    try { markCoverage_(sh, i + 1, s.name, s.name); } catch (x) {}
    n++;
  }
  try { OUTAT_ = {}; availPanel_(sh); } catch (x) {}
  bumpHubCache_();
  SpreadsheetApp.getActive().toast(n + ' row' + (n === 1 ? '' : 's') + ' filled.' + (miss.length ? ' Not on the Staff tab: ' + miss.join(', ') : ''), 'Staff Hub', 10);
}
/* Coverage tab: when a teacher out is picked, outline P1–P8 for that row.
   Green = they teach that period (needs a coverer). Black = their duty/Engagement/SAP (duty name typed into the cell if blank). Red = their lunch. Blue = their prep ("Prep" typed in). */
/* Half day AM = P1–P4 (7:20–10:55; on Flex Days 7:20–11:02, Flex included), Half day PM = P4–P8 (10:55–2:00; on Flex Days 10:21–1:58, no Flex), anything else = all day. P4 needs a sub on both. */
/* Type can also be a period list ("3, 4", "Pd 2 & 6", "P3,P4"): only those periods need a sub, the rest are blacked out. */
/* Wednesday Flex Days: the Flex block (between P3 and P4) is its own column, "Flex", after P8 on the Coverage tab.
   Inside the script Flex is period number 9 (FX_) so it can share the P1–P8 logic; it is listed between P3 and P4.
   Full day and Half day AM include Flex. Half day PM does not. A period list includes Flex when "F" or "Flex" is typed ("3, F") or when it has both 3 and 4. */
var FX_ = 9, FLEXDAY_ = {};
function isFlexDay_(key) {
  if (FLEXDAY_[key] == null) {
    var c = CacheService.getScriptCache(), hit = c.get('flexday:' + key);
    if (hit != null) FLEXDAY_[key] = hit === '1';
    else { try { var n = todaysBells_(key).name; FLEXDAY_[key] = /flex/i.test(n) && !/no flex/i.test(n); } catch (x) { FLEXDAY_[key] = false; } c.put('flexday:' + key, FLEXDAY_[key] ? '1' : '0', 3600); }
  }
  return FLEXDAY_[key];
}
function pers_(key) { return isFlexDay_(key) ? [1, 2, 3, FX_, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8]; }
function cv_(r, p) { return s_(p === FX_ ? r['Flex'] : r['P' + p]); }
function pl_(p) { return p === FX_ ? 'Flex' : 'P' + p; }
function plong_(p) { return p === FX_ ? 'Flex' : 'Period ' + p; }
function bk_(p) { return p === FX_ ? 'FLEX' : 'P' + p; }
function pord_(p) { return p === FX_ ? 3.5 : p; }
function pcol_(sh, p) { return p === FX_ ? col_(sh, 'Flex') : col_(sh, 'P1') + p - 1; }
function ensureFlexCol_(sh) {
  if (!sh || col_(sh, 'Flex')) return;
  var p8 = col_(sh, 'P8'); if (!p8) return;
  sh.insertColumnAfter(p8);
  sh.getRange(1, p8 + 1).setValue('Flex').setNote('Wednesday Flex Days only (Flex block, between P3 and P4). Type who covers the absent teacher\'s Flex group, or pick a room. Black = not a Flex day, or the teacher is here for Flex.');
  sh.getRange(1, p8).copyFormatToRange(sh, p8 + 1, p8 + 1, 1, 1);
}
function win_(t, pmStart) {
  t = norm_(t); var hasF = /\b(flex|f)\b/.test(t), s = t.replace(/\b(flex|f)\b/g, ' ').replace(/\b(periods?|pds?|and)\b\.?|p(?=\d)/g, ' ').trim();
  if (hasF && /^[\s,&\/]*$/.test(s)) { var wf = [99, 0]; wf.only = {}; wf.flex = true; return wf; }
  if (/^[\s,&\/]*[1-8]([\s,&\/]+[1-8])*[\s,&\/]*$/.test(s)) {
    var only = {}, list = s.match(/[1-8]/g).map(Number); list.forEach(function (p) { only[p] = 1; });
    var w = [Math.min.apply(null, list), Math.max.apply(null, list)]; w.only = only; w.flex = hasF || (!!only[3] && !!only[4]); return w;
  }
  var r = /half day am/.test(t) ? [1, 4] : /half day pm/.test(t) ? [pmStart || 5, 8] : [1, 8];
  r.flex = !/half day pm/.test(t); return r;
}
function inWin_(w, p) { if (p === FX_) return !!w.flex; return p >= w[0] && p <= w[1] && (!w.only || !!w.only[p]); }
function window_(sh, r) {
  var tc = col_(sh, 'Type');
  return win_(tc ? sh.getRange(r, tc).getDisplayValue() : '', 4);
}
/* Color key, two columns to the right of the Coverage table. Built once (or rebuilt by Format sheet). */
function coverageKey_(sh, force) {
  if (!sh) return;
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], last = 0;
  for (var i = 0; i < h.length; i++) { if (String(h[i]).trim() === 'KEY') break; if (String(h[i]).trim()) last = i + 1; }
  var c = last + 2;
  if (!force && String(sh.getRange(1, c).getValue()) === 'KEY') return;
  if (sh.getMaxColumns() < c + 1) sh.insertColumnsAfter(sh.getMaxColumns(), c + 1 - sh.getMaxColumns());
  var rows = [
    ['KEY', ''],
    ['Class', 'Teaches this period. Needs a coverer (the full-day sub fills in here).', '#cdebd7', null],
    ['Duty', 'Duty, Engagement or SAP. Assign by typing Duty: Name.', '#dadce0', null],
    ['Prep', 'Prep. No coverage needed. The full-day sub is free and can be pulled.', '#d2e3fc', null],
    ['CT: Name', 'Co-taught class. The co-teacher teaches it, so no sub is needed and the sub is free. Turns green if both co-teachers are out.', '#e8d5f3', null],
    ['Lunch', 'Lunch. Never assign coverage.', '#fad2cf', null],
    ['', 'Black fill: half day, teacher is here (no coverage).', null, '#000000'],
    ['Flex', 'Flex column: Wednesday Flex Days only (between P3 and P4). Black on other days, on No Flex Wednesdays, and on Half day PM.', '#cdebd7', null],
    ['', 'Note on a cell: PULLED = sub is free that period. CONFLICT = sub is busy, pick someone else.', null, null]
  ];
  roomFor_(sh, rows.length + 1, c + 1);
  var rg = sh.getRange(1, c, rows.length, 2).clear().clearNote();
  rg.setValues(rows.map(function (x) { return [x[0], x[1]]; })).setFontFamily(FMT.font).setFontSize(10).setVerticalAlignment('middle').setWrap(true);
  sh.getRange(1, c, 1, 2).merge().setFontWeight('bold').setFontColor('#ffffff').setBackground(FMT.green).setHorizontalAlignment('left');
  rows.forEach(function (x, i) {
    if (!i) return; var cell = sh.getRange(i + 1, c);
    cell.setHorizontalAlignment('center').setFontWeight('bold');
    if (x[2]) cell.setBackground(x[2]);
    if (x[3]) cell.setBackground(x[3]);
  });
  sh.setColumnWidth(c, 110); sh.setColumnWidth(c + 1, 300); sh.setColumnWidth(c - 1, 24);
}
/* ---------- Co-taught classes ----------
   A class whose Staff-tab text has "w/ Name" is co-taught. If only one co-teacher is out, the other teaches it:
   no sub is needed, the cell reads "CT: Name" (purple outline), the partner gets an FYI email, and the sub is free that period.
   If both co-teachers are out that period, it is a normal class (green) and needs coverage. */
function ctPartner_(s, p) { var m = String((s.per || [])[p - 1] || '').match(/w\/\s*([A-Za-z'\-]+)/i); return m ? m[1] : ''; }
var OUTAT_ = {};
function outAt_(key) {
  if (OUTAT_[key]) return OUTAT_[key];
  var m = {}; rowsOf_(CFG.coverageTab).forEach(function (r) {
    if (dk_(r['Date']) !== key || !s_(r['Teacher out'])) return;
    var t = norm_(r['Type']); if (/building|no coverage/.test(t)) return;
    m[norm_(s_(r['Teacher out']).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))] = win_(t, 5);
  });
  return (OUTAT_[key] = m);
}
/* Partner who will teach this period, or '' if not co-taught / partner also out. */
function ctCover_(key, s, p) {
  var who = ctPartner_(s, p); if (!who) return '';
  var w = outAt_(key)[norm_(who)];
  return w && inWin_(w, p) ? '' : who;
}
function markCoverage_(sh, r, name, oldName) {
  OUTAT_ = {};
  var dcol = col_(sh, 'Date'), rkey = dcol ? dk_(sh.getRange(r, dcol).getValue()) : todayKey_();
  try { coverageKey_(sh, false); } catch (x) {}
  var p1 = col_(sh, 'P1'); if (!p1) return;
  var cells = sh.getRange(r, p1, 1, 8), vals = cells.getValues()[0], staff = staff_();
  var old = oldName && staff[norm_(oldName)];
  vals = vals.map(function (x, i) { return old && String(x).trim() === String((old.per || [])[i] || '').trim() ? '' : x; });   // clear duty text left by the previous teacher
  cells.setBorder(false, false, false, false, false, false);
  var s = name && staff[norm_(String(name).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))];
  var w = window_(sh, r);
  cells.setBackground(null);
  if (s) for (var q = 1; q <= 8; q++) if (!inWin_(w, q)) { sh.getRange(r, p1 + q - 1).setBackground('#000000').setFontColor('#000000'); vals[q - 1] = ''; }   // half day: periods the teacher is here for are blacked out and cleared (no sub needed)
  if (s) for (var q2 = w[0]; q2 <= w[1]; q2++) if (inWin_(w, q2)) sh.getRange(r, p1 + q2 - 1).setFontColor(null);
  if (s) for (var p = w[0]; p <= w[1]; p++) { if (!inWin_(w, p)) continue;
    var kind = slot_(s, p, ''), cell = sh.getRange(r, p1 + p - 1), ct = (kind === 'class') ? ctCover_(rkey, s, p) : '';
    var cur0 = String(vals[p - 1]).trim();
    if (/^ct:/i.test(cur0) && !ct) { vals[p - 1] = ''; cur0 = ''; }   // partner is now out too: back to a normal class
    if (ct) {
      cell.setBackground('#e8d5f3');
      var subNow = col_(sh, 'Full-day sub') ? norm_(sh.getRange(r, col_(sh, 'Full-day sub')).getValue()) : '';
      if (!cur0 || (subNow && norm_(cur0) === subNow)) vals[p - 1] = 'CT: ' + ct;
    }
    else if (kind === 'class' || kind === 'coteach') cell.setBackground('#cdebd7');
    else if (kind === 'lunch') { cell.setBackground('#fad2cf'); if (!String(vals[p - 1]).trim()) vals[p - 1] = 'Lunch'; }
    else if (kind === 'prep') {   // blue = prep: the sub (or nobody) is free here and can be pulled to cover something else
      cell.setBackground('#d2e3fc');
      if (!String(vals[p - 1]).trim()) vals[p - 1] = 'Prep';
    }
    else if (kind === 'duty') {
      cell.setBackground('#dadce0');
      if (!String(vals[p - 1]).trim()) vals[p - 1] = String(s.per[p - 1]).trim();
    }
  }
  cells.setValues([vals]);
  var fxc = col_(sh, 'Flex');
  if (fxc) { var fcell = sh.getRange(r, fxc), fv = String(fcell.getValue()).trim();
    fcell.setBorder(false, false, false, false, false, false).setBackground(null).setFontColor(null);
    if (s && (!isFlexDay_(rkey) || !inWin_(w, FX_))) { fcell.setBackground('#000000').setFontColor('#000000'); if (fv) fcell.clearContent(); }   // not a Flex day, or the teacher is here for Flex
    else if (s) fcell.setBackground('#cdebd7'); }
  var sc = col_(sh, 'Full-day sub'), sub = sc && String(sh.getRange(r, sc).getValue()).trim();
  if (sub) fillSub_(sh, r, sub, sub);
  labelRow_(sh, r);
}
/* Three-line labels inside the P1–P8 cells, done with a number format so the cell VALUE stays just the name
   (emails, the hub, the sidebar and sub schedules keep reading the name) while the cell DISPLAYS:
     line 1  who is there (the sub / coverer, or — if nobody yet)
     line 2  room (or duty post)
     line 3  what it is: the class name, Prep, Lunch or Duty: Hall Duty
   Rebuilt on every edit to the row, and by Setup → Format sheet. */
function labelRow_(sh, r) {
  var p1 = col_(sh, 'P1'), tc = col_(sh, 'Teacher out'); if (!p1 || !tc) return;
  var cells = sh.getRange(r, p1, 1, 8), name = String(sh.getRange(r, tc).getValue()).trim();
  var s = name && staff_()[norm_(name.replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))];
  if (!s) { cells.setNumberFormat('@'); return; }
  var rc = col_(sh, 'Room'), fc = col_(sh, 'Full-day sub');
  var rowRoom = rc ? String(sh.getRange(r, rc).getValue()).trim() : '', sub = fc ? String(sh.getRange(r, fc).getValue()).trim() : '';
  var w = window_(sh, r), vals = cells.getValues()[0], fmts = [];
  var lit = function (t) { return '"' + String(t).replace(/"/g, "'") + '"'; };
  var three = function (a, b, c) { return lit([a || '—', b || '', c || ''].join('\n').replace(/\n+$/, '')); };
  for (var p = 1; p <= 8; p++) {
    var course = String((s.per || [])[p - 1] || ''), kind = slot_(s, p, ''), v = String(vals[p - 1]).trim(), f = '@';
    var room = roomIn_(course) || (String(s.room || '').trim() ? rowRoom || String(s.room).trim() : 'N/A');
    var cname = courseOnly_(course);
    if (v && !/^na$/i.test(v) && inWin_(w, p)) {
      if (kind === 'duty') {
        var post = ''; try { post = dutyPost_(course); } catch (x) {}
        var who = /^duty:/i.test(v) ? v.replace(/^duty:\s*/i, '') : (v === course ? '' : v);
        f = three(who, post, 'Duty: ' + course);
      } else if (kind === 'prep') f = three(/^prep$/i.test(v) ? sub : v, room, 'Prep');
      else if (kind === 'lunch') f = three(/^lunch$/i.test(v) ? sub : v, '', 'Lunch');
      else if (/^ct:/i.test(v)) f = three(v.replace(/^ct:\s*/i, '') + ' (co-teacher)', room, cname.replace(/\s*w\/.*$/i, ''));
      else f = three(v, room, cname);
    }
    fmts.push(f);
  }
  try { cells.setNumberFormats([fmts]); SpreadsheetApp.flush(); }
  catch (x) { cells.setNumberFormats([fmts.map(function (f) { return f.replace(/\n/g, '  ·  '); })]); }   // some Sheets versions reject line breaks in a format
  cells.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
  var fxc = col_(sh, 'Flex');
  if (fxc) { var fcl = sh.getRange(r, fxc), fv = String(fcl.getValue()).trim(), dc = col_(sh, 'Date'), rk = dc ? dk_(sh.getRange(r, dc).getValue()) : todayKey_();
    var ff = fv && isFlexDay_(rk) && inWin_(w, FX_) ? (isCoverRoom_(fv) ? three(fv, '', 'Flex group sent here') : three(fv, String(s.room || '').trim() ? rowRoom || String(s.room).trim() : 'N/A', 'Flex')) : '@';
    try { fcl.setNumberFormat(ff); } catch (x) { fcl.setNumberFormat(ff.replace(/\n/g, '  ·  ')); }
    fcl.setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center'); }
}
/* Full-day sub picked: write their name into every teaching period (green) that is blank or still holds the previous sub. Duties are left for the office. */
/* ---------- Pull-from-prep safeguard ----------
   Typing a staff name into a period where they have prep, lunch or a class asks "Are you sure?".
   Yes = the cell gets an APPROVED note and the email goes out. No = the cell goes back to what it was.
   If the pop-up can't show (some editors / mobile), the cell gets a NEEDS OK note; approve it from the menu. */
function pullInfo_(sh, r, p, val) {
  var name = String(val || '').replace(/^duty:\s*/i, '').trim(); if (!name || /^(na|lunch|prep)$/i.test(name) || isCoverRoom_(name)) return null;
  var tc = col_(sh, 'Teacher out'), dc = col_(sh, 'Date'); if (!tc) return null;
  var outName = String(sh.getRange(r, tc).getValue()).trim(), staff = staff_(), bare = function (n) { return norm_(String(n).replace(/^(mr|mrs|ms|dr)\.?\s+/i, '')); };
  var s = staff[bare(name)]; if (!s || /sub/.test(s.role)) return null;
  var absent = staff[bare(outName)]; if (absent && String(val).trim() === String((absent.per || [])[p - 1] || '').trim()) return null;   // auto-filled duty name
  var kind = slot_(s, p, outName); if (kind !== 'prep' && kind !== 'lunch' && kind !== 'class') return null;
  return { name: s.name, out: outName, p: p, kind: kind, what: kind === 'class' ? 'teaching ' + s.per[p - 1] : kind };
}
function confirmPull_(sh, r, p, val, oldVal) {
  var cell = sh.getRange(r, col_(sh, 'P1') + p - 1), note = cell.getNote();
  var info = pullInfo_(sh, r, p, val);
  if (!info) { if (/^(APPROVED|NEEDS OK)/.test(note)) cell.clearNote(); return; }
  var title = info.kind === 'prep' ? 'Pull ' + info.name + ' from prep?' : 'Pull ' + info.name + ' from ' + info.kind + '?';
  var ask = 'Are you sure you want to pull ' + info.name + ' from ' + info.what + ' in P' + p + ' to cover ' + info.out + '?\n\nYes = assign it and send the coverage email.\nNo = undo.';
  var u = ui_(), ans = null;
  if (u) { try { ans = u.alert(title, ask, u.ButtonSet.YES_NO); } catch (x) { ans = null; } }
  if (u && ans === u.Button.YES) cell.setNote('APPROVED: pull ' + info.name + ' from ' + info.what + ' (P' + p + ') · ' + (Session.getActiveUser().getEmail() || 'office') + ' · ' + Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'));
  else if (u && ans === u.Button.NO) { cell.setValue(oldVal == null ? '' : oldVal); if (/^(APPROVED|NEEDS OK)/.test(note)) cell.clearNote(); }
  else cell.setNote('NEEDS OK: ' + info.name + ' has ' + info.what + ' in P' + p + '. No email is sent until approved: select this cell → Staff Hub → Approve pull from prep (selected cell).');
}
function approveSelectedPull() {
  var sh = SpreadsheetApp.getActiveSheet(), cell = sh.getActiveCell(), p1 = col_(sh, 'P1');
  if (sh.getName() !== CFG.coverageTab || !p1 || cell.getColumn() < p1 || cell.getColumn() >= p1 + 8 || cell.getRow() < 2) return alert_('Select the P1–P8 cell on the Coverage tab with the name you want to approve.');
  var p = cell.getColumn() - p1 + 1, info = pullInfo_(sh, cell.getRow(), p, cell.getValue());
  if (!info) { if (/^(NEEDS OK)/.test(cell.getNote())) cell.clearNote(); return alert_('Nothing to approve here. That person is free (duty, Engagement or SAP) in P' + p + ', so the email will go out normally.'); }
  var u = ui_(); if (u && u.alert('Pull ' + info.name + '?', 'Pull ' + info.name + ' from ' + info.what + ' in P' + p + ' to cover ' + info.out + '?', u.ButtonSet.YES_NO) !== u.Button.YES) return;
  cell.setNote('APPROVED: pull ' + info.name + ' from ' + info.what + ' (P' + p + ') · ' + (Session.getActiveUser().getEmail() || 'office') + ' · ' + Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'));
  alert_('Approved. ' + info.name + ' will get the coverage email on the next send.');
}
/* date|teacher out|period|coverer for every P cell with an APPROVED note. */
function approvedPulls_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.coverageTab), out = {}; if (!sh) return out;
  var dc = col_(sh, 'Date'), tc = col_(sh, 'Teacher out'), p1 = col_(sh, 'P1'); if (!dc || !tc || !p1) return out;
  var rg = sh.getDataRange(), v = rg.getValues(), nt = rg.getNotes(), bare = function (n) { return norm_(String(n).replace(/^(mr|mrs|ms|dr)\.?\s+/i, '').replace(/^duty:\s*/i, '')); };
  for (var i = 1; i < v.length; i++) for (var p = 1; p <= 8; p++) {
    if (/^APPROVED/.test(nt[i][p1 + p - 2] || '')) out[dk_(v[i][dc - 1]) + '|' + bare(v[i][tc - 1]) + '|' + p + '|' + bare(v[i][p1 + p - 2])] = 1;
  }
  return out;
}
/* A full-day sub typed into another row's P cell: note whether they are free (prep) or already teaching that period. */
function checkSubPull_(sh, r, p, val) {
  var cell = sh.getRange(r, col_(sh, 'P1') + p - 1), who = norm_(String(val || '').replace(/^duty:\s*/i, ''));
  if (!who) { if (/^(PULLED|CONFLICT)/.test(cell.getNote())) cell.clearNote(); return; }
  var dc = col_(sh, 'Date'), tc = col_(sh, 'Teacher out'), fc = col_(sh, 'Full-day sub'); if (!dc || !tc || !fc) return;
  var v = sh.getDataRange().getValues(), key = dk_(v[r - 1][dc - 1]), staff = staff_(), msg = '';
  for (var i = 1; i < v.length; i++) {
    if (i === r - 1 || dk_(v[i][dc - 1]) !== key || norm_(v[i][fc - 1]) !== who) continue;
    var t = staff[norm_(String(v[i][tc - 1]).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))]; if (!t) continue;
    var k = slot_(t, p, ''), mine = String(v[i][col_(sh, 'P1') + p - 2] || '').trim();
    msg = k === 'prep' ? 'PULLED: ' + val + ' is subbing for ' + v[i][tc - 1] + ' and has prep in P' + p + ', so they are free. Their printed schedule will show this coverage.'
      : k === 'lunch' ? 'CONFLICT: this is ' + val + "'s lunch (subbing for " + v[i][tc - 1] + ').'
      : (k === 'class' || k === 'coteach') && norm_(mine) === who ? 'CONFLICT: ' + val + ' is already teaching ' + v[i][tc - 1] + "'s P" + p + ' class.' : 'PULLED: ' + val + ' is subbing for ' + v[i][tc - 1] + '. P' + p + ' there: ' + (mine || t.per[p - 1] || 'free') + '.';
  }
  if (msg) cell.setNote(msg); else if (/^(PULLED|CONFLICT)/.test(cell.getNote())) cell.clearNote();
}
/* When someone is added or removed as out, refresh the rows of their co-teachers on the same date. */
function remarkPartners_(sh, r, names) {
  var staff = staff_(), tc = col_(sh, 'Teacher out'), dc = col_(sh, 'Date'); if (!tc || !dc) return;
  var v = sh.getDataRange().getValues(), key = dk_(v[r - 1][dc - 1]), partners = {};
  names.forEach(function (n) { var s = n && staff[norm_(String(n).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))]; if (s) for (var p = 1; p <= 8; p++) { var w = ctPartner_(s, p); if (w) partners[norm_(w)] = 1; } });
  for (var i = 1; i < v.length; i++) if (i !== r - 1 && dk_(v[i][dc - 1]) === key && partners[norm_(String(v[i][tc - 1]).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))]) markCoverage_(sh, i + 1, v[i][tc - 1], v[i][tc - 1]);
}
/* Full-day subs who are free (teacher's prep, co-taught class, or the half the teacher is here) and not yet pulled. */
function subFree_(key) {
  var staff = staff_(), bare = function (n) { return norm_(String(n).replace(/^(duty|ct):\s*/i, '').replace(/^(mr|mrs|ms|dr)\.?\s+/i, '')); };
  var rows = rowsOf_(CFG.coverageTab).filter(function (r) { return dk_(r['Date']) === key && s_(r['Teacher out']); }), used = {}, out = [];
  var PS = pers_(key);
  rows.forEach(function (r) { PS.forEach(function (p) { var c = cv_(r, p); if (c) used[bare(c) + '|' + p] = 1; }); });
  rows.forEach(function (r) {
    var sub = s_(r['Full-day sub']), s = staff[bare(r['Teacher out'])]; if (!sub || !s) return;
    var t = norm_(r['Type']), w = win_(t, 5);
    PS.forEach(function (p) {
      if (used[bare(sub) + '|' + p]) return;
      var k = slot_(s, p, ''), outside = !inWin_(w, p), ct = !outside && k === 'class' ? (/^ct:/i.test(cv_(r, p)) ? cv_(r, p).replace(/^ct:\s*/i, '') : ctCover_(key, s, p)) : '';
      var rm = !outside && k === 'class' && isCoverRoom_(cv_(r, p)) ? cv_(r, p) : '';   // sub's own class sent to a room: sub is free to supervise
      if (outside || k === 'prep' || ct || rm) out.push({ p: p, sub: sub, why: outside ? s.name + ' is here' : k === 'prep' ? s.name + ' prep' : rm ? s.name + '\'s ' + (p === FX_ ? 'Flex group' : 'class') + ' sent to ' + rm : 'co-teacher ' + ct });
    });
  });
  return out.sort(function (a, b) { return pord_(a.p) - pord_(b.p) || a.sub.localeCompare(b.sub); });
}
/* "SUBS AVAILABLE" list under the Coverage key: today and the next school day. */
function roomFor_(sh, rows, cols) {
  if (rows && sh.getMaxRows() < rows) sh.insertRowsAfter(sh.getMaxRows(), rows - sh.getMaxRows());
  if (cols && sh.getMaxColumns() < cols) sh.insertColumnsAfter(sh.getMaxColumns(), cols - sh.getMaxColumns());
}
function availPanel_(sh) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], c = 0;
  for (var i = 0; i < h.length; i++) if (String(h[i]).trim() === 'KEY') { c = i + 1; break; }
  if (!c) return;
  roomFor_(sh, 41, c + 1);
  var top = 11, rg = sh.getRange(top, c, 30, 2); rg.breakApart(); rg.clear();
  var nd = new Date(); do { nd.setDate(nd.getDate() + 1); } while (nd.getDay() % 6 === 0);
  var lines = [['SUBS AVAILABLE FOR COVERAGE', '']];
  [todayKey_(), dayKey_(nd)].forEach(function (k) {
    var f = subFree_(k); lines.push([prettyDay_(k).replace(/, \d{4}$/, ''), '']);
    if (!f.length) lines.push(['', 'No free sub periods']);
    f.forEach(function (x) { lines.push([pl_(x.p), x.sub + ' (' + x.why + ')']); });
  });
  lines = lines.slice(0, 30);
  sh.getRange(top, c, lines.length, 2).setValues(lines).setFontFamily(FMT.font).setFontSize(10).setWrap(true).setVerticalAlignment('middle');
  sh.getRange(top, c, 1, 2).merge().setFontWeight('bold').setFontColor('#ffffff').setBackground('#1a73e8');
  lines.forEach(function (l, i) { if (i && l[0] && !/^(P\d|Flex)$/.test(l[0])) sh.getRange(top + i, c, 1, 2).merge().setFontWeight('bold').setBackground('#e8f0fe'); else if (/^(P\d|Flex)$/.test(l[0])) sh.getRange(top + i, c).setFontWeight('bold').setHorizontalAlignment('center'); });
}
function fillSub_(sh, r, sub, oldSub) {
  var p1 = col_(sh, 'P1'), tc = col_(sh, 'Teacher out'); if (!p1 || !tc) return;
  var s = staff_()[norm_(String(sh.getRange(r, tc).getValue()).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))]; if (!s) return;
  var cells = sh.getRange(r, p1, 1, 8), vals = cells.getValues()[0], o = norm_(oldSub || ''), w = window_(sh, r), nw = norm_(sub || '');
  if (!o || o === nw) {   // no old value from the edit: the previous sub is the Subs-tab name filling most of this row's classes
    var subs = {}; try { subsTab_().getDataRange().getValues().slice(1).forEach(function (x) { if (x[0]) subs[norm_(x[0])] = 1; }); } catch (x) {}
    var tally = {}; vals.forEach(function (x) { var k = norm_(String(x).replace(/^duty:\s*/i, '')); if (k && k !== nw && subs[k]) tally[k] = (tally[k] || 0) + 1; });
    var best = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0]; if (best && tally[best] >= 2) o = best;
  }
  for (var p = 1; p <= 8; p++) {
    var kind = slot_(s, p, ''), cur = String(vals[p - 1]).trim(), isOld = o && norm_(cur) === o, isOldDuty = o && /^duty:/i.test(cur) && norm_(cur.replace(/^duty:\s*/i, '')) === o;
    if (!inWin_(w, p)) { if (isOld || isOldDuty || /^lunch$/i.test(cur)) vals[p - 1] = ''; continue; }
    if (isOldDuty) { vals[p - 1] = sub ? 'Duty: ' + sub : String((s.per || [])[p - 1] || '').trim(); continue; }   // office had the old sub on this duty: hand it to the new sub
    if (kind === 'lunch') { if (isOld || (!cur && sub)) vals[p - 1] = 'Lunch'; else if (!sub && /^lunch$/i.test(cur)) vals[p - 1] = ''; continue; }
    if (kind === 'prep') { if (isOld || !cur) vals[p - 1] = 'Prep'; continue; }
    if (kind === 'duty') { if (isOld) vals[p - 1] = String((s.per || [])[p - 1] || '').trim(); continue; }
    if (!cur || isOld) vals[p - 1] = sub || '';
  }
  cells.setValues([vals]);
  var fxc = col_(sh, 'Flex'), dcx = col_(sh, 'Date');
  if (fxc && dcx && isFlexDay_(dk_(sh.getRange(r, dcx).getValue()))) { var fcl = sh.getRange(r, fxc), fcur = String(fcl.getValue()).trim();
    if (!inWin_(w, FX_)) { if (o && norm_(fcur) === o) fcl.clearContent(); }
    else if (!fcur || (o && norm_(fcur) === o)) fcl.setValue(sub || ''); }
  for (var q = 1; q <= 8; q++) {   // light blue + note = the sub is free this period and can be pulled
    var cq = sh.getRange(r, p1 + q - 1), kq = slot_(s, q, ''), out = !inWin_(w, q);
    var free = sub && (out || kq === 'prep' || /^ct:/i.test(String(vals[q - 1])));
    if (free) { cq.setNote('AVAILABLE: ' + sub + ' is free in P' + q + ' (' + (out ? s.name + ' is here' : kq === 'prep' ? s.name + "'s prep" : 'co-teacher teaches') + ') and can be pulled to cover. Type ' + sub + ' in the period cell you need covered.'); }
    else if (/^AVAILABLE/.test(cq.getNote())) cq.clearNote();
  }
  try { labelRow_(sh, r); } catch (x) {}
}
function staffLookup_(name) {
  var v = sheet_(CFG.staffTab).getDataRange().getValues(), h = v[0], k = norm_(name).replace(/^(mr|mrs|ms|dr)\.?\s+/, '');
  for (var i = 1; i < v.length; i++) if (norm_(v[i][0]) === k) return { name: v[i][0], room: v[i][h.indexOf('Room')] };
  return null;
}

/* Header row: 1 on every tab except Announcements, whose table starts below the Hub banners block (row ANN_.hdr). */
var HDR_ = {};
function hdr_(sh) { var n = sh.getName(); if (n !== 'Announcements') return 1; if (HDR_[n] == null) HDR_[n] = /^HUB BANNERS/.test(String(sh.getRange(1, 1).getValue())) ? ANN_.hdr : 1; return HDR_[n]; }
function col_(sh, name) { var h = sh.getRange(hdr_(sh), 1, 1, sh.getLastColumn()).getValues()[0]; return h.indexOf(name) + 1; }
function rows_(sh) { return Math.max(sh.getMaxRows() - hdr_(sh), 1); }

function headerStyle_(r) {
  r.setBackground(FMT.green).setFontColor('#ffffff').setFontWeight('bold').setFontSize(10)
   .setVerticalAlignment('middle').setWrap(true);
}

function tableCols_(sh) {
  var lc = sh.getLastColumn(); if (!lc) return 0;
  var h = sh.getRange(hdr_(sh), 1, 1, lc).getValues()[0], n = 0; while (n < h.length && String(h[n]).trim() !== '') n++;
  return n;
}
function fmtTable_(sh) {
  var lc = tableCols_(sh); if (!lc) return;
  var hr = hdr_(sh);
  sh.setFrozenRows(hr);
  sh.setRowHeight(hr, 32);
  headerStyle_(sh.getRange(hr, 1, 1, lc));
  sh.getBandings().forEach(function (b) { b.remove(); });
  sh.getRange(hr, 1, sh.getMaxRows() - hr + 1, lc).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(FMT.green).setFirstRowColor('#ffffff').setSecondRowColor(FMT.band);
  var lr = Math.max(sh.getLastRow(), hr + 1);
  sh.getRange(hr, 1, lr - hr + 1, lc).setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID)
    .setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  var h = sh.getRange(hr, 1, 1, lc).getValues()[0];
  h.forEach(function (name, i) {
    var c = i + 1, r = sh.getRange(hr + 1, c, rows_(sh), 1), s = String(name);
    if (/^(Date|Start date|End date|Show from|Show until)$/.test(s)) { r.setNumberFormat('ddd m/d/yy'); sh.setColumnWidth(c, 110); }
    else if (/^P[1-8]$/.test(s)) { sh.setColumnWidth(c, 96); r.setHorizontalAlignment('center'); }
    else if (/^(Details|Answer|Notes|Detail|Roster \(pasted\)|Office notes|Question)$/.test(s)) { sh.setColumnWidth(c, 300); r.setWrap(true); }
    else if (/^Example\?$/.test(s)) { sh.setColumnWidth(c, 80); r.setFontColor(FMT.gray).setFontStyle('italic'); }
    else sh.setColumnWidth(c, Math.min(Math.max(s.length * 9 + 30, 100), 220));
  });
  var ex = col_(sh, 'Example?') || col_(sh, 'Notes');
  if (ex) {
    var L = String.fromCharCode(64 + ex);
    var rule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + L + (hr + 1) + '="EXAMPLE"')
      .setFontColor('#8a8a8a').setItalic(true).setRanges([sh.getRange(hr + 1, 1, rows_(sh), lc)]).build();
    sh.setConditionalFormatRules([rule]);
  } else sh.setConditionalFormatRules([]);
  dropdown_(sh, 'Type', sh.getName() === CFG.coverageTab ? ['Full day', 'Half day AM', 'Half day PM', 'Half day', 'Meeting', 'Building sub', 'No coverage'] : null);   // a period list like "3, 4" can be typed over the dropdown
  if (sh.getName() === CFG.coverageTab && col_(sh, 'Type')) sh.getRange(hdr_(sh) + 1, col_(sh, 'Type'), rows_(sh), 1).setNumberFormat('@');
  dropdown_(sh, 'Category', ['Building', 'Attendance', 'Events', 'Staff', 'Testing', 'Reminder']);
  if (sh.getName() === 'Announcements') dropdown_(sh, 'Posted by', postedByList_());
  dropdown_(sh, 'Status', ['Submitted', 'Approved', 'Needs info', 'Cancelled']);
  dropdown_(sh, 'Role', ['Teacher', 'Counselor', 'Specialist', 'Admin', 'Support']);
}

function dropdown_(sh, header, list) {
  var c = col_(sh, header); if (!c || !list) return;
  sh.getRange(hdr_(sh) + 1, c, rows_(sh), 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(true).build());
}

function checkboxes_(r) {
  var v = r.getValues().map(function (row) { return row.map(function (x) { return x === 1 || x === '1' || x === true || String(x).toUpperCase() === 'TRUE'; }); });
  r.insertCheckboxes(); r.setValues(v).setHorizontalAlignment('center');
}

function fmtInstructions_(sh) {
  sh.setHiddenGridlines(true);
  sh.getRange('A1').setFontFamily('Neuton').setFontSize(22).setFontWeight('bold').setFontColor(FMT.green);
  sh.setRowHeight(1, 44);
  headerStyle_(sh.getRange('A3:C3')); sh.setRowHeight(3, 30);
  var last = sh.getLastRow();
  if (last > 3) {
    sh.getRange(4, 1, last - 3, 3).setWrap(true).setVerticalAlignment('top')
      .setBorder(null, null, true, null, null, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID);
    sh.getRange(4, 1, last - 3, 1).setFontWeight('bold');
  }
  sh.setColumnWidth(1, 160); sh.setColumnWidth(2, 210); sh.setColumnWidth(3, 640);
}

function fmtSchedule_(sh) {
  var v = sh.getDataRange().getValues(), N = Math.max(sh.getMaxRows() - 8, 60);
  if (sh.getMaxRows() < 70) sh.insertRowsAfter(sh.getMaxRows(), 70 - sh.getMaxRows());
  sh.setHiddenGridlines(true);
  [170, 190, 300, 130, 90, 28, 120, 150, 260].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange('A1').setFontFamily('Neuton').setFontSize(18).setFontWeight('bold').setFontColor(FMT.green);
  sh.getRange('A2:I2').merge().setWrap(true).setFontStyle('italic').setFontColor(FMT.gray); sh.setRowHeight(2, 36);
  sh.getRange('A3:A6').setFontWeight('bold');
  sh.getRange('B3').setBackground(FMT.greenTint).setFontWeight('bold');
  sh.getRange('B4:B6').setNumberFormat('ddd m/d/yyyy').setBackground(FMT.greenTint);
  sh.getRange('C3:C6').setFontColor(FMT.gray).setFontStyle('italic').setWrap(true);
  sh.getRange('A3:C6').setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID)
    .setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange('A7:E7').merge(); sh.getRange('G7:I7').merge();
  [sh.getRange('A7'), sh.getRange('G7')].forEach(function (r) { r.setFontWeight('bold').setFontColor(FMT.green).setFontSize(11).setWrap(true).setVerticalAlignment('bottom'); });
  sh.setRowHeight(7, 34);
  headerStyle_(sh.getRange('A8:E8')); headerStyle_(sh.getRange('G8:I8')); sh.setRowHeight(8, 28);
  sh.setFrozenRows(8);
  // Alternate Days: A–E, Flex Days: G–I. Both grow straight down, independently.
  var alt = sh.getRange(9, 1, N, 5), flex = sh.getRange(9, 7, N, 3);
  [alt, flex].forEach(function (r) {
    r.setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID)
     .setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  });
  sh.getRange(8, 1, N + 1, 5).setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange(8, 7, N + 1, 3).setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange(9, 1, N, 1).setNumberFormat('ddd m/d/yyyy');
  sh.getRange(9, 7, N, 1).setNumberFormat('ddd m/d/yyyy');
  sh.getRange(9, 3, N, 1).setWrap(true); sh.getRange(9, 9, N, 1).setWrap(true);
  checkboxes_(sh.getRange(9, 5, N, 1));
  schedDropdown_(sh);
  sh.getRange(9, 8, N, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Flex', 'Flex Home Base', 'No Flex'], true).setAllowInvalid(true).build());
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$E9=TRUE').setBackground('#fff4c2').setRanges([alt]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$H9="No Flex"').setFontColor(FMT.gray).setRanges([flex]).build()
  ]);
}

function spare_(v, s, e) {
  var n = e - s, k = e - 1; while (k < v.length && n < (e - s) + 6 && v[k].slice(0, 5).join('') === '') { n++; k++; }
  return Math.max(n, 1);
}

function bellSheet_() { return SpreadsheetApp.getActive().getSheetByName(CFG.bellTab); }
/* Schedule dropdown on the Schedule tab (date list, column B): every schedule on the Bell Schedules tab plus the built-in ones. Refreshes itself when the Bell Schedules tab is edited. */
var BUILTIN_SCHEDS_ = ['Regular', 'Flex Day', 'Flex Day · Home Base', '2-Hour Delay · schedule v1', '2-Hour Delay · schedule v2', 'Early Dismissal 10:30 (No Lunch)', 'HOCO Court Assembly', 'Fall Festival', 'Custom', 'School Closed'];
/* One-click: adds the Fall Festival and HOCO Court Assembly rows to Bell Schedules (skips a schedule that is already there) and removes rows pasted into column A only. */
function addNewBellSchedules() {
  var sh = bellSheet_(); if (!sh) return alert_('No Bell Schedules tab found.');
  var R = [['Fall Festival', 'Period 1', '7:20 AM', '8:01 AM', ''], ['Fall Festival', 'Period 2', '8:04 AM', '8:50 AM', 'Morning Announcements'], ['Fall Festival', 'Period 3', '8:54 AM', '9:35 AM', ''], ['Fall Festival', 'Period 7', '9:38 AM', '10:19 AM', ''], ['Fall Festival', 'Period 4 / A Lunch', '10:22 AM', '11:03 AM', ''], ['Fall Festival', 'Period 5 / B Lunch', '11:06 AM', '11:47 AM', ''], ['Fall Festival', 'Period 6 / C Lunch', '11:50 AM', '12:31 PM', ''], ['Fall Festival', 'Period 8', '12:34 PM', '1:15 PM', ''],
    ['HOCO Court Assembly', 'Period 1', '7:20 AM', '8:03 AM', ''], ['HOCO Court Assembly', 'Period 2', '8:06 AM', '8:58 AM', 'AM Announcements'], ['HOCO Court Assembly', 'Period 3', '9:01 AM', '9:44 AM', ''], ['HOCO Court Assembly', 'Period 4 / A Lunch', '9:47 AM', '10:30 AM', ''], ['HOCO Court Assembly', 'Period 5 / B Lunch', '10:33 AM', '11:16 AM', ''], ['HOCO Court Assembly', 'Period 6 / C Lunch', '11:19 AM', '12:02 PM', ''], ['HOCO Court Assembly', 'Period 7', '12:05 PM', '12:48 PM', ''], ['HOCO Court Assembly', 'Period 8', '12:51 PM', '1:34 PM', ''], ['HOCO Court Assembly', 'Assembly in HS Gym', '1:37 PM', '1:58 PM', '']];
  var v = sh.getDataRange().getValues(), removed = 0;
  for (var i = v.length - 1; i >= 1; i--) { var a0 = String(v[i][0]); if (/^(fall festival|hoco court assembly)\s+(period|assembly)/i.test(a0) && !String(v[i][1]).trim()) { sh.deleteRow(i + 1); removed++; } }
  var have = scheduleNames_().map(function (n) { return n.toLowerCase(); }), add = R.filter(function (r) { return have.indexOf(r[0].toLowerCase()) < 0; });
  if (add.length) { var at = sh.getLastRow() + 1; sh.getRange(at, 1, add.length, 5).setValues(add); }
  bumpHubCache_(); schedDropdown_();
  alert_('Added ' + add.length + ' rows' + (removed ? ', removed ' + removed + ' pasted rows' : '') + '. Schedule dropdown updated.');
}
/* Reusable emergency schedule: 8 "Custom" rows on Bell Schedules (starts as Regular times). The office overwrites the times any time and picks "Custom" for the day; the hub uses them within about a minute. */
function ensureCustom_() {
  var sh = bellSheet_(); if (!sh) return false;
  if (scheduleNames_().some(function (n) { return n.toLowerCase() === 'custom'; })) return false;
  var R = [['Period 1', '7:20 AM', '8:06 AM', 'Emergency schedule: overwrite these times, then pick Custom for the day'], ['Period 2', '8:09 AM', '9:04 AM', 'Morning Announcements'], ['Period 3', '9:07 AM', '9:53 AM', ''], ['Period 4 / A Lunch', '9:56 AM', '10:42 AM', ''], ['Period 5 / B Lunch', '10:45 AM', '11:31 AM', ''], ['Period 6 / C Lunch', '11:34 AM', '12:20 PM', ''], ['Period 7', '12:23 PM', '1:09 PM', ''], ['Period 8', '1:12 PM', '1:58 PM', '']];
  sh.getRange(sh.getLastRow() + 1, 1, R.length, 5).setValues(R.map(function (r) { return ['Custom'].concat(r); }));
  return true;
}
function refreshSchedDropdown() { schedDropdown_(); alert_('Schedule dropdown updated.'); }
function schedDropdown_(sh) {
  try { if (ensureCustom_()) bumpHubCache_(); } catch (x) {}
  sh = sh || sheet_(CFG.scheduleTab); if (!sh) return;
  var names = BUILTIN_SCHEDS_.slice(); scheduleNames_().forEach(function (n) { if (!names.some(function (x) { return x.toLowerCase() === n.toLowerCase(); })) names.push(n); });
  sh.getRange(9, 2, Math.max(sh.getMaxRows() - 8, 1), 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(names.concat(['No School']), true).setAllowInvalid(true).build());
}
function scheduleNames_() {
  var sh = bellSheet_(); if (!sh) return ['Regular'];
  var out = []; sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().forEach(function (r) { var n = String(r[0]).trim(); if (n && out.indexOf(n) < 0) out.push(n); });
  return out;
}

/* Bell Times tab: Schedule | Block | Start | End | Notes. Each schedule is outlined as its own box. */
function fmtBells_(sh) {
  fmtTable_(sh);
  sh.getBandings().forEach(function (b) { b.remove(); });
  var v = sh.getDataRange().getValues(), lr = v.length, start = 1;
  sh.setColumnWidth(1, 240); sh.setColumnWidth(2, 220); sh.setColumnWidth(3, 90); sh.setColumnWidth(4, 90); sh.setColumnWidth(5, 360);
  sh.getRange(2, 3, Math.max(lr - 1, 1), 2).setNumberFormat('h:mm AM/PM').setHorizontalAlignment('right');
  sh.getRange(2, 5, Math.max(lr - 1, 1), 1).setWrap(true).setFontColor(FMT.gray).setFontStyle('italic');
  for (var i = 2; i <= lr; i++) {
    if (i < lr && v[i][0] === v[start][0]) continue;
    var n = i - start, custom = /^custom$/i.test(v[start][0]);
    sh.getRange(start + 1, 1, n, 5).setBackground(custom ? '#fff8e1' : '#ffffff')
      .setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID)
      .setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    sh.getRange(start + 1, 1, n, 1).setBackground(custom ? '#ffe9a8' : FMT.greenTint).setFontWeight('bold').setFontColor(custom ? FMT.ink : FMT.green);
    start = i;
  }
}

function fmtCalendar_(sh) {
  var colors = { 'Staff meeting': ['#008539', '#ffffff'], 'Deadline': ['#1d1d1d', '#ffffff'], 'District': ['#e6f3eb', '#1d1d1d'],
                 'HS activity': ['#f0f0f0', '#1d1d1d'], 'Tonight': ['#f0f0f0', '#1d1d1d'], 'Testing': ['#e6f3eb', '#1d1d1d'], 'Observance': ['#ffffff', '#5c5c5d'] };
  var c = col_(sh, 'Type'); if (!c) return;
  var r = sh.getRange(2, c, rows_(sh), 1), rules = [];
  Object.keys(colors).forEach(function (k) {
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(k).setBackground(colors[k][0]).setFontColor(colors[k][1]).setBold(true).setRanges([r]).build());
  });
  sh.setConditionalFormatRules(rules);
  r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(Object.keys(colors), true).setAllowInvalid(true).build()).setHorizontalAlignment('center');
  sh.setColumnWidth(col_(sh, 'Item'), 380); sh.getRange(2, col_(sh, 'Item'), rows_(sh), 1).setWrap(true);
  var today = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$A2=TODAY()').setBackground('#fff4c2').setRanges([sh.getRange(2, 1, rows_(sh), 2)]).build();
  sh.setConditionalFormatRules(sh.getConditionalFormatRules().concat([today]));
  dropdown_(sh, 'Delay schedule', ['2-Hour Delay · schedule v1', '2-Hour Delay · schedule v2']);
}

function fmtCoverage_(sh) {
  try { ensureFlexCol_(sh); } catch (x) {}
  var p1 = col_(sh, 'P1'); if (!p1) return;
  var grid = sh.getRange(2, p1, rows_(sh), 8), P = String.fromCharCode(64 + p1), T = col_(sh, 'Type') ? '$' + String.fromCharCode(64 + col_(sh, 'Type')) + '2' : '""';
  var rules = sh.getConditionalFormatRules().filter(function (r) { var c = r.getBooleanCondition(); if (!c || c.getCriteriaType() !== SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA) return true; var v = String((c.getCriteriaValues() || [])[0]); return !(v.indexOf('TODAY()') >= 0 && v.indexOf(P + '2=""') >= 0); });   // drop the old pink rule
  // no lunch: the same person is in P4, P5 and P6 today -> those three cells go dark red, bold white (first rule, so it wins)
  rules = rules.filter(function (r) { var c = r.getBooleanCondition(); return !(c && String((c.getCriteriaValues() || [])[0]).indexOf('"^(lunch|na|prep|') >= 0); });
  var L4 = String.fromCharCode(64 + p1 + 3), L5 = String.fromCharCode(64 + p1 + 4), L6 = String.fromCharCode(64 + p1 + 5), dL = String.fromCharCode(64 + col_(sh, 'Date'));
  var cnt = function (L) { return 'COUNTIFS($' + dL + ':$' + dL + ',TODAY(),$' + L + ':$' + L + ',' + L4 + '2)>0'; };
  rules.unshift(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + dL + '2=TODAY(),LEN(' + L4 + '2)>0,NOT(REGEXMATCH(LOWER(' + L4 + '2&""),"^(lunch|na|prep|duty:|ct:|theat|auditorium|commons|cafeteria|gym lobby|library|conference)")),' + cnt(L4) + ',' + cnt(L5) + ',' + cnt(L6) + ')')
    .setBackground('#7f1d1d').setFontColor('#ffffff').setBold(true).setRanges([sh.getRange(2, p1 + 3, rows_(sh), 3)]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Lunch').setFontColor('#8a8a8a').setItalic(true).setRanges([grid]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NA').setFontColor('#8a8a8a').setBackground('#f0f0f0').setRanges([grid]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('Duty:').setBackground(FMT.greenTint).setFontColor(FMT.green).setRanges([grid]).build());
  var d = String.fromCharCode(64 + col_(sh, 'Date'));
  // pink only for periods that still need a sub: not the blacked-out ones on half days or period-only rows ("3, 4")
  var n = '(COLUMN()-COLUMN($' + P + '$1)+1)', t = 'LOWER(' + T + '&"")';
  var inWin = 'IF(REGEXMATCH(' + t + ',"half day am"),' + n + '<=4,IF(REGEXMATCH(' + t + ',"half day pm"),' + n + '>=4,IF(REGEXMATCH(' + t + ',"^[^0-9]*[1-8]([^0-9]+[1-8])*[^0-9]*$"),REGEXMATCH(' + t + ',TEXT(' + n + ',"0")),TRUE)))';
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + d + '2=TODAY(),' + P + '2="",$' + String.fromCharCode(64 + col_(sh, 'Full-day sub')) + '2="",' + inWin + ')')
    .setBackground('#fde2e2').setRanges([grid]).build());          // today's uncovered cells turn pink
  var fxc = col_(sh, 'Flex');
  if (fxc) {
    var FL = String.fromCharCode(64 + fxc), fr = sh.getRange(2, fxc, rows_(sh), 1), dd = '$' + d + '2';
    rules = rules.filter(function (x) { return !x.getRanges().some(function (g) { return g.getColumn() === fxc && g.getNumColumns() === 1; }); });
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(' + dd + '<>"",WEEKDAY(' + dd + ')<>4)').setBackground('#000000').setFontColor('#000000').setRanges([fr]).build());   // Flex is Wednesdays only
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(' + dd + '=TODAY(),' + FL + '2="",$' + String.fromCharCode(64 + col_(sh, 'Teacher out')) + '2<>"",$' + String.fromCharCode(64 + col_(sh, 'Full-day sub')) + '2="",NOT(REGEXMATCH(' + t + ',"half day pm")))').setBackground('#fde2e2').setRanges([fr]).build());
    sh.setColumnWidth(fxc, 150); fr.setWrap(true).setVerticalAlignment('middle');
    sh.getRange(1, fxc, sh.getMaxRows(), 1).setBorder(null, true, null, true, null, null, '#b06000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }
  sh.setConditionalFormatRules(rules);
  sh.getRange(1, p1, sh.getMaxRows(), 8).setBorder(null, true, null, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  for (var pc = 0; pc < 8; pc++) sh.setColumnWidth(p1 + pc, 150);
  grid.setWrap(true).setVerticalAlignment('middle');
  sh.setFrozenColumns(col_(sh, 'Teacher out'));
  sh.setColumnWidth(col_(sh, 'Teacher out'), 130); sh.setColumnWidth(col_(sh, 'Full-day sub'), 130);
  sh.getRange(2, col_(sh, 'Teacher out'), rows_(sh), 1).setFontWeight('bold');
}

function fmtTesting_(sh) {
  var p1 = col_(sh, 'P1'), q = col_(sh, 'Quiet hallway?'); if (!p1) return;
  checkboxes_(sh.getRange(2, p1, rows_(sh), 8));
  if (q) { checkboxes_(sh.getRange(2, q, rows_(sh), 1)); sh.setColumnWidth(q, 90); }
  for (var i = 0; i < 8; i++) sh.setColumnWidth(p1 + i, 48);
}

function fmtStaff_(sh) {
  var p1 = col_(sh, 'P1'); if (!p1) return;
  var grid = sh.getRange(2, p1, rows_(sh), 8), rules = sh.getConditionalFormatRules();
  grid.setWrap(true).setFontSize(9).setHorizontalAlignment('left');
  for (var i = 0; i < 8; i++) sh.setColumnWidth(p1 + i, 150);
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Prep').setBackground('#f0f0f0').setFontColor(FMT.gray).setRanges([grid]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Lunch').setBackground('#f0f0f0').setFontColor(FMT.gray).setRanges([grid]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=OR(REGEXMATCH(LOWER(' + String.fromCharCode(64 + p1) + '2),"duty"),REGEXMATCH(LOWER(' + String.fromCharCode(64 + p1) + '2),"^(engagement|sap)$"))')
    .setBackground(FMT.greenTint).setFontColor(FMT.green).setBold(true).setRanges([grid]).build());   // available to cover
  sh.setConditionalFormatRules(rules);
  sh.setFrozenColumns(1);
  sh.getRange(2, 1, rows_(sh), 1).setFontWeight('bold');
  var e = col_(sh, 'Email');
  if (e) sh.setConditionalFormatRules(sh.getConditionalFormatRules().concat([SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"",' + String.fromCharCode(64 + e) + '2="")').setBackground('#fde2e2').setRanges([sh.getRange(2, e, rows_(sh), 1)]).build()]));
}

/* ---------- helpers ---------- */
function tz_() { return SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }
function dayKey_(d) {
  if (!d) return '';
  if (Object.prototype.toString.call(d) !== '[object Date]') d = new Date(d);
  if (isNaN(d)) return '';
  return Utilities.formatDate(d, tz_(), 'yyyy-MM-dd');
}
function todayKey_() { return dayKey_(new Date()); }
function norm_(s) { return String(s || '').trim().toLowerCase(); }
function sheet_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Missing tab: ' + name);
  return sh;
}

/* Posted by dropdown: secretaries and principals from the Staff tab (Role contains secretary / office / principal / admin), then the general office names. */
function postedByList_() {
  var s = staff_(), names = Object.keys(s).map(function (k) { return s[k]; })
    .filter(function (x) { return /secretar|office|principal|admin/.test(x.role); })
    .sort(function (a, b) { return (/principal|admin/.test(a.role) ? 0 : 1) - (/principal|admin/.test(b.role) ? 0 : 1) || a.name.localeCompare(b.name); })
    .map(function (x) { return x.name; });
  return names.concat(['HS Office', 'HS Admin', 'Admin']);
}
/* Staff tab: Name | Room | Department | Role | Email | P1..P8 (from the master schedule) */
var STAFF_MEMO_ = null;
function staff_() { if (STAFF_MEMO_) return STAFF_MEMO_; return (STAFF_MEMO_ = staffRead_()); }
function staffRead_() {
  var all = sheet_(CFG.staffTab).getDataRange().getValues(), ai = all[0].map(function (x) { return norm_(x); }).indexOf('active'), rows = all.slice(1), map = {};
  rows.forEach(function (r) {
    if (!r[0] || (ai >= 0 && /^(no|n|false|inactive)$/i.test(String(r[ai]).trim()))) return;
    map[norm_(r[0])] = { name: String(r[0]).trim(), room: r[1], dept: r[2], role: norm_(r[3]), email: String(r[4] || '').trim(), per: r.slice(5, 13).map(function (x) { return String(x || '').trim(); }) };
  });
  return map;
}
/* What is this staff member doing in period p? duty | coteach | prep | lunch | class
   Coverage is only taken from a duty, Engagement or SAP period. Prep and lunch are protected. */
function slot_(s, p, absent) {
  var c = (s.per || [])[p - 1] || '';
  if (absent && new RegExp('w\\/\\s*' + absent, 'i').test(c)) return 'coteach';
  if (/duty/i.test(c) || /^(engagement|sap)$/i.test(c)) return 'duty';
  if (/^prep$/i.test(c)) return 'prep';
  if (/^lunch$/i.test(c)) return 'lunch';
  return 'class';
}

/* Schedule tab: B3 = default; from row 9, Alternate Days in A–E (Date, Schedule, Note, Changed by, Override?) and Flex Days in G–I (Date, Flex type, Note). Bell times on the Bell Times tab (Schedule | Block | Start | End). */
function todaysBells_(key) {
  var v = sheet_(CFG.scheduleTab).getDataRange().getValues();
  var name = String(v[2][1] || 'Regular'), today = key || todayKey_(), listed = null, override = null, flexRow = -1;
  for (var i = 8; i < v.length; i++) {           // rows 9+: Alternate Days in A–E, Flex Days in G–I
    if (v[i][0] && dayKey_(v[i][0]) === today && v[i][1]) { if (v[i][4] === true || norm_(v[i][4]) === 'true') override = String(v[i][1]); else listed = String(v[i][1]); }
    if (v[i][6] && dayKey_(v[i][6]) === today && v[i][7]) flexRow = i;
  }
  var cal = calendarSchedule_(today);
  if (override) name = override;
  else if (cal) name = cal;
  else if (listed) name = listed;
  else if (new Date(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10)).getDay() === 3) {                 // Wednesday = Flex unless listed as an exception
    name = 'Flex Day';
    if (flexRow >= 0 && /no flex/i.test(v[flexRow][7])) name = 'Regular';
  }
  var bells = {}, bs = bellSheet_(), bv = bs ? bs.getDataRange().getValues() : [];
  var t = function (x) { return Object.prototype.toString.call(x) === '[object Date]' ? Utilities.formatDate(x, tz_(), 'h:mm') : String(x).replace(/\s?[AP]M/i, ''); };
  for (var j = 1; j < bv.length; j++) {
    if (norm_(bv[j][0]) === norm_(name) && bv[j][1] && bv[j][2]) {
      var pm = String(bv[j][1]).match(/Period (\d)/); if (pm) bells['P' + pm[1]] = t(bv[j][2]) + ' – ' + t(bv[j][3]); else if (/flex/i.test(bv[j][1])) bells.FLEX = t(bv[j][2]) + ' – ' + t(bv[j][3]);
    }
  }
  return { name: name, bells: bells };
}

/* Bell Schedules tab → { 'custom': [{ label, s, e }] } in sheet order (minutes after midnight). Lets the hub show any schedule's real times. */
function bellSets_() {
  var bs = bellSheet_(), bv = bs ? bs.getDataRange().getValues() : [], out = {};
  var mins = function (x) { if (Object.prototype.toString.call(x) === '[object Date]') return +Utilities.formatDate(x, tz_(), 'H') * 60 + +Utilities.formatDate(x, tz_(), 'm');
    var m = String(x || '').match(/(\d{1,2}):(\d\d)\s*([AP]M)?/i); if (!m) return null; var h = +m[1]; if (/pm/i.test(m[3] || '') && h < 12) h += 12; if (!m[3] && h < 6) h += 12; return h * 60 + +m[2]; };
  for (var j = 1; j < bv.length; j++) { var n = s_(bv[j][0]).toLowerCase(), l = s_(bv[j][1]); if (!n || !l) continue;
    var s0 = mins(bv[j][2]), e0 = mins(bv[j][3]); if (s0 != null && e0 != null && e0 <= s0) e0 += 720;   // '1:15 AM' typed for 1:15 PM
    (out[n] = out[n] || []).push({ label: l, s: s0, e: e0 }); }
  return out;
}
/* Every date the Office Sheet sets a schedule for (Schedule tab Alternate Days + Calendar tab), using the same order as todaysBells_:
   Override checked > Calendar > Alternate Days. Dates not listed fall back to the hub's normal rules (Wednesday Flex, default). */
function scheduleMap_() {
  var map = {}, v = sheet_(CFG.scheduleTab).getDataRange().getValues(), listed = {}, ovr = {};
  for (var i = 8; i < v.length; i++) if (v[i][0] && v[i][1]) { var k = dayKey_(v[i][0]); if (v[i][4] === true || norm_(v[i][4]) === 'true') ovr[k] = String(v[i][1]); else listed[k] = String(v[i][1]); }
  Object.keys(listed).forEach(function (k) { map[k] = { name: listed[k], src: 'Schedule tab' }; });
  var cs = SpreadsheetApp.getActive().getSheetByName('Calendar');
  if (cs) cs.getDataRange().getValues().slice(1).forEach(function (r) {
    if (!r[0]) return; var k = dayKey_(r[0]);
    if (r[3] === 'Late start') map[k] = { name: String(r[6] || '2-Hour Delay · schedule v1'), src: 'Calendar tab' };
    else if (r[3] === 'Early dismissal' && /10:30/.test(r[1])) map[k] = { name: 'Early Dismissal 10:30 (No Lunch)', src: 'Calendar tab' };
  });
  Object.keys(ovr).forEach(function (k) { map[k] = { name: ovr[k], src: 'Override' }; });
  return map;
}
/* Office page → Schedule tab. Writes (or clears) an Alternate Days row with Override checked. Office / admin accounts only. */
function setOverride_(who, date, name) {
  if (!who.office) return { ok: false, error: 'Only office staff can change the schedule.' };
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date || ''); if (!m) return { ok: false, error: 'Bad date' };
  var key = dayKey_(new Date(+m[1], m[2] - 1, +m[3])), lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(CFG.scheduleTab), last = Math.max(sh.getLastRow(), 9), v = sh.getRange(9, 1, last - 8, 5).getValues(), row = -1, empty = -1;
    for (var i = 0; i < v.length; i++) { if (v[i][0] && dayKey_(v[i][0]) === key) { row = i + 9; break; } if (empty < 0 && !v[i][0] && !v[i][1]) empty = i + 9; }
    var by = (who.name || who.email || 'Office') + ' · ' + Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'), TAG = 'Set from Staff Hub';
    if (name) {
      if (row < 0) row = empty > 0 ? empty : last + 1;
      var note = row > 0 && v[row - 9] && v[row - 9][2] ? v[row - 9][2] : TAG;
      sh.getRange(row, 1, 1, 5).setValues([[new Date(+m[1], m[2] - 1, +m[3]), name, note, by, true]]);
      sh.getRange(row, 5).insertCheckboxes(); sh.getRange(row, 5).setValue(true);
    } else if (row > 0) {
      if (String(v[row - 9][2]) === TAG) sh.getRange(row, 1, 1, 5).clearContent();
      else { sh.getRange(row, 5).setValue(false); sh.getRange(row, 4).setValue(by); }
    }
  } finally { lock.releaseLock(); }
  bumpHubCache_();
  return { ok: true, schedDays: scheduleMap_() };
}
/* Calendar tab: Date | Item | Type | Detail | Period | Time | Delay schedule */
function calendarSchedule_(today) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Calendar'); if (!sh) return null;
  var rows = sh.getDataRange().getValues().slice(1);
  for (var i = 0; i < rows.length; i++) {
    if (dayKey_(rows[i][0]) !== today) continue;
    if (rows[i][3] === 'Late start') return rows[i][6] || '2-Hour Delay · schedule v1';
    if (rows[i][3] === 'Early dismissal' && /10:30/.test(rows[i][1])) return 'Early Dismissal 10:30 (No Lunch)';
  }
  return null;
}

/* Coverage tab (read by header name): Date | Teacher out | Room | Type | Full-day sub | P1..P8 | Notes
   Every name in a P cell is checked; anything that can't be emailed is listed in "skip" so the preview explains it. */
function assignments_(key) {
  var staff = staff_(), today = key || todayKey_(), sched = todaysBells_(today), out = {}, warn = [], skip = [];
  var subs = {}; try { subsTab_().getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) subs[norm_(r[0])] = 1; }); } catch (x) {}
  var bare = function (n) { return norm_(String(n).replace(/^(mr|mrs|ms|dr)\.?\s+/i, '')); };
  var okd = approvedPulls_();
  rowsOf_(CFG.coverageTab).forEach(function (r) {
    if (dk_(r['Date']) !== today || /no coverage/i.test(r['Type'])) return;   // Building sub rows still email any staff named in P1–P8
    var outName = s_(r['Teacher out']); if (!outName) return;
    var absent = staff[bare(outName)] || { per: [] }, room = s_(r['Room']) || s_(absent.room);
    pers_(today).forEach(function (p) {
      var raw = cv_(r, p);
      if (p === FX_) {   // Flex group: any staff member can be named; no prep/class check (everyone has a Flex group)
        if (!raw || /^(na|lunch)$/i.test(raw) || isCoverRoom_(raw)) return;
        var fw = raw.replace(/^(duty|ct):\s*/i, '').trim(), fs = staff[bare(fw)];
        if (!fs) { if (!subs[bare(fw)]) skip.push('NOT FOUND  Flex (' + outName + ') "' + fw + '" is not on the Staff tab. If they are a sub, add them to the Subs tab; otherwise check the spelling.'); return; }
        if (/sub/.test(fs.role)) return;
        if (!fs.email) { warn.push('NO EMAIL   ' + fs.name + ' (add it on the Staff tab)'); return; }
        (out[fs.email] = out[fs.email] || { name: fs.name, items: [] }).items.push({ p: p, time: sched.bells.FLEX || '', room: room || 'Room not listed', what: 'Cover ' + outName + '\'s Flex group' });
        return;
      }
      if (!raw || /^(na|lunch)$/i.test(raw) || isCoverRoom_(raw)) return;   // class sent to Theater / Auditorium / Commons: no email
      var duty = /^duty:/i.test(raw), who = raw.replace(/^(duty|ct):\s*/i, '').trim();
      if (!duty && absent.per[p - 1] && raw === absent.per[p - 1]) return;          // duty name auto-filled, not assigned yet
      var s = staff[bare(who)];
      if (!s) { if (!subs[bare(who)]) skip.push('NOT FOUND  P' + p + ' (' + outName + ') "' + who + '" is not on the Staff tab. If they are a sub, add them to the Subs tab; otherwise check the spelling.'); return; }
      if (/sub/.test(s.role)) return;                                                // subs get the printed schedule, not an email
      var kind = slot_(s, p, outName);
      var approved = okd[today + '|' + bare(outName) + '|' + p + '|' + bare(who)];
      if ((kind === 'prep' || kind === 'lunch' || kind === 'class') && !approved) { warn.push('CHECK      ' + s.name + ' is on ' + (kind === 'class' ? 'a class (' + s.per[p - 1] + ')' : kind) + ' in P' + p + ' but is assigned to cover ' + outName + '. Coverage should come from a duty, Engagement or SAP. To allow it: select that cell → Staff Hub → Approve pull from prep (selected cell).'); return; }
      if (kind === 'coteach' && !CFG.notifyCoTeachers) return;
      if (!s.email) { warn.push('NO EMAIL   ' + s.name + ' (add it on the Staff tab)'); return; }
      var job = absent.per[p - 1] || '', jobRoom = (job.match(/\(([A-Z]{1,3}\s?\d{2,4}[A-Z]?)\)/) || [])[1];
      var where = duty ? dutyPost_(job) : kind === 'coteach' ? (s_(s.room) || room) : (jobRoom || room);
      (out[s.email] = out[s.email] || { name: s.name, items: [] }).items.push({
        p: p, time: sched.bells['P' + p] || '', room: where || (duty ? 'See the main office' : 'Room not listed'),
        what: kind === 'coteach' ? 'Co-teacher ' + outName + ' is out. Teach your shared class (' + s.per[p - 1] + ') on your own'
          : duty ? (/duty/i.test(job) ? job : 'Duty') + ' for ' + outName + ' (in place of your ' + s.per[p - 1] + ')'
          : 'Cover ' + outName + (job ? ': ' + job : '') + ' (in place of your ' + s.per[p - 1] + ')'
      });
    });
  });
  var rs = roomSup_(today);
  Object.keys(rs).forEach(function (rk) { var rec = rs[rk];
    pers_(today).forEach(function (p) {
      var who = rec.per[p - 1]; if (!who) return;
      var s = staff[bare(who)];
      if (!s) { if (!subs[bare(who)]) skip.push('NOT FOUND  ' + pl_(p) + ' (' + rec.room + ' supervision) "' + who + '" is not on the Staff tab.'); return; }
      if (/sub/.test(s.role)) return;
      if (!s.email) { warn.push('NO EMAIL   ' + s.name + ' (add it on the Staff tab)'); return; }
      var cls = roomClasses_(today, p, rk);
      (out[s.email] = out[s.email] || { name: s.name, items: [] }).items.push({ p: p, time: sched.bells[bk_(p)] || '', room: rec.room,
        what: 'Supervise ' + rec.room + (cls.length ? ': ' + (p === FX_ ? 'Flex groups' : 'classes') + ' of ' + cls.join(', ') : '') + (s.per[p - 1] ? ' (in place of your ' + s.per[p - 1] + ')' : '') });
    });
  });
  return { list: out, schedule: sched.name, warn: warn, skip: skip };
}

/* Duty Posts tab: Duty | Where. Tells the coverer where to go for a duty (e.g. Lunch Duty → Cafeteria). Created on first use, pre-filled with every duty on the Staff tab. */
var POSTS_ = null;
function dutyPost_(duty) {
  if (!POSTS_) {
    POSTS_ = {};
    var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Duty Posts');
    if (!sh) {
      sh = ss.insertSheet('Duty Posts'); sh.getRange(1, 1, 1, 2).setValues([['Duty', 'Where (room or post)']]); headerStyle_(sh.getRange(1, 1, 1, 2)); sh.setFrozenRows(1); sh.setColumnWidth(1, 220); sh.setColumnWidth(2, 260);
      var seen = {}, st = staff_(); Object.keys(st).forEach(function (k) { (st[k].per || []).forEach(function (c) { if (/duty|^engagement$|^sap$/i.test(c) && !seen[norm_(c)]) seen[norm_(c)] = c; }); });
      var list = Object.keys(seen).sort().map(function (k) { return [seen[k], '']; }); if (list.length) sh.getRange(2, 1, list.length, 2).setValues(list);
      sh.getRange('B1').setNote('Fill in where each duty happens. Coverage emails list this as the room/post.');
    }
    sh.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0] && r[1]) POSTS_[norm_(r[0])] = String(r[1]).trim(); });
  }
  return POSTS_[norm_(duty)] || '';
}
function log_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(CFG.logTab);
  if (!sh) { sh = ss.insertSheet(CFG.logTab); sh.appendRow(['Date', 'Email', 'Assignments', 'Sent at', 'Kind']); sh.hideSheet(); }
  return sh;
}
function lastSent_(sh, key) {
  var today = key || todayKey_(), last = {};
  sh.getDataRange().getValues().slice(1).forEach(function (r) { if (dayKey_(r[0]) === today && r[4] !== 'error') last[r[1]] = r[2]; });   // failed sends are retried
  return last;
}

function emailHtml_(name, items, kind, dateLabel, ack) {
  var g = CFG.green;
  var head = kind === 'cancel' ? 'Your coverage for today has been <b>removed</b>. No action needed.'
    : (kind === 'update' ? '<b>Updated:</b> your coverage changed. This replaces the earlier email.<br>' : '') +
      'You have been assigned coverage today:';
  var th = function (t) { return '<th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;background:' + g + ';color:#fff">' + t + '</th>'; };
  var rows = '<tr>' + th('Period') + th('Time') + th('Assignment') + th('Room / post') + '</tr>' + items.map(function (a) {
    return '<tr><td style="padding:8px 12px;border-bottom:1px solid #e0e2e2;font-weight:700">' + plong_(a.p) +
      '</td><td style="padding:8px 12px;border-bottom:1px solid #e0e2e2;color:#5c5c5d">' + a.time +
      '</td><td style="padding:8px 12px;border-bottom:1px solid #e0e2e2">' + a.what +
      '</td><td style="padding:8px 12px;border-bottom:1px solid #e0e2e2;font-weight:700;font-size:15px;color:' + g + '">' + a.room + '</td></tr>';
  }).join('');
  return '<div style="font-family:Lato,Arial,sans-serif;color:#222;max-width:560px">' +
    '<div style="font-family:Neuton,\'Times New Roman\',serif;font-weight:700;letter-spacing:1.4px;color:' + g + ';font-size:16px">SOUTH FAYETTE</div>' +
    '<div style="font-size:12px;color:#5c5c5d;margin-bottom:16px">Staff Hub · ' + dateLabel + '</div>' +
    '<p style="font-size:14px;line-height:1.6">' + name + ', ' + head + '</p>' +
    (items.length ? '<table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid ' + g + ';background:#e8f3ec">' + rows + '</table>' : '') +
    (ack && items.length ? '<p style="margin:18px 0"><a href="' + ack + '" style="display:inline-block;background:' + g + ';color:#ffffff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:8px;text-decoration:none">Got it ✓</a><span style="font-size:12px;color:#5c5c5d;margin-left:10px">Lets the office know you saw this.</span></p>' : '') +
    '<p style="font-size:13px;color:#444546;line-height:1.6">If this conflicts with something, call the main office before first period.</p>' +
    '<p><a href="' + CFG.hubUrl + '" style="display:inline-block;padding:10px 16px;background:' + g + ';color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">Open Staff Hub</a></p>' +
    '<p style="font-size:11px;color:#5c5c5d">Sent automatically by ' + CFG.officeName + '.</p></div>';
}

/* ---------- main ---------- */
function run_(send, key, info) {
  key = key || todayKey_(); if (send && key !== todayKey_()) send = false;   // emails only go out for today
  var data = assignments_(key), sh = log_(), last = lastSent_(sh, key), now = new Date();
  var abd = ''; try { abd = abDay_(key); } catch (x) {}
  var dateLabel = prettyDay_(key).replace(/, \d{4}$/, '') + (abd ? ' · ' + abd : '') + ' · ' + data.schedule;
  var report = [], emails = Object.keys(data.list);
  if (info) { info.data = data; info.dateLabel = dateLabel; info.last = last; }

  emails.forEach(function (email) {
    var a = data.list[email]; a.items.sort(function (x, y) { return pord_(x.p) - pord_(y.p); });
    var sig = a.items.map(function (i) { return pl_(i.p) + ' ' + i.what + ' ' + i.room; }).join(' | ');
    if (last[email] === sig) { if (info) report.push('SENT       ' + a.name + ' already has this email'); return; }   // already told, nothing changed
    var kind = last[email] ? 'update' : 'new';
    var subject = (kind === 'update' ? 'UPDATED – ' : '') + 'Coverage ' + (key === todayKey_() ? 'today' : prettyDay_(key).replace(/, \d{4}$/, '')) + ': ' +
      a.items.map(function (i) { return pl_(i.p) + ' ' + i.room; }).join(', ');
    report.push((kind === 'update' ? 'UPDATE  ' : 'NEW     ') + a.name + ' — ' + sig);
    if (send) {
      try { MailApp.sendEmail({ to: email, subject: subject, name: CFG.officeName, htmlBody: emailHtml_(a.name, a.items, kind, dateLabel, kind === 'cancel' ? '' : ackUrl_(email, key)) }); sh.appendRow([now, email, sig, now, kind]); }
      catch (x) { report.pop(); report.push('FAILED     ' + a.name + ' <' + email + '>: ' + x.message); sh.appendRow([now, email, 'ERROR: ' + x.message, now, 'error']); }
    }
  });

  Object.keys(last).forEach(function (email) {                          // coverage removed since last send
    if (data.list[email] || last[email] === '(removed)') return;
    report.push('REMOVED ' + email);
    if (send) {
      MailApp.sendEmail({ to: email, subject: 'Coverage removed for today', name: CFG.officeName, htmlBody: emailHtml_('Hello', [], 'cancel', dateLabel) });
      sh.appendRow([now, email, '(removed)', now, 'cancel']);
    }
  });
  return (data.warn || []).concat(info ? data.skip : [], report);
}

function sendCoverageEmails() {
  var r = run_(true);
  alert_(r.length ? 'Sent ' + r.length + ' email(s):\n\n' + r.join('\n') : 'Nothing new to send. Everyone is up to date.');
}
/* Preview: pick a date, see who would get an email, why anyone was skipped, and the actual email for each person. */
function previewCoverageEmails() {
  var ui = ui_(), key = todayKey_();
  if (ui) {
    var a = ui.prompt('Preview coverage emails', 'Date to preview (M/D/YYYY). Leave blank for today, or type "tomorrow".', ui.ButtonSet.OK_CANCEL);
    if (a.getSelectedButton() !== ui.Button.OK) return;
    var t = String(a.getResponseText() || '').trim();
    if (/^tom/i.test(t)) { var d = new Date(); do { d.setDate(d.getDate() + 1); } while (d.getDay() % 6 === 0); key = dayKey_(d); }
    else if (t) { var d2 = new Date(t); if (isNaN(d2)) return alert_('Could not read that date. Use M/D/YYYY.'); key = dayKey_(d2); }
  }
  var info = {}, r = run_(false, key, info), esc = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var rows = rowsOf_(CFG.coverageTab).filter(function (x) { return dk_(x['Date']) === key && s_(x['Teacher out']); }).length;
  var html = '<div style="font:13px Arial,sans-serif;line-height:1.5">' +
    '<div style="font-weight:bold;font-size:15px">' + esc(prettyDay_(key)) + '</div>' +
    '<div style="color:#666;margin-bottom:10px">' + rows + ' Coverage row' + (rows === 1 ? '' : 's') + ' for this date. No emails are sent from this preview.' + (key !== todayKey_() ? ' Emails for this day go out that morning.' : '') + '</div>' +
    (r.length ? '<pre style="white-space:pre-wrap;background:#f5f5f5;padding:10px;border-radius:6px;font-size:12px">' + esc(r.join('\n')) + '</pre>' :
      '<p><b>No one would get an email.</b> ' + (rows ? 'The rows for this date have no staff names in P1–P8.' : 'There are no Coverage rows with this Date. Check the Date column.') + '</p>') +
    Object.keys(info.data.list).map(function (em) { var x = info.data.list[em]; x.items.sort(function (p, q) { return p.p - q.p; });
      return '<div style="margin-top:14px;font-weight:bold">To: ' + esc(x.name) + ' &lt;' + esc(em) + '&gt;</div><div style="border:1px solid #ddd;padding:12px;margin-top:4px">' + emailHtml_(x.name, x.items, 'new', info.dateLabel, ackUrl_(em, key)) + '</div>'; }).join('') + '</div>';
  if (ui) ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(640).setHeight(560), 'Coverage email preview');
  else Logger.log(r.join('\n'));
}
/* Sends a sample coverage email to whoever runs it, to confirm email works and see how it looks. Nothing is logged. */
function testCoverageEmail() {
  var me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  if (!me) return alert_('Could not read your email address. Run this from the Staff Hub menu while signed in to your South Fayette account.');
  var left = MailApp.getRemainingDailyQuota();
  if (left < 1) return alert_('Google has paused email from this script for today (daily limit reached). Emails will work again tomorrow.');
  var info = {}; run_(false, todayKey_(), info);
  var mine = null; Object.keys(info.data.list).forEach(function (em) { if (norm_(em) === norm_(me)) mine = info.data.list[em]; });
  var items = mine ? mine.items : [{ p: 3, time: '9:07 – 9:53', room: 'AB116', what: 'SAMPLE: Cover Teagarden: Chemistry (in place of your Hall Duty)' }];
  MailApp.sendEmail({ to: me, subject: 'TEST – Coverage today: ' + items.map(function (i) { return pl_(i.p) + ' ' + i.room; }).join(', '), name: CFG.officeName,
    htmlBody: '<p style="font:13px Arial;color:#c5221f"><b>Test email.</b> ' + (mine ? 'These are your real assignments for today.' : 'You have no coverage today, so this is a sample.') + '</p>' + emailHtml_(mine ? mine.name : 'Test', items, 'new', info.dateLabel) });
  alert_('Test email sent to ' + me + '.\n\nCheck your Inbox (and Sent, since it comes from your own account). Emails left today: ' + (left - 1) + '.');
}
/* Email troubleshooter: one screen that checks everything that can stop a coverage email. */
function emailDiagnostics() {
  var ui = ui_(), out = [], ok = function (t) { out.push(['ok', t]); }, bad = function (t) { out.push(['bad', t]); }, info = function (t) { out.push(['info', t]); };
  var me = Session.getEffectiveUser().getEmail(), runner = Session.getActiveUser().getEmail(), key = todayKey_();
  info('Emails are sent from: <b>' + (me || 'unknown') + '</b>' + (runner && runner !== me ? ' (you are ' + runner + ')' : '') + '. Messages sent to that same address only show in Sent / All Mail.');
  try { var q = MailApp.getRemainingDailyQuota(); q > 0 ? ok('Google email quota left today: ' + q) : bad('Daily email limit reached. Google resumes sending tomorrow.'); } catch (x) { bad('Email permission not granted yet. Run "Send a test coverage email to me" once and click Allow. (' + x.message + ')'); }
  var trig = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'autoSend'; });
  trig.length ? ok('7:00 AM auto-send is on.') : bad('7:00 AM auto-send is OFF. Emails only go out when someone clicks Send coverage emails. Turn it on: Staff Hub → Setup → Turn on automatic tasks.');
  var rows = rowsOf_(CFG.coverageTab).filter(function (r) { return dk_(r['Date']) === key && s_(r['Teacher out']); });
  rows.length ? ok(rows.length + ' Coverage row(s) dated today (' + prettyDay_(key) + ').') : bad('No Coverage rows have today\'s date. Only today\'s rows are emailed (check the Date column is a real date).');
  var staff = staff_(), withEmail = Object.keys(staff).filter(function (k) { return staff[k].email; }).length;
  withEmail ? ok(withEmail + ' of ' + Object.keys(staff).length + ' staff have an email on the Staff tab.') : bad('No emails on the Staff tab (column E). Fill them in or run Fill missing emails.');
  var a = assignments_(key), people = Object.keys(a.list);
  people.length ? ok(people.length + ' person(s) have coverage that can be emailed today: ' + people.map(function (e) { return a.list[e].name + ' &lt;' + e + '&gt;'; }).join(', ')) : bad('Nobody on today\'s rows can be emailed. See the lines below for why.');
  a.warn.concat(a.skip).forEach(function (w) { bad(w.replace(/</g, '&lt;')); });
  var log = log_().getDataRange().getValues().slice(1).filter(function (r) { return dayKey_(r[0]) === key; });
  var errs = log.filter(function (r) { return r[4] === 'error'; }), sent = log.filter(function (r) { return r[4] !== 'error'; });
  sent.length ? info(sent.length + ' email(s) already logged as sent today: ' + sent.map(function (r) { return r[1] + ' (' + Utilities.formatDate(new Date(r[3]), tz_(), 'h:mm a') + ')'; }).join(', ') + '. These are not re-sent unless the assignment changes. Open the hidden Email Log tab to see them.') : info('Nothing has been sent yet today.');
  errs.forEach(function (r) { bad('Send FAILED to ' + r[1] + ': ' + String(r[2]).replace(/^ERROR:\s*/, '')); });
  info('If the list above looks right but people still get nothing, ask them to check Spam / Quarantine. District filters sometimes hold mail sent by scripts; IT can allow-list ' + (me || 'the sheet owner') + '.');
  var html = '<div style="font:13px Arial,sans-serif;line-height:1.5">' + out.map(function (x) {
    var c = x[0] === 'ok' ? '#008539' : x[0] === 'bad' ? '#c5221f' : '#5c5c5d', i = x[0] === 'ok' ? '✓' : x[0] === 'bad' ? '✕' : '•';
    return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #eee"><b style="color:' + c + ';width:14px;flex:none">' + i + '</b><div>' + x[1] + '</div></div>'; }).join('') + '</div>';
  if (ui) ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(640).setHeight(560), 'Email troubleshooter');
  else Logger.log(out.map(function (x) { return x[0] + ' ' + x[1]; }).join('\n'));
}
function autoSend() { run_(true); }   // used by the 7:00 AM trigger

function stopAutoSend() {
  var n = 0; ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'autoSend') { ScriptApp.deleteTrigger(t); n++; } });
  alert_(n ? 'Automatic 7:00 AM coverage emails are OFF.\n\nEmails only go out when someone clicks Staff Hub → Send coverage emails now. Fast sign-in is unchanged.' : 'Automatic 7:00 AM emails were already off.');
}
function installKeepWarmOnly() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (/^(autoSend|keepWarm)$/.test(t.getHandlerFunction())) ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('keepWarm').timeBased().everyMinutes(1).create();
  alert_('Fast sign-in is on. Automatic 7:00 AM emails are OFF.\n\nSend coverage emails by hand with Staff Hub → Send coverage emails now.');
}
function installAutomations() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (/^(autoSend|keepWarm|autoPullGames)$/.test(t.getHandlerFunction())) ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('autoSend').timeBased().everyDays(1).atHour(CFG.autoSendHour).create();
  ScriptApp.newTrigger('autoPullGames').timeBased().everyDays(1).atHour(5).create();
  ScriptApp.newTrigger('keepWarm').timeBased().everyMinutes(1).create();   // cheap when nothing changed; rebuilds within a minute of any edit
  alert_('Automatic tasks are on:\n\n• Games pulled from the school website every day around 5:00 AM\n• Coverage emails every day around ' + CFG.autoSendHour + ':00 AM\n• Hub data rebuilt within a minute of any Sheet change on school days (6 AM–4 PM) so sign-in is fast\n\nSafe to run again; it never creates duplicates.');
}




/* ================= LIVE HUB DATA =================
   Deploy once: Deploy → New deployment → type "Web app" · Execute as: Me · Who has access: Anyone → Deploy → copy the /exec URL.
   "Anyone" only lets the request reach this script. No data is returned unless the request carries a valid
   Google sign-in from a ${CFG.domain} account (checked against Google on every new sign-in). */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'quotes') return json_({ quotes: quotes_() });   // welcome-page banner: public, quotes only
  if (p.action === 'scores') return json_(lionBoards_(p.g));        // Staff Games scoreboards: no sign-in needed, holds initials + scores only
  if (p.action === 'score') return json_(lionSave_(p));
  if (p.action === 'log') return json_(hubLog_(p));                  // hub page errors → hidden "Hub Errors" tab
  if (p.action === 'ack') return ackPage_(p);
  if (p.action === 'game' || p.action === 'gameres') return json_(gameApi_(p));
  if (p.action === 'gamewrong') return json_(gameWrong_(p));   // red "received in error" button in game-update emails   // result link in game-update emails: signed per game, no sign-in needed                        // "Got it" link in coverage emails
  if (p.action === 'alert') { var A = annBanners_().alert; return json_({ alert: A ? pubBanner_(A) : null }); }   // emergency alert: public, everyone sees it
  var t0 = Date.now(), who = verify_(p.token);
  if (!who.ok) { logBuf_(['Sign-in refused', who.email || '(no token)', who.reason, (Date.now() - t0) / 1000, '', '', p.ua]); return json_({ error: 'auth', reason: who.reason }); }
  if (p.ct) logBuf_(['Page ready', who.email, 'ok', '', +p.ct / 1000, '', p.ua]);
  if (p.action === 'override') return json_(setOverride_(who, p.date, p.name || ''));
  if (/^(staffList|staffSave|accessList|accessSave)$/.test(p.action || '')) return json_(manage_(who, p));   // Office page: staff list + access manager
  var iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(p.date || ''), d = iso ? new Date(+iso[1], iso[2] - 1, +iso[3]) : p.date ? new Date(p.date) : new Date(); if (isNaN(d)) d = new Date();
  BUILT_ = false; STALE_ = false; var res = hubCached_(dayKey_(d), who), sec = (Date.now() - t0) / 1000;
  res.srv = { s: sec, cache: !BUILT_, stale: STALE_ };
  if (p.first === '1' || sec > 8) logBuf_([p.first === '1' ? 'Sign-in' : 'Slow refresh', who.email, 'ok', sec, '', BUILT_ ? 'rebuilt' : STALE_ ? 'cached (edit pending)' : 'cached', p.ua]);
  return json_(res);
}
/* Hub Log (hidden tab): sign-ins, refused sign-ins, load times. Rows are held in the cache and written once a minute by keepWarm, so logging adds no wait for staff. */
var BUILT_ = false, STALE_ = false;
function logBuf_(row) {
  try { var L = LockService.getScriptLock(); if (!L.tryLock(300)) return; var c = CacheService.getScriptCache(), a = JSON.parse(c.get('logbuf') || '[]');
    a.push([Date.now()].concat(row.map(function (x) { return x == null ? '' : typeof x === 'number' ? Math.round(x * 10) / 10 : String(x).slice(0, 160); })));
    c.put('logbuf', JSON.stringify(a.slice(-250)), 21600); L.releaseLock(); } catch (x) {}
}
function flushLog_() {
  var L = LockService.getScriptLock(); if (!L.tryLock(5000)) return; var c = CacheService.getScriptCache(), a;
  try { a = JSON.parse(c.get('logbuf') || '[]'); c.remove('logbuf'); } finally { L.releaseLock(); }
  if (!a.length) return;
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Hub Log');
  if (!sh) { sh = ss.insertSheet('Hub Log'); sh.getRange(1, 1, 1, 8).setValues([['When', 'Event', 'Who', 'Result', 'Server sec', 'Page sec', 'Data', 'Device']]); headerStyle_(sh.getRange(1, 1, 1, 8)); sh.setFrozenRows(1); sh.hideSheet(); }
  var dev = function (u) { u = String(u || ''); return (/iPhone|Android.*Mobile/.test(u) ? 'Phone' : /iPad|Android/.test(u) ? 'Tablet' : /CrOS/.test(u) ? 'Chromebook' : u ? 'Computer' : '') + (/Edg\//.test(u) ? ' · Edge' : /Chrome\//.test(u) ? ' · Chrome' : /Safari\//.test(u) ? ' · Safari' : /Firefox\//.test(u) ? ' · Firefox' : ''); };
  sh.getRange(sh.getLastRow() + 1, 1, a.length, 8).setValues(a.map(function (r) { return [new Date(r[0]), r[1], r[2], r[3], r[4], r[5], r[6], dev(r[7])]; }));
  var extra = sh.getLastRow() - 5001; if (extra > 0) sh.deleteRows(2, extra);   // keep the newest 5,000 rows
}
/* Speed: the day's data is the same for everyone, so it is built once and cached ~2 min (any Sheet edit clears it).
   The user block is added per request. A 5-minute "keep warm" trigger (school hours) keeps it ready before staff sign in. */
function hubCached_(key, who) {
  var c = CacheService.getScriptCache(), ver = c.get('hubver') || '0', ck = 'hub_' + key + (who.office ? '_o' : ''), out = null;
  var meta = null; try { meta = JSON.parse(c.get(ck + '_m') || 'null'); } catch (x) {}
  var fresh = meta && (meta.v === ver || Date.now() - meta.at < 60000);   // Sheet edits refresh it at most once a minute, so a busy morning of edits doesn't make every sign-in rebuild
  var stale = !fresh && meta && !who.warm && Date.now() - meta.at < 30 * 60000;   // edited since the last build: serve the saved copy now; keepWarm rebuilds it within a minute
  if (!fresh && !stale) ck = '';
  if (ck) try { var n = +c.get(ck + '_n'); if (n) { var parts = c.getAll(Array.apply(null, Array(n)).map(function (_, i) { return ck + '_' + i; })), str = ''; for (var i = 0; i < n; i++) { if (parts[ck + '_' + i] == null) { str = ''; break; } str += parts[ck + '_' + i]; } if (str) out = JSON.parse(str); } } catch (x) { out = null; }
  if (out && stale) STALE_ = true;
  if (!out) {
    BUILT_ = true; out = hubData_(key, who);
    // plain ASCII JSON so each 90,000-character piece stays under the 100 KB cache limit
    try { var j = JSON.stringify(out).replace(/[\u0080-\uffff]/g, function (ch) { return '\\u' + ('000' + ch.charCodeAt(0).toString(16)).slice(-4); }), map = {}, k = 0; ck = 'hub_' + key + (who.office ? '_o' : ''); for (var p = 0; p < j.length; p += 90000) map[ck + '_' + k++] = j.slice(p, p + 90000); map[ck + '_n'] = String(k); map[ck + '_m'] = JSON.stringify({ v: ver, at: Date.now() }); c.putAll(map, 21600); } catch (x) { logBuf_(['Cache save failed', who.email || '(keep warm)', String(x.message || x).slice(0, 120), '', '', '', '']); }   // 6 h; freshness is checked with hubver above
  }
  try { var B = annBanners_(); out.banner = B.green ? pubBanner_(B.green) : null; out.alert = B.alert ? pubBanner_(B.alert) : null; } catch (x) { out.banner = null; }   // live, not cached: end times apply to the minute
  out.user = { email: who.email, name: who.name, office: who.office, admin: !!who.admin, staff: '' };
  try { var em = String(who.email || '').toLowerCase(), st = staff_(); for (var k in st) if (String(st[k].email).toLowerCase() === em) { out.user.staff = st[k].name; break; } } catch (x) {}
  try { var sent = lastSent_(log_()); out.user.emailed = !!(em && sent[em] && String(sent[em]).trim()); } catch (x) { out.user.emailed = false; }   // gold banner only after their coverage email has gone out   // Staff tab name for this sign-in: drives the gold "You're covering" banner
  return out;
}
function bumpHubCache_() { try { var c = CacheService.getScriptCache(); c.put('hubver', String(Date.now()), 21600); } catch (x) {} }
function keepWarm() {
  try { flushLog_(); } catch (x) {}
  var h = +Utilities.formatDate(new Date(), tz_(), 'H'), dow = new Date().getDay(); if (h < 6 || h > 15 || dow % 6 === 0) return;
  [false, true].forEach(function (o) { hubCached_(todayKey_(), { email: '', name: '', office: o, admin: false, warm: true }); });
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function verify_(t) {
  if (!t) return { ok: false, reason: 'not signed in' };
  if (!CFG.clientId) return { ok: false, reason: 'clientId missing in the script' };
  var cache = CacheService.getScriptCache();
  var ck = 'tok_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t)).slice(0, 40);
  var hit = cache.get(ck); if (hit) return JSON.parse(hit);
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(t), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, reason: 'sign-in expired' };
  var info = JSON.parse(r.getContentText()), email = String(info.email || '').toLowerCase();
  var res = { ok: false, email: email, name: info.name || '', office: CFG.officeEmails.concat(setting_('Office preview emails'), setting_('Admin emails')).map(norm_).indexOf(email) >= 0, admin: setting_('Admin emails').map(norm_).indexOf(email) >= 0 };
  if (info.aud !== CFG.clientId) res.reason = 'sign-in is for a different app';
  else if (String(info.email_verified) !== 'true') res.reason = 'email not verified';
  else if (info.hd !== CFG.domain && !res.office) res.reason = 'not a ' + CFG.domain + ' account';
  else if (CFG.requireStaffList && !res.office && !onStaffList_(email)) res.reason = 'your email is not on the Staff tab';
  else res.ok = true;
  if (res.ok) cache.put(ck, JSON.stringify(res), 600);
  return res;
}
function onStaffList_(email) {
  var v = sheet_(CFG.staffTab).getDataRange().getValues(), c = v[0].indexOf('Email');
  for (var i = 1; i < v.length; i++) if (norm_(v[i][c]) === email) return true;
  return false;
}

function rowsOf_(name, rich) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name); if (!sh) return [];
  var hr = hdr_(sh), rg = sh.getDataRange(), v = rg.getValues().slice(hr - 1), h = (v.shift() || []).map(function (x) { return String(x).trim(); });
  var rt = null; if (rich) { try { rt = rg.getRichTextValues().slice(hr); } catch (x) { rt = null; } }
  var out = [];
  v.forEach(function (r, ri) { if (r.join('') === '') return; var o = {}; h.forEach(function (k, i) { o[k] = r[i]; });
    if (rt) { o._L = {}; h.forEach(function (k, i) { var sg = segs_(rt[ri][i]); if (sg) o._L[k] = sg; }); }
    out.push(o); });
  return out;
}
/* Links typed into a cell (Insert link / Ctrl+K) → [[text, url], …] so the hub can make them clickable. null when the cell has no links. */
function segs_(rtv) {
  if (!rtv) return null;
  try { var runs = rtv.getRuns(), any = false, out = [];
    runs.forEach(function (r) { var t = r.getText(), u = r.getLinkUrl() || ''; if (!t) return; if (u) any = true;
      var last = out[out.length - 1]; if (last && last[1] === u) last[0] += t; else out.push([t, u]); });
    return any ? out : null; } catch (x) { return null; }
}
function firstUrl_(sg) { if (!sg) return ''; for (var i = 0; i < sg.length; i++) if (sg[i][1]) return sg[i][1]; return ''; }
function dk_(x) { return x === '' || x == null ? '' : dayKey_(x); }
/* Field trips card calendar: Mon of this week through Fri of next week (10 school days), with roster counts. */
function tripsAhead_(key, showAll) {
  var p = key.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2], 12), dw = d.getDay();
  d.setDate(d.getDate() - (dw === 0 ? -1 : dw === 6 ? -2 : dw - 1));   // weekend → next Monday
  var rows = rowsOf_('Field Trips').filter(function (r) { return s_(r['Trip name']) && (showAll ? !/cancel/i.test(r['Status']) : /^approved$/i.test(s_(r['Status']))); });
  var cnt = {}, stu = {}; rowsOf_('Trip Rosters').forEach(function (r) { var k = s_(r['Trip ID']); if (!k) return; cnt[k] = (cnt[k] || 0) + 1; (stu[k] = stu[k] || []).push([s_(r['Last name']), s_(r['First name']), s_(r['Grade'])]); });
  var days = [];
  for (var i = 0; i < 14; i++) {
    var x = new Date(d.getTime() + i * 864e5); if (x.getDay() === 0 || x.getDay() === 6) continue;
    var k = dayKey_(x);
    days.push({ key: k, num: x.getDate(), mon: Utilities.formatDate(x, tz_(), 'MMM'), dow: Utilities.formatDate(x, tz_(), 'EEEE'),
      trips: rows.filter(function (r) { return on_(k, r['Start date'], r['End date']); }).map(function (r) {
        return { name: s_(r['Trip name']), who: [s_(r['Destination']), s_(r['Teachers attending'])].filter(String).join(' · '), time: [tm_(r['Leaves']), tm_(r['Returns'])].filter(String).join('–'), n: cnt[s_(r['Trip ID'])] || 0, st: stu[s_(r['Trip ID'])] || [] }; }) });
  }
  return { today: key, days: days };
}
function checkTripRow() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getActiveSheet(), ui = SpreadsheetApp.getUi();
  if (sh.getName() !== 'Field Trips') { ui.alert('Open the "Field Trips" tab, click any cell in the trip\'s row, then run this again.\n\nYou are on "' + sh.getName() + '".'); return; }
  var hr = hdr_(sh), r = sh.getActiveRange().getRow();
  if (r <= hr) { ui.alert('Click a cell in the trip\'s row (not the header), then run this again.'); return; }
  var h = sh.getRange(hr, 1, 1, sh.getLastColumn()).getValues()[0].map(function (x) { return String(x).trim(); });
  var v = sh.getRange(r, 1, 1, h.length).getValues()[0], get = function (k) { var i = h.indexOf(k); return i < 0 ? undefined : v[i]; };
  var bad = [], ok = [], need = ['Trip name', 'Start date', 'Status'];
  need.concat(['End date', 'Destination', 'Leaves', 'Returns', 'Teachers attending', 'Trip ID']).forEach(function (k) { if (h.indexOf(k) < 0) (need.indexOf(k) >= 0 ? bad : ok).push((need.indexOf(k) >= 0 ? 'MISSING COLUMN  ' : 'No column (optional)  ') + '"' + k + '". Header row ' + hr + ' must have a column named exactly this.'); });
  var showAll = /^(true|yes)$/i.test(setting_('Show unapproved trips in hub')[0] || '');
  var st = s_(get('Status'));
  if (!s_(get('Trip name'))) bad.push('Trip name is blank.'); else ok.push('Trip name: ' + s_(get('Trip name')));
  if (showAll ? /cancel/i.test(st) : !/^approved$/i.test(st)) bad.push('Status is "' + st + '". It must be exactly "Approved"' + (st && /approved/i.test(st) ? ' (check for extra spaces or characters)' : '') + '.'); else ok.push('Status: ' + st);
  var sd = get('Start date'), ed = get('End date'), a = dk_(sd), b = dk_(ed) || a;
  var isD = function (x) { return Object.prototype.toString.call(x) === '[object Date]'; };
  if (!a || a === 'NaN-NaN-NaN' || /NaN/.test(a)) bad.push('Start date "' + s_(sd) + '" is not a date the script can read. Retype it like 11/12/2026.');
  else ok.push('Start date: ' + a + (isD(sd) ? '' : ' (stored as text; retype it as a date to be safe)'));
  if (s_(ed) && (/NaN/.test(b))) bad.push('End date "' + s_(ed) + '" is not a readable date.');
  if (a && b && b < a) bad.push('End date (' + b + ') is before Start date (' + a + ').');
  var today = dayKey_(new Date()), cal = tripsAhead_(today, showAll), first = cal.days[0].key, last = cal.days[cal.days.length - 1].key;
  if (a && !/NaN/.test(a) && (b < first || a > last)) bad.push('Dates ' + a + (b !== a ? ' to ' + b : '') + ' are outside the calendar (' + first + ' to ' + last + ', weekdays only).');
  var shown = cal.days.some(function (d) { return d.trips.some(function (x) { return x.name === s_(get('Trip name')); }); });
  bumpHubCache_();
  ui.alert(shown && !bad.length ? 'This trip passes every check and IS in the calendar data.\n\nHub data has been marked out of date. Reload the hub in about a minute.\nIf it still doesn\'t appear, sign out of the hub and back in.\n\n' + ok.join('\n')
    : (bad.length ? 'Not showing because:\n\n• ' + bad.join('\n• ') : 'All fields look right but the calendar still skipped it. Send this to the hub builder:\n' + JSON.stringify({ row: r, hdr: hr, a: a, b: b, first: first, last: last })) + '\n\nLooks OK:\n' + ok.join('\n'));
}
function on_(key, from, to) { var a = dk_(from), b = dk_(to) || a; return !!a && a <= key && key <= b; }
function tm_(x) { return Object.prototype.toString.call(x) === '[object Date]' ? Utilities.formatDate(x, tz_(), 'h:mm') : String(x || '').replace(/\s?[AP]M/i, '').trim(); }
function yes_(x) { return x === true || x === 1 || /^(1|true|yes|x)$/i.test(String(x).trim()); }
function s_(x) { return x == null ? '' : String(x).trim(); }
function kd_(c) {
  c = s_(c);
  if (!c) return 'EMPTY';
  if (/duty/i.test(c)) return 'DUTY';
  if (/^engagement$/i.test(c)) return 'ENGAGEMENT';
  if (/^sap$/i.test(c)) return 'SAP';
  if (/^prep$/i.test(c)) return 'PREP';
  if (/^lunch$/i.test(c)) return 'LUNCH';
  return 'CLASS';
}

var STF_ = null;
function hubData_(key, who) {
  var P = [1, 2, 3, 4, 5, 6, 7, 8];
  var out = { date: key, updated: Utilities.formatDate(new Date(), tz_(), 'h:mm a'), user: { email: who.email, name: who.name, office: who.office, admin: !!who.admin }, schedule: '' };
  try { out.schedule = todaysBells_(key).name; } catch (x) {}
  try { out.schedDays = scheduleMap_(); } catch (x) { out.schedDays = {}; }
  try { out.bellSets = bellSets_(); } catch (x) { out.bellSets = {}; }
  try { out.abDay = abDay_(key); var an = sheet_(CFG.scheduleTab).getRange('B6').getValue(); if (an) out.abAnchor = Utilities.formatDate(new Date(an), tz_(), 'M/d/yyyy'); } catch (x) {}

  out.announcements = rowsOf_('Announcements', true).filter(function (r) { return on_(key, r['Date'], r['Show until']); })
    .map(function (r) { var l = s_(r['Link']) || firstUrl_(r._L['Title']); if (l && !/^https?:\/\//i.test(l)) l = 'https://' + l;
      return { cat: s_(r['Category']).toUpperCase(), title: s_(r['Title']), body: s_(r['Details']), bodyL: r._L['Details'] || null, by: s_(r['Posted by']), link: l, pri: yes_(r['Highlight Post']) || yes_(r['Admin post']) }; })
    .sort(function (a, b) { return (b.pri ? 1 : 0) - (a.pri ? 1 : 0); });   // highlighted posts first

  try { out.chill = chillData_(key); } catch (x) { out.chill = null; }
  try { out.results = resultsData_(key); } catch (x) { out.results = null; }
  out.faq = rowsOf_('FAQ', true).filter(function (r) { return on_(key, r['Show from'], r['Show until']); })
    .map(function (r) { return [s_(r['Question']), s_(r['Answer']), r._L['Answer'] || null]; });

  if (who.office) { try { out.confirm = confirmations_(key); } catch (x) { out.confirm = null; } }
  try { out.calItems = calItems_(key); } catch (x) { out.calItems = []; }
  out.flex = rowsOf_('Flex Testing').filter(function (r) { return dk_(r['Date']) === key && (s_(r['Student Last Name']) || s_(r['Student First Name'])); })
    .map(function (r) { return [s_(r['Student Last Name']), s_(r['Student First Name']), s_(r['Teacher Last Name']), s_(r['Assigned Location']), yes_(r['Test received']), yes_(r["Didn't sign up"])]; });
  out.tests = rowsOf_('Testing').filter(function (r) { return dk_(r['Date']) === key; })
    .map(function (r) { return [s_(r['Teacher']), s_(r['Room']), [s_(r['Course']), s_(r['Test'])].filter(String).join(' · '), P.filter(function (n) { return yes_(r['P' + n]); })]; });

  var showAll = /^(true|yes)$/i.test(setting_('Show unapproved trips in hub')[0] || '');
  var trips = rowsOf_('Field Trips').filter(function (r) { return (showAll ? !/cancel/i.test(r['Status']) : /^approved$/i.test(s_(r['Status']))) && on_(key, r['Start date'], r['End date']); }), ids = {};
  trips.forEach(function (r) { ids[s_(r['Trip ID'])] = s_(r['Trip name']); });
  out.trips = trips.map(function (r) { return [s_(r['Trip name']), s_(r['Destination']), tm_(r['Leaves']), tm_(r['Returns']), s_(r['Teachers attending']), 'Leaves ' + tm_(r['Leaves'])]; });
  out.roster = rowsOf_('Trip Rosters').filter(function (r) { return ids[s_(r['Trip ID'])]; })
    .map(function (r) { return [ids[s_(r['Trip ID'])], s_(r['Trip teacher']), s_(r['Last name']), s_(r['First name']), r['Grade']]; });
  try { out.tripsAhead = tripsAhead_(key, showAll); } catch (x) { out.tripsAhead = null; }

  var G = { 'full day': 'FULL DAY', 'half day': 'HALF DAY / MEETING', 'half day am': 'HALF DAY / MEETING', 'half day pm': 'HALF DAY / MEETING', 'meeting': 'HALF DAY / MEETING', 'building sub': 'BUILDING SUBS' };
  var PC = isFlexDay_(key) ? P.concat([FX_]) : P;   // Flex Day: cells[8] = Flex column (the hub shows it between P3 and P4)
  if (PC.length > 8) { try { var bb = todaysBells_(key).bells; out.covTimes = PC.map(function (n) { return bb[bk_(n)] || ''; }); } catch (x) {} }
  out.coverage = rowsOf_(CFG.coverageTab).filter(function (r) { return dk_(r['Date']) === key && s_(r['Teacher out']); }).map(function (r) {
    var cells = PC.map(function (n) { return cv_(r, n); }), sub = s_(r['Full-day sub']), t = s_(r['Type']) || 'Full day', o = tm_(r['Time out']);
    var wv = win_(t, 5), row = { g: G[norm_(t)] || (wv.only ? 'HALF DAY / MEETING' : 'FULL DAY'), off: wv.only ? PC.map(function (n) { return !inWin_(wv, n); }) : PC.length > 8 && !wv.flex ? PC.map(function (n) { return n === FX_; }) : null, who: s_(r['Teacher out']), room: s_(r['Room']), type: t, cells: cells };
    if (sub) {   // fill the sub into the absent teacher's class periods (and Lunch) on the hub, even if the cells were left blank
      row.sub = sub; row.note = 'Sub: ' + sub;
      var st = STF_ || (STF_ = (function () { try { return staff_(); } catch (x) { return {}; } })()), s = st[norm_(row.who.replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))], tt = norm_(t);
      var w = win_(tt, 5);
      if (s) cells = cells.map(function (v, i) { var p = PC[i], k = slot_(s, p, ''); if (v || !inWin_(w, p)) return v; return k === 'class' && ctCover_(key, s, p) ? 'CT: ' + ctCover_(key, s, p) : k === 'class' || k === 'coteach' ? sub : k === 'lunch' ? 'Lunch' : ''; });
      row.cells = cells;
      if (!cells.join('')) row.span = 'Full-day sub: ' + sub;
    }
    else if (!cells.join('') && row.g === 'FULL DAY') row.span = 'Absent all day';
    if (o) { row.note = 'Out ' + o; row.out = o; }
    return row;
  });

  out.early = rowsOf_('Early Dismissals').filter(function (r) { return dk_(r['Date']) === key; })
    .map(function (r) { return [s_(r['Team']), s_(r['Event / opponent']), tm_(r['Dismissed']), tm_(r['Bus leaves']), s_(r['Coach'])]; });
  out.teams = {}; out.early.forEach(function (e) { out.teams[e[0]] = []; });
  rowsOf_('Team Rosters').forEach(function (r) { var t = s_(r['Team']); if (out.teams[t]) out.teams[t].push([s_(r['Last name']), s_(r['First name']), r['Grade']]); });

  out.staffSched = rowsOf_(CFG.staffTab).filter(function (r) { return s_(r['Name']); }).map(function (r) {
    return { name: s_(r['Name']), NAME: s_(r['Name']).toUpperCase(), room: s_(r['Room']), dept: s_(r['Department']), per: P.map(function (n) { return { v: s_(r['P' + n]), kd: kd_(r['P' + n]) }; }) };
  });
  return out;
}


/* ================= SETTINGS TAB =================
   Setting | Value | What it does. Lists are comma-separated. The office edits this tab; no code changes needed. */
var SETTINGS_ = [
  ['Field trip emails', 'holley@southfayette.org, DISCALIO-EMAIL-HERE', 'Who gets an FYI email when a teacher posts a field trip.'],
  ['Office preview emails', 'holley@southfayette.org, DISCALIO-EMAIL-HERE', 'Accounts that see the Office preview at the bottom of the hub.'],
  ['Admin emails', 'ADMIN-EMAILS-HERE', 'Principals / assistant principals. They see the Office preview on the hub.'],
  ['Show unapproved trips in hub', 'TRUE', 'TRUE = every trip shows except Cancelled. FALSE = only Status "Approved".']
];
function setupSettings_(quiet) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Settings');
  if (!sh) sh = ss.insertSheet('Settings', 1);
  var have = sh.getLastRow() ? sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return norm_(r[0]); }) : [];
  if (!have.length) { sh.appendRow(['Setting', 'Value', 'What it does']); have = ['setting']; }
  SETTINGS_.forEach(function (s) { if (have.indexOf(norm_(s[0])) < 0) sh.appendRow(s); });
  headerStyle_(sh.getRange(1, 1, 1, 3)); sh.setFrozenRows(1);
  sh.setColumnWidth(1, 220); sh.setColumnWidth(2, 420); sh.setColumnWidth(3, 460);
  sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).setFontWeight('bold');
  sh.getRange(2, 2, Math.max(sh.getLastRow() - 1, 1), 1).setBackground(FMT.greenTint).setWrap(true);
  sh.getRange(2, 3, Math.max(sh.getLastRow() - 1, 1), 1).setFontColor(FMT.gray).setFontStyle('italic').setWrap(true);
  sh.getRange(1, 1, sh.getLastRow(), 3).setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID);
  if (!quiet) alert_('Settings tab is ready. Replace DISCALIO-EMAIL-HERE with Kelley Discalio\'s email and ADMIN-EMAILS-HERE with the principals\' emails.');
}
/* ================= OFFICE PAGE: STAFF LIST + ACCESS =================
   Office/Admin users edit the Staff tab and the Office/Admin email lists from the hub. Every change is written to the hidden Change Log tab. */
function changeLog_(who, what, details) {
  try { var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Change Log');
    if (!sh) { sh = ss.insertSheet('Change Log'); sh.getRange(1, 1, 1, 4).setValues([['When', 'Who', 'What', 'Details']]); headerStyle_(sh.getRange(1, 1, 1, 4)); sh.setFrozenRows(1); sh.setColumnWidth(4, 600); sh.hideSheet(); }
    sh.appendRow([new Date(), who, what, String(details).slice(0, 2000)]); } catch (x) {}
}
function settingSet_(name, list) {
  setupSettings_(true); var sh = SpreadsheetApp.getActive().getSheetByName('Settings'), v = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (norm_(v[i][0]) === norm_(name)) { sh.getRange(i + 2, 2).setValue(list.join(', ')); return true; }
  sh.appendRow([name, list.join(', '), '']); return true;
}
function manage_(who, p) {
  if (!who.office) return { ok: false, error: 'Office or Admin access is needed.' };
  var sh = sheet_(CFG.staffTab);
  if (p.action === 'staffList') {
    var v = sh.getDataRange().getValues(), h = v[0].map(function (x) { return String(x).trim(); }), ai = h.map(norm_).indexOf('active');
    return { ok: true, admin: !!who.admin, rows: v.slice(1).map(function (r, i) { return { row: i + 2, name: s_(r[0]), room: s_(r[1]), dept: s_(r[2]), role: s_(r[3]), email: s_(r[4]), per: r.slice(5, 13).map(s_), active: !(ai >= 0 && /^(no|n|false|inactive)$/i.test(s_(r[ai]))) }; }).filter(function (o) { return o.name; }) };
  }
  if (p.action === 'staffSave') {
    var name = String(p.name || '').trim().replace(/\s+/g, ' '), email = String(p.email || '').trim().toLowerCase();
    if (!name) return { ok: false, error: 'Name is required.' };
    if (email && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return { ok: false, error: 'That email does not look right.' };
    var per = []; for (var q = 1; q <= 8; q++) per.push(String(p['p' + q] || '').trim().slice(0, 120));
    var L = LockService.getScriptLock(); L.waitLock(10000);
    try {
      var all = sh.getDataRange().getValues(), h = all[0].map(function (x) { return String(x).trim(); }), ai = h.map(norm_).indexOf('active'), row = +p.row || 0;
      if (ai < 0) { ai = Math.max(h.length, 13); sh.getRange(1, ai + 1).setValue('Active'); headerStyle_(sh.getRange(1, ai + 1)); }
      for (var i = 1; i < all.length; i++) if (i + 1 !== row && norm_(all[i][0]) === norm_(name)) return { ok: false, error: name + ' is already on the Staff tab. Two people with the same last name: add the first initial, e.g. "Smith, G.".' };
      var vals = [name, String(p.room || '').trim(), String(p.dept || '').trim(), String(p.role || '').trim(), email].concat(per), before = '';
      if (row) { if (row < 2 || row > all.length) return { ok: false, error: 'That row moved. Reload the staff list and try again.' };
        if (norm_(all[row - 1][0]) !== norm_(p.was || name)) return { ok: false, error: 'Someone else changed this row. Reload the staff list and try again.' };
        before = all[row - 1].slice(0, 13).join(' | '); sh.getRange(row, 1, 1, 13).setValues([vals]); }
      else { row = sh.getLastRow() + 1; sh.getRange(row, 1, 1, 13).setValues([vals]); }
      sh.getRange(row, ai + 1).setValue(p.active === '0' ? 'No' : '');
      SpreadsheetApp.flush();
    } finally { L.releaseLock(); }
    try { STAFF_MEMO_ = null; } catch (x) {} bumpHubCache_(); try { linkStaffNames_(); } catch (x) {}
    changeLog_(who.email, +p.row ? 'Staff edited' : 'Staff added', name + ': ' + vals.join(' | ') + (p.active === '0' ? ' | INACTIVE' : '') + (before ? '\nBefore: ' + before : ''));
    return manage_(who, { action: 'staffList' });
  }
  var lists = function () { return { office: setting_('Office preview emails').map(norm_), admin: setting_('Admin emails').map(norm_), built: CFG.officeEmails.map(norm_) }; };
  if (p.action === 'accessList') { var A = lists(); return { ok: true, me: who.email, admin: !!who.admin, office: A.office, admins: A.admin, built: A.built }; }
  if (p.action === 'accessSave') {
    var which = p.list === 'admin' ? 'admin' : 'office', em = String(p.email || '').trim().toLowerCase(), A2 = lists(), key = which === 'admin' ? 'Admin emails' : 'Office preview emails', cur = which === 'admin' ? A2.admin : A2.office;
    if (which === 'admin' && !who.admin) return { ok: false, error: 'Only Admins can change the Admin list.' };
    if (which === 'office' && !who.admin) return { ok: false, error: 'Only Admins can change who has Office access.' };
    if (!new RegExp('^[^@\\s]+@' + CFG.domain.replace(/\./g, '\\.') + '$').test(em)) return { ok: false, error: 'Use a ' + CFG.domain + ' email address.' };
    if (p.op === 'add') { if (cur.indexOf(em) >= 0) return { ok: false, error: em + ' already has ' + which + ' access.' }; cur.push(em); }
    else { if (cur.indexOf(em) < 0) return { ok: false, error: em + ' is not on that list.' }; if (which === 'admin' && cur.length <= 1) return { ok: false, error: 'There must always be at least one Admin.' }; cur = cur.filter(function (x) { return x !== em; }); }
    settingSet_(key, cur); bumpHubCache_(); changeLog_(who.email, (p.op === 'add' ? 'Access added: ' : 'Access removed: ') + which, em);
    var A3 = lists(); return { ok: true, me: who.email, admin: !!who.admin, office: A3.office, admins: A3.admin, built: A3.built, note: 'Saved. It takes effect the next time ' + em + ' signs in (up to 10 minutes).' };
  }
  return { ok: false, error: 'Unknown action.' };
}
function setting_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Settings'); if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < v.length; i++) if (norm_(v[i][0]) === norm_(name))
    return String(v[i][1]).split(/[,;\n]/).map(function (x) { return x.trim(); }).filter(function (x) { return x && !/EMAILS?-HERE/.test(x); });
  return [];
}

/* ================= FIELD TRIP FORM =================
   Run once: Staff Hub → Tools → Create field trip form. Builds the form, links it to the Field Trips tab and turns on the submit trigger.
   Each submission (trip already approved): Trip ID made, Status = Approved, roster split into Trip Rosters, office emailed. */
var TRIP_Q_ = ['Trip name', 'Destination', 'Start date', 'End date', 'Leaves', 'Returns', 'Teachers attending', 'Bus', 'Roster (pasted)'];
function createTripForm() {
  var ss = SpreadsheetApp.getActive(), ui = SpreadsheetApp.getUi();
  if (ss.getFormUrl()) { var a = ui.alert('This sheet already has a linked form. Create another one anyway?', ui.ButtonSet.YES_NO); if (a !== ui.Button.YES) return; }
  var f = FormApp.create('SFHS Field Trip Request');
  f.setDescription('For trips that are already approved. Your trip and student list appear on the Staff Hub on the trip day so teachers know who is out.')
   .setCollectEmail(true).setRequireLogin(true).setLimitOneResponsePerUser(false);
  f.addTextItem().setTitle('Trip name').setHelpText('e.g. Carnegie Science Center').setRequired(true);
  f.addTextItem().setTitle('Destination').setHelpText('Place and the class or club going, e.g. Pittsburgh · Physics 1').setRequired(true);
  f.addDateItem().setTitle('Start date').setRequired(true);
  f.addDateItem().setTitle('End date').setHelpText('Same as start date for a one-day trip.');
  f.addTimeItem().setTitle('Leaves').setHelpText('Time the group leaves the building.').setRequired(true);
  f.addTimeItem().setTitle('Returns').setHelpText('Time the group is back.').setRequired(true);
  f.addTextItem().setTitle('Teachers attending').setHelpText('e.g. Mr. Brooks, Ms. Tran').setRequired(true);
  f.addTextItem().setTitle('Bus').setHelpText('Bus number or company, if known.');
  f.addParagraphTextItem().setTitle('Roster (pasted)').setHelpText('Paste here OR upload the CSV below. One student per line: Last, First, Grade (e.g. Chen, Ava, 11). Copying rows from a spreadsheet works too.').setRequired(false);
  var old = ss.getSheetByName('Field Trips');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush(); Utilities.sleep(2000);
  var resp = ss.getSheets().filter(function (s) { return s.getFormUrl && s.getFormUrl() && s.getFormUrl().indexOf(f.getId()) >= 0; })[0];
  if (!resp) { ui.alert('Form created but the response tab was not found. Form link: ' + f.getPublishedUrl()); return; }
  if (old) {
    if (old.getLastRow() <= 2) ss.deleteSheet(old);          // only header (+ example) — safe to replace
    else old.setName('Field Trips (before form)');
  }
  resp.setName('Field Trips');
  var lc = resp.getLastColumn();
  resp.getRange(1, lc + 1, 1, 4).setValues([['Status', 'Trip ID', 'Last edited', 'Office notes']]);
  fmtTable_(resp);
  dropdown_(resp, 'Status', ['Submitted', 'Approved', 'Needs info', 'Cancelled']);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'onTripSubmit') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onTripSubmit').forSpreadsheet(ss).onFormSubmit().create();
  ui.alert('Field trip form is ready.\n\nShare this link with teachers:\n' + f.getPublishedUrl() + '\n\nEdit the form: ' + f.getEditUrl());
}

function onTripSubmit(e) {
  var sh = e.range.getSheet(); if (sh.getName() !== 'Field Trips') return;
  var r = e.range.getRow(), h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), v = sh.getRange(r, 1, 1, h.length).getValues()[0];
  var get = function (k) { return v[h.indexOf(k)]; }, put = function (k, x) { var c = h.indexOf(k); if (c >= 0) sh.getRange(r, c + 1).setValue(x); };
  var start = get('Start date'), dest = s_(get('Destination')) + ' ' + s_(get('Trip name'));
  var tag = (dest.match(/[A-Za-z]+/g) || ['TRIP']).map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 3);
  var id = 'T-' + (start ? Utilities.formatDate(new Date(start), tz_(), 'MMdd') : '0000') + '-' + tag, ids = rowsOf_('Field Trips').map(function (x) { return s_(x['Trip ID']); }), n = 2, base = id;
  while (ids.indexOf(id) >= 0) id = base + n++;
  if (!s_(get('End date'))) put('End date', start);
  put('Trip ID', id); put('Status', 'Approved'); put('Last edited', new Date());
  var teacher = staffNameByEmail_(get('Email Address')) || s_(get('Teachers attending')).split(',')[0];
  // Any "Roster…" question: typed names are read as a list; Drive links (from a File upload question) are opened and read.
  var txt = '';
  h.filter(function (k) { return /roster/i.test(k); }).forEach(function (k) {
    String(get(k) || '').split(/\r?\n/).forEach(function (line) {
      var links = line.match(/https:\/\/drive\.google\.com\/[^\s,]+/g);
      if (!links) { txt += '\n' + line; return; }
      links.forEach(function (u) { var m = u.match(/[-\w]{25,}/); if (!m) return;
        try { txt += '\n' + rosterFileText_(m[0]); } catch (x) { txt += '\n(could not read uploaded file ' + u + ')'; } });
    });
  });
  var parsed = parseRoster_(txt), rs = sheet_('Trip Rosters');
  if (parsed.ok.length) rs.getRange(rs.getLastRow() + 1, 1, parsed.ok.length, 5).setValues(parsed.ok.map(function (s) { return [id, teacher, s[0], s[1], s[2]]; }));
  bumpHubCache_();   // form submissions are not Sheet edits, so mark hub data out of date here
  var to = setting_('Field trip emails'); if (!to.length) return;
  var link = SpreadsheetApp.getActive().getUrl() + '#gid=' + sh.getSheetId() + '&range=A' + r;
  var row = function (k, x) { return '<tr><td style="padding:4px 14px 4px 0;color:#5c5c5d">' + k + '</td><td style="padding:4px 0"><b>' + x + '</b></td></tr>'; };
  var d = function (x) { return x ? Utilities.formatDate(new Date(x), tz_(), 'EEE, MMM d') : ''; };
  MailApp.sendEmail({ to: to.join(','), subject: 'Field trip posted: ' + s_(get('Trip name')) + ' · ' + d(start),
    htmlBody: '<div style="font-family:Lato,Arial,sans-serif;font-size:14px;color:#1d1d1d;max-width:560px">' +
      '<p style="font-size:16px;margin:0 0 12px"><b>Field trip posted to the Staff Hub</b> by ' + teacher + '</p><table style="border-collapse:collapse;font-size:14px">' +
      row('Trip', s_(get('Trip name'))) + row('Destination', s_(get('Destination'))) + row('Dates', d(start) + (s_(get('End date')) && d(get('End date')) !== d(start) ? ' – ' + d(get('End date')) : '')) +
      row('Leaves / returns', tm_(get('Leaves')) + ' – ' + tm_(get('Returns'))) + row('Teachers', s_(get('Teachers attending'))) + row('Bus', s_(get('Bus')) || '—') +
      row('Students', parsed.ok.length) + row('Trip ID', id) + '</table>' +
      (parsed.bad.length ? '<p style="margin:14px 0 0;padding:10px 12px;background:#fff4c2;border-radius:6px"><b>Roster lines that could not be read</b> (add these to Trip Rosters by hand):<br>' + parsed.bad.join('<br>') + '</p>' : '') +
      '<p style="margin:18px 0"><a href="' + link + '" style="display:inline-block;padding:10px 16px;background:#008539;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Open in the sheet</a></p>' +
      '<p style="font-size:12px;color:#5c5c5d">FYI only. It shows on the hub on the trip day. To remove it, set Status to Cancelled.</p></div>' });
}
/* Uploaded roster file → text lines "Last, First, Grade". CSV and Google Sheets read directly; Excel is converted only if the Drive API advanced service is on. */
function rosterFileText_(id) {
  var f = DriveApp.getFileById(id), mt = f.getMimeType(), rows;
  if (mt === MimeType.GOOGLE_SHEETS) rows = SpreadsheetApp.openById(id).getSheets()[0].getDataRange().getDisplayValues();
  else if (/sheet|excel/i.test(mt) && typeof Drive !== 'undefined') { var c = Drive.Files.copy({ title: 'tmp roster', mimeType: MimeType.GOOGLE_SHEETS }, id); rows = SpreadsheetApp.openById(c.id).getSheets()[0].getDataRange().getDisplayValues(); DriveApp.getFileById(c.id).setTrashed(true); }
  else rows = Utilities.parseCsv(f.getBlob().getDataAsString().replace(/^\uFEFF/, ''));
  return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) { return r.slice(0, 3).map(function (x) { return String(x).trim(); }).join(', '); }).join('\n');
}
function staffNameByEmail_(email) {
  email = norm_(email); if (!email) return '';
  var hit = rowsOf_(CFG.staffTab).filter(function (r) { return norm_(r['Email']) === email; })[0];
  return hit ? s_(hit['Name']) : '';
}
/* Accepts "Last, First, 11" · "Last, First (11)" · "First Last 11" · tab-separated rows copied from a spreadsheet. */
function parseRoster_(txt) {
  var ok = [], bad = [];
  String(txt || '').split(/\r?\n/).forEach(function (line) {
    var l = line.trim(); if (!l || /^(last|name)\b/i.test(l)) return;
    var gm = l.match(/(?:^|[\s,(\t-])(9|10|11|12)(?:th)?\)?\s*$/i), grade = gm ? Number(gm[1]) : '';
    var rest = gm ? l.slice(0, gm.index).replace(/[\s,(\t-]+$/, '') : l, last, first;
    var parts = rest.split(/\t|,/).map(function (x) { return x.trim(); }).filter(String);
    if (parts.length >= 2) { last = parts[0]; first = parts[1]; }
    else { var w = rest.split(/\s+/); if (w.length < 2) { bad.push(line); return; } last = w.pop(); first = w.join(' '); }
    ok.push([last, first, grade]);
  });
  return { ok: ok, bad: bad };
}


/* ================= STAFF GAMES SCOREBOARD =================
   Tab "Staff Games": Date | Time | Game | Initials | Score — one tab for every sign-in page game. Created on the first saved score;
   an older "Lion Run" tab is renamed and its rows marked Lion Run. Only qualifying scores are sent. Delete rows any time to reset a board. */
var GAME_NAMES_ = { run: 'Lion Run', pop: 'Pep Rally Pop', copier: 'Copier Jam', word: 'Lion Word', stack: 'Lunch Line Stack' };
function gameId_(v) { v = String(v || '').trim(); if (GAME_NAMES_[v]) return v; for (var k in GAME_NAMES_) if (GAME_NAMES_[k].toLowerCase() === v.toLowerCase()) return k; return v ? '' : 'run'; }
function lionSheet_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Staff Games');
  if (sh) return sh;
  var old = ss.getSheetByName('Lion Run');
  if (old) { old.setName('Staff Games'); old.insertColumnAfter(2); old.getRange(1, 3).setValue('Game'); var n = old.getLastRow() - 1; if (n > 0) old.getRange(2, 3, n, 1).setValue('Lion Run'); headerStyle_(old.getRange(1, 1, 1, 5)); return old; }
  sh = ss.insertSheet('Staff Games'); sh.appendRow(['Date', 'Time', 'Game', 'Initials', 'Score']); headerStyle_(sh.getRange(1, 1, 1, 5)); sh.setFrozenRows(1); sh.getRange('A:A').setNumberFormat('ddd m/d/yy');
  return sh;
}
function lionBoards_(gid) {
  gid = gameId_(gid) || 'run'; var sh = lionSheet_(), n = sh.getLastRow() - 1, today = todayKey_();
  var rows = n > 0 ? sh.getRange(2, 1, n, 5).getValues().map(function (r) { return { d: dk_(r[0]), g: gameId_(r[2]), i: s_(r[3]), s: Number(r[4]) || 0 }; }).filter(function (r) { return r.s > 0 && r.g === gid; }) : [];
  var top = function (a) { return a.sort(function (x, y) { return y.s - x.s; }).slice(0, 10).map(function (r) { return { i: r.i, s: r.s }; }); };
  return { game: gid, today: top(rows.filter(function (r) { return r.d === today; })), all: top(rows.slice()) };
}
function lionSave_(p) {
  var gid = gameId_(p.g) || 'run', i = String(p.i || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'SF', s = Math.floor(Number(p.s));
  if (!(s > 0 && s < 100000)) return lionBoards_(gid);
  var lock = LockService.getScriptLock(); lock.waitLock(5000);
  try { lionSheet_().appendRow([new Date(), Utilities.formatDate(new Date(), tz_(), 'h:mm a'), GAME_NAMES_[gid], i, s]); } finally { lock.releaseLock(); }
  return lionBoards_(gid);
}


/* ================= QUOTES TAB =================
   Quote | Who | Note (optional) | Show? — admin and office add rows; unchecked rows are hidden. Created with Ted Lasso starters on first use. */
var QUOTE_SEED_ = [
  ['Believe.', 'Ted Lasso', 'The sign above the locker room door.'],
  ['Be curious, not judgmental.', 'Ted Lasso', ''],
  ['Be a goldfish.', 'Ted Lasso', 'The happiest animal on earth has a ten-second memory.'],
  ['I believe in hope. I believe in Believe.', 'Ted Lasso', ''],
  ['Taking on a challenge is a lot like riding a horse. If you\'re comfortable while you\'re doing it, you\'re probably doing it wrong.', 'Ted Lasso', ''],
  ['Doing the right thing is never the wrong thing.', 'Ted Lasso', '']
];
function quotesSheet_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Quotes');
  if (sh) return sh;
  sh = ss.insertSheet('Quotes');
  sh.getRange(1, 1, 1, 4).setValues([['Quote', 'Who', 'Note (optional)', 'Show?']]);
  sh.getRange(2, 1, QUOTE_SEED_.length, 3).setValues(QUOTE_SEED_);
  headerStyle_(sh.getRange(1, 1, 1, 4)); sh.setFrozenRows(1);
  sh.setColumnWidth(1, 460); sh.setColumnWidth(2, 160); sh.setColumnWidth(3, 320); sh.setColumnWidth(4, 70);
  sh.getRange(2, 1, 200, 1).setWrap(true); sh.getRange(2, 3, 200, 1).setWrap(true).setFontColor(FMT.gray);
  var cb = sh.getRange(2, 4, 200, 1); cb.insertCheckboxes(); sh.getRange(2, 4, QUOTE_SEED_.length, 1).setValue(true); cb.setHorizontalAlignment('center');
  sh.getRange(1, 1, 201, 4).setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID);
  return sh;
}
function quotes_() {
  var sh = quotesSheet_(), n = sh.getLastRow() - 1; if (n < 1) return [];
  return sh.getRange(2, 1, n, 4).getValues().filter(function (r) { return s_(r[0]) && yes_(r[3]); })
    .map(function (r) { return [s_(r[0]).replace(/^["“]|["”]$/g, ''), s_(r[1]), s_(r[2])]; });   // every checked quote, no limit
}
/* Posted by = a principal / admin on the Staff tab, or "HS Admin" / "Admin" → counts as an admin post. */
var ADMINS_ = null;
function adminPoster_(by) {
  var k = norm_(String(by || '').split('·')[0]).replace(/^(mr|mrs|ms|dr)\.?\s+/, ''); if (!k) return false;
  if (k === 'hs admin' || k === 'admin') return true;
  if (!ADMINS_) { ADMINS_ = {}; try { var s = staff_(); Object.keys(s).forEach(function (n) { if (/principal|admin/.test(s[n].role)) ADMINS_[n] = 1; }); } catch (x) {} }
  return !!ADMINS_[k];
}
function annAdminFlag_(e) { /* Highlight Post is manual only: nothing checks it automatically. */ }
/* Announcements: adds Link and Highlight Post columns if missing (renames an old "Admin post" column), checkboxes on Highlight Post. */
function ensureAnnCols_() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Announcements'); if (!sh) return;
  var hr = hdr_(sh), old = col_(sh, 'Admin post'); if (old && !col_(sh, 'Highlight Post')) sh.getRange(hr, old).setValue('Highlight Post');
  ['Link', 'Highlight Post'].forEach(function (h) {
    if (col_(sh, h)) return;
    var c = tableCols_(sh) + 1; if (sh.getMaxColumns() < c) sh.insertColumnAfter(sh.getMaxColumns());
    sh.getRange(hr, c).setValue(h);
  });
  var hc = col_(sh, 'Highlight Post'), n = rows_(sh);
  if (hc) { var r = sh.getRange(hr + 1, hc, n, 1); if (!r.getDataValidation()) r.insertCheckboxes(); r.setHorizontalAlignment('center'); }
  var lc = col_(sh, 'Link'); if (lc) sh.setColumnWidth(lc, 220);
}


/* ================= A / B DAY =================
   Schedule tab B6 = any known A Day. Counts school days from there: weekends skipped, and so are
   "No School" rows on Schedule → Alternate Days and Calendar items that say "No School" (PARKWAY lines ignored).
   Returns 'Day A', 'Day B', or '' on a non-school day. */
function noSchoolSet_() {
  var c = CacheService.getScriptCache(), hit = c.get('noschool'); if (hit) return JSON.parse(hit);
  var set = {}, v = sheet_(CFG.scheduleTab).getDataRange().getValues();
  for (var i = 8; i < v.length; i++) if (v[i][0] && /no school/i.test(v[i][1])) set[dk_(v[i][0])] = 1;
  var cal = SpreadsheetApp.getActive().getSheetByName('Calendar');
  if (cal) cal.getDataRange().getValues().slice(1).forEach(function (r) {
    var t = String(r[1]) + ' ' + String(r[3] || ''); if (r[0] && /no school/i.test(t) && !/parkway/i.test(t)) set[dk_(r[0])] = 1;
  });
  c.put('noschool', JSON.stringify(set), 300);
  return set;
}
function abDay_(key) {
  var v = sheet_(CFG.scheduleTab).getRange('B4:B6').getValues(), first = dk_(v[0][0]), last = dk_(v[1][0]), anchor = dk_(v[2][0]);
  if (!anchor || !key) return '';
  if ((first && key < first) || (last && key > last)) return '';
  var ns = noSchoolSet_(), isSchool = function (k) { var d = new Date(k + 'T12:00:00'), w = d.getDay(); return w !== 0 && w !== 6 && !ns[k]; };
  if (!isSchool(key)) return '';
  var step = key >= anchor ? 1 : -1, d = new Date(anchor + 'T12:00:00'), n = 0, guard = 0;
  while (dayKey_(d) !== key && guard++ < 800) { d.setDate(d.getDate() + step); if (isSchool(dayKey_(d))) n++; }
  return n % 2 === 0 ? 'Day A' : 'Day B';
}


/* ---------- Print sub schedules ----------
   One PDF, one page per sub, for a chosen date. Full-day subs get the absent teacher's whole day (or half day);
   subs named in single P1–P8 cells get just those periods. Saved to Drive ("Sub Schedules" folder) and opened from a dialog. */
function printSubSchedules() {
  var ui = ui_(), key = todayKey_();
  if (ui) {
    var a = ui.prompt('Print sub schedules', 'Date to print (M/D/YYYY). Leave blank for today, or type "tomorrow".', ui.ButtonSet.OK_CANCEL);
    if (a.getSelectedButton() !== ui.Button.OK) return;
    var t = String(a.getResponseText() || '').trim();
    if (/^tom/i.test(t)) { var d = new Date(); do { d.setDate(d.getDate() + 1); } while (d.getDay() % 6 === 0); key = dayKey_(d); }
    else if (t) { var d2 = new Date(t); if (isNaN(d2)) return alert_('Could not read that date. Use M/D/YYYY.'); key = dayKey_(d2); }
  }
  var pages = subPages_(key);
  if (!pages.length) return alert_('No subs found on the Coverage tab for ' + prettyDay_(key) + '.\n\nFill in Full-day sub, or put a name from the Subs tab in a P1–P8 cell.');
  var html = subPdfHtml_(key, pages);
  var name = 'Sub schedules ' + key + '.pdf';
  var it = DriveApp.getFoldersByName('Sub Schedules'), folder = it.hasNext() ? it.next() : DriveApp.createFolder('Sub Schedules');
  var old = folder.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
  var file = folder.createFile(Utilities.newBlob(html, 'text/html', 'subs.html').getAs('application/pdf').setName(name));
  var url = file.getUrl();
  if (ui) ui.showModalDialog(HtmlService.createHtmlOutput(
    '<div style="font:14px Arial,sans-serif;line-height:1.5">' + pages.length + ' sub schedule' + (pages.length > 1 ? 's' : '') + ' for ' + prettyDay_(key) + ', one per page.<br><br>' +
    '<a href="' + url + '" target="_blank" style="display:inline-block;background:#008539;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">Open PDF to print</a>' +
    '<p style="color:#666;font-size:12px">Saved in Google Drive → Sub Schedules.</p></div>').setWidth(380).setHeight(170), 'Sub schedules ready');
  else Logger.log(url);
}
function prettyDay_(key) { return Utilities.formatDate(new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10), 12), tz_(), 'EEEE, MMMM d, yyyy'); }
function subPages_(key) {
  var staff = staff_(), bells = {}, sched = '';
  try { var b = todaysBells_(key); bells = b.bells; sched = b.name; } catch (x) {}
  var subSet = {}; try { subsTab_().getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) subSet[norm_(r[0])] = String(r[0]).trim(); }); } catch (x) {}
  var rows = rowsOf_(CFG.coverageTab).filter(function (r) { return dk_(r['Date']) === key && String(r['Teacher out'] || '').trim(); });
  rows.forEach(function (r) { var fs = String(r['Full-day sub'] || '').trim(); if (fs) subSet[norm_(fs)] = subSet[norm_(fs)] || fs; });
  var bySub = {}, add = function (sub, item) { var k = norm_(sub); (bySub[k] = bySub[k] || { name: subSet[k] || sub, items: [] }).items.push(item); };
  rows.forEach(function (r) {
    var who = String(r['Teacher out']).trim(), s = staff[norm_(who)] || { per: [], room: '' }, fs = String(r['Full-day sub'] || '').trim();
    var t = norm_(r['Type']), w = win_(t, 5);
    var noRoom = !String(s.room || '').trim() && !!staff[norm_(who)], room = noRoom ? 'N/A' : String(r['Room'] || s.room || '').trim(), note = String(r['Notes'] || '').trim();   // no room of their own: each period's room comes from the schedule
    pers_(key).forEach(function (p) {
      var cell = cv_(r, p), course = p === FX_ ? 'Flex' : (s.per || [])[p - 1] || '', kind = s.per && p !== FX_ ? slot_(s, p, '') : 'class';
      var rm = roomIn_(course) || room;
      var base = { p: p, time: bells[bk_(p)] || '', teacher: who, room: rm, note: note, roomVaries: noRoom };
      if (fs && inWin_(w, p)) {
        var what, mine = true;
        var ctw = /^ct:/i.test(cell) ? cell.replace(/^ct:\s*/i, '') : (!cell && kind === 'class' ? ctCover_(key, s, p) : '');
        if (ctw) { what = 'Free. Co-teacher ' + ctw + ' teaches ' + (course.replace(/\s*w\/.*$/i, '') || 'this class') + '. The office may assign you elsewhere.'; mine = false; }
        else if (norm_(cell) === norm_(fs) || (!cell && (kind === 'class' || kind === 'coteach'))) what = course || 'Class';
        else if (/^lunch$/i.test(cell) || kind === 'lunch') what = 'Lunch';
        else if (kind === 'prep') what = 'Prep (no class)';
        else if (/^duty:/i.test(cell)) { what = 'Free. Duty covered by ' + cell.replace(/^duty:\s*/i, ''); mine = false; }
        else if (kind === 'duty' && (!cell || cell === course)) { what = 'Duty: ' + course; var post = ''; try { post = dutyPost_(course); } catch (x) {} if (post) base.room = post; }
        else if (cell && !/^na$/i.test(cell)) { what = 'Free. Class covered by ' + cell; mine = false; }
        else what = course || '—';
        add(fs, Object.assign({}, base, { what: what, explicit: norm_(cell) === norm_(fs), kind: /^lunch$/i.test(what) ? 'lunch' : /^prep/i.test(what) ? 'prep' : mine ? 'class' : 'free' }));
      }
      if (cell && subSet[norm_(cell.replace(/^duty:\s*/i, ''))] && norm_(cell.replace(/^duty:\s*/i, '')) !== norm_(fs)) {
        var isDuty = /^duty:/i.test(cell), dpost = ''; if (isDuty) { try { dpost = dutyPost_(course); } catch (x) {} }
        add(cell.replace(/^duty:\s*/i, ''), Object.assign({}, base, { what: (isDuty ? 'Duty: ' + (course || 'duty') : course || 'Class') + ' (covering for ' + who + ')', kind: 'class', pulled: true, room: isDuty ? (dpost || 'See the main office') : rm }));
      }
    });
  });
  var rsx = roomSup_(key); Object.keys(rsx).forEach(function (rk) { var rec = rsx[rk];
    pers_(key).forEach(function (p) { var w2 = rec.per[p - 1]; if (!w2 || !subSet[norm_(w2)]) return;
      var cls = roomClasses_(key, p, rk);
      add(w2, { p: p, time: bells[bk_(p)] || '', teacher: rec.room, room: rec.room, note: rec.note, what: 'Supervise ' + rec.room + (cls.length ? ' (' + (p === FX_ ? 'Flex groups' : 'classes') + ' of ' + cls.join(', ') + ')' : ''), kind: 'class', pulled: true }); }); });
  return Object.keys(bySub).map(function (k) { var o = bySub[k];
      o.items = o.items.filter(function (it) { return it.pulled || it.explicit || !o.items.some(function (x) { return x.pulled && x.p === it.p; }); });   // moved to another row that period: show where they actually go
      o.items.sort(function (a, b) { return pord_(a.p) - pord_(b.p) || (a.pulled ? 1 : -1); }); o.sched = sched; return o; })
    .sort(function (a, b) { return a.name.localeCompare(b.name); });
}
function subPdfHtml_(key, pages) {
  var esc = function (x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var ab = ''; try { ab = abDay_(key); } catch (x) {}
  var day = prettyDay_(key), office = CFG.officeName || 'SFHS Main Office';
  var css = 'body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;margin:0}' +
    '.pg{padding:28px 34px;page-break-after:always}.pg:last-child{page-break-after:auto}' +
    '.bar{border-bottom:4px solid #008539;padding-bottom:10px;margin-bottom:16px}' +
    '.k{font-size:10px;letter-spacing:2px;color:#008539;font-weight:bold;text-transform:uppercase}' +
    'h1{font-family:Georgia,serif;font-size:30px;margin:4px 0 2px}.sub{font-size:13px;color:#444}' +
    '.who{margin:0 0 14px;font-size:13px;color:#333}.who b{color:#000}' +
    'table{width:100%;border-collapse:collapse;font-size:13px}th{background:#008539;color:#fff;text-align:left;padding:8px 10px;font-size:11px;letter-spacing:1px;text-transform:uppercase}' +
    'td{border-bottom:1px solid #d9d9d9;padding:10px;vertical-align:top}td.p{font-weight:bold;width:54px}td.t{width:110px;white-space:nowrap}td.r{width:70px}' +
    'tr.lunch td,tr.prep td{background:#f3f3f3;color:#666}tr.free td{color:#888;font-style:italic}' +
    '.notes{margin-top:14px;padding:10px 12px;border:1px solid #d9d9d9;font-size:12px}.foot{margin-top:18px;font-size:11px;color:#666}';
  var body = pages.map(function (pg) {
    var teachers = [], seen = {}; pg.items.forEach(function (i) { if (!seen[i.teacher]) { seen[i.teacher] = 1; teachers.push(i.teacher + (i.room && i.room !== 'N/A' && !i.roomVaries ? ' (' + i.room + ')' : i.roomVaries ? ' (no room of their own: see each period)' : '')); } });
    var notes = [], ns = {}; pg.items.forEach(function (i) { if (i.note && !ns[i.note]) { ns[i.note] = 1; notes.push(esc(i.teacher) + ': ' + esc(i.note)); } });
    return '<div class="pg"><div class="bar"><div class="k">South Fayette High School · Substitute schedule</div>' +
      '<h1>' + esc(pg.name) + '</h1><div class="sub">' + esc(day) + (ab ? ' · ' + esc(ab) : '') + (pg.sched ? ' · ' + esc(pg.sched) + ' schedule' : '') + '</div></div>' +
      '<p class="who">In for: <b>' + esc(teachers.join(', ')) + '</b></p>' +
      '<table><tr><th>Period</th><th>Time</th><th>Room</th><th>Teacher</th><th>Course / assignment</th></tr>' +
      pg.items.map(function (i) { return '<tr class="' + i.kind + '"><td class="p">' + pl_(i.p) + '</td><td class="t">' + esc(i.time) + '</td><td class="r">' + esc(i.room) + '</td><td>' + esc(i.teacher) + '</td><td>' + esc(i.what) + '</td></tr>'; }).join('') +
      '</table>' + (notes.length ? '<div class="notes"><b>Notes</b><br>' + notes.join('<br>') + '</div>' : '') +
      '<div class="foot">Questions? Stop by or call the ' + esc(office) + '. </div></div>';
  }).join('');
  return '<html><head><meta charset="utf-8"><style>' + css + '</style></head><body>' + body + '</body></html>';
}


/* ================= HOME DASHBOARD =================
   Staff Hub → Refresh Home dashboard. Creates a "Home" tab (first position) with today's numbers,
   a "needs attention" list and links to every tab. Refreshes itself each time the Sheet is opened. */
var HOME_TABS_ = [
  ['Daily', [['Coverage', 'Teachers out, subs, period coverage'], ['Announcements', 'Green banner + emergency alert at the top, then hub posts'], ['Testing', 'Rooms testing, by period'], ['Field Trips', 'Trips from the form. Status column'], ['Trip Rosters', 'Students on each trip'], ['Chill Room', 'Week status and announcement (coordinator)'], ['Flex Testing', 'Flex day make-up tests: student locations']]],
  ['Schedule', [['Schedule', 'A/B anchor and default schedule'], ['Schedule Days', 'Days that are not the default'], ['Bell Times', 'Period times for each schedule'], ['Calendar', 'Events, no-school days, delays']]],
  ['People & setup', [['Staff', 'Teachers, rooms, emails, P1–P8'], ['Subs', 'Substitute names and emails'], ['Settings', 'Admin emails, office preview, options'], ['Quotes', 'Welcome-page quotes'], ['FAQ', 'Hub questions and answers'], ['Email Log', 'Coverage emails sent'], ['Staff Games', 'Sign-in page game scores (all games)']]]
];
var HUB_URL_ = 'https://sfdailyhub.vercel.app', TRIP_FORM_URL_ = 'https://docs.google.com/forms/d/e/1FAIpQLSewiPdoGpwP0-wW0BogMyWi7TdhA19laWTcnTVUomh5DotWZw/viewform';
function buildHome() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Home') || ss.insertSheet('Home', 0);
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
  refreshHome_();
}
function rt_(name, desc, url, size) {
  var t = name + (desc ? '\n' + desc : ''), b = SpreadsheetApp.newRichTextValue().setText(t);
  if (url) b.setLinkUrl(0, name.length, url);
  b.setTextStyle(0, name.length, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(false).setForegroundColor(FMT.green).setFontSize(size || 11).setFontFamily(FMT.font).build());
  if (desc) b.setTextStyle(name.length + 1, t.length, SpreadsheetApp.newTextStyle().setBold(false).setUnderline(false).setForegroundColor(FMT.gray).setFontSize(9).setFontFamily(FMT.font).build());
  return b.build();
}
function homeData_(key) {
  var staff = {}; try { staff = staff_(); } catch (x) {}
  var who_ = function (n) { return staff[norm_(String(n).replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''))]; };
  var cov = rowsOf_(CFG.coverageTab).filter(function (r) { return dk_(r['Date']) === key && s_(r['Teacher out']); });
  var d = { out: 0, open: 0, openDuty: 0, subs: {}, short: [] };
  cov.forEach(function (r) {
    var t = norm_(r['Type']); if (/building/.test(t)) return;
    d.out++;
    var name = s_(r['Teacher out']), s = who_(name), w = win_(t, 5), mine = 0;
    if (s_(r['Full-day sub'])) d.subs[norm_(r['Full-day sub'])] = 1;
    if (!s) return;
    if (isFlexDay_(key) && inWin_(w, FX_) && !cv_(r, FX_) && !s_(r['Full-day sub'])) { d.open++; mine++; }
    for (var p = w[0]; p <= w[1]; p++) { if (!inWin_(w, p)) continue;
      var cell = s_(r['P' + p]), kind = slot_(s, p, '');
      if ((kind === 'class' || kind === 'coteach') && !cell && !ctCover_(key, s, p)) { d.open++; mine++; }
      if (kind === 'duty' && (!cell || cell === s_((s.per || [])[p - 1]))) d.openDuty++;
    }
    if (mine) d.short.push(name + ' (' + mine + ')');
  });
  d.subN = Object.keys(d.subs).length;
  return d;
}
function refreshHome_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Home'); if (!sh) return;
  var key = todayKey_(), link = function (n) { var t = ss.getSheetByName(n); return t ? '#gid=' + t.getSheetId() : ''; };
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  sh.clear(); sh.clearNotes(); sh.setHiddenGridlines(true); sh.setFrozenRows(0);
  if (sh.getMaxRows() < 200) sh.insertRowsAfter(sh.getMaxRows(), 200 - sh.getMaxRows());   // room for the full dashboard (trimmed again at the end)
  if (sh.getMaxColumns() < 8) sh.insertColumnsAfter(sh.getMaxColumns(), 8 - sh.getMaxColumns());
  sh.setColumnWidth(1, 24); sh.setColumnWidths(2, 6, 165); sh.setColumnWidth(8, 24);
  sh.getRange(1, 1, sh.getMaxRows(), 8).setFontFamily(FMT.font).setFontColor(FMT.ink).setVerticalAlignment('middle');
  var row = 2;
  var band = function (txt, opts) { var rg = sh.getRange(row, 2, 1, 6).merge().setValue(txt); if (opts) opts(rg); return rg; };
  var label = function (txt) { row++; band(txt, function (rg) { rg.setFontSize(9).setFontWeight('bold').setFontColor(FMT.green).setBorder(null, null, true, null, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID); }); sh.setRowHeight(row, 26); row++; };

  // header
  band('SFHS Daily Staff Hub · Office Sheet', function (rg) { rg.setBackground(FMT.green).setFontColor('#ffffff').setFontSize(18).setFontWeight('bold').setHorizontalAlignment('left'); });
  sh.setRowHeight(row, 46); row++;
  var ab = '', sched = ''; try { ab = abDay_(key); } catch (x) {} try { sched = todaysBells_(key).name; } catch (x) {}
  band([prettyDay_(key), ab, sched ? sched + ' schedule' : '', 'Updated ' + Utilities.formatDate(new Date(), tz_(), 'h:mm a')].filter(String).join('   ·   '),
    function (rg) { rg.setBackground(FMT.greenTint).setFontSize(10).setFontColor(FMT.ink); });
  sh.setRowHeight(row, 28); row++;

  // today at a glance
  var d = homeData_(key);
  var ann = rowsOf_('Announcements').filter(function (r) { return on_(key, r['Date'], r['Show until']) && s_(r['Title']); });
  var trips = rowsOf_('Field Trips').filter(function (r) { return !/cancel/i.test(r['Status']) && on_(key, r['Start date'], r['End date']); }), ids = {};
  trips.forEach(function (r) { ids[s_(r['Trip ID'])] = 1; });
  var stu = rowsOf_('Trip Rosters').filter(function (r) { return ids[s_(r['Trip ID'])]; }).length;
  var tests = rowsOf_('Testing').filter(function (r) { return dk_(r['Date']) === key; }), rooms = {};
  tests.forEach(function (r) { rooms[norm_(r['Room'] || r['Teacher'])] = 1; });
  label('TODAY AT A GLANCE');
  var cf = { sent: 0, ok: 0, waiting: [] }; try { cf = confirmations_(key); } catch (x) {}
  var tiles = [[d.out, 'TEACHERS OUT', 'Coverage'], [d.open, 'OPEN PERIODS', 'Coverage'], [cf.sent ? cf.ok + ' of ' + cf.sent : '—', 'CONFIRMED (GOT IT)', CFG.logTab],
    [ann.length, 'ANNOUNCEMENTS', 'Announcements'], [trips.length + (trips.length ? ' · ' + stu : ''), trips.length ? 'TRIPS · STUDENTS' : 'FIELD TRIPS', 'Field Trips'], [Object.keys(rooms).length, 'TESTING ROOMS', 'Testing']];
  tiles.forEach(function (t, i) {
    var c = 2 + i, v = sh.getRange(row, c), l = sh.getRange(row + 1, c), u = link(t[2]);
    var txt = String(t[0]), b = SpreadsheetApp.newRichTextValue().setText(txt);
    if (u) b.setLinkUrl(0, txt.length, u);
    b.setTextStyle(0, txt.length, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(false).setFontSize(22).setFontFamily(FMT.font).setForegroundColor(i === 1 && d.open ? '#c5221f' : FMT.ink).build());
    if (i === 2 && cf.sent && cf.ok < cf.sent) b.setTextStyle(0, txt.length, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(false).setFontSize(22).setFontFamily(FMT.font).setForegroundColor('#b06000').build());
    v.setRichTextValue(b.build()).setHorizontalAlignment('left').setVerticalAlignment('bottom');
    l.setValue(t[1]).setFontSize(8).setFontColor(FMT.gray).setVerticalAlignment('top');
    sh.getRange(row, c, 2, 1).setBackground('#ffffff').setBorder(true, true, true, true, null, null, FMT.line, SpreadsheetApp.BorderStyle.SOLID);
  });
  sh.setRowHeight(row, 44); sh.setRowHeight(row + 1, 24); row += 3;

  // coverage confirmations (Got it ✓ in today's emails)
  label('COVERAGE CONFIRMATIONS' + (cf.sent ? '  ·  ' + cf.ok + ' OF ' + cf.sent + ' CONFIRMED' : ''));
  if (!cf.sent) { band('No coverage emails sent today.', function (rg) { rg.setFontColor(FMT.gray).setFontSize(10); }); sh.setRowHeight(row, 26); row++; }
  else {
    var cw = cf.waiting.map(function (w) { return w[0] + (w[1] ? '  (sent ' + w[1] + ')' : ''); }), cd = (cf.done || []).map(function (w) { return '✓ ' + w[0] + (w[1] ? '  ' + w[1] : ''); });
    var n = Math.max(cw.length, cd.length, 1);
    sh.getRange(row, 2, 1, 3).merge().setValue('NOT CONFIRMED YET · ' + cw.length).setFontSize(8).setFontWeight('bold').setFontColor('#b06000');
    sh.getRange(row, 5, 1, 3).merge().setValue('CONFIRMED · ' + cd.length).setFontSize(8).setFontWeight('bold').setFontColor(FMT.green);
    sh.setRowHeight(row, 22); row++;
    for (var ci = 0; ci < n; ci++) {
      var a = sh.getRange(row, 2, 1, 3).merge().setValue(cw[ci] || (ci === 0 && !cw.length ? 'Everyone has confirmed.' : '')).setFontSize(10);
      if (cw[ci]) a.setBackground('#fff8ee').setFontWeight('bold').setBorder(true, true, true, true, null, null, '#f0d2a8', SpreadsheetApp.BorderStyle.SOLID);
      else if (ci === 0) a.setFontColor(FMT.gray);
      var b2 = sh.getRange(row, 5, 1, 3).merge().setValue(cd[ci] || (ci === 0 && !cd.length ? 'No one yet.' : '')).setFontSize(10);
      if (cd[ci]) b2.setBackground(FMT.greenTint).setBorder(true, true, true, true, null, null, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
      else if (ci === 0) b2.setFontColor(FMT.gray);
      sh.setRowHeight(row, 26); row++;
    }
  }
  row++;

  // subs free for coverage
  var free = []; try { free = subFree_(key); } catch (x) {}
  label('SUBS AVAILABLE FOR COVERAGE');
  if (!free.length) { band('No free sub periods today.', function (rg) { rg.setFontColor(FMT.gray).setFontSize(10); }); sh.setRowHeight(row, 26); row++; }
  else { band(free.map(function (x) { return 'P' + x.p + '  ' + x.sub + ' (' + x.why + ')'; }).join('     ·     '), function (rg) { rg.setFontSize(10).setWrap(true).setBackground('#e8f0fe'); }); sh.setRowHeight(row, Math.min(90, 26 + 14 * Math.floor(free.length / 4))); row++; }
  row++;

  // needs attention
  var todo = [];
  if (d.open) todo.push(['Coverage', d.open + ' class period' + (d.open > 1 ? 's' : '') + ' still need a coverer today', d.short.join(', ')]);
  if (d.openDuty) todo.push(['Coverage', d.openDuty + ' dut' + (d.openDuty > 1 ? 'ies' : 'y') + ' with no one assigned', 'Type Duty: Name in the cell to assign']);
  var nd = new Date(); do { nd.setDate(nd.getDate() + 1); } while (nd.getDay() % 6 === 0);
  var tk = dayKey_(nd), td = homeData_(tk);
  if (td.out) todo.push(['Coverage', 'Next school day (' + Utilities.formatDate(nd, tz_(), 'EEE M/d') + '): ' + td.out + ' out, ' + td.open + ' open period' + (td.open === 1 ? '' : 's'), td.short.join(', ')]);
  var pend = rowsOf_('Field Trips').filter(function (r) { return s_(r['Trip name']) && !s_(r['Status']); }).length;
  if (pend) todo.push(['Field Trips', pend + ' field trip' + (pend > 1 ? 's' : '') + ' with no Status', 'Set Approved or Cancelled']);
  var noEmail = 0; try { var st = staff_(); Object.keys(st).forEach(function (k) { if (!st[k].email) noEmail++; }); } catch (x) {}
  if (noEmail) todo.push(['Staff', noEmail + ' staff row' + (noEmail > 1 ? 's' : '') + ' missing an email', 'Staff Hub → Tools → Fill missing staff emails']);
  var set = ss.getSheetByName('Settings');
  if (set && set.getLastRow() > 1) set.getRange(2, 1, set.getLastRow() - 1, 2).getValues().forEach(function (r) { if (/HERE/.test(String(r[1]))) todo.push(['Settings', 'Settings: ' + r[0] + ' still has a placeholder', String(r[1])]); });
  label('NEEDS ATTENTION');
  if (!todo.length) { band('Nothing needs attention right now.', function (rg) { rg.setFontColor(FMT.gray).setFontSize(10); }); sh.setRowHeight(row, 28); row++; }
  todo.forEach(function (t) {
    var rg = sh.getRange(row, 2, 1, 6).merge(); rg.setRichTextValue(rt_(t[1], t[2], link(t[0]), 10)).setWrap(true);
    rg.setBorder(null, null, true, null, null, null, FMT.line, SpreadsheetApp.BorderStyle.SOLID);
    sh.setRowHeight(row, t[2] ? 38 : 26); row++;
  });
  row++;

  // tabs
  label('GO TO A TAB');
  var listed = {}, groups = HOME_TABS_.map(function (g) { return [g[0], g[1].filter(function (t) { listed[t[0]] = 1; return ss.getSheetByName(t[0]); })]; });
  var other = ss.getSheets().map(function (s) { return s.getName(); }).filter(function (n) { return n !== 'Home' && !listed[n]; });
  if (other.length) groups[2][1] = groups[2][1].concat(other.map(function (n) { return [n, '']; }));
  var start = row, max = 0;
  groups.forEach(function (g, gi) {
    var c = 2 + gi * 2, r0 = start;
    sh.getRange(r0, c, 1, 2).merge().setValue(g[0].toUpperCase()).setFontSize(8).setFontWeight('bold').setFontColor(FMT.gray);
    g[1].forEach(function (t, i) {
      var rg = sh.getRange(r0 + 1 + i, c, 1, 2).merge();
      rg.setRichTextValue(rt_(t[0] + ' →', t[1], link(t[0]))).setWrap(true).setBackground(FMT.band);
      rg.setBorder(true, true, true, true, null, null, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_THICK);
    });
    max = Math.max(max, g[1].length);
  });
  sh.setRowHeight(start, 22); for (var i = 1; i <= max; i++) sh.setRowHeight(start + i, 40);
  row = start + max + 2;

  // quick links
  label('QUICK LINKS');
  [[HUB_URL_, 'Open the Staff Hub', 'sfdailyhub.vercel.app'], [TRIP_FORM_URL_, 'Field trip form', 'Share with teachers after approval'], ['', 'Staff Hub menu', 'Print sub schedules · Send coverage emails · Format sheet']].forEach(function (q, i) {
    var rg = sh.getRange(row, 2 + i * 2, 1, 2).merge(); rg.setRichTextValue(rt_(q[1] + (q[0] ? ' ↗' : ''), q[2], q[0] || null)).setWrap(true);
  });
  sh.setRowHeight(row, 40); row += 2;
  band('Refreshes each time the Sheet is opened. To refresh now: Staff Hub → Refresh Home dashboard.', function (rg) { rg.setFontSize(8).setFontColor(FMT.gray).setFontStyle('italic'); });
  if (sh.getMaxRows() > row + 2) sh.deleteRows(row + 3, sh.getMaxRows() - row - 2);
}


/* ================= CHILL ROOM =================
   Tab "Chill Room", kept by the Chill Room coordinator.
   Top block (column B): Coordinator · Extension · Announcement · Announcement shows until (blank = until cleared) · Room.
   Week table (row 7 down): Date | Status ▾ | Details. One row per school day. The hub shows today plus the next days entered. */
var CHILL_STATUS_ = ['Open', 'Open to faculty only', 'Open with a substitute chill educator', 'Limited hours', 'Closed'];
function chillTab_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Chill Room');
  if (sh && String(sh.getRange('A1').getValue()) === 'Date') { sh.setName('Chill Room (old)'); sh = null; }   // earlier layout
  if (sh) { chillRoomRow_(sh); return sh; }
  sh = ss.insertSheet('Chill Room');
  sh.getRange('A1:B4').setValues([['Coordinator', ''], ['Extension', ''], ['Announcement', ''], ['Announcement shows until', '']]);
  sh.getRange('A1:A4').setFontWeight('bold').setBackground(FMT.greenTint).setFontColor(FMT.ink);
  sh.getRange('B1:C4').setBackground('#ffffff'); ['B1:C1', 'B2:C2', 'B3:C3', 'B4:C4'].forEach(function (a) { sh.getRange(a).merge(); });
  sh.getRange('B3').setWrap(true); sh.setRowHeight(3, 48); sh.getRange('B4').setNumberFormat('ddd m/d/yyyy');
  sh.getRange('A1:C4').setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID).setVerticalAlignment('middle');
  chillRoomRow_(sh);
  sh.getRange('A6').setValue('WEEK AT A GLANCE · one row per school day').setFontWeight('bold').setFontColor(FMT.green).setFontSize(9);
  sh.getRange('A7:C7').setValues([['Date', 'Status', 'Details (optional)']]); headerStyle_(sh.getRange('A7:C7')); sh.setFrozenRows(7);
  var n = Math.max(sh.getMaxRows() - 7, 1);
  sh.getRange(8, 1, n, 1).setNumberFormat('dddd m/d');
  sh.getRange(8, 2, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(CHILL_STATUS_, true).setAllowInvalid(true).build());
  sh.getRange(8, 3, n, 1).setWrap(true);
  sh.setColumnWidth(1, 190); sh.setColumnWidth(2, 280); sh.setColumnWidth(3, 340);
  var rules = sh.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Closed').setBackground('#eeeeee').setFontColor('#5c5c5d').setRanges([sh.getRange(8, 2, n, 1)]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$A8=TODAY()').setBackground(FMT.greenTint).setBold(true).setRanges([sh.getRange(8, 1, n, 3)]).build());
  sh.setConditionalFormatRules(rules);
  sh.getRange('A1').setNote('Chill Room coordinator: fill in your name, extension and any announcement at the top, then one row per school day below with a Status. Status is a dropdown, but you can type your own.');
  return sh;
}
/* Room row (A5/B5), added to existing tabs too. Default AB210. */
function chillRoomRow_(sh) {
  if (String(sh.getRange('A5').getValue()).trim() === 'Room') return;
  sh.getRange('A5:B5').setValues([['Room', 'AB210']]);
  sh.getRange('B5:C5').merge().setBackground('#ffffff');
  sh.getRange('A5').setFontWeight('bold').setBackground(FMT.greenTint).setFontColor(FMT.ink);
  sh.getRange('A5:C5').setBorder(true, true, true, true, true, true, FMT.line, SpreadsheetApp.BorderStyle.SOLID).setVerticalAlignment('middle');
}


/* ================= FLEX TESTING =================
   Tab "Flex Testing": Date | Student Last Name | Student First Name | Teacher Last Name | Assigned Location | Test received | Didn't sign up
   Rows dated the day being viewed appear on the hub's Flex Day Testing card (search by student). */
function flexTab_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Flex Testing');
  if (sh) return sh;
  sh = ss.insertSheet('Flex Testing');
  var H = ['Date', 'Student Last Name', 'Student First Name', 'Teacher Last Name', 'Assigned Location', 'Test received', "Didn't sign up"];
  sh.getRange(1, 1, 1, H.length).setValues([H]); headerStyle_(sh.getRange(1, 1, 1, H.length)); sh.setFrozenRows(1);
  var n = Math.max(sh.getMaxRows() - 1, 1);
  sh.getRange(2, 1, n, 1).setNumberFormat('ddd m/d/yyyy');
  sh.getRange(2, 6, n, 2).insertCheckboxes();
  [110, 150, 150, 150, 160, 110, 110].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange(2, 6, n, 2).setHorizontalAlignment('center');
  var rules = sh.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2=TRUE').setBackground('#fce8e6').setRanges([sh.getRange(2, 1, n, 7)]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2=TRUE').setBackground('#e6f3eb').setRanges([sh.getRange(2, 1, n, 7)]).build());
  sh.setConditionalFormatRules(rules);
  try { var st = ss.getSheetByName(CFG.staffTab); if (st) sh.getRange(2, 4, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(st.getRange('A2:A'), true).setAllowInvalid(true).build()); } catch (x) {}
  sh.getRange('A1').setNote('One row per student testing on a Flex day. Green row = test received. Red row = didn\'t sign up. Rows dated today show on the hub, where staff can search a student to find their location.');
  return sh;
}

/* Calendar tab → hub. Sends rows from a week back to ~10 weeks ahead in the same shape as the built-in district calendar,
   so office-added meetings, deadlines and events show in My Day, "Affects my class" and Tonight at SFHS.
   Calendar tab: Date | Item | Type | Detail | Period | Time | Delay schedule */
function calItems_(key) {
  var base = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)), lo = dayKey_(new Date(base.getTime() - 7 * 864e5)), hi = dayKey_(new Date(base.getTime() + 70 * 864e5));
  var T = { 'staff meeting': 'meeting', 'deadline': 'deadline', 'district': 'district', 'observance': 'observance', 'testing': 'testing', 'tonight': 'tonight', 'hs activity': 'today' };
  return rowsOf_('Calendar').map(function (r) {
    var k = dk_(r['Date']), text = s_(r['Item']); if (!k || !text || k < lo || k > hi) return null;
    var type = norm_(r['Type']), det = norm_(r['Detail']), per = +s_(r['Period']) || 0, time = tm_(r['Time']) || s_(r['Time']);
    if (det === 'late start' || det === 'early dismissal') return null;   // schedules come from scheduleMap_
    var mins = (function (t) { var m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(t || ''); if (!m) return null; var h = +m[1]; if (/pm/i.test(m[3] || '') && h < 12) h += 12; if (!m[3] && h < 7) h += 12; return h * 60 + +m[2]; })(time);
    var cat = T[type] || 'today'; if (type === 'hs activity' && mins != null && mins >= 15 * 60) cat = 'tonight';
    var o = { date: k, text: text + (cat === 'tonight' && time ? ', ' + time : ''), cat: cat, src: 'sheet' };
    if (cat === 'meeting') { if (per) { o.period = per; o.when = 'during'; } else { o.when = 'after'; o.time = time || '2:00 – 2:40 PM'; } }
    else if (per) o.period = per;
    if (/board/i.test(text)) o.board = true;
    return o;
  }).filter(Boolean);
}

/* ---------- Hub error log ----------
   The hub posts page errors here (max ~30 per hour across all staff). Tab "Hub Errors" is hidden; unhide it to read. */
function hubLog_(p) {
  var c = CacheService.getScriptCache(), n = +(c.get('logN') || 0); if (n > 30) return { ok: false };
  c.put('logN', String(n + 1), 3600);
  var who = '(not signed in)'; try { if (p.token) { var v = verify_(p.token); if (v.ok) who = v.email; } } catch (x) {}
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Hub Errors');
  if (!sh) { sh = ss.insertSheet('Hub Errors'); sh.getRange(1, 1, 1, 6).setValues([['When', 'Who', 'Error', 'Page', 'Day shown', 'Browser']]); headerStyle_(sh.getRange(1, 1, 1, 6)); sh.setFrozenRows(1); sh.setColumnWidth(3, 480); sh.hideSheet(); }
  sh.appendRow([new Date(), who, String(p.msg || '').slice(0, 1000), String(p.page || '').slice(0, 200), String(p.day || ''), String(p.ua || '').slice(0, 200)]);
  return { ok: true };
}

/* ---------- "Got it" confirmations ----------
   Each coverage email has a signed link. Clicking it marks that person's cells on the Coverage tab for that date
   (green bold text + a CONFIRMED note) and stamps the Email Log. The link only works for that email + date. */
var HUB_EXEC_ = 'https://script.google.com/macros/s/AKfycbwMYGoFTNLJUM2Lvne3SbKLXIQMykDSagh0nSH9752yE-0sjaY7-r2bQHtMAaxZuLdKsw/exec';
function ackSecret_() { var pr = PropertiesService.getScriptProperties(), s = pr.getProperty('ackSecret'); if (!s) { s = Utilities.getUuid(); pr.setProperty('ackSecret', s); } return s; }
function ackSig_(email, key) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(norm_(email) + '|' + key, ackSecret_())).slice(0, 22); }
function ackUrl_(email, key) {   // goes through the hub page: Google's own script links fail for staff signed into more than one Google account
  return HUB_URL_ + '/?ack=1&e=' + encodeURIComponent(email) + '&d=' + key + '&s=' + ackSig_(email, key);
}
function ackPage_(p) {
  var page = function (title, body) { if (p.fmt === 'json') return json_({ ok: !/not valid/i.test(title), title: title, body: body }); return HtmlService.createHtmlOutput('<div style="font-family:Arial,sans-serif;max-width:460px;margin:60px auto;text-align:center;color:#222"><div style="font-weight:bold;letter-spacing:2px;color:#008539">SOUTH FAYETTE</div><h2 style="font-family:Georgia,serif">' + title + '</h2><p style="color:#555;line-height:1.6">' + body + '</p></div>').setTitle('Staff Hub'); };
  var email = String(p.e || ''), key = String(p.d || '');
  if (!email || !/^\d{4}-\d{2}-\d{2}$/.test(key) || p.s !== ackSig_(email, key)) return page('Link not valid', 'This confirmation link is incomplete or expired. Contact the main office.');
  var staff = staff_(), me = null; Object.keys(staff).forEach(function (k) { if (norm_(staff[k].email) === norm_(email)) me = staff[k]; });
  var stamp = Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'), n = 0;
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(CFG.coverageTab), dc = col_(sh, 'Date'), p1 = col_(sh, 'P1');
    if (me && dc && p1) {
      var v = sh.getDataRange().getValues(), nm = norm_(me.name);
      for (var i = 1; i < v.length; i++) { if (dk_(v[i][dc - 1]) !== key) continue;
        for (var q = 0; q < 8; q++) { var c = norm_(String(v[i][p1 - 1 + q]).replace(/^(duty|ct):\s*/i, '').replace(/^(mr|mrs|ms|dr)\.?\s+/i, ''));
          if (c && c === nm) { var cell = sh.getRange(i + 1, p1 + q), old = cell.getNote().replace(/\n?✓ CONFIRMED[^\n]*/g, ''); cell.setFontColor('#008539').setFontWeight('bold').setNote((old ? old + '\n' : '') + '✓ CONFIRMED by ' + me.name + ' · ' + stamp); n++; } } }
    }
    var lg = log_(), lv = lg.getDataRange().getValues();
    if (lg.getLastColumn() < 6) lg.getRange(1, 6).setValue('Confirmed');
    for (var j = lv.length - 1; j >= 1; j--) if (norm_(lv[j][1]) === norm_(email) && dayKey_(lv[j][0]) === key) { lg.getRange(j + 1, 6).setValue(stamp); break; }
  } finally { lock.releaseLock(); }
  bumpHubCache_();
  return page('Thanks' + (me ? ', ' + me.name : '') + '!', 'The office can see you confirmed your coverage for ' + prettyDay_(key) + (n ? ' (' + n + ' period' + (n > 1 ? 's' : '') + ')' : '') + '. You can close this tab.');
}

/* ---------- Find a coverer sidebar ----------
   Click any P1–P8 cell on the Coverage tab; the sidebar lists who is free that period on that date:
   staff on a duty / Engagement / SAP (fewest coverages this month first), full-day subs who are free, and staff on prep (needs OK).
   Clicking a name fills the cell (Duty: Name when the absent teacher has a duty that period). */
/* Find a coverer sidebar: polls the selected cell every 1.5 s and lists who is free that period. */
var COVER_SIDEBAR_JS_ = "\nvar last = \"\";\nfunction esc(t) { return String(t == null ? \"\" : t).replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/\"/g, \"&quot;\"); }\nfunction sec(t, list, kind) {\n  if (!list.length) return \"<h3>\" + t + \"</h3><div class=muted>None free this period</div>\";\n  return \"<h3>\" + t + \"</h3>\" + list.map(function (x) {\n    return \"<button class=\\\"b \" + (kind == \"prep\" ? \"warn\" : x.here ? \"here\" : \"\") + \"\\\" data-n=\\\"\" + esc(x.name) + \"\\\" data-k=\\\"\" + kind + \"\\\"><span><span class=n>\" + esc(x.name) + \"</span><br><span class=m>\" + esc(x.why) + \"</span></span><span class=m>\" + (x.n != null ? x.n + \" this mo.\" : \"\") + \"</span></button>\";\n  }).join(\"\");\n}\nvar FX = false;\nfunction draw(d) {\n  FX = !!(d && d.flex);\n  var o = document.getElementById(\"out\");\n  if (!d || !d.ok) { o.className = \"muted\"; o.innerHTML = esc(d && d.msg ? d.msg : \"Click a P1–P8 cell on the Coverage tab.\"); return; }\n  o.className = \"\";\n  if (d.room) { o.innerHTML = \"<div class=ctx><b>\" + esc(d.room.name) + \"</b> · \" + esc(d.pl) + (d.time ? \" · \" + esc(d.time) : \"\") + \"<br>\" + (d.flex ? \"Flex groups here: \" : \"Classes here: \") + esc(d.room.classes.join(\", \") || \"none\") + \" (\" + d.room.classes.length + \")<br>Supervisor: <b>\" + esc(d.room.sup || \"not assigned\") + \"</b></div>\" + (d.room.sup ? \"<button class=b data-n=x data-k=unsup>Remove supervisor</button>\" : \"\") + sec(d.flex ? \"PICK A SUPERVISOR: NON-TEACHING STAFF\" : \"PICK A SUPERVISOR: FREE STAFF\", d.free, \"free\") + sec(\"FREE SUBS\", d.subs, \"sub\") + sec(d.flex ? \"TEACHERS (HAVE A FLEX GROUP)\" : \"ON PREP (ASKS TO CONFIRM)\", d.prep, \"prep\") + \"<h3>CHANGE</h3><button class=b data-n=x data-k=clear>Take \" + esc(d.out) + \"'s class out of \" + esc(d.room.name) + \"</button>\"; return; }\n  o.innerHTML = \"<div class=ctx><b>\" + esc(d.out) + \"</b> · \" + esc(d.pl) + (d.time ? \" · \" + esc(d.time) : \"\") + \"<br>\" + esc(d.what) + (d.cur ? \"<br>Now: <b>\" + esc(d.cur) + \"</b>\" : \"\") + \"</div>\" +\n    sec(d.flex ? \"NON-TEACHING STAFF\" : \"FREE STAFF (DUTY / ENGAGEMENT / SAP)\", d.free, \"free\") + sec(\"SUBS (GREEN = HERE TODAY)\", d.subs, \"sub\") + sec(d.flex ? \"TEACHERS (HAVE A FLEX GROUP · ASKS TO CONFIRM)\" : \"ON PREP (ASKS TO CONFIRM)\", d.prep, \"prep\") + sec(\"NO SUB: SEND CLASS TO A ROOM\", d.rooms || [], \"room\");\n}\ndocument.addEventListener(\"click\", function (e) {\n  var b = e.target.closest ? e.target.closest(\"button[data-n]\") : null; if (!b) return;\n  var n = b.getAttribute(\"data-n\"), k = b.getAttribute(\"data-k\");\n  if (k == \"prep\" && !confirm(FX ? n + \" has their own Flex group. Assign them anyway?\" : \"Pull \" + n + \" from prep to cover?\")) return;\n  if (k == \"clear\" && !confirm(\"Clear this cell so you can assign a coverer instead?\")) return;\n  b.disabled = true;\n  google.script.run.withSuccessHandler(function (d) { last = \"\"; draw(d); }).withFailureHandler(function (er) { b.disabled = false; alert(er.message); }).coverPick(n, k);\n});\nfunction poll() {\n  google.script.run.withSuccessHandler(function (d) { var s = JSON.stringify(d); if (s !== last) { last = s; draw(d); } setTimeout(poll, 1500); })\n    .withFailureHandler(function (er) { document.getElementById(\"out\").innerHTML = \"<span style=\\\"color:#c5221f\\\">Error: \" + esc(er.message) + \"</span>\"; setTimeout(poll, 3000); }).coverCtx();\n}\npoll();\n";
function openCoverSidebar() {
  var html = '<style>body{font:13px Arial,sans-serif;margin:0;padding:12px;color:#222}h3{font-size:11px;letter-spacing:1.5px;color:#008539;margin:16px 0 6px}.ctx{padding:10px;border-radius:8px;background:#e6f3eb;line-height:1.5}.b{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:8px 10px;margin:0 0 6px;border:1px solid #d9d9d9;border-radius:7px;background:#fff;cursor:pointer;font:13px Arial;text-align:left}.b:hover{border-color:#008539;background:#f3faf5}.b:disabled{opacity:.5}.n{font-weight:bold}.m{font-size:11px;color:#666}.warn{border-color:#f2c4c0}.here{border-color:#4cbb17;background:#e9f7e1}.here .n{color:#2e7d0f}.muted{color:#777}</style><div id="out" class="muted">Loading…</div><script>' + COVER_SIDEBAR_JS_ + '</scr' + 'ipt>';
  SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutput(html).setTitle('Find a coverer'));
}
function coverCtx() {
  var sh = SpreadsheetApp.getActiveSheet(); if (sh.getName() !== CFG.coverageTab) return { ok: false, msg: 'Open the Coverage tab and click a P1–P8 cell.' };
  var cell = sh.getActiveCell(), p1 = col_(sh, 'P1'), r = cell.getRow(), p = cell.getColumn() - p1 + 1;
  if (col_(sh, 'Flex') && cell.getColumn() === col_(sh, 'Flex')) p = FX_;
  if (!p1 || r < 2 || p < 1 || (p > 8 && p !== FX_)) return { ok: false, msg: 'Click a P1–P8 or Flex cell on a teacher\'s row.' };
  var dc = col_(sh, 'Date'), tc = col_(sh, 'Teacher out'), key = dk_(sh.getRange(r, dc).getValue()), out = s_(sh.getRange(r, tc).getValue());
  if (!key || !out) return { ok: false, msg: 'This row needs a Date and a Teacher out.' };
  if (p === FX_ && !isFlexDay_(key)) return { ok: false, msg: prettyDay_(key) + ' is not a Flex day. The Flex column is only used on Wednesday Flex Days.' };
  var staff = staff_(), bare = function (n) { return norm_(String(n).replace(/^(duty|ct):\s*/i, '').replace(/^(mr|mrs|ms|dr)\.?\s+/i, '')); };
  var absent = staff[bare(out)] || { per: [] }, job = p === FX_ ? 'Flex' : (absent.per || [])[p - 1] || '', jk = absent.per && p !== FX_ ? slot_(absent, p, '') : 'class';
  var rows = rowsOf_(CFG.coverageTab), busy = {}, outToday = {}, count = {}, mon = key.slice(0, 7);
  rows.forEach(function (x) { var k = dk_(x['Date']);
    if (k === key) { outToday[bare(x['Teacher out'])] = 1; var c = cv_(x, p); if (c) busy[bare(c)] = 1; }
    if (k && k.slice(0, 7) === mon) [1, 2, 3, 4, 5, 6, 7, 8, FX_].forEach(function (q) { var c2 = bare(cv_(x, q)); if (c2) count[c2] = (count[c2] || 0) + 1; }); });
  var rs = roomSup_(key); Object.keys(rs).forEach(function (rk) { var c3 = rs[rk].per[p - 1]; if (c3) busy[bare(c3)] = 1; });
  try { var rsh = SpreadsheetApp.getActive().getSheetByName(ROOM_SUP_TAB_);
    if (rsh) rsh.getDataRange().getValues().slice(1).forEach(function (x) { var k = dk_(x[0]); if (k && k.slice(0, 7) === mon) for (var q = 2; q < Math.min(x.length - 1, 11); q++) { var c4 = bare(x[q]); if (c4) count[c4] = (count[c4] || 0) + 1; } }); } catch (x) {}
  var free = [], prep = [];
  Object.keys(staff).forEach(function (k) { var s = staff[k]; if (/sub/.test(s.role) || outToday[k] || busy[k] || k === bare(out)) return;
    if (p === FX_) { var tch = /teacher/i.test(s.role || 'teacher'); (tch ? prep : free).push({ name: s.name, why: (tch ? 'Has a Flex group' : (s.role || 'Staff')) + (s.room ? ' · ' + s.room : ''), n: count[k] || 0 }); return; }   // Flex: non-teaching staff first; teachers have their own Flex group
    var kind = slot_(s, p, out), what = s.per[p - 1];
    if (kind === 'duty') free.push({ name: s.name, why: what + (s.room ? ' · ' + s.room : ''), n: count[k] || 0 });
    else if (kind === 'prep') prep.push({ name: s.name, why: 'Prep' + (s.room ? ' · ' + s.room : ''), n: count[k] || 0 }); });
  var sort = function (a, b) { return a.n - b.n || a.name.localeCompare(b.name); };
  // Every sub on the Subs tab. Kelly green = here today (full/half-day sub) and free this period. Subs placed today but busy this period are left out.
  var subs = [], seenSub = {}, placed = {};
  rows.forEach(function (x) { if (dk_(x['Date']) === key && s_(x['Full-day sub'])) placed[bare(x['Full-day sub'])] = 1; });
  try { subFree_(key).forEach(function (x) { var b = bare(x.sub); if (x.p === p && !busy[b] && !seenSub[b]) { seenSub[b] = 1; subs.push({ name: x.sub, why: 'Here today · free: ' + x.why, n: count[b] || 0, here: true }); } }); } catch (x) {}
  try { var sv = subsTab_().getDataRange().getValues();
    for (var si = 1; si < sv.length; si++) { var sn = s_(sv[si][0]), sb = bare(sn); if (!sn || seenSub[sb] || busy[sb] || placed[sb]) continue;
      seenSub[sb] = 1; subs.push({ name: sn, why: 'Not scheduled today' + (s_(sv[si][2]) ? ' · ' + s_(sv[si][2]) : ''), n: count[sb] || 0 }); } } catch (x) {}
  var cur = s_(cell.getValue()), room = null;
  if (isCoverRoom_(cur)) { var rk = roomKey_(cur), rec = rs[rk]; room = { name: rec ? rec.room : cur, sup: rec ? rec.per[p - 1] : '', classes: roomClasses_(key, p, rk) }; }
  return { ok: true, room: room, row: r, p: p, pl: plong_(p), flex: p === FX_, out: out, time: (function () { try { return todaysBells_(key).bells[bk_(p)] || ''; } catch (x) { return ''; } })(),
    what: jk === 'duty' ? 'Duty: ' + job : jk === 'prep' ? 'Prep (no coverage needed)' : jk === 'lunch' ? 'Lunch (no coverage)' : (job || 'Class'),
    cur: /^(prep|lunch|na)$/i.test(cur) || cur === job ? '' : cur, free: free.sort(sort).slice(0, 25), subs: subs, prep: prep.sort(sort).slice(0, 15), duty: jk === 'duty',
    rooms: COVER_ROOMS_.map(function (x) { return { name: x, why: 'Students report here · nobody is emailed', n: null }; }) };
}
function coverPick(name, kind) {
  var d = coverCtx(); if (!d.ok) return d;
  var sh = SpreadsheetApp.getActiveSheet(), cell = sh.getRange(d.row, pcol_(sh, d.p));
  if (kind === 'room') { cell.setValue(name); bumpHubCache_(); return coverCtx(); }
  if (kind === 'clear') { cell.clearContent(); bumpHubCache_(); return coverCtx(); }
  if (d.room) { setRoomSup_(dk_(sh.getRange(d.row, col_(sh, 'Date')).getValue()), d.room.name, d.p, kind === 'unsup' ? '' : name); bumpHubCache_(); return coverCtx(); }
  cell.setValue((d.duty ? 'Duty: ' : '') + name);
  if (d.flex) { try { labelRow_(sh, d.row); OUTAT_ = {}; availPanel_(sh); } catch (x) {} bumpHubCache_(); return coverCtx(); }
  if (kind === 'prep') cell.setNote('APPROVED: pull ' + name + ' from prep (P' + d.p + ') · ' + (Session.getActiveUser().getEmail() || 'office') + ' · ' + Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a'));
  try { checkSubPull_(sh, d.row, d.p, name); } catch (x) {}
  try { OUTAT_ = {}; availPanel_(sh); } catch (x) {}
  bumpHubCache_();
  return coverCtx();
}

/* Settings row "Hub banner": text for the green bar at the top of the hub. Blank = no bar. Time = last change (stamped by onEdit). */
function hubBanner_(ensure) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Settings'); if (!sh) return null;
  var v = sh.getDataRange().getValues(), row = -1;
  for (var i = 1; i < v.length; i++) if (norm_(v[i][0]) === 'hub banner') { row = i; break; }
  if (row < 0) { if (!ensure) return null; sh.appendRow(['Hub banner', '']); sh.getRange(sh.getLastRow(), 1).setNote('Optional. Text here shows in a green bar at the top of the hub for all staff. Leave blank to hide the bar.'); return null; }
  var text = String(v[row][1] || '').trim(); if (!text) return null;
  var stamp = PropertiesService.getScriptProperties().getProperty('bannerAt');
  return { text: text, at: stamp ? Utilities.formatDate(new Date(+stamp), tz_(), 'h:mm a') : '' };
}

/* ---------- Hub banners: top of the Announcements tab ----------
   Row 3 = green banner (signed-in staff), row 4 = emergency alert (everyone, incl. the welcome page).
   B On · C Type · D Message · F Ends (optional) · G Email staff · H Status. The posts table header is row 7. */
var ANN_ = { hdr: 7, green: 3, red: 4, on: 2, type: 3, msg: 4, end: 6, mail: 7, stat: 8 };
var ANN_TYPES_ = ['Lockdown', 'Shelter in place', 'Evacuation', 'Weather', 'Drill', 'General notice'];
function annTop_(rules) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('Announcements'); if (!sh) return;
  // repair: an earlier version could add the block twice. Keep the lower copy (it holds the real settings), drop the empty one above it.
  // Finds the posts header (Date | Show until), keeps ONE banner block above it (the one with a message, else the lowest),
  // deletes every other row above, and leaves exactly 2 rows between block and header. Works however many copies exist.
  var A = sh.getRange(1, 1, Math.max(Math.min(sh.getLastRow(), 300), 1), 4).getValues(), H = 0, K = 0, KM = 0;
  for (var i = 0; i < A.length; i++) if (String(A[i][0]).trim() === 'Date' && String(A[i][1]).trim() === 'Show until') { H = i + 1; break; }
  if (!H) return;   // no posts header found: leave the tab alone
  for (var j = 0; j < H - 1; j++) if (/^HUB BANNERS/.test(String(A[j][0]))) { K = j + 1; if ((A[j + 2] && s_(A[j + 2][3])) || (A[j + 3] && s_(A[j + 3][3]))) KM = j + 1; }
  K = KM || K;
  sh.setFrozenRows(0);
  if (H > 1) sh.getRange(1, 1, H - 1, sh.getMaxColumns()).breakApart();
  if (!K) { if (H > 1) sh.deleteRows(1, H - 1); sh.insertRowsBefore(1, ANN_.hdr - 1); }
  else {
    if (K > 1) { sh.deleteRows(1, K - 1); H -= K - 1; }
    if (H > ANN_.hdr) sh.deleteRows(5, H - ANN_.hdr);
    else if (H < ANN_.hdr) sh.insertRowsAfter(4, ANN_.hdr - H);
  }
  HDR_ = {};
  sh.getRange(1, 1, ANN_.hdr - 1, sh.getMaxColumns()).breakApart().clearFormat();
  var top = sh.getRange(1, 1, ANN_.hdr - 1, 8), SOLID = SpreadsheetApp.BorderStyle.SOLID;
  top.breakApart(); top.clearFormat().clearDataValidations().setFontFamily(FMT.font).setFontSize(10).setFontColor(FMT.ink).setVerticalAlignment('middle');
  sh.getRange(1, 1, 1, 8).merge().setValue('HUB BANNERS · Check On to show it on the Staff Hub. Uncheck to take it down.')
    .setBackground(FMT.green).setFontColor('#ffffff').setFontWeight('bold').setFontSize(11);
  sh.getRange(2, 1, 1, 8).setValues([['Banner', 'On', 'Type', 'Message', '', 'Ends (optional)', 'Email staff', 'Status']]).setFontWeight('bold').setFontColor(FMT.gray).setBackground(FMT.band);
  [2, 3, 4].forEach(function (r) { sh.getRange(r, ANN_.msg, 1, 2).merge(); });
  sh.getRange(ANN_.green, 1).setValue('Green banner'); sh.getRange(ANN_.red, 1).setValue('Emergency alert');
  sh.getRange(ANN_.green, 1, 1, 8).setBackground('#e6f3eb'); sh.getRange(ANN_.green, 1).setFontColor(FMT.green).setFontWeight('bold');
  sh.getRange(ANN_.red, 1, 1, 8).setBackground('#fce8e6'); sh.getRange(ANN_.red, 1).setFontColor('#c5221f').setFontWeight('bold');
  sh.getRange(ANN_.green, ANN_.type).setValue('Staff only').setFontColor(FMT.gray).setFontStyle('italic');
  var ty = sh.getRange(ANN_.red, ANN_.type); if (!s_(ty.getValue())) ty.setValue('General notice');
  ty.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ANN_TYPES_, true).setAllowInvalid(false).build()).setFontWeight('bold');
  checkboxes_(sh.getRange(ANN_.green, ANN_.on, 2, 1)); checkboxes_(sh.getRange(ANN_.green, ANN_.mail, 2, 1));
  sh.getRange(ANN_.green, ANN_.msg, 2, 2).setWrap(true).setFontSize(11);
  sh.getRange(ANN_.green, ANN_.end, 2, 1).setNumberFormat('ddd m/d h:mm am/pm').setHorizontalAlignment('center')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(true)
      .setHelpText('Double-click to pick a day, then add the time after it, e.g. 10/23 2:30 PM. A time alone (2:30 PM) means today.').build());
  sh.getRange(2, ANN_.end).setNote('Optional. Type a time (2:30 PM) for today, or a date and time (10/23 2:30 PM). The banner turns itself off then. Blank = stays up until you uncheck On.');
  sh.getRange(2, ANN_.mail).setNote('Check to email every staff member on the Staff tab right away. A confirmation pops up, the box unchecks itself, and Status shows how many were sent.');
  sh.getRange(2, ANN_.on).setNote('Green banner: shows at the top of the hub for signed-in staff.\nEmergency alert: red bar for everyone, including the sign-in page. The hub checks for changes every 30 seconds.');
  sh.getRange(ANN_.green, ANN_.stat, 2, 1).setFontColor(FMT.gray).setFontStyle('italic').setWrap(true);
  sh.getRange(1, 1, 4, 8).setBorder(true, true, true, true, true, true, FMT.line, SOLID).setBorder(true, true, true, true, null, null, FMT.green, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange(ANN_.hdr - 1, 1, 1, 8).merge().setValue('ANNOUNCEMENTS · One row per post. "Show until" keeps a post up for several days.')
    .setFontWeight('bold').setFontColor(FMT.green).setVerticalAlignment('bottom');
  sh.setRowHeight(1, 30); sh.setRowHeight(2, 24); sh.setRowHeight(3, 44); sh.setRowHeight(4, 44); sh.setRowHeight(5, 12); sh.setRowHeight(6, 28);
  var st = ss.getSheetByName('Settings');   // old Settings "Hub banner" row moves here
  if (st) { var sv = st.getDataRange().getValues(); for (var i = sv.length - 1; i >= 1; i--) if (norm_(sv[i][0]) === 'hub banner') {
    var t = s_(sv[i][1]), m = sh.getRange(ANN_.green, ANN_.msg);
    if (t && !s_(m.getValue())) { m.setValue(t); sh.getRange(ANN_.green, ANN_.on).setValue(true); sh.getRange(ANN_.green, ANN_.stat).setValue('Moved from Settings tab'); }
    st.deleteRow(i + 1); } }
  if (rules) {
    var cf = function (f, row, bg, fg) { var b = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(f).setBackground(bg).setRanges([sh.getRange(row, 1, 1, 8)]); if (fg) b.setFontColor(fg).setBold(true); return b.build(); };
    sh.setConditionalFormatRules(sh.getConditionalFormatRules().concat([cf('=$B$3=TRUE', ANN_.green, '#cdebd7'), cf('=$B$4=TRUE', ANN_.red, '#f4c7c3', '#a50e0e')]));
  }
}
/* Ends cell → ms. A time alone means today at that time. */
function endTime_(x) {
  if (Object.prototype.toString.call(x) === '[object Date]' && !isNaN(x)) {
    if (x.getFullYear() > 1950) return x.getTime();
    var d = new Date(); d.setHours(x.getHours(), x.getMinutes(), 0, 0); return d.getTime();
  }
  var m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(String(x || '')); if (!m) return null;
  var h = +m[1]; if (/pm/i.test(m[3] || '') && h < 12) h += 12; if (/am/i.test(m[3] || '') && h === 12) h = 0;
  var t = new Date(); t.setHours(h, +m[2], 0, 0); return t.getTime();
}
function annBannersRead_() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Announcements');
  if (!sh || hdr_(sh) !== ANN_.hdr) { var lg = hubBanner_(); return { green: lg ? { on: true, text: lg.text, at: lg.at, type: '', until: '' } : null, alert: null }; }
  var v = sh.getRange(ANN_.green, 1, 2, 8).getValues(), P = PropertiesService.getScriptProperties(), now = Date.now();
  var one = function (r, row, key) {
    var end = endTime_(r[ANN_.end - 1]), on = yes_(r[ANN_.on - 1]), at = P.getProperty('ban_' + key);
    if (on && end && now >= end) {   // end time passed: switch it off on the sheet too
      try { sh.getRange(row, ANN_.on).setValue(false); sh.getRange(row, ANN_.stat).setValue('Ended ' + Utilities.formatDate(new Date(end), tz_(), 'M/d h:mm a') + ' (end time)'); } catch (x) {}
      on = false;
    }
    var today = end && Utilities.formatDate(new Date(end), tz_(), 'yyyyMMdd') === Utilities.formatDate(new Date(), tz_(), 'yyyyMMdd');
    return { on: on, type: s_(r[ANN_.type - 1]), text: s_(r[ANN_.msg - 1]), end: end,
      until: end ? Utilities.formatDate(new Date(end), tz_(), today ? 'h:mm a' : 'EEE M/d h:mm a') : '', at: at ? Utilities.formatDate(new Date(+at), tz_(), 'h:mm a') : '' };
  };
  return { green: one(v[0], ANN_.green, 'green'), alert: one(v[1], ANN_.red, 'alert') };
}
/* Read at most once a minute (any Sheet edit clears it). End times are checked on every request. */
function annBanners_() {
  var c = CacheService.getScriptCache(), ck = 'ban_' + (c.get('hubver') || '0'), raw = null;
  try { raw = JSON.parse(c.get(ck) || 'null'); } catch (x) {}
  if (!raw) { raw = annBannersRead_(); try { c.put(ck, JSON.stringify(raw), 60); } catch (x) {} }
  var now = Date.now(), live = function (b) { return b && b.on && b.text && (!b.end || now < b.end) ? b : null; };
  return { green: live(raw.green), alert: live(raw.alert) };
}
function pubBanner_(b) { return { type: b.type, text: b.text, at: b.at, until: b.until }; }
/* Simple onEdit part: stamps the time and Status when a banner is turned on/off or its message changes. */
function annEdit_(e) {
  var sh = e.range.getSheet(); if (sh.getName() !== 'Announcements' || hdr_(sh) !== ANN_.hdr || e.range.getNumRows() > 1) return;
  var r = e.range.getRow(), c = e.range.getColumn(); if ((r !== ANN_.green && r !== ANN_.red) || c === ANN_.mail || c === ANN_.stat) return;
  var key = r === ANN_.green ? 'green' : 'alert', v = sh.getRange(r, 1, 1, 8).getValues()[0], on = yes_(v[ANN_.on - 1]), t = Utilities.formatDate(new Date(), tz_(), 'M/d h:mm a');
  if (on && (c === ANN_.on || c === ANN_.msg || c === ANN_.type)) PropertiesService.getScriptProperties().setProperty('ban_' + key, String(Date.now()));
  if (c === ANN_.on || c === ANN_.msg || c === ANN_.end) sh.getRange(r, ANN_.stat).setValue(on ? (s_(v[ANN_.msg - 1]) ? 'On since ' + t : 'On, but add a message in column D') : 'Off since ' + t);
}
/* Installable edit trigger (simple onEdit cannot send email). Created by Format sheet. */
function bannerTrigger_() {
  if (ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onBannerEmail'; })) return;
  ScriptApp.newTrigger('onBannerEmail').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
}
function tell_(title, msg) {
  try { SpreadsheetApp.getActive().toast(msg, title, 15); } catch (x) {}
  try { var u = SpreadsheetApp.getUi(); u.alert(title, msg, u.ButtonSet.OK); } catch (x) {}
}
function onBannerEmail(e) {
  if (!e || !e.range || e.range.getNumRows() > 1) return;
  var sh = e.range.getSheet(), r = e.range.getRow();
  if (sh.getName() !== 'Announcements' || hdr_(sh) !== ANN_.hdr || e.range.getColumn() !== ANN_.mail || (r !== ANN_.green && r !== ANN_.red) || !yes_(e.value)) return;
  var box = sh.getRange(r, ANN_.mail), st = sh.getRange(r, ANN_.stat), red = r === ANN_.red, v = sh.getRange(r, 1, 1, 8).getValues()[0];
  var text = s_(v[ANN_.msg - 1]), type = red ? (s_(v[ANN_.type - 1]) || 'General notice') : 'Staff Hub notice';
  box.setValue(false);
  if (!text) { st.setValue('Not emailed: add a message first'); return tell_('Email not sent', 'Type the message in column D first, then check Email staff again.'); }
  var seen = {}, to = [];
  try { var S = staff_(); Object.keys(S).forEach(function (k) { var m = norm_(S[k].email); if (/@/.test(m) && !seen[m]) { seen[m] = 1; to.push(m); } }); } catch (x) {}
  CFG.officeEmails.forEach(function (m) { m = norm_(m); if (m && !seen[m]) { seen[m] = 1; to.push(m); } });
  if (!to.length) { st.setValue('Not emailed: no emails on the Staff tab'); return tell_('Email not sent', 'No staff emails were found on the Staff tab.'); }
  var left = 0; try { left = MailApp.getRemainingDailyQuota(); } catch (x) {}
  if (left < to.length) { st.setValue('Not emailed: daily email limit'); return tell_('Email not sent', 'Google allows ' + left + ' more emails from this script today and this needs ' + to.length + '. Email staff from Gmail instead.'); }
  var col = red ? '#c5221f' : CFG.green, t = Utilities.formatDate(new Date(), tz_(), 'h:mm a'), esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var html = '<div style="font-family:Lato,Arial,sans-serif;max-width:560px;color:#1d1d1d">' +
    '<div style="background:' + col + ';color:#ffffff;padding:18px 20px;border-radius:10px"><div style="font-size:12px;font-weight:900;letter-spacing:1.5px">' + esc(type.toUpperCase()) + '</div>' +
    '<div style="font-size:18px;font-weight:700;line-height:1.4;margin-top:6px">' + esc(text) + '</div></div>' +
    '<p style="font-size:13px;color:#444546">Sent ' + t + ' by ' + CFG.officeName + '. Updates appear on the Staff Hub.</p>' +
    '<p><a href="' + CFG.hubUrl + '" style="display:inline-block;padding:10px 16px;background:' + col + ';color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">Open Staff Hub</a></p></div>';
  var me = Session.getEffectiveUser().getEmail(), sent = 0, errs = [];
  for (var i = 0; i < to.length; i += 45) {
    var part = to.slice(i, i + 45);
    try { MailApp.sendEmail({ to: me, bcc: part.join(','), subject: (red ? type.toUpperCase() + ': ' : 'Staff Hub: ') + text.slice(0, 90), name: CFG.officeName, htmlBody: html }); sent += part.length; }
    catch (x) { errs.push(x.message); }
  }
  st.setValue(sent ? 'Emailed ' + sent + ' staff at ' + t + (errs.length ? ' (some failed)' : '') : 'Email failed: ' + errs[0]);
  tell_(sent ? 'Email sent' : 'Email failed', sent ? (red ? type : 'Green banner') + ' emailed to ' + sent + ' staff at ' + t + '.' + (errs.length ? '\n\nSome could not be sent: ' + errs[0] : '') : 'Nothing was sent: ' + errs[0]);
}
/* Chill Room tab → hub card: coordinator, extension, announcement, room, and the week's days from today on. */
function chillData_(key) {
  var sh = SpreadsheetApp.getActive().getSheetByName('Chill Room'); if (!sh || String(sh.getRange('A1').getValue()) === 'Date') return null;
  var top = sh.getRange('B1:B5').getValues(), until = dk_(top[3][0]), showAnn = !until || key <= until;
  var out = { by: s_(top[0][0]), ext: s_(top[1][0]), room: String(sh.getRange('A5').getValue()).trim() === 'Room' ? s_(top[4][0]) : '',
    ann: showAnn ? s_(top[2][0]) : '', annL: showAnn ? segs_(sh.getRange('B3').getRichTextValue()) : null, days: [] };
  if (sh.getLastRow() >= 8) { var dr = sh.getRange(8, 1, sh.getLastRow() - 7, 3), drt = dr.getRichTextValues(); dr.getValues().forEach(function (r, i) {
    var k = dk_(r[0]); if (!k || k < key || !s_(r[1])) return;
    out.days.push([k, Utilities.formatDate(new Date(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10), 12), tz_(), 'EEEE M/d'), s_(r[1]), s_(r[2]), segs_(drt[i][2])]);
  }); }
  out.days.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); out.days = out.days.slice(0, 7);
  return out;
}

/* Coverage confirmations for a date: everyone emailed (Email Log, non-error) and whether they clicked Got it. */
function confirmations_(key) {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.logTab); if (!sh || sh.getLastRow() < 2) return { sent: 0, ok: 0, waiting: [], done: [] };
  var staff = {}; try { var st = staff_(); Object.keys(st).forEach(function (k) { if (st[k].email) staff[norm_(st[k].email)] = st[k].name; }); } catch (x) {}
  var v = sh.getDataRange().getValues(), by = {};
  for (var i = 1; i < v.length; i++) {
    if (dayKey_(v[i][0]) !== key || v[i][4] === 'error' || v[i][4] === 'cancel') continue;
    var e = norm_(v[i][1]); if (!e) continue;
    var o = by[e] || (by[e] = { name: staff[e] || v[i][1], sentAt: v[i][3], at: '' });
    o.sentAt = v[i][3]; if (v[i][5]) o.at = String(v[i][5]);
  }
  var list = Object.keys(by).map(function (k) { return by[k]; }), fmt = function (d) { try { return Utilities.formatDate(new Date(d), tz_(), 'h:mm a'); } catch (x) { return ''; } };
  var done = list.filter(function (x) { return x.at; }).map(function (x) { return [x.name, x.at.replace(/^\d+\/\d+\s*/, '')]; }).sort();
  var waiting = list.filter(function (x) { return !x.at; }).map(function (x) { return [x.name, fmt(x.sentAt)]; }).sort();
  return { sent: list.length, ok: done.length, waiting: waiting, done: done };
}

// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* raid-fx.js (v28.0) — shared boss-raid pieces for raid.html (projector) and raid-play.html (students):
   boss card markup, taunt lines and the moment tracker (phase change, weak point, enrage, win / loss). */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function guide() {
    var c = window.CTF_COURSE, g = ((((window.COURSE_CONFIG || {})[c] || {}).ctf) || {});
    return { name: g.adversary || "NEMESIS", color: g.adversaryColor || "#ff3b3b", mentor: !!(g.mentor || g.tone === "mentor") };
  }
  var TAUNT = {
    start: ["{g} has breached the network. Bring it down!", "{g} is online. Every right answer is a hit."],
    p2: ["{g}: You scratched me. Now I speed up.", "{g} adapts. Terms come faster now."],
    p3: ["{g}: Decrypt THIS.", "{g} is desperate. Decrypt only, and the clock is short."],
    weak: ["{g}'s core is exposed! 3\u00d7 damage for 15 seconds!", "Weak point open! Hit it NOW!"],
    enrage: ["{g} is ENRAGED! Double damage both ways!", "Last minute! {g} hits twice as hard. So do you."],
    miss: ["{g}: Wrong. Your shield cracks.", "{g} laughs. Shield damaged.", "{g}: Sloppy. Keep guessing."],
    idle: ["{g}: Is that all you've got?", "{g}: Your class types like it's dial-up.", "{g}: I've seen stronger passwords on sticky notes.", "{g}: Tick tock."],
    win: ["{g} is DOWN! The network is safe!", "Boss defeated! {g} goes offline."],
    lose: ["{g} wins this round. The network falls.", "Shield gone. {g} takes the server."]
  };
  function line(k) { var a = TAUNT[k], g = guide(); return a[Math.floor(Math.random() * a.length)].replace(/\{g\}/g, g.name); }
  function bossCard(r, o) {
    o = o || {}; var g = guide(), FX = window.BATTLE_FX, pct = Math.round(r.hp / Math.max(1, r.hp_max) * 100);
    var badges = (r.weak ? '<span class="mono bfxPulse" style="font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;background:#ffcf5c;color:#1a1200;">\u2316 WEAK POINT \u00b7 3\u00d7</span>' : '') +
      (r.enraged ? '<span class="mono bfxPulse" style="font-size:12px;font-weight:800;padding:5px 11px;border-radius:999px;background:#ff3b3b;color:#fff;">\u2620 ENRAGED \u00b7 2\u00d7</span>' : '');
    var big = o.big;
    return '<div class="card" id="rbCard" style="border:2px solid ' + g.color + ';box-shadow:0 0 40px -14px ' + g.color + ';padding:' + (big ? "28px 30px" : "20px 22px") + ';">' +
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:14px;">' +
        '<span aria-hidden="true" style="font-size:' + (big ? 54 : 36) + 'px;line-height:1;color:' + g.color + ';">' + (g.mentor ? "\u25c6" : "\u2620") + '</span>' +
        '<div style="flex:1;min-width:200px;"><div class="mono" style="font-size:12px;letter-spacing:2px;color:' + g.color + ';font-weight:800;">BOSS RAID \u00b7 PHASE ' + r.phase + ' / 3</div>' +
          '<div style="font-size:' + (big ? 40 : 28) + 'px;font-weight:800;color:var(--bright);line-height:1.1;">' + esc(g.name) + '</div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + badges + '</div>' +
        '<div style="text-align:right;"><div class="mono" style="font-size:10px;letter-spacing:1.5px;color:var(--faint);">TIME LEFT</div><div class="mono" id="rbClock" style="font-size:' + (big ? 48 : 32) + 'px;font-weight:800;color:var(--bright);line-height:1.05;"></div></div></div>' +
      '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;"><span class="mono" style="font-size:12px;color:var(--muted);">BOSS HP</span><span class="mono" style="font-size:' + (big ? 20 : 15) + 'px;font-weight:800;color:var(--bright);">' + r.hp + ' / ' + r.hp_max + '</span></div>' +
      (FX ? FX.bossBar("rbHp", pct, g.color, g.name + " health") : '') +
      '<div style="display:flex;justify-content:space-between;gap:8px;margin:14px 0 6px;"><span class="mono" style="font-size:12px;color:var(--muted);">CLASS SHIELD</span><span class="mono" style="font-size:15px;font-weight:800;color:var(--bright);">' + r.shield + '%</span></div>' +
      '<div role="meter" aria-label="Class shield" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + r.shield + '" style="height:14px;border-radius:999px;background:var(--bg);border:1px solid var(--border3);overflow:hidden;"><div id="rbShield" style="height:100%;width:' + r.shield + '%;background:' + (r.shield <= 25 ? "#ff3b3b" : "#00b3ff") + ';transition:width .5s ease;"></div></div>' +
      '<div class="mono" style="font-size:12px;color:var(--dim);margin-top:12px;">' + r.players + ' raiders online \u00b7 hit 10 \u00b7 miss = 4 shield' + (r.phase === 1 ? " \u00b7 45 s per term" : r.phase === 2 ? " \u00b7 30 s per term" : " \u00b7 decrypt only \u00b7 20 s per term") + '</div></div>';
  }
  var P = {};
  function track(r, o) {
    var FX = window.BATTLE_FX; if (!FX || !r) return; o = o || {};
    var p = P[r.id], g = guide();
    if (!p) { P[r.id] = { phase: r.phase, weak: r.weak, enraged: r.enraged, status: r.status, hp: r.hp, shield: r.shield, seen: (r.feed && r.feed[0] && r.feed[0].at) || "", t: Date.now() };
      if (r.status === "live" && Date.now() - new Date(r.started_at).getTime() < 15000) { FX.banner(g.name + " APPEARS!", g.color, "Answer your puzzle to hit the boss"); FX.caster(line("start"), g.color); FX.sfx("horn"); }
      return; }
    if (r.status === "live") {
      if (r.phase > p.phase) { FX.banner("PHASE " + r.phase + "!", g.color, r.phase === 3 ? "Decrypt only \u00b7 20 seconds per term" : "Terms come faster \u00b7 30 seconds"); FX.caster(line(r.phase === 3 ? "p3" : "p2"), g.color); FX.sfx("lead"); FX.shake(document.getElementById("rbCard")); }
      if (r.weak && !p.weak) { FX.banner("WEAK POINT EXPOSED!", "#ffcf5c", "3\u00d7 damage for 15 seconds"); FX.caster(line("weak"), "#ffcf5c"); FX.sfx("dbl"); }
      if (r.enraged && !p.enraged) { FX.banner(g.name + " IS ENRAGED!", "#ff3b3b", "Double damage both ways"); FX.caster(line("enrage"), "#ff3b3b"); FX.sfx("horn"); }
      if (r.hp < p.hp) { var el = document.getElementById("rbHpB"); if (el) { FX.shake(el); if (o.dmgPop) FX.damage(el, "-" + (p.hp - r.hp), "#ffcf5c"); } }
      if (r.shield < p.shield) { FX.shake(document.getElementById("rbShield")); if (Math.random() < .4) FX.caster(line("miss"), g.color); }
      if (Date.now() - p.t > 22000) { p.t = Date.now(); FX.caster(line("idle"), g.color); }
      if (o.feed) (r.feed || []).slice().reverse().forEach(function (f) { if (f.at > p.seen && f.kind === "hit" && f.weak) FX.caster(f.who + " hits the weak point for " + f.amount + "!", "#ffcf5c"); });
    }
    if (p.status === "live" && r.status !== "live") {
      if (r.status === "won") { FX.banner("BOSS DEFEATED!", "#3ddc97", line("win"), 3600); FX.confetti(); FX.sfx("horn"); }
      else if (r.status === "lost") { FX.banner("RAID FAILED", "#ff3b3b", line("lose"), 3600); FX.sfx("ko"); }
    }
    p.phase = r.phase; p.weak = r.weak; p.enraged = r.enraged; p.status = r.status; p.hp = r.hp; p.shield = r.shield;
    if (r.feed && r.feed[0]) p.seen = r.feed[0].at;
  }
  function board(r, me) {
    var T = r.top || [];
    return '<div class="card"><div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:10px;">TOP DAMAGE</div>' +
      (T.length ? T.map(function (t, i) { return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-top:' + (i ? "1px solid var(--border2)" : "0") + ';' + (t.id === me ? "color:var(--accent);" : "") + '">' +
        '<span class="mono" style="width:24px;color:var(--faint);">' + (i + 1) + '</span><b style="flex:1;min-width:0;color:' + (t.id === me ? "var(--accent)" : "var(--bright)") + ';overflow-wrap:anywhere;">' + esc(t.handle) + (t.mvp ? ' <span class="mono" style="font-size:10px;color:#ffcf5c;">\u2605 MVP</span>' : '') + '</b>' +
        '<span class="mono" style="font-weight:800;color:var(--bright);">' + t.dmg + '</span></div>'; }).join("") : '<div style="font-size:13px;color:var(--dim);">No hits yet.</div>') + '</div>';
  }
  function feed(r) {
    var F = r.feed || [];
    return '<div class="card"><div class="mono" style="font-size:11px;letter-spacing:1.5px;color:var(--faint);margin-bottom:10px;">LIVE FEED</div>' +
      (F.length ? F.map(function (f) { return '<div class="mono" style="font-size:13px;padding:4px 0;color:' + (f.kind === "hit" ? (f.weak ? "#ffcf5c" : "var(--bright)") : "var(--bad)") + ';">' +
        (f.kind === "hit" ? "\u2694 " + esc(f.who) + " hits for " + f.amount + (f.weak ? " \u2316 WEAK POINT" : "") : "\u2716 " + esc(f.who) + " missed \u00b7 shield -" + f.amount) + '</div>'; }).join("") : '<div style="font-size:13px;color:var(--dim);">Waiting for the first hit\u2026</div>') + '</div>';
  }
  window.RAID_FX = { bossCard: bossCard, track: track, board: board, feed: feed, guide: guide, esc: esc };
})();

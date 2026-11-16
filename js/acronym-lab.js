// © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
/* ACRONYM LAB engine (cyber1/acronyms.html, cyber2/acronyms.html).
   Page sets window.ACRO_LAB = {modules, items} before loading this.
   Modes: SCRAMBLE (each word's letters shuffled) and DECRYPT (letters leak over time).
   Graded by TEXT: lowercase alphanumerics, "and"/"&" ignored, any listed alt accepted. */
(function(){
  const CFG = window.ACRO_LAB, MODULES = CFG.modules, ITEMS = CFG.items;
  const $ = s => document.querySelector(s);
  const panel = $("#panel");
  const mods = [...new Set(ITEMS.map(v=>v.m))].sort((a,b)=>a-b);
  let selected = new Set(mods), mode = "scramble", timers = [];
  const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const norm = s => (" "+String(s).toLowerCase().replace(/&/g," and ")+" ").replace(/[^a-z0-9]+/g," ").replace(/ and /g," ").replace(/ and /g," ").replace(/\s+/g,"");
  const isRight = (val, v) => norm(val).length && [v.x].concat(v.alt||[]).some(x => norm(x)===norm(val));
  const pool = () => ITEMS.filter(v => selected.has(v.m));
  const stop = () => { timers.forEach(clearInterval); timers=[]; };
  const pad = n => String(n).padStart(2,"0");

  function renderChips(){
    const allOn = selected.size === mods.length;
    let h = `<div class="chip all ${allOn?'on':''}" data-all="1">ALL UNITS</div><div class="modgrid">`;
    mods.forEach(n => { h += `<div class="chip ${selected.has(n)?'on':''}" data-m="${n}">${n}. ${esc(MODULES[n]||"")}</div>`; });
    $("#chips").innerHTML = h + `</div>`;
    $("#count").textContent = `// ${pool().length} acronyms across ${selected.size} unit${selected.size===1?'':'s'} selected`;
  }
  $("#chips").addEventListener("click", e => {
    const el = e.target.closest(".chip"); if(!el) return;
    if(el.dataset.all) selected = selected.size===mods.length ? new Set() : new Set(mods);
    else { const m=+el.dataset.m; selected.has(m)?selected.delete(m):selected.add(m); }
    renderChips(); render();
  });
  $("#tabs").addEventListener("click", e => {
    const t = e.target.closest(".tab"); if(!t) return;
    mode = t.dataset.mode;
    document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on", x===t));
    render();
  });

  /* ---- shared round shell ---- */
  let Q=[], R=0, score=0, streak=0, best=0, done=false, cur=null;
  function shell(hint, extraBtn){
    panel.innerHTML = `
    <div class="card">
      <div class="g-top">
        <div class="g-stat">ROUND<b id="gRound">1 / ${Q.length}</b></div>
        <div class="g-stat">SCORE<b id="gScore">0</b></div>
        <div class="g-stat amber">STREAK<b id="gStreak">0</b></div>
      </div>
      <div class="timerbar"><div class="timerfill" id="gFill" style="width:100%"></div></div>
      <div class="ac-mod mono" id="gMod"></div>
      <div class="ac-big mono" id="gAcr"></div>
      <div class="g-boxes" id="gBoxes"></div>
      <div class="g-in">
        <input id="gInput" placeholder="type what it stands for…" autocomplete="off" spellcheck="false" aria-label="What the acronym stands for">
        <button class="btn primary" id="gSubmit">enter</button>
        ${extraBtn||""}
        <button class="btn" id="gSkip">skip</button>
      </div>
      <div class="g-msg mono" id="gMsg">${hint}</div>
    </div>`;
    $("#gSubmit").onclick = check;
    $("#gInput").addEventListener("keydown", e=>{ if(e.key==="Enter") check(); });
    $("#gSkip").onclick = () => end(false);
  }
  function setRound(){
    cur = Q[R]; done = false;
    $("#gRound").textContent = (R+1)+" / "+Q.length;
    $("#gMod").textContent = "UNIT "+pad(cur.m)+" · "+(MODULES[cur.m]||"");
    $("#gAcr").textContent = cur.a;
    const inp=$("#gInput"); inp.value=""; inp.disabled=false; inp.focus();
  }
  function msg(h, col){ const m=$("#gMsg"); m.innerHTML=h; m.style.color=col||"var(--dim)"; }
  function check(){
    if(done) return;
    if(isRight($("#gInput").value, cur)) end(true);
    else { msg("&gt; access denied — try again", "#ff7b7b"); $("#gInput").select(); }
  }
  function end(ok){
    stop(); done = true; $("#gInput").disabled = true;
    if(ok){
      const pts = MODE.points();
      score += pts; streak++; best = Math.max(best, streak);
      msg(`&gt; ACCESS GRANTED — +${pts} pts · ${esc(cur.a)} = <b style="color:var(--bright);">${esc(cur.x)}</b>`, "var(--accent)");
    } else {
      streak = 0;
      msg(`&gt; skipped — ${esc(cur.a)} stands for "<b style="color:var(--bright);">${esc(cur.x)}</b>"`);
    }
    MODE.reveal();
    $("#gScore").textContent = score; $("#gStreak").textContent = streak;
    setTimeout(()=>{ if(!document.getElementById("gAcr")) return; R++; R>=Q.length ? over() : MODE.next(); }, ok?1600:2400);
  }
  function over(){
    stop();
    const max = Q.length*100;
    panel.querySelector(".card").innerHTML = `
    <div class="g-summary">
      <div class="mono" style="color:var(--accent);font-size:12px;letter-spacing:2px;">// SESSION COMPLETE</div>
      <div class="big mono">${score}</div>
      <div style="color:var(--dim);font-size:14px;margin-bottom:6px;">out of ${max} possible · best streak ${best}</div>
      <div style="color:var(--muted);font-size:15px;margin-bottom:22px;">${score>=max*0.8?"Elite. Every acronym cracked.":score>=max*0.5?"Solid work, keep drilling.":"Run it again — repetition is the exploit."}</div>
      <button class="btn primary" id="again">play again</button>
    </div>`;
    $("#again").onclick = render;
  }
  function start(){ Q = shuffle(pool()).slice(0, Math.min(10, pool().length)); R=0; score=0; streak=0; }

  /* ---- boxes (DECRYPT) / tiles (SCRAMBLE) ---- */
  const isAl = c => /[a-z0-9]/i.test(c);
  function boxes(chars, rev){
    let h="";
    chars.forEach((c,i)=>{
      if(isAl(c)) h += `<div class="lb ${rev[i]?'rev':''}">${rev[i]?esc(c):""}</div>`;
      else if(c===" ") h += `<div class="sep"></div>`;
      else h += `<div class="lb" style="border-color:var(--border2);color:var(--faint);">${esc(c)}</div>`;
    });
    $("#gBoxes").innerHTML = h;
  }

  /* SCRAMBLE: letters of each word shuffled; HINT unscrambles one word (-25). */
  let words=[], solved=[], hints=0;
  function scrWord(w){
    const letters = [...w].filter(isAl);
    if(letters.length<2) return w;
    let s, tries=0;
    do { s = shuffle(letters); tries++; } while(s.join("").toLowerCase()===letters.join("").toLowerCase() && tries<12);
    let k=0; return [...w].map(c => isAl(c) ? s[k++] : c).join("");
  }
  function drawTiles(){
    $("#gBoxes").innerHTML = words.map((w,i)=>`<div class="ac-word ${solved[i]?'rev':''}">${[...(solved[i]?w.real:w.mix)].map(c=>`<span>${esc(c.toUpperCase())}</span>`).join("")}</div>`).join("");
  }
  const SCR = {
    hint: "&gt; unscramble each word, then type the full phrase",
    btn: `<button class="btn" id="gHint">hint −25</button>`,
    next(){
      setRound(); hints=0;
      words = cur.x.split(/\s+/).map(w=>({real:w, mix:scrWord(w)}));
      solved = words.map(w=>w.real===w.mix || [...w.real].filter(isAl).length<2);
      drawTiles(); msg(SCR.hint);
      $("#gFill").style.width = "100%"; $("#gFill").style.background = "var(--accent)";
      const h=$("#gHint"); if(h){ h.disabled=false; h.onclick = SCR.useHint; }
    },
    useHint(){
      if(done) return;
      const left = solved.map((s,i)=>s?null:i).filter(i=>i!==null);
      if(!left.length) return;
      solved[left[Math.floor(Math.random()*left.length)]] = true; hints++;
      drawTiles();
      $("#gFill").style.width = Math.max(25, 100-hints*25)+"%"; $("#gFill").style.background = "var(--amber)";
      if(left.length===1) $("#gHint").disabled = true;
      $("#gInput").focus();
    },
    points(){ return Math.max(25, 100 - hints*25); },
    reveal(){ solved = words.map(()=>true); drawTiles(); }
  };

  /* DECRYPT: 10 s grace at 100 pts, then a letter leaks every 1.8 s (−15 each, floor 15). */
  let chars=[], rev=[], leaked=0;
  const GRACE=10000, LEAK=1800;
  const DEC = {
    hint: "&gt; decrypting… you have 10 seconds before the leak starts",
    btn: "",
    next(){
      setRound(); leaked=0;
      chars = [...cur.x]; rev = chars.map(c=>!isAl(c));
      boxes(chars, rev); msg(DEC.hint);
      const f=$("#gFill"); f.style.background="var(--accent)";
      let t = GRACE;
      if(window.SITE_REDUCED_MOTION && window.SITE_REDUCED_MOTION()) f.style.transition="none";
      timers.push(setInterval(()=>{
        t -= 100; f.style.width = Math.max(0,t/GRACE*100)+"%";
        if(t<=0){ stop(); DEC.leak(); }
      },100));
    },
    leak(){
      $("#gFill").style.background="var(--amber)"; $("#gFill").style.width="100%";
      msg("&gt; LEAK ACTIVE — letters incoming, answer fast!", "var(--amber)");
      const one = () => {
        const hid = rev.map((r,i)=>r?null:i).filter(i=>i!==null);
        if(!hid.length){ stop(); return; }
        rev[hid[Math.floor(Math.random()*hid.length)]] = true; leaked++; boxes(chars, rev);
        if(rev.every(Boolean)){ stop(); msg("&gt; fully leaked — type it in for partial credit", "var(--amber)"); }
      };
      one(); timers.push(setInterval(one, LEAK));
    },
    points(){ return leaked===0 ? 100 : Math.max(15, 100-leaked*15); },
    reveal(){ rev = chars.map(()=>true); boxes(chars, rev); }
  };

  let MODE = SCR;
  function render(){
    stop();
    if(!pool().length){ panel.innerHTML = `<div class="card empty">Select at least one unit above to begin.</div>`; return; }
    MODE = mode==="decrypt" ? DEC : SCR;
    start(); shell(MODE.hint, MODE.btn); MODE.next();
  }
  renderChips(); render();
})();

// Dark Forest tab: Drake galaxy, chain of suspicion, technological explosion, forest simulation.
(() => {
  const $id = id => document.getElementById(id);
  const visible = el => el.offsetParent !== null;
  const fmt = n => n >= 1e6 ? d3.format(".2s")(n).replace("G", "B") : n >= 100 ? d3.format(",.0f")(n) : n >= 1 ? n.toFixed(1) : n.toPrecision(1);

  /* ───── 1. Drake equation + galaxy ───── */
  const DR = [
    { k: "R", label: "New stars per year in our galaxy", min: 1, max: 10, v: 2 },
    { k: "fp", label: "Fraction of stars with planets", min: .1, max: 1, v: 1 },
    { k: "ne", label: "Habitable planets per star", min: .01, max: 1, v: .2, log: true },
    { k: "fl", label: "…where life appears", min: .001, max: 1, v: .1, log: true },
    { k: "fi", label: "…that becomes intelligent", min: .001, max: 1, v: .1, log: true },
    { k: "L", label: "Years a civilization survives", min: 100, max: 1e8, v: 1e5, log: true },
    { k: "fc", label: "Fraction that broadcasts", min: .0001, max: 1, v: .3, log: true },
  ];
  const toSlider = d => 1000 * (d.log ? Math.log10(d.v / d.min) / Math.log10(d.max / d.min) : (d.v - d.min) / (d.max - d.min));
  const fromSlider = (d, x) => d.log ? d.min * Math.pow(d.max / d.min, x / 1000) : d.min + (d.max - d.min) * x / 1000;
  const drake = $id("drake");
  drake.innerHTML = DR.map(d => `<label>${d.label}<b data-o="${d.k}"></b><input type="range" min="0" max="1000" data-k="${d.k}" value="${toSlider(d)}"></label>`).join("") +
    `<div class="drakeN" id="drN"></div><div class="muted" id="drSub"></div>
     <div class="controls"><button class="btn" id="drDark">🌲 Apply the Dark Forest (nobody broadcasts)</button><button class="btn" id="drReset">Reset</button></div>`;
  let civExist = 0, civTalk = 0;
  function drakeCalc() {
    const v = Object.fromEntries(DR.map(d => [d.k, d.v]));
    civExist = v.R * v.fp * v.ne * v.fl * v.fi * v.L;
    civTalk = civExist * v.fc;
    DR.forEach(d => drake.querySelector(`[data-o=${d.k}]`).textContent = fmt(d.v));
    $id("drN").textContent = civTalk < 1 ? "≈ 0 broadcasting" : `≈ ${fmt(civTalk)} broadcasting`;
    $id("drSub").innerHTML = `${fmt(civExist)} civilizations exist right now in the Milky Way. ` +
      (civTalk >= 1 ? "So why do we hear <b>nothing</b>?" : civExist >= 1 ? "<b>They're out there, just silent.</b> That's the dark forest." : "Maybe we really are alone.");
  }
  drake.addEventListener("input", e => { const d = DR.find(x => x.k === e.target.dataset.k); if (d) { d.v = fromSlider(d, +e.target.value); drakeCalc(); } });
  const setFc = v => { const d = DR.find(x => x.k === "fc"); d.v = v; drake.querySelector("[data-k=fc]").value = toSlider(d); drakeCalc(); };
  $id("drDark").onclick = () => setFc(.0001);
  $id("drReset").onclick = () => setFc(.3);
  drakeCalc();

  // galaxy: two-armed spiral of background stars; civilizations sit on random stars
  const GS = Array.from({ length: 2600 }, (_, i) => {
    const core = i < 600, r = core ? Math.abs(d3.randomNormal(0, .12)()) : .08 + Math.pow(Math.random(), .8) * .9;
    const th = core ? Math.random() * 7 : r * 5.2 + (i % 2) * Math.PI + d3.randomNormal(0, .28)();
    return { x: Math.cos(th) * r, y: Math.sin(th) * r * .62, b: Math.random() };
  });
  function drawGalaxy(time) {
    const cv = $id("galaxy"); if (!visible(cv)) return;
    const f = fitCanvas(cv); if (!f) return;
    const { ctx, w, h } = f, s = Math.min(w / 2.1, h / 1.35);
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, s * .45);
    g.addColorStop(0, "#ffe9b855"); g.addColorStop(1, "transparent"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (const p of GS) { ctx.fillStyle = `rgba(200,210,255,${.15 + p.b * .35})`; ctx.fillRect(w / 2 + p.x * s, h / 2 + p.y * s, 1.2, 1.2); }
    // ponytail: one dot per civilization, capped at 1500 dots; above that the galaxy just reads as "full"
    const nE = Math.min(1500, Math.round(civExist)), nT = Math.min(nE, Math.round(civTalk));
    for (let i = 0; i < nE; i++) {
      const p = GS[(i * 7919) % GS.length], talk = i < nT, x = w / 2 + p.x * s, y = h / 2 + p.y * s;
      ctx.beginPath(); ctx.arc(x, y, talk ? 2.4 + Math.sin(time / 300 + i) : 1.8, 0, 7);
      ctx.fillStyle = talk ? "#7ef0c0" : "#7ef0c033"; ctx.fill();
    }
    ctx.fillStyle = "#8a90a6"; ctx.font = "12px system-ui"; ctx.fillText("Milky Way (not to scale)", 10, h - 10);
  }

  /* ───── 3. Chain of suspicion ───── */
  const chainEl = $id("chain");
  chainEl.innerHTML = `<div class="svgscroll"><svg viewBox="0 0 800 190" style="width:100%;height:auto;display:block"></svg></div>
    <div class="controls"><label>Layers of thinking <input type="range" id="chainK" min="1" max="7" value="1"></label><span class="readout" id="chainR"></span></div>
    <ul class="chainlist" id="chainL"></ul>`;
  function chainQ(k) {
    if (k === 1) return "Is B friendly?";
    let s = "Does B think", who = "B";
    for (let i = 2; i < k; i++) { who = who === "B" ? "A" : "B"; s += who === "A" ? " that I think" : " that B thinks"; }
    return `${s} ${who === "B" ? "I am" : "B is"} friendly?`;
  }
  function drawChain() {
    const k = +$id("chainK").value, svg = d3.select(chainEl).select("svg");
    const A = 120, B = 680, Y = 120;
    svg.html(`<circle cx="${A}" cy="${Y}" r="26" fill="#5aa9e6"/><text x="${A}" y="${Y + 52}" fill="#c7cbe0" text-anchor="middle" font-size="14">Civilization A (you)</text>
      <circle cx="${B}" cy="${Y}" r="26" fill="#c084fc"/><text x="${B}" y="${Y + 52}" fill="#c7cbe0" text-anchor="middle" font-size="14">Civilization B</text>
      <text x="400" y="${Y + 52}" fill="#8a90a6" text-anchor="middle" font-size="12">← several light-years →</text>`);
    for (let i = 0; i < k; i++) {
      const up = i % 2 === 0, hgt = 20 + i * 13, x0 = up ? A + 30 : B - 30, x1 = up ? B - 30 : A + 30;
      svg.append("path").attr("d", `M${x0},${Y - 8} Q400,${Y - 8 - hgt * 2} ${x1},${Y - 8}`).attr("fill", "none")
        .attr("stroke", i === k - 1 ? "#f2c14e" : "#3a4260").attr("stroke-width", i === k - 1 ? 2 : 1.4).attr("marker-end", "url(#arr)");
    }
    svg.append("defs").html(`<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="#8a90a6"/></marker>`);
    $id("chainL").innerHTML = Array.from({ length: k }, (_, i) => `<li>A asks: ${chainQ(i + 1)}</li>`).join("");
    $id("chainR").textContent = `≈ ${(k * 8.4).toFixed(0)} years of light-speed messages to settle this, at Earth–Trisolaris distance (8.4 years per round trip). And you can never be sure.`;
  }
  $id("chainK").oninput = drawChain; drawChain();

  /* ───── 4. Technological explosion ───── */
  const tx = $id("techx");
  tx.innerHTML = `<div class="svgscroll"><svg viewBox="0 0 820 320" style="width:100%;height:auto;display:block"></svg></div>
    <div class="controls"><label>Fleet travel time <input type="range" id="txT" min="20" max="450" value="450"> <b id="txTv"></b></label>
    <label class="btn"><input type="checkbox" id="txS" checked> Sophons lock Earth's basic science</label></div>
    <p class="readout" id="txR" style="margin:10px 0 0"></p>`;
  // illustrative curves in "log10 tech level": Trisolaris steady, Earth explosive, Earth-with-sophons stunted after ~2007
  const LAUNCH = 1983, CAP = 12;
  const tri = t => 3 + (t - 1500) / 300;
  const earthFree = t => Math.min(CAP + 1, .5 + 1.2 * Math.exp((t - 1900) / 110));
  const earth = (t, lock) => lock && t > 2007 ? earthFree(2007) + (t - 2007) / 400 : earthFree(t);
  function drawTech() {
    const T = +$id("txT").value, lock = $id("txS").checked, arr = LAUNCH + T;
    $id("txTv").textContent = `${T} years → arrives ${arr}`;
    const m = { l: 40, r: 20, t: 16, b: 34 }, W = 820, H = 320;
    const x = d3.scaleLinear([1500, 2450], [m.l, W - m.r]), y = d3.scaleLinear([0, CAP], [H - m.b, m.t]);
    const svg = d3.select(tx).select("svg").html("");
    svg.append("g").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8)).call(g => g.selectAll("text,line,path").attr("stroke", null).attr("fill", "#8a90a6").attr("color", "#3a4260"));
    svg.append("text").attr("transform", `translate(14,${H / 2}) rotate(-90)`).attr("text-anchor", "middle").attr("fill", "#8a90a6").attr("font-size", 12).text("technology (log scale)");
    const ts = d3.range(1500, 2451, 2), line = f => d3.line().x(t => x(t)).y(t => y(Math.min(CAP, f(t))))(ts.filter(t => f(t) <= CAP + .5));
    svg.append("rect").attr("x", x(LAUNCH)).attr("width", x(Math.min(arr, 2450)) - x(LAUNCH)).attr("y", m.t).attr("height", H - m.t - m.b).attr("fill", "#8fa8ff10");
    svg.append("path").attr("d", line(tri)).attr("stroke", "#c084fc").attr("stroke-width", 2.5).attr("fill", "none");
    svg.append("path").attr("d", line(earthFree)).attr("stroke", "#5aa9e6").attr("stroke-width", 2).attr("fill", "none").attr("stroke-dasharray", lock ? "4 4" : null).attr("opacity", lock ? .5 : 1);
    if (lock) svg.append("path").attr("d", line(t => earth(t, true))).attr("stroke", "#5aa9e6").attr("stroke-width", 2.5).attr("fill", "none");
    const lab = (t, v, txt, c) => svg.append("text").attr("x", x(t)).attr("y", y(v) - 8).attr("fill", c).attr("font-size", 12).text(txt);
    lab(1520, tri(1520), "Trisolaris: steady progress", "#c084fc");
    lab(1880, earthFree(1880) + .9, "Earth: technological explosion", "#5aa9e6");
    if (lock) lab(2240, earth(2240, true) - .1, "Earth with sophons", "#5aa9e6");
    [[LAUNCH, "Fleet launches"], [arr, "Fleet arrives"]].forEach(([t, s]) => {
      if (t > 2450) return;
      svg.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", m.t).attr("y2", H - m.b).attr("stroke", "#8fa8ff").attr("stroke-dasharray", "3 3");
      svg.append("text").attr("x", x(t) + 4).attr("y", m.t + 12).attr("fill", "#8fa8ff").attr("font-size", 11).text(s);
    });
    const d = earth(arr, lock) - tri(arr);
    $id("txR").innerHTML = d > 0
      ? `At arrival Earth would be <span style="color:#5aa9e6">${d > 6 ? "unimaginably" : Math.round(Math.pow(10, d)) + "×"} more advanced</span>. The invasion fails.`
      : `At arrival Trisolaris is still <span style="color:#c084fc">${Math.round(Math.pow(10, -d))}× more advanced</span>. The invasion can succeed.`;
  }
  $id("txT").oninput = drawTech; $id("txS").onchange = drawTech; drawTech();

  /* ───── 6. Forest simulation ───── */
  const cv = $id("forest");
  let stars, waves, shots, flashes, earthStar, spellTarget, sent, killed;
  const C = 1.6, PHOTOID = 3.2; // px per frame
  function reset() {
    stars = Array.from({ length: 170 }, () => ({ x: .03 + Math.random() * .94, y: .05 + Math.random() * .9, hunter: Math.random() < .09, alive: true, tw: Math.random() * 6 }));
    earthStar = { x: .12, y: .55, alive: true, earth: true, tw: 0 }; stars.push(earthStar);
    waves = []; shots = []; flashes = []; spellTarget = null; sent = 0; killed = 0;
  }
  reset();
  const pos = (s, w, h) => [s.x * w, s.y * h];
  function broadcast(origin, target) { if (!origin.alive || !target.alive) return; waves.push({ origin, target, r: 0, heard: new Set() }); if (!target.revealed) sent++; target.revealed = true; }
  cv.addEventListener("click", e => {
    const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bd = 18;
    for (const s of stars) { const d = Math.hypot(s.x * r.width - mx, s.y * r.height - my); if (d < bd && s.alive) { bd = d; best = s; } }
    if (best) broadcast(best, best);
  });
  $id("fBroadcast").onclick = () => broadcast(earthStar, earthStar);
  $id("fSpell").onclick = () => {
    const c = stars.filter(s => s.alive && !s.hunter && !s.earth && s.x > .35);
    spellTarget = c[Math.floor(Math.random() * c.length)];
    if (spellTarget) broadcast(earthStar, spellTarget);
  };
  $id("fReset").onclick = reset;

  function drawForest(time) {
    if (!visible(cv)) return;
    const f = fitCanvas(cv); if (!f) return;
    const { ctx, w, h } = f, showH = $id("fHunters").checked;
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    // waves: expanding light-speed shells; any hunter they pass may fire at the revealed target
    for (const wv of waves) {
      wv.r += C;
      const [ox, oy] = pos(wv.origin, w, h);
      for (const s of stars) {
        if (!s.hunter || !s.alive || wv.heard.has(s) || s === wv.target) continue;
        const [sx, sy] = pos(s, w, h);
        if (Math.hypot(sx - ox, sy - oy) <= wv.r) {
          wv.heard.add(s);
          if (Math.random() < .75) shots.push({ from: s, to: wv.target, p: 0, wait: 20 + Math.random() * 60 });
        }
      }
      ctx.beginPath(); ctx.arc(ox, oy, wv.r, 0, 7);
      ctx.strokeStyle = `rgba(126,240,192,${Math.max(0, .5 - wv.r / (w * 1.6))})`; ctx.lineWidth = 1.5; ctx.stroke();
    }
    waves = waves.filter(wv => wv.r < w * 1.3);
    // photoids
    for (const sh of shots) {
      if (sh.wait > 0) { sh.wait--; continue; }
      const [ax, ay] = pos(sh.from, w, h), [bx, by] = pos(sh.to, w, h), dist = Math.hypot(bx - ax, by - ay);
      sh.p = Math.min(1, sh.p + PHOTOID / dist);
      const hx = ax + (bx - ax) * sh.p, hy = ay + (by - ay) * sh.p, tp = Math.max(0, sh.p - 40 / dist);
      ctx.strokeStyle = "#ff6b4a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + (bx - ax) * tp, ay + (by - ay) * tp); ctx.lineTo(hx, hy); ctx.stroke();
      if (sh.p >= 1) { if (sh.to.alive) { sh.to.alive = false; killed++; flashes.push({ x: bx, y: by, r: 0 }); } sh.done = true; }
    }
    shots = shots.filter(s => !s.done);
    for (const fl of flashes) {
      fl.r += 1.5;
      ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r, 0, 7); ctx.fillStyle = `rgba(255,220,180,${Math.max(0, .9 - fl.r / 40)})`; ctx.fill();
    }
    flashes = flashes.filter(fl => fl.r < 40);
    // stars
    for (const s of stars) {
      const [x, y] = pos(s, w, h);
      if (!s.alive) { ctx.strokeStyle = "#5a4040"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.stroke(); continue; }
      const tw = .55 + .45 * Math.sin(time / 500 + s.tw);
      ctx.beginPath(); ctx.arc(x, y, s.earth ? 4.5 : s.revealed ? 3 : 1.6, 0, 7);
      ctx.fillStyle = s.earth ? "#5aa9e6" : s.hunter && showH ? "#ff4d4d" : s.revealed ? "#7ef0c0" : `rgba(220,225,255,${tw})`;
      ctx.fill();
    }
    ctx.font = "12px system-ui"; ctx.fillStyle = "#c7cbe0";
    const [ex, ey] = pos(earthStar, w, h); ctx.fillText(earthStar.alive ? "Earth" : "Earth (destroyed)", ex + 8, ey + 4);
    if (spellTarget) { const [sx, sy] = pos(spellTarget, w, h); ctx.fillStyle = "#f2c14e"; ctx.fillText(spellTarget.alive ? "187J3X1" : "187J3X1 ✝", sx + 7, sy + 4); }
    $id("fStats").textContent = `Revealed: ${sent} · Destroyed: ${killed}${spellTarget && !spellTarget.alive && earthStar.alive ? " · The spell worked, and Earth was never revealed." : ""}`;
  }

  /* ───── 7. Crisis Year 205: the Doomsday Battle, then the Dark Battle ───── */
  const bcv = $id("battle");
  let bMode = "doom", doom, dark;
  const seeded = n => { const s = Math.sin(n * 91.7) * 43758.5; return s - Math.floor(s); };
  function resetDoom() {
    const grid = [];
    for (let r = 0; r < 20; r++) for (let c = 0; c < 100; c++) grid.push({ x: .07 + c / 99 * .86, y: .2 + r / 19 * .56, r, c });
    // Quantum and Bronze Age sat at the far corner, already in deep-sea state
    const esc = grid.filter(s => s.r === 19 && s.c >= 98); esc[0].name = "Quantum"; esc[1].name = "Bronze Age"; esc.forEach(s => s.esc = true);
    const extra = Array.from({ length: 15 }, (_, i) => ({ x: .1 + seeded(i + 1) * .8, y: seeded(i + 40) < .5 ? .1 + seeded(i + 7) * .06 : .82 + seeded(i + 9) * .07 }));
    // the droplet rams through row after row, starting with the first row's hundred ships
    const order = [];
    for (let r = 0; r < 20; r++) { const row = grid.filter(s => s.r === r && !s.esc); order.push(...(r % 2 ? row.reverse() : row)); }
    order.push(...extra);
    doom = { ships: [...grid, ...extra], order, k: 0, playing: false, booms: [], escT: 0, done: false };
  }
  const DOOM_CAP = [
    [0, "Crisis Year 205. Humanity's Combined Fleet, 2,015 warships, 2,000 of them in a 100 × 20 grid, meets the first Trisolaran arrival: one droplet, captured by the probe Mantis."],
    [.01, "The droplet wakes, destroys Mantis, and rams through the first row: 100 warships in 1 minute 18 seconds."],
    [600, "About 13 minutes in, two crew members finally identify the attacker. Over 600 ships are already gone. Lasers and railguns barely slow it."],
    [1000, "After 20 minutes: over 1,000 ships destroyed."],
    [2013, "2,013 warships destroyed. Only Quantum and Bronze Age, already in ‘deep-sea state’ at the far corner, escape at full acceleration."],
  ];
  const DARK_CAP = [
    "Five ships flee into deep space: Natural Selection, which Zhang Beihai hijacked before the battle, and the four sent to chase it: Blue Space, Enterprise, Deep Space and Ultimate Law. There aren't enough supplies for all five to reach another star.",
    "Every captain does the same math: strike first and take the others' fuel and parts, or be struck. Nobody can know what the others will do. A chain of suspicion, inside one small fleet.",
    "Ultimate Law fires first: infrasonic hydrogen bombs, which kill the crews and leave the ships intact. Natural Selection goes dark, Zhang Beihai with it.",
    "Blue Space was ready: its crew had let the air out and sealed themselves in suits, and with no air the bombs' sound can't kill them. It fires back with lasers and destroys Ultimate Law.",
    "Blue Space strips the dead ships and flies on alone. Far away, Bronze Age does the same to Quantum. No one here is evil; every crew did what survival seemed to demand.",
  ];
  const DARK_SHIPS = [["Natural Selection", .5, .22], ["Blue Space", .8, .46], ["Enterprise", .68, .8], ["Deep Space", .32, .8], ["Ultimate Law", .2, .46]];
  const resetDark = () => { dark = { step: 0, t0: performance.now() }; };
  function setBattle(m) {
    bMode = m; document.querySelectorAll("[data-battle]").forEach(b => b.classList.toggle("on", b.dataset.battle === m));
    m === "doom" ? resetDoom() : resetDark();
    $id("bPlay").textContent = m === "doom" ? "▶ Play" : "Next ▸";
    $id("bCap").textContent = m === "doom" ? DOOM_CAP[0][1] : DARK_CAP[0];
  }
  document.querySelectorAll("[data-battle]").forEach(b => b.onclick = () => setBattle(b.dataset.battle));
  $id("bPlay").onclick = () => {
    if (bMode === "doom") { if (doom.done || doom.playing) resetDoom(); doom.playing = true; $id("bPlay").textContent = "↺ Replay"; return; }
    if (dark.step >= DARK_CAP.length - 1) resetDark(); else { dark.step++; dark.t0 = performance.now(); }
    $id("bCap").textContent = DARK_CAP[dark.step];
    $id("bPlay").textContent = dark.step >= DARK_CAP.length - 1 ? "↺ Replay" : "Next ▸";
  };
  setBattle("doom");

  function drawBattle(t) {
    if (!visible(bcv)) return;
    const f = fitCanvas(bcv); if (!f) return;
    const { ctx, w, h } = f, P = s => [s.x * w, s.y * h];
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    if (bMode === "doom") {
      const d = doom, n = d.order.length;
      if (d.playing && !d.done) {
        const prev = Math.floor(d.k);
        d.k = Math.min(n, d.k + (d.k < 100 ? .55 : 2.4));
        for (let i = prev; i < Math.floor(d.k); i++) { const s = d.order[i]; s.dead = true; d.booms.push({ x: s.x, y: s.y, life: 1 }); }
        if (d.k >= n) d.done = true;
      }
      if (d.playing) d.escT += 1;
      for (const s of d.ships) {
        let [x, y] = P(s);
        if (s.esc && d.playing) { const a = d.escT * d.escT * .0009; x += a * 1.4; y += a; }
        ctx.fillStyle = s.dead ? "#3a2a2a" : s.esc ? "#7ef0c0" : "#9fb3d8";
        ctx.fillRect(x - 1, y - 1, s.dead ? 1.5 : 2.2, s.dead ? 1.5 : 2.2);
        if (s.esc && x < w + 60) { ctx.fillStyle = "#7ef0c0"; ctx.font = "11px system-ui"; ctx.fillText(s.name, x - (s.name === "Quantum" ? 52 : 58), y + (s.name === "Quantum" ? -6 : 14)); }
      }
      d.booms = d.booms.filter(b => (b.life -= .03) > 0);
      for (const b of d.booms) { ctx.beginPath(); ctx.arc(b.x * w, b.y * h, 2 + (1 - b.life) * 7, 0, 7); ctx.fillStyle = `rgba(255,190,120,${b.life * .8})`; ctx.fill(); }
      // the droplet sits at the ship it is passing through; before the battle, beside Mantis
      const i = Math.min(n - 1, Math.floor(d.k)), tgt = d.playing ? d.order[i] : { x: .04, y: .13 };
      const [dx, dy] = P(tgt), g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 12);
      g.addColorStop(0, "#ffffff"); g.addColorStop(.35, "#cfe6ff"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, 12, 0, 7); ctx.fill();
      if (!d.playing) { ctx.fillStyle = "#8a90a6"; ctx.fillRect(dx + 10, dy - 2, 6, 4); ctx.font = "11px system-ui"; ctx.fillText("droplet + Mantis", dx + 20, dy + 4); }
      $id("bStat").textContent = `Warships destroyed: ${Math.floor(d.k).toLocaleString()} / 2,013`;
      $id("bCap").textContent = DOOM_CAP.filter(([k]) => (d.playing ? d.k : -1) >= k).at(-1)?.[1] || DOOM_CAP[0][1];
    } else {
      const s = dark.step, p = Math.min(1, (performance.now() - dark.t0) / 1400);
      const pos = DARK_SHIPS.map(([, x, y], i) => [x * w + Math.sin(t / 900 + i) * 3, y * h + Math.cos(t / 1100 + i) * 3]);
      const dead = i => i !== 1 && i !== 4 && (s > 2 || (s === 2 && Math.hypot(pos[i][0] - pos[4][0], pos[i][1] - pos[4][1]) < p * w * .7));
      if (s === 1) { // the web of suspicion
        ctx.setLineDash([4, 6]); ctx.strokeStyle = `rgba(229,72,77,${.25 + .2 * Math.sin(t / 300)})`;
        pos.forEach((a, i) => pos.forEach((b, j) => { if (j > i) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); } }));
        ctx.setLineDash([]);
      }
      if (s === 2) for (let k = 0; k < 3; k++) { const r = (p * w * .7 - k * 30); if (r > 0) { ctx.beginPath(); ctx.arc(...pos[4], r, 0, 7); ctx.strokeStyle = `rgba(242,193,78,${.5 * (1 - p)})`; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; } }
      if (s === 3) { ctx.strokeStyle = "#ff6b4a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...pos[1]); ctx.lineTo(pos[1][0] + (pos[4][0] - pos[1][0]) * Math.min(1, p * 2), pos[1][1] + (pos[4][1] - pos[1][1]) * Math.min(1, p * 2)); ctx.stroke(); ctx.lineWidth = 1; }
      const ulGone = s > 3 || (s === 3 && p > .55), bsX = s === 4 ? p * p * w * .5 : 0;
      if (s === 3 && p > .5) { ctx.beginPath(); ctx.arc(...pos[4], 6 + (p - .5) * 60, 0, 7); ctx.fillStyle = `rgba(255,190,120,${1 - p})`; ctx.fill(); }
      if (s === 4) { ctx.strokeStyle = `rgba(127,184,224,${.6 * (1 - p)})`; [0, 2, 3].forEach(i => { ctx.beginPath(); ctx.moveTo(pos[1][0] + bsX, pos[1][1]); ctx.lineTo(...pos[i]); ctx.stroke(); }); }
      DARK_SHIPS.forEach(([name], i) => {
        if (i === 4 && ulGone) return;
        let [x, y] = pos[i]; if (i === 1) x += bsX;
        const isDead = dead(i);
        if (i === 1 && s >= 2) { ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.strokeStyle = "#5aa9e6aa"; ctx.stroke(); }
        ctx.fillStyle = isDead ? "#4a4f5e" : i === 1 ? "#7fb8e0" : i === 4 ? "#f2c14e" : "#dfe3ef";
        ctx.beginPath(); ctx.moveTo(x + 11, y); ctx.lineTo(x - 8, y - 5); ctx.lineTo(x - 5, y); ctx.lineTo(x - 8, y + 5); ctx.fill();
        ctx.fillStyle = isDead ? "#6b7080" : "#c7cbe0"; ctx.font = "12px system-ui"; ctx.textAlign = "center";
        ctx.fillText(name + (isDead ? " · crew dead" : ""), x, y + 24);
        if (s === 1) { ctx.fillStyle = "#e5484d"; ctx.font = "700 14px system-ui"; ctx.fillText("?", x, y - 12); }
        if (i === 1 && s === 2) { ctx.fillStyle = "#5aa9e6"; ctx.font = "11px system-ui"; ctx.fillText("vented · crew in suits", x, y - 20); }
        ctx.textAlign = "start";
      });
      // supplies: enough for one ship of five
      ctx.fillStyle = "#8a90a6"; ctx.font = "11px system-ui"; ctx.fillText("Supplies: enough for 1 ship of 5", 14, 20);
      ctx.fillStyle = "#222839"; ctx.fillRect(14, 28, 150, 8); ctx.fillStyle = "#f2c14e"; ctx.fillRect(14, 28, 30, 8);
      $id("bStat").textContent = `Step ${s + 1} of ${DARK_CAP.length}`;
      $id("bCap").textContent = DARK_CAP[s];
    }
  }

  const gate = frameGate();
  (function loop(t) { requestAnimationFrame(loop); if (gate(t)) { drawGalaxy(t); drawForest(t); drawBattle(t); } })(0);
})();

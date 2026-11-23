// Trisolarans tab: three-body simulation, the 4.2-ly contact timeline, sophon unfolding, technology cards.
(() => {
  const $id = id => document.getElementById(id);
  const visible = el => el.offsetParent !== null;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ───── 1. Three-body simulation ───── */
  const cv = $id("threebody");
  const EPS2 = .0016, DT = .001, R0 = .25, YEAR = 2 * Math.PI * Math.pow(R0, 1.5); // 1 "year" = planet's starting orbit
  const STAR_COL = ["#ffd27a", "#ff9a5a", "#fff1c9"];
  let preset = "chaos", sys, twin, t, civ = 1, paused = false, dead = null, stress = 0, cam = null;

  function accel(s) {
    for (const b of s) b.ax = b.ay = 0;
    for (const b of s) for (const o of s) {
      if (o === b || !o.m) continue;
      const dx = o.x - b.x, dy = o.y - b.y, r2 = dx * dx + dy * dy + EPS2, f = o.m / (r2 * Math.sqrt(r2));
      b.ax += dx * f; b.ay += dy * f;
    }
  }
  function step(s) { // leapfrog (kick-drift-kick): keeps energy honest over long runs
    for (const b of s) { b.vx += b.ax * DT / 2; b.vy += b.ay * DT / 2; b.x += b.vx * DT; b.y += b.vy * DT; }
    accel(s);
    for (const b of s) { b.vx += b.ax * DT / 2; b.vy += b.ay * DT / 2; }
  }
  const planetAround = (h, r = R0) => ({ x: h.x + r, y: h.y, vx: h.vx, vy: h.vy + Math.sqrt(h.m / r), m: 0, planet: true });
  // figure-8 planet placements, from long test runs with this same integrator (200 figure-8 laps):
  // hot  = 0.08 around one sun: stable, but always burning; warm = R0 (habitable distance): swallowed or flung out within ~1 lap;
  // cold = 3.5 around all three: stable, but always frozen. No placement is both stable and habitable.
  let orbit = "warm";
  function make(p) {
    let s;
    if (p === "eight") { // initial conditions from Chenciner & Montgomery (2000), Annals of Mathematics 152; orbit first found by C. Moore (1993)
      const x = -0.97000436, y = 0.24308753, vx = -0.93240737, vy = -0.86473146;
      s = [{ x, y, vx: -vx / 2, vy: -vy / 2, m: 1 }, { x: -x, y: -y, vx: -vx / 2, vy: -vy / 2, m: 1 }, { x: 0, y: 0, vx, vy, m: 1 }];
      s.push(orbit === "cold" ? { x: 3.5, y: 0, vx: 0, vy: Math.sqrt(3 / 3.5), m: 0, planet: true } : planetAround(s[0], orbit === "hot" ? .08 : R0)); // centre of mass is at rest at 0,0
    } else if (p === "sun") {
      s = [{ x: 0, y: 0, vx: 0, vy: 0, m: 1 }]; s.push(planetAround(s[0]));
    } else {
      do s = [0, 1, 2].map(() => ({ x: rnd(-1, 1), y: rnd(-1, 1), vx: rnd(-.4, .4), vy: rnd(-.4, .4), m: 1 }));
      while (s.some((a, i) => s.some((b, j) => j > i && Math.hypot(a.x - b.x, a.y - b.y) < .7)));
      const mx = d3.mean(s, b => b.vx), my = d3.mean(s, b => b.vy), cx = d3.mean(s, b => b.x), cy = d3.mean(s, b => b.y);
      s.forEach(b => { b.vx -= mx; b.vy -= my; b.x -= cx; b.y -= cy; });
      s.push(planetAround(s[0]));
    }
    s.forEach(b => b.tr = []); accel(s); return s;
  }
  function restart(newCiv) {
    sys = make(preset); t = 0; dead = null; stress = 0; cam = null;
    if (newCiv) civ++; else civ = 1;
    twin = null;
    if ($id("tbTwin").checked && preset === "chaos") {
      twin = sys.map(b => ({ ...b, tr: [] })); twin[0].x += 1e-6; accel(twin);
    }
  }

  const INFO = {
    chaos: "Three equal suns, random start. The planet begins in a calm orbit around one sun. How long will it last? Every time the planet dies, civilization restarts, just like in the Three Body game.",
    eight: "Discovered by computer in 1993: three equal suns chasing each other along a figure-8. It is real and stable, but nature almost never sets up such perfect conditions. Where could a planet live? Try the three orbits.",
    sun: "One sun, one planet. Newton's solution: the same ellipse, forever. A single calm sun is worth crossing 4 light-years for.",
  };
  const ORBIT_INFO = {
    hot: "Hugging one sun: in our tests it stays in orbit for 200+ laps of the figure-8. But that close, it is always far too hot. Stable, and dead.",
    warm: "At the habitable distance (like Earth from the Sun): warm enough for life, but the other two suns pull it off course within about one lap.",
    cold: "Far outside all three suns: stable for 200+ laps, but the suns shrink to ‘flying stars’ and it freezes forever.",
  };
  const showInfo = () => { $id("tbInfo").textContent = INFO[preset] + (preset === "eight" ? " " + ORBIT_INFO[orbit] + " There is no orbit that is both stable and habitable." : ""); };
  document.querySelectorAll("[data-orbit]").forEach(b => b.onclick = () => {
    orbit = b.dataset.orbit;
    document.querySelectorAll("[data-orbit]").forEach(x => x.classList.toggle("on", x === b));
    showInfo(); restart(false);
  });
  document.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => {
    preset = b.dataset.preset; $id("tbOrbit").hidden = preset !== "eight";
    document.querySelectorAll("[data-preset]").forEach(x => x.classList.toggle("on", x === b));
    showInfo();
    $id("tbTwin").disabled = preset !== "chaos"; $id("tbTwin").parentElement.style.opacity = preset === "chaos" ? 1 : .4; // twin compares planets; only the random preset has one
    restart(false);
  });
  $id("tbPause").onclick = () => { paused = !paused; $id("tbPause").textContent = paused ? "▶ Play" : "⏸ Pause"; };
  $id("tbNew").onclick = () => restart(true);
  $id("tbTwin").onchange = () => restart(false);
  $id("tbInfo").textContent = INFO.chaos;
  restart(false);

  function climate(s) {
    const p = s.find(b => b.planet); if (!p) return null;
    const terms = s.filter(b => b.m).map(b => b.m / ((b.x - p.x) ** 2 + (b.y - p.y) ** 2));
    const F = d3.sum(terms), f = F * R0 * R0, dmin = Math.sqrt(1 / d3.max(terms));
    return { f, dom: d3.max(terms) / F, dmin, far: Math.hypot(p.x - d3.mean(s.filter(b => b.m), b => b.x), p.y - d3.mean(s.filter(b => b.m), b => b.y)) };
  }

  function drawSim() {
    if (!visible(cv)) return;
    const fc = fitCanvas(cv); if (!fc) return;
    const { ctx, w, h } = fc;
    const speed = +$id("tbSpeed").value;
    if (!paused && !dead) for (let i = 0; i < speed * 6; i++) { step(sys); if (twin) step(twin); t += DT; }

    // planet fate
    const c = climate(sys);
    let status = "";
    if (c && !dead && preset !== "sun") {
      const extreme = c.f > 3.5 || c.f < .2;
      stress = extreme ? stress + speed * 6 * DT : Math.max(0, stress - speed * 3 * DT);
      if (c.dmin < .05) dead = "swallowed by a sun";
      else if (c.far > 6) dead = "flung into deep space";
      else if (preset === "chaos" && stress > 2 * YEAR) dead = c.f > 3.5 ? "burned by the suns" : "frozen solid"; // climate deaths only end chaos runs; the figure-8 keeps showing a stable-but-dead orbit
      if (dead) dead = { why: dead, at: performance.now(), years: t / YEAR };
    }
    if (c) status = c.f > 3.5 ? "🔥 Burning: suns too close" : c.f < .2 ? "❄ Frozen: the suns are distant ‘flying stars’" : c.dom > .85 ? "☀ Stable Era" : "🌀 Chaotic Era";
    if (preset === "sun") status = "☀ Stable forever: perfectly predictable";
    $id("tbStatus").textContent = status;
    $id("tbClimate").style.left = c ? `${Math.max(0, Math.min(1, (Math.log10(c.f) + 1.2) / 2.4)) * 100}%` : "50%";
    $id("tbClimate").parentElement.style.opacity = c ? 1 : .3;
    if (dead && preset === "chaos" && performance.now() - dead.at > 3500) restart(true);

    // camera follows the suns' centre of mass and zooms to fit
    const stars = sys.filter(b => b.m), cx = d3.mean(stars, b => b.x), cy = d3.mean(stars, b => b.y);
    const p = sys.find(b => b.planet);
    const ext = Math.max(.35, ...stars.map(b => Math.hypot(b.x - cx, b.y - cy)), p && !dead ? Math.min(4, Math.hypot(p.x - cx, p.y - cy)) : 0);
    const target = { x: cx, y: cy, s: Math.min(w, h) * .44 / ext };
    cam = cam ? { x: cam.x + (target.x - cam.x) * .08, y: cam.y + (target.y - cam.y) * .08, s: cam.s + (target.s - cam.s) * .03 } : target;
    const X = x => w / 2 + (x - cam.x) * cam.s, Y = y => h / 2 + (y - cam.y) * cam.s;

    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    const drawSys = (s, ghost) => {
      s.forEach((b, i) => {
        if (!paused && !dead) { b.tr.push([b.x, b.y]); if (b.tr.length > (b.planet ? 260 : 700)) b.tr.shift(); }
        const col = b.planet ? (ghost ? "#ff5ad8" : "#6fc3ff") : STAR_COL[i];
        if (b.planet && dead && !ghost) return;
        ctx.strokeStyle = col; ctx.globalAlpha = ghost ? .35 : .45; ctx.lineWidth = b.planet ? 1 : 1.4; ctx.beginPath();
        b.tr.forEach(([x, y], k) => k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.globalAlpha = 1;
        if (b.planet) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(b.x), Y(b.y), 4, 0, 7); ctx.fill(); return; }
        if (ghost) return;
        const g = ctx.createRadialGradient(X(b.x), Y(b.y), 0, X(b.x), Y(b.y), 16);
        g.addColorStop(0, "#fff"); g.addColorStop(.3, col); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(b.x), Y(b.y), 16, 0, 7); ctx.fill();
      });
    };
    if (twin) drawSys(twin, true);
    drawSys(sys, false);

    ctx.fillStyle = "#c7cbe0"; ctx.font = "13px system-ui";
    ctx.fillText(preset === "chaos" ? `Civilization #${civ} · Year ${Math.floor(t / YEAR)}` : `Year ${Math.floor(t / YEAR)}`, 12, 20);
    if (twin) {
      const a = sys.find(b => b.planet), b = twin.find(b => b.planet), d = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
      ctx.fillStyle = "#ff5ad8"; ctx.fillText(`Twin planet (pink) started 0.000001 away. Now: ${d < .001 ? d.toExponential(1) : d.toFixed(3)}`, 12, 40);
    }
    if (dead) {
      ctx.fillStyle = "#000a"; ctx.fillRect(0, h / 2 - 40, w, 80);
      ctx.fillStyle = "#ff8a3d"; ctx.font = "600 20px Georgia,serif"; ctx.textAlign = "center";
      ctx.fillText(preset === "chaos" ? `Civilization #${civ} destroyed: ${dead.why}` : `Planet lost: ${dead.why}`, w / 2, h / 2 - 4);
      ctx.fillStyle = "#c7cbe0"; ctx.font = "13px system-ui";
      ctx.fillText(preset === "chaos" ? `It lasted ${Math.floor(dead.years)} years. Civilization will begin again…` : `It lasted ${Math.floor(dead.years)} years. Try another orbit.`, w / 2, h / 2 + 20);
      ctx.textAlign = "start";
    }
  }

  /* ───── 3. The 4.2-light-year gap ───── */
  const LY = 4.2, E = 70, T = 830, YL = 105, LAUNCH = 1971 + 3 * LY;
  const CAPS = [
    [1969, "Ye Wenjie arrives at Red Coast Base."],
    [1971, "Ye beams humanity's message, using the Sun as an amplifier."],
    [1975.2, "Trisolaris hears it. Listener 1379 replies: “Do not answer!”"],
    [1979.4, "The warning reaches Earth. Ye answers anyway: “Come here!”"],
    [LAUNCH, "Trisolaris now knows where Earth is. The fleet launches; droplets fly with it."],
    [1990, "Sophons, at near light speed, reach Earth well ahead of the fleet and lock its physics."],
    [2007, "Present day (Book I): “You are bugs.”"],
    [2205, "The droplet arrives: the Doomsday Battle."],
    [2208, "Luo Ji's deterrence: the fleet is held at bay."],
    [2270, "Deterrence fails. Droplets strike; the fleet heads for Earth."],
    [2272, "Gravity broadcasts Trisolaris' location to the universe. The fleet turns away."],
    [2275, "A photoid destroys Trisolaris' star."],
  ];
  const gap = d3.select("#gap");
  gap.html(`
    <line x1="${E}" x2="${T}" y1="${YL}" y2="${YL}" stroke="#222839" stroke-width="2"/>
    <circle cx="${E}" cy="${YL}" r="16" fill="#5aa9e6"/><text x="${E}" y="${YL + 38}" fill="#c7cbe0" text-anchor="middle" font-size="13">Earth</text>
    <g id="gapTri">${[[-9, -6], [8, -8], [0, 9]].map(([dx, dy], i) => `<circle cx="${T + dx}" cy="${YL + dy}" r="7" fill="${STAR_COL[i]}"/>`).join("")}</g>
    <text x="${T}" y="${YL + 38}" fill="#c7cbe0" text-anchor="middle" font-size="13">Trisolaris</text>
    <text x="${(E + T) / 2}" y="${YL + 38}" fill="#8a90a6" text-anchor="middle" font-size="12">← 4.2 light-years: 4.2 years at light speed →</text>
    <g id="gapDyn"></g>`);
  const xAt = (p, dir) => dir > 0 ? E + p * (T - E) : T - p * (T - E);
  function drawGap(y) {
    $id("gapLabel").textContent = Math.floor(y);
    $id("gapCaption").textContent = CAPS.filter(c => c[0] <= y).at(-1)[1];
    const g = d3.select("#gapDyn").html("");
    [[1971, 1, "message", "#ff8a3d"], [1971 + LY, -1, "“Do not answer!”", "#c084fc"], [1971 + 2 * LY, 1, "“Come here!”", "#e5484d"]].forEach(([t0, dir, lab, col]) => {
      const p = (y - t0) / LY; if (p < 0 || p > 1) return;
      const x = xAt(p, dir);
      g.append("circle").attr("cx", x).attr("cy", YL).attr("r", 6).attr("fill", col).attr("filter", "drop-shadow(0 0 6px " + col + ")");
      g.append("text").attr("x", x).attr("y", YL - 16).attr("fill", col).attr("text-anchor", "middle").attr("font-size", 13).text(lab);
    });
    if (y >= LAUNCH) {
      const pf = Math.min((Math.min(y, 2272) - LAUNCH) / 450, 1), xf = xAt(pf, -1);
      for (let i = 0; i < 9; i++) g.append("path").attr("d", `M${xf + (i % 3) * 7},${YL + 48 + Math.floor(i / 3) * 7} l-6,3 l6,3z`).attr("fill", y > 2272 ? "#555" : "#c084fc");
      g.append("text").attr("x", xf).attr("y", YL + 84).attr("fill", "#c084fc").attr("text-anchor", "middle").attr("font-size", 12)
        .text(y > 2272 ? "Fleet turns away" : "Trisolaran Fleet (~1,000 ships, ≤1% light speed)");
      const pd = Math.min((y - LAUNCH) / (2205 - LAUNCH), 1), xd = xAt(pd, -1);
      if (y < 2272) {
        g.append("ellipse").attr("cx", xd).attr("cy", YL - 40).attr("rx", 7).attr("ry", 4).attr("fill", "#e7ecff");
        g.append("text").attr("x", xd).attr("y", YL - 52).attr("fill", "#e7ecff").attr("text-anchor", "middle").attr("font-size", 12).text("droplet");
      }
    }
    if (y >= 1985 && y < 2272) g.append("text").attr("x", E + 26).attr("y", YL - 18).attr("fill", "#c084fc").attr("font-size", 11).text("sophons ✦");
    if (y >= 2272 && y < 2280) for (let k = 0; k < 3; k++) {
      const r = ((y - 2272) * 60 + k * 30) % 200;
      g.append("circle").attr("cx", T).attr("cy", YL).attr("r", r).attr("fill", "none").attr("stroke", "#7ef0c0").attr("opacity", 1 - r / 200);
    }
    if (y >= 2274 && y < 2275) { const p = y - 2274; g.append("line").attr("x1", T + 70 * (1 - p)).attr("y1", YL - 90 * (1 - p)).attr("x2", T + 70 * (1 - p) + 10).attr("y2", YL - 90 * (1 - p) - 13).attr("stroke", "#ff6b4a").attr("stroke-width", 3); }
    d3.select("#gapTri").attr("opacity", y >= 2275 ? .15 : 1);
    if (y >= 2275) g.append("text").attr("x", T).attr("y", YL + 5).attr("fill", "#ff6b4a").attr("text-anchor", "middle").attr("font-size", 22).text("✕");
  }
  const slider = $id("gapYear");
  let playing = false;
  slider.oninput = () => { playing = false; $id("gapPlay").textContent = "▶ Play"; drawGap(+slider.value); };
  $id("gapPlay").onclick = () => {
    if (+slider.value >= +slider.max) slider.value = slider.min;
    playing = !playing; $id("gapPlay").textContent = playing ? "⏸ Pause" : "▶ Play";
  };
  function tickGap() {
    if (!playing) return;
    const y = +slider.value, stepY = y < 1990 ? .04 : y > 2265 ? .04 : .5; // slow down where things happen
    slider.value = Math.min(+slider.max, y + stepY); drawGap(+slider.value);
    if (+slider.value >= +slider.max) { playing = false; $id("gapPlay").textContent = "▶ Play"; }
  }
  drawGap(1969);

  /* ───── 4. Sophon unfolding ───── */
  const PL = `<circle cx="200" cy="165" r="48" fill="#24507d"/><text x="200" y="222" fill="#8a90a6" font-size="11" text-anchor="middle">Trisolaris</text>`;
  const SOPH = [
    ["11 dimensions, folded", "A proton: smaller than an atomic nucleus, with 11 dimensions curled up inside.",
      `${PL}<circle cx="200" cy="60" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #c084fc)"/><text x="210" y="56" fill="#c084fc" font-size="12">proton</text>`],
    ["Attempt 1: unfold into 1D", "It becomes a line thousands of kilometers long, too thin to see and useless.",
      `${PL}<line x1="0" y1="60" x2="400" y2="60" stroke="#c084fc" stroke-width=".8"/>`],
    ["Attempt 2: unfold into 3D", "Giant geometric shapes fill the sky. One becomes a vast mirror that focuses sunlight and burns the capital.",
      `${PL}<path d="M60,40 Q200,120 340,40" fill="none" stroke="#e7ecff" stroke-width="3"/>${[90, 150, 250, 310].map(x => `<line x1="${x}" y1="${x < 200 ? 52 : 52}" x2="200" y2="125" stroke="#ffd27a" stroke-width="1" opacity=".7"/>`).join("")}<circle cx="200" cy="125" r="6" fill="#ff6b4a"/>`],
    ["Attempt 3: unfold into 2D", "A plane bigger than the planet wraps around it. Engineers etch circuits across its surface: the plane becomes a computer.",
      `<defs><pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" fill="none" stroke="#c084fc" stroke-width=".6"/></pattern></defs><rect x="15" y="15" width="370" height="200" rx="40" fill="url(#grid)" opacity=".7"/>${PL}<path d="M40,40 h60 v30 h50 M300,50 h40 v60 h30 M60,190 h50 v-30 h40" stroke="#7ef0c0" fill="none"/>`],
    ["Fold back into 11D", "Refolded, it is a proton-sized supercomputer. Accelerated to near light speed, it heads for Earth.",
      `${PL}<circle cx="120" cy="60" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #c084fc)"/><line x1="128" y1="60" x2="370" y2="60" stroke="#c084fc" stroke-dasharray="4 4"/><path d="M370,54 l12,6 l-12,6z" fill="#c084fc"/><text x="300" y="48" fill="#c7cbe0" font-size="12">→ Earth</text>`],
  ];
  let si = 0;
  function drawSophon() {
    const [title, text, svg] = SOPH[si];
    $id("sophonSvg").innerHTML = svg; $id("sophonStep").textContent = `Step ${si + 1}/${SOPH.length} · ${title}`; $id("sophonText").textContent = text;
    $id("sophonPrev").disabled = si === 0; $id("sophonNext").disabled = si === SOPH.length - 1;
  }
  $id("sophonPrev").onclick = () => { si = Math.max(0, si - 1); drawSophon(); };
  $id("sophonNext").onclick = () => { si = Math.min(SOPH.length - 1, si + 1); drawSophon(); };
  drawSophon();

  /* ───── The xenobiology file: clues stamped by how far you can trust them ───── */
  const BIO_ST = {
    canon: ["Canon · the trilogy", "#4fc08d"],
    show: ["Netflix series", "#e5484d"],
    baoshu: ["4th book · not canon", "#f2c14e"],
    rumor: ["Unverified", "#9ca3af"],
    unknown: ["Redacted · never revealed", "#7d86a8"],
  };
  const BIO = [
    { st: "unknown", t: "Appearance", redacted: "Body plan, size, limbs, eyes, skin",
      reveal: "The trilogy never describes a Trisolaran body. Not once. We only meet stand-ins: the human avatars of the Three Body game, and Tomoko, a robot built to look like a Japanese woman. Even Yun Tianming, who lives among them for centuries, never tells. <b>Baoshu's answer</b> is in the yellow file below.", src: "All three books" },
    { st: "canon", t: "Dehydration", src: "The Three-Body Problem",
      d: "When a Chaotic Era comes, they expel the water from their bodies and dry into light, fibrous husks that can be stored for years or even centuries. Soaked in water when a Stable Era returns, they come back to life. Evolution's answer to a world nobody can predict." },
    { st: "canon", t: "No organs of speech", src: "The Dark Forest · prologue",
      d: "They tell Mike Evans they have no organs of communication at all. Their brains give off ‘thought waves’ that others perceive directly, so to them thinking and speaking are the same act. <i>“Human communication organs are but an evolutionary deficiency.”</i>" },
    { st: "canon", t: "Lying is alien", src: "The Dark Forest · prologue",
      d: "Evans tells them a fairy tale in which a wolf tricks children into opening the door. They can't follow it: if thoughts are visible, how can a trick work? Once they understand that humans hide their thoughts and deceive, their verdict is: <i>“I am afraid of you.”</i>" },
    { st: "canon", t: "They learned to lie", src: "Death's End",
      d: "By the end of the Deterrence Era, “Trisolarans were no longer creatures of transparent thought.” Two centuries of studying human culture taught them strategy: lies, ruses and tricks." },
    { st: "canon", t: "Reproduction", src: "Death's End",
      d: "Two partners meld their bodies into one. The combined body then splits into three to five new lives." },
    { st: "canon", t: "No childhood", src: "Death's End",
      d: "Newborns inherit part of their parents' memories and are fairly mature from birth: Trisolarans really don't have a childhood. A strange audience for Tianming's fairy tales." },
    { st: "canon", t: "Emotion as weakness", src: "The Three-Body Problem",
      d: "Civilization after civilization destroyed by its suns produced a society where survival comes first and the individual counts for almost nothing. Emotion is a weakness. Yet Listener 1379 pities Earth enough to warn it. The feelings exist; they are just dangerous." },
    { st: "show", t: "The San-Ti", src: "3 Body Problem · S1E4 “Our Lord”",
      d: "The series calls them San-Ti (三体, ‘three bodies’) and never shows them either. Mike Evans reads them <i>Little Red Riding Hood</i>, and they decide it is ‘a lie about a liar’. Their conclusion: <i>“A liar cannot be trusted. We are afraid of you.”</i> The show implies they communicate by thought but never confirms it." },
    { st: "baoshu", t: "The size of a grain of rice", src: "The Redemption of Time",
      d: "Tianming becomes the first human to see a Trisolaran. They are tiny, about the size of a grain of rice. The species that called humanity ‘bugs’ is, physically, the bug." },
    { st: "baoshu", t: "A human brain as a textbook", src: "The Redemption of Time",
      d: "Tianming's captured brain was their only human specimen. They studied his mind to learn how humans think, and how they deceive." },
    { st: "unknown", t: "Lifespan", redacted: "Natural lifespan in Earth years",
      reveal: "Never stated in the trilogy. Fan wikis often quote 70–80 Earth years, not counting time spent dehydrated, but we couldn't trace that number to the books. <b>Treat it as a rumor.</b>", src: "—" },
    { st: "unknown", t: "Senses", redacted: "Vision, hearing, range of thought waves",
      reveal: "Unknown. They watch their sky closely enough to fear ‘flying stars’, so they sense light somehow, but the books never say how. Nor how far thought waves reach.", src: "—" },
    { st: "rumor", t: "Mirror skin?", src: "Fan wikis",
      d: "Fan wikis claim that one earlier Trisolaran civilization had reflective, mirror-like skin to survive the glare of several suns. A neat idea, but we couldn't find the passage in the books. Unconfirmed." },
  ];
  const bioOn = new Set(Object.keys(BIO_ST)), declassified = new Set();
  $id("bioFilters").innerHTML = Object.entries(BIO_ST).map(([k, [l, c]]) => `<label class="chip" style="--c:${c}"><input type="checkbox" data-st="${k}" checked><i></i>${l}</label>`).join("");
  function drawBio() {
    $id("bioCards").innerHTML = BIO.map((b, i) => !bioOn.has(b.st) ? "" :
      `<div class="card bio" style="--c:${BIO_ST[b.st][1]}"><span class="stamp">${BIO_ST[b.st][0]}</span><h4>${b.t}</h4>
        ${b.redacted && !declassified.has(i) ? `<p><span class="redact">${b.redacted}</span></p><button class="btn" data-decl="${i}">Declassify</button>` : `<p>${b.d || b.reveal}</p>`}
        <span class="meta">${b.src}</span></div>`).join("") || `<p class="muted">No files match these filters.</p>`;
  }
  $id("bioFilters").onchange = e => { const k = e.target.dataset.st; if (k) { e.target.checked ? bioOn.add(k) : bioOn.delete(k); drawBio(); } };
  $id("bioCards").onclick = e => { const b = e.target.closest("[data-decl]"); if (b) { declassified.add(+b.dataset.decl); drawBio(); } };
  drawBio();
  const QS = [
    ["If their thoughts are visible, how did they learn to lie?", "Death's End says they learned strategy from human culture. It never explains whether they also learned to hide their thoughts from each other, or only to deceive humans."],
    ["What do they look like?", "The trilogy keeps it secret, perhaps on purpose. Baoshu's tiny Trisolarans are one answer; Liu Cixin never gave his."],
    ["Why call humans ‘bugs’?", "In Book I it's psychological warfare, and it backfires: bugs have never been defeated. Baoshu adds the irony that they are the small ones."],
    ["What does a species with no childhood make of fairy tales?", "Maybe that's part of why Tianming's tales slipped past them. See the Fairy Tales tab."],
    ["Can they feel love or loyalty?", "Listener 1379's pity says at least some of them can. Their society just treats it as a defect."],
    ["What became of them after their star was destroyed?", "The trilogy barely follows what is left of Trisolaran civilization once its sun dies. The series may tell its own version."],
  ];
  $id("bioQs").innerHTML = QS.map(([q, a]) => `<details class="bioq"><summary>${q}</summary><p>${a}</p></details>`).join("");

  /* ───── The human computer: soldiers as logic gates, then the whole army ───── */
  const GATES = {
    and: { rule: "AND: raise white only if both inputs raise white.", ins: 2, outs: [["Output", (a, b) => a & b]] },
    or: { rule: "OR: raise white if at least one input raises white.", ins: 2, outs: [["Output", (a, b) => a | b]] },
    not: { rule: "NOT: raise the opposite of the input.", ins: 1, outs: [["Output", a => 1 - a]] },
    add: { rule: "Adding 1 + 1 with four soldiers. SUM raises white if exactly one input is white (an XOR rule); CARRY raises white if both are (an AND rule).",
      ins: 2, outs: [["Sum", (a, b) => a ^ b], ["Carry", (a, b) => a & b]] },
  };
  let gateType = "and", ins = [1, 0], pending = false;
  const soldier = (x, flag, label, inIdx) => {
    const col = flag === null ? "#555" : flag ? "#f4f1e8" : "#141414";
    return `<g class="hcs${inIdx != null ? " hcin" : ""}" ${inIdx != null ? `data-in="${inIdx}"` : ""} transform="translate(${x},150)">
      <rect x="-22" y="-118" width="80" height="150" fill="transparent"/>
      <line x1="14" y1="-26" x2="${flag === null ? 30 : 20}" y2="${flag === null ? -50 : -96}" stroke="#9a8466" stroke-width="3" stroke-linecap="round"/>
      <path class="hcflag" d="M${flag === null ? "30,-50 q10,6 22,4 v14 q-12,2 -22,-4z" : "20,-96 q14,-6 30,0 v20 q-16,6 -30,0z"}" fill="${col}" stroke="#8a8a8a" stroke-width="1"/>
      <circle cx="0" cy="-40" r="9" fill="#d4b98c"/>
      <path d="M-12,-28 h24 l5,42 h-34z" fill="#8a5a2e"/>
      <text y="34" text-anchor="middle" fill="#c7cbe0" font-size="12">${label}</text>
      <text x="34" y="${flag === null ? -28 : -72}" fill="#f2c14e" font-size="13" font-weight="700">${flag === null ? "…" : flag}</text></g>`;
  };
  function drawGate() {
    const g = GATES[gateType], vals = g.ins === 1 ? [ins[0]] : ins, outs = g.outs.map(([, f]) => f(...vals));
    const inX = g.ins === 1 ? [90] : gateType === "add" ? [50, 135] : [60, 150], outX = gateType === "add" ? [300, 385] : [340];
    const arrows = outX.map(ox => inX.map(ix => `<path d="M${ix + 30},120 C${(ix + ox) / 2},${120} ${(ix + ox) / 2},120 ${ox - 30},120" stroke="#3a4260" stroke-dasharray="4 4" fill="none"/>`).join("")).join("");
    $id("hcGate").innerHTML = arrows + inX.map((x, i) => soldier(x, vals[i], g.ins === 1 ? "Input" : `Input ${i + 1}`, i)).join("") +
      outX.map((x, i) => soldier(x, pending ? null : outs[i], g.outs[i][0])).join("");
    $id("hcRule").textContent = g.rule;
    const rows = g.ins === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    $id("hcTable").innerHTML = `<tr>${(g.ins === 1 ? ["In"] : ["In 1", "In 2"]).map(h => `<th>${h}</th>`).join("")}${g.outs.map(([n]) => `<th>${n}</th>`).join("")}</tr>` +
      rows.map(r => `<tr class="${r.every((v, i) => v === vals[i]) ? "on" : ""}">${r.map(v => `<td>${v}</td>`).join("")}${g.outs.map(([, f]) => `<td>${f(...r)}</td>`).join("")}</tr>`).join("");
    $id("hcNote").textContent = gateType === "add" ? `${vals[0]} + ${vals[1]} = ${outs[1]}${outs[0]} in binary (carry, then sum). Chain enough of these and an army can do arithmetic.` :
      "Von Neumann uses these same three soldiers to show every basic gate. Everything a computer does is built from them.";
  }
  $id("hcGate").onclick = e => {
    const s = e.target.closest("[data-in]"); if (!s || pending) return;
    ins[+s.dataset.in] ^= 1; pending = true; drawGate();
    setTimeout(() => { pending = false; drawGate(); }, 420); // the output soldier needs a moment to react
  };
  $id("hcModes").onclick = e => {
    const b = e.target.closest("[data-gate]"); if (!b) return;
    gateType = b.dataset.gate; document.querySelectorAll("[data-gate]").forEach(x => x.classList.toggle("on", x === b)); drawGate();
  };
  drawGate();

  // the army: a field of flags that ripples while Qin 1.0 runs, then the tri-solar syzygy
  const army = $id("hcArmy");
  let run = null; // { t0 } while running
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function drawArmy(t) {
    if (!visible(army)) return;
    const f = fitCanvas(army); if (!f) return;
    const { ctx, w, h } = f, G = 7, cols = Math.floor((w - 20) / G), rows = Math.floor((h - 20) / G), ox = (w - cols * G) / 2, oy = (h - rows * G) / 2;
    const el = run ? (t - run.t0) / 1000 : 0, month = Math.min(16, el), done = run && el > 16, flash = run && el > 18.5 ? Math.min(1, (el - 18.5) / .8) : 0;
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    const cpu = [cols * .38, rows * .28, cols * .62, rows * .72];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const inCpu = x > cpu[0] && x < cpu[2] && y > cpu[1] && y < cpu[3], bus = (y % 8 === 0 && !inCpu) || (x % 14 === 0 && !inCpu);
      let on = 0;
      if (run && !done) on = Math.sin(x * .35 - el * (inCpu ? 9 : 5) + hash(x, y) * (inCpu ? 6 : 2.5) + (bus ? y : 0)) > (inCpu ? 0 : .55) ? 1 : 0;
      ctx.fillStyle = on ? (inCpu ? "#fff6d8" : "#e9e4d4") : bus ? "#2a2c33" : inCpu ? "#2b2618" : "#1a1c24";
      ctx.fillRect(ox + x * G, oy + y * G, 3, 3);
    }
    ctx.strokeStyle = "#f2c14e66"; ctx.strokeRect(ox + cpu[0] * G - 4, oy + cpu[1] * G - 4, (cpu[2] - cpu[0]) * G + 4, (cpu[3] - cpu[1]) * G + 4);
    ctx.fillStyle = "#f2c14e"; ctx.font = "11px system-ui"; ctx.fillText("CPU", ox + cpu[0] * G, oy + cpu[1] * G - 8);
    if (flash) { ctx.fillStyle = `rgba(255,236,190,${flash * .85})`; ctx.fillRect(0, 0, w, h); }
    if (!run) $id("hcStat").textContent = "30,000,000 soldiers, standing by.";
    else if (!done) $id("hcStat").textContent = `Qin 1.0 running · month ${Math.max(1, Math.ceil(month))} of 16`;
    else if (el < 18.5) $id("hcStat").textContent = "Result after 16 months: a year-long Stable Era ahead. The Emperor celebrates.";
    else $id("hcStat").textContent = "Then the three suns line up: a tri-solar syzygy. Civilization #184 is destroyed.";
    if (run && el > 21) { run = null; $id("hcRun").textContent = "↺ Run it again"; }
  }
  $id("hcRun").onclick = () => { run = { t0: performance.now() }; $id("hcRun").textContent = "⚔ Running…"; };

  /* ───── 5. Technology cards ───── */
  const TECH = {
    "Trisolaran": ["#c084fc", [
      ["💧 Dehydration", "Survive Chaotic Eras by drying out; rehydrate when a Stable Era returns.", "I"],
      ["✦ Sophons", "Proton-sized AI supercomputers. They spy, sabotage particle physics, project images, and give Trisolaris a real-time entangled link to Earth.", "I–III"],
      ["🚀 The Fleet", "About 1,000 warships at up to ~1% of light speed, on a ~450-year voyage. Humans track it by the wake it leaves in an interstellar dust cloud.", "I–II"],
      ["💠 The Droplet", "A probe of strong-interaction material: a mirror-perfect teardrop a few meters long, built from matter far stronger than ordinary atoms. One droplet destroys almost the entire human fleet.", "II"],
      ["☀ Sun blockade", "Droplets jam the Sun's amplification so Earth can't broadcast to the stars.", "II"],
      ["🤖 Tomoko", "A humanoid robot driven by sophons: Trisolaris' face on Earth after deterrence fails.", "III"],
    ]],
    "Human": ["#5aa9e6", [
      ["🧵 Flying Blade", "Wang Miao's ultra-thin, ultra-strong nanofilament. Strung across the Panama Canal, it slices the Judgment Day.", "I"],
      ["❄ Hibernation", "Sleeping through centuries: how Luo Ji, Zhang Beihai, Da Shi and Cheng Xin reach the future.", "II–III"],
      ["🛰 Crisis Era build-up", "Space elevators, fusion drives, and a 2,000-ship Combined Fleet, all with physics frozen at its pre-sophon limit.", "II"],
      ["〰 Gravitational-wave antennas", "The deterrence transmitter: a broadcast that can't be blocked. The warship Gravity carries one.", "II–III"],
      ["🧠 Staircase Project", "Nuclear bombs pushing a light sail, to send one brain (Tianming's) to the fleet.", "III"],
      ["🌀 Curvature propulsion", "Lightspeed travel by bending space. Wade's forbidden project; Halo escapes with it.", "III"],
    ]],
    "Cosmic": ["#9ca3af", [
      ["☄ Photoid", "A small object accelerated to near light speed. One hit destroys a star.", "III"],
      ["📄 Dual-vector foil", "A tiny 2D sheet that collapses 3D space into 2D. Everything falls in and flattens.", "III"],
      ["⚫ Black domain", "Slow light around your star system so nothing can leave: safe, and isolated forever.", "III"],
      ["🔲 4D fragments", "Pockets of higher-dimensional space drifting through ours. From inside, you can see into everything.", "III"],
      ["🫧 Pocket universes", "Small private universes, like Universe 647, Tianming's gift to Cheng Xin.", "III"],
      ["🌌 Physics as a weapon", "Collapsing dimensions and slowing light: the weapons that scarred the universe.", "III"],
    ]],
  };
  $id("techCards").innerHTML = Object.entries(TECH).map(([g, [col, list]]) =>
    `<div class="techgroup" style="color:${col}">${g} technology</div><div class="cards">${list.map(([n, d, b]) =>
      `<div class="card" style="--c:${col}"><h4>${n}</h4><p>${d}</p><span class="meta">Book ${b}</span></div>`).join("")}</div>`).join("");

  const gate = frameGate();
  (function loop(t) { requestAnimationFrame(loop); if (gate(t)) { drawSim(); tickGap(); drawArmy(t); } })(0);
})();

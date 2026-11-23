// Solar System tab: a top-down map (log-scaled distances) with the trilogy's events pinned where they happen,
// plus the Bunker Era 67 dimensional strike as an animation.
(() => {
  const $id = id => document.getElementById(id);
  const W = 860, H = 780, CX = 430, CY = 390, AU_MAX = 39.5;
  const rad = a => 34 + 300 * Math.log(1 + a) / Math.log(1 + AU_MAX); // log scale so Mercury and Pluto both fit
  const PLANETS = [
    ["Mercury", .39, 200, 3, "#b5a48a"], ["Venus", .72, 320, 4.5, "#e3c07a"], ["Earth", 1, 35, 5, "#5aa9e6"], ["Mars", 1.52, 140, 4, "#d9694a"],
    ["Jupiter", 5.2, 250, 11, "#d8b48a"], ["Saturn", 9.58, 335, 9, "#e4cf94"], ["Uranus", 19.2, 105, 7, "#9fd6db"], ["Neptune", 30.1, 190, 7, "#5b7fe0"], ["Pluto", 39.5, 296, 2.5, "#c9b8a6"],
  ].map(([name, a, deg, r, col]) => { const t = deg * Math.PI / 180; return { name, a, r, col, x: CX + Math.cos(t) * rad(a), y: CY + Math.sin(t) * rad(a) }; });
  const P = Object.fromEntries(PLANETS.map(p => [p.name, p]));
  const at = (deg, a) => { const t = deg * Math.PI / 180; return [CX + Math.cos(t) * rad(a), CY + Math.sin(t) * rad(a)]; };

  const MARKERS = [
    { id: "sun", label: "The Sun", xy: [CX, CY], entries: [
      [1, "1971", "The Sun as an amplifier", "Ye Wenjie discovers that the Sun can amplify radio waves, and uses it to send humanity's first message to the stars."],
      [2, "Crisis Era", "A spell on a star", "Luo Ji uses the same trick to broadcast the location of star 187J3X1. Long after, it is found destroyed."],
      [2, "Crisis Year 205", "The Sun goes quiet", "A Trisolaran probe parks between the Sun and Earth and blocks the Sun's use as an antenna."],
      [2, "End of the Crisis Era", "Luo Ji's bombs", "Thousands of nuclear bombs in orbit around the Sun, officially the ‘Snow Project’, wired to Luo Ji's heartbeat. If he dies, their blasts broadcast Trisolaris's coordinates."]] },
    { id: "mercury", label: "Mercury", xy: [P.Mercury.x, P.Mercury.y], entries: [
      [2, "Crisis Era", "Rey Diaz's test", "Wallfacer Rey Diaz test-fires one of his giant bombs on Mercury. His real plan: blast the planet into the Sun and hold the Solar System hostage."]] },
    { id: "earth", label: "Earth", xy: [P.Earth.x, P.Earth.y], entries: [
      [1, "1969–1979", "Red Coast Base", "From a secret radar base in China, Ye Wenjie sends the message, receives the warning ‘Do not answer!’, and answers anyway."],
      [3, "Deterrence Era 62", "The sword passes", "45 km beneath the Gobi Desert, Luo Ji hands the switch to Cheng Xin. Minutes later the droplets strike, and she doesn't press it."],
      [3, "Post-Deterrence", "Australia", "With deterrence gone, Trisolaris orders all of humanity into Australia."]] },
    { id: "doom", label: "Doomsday Battle", xy: at(282, 7.2), entries: [
      [2, "Crisis Year 205", "The Doomsday Battle", "One droplet destroys 2,013 of humanity's 2,015 warships, out in the realm of the giant planets. Sources place it near the Jupiter base or near Saturn's orbit. See the Dark Forest tab."]] },
    { id: "giants", label: "Bunker cities", xy: [P.Jupiter.x, P.Jupiter.y], entries: [
      [3, "Bunker Era", "The Bunker Project", "Humanity moves into space cities in the shadows of the gas giants, so that if the Sun is destroyed, a planet will shield them from the blast."],
      [3, "Bunker Era 67", "No shadow is deep enough", "The attack, when it comes, is not a photoid on the Sun. It is space itself collapsing, and the bunkers are inside it."]] },
    { id: "pluto", label: "Pluto", xy: [P.Pluto.x, P.Pluto.y], entries: [
      [3, "Bunker Era 67", "The last museum", "Luo Ji, now ancient, keeps a record of human civilization on Pluto. Cheng Xin and AA visit him there and learn their ship carries the only lightspeed engine left from Wade's work."],
      [3, "Bunker Era 67", "Halo escapes", "Cheng Xin and AA fly away from Pluto at the speed of light as the Solar System falls into two dimensions."]] },
    { id: "foil", label: "The slip of paper", xy: [P.Pluto.x + 46, P.Pluto.y - 22], entries: [
      [3, "Bunker Era 67", "A dual-vector foil", "A small strip, no bigger than a card, arrives near Pluto. Where it touches, three-dimensional space starts collapsing into two dimensions, and the collapse spreads. Press ▶ to watch."]] },
    { id: "tri", label: "Trisolaris, 4.2 ly →", xy: [W - 92, 160], arrow: [W - 18, 110], entries: [
      [1, "1971 →", "Toward Trisolaris", "Messages, sophons, droplets and the fleet all come from Alpha Centauri, 4.2 light-years away. (Direction on this map is illustrative.)"]] },
    { id: "flee", label: "← Ships fleeing", xy: [90, H - 60], arrow: [18, H - 18], entries: [
      [2, "Crisis Year 205", "The Dark Battle", "Beyond the Kuiper Belt, the ships fleeing the Solar System turn on each other. See the Dark Forest tab."]] },
  ];

  $id("solarWrap").innerHTML = `
    <p class="kicker">All three books · one map</p>
    <h2 class="title">The Solar System</h2>
    <p class="lead">Where things happen. Click a marker to open its file, or watch the end of it all.</p>
    <div class="ssgrid">
      <div class="fig" style="margin-top:0">
        <div class="svgscroll"><svg id="ssMap" viewBox="0 0 ${W} ${H}"></svg></div>
        <div class="controls"><button class="btn" id="ssPlay">▶ Bunker Era 67: the dimensional strike</button><span class="muted" id="ssCap" style="font-size:13px"></span></div>
        <div class="sslegend">${Object.entries(BOOK).map(([, b]) => `<span><i style="--c:${b.color}"></i>${b.short} · ${b.title}</span>`).join("")}<span>Distances on a log scale, not to size.</span></div>
      </div>
      <div id="ssInfo"></div>
    </div>`;

  const svg = $id("ssMap");
  // 2D "painting" layer: swirls in the colors of the flattened worlds, revealed by a growing clip circle
  const SW = Array.from({ length: 140 }, (_, i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453, r1 = s - Math.floor(s), s2 = Math.sin(i * 78.233) * 12345.678, r2 = s2 - Math.floor(s2);
    const x = r1 * W, y = r2 * H, rr = 10 + (i % 7) * 9, col = ["#f2c14e", "#5b7fe0", "#9fd6db", "#e7ecff", "#2a4fa0", "#d8b48a"][i % 6];
    return `<path d="M${x - rr},${y} a${rr},${rr * .8} 0 1,1 ${rr * 1.6},${rr * .3} a${rr * .6},${rr * .5} 0 1,1 ${-rr * .9},${-rr * .2}" fill="none" stroke="${col}" stroke-width="${1.5 + (i % 3) * .7}" opacity=".38"/>`;
  }).join("");
  const markerColor = m => { const books = new Set(m.entries.map(e => e[0])); return books.size > 1 ? "#e7e9f0" : BOOK[[...books][0]].color; };

  svg.innerHTML = `<defs>
      <radialGradient id="ssSun"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffd27a00"/></radialGradient>
      <radialGradient id="ssPaint"><stop offset="0" stop-color="#1d3b8a"/><stop offset="1" stop-color="#0b1840"/></radialGradient>
      <clipPath id="ssClip"><circle id="ssFront" cx="${P.Pluto.x + 46}" cy="${P.Pluto.y - 22}" r="0"/></clipPath>
    </defs>
    ${PLANETS.map(p => `<circle cx="${CX}" cy="${CY}" r="${Math.hypot(p.x - CX, p.y - CY)}" fill="none" stroke="#1e2433" stroke-dasharray="${p.a > 4 ? "2 5" : "none"}"/>`).join("")}
    <circle cx="${CX}" cy="${CY}" r="${rad(48)}" fill="none" stroke="#2a3048" stroke-width="10" opacity=".35"/>
    <text x="${CX}" y="${CY - rad(48) - 12}" fill="#5b6385" font-size="15" text-anchor="middle">Kuiper Belt</text>
    <circle cx="${CX}" cy="${CY}" r="40" fill="url(#ssSun)"/>
    ${["Jupiter", "Saturn", "Uranus", "Neptune"].map(n => { const p = P[n], dx = (p.x - CX) / Math.hypot(p.x - CX, p.y - CY), dy = (p.y - CY) / Math.hypot(p.x - CX, p.y - CY);
      return [0, 1, 2].map(k => `<circle cx="${p.x + dx * (p.r + 6 + k * 4) - dy * (k - 1) * 4}" cy="${p.y + dy * (p.r + 6 + k * 4) + dx * (k - 1) * 4}" r="1.6" fill="#8fa8ff"/>`).join(""); }).join("")}
    ${PLANETS.map(p => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${p.col}"/>${p.name === "Saturn" ? `<ellipse cx="${p.x}" cy="${p.y}" rx="${p.r * 2}" ry="${p.r * .6}" fill="none" stroke="#e4cf94aa"/>` : ""}
      ${["Mercury", "Earth", "Pluto"].includes(p.name) ? "" : `<text x="${p.x}" y="${p.y > CY + 150 ? p.y - p.r - 9 : p.y + p.r + 18}" fill="#8a90a6" font-size="15" text-anchor="middle">${p.name}</text>`}`).join("")}
    <g clip-path="url(#ssClip)"><rect width="${W}" height="${H}" fill="url(#ssPaint)"/>${SW}
      ${[{ x: CX, y: CY, r: 13, col: "#ffd27a" }, ...PLANETS].map(p => `<ellipse cx="${p.x}" cy="${p.y}" rx="${p.r * 5 + 10}" ry="${p.r * 1.6 + 3}" fill="${p.col}" opacity=".85"/><ellipse cx="${p.x}" cy="${p.y}" rx="${p.r * 3 + 6}" ry="${p.r + 2}" fill="none" stroke="#fff" opacity=".35"/>`).join("")}</g>
    <path id="ssHalo" d="" stroke="#e7ecff" stroke-width="2.5" fill="none" opacity="0"/>
    <rect id="ssFoil" x="0" y="0" width="9" height="5" fill="#fff" opacity="0"/>
    ${MARKERS.map(m => `<g class="ssm" data-m="${m.id}" transform="translate(${m.xy[0]},${m.xy[1]})">
      ${m.arrow ? `<line x1="0" y1="0" x2="${m.arrow[0] - m.xy[0]}" y2="${m.arrow[1] - m.xy[1]}" stroke="${markerColor(m)}" stroke-dasharray="4 4"/>` : ""}
      <circle r="16" fill="transparent"/><circle class="ring" r="${m.id === "sun" ? 48 : 11}" stroke="${markerColor(m)}"/><circle r="2.5" fill="${markerColor(m)}"/>
      <text y="${m.id === "sun" ? -56 : -18}" fill="${markerColor(m)}" font-size="16" font-weight="600" text-anchor="middle" paint-order="stroke" stroke="#03040a" stroke-width="4">${m.label}</text></g>`).join("")}`;

  const info = $id("ssInfo");
  const showMarker = id => {
    svg.querySelectorAll(".ssm").forEach(g => g.classList.toggle("on", g.dataset.m === id));
    const m = MARKERS.find(x => x.id === id);
    info.innerHTML = `<div class="wlabel">Location file</div><h4 style="font:600 22px Georgia,serif;margin:2px 0 12px">${m.label.replace(/[→]/g, "").trim()}</h4>` +
      m.entries.map(([b, when, title, text]) => `<div class="card" style="--c:${BOOK[b].color}"><span class="meta" style="margin:0 0 4px">${BOOK[b].short} · ${when}</span><h4>${title}</h4><p>${text}</p></div>`).join("");
  };
  const intro = () => { svg.querySelectorAll(".ssm").forEach(g => g.classList.remove("on"));
    info.innerHTML = `<div class="wlabel">How to read the map</div><p>Each ring marks a place where the story happens. Its color is the book; white means more than one. The tiny blue dots beside the gas giants are the Bunker cities of Book III.</p><p class="muted" style="font-size:13px">Planets sit at fixed, illustrative positions. Real distances grow so fast (Pluto is a hundred times farther out than Mercury) that the map uses a log scale.</p>`; };
  svg.addEventListener("click", e => { const g = e.target.closest(".ssm"); g ? showMarker(g.dataset.m) : intro(); });
  intro();

  // the dimensional strike: the foil lands near Pluto, Halo leaves at light speed, then the 2D region swallows everything
  const FOIL = [P.Pluto.x + 46, P.Pluto.y - 22], REACH = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - FOIL[0], y - FOIL[1])));
  const BODIES = [{ x: CX, y: CY }, ...PLANETS], far = o => Math.hypot(o.x - FOIL[0], o.y - FOIL[1]);
  const LAST = Math.max(...BODIES.map(far)) + 30; // the front stops once every world is inside
  const caption = (el, r) => el < 1.6 ? "Bunker Era 67. A slip of paper drifts in near Pluto."
    : el < 3.4 ? "Halo leaves Pluto at the speed of light, carrying Cheng Xin and AA."
    : r < far(P.Jupiter) ? "The collapse spreads. Inside it, escape velocity is the speed of light: nothing slower gets out."
    : r < far(P.Earth) ? "The giant planets and their Bunker cities fall into the plane."
    : r < LAST - 30 ? "Then the inner planets, Earth, and the Sun."
    : "The Solar System is now a vast, flat painting, often compared to Van Gogh's The Starry Night.";
  let strike = null;
  $id("ssPlay").onclick = () => { strike = { t0: performance.now() }; $id("ssPlay").textContent = "↺ Replay"; };
  (function tick() {
    requestAnimationFrame(tick);
    if (!strike || !svg.closest("section:not([hidden])")) return;
    const el = (performance.now() - strike.t0) / 1000, foil = $id("ssFoil"), halo = $id("ssHalo");
    const fp = Math.min(1, el / 1.6);
    foil.setAttribute("x", FOIL[0] + 140 * (1 - fp)); foil.setAttribute("y", FOIL[1] - 120 * (1 - fp)); foil.setAttribute("opacity", el < 3 ? 1 : 0);
    const hp = Math.max(0, Math.min(1, (el - 1.6) / 1.2));
    halo.setAttribute("opacity", hp > 0 && el < 6 ? 1 - Math.max(0, el - 4) / 2 : 0);
    const dl = Math.hypot(P.Pluto.x - CX, P.Pluto.y - CY), ux = (P.Pluto.x - CX) / dl, uy = (P.Pluto.y - CY) / dl; // straight out, away from the Sun
    halo.setAttribute("d", `M${P.Pluto.x},${P.Pluto.y} L${P.Pluto.x + ux * 520 * hp},${P.Pluto.y + uy * 520 * hp}`);
    const rp = Math.max(0, Math.min(1, (el - 2.6) / 12)), r = LAST * (rp * rp * .55 + rp * .45); // 2D front: slow at first, then sweeping inward
    $id("ssFront").setAttribute("r", el > 15 ? REACH : r);
    $id("ssCap").textContent = caption(el, r);
    if (el > 16) strike = null;
  })();
})();

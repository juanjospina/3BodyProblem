// Fairy Tales tab: Yun Tianming's three stories, a symbol decoder, and two physics mini-sims.
(() => {
  const $id = id => document.getElementById(id);
  const visible = el => el.offsetParent !== null;

  // what each hidden idea is, and what it tells humanity to do
  const CONCEPT = {
    curv: { label: "Curved space → curvature drive", color: "#2dd4bf" },
    c:    { label: "The speed of light, a constant", color: "#f2c14e" },
    slow: { label: "Slow light → black hole", color: "#8fa8ff" },
    flat: { label: "Dimensional strike (3D → 2D)", color: "#e5484d" },
    me:   { label: "Tianming & Cheng Xin", color: "#c084fc" },
  };
  const PATH = {
    ships: { label: "Build lightspeed ships and flee", color: "#2dd4bf" },
    domain: { label: "Make a black domain: a ‘safety notice’", color: "#8fa8ff" },
    threat: { label: "Beware the 2D weapon: only light speed escapes it", color: "#e5484d" },
    love: { label: "A personal message to Cheng Xin", color: "#c084fc" },
  };
  const STATUS = {
    idc: ["Decoded by the IDC", "#4fc08d"],
    late: ["Understood too late", "#e5484d"],
    reader: ["Readers' interpretation", "#c084fc"],
  };

  // the decoder: symbol → first layer → hidden meaning
  const SYM = {
    soap: { name: "The soap", concepts: ["curv"], status: "idc",
      layer: "A classic children's trick: put a dab of soap at the back of a paper boat. The soap lowers the water's surface tension behind it, and the stronger tension in front pulls the boat forward.",
      meaning: "Curvature propulsion. Flatten space behind a ship, and the more curved space ahead pulls it forward, all the way up to light speed. This is a ‘double-layered metaphor’: soap → paper boat → spaceship." },
    boat: { name: "Crossing the sea by boat", concepts: ["curv"], status: "idc",
      layer: "The princess's boat, the soap and the sea together form the picture of a soap-driven paper boat.",
      meaning: "A ship moved not by pushing but by changing the medium around it: curvature propulsion." },
    paper: { name: "Snow-wave paper", concepts: ["curv"], status: "idc",
      layer: "The magic paper is always curled up; it has to be pressed flat before it can be used.",
      meaning: "Curved space. It confirmed the soap-boat reading: the tales were talking about the curvature of space itself. (Some readers also link this ‘paper’ to the dual-vector foil.)" },
    obsidian: { name: "The obsidian slab", concepts: ["curv"], status: "idc",
      layer: "Only a slab of obsidian from He'ershingenmosiken can press the curled paper flat.",
      meaning: "Flattening, or lowering, the curvature of space, which is exactly what a curvature drive does behind a ship." },
    umbrella: { name: "The black umbrella", concepts: ["c"], paths: ["threat"], status: "idc",
      layer: "It stays open only while spinning, never too fast and never too slow, like a centrifugal governor, the device that keeps an engine at a constant speed.",
      meaning: "On its own it only pointed to ‘a constant’. Paired with Prince Deep Water, it became the speed of light (a ‘two-dimensional metaphor’, two clues fixing one meaning). Its real lesson, that whoever holds it can't be painted (only light speed escapes the 2D collapse), was understood only when the Solar System began to fall." },
    deepwater: { name: "Prince Deep Water's size", concepts: ["c"], paths: ["threat"], status: "idc",
      layer: "He doesn't obey perspective: near or far, he always looks the same size.",
      meaning: "Something that doesn't change with your frame of reference: the constant speed of light. And he is the only one who cannot be painted. Once the 2D weapon came, that meant only lightspeed ships could escape it." },
    hersh: { name: "He'ershingenmosiken", concepts: ["slow"], status: "idc",
      layer: "The only transliterated name in the tales, and everything magical comes from there. A linguist traced it to Helseggen and Moskenes in Norway: the site of the Moskstraumen maelstrom from Edgar Allan Poe's ‘A Descent into the Maelstrom’.",
      meaning: "A whirlpool that nothing escapes: a black hole. Combined with the other clues, it means lowering the speed of light until a region becomes a black hole." },
    bubbles: { name: "The magic bubbles", concepts: ["c", "slow"], status: "reader",
      layer: "Bubbles from the magic tree weigh nothing, fly off the instant they form, and only the fastest horse can catch them. It takes millions of them to make one bar of soap.",
      meaning: "Massless, and the fastest thing there is: light. Catching and collecting the bubbles is read as slowing light down. Bathing in the soap leaves the princess not wanting to move at all: a slowed world." },
    storyless: { name: "The Storyless Kingdom", concepts: ["slow"], paths: ["domain"], status: "idc",
      layer: "It used to be the Story Kingdom. Once cut off from the world, it lost its stories. A story is information.",
      meaning: "A black domain, or ‘light tomb’: lower the speed of light around your star system and nothing, not even information, gets in or out. To the universe, this is a safety notice: a civilization that can never leave is no threat." },
    glutton: { name: "The glutton fish", concepts: ["slow"], paths: ["domain"], status: "idc",
      layer: "Man-eating fish that breed around the island; nobody can come or go any more.",
      meaning: "The barrier that seals the kingdom off: the slow-light zone of a black domain. (Readers also see the dark forest's hunters in them: they destroy anything that enters their water.)" },
    painting: { name: "Painted into a picture", concepts: ["flat"], paths: ["threat"], status: "late",
      layer: "Whatever Needle-Eye paints disappears from the real world into a flat picture.",
      meaning: "A dimensional strike: 3D space collapsing into 2D. The IDC never cracked it. Only as the Solar System began to flatten did a scientist bring up Needle-Eye's paintings, and everyone understood in a flash." },
    needle: { name: "Needle-Eye", concepts: ["flat"], paths: ["threat"], status: "reader",
      layer: "He can paint anything he has seen. In the end, he paints himself into a picture.",
      meaning: "Being seen means being destroyed: the dark forest, and the Singer. Painting himself in hints that dimensional weapons eventually swallow their users too. The universe itself has already been flattened by such wars." },
    ethereal: { name: "Master Ethereal", concepts: ["c"], paths: ["threat"], status: "reader",
      layer: "Already painted, but he doesn't vanish while holding the spinning umbrella. He disappears the moment he gives it away.",
      meaning: "Only staying at light speed keeps you out of the 2D collapse." },
    dewdrop: { name: "Princess Dewdrop", concepts: ["me"], paths: ["love"], status: "reader",
      layer: "The kind heir chosen to rule, who escapes with the umbrella and sails away.",
      meaning: "Cheng Xin herself: chosen as Swordholder, and later one of the few to escape the flattened Solar System." },
    longsail: { name: "Long-Sail", concepts: ["me"], paths: ["love"], status: "reader",
      layer: "Captain of the guard, from He'ershingenmosiken. At the end he sails away with the princess.",
      meaning: "Cheng Xin herself notices it: “Does he think I'm going to sail away somehow? With another man?” It foreshadows her escape and her life with Guan Yifan." },
    tomb: { name: "Tomb Island", concepts: ["me"], paths: ["love"], status: "reader",
      layer: "Where Prince Deep Water was stranded, beyond a sea no one can cross.",
      meaning: "Many readers see Tianming: officially dead, stranded with the Trisolaran fleet, and yet the one who holds the answer." },
  };

  const s = (k, txt) => `<span class="sym" data-s="${k}" style="--c:${CONCEPT[SYM[k].concepts[0]].color}">${txt}</span>`;
  const TALES = [
    { n: 1, title: "The New Royal Painter", paras: [
      `There was an island kingdom called ${s("storyless", "the Storyless Kingdom")}. The king had three children. ${s("deepwater", "Prince Deep Water")} had gone to ${s("tomb", "Tomb Island")} and could never come back, because ${s("glutton", "glutton fish")} later surrounded the kingdom. Prince Ice Sand was strange and cruel. Kind ${s("dewdrop", "Princess Dewdrop")} was chosen as heir.`,
      `Ice Sand brought in a new royal painter: ${s("needle", "Needle-Eye")}, from ${s("hersh", "He'ershingenmosiken")}. Needle-Eye could paint anything he had seen, and whatever he ${s("painting", "painted into a picture vanished from the real world")}. He needed a wolf-hair brush, paints, and ${s("paper", "snow-wave paper")}, all from He'ershingenmosiken. The paper was always curled; only ${s("obsidian", "an obsidian slab")} from the same land could press it flat.`,
      `He painted the king, the queen and the ministers. He had even painted his own teacher, ${s("ethereal", "Master Ethereal")}. But the master hadn't vanished, because he carried ${s("umbrella", "a strange black umbrella that never stopped spinning")}. It stayed open only while it spun, and never too fast or too slow.`,
      `The master warned the princess, and the captain of the guard, ${s("longsail", "Long-Sail")}, confirmed that the king and queen were gone. “Take the umbrella and find Prince Deep Water,” said the master. “He is the only one who cannot be painted.” The moment he handed it over, he vanished. With Long-Sail and her nurse, Auntie Wide, the princess fled toward Tomb Island.`] },
    { n: 2, title: "The Glutton's Sea", paras: [
      `Long ago, many wonders came to the kingdom from He'ershingenmosiken. One was ${s("soap", "soap")}. There, ${s("bubbles", "a magic tree makes bubbles that weigh nothing at all")}. They fly off the moment they form, and only the fastest horse can catch them. One bar of soap takes hundreds of thousands of bubbles. After bathing with it, the princess felt so relaxed she didn't want to move at all.`,
      `Another import was the ${s("glutton", "glutton fish")}. A ship carrying them sank in a storm near the island, and the fish bred in the shallows until they surrounded the kingdom. They could chew through even large ships, so no one could come or go. That was when ${s("storyless", "the Story Kingdom became the Storyless Kingdom")}.`,
      `At the shore, the princess's party found that soap foam made the glutton fish lose all will to fight. Protected by the soap, ${s("boat", "their little boat crossed the Glutton's Sea")} to Tomb Island.`] },
    { n: 3, title: "Prince Deep Water", paras: [
      `${s("deepwater", "Prince Deep Water didn't obey the laws of perspective")}: whether you stood beside him or watched from the horizon, he always looked the same size.`,
      `The princess brought him home. Needle-Eye could not paint him. His art relied on Western perspective, and his teacher had never taught him the Eastern style. So Ice Sand faced Deep Water with a sword instead.`,
      `Deep Water killed Ice Sand and became king. ${s("needle", "Needle-Eye painted himself into a picture.")} Long-Sail burned the painting of the princess, so she no longer needed the umbrella. ${s("longsail", "Princess Dewdrop and Long-Sail sailed away")} to see the world. And from then on, ${s("storyless", "no one ever came into or left the Storyless Kingdom again.")}`] },
  ];

  /* ───── page content ───── */
  $id("talesWrap").innerHTML = `
    <p class="kicker">Death's End · Broadcast Era, Year 7</p>
    <h2 class="title">Tianming's Fairy Tales</h2>
    <p class="lead">Three children's stories told under alien surveillance, each carrying the secrets humanity needed to survive the dark forest. Humanity understood most of it, and missed the most important part.</p>

    <h3 class="sec"><span>1</span>Why fairy tales?</h3>
    <p>Yun Tianming's brain was launched toward the Trisolaran fleet in the Staircase Project. The Trisolarans caught it and grew him a new body. Centuries later he is allowed one conversation with Cheng Xin, relayed by sophon. The condition: <b>no technical or political secrets.</b> Every word is monitored, and the call would be cut instantly.</p>
    <div class="fig svgscroll"><svg id="taleFlow" viewBox="0 0 900 150" style="width:100%;height:auto;display:block"></svg></div>
    <div class="cards">
      <div class="card" style="--c:#c084fc"><h4>A blind spot</h4><p>Trisolarans think “transparently”: they show their thoughts directly and rarely need metaphor or deception. Layered stories are exactly what they are bad at reading.</p></div>
      <div class="card" style="--c:#c084fc"><h4>A perfect cover</h4><p>Tianming had been telling the Trisolarans many of Earth's fairy tales, and these three went in among them (they were even published there). Children's stories raised no alarm.</p></div>
      <div class="card" style="--c:#c084fc"><h4>Shared memories</h4><p>Some clues only work for someone who grew up on Earth, like a soap-powered paper boat, a classic children's science trick.</p></div>
      <div class="card" style="--c:#4fc08d"><h4>The IDC</h4><p>Humanity sets up an Intelligence Decryption Committee of scientists, linguists and even children's writers. They name two techniques: the <b>double-layered metaphor</b> (A means B, which means C) and the <b>two-dimensional metaphor</b> (two clues from different stories fix one meaning).</p></div>
    </div>

    <h3 class="sec"><span>2</span>Read the tales <small class="muted" style="font:14px system-ui">· turn on decode mode and click the highlighted words</small></h3>
    <div class="controls" style="position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0">
      <label class="btn"><input type="checkbox" id="decodeMode"> 🔍 Decode mode</label>
      ${Object.entries(CONCEPT).map(([, c]) => `<span class="tag" style="--c:${c.color}">${c.label}</span>`).join("")}
    </div>
    <div id="taleText">${TALES.map(t => `<div class="fig tale"><div class="kicker">Tale ${t.n} of 3</div><h4 class="tale-title">${t.title}</h4>${t.paras.map(p => `<p>${p}</p>`).join("")}</div>`).join("")}</div>

    <h3 class="sec"><span>3</span>The decoder map</h3>
    <p>Every clue, what it points to, and what it was telling humanity to do. Hover to trace a clue; click one for its full decoding.</p>
    <div class="fig" style="overflow-x:auto"><svg id="taleMap" viewBox="0 0 980 560" style="width:100%;min-width:720px;height:auto;display:block"></svg></div>
    <div class="controls">${Object.entries(STATUS).map(([, [l, c]]) => `<span class="tag" style="--c:${c}">${l}</span>`).join("")}</div>

    <h3 class="sec"><span>4</span>The physics behind the clues</h3>
    <div class="two">
      <div class="fig">
        <div class="readout">The soap boat → curvature drive</div>
        <canvas id="soapCv" style="aspect-ratio:1.6;margin-top:10px"></canvas>
        <div class="controls"><button class="btn on" data-soap="boat">⛵ Paper boat</button><button class="btn" data-soap="ship">🚀 Spaceship</button><button class="btn" id="soapGo">🧼 Add soap</button></div>
        <p class="muted" id="soapTxt" style="font-size:13px"></p>
      </div>
      <div class="fig">
        <div class="readout">Slow light → black domain</div>
        <canvas id="bdCv" style="aspect-ratio:1.6;margin-top:10px"></canvas>
        <div class="controls"><label style="flex:1">Speed of light inside: <b id="bdV"></b><input type="range" id="bdS" min="0" max="1000" value="0" style="width:100%"></label></div>
        <p class="muted" id="bdTxt" style="font-size:13px"></p>
      </div>
    </div>

    <h3 class="sec"><span>5</span>What humanity did with the message</h3>
    <p>The IDC's work gave humanity three possible ways to survive the dark forest. Humanity picked the one Tianming never mentioned.</p>
    <div class="cards">
      <div class="card" style="--c:#8fa8ff"><h4>Black domain</h4><p>Slow light around the Solar System until it becomes a black hole: safe forever, and sealed forever. Far beyond humanity's technology at the time, and it would lock humanity in forever. <b>Not pursued.</b></p><span class="meta">From the tales</span></div>
      <div class="card" style="--c:#2dd4bf"><h4>Lightspeed ships</h4><p>Flee at light speed. But curvature trails are visible across space, and only a privileged few could ever escape. After a false alarm in Broadcast Era 8, curvature drives are <b>outlawed</b>. Wade's secret program is stopped by Cheng Xin.</p><span class="meta">From the tales</span></div>
      <div class="card" style="--c:#9ca3af"><h4>The Bunker Project</h4><p>Hide in space cities behind Jupiter and the other gas giants, so a photoid strike on the Sun can't reach everyone. Humanity's own plan. <b>Chosen.</b></p><span class="meta">Humanity's idea</span></div>
      <div class="card star"><h4>Bunker Era, Year 67</h4><p>The Singer uses a dual-vector foil instead of a photoid. Space itself collapses into 2D, and the bunkers are useless. Someone remembers Needle-Eye's paintings, and suddenly the umbrella and Prince Deep Water make sense: <b>only light speed escapes.</b> Halo, secretly fitted with a curvature drive, is the only ship to escape. It carries Cheng Xin and AA away.</p><span class="meta">The answer, too late</span></div>
    </div>

    <h3 class="sec"><span>6</span>The hidden love story</h3>
    <p>Many readers see a fourth layer beneath the technology: a letter from Tianming to Cheng Xin.</p>
    <div class="cards">
      <div class="card" style="--c:#c084fc"><h4>The princess</h4><p>Kind, chosen to rule, forced to flee with a gift that protects her. Tianming wrote Cheng Xin into the story, and wrote her a way out.</p></div>
      <div class="card" style="--c:#c084fc"><h4>The sailor</h4><p>Cheng Xin notices that the captain who sails away with the princess doesn't resemble Tianming: <i>“Does he think I'm going to sail away somehow? With another man?”</i> He did. She later travels with Guan Yifan.</p></div>
      <div class="card" style="--c:#c084fc"><h4>Their star</h4><p>The meeting reminds us of his first gift: star DX3906. The promise to meet there drives Cheng Xin across space and time, and leads to Universe 647, his final gift.</p></div>
      <div class="card" style="--c:#c084fc"><h4>A happy ending, coded</h4><p>In the tale, the princess escapes and the cruel prince falls. Read literally, it says: <i>you will survive.</i></p></div>
    </div>

    <p class="muted" style="font-size:12px;margin-top:40px">Sources: <a href="https://zh.wikipedia.org/wiki/%E4%B8%89%E4%BD%93III%EF%BC%9A%E6%AD%BB%E7%A5%9E%E6%B0%B8%E7%94%9F" style="color:inherit">Chinese Wikipedia, 三体III：死神永生 (fairy-tale section)</a> · <a href="https://coldewey.cc/cixin-liu-deaths-end-fairy-tales/" style="color:inherit">Coldewey, “Deciphering Yun Tianming's fairy tales”</a> · <a href="https://www.supersummary.com/deaths-end/part-3-summary/" style="color:inherit">SuperSummary, Death's End Part 3</a> · <a href="https://three-body-problem.fandom.com/wiki/Death%27s_End_Chapter_51" style="color:inherit">Fan wiki, Chapter 51</a>. Story text is a condensed retelling.</p>
    <div id="decoder" hidden></div>`;

  /* ───── flow diagram: how the message travels ───── */
  const flow = [["Tianming", "with the Trisolaran fleet", "#c084fc"], ["Sophon relay", "every word monitored", "#9ca3af"], ["Cheng Xin", "memorizes the tales", "#2dd4bf"], ["IDC", "decodes for years", "#4fc08d"], ["Humanity", "chooses a survival plan", "#5aa9e6"]];
  $id("taleFlow").innerHTML = `<defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#5b6385"/></marker></defs>` +
    flow.map(([t, sub, c], i) => { const x = 20 + i * 178; return `<rect x="${x}" y="40" width="150" height="62" rx="12" fill="#151a28" stroke="${c}"/><text x="${x + 75}" y="66" fill="${c}" text-anchor="middle" font-size="15" font-weight="600">${t}</text><text x="${x + 75}" y="87" fill="#8a90a6" text-anchor="middle" font-size="12">${sub}</text>${i < flow.length - 1 ? `<line x1="${x + 152}" y1="71" x2="${x + 176}" y2="71" stroke="#5b6385" stroke-width="2" marker-end="url(#fa)"/>` : ""}`; }).join("") +
    `<text x="450" y="132" fill="#8a90a6" text-anchor="middle" font-size="12">Disguised as children's stories: “no technical secrets”</text>`;

  /* ───── decode mode + decoder card ───── */
  const dec = $id("decoder");
  function showSym(k) {
    const d = SYM[k], [sl, sc] = STATUS[d.status];
    dec.innerHTML = `<button class="close" title="Close">×</button>
      <div class="kicker" style="color:${sc}">${sl}</div><h4>${d.name}</h4>
      <p><b>In the story:</b> ${d.layer}</p><p><b>Hidden meaning:</b> ${d.meaning}</p>
      <div>${d.concepts.map(c => `<span class="tag" style="--c:${CONCEPT[c].color}">${CONCEPT[c].label}</span>`).join("")}</div>`;
    dec.hidden = false;
  }
  dec.addEventListener("click", e => { if (e.target.closest(".close")) dec.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") dec.hidden = true; });
  $id("decodeMode").onchange = e => $id("taleText").classList.toggle("decode", e.target.checked);
  $id("taleText").addEventListener("click", e => {
    const sp = e.target.closest(".sym");
    if (sp && $id("taleText").classList.contains("decode")) showSym(sp.dataset.s);
  });

  /* ───── decoder map: symbols → concepts → what to do ───── */
  (() => {
    const svg = d3.select("#taleMap"), keys = Object.keys(SYM), cks = Object.keys(CONCEPT), pks = Object.keys(PATH);
    const pos = {}, H = 560;
    keys.forEach((k, i) => pos["s:" + k] = [175, 24 + i * ((H - 48) / (keys.length - 1))]);
    cks.forEach((k, i) => pos["c:" + k] = [390, 70 + i * ((H - 140) / (cks.length - 1))]);
    pks.forEach((k, i) => pos["p:" + k] = [620, 90 + i * ((H - 180) / (pks.length - 1))]);
    // concept → path (fixed logic of the decoding)
    const CP = { curv: ["ships"], c: ["ships", "threat"], slow: ["domain"], flat: ["threat"], me: ["love"] };
    const links = [];
    keys.forEach(k => SYM[k].concepts.forEach(c => links.push({ a: "s:" + k, b: "c:" + c, col: CONCEPT[c].color, sym: k })));
    cks.forEach(c => CP[c].forEach(p => links.push({ a: "c:" + c, b: "p:" + p, col: PATH[p].color, concept: c })));
    const curve = (a, b) => { const [x1, y1] = pos[a], [x2, y2] = pos[b], m = (x1 + x2) / 2; return `M${x1 + 6},${y1}C${m},${y1} ${m},${y2} ${x2 - 6},${y2}`; };
    const gl = svg.append("g").selectAll("path").data(links).join("path").attr("d", d => curve(d.a, d.b)).attr("fill", "none").attr("stroke", d => d.col).attr("stroke-width", 2).attr("opacity", .35);
    const node = (id, label, color, anchor, cls) => {
      const [x, y] = pos[id], g = svg.append("g").attr("class", "mapnode " + cls).attr("data-id", id).style("cursor", "pointer");
      g.append("circle").attr("cx", x).attr("cy", y).attr("r", 6).attr("fill", color);
      g.append("text").attr("x", anchor === "end" ? x - 12 : x + 12).attr("y", y + 4).attr("text-anchor", anchor).attr("fill", "#d7dbea").attr("font-size", 13).text(label);
      return g;
    };
    keys.forEach(k => node("s:" + k, SYM[k].name, STATUS[SYM[k].status][1], "end", "sym-node").on("click", () => showSym(k)));
    cks.forEach(k => node("c:" + k, CONCEPT[k].label, CONCEPT[k].color, "start", "c-node"));
    pks.forEach(k => node("p:" + k, PATH[k].label, PATH[k].color, "start", "p-node"));
    [["Clue in the story", 175, "end"], ["Hidden idea", 390, "start"], ["What it tells humanity", 620, "start"]].forEach(([t, x, a]) =>
      svg.append("text").attr("x", x).attr("y", 10).attr("text-anchor", a).attr("fill", "#8a90a6").attr("font-size", 11).attr("letter-spacing", ".1em").text(t.toUpperCase()));
    // hover: trace everything connected to a node (downstream from a clue, upstream into a path)
    svg.selectAll(".mapnode").on("pointerenter", function (ev) {
      if (ev.pointerType === "touch") return;
      const id = this.dataset.id, on = new Set([id]);
      links.forEach(l => { if (l.a === id) on.add(l.b); if (l.b === id) on.add(l.a); });
      if (id.startsWith("s:")) links.forEach(l => { if (on.has(l.a) && l.a.startsWith("c:")) on.add(l.b); });
      gl.attr("opacity", l => on.has(l.a) && on.has(l.b) ? .95 : .06).attr("stroke-width", l => on.has(l.a) && on.has(l.b) ? 3 : 2);
      svg.selectAll(".mapnode").attr("opacity", function () { return on.has(this.dataset.id) ? 1 : .3; });
    }).on("pointerleave", () => { gl.attr("opacity", .35).attr("stroke-width", 2); svg.selectAll(".mapnode").attr("opacity", 1); });
  })();

  /* ───── sim 1: soap boat / curvature drive ───── */
  let mode = "boat", soap = 0, bx = 0, bv = 0;
  const SOAP_TXT = {
    boat: "Soap at the stern weakens the water's surface tension behind the boat. The stronger tension in front pulls it forward. No paddles, no engine.",
    ship: "A curvature drive flattens space behind the ship. The more curved space ahead pulls it forward, up to light speed. It leaves a trail of flattened space where light moves slowly: the ‘slow fog’ that hints at black domains.",
  };
  const resetSoap = () => { soap = 0; bx = .18; bv = 0; $id("soapTxt").textContent = SOAP_TXT[mode]; $id("soapGo").textContent = mode === "boat" ? "🧼 Add soap" : "🌀 Flatten space behind"; };
  document.querySelectorAll("[data-soap]").forEach(b => b.onclick = () => { mode = b.dataset.soap; document.querySelectorAll("[data-soap]").forEach(x => x.classList.toggle("on", x === b)); resetSoap(); });
  $id("soapGo").onclick = () => { if (bx > .85) resetSoap(); soap = 1; };
  resetSoap();
  function drawSoap(t) {
    const cv = $id("soapCv"); if (!visible(cv)) return;
    const f = fitCanvas(cv); if (!f) return;
    const { ctx, w, h } = f, y0 = h * .55, X = bx * w;
    if (soap) { bv = Math.min(bv + .00035, .006); bx += bv; if (bx > .92) { soap = 0; bv = 0; } }
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    if (mode === "boat") {
      ctx.fillStyle = "#0d2a44"; ctx.fillRect(0, y0, w, h - y0);
      // soapy (low tension) water behind the boat
      if (bx > .19 || soap) { const g = ctx.createLinearGradient(.18 * w, 0, X, 0); g.addColorStop(0, "#3a6f9a00"); g.addColorStop(1, "#7fb8e0aa"); ctx.fillStyle = g; ctx.fillRect(.15 * w, y0, Math.max(0, X - .15 * w - 22), h - y0); }
      for (let i = 0; i < 9; i++) { const yy = y0 + 8 + i * 12; ctx.strokeStyle = "#2b5d86"; ctx.beginPath(); for (let x = 0; x <= w; x += 8) ctx.lineTo(x, yy + Math.sin(x / 20 + t / 400 + i) * 1.5); ctx.stroke(); }
      ctx.fillStyle = "#e8e2d0"; ctx.beginPath(); ctx.moveTo(X - 28, y0 - 2); ctx.lineTo(X + 34, y0 - 2); ctx.lineTo(X + 18, y0 + 12); ctx.lineTo(X - 20, y0 + 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X, y0 - 2); ctx.lineTo(X, y0 - 40); ctx.lineTo(X + 24, y0 - 8); ctx.fill();
      if (soap || bx > .19) { ctx.fillStyle = "#f2c14e"; ctx.fillRect(X - 34, y0 + 2, 8, 6); }
      ctx.fillStyle = "#8a90a6"; ctx.font = "12px system-ui";
      ctx.fillText("weak tension ←", Math.max(8, X - 140), y0 + 70); ctx.fillText("→ strong tension pulls", X + 40, y0 + 70);
    } else {
      // space grid: lines bunch up (curved) ahead of the ship, spread out (flat) behind it
      ctx.strokeStyle = "#1e2a44";
      for (let gx = -40; gx < w + 40; gx += 28) {
        const d = gx - X, warp = soap || bx > .19 ? (d > 0 ? -14 * Math.exp(-d / 70) : 12 * Math.exp(d / 70)) : 0;
        ctx.beginPath(); ctx.moveTo(gx + warp, 0); ctx.lineTo(gx + warp, h); ctx.stroke();
      }
      for (let gy = 14; gy < h; gy += 28) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      if (bx > .19) { const g = ctx.createLinearGradient(.18 * w, 0, X, 0); g.addColorStop(0, "#8fa8ff10"); g.addColorStop(1, "#8fa8ff55"); ctx.fillStyle = g; ctx.fillRect(.18 * w, y0 - 14, Math.max(0, X - .18 * w - 20), 28); ctx.fillStyle = "#8fa8ff"; ctx.font = "11px system-ui"; ctx.fillText("trail of slow light", .2 * w, y0 + 30); }
      ctx.fillStyle = "#e7ecff"; ctx.beginPath(); ctx.moveTo(X + 30, y0); ctx.lineTo(X - 18, y0 - 12); ctx.lineTo(X - 12, y0); ctx.lineTo(X - 18, y0 + 12); ctx.fill();
      ctx.fillStyle = "#8a90a6"; ctx.font = "12px system-ui";
      ctx.fillText("flattened space ←", Math.max(8, X - 150), 22); ctx.fillText("→ curved space pulls", Math.min(w - 130, X + 40), 22);
    }
  }

  /* ───── sim 2: black domain ───── */
  let photons = [], bdWas = null;
  const kms = () => 300000 * Math.pow(10, -5 * (+$id("bdS").value) / 1000); // 300,000 km/s → 3 km/s
  function drawBD() {
    const cv = $id("bdCv"); if (!visible(cv)) return;
    const f = fitCanvas(cv); if (!f) return;
    const { ctx, w, h } = f, cx = w / 2, cy = h / 2, R = Math.min(w, h) * .36, ESC = 16.7;
    const v = kms(), vin = 3.2 * Math.pow(v / 300000, .2), vth = 3.2 * Math.pow(ESC / 300000, .2), g = vth * vth / (2 * R);
    $id("bdV").textContent = v >= 1000 ? d3.format(",.0f")(v) + " km/s" : v.toFixed(1) + " km/s";
    const trapped = v < ESC;
    if (trapped !== bdWas) $id("bdTxt").innerHTML = (bdWas = trapped)
      ? "<b style='color:#8fa8ff'>Black domain.</b> Light inside is slower than the Solar System's escape velocity (≈16.7 km/s). Nothing gets out, so from outside it looks like a black hole. To any watching hunter, this is a <b>safety notice</b>: this civilization can never leave, so it is no threat. It is also a prison: no one inside can ever leave either."
      : "Normal space: light pours out of the Sun and can be seen across the galaxy. Drag the slider to slow light down inside the dashed sphere, like the bubbles caught and pressed into soap.";
    for (let i = 0; i < 4; i++) { const a = Math.random() * Math.PI * 2; photons.push({ a, r: 12, v: vin, out: false }); }
    ctx.fillStyle = "#03040a"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = trapped ? "#0c1230" : "#03040a"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#8fa8ff88"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    for (const p of photons) {
      if (!p.out) { p.v -= g; p.r += Math.min(p.v, vin); if (p.r >= R) { p.out = true; p.v = 3.2; } }
      else p.r += 3.2;
      ctx.fillStyle = p.out ? "#ffe9a8" : "#ffd27a"; ctx.fillRect(cx + Math.cos(p.a) * p.r, cy + Math.sin(p.a) * p.r, 2, 2);
    }
    photons = photons.filter(p => p.r > 8 && p.r < Math.hypot(w, h) / 2 + 10).slice(-1500);
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14); sg.addColorStop(0, "#fff"); sg.addColorStop(.4, "#ffd27a"); sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
    ctx.fillStyle = "#8a90a6"; ctx.font = "12px system-ui"; ctx.fillText(trapped ? "Seen from outside: a black hole" : "Seen from outside: a bright star", 10, h - 10);
  }

  const gate = frameGate();
  (function loop(t) { requestAnimationFrame(loop); if (gate(t)) { drawSoap(t); drawBD(); } })(0);
})();

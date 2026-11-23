// Wallfacers tab: the project, four case files (public plan visible, the rest redacted until declassified), and a comparison.
(() => {
  const $id = id => document.getElementById(id);
  const WB = name => `<blockquote class="wquote">“Wallfacer ${name}, I am your Wallbreaker.”</blockquote>`;

  const FILES = [
    { id: "ft", n: 1, name: "Frederick Tyler", role: "Former U.S. Secretary of Defense",
      pub: "<b>The mosquito swarm.</b> A thousand small, fast spacecraft, one for every Trisolaran warship, each carrying a super hydrogen bomb and flown by kamikaze pilots. When no one volunteers to die, he asks for a switch that lets the ships fly as drones.",
      real: "Hand the swarm to the ETO. The ETO uses it to strike Earth's own space force, then flies to the Trisolaran fleet with a gift: water from a comet or a moon, precious after centuries in space. Once close and trusted, Tyler takes remote control and detonates the bombs among the enemy ships.",
      note: "<b>Translation note:</b> in the Chinese original the plan is built on ball lightning, from Liu Cixin's novel <i>Ball Lightning</i>. The English edition rewrote it because that novel had not been translated yet.",
      alias: "“von Neumann” · real name never revealed",
      wb: "A stranger at his door, five years into the project. He lays out the entire plan, and the next day a full analysis is online. The key was Tyler's despair: a man who couldn't find a single volunteer to die for humanity had stopped believing in it.",
      fate: "Crisis Year 8. Shattered, Tyler visits Luo Ji, tells him everything, and asks to walk by the lake. Luo Ji hears a gunshot." },
    { id: "rd", n: 2, name: "Manuel Rey Diaz", role: "Former president of Venezuela",
      pub: "<b>The biggest bombs ever built.</b> Ultra-powerful hydrogen bombs to fight the fleet, and permission to test one on Mercury. He lives underground with a sudden phobia of the Sun: <i>“Sunglasses. I need sunglasses.”</i>",
      real: "Plant bombs on Mercury and blast it into the Sun, setting off a chain reaction that wrecks every planet. The Solar System is Trisolaris's only possible new home, so humanity could hold it hostage: attack us, and nobody gets it.",
      alias: "“Mozi” · real name never revealed",
      wb: "Hours after the Mercury test, a man talks his way into the bunker by claiming he knows why Rey Diaz fears the Sun. He calls him a far better strategist than Tyler, then explains why Trisolaris never worried: even a million bombs could not drive Mercury into the Sun. Rey Diaz tries to strangle him with a belt.",
      fate: "Facing trial for crimes against humanity, he claims his watch is a dead man's switch for a bomb in New York, and is let go. On the plane home he admits it was a bluff. In Caracas, a crowd stones him to death." },
    { id: "bh", n: 3, name: "Bill Hines", role: "British neuroscientist, former President of the European Commission",
      pub: "<b>Make humans smarter</b> to break through the sophon lock. But thought turns out to be quantum, and the research hits the same wall as physics. A by-product: the <b>mental seal</b>, a machine that imprints one belief so deeply it can never be doubted. Hines offers it to the space force to imprint unshakeable faith in victory.",
      real: "The seal was the goal all along. In secret he built five more imprinting machines and rigged them to imprint the opposite belief: humanity cannot win. A defeatist humanity would stop fighting and flee into space instead. Escapism.",
      alias: "“Aristotle” · Keiko Yamasuki, his wife",
      wb: "His own wife, the neuroscientist Keiko Yamasuki, an ETO member all along. Two centuries later, around Crisis Year 205, she turns to him on a video feed after a hearing. She tells the world he has always been a staunch defeatist, whose true talent was hiding his worldview.",
      fate: "Keiko takes her own life soon after. Hines lives on, unable to doubt himself: he had sealed his own mind with the belief that everything he did as a Wallfacer was right." },
    { id: "lj", n: 4, name: "Luo Ji", role: "Astronomer turned sociologist: a nobody, which is exactly why",
      pub: "<b>Nothing anyone can see.</b> He tries to quit, <i>“Screw the Wallfacer Project”</i>, and everyone takes it as strategy. He spends a fortune on a hidden paradise and the woman of his dreams. His one strange act: a ‘spell’ that uses the Sun to broadcast the location of a star, 187J3X1.",
      real: "The dark forest. The spell was a test: if every civilization is a hidden hunter, a star whose location is broadcast will be destroyed. Long after, 187J3X1 is found destroyed. Then the real move: thousands of nuclear bombs placed around the Sun (officially the ‘Snow Project’), wired to a dead man's switch on his own heartbeat. If he dies, the blasts broadcast Trisolaris's coordinates, and Earth's, to the galaxy.",
      alias: "None assigned · in the end, himself",
      wb: "The ETO never assigns him one; it can't work out what he's doing. In the end he breaks his own plan. Fallen through the ice of a frozen lake, he finally understands Ye Wenjie's axioms and says to himself:",
      wbQuote: "Luo Ji",
      fate: "At the graves of Ye Wenjie and Yang Dong, he digs his own grave, aims a gun at his heart and gives Trisolaris an ultimatum. Trisolaris yields: the fleet turns aside and the Deterrence Era begins. Luo Ji becomes the first Swordholder and holds the sword for more than half a century." },
  ];

  const open = new Set();
  const bars = n => `<div class="bars">${Array.from({ length: n }, (_, i) => `<span style="width:${[96, 88, 93, 71, 84][i % 5]}%"></span>`).join("")}</div>`;
  const fileHTML = f => {
    const c = CH.get(f.id), shown = open.has(f.id);
    return `<article class="wfile">
      <div class="whead">${avatar(c, 52)}<div><div class="wlabel">Case file ${f.n} of 4</div><h4>${f.name}</h4><div class="muted" style="font-size:13px">${f.role}</div></div>
        ${shown ? `<span class="stamp" style="--c:#e5484d;margin-left:auto">Declassified</span>` : `<button class="btn" data-open="${f.id}" style="margin-left:auto">Declassify</button>`}</div>
      <div class="wlabel">Public plan</div><p>${f.pub}</p>
      <div class="wlabel red">Real plan</div>${shown ? `<p>${f.real}</p>${f.note ? `<p class="muted" style="font-size:12.5px">${f.note}</p>` : ""}` : bars(3)}
      <div class="wlabel red">Wallbreaker</div>${shown ? `<p class="walias">${f.alias}</p>${f.wbQuote ? `<p>${f.wb}</p>${WB(f.wbQuote)}` : `${WB(f.name)}<p>${f.wb}</p>`}` : bars(2)}
      <div class="wlabel red">Outcome</div>${shown ? `<p>${f.fate}</p>` : bars(2)}
    </article>`;
  };

  $id("wallWrap").innerHTML = `
    <p class="kicker">The Dark Forest · Crisis Year 3</p>
    <h2 class="title">The Wallfacers</h2>
    <p class="lead">Sophons see and hear everything on Earth, except what happens inside a human mind. So humanity gives four people almost unlimited power and lets them plan alone, in their heads, lying to everyone.</p>

    <h3 class="sec"><span>1</span>The project</h3>
    <div class="cards">
      <div class="card" style="--c:#f2c14e"><h4>Why</h4><p>A plan written down, spoken or shared is a plan Trisolaris already knows. The only safe place for a strategy is a single skull.</p></div>
      <div class="card" style="--c:#f2c14e"><h4>The powers</h4><p>Vast resources, no duty to explain, and permission to deceive anyone, humanity included. Every act might be a feint.</p></div>
      <div class="card" style="--c:#f2c14e"><h4>The catch</h4><p>Nobody can tell strategy from madness. When Luo Ji tries to quit, the world just admires the move.</p></div>
      <div class="card" style="--c:#f2c14e"><h4>The name</h4><p>面壁者: “one who faces the wall”, like a monk meditating alone in front of a wall, sharing his thoughts with no one.</p></div>
      <div class="card star"><h4>The counter-move: Wallbreakers</h4><p>The ETO assigns each Wallfacer a Wallbreaker: an agent who studies everything the Wallfacer does, with sophons watching, until the real plan shows through. Each goes by their name from the Three Body game. Then they introduce themselves.</p></div>
    </div>

    <h3 class="sec"><span>2</span>The case files</h3>
    <div class="controls"><button class="btn" id="wallAll">Declassify all</button><span class="muted" style="font-size:13px">Public plans are open. Real plans, Wallbreakers and outcomes are redacted.</span></div>
    <div class="wgrid" id="wallFiles"></div>

    <h3 class="sec"><span>3</span>Why only one worked</h3>
    <div style="overflow-x:auto"><table class="matrix">
      <tr><th></th><th>The weapon</th><th>The flaw</th><th>Outcome</th></tr>
      <tr><th>Tyler</th><td class="bad">A kamikaze swarm and a fake betrayal</td><td>Depended on people and trust he didn't have</td><td class="bad">Exposed · suicide</td></tr>
      <tr><th>Rey Diaz</th><td class="bad">Push Mercury into the Sun</td><td>Physically impossible with human bombs</td><td class="bad">Exposed · killed</td></tr>
      <tr><th>Hines</th><td class="bad">Rewrite humanity's beliefs</td><td>Spread defeat instead of victory</td><td class="meh">Exposed · lives, sealed</td></tr>
      <tr><th>Luo Ji</th><td class="good">One broadcast: the universe does the killing</td><td>Only works while he is willing to die</td><td class="good">Deterrence · Swordholder</td></tr>
    </table></div>
    <p>Tyler and Rey Diaz bet on force, which the sophon lock had already capped. Hines bet on changing people. Luo Ji bet on information: in a dark forest, a location is a weapon, and Trisolaris can't defend against the rest of the universe. Rey Diaz had the right shape, mutual destruction, without a weapon that could work.</p>

    <h3 class="sec"><span>4</span>The sword passes</h3>
    <p>Deterrence only works while the enemy believes you will press the switch. In Deterrence Era 62, an old Luo Ji hands it to the woman an adoring public has elected: Cheng Xin. The handover happens 45 km beneath the Gobi Desert. Trisolaris has been waiting for this moment.</p>
    <div class="fig">
      <div class="swconsole">
        <svg id="swSvg" viewBox="0 0 400 260" style="width:100%;height:auto;display:block;background:#03040a;border-radius:10px"></svg>
        <div>
          <div class="wlabel">Deterrence Era 62 · Gobi control center</div>
          <div class="swclock" id="swClock">10:00</div>
          <div class="swlog" id="swLog">You are about to become the Swordholder.</div>
          <button class="swbtn" id="swBtn">Take the switch</button>
          <button class="btn" id="swWait" hidden>Let the clock run out</button>
        </div>
      </div>
      <div id="swOut" hidden></div>
    </div>

    <div class="card" style="--c:#e50914;margin-top:22px;max-width:780px"><h4><span class="nfbadge">NETFLIX</span> On screen</h4><p>Season 1 ends with Saul Durand, the show's version of Luo Ji, named a Wallfacer. The rest of the project is Season 2 material.</p></div>
    <p class="muted" style="font-size:12px;margin-top:14px">Sources: <i>The Dark Forest</i> (Joel Martinsen's translation), <a href="https://www.litcharts.com/lit/the-dark-forest/terms/wallbreaker" style="color:inherit">LitCharts, Wallbreaker</a> and <a href="https://www.litcharts.com/lit/the-dark-forest/terms/wallfacer" style="color:inherit">Wallfacer</a>, <a href="https://en.wikipedia.org/wiki/The_Dark_Forest" style="color:inherit">Wikipedia</a>, <a href="https://baike.baidu.com/en/item/Wall-breaker/1525609" style="color:inherit">Baidu Baike, Wall-breaker</a>, <a href="https://3body.wiki/en/blog/tyler-translation-rewrite" style="color:inherit">3body.wiki on the Tyler rewrite</a>.</p>`;

  /* ───── The sword passes: a ten-minute decision, compressed to 45 seconds ───── */
  const SW_LEN = 45000, SW_LOG = [
    [0, "Handover complete. You are the Swordholder."],
    [.04, "Alert: six droplets are accelerating toward Earth. Arrival in about ten minutes."],
    [.2, "Their targets are the gravitational-wave transmitters. Once those are gone, deterrence is over for good."],
    [.45, "Pressing the switch broadcasts Trisolaris's location to the universe. And Earth's with it."],
    [.75, "Billions of people on two worlds. One switch. Seconds are passing."],
  ];
  let sw = null; // { t0 } while the clock runs
  const swDraw = p => {
    const cx = 200, cy = 130, drops = Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2 + .4, r = 120 - 92 * p; return [cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r]; });
    $id("swSvg").innerHTML = `<defs><radialGradient id="swE"><stop offset="0" stop-color="#5aa9e6"/><stop offset="1" stop-color="#1d3d66"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="26" fill="url(#swE)"/>
      ${[0, 1, 2, 3].map(i => { const a = i * 1.57 + .7; return `<rect x="${cx + Math.cos(a) * 22 - 2}" y="${cy + Math.sin(a) * 22 - 2}" width="4" height="4" fill="${p >= 1 ? "#555" : "#7ef0c0"}"/>`; }).join("")}
      ${drops.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#e7ecff" filter="drop-shadow(0 0 4px #cfe6ff)"/>`).join("")}
      <text x="${cx}" y="${cy + 48}" fill="#8a90a6" font-size="11" text-anchor="middle">Earth · transmitters (green)</text>
      <text x="12" y="20" fill="#8a90a6" font-size="11">six droplets</text>`;
  };
  function swEnd(pressed) {
    sw = null; $id("swBtn").hidden = true; $id("swWait").hidden = true; swDraw(pressed ? .7 : 1);
    if (!pressed) $id("swClock").textContent = "00:00";
    $id("swLog").textContent = pressed ? "You pressed it." : "The droplets reach the transmitters. Deterrence ends without a signal sent.";
    $id("swOut").hidden = false;
    $id("swOut").innerHTML = `<div class="two" style="margin-top:16px">
      <div>${pressed
        ? `<div class="wlabel red">If you broadcast</div><p>Trisolaris's coordinates, and Earth's, go out to the galaxy. Both worlds are now marked for cleansing. Nothing is saved; the end just comes for everyone. And in the book this is how it ends anyway: the warship Gravity broadcasts in Broadcast Era 1, Trisolaris is destroyed three years later, and the Solar System falls in Bunker Era 67.</p>`
        : `<div class="wlabel red">If you wait</div><p>The droplets destroy Earth's transmitters. Trisolaris announces the invasion and orders humanity into Australia. Later the warship Gravity, far away, broadcasts anyway.</p>`}
        <div class="wlabel">What Cheng Xin did</div><p>She doesn't press it. She can't bring herself to destroy two worlds. Trisolaris had bet on exactly that.</p></div>
      <div><div class="wlabel">Why they attacked the moment she took over</div>
        <blockquote class="wquote" style="font-size:14.5px">“In our personality studies, your degree of deterrence hovered around ten percent, like a worm wriggling on the ground. Luo Ji's degree of deterrence was always around ninety percent, like a fearsome cobra poised to strike.”</blockquote>
        <p class="muted" style="font-size:12.5px;margin-top:-4px">Sophon to Cheng Xin, Death's End</p>
        <div class="swbars">${[["Wade", 100, "#e5484d"], ["Luo Ji", 90, "#f2c14e"], ["Cheng Xin", 10, "#8fa8ff"]].map(([n, v, c]) => `<div><span>${n}</span><i style="--c:${c};width:${v}%"></i><b>~${v}%</b></div>`).join("")}</div>
        <p class="muted" style="font-size:12.5px">Wade's score, “one hundred percent”, is from the same conversation.</p></div></div>
      <div class="controls"><button class="btn" id="swAgain">↺ Try again</button></div>`;
  }
  $id("swBtn").onclick = () => {
    if (!sw && $id("swBtn").textContent === "Take the switch") { sw = { t0: performance.now() }; $id("swBtn").textContent = "Broadcast"; $id("swWait").hidden = false; $id("swOut").hidden = true; return; }
    if (sw) swEnd(true);
  };
  $id("swWait").onclick = () => swEnd(false);
  $id("swOut").onclick = e => { if (e.target.id === "swAgain") { $id("swBtn").hidden = false; $id("swBtn").textContent = "Take the switch"; $id("swOut").hidden = true; $id("swClock").textContent = "10:00"; $id("swLog").textContent = "You are about to become the Swordholder."; swDraw(0); } };
  swDraw(0);
  (function swTick() {
    requestAnimationFrame(swTick);
    if (!sw || !$id("swSvg").closest("section:not([hidden])")) return;
    const p = Math.min(1, (performance.now() - sw.t0) / SW_LEN), left = Math.ceil(600 * (1 - p));
    $id("swClock").textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
    $id("swLog").textContent = SW_LOG.filter(([k]) => p >= k).at(-1)[1];
    swDraw(p);
    if (p >= 1) swEnd(false);
  })();

  const draw = () => { $id("wallFiles").innerHTML = FILES.map(fileHTML).join(""); $id("wallAll").hidden = open.size === FILES.length; };
  $id("wallFiles").onclick = e => { const b = e.target.closest("[data-open]"); if (b) { open.add(b.dataset.open); draw(); } };
  $id("wallAll").onclick = () => { FILES.forEach(f => open.add(f.id)); draw(); };
  draw();
})();

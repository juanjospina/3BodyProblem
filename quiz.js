// Quotes tab: "Test yourself" quiz. Two modes, built from the existing data: who said a quote, and book ↔ Netflix names.
(() => {
  const $id = id => document.getElementById(id);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // "Who said it?": only quotes with a single clear speaker, short enough to read at a glance
  const SAID = DATA.quotes.filter(q => {
    const c = CH.get(q.who);
    return c && q.text.length < 320 && !q.text.includes("<") && (!q.by || q.by.startsWith(c.name.split(" ")[0])) // "Ye Wenjie's thoughts" yes; "Monument motto, later quoted by…" no;
  });
  const SPEAKERS = [...new Set(SAID.map(q => q.who))].map(id => CH.get(id));
  // "Who is who?": characters whose Netflix name differs from the book name
  const PAIRS = DATA.characters.filter(c => c.nf && !c.nfOnly && c.nf.name !== c.name && !c.nf.name.startsWith("Sophon"));

  let mode = "said", score = 0, total = 0, streak = 0, cur = null, recent = [];

  function next() {
    if (mode === "said") {
      const q = pick(SAID.filter(x => !recent.includes(x)));
      recent = [...recent.slice(-6), q];
      const right = CH.get(q.who);
      const opts = shuffle([right, ...shuffle(SPEAKERS.filter(c => c.id !== right.id)).slice(0, 3)]);
      cur = { kind: "said", q, right: right.id, opts: opts.map(c => ({ id: c.id, label: c.name, c })) };
    } else {
      const c = pick(PAIRS.filter(x => !recent.includes(x)));
      recent = [...recent.slice(-4), c];
      const toNetflix = Math.random() < .5, others = shuffle(PAIRS.filter(x => x !== c)).slice(0, 3);
      cur = { kind: "pair", c, toNetflix, right: c.id,
        opts: shuffle([c, ...others]).map(o => ({ id: o.id, label: toNetflix ? o.nf.name : o.name, c: o })) };
    }
    draw();
  }

  function draw(answered) {
    const k = cur;
    const head = `<div class="qzhead">
      <button class="btn" data-qz-back>← All quotes</button>
      <button class="btn ${mode === "said" ? "on" : ""}" data-qz-mode="said">Who said it?</button>
      <button class="btn ${mode === "pair" ? "on" : ""}" data-qz-mode="pair">Book ↔ Netflix</button>
      <span class="readout" style="margin-left:auto">Score ${score}/${total}${streak > 1 ? ` · streak ${streak} 🔥` : ""}</span></div>`;
    let q;
    if (k.kind === "said") q = `<p class="qzq">“${k.q.text}”</p>`;
    else {
      const img = k.c.nf.img && !k.toNetflix ? `<img class="qzimg" src="img/${k.c.nf.img}" alt="">` : "";
      q = `${img}<p class="qzq">${k.toNetflix ? `In the Netflix series, the book's <b>${k.c.name}</b> becomes…` : `Netflix's <b>${k.c.nf.name}</b> is based on which book character?`}</p>`;
    }
    const color = k.kind === "said" ? BOOK[k.q.book].color : "#e50914";
    const opts = k.opts.map(o => {
      const cls = answered ? (o.id === k.right ? "right" : o.id === answered ? "wrong" : "") : "";
      return `<button class="qzopt ${cls}" data-qz-pick="${o.id}" ${answered ? "disabled" : ""}>${k.kind === "said" ? avatar(o.c, 28) : ""}<span>${o.label}</span></button>`;
    }).join("");
    let note = "";
    if (answered) {
      const ok = answered === k.right;
      note = k.kind === "said"
        ? `<p class="qznote"><b>${ok ? "Right." : `It was ${CH.get(k.right).name}.`}</b> ${k.q.ctx}</p>`
        : `<p class="qznote"><b>${ok ? "Right." : "Not quite."}</b> ${k.c.name} → ${k.c.nf.name}${k.c.nf.actor ? ` (${k.c.nf.actor})` : ""}. ${k.c.nf.note || ""}</p>`;
      note += `<div class="controls"><button class="btn on" data-qz-next>Next →</button></div>`;
    }
    $id("quiz").innerHTML = head + `<div class="qzcard" style="--c:${color}">${q}<div class="qzopts">${opts}</div>${note}</div>`;
  }

  const open = on => {
    $id("quiz").hidden = !on; document.querySelector("#quotes .qwrap").hidden = on;
    if (on && !cur) next();
  };
  $id("quotes").addEventListener("click", e => {
    const t = e.target.closest("[data-quiz],[data-qz-back],[data-qz-mode],[data-qz-pick],[data-qz-next]"); if (!t) return;
    if (t.matches("[data-quiz]")) open(true);
    else if (t.matches("[data-qz-back]")) open(false);
    else if (t.matches("[data-qz-mode]")) { mode = t.dataset.qzMode; recent = []; next(); }
    else if (t.matches("[data-qz-next]")) next();
    else if (t.matches("[data-qz-pick]")) {
      const ok = t.dataset.qzPick === cur.right;
      total++; score += ok; streak = ok ? streak + 1 : 0;
      draw(t.dataset.qzPick);
    }
  });
})();

// Transition « chantier » entre les pages Saitora (liens avec data-transition) : la page quittée s'efface
// vers le fond nuit, puis la nouvelle page se construit en environ 1,2 s (maquette tracée, titres écrits
// lettre par lettre, textes ligne par ligne, images du flou au net, boutons qui se posent).
// Un clic ou une touche termine tout. À inclure au tout début du <body>.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NIGHT = "#380D31";   // fond du site

  const style = document.createElement("style");
  style.textContent = `
.sc-site{position:fixed;inset:0;z-index:9999;pointer-events:none}
.sc-site.cover{background:var(--night,${NIGHT})}
.sc-site svg{position:absolute;inset:0;width:100%;height:100%;display:block}`;
  document.head.appendChild(style);

  const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const tick = (fn, done) => { const t0 = performance.now(); const f = () => { if (fn(performance.now() - t0) !== false) requestAnimationFrame(f); else done && done(); }; requestAnimationFrame(f); };
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };

  function overlay() {
    const box = document.createElement("div");
    box.className = "sc-site";
    box.setAttribute("aria-hidden", "true");
    return box;
  }

  // ——— départ : la page s'efface rapidement vers le fond nuit, puis on change de page
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-transition]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const box = overlay();
    box.classList.add("cover");
    document.body.appendChild(box);
    box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease", fill: "both" })
      .finished.then(() => { location.href = a.href; });
  });

  // ——— arrivée (≈ 1,2 s), à chaque affichage de la page : arrivée sur le site, lien interne, rechargement,
  // bouton retour. La page se construit sur son vrai fond, élément par élément : les maquettes se tracent,
  // les fonds se posent, les grands titres s'écrivent lettre par lettre, les textes arrivent ligne par ligne,
  // les images passent du flou au net, les boutons se posent.
  if (reduce) { document.documentElement.classList.remove("sc-pending"); return; }
  let current = null;   // construction en cours (pour l'arrêter net si la page revient du cache)

  const SEL = {
    title: "h1, h2",
    media: "img, video",
    ctrl: ".btn, .chip, .pill, .opt, .back, nav a",
    text: "p, h3, li, dt, dd, label, .count, .brand, .sector, .mail",
    frame: ".surface, .summary, .proj, .reel",
  };

  function build() {
  const box = overlay();
  box.classList.add("cover");   // fond nuit opaque le temps que la page se mette en place, sans flash
  document.body.appendChild(box);

  function start() {
    const w = innerWidth, h = innerHeight;
    const seen = new Set(), items = [];
    const inView = r => r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
    // un élément n'est animé qu'une fois, et jamais à l'intérieur d'un titre, d'un bouton ou d'un texte déjà animé
    const inside = n => { for (let p = n.parentElement; p; p = p.parentElement) if (seen.has(p) && !p.matches(SEL.frame)) return true; return false; };
    for (const kind of ["frame", "title", "ctrl", "media", "text"]) {
      for (const n of document.querySelectorAll(SEL[kind])) {
        if (seen.has(n) || n.closest(".sc-site") || n.closest("[hidden]")) continue;
        const r = n.getBoundingClientRect();
        if (!inView(r) || getComputedStyle(n).visibility === "hidden") continue;
        if (kind !== "frame" && inside(n)) continue;
        seen.add(n);
        items.push({ n, kind, r, css: n.style.cssText });
      }
    }
    // ordre de lecture : de haut en bas, puis de gauche à droite
    const order = it => (it.r.top / h) * .8 + (it.r.left / w) * .2;
    for (const it of items) it.k = clamp(order(it));

    // maquette : barres pour le texte, cadres barrés pour les images, pastilles pour les boutons
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, "aria-hidden": "true" });
    const wire = { stroke: "rgba(177,116,178,.6)", fill: "none", "stroke-width": 1.2 };
    for (const it of items) {
      const { left: x, top: y, width: bw, height: bh } = it.r;
      const g = it.wire = el("g", { opacity: 0 }, svg);
      if (it.kind === "title" || it.kind === "text") {
        const lh = parseFloat(getComputedStyle(it.n).lineHeight) || parseFloat(getComputedStyle(it.n).fontSize) * 1.3 || 20;
        const lines = Math.max(1, Math.min(4, Math.round(bh / lh)));
        const th = Math.min(it.kind === "title" ? 14 : 6, lh * .45);
        for (let i = 0; i < lines; i++) el("rect", { x, y: y + (i + .5) * (bh / lines) - th / 2, width: bw * (i === lines - 1 && lines > 1 ? .6 : 1), height: th, rx: th / 2, fill: "rgba(177,116,178,.25)" }, g);
      } else if (it.kind === "media") {
        el("rect", { x, y, width: bw, height: bh, rx: 8, ...wire }, g);
        el("path", { d: `M${x} ${y}L${x + bw} ${y + bh}M${x + bw} ${y}L${x} ${y + bh}`, ...wire, opacity: .5 }, g);
      } else if (it.kind === "ctrl") {
        el("rect", { x, y, width: bw, height: bh, rx: Math.min(bh / 2, 14), ...wire }, g);
      } else {
        el("rect", { x, y, width: bw, height: bh, rx: 16, ...wire, "stroke-dasharray": "5 6" }, g);
      }
    }
    const plan = document.createElement("div");
    plan.className = "sc-site";
    plan.setAttribute("aria-hidden", "true");
    plan.appendChild(svg);

    // horaires (ms) de chaque élément : tout se chevauche pour garder du rythme
    const titles = items.filter(i => i.kind === "title");
    for (const it of items) {
      it.d = it.k * 120;                                   // tracé de la maquette
      if (it.kind === "frame") { it.s = 120 + it.k * 220; it.len = 260; }
      if (it.kind === "text")  { it.s = 300 + it.k * 420; it.len = 260; }
      if (it.kind === "media") { it.s = 560 + it.k * 260; it.len = 380; }
      if (it.kind === "ctrl")  { it.s = 680 + it.k * 260; it.len = 300; }
    }
    titles.forEach((it, i) => {
      // titre : lettres enveloppées pour les révéler sans bouger la mise en page
      it.html = it.n.innerHTML;
      const chars = [];
      const walk = node => {
        for (const c of [...node.childNodes]) {
          if (c.nodeType === 3) {
            const frag = document.createDocumentFragment();
            for (const ch of c.textContent) { const sp = document.createElement("span"); sp.textContent = ch; sp.style.visibility = "hidden"; frag.appendChild(sp); chars.push(sp); }
            c.replaceWith(frag);
          } else if (c.nodeType === 1 && !c.textContent) { c.style.visibility = "hidden"; chars.push(c); }   // le point du logo arrive en dernier
          else if (c.nodeType === 1) walk(c);
        }
      };
      walk(it.n);
      it.chars = chars;
      it.caret = document.createElement("span");
      it.caret.style.cssText = "display:inline-block;width:.07em;height:.9em;margin-right:-.07em;vertical-align:-.08em;background:#B174B2;border-radius:2px";
      it.s = 240 + i * 90; it.len = 560;                   // même durée quelle que soit la longueur
    });
    const END = Math.max(...items.map(i => i.s + i.len), 900);

    // Les fondus, glissements, flous et la maquette sont confiés au navigateur (Web Animations API) :
    // ils restent fluides même pendant le chargement de la page. Seule la frappe des titres reste en JS.
    const OUT = "cubic-bezier(.23,1,.32,1)";          // courbe de sortie forte
    const POP = "cubic-bezier(.34,1.25,.64,1)";       // léger rebond pour les boutons
    const KEYS = {
      frame: [{ opacity: 0, transform: "scale(.985)" }, { opacity: 1, transform: "none" }],
      text:  [{ opacity: 0, transform: "translateY(8px)", clipPath: "inset(0 100% 0 0)" }, { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" }],
      media: [{ opacity: 0, transform: "scale(1.04)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
      ctrl:  [{ opacity: 0, transform: "scale(.95)" }, { opacity: 1, transform: "scale(1)", offset: .45 }, { opacity: 1, transform: "none" }],
    };
    for (const it of items) it.n.style.transition = "none";
    const anims = [];
    for (const it of items) {
      if (it.kind !== "title") anims.push(it.n.animate(KEYS[it.kind], { delay: it.s, duration: it.len, easing: it.kind === "ctrl" ? POP : OUT, fill: "both" }));
      // la maquette apparaît puis s'efface quand l'élément arrive
      const from = it.d, to = Math.max(it.s + it.len / 3, from + 120), dur = to - from;
      const show = Math.min(90 / dur, .9), hold = Math.min(Math.max((it.s - from) / dur, show), .95);
      anims.push(it.wire.animate([{ opacity: 0 }, { opacity: 1, offset: show }, { opacity: 1, offset: hold }, { opacity: 0 }], { delay: from, duration: dur, fill: "both" }));
    }
    document.body.appendChild(plan);
    box.classList.remove("cover");
    document.documentElement.classList.remove("sc-pending");
    anims.push(box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: OUT, fill: "forwards" }));   // le fond se dissipe aussitôt

    let skip = false, cleaned = false;
    const stop = () => { skip = true; anims.forEach(x => x.finish()); };
    addEventListener("pointerdown", stop, { once: true });
    addEventListener("keydown", stop, { once: true });

    // frappe des titres, lettre par lettre
    tick(t => {
      if (skip) t = END + 1;
      for (const it of titles) {
        const p = (t - it.s) / it.len;
        const n = Math.round(clamp(p) * it.chars.length);
        it.chars.forEach((c, i) => { c.style.visibility = i < n ? "" : "hidden"; });
        if (p > 0 && p < 1.15) { const at = it.chars[Math.max(0, n - 1)]; at.after(it.caret); it.caret.style.opacity = n === 0 ? 1 : (Math.floor(t / 90) % 2 ? .25 : 1); }
        else it.caret.remove();
      }
      return t <= END + 60;
    }, cleanup);
    function cleanup() {
      // on rend les éléments exactement comme avant
      if (cleaned) return;
      cleaned = true; skip = true; current = null;
      anims.forEach(x => x.cancel());
      for (const it of items) { it.n.style.cssText = it.css; if (it.kind === "title") it.n.innerHTML = it.html; }
      removeEventListener("pointerdown", stop); removeEventListener("keydown", stop);
      plan.remove(); box.remove();
    }
    current = { cleanup };
  }
  // on mesure une fois la page en place (polices et ancre éventuelle)
  const go = () => requestAnimationFrame(() => requestAnimationFrame(start));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  build();

  // bouton retour / avant : la page sort du cache telle qu'on l'a quittée, on la reconstruit
  addEventListener("pageshow", e => {
    if (!e.persisted) return;
    if (current) current.cleanup();
    document.querySelectorAll(".sc-site").forEach(n => n.remove());
    build();
  });
})();

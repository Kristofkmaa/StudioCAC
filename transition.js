// Transition « chantier » entre les pages StudioCac (liens avec data-transition="Texte affiché") :
// au départ, des panneaux de plan d'architecte descendent et recouvrent la page ; à l'arrivée, la nouvelle
// page se construit en environ 1,2 s sur son vrai fond (maquette tracée, titres écrits lettre par lettre,
// textes ligne par ligne, images du flou au net, boutons qui se posent). Un clic ou une touche termine tout.
// À inclure au tout début du <body> pour que le plan couvre la page avant son premier affichage.
(() => {
  const KEY = "studiocac-transition";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BP = "#0A1438";   // bleu plan

  const style = document.createElement("style");
  style.textContent = `
.sc-site{position:fixed;inset:0;z-index:9999;pointer-events:none}
.sc-site.cover{background:${BP};background-image:linear-gradient(rgba(96,165,250,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.16) 1px,transparent 1px);background-size:24px 24px}
.sc-cols{position:absolute;inset:0;display:flex}
.sc-cols i{flex:1;background:${BP};transform-origin:top;transform:scaleY(0);border-right:1px solid rgba(125,211,252,.18);
  background-image:linear-gradient(rgba(96,165,250,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.16) 1px,transparent 1px);background-size:24px 24px}
.sc-site svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.sc-lab{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;color:#E0F2FE;opacity:0;
  font:500 13px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;text-align:center}
.sc-lab b{font:800 clamp(24px,3.6vw,40px)/1.1 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.02em;text-transform:none;color:#fff}
.sc-lab u{display:block;width:220px;height:3px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden;text-decoration:none}
.sc-lab u span{display:block;height:100%;width:0;background:linear-gradient(90deg,#22D3EE,#7C5CFF)}`;
  document.head.appendChild(style);

  const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const tick = (fn, done) => { const t0 = performance.now(); const f = () => { if (fn(performance.now() - t0) !== false) requestAnimationFrame(f); else done && done(); }; requestAnimationFrame(f); };
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };

  function overlay(text) {
    const box = document.createElement("div");
    box.className = "sc-site";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `<div class="sc-lab"><span>Construction de la page</span><b></b><u><span></span></u></div>`;
    box.querySelector("b").textContent = text || "";
    return box;
  }

  // ——— départ : les panneaux du plan descendent en quinconce, la barre se remplit, puis on change de page
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-transition]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const box = overlay(a.dataset.transition);
    const cols = document.createElement("div"); cols.className = "sc-cols";
    const N = innerWidth < 700 ? 4 : 7;
    cols.innerHTML = "<i></i>".repeat(N);
    box.prepend(cols);
    document.body.appendChild(box);
    const lab = box.querySelector(".sc-lab"), bar = box.querySelector("u span");
    try { sessionStorage.setItem(KEY, JSON.stringify({ label: a.dataset.transition })); } catch (_) {}
    tick(t => {
      [...cols.children].forEach((c, i) => { c.style.transform = `scaleY(${ease((t - i * 45) / 380)})`; });
      lab.style.opacity = clamp((t - 520) / 180);   // le texte n'apparaît qu'une fois la page couverte
      bar.style.width = ease((t - 520) / 300) * 35 + "%";
      return t < 780;
    }, () => { location.href = a.href; });
  });

  // retour arrière du navigateur : la page restaurée ne doit pas rester couverte
  addEventListener("pageshow", e => { if (e.persisted) document.querySelectorAll(".sc-site").forEach(n => n.remove()); });

  // ——— arrivée (≈ 1,2 s) : la page se construit sur son vrai fond, élément par élément.
  // Les maquettes se tracent, les fonds se posent, les grands titres s'écrivent lettre par lettre,
  // les textes arrivent ligne par ligne, les images passent du flou au net, les boutons se posent.
  let arrival = null;
  try { arrival = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (_) {}
  if (!arrival || reduce) { document.documentElement.classList.remove("sc-pending"); return; }

  const box = overlay(arrival.label);
  box.classList.add("cover");   // plan opaque dès la première image, le temps que la page se mette en place
  document.body.appendChild(box);
  const lab = box.querySelector(".sc-lab");
  lab.style.opacity = 1;

  const SEL = {
    title: "h1, h2",
    media: "img, video",
    ctrl: ".btn, .chip, .pill, .opt, .go, .proj .feats li",
    text: "p, h3, li, dt, dd, label, .label, .eyebrow, .kicker, .count, .brand, nav a, .proj .top .num, .proj .top .sec",
    frame: ".glass, .proj, .reel, .step b",
  };
  const outBack = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const outQuart = x => 1 - Math.pow(1 - clamp(x), 4);

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
    const wire = { stroke: "rgba(125,211,252,.55)", fill: "none", "stroke-width": 1.2 };
    for (const it of items) {
      const { left: x, top: y, width: bw, height: bh } = it.r;
      const g = it.wire = el("g", { opacity: 0 }, svg);
      if (it.kind === "title" || it.kind === "text") {
        const lh = parseFloat(getComputedStyle(it.n).lineHeight) || parseFloat(getComputedStyle(it.n).fontSize) * 1.3 || 20;
        const lines = Math.max(1, Math.min(4, Math.round(bh / lh)));
        const th = Math.min(it.kind === "title" ? 14 : 6, lh * .45);
        for (let i = 0; i < lines; i++) el("rect", { x, y: y + (i + .5) * (bh / lines) - th / 2, width: bw * (i === lines - 1 && lines > 1 ? .6 : 1), height: th, rx: th / 2, fill: "rgba(125,211,252,.22)" }, g);
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
          } else if (c.nodeType === 1) walk(c);
        }
      };
      walk(it.n);
      it.chars = chars;
      it.caret = document.createElement("span");
      it.caret.style.cssText = "display:inline-block;width:.07em;height:.9em;margin-right:-.07em;vertical-align:-.08em;background:#22D3EE;border-radius:2px";
      it.s = 240 + i * 90; it.len = 560;                   // même durée quelle que soit la longueur
    });
    const END = Math.max(...items.map(i => i.s + i.len), 900);

    // état de départ : tout est masqué sous le plan, puis le plan disparaît
    for (const it of items) { it.n.style.transition = "none"; if (it.kind !== "title") it.n.style.opacity = 0; }
    document.body.appendChild(plan);
    box.classList.remove("cover");
    document.documentElement.classList.remove("sc-pending");

    let skip = false;
    const stop = () => { skip = true; };
    addEventListener("pointerdown", stop, { once: true });
    addEventListener("keydown", stop, { once: true });

    tick(t => {
      if (skip) t = END + 1;
      box.style.opacity = 1 - outQuart(t / 180);           // le plan bleu se dissipe très vite
      for (const it of items) {
        const p = (t - it.s) / it.len;
        it.wire.setAttribute("opacity", clamp((t - it.d) / 90) * (1 - clamp(p * 3)));
        const st = it.n.style;
        if (it.kind === "frame") { const e = outQuart(p); st.opacity = e; st.transform = `scale(${.985 + .015 * e})`; }
        else if (it.kind === "text") { const e = outQuart(p); st.opacity = e; st.transform = `translateY(${(1 - e) * 8}px)`; st.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; }
        else if (it.kind === "media") { const e = outQuart(p); st.opacity = e; st.filter = `blur(${(1 - e) * 14}px)`; st.transform = `scale(${1.04 - .04 * e})`; }
        else if (it.kind === "ctrl") { st.opacity = clamp(p * 2.5); st.transform = `scale(${.82 + .18 * outBack(p)})`; }
        else {
          const n = Math.round(clamp(p) * it.chars.length);
          it.chars.forEach((c, i) => { c.style.visibility = i < n ? "" : "hidden"; });
          if (p > 0 && p < 1.15) { const at = it.chars[Math.max(0, n - 1)]; at.after(it.caret); it.caret.style.opacity = n === 0 ? 1 : (Math.floor(t / 90) % 2 ? .25 : 1); }
          else it.caret.remove();
        }
      }
      return t <= END + 60;
    }, () => {
      // nettoyage : on rend les éléments exactement comme avant
      for (const it of items) { it.n.style.cssText = it.css; if (it.kind === "title") it.n.innerHTML = it.html; }
      removeEventListener("pointerdown", stop); removeEventListener("keydown", stop);
      plan.remove(); box.remove();
    });
  }
  // on mesure une fois la page en place (polices et ancre éventuelle)
  const go = () => requestAnimationFrame(() => requestAnimationFrame(start));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();

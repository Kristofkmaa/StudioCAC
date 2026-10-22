// Transition « chantier » entre les pages StudioCac (liens avec data-transition="Texte affiché") :
// au départ, des panneaux de plan d'architecte descendent et recouvrent la page ; à l'arrivée, le plan de la
// nouvelle page se dessine en pointillés à l'emplacement réel de ses blocs ([data-build="nom"]), puis chaque
// bloc est construit l'un après l'autre par une ligne lumineuse qui révèle le vrai contenu.
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
.sc-site text{font:500 11px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;fill:#7DD3FC}
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

  // ——— arrivée : plan plein écran, puis construction bloc par bloc
  let arrival = null;
  try { arrival = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (_) {}
  if (!arrival || reduce) return;

  const box = overlay(arrival.label);
  const W = () => innerWidth, H = () => innerHeight;
  const svg = el("svg", { "aria-hidden": "true" });
  const defs = el("defs", {}, svg);
  const pat = el("pattern", { id: "scGrid", width: 24, height: 24, patternUnits: "userSpaceOnUse" }, defs);
  el("path", { d: "M24 0H0V24", fill: "none", stroke: "rgba(96,165,250,.16)", "stroke-width": 1 }, pat);
  const mask = el("mask", { id: "scMask", maskUnits: "userSpaceOnUse" }, defs);
  const maskBg = el("rect", { fill: "#fff" }, mask);
  const holes = el("g", {}, mask);
  const paper = el("g", { mask: "url(#scMask)" }, svg);
  const bg = el("rect", { fill: BP }, paper), grid = el("rect", { fill: "url(#scGrid)" }, paper);
  const wires = el("g", {}, svg), scans = el("g", {}, svg);
  box.prepend(svg);
  box.classList.add("cover");   // plan opaque dès la première image, avant que le SVG soit dimensionné
  document.body.appendChild(box);
  const lab = box.querySelector(".sc-lab"), bar = box.querySelector("u span");
  lab.style.opacity = 1; bar.style.width = "35%";

  function start() {
    const w = W(), h = H();
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    for (const r of [maskBg, bg, grid]) { r.setAttribute("width", w); r.setAttribute("height", h); }
    box.classList.remove("cover");
    // blocs visibles à l'écran, dans l'ordre de lecture
    const blocks = [...document.querySelectorAll("[data-build]")]
      .map(n => ({ n, r: n.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 20 && r.height > 20 && r.bottom > 0 && r.top < h)
      .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)
      .slice(0, 10)
      .map(({ n, r }, i) => {
        const x = Math.max(0, r.left), y = Math.max(0, r.top), bw = Math.min(w, r.right) - x, bh = Math.min(h, r.bottom) - y;
        const g = el("g", {}, wires);
        const frame = el("rect", { x, y, width: bw, height: bh, rx: 10, fill: "rgba(34,211,238,.06)", stroke: "#7DD3FC", "stroke-width": 1.5, "stroke-dasharray": "6 6", pathLength: 1 }, g);
        frame.setAttribute("stroke-dasharray", "1"); frame.setAttribute("stroke-dashoffset", "1");
        const tx = el("text", { x: x + 12, y: y + 20 }, g); tx.textContent = n.dataset.build;
        el("path", { d: `M${x + bw / 2 - 8} ${y + bh / 2}h16M${x + bw / 2} ${y + bh / 2 - 8}v16`, stroke: "#7DD3FC", "stroke-width": 1, opacity: .6 }, g);
        const hole = el("rect", { x, y, width: bw, height: 0, rx: 10, fill: "#000" }, holes);
        const scan = el("rect", { x, y, width: bw, height: 3, fill: "#22D3EE", opacity: 0, style: "filter:drop-shadow(0 0 8px #22D3EE)" }, scans);
        return { g, frame, tx, hole, scan, y, bh, draw: 120 + i * 70, build: 520 + i * 130 };
      });
    const end = blocks.length ? blocks[blocks.length - 1].build + 480 : 300;
    tick(t => {
      lab.style.opacity = 1 - clamp((t - 150) / 250);
      bar.style.width = 35 + ease(t / end) * 65 + "%";
      for (const b of blocks) {
        const d = ease((t - b.draw) / 320), p = ease((t - b.build) / 440);
        b.frame.setAttribute("stroke-dashoffset", 1 - d);
        b.tx.style.opacity = d;
        b.g.style.opacity = 1 - clamp((t - b.build - 300) / 200);
        b.hole.setAttribute("height", b.bh * p);
        b.scan.setAttribute("y", b.y + b.bh * p - 1.5);
        b.scan.setAttribute("opacity", p > 0 && p < 1 ? 1 : 0);
      }
      box.style.opacity = 1 - clamp((t - end) / 350);   // le reste du plan s'efface
      return t < end + 380;
    }, () => box.remove());
  }
  // on mesure une fois la page en place (polices et ancre éventuelle)
  const go = () => requestAnimationFrame(() => requestAnimationFrame(start));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();

})();

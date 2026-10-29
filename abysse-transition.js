// Transition « les deux volets » entre les pages de la version test abysse (remplace transition.js sur abysse-*.html).
// Départ : deux panneaux d'eau profonde arrivent, l'un de la gauche, l'autre de la droite, et se rejoignent au milieu,
// où s'allume un fin trait au dégradé aurore (le même geste que le grand titre de l'accueil).
// Arrivée : la page s'ouvre sur ce même écran fermé, le trait s'éteint, les volets s'écartent chacun de son côté
// pendant que les grands titres entrent (l'un de la gauche, l'autre de la droite) et que le reste remonte (≈ 1 s).
// Un clic ou une touche termine tout. À inclure au tout début du <body>. Un bloc marqué data-arrive-off garde sa propre animation.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const OUT = "cubic-bezier(.16,1,.3,1)", DOUX = "cubic-bezier(.65,0,.35,1)";   // DOUX : départ et arrivée en douceur
  const css = document.createElement("style");
  css.textContent = `.ab-cover{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden}
.ab-vol{position:absolute;top:0;bottom:0;width:calc(50% + 1px);background:#011D1C}
.ab-vol.g{left:0}.ab-vol.d{right:0}
.ab-vol::after{content:"";position:absolute;top:0;bottom:0;width:18vw}
.ab-vol.g::after{left:100%;background:linear-gradient(90deg,#011D1C,rgba(1,29,28,0))}
.ab-vol.d::after{right:100%;background:linear-gradient(270deg,#011D1C,rgba(1,29,28,0))}
.ab-seam{position:absolute;top:0;bottom:0;left:calc(50% - .5px);width:1px;background:linear-gradient(#CBFFFC,#FFFDFA 50%,#FAD1FF);opacity:0}`;
  document.head.appendChild(css);
  // l'écran fermé : deux volets et le trait du milieu
  const cover = () => {
    const c = document.createElement("div"); c.className = "ab-cover"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<div class="ab-vol g"></div><div class="ab-vol d"></div><div class="ab-seam"></div>';
    document.body.appendChild(c); return [c, c.children[0], c.children[1], c.children[2]];
  };

  // ——— départ : vers une autre page de la version abysse
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\/abysse-[\w-]+\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    const [, g, d, seam] = cover();
    // volets au bord flou (dégradé de 18vw devant chaque panneau), la page derrière s'assombrit et recule un peu
    g.animate([{ transform: "translateX(calc(-100% - 18vw))" }, { transform: "none" }], { duration: 850, easing: DOUX, fill: "both" });
    d.animate([{ transform: "translateX(calc(100% + 18vw))" }, { transform: "none" }], { duration: 850, easing: DOUX, fill: "both" });
    document.querySelector("main")?.animate([{ opacity: 1, transform: "none" }, { opacity: .35, transform: "scale(.985)" }], { duration: 850, easing: DOUX, fill: "forwards" });
    // on change de page à la fin de l'animation, ou au bout de 0,7 s si le navigateur l'a mise en pause
    let parti = false;
    const part = () => { if (!parti) { parti = true; location.href = a.href; } };
    seam.animate([{ opacity: 0, transform: "scaleY(0)" }, { opacity: 1, transform: "none" }], { delay: 680, duration: 260, easing: OUT, fill: "both" }).finished.then(part);
    setTimeout(part, 1100);
  });

  if (reduce) { root.classList.remove("sc-pending"); return; }
  let current = null;

  function arrive() {
    // arrivée depuis l'écran d'entrée par la plongée dans la sphère : pas de volets, la page gère le dézoom
    let viaSphere = false;
    try { viaSphere = sessionStorage.getItem("abysse-arrivee") === "sphere"; sessionStorage.removeItem("abysse-arrivee"); } catch (_) {}
    if (viaSphere) { root.dataset.arrivee = "sphere"; root.classList.remove("sc-pending"); return; }
    // la page s'ouvre fermée, exactement comme la page précédente s'est terminée
    const [c, g, d, seam] = cover();
    seam.style.opacity = 1;
    // sécurité : si l'animation ne démarre pas (page chargée en arrière-plan, navigateur qui la met en pause),
    // les volets disparaissent quand même au bout de 3,2 s : la page n'est jamais cachée
    const secours = setTimeout(() => { if (current) current.done(); else { c.remove(); root.classList.remove("sc-pending"); } }, 3200);
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("sc-pending");
      const h = innerHeight, anims = [], seen = new Set();
      const ok = n => { const r = n.getBoundingClientRect(); return r.height > 2 && r.width > 2 && r.bottom > 0 && r.top < h && !n.closest("[hidden],.ab-cover,[data-arrive-off]") && getComputedStyle(n).visibility !== "hidden"; };
      const under = n => { for (let p = n.parentElement; p; p = p.parentElement) if (seen.has(p)) return true; return false; };
      const prevX = [root.style.overflowX, document.body.style.overflowX];         // les titres viennent de hors de l'écran :
      root.style.overflowX = document.body.style.overflowX = "clip";            // la page ne s'élargit pas pendant ce temps
      // le trait s'éteint, puis les volets s'écartent chacun de son côté
      // les volets s'écartent lentement et s'effacent en fondu sur la fin, au lieu de glisser d'un bloc
      anims.push(seam.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease-out", fill: "forwards" }));
      anims.push(g.animate([{ transform: "none", opacity: 1 }, { opacity: 1, offset: .45 }, { transform: "translateX(calc(-100% - 18vw))", opacity: 0 }], { delay: 120, duration: 1200, easing: DOUX, fill: "forwards" }));
      anims.push(d.animate([{ transform: "none", opacity: 1 }, { opacity: 1, offset: .45 }, { transform: "translateX(calc(100% + 18vw))", opacity: 0 }], { delay: 120, duration: 1200, easing: DOUX, fill: "forwards" }));
      // les grands titres : de la gauche, puis de la droite, puis de la gauche…
      let side = 1;
      for (const n of document.querySelectorAll("main h1, main h2")) {
        if (!ok(n) || under(n)) continue;
        seen.add(n); side = -side;
        const d = 140 + seen.size * 90;
        anims.push(n.animate([{ transform: `translateX(${side * 45}vw)`, opacity: 0 }, { transform: "none", opacity: 1 }], { delay: d, duration: 1150, easing: OUT, fill: "backwards" }));
      }
      // le reste remonte, dans l'ordre de lecture
      for (const n of document.querySelectorAll("main p, main li, main label, main dt, main dd, main summary, main .btn, main .surface, main img, main video, main svg, main form > *")) {
        if (seen.size > 90) break;
        if (seen.has(n) || under(n) || !ok(n)) continue;
        seen.add(n);
        const r = n.getBoundingClientRect(), d = 260 + (r.top / h) * 420 + (r.left / innerWidth) * 80;
        const media = /^(IMG|VIDEO)$/.test(n.tagName);
        anims.push(n.animate(media
          ? [{ opacity: 0, transform: "scale(1.04)", filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }]
          : [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { delay: d, duration: media ? 900 : 800, easing: OUT, fill: "backwards" }));
      }
      const stop = () => anims.forEach(a => a.finish());
      addEventListener("pointerdown", stop, { once: true });
      addEventListener("keydown", stop, { once: true });
      const done = () => { clearTimeout(secours); removeEventListener("pointerdown", stop); removeEventListener("keydown", stop); anims.forEach(a => a.cancel()); c.remove(); [root.style.overflowX, document.body.style.overflowX] = prevX; current = null; };
      Promise.all(anims.map(a => a.finished.catch(() => {}))).then(done);
      current = { done };
    }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  arrive();
  addEventListener("pageshow", e => { if (!e.persisted) return; if (current) current.done(); document.querySelectorAll(".ab-cover").forEach(n => n.remove()); arrive(); });
})();

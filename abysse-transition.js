// Transition « plongée » entre les pages de la version test abysse (remplace transition.js sur abysse-*.html).
// Départ : un disque d'eau profonde s'ouvre depuis le doigt et recouvre la page.
// Arrivée : le disque se referme vers le centre, les grands titres arrivent l'un de la gauche, l'autre de la droite,
// le reste remonte doucement et les images passent du flou au net (≈ 1 s). Un clic ou une touche termine tout.
// À inclure au tout début du <body>. Un bloc marqué data-arrive-off garde sa propre animation.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const OUT = "cubic-bezier(.16,1,.3,1)", INOUT = "cubic-bezier(.65,0,.35,1)";
  const css = document.createElement("style");
  css.textContent = `.ab-cover{position:fixed;inset:0;z-index:9999;pointer-events:none;background:#011D1C}
.ab-cover::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at var(--x,50%) var(--y,50%),rgba(0,130,124,.38),transparent 62%)}`;
  document.head.appendChild(css);
  const cover = () => { const c = document.createElement("div"); c.className = "ab-cover"; c.setAttribute("aria-hidden", "true"); document.body.appendChild(c); return c; };

  // ——— départ : vers une autre page de la version abysse
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\/abysse-[\w-]+\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    const c = cover(), x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    c.style.setProperty("--x", x + "px"); c.style.setProperty("--y", y + "px");
    c.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }], { duration: 520, easing: INOUT, fill: "both" })
      .finished.then(() => { location.href = a.href; });
  });

  if (reduce) { root.classList.remove("sc-pending"); return; }
  let current = null;

  function arrive() {
    const c = cover();
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("sc-pending");
      const h = innerHeight, anims = [], seen = new Set();
      const ok = n => { const r = n.getBoundingClientRect(); return r.height > 2 && r.width > 2 && r.bottom > 0 && r.top < h && !n.closest("[hidden],.ab-cover,[data-arrive-off]") && getComputedStyle(n).visibility !== "hidden"; };
      const under = n => { for (let p = n.parentElement; p; p = p.parentElement) if (seen.has(p)) return true; return false; };
      const prevX = [root.style.overflowX, document.body.style.overflowX];         // les titres viennent de hors de l'écran :
      root.style.overflowX = document.body.style.overflowX = "clip";            // la page ne s'élargit pas pendant ce temps
      anims.push(c.animate([{ clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)" }], { duration: 760, easing: INOUT, fill: "forwards" }));
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
      const done = () => { removeEventListener("pointerdown", stop); removeEventListener("keydown", stop); anims.forEach(a => a.cancel()); c.remove(); [root.style.overflowX, document.body.style.overflowX] = prevX; current = null; };
      Promise.all(anims.map(a => a.finished.catch(() => {}))).then(done);
      current = { done };
    }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  arrive();
  addEventListener("pageshow", e => { if (!e.persisted) return; if (current) current.done(); document.querySelectorAll(".ab-cover").forEach(n => n.remove()); arrive(); });
})();

// Transition « mini-plongée » entre les pages de la version test abysse (remplace transition.js sur abysse-*.html).
// Le même geste que l'entrée → accueil, en plus court :
// Départ : la page s'assombrit dans l'eau profonde, une petite sphère de particules apparaît au centre, on plonge dedans.
// Arrivée : on ressort de la sphère (elle recule, puis s'efface), l'eau s'éclaircit et dévoile la page ;
// les grands titres entrent l'un de la gauche, l'autre de la droite, le reste remonte (≈ 1,4 s).
// Arrivée directe (lien extérieur, rechargement) : seulement un fondu court et le texte qui remonte.
// Un clic ou une touche termine tout. À inclure au tout début du <body>. Un bloc marqué data-arrive-off garde sa propre animation.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const OUT = "cubic-bezier(.16,1,.3,1)";
  const KEY = "abysse-arrivee";
  const css = document.createElement("style");
  css.textContent = `.ab-cover{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden}
.ab-eau{position:absolute;inset:0;background:#012624}
.ab-cover canvas{position:absolute;inset:0;width:100%;height:100%}`;
  document.head.appendChild(css);
  const easeIn = p => p * p * p, easeInOut = p => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
  const clamp = p => Math.min(1, Math.max(0, p));

  // le rideau : l'eau (un aplat) et, si besoin, la sphère de particules dessinée par-dessus
  function cover(withOrb, plan) {
    const c = document.createElement("div"); c.className = "ab-cover"; c.setAttribute("aria-hidden", "true");
    const eau = document.createElement("div"); eau.className = "ab-eau"; c.appendChild(eau);
    document.body.appendChild(c);
    let stop = () => {};
    if (withOrb) {
      const cv = document.createElement("canvas"); c.appendChild(cv);
      const ctx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = Math.min(W * .3, H * .24, 260), n = W < 700 ? 800 : 1500, g = Math.PI * (3 - Math.sqrt(5));
      const pts = Array.from({ length: n }, (_, i) => { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = g * i; return [Math.cos(a) * r, y, Math.sin(a) * r, .6 + Math.random() * .8]; });
      const t0 = performance.now(); let raf = 0;
      const draw = now => {
        const ms = Math.max(0, now - t0), [Z, A] = plan(ms);   // zoom et opacité de la sphère à cet instant
        ctx.clearRect(0, 0, W, H);
        if (A > 0) {
          const ay = ms / 1000 * .5, ax = -.35, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), ox = W / 2, oy = H / 2, RR = R * Z;
          const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, RR * 1.25);
          glow.addColorStop(0, `rgba(0,130,124,${.3 * A})`); glow.addColorStop(1, "rgba(0,130,124,0)"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
          for (const [x0, y0, z0, s] of pts) {
            const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy, y1 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
            const k = 2.6 / (2.6 - z2), X = ox + x1 * RR * k, Y = oy + y1 * RR * k;
            if (X < -4 || Y < -4 || X > W + 4 || Y > H + 4) continue;
            const rim = 1 - Math.abs(z2), front = (z2 + 1) / 2, a = (.18 + front * .82) * A;
            ctx.fillStyle = rim > .8 && x1 > -.2 ? `rgba(250,209,255,${Math.min(1, a * 1.3)})` : front > .55 ? `rgba(237,255,254,${a})` : `rgba(0,170,160,${a * .8})`;
            const r = s * k * (W < 700 ? 1.5 : 1.9); ctx.fillRect(X - r / 2, Y - r / 2, r, r);
          }
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      stop = () => cancelAnimationFrame(raf);
    }
    return { c, eau, stop };
  }

  // ——— départ : vers une autre page de la version abysse
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\/abysse-[\w-]+\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    try { sessionStorage.setItem(KEY, "mini"); } catch (_) {}
    let parti = false;
    const part = () => { if (!parti) { parti = true; location.href = a.href; } };
    // 0–350 ms : l'eau monte et la sphère apparaît ; 350–950 ms : on plonge dedans (le zoom accélère)
    const { eau } = cover(true, ms => {
      if (ms >= 950) part();
      return [1 + 11 * easeIn(clamp((ms - 350) / 600)), clamp(ms / 300)];
    });
    eau.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out", fill: "both" });
    setTimeout(part, 1300);                                   // si le navigateur met l'animation en pause
  });

  if (reduce) { root.classList.remove("sc-pending"); return; }
  let current = null;

  function arrive() {
    let via = "";
    try { via = sessionStorage.getItem(KEY) || ""; sessionStorage.removeItem(KEY); } catch (_) {}
    // arrivée depuis l'écran d'entrée : la page d'accueil fait elle-même le recul dans sa grande sphère
    if (via === "sphere") { root.dataset.arrivee = "sphere"; root.classList.remove("sc-pending"); return; }
    const mini = via === "mini";
    // on ressort de la sphère : elle recule (12 → 1) en 1 s, puis s'efface ; l'eau s'éclaircit à partir de 0,85 s
    const { c, eau, stop: stopOrb } = cover(mini, ms => [1 + 11 * (1 - easeInOut(clamp(ms / 1000))), 1 - clamp((ms - 900) / 400)]);
    const tCover = performance.now();
    // sécurité : si l'animation ne démarre pas (page chargée en arrière-plan, navigateur qui la met en pause),
    // le rideau disparaît quand même au bout de 3,2 s : la page n'est jamais cachée
    const secours = setTimeout(() => { if (current) current.done(); else { stopOrb(); c.remove(); root.classList.remove("sc-pending"); } }, 3200);
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("sc-pending");
      const h = innerHeight, anims = [], seen = new Set();
      const ok = n => { const r = n.getBoundingClientRect(); return r.height > 2 && r.width > 2 && r.bottom > 0 && r.top < h && !n.closest("[hidden],.ab-cover,[data-arrive-off]") && getComputedStyle(n).visibility !== "hidden"; };
      const under = n => { for (let p = n.parentElement; p; p = p.parentElement) if (seen.has(p)) return true; return false; };
      const prevX = [root.style.overflowX, document.body.style.overflowX];         // les titres viennent de hors de l'écran :
      root.style.overflowX = document.body.style.overflowX = "clip";            // la page ne s'élargit pas pendant ce temps
      const late = Math.max(0, (mini ? 850 : 0) - (performance.now() - tCover)); // la page apparaît quand l'eau s'éclaircit
      anims.push(eau.animate([{ opacity: 1 }, { opacity: 0 }], { delay: late, duration: mini ? 500 : 320, easing: "ease-in-out", fill: "forwards" }));
      if (mini) anims.push(c.animate([{ opacity: 1 }, { opacity: 1 }], { duration: late + 520 }));   // garde la sphère le temps qu'elle s'efface
      // les grands titres : de la gauche, puis de la droite, puis de la gauche…
      let side = 1;
      for (const n of document.querySelectorAll("main h1, main h2")) {
        if (!ok(n) || under(n)) continue;
        seen.add(n); side = -side;
        anims.push(n.animate([{ transform: `translateX(${side * 45}vw)`, opacity: 0 }, { transform: "none", opacity: 1 }], { delay: late + seen.size * 90, duration: 1150, easing: OUT, fill: "backwards" }));
      }
      // le reste remonte, dans l'ordre de lecture
      for (const n of document.querySelectorAll("main p, main li, main label, main dt, main dd, main summary, main .btn, main .surface, main img, main video, main svg, main form > *")) {
        if (seen.size > 90) break;
        if (seen.has(n) || under(n) || !ok(n)) continue;
        seen.add(n);
        const r = n.getBoundingClientRect(), d = late + 120 + (r.top / h) * 420 + (r.left / innerWidth) * 80;
        const media = /^(IMG|VIDEO)$/.test(n.tagName);
        anims.push(n.animate(media
          ? [{ opacity: 0, transform: "scale(1.04)", filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }]
          : [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { delay: d, duration: media ? 900 : 800, easing: OUT, fill: "backwards" }));
      }
      const stop = () => anims.forEach(a => a.finish());
      addEventListener("pointerdown", stop, { once: true });
      addEventListener("keydown", stop, { once: true });
      const done = () => { clearTimeout(secours); removeEventListener("pointerdown", stop); removeEventListener("keydown", stop); anims.forEach(a => a.cancel()); stopOrb(); c.remove(); [root.style.overflowX, document.body.style.overflowX] = prevX; current = null; };
      Promise.all(anims.map(a => a.finished.catch(() => {}))).then(done);
      current = { done };
    }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  arrive();
  addEventListener("pageshow", e => { if (!e.persisted) return; if (current) current.done(); document.querySelectorAll(".ab-cover").forEach(n => n.remove()); arrive(); });
})();

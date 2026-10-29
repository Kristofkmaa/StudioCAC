// Transition « mini-plongée » entre les pages de la version test abysse (sur les pages principales du site).
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
  // ——— pendant une transition, on ne défile pas (molette, doigt, clavier) ; la page d'arrivée s'ouvre toujours tout en haut
  let verrou = false;
  const bloque = e => { if (verrou) e.preventDefault(); };
  addEventListener("wheel", bloque, { passive: false });
  addEventListener("touchmove", bloque, { passive: false });
  addEventListener("keydown", e => { if (verrou && [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) e.preventDefault(); });
  const verrouiller = on => { verrou = on; root.style.overscrollBehavior = on ? "none" : ""; };
  const enHaut = () => { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; scrollTo(0, 0); };
  const easeIn = p => p * p * p, easeInOut = p => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
  const clamp = p => Math.min(1, Math.max(0, p));

  // le rideau : l'eau (un aplat) et, si besoin, la sphère de particules dessinée par-dessus
  function cover(withOrb, plan) {
    const c = document.createElement("div"); c.className = "ab-cover"; c.setAttribute("aria-hidden", "true");
    const eau = document.createElement("div"); eau.className = "ab-eau"; c.appendChild(eau);
    document.body.appendChild(c);
    let stop = () => {}, t0 = null;   // t0 : début de l'animation de la sphère (elle reste figée avant)
    if (withOrb) {
      const cv = document.createElement("canvas"); c.appendChild(cv);
      const sphere = AbysseSphere.create(cv); let raf = 0;   // la sphère du site, à sa place
      const draw = now => { const [Z, A] = plan(t0 === null ? 0 : Math.max(0, now - t0)); sphere.draw({ Z, A }); raf = requestAnimationFrame(draw); };
      raf = requestAnimationFrame(draw);
      stop = () => cancelAnimationFrame(raf);
    }
    return { c, eau, stop, start: () => { t0 = performance.now(); } };
  }

  // ——— la page suivante est demandée dès que le doigt se pose sur le lien (ou que la souris s'y arrête) :
  // elle est déjà là à la fin de la plongée, l'image ne reste pas figée pendant le téléchargement
  const dejaDemandees = new Set();
  const interne = a => { if (!a || a.target === "_blank") return null; const u = new URL(a.href, location.href); return u.origin === location.origin && /\/(index|accueil|tarifs|devis|charte|photos|cgv|mentions-legales)\.html$/.test(u.pathname) && u.pathname !== location.pathname ? u : null; };
  const precharge = href => { if (dejaDemandees.has(href)) return; dejaDemandees.add(href); const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l); };
  addEventListener("pointerdown", e => { const a = e.target.closest?.("a[href]"); if (interne(a)) precharge(a.href); }, { passive: true, capture: true });
  addEventListener("pointerover", e => { const a = e.target.closest?.("a[href]"); if (e.pointerType === "mouse" && interne(a)) precharge(a.href); }, { passive: true });

  // ——— départ : vers une autre page du site
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\/(index|accueil|tarifs|devis|charte|photos|cgv|mentions-legales)\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    verrouiller(true);
    precharge(a.href);                                        // la page suivante se télécharge pendant la plongée
    AbysseSphere.suivre(false);                               // la sphère revient au centre pendant qu'on plonge
    try { sessionStorage.setItem(KEY, "mini"); } catch (_) {}
    let parti = false;
    const part = () => { if (!parti) { parti = true; location.href = a.href; } };
    // 0–350 ms : l'eau monte et la sphère apparaît ; 350–950 ms : on plonge dedans (le zoom accélère) ;
    // 950–1150 ms : les points s'éteignent. Le changement de page se fait sur un écran uni et immobile :
    // le court arrêt du navigateur entre deux pages ne se voit plus.
    const { eau, start } = cover(true, ms => {
      if (ms >= 1170) part();
      return [1 + 11 * easeIn(clamp((ms - 350) / 600)), Math.min(clamp(ms / 300), 1 - clamp((ms - 950) / 200))];
    });
    start();
    eau.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out", fill: "both" }).finished.then(() => AbysseSphere.cache(true));
    setTimeout(part, 1500);                                   // si le navigateur met l'animation en pause
  });

  if (reduce) { root.classList.remove("sc-pending"); return; }
  let current = null;

  function arrive() {
    // toujours tout en haut, même si l'adresse vise une section (#…) ou si le navigateur voulait reprendre l'ancienne position
    enHaut();
    addEventListener("load", enHaut, { once: true });
    verrouiller(true);
    let via = "";
    try { via = sessionStorage.getItem(KEY) || ""; sessionStorage.removeItem(KEY); } catch (_) {}
    // arrivée depuis l'écran d'entrée : la page d'accueil fait elle-même le recul dans sa grande sphère
    if (via === "sphere") { root.dataset.arrivee = "sphere"; root.classList.remove("sc-pending"); setTimeout(() => verrouiller(false), 2400); return; }
    const mini = via === "mini";
    // on ressort de la sphère : elle recule (12 → 1) en 1 s, puis s'efface ; l'eau s'éclaircit à partir de 0,85 s
    if (mini) AbysseSphere.cache(true);                       // les autres sphères de la page attendent sous le rideau
    // on part d'un écran uni (comme la page précédente s'est terminée) ; une fois la page prête, les points se rallument
    // et la sphère recule (12 → 1) en 1 s, puis s'efface sur celle de la page
    const { c, eau, stop: stopOrb, start } = cover(mini, ms => [1 + 11 * (1 - easeInOut(clamp(ms / 1000))), Math.min(clamp(ms / 300), 1 - clamp((ms - 900) / 400))]);
    // sécurité : si l'animation ne démarre pas (page chargée en arrière-plan, navigateur qui la met en pause),
    // le rideau disparaît quand même au bout de 3,2 s : la page n'est jamais cachée
    const secours = setTimeout(() => { AbysseSphere.cache(false); verrouiller(false); if (current) current.done(); else { stopOrb(); c.remove(); root.classList.remove("sc-pending"); } }, 3200);
    const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("sc-pending");
      const h = innerHeight, anims = [], seen = new Set();
      const ok = n => { const r = n.getBoundingClientRect(); return r.height > 2 && r.width > 2 && r.bottom > 0 && r.top < h && !n.closest("[hidden],.ab-cover,[data-arrive-off]") && getComputedStyle(n).visibility !== "hidden"; };
      const under = n => { for (let p = n.parentElement; p; p = p.parentElement) if (seen.has(p)) return true; return false; };
      const prevX = [root.style.overflowX, document.body.style.overflowX];         // les titres viennent de hors de l'écran :
      root.style.overflowX = document.body.style.overflowX = "clip";            // la page ne s'élargit pas pendant ce temps
      enHaut();
      start();                                                  // la page est prête : le recul commence maintenant, sans à-coup
      const late = mini ? 850 : 0;                              // la page apparaît quand l'eau s'éclaircit
      setTimeout(() => AbysseSphere.cache(false), late);
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
          ? [{ opacity: 0, transform: "scale(1.04)" }, { opacity: 1, transform: "none" }]   // pas de flou : trop coûteux pendant la transition
          : [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { delay: d, duration: media ? 900 : 800, easing: OUT, fill: "backwards" }));
      }
      const stop = () => anims.forEach(a => a.finish());
      addEventListener("pointerdown", stop, { once: true });
      addEventListener("keydown", stop, { once: true });
      const done = () => { clearTimeout(secours); removeEventListener("pointerdown", stop); removeEventListener("keydown", stop); anims.forEach(a => a.cancel()); stopOrb(); c.remove(); AbysseSphere.cache(false); verrouiller(false); [root.style.overflowX, document.body.style.overflowX] = prevX; current = null; };
      Promise.all(anims.map(a => a.finished.catch(() => {}))).then(done);
      current = { done };
    }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  }
  arrive();
  addEventListener("pageshow", e => { if (!e.persisted) return; if (current) current.done(); document.querySelectorAll(".ab-cover").forEach(n => n.remove()); arrive(); });
})();

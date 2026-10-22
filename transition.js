// Transition entre les pages StudioCac : un disque aux couleurs de la marque s'ouvre depuis le lien cliqué
// (liens avec data-transition="Texte affiché"), puis, sur la page d'arrivée, il se referme vers ce même point.
// À inclure au tout début du <body> pour que le voile couvre la page avant son premier affichage.
(() => {
  const KEY = "studiocac-transition";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const style = document.createElement("style");
  style.textContent = `
.sc-veil{position:fixed;inset:0;z-index:9999;pointer-events:none;
  background:radial-gradient(circle at var(--x,50%) var(--y,50%),#FF5FA2 0,#7C5CFF 32%,#141A4A 64%,#070A1A 100%);
  clip-path:circle(0 at var(--x,50%) var(--y,50%));transition:clip-path .75s cubic-bezier(.7,0,.2,1)}
.sc-veil::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:48px 48px}
.sc-veil.grow{clip-path:circle(150vmax at var(--x,50%) var(--y,50%))}
.sc-veil.full{clip-path:circle(150vmax at var(--x,50%) var(--y,50%));transition:none}
.sc-veil.full.out{clip-path:circle(0 at var(--x,50%) var(--y,50%));transition:clip-path .8s cubic-bezier(.7,0,.2,1) .2s}
.sc-mark{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:18px;text-align:center;padding:24px;color:#fff;
  font:800 clamp(26px,4vw,44px)/1.1 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.02em;opacity:0;transform:translateY(14px);transition:opacity .35s .3s,transform .5s .3s}
.sc-mark i{width:56px;height:56px;border-radius:16px;background:conic-gradient(from 210deg,#7C5CFF,#22D3EE,#FF5FA2,#7C5CFF);box-shadow:0 0 40px rgba(124,92,255,.9)}
.sc-veil.grow .sc-mark,.sc-veil.full .sc-mark{opacity:1;transform:none}
.sc-veil.full.out .sc-mark{opacity:0;transform:scale(.9);transition:opacity .25s,transform .4s}`;
  document.head.appendChild(style);

  const veil = document.createElement("div");
  veil.className = "sc-veil";
  veil.setAttribute("aria-hidden", "true");
  veil.innerHTML = '<div class="sc-mark"><i></i><span></span></div>';
  const label = veil.querySelector("span");

  // arrivée : le disque couvre la page puis se referme vers le point du clic d'origine
  let arrival = null;
  try { arrival = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (_) {}
  if (arrival && !reduce) {
    label.textContent = arrival.label || "";
    veil.style.setProperty("--x", (arrival.x ?? .5) * 100 + "%");
    veil.style.setProperty("--y", (arrival.y ?? .5) * 100 + "%");
    veil.classList.add("full");
    document.body.appendChild(veil);
    document.documentElement.classList.add("sc-arrive");
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("out")));
    setTimeout(() => { veil.remove(); veil.className = "sc-veil"; }, 1200);
  }

  // départ : le disque s'ouvre depuis le clic, puis on change de page
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-transition]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    const x = (e.clientX || r.left + r.width / 2) / innerWidth, y = (e.clientY || r.top + r.height / 2) / innerHeight;
    veil.style.setProperty("--x", x * 100 + "%");
    veil.style.setProperty("--y", y * 100 + "%");
    label.textContent = a.dataset.transition;
    veil.className = "sc-veil";
    document.body.appendChild(veil);
    veil.getBoundingClientRect();   // applique l'état de départ avant d'animer
    veil.classList.add("grow");
    try { sessionStorage.setItem(KEY, JSON.stringify({ label: a.dataset.transition, x, y })); } catch (_) {}
    setTimeout(() => { location.href = a.href; }, 800);
  });

  // retour arrière du navigateur : la page restaurée ne doit pas rester couverte
  addEventListener("pageshow", e => { if (e.persisted) { veil.remove(); veil.className = "sc-veil"; } });
})();

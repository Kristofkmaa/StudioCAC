// Transition entre les pages StudioCac : une vague liquide aux couleurs de la marque monte du bas de l'écran
// et recouvre la page (liens avec data-transition="Texte affiché"), puis, sur la page d'arrivée, elle continue
// de monter et sort par le haut. Deux couches (rose devant, nuit derrière) ondulent à des rythmes différents.
// À inclure au tout début du <body> pour que la vague couvre la page avant son premier affichage.
(() => {
  const KEY = "studiocac-transition";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COVER = 900, REVEAL = 950, HOLD = 120;   // durées en ms

  const style = document.createElement("style");
  style.textContent = `
.sc-wave{position:fixed;inset:0;z-index:9999;pointer-events:none}
.sc-wave svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.sc-mark{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:18px;text-align:center;padding:24px;color:#fff;
  font:800 clamp(26px,4vw,44px)/1.1 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.02em;opacity:0}
.sc-mark i{width:56px;height:56px;border-radius:16px;background:conic-gradient(from 210deg,#7C5CFF,#22D3EE,#FF5FA2,#7C5CFF);box-shadow:0 0 40px rgba(124,92,255,.9)}`;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.className = "sc-wave";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = `<svg preserveAspectRatio="none"><defs>
      <linearGradient id="scFront" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5FA2"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient>
      <linearGradient id="scBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2A8F"/><stop offset=".45" stop-color="#141A4A"/><stop offset="1" stop-color="#070A1A"/></linearGradient>
    </defs><path fill="url(#scFront)"/><path fill="url(#scBack)"/></svg><div class="sc-mark"><i></i><span></span></div>`;
  const [front, back] = box.querySelectorAll("path");
  const mark = box.querySelector(".sc-mark"), label = box.querySelector("span");

  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;

  // ligne ondulée à la hauteur y : deux sinusoïdes qui glissent dans le temps, amplitude a
  function waveLine(y, a, t, phase) {
    const W = innerWidth, pts = [];
    for (let x = 0; x <= W + 24; x += 24) {
      const k = x / W * Math.PI * 2;
      pts.push(`${x},${(y + a * Math.sin(k * 1.3 + t * 3.2 + phase) + a * .45 * Math.sin(k * 2.7 - t * 4.1 + phase * 2)).toFixed(1)}`);
    }
    return pts.join(" L");
  }
  // remplissage sous la vague (montée) ou au-dessus (sortie)
  const below = (y, a, t, ph) => `M0,${innerHeight} L${waveLine(y, a, t, ph)} L${innerWidth + 24},${innerHeight} Z`;
  const above = (y, a, t, ph) => `M0,0 L${waveLine(y, a, t, ph)} L${innerWidth + 24},0 Z`;

  // une couche : p = avancement 0→1, la vague va du bas (H + marge) au haut (−marge)
  function draw(path, p, cover, t, ph) {
    const H = innerHeight, A = Math.min(70, H * .08), e = ease(clamp(p));
    const y = (H + A * 1.6) - e * (H + A * 3.2);
    const a = A * Math.sin(Math.PI * clamp(p)) + 6;          // l'onde s'aplatit au départ et à l'arrivée
    path.setAttribute("d", cover ? below(y, a, t, ph) : above(y, a, t, ph));
  }

  function size() { box.firstElementChild.setAttribute("viewBox", `0 0 ${innerWidth + 24} ${innerHeight}`); }

  function run(cover, duration, done) {
    size();
    const t0 = performance.now();
    const frame = () => {
      const el = performance.now() - t0, p = el / duration, t = el / 1000;
      // en montée, le rose ouvre la marche et la nuit suit ; en sortie, la nuit part la première
      draw(front, cover ? p * 1.12 : p * 1.12 - .12, cover, t, 0);
      draw(back, cover ? p * 1.12 - .12 : p * 1.12, cover, t, 1.7);
      mark.style.opacity = cover ? clamp((p - .55) / .35) : 1 - clamp(p / .3);
      mark.style.transform = `translateY(${cover ? (1 - clamp((p - .55) / .35)) * 16 : -clamp(p / .3) * 16}px)`;
      if (p < 1.15) requestAnimationFrame(frame); else done && done();
    };
    requestAnimationFrame(frame);
  }

  // arrivée : la page est couverte d'emblée, puis la vague sort par le haut
  let arrival = null;
  try { arrival = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (_) {}
  if (arrival && !reduce) {
    label.textContent = arrival.label || "";
    size();
    draw(front, 0, false, 0, 0); draw(back, 0, false, 0, 1.7);
    mark.style.opacity = 1;
    document.body.appendChild(box);
    document.documentElement.classList.add("sc-arrive");
    setTimeout(() => run(false, REVEAL, () => box.remove()), HOLD);
  }

  // départ : la vague monte et recouvre la page, puis on change de page
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-transition]");
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    label.textContent = a.dataset.transition;
    mark.style.opacity = 0;
    draw(front, 0, true, 0, 0); draw(back, 0, true, 0, 1.7);
    document.body.appendChild(box);
    try { sessionStorage.setItem(KEY, JSON.stringify({ label: a.dataset.transition })); } catch (_) {}
    run(true, COVER, () => { location.href = a.href; });
  });

  // retour arrière du navigateur : la page restaurée ne doit pas rester couverte
  addEventListener("pageshow", e => { if (e.persisted) box.remove(); });
})();

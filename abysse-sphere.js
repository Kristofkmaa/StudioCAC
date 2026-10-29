// La sphère de particules de la version abysse : UNE seule sphère pour tout le site (entrée, accueil, fond des pages,
// transitions). Même taille, mêmes particules (tirées sans hasard), même place au centre de l'écran, et une rotation
// réglée sur l'horloge : d'une page à l'autre, la sphère reprend exactement la position où on l'a quittée.
// L'inclinaison vers le doigt est partagée sur la page : la transition la reprend et la ramène au centre.
// À inclure au tout début du <body>, avant abysse-transition.js et abysse-fond.js.
window.AbysseSphere = (() => {
  const VITESSE = .12;                                     // radians par seconde, partout
  const OR = Math.PI * (3 - Math.sqrt(5));
  const cache = {};
  const points = n => cache[n] || (cache[n] = Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = OR * i;
    return [Math.cos(a) * r, y, Math.sin(a) * r, .6 + ((i * .6180339887) % 1) * .8];   // taille de chaque point : toujours la même
  }));
  const incl = { x: 0, y: 0 }, cible = { x: 0, y: 0 };
  let suit = false;
  addEventListener("pointermove", e => { if (suit) { cible.x = e.clientX / innerWidth - .5; cible.y = e.clientY / innerHeight - .5; } }, { passive: true });
  // suivre(true) : la sphère penche vers le doigt ; suivre(false) : elle revient doucement au centre (transitions)
  const suivre = on => { suit = on && !matchMedia("(prefers-reduced-motion: reduce)").matches; if (!suit) cible.x = cible.y = 0; };

  function create(cv) {
    const ctx = cv.getContext("2d");
    let W, H, R, pts, mob;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W * .38, H * .34, 400); mob = W < 700; pts = points(mob ? 1200 : 2200);
    };
    size();
    // Z : zoom (1 = taille normale, 12 = on est dedans) ; A : intensité (1 = pleine) ; grow : grossissement au défilement
    const draw = ({ Z = 1, A = 1, grow = 1 } = {}) => {
      incl.x += (cible.x - incl.x) * .05; incl.y += (cible.y - incl.y) * .05;
      ctx.clearRect(0, 0, W, H);
      if (A <= 0) return;
      const ay = (Date.now() / 1000 * VITESSE) % (Math.PI * 2) + incl.x * .6, ax = -.35 + incl.y * .4;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), ox = W / 2, oy = H / 2, RR = R * Z * grow;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, RR * 1.25);
      glow.addColorStop(0, `rgba(0,130,124,${.28 * A})`); glow.addColorStop(1, "rgba(0,130,124,0)"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      for (const [x0, y0, z0, s] of pts) {
        const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy, y1 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
        const k = 2.6 / (2.6 - z2), X = ox + x1 * RR * k, Y = oy + y1 * RR * k;
        if (X < -4 || Y < -4 || X > W + 4 || Y > H + 4) continue;
        const rim = 1 - Math.abs(z2), front = (z2 + 1) / 2, a = (.18 + front * .82) * A;   // devant : blanc ; bord : rose ; derrière : sarcelle
        ctx.fillStyle = rim > .8 && x1 > -.2 ? `rgba(250,209,255,${Math.min(1, a * 1.3)})` : front > .55 ? `rgba(237,255,254,${a})` : `rgba(0,170,160,${a * .8})`;
        const r = s * k * (mob ? 1.5 : 1.9); ctx.fillRect(X - r / 2, Y - r / 2, r, r);
      }
    };
    return { draw, size };
  }
  return { create, suivre };
})();

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
      const dpr = Math.min(devicePixelRatio || 1, 1.5);   // au-delà, l'œil ne voit pas la différence sur des points, le téléphone si
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W * .38, H * .34, 400); mob = W < 700; pts = points(mob ? 1200 : 2200);
    };
    size();
    // Pour rester fluide, les points ne sont pas peints un par un avec leur propre couleur : on les range d'abord
    // par teinte (rose du bord, blanc de devant, sarcelle de derrière) et par intensité (12 niveaux),
    // puis chaque groupe est peint d'une seule couleur. Une trentaine de changements de couleur par image au lieu de 2 200.
    const NIV = 12, GROUPES = 3 * NIV;
    let px, py, pr, grp, ordre, compte = new Int32Array(GROUPES + 1);
    const tampons = n => { px = new Float32Array(n); py = new Float32Array(n); pr = new Float32Array(n); grp = new Int16Array(n); ordre = new Int32Array(n); };
    // Z : zoom (1 = taille normale, 12 = on est dedans) ; A : intensité (1 = pleine) ; grow : grossissement au défilement
    const draw = ({ Z = 1, A = 1, grow = 1 } = {}) => {
      incl.x += (cible.x - incl.x) * .05; incl.y += (cible.y - incl.y) * .05;
      ctx.clearRect(0, 0, W, H);
      if (A <= 0) return;
      if (!px || px.length !== pts.length) tampons(pts.length);
      const ay = (Date.now() / 1000 * VITESSE) % (Math.PI * 2) + incl.x * .6, ax = -.35 + incl.y * .4;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), ox = W / 2, oy = H / 2, RR = R * Z * grow, taille = mob ? 1.5 : 1.9;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, RR * 1.25);
      glow.addColorStop(0, `rgba(20,120,150,${.28 * A})`); glow.addColorStop(1, "rgba(20,120,150,0)"); ctx.fillStyle = glow;
      const gr = RR * 1.25, gx = Math.max(0, ox - gr), gy = Math.max(0, oy - gr);   // le halo n'est peint que là où il existe
      ctx.fillRect(gx, gy, Math.min(W, ox + gr) - gx, Math.min(H, oy + gr) - gy);
      compte.fill(0);
      let n = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0, z0, s] = pts[i];
        const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy, y1 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
        const k = 2.6 / (2.6 - z2), X = ox + x1 * RR * k, Y = oy + y1 * RR * k;
        if (X < -4 || Y < -4 || X > W + 4 || Y > H + 4) continue;
        const rim = 1 - Math.abs(z2), front = (z2 + 1) / 2;   // devant : blanc ; bord : corail ; derrière : sarcelle
        const teinte = rim > .8 && x1 > -.2 ? 0 : front > .55 ? 1 : 2, g = teinte * NIV + Math.min(NIV - 1, front * NIV | 0);
        const r = s * k * taille;
        px[n] = X - r / 2; py[n] = Y - r / 2; pr[n] = r; grp[n] = g; compte[g + 1]++; n++;
      }
      for (let g = 0; g < GROUPES; g++) compte[g + 1] += compte[g];          // début de chaque groupe
      const pos = compte.slice(0, GROUPES);
      for (let i = 0; i < n; i++) ordre[pos[grp[i]]++] = i;
      for (let g = 0; g < GROUPES; g++) {
        const de = compte[g], a = compte[g + 1];
        if (de === a) continue;
        const teinte = g / NIV | 0, f = ((g % NIV) + .5) / NIV, base = (.18 + f * .82) * A;
        ctx.fillStyle = teinte === 0 ? `rgba(255,206,186,${Math.min(1, base * 1.3)})` : teinte === 1 ? `rgba(238,248,251,${base})` : `rgba(40,160,190,${base * .8})`;
        for (let j = de; j < a; j++) { const i = ordre[j]; ctx.fillRect(px[i], py[i], pr[i], pr[i]); }
      }
    };
    return { draw, size };
  }
  // cache(true) : un rideau couvre l'écran (transition), les sphères de la page peuvent arrêter de se dessiner
  let cachee = false;
  const cache_ = on => { cachee = on; };
  return { create, suivre, cache: cache_, get cachee() { return cachee; } };
})();

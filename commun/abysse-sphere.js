// La galerie marchande du site : UN seul décor pour tout le site (entrée, accueil, fond des pages, transitions).
// Depuis le 11 novembre 2026 elle remplace la sphère de points (« ça fait site de réseau »). Le fichier et l'objet gardent
// leur nom, AbysseSphere, et la même interface (create, draw({ Z, A, grow }), size, suivre, cache) : rien d'autre n'a changé.
// Ce qu'on voit : un passage couvert en perspective, fait de points. Deux rangées de boutiques face à face (vitrine éclairée,
// porte, store de couleur, enseigne avec un nom de métier), une verrière en arceaux, des lanternes, un dallage.
// On y avance lentement, à une vitesse réglée sur l'horloge : d'une page à l'autre, on reprend exactement où on en était.
// Le regard ne suit presque pas le doigt : un balancement plus fort donnait le mal de mer.
// À inclure au tout début du <body>, avant abysse-transition.js et abysse-fond.js.
window.AbysseSphere = (() => {
  const VITESSE = .16, L = 1.6;                           // unités par seconde, longueur d'une travée (deux boutiques face à face)
  const NOMS = ["BOULANGERIE", "FLEURISTE", "CAFÉ", "LIBRAIRIE", "ÉPICERIE", "COIFFEUR", "ATELIER", "FROMAGERIE", "PRIMEUR", "CAVE", "BIJOUTERIE", "RESTAURANT", "CORDONNERIE", "PÂTISSERIE"];
  const incl = { x: 0, y: 0 }, cible = { x: 0, y: 0 };
  let suit = false;
  addEventListener("pointermove", e => { if (suit) { cible.x = e.clientX / innerWidth - .5; cible.y = e.clientY / innerHeight - .5; } }, { passive: true });
  // suivre(true) : le regard se décale un peu vers le doigt ; suivre(false) : il revient au centre (transitions)
  const suivre = on => { suit = on && !matchMedia("(prefers-reduced-motion: reduce)").matches; if (!suit) cible.x = cible.y = 0; };

  // les points d'une travée, calculés une fois : [x, y, z, éclat, vitrine (0 non, 1 gauche, 2 droite)]
  const TRAVEE = (() => { const P = [], pt = (x, y, z, b, w) => P.push(x, y, z, b, w || 0),
      ligne = (a, b, n, e, w) => { n = Math.max(2, Math.round(n * 2.8)); for (let i = 0; i <= n; i++) { const k = i / n; pt(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, e, w); } },
      cadre = (x, y0, y1, z0, z1, n, e) => { ligne([x, y0, z0], [x, y1, z0], n * (y1 - y0) | 0, e); ligne([x, y0, z1], [x, y1, z1], n * (y1 - y0) | 0, e); ligne([x, y0, z0], [x, y0, z1], n * (z1 - z0) | 0, e); ligne([x, y1, z0], [x, y1, z1], n * (z1 - z0) | 0, e); };
    for (const c of [-1, 1]) { const x = c * 1.05, w = c < 0 ? 1 : 2;
      ligne([x, 0, 0], [x, 2.02, 0], 30, .85); ligne([x - c * .05, 0, 0], [x - c * .05, 1.3, 0], 16, .5);               // le pilier entre deux boutiques
      cadre(x, .14, .8, .16, 1.02, 26, .9);                                                                          // la vitrine
      for (let a = 0; a < 15; a++) for (let b = 0; b < 11; b++) pt(x, .19 + b * .056, .2 + a * .056, .5, w);           // sa lumière
      cadre(x, 0, .82, 1.12, 1.46, 22, .8); pt(x - c * .02, .42, 1.2, 1);                                            // la porte et sa poignée
      cadre(x, .9, 1.06, .16, 1.46, 20, .7);                                                                         // l'enseigne
      for (const z of [.12, .34, .58, .82, 1.06]) ligne([x, .86, z], [x - c * .3, .74, z], 6, .75);                   // le store, en pente
      ligne([x - c * .3, .74, .12], [x - c * .3, .74, 1.06], 14, .9); ligne([x - c * .3, .74, .12], [x - c * .3, .68, .12], 2, .6);
      ligne([x, 1.3, 0], [x, 1.3, 1.6], 24, .7); ligne([x, 2.02, 0], [x, 2.02, 1.6], 24, .8);                        // la corniche et le haut du mur
      cadre(x, 1.46, 1.84, .34, .62, 22, .6); cadre(x, 1.46, 1.84, .98, 1.26, 22, .6);                               // les fenêtres de l'étage
      ligne([c * .52, 0, 0], [c * .52, 0, 1.6], 12, .32); }
    for (let i = 0; i <= 80; i++) { const a = Math.PI * i / 80; pt(Math.cos(a) * 1.05, 2.02 + Math.sin(a) * .78, 0, .85); if (i % 2 === 0) pt(Math.cos(a) * 1.05, 2.02 + Math.sin(a) * .78, .8, .35); }   // l'arceau de la verrière
    for (const a of [.5, .26, .74]) ligne([Math.cos(Math.PI * a) * 1.05, 2.02 + Math.sin(Math.PI * a) * .78, 0], [Math.cos(Math.PI * a) * 1.05, 2.02 + Math.sin(Math.PI * a) * .78, 1.6], 16, a === .5 ? .7 : .4);
    ligne([0, 2.8, .8], [0, 2.36, .8], 6, .6); for (let i = 0; i < 10; i++) { const a = i * .6283; pt(Math.cos(a) * .07, 2.3 + (i % 2) * .05, .8 + Math.sin(a) * .07, 1); }                           // la lanterne
    ligne([-1.05, 0, 0], [1.05, 0, 0], 18, .45); ligne([-1.05, 0, .8], [1.05, 0, .8], 14, .25); ligne([0, 0, 0], [0, 0, 1.6], 12, .4);                                                               // le dallage
    return new Float32Array(P); })();

  function create(cv) {
    const g = cv.getContext("2d");
    let W, H, DP, mob;
    const size = () => {
      DP = Math.min(devicePixelRatio || 1, 1.5);            // au-delà, l'œil ne voit pas la différence sur des points, le téléphone si
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = W * DP; cv.height = H * DP; g.setTransform(DP, 0, 0, DP, 0, 0); mob = W < 700;
    };
    size();
    // la largeur de chaque lettre d'un nom d'enseigne, mesurée une fois (et remesurée quand la police est arrivée)
    const LG = {}, largeurs = nom => LG[nom] || (LG[nom] = (() => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '600 7.5px "Inter Tight", sans-serif'; const l = [...nom].map(ch => g.measureText(ch).width + 1.5); g.restore(); return { l, total: l.reduce((x, y) => x + y, 0) }; })());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { for (const k in LG) delete LG[k]; });

    // Z : zoom (1 = vue normale, 12 = on a plongé dans le fond de la galerie) ; A : intensité (1 = pleine) ; grow : zoom au défilement ;
    // av : pas en avant, en plus de la marche lente (l'entrée dans le site) ; eclat : 0 = galerie éteinte, 1 = tout est allumé,
    // entre les deux les boutiques s'allument l'une après l'autre, des plus proches aux plus lointaines
    const draw = ({ Z = 1, A = 1, grow = 1, av = 0, eclat = 1 } = {}) => {
      incl.x += (cible.x - incl.x) * .02; incl.y += (cible.y - incl.y) * .02;
      g.clearRect(0, 0, W, H);
      if (A <= 0) return;
      const jour = document.documentElement.dataset.theme === "jour", encre = jour ? "#012624" : "#EDFFFE", COUL = jour ? ["#007A72", "#8E2BAB"] : ["#CBFFFC", "#FAD1FF"];
      const t = Date.now() / 1000, NB = mob ? 8 : 11, v = t * VITESSE + av, dz = ((v % L) + L) % L, base = Math.floor(v / L), zoom = Math.pow(Z * grow, .72),
        f = H * (mob ? 1.05 : 1.35) * zoom, hx = W * .5, hy = H * (mob ? .42 : .5), camX = incl.x * .07, camY = .62 - incl.y * .03, lac = incl.x * .025, cl = Math.cos(lac), sl = Math.sin(lac), zMax = NB * L;
      const pj = (x, y, z) => { const xr = (x - camX) * cl - z * sl, zr = (x - camX) * sl + z * cl; if (zr < .3) return null; const e = f / zr; return [hx + xr * e, hy - (y - camY) * e, zr]; },
        quad = (a, b, c, d, col, al2) => { g.globalAlpha = al2; g.fillStyle = col; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); };
      g.fillStyle = encre;
      for (let k = NB - 1; k >= 0; k--) { const z0 = k * L - dz, abs = base + k, graine = Math.sin((abs % 9973) * 12.9898) * 43758.5453, al = graine - Math.floor(graine),
          lumG = .35 + .65 * (.5 + .5 * Math.sin(t * .35 + (abs % 997) * 2.1)), lumD = .35 + .65 * (.5 + .5 * Math.sin(t * .28 + (abs % 997) * 3.7 + 1.3)), zz = z0 + .9,
          feu = Math.max(0, Math.min(1, eclat * (NB + 2) - k)), sombre = .3 + .7 * feu;   // cette travée est-elle déjà allumée ?
        for (let i = 0; i < TRAVEE.length; i += 5) { const z = TRAVEE[i + 2] + zz; if (z < .28) continue;
          const xr = (TRAVEE[i] - camX) * cl - z * sl, zr = (TRAVEE[i] - camX) * sl + z * cl; if (zr < .28) continue;
          const e = f / zr, X = hx + xr * e, Y = hy - (TRAVEE[i + 1] - camY) * e; if (X < -8 || X > W + 8 || Y < -8 || Y > H + 8) continue;
          const brume = Math.pow(Math.max(0, 1 - zr / zMax), 1.25) * Math.min(1, (zr - .28) * 2.2), vit = TRAVEE[i + 4];
          g.globalAlpha = Math.min(1, A * sombre * TRAVEE[i + 3] * brume * (vit === 1 ? lumG * (al > .25 ? 1 : .25) : vit === 2 ? lumD * (al < .8 ? 1 : .25) : 1));
          const r = Math.max(.8, Math.min(2.6, e / zoom * .0042)); g.fillRect(X - r / 2, Y - r / 2, r, r); }
        // ce qui fait reconnaître une boutique : la vitrine éclairée en aplat, le store de couleur, le nom sur l'enseigne
        for (const c of [-1, 1]) { const x = c * 1.05, lum = c < 0 ? lumG : lumD, allume = c < 0 ? al > .25 : al < .8,
            Aa = pj(x, .8, zz + .16), B = pj(x, .8, zz + 1.02), C = pj(x, .14, zz + 1.02), Dq = pj(x, .14, zz + .16); if (!Aa || !B || !C || !Dq) continue;
          const br = A * (.12 + .88 * feu) * Math.pow(Math.max(0, 1 - Aa[2] / zMax), 1.25) * Math.min(1, (Aa[2] - .3) * 2);
          quad(Aa, B, C, Dq, COUL[0], (allume ? .1 + .16 * lum : .04) * br);
          const S1 = pj(x, .86, zz + .12), S2 = pj(x, .86, zz + 1.06), S3 = pj(x - c * .3, .74, zz + 1.06), S4 = pj(x - c * .3, .74, zz + .12); if (S1 && S2 && S3 && S4) quad(S1, S2, S3, S4, COUL[(((abs % 2) + 2) % 2 + (c > 0 ? 1 : 0)) % 2], (jour ? .5 : .38) * br);
          const zA = c < 0 ? zz + .16 : zz + 1.46, zB = c < 0 ? zz + 1.46 : zz + .16, O = pj(x, 1.06, zA), U = pj(x, 1.06, zB), V = pj(x, .9, zA);
          if (O && U && V && br > .02) { quad(O, U, pj(x, .9, zB) || U, V, jour ? "#F1FAF8" : "#012624", .7 * Math.min(1, br * 1.3));
            // chaque lettre a sa propre place sur le mur : on projette son haut et son bas, elle suit donc exactement l'enseigne
            const nom = NOMS[(((abs % NOMS.length) * 2 + (c > 0 ? 1 : 0)) % NOMS.length + NOMS.length) % NOMS.length], lg = largeurs(nom), U0 = .16 / 12, dir = c < 0 ? 1 : -1;
            let zc = zA + dir * (1.3 - lg.total * U0) / 2; g.fillStyle = encre; g.font = '600 7.5px "Inter Tight", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.globalAlpha = Math.min(1, br * 1.4);
            for (let n = 0; n < nom.length; n++) { const a = lg.l[n], z1 = zc, z2 = zc + dir * a * U0; zc = z2; const o = pj(x, 1.06, z1), u = pj(x, 1.06, z2), w = pj(x, .9, z1); if (!o || !u || !w) continue;
              g.setTransform(DP * (u[0] - o[0]) / a, DP * (u[1] - o[1]) / a, DP * (w[0] - o[0]) / 12, DP * (w[1] - o[1]) / 12, DP * o[0], DP * o[1]); g.fillText(nom[n], a / 2, 6.5); }
            g.setTransform(DP, 0, 0, DP, 0, 0); }
          g.fillStyle = encre; } }
      g.globalAlpha = 1;
    };
    return { draw, size };
  }
  // cache(true) : un rideau couvre l'écran (transition), les galeries de la page peuvent arrêter de se dessiner
  let cachee = false;
  const cache_ = on => { cachee = on; };
  return { create, suivre, cache: cache_, get cachee() { return cachee; } };
})();

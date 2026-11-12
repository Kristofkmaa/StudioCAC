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
      const jour = document.documentElement.dataset.theme === "jour", encre = jour ? "#1B4741" : "#EDFFFE", COUL = jour ? ["#2F7F76", "#8A5E96"] : ["#CBFFFC", "#FAD1FF"];
      const t = Date.now() / 1000, NB = mob ? 8 : 11, v = t * VITESSE + av, dz = ((v % L) + L) % L, base = Math.floor(v / L), zoom = Math.pow(Z * grow, .72),
        f = H * (mob ? 1.05 : 1.35) * zoom, hx = W * .5, hy = H * (mob ? .42 : .5), camX = incl.x * .07, camY = .62 - incl.y * .03, lac = incl.x * .025, cl = Math.cos(lac), sl = Math.sin(lac), zMax = NB * L;
      const pj = (x, y, z) => { const xr = (x - camX) * cl - z * sl, zr = (x - camX) * sl + z * cl; if (zr < .3) return null; const e = f / zr; return [hx + xr * e, hy - (y - camY) * e, zr]; },
        quad = (a, b, c, d, col, al2) => { g.globalAlpha = al2; g.fillStyle = col; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); };
      // ——— les décorations de saison (réglage dans abysse-saison.js) : guirlandes, sapins, citrouilles, œufs… posés sur les boutiques
      const sais = document.documentElement.dataset.saison, deco = sais === "noel" || sais === "halloween" || sais === "paques",
        CN = ["#FF5F5F", "#FFD166", "#6DF0A8", "#FFFFFF"], CH = ["#FF8A2A", "#B77BFF"], CP = ["#FFC9DC", "#FFE9A8", "#BFEFD9", "#D9C8FF"],
        F3 = (P, col, a) => { g.beginPath(); for (let i = 0; i < P.length; i += 3) { const q = pj(P[i], P[i + 1], P[i + 2]); if (!q) return; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.globalAlpha = Math.min(1, a); g.fillStyle = col; g.fill(); },
        T3 = (P, col, a, w, ferme) => { let e = 0; g.beginPath(); for (let i = 0; i < P.length; i += 3) { const q = pj(P[i], P[i + 1], P[i + 2]); if (!q) return; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); e = f / q[2]; } if (ferme) g.closePath(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = Math.max(.6, w * e); g.stroke(); },
        R3 = (x, y, z, rr, col, a) => { const q = pj(x, y, z); if (!q) return; g.globalAlpha = Math.min(1, a); g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], Math.max(.7, rr * f / q[2]), 0, 6.2832); g.fill(); },
        ovale = (x, y, z, ry, rz) => { const P = []; for (let i = 0; i < 14; i++) { const a = i * .4488; P.push(x, y + Math.sin(a) * ry, z + Math.cos(a) * rz); } return P; },   // un rond posé à plat sur le mur
        fil = (pt, n) => { const P = []; for (let i = 0; i <= n; i++) { const q = pt(i / n * .9999); P.push(q[0], q[1], q[2]); } return P; },
        lampes = (pt, n, cols, rr, a, ph) => { for (let i = 0; i < n; i++) { const q = pt((i + .5) / n), cl = .5 + .5 * Math.sin(t * 2.2 + i * 1.9 + ph), col = cols[i % cols.length]; R3(q[0], q[1], q[2], rr * 2.6, col, a * cl * .2); R3(q[0], q[1], q[2], rr, col, a * (.45 + .55 * cl)); } },
        // d'un côté à l'autre du passage, au niveau de la corniche
        travers = (zz, br, abs) => { const gt = u => [-1.05 + 2.1 * u, 1.3 - .2 * Math.sin(Math.PI * u), zz];
          T3(fil(gt, 20), encre, .35 * br, .004);
          if (sais === "noel") lampes(gt, 15, ["#FFE9B0", "#FFFFFF", "#FFD166"], .018, br, abs);
          else if (sais === "halloween") { lampes(gt, 11, CH, .018, br, abs); if (abs % 3) return;   // une chauve-souris toutes les trois travées
            const b = .7 + .3 * Math.sin(t * 5 + abs), y = .98, M = [0, .03, .012, .05, .02, .03, .06, .045, .15 * b, .05, .13 * b, 0, .1 * b, .015, .07, -.015, .04, .005, .015, -.035, 0, -.02], P = [];   // la chauve-souris, une moitié puis son reflet
            for (let i = 0; i < M.length; i += 2) P.push(M[i], y + M[i + 1], zz); for (let i = M.length - 4; i > 0; i -= 2) P.push(-M[i], y + M[i + 1], zz);
            T3([0, 1.1, zz, 0, y + .03, zz], encre, .3 * br, .003); F3(P, "#B77BFF", .85 * br); }
          else { for (let i = 0; i < 14; i++) { const a = gt(i / 14), b = gt((i + 1) / 14 * .9999); F3([a[0], a[1], zz, b[0], b[1], zz, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - .1, zz], CP[i % 4], .8 * br); } } },
        // sur une boutique : x est son mur, c son côté (-1 à gauche, 1 à droite)
        pose = (c, x, zz, br, abs, pres) => { const xg = x - c * .31, xd = x - c * .015, gu = u => [xg, .735 - .07 * Math.sin(Math.PI * ((u * 3) % 1)), zz + .12 + .94 * u];
          if (sais !== "paques") { T3(fil(gu, 24), encre, .4 * br, .004); lampes(gu, 12, sais === "noel" ? CN : CH, .016, br, abs + c); }   // la guirlande au bord du store
          if (sais === "noel") { const zt = zz + .59;
            F3([xd, .14, zt - .02, xd, .14, zt + .02, xd, .22, zt + .02, xd, .22, zt - .02], "#8A5A3C", .9 * br);                               // le sapin dans la vitrine
            for (const [y0, y1, h] of [[.2, .44, .17], [.36, .58, .13], [.5, .72, .09]]) F3([xd, y0, zt - h, xd, y0, zt + h, xd, y1, zt], "#2FA36B", .92 * br);
            [[.27, -.08], [.3, .07], [.42, -.04], [.46, .06], [.57, 0], [.24, 0]].forEach((q, i) => R3(xd, q[0], zt + q[1], .013, CN[i % 3], br * (.6 + .4 * Math.sin(t * 2.6 + i * 2.3 + abs))));
            R3(xd, .735, zt, .05, "#FFD166", .25 * br); R3(xd, .735, zt, .022, "#FFD166", br);
            T3(ovale(xd, .56, zz + 1.29, .085, .085), "#2FA36B", .95 * br, .03, true); R3(xd, .475, zz + 1.29, .022, "#FF5F5F", br); }       // la couronne sur la porte
          else if (sais === "halloween") {
            for (const [zp, rr] of [[.36, .09], [.53, .062]]) { const y = rr * .85, z = zz + zp;                                            // les citrouilles au pied de la vitrine
              F3(ovale(xd, y, z, rr * .85, rr), "#FF8A2A", .95 * br); T3(ovale(xd, y, z, rr * .85, rr * .45), "#C25E10", .8 * br, .004, true);
              F3([xd, y + rr * .82, z - .012, xd, y + rr * .82, z + .012, xd, y + rr * 1.12, z + .012, xd, y + rr * 1.12, z - .012], "#6DBE6A", .9 * br);
              if (pres && rr > .07) { for (const d of [-1, 1]) F3([xd, y + .38 * rr, z + d * .38 * rr, xd, y + .08 * rr, z + d * .58 * rr, xd, y + .08 * rr, z + d * .18 * rr], "#FFE08A", br);
                F3([xd, y - .15 * rr, z - .5 * rr, xd, y - .15 * rr, z + .5 * rr, xd, y - .45 * rr, z + .25 * rr, xd, y - .45 * rr, z - .25 * rr], "#FFE08A", br); } }
            const A5 = [0, .32, .64, .96, 1.28, 1.5708], coin = (a, d) => [xd, .8 - Math.cos(a) * d, zz + .16 + Math.sin(a) * d];             // la toile d'araignée dans le coin de la vitrine
            for (const a of A5) { const q = coin(a, .26); T3([xd, .8, zz + .16, q[0], q[1], q[2]], "#FFFFFF", .5 * br, .003); }
            for (const d of [.09, .16, .23]) { const P = []; for (const a of A5) { const q = coin(a, d); P.push(q[0], q[1], q[2]); } T3(P, "#FFFFFF", .5 * br, .003); } }
          else { const n4 = ((abs % 4) + 4) % 4;
            T3([xg, .74, zz + .12, xg, .74, zz + 1.06], encre, .4 * br, .004);                                                                // les fanions au bord du store
            for (let i = 0; i < 8; i++) { const z0 = zz + .12 + .94 * i / 8, z1 = zz + .12 + .94 * (i + 1) / 8; F3([xg, .74, z0, xg, .74, z1, xg, .63, (z0 + z1) / 2], CP[(i + n4) % 4], .85 * br); }
            [.38, .59, .8].forEach((zp, i) => { const z = zz + zp; F3(ovale(xd, .27, z, .105, .074), CP[(i + n4) % 4], .95 * br);            // les œufs dans la vitrine
              T3([xd, .27, z - .068, xd, .295, z - .034, xd, .245, z, xd, .295, z + .034, xd, .27, z + .068], "#FFFFFF", .85 * br, .007); });
            for (let i = 0; i < 10; i++) { const a = i * .6283; R3(xd, .56 + Math.sin(a) * .085, zz + 1.29 + Math.cos(a) * .085, .024, CP[i % 4], br); } } };  // la couronne de fleurs sur la porte
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
        if (deco) { const q = pj(0, 1.2, zz); if (q) { travers(zz, A * (.12 + .88 * feu) * Math.pow(Math.max(0, 1 - q[2] / zMax), 1.25) * Math.min(1, (q[2] - .3) * 2), abs); g.fillStyle = encre; } }
        // ce qui fait reconnaître une boutique : la vitrine éclairée en aplat, le store de couleur, le nom sur l'enseigne
        for (const c of [-1, 1]) { const x = c * 1.05, lum = c < 0 ? lumG : lumD, allume = c < 0 ? al > .25 : al < .8,
            Aa = pj(x, .8, zz + .16), B = pj(x, .8, zz + 1.02), C = pj(x, .14, zz + 1.02), Dq = pj(x, .14, zz + .16); if (!Aa || !B || !C || !Dq) continue;
          const br = A * (.12 + .88 * feu) * Math.pow(Math.max(0, 1 - Aa[2] / zMax), 1.25) * Math.min(1, (Aa[2] - .3) * 2);
          quad(Aa, B, C, Dq, COUL[0], (allume ? .1 + .16 * lum : .04) * br);
          const S1 = pj(x, .86, zz + .12), S2 = pj(x, .86, zz + 1.06), S3 = pj(x - c * .3, .74, zz + 1.06), S4 = pj(x - c * .3, .74, zz + .12); if (S1 && S2 && S3 && S4) quad(S1, S2, S3, S4, COUL[(((abs % 2) + 2) % 2 + (c > 0 ? 1 : 0)) % 2], (jour ? .5 : .38) * br);
          const zA = c < 0 ? zz + .16 : zz + 1.46, zB = c < 0 ? zz + 1.46 : zz + .16, O = pj(x, 1.06, zA), U = pj(x, 1.06, zB), V = pj(x, .9, zA);
          if (O && U && V && br > .02) { quad(O, U, pj(x, .9, zB) || U, V, jour ? "#B9C7BF" : "#012624", .7 * Math.min(1, br * 1.3));
            // chaque lettre a sa propre place sur le mur : on projette son haut et son bas, elle suit donc exactement l'enseigne
            const nom = NOMS[(((abs % NOMS.length) * 2 + (c > 0 ? 1 : 0)) % NOMS.length + NOMS.length) % NOMS.length], lg = largeurs(nom), U0 = .16 / 12, dir = c < 0 ? 1 : -1;
            let zc = zA + dir * (1.3 - lg.total * U0) / 2; g.fillStyle = encre; g.font = '600 7.5px "Inter Tight", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.globalAlpha = Math.min(1, br * 1.4);
            for (let n = 0; n < nom.length; n++) { const a = lg.l[n], z1 = zc, z2 = zc + dir * a * U0; zc = z2; const o = pj(x, 1.06, z1), u = pj(x, 1.06, z2), w = pj(x, .9, z1); if (!o || !u || !w) continue;
              g.setTransform(DP * (u[0] - o[0]) / a, DP * (u[1] - o[1]) / a, DP * (w[0] - o[0]) / 12, DP * (w[1] - o[1]) / 12, DP * o[0], DP * o[1]); g.fillText(nom[n], a / 2, 6.5); }
            g.setTransform(DP, 0, 0, DP, 0, 0); }
          if (deco && br > .03) pose(c, x, zz, br, abs, k < 5);
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

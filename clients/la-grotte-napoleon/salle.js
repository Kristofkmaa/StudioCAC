/* La salle de la Grotte en 3D, vue en plongée comme une maquette (WebGL écrit à la main, sans bibliothèque), d'après la photo
   et de la vidéo de la vraie salle : une longue galerie de roche NOIRE (la roche ne se voit que là où les lampes et les écrans
   l'éclairent), sol rouge sombre, nappes rouges jusqu'au sol, assiettes de présentation argentées, lampes à abat-jour (crème à
   la couronne, ou vert) qui font une lumière chaude, appliques à bougies rouges à côté des écrans, cadres dorés haut sur les
   murs ; au fond, une arcade ouvre sur la seconde salle (trois écrans, tables rondes, le mannequin en uniforme à bicorne).
   Les écrans passent le film de présentation (images/salle.mp4) et leur lumière prend la couleur du film.
   Les murs côté caméra s'abaissent pour qu'on voie dedans. La caméra tourne lentement ; on peut la tourner à la souris ou au doigt.
   Chargé seulement à l'approche de la section (grotte.js) ; sans WebGL ou avec le mouvement réduit, l'image fixe reste. */
(() => {
  const boite = document.getElementById("salle3d"); if (!boite) return;
  const toile = boite.querySelector("canvas"), gl = toile.getContext("webgl", { antialias: true, alpha: false, powerPreference: "low-power" });
  if (!gl) return;

  /* ---------- outils ---------- */
  const prog = (vs, fs) => {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn("salle.js :", gl.getShaderInfoLog(s)); gl.attachShader(p, s); }
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.warn("salle.js :", gl.getProgramInfoLog(p)); return p;
  };
  const tampon = (data, cible = gl.ARRAY_BUFFER) => { const b = gl.createBuffer(); gl.bindBuffer(cible, b); gl.bufferData(cible, data, gl.STATIC_DRAW); return b; };
  const forme = (pos, uv, nor, idx) => ({ pos: tampon(new Float32Array(pos)), uv: tampon(new Float32Array(uv)), nor: tampon(new Float32Array(nor)), idx: tampon(new Uint16Array(idx), gl.ELEMENT_ARRAY_BUFFER), n: idx.length });
  /* un tronc de cône (ou cylindre) autour de (ox, oz) : rayons r0 en bas, r1 en haut ; normales vers l'extérieur (sens = -1 : vers l'intérieur) */
  const tronc = (r0, r1, y0, y1, n, ox = 0, oz = 0, a0 = 0, a1 = Math.PI * 2, sens = 1, ex = 1) => {
    const pos = [], uv = [], nor = [], idx = [], pente = (r0 - r1) / (y1 - y0);
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, sx = Math.sin(a), cz = Math.cos(a), l = Math.hypot(1, pente);
      pos.push(ox + sx * r1 * ex, y1, oz + cz * r1, ox + sx * r0 * ex, y0, oz + cz * r0); uv.push(i / n, 0, i / n, 1);
      for (let k = 0; k < 2; k++) nor.push(sens * sx / l, sens * pente / l, sens * cz / l);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    return forme(pos, uv, nor, idx);
  };
  const disque = (r, y, n, ox = 0, oz = 0, ex = 1) => {
    const pos = [ox, y, oz], uv = [.5, .5], nor = [0, 1, 0], idx = [];
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos.push(ox + Math.sin(a) * r * ex, y, oz + Math.cos(a) * r); uv.push(.5 + Math.sin(a) / 2, .5 + Math.cos(a) / 2); nor.push(0, 1, 0); if (i < n) idx.push(0, i + 1, i + 2); }
    return forme(pos, uv, nor, idx);
  };
  /* plusieurs disques plats réunis (les assiettes) : [x, z], rayon r, hauteur y */
  const disques = (liste, r, y) => {
    const pos = [], uv = [], nor = [], idx = [], C = 14;
    for (const [ox, oz] of liste) { const b = pos.length / 3; pos.push(ox, y, oz); uv.push(.5, .5); nor.push(0, 1, 0);
      for (let i = 0; i <= C; i++) { const a = i / C * Math.PI * 2; pos.push(ox + Math.sin(a) * r, y, oz + Math.cos(a) * r); uv.push(.5 + Math.sin(a) / 2, .5 + Math.cos(a) / 2); nor.push(0, 1, 0); if (i < C) idx.push(b, b + i + 1, b + i + 2); } }
    return forme(pos, uv, nor, idx);
  };
  /* des pavés réunis en une seule forme (les chaises) : chaque pavé [cx, cy, cz, dx, dy, dz, angle, inclinaison vers l'arrière] */
  const paves = liste => {
    const pos = [], uv = [], nor = [], idx = [];
    const F = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
    for (const [cx, cy, cz, dx, dy, dz, ang, inc = 0] of liste) {
      const c = Math.cos(ang), s = Math.sin(ang), ci = Math.cos(inc), si = Math.sin(inc), d = [dx, dy, dz];
      const rot = v0 => { const v = [v0[0], v0[1] * ci - v0[2] * si, v0[1] * si + v0[2] * ci]; return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
      for (const [n, u, v] of F) {
        const b = pos.length / 3;
        for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          const p = [0, 1, 2].map(k => n[k] * d[k] + u[k] * d[k] * su + v[k] * d[k] * sv), q = rot(p);
          pos.push(cx + q[0], cy + q[1], cz + q[2]); uv.push((su + 1) / 2, (sv + 1) / 2); nor.push(...rot(n));
        }
        idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
    return forme(pos, uv, nor, idx);
  };
  const perspective = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); };
  const regarde = (e, c) => {
    const nz = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
    const f = nz([c[0] - e[0], c[1] - e[1], c[2] - e[2]]), s = nz([-f[2], 0, f[0]]), u = [s[1] * f[2] - s[2] * f[1], s[2] * f[0] - s[0] * f[2], s[0] * f[1] - s[1] * f[0]];
    const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return new Float32Array([s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -d(s, e), -d(u, e), d(f, e), 1]);
  };

  /* un rectangle plat : centre c, normale nrm (vers la salle), largeur w, hauteur h ; uv x de gauche à droite vu de face, y de haut en bas */
  const plan = (c, nrm, w, h) => {
    const r = [nrm[2], 0, -nrm[0]], pos = [], uv = [], nor = [];
    for (const [su, sv] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { pos.push(c[0] + r[0] * su * w / 2, c[1] + sv * h / 2, c[2] + r[2] * su * w / 2); uv.push((su + 1) / 2, (1 - sv) / 2); nor.push(...nrm); }
    return forme(pos, uv, nor, [0, 2, 1, 1, 2, 3]);
  };
  /* plusieurs rectangles réunis (les murs) : [cx, cy, cz, nx, nz, w, h] */
  const murs = liste => {
    const pos = [], uv = [], nor = [], idx = [];
    for (const [cx, cy, cz, nx, nz, w, h] of liste) { const b = pos.length / 3, r = [nz, 0, -nx];
      for (const [su, sv] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { pos.push(cx + r[0] * su * w / 2, cy + sv * h / 2, cz + r[2] * su * w / 2); uv.push((su + 1) / 2, (1 - sv) / 2); nor.push(nx, 0, nz); }
      idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    return forme(pos, uv, nor, idx);
  };

  /* ---------- le plan de la salle (une unité ≈ 1,6 m), d'après les photos et la vidéo de l'utilisateur ----------
     la grande salle (ZA..ZE) : tables collées aux deux murs avec une rangée de fauteuils de cinéma contre le mur et des chaises
     dorées côté allée, un écran à cadre doré sur chaque mur, le rideau noir au bout (la cuisine est derrière) ;
     une arcade de roche large et basse ; la salle du fond (ZF..ZA, plus large) : tables rondes, fauteuils le long des murs,
     trois écrans (gauche, fond, droite), un mannequin en costume */
  const X = 2.0, X2 = 2.4, ZE = 5.6, ZA = 0, ZF = -4.0, HM = 2.4, ARC = 1.15, LINTEAU = 1.5;
  const HT = .44;
  /* les écrans : [centre, normale, largeur de l'ouverture] ; l'ouverture du cadre est en 2/1 (moulures : 9,9 % sur les côtés, 14,8 % en haut et en bas) */
  const ECRANS = [[[-X + .02, 1.5, 3.0], [1, 0, 0], 1.9], [[X - .02, 1.5, 3.0], [-1, 0, 0], 1.9],
    [[-X2 + .02, 1.45, -1.8], [1, 0, 0], 1.5], [[-.7, 1.45, ZF + .02], [0, 0, 1], 1.5], [[X2 - .02, 1.45, -2.3], [-1, 0, 0], 1.5]];
  const N = ECRANS.length, CG = .099, CH = .148;
  /* les tables collées au mur [x, z, demi-largeur, demi-longueur] (l'allée est du côté du centre), et les tables rondes [x, z, rayon] */
  /* 30 places en tout, comme le vrai restaurant : 18 dans la grande salle (2 + 2 tables collées au mur), 12 dans la salle du fond (2 rondes de 4, une table de 4) */
  const LONGUES = [[-X + .52, 1.7, .28, .5], [-X + .52, 3.9, .28, .5], [X - .52, 1.5, .28, .5], [X - .52, 3.8, .28, .75],
    [X2 - .52, -1.2, .28, .5]];
  const RONDES = [[-.3, -1.35, .4], [.75, -2.65, .4]];
  const CHAISES = [], FAUTEUILS = [];
  for (const [x, z, hx, hz] of LONGUES) {
    const n = Math.max(2, Math.round(hz * 2 / .52)), pas = hz * 2 / n, s = x < 0 ? 1 : -1;  /* s : vers l'allée */
    for (let k = 0; k < n; k++) { const zz = z - hz + pas * (k + .5); CHAISES.push([x + s * (hx + .26), zz, s * Math.PI / 2]); FAUTEUILS.push([x - s * (hx + .2), zz, s]); }
  }
  for (const [x, z, r] of RONDES) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; CHAISES.push([x + Math.sin(a) * (r + .3), z + Math.cos(a) * (r + .3), a]); }
  /* les assiettes de présentation argentées, une par place, posées sur la nappe */
  const ASSIETTES = [];
  for (const [x, z, hx, hz] of LONGUES) { const n = Math.max(2, Math.round(hz * 2 / .52)), pas = hz * 2 / n;
    for (let k = 0; k < n; k++) { const zz = z - hz + pas * (k + .5); ASSIETTES.push([x - hx + .13, zz], [x + hx - .13, zz]); } }
  for (const [x, z, r] of RONDES) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; ASSIETTES.push([x + Math.sin(a) * (r - .13), z + Math.cos(a) * (r - .13)]); }
  /* les lumières : 5 écrans, une lampe par table, 4 appliques à côté des écrans */
  const LAMPES = [...LONGUES.map(([x, z]) => [x, z]), ...RONDES.map(([x, z]) => [x, z])];
  const APPLIQUES = [[-X + .06, 1.75, 4.5], [X - .06, 1.75, 4.5], [-X2 + .06, 1.75, -.7], [X2 - .06, 1.75, -1.2]];
  const NL = N + LAMPES.length + APPLIQUES.length;

  /* ---------- les shaders ---------- */
  const brume = `vec3 brume(vec3 c, vec3 w, vec3 e){ float d = length(w - e); return mix(c, vec3(.012,.009,.007), smoothstep(12.0, 20.0, d) * .8); }`;
  const VS = `precision mediump float; attribute vec3 p; attribute vec2 t; attribute vec3 nr; uniform mat4 P, V;
    varying vec2 uv; varying vec3 w, n;
    void main(){ w = p; uv = t; n = nr; gl_Position = P * V * vec4(p, 1.0); }`;
  const pLum = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform vec3 col, oeil; uniform vec3 lp[${NL}], lc[${NL}];
    uniform sampler2D roche, motif; uniform float tex, coupe, brille, dos, orne; ${brume}
    void main(){
      vec3 n0 = normalize(n);
      /* les murs dont la caméra voit le dos (ceux entre elle et la salle) s'abaissent, avec un haut irrégulier comme de la roche */
      if (coupe > .5 && dot(n0.xz, oeil.xz - w.xz) < 0.0) { float h = .22 + .06 * sin((w.x + w.z) * 9.0) + .04 * sin((w.x - w.z) * 23.0); if (w.y > h) discard; }
      vec3 nn = n0; if (!gl_FrontFacing) nn = -nn;
      vec3 base = col;
      if (orne > .5) { vec4 m = texture2D(motif, uv); if (m.a < .5) discard; base = m.rgb * 1.1; } /* le cadre doré : ses moulures, son ouverture vide */
      if (tex > .5) base *= texture2D(roche, fract((abs(n0.y) > .5 ? w.xz : vec2(w.x + w.z, w.y)) * .32)).rgb * 1.7;
      vec3 l = base * vec3(.075,.066,.062);
      for (int i = 0; i < ${NL}; i++) { vec3 d = lp[i] - w; float r = length(d); d /= r;
        float lam = max(dot(nn, d), 0.0) * .8 + .2; l += base * lc[i] * lam / (1.0 + r * r * (i < ${N} ? .22 : 1.3)); }
      l += brille * base;
      if (tex > .5) l += base * vec3(.13,.03,.02) * (1.0 - smoothstep(0.0, 1.5, w.y)); /* le rouge du sol et des nappes renvoyé sur le bas de la roche */
      if (dos > .5 && dot(n0, oeil - w) < 0.0) l = vec3(.035,.028,.02) + l * .08; /* vu de dos : le bois sombre */
      gl_FragColor = vec4(brume(l, w, oeil), 1.0); }`);
  gl.useProgram(pLum); gl.uniform1i(gl.getUniformLocation(pLum, "motif"), 1); /* le cadre doré sur l'unité de texture 1 */
  /* l'écran : le film côté salle (rogné en 2/1), le dos sombre */
  const pEcran = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform sampler2D film; uniform vec3 oeil; ${brume}
    void main(){ vec3 c;
      if (dot(n, oeil - w) > 0.0) { c = texture2D(film, vec2(uv.x, .056 + uv.y * .889)).rgb * 1.15; float v = smoothstep(0.0, .05, uv.x) * smoothstep(1.0, .95, uv.x); c *= .8 + .2 * v; }
      else c = vec3(.03,.025,.02);
      gl_FragColor = vec4(brume(c, w, oeil), 1.0); }`);
  /* halos et poussière : des points lumineux doux, additifs */
  const pHalo = prog(`precision mediump float; attribute vec3 p; uniform mat4 P, V; uniform float taille, t, vole; varying float a;
    void main(){ vec3 q = p; if (vole > .5) { float s = fract(sin(dot(p, vec3(12.9, 78.2, 37.7))) * 4375.5); q += vec3(sin(t * .21 + s * 40.0) * .25, mod(t * .05 + s, 1.0) * .9 - .45, cos(t * .17 + s * 30.0) * .25); a = smoothstep(0.0, .2, q.y) * (.5 + .5 * sin(t * .8 + s * 20.0)); } else a = 1.0;
      vec4 v = V * vec4(q, 1.0); gl_Position = P * v; gl_PointSize = taille / -v.z; }`,
    `precision mediump float; varying float a; uniform vec3 col;
    void main(){ vec2 d = gl_PointCoord - .5; float k = exp(-dot(d, d) * 18.0); gl_FragColor = vec4(col * k * a, 1.0); }`);

  /* ---------- les formes ---------- */
  const ecrans = ECRANS.map(([c, nrm, w]) => { const h = w / 2, wc = w / (1 - 2 * CG), hc = h / (1 - 2 * CH), dev = [c[0] + nrm[0] * .015, c[1], c[2] + nrm[2] * .015], der = [c[0] - nrm[0] * .012, c[1], c[2] - nrm[2] * .012];
    return { film: plan(c, nrm, w, h), cadre: plan(dev, nrm, wc, hc), dos: plan(der, nrm, wc, hc) }; });
  const rect = (x0, x1, z0, z1, y) => [x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1];
  const solPlat = (() => { const pos = [...rect(-X, X, ZA, ZE, 0), ...rect(-X2, X2, ZF, ZA, 0)], nor = Array(8).fill([0, 1, 0]).flat();
    return forme(pos, [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1], nor, [0, 2, 1, 1, 2, 3, 4, 6, 5, 5, 6, 7]); })();
  /* les murs ; le mur de l'arcade a une face vers chaque salle, son linteau de roche est bas et irrégulier */
  const M = [[-X, HM / 2, (ZA + ZE) / 2, 1, 0, ZE - ZA, HM], [X, HM / 2, (ZA + ZE) / 2, -1, 0, ZE - ZA, HM], [0, HM / 2, ZE, 0, -1, 2 * X, HM],
    [-X2, HM / 2, (ZF + ZA) / 2, 1, 0, ZA - ZF, HM], [X2, HM / 2, (ZF + ZA) / 2, -1, 0, ZA - ZF, HM], [0, HM / 2, ZF, 0, 1, 2 * X2, HM]];
  for (const f of [1, -1]) {
    const z = ZA + f * .07, L = f > 0 ? X : X2;
    M.push([(-L - ARC) / 2, HM / 2, z, 0, f, L - ARC, HM], [(L + ARC) / 2, HM / 2, z, 0, f, L - ARC, HM]);
    for (let k = 0; k < 16; k++) { const x0 = -ARC + 2 * ARC * k / 16, x1 = x0 + 2 * ARC / 16, xm = (x0 + x1) / 2, ya = LINTEAU + .1 * Math.sqrt(Math.max(0, 1 - (xm / ARC) ** 2)) + .06 * Math.sin(xm * 11) + .04 * Math.sin(xm * 29);
      M.push([xm, (ya + HM) / 2, z, 0, f, x1 - x0 + .002, HM - ya]); }
  }
  const parois = murs(M);
  /* le rideau noir au bout (la cuisine) et les rideaux sur le mur de droite, près de l'arcade */
  const rideau = murs([[0, 1.05, ZE - .03, 0, -1, 1.3, 2.1], [X - .03, 1.05, .55, -1, 0, 1.0, 2.1]]);
  /* les tables : la nappe (dessus et pans) ; les rondes en tronc de cône évasé */
  const tables = (() => { const L = [];
    for (const [x, z, hx, hz] of LONGUES) if (hz < .7) L.push([x, HT - .01, z, hx, .012, hz, 0], [x, HT / 2, z, hx + .03, HT / 2 - .01, hz + .03, 0]);
    return paves(L); })();
  /* les tables rondes, et la grande table de droite qui est ovale sur la photo (nappe évasée jusqu'au sol) */
  const rondes = [...RONDES.map(([x, z, r]) => [disque(r, HT, 32, x, z), tronc(r * 1.14, r, .01, HT, 32, x, z)]),
    ...LONGUES.filter(([, , , hz]) => hz >= .7).map(([x, z, hx, hz]) => [disque(hz, HT, 40, x, z, (hx + .06) / hz), tronc(hz * 1.1, hz, .01, HT, 40, x, z, 0, Math.PI * 2, 1, (hx + .06) / hz)])];
  /* les fauteuils de cinéma contre le mur : assise, haut dossier incliné en velours rouge, accoudoirs et pied sombres ; plus ceux du fond */
  const FV = [], FS = [];
  const fauteuil = (x, z, s) => { const a = s > 0 ? Math.PI / 2 : -Math.PI / 2;
    FV.push([x, .27, z, .15, .05, .2, a], [x - s * .14, .5, z, .17, .25, .045, a, -.12]);
    FS.push([x, .11, z, .1, .11, .12, a]);
    for (const dz of [-.21, .21]) FS.push([x - s * .02, .33, z + dz, .15, .015, .018, a]); };
  for (const [x, z, s] of FAUTEUILS) fauteuil(x, z, s);
  const fauteuils = paves(FV), fauteuilsPied = paves(FS);
  /* le mannequin en costume de Napoléon, près de l'arcade : un pied, un buste bleu nuit, un plastron blanc, un col rouge */
  const mannequin = [tronc(.025, .025, 0, .78, 8, 1.75, -.4), tronc(.15, .2, .78, 1.42, 18, 1.75, -.4), tronc(.07, .05, 1.42, 1.5, 12, 1.75, -.4),
    tronc(.09, .09, 1.5, 1.66, 12, 1.75, -.4), paves([[1.75, 1.7, -.4, .19, .035, .05, -.5]]), paves([[1.75, 1.1, -.4 + .16, .06, .3, .03, 0]])];
  const assiettes = disques(ASSIETTES, .065, HT + .004);
  /* les appliques à bougies : un bras doré sortant du mur, deux bougies, deux ampoules rouges */
  const AB = [], AR = [];
  for (const [x, y, z] of APPLIQUES) { const s = x < 0 ? 1 : -1;
    AB.push([x + s * .05, y - .1, z, .05, .012, .012, 0], [x + s * .1, y - .06, z, .012, .05, .09, 0]);
    for (const dz of [-.07, .07]) { AB.push([x + s * .1, y - .025, z + dz, .009, .035, .009, 0]); AR.push([x + s * .1, y + .015, z + dz, .013, .018, .013, 0]); } }
  const appliquesBras = paves(AB), appliquesAmpoules = paves(AR);
  const lampes = LAMPES.map(([x, z]) => [tronc(.022, .018, HT, HT + .12, 8, x, z), tronc(.085, .055, HT + .11, HT + .21, 16, x, z)]);
  /* les chaises « Napoléon » (d'après la photo envoyée par l'utilisateur) : tout le bâti doré, pieds et barreaux tournés
     avec leurs bagues, pieds arrière qui partent en arrière, dossier à quatre barreaux sous un bandeau, assise de velours rouge.
     Chaque pièce tournée est un profil (rayon, hauteur de 0 à 1) qu'on fait tourner autour de son axe. */
  const tournees = liste => {
    const pos = [], uv = [], nor = [], idx = [], C = 9;
    for (const [prof, L, ox, oy, oz, a, inc, roll] of liste) {
      const ca = Math.cos(a), sa = Math.sin(a), ci = Math.cos(inc), si = Math.sin(inc), cr = Math.cos(roll), sr = Math.sin(roll);
      const tr = v => { let [x, y, z] = v; [x, y] = [x * cr - y * sr, x * sr + y * cr]; [y, z] = [y * ci - z * si, y * si + z * ci]; return [x * ca + z * sa, y, -x * sa + z * ca]; };
      const b = pos.length / 3;
      prof.forEach(([r, h], j) => { for (let k = 0; k <= C; k++) { const f = k / C * Math.PI * 2, n = [Math.cos(f), 0, Math.sin(f)], q = tr([r * n[0], h * L, r * n[2]]);
        pos.push(ox + q[0], oy + q[1], oz + q[2]); uv.push(k / C, h); nor.push(...tr(n)); } });
      for (let j = 0; j < prof.length - 1; j++) for (let k = 0; k < C; k++) { const p0 = b + j * (C + 1) + k, p1 = p0 + C + 1; idx.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1); }
    }
    return forme(pos, uv, nor, idx);
  };
  const PIED = [[.015, 0], [.013, .12], [.016, .32], [.024, .46], [.018, .52], [.027, .6], [.018, .68], [.023, .78], [.019, .88], [.022, 1]];
  const MONTANT = [[.02, 0], [.016, .1], [.024, .2], [.017, .3], [.02, .55], [.015, .7], [.022, .8], [.016, .9], [.019, 1]];
  const BARREAU = [[.006, 0], [.011, .12], [.006, .25], [.012, .45], [.006, .6], [.011, .78], [.006, .9], [.008, 1]];
  const TRAVERSE = [[.009, 0], [.011, .2], [.008, .35], [.016, .5], [.008, .65], [.011, .8], [.009, 1]];
  const TOURS = [], DORE = [], ASSISE = [], RECUL = .14;
  for (const [cx, cz, a] of CHAISES) {
    const ca = Math.cos(a), sa = Math.sin(a), w = (lx, lz) => [cx + ca * lx + sa * lz, cz - sa * lx + ca * lz];
    const tour = (prof, L, lx, ly, lz, inc = 0, roll = 0) => { const [X2, Z2] = w(lx, lz); TOURS.push([prof, L, X2, ly, Z2, a, inc, roll]); };
    const pave = (liste, lx, ly, lz, dx, dy, dz, inc = 0) => { const [X2, Z2] = w(lx, lz); liste.push([X2, ly, Z2, dx, dy, dz, a, inc]); };
    for (const u of [-.155, .155]) { tour(PIED, .245, u, 0, -.145); tour(PIED, .25, u, 0, .2, -.2); tour(MONTANT, .36, u, .245, .15, RECUL); }
    for (const u of [-.09, -.03, .03, .09]) tour(BARREAU, .25, u, .31, .15 + .07 * Math.tan(RECUL), RECUL);
    tour(TRAVERSE, .31, -.155, .1, -.145, 0, -Math.PI / 2);
    pave(DORE, 0, .235, 0, .18, .025, .17); pave(DORE, 0, .3, .16, .165, .014, .014, RECUL); pave(DORE, 0, .6, .15 + .36 * Math.tan(RECUL), .19, .045, .016, RECUL);
    pave(ASSISE, 0, .277, -.008, .168, .028, .158);
  }
  const chaises = tournees(TOURS), dorures = paves(DORE), velours = paves(ASSISE);
  const poussiere = tampon(new Float32Array([...Array(320)].flatMap(() => { const z = ZF + .3 + Math.random() * (ZE - ZF - .6); return [(Math.random() * 2 - 1) * ((z > ZA ? X : X2) - .2), .3 + Math.random() * 1.6, z]; })));
  const point = tampon(new Float32Array([0, 0, 0]));

  /* ---------- les textures ---------- */
  const texFilm = gl.createTexture(), texRoche = gl.createTexture();
  for (const tx of [texFilm, texRoche]) { gl.bindTexture(gl.TEXTURE_2D, tx); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([90, 80, 70])); }
  const texCadre = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texCadre);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  const motif = new Image(); motif.src = "images/cadre.webp";
  motif.onload = () => { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texCadre); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, motif); gl.activeTexture(gl.TEXTURE0); };
  gl.activeTexture(gl.TEXTURE0);
  const roche = new Image(); roche.src = "images/roche.webp";
  roche.onload = () => { gl.bindTexture(gl.TEXTURE_2D, texRoche); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, roche); };
  const affiche = boite.querySelector("img"), video = document.createElement("video");
  Object.assign(video, { src: "images/salle.mp4", muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" }); video.setAttribute("playsinline", "");
  let source = affiche.complete && affiche.naturalWidth ? affiche : null;
  affiche.addEventListener("load", () => { if (!source) source = affiche; });
  video.addEventListener("playing", () => { source = video; });
  video.play().catch(() => {});
  /* la couleur moyenne du film, lue sur une toute petite image : c'est la lumière des écrans */
  const petit = document.createElement("canvas"); petit.width = petit.height = 6; const cx2 = petit.getContext("2d", { willReadFrequently: true });
  let teinte = [.8, .7, .55], cible = teinte.slice(), compte = 0;
  const mesure = () => { try { cx2.drawImage(source, 0, 0, 6, 6); const d = cx2.getImageData(0, 0, 6, 6).data; const m = [0, 0, 0]; for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) m[k] += d[i + k]; cible = m.map(v => Math.min(1, v / 36 / 255 * 1.6 + .08)); } catch (e) {} };

  /* ---------- le dessin ---------- */
  let P;
  const dessine = (p, g, u) => {
    gl.useProgram(p);
    for (const [nom, buf, n] of [["p", g.pos, 3], ["t", g.uv, 2], ["nr", g.nor, 3]]) { const a = gl.getAttribLocation(p, nom); if (a < 0 || !buf) continue; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, n, gl.FLOAT, false, 0, 0); }
    gl.uniformMatrix4fv(gl.getUniformLocation(p, "P"), false, P);
    for (const k in u) { const l = gl.getUniformLocation(p, k); if (!l) continue; const v = u[k]; if (k === "V") gl.uniformMatrix4fv(l, false, v); else if (typeof v === "number") gl.uniform1f(l, v); else gl.uniform3fv(l, v); }
    if (g.idx) { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.idx); gl.drawElements(gl.TRIANGLES, g.n, gl.UNSIGNED_SHORT, 0); }
    else gl.drawArrays(gl.POINTS, 0, g.n);
  };
  const VIDE = { tex: 0, coupe: 0, brille: 0, dos: 0, orne: 0 };
  const CENTRE = [0, .5, .8];
  let theta = .5, vitesse = 0, actif = false, enCours = false, dernier = 0, t = 0;
  const taille = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), r = boite.getBoundingClientRect();
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (toile.width !== w || toile.height !== h) { toile.width = w; toile.height = h; }
    gl.viewport(0, 0, w, h); P = perspective(w / h < 1 ? 1.05 : .74, w / h, .1, 50); return dpr;
  };
  const image = now => {
    if (!actif) { enCours = false; return; } requestAnimationFrame(image);
    const dt = Math.min(.05, (now - dernier) / 1000 || 0); dernier = now; t += dt;
    theta += (.05 + vitesse) * dt; vitesse *= Math.pow(.02, dt);
    const dpr = taille(), portrait = toile.width / toile.height < 1;
    /* la galerie est longue : la caméra s'éloigne quand elle la voit de côté, se rapproche quand elle la voit dans l'axe */
    const loin = (portrait ? 8.2 : 9.2) + Math.abs(Math.sin(theta)) * (portrait ? .8 : 2.0), h = loin * .62 + Math.sin(t * .23) * .12;
    const oeil = [CENTRE[0] + Math.sin(theta) * loin, h, CENTRE[2] + Math.cos(theta) * loin], V = regarde(oeil, CENTRE);
    if (source) { gl.bindTexture(gl.TEXTURE_2D, texFilm); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); if (compte++ % 6 === 0) mesure(); }
    teinte = teinte.map((v, k) => v + (cible[k] - v) * Math.min(1, dt * 4));
    /* les lumières : les écrans (couleur du film), les lampes des tables et les appliques (vacillement) */
    const lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3);
    ECRANS.forEach(([c, nrm], i) => { lp.set([c[0] + nrm[0] * .45, c[1], c[2] + nrm[2] * .45], i * 3); lc.set(teinte.map(v => v * 2.1), i * 3); });
    LAMPES.forEach(([x, z], i) => { const f = .9 + .07 * Math.sin(t * 7.1 + i * 2); lp.set([x, HT + .3, z], (N + i) * 3); lc.set(i % 3 === 1 ? [1.0 * f, 1.05 * f, .55 * f] : [1.3 * f, 1.1 * f, .7 * f], (N + i) * 3); });
    APPLIQUES.forEach((a, i) => { const f = .8 + .12 * Math.sin(t * 9.3 + i * 3) + .08 * Math.sin(t * 21.7 + i); lp.set(a, (N + LAMPES.length + i) * 3); lc.set([.9 * f, .22 * f, .08 * f], (N + LAMPES.length + i) * 3); });
    gl.clearColor(.012, .009, .007, 1); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    const lum = (g, col, extra = {}) => { gl.useProgram(pLum); gl.uniform3fv(gl.getUniformLocation(pLum, "lp"), lp); gl.uniform3fv(gl.getUniformLocation(pLum, "lc"), lc); dessine(pLum, g, { ...VIDE, V, oeil, col, ...extra }); };
    lum(solPlat, [.85, .16, .12], { tex: 1 });
    lum(parois, [.72, .68, .64], { tex: 1, coupe: 1, brille: .03 });
    lum(rideau, [.07, .06, .06], { coupe: 1 });
    lum(tables, [.7, .08, .07]); for (const [dessus, tour] of rondes) { lum(tour, [.62, .07, .05]); lum(dessus, [.78, .12, .08]); }
    lum(fauteuils, [.62, .05, .05]); lum(fauteuilsPied, [.12, .08, .06]);
    lum(mannequin[0], [.2, .17, .12]); lum(mannequin[1], [.08, .1, .25]); lum(mannequin[2], [.7, .08, .07]);
    lum(mannequin[3], [.9, .88, .8]); lum(mannequin[4], [.06, .06, .07], { brille: .02 }); lum(mannequin[5], [.9, .88, .8]);
    lum(assiettes, [.62, .62, .6], { brille: .06 });
    lum(appliquesBras, [.8, .62, .3], { brille: .1 }); lum(appliquesAmpoules, [1, .15, .05], { brille: 1 });
    /* les lampes : abat-jour crème à la couronne (comme dans la vidéo) ou vert (comme sur la photo), la lumière est chaude */
    lampes.forEach(([tige, abat], i) => { lum(tige, [.6, .5, .3]); lum(abat, i % 3 === 1 ? [.55, .85, .45] : [1, .9, .62], { brille: .95 }); });
    lum(chaises, [.88, .68, .32], { brille: .14 }); lum(dorures, [.88, .68, .32], { brille: .14 }); lum(velours, [.5, .04, .07]);
    ecrans.forEach((e, i) => { const [c, nrm] = ECRANS[i]; if (nrm[0] * (oeil[0] - c[0]) + nrm[2] * (oeil[2] - c[2]) < 0) return; /* le mur est abaissé de ce côté : son écran disparaît avec lui */
      dessine(pLum, e.dos, { ...VIDE, V, oeil, col: [.16, .1, .06], lp, lc });
      lum(e.cadre, [1, 1, 1], { brille: .32, dos: 1, orne: 1 });
      gl.bindTexture(gl.TEXTURE_2D, texFilm); dessine(pEcran, e.film, { V, oeil }); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    });
    /* les halos (écrans, lampes, appliques) puis la poussière, additifs */
    gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    ECRANS.forEach(([c, nrm, w]) => nrm[0] * (oeil[0] - c[0]) + nrm[2] * (oeil[2] - c[2]) > 0 && dessine(pHalo, { pos: tampon2([c[0] + nrm[0] * .2, c[1], c[2] + nrm[2] * .2]), n: 1 }, { V, taille: 700 * w * dpr * (portrait ? .7 : 1), t, vole: 0, col: teinte.map(v => v * .13) }));
    LAMPES.forEach(([x, z], i) => { const f = .9 + .1 * Math.sin(t * 7.1 + i * 2); dessine(pHalo, { pos: tampon2([x, HT + .18, z]), n: 1 }, { V, taille: 230 * dpr, t, vole: 0, col: i % 3 === 1 ? [.3 * f, .4 * f, .18 * f] : [.42 * f, .34 * f, .2 * f] }); });
    APPLIQUES.forEach((a, i) => { const f = .8 + .2 * Math.sin(t * 9.3 + i * 3); dessine(pHalo, { pos: tampon2(a), n: 1 }, { V, taille: 160 * dpr, t, vole: 0, col: [.5 * f, .12 * f, .05 * f] }); });
    dessine(pHalo, { pos: poussiere, n: 300 }, { V, taille: 26 * dpr, t, vole: 1, col: teinte.map(v => v * .2) });
    gl.depthMask(true); gl.disable(gl.BLEND);
  };
  /* un petit tampon réutilisé pour les halos (un seul point) */
  const tampon2 = v => { gl.bindBuffer(gl.ARRAY_BUFFER, point); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW); return point; };
  /* tourner à la main : on garde le défilement vertical de la page */
  let x0 = null;
  toile.addEventListener("pointerdown", e => { x0 = e.clientX; toile.setPointerCapture(e.pointerId); });
  toile.addEventListener("pointermove", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = e.clientX; theta -= dx * .006; vitesse = -dx * .25; });
  toile.addEventListener("pointerup", () => { x0 = null; }); toile.addEventListener("pointercancel", () => { x0 = null; });
  new IntersectionObserver(([e]) => { actif = e.isIntersecting; if (actif) { boite.classList.add("pret"); video.play().catch(() => {}); if (!enCours) { enCours = true; dernier = performance.now(); requestAnimationFrame(image); } } else video.pause(); }, { rootMargin: "80px" }).observe(boite);
})();

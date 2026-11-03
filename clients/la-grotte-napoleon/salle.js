/* La salle de la Grotte en 3D (WebGL écrit à la main, sans bibliothèque) : pour expliquer le concept, pas pour montrer la salle
   (3 novembre 2026, demande de l'utilisateur : « je veux pas qu'on ait un aperçu de la salle ou de la disposition »).
   Une seule table ronde dressée, une chaise « Napoléon », et les cinq écrans à cadre doré qui tournent lentement autour d'elle :
   où que l'on soit assis, le film est tout autour. Pas de murs, pas de plan : la scène flotte sur le fond de roche de la page
   (toile transparente, le sol s'efface en cercle). Les écrans passent le film de présentation (images/salle.mp4) et leur lumière
   prend la couleur du film. On peut faire tourner les écrans à la souris ou au doigt.
   Chargé seulement à l'approche de la section (grotte.js) ; sans WebGL ou avec le mouvement réduit, l'image fixe reste. */
(() => {
  const boite = document.getElementById("salle3d"); if (!boite) return;
  const toile = boite.querySelector("canvas"), gl = toile.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" }); /* toile transparente : la maquette flotte sur le fond du site */
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

  /* ---------- la scène (une unité = un mètre) ---------- */
  const HT = .75; /* hauteur de la table */
  const RT = .5; /* table ronde d'un mètre */
  /* les cinq écrans : téléviseurs de 165 cm (1,44 × 0,81 m) dans leurs cadres dorés, sur un cercle de 2,5 m autour de la table, tournés vers elle ;
     ils tournent ensemble (angle phi) */
  const N = 5, R = 2.5, ECRAN_L = 1.44, ECRAN_Y = 1.75, CG = .099, CH = .148;
  const LAMPE = [0, 0];
  const NL = N + 1;
  /* la chaise, côté caméra, tournée vers la table ; une assiette à sa place, une en face */
  const CHAISES = [[0, RT + .35, 0]];
  const ASSIETTES = [[0, RT - .18], [0, -(RT - .18)]];
  /* ---------- les shaders ---------- */
  const brume = `vec3 brume(vec3 c, vec3 w, vec3 e){ float d = length(w - e); return mix(c, vec3(.012,.009,.007), smoothstep(16.0, 26.0, d) * .6); }`;
  const VS = `precision mediump float; attribute vec3 p; attribute vec2 t; attribute vec3 nr; uniform mat4 P, V;
    varying vec2 uv; varying vec3 w, n;
    void main(){ w = p; uv = t; n = nr; gl_Position = P * V * vec4(p, 1.0); }`;
  const pLum = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform vec3 col, oeil; uniform vec3 lp[${NL}], lc[${NL}];
    uniform sampler2D roche, motif; uniform float tex, coupe, brille, dos, orne, bois, fondu; ${brume}
    void main(){
      vec3 n0 = normalize(n);
      vec3 nn = n0; if (!gl_FrontFacing) nn = -nn;
      vec3 base = col;
      if (orne > .5) { vec4 m = texture2D(motif, uv); if (m.a < .5) discard; base = m.rgb * 1.1; } /* le cadre doré : ses moulures, son ouverture vide */
      if (tex > .5) base *= texture2D(roche, fract((abs(n0.y) > .5 ? w.xz : vec2(w.x + w.z, w.y)) * .32)).rgb * 1.7;
      if (bois > .5) { /* le parquet : des lames de 0,22 dans la longueur, chacune sa nuance, joints sombres, bouts décalés */
        float px = w.x * 4.5, lame = floor(px), bout = floor(w.z * .8 + fract(lame * .37) * 1.3);
        float nu = fract(sin(lame * 12.99 + bout * 7.7) * 437.5), fil = fract(sin(w.z * 41.0 + lame * 3.0) * 7.3);
        base *= (.7 + .55 * nu) * (.92 + .08 * fil);
        float j = fract(px), jz = fract(w.z * .8 + fract(lame * .37) * 1.3);
        base *= .55 + .45 * smoothstep(0.0, .07, j) * smoothstep(1.0, .93, j) * smoothstep(0.0, .035, jz); }
      vec3 l = base * vec3(.075,.066,.062);
      for (int i = 0; i < ${NL}; i++) { vec3 d = lp[i] - w; float r = length(d); d /= r;
        float lam = max(dot(nn, d), 0.0) * .8 + .2; l += base * lc[i] * lam / (1.0 + r * r * (i < ${N} ? .06 : .9)); }
      l += brille * base;
      if (dos > .5 && dot(n0, oeil - w) < 0.0) l = vec3(.035,.028,.02) + l * .08; /* vu de dos : le bois sombre */
      /* le sol s'efface en cercle autour de la table : la scène se pose sur le fond de la page */
      float a = fondu > 0.0 ? 1.0 - smoothstep(fondu * .35, fondu, length(w.xz)) : 1.0;
      gl_FragColor = vec4(brume(l, w, oeil) * a, a); }`);
  gl.useProgram(pLum); gl.uniform1i(gl.getUniformLocation(pLum, "motif"), 1); /* le cadre doré sur l'unité de texture 1 */
  /* l'écran : le film côté salle (rogné en 2/1), le dos sombre */
  const pEcran = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform sampler2D film; uniform vec3 oeil; ${brume}
    void main(){ vec3 c;
      if (dot(n, oeil - w) > 0.0) { c = texture2D(film, uv).rgb * 1.15; /* l'écran est en 16/9 comme le film : rien n'est rogné */ float v = smoothstep(0.0, .05, uv.x) * smoothstep(1.0, .95, uv.x); c *= .8 + .2 * v; }
      else c = vec3(.03,.025,.02);
      gl_FragColor = vec4(brume(c, w, oeil), 1.0); }`);
  /* halos et poussière : des points lumineux doux, additifs */
  const pHalo = prog(`precision mediump float; attribute vec3 p; uniform mat4 P, V; uniform float taille, t, vole; varying float a;
    void main(){ vec3 q = p; if (vole > .5) { float s = fract(sin(dot(p, vec3(12.9, 78.2, 37.7))) * 4375.5); q += vec3(sin(t * .21 + s * 40.0) * .25, mod(t * .05 + s, 1.0) * .9 - .45, cos(t * .17 + s * 30.0) * .25); a = smoothstep(0.0, .2, q.y) * (.5 + .5 * sin(t * .8 + s * 20.0)); } else a = 1.0;
      vec4 v = V * vec4(q, 1.0); gl_Position = P * v; gl_PointSize = taille / -v.z; }`,
    `precision mediump float; varying float a; uniform vec3 col;
    void main(){ vec2 d = gl_PointCoord - .5; float k = exp(-dot(d, d) * 18.0); vec3 c = col * k * a; gl_FragColor = vec4(c, max(c.r, max(c.g, c.b))); }`);

  /* ---------- les formes ---------- */
  const rect = (x0, x1, z0, z1, y) => [x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1];
  /* les écrans : film, cadre doré devant, dos sombre ; leurs sommets sont recalculés à chaque image (ils tournent) */
  const ecrans = [...Array(N)].map(() => ({ film: plan([0, 0, 0], [0, 0, 1], 1, 1), cadre: plan([0, 0, 0], [0, 0, 1], 1, 1), dos: plan([0, 0, 0], [0, 0, 1], 1, 1) }));
  const place = (g, c, nrm, w, h) => {
    const r = [nrm[2], 0, -nrm[0]], pos = [], nor = [];
    for (const [su, sv] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { pos.push(c[0] + r[0] * su * w / 2, c[1] + sv * h / 2, c[2] + r[2] * su * w / 2); nor.push(...nrm); }
    gl.bindBuffer(gl.ARRAY_BUFFER, g.pos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.nor); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.DYNAMIC_DRAW);
  };
  const ECRANS = [];
  const tourne = phi => { ECRANS.length = 0;
    for (let i = 0; i < N; i++) { const a = phi + i * Math.PI * 2 / N, c = [Math.sin(a) * R, ECRAN_Y, Math.cos(a) * R], nrm = [-Math.sin(a), 0, -Math.cos(a)], w = ECRAN_L, h = w * 9 / 16;
      ECRANS.push([c, nrm]);
      const e = ecrans[i], wc = w / (1 - 2 * CG), hc = h / (1 - 2 * CH);
      place(e.film, c, nrm, w, h); place(e.cadre, [c[0] + nrm[0] * .015, c[1], c[2] + nrm[2] * .015], nrm, wc, hc); place(e.dos, [c[0] - nrm[0] * .012, c[1], c[2] - nrm[2] * .012], nrm, wc, hc); } };
  /* le sol : un parquet sombre qui s'efface en cercle */
  const sol = forme(rect(-4, 4, -4, 4, 0), [0, 0, 1, 0, 0, 1, 1, 1], Array(4).fill([0, 1, 0]).flat(), [0, 2, 1, 1, 2, 3]);
  /* la table ronde : la nappe rouge évasée jusqu'au sol */
  const dessus = disque(RT, HT, 40), tour = tronc(RT * 1.14, RT, .01, HT, 40);
  const assiettes = disques(ASSIETTES, .14, HT + .004); /* assiettes de présentation de 28 cm */
  const lampe = [tronc(.022, .018, HT, HT + .14, 10, ...LAMPE), tronc(.1, .065, HT + .13, HT + .3, 20, ...LAMPE)];
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
  /* les cotes de la chaise sont écrites à l'ancienne échelle et un peu trop larges : KX agrandit en largeur et profondeur (41 cm de large),
     KY en hauteur (assise à 44 cm, dossier à 1,04 m) */
  const TOURS = [], DORE = [], ASSISE = [], RECUL = .14, KX = 1.15, KY = 1.6;
  for (const [cx, cz, a] of CHAISES) {
    const ca = Math.cos(a), sa = Math.sin(a), w = (lx, lz) => [cx + ca * lx + sa * lz, cz - sa * lx + ca * lz];
    const tour = (prof, L, lx, ly, lz, inc = 0, roll = 0) => { const [X2, Z2] = w(lx * KX, lz * KX); TOURS.push([prof.map(([r, h]) => [r * KX, h]), L * KY, X2, ly * KY, Z2, a, inc, roll]); };
    const pave = (liste, lx, ly, lz, dx, dy, dz, inc = 0) => { const [X2, Z2] = w(lx * KX, lz * KX); liste.push([X2, ly * KY, Z2, dx * KX, dy * KY, dz * KX, a, inc]); };
    for (const u of [-.155, .155]) { tour(PIED, .245, u, 0, -.145); tour(PIED, .25, u, 0, .2, -.2); tour(MONTANT, .36, u, .245, .15, RECUL); }
    for (const u of [-.09, -.03, .03, .09]) tour(BARREAU, .25, u, .31, .15 + .07 * Math.tan(RECUL), RECUL);
    tour(TRAVERSE, .31, -.155, .1, -.145, 0, -Math.PI / 2);
    pave(DORE, 0, .235, 0, .18, .025, .17); pave(DORE, 0, .3, .16, .165, .014, .014, RECUL); pave(DORE, 0, .6, .15 + .36 * Math.tan(RECUL), .19, .045, .016, RECUL);
    pave(ASSISE, 0, .277, -.008, .168, .028, .158);
  }
  const chaises = tournees(TOURS), dorures = paves(DORE), velours = paves(ASSISE);
  const poussiere = tampon(new Float32Array([...Array(220)].flatMap(() => { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 2.3; return [Math.sin(a) * r, .2 + Math.random() * 2.1, Math.cos(a) * r]; })));

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
  let teinte = [.5, .45, .35], cible = teinte.slice(), compte = 0;
  /* la moyenne de l'image, puis une courbe qui accentue : une image claire éclaire fort toute la salle, une image sombre presque pas */
  const mesure = () => { try { cx2.drawImage(source, 0, 0, 6, 6); const d = cx2.getImageData(0, 0, 6, 6).data; const m = [0, 0, 0]; for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) m[k] += d[i + k];
    const c = m.map(v => v / 36 / 255), lu = .3 * c[0] + .59 * c[1] + .11 * c[2], gain = .2 + 8.0 * Math.pow(lu, 1.2);
    cible = c.map(v => (.15 + v) * gain); } catch (e) {} };

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
  const VIDE = { tex: 0, coupe: 0, brille: 0, dos: 0, orne: 0, bois: 0, fondu: 0 };
  let phi = .3, vitesse = 0, actif = false, enCours = false, dernier = 0, t = 0;
  const taille = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), r = boite.getBoundingClientRect();
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (toile.width !== w || toile.height !== h) { toile.width = w; toile.height = h; }
    gl.viewport(0, 0, w, h); P = perspective(w / h < 1 ? 1.0 : .85, w / h, .05, 50); return dpr;
  };
  const image = now => {
    if (!actif) { enCours = false; return; } requestAnimationFrame(image);
    const dt = Math.min(.05, (now - dernier) / 1000 || 0); dernier = now; t += dt;
    phi += (.12 + vitesse) * dt; vitesse *= Math.pow(.02, dt); /* les écrans font le tour en un peu moins d'une minute */
    tourne(phi);
    const dpr = taille(), portrait = toile.width / toile.height < 1;
    /* au-dessus du cercle, un peu en arrière : la table et sa chaise au milieu, les écrans qui tournent tout autour (ceux de devant passent en bas, vus de dos) ; la caméra respire à peine */
    const oeil = portrait ? [Math.sin(t * .15) * .1, 5.6, 5.2] : [Math.sin(t * .15) * .15, 4.4, 4.6], V = regarde(oeil, [0, portrait ? .55 : .75, -.2]);
    if (source) { gl.bindTexture(gl.TEXTURE_2D, texFilm); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); if (compte++ % 3 === 0) mesure(); }
    teinte = teinte.map((v, k) => v + (cible[k] - v) * Math.min(1, dt * 6));
    /* les lumières : les cinq écrans (couleur du film) et la lampe de la table */
    const lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3);
    ECRANS.forEach(([c, nrm], i) => { lp.set([c[0] + nrm[0] * .45, c[1], c[2] + nrm[2] * .45], i * 3); lc.set(teinte.map(v => v * 1.7), i * 3); });
    const f = .9 + .07 * Math.sin(t * 7.1); lp.set([LAMPE[0], HT + .35, LAMPE[1]], N * 3); lc.set([1.3 * f, 1.1 * f, .7 * f].map(v => v * .8), N * 3);
    gl.clearColor(.075, .068, .058, 1); /* un fond sombre (la page l'estompe sur les bords) : le Napoléon du fond de l'accueil ne passe plus à travers */ gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    const lum = (g, col, extra = {}) => { gl.useProgram(pLum); gl.uniform3fv(gl.getUniformLocation(pLum, "lp"), lp); gl.uniform3fv(gl.getUniformLocation(pLum, "lc"), lc); dessine(pLum, g, { ...VIDE, V, oeil, col, ...extra }); };
    lum(tour, [.37, .09, .11]); lum(dessus, [.43, .12, .13]);
    lum(assiettes, [.62, .62, .6], { brille: .06 });
    lum(lampe[0], [.6, .5, .3]); lum(lampe[1], [.85, .74, .5], { brille: .45 });
    lum(chaises, [.7, .54, .27], { brille: .07 }); lum(dorures, [.7, .54, .27], { brille: .07 }); lum(velours, [.32, .06, .09]);
    ecrans.forEach((e, i) => {
      const [c, nrm] = ECRANS[i];
      /* vu de dos, un écran ne garde que la silhouette sombre de son cadre : il ne cache ni la table ni la chaise */
      if (nrm[0] * (oeil[0] - c[0]) + nrm[1] * (oeil[1] - c[1]) + nrm[2] * (oeil[2] - c[2]) < 0) { lum(e.cadre, [1, 1, 1], { dos: 1, orne: 1 }); return; }
      dessine(pLum, e.dos, { ...VIDE, V, oeil, col: [.16, .1, .06], lp, lc });
      lum(e.cadre, [1, 1, 1], { brille: .32, dos: 1, orne: 1 });
      gl.bindTexture(gl.TEXTURE_2D, texFilm); dessine(pEcran, e.film, { V, oeil }); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    });
    /* le sol en dernier, fondu sur le fond de la page (il ne cache rien : tout est posé dessus) */
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    lum(sol, [.11, .075, .05], { bois: 1, fondu: 3.4 });
    /* la poussière dans la lumière des écrans, additive */
    gl.depthMask(false); gl.blendFunc(gl.ONE, gl.ONE);
    dessine(pHalo, { pos: poussiere, n: 220 }, { V, taille: 26 * dpr, t, vole: 1, col: teinte.map(v => v * .2) });
    gl.depthMask(true); gl.disable(gl.BLEND);
  };
  /* tourner à la main : on garde le défilement vertical de la page */
  let x0 = null;
  toile.addEventListener("pointerdown", e => { x0 = e.clientX; toile.setPointerCapture(e.pointerId); });
  toile.addEventListener("pointermove", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = e.clientX; phi += dx * .006; vitesse = dx * .25; });
  toile.addEventListener("pointerup", () => { x0 = null; }); toile.addEventListener("pointercancel", () => { x0 = null; });
  new IntersectionObserver(([e]) => { actif = e.isIntersecting; if (actif) { boite.classList.add("pret"); video.play().catch(() => {}); if (!enCours) { enCours = true; dernier = performance.now(); requestAnimationFrame(image); } } else video.pause(); }, { rootMargin: "80px" }).observe(boite);
})();

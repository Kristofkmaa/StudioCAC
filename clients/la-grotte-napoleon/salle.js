/* La salle de la Grotte en 3D, vue en plongée comme une maquette (WebGL écrit à la main, sans bibliothèque).
   Cinq écrans incurvés en cercle passent le film de présentation (images/salle.mp4) ; leur lumière prend la couleur du film
   à chaque instant et éclaire la salle : tables rondes à nappe rouge, chaises, paroi de roche (coupée côté caméra pour voir
   dedans), sol de roche qui reflète les écrans. Des lampes vacillent sur les tables, des halos entourent écrans et lampes,
   un peu de poussière flotte dans la lumière. La caméra tourne lentement ; on peut la tourner à la souris ou au doigt.
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
  const tronc = (r0, r1, y0, y1, n, ox = 0, oz = 0, a0 = 0, a1 = Math.PI * 2, sens = 1) => {
    const pos = [], uv = [], nor = [], idx = [], pente = (r0 - r1) / (y1 - y0);
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, sx = Math.sin(a), cz = Math.cos(a), l = Math.hypot(1, pente);
      pos.push(ox + sx * r1, y1, oz + cz * r1, ox + sx * r0, y0, oz + cz * r0); uv.push(i / n, 0, i / n, 1);
      for (let k = 0; k < 2; k++) nor.push(sens * sx / l, sens * pente / l, sens * cz / l);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    return forme(pos, uv, nor, idx);
  };
  const disque = (r, y, n, ox = 0, oz = 0) => {
    const pos = [ox, y, oz], uv = [.5, .5], nor = [0, 1, 0], idx = [];
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos.push(ox + Math.sin(a) * r, y, oz + Math.cos(a) * r); uv.push(.5 + Math.sin(a) / 2, .5 + Math.cos(a) / 2); nor.push(0, 1, 0); if (i < n) idx.push(0, i + 1, i + 2); }
    return forme(pos, uv, nor, idx);
  };
  /* des pavés réunis en une seule forme (les chaises) : chaque pavé [cx, cy, cz, dx, dy, dz, angle] */
  const paves = liste => {
    const pos = [], uv = [], nor = [], idx = [];
    const F = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
    for (const [cx, cy, cz, dx, dy, dz, ang] of liste) {
      const c = Math.cos(ang), s = Math.sin(ang), rot = v => [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c], d = [dx, dy, dz];
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

  /* ---------- les dimensions ---------- */
  const R = 3.0, RM = 3.7, HM = 2.2, DEMI = .37, N = 5, NL = N + 4;
  /* l'écran a la forme de l'ouverture du cadre doré (images/cadre.webp, proportions 2/1 ; moulures : 10 % à gauche et à droite, 14,8 % en haut et en bas) */
  const LARG = 2 * DEMI * R, HECR = LARG / 2.0, BAS = .4, HAUT = BAS + HECR, CG = .099, CH = .148;
  const LC = LARG / (1 - 2 * CG), HC = HECR / (1 - 2 * CH), RC = R - .02, DC = LC / 2 / RC, YC0 = (BAS + HAUT) / 2 - HC / 2, YC1 = YC0 + HC;
  const TABLES = [[-1.0, -.62], [1.0, -.62], [-1.0, .72], [1.0, .72]], RT = .4, HT = .44;
  const ECRANS = [...Array(N)].map((_, i) => { const a = i * 2 * Math.PI / N; return [-Math.sin(a), Math.cos(a)]; });

  /* ---------- les shaders ---------- */
  const brume = `vec3 brume(vec3 c, vec3 w, vec3 e){ float d = length(w - e); return mix(c, vec3(.012,.009,.007), smoothstep(7.0, 13.0, d) * .85); }`;
  const VS = `precision mediump float; attribute vec3 p; attribute vec2 t; attribute vec3 nr; uniform mat4 P, V; uniform float miroir;
    varying vec2 uv; varying vec3 w, n;
    void main(){ vec3 q = p; if (miroir > .5) q.y = -q.y; w = q; uv = t; n = nr; gl_Position = P * V * vec4(q, 1.0); }`;
  /* les objets éclairés : 5 écrans (couleur du film) et 4 lampes (vacillantes), Lambert doux, roche en texture si demandé */
  const pLum = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform vec3 col, oeil; uniform vec3 lp[${NL}], lc[${NL}];
    uniform sampler2D roche, motif; uniform float tex, coupe, brille, dos, orne; ${brume}
    void main(){
      if (coupe > .5) { float c = dot(normalize(w.xz), normalize(oeil.xz)), an = atan(w.x, w.z); /* la paroi s’abaisse côté caméra (maquette), le haut irrégulier comme de la roche */
        float h = ${HM.toFixed(2)} * (1.0 - smoothstep(-.35, .55, c)) * (.86 + .08 * sin(an * 7.0) + .06 * sin(an * 17.0 + 1.3)); if (w.y > h) discard; }
      vec3 nn = normalize(n); if (!gl_FrontFacing) nn = -nn;
      vec3 base = col;
      if (orne > .5) { vec4 m = texture2D(motif, vec2(1.0 - uv.x, uv.y)); if (m.a < .5) discard; base = m.rgb * 1.1; } /* le cadre doré : ses moulures, son ouverture vide */
      if (tex > .5) base *= texture2D(roche, fract((abs(nn.y) > .5 ? w.xz : vec2(atan(w.x, w.z) * 1.2, w.y)) * .32)).rgb * 1.7;
      vec3 l = base * vec3(.05,.042,.034);
      for (int i = 0; i < ${NL}; i++) { vec3 d = lp[i] - w; float r = length(d); d /= r;
        float lam = max(dot(nn, d), 0.0) * .8 + .2; l += base * lc[i] * lam / (1.0 + r * r * (i < ${N} ? .22 : 2.6)); }
      l += brille * base;
      if (dos > .5 && gl_FrontFacing) l = vec3(.035,.028,.02) + l * .08; /* le cadre vu de dos : le bois sombre du dos de l'écran */
      gl_FragColor = vec4(brume(l, w, oeil), 1.0); }`);
  gl.useProgram(pLum); gl.uniform1i(gl.getUniformLocation(pLum, "motif"), 1); /* le cadre doré sur l'unité de texture 1 */
  /* l'écran : le film côté salle, le dos sombre côté extérieur ; le reflet sur le sol pâlit en s'éloignant */
  const pEcran = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w, n; uniform sampler2D film; uniform float miroir; uniform vec3 oeil; ${brume}
    void main(){ bool face = !gl_FrontFacing; vec3 c;
      if (miroir > .5 || face) { c = texture2D(film, vec2(1.0 - uv.x, .056 + uv.y * .889)).rgb * 1.15; float v = smoothstep(0.0, .05, uv.x) * smoothstep(1.0, .95, uv.x); c *= .8 + .2 * v; }
      else c = vec3(.03,.025,.02);
      float a = 1.0; if (miroir > .5) a = .26 * pow(uv.y, 1.8);
      gl_FragColor = vec4(brume(c, w, oeil), a); }`);
  /* halos et poussière : des points lumineux doux, additifs */
  const pHalo = prog(`precision mediump float; attribute vec3 p; uniform mat4 P, V; uniform float taille, t, vole; varying float a;
    void main(){ vec3 q = p; if (vole > .5) { float s = fract(sin(dot(p, vec3(12.9, 78.2, 37.7))) * 4375.5); q += vec3(sin(t * .21 + s * 40.0) * .25, mod(t * .05 + s, 1.0) * .9 - .45, cos(t * .17 + s * 30.0) * .25); a = smoothstep(0.0, .2, q.y) * (.5 + .5 * sin(t * .8 + s * 20.0)); } else a = 1.0;
      vec4 v = V * vec4(q, 1.0); gl_Position = P * v; gl_PointSize = taille / -v.z; }`,
    `precision mediump float; varying float a; uniform vec3 col;
    void main(){ vec2 d = gl_PointCoord - .5; float k = exp(-dot(d, d) * 18.0); gl_FragColor = vec4(col * k * a, 1.0); }`);

  /* ---------- les formes ---------- */
  const ecran = tronc(R, R, BAS, HAUT, 20, 0, 0, -DEMI, DEMI), cadre = tronc(RC, RC, YC0, YC1, 28, 0, 0, -DC, DC);
  /* le dos de chaque tableau : un panneau de bois de la taille du cadre, juste derrière l'écran (sinon on voyait la salle entre l'écran et le cadre) */
  const dosPanneau = tronc(R + .012, R + .012, YC0, YC1, 28, 0, 0, -DC, DC);
  const pied = tronc(.035, .035, 0, YC0 + .05, 6, 0, R + .02);
  const sol = disque(RM + .35, 0, 96), mur = tronc(RM + .25, RM - .1, 0, HM, 120, 0, 0, 0, Math.PI * 2, -1);
  const nappes = TABLES.map(([x, z]) => [disque(RT, HT, 32, x, z), tronc(RT * 1.13, RT, .01, HT, 32, x, z), tronc(.04, .03, HT, HT + .16, 10, x, z), disque(.075, HT + .16, 16, x, z)]);
  const chaises = paves(TABLES.flatMap(([x, z]) => [0, 1, 2, 3].map(k => { const a = k * Math.PI / 2 + Math.PI / 4, d = RT + .32; const cx = x + Math.sin(a) * d, cz = z + Math.cos(a) * d, ca = Math.cos(a), sa = Math.sin(a), pied = (u, v) => [cx + ca * u + sa * v, .11, cz - sa * u + ca * v, .018, .11, .018, a];
    return [[cx, .24, cz, .17, .025, .17, a], [x + sa * (d + .155), .47, z + ca * (d + .155), .17, .21, .022, a], pied(-.14, -.14), pied(.14, -.14), pied(-.14, .14), pied(.14, .14)]; }).flat()));
  const poussiere = tampon(new Float32Array([...Array(260)].flatMap(() => { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * 2.8; return [Math.sin(a) * r, .3 + Math.random() * 1.5, Math.cos(a) * r]; })));
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
  const tourne = (V, i) => { const a = i * 2 * Math.PI / N, c = Math.cos(a), s = Math.sin(a), M = new Float32Array(V); for (let k = 0; k < 4; k++) { M[k] = V[k] * c + V[8 + k] * s; M[8 + k] = V[8 + k] * c - V[k] * s; } return M; };
  const VIDE = { miroir: 0, tex: 0, coupe: 0, brille: 0, dos: 0, orne: 0 };
  let theta = .55, vitesse = 0, actif = false, enCours = false, dernier = 0, t = 0;
  const taille = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), r = boite.getBoundingClientRect();
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (toile.width !== w || toile.height !== h) { toile.width = w; toile.height = h; }
    gl.viewport(0, 0, w, h); P = perspective(w / h < 1 ? 1.0 : .72, w / h, .1, 40); return dpr;
  };
  const image = now => {
    if (!actif) { enCours = false; return; } requestAnimationFrame(image);
    const dt = Math.min(.05, (now - dernier) / 1000 || 0); dernier = now; t += dt;
    theta += (.07 + vitesse) * dt; vitesse *= Math.pow(.02, dt);
    const dpr = taille(), portrait = toile.width / toile.height < 1;
    const loin = portrait ? 7.0 : 7.4, h = loin * .58 + Math.sin(t * .23) * .12;
    const oeil = [Math.sin(theta) * loin, h, Math.cos(theta) * loin], V = regarde(oeil, [0, .45, 0]);
    if (source) { gl.bindTexture(gl.TEXTURE_2D, texFilm); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); if (compte++ % 6 === 0) mesure(); }
    teinte = teinte.map((v, k) => v + (cible[k] - v) * Math.min(1, dt * 4));
    /* les lumières : les écrans (couleur du film), puis les lampes (vacillement) */
    const lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3);
    ECRANS.forEach(([x, z], i) => { lp.set([x * (R - .25), .85, z * (R - .25)], i * 3); lc.set(teinte.map(v => v * 1.35), i * 3); });
    TABLES.forEach(([x, z], i) => { const f = .85 + .1 * Math.sin(t * 9.1 + i * 2) + .05 * Math.sin(t * 23.7 + i); lp.set([x, HT + .3, z], (N + i) * 3); lc.set([1.0 * f, .62 * f, .3 * f], (N + i) * 3); });
    const L = { V, oeil, lp, lc, roche: 0 };
    gl.clearColor(.012, .009, .007, 1); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    const lum = (g, col, extra = {}) => { gl.useProgram(pLum); gl.uniform3fv(gl.getUniformLocation(pLum, "lp"), lp); gl.uniform3fv(gl.getUniformLocation(pLum, "lc"), lc); dessine(pLum, g, { ...VIDE, V, oeil, col, ...extra }); };
    lum(sol, [1.1, .9, .72], { tex: 1, brille: .05 });
    lum(mur, [1.35, 1.12, .9], { tex: 1, coupe: 1, brille: .18 });
    /* les reflets des écrans sur le sol */
    gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.bindTexture(gl.TEXTURE_2D, texFilm);
    for (let i = 0; i < N; i++) dessine(pEcran, ecran, { V: tourne(V, i), miroir: 1, oeil });
    gl.depthMask(true); gl.disable(gl.BLEND); gl.bindTexture(gl.TEXTURE_2D, texRoche);
    for (const [dessus, tour, tige, abat] of nappes) { lum(tour, [.62, .07, .05]); lum(dessus, [.78, .12, .08]); lum(tige, [.5, .4, .2]); lum(abat, [1, .8, .5], { brille: .9 }); }
    lum(chaises, [.32, .19, .11]);
    for (let i = 0; i < N; i++) { const Vi = tourne(V, i); dessine(pLum, cadre, { ...VIDE, V: Vi, oeil, col: [1, 1, 1], brille: .32, dos: 1, orne: 1 }); dessine(pLum, pied, { ...VIDE, V: Vi, oeil, col: [.3, .25, .15] }); dessine(pLum, dosPanneau, { ...VIDE, V: Vi, oeil, col: [.16, .1, .06] }); gl.bindTexture(gl.TEXTURE_2D, texFilm); dessine(pEcran, ecran, { V: Vi, miroir: 0, oeil }); gl.bindTexture(gl.TEXTURE_2D, texRoche); }
    /* les halos (écrans, lampes) puis la poussière, additifs */
    gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    ECRANS.forEach(([x, z]) => { dessine(pHalo, { pos: tampon2([x * (R - .15), .8, z * (R - .15)]), n: 1 }, { V, taille: 900 * dpr * (portrait ? .7 : 1), t, vole: 0, col: teinte.map(v => v * .16) }); });
    TABLES.forEach(([x, z], i) => { const f = .85 + .15 * Math.sin(t * 9.1 + i * 2); dessine(pHalo, { pos: tampon2([x, HT + .2, z]), n: 1 }, { V, taille: 260 * dpr, t, vole: 0, col: [.55 * f, .32 * f, .12 * f] }); });
    dessine(pHalo, { pos: poussiere, n: 260 }, { V, taille: 26 * dpr, t, vole: 1, col: teinte.map(v => v * .22) });
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

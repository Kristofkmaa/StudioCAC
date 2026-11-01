/* La salle de la Grotte en 3D, vue d'en haut comme une maquette (WebGL, sans bibliothèque) : cinq écrans incurvés en cercle,
   le même film sur les cinq (images/salle.mp4, le film de présentation de la Grotte), des tables à nappe rouge et leur lampe
   au milieu, un sol de roche qui reflète les écrans. La caméra tourne lentement autour de la salle, en plongée ; on peut aussi
   la tourner à la souris ou au doigt. Chargé seulement quand la section arrive à l'écran (grotte.js).
   Sans WebGL, ou si le mouvement réduit est demandé, l'image fixe reste. */
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
  const forme = (pos, uv, idx) => ({ pos: tampon(new Float32Array(pos)), uv: tampon(new Float32Array(uv)), idx: tampon(new Uint16Array(idx), gl.ELEMENT_ARRAY_BUFFER), n: idx.length });
  /* une bande incurvée (portion de cylindre) autour de (ox, oz) : rayon r, angles a0..a1, hauteurs y0..y1, n segments */
  const arc = (r, a0, a1, y0, y1, n, ox = 0, oz = 0) => {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, x = ox + Math.sin(a) * r, z = oz + Math.cos(a) * r;
      pos.push(x, y1, z, x, y0, z); uv.push(i / n, 0, i / n, 1);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    return forme(pos, uv, idx);
  };
  /* un disque horizontal (dessus de table, lampe, sol) */
  const disque = (r, y, n, ox = 0, oz = 0) => {
    const pos = [ox, y, oz], uv = [.5, .5], idx = [];
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos.push(ox + Math.sin(a) * r, y, oz + Math.cos(a) * r); uv.push(.5 + Math.sin(a) / 2, .5 + Math.cos(a) / 2); if (i < n) idx.push(0, i + 1, i + 2); }
    return forme(pos, uv, idx);
  };
  const perspective = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); };
  const regarde = (e, c) => { /* la caméra en e, qui regarde c */
    const nz = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
    const f = nz([c[0] - e[0], c[1] - e[1], c[2] - e[2]]), s = nz([-f[2], 0, f[0]]), u = [s[1] * f[2] - s[2] * f[1], s[2] * f[0] - s[0] * f[2], s[0] * f[1] - s[1] * f[0]];
    const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return new Float32Array([s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -d(s, e), -d(u, e), d(f, e), 1]);
  };

  /* ---------- la scène ---------- */
  const R = 3.0, SOL = 0, HAUT = 1.45, BAS = .12, DEMI = .36, N = 5;
  const brume = `vec3 brume(vec3 c, vec3 w){ return mix(c, vec3(.02,.016,.012), smoothstep(3.6, 6.5, length(w.xz))); }`;
  const VS = `precision mediump float; attribute vec3 p; attribute vec2 t; uniform mat4 P, V; uniform float miroir; varying vec2 uv; varying vec3 w;
    void main(){ vec3 q = p; if (miroir > .5) q.y = 2.0 * ${SOL.toFixed(2)} - q.y; w = q; uv = t; gl_Position = P * V * vec4(q, 1.0); }`;
  /* l'écran : le film côté salle, le dos sombre côté extérieur ; le reflet plus pâle et qui s'éteint en descendant */
  const pEcran = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform sampler2D film; uniform float miroir, dos; ${brume}
    void main(){ bool face = gl_FrontFacing; if (dos > .5) face = !face; vec3 c;
      if (miroir > .5 || face) { c = texture2D(film, vec2(1.0 - uv.x, uv.y)).rgb * 1.08; float v = smoothstep(0.0, .06, uv.x) * smoothstep(1.0, .94, uv.x); c *= .78 + .22 * v; }
      else c = vec3(.07,.055,.04);
      float a = 1.0; if (miroir > .5) a = .3 * pow(uv.y, 1.5);
      gl_FragColor = vec4(brume(c, w), a); }`);
  /* uni : cadres dorés, nappes, lampes */
  const pUni = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform vec3 col; uniform float dos; ${brume}
    void main(){ vec3 c = col; if (dos > .5 && gl_FrontFacing) c = vec3(.06,.048,.035); /* le cadre vu de dos : sombre */
      gl_FragColor = vec4(brume(c, w), 1.0); }`);
  /* le sol de roche : la texture du site, éclairée par les écrans (plus clair près d'eux) et par les lampes des tables */
  const pSol = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform sampler2D roche; uniform vec2 lampes[4]; ${brume}
    void main(){ vec3 r = texture2D(roche, fract(w.xz * .28)).rgb; float d = length(w.xz);
      float g = .3 + .8 * exp(-pow(d - ${(R - .35).toFixed(2)}, 2.0) * 1.4);
      for (int i = 0; i < 4; i++) g += .6 * exp(-dot(w.xz - lampes[i], w.xz - lampes[i]) * 4.0);
      vec3 c = r * vec3(.85,.66,.45) * g;
      gl_FragColor = vec4(brume(c, w), 1.0); }`);

  const ecran = arc(R, -DEMI, DEMI, BAS, HAUT, 18), cadre = arc(R + .03, -DEMI - .02, DEMI + .02, BAS - .04, HAUT + .04, 18);
  const sol = disque(7, SOL, 72);
  /* quatre tables rondes, nappe rouge jusqu'au sol, une petite lampe au milieu */
  const TABLES = [[-.95, -.6], [.95, -.6], [-.95, .7], [.95, .7]], RT = .42, HT = .46;
  const nappes = TABLES.map(([x, z]) => [disque(RT, HT, 28, x, z), arc(RT, 0, Math.PI * 2, SOL + .01, HT, 28, x, z), disque(.07, HT + .005, 14, x, z)]);
  const texFilm = gl.createTexture(), texRoche = gl.createTexture();
  for (const tx of [texFilm, texRoche]) { gl.bindTexture(gl.TEXTURE_2D, tx); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([40, 30, 20])); }
  const roche = new Image(); roche.src = "images/roche.webp";
  roche.onload = () => { gl.bindTexture(gl.TEXTURE_2D, texRoche); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, roche); };
  /* le film : d'abord l'image fixe, puis la vidéo dès qu'elle joue */
  const affiche = boite.querySelector("img"), video = document.createElement("video");
  Object.assign(video, { src: "images/salle.mp4", muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" }); video.setAttribute("playsinline", "");
  let source = affiche.complete && affiche.naturalWidth ? affiche : null;
  affiche.addEventListener("load", () => { if (!source) source = affiche; });
  video.addEventListener("playing", () => { source = video; });
  video.play().catch(() => {});

  /* ---------- le dessin ---------- */
  let P;
  const dessine = (p, g, u) => {
    gl.useProgram(p);
    const ap = gl.getAttribLocation(p, "p"), at = gl.getAttribLocation(p, "t");
    gl.bindBuffer(gl.ARRAY_BUFFER, g.pos); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 3, gl.FLOAT, false, 0, 0);
    if (at >= 0) { gl.bindBuffer(gl.ARRAY_BUFFER, g.uv); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0); }
    gl.uniformMatrix4fv(gl.getUniformLocation(p, "P"), false, P); gl.uniformMatrix4fv(gl.getUniformLocation(p, "V"), false, u.V);
    gl.uniform1f(gl.getUniformLocation(p, "miroir"), u.miroir || 0);
    for (const k in u) { if (k === "V" || k === "miroir") continue; const l = gl.getUniformLocation(p, k); if (!l) continue; const v = u[k]; if (typeof v === "number") gl.uniform1f(l, v); else if (v.length === 3) gl.uniform3fv(l, v); else gl.uniform2fv(l, v); }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.idx); gl.drawElements(gl.TRIANGLES, g.n, gl.UNSIGNED_SHORT, 0);
  };
  const tourne = (V, i) => { /* la même vue, tournée de l'angle de l'écran i */
    const a = i * 2 * Math.PI / N, c = Math.cos(a), s = Math.sin(a), M = new Float32Array(V);
    for (let k = 0; k < 4; k++) { M[k] = V[k] * c + V[8 + k] * s; M[8 + k] = V[8 + k] * c - V[k] * s; } return M;
  };
  const LAMPES = new Float32Array(TABLES.flat()), DOS = 1;
  let theta = .5, vitesse = 0, actif = false, enCours = false, dernier = 0;
  const taille = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), r = boite.getBoundingClientRect();
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (toile.width !== w || toile.height !== h) { toile.width = w; toile.height = h; }
    gl.viewport(0, 0, w, h); P = perspective(w / h < 1 ? 1.05 : .78, w / h, .1, 30);
  };
  const image = now => {
    if (!actif) { enCours = false; return; } requestAnimationFrame(image);
    const dt = Math.min(.05, (now - dernier) / 1000 || 0); dernier = now;
    theta += (.08 + vitesse) * dt; vitesse *= Math.pow(.02, dt);
    taille();
    const loin = toile.width / toile.height < 1 ? 6.3 : 6.4, haut = loin * .78;
    const V = regarde([Math.sin(theta) * loin, haut, Math.cos(theta) * loin], [0, .35, 0]);
    if (source) { gl.bindTexture(gl.TEXTURE_2D, texFilm); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); }
    gl.clearColor(.02, .016, .012, 1); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRoche); dessine(pSol, sol, { V, lampes: LAMPES });
    /* les reflets des écrans sur le sol (sans écrire la profondeur) */
    gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindTexture(gl.TEXTURE_2D, texFilm);
    for (let i = 0; i < N; i++) dessine(pEcran, ecran, { V: tourne(V, i), miroir: 1, dos: DOS });
    gl.depthMask(true); gl.disable(gl.BLEND);
    for (const [dessus, tour, lampe] of nappes) { dessine(pUni, tour, { V, col: [.3, .05, .04], dos: 0 }); dessine(pUni, dessus, { V, col: [.48, .09, .07], dos: 0 }); dessine(pUni, lampe, { V, col: [1, .82, .5], dos: 0 }); }
    for (let i = 0; i < N; i++) { const Vi = tourne(V, i); dessine(pUni, cadre, { V: Vi, col: [.62, .5, .27], dos: DOS }); gl.bindTexture(gl.TEXTURE_2D, texFilm); dessine(pEcran, ecran, { V: Vi, dos: DOS }); }
  };
  /* tourner à la main : on garde le défilement vertical de la page */
  let x0 = null;
  toile.addEventListener("pointerdown", e => { x0 = e.clientX; toile.setPointerCapture(e.pointerId); });
  toile.addEventListener("pointermove", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = e.clientX; theta -= dx * .006; vitesse = -dx * .25; });
  toile.addEventListener("pointerup", () => { x0 = null; }); toile.addEventListener("pointercancel", () => { x0 = null; });
  /* on ne dessine que quand la salle est visible */
  new IntersectionObserver(([e]) => { actif = e.isIntersecting; if (actif) { boite.classList.add("pret"); video.play().catch(() => {}); if (!enCours) { enCours = true; dernier = performance.now(); requestAnimationFrame(image); } } else video.pause(); }, { rootMargin: "80px" }).observe(boite);
})();

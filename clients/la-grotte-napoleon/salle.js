/* La salle de la Grotte en 3D (WebGL, sans bibliothèque) : cinq écrans incurvés en cercle autour du spectateur,
   le même film sur les cinq (images/salle.mp4), des cadres dorés, le reflet des écrans sur le sol, la paroi de roche
   éclairée par les écrans et un peu de brume. La caméra est au centre, à la place d'un spectateur, et tourne lentement ;
   on peut aussi la tourner à la souris ou au doigt. Chargé seulement quand la section arrive à l'écran (grotte.js).
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
  /* une bande incurvée (portion de cylindre) : rayon r, angles a0..a1, hauteurs y0..y1, n segments ; uv de 0 à 1 (×ru en largeur) */
  const arc = (r, a0, a1, y0, y1, n, ru = 1) => {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, x = Math.sin(a) * r, z = Math.cos(a) * r;
      pos.push(x, y1, z, x, y0, z); uv.push(i / n * ru, 0, i / n * ru, 1);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    return { pos: tampon(new Float32Array(pos)), uv: tampon(new Float32Array(uv)), idx: tampon(new Uint16Array(idx), gl.ELEMENT_ARRAY_BUFFER), n: idx.length };
  };
  const quad = (x0, z0, x1, z1, y) => ({ pos: tampon(new Float32Array([x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1])), uv: tampon(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])), idx: tampon(new Uint16Array([0, 1, 2, 1, 3, 2]), gl.ELEMENT_ARRAY_BUFFER), n: 6 });
  const perspective = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); };
  const vue = (theta, ey, pente) => { /* rotation autour de Y, l'œil à (0,ey,0), puis un léger regard vers le bas (rotation autour de X) */
    const c = Math.cos(theta), s = Math.sin(theta), cp = Math.cos(pente), sp = Math.sin(pente);
    return new Float32Array([c, 0, s, 0, 0, cp, -sp, 0, -s * cp, sp * c, c * cp, 0, 0, -ey * cp, ey * sp, 1]); };

  /* ---------- la scène ---------- */
  const R = 3.0, RM = 3.75, SOL = -0.04, HAUT = 1.55, BAS = 0.1, DEMI = 0.36, N = 5, OEIL = 0.72, PENTE = -0.1;
  const brume = `vec3 brume(vec3 c, float d){ return mix(c, vec3(.035,.028,.02), smoothstep(2.2, 7.5, d)); }`;
  const VS = `precision mediump float; attribute vec3 p; attribute vec2 t; uniform mat4 P, V; uniform float miroir; varying vec2 uv; varying vec3 w;
    void main(){ vec3 q = p; if (miroir > .5) q.y = 2.0 * ${SOL.toFixed(2)} - q.y; w = q; uv = t; gl_Position = P * V * vec4(q, 1.0); }`;
  /* l'écran : le film, un léger voile vers les bords (projection), le reflet plus pâle et qui s'éteint en descendant */
  const pEcran = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform sampler2D film; uniform float miroir, lum; ${brume}
    void main(){ vec3 c = texture2D(film, uv).rgb * lum; float v = smoothstep(0.0, .08, uv.x) * smoothstep(1.0, .92, uv.x) * smoothstep(0.0, .1, uv.y) * smoothstep(1.0, .9, uv.y);
      c *= .75 + .25 * v; float a = 1.0; if (miroir > .5) { a = .38 * pow(uv.y, 1.4); c *= .9; }
      gl_FragColor = vec4(brume(c, length(w)), a); }`);
  /* uni : cadres dorés, sol, lampes */
  const pUni = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform vec3 col; uniform float alpha, sol; ${brume}
    void main(){ vec3 c = col; float a = alpha; if (sol > .5) { float d = length(w.xz); c = mix(vec3(.13,.1,.07), vec3(.03,.024,.018), smoothstep(.4, 5.0, d)); }
      gl_FragColor = vec4(brume(c, length(w)), a); }`);
  /* la paroi de roche : la texture du site, sombre, éclairée par chaque écran selon l'angle */
  const pMur = prog(VS, `precision mediump float; varying vec2 uv; varying vec3 w; uniform sampler2D roche; uniform float t; ${brume}
    void main(){ vec3 r = texture2D(roche, fract(uv * vec2(5.0, 1.6))).rgb; float ang = atan(w.x, w.z); float g = 0.0;
      for (int i = 0; i < ${N}; i++) { float a = float(i) * ${(2 * Math.PI / N).toFixed(5)}; float d = abs(mod(ang - a + 3.14159, 6.28318) - 3.14159); g += exp(-d * d * 9.0); }
      float h = smoothstep(${(SOL - .3).toFixed(2)}, ${BAS.toFixed(2)}, w.y) * smoothstep(3.6, 1.2, w.y);
      vec3 c = r * (vec3(.08,.065,.05) + vec3(.8,.62,.4) * g * h * (.85 + .15 * sin(t * 2.1 + ang * 3.0)));
      gl_FragColor = vec4(brume(c, length(w)), 1.0); }`);

  const ecran = arc(R, -DEMI, DEMI, BAS, HAUT, 18), cadre = arc(R + .025, -DEMI - .018, DEMI + .018, BAS - .035, HAUT + .035, 18);
  const mur = arc(RM, 0, Math.PI * 2, SOL - .4, 4.2, 96, 1), sol = quad(-8, -8, 8, 8, SOL);
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
  const dessine = (p, g, u) => {
    gl.useProgram(p);
    const ap = gl.getAttribLocation(p, "p"), at = gl.getAttribLocation(p, "t");
    gl.bindBuffer(gl.ARRAY_BUFFER, g.pos); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 3, gl.FLOAT, false, 0, 0);
    if (at >= 0) { gl.bindBuffer(gl.ARRAY_BUFFER, g.uv); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0); }
    gl.uniformMatrix4fv(gl.getUniformLocation(p, "P"), false, P); gl.uniformMatrix4fv(gl.getUniformLocation(p, "V"), false, u.V);
    gl.uniform1f(gl.getUniformLocation(p, "miroir"), u.miroir || 0);
    for (const k in u) { if (k === "V" || k === "miroir") continue; const l = gl.getUniformLocation(p, k); if (l) (u[k].length === 3 ? gl.uniform3fv(l, u[k]) : gl.uniform1f(l, u[k])); }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.idx); gl.drawElements(gl.TRIANGLES, g.n, gl.UNSIGNED_SHORT, 0);
  };
  const tourne = (V, i) => { /* la même vue, tournée de l'angle de l'écran i (V × rotation autour de Y) */
    const a = i * 2 * Math.PI / N, c = Math.cos(a), s = Math.sin(a), M = new Float32Array(V);
    for (let k = 0; k < 4; k++) { M[k] = V[k] * c + V[8 + k] * s; M[8 + k] = V[8 + k] * c - V[k] * s; } return M;
  };
  let P, theta = .6, vitesse = 0, actif = false, enCours = false, dernier = 0, larg = 0, haut = 0;
  const taille = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), r = boite.getBoundingClientRect();
    larg = Math.round(r.width * dpr); haut = Math.round(r.height * dpr);
    if (toile.width !== larg || toile.height !== haut) { toile.width = larg; toile.height = haut; }
    gl.viewport(0, 0, larg, haut); P = perspective(innerWidth < 760 ? 1.3 : 1.12, larg / haut, .05, 20);
  };
  const image = now => {
    if (!actif) { enCours = false; return; } requestAnimationFrame(image);
    const dt = Math.min(.05, (now - dernier) / 1000 || 0); dernier = now;
    theta += (0.09 + vitesse) * dt; vitesse *= Math.pow(.02, dt); /* un tour en ≈ 70 s, plus l'élan de la main */
    taille();
    const V = vue(theta, OEIL, PENTE);
    if (source) { gl.bindTexture(gl.TEXTURE_2D, texFilm); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); }
    gl.clearColor(.035, .028, .02, 1); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texRoche); dessine(pMur, mur, { V, t: now / 1000 });
    gl.depthMask(false); dessine(pUni, sol, { V, col: [0, 0, 0], alpha: 1, sol: 1 });
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindTexture(gl.TEXTURE_2D, texFilm);
    for (let i = 0; i < N; i++) dessine(pEcran, ecran, { V: tourne(V, i), miroir: 1, lum: 1 }); /* les reflets sur le sol */
    gl.depthMask(true);
    for (let i = 0; i < N; i++) { const Vi = tourne(V, i); gl.useProgram(pUni); dessine(pUni, cadre, { V: Vi, col: [.62, .5, .27], alpha: 1, sol: 0 }); gl.bindTexture(gl.TEXTURE_2D, texFilm); dessine(pEcran, ecran, { V: Vi, miroir: 0, lum: 1.05 }); }
  };
  /* tourner à la main : on garde le défilement vertical de la page */
  let x0 = null;
  toile.addEventListener("pointerdown", e => { x0 = e.clientX; toile.setPointerCapture(e.pointerId); });
  toile.addEventListener("pointermove", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = e.clientX; theta -= dx * .006; vitesse = -dx * .25; });
  toile.addEventListener("pointerup", () => { x0 = null; }); toile.addEventListener("pointercancel", () => { x0 = null; });
  /* on ne dessine que quand la salle est visible */
  new IntersectionObserver(([e]) => { actif = e.isIntersecting; if (actif) { boite.classList.add("pret"); video.play().catch(() => {}); if (!enCours) { enCours = true; dernier = performance.now(); requestAnimationFrame(image); } } else video.pause(); }, { rootMargin: "80px" }).observe(boite);
})();

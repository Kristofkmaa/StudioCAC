/* La décoration de saison de Saitora. Deux réglages pour tout le site, les deux lignes ci-dessous :
   SAISON  : "noel", "halloween", "paques", ou "" pour ne rien montrer ;
   BOUTONS : true pour afficher les quatre boutons d'essai en bas à gauche (à remettre à false une fois la saison choisie).
   Ce fichier pose la saison sur la page (les boutiques de la galerie se décorent dans abysse-sphere.js), fait passer des flocons,
   des braises ou des pétales par-dessus la page, et accroche une guirlande à la grande vitrine de l'accueil.
   Pour essayer une saison sans les boutons : ajouter ?saison=halloween (ou noel, paques, aucune) à l'adresse d'une page. */
(function () {
  var SAISON = "noel";
  var BOUTONS = true;

  var OK = ["noel", "halloween", "paques"], racine = document.documentElement, s = "";
  var essai = null;
  try { essai = new URLSearchParams(location.search).get("saison"); if (essai) sessionStorage.setItem("saitora-saison", essai); else essai = sessionStorage.getItem("saitora-saison"); } catch (e) {}
  s = essai || SAISON; if (OK.indexOf(s) < 0) s = "";
  if (s) racine.dataset.saison = s;                                              // tout de suite : la galerie se décore dès sa première image
  var calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var c, x, L = 0, H = 0, d = 1, P = [], hasard = Math.random, avant = 0, img = 0;
  var TEINTES = { noel: ["#FFFFFF"], halloween: ["#FFA24A", "#FFC27A"], paques: ["#CBFFFC", "#FAD1FF", "#FFFFFF"] };
  var LAMPES = { noel: ["#FFE2A6"], halloween: ["#FFA24A"], paques: ["#CBFFFC", "#FAD1FF"] };   // une seule lumière chaude, pas de couleurs vives

  function neuf(p, partout) {
    p.r = s === "noel" ? 1.2 + hasard() * hasard() * 4.2 : s === "halloween" ? 1.3 + hasard() * 2.4 : 3.5 + hasard() * 4.5;
    p.x = hasard() * L;
    p.y = partout ? hasard() * H : s === "halloween" ? H + 12 : -12;
    p.v = (s === "noel" ? 14 + p.r * 9 : s === "halloween" ? -(10 + hasard() * 16) : 20 + hasard() * 18) * (.8 + hasard() * .4);   // points par seconde
    p.a = hasard() * 6.28; p.f = .4 + hasard() * .8; p.amp = 8 + hasard() * 22;                                                    // le balancement
    p.o = s === "noel" ? .5 + hasard() * .45 : s === "halloween" ? .45 + hasard() * .5 : .5 + hasard() * .35;
    p.c = TEINTES[s][Math.floor(hasard() * TEINTES[s].length)];
    p.cristal = s === "noel" && p.r > 3.2;                                                                                         // les plus gros flocons ont six branches
    return p;
  }
  function taille() {
    d = Math.min(2, devicePixelRatio || 1); L = innerWidth; H = innerHeight;
    c.width = Math.round(L * d); c.height = Math.round(H * d);
    var n = Math.round(Math.min(80, Math.max(26, L * H / 13000)));
    while (P.length < n) P.push(neuf({}, true));
    P.length = n;
  }
  function pas(t) {
    img = requestAnimationFrame(pas);
    var dt = Math.min(.05, (t - avant) / 1000 || 0); avant = t;
    x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, L, H);
    for (var i = 0; i < P.length; i++) { var p = P[i];
      p.y += p.v * dt; p.a += p.f * dt;
      var px = p.x + Math.sin(p.a) * p.amp;
      if (p.y > H + 14 || p.y < -14) { neuf(p, false); continue; }
      x.globalAlpha = p.o * (s === "halloween" ? .6 + .4 * Math.sin(p.a * 5) : 1);
      x.fillStyle = x.strokeStyle = p.c;
      if (s === "paques") { x.save(); x.translate(px, p.y); x.rotate(p.a); x.scale(1, .55 + .4 * Math.sin(p.a * 1.7)); x.beginPath(); x.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.2832); x.fill(); x.restore(); }
      else if (p.cristal) { x.lineWidth = 1.1; x.lineCap = "round"; x.beginPath();
        for (var k = 0; k < 3; k++) { var an = p.a * .3 + k * 1.0472, dx = Math.cos(an) * p.r * 1.7, dy = Math.sin(an) * p.r * 1.7; x.moveTo(px - dx, p.y - dy); x.lineTo(px + dx, p.y + dy); }
        x.stroke(); }
      else { if (s === "halloween") { x.shadowColor = p.c; x.shadowBlur = 12; } x.beginPath(); x.arc(px, p.y, p.r, 0, 6.2832); x.fill(); x.shadowBlur = 0; }
    }
    x.globalAlpha = 1;
  }
  function marche() { cancelAnimationFrame(img); if (!c) return; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); if (!s || calme || document.hidden) return; avant = performance.now(); img = requestAnimationFrame(pas); }

  // la guirlande accrochée en haut de la grande vitrine (la vidéo de l'accueil)
  function guirlande() {
    var v = document.querySelector(".devanture .vitrine"); if (!v) return;
    var old = v.querySelector(".saison-guirlande"); if (old) old.remove();
    if (!s) return;
    var w = v.clientWidth; if (!w) return;
    var n = Math.max(3, Math.round(w / 150)), pasW = w / n, col = LAMPES[s], h = "", ch = "M0 0", k = 0;
    for (var i = 0; i < n; i++) { var x0 = i * pasW;
      ch += " Q" + (x0 + pasW / 2).toFixed(1) + " 30 " + (x0 + pasW).toFixed(1) + " 0";
      for (var j = 1; j <= 4; j++) { var u = j / 5, px = x0 + pasW * u, py = 30 * 2 * u * (1 - u), cl = col[k++ % col.length];
        if (s === "paques") h += '<path d="M' + (px - 8).toFixed(1) + " " + (py - 1).toFixed(1) + "h16l-8 15z\" fill=\"" + cl + '" fill-opacity=".3" stroke="' + cl + '" stroke-width="1"/>';
        else h += '<circle cx="' + px.toFixed(1) + '" cy="' + (py + 4).toFixed(1) + '" r="2.6" fill="' + cl + '" style="filter:drop-shadow(0 0 5px ' + cl + ');animation-delay:-' + (k * .37 % 2.4).toFixed(2) + 's"/>'; } }
    var g = document.createElement("div"); g.className = "saison-guirlande"; g.setAttribute("aria-hidden", "true");
    g.style.cssText = "position:absolute;inset:0 0 auto;height:44px;pointer-events:none;z-index:2";
    g.innerHTML = '<svg width="' + w + '" height="44" viewBox="0 -4 ' + w + ' 44" style="display:block;overflow:visible"><path d="' + ch + '" fill="none" stroke="rgba(237,255,254,.3)" stroke-width="1"/>' + h + "</svg>";
    v.appendChild(g);
  }

  function choisit(n) {
    s = OK.indexOf(n) < 0 ? "" : n;
    if (s) racine.dataset.saison = s; else delete racine.dataset.saison;
    try { sessionStorage.setItem("saitora-saison", s || "aucune"); } catch (e) {}
    if (c) for (var i = 0; i < P.length; i++) if (s) neuf(P[i], true);
    marche(); guirlande();
    var bs = document.querySelectorAll(".saison-essai button"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", String(bs[j].dataset.s === s));
  }

  function pret() {
    var st = document.createElement("style");
    st.textContent = ".saison-guirlande circle{animation:saison-lampe 2.4s ease-in-out infinite}@keyframes saison-lampe{0%,100%{opacity:1}50%{opacity:.35}}" +
      "@media (prefers-reduced-motion:reduce){.saison-guirlande circle{animation:none}}" +
      ".saison-essai{position:fixed;left:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:30;display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(1,29,28,.82);box-shadow:0 0 0 1px rgba(237,255,254,.22);max-width:calc(100vw - 84px)}" +
      ".saison-essai button{min-height:36px;padding:0 12px;border:0;border-radius:999px;background:transparent;color:#EDFFFE;font:500 12px/1 \"Inter Tight\",system-ui,sans-serif;cursor:pointer;white-space:nowrap}" +
      ".saison-essai button[aria-pressed=true]{background:#EDFFFE;color:#012624}" +
      "@media (max-width:420px){.saison-essai button{padding:0 9px;font-size:11px}}";
    document.head.appendChild(st);
    c = document.createElement("canvas"); x = c.getContext("2d");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:4;pointer-events:none";
    document.body.appendChild(c);
    if (s) for (var i = 0; i < 1; i++) taille(); else { var gard = s; s = "noel"; taille(); s = gard; }
    var att = 0; addEventListener("resize", function () { var g = s; if (!s) s = "noel"; taille(); s = g; clearTimeout(att); att = setTimeout(guirlande, 200); });
    document.addEventListener("visibilitychange", marche);
    if (BOUTONS) { var b = document.createElement("div"); b.className = "saison-essai"; b.setAttribute("role", "group"); b.setAttribute("aria-label", "Essayer une décoration de saison");
      [["noel", "Noël"], ["halloween", "Halloween"], ["paques", "Pâques"], ["", "Aucune"]].forEach(function (q) { var bt = document.createElement("button"); bt.type = "button"; bt.dataset.s = q[0]; bt.textContent = q[1]; bt.setAttribute("aria-pressed", String(q[0] === s)); bt.addEventListener("click", function () { choisit(q[0]); }); b.appendChild(bt); });
      document.body.appendChild(b); }
    marche(); guirlande();
  }
  if (document.body) { pret(); document.addEventListener("DOMContentLoaded", guirlande); } else document.addEventListener("DOMContentLoaded", pret);   // la vitrine arrive plus bas dans la page
})();

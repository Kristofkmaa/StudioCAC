/* La décoration de saison de Saitora : quelques flocons, braises ou pétales qui passent doucement par-dessus la page.
   Un seul réglage pour tout le site, la ligne ci-dessous : "noel", "halloween", "paques", ou "" pour ne rien montrer.
   Pour essayer une saison sans rien changer : ajouter ?saison=halloween (ou noel, paques, aucune) à l'adresse d'une page. */
(function () {
  var SAISON = "noel";

  var essai = null;
  try { essai = new URLSearchParams(location.search).get("saison"); if (essai) sessionStorage.setItem("saitora-saison", essai); else essai = sessionStorage.getItem("saitora-saison"); } catch (e) {}
  var s = essai || SAISON;
  if (["noel", "halloween", "paques"].indexOf(s) < 0) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var c = document.createElement("canvas"), x = c.getContext("2d");
  c.setAttribute("aria-hidden", "true");
  c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:4;pointer-events:none";
  (document.body || document.documentElement).appendChild(c);

  var L = 0, H = 0, d = 1, P = [], hasard = Math.random;
  var jour = function () { return document.documentElement.dataset.theme === "jour"; };
  var TEINTES = { noel: ["#FFFFFF"], halloween: ["#FF9A3C", "#FFB868", "#B98CFF"], paques: ["#FFC9DC", "#FFE9A8", "#BFEFD9", "#D9C8FF"] };

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

  var avant = 0, img = 0;
  function pas(t) {
    img = requestAnimationFrame(pas);
    var dt = Math.min(.05, (t - avant) / 1000 || 0); avant = t;
    x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, L, H);
    var clair = jour();
    for (var i = 0; i < P.length; i++) { var p = P[i];
      p.y += p.v * dt; p.a += p.f * dt;
      var px = p.x + Math.sin(p.a) * p.amp;
      if (p.y > H + 14 || p.y < -14) { neuf(p, false); continue; }
      x.globalAlpha = p.o * (s === "halloween" ? .6 + .4 * Math.sin(p.a * 5) : 1) * (clair && s !== "noel" ? .9 : 1);
      x.fillStyle = x.strokeStyle = p.c;
      if (s === "paques") { x.save(); x.translate(px, p.y); x.rotate(p.a); x.scale(1, .55 + .4 * Math.sin(p.a * 1.7)); x.beginPath(); x.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.2832); x.fill(); x.restore(); }
      else if (p.cristal) { x.lineWidth = 1.1; x.lineCap = "round"; x.beginPath();
        for (var k = 0; k < 3; k++) { var an = p.a * .3 + k * 1.0472, dx = Math.cos(an) * p.r * 1.7, dy = Math.sin(an) * p.r * 1.7; x.moveTo(px - dx, p.y - dy); x.lineTo(px + dx, p.y + dy); }
        x.stroke(); }
      else { if (s === "halloween") { x.shadowColor = p.c; x.shadowBlur = 12; } x.beginPath(); x.arc(px, p.y, p.r, 0, 6.2832); x.fill(); x.shadowBlur = 0; }
    }
    x.globalAlpha = 1;
  }
  taille(); addEventListener("resize", taille);
  document.addEventListener("visibilitychange", function () { cancelAnimationFrame(img); if (!document.hidden) { avant = performance.now(); img = requestAnimationFrame(pas); } });
  avant = performance.now(); img = requestAnimationFrame(pas);
})();

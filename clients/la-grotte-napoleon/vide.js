/* Essai « vide » : de petits triangles de couleur, en contour, qui dérivent sur le noir.
   Dans l'ouverture, un nuage plus dense entoure la tête de Napoléon et se resserre quand le bicorne se pose. */
(function lance() {
  if (!document.body) { document.addEventListener("DOMContentLoaded", lance); return; }
  const c = document.createElement("canvas");
  c.className = "champ-ciel"; c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const x = c.getContext("2d");
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COULEURS = ["#8052FF", "#FFB829", "#15846E", "#B06CFF", "#4D7CFF", "#FF5CA8", "#2FC7A3"];
  const portrait = document.querySelector(".portrait"), chapeau = document.getElementById("chapeau");
  const hasard = (a, b) => a + Math.random() * (b - a);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  let W = 0, H = 0, ambiants = [], nuage = [];

  function seme(garder) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (garder) return;
    const tri = (o) => Object.assign({ c: COULEURS[Math.random() * COULEURS.length | 0], s: hasard(2.2, 5.5), r: hasard(0, 6.3), vr: hasard(-.006, .006) }, o);
    ambiants = Array.from({ length: Math.round(W * H / 22000) }, () => tri({ x: hasard(0, W), y: hasard(0, H), vy: hasard(-.12, -.03), vx: hasard(-.04, .04), a: hasard(.18, .45) }));
    nuage = portrait ? Array.from({ length: W < 700 ? 150 : 260 }, () => tri({ ang: hasard(0, 6.3), rho: .62 + Math.abs(gauss()) * .2 + hasard(-.04, .04), va: hasard(.0006, .0022) * (Math.random() < .5 ? -1 : 1), a: hasard(.45, .95), s: hasard(2, 4.8) })) : [];
  }

  function triangle(t, px, py, alpha) {
    const s = t.s;
    x.globalAlpha = alpha; x.strokeStyle = t.c;
    x.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = t.r + k * 2.0944;
      x[k ? "lineTo" : "moveTo"](px + Math.cos(a) * s, py + Math.sin(a) * s);
    }
    x.closePath(); x.stroke();
  }

  function dessine() {
    x.clearRect(0, 0, W, H); x.lineWidth = 1;
    for (const t of ambiants) {
      if (!calme) { t.x += t.vx; t.y += t.vy; t.r += t.vr; if (t.y < -10) { t.y = H + 10; t.x = hasard(0, W); } if (t.x < -10) t.x = W + 10; if (t.x > W + 10) t.x = -10; }
      triangle(t, t.x, t.y, t.a);
    }
    if (nuage.length && chapeau) {
      const rc = chapeau.getBoundingClientRect();
      if (rc.bottom > 0) {
        const p = Math.min(1, Math.max(0, -rc.top / Math.max(1, rc.height - H)));
        const rp = portrait.getBoundingClientRect();
        const cx = rp.left + rp.width / 2, cy = rp.top + rp.height * .3;
        const R = rp.width * (.95 - .22 * Math.min(1, p / .72));  /* un halo autour de la tête, qui se resserre quand le chapeau se pose */
        const fond = Math.min(1, rc.bottom / H);
        for (const t of nuage) {
          if (!calme) { t.ang += t.va; t.r += t.vr * 2; }
          const px = cx + Math.cos(t.ang) * t.rho * R * 1.15, py = cy + Math.sin(t.ang) * t.rho * R * .95;
          triangle(t, px, py, t.a * fond * Math.max(.2, 1.3 - t.rho));
        }
      }
    }
    x.globalAlpha = 1;
  }

  let enCours = false;
  function boucle() { dessine(); if (!calme) requestAnimationFrame(boucle); else enCours = false; }
  seme(); boucle();
  let largeur = innerWidth;  /* sur téléphone, la barre d'adresse change la hauteur en défilant : on ne ressème que si la largeur change */
  addEventListener("resize", () => { seme(innerWidth === largeur); largeur = innerWidth; if (calme) dessine(); });
  if (calme) addEventListener("scroll", () => { if (!enCours) { enCours = true; requestAnimationFrame(boucle); } }, { passive: true });
})();

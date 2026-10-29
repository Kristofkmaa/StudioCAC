// La sphère du site (abysse-sphere.js) en fond des pages de la version abysse (tarifs, devis, charte…),
// discrète derrière le texte. C'est la même sphère, à la même place, que dans la transition et sur l'accueil :
// à l'arrivée, la sphère de la plongée se pose sur celle-ci ; au départ, c'est elle qui s'allume avant qu'on plonge.
// Immobile si le visiteur demande moins d'animations ; arrêtée quand l'onglet est caché.
// À inclure au tout début du <body>, après abysse-sphere.js et abysse-transition.js.
(() => {
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  cv.className = "ab-fond"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const sphere = AbysseSphere.create(cv), FORCE = .42;      // assez visible pour l'ambiance, jamais gênante pour lire
  let raf = 0;
  const loop = () => { sphere.draw({ A: FORCE }); raf = requestAnimationFrame(loop); };
  sphere.draw({ A: FORCE });
  addEventListener("resize", () => { sphere.size(); sphere.draw({ A: FORCE }); });
  if (calme) return;
  document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) loop(); });
  loop();
})();

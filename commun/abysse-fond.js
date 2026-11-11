// Le décor du site (abysse-sphere.js : depuis novembre 2026, une galerie marchande en points) en fond des pages de la version abysse (tarifs, devis, charte…),
// discrète derrière le texte. C'est la même sphère, à la même place, que dans la transition et sur l'accueil :
// à l'arrivée, la sphère de la plongée se pose sur celle-ci ; au départ, c'est elle qui s'allume avant qu'on plonge.
// Immobile si le visiteur demande moins d'animations ; arrêtée quand l'onglet est caché.
// À inclure au tout début du <body>, après abysse-sphere.js et abysse-transition.js.
(() => {
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.createElement("canvas");
  cv.className = "ab-fond"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const sphere = AbysseSphere.create(cv), FORCE = .26;      // la galerie reste en fond : assez visible pour l'ambiance, jamais gênante pour lire (les enseignes passent derrière le texte)
  let raf = 0;
  // tant qu'un rideau de transition couvre l'écran, inutile de la dessiner : le navigateur garde ses forces pour la transition
  const loop = () => { if (!AbysseSphere.cachee) sphere.draw({ A: FORCE }); raf = requestAnimationFrame(loop); };
  if (!AbysseSphere.cachee) sphere.draw({ A: FORCE });
  addEventListener("resize", () => { sphere.size(); sphere.draw({ A: FORCE }); });
  if (calme) return;
  document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) loop(); });
  loop();
})();

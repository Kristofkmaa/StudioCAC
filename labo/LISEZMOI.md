# Le labo

Zone d'essais de design : on y teste librement des effets, des bibliothèques et des idées,
sans toucher aux sites clients ni aux démos. Rien ici n'est montré aux clients tant qu'on ne l'a pas décidé.

- Un essai par dossier numéroté (`01-mer/`, `02-…/`), chacun avec son `index.html`, ajouté à la liste de `labo/index.html`.
- Tout est permis : GSAP, Three.js, shaders, et React ou Astro dans un sous-dossier avec sa propre construction si besoin.
- Les bibliothèques sont copiées dans `labo/lib/` (le réseau de la session bloque les CDN) :
  - `gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` : GSAP 3.15, licence « Standard no charge » (gratuite, usage commercial compris).
  - `three.module.js` (+ `three.core.js`) : Three.js r186, licence MIT. `import * as THREE from "../lib/three.module.js"`.
- Deux règles gardées même ici : rien ne défile sur le côté, et l'essai reste lisible sur téléphone et avec « réduire les animations ».
- Pages en `noindex` ; le dossier est exclu de `robots.txt`.
- Un essai réussi qui servirait à un client : on le reprend dans un site, ou on note ce qu'il demanderait (Astro, React…) dans `A-FAIRE.md`.

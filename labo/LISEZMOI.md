# Le labo

Zone d'essais de design : on y teste librement des effets, des bibliothèques et des idées,
sans toucher aux sites clients ni aux démos. Rien ici n'est montré aux clients tant qu'on ne l'a pas décidé.

- Un essai par dossier numéroté (`01-mer/`, `02-…/`), chacun avec son `index.html`, ajouté à la liste de `labo/index.html`.
- Tout est permis : GSAP, Three.js, shaders, et React ou Astro dans un sous-dossier avec sa propre construction si besoin.
- Les bibliothèques sont copiées dans `labo/lib/` (le réseau de la session bloque les CDN) :
  - `gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` : GSAP 3.15, licence « Standard no charge » (gratuite, usage commercial compris).
  - `three.module.js` (+ `three.core.js`) : Three.js r186, licence MIT, avec `three-addons/OrbitControls.js`. Dans la page, une « importmap » : `{"three":"../lib/three.module.js","three/addons/":"../lib/three-addons/"}`.
- Deux règles gardées même ici : rien ne défile sur le côté, et l'essai reste lisible sur téléphone et avec « réduire les animations ».
- Pages en `noindex` ; le dossier est exclu de `robots.txt`.
- Un essai réussi qui servirait à un client : on le reprend dans un site, ou on note ce qu'il demanderait (Astro, React…) dans `ETAT.md` (« À faire »).

## Les versions framework (essais 04 et 05)

- Les sources sont dans `labo/sources/` : `commun/` (les composants React partagés, dont ceux de shadcn/ui et Magic UI pris sur GitHub, et la feuille de styles), `libecciu-astro/` et `libecciu-next/`.
- Pour reconstruire : `cd labo/sources/libecciu-astro && npm install && npm run build` (écrit `labo/04-astro/`), idem dans `libecciu-next` (écrit `labo/05-next/`). Le dossier `commun/` est recopié dans chaque projet avant la construction.
- `node_modules/` n'est pas enregistré dans le dépôt. Le fichier `.nojekyll` à la racine garde les dossiers `_astro/` et `_next/` visibles sur GitHub Pages.
- Le comparatif mesuré est dans `labo/06-comparatif/`.

## Les pièces de la communauté (essai 07)

- `labo/sources/pieces-astro/` : douze composants pris sur GitHub (Magic UI, Motion Primitives, React Bits), rangés par bibliothèque dans `src/communaute/`, chacun essayé dans `src/demos/` pour un métier ; les verdicts sont dans `src/fiches.ts`.
- Reconstruire : `cd labo/sources/pieces-astro && npm install && npm run build` (écrit `labo/07-pieces/`).
- Retouches faites au code récupéré : imports de types TypeScript (`type SpringOptions`…) pour que la construction passe, bouton shadcn remplacé par un simple `<button>` pour Confetti, chemins `@/` remplacés par des chemins relatifs.

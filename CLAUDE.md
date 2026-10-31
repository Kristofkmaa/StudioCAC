# StudioCAC

**Au début de chaque session, lire `ETAT.md`** : où en est le projet, les décisions prises, ce qui est en attente et les pièges de l'environnement. Le mettre à jour quand quelque chose d'important change.

Site statique : `index.html` (écran d'entrée) → `accueil.html` (launcher) + pages `demo-*.html` (vitrines de démo).

## Règle de travail

Après chaque modification, sans attendre de confirmation :
1. `git add -A` puis commit avec un message clair en français.
2. `git push -u origin <branche courante>`.

## Nouveau site (client ou démo) : chacun son style

**Toujours suivre le skill `nouveau-site` (`.claude/skills/nouveau-site/SKILL.md`)** : il enchaîne la charte, le tirage, les skills de design (design-taste-frontend, mobile-native, animate…), les règles apprises, la vérification (`node outils/verifier.js <page> --captures <dossier>`) et l'enregistrement. En résumé :

Avant de construire un site, tirer sa composition pour qu'il ne ressemble pas aux autres :
1. `python3 outils/tirage.py <nom>` (ajouter `--exclure famille=option` pour un choix impossible, par exemple `preuves=citations` sans vrais avis ; `--comme <site>` et `--garder ouverture,rythme` seulement si l'utilisateur demande une ressemblance).
2. Suivre la fiche écrite dans `clients/<nom>/style.md` ; les couleurs, polices et logo viennent de la charte du client. Le code de chaque option est dans `outils/styles/recettes.md`.
3. Une fois le site fait : `python3 outils/tirage.py <nom> --enregistrer` (registre : `outils/styles/registre.json`, catalogue : `outils/styles/catalogue.json`).

Les thèmes (genres) sont dans `commun/themes.json`, la seule base : le devis les montre au client avec un aperçu (`commun/themes.js`), `outils/themes.html` les présente, et le tirage y prend le genre. Nouveau thème : une entrée dans `commun/themes.json` et son dessin dans `commun/themes.js`.
Sites clients : `clients/<nom>/index.html`, non indexés (`noindex`, `robots.txt`).

## Le labo

`labo/` : zone d'essais de design libre (GSAP, Three.js, shaders, React si besoin), hors sites clients. Un essai par dossier numéroté, listé dans `labo/index.html` ; règles dans `labo/LISEZMOI.md`.

## Rien ne défile sur le côté

Sur tous les sites, tout tient dans la largeur de l'écran : pas de bandeau de cartes qui défile, pas de tableau plus large que l'écran. Sur téléphone, un tableau devient une fiche par ligne, une liste longue devient une grille avec des filtres, un calendrier devient des boutons de mois.

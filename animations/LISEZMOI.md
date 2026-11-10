# La banque d'animations

`mouvements.html` : les 100 animations faites par l'utilisateur (50 basiques, 50 premium), dans un seul fichier, sans aucune dépendance. À ouvrir dans un navigateur : il affiche un index filtrable et un menu par métier.

## Comment c'est rangé

- Neuf **packs**, chacun dans un `<template data-pack="…">` qui contient une page complète et autonome (ses styles, son HTML, son script) :
  - tous métiers : `bases` (01 à 44), `bases2` (87 à 92), `premium` (54 à 64), `premium3` (77 à 86), `premium4` (93 à 100) ;
  - par métier : `horlogerie` (45 à 53), `restaurant` (65 à 68), `architecte` (69 à 72), `fleuriste` (73 à 76).
- Dans un pack, chaque animation a sa `<section id>`, son CSS sous le commentaire `/* NN nom */` et son JavaScript sous `// NN nom`.
- `index.json` : la liste des 100 (numéro, pack, section, titre, description, styles, déclencheurs, emplacement). Il est extrait du fichier ; ne pas le modifier à la main.

## Reprendre une animation dans un site

1. Trouver son numéro dans `index.json` (ou dans l'index en tête de `mouvements.html`).
2. Dans son pack, copier sa section, son bloc CSS et son bloc JavaScript, plus les variables `:root` du pack et, si elle suit le défilement, sa part de la boucle `frame()`.
3. La fondre dans le site : couleurs, polices et courbes de la charte, vrai contenu du client, `prefers-reduced-motion` respecté.
4. Rien ne défile sur le côté (règle de `CLAUDE.md`) : les animations 07, 21, 50 et 58 sont à adapter ou à éviter.

Ne pas reprendre le « lanceur » (le dernier script du fichier) : il ne sert qu'à la page de démonstration.

## Mettre la banque à jour

Remplacer `mouvements.html` par la nouvelle version, puis lancer `python3 outils/atelier/construire.py` : il refait `index.json` et la page de l'atelier (à republier ensuite). Pour ajouter un métier : un nouveau `<template data-pack data-name data-group data-range>` dans le fichier, sur le modèle des autres.

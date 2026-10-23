# StudioCAC

Site statique : `index.html` (écran d'entrée) → `accueil.html` (launcher) + pages `demo-*.html` (vitrines de démo).

## Règle de travail

Après chaque modification, sans attendre de confirmation :
1. `git add -A` puis commit avec un message clair en français.
2. `git push -u origin <branche courante>`.

## Nouveau site (client ou démo) : chacun son style

Avant de construire un site, tirer sa composition pour qu'il ne ressemble pas aux autres :
1. `python3 outils/tirage.py <nom>` (ajouter `--exclure famille=option` pour un choix impossible, par exemple `preuves=citations` sans vrais avis ; `--comme <site>` et `--garder ouverture,rythme` seulement si l'utilisateur demande une ressemblance).
2. Suivre la fiche écrite dans `clients/<nom>/style.md` ; les couleurs, polices et logo viennent de la charte du client.
3. Une fois le site fait : `python3 outils/tirage.py <nom> --enregistrer` (registre : `outils/styles/registre.json`, catalogue : `outils/styles/catalogue.json`).
Sites clients : `clients/<nom>/index.html`, non indexés (`noindex`, `robots.txt`).

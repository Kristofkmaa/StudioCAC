# Saitora (dépôt StudioCAC)

Portfolio de sites vitrines pour commerces de proximité, artisans et indépendants.
Site 100 % statique : pas de build, pas de dépendance, chaque page est un fichier HTML autonome (CSS et JS inclus). Seuls les essais du labo en Astro ou Next.js ont une étape de construction, et leur résultat est enregistré dans le dépôt.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Écran d'entrée : le logo en grand, la phrase d'accroche et le bouton pour entrer sur le site. |
| `accueil.html` | Page d'accueil du portfolio (démos, méthode, compris, charte, contact), style « abysse » avec la sphère de particules. |
| `espace-pro.html` | Espace pro (l'ancien accueil) : suivi des sites clients ; ses données restent dans le navigateur. Non indexé. |
| `abysse.css`, `abysse-fin.css`, `abysse-sphere.js`, `abysse-fond.js`, `abysse-transition.js` | Le style « abysse » commun à toutes les pages : couleurs, retouches, la sphère de particules, la sphère en fond, les transitions entre les pages. |
| `tarifs.html` | Tarifs : formules, calcul du coût sur la durée, ce que paie l'abonnement, questions fréquentes. |
| `mentions-legales.html` | Mentions légales et politique de confidentialité (SIRET à ajouter dès l'immatriculation). |
| `cgv.html` | Conditions générales de vente (devis, paiement, rétractation, abonnement, domaine, cession des droits, données des clients, responsabilités). |
| `polices/` | Polices hébergées sur le site, générées par `python3 outils/polices.py` (à relancer si on ajoute une police). |
| `outils/modeles/` | Modèle de mentions légales et liste de vérification pour les sites clients. |
| `404.html`, `robots.txt`, `sitemap.xml` | Page introuvable (servie par GitHub Pages), consignes et plan du site pour les moteurs de recherche. |
| `charte.html` | Outil gratuit de charte graphique en six étapes : couleurs, lettres, logo (lu sur l'appareil ou dessiné sur place, avec ses activités). À la fin, une charte complète en huit chapitres : versions du logo, zone de protection, tailles minimales, interdits illustrés, codes couleurs HEX, RVB et CMJN, lettres, applications, règles. PDF, envoi par e-mail ou ajout au devis. `charte.html?exemple` montre la charte d'Ostrale, une entreprise imaginaire (rien n'est enregistré). |
| `offres.js` | Les formules et leurs prix, lus à la fois par la page Tarifs et par le devis (qui conseille une formule d'après les réponses). Un prix se change ici. |
| `devis.html` | Demande de devis guidée en 5 étapes (activité, besoins, style, situation, coordonnées). Envoi via Formspree si `FORM_ENDPOINT` est renseigné en haut du script de `devis.html` ; sinon (ou en cas d’échec) la messagerie du visiteur s’ouvre avec le récapitulatif pré-rempli vers contact@saitora.fr. `devis.html?style=u-fucone` présélectionne un style. |
| `transition.js` | Transition « chantier » : la page quittée s'efface vers le fond nuit, puis la page se construit en ~1,2 s à chaque affichage (arrivée sur le site, lien, retour/avant, rechargement) (maquette, titres h1/h2 écrits lettre par lettre, textes ligne par ligne, images du flou au net, boutons). Un clic termine l'animation. pour les liens `data-transition`. |
| `demo-*.html` | Une démo de site vitrine par secteur. |
| `demos.html`, `demos.js` | La page de toutes les démos (filtre par famille) et la liste des démos, partagée avec l'accueil (`UNES` : les trois montrées sur l'accueil). |
| `media/showreel-clair.*`, `media/showreel-sombre.*` | Vidéo de présentation de la page d'accueil, une version par thème (MP4 + WebM + image d'attente). |
| `media/apercus/` | Captures des démos affichées dans les cartes de la page d'accueil. |
| `images/<démo>/` | Photos des démos (Pixabay, licence libre, usage commercial autorisé), en WebP, téléchargées par `outils/photos.py` (sources dans `SOURCES.txt`). |
| `outils/video/` | Film de présentation (demande, plan, design, construction, mise en ligne) et script qui en fabrique la vidéo. |
| `favicon.svg` | Icône de la page d'accueil (les démos ont chacune la leur, intégrée). |
| `photos.html` | Guide pour les clients : photographier son commerce au téléphone (règles illustrées, liste des photos selon le métier, envoi). |
| `clients/<nom>/` | Sites des clients (non indexés), chacun avec sa fiche de style `style.md` et, pour les plus avancés, ses notes de travail `NOTES.md`. |
| `saitorapp/`, `outils/saitorapp.py` | Saitorapp, l'appli de gestion à installer sur le téléphone du commerçant, et le script qui la fabrique (voir `saitorapp/LISEZMOI.md`). |
| `themes.json`, `themes.js` | La base des 14 genres (couleurs, polices, recette) et leur aperçu dessiné, montrés dans le devis. |
| `outils/tirage.py`, `outils/styles/` | Le tirage de la composition de chaque site, son catalogue, ses recettes et le registre des sites. |
| `outils/verifier.js` | Vérifie une page : rien ne dépasse, rien ne défile sur le côté, aucune erreur ; captures ordinateur et téléphone. |
| `outils/archives.py` | Images d'archives libres (Wikimedia Commons, Europeana) pour illustrer le monde d'un client. |
| `outils/polices-independantes.html` | Aperçu des polices de fonderies indépendantes (`python3 outils/polices.py libre <code>`). |
| `labo/` | Essais de design (shader, 3D, comparatif HTML / Astro / Next.js, pièces de la communauté, accueils et démos refaits) ; sources dans `labo/sources/`. |
| `ETAT.md` | Où en est le projet, les branches, ce qui est en attente et la liste des choses à faire (à lire au début de chaque session). |

## Ajouter une démo

1. Créer `demo-mon-client.html` (en partant d'une démo existante).
2. Dans son `<head>`, adapter `<title>`, `description`, `og:*`, `theme-color` et le favicon.
3. Ajouter une ligne dans la liste de `demos.js` (nom, secteur, famille, description, nom de fichier) ; l'accueil et `demos.html` la lisent tous les deux.
4. Photos : ajouter ses recherches dans `outils/photos.py`, puis `PIXABAY_API_KEY=… python3 outils/photos.py` (vérifier chaque photo ; pour en changer, modifier la recherche ou son rang puis `python3 outils/photos.py fichier.webp`).
5. Générer ses aperçus (`node outils/apercus.js mon-client`), puis l'ajouter au bas de page de `accueil.html`, au mur de `index.html` et de `outils/partage.html` (puis `node outils/partage.js`), aux styles de `devis.html` et à `sitemap.xml`.

## Régénérer les aperçus des démos

Après avoir modifié une démo : `node outils/apercus.js` (Playwright + ffmpeg).

## Régénérer la vidéo d'accueil

Le film suit la démo La Table du Port : les plans et leurs durées sont dans `SHOTS` de `outils/video/scene.html`, les captures de la démo sont refaites à chaque rendu. Après modification :

```
npm i playwright
node outils/video/render.js
```

Nécessite `ffmpeg`. Produit, pour chaque thème (`clair` et `sombre`), `media/showreel-<thème>.mp4`, `.webm` et `-poster.webp`.

## Voir en local

Ouvrir `index.html` dans un navigateur, ou lancer `python3 -m http.server` puis aller sur http://localhost:8000.

## Mise en ligne

GitHub Pages : Settings → Pages → Source « Deploy from a branch » → choisir la branche et `/ (root)`.
Le fichier `.nojekyll` évite tout traitement Jekyll.

## Image d'aperçu des liens

`images/partage.jpg` (1200 × 630) s'affiche quand on partage le lien du site. Pour la refaire après un changement de démos : `node outils/partage.js` (modèle : `outils/partage.html`).

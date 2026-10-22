# Saitora (dépôt StudioCAC)

Portfolio de sites vitrines pour commerces de proximité, artisans et indépendants.
Site 100 % statique : pas de build, pas de dépendance, chaque page est un fichier HTML autonome (CSS et JS inclus).

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil du portfolio (démos, méthode, contact). L'espace pro `index.html#admin` sert à suivre ses clients ; ses données restent dans le navigateur. |
| `devis.html` | Demande de devis guidée en 5 étapes (activité, besoins, style, situation, coordonnées). Envoi via Formspree si `FORM_ENDPOINT` est renseigné en haut du script de `devis.html` ; sinon (ou en cas d’échec) la messagerie du visiteur s’ouvre avec le récapitulatif pré-rempli vers contact@studiocac.fr. `devis.html?style=villa-oliviers` présélectionne un style. |
| `transition.js` | Transition « chantier » : la page quittée s'efface vers le fond nuit, puis la page se construit en ~1,2 s à chaque affichage (arrivée sur le site, lien, retour/avant, rechargement) (maquette, titres h1/h2 écrits lettre par lettre, textes ligne par ligne, images du flou au net, boutons). Un clic termine l'animation. pour les liens `data-transition`. |
| `demo-*.html` | Une démo de site vitrine par secteur. |
| `media/showreel-clair.*`, `media/showreel-sombre.*` | Vidéo de présentation de la page d'accueil, une version par thème (MP4 + WebM + image d'attente). |
| `media/apercus/` | Captures des démos affichées dans les cartes de la page d'accueil. |
| `images/<démo>/` | Photos des démos (Pixabay, licence libre, usage commercial autorisé), en WebP. |
| `outils/video/` | Film de présentation (demande, plan, design, construction, mise en ligne) et script qui en fabrique la vidéo. |
| `favicon.svg` | Icône de la page d'accueil (les démos ont chacune la leur, intégrée). |

## Ajouter une démo

1. Créer `demo-mon-client.html` (en partant d'une démo existante).
2. Dans son `<head>`, adapter `<title>`, `description`, `og:*`, `theme-color` et le favicon.
3. Ajouter une ligne dans la liste `DEMOS` en bas de `index.html` (nom, secteur, description, `url`, couleurs de l'aperçu).

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

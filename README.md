# StudioCac

Portfolio de sites vitrines pour commerces de proximité, artisans et indépendants.
Site 100 % statique : pas de build, pas de dépendance, chaque page est un fichier HTML autonome (CSS et JS inclus).

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil du portfolio (démos, méthode, contact). L'espace pro `index.html#admin` sert à suivre ses clients ; ses données restent dans le navigateur. |
| `demo-*.html` | Une démo de site vitrine par secteur. |
| `media/showreel.*` | Vidéo de présentation affichée sur la page d'accueil (MP4 + WebM + image d'attente). |
| `outils/video/` | Scène animée (construction de sites clients) et script qui en fabrique la vidéo. |
| `favicon.svg` | Icône de la page d'accueil (les démos ont chacune la leur, intégrée). |

## Ajouter une démo

1. Créer `demo-mon-client.html` (en partant d'une démo existante).
2. Dans son `<head>`, adapter `<title>`, `description`, `og:*`, `theme-color` et le favicon.
3. Ajouter une ligne dans la liste `DEMOS` en bas de `index.html` (nom, secteur, description, `url`, couleurs de l'aperçu).

## Régénérer la vidéo d'accueil

Les clients, leurs besoins et le contenu de leurs sites sont dans la liste `CLIENTS` de `outils/video/scene.html`. Après modification :

```
npm i playwright
node outils/video/render.js
```

Nécessite `ffmpeg`. Produit `media/showreel.mp4`, `media/showreel.webm` et `media/showreel-poster.webp`.

## Voir en local

Ouvrir `index.html` dans un navigateur, ou lancer `python3 -m http.server` puis aller sur http://localhost:8000.

## Mise en ligne

GitHub Pages : Settings → Pages → Source « Deploy from a branch » → choisir la branche et `/ (root)`.
Le fichier `.nojekyll` évite tout traitement Jekyll.

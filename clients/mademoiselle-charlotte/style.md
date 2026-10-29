# Fiche de style : mademoiselle-charlotte

Tirée par `outils/tirage.py` pour que ce site ne ressemble pas aux précédents.
Les couleurs, les polices et le logo viennent de la charte du client ; cette fiche décide de la composition.
Règles communes à tous les sites : page aérée, deux polices de charte (plus la police d'appoint si tirée), photos d'un même ton, une seule idée originale, lisible sur téléphone.
Le code de chaque option est dans outils/styles/recettes.md.

## Genre (il décide de tout le reste) : Magazine éditorial
Grille de 12 colonnes asymétrique, grandes photos pleine largeur, textes en colonnes comme un journal, lettrines, titres très contrastés, légendes en petit sous chaque photo, numéros de rubrique.

## Ouverture : Plein cadre
Une photo occupe tout le premier écran ; le titre est posé en bas à gauche sur un voile sombre limité au coin, la navigation en clair par-dessus.

## Navigation : Barre basse sur téléphone
Sur téléphone, une barre fixe en bas (Appeler, Devis, Plan) ; sur ordinateur, une navigation discrète en haut.

## Services : Tableau de prix
Les services sous forme de tableau clair : service, détail, délai, prix indicatif.

## Réalisations : Avant / après
Une photo coupée en deux par un curseur à faire glisser : avant à gauche, après à droite.

## À propos : Texte et photo
Un paragraphe et trois engagements à côté d'une photo.

## Contact : Bandeau collant
Pas de grande section : un bandeau « Appeler / Devis » qui reste collé en bas de l'écran, et un formulaire court en fin de page.

## Formes : Angles droits
Photos, boutons et cartes à angles droits.

## Photos : Teintées
Photos teintées à la couleur principale de la charte (duotone).

## Rythme des couleurs : Blocs de couleur
Deux ou trois sections entièrement dans la couleur principale ou la couleur des boutons.

## Titres : Avec italique
Un mot de chaque grand titre en italique (si la police le permet).

## Police d'appoint : Italique de titre
L'italique de la police des titres pour les sous-titres et les légendes, comme dans un magazine.

## Texture : Aucune
Des aplats nets, sans texture.

## Arrivée des éléments : Dévoilement
Les photos se dévoilent en douceur (fondu et léger recul), une à une, seulement une fois chargées ; le cadre reste en place.

## Passage entre les sections : Chevauchement
Une photo à cheval entre deux sections, à moitié dans chacune.

## Boutons : Rectangle plein
Boutons rectangulaires pleins, angles droits ou légèrement arrondis.

## Pied de page : Nom géant
Le nom du commerce en très grand sur toute la largeur, coupé par le bas de l'écran.

## Ornement : Grands numéros
Chaque section porte un grand numéro de chapitre pâle en arrière-plan.

## L'idée originale : Comparer
Deux ou trois options côte à côte (formules, matériaux), on coche ce qui compte et la meilleure ressort.

## Polices : Gloock + Schibsted Grotesk
Titres en Gloock, texte en Schibsted Grotesk (style « Élégante » de la charte). Lien Google Fonts pour Gloock, Schibsted Grotesk, puis python3 outils/polices.py.

## Avant de livrer
Mettre le premier écran à côté de ceux des autres sites (media/apercus et clients/*) : s'il ressemble à l'un d'eux, changer ce qui fait la ressemblance.

Attention : proche de villa-oliviers, bois-massif, libecciu, castagnetu, garage-santoni, forza, piazza, bobyshop sur au moins quatre familles.

## Ce qui a vraiment été fait (la fiche DESIGN8 « Swap » passe avant le tirage)

L'utilisateur a donné la fiche de style DESIGN8 (Swap : fond pâle, serif très fine en poids 100, boutons en pilule, cartes blanches à 24 px et ombre douce, un seul dégradé sur les très grands titres). Elle remplace la composition tirée ; le genre « Magazine éditorial » reste (rubriques numérotées, italique dans les titres, pied au nom géant, un bloc de couleur).
- Couleurs : celles du logo à la place du vert d'eau et du citron de la fiche : fond lilas `#F8F1FA`, action en rose `#F4C3DA` avec texte noir, dégradé fuchsia → lilas (`#B4458A` → `#8E68B8` → `#D0709F`) pour les grands titres, bloc prune `#3B2142`, crème `#FBEFE6` du halo du logo.
- Polices : Fraunces (100 et 300, italique 300) à la place de Gloock (pas de poids fin), Schibsted Grotesk gardée.
- Pas de photo plein cadre : les photos viennent des captures de la boutique SumUp (petites), elles sont montrées en cartes.
- Idée vivante : « Broder un prénom », un bavoir dessiné où l'on écrit le prénom (ou un mot corse), choisit la gaze, le fil et le petit signe.

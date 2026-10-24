# Fiche de style : bobyshop

Tirée par `outils/tirage.py` pour que ce site ne ressemble pas aux précédents.
Les couleurs, les polices et le logo viennent de la charte du client ; cette fiche décide de la composition.
Règles communes à tous les sites : page aérée, deux polices de charte (plus la police d'appoint si tirée), photos d'un même ton, une seule idée originale, lisible sur téléphone.
Le code de chaque option est dans outils/styles/recettes.md.

## Genre (il décide de tout le reste) : Sombre cinéma
Fond noir, photos plein cadre très contrastées, titres en très grand qui se superposent aux images, petites capitales, sensation de générique de film.

## Ouverture : Colonne latérale
Le nom, la navigation et le bouton sont dans une colonne fixe à gauche (un tiers de l'écran, couleur principale) ; le contenu défile à droite. Sur téléphone, la colonne devient une barre en haut.

## Navigation : Pilule flottante
Une barre arrondie qui flotte en haut au centre, avec le logo réduit, trois liens et le bouton ; elle reste visible au défilement.

## Services : Sommaire illustré
Une liste de titres à gauche ; au survol ou au toucher, la photo correspondante change à droite.

## Réalisations : Rangée de photos
Trois photos au même format avec une légende.

## À propos : Portrait
Une grande photo de la personne ou de l'atelier, avec trois lignes de présentation posées dessus.

## Contact : Plan et infos
Une carte stylisée du quartier ou de la zone d'intervention, avec l'adresse et les horaires à côté.

## Formes : Angles droits
Photos, boutons et cartes à angles droits.

## Photos : Naturelles
Photos en couleurs, telles quelles.

## Rythme des couleurs : Sombre
Fond sombre (couleur principale très foncée) sur toute la page, texte clair.

## Titres : Géants
Un titre par section en très grand (2 à 3 fois la taille habituelle), qui déborde presque de l'écran.

## Police d'appoint : Aucune
Seulement les deux polices de la charte.

## Texture : Grain de papier
Un léger grain (bruit SVG très discret) sur les fonds clairs, comme du papier.

## Arrivée des éléments : Fondu montant
Les blocs apparaissent en glissant de quelques pixels vers le haut.

## Passage entre les sections : Chevauchement
Une photo à cheval entre deux sections, à moitié dans chacune.

## Boutons : Rectangle plein
Boutons rectangulaires pleins, angles droits ou légèrement arrondis.

## Pied de page : Nom géant
Le nom du commerce en très grand sur toute la largeur, coupé par le bas de l'écran.

## Ornement : Grands numéros
Chaque section porte un grand numéro de chapitre pâle en arrière-plan.

## L'idée originale : Configurateur
On choisit une couleur, une matière ou une forme et l'image change sous les yeux.

## Polices : Bricolage Grotesque + Lato
Titres en Bricolage Grotesque, texte en Lato (style « Chaleureuse » de la charte). Lien Google Fonts dans la page, puis python3 outils/polices.py.

## Avant de livrer
Mettre le premier écran à côté de ceux des autres sites (media/apercus et clients/*) : s'il ressemble à l'un d'eux, changer ce qui fait la ressemblance.

Attention : proche de durand-plomberie, villa-oliviers, bois-massif, libecciu, castagnetu, vitrier-prince, la-grotte-napoleon, garage-santoni, fiori sur au moins quatre familles.

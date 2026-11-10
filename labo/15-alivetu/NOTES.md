# 15 · Alivetu (deuxième site test, 10 novembre 2026)

Suite du labo 14 : l'utilisateur a demandé « un autre » site test et choisi un gîte / maison d'hôtes. Cette fois, seulement des animations
du fichier « Mouvements, 44 animations » qui n'ont pas servi à A Tavulata. Maison imaginaire en Balagne, photos Pixabay (`images/SOURCES.txt`),
textes, prix, téléphone et e-mail d'exemple. Style tiré (`style.md`) : genre « Carnet d'architecte » en version nuit (bleu nuit quadrillé,
trait de crayon rouge, plans au trait avec leurs cotes, surfaces en chiffres, photos dans des cadres blancs), polices Redaction 35 + Redaction.

Les onze animations, chacune sur un vrai contenu :
- 12 écran de chargement : un compteur, puis deux volets qui s'écartent.
- 40 décor en profondeur : l'ouverture, une colline la nuit en couches (étoiles, lune, collines) qui suivent le doigt ; la maison est dessinée au trait avec sa cote d'altitude.
- 16 menu plein écran : s'ouvre en cercle depuis le bouton.
- 08 texte lié au défilement : la grande phrase d'Anna et Paul s'allume mot à mot.
- 22 cartes qui s'empilent : les trois chambres et le gîte (photo encadrée, plan coté dessiné par le script d'après la longueur et la profondeur, surface, prix) ; sur téléphone, de simples cartes l'une sous l'autre.
- 04 chiffres qui comptent : surfaces et chiffres de la maison.
- 23 zoom épinglé : la vue du soir grandit jusqu'à prendre tout l'écran.
- 33 frise qui se remplit : une journée, de 8 h 30 à la table d'hôtes.
- 24 prix à chiffres roulants : on choisit un mois (boutons de mois, les mois fermés barrés), la saison s'affiche et les quatre prix roulent ; le mois en cours est choisi d'office.
- 38 galerie en accordéon : oliviers, piscine, petit-déjeuner, cour (en colonne sur téléphone).
- 31 vagues : le passage vers le bloc clair « nous écrire ».

Écartées : 07 défilement horizontal épinglé (rien ne défile sur le côté), 41 pastille tournante (pas de sceau tournant, règle du skill).
Piège rencontré : `.scene i` attrapait aussi la flèche du bouton (il faut `.scene>i`) ; `.sec{padding:… 0 0}` annulait les marges de `.page`.

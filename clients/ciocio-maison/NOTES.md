# CioCio maison : notes

Site client, maquette à valider. Fiche de l'atelier du 12 novembre 2026. Trois pages : `index.html` (la maison), `histoire.html`, `reserver.html` ;
feuille et script communs `ciocio.css` et `ciocio.js`. Style tiré : `style.md` (genre « fait main »).

## Ce qui est vrai (donné par l'utilisateur)
- Une maison à louer pour l'été, en Corse, vue mer, 4 chambres, 2 étages. Rien d'autre.

## Écarts par rapport au tirage, et pourquoi
- **Pas de sceau tournant** (ornement tiré) ni de petits dessins au trait : contraire aux règles de toujours (pas d'habillage « IA », pas d'illustration figurative).
- **Pas de section « paroles de clients »** (tirée) : le client a de vrais avis, mais ils ne sont pas encore fournis. À ajouter dès qu'on les a ; aucun avis inventé. À la place, quatre faits sur la maison.
- **Arrivée des éléments** : le tirage disait « calme », la fiche impose huit animations (02, 19, 23, 26, 33, 40, 58, 82) : elles priment.
- **58 Carrousel cylindrique** adapté : le cylindre tourne dans son cadre (flèches, doigt, clavier), rien ne défile sur le côté.
- **40 Décor en profondeur** : lié au défilement seulement (pas à la souris), très doux, selon la règle sur les mouvements.
- Écriture à la main (Caveat) : deux fois par page au plus.

## L'adresse « site actuel » de la fiche est fausse
La fiche donnait https://n3egraphics.com/ : c'est le site de N3E Graphics, sans rapport avec la maison (reste d'une saisie précédente dans l'atelier). Rien n'en a été repris.

## Photos
Aucune photo du client, et aucun accès aux banques ni aux archives depuis cet environnement (pas de clé Pixabay, Wikimedia non autorisé).
Les six images de `images/` sont des photos Pixabay déjà présentes dans le dépôt, marquées « Photo d'exemple » sur la maquette : **toutes à remplacer par les photos de la maison**.
La photo de la vue sert trois fois (ouverture, « la mer depuis la maison », tour) faute d'une autre grande image.

## À valider avec le client (tout ce qui est inventé pour la maquette)
- Le lieu exact (commune), la distance à la plage, les commerces, le stationnement.
- La capacité (« huit couchages »), les lits, le nombre de salles d'eau, la répartition des pièces par étage, le barbecue.
- Les prix (220 € la nuit en juin et septembre, 320 € en juillet, 360 € en août), les règles (samedi à samedi en juillet et août, trois nuits minimum sinon), l'acompte, la caution, le ménage, le Wi-Fi, les heures d'arrivée et de départ.
- Le calendrier : les semaines « déjà prises » sont tirées au hasard pour la maquette (`ciocio.js`, fonction `prise`). À brancher sur le vrai calendrier (fichier tenu à la main, ou calendrier d'Airbnb / Booking en .ics).
- L'histoire : les quatre dates, le récit, et d'où vient le nom « CioCio ».
- Le téléphone (04 00 00 00 00 est un numéro d'exemple) et l'adresse e-mail où envoyer les demandes : les formulaires n'envoient rien pour l'instant.
- Les vrais avis des clients.

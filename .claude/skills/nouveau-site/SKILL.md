---
name: nouveau-site
description: La méthode Saitora pour créer ou refaire un site, client ou démo, du lien de charte jusqu'à la mise en ligne. Elle enchaîne la charte, le tirage du style, les skills de design et de téléphone, les règles apprises au fil du travail, les vérifications et l'enregistrement. À utiliser dès qu'on construit, refait ou retouche en profondeur un site (« fais-moi le site de… », « refais la démo… », un lien de charte reçu par le devis).
---

# Créer un site Saitora

Tout ce qui a été appris depuis le début, dans l'ordre où on s'en sert. Chaque étape compte : sauter la vérification ou le tirage a déjà donné des sites qui se ressemblent ou qui cassent sur téléphone.

## 1. Partir de ce qui est vrai

- **Le lien de charte** (reçu par le devis, `charte.html?voir=<base64>`) : décoder le paramètre `voir` (base64url d'un JSON) pour avoir le nom, l'activité, les couleurs (principale, fond, boutons), le style de titres, l'ambiance, le logo. Les couleurs et le logo du client priment sur tout.
- **Le logo** : s'il est fourni en image, le détourer proprement (fond retiré, couleurs pleines), en faire une version claire et une version foncée dans `clients/<nom>/images/`.
- **Les photos** : celles du client d'abord (lui envoyer le guide `photos.html?metier=<métier>`). Ensuite les **archives libres** de son monde, sa ville, sa rue, son métier autrefois : `python3 outils/archives.py cherche "<lieu> carte postale" --planche <fichier>` (Wikimedia Commons et Europeana, seulement les licences commerciales), puis `prends` ; une vieille carte postale de la rue en grand, une carte ancienne pour le plan d'accès. Crédit en pied de page (`archives.py credits`). Pixabay en dernier (`outils/photos.py`, clé dans la variable `PIXABAY_API_KEY`, jamais écrite dans le dépôt ni dans la conversation), un même ton pour toutes, créditées en pied de page. Jamais une photo présentée comme celle du client si ce n'en est pas une.
- **Les données personnelles** de la personne qui a fait la demande (nom, téléphone, e-mail) ne vont jamais sur le site.
- Ce qui manque (plats, prix, horaires) : des exemples plausibles, signalés « à valider » sur la maquette et dans le compte rendu. Jamais de faux avis ni de faux chiffres d'entreprise.

## 2. Tirer le style (pour qu'il ne ressemble à aucun autre)

```bash
python3 outils/tirage.py <nom> --charte <style des titres de la charte> --exclure preuves=citations   # pas d'avis réels
```
- Le **genre** (thème) passe en premier et décide de tout : il vient de `themes.json`. Si le client a choisi un style dans le devis, `--imposer genre=<id>`. S'il demande une ressemblance : `--comme <site> --garder …`. Pour refaire un site : `--refaire`.
- Imposer l'**idée originale** (`signature=`) quand une s'impose pour le métier (créneaux pour un institut, zone pour un dépanneur…), et `photos=naturelles` pour la nourriture.
- Suivre la fiche `clients/<nom>/style.md`, le code des options est dans `outils/styles/recettes.md`.

## 3. Charger les skills avant d'écrire

- **design-taste-frontend** : l'inventaire de ce qui n'appartient qu'à ce client (nom, lieu, rituel, objets), l'idée qui en sort, les textes écrits avant le code, une page pleine (pas de sections vides), le regard sur les captures.
- **mobile-native** : pas de 100vh qui saute, champs à 16 px, zones de toucher de 44 px, barre du bas qui ne cache rien.
- **animate** et **animation-performance** pour tout mouvement ; **emil-design-eng** pour les finitions ; **break-ui** si la page affiche des données variables (longs noms, listes vides).

## 4. Construire : les règles apprises

- **Sobre et classe, jamais fouillis** : peu d'éléments, de l'air, une idée forte. Original oui, chargé non. Il faut donner envie.
- **Une identité par site** : ses couleurs, ses polices, sa composition. Mettre son premier écran à côté des autres (`media/apercus/`) : s'il ressemble à un autre, changer ce qui fait la ressemblance.
- **Une seule idée vivante** par site (ce que le visiteur peut faire), faite avec le vrai contenu du métier.
- **Rien ne défile sur le côté** : un tableau devient une fiche par ligne sur téléphone, une liste de cartes une grille avec filtres, un calendrier des boutons de mois.
- **Photos qui arrivent** : en opacité et légère échelle, seulement une fois l'image chargée et visible (IntersectionObserver + `img.decode()`). Jamais de clip-path.
- **Barre collante du bas** (Appeler / Réserver) : cachée tant que le premier écran est visible, pour ne pas masquer ses boutons.
- **En-tête** : symétrique ou franchement aligné, jamais des liens collés aux bords loin du logo ; pas deux fois le même symbole (logo et couronne) l'un sous l'autre.
- **Grands titres en capitales** (Anton, Bodoni…) : vérifier que les accents (É, Ê) ne touchent pas la ligne du dessus ; interligne 1,1 ou plus si besoin. Pas de mot coupé (« jet- / skis ») ni de chiffre séparé de son unité : `&nbsp;`.
- **Polices** : lien Google Fonts dans la page, puis `python3 outils/polices.py` pour les héberger sur le site.
- **Sites clients** : `clients/<nom>/index.html`, `noindex`, bandeau « maquette à valider ». Démos : `demo-<nom>.html`, bandeau « site de démonstration ».

## 5. Vérifier avant de livrer

```bash
NODE_PATH=<dossier où playwright est installé>/node_modules node outils/verifier.js <page.html> --captures <dossier de travail>
```
- Le résultat doit être « Tout est bon » : rien ne dépasse, rien ne défile, aucune erreur, à 360, 390, 768 et 1440 px.
- **Regarder les captures** ordinateur et téléphone, de haut en bas, comme un client exigeant : titres coupés, textes qui se chevauchent, trous, photos floues ou mal cadrées, boutons cachés. Corriger, revérifier.

## 6. Enregistrer et livrer

```bash
python3 outils/tirage.py <nom> --enregistrer
```
- Pour une démo : mettre à jour sa carte dans `accueil.html` (couleurs, texte), refaire les aperçus (`node outils/apercus.js <nom>`), l'image de partage si besoin (`node outils/partage.js`), et son exemple dans `themes.json`.
- Commit en français, push (règle de CLAUDE.md).
- Compte rendu en français : l'adresse du site, ce qui le rend unique, ce qui est à valider avec le client, et les captures.

# Où on en est (à lire au début de chaque session)

Mis à jour le 31 octobre 2026 (dépôt nettoyé, notes rangées). Ce fichier remplace l'historique des discussions : il dit ce qui existe, ce qui a été décidé et ce qui reste à faire, **en résumé**. Le détail de chaque site est dans son dossier (`clients/<nom>/NOTES.md`, `labo/<essai>/NOTES.md`, `saitorapp/LISEZMOI.md`).
Les règles de travail sont dans `CLAUDE.md`, le rôle de chaque fichier dans `README.md`.

## Saitora en deux lignes

Site de l'utilisateur (saitora.fr, GitHub Pages). Il vend des sites vitrines aux commerçants et artisans corses.
Le site : écran d'entrée (`index.html`), accueil (`accueil.html`), toutes les démos (`demos.html`), tarifs, devis guidé, outil de charte, guide photo, démos, sites clients et le labo.

## Branches

- `claude/amazing-allen-r6m4us` : **la branche publiée** (saitora.fr) et la branche par défaut du dépôt.
- `claude/saitora-community-components-fpr0c9` : la branche de travail. Elle a de l'avance sur la publiée : **l'accueil à trois démos et `demos.html`, `outils/saitorapp.py`, `saitorapp/LISEZMOI.md` ne sont pas encore en ligne** (en attente de l'accord de l'utilisateur). Un site client se publie seul : on copie son dossier (et `ETAT.md`) dans un arbre de la branche publiée, on envoie, puis on fusionne la branche publiée dans la branche de travail.
- L'ancienne branche `claude/festive-ptolemy-h2752z` (démos du 23 octobre, toutes refaites depuis) est à supprimer : la session n'a pas le droit de supprimer une branche ni de créer une étiquette (refus 403), l'utilisateur la supprime lui-même sur GitHub (page Branches, icône corbeille).

## Ce qui existe

- **13 démos** `demo-*.html`, chacune dans un genre différent (14 genres dans `themes.json`, dessinés par `themes.js`). La liste est dans `demos.js` (partagée par l'accueil et `demos.html`) ; l'accueil n'en montre que trois (A Funtana, U Fucone, Atelier Bois Massif, liste `UNES`), avec « Voir les treize démos ».
- **Sites clients** dans `clients/` (non indexés) :
  - **La Grotte Napoléon** (`la-grotte-napoleon/`, site du père de l'utilisateur, **en ligne pour test** sur https://saitora.fr/clients/la-grotte-napoleon/ et en page privée Claude https://claude.ai/artifact/FUf2dVq3CJkFbwXnM9XknB, à republier après chaque changement). Accueil : Napoléon enfant qui devient l'Empereur (bouton « Découvrir »), séance, à table, enfance, film, formules en trois médaillons, avis, boutique, venir. Boutique avec la couronne de laurier, 20 souvenirs, fiches produits et panier (paiement pas encore branché). Réservation sur `reserver.html` avec un calendrier comme l'ancien site (places d'exemple). Six langues, la langue suit de page en page. **Tout le détail, les essais refusés et ce qui reste à valider avec le père : `clients/la-grotte-napoleon/NOTES.md`.**
  - **Mademoiselle Charlotte** (`mademoiselle-charlotte/`, **en ligne** sur https://saitora.fr/clients/mademoiselle-charlotte/) : créations brodées pour bébé, fiches produits, note de commande à coller sur sa boutique SumUp. Détail : `clients/mademoiselle-charlotte/NOTES.md`.
  - **Bobyshop** (`bobyshop/`, un ami qui a testé le devis) et **Vitrier Prince** (`vitrier-prince/`).
- **Saitorapp** (`saitorapp/`, non indexée, **en ligne pour test** sur https://saitora.fr/saitorapp/) : une appli par site, faite pour son métier (boutique, institut / coiffeur, hébergement), que le commerçant installe sur son téléphone. Style des applis Fuse et Ro (Mobbin) ; le style Fitness d'Apple a été refusé. Fabriquée par `python3 outils/saitorapp.py` depuis `saitorapp/sites.json`. Démos : Mademoiselle Charlotte, A Funtana, U Fucone ; données dans le navigateur. Prochaine étape : Supabase (compte à créer par l'utilisateur), connexion par e-mail, notifications. Détail : `saitorapp/LISEZMOI.md`.
- **Méthode pour créer un site** : skill `.claude/skills/nouveau-site/SKILL.md` (toujours la suivre) : charte, tirage (`outils/tirage.py`), skills de design, règles apprises, vérification, enregistrement.
- **Outils** (`outils/`) :
  - `tirage.py` : composition unique par site. Avec `--charte <style>`, il tire aussi la paire de polices, dont des polices indépendantes.
  - `verifier.js` : débordements, « rien ne défile sur le côté », erreurs, captures.
  - `polices.py` : héberge les polices Google ; `polices.py libre <code>` héberge une police indépendante récupérée par npm (Bagnard, Redaction, Uncut Sans…). Aperçu : `outils/polices-independantes.html`.
  - `archives.py` : images d'archives libres (Wikimedia Commons, Europeana). **Jamais testé en vrai** : le réseau de la session bloque ces sites.
  - `photos.py` : Pixabay (clé dans la variable `PIXABAY_API_KEY`, jamais écrite nulle part).
  - `saitorapp.py` : fabrique les applis Saitorapp.
- **Guide photo pour les clients** : `photos.html` (`photos.html?metier=Restaurant`), relié depuis la charte et la fin du devis.
- **Le labo** (`labo/`, non indexé, règles dans `labo/LISEZMOI.md`) : 01 la mer en shader ; 02 la Corse en 3D ; 04 et 05 Libecciu en Astro et en Next.js ; 06 le comparatif mesuré ; 07 douze composants de la communauté essayés ; 10 l'accueil « abysse » (devenu le vrai) ; 11 A Funtana en papier ; 12 U Fucone (devenue une vraie démo, détail dans son `NOTES.md`). Supprimés : 03 configurateur et 09 parchemin (abandonnés, 31 octobre 2026), 13 Bois Massif façon ORYZO, l'essai Garage Santoni en Caldera.

## Décisions prises

- **Style du site Saitora : « abysse »**, inspiré de la fiche Refero d'Auros, avec sa palette d'origine (essayée en bleu et corail, puis remise en vert à la demande de l'utilisateur) : vert d'eau profonde `#012624`, surfaces `#003734`, texte `#EDFFFE` / `#BBC7C6`, rose `#FDE9FF` pour les chiffres, dégradé « aurore » (aqua → rose) pour le bouton principal. Police Inter Tight (poids 500 pour les titres).
  - Fichiers communs : `abysse.css` (couleurs ; l'ancien `theme.css` a été supprimé), `abysse-fin.css` (retouches), `abysse-sphere.js` (**une seule sphère de particules pour tout le site** : même taille, mêmes points, rotation réglée sur l'horloge pour qu'elle reprenne sa position d'une page à l'autre), `abysse-fond.js` (la sphère en fond des pages, à 42 %), `abysse-transition.js` (transitions).
  - `index.html` (entrée : grand logo, « Saitora » dont les moitiés arrivent des deux côtés) et `accueil.html` (titre géant qui arrive des deux côtés, chiffres, démos, méthode, compris, charte, contact) sont écrits à la main ; plus de carte des villes, de filtres de métiers ni de bloc « À propos », plus de mention « Ajaccio » ni « Corse » visible (elles restent dans les CGV, les mentions légales et la fiche invisible pour Google).
  - Transitions : entrée → accueil, on plonge au centre de la sphère et l'accueil recule depuis l'intérieur de la sienne ; entre les autres pages, la « mini-plongée ». Le changement de page se fait sur un écran uni (l'arrêt du navigateur ne se voit pas), la page suivante est préchargée dès qu'on touche le lien, elle arrive **toujours tout en haut**, et **on ne peut pas défiler pendant la transition**. Essayés puis écartés : le disque qui s'ouvre au doigt, les deux volets (« pas l'ADN du site »).
  - Lettres en contour : police `Inter Tight Contour` (`polices/inter-tight-500-contour-latin.woff2`, sans chevauchement de contours, fabriquée par `outils/police_contour.py`).
  - Plus de bouton clair / sombre : le site est toujours sombre.
  - Menu du téléphone (accueil) : en-tête identique à celui de la page (le bouton « Menu » devient « Fermer »), liens en grandes lignes numérotées avec flèche, qui entrent de la gauche et de la droite ; devis et contact en bas. Plus d'étiquette « Saitora · sites vitrines sur mesure » au-dessus du grand titre.
  - **Espace pro** : l'ancien accueil est gardé tel quel dans `espace-pro.html` (non indexé, exclu de `robots.txt`), il s'ouvre directement sur « Mes sites clients ».
  - `404.html` et `espace-pro.html` ont aussi les couleurs abysse (la 404 avec la sphère en fond et la transition ; l'espace pro sans sphère, c'est un outil).

- **Les vitrines restent en HTML** : c'est le plus rapide sur téléphone (comparatif labo 06 : HTML ≈ 4 Ko de script, Astro 117 Ko, Next.js 236 Ko ; page utilisable en 2,5 s, 3,3 s et 3,9 s).
- **Astro** pour un site qui a besoin de beaucoup de pièces vivantes de la communauté. **Next.js** seulement pour de vraies applications (espace client, boutique sur mesure).
- **Pièces de la communauté jugées « à brancher »** (labo 07) : titre mot à mot, avant / après à glisser, tampon qui tourne, surligneur, fiche qui s'ouvre depuis sa photo. **À éviter** : effets qui ne marchent qu'à la souris (bouton aimanté, cartes à halo), confettis.
- **DESIGN.md** (format de Google) : on n'a pas copié la collection de getdesign.md (styles de marques connues). Idée possible : écrire un DESIGN.md par client à partir de sa charte. Pas fait.
- **Boutique en ligne : Stripe, choisi par l'utilisateur le 29 octobre 2026.** Notre propre système (panier du site, Stripe Checkout hébergé, Supabase pour commandes et stock, confirmation par webhook côté serveur, e-mails, factures numérotées, commandes dans Saitorapp) plutôt que WooCommerce ; Shopify seulement pour un gros catalogue. Le compte Stripe est **au nom du commerçant** : la commission (≈ 1,5 % + 0,25 € par carte européenne) est prélevée sur ses ventes, Saitora ne touche jamais l'argent (sinon Saitora deviendrait le vendeur). Option plus tard : Stripe Connect pour une part par vente, à écrire dans le contrat. Obligations à couvrir : mentions légales, CGV (rétractation 14 jours, sauf produits personnalisés L221-28), bouton « Commander avec obligation de paiement », récapitulatif et confirmation par e-mail, médiateur de la consommation, RGPD, « TVA non applicable, art. 293 B du CGI » pour une micro ; CGV à faire relire une fois. Premier cas prévu : Mademoiselle Charlotte.

## En attente

- **Grotte Napoléon, réservations réelles** : le père a un système relié à Booking. Booking n'a pas de module pour les sites ; il faut passer par son gestionnaire de réservations (Bókun, Regiondo, FareHarbor, Rezdy…) qui synchronise les places partout. L'utilisateur se renseigne sur l'outil ; ensuite brancher le calendrier de `reserver.html` dessus (places en direct, réservations envoyées à l'outil ; le paiement des séances passera peut-être par lui, Stripe resterait pour la boutique). `napoleon1769.corsica` est bloqué par le réseau de la session.
- **Grotte Napoléon, boutique** : Stripe, frais de livraison, conditions de vente des produits (rétractation 14 jours), textes à valider par le père (liste dans `clients/la-grotte-napoleon/NOTES.md`).
- **Publier le reste de la branche de travail** (accueil à trois démos, `demos.html`) quand l'utilisateur le demande.
- **Bobyshop** : fait comme une boulangerie « pains du monde » d'après sa charte, alors que son devis disait AXI, restaurant / bar / café. À réorienter quand l'utilisateur saura la vraie activité de son ami.
- **Charte** (`charte.html`) : elle garde en mémoire les réponses d'un ancien essai (localStorage). Correction proposée, pas encore demandée.
- **Labo 08** (demandé, en pause, pas construit) : les pièces « à brancher » dans de vraies démos en Astro ; sources commencées dans `labo/sources/demos-astro/`.
- **Idées de thème pour le site de Saitora** : la rue commerçante (devantures dessinées en SVG, la préférée), l'atelier d'imprimeur, le plan d'architecte, la chambre noire.
- **Refero** (`styles.refero.design`) est bloqué par le réseau : l'utilisateur colle les fiches dans la discussion.

## À faire avant le premier vrai client (ancien `A-FAIRE.md`)

Administratif :
- [ ] Obtenir le SIRET, puis compléter `mentions-legales.html` (éditeur, responsable de la publication, mention « EI ») et ajouter la mention de TVA à côté des prix (`tarifs.html`, `devis.html`), par exemple « TVA non applicable, article 293 B du CGI » en micro-entreprise.
- [ ] Adhérer à un médiateur de la consommation (CM2C, Medicys…) et l'indiquer à l'article 13 de `cgv.html`.
- [ ] Faire relire `cgv.html` (expert-comptable, juriste ou CCI de Corse). Paiement de la création : 50 % à la signature, 50 % à la mise en ligne.
- [ ] Souscrire une assurance responsabilité civile professionnelle.
- [x] Boîte contact@saitora.fr créée.

Technique :
- [x] Formulaire Formspree branché sur `devis.html` (demandes reçues sur contact@saitora.fr).
- [ ] GitHub Pages : activer « Enforce HTTPS ».
- [ ] OVH : vérifier que l'entrée CNAME est bien `www` (et non `ftp`).
- [ ] Google Search Console : déclarer saitora.fr et envoyer `https://saitora.fr/sitemap.xml`.
- [ ] Créer la fiche Google Business Profile de Saitora (Ajaccio).
- [ ] Mesure d'audience sans cookies (Plausible ou GoatCounter), si besoin.

Idées :
- [ ] Une démo de boutique qui expédie (épicerie fine corse, Stripe en mode test), puis une offre « Boutique » dans les tarifs et le devis.
- [ ] Lien de reprise de la charte graphique (la retrouver sur un autre appareil, sans compte).
- [ ] Remplacer les démos par de vraies réalisations (avant / après) et ajouter de vrais avis clients.
- [ ] Espace client, quand il y aura une quinzaine d'abonnés (portail Stripe et formulaire de demandes).

## Pièges connus de l'environnement

- **Réseau de la session :**
  - Passent : npm, PyPI, raw.githubusercontent.com, fonts.googleapis.com, lagrottenapoleon.fr.
  - Bloqués : saitora.fr, napoleon1769.corsica, pixabay.com (en dehors de l'API avec clé), Wikimedia, Europeana, Fontshare, Velvetyne, cdn.jsdelivr.net, unpkg.com. On peut les autoriser dans les réglages réseau de l'environnement (claude.ai/code).
  - Le serveur GitHub (MCP) se connecte parfois ; les envois passent toujours par `git push`.
- **Vérifier une page :** `CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome node outils/verifier.js <page> --captures <dossier>` (le chemin de Chromium change selon la session : `ls /opt/pw-browsers`). Pour le WebGL dans des captures, lancer Chromium avec `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- **Révélations au défilement :** le vérificateur ajoute la classe `on` aux éléments `.rise,.ph,.rideau,.curtain,.zoom,.words`. Dans les pages, utiliser ces classes (pas `.rv`/`.in`), sinon les captures sont vides.
- **Astro et Next.js écrivent des dossiers `_astro/` et `_next/` :** le fichier `.nojekyll` à la racine doit rester.
- **Images appelées par leur nom dans le JavaScript** (`tige-${k}.webp`, aperçus des démos, showreel) : avant de supprimer une image « inutilisée », ouvrir toutes les pages et relever les fichiers manquants.

## Règles qui ne changent pas

- Après chaque modification : commit en français et envoi sur la branche, sans demander (`CLAUDE.md`).
- Rien ne défile sur le côté, sur aucun site.
- Jamais de données personnelles des demandeurs (noms, téléphones, e-mails reçus par le devis) sur un site.
- Jamais l'e-mail personnel de l'utilisateur sur le site (seulement contact@saitora.fr).
- Jamais de clé (Pixabay ou autre) dans le dépôt ni dans la conversation.
- Jamais de faux avis, de faux clients ou de fausses preuves.
- On parle à l'utilisateur en français simple, sans jargon.

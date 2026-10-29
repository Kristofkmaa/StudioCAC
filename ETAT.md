# Où on en est (à lire au début de chaque session)

Mis à jour le 29 octobre 2026 (site passé en style « abysse »). Ce fichier remplace l'historique des discussions : il dit ce qui existe, ce qui a été décidé et ce qui reste à faire.
Les règles de travail sont dans `CLAUDE.md`, le détail des fichiers dans `README.md`, les tâches administratives dans `A-FAIRE.md`.

## Saitora en deux lignes

Site de l'utilisateur (saitora.fr, GitHub Pages, branche `claude/amazing-allen-r6m4us` = branche publiée). Il vend des sites vitrines aux commerçants et artisans corses.
Le site : écran d'entrée (`index.html`), accueil (`accueil.html`), tarifs, devis guidé, outil de charte, guide photo, démos, sites clients et le labo.

## Ce qui existe

- **13 démos** `demo-*.html`, chacune dans un genre différent (14 genres dans `themes.json`, dessinés par `themes.js`). Toutes passent la vérification.
- **Sites clients** dans `clients/` (non indexés) : `bobyshop`, `la-grotte-napoleon`, `masterhotel`, `vitrier-prince`.
- **Méthode pour créer un site** : skill `.claude/skills/nouveau-site/SKILL.md` (toujours la suivre). Elle enchaîne la charte, le tirage (`outils/tirage.py`), les skills de design, les règles apprises, la vérification et l'enregistrement.
- **Outils** (`outils/`) :
  - `tirage.py` : composition unique par site. Avec `--charte <style>`, il tire aussi la paire de polices, dont des polices indépendantes.
  - `verifier.js` : débordements, « rien ne défile sur le côté », erreurs, captures.
  - `polices.py` : héberge les polices Google ; `polices.py libre <code>` héberge une police indépendante récupérée par npm (Bagnard, Redaction, Redaction 35, Bluu Next, Apfel Grotezk, Cooper Hewitt, Uncut Sans, League Mono). Aperçu : `outils/polices-independantes.html`.
  - `archives.py` : images d'archives libres (Wikimedia Commons, Europeana, licences commerciales uniquement). **Jamais testé en vrai** : le réseau de la session bloquait ces sites.
  - `photos.py` : Pixabay (clé dans la variable `PIXABAY_API_KEY`, jamais écrite nulle part).
- **Guide photo pour les clients** : `photos.html` (`photos.html?metier=Restaurant`), relié depuis la charte et la fin du devis.
- **Le labo** (`labo/`, non indexé, règles dans `labo/LISEZMOI.md`) :
  - 01 la mer en shader (WebGL) ;
  - 02 la Corse en 3D (Three.js, vrai contour, relief reconstitué) ;
  - 03 configurateur « Votre site, en direct ». L'utilisateur l'a jugé « juste des copies des styles » ; il faudrait le refaire avec le tirage et les photos du client, ou l'abandonner (pas encore décidé).
  - 04 et 05 : Libecciu refait en Astro et en Next.js ;
  - 06 : le comparatif mesuré ;
  - 07 : douze composants de la communauté (Magic UI, Motion Primitives, React Bits) essayés dans Astro, avec un verdict pour chacun.
  - 08 (en pause, pas encore construit) : les pièces « à brancher » dans de vraies démos en Astro (avant / après sur Durand Plomberie, fiche qui s'ouvre sur la carte de La Table du Port, tampon qui tourne sur Au Pain Doré). Sources commencées dans `labo/sources/demos-astro/`.
  - 09 : l'accueil de Saitora en « parchemin et sphère », d'après la fiche Refero OFF+BRAND (papier `#E5E4E0`, encre `#1D1D1D`, police Uncut Sans, une sphère dégradée). En attente de l'avis de l'utilisateur avant de remplacer `accueil.html`.
  - 10 : l'accueil de Saitora en « abysse », d'après la fiche Auros (vert d'eau profonde, Inter Tight, sphère de particules en canvas, titre géant « Votre vitrine, ouverte jour et nuit. » dont les lignes arrivent de la gauche et de la droite puis repartent au défilement, chiffres qui comptent, carte des villes). Même attente que le 09.
  - Les essais 09 et 10 sont aussi publiés en page privée claude.ai pour être vus sans la branche publiée.
  - 11 : la démo A Funtana refaite selon la fiche OFF+BRAND (papier `#E5E4E0`, encre, filets, Uncut Sans seule), même contenu que la démo en ligne ; 2e version après avis de l'utilisateur (« trop chargé ») : 5 sections au lieu de 8, ouverture épurée, puis 3e version : à la place de la bulle, 2 à 3 bulles de savon WebGL aux vraies couleurs de film de savon (interférences calculées selon l’épaisseur du film, qui coule vers le bas et tourbillonne ; presque transparentes au centre, couleurs sur le bord, fin liseré, reflet de fenêtre ; chacune son couloir) qui montent en se balançant et éclatent en gouttelettes avec un anneau, une nouvelle repart du bas, un toucher en fait éclater une ; sur téléphone elles restent dans la moitié haute, au-dessus du titre ; repli CSS sans WebGL, immobiles si l’animation réduite est demandée. Fiche de tirage : `labo/11-funtana-papier/style.md` (genre « grille suisse » imposé, la fiche OFF+BRAND passe avant le tirage). En attente de l'avis de l'utilisateur avant de remplacer `demo-a-funtana.html` (puis `tirage.py a-funtana --enregistrer`, aperçus, carte de l'accueil, `themes.json`).
  - Essai Garage Santoni en style Caldera : fait puis supprimé à la demande de l'utilisateur (« pas beau »).
- **Le site Saitora est en style « abysse » depuis le 29 octobre 2026** (voir plus bas). L'ancien style clair / sombre reste dans l'historique git (commit `17f11b9` et avant).

## Décisions prises

- **Style du site Saitora : « abysse »**, inspiré de la fiche Refero d'Auros, avec sa palette d'origine (essayée en bleu et corail, puis remise en vert à la demande de l'utilisateur) : vert d'eau profonde `#012624`, surfaces `#003734`, texte `#EDFFFE` / `#BBC7C6`, rose `#FDE9FF` pour les chiffres, dégradé « aurore » (aqua → rose) pour le bouton principal. Police Inter Tight (poids 500 pour les titres).
  - Fichiers communs : `abysse.css` (couleurs, mêmes noms de variables que `theme.css`), `abysse-fin.css` (retouches), `abysse-sphere.js` (**une seule sphère de particules pour tout le site** : même taille, mêmes points, rotation réglée sur l'horloge pour qu'elle reprenne sa position d'une page à l'autre), `abysse-fond.js` (la sphère en fond des pages, à 42 %), `abysse-transition.js` (transitions).
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
- **Boutique en ligne** : plan en trois niveaux noté dans `A-FAIRE.md` (commande à retirer → Stripe → Shopify). Rien à faire tant qu'aucun client ne la demande.

## En attente

- **Bobyshop** (`clients/bobyshop/`, site d'un ami qui a testé le devis) : fait comme une boulangerie « pains du monde » d'après sa charte, alors que son devis disait AXI, restaurant / bar / café. À réorienter quand l'utilisateur saura la vraie activité de son ami.
- **Charte** (`charte.html`) : elle garde en mémoire les réponses d'un ancien essai (localStorage). Correction proposée, pas encore demandée.
- **Labo 03** : refaire ou abandonner (voir plus haut).
- **Labo 08** : demandé par l'utilisateur, en pause (voir plus haut).
- **Refero** (`styles.refero.design`) est bloqué par le réseau : l'utilisateur colle les fiches dans la discussion.
- **Idées de thème pour le site de Saitora** proposées : la rue commerçante (devantures dessinées en SVG, la préférée), l'atelier d'imprimeur, le plan d'architecte, la chambre noire (ORYZO + la Corse en 3D).

## Pièges connus de l'environnement

- **Réseau de la session :**
  - Passent : npm, PyPI, raw.githubusercontent.com, fonts.googleapis.com.
  - Bloqués : saitora.fr, pixabay.com (en dehors de l'API avec clé), Wikimedia, Europeana, Fontshare, Velvetyne, bencho.dev, getdesign.md, cdn.jsdelivr.net, unpkg.com, l'API GitHub. On peut les autoriser dans les réglages réseau de l'environnement (claude.ai/code).
  - Le serveur GitHub (MCP) ne se connecte pas.
- **Vérifier une page :** `CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node outils/verifier.js <page> --captures <dossier>`. Pour le WebGL dans des captures, lancer Chromium avec `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- **Révélations au défilement :** le vérificateur ajoute la classe `on` aux éléments `.rise,.ph,.rideau,.curtain,.zoom,.words`. Dans les pages, utiliser ces classes (pas `.rv`/`.in`), sinon les captures sont vides.
- **Astro et Next.js écrivent des dossiers `_astro/` et `_next/` :** le fichier `.nojekyll` à la racine doit rester.

## Règles qui ne changent pas

- Après chaque modification : commit en français et envoi sur la branche, sans demander (`CLAUDE.md`).
- Rien ne défile sur le côté, sur aucun site.
- Jamais de données personnelles des demandeurs (noms, téléphones, e-mails reçus par le devis) sur un site.
- Jamais l'e-mail personnel de l'utilisateur sur le site (seulement contact@saitora.fr).
- Jamais de clé (Pixabay ou autre) dans le dépôt ni dans la conversation.
- Jamais de faux avis, de faux clients ou de fausses preuves.
- On parle à l'utilisateur en français simple, sans jargon.

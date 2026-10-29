# Où on en est (à lire au début de chaque session)

Mis à jour le 29 octobre 2026. Ce fichier remplace l'historique des discussions : il dit ce qui existe, ce qui a été décidé et ce qui reste à faire.
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
  - Sources des essais en framework : `labo/sources/` (sans `node_modules`) ; on reconstruit avec `npm install && npm run build` dans chaque projet.

## Décisions prises

- **Les vitrines restent en HTML** : c'est le plus rapide sur téléphone (comparatif labo 06 : HTML ≈ 4 Ko de script, Astro 117 Ko, Next.js 236 Ko ; page utilisable en 2,5 s, 3,3 s et 3,9 s).
- **Astro** pour un site qui a besoin de beaucoup de pièces vivantes de la communauté. **Next.js** seulement pour de vraies applications (espace client, boutique sur mesure).
- **Pièces de la communauté jugées « à brancher »** (labo 07) : titre mot à mot, avant / après à glisser, tampon qui tourne, surligneur, fiche qui s'ouvre depuis sa photo. **À éviter** : effets qui ne marchent qu'à la souris (bouton aimanté, cartes à halo), confettis.
- **DESIGN.md** (format de Google) : on n'a pas copié la collection de getdesign.md (styles de marques connues). Idée possible : écrire un DESIGN.md par client à partir de sa charte. Pas fait.
- **Boutique en ligne** : plan en trois niveaux noté dans `A-FAIRE.md` (commande à retirer → Stripe → Shopify). Rien à faire tant qu'aucun client ne la demande.

## En attente

- **Bobyshop** (`clients/bobyshop/`, site d'un ami qui a testé le devis) : fait comme une boulangerie « pains du monde » d'après sa charte, alors que son devis disait AXI, restaurant / bar / café. À réorienter quand l'utilisateur saura la vraie activité de son ami.
- **Charte** (`charte.html`) : elle garde en mémoire les réponses d'un ancien essai (localStorage). Correction proposée, pas encore demandée.
- **Labo 03** : refaire ou abandonner (voir plus haut).
- **Idée proposée, sans réponse** : ajouter l'avant / après à une démo (par exemple Durand Plomberie) pour le voir en vrai.

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

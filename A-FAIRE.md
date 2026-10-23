# À faire plus tard

## Administratif (avant le premier client)
- [ ] Obtenir le SIRET, puis envoyer : nom, statut (micro-entreprise ou autre), SIRET, adresse ou domiciliation.
  - Compléter `mentions-legales.html` (éditeur, responsable de la publication, mention « EI »).
  - Ajouter la mention de TVA à côté des prix (`tarifs.html`, `devis.html`), par exemple « TVA non applicable, article 293 B du CGI » en micro-entreprise.
- [ ] Adhérer à un médiateur de la consommation (CM2C, Medicys…) et l'indiquer à l'article 13 de `cgv.html`.
- [ ] Faire relire `cgv.html` (expert-comptable, juriste ou CCI de Corse). Paiement de la création choisi : 50 % à la signature, 50 % à la mise en ligne.
- [ ] Souscrire une assurance responsabilité civile professionnelle.
- [ ] Finir la boîte contact@saitora.fr (Zimbra) et vérifier qu'elle reçoit bien.

## Technique
- [ ] Créer un formulaire Formspree et mettre son adresse dans `FORM_ENDPOINT` (`devis.html`) : les devis arriveront directement par e-mail. Penser à le citer dans la page de confidentialité.
- [ ] GitHub Pages : activer « Enforce HTTPS ».
- [ ] OVH : vérifier que l'entrée CNAME est bien `www` (et non `ftp`).
- [ ] Google Search Console : déclarer saitora.fr et envoyer `https://saitora.fr/sitemap.xml`.
- [ ] Créer la fiche Google Business Profile de Saitora (Ajaccio).
- [ ] Mesure d'audience sans cookies (Plausible ou GoatCounter), si besoin.

## Nouvelles démos (en attente des photos)
Trois démos sont prêtes mais pas encore reliées au site : `demo-libecciu.html` (location nautique), `demo-zia-rosa.html` (épicerie), `demo-castagnetu.html` (producteur corse).
- [ ] Ajouter la clé Pixabay dans les réglages de l'environnement, sous le nom `PIXABAY_API_KEY`, puis ouvrir une nouvelle session.
- [ ] Lancer `python3 outils/photos.py` (33 photos, dont 3 pour le spa A Funtana, déjà en ligne avec des aplats à la place), vérifier chaque photo, en changer au besoin (`python3 outils/photos.py mer.webp`).
- [ ] Générer les aperçus (`node outils/apercus.js libecciu zia-rosa castagnetu a-funtana`), puis relier les trois démos : liste `DEMOS` et bas de page de `accueil.html`, mur de `index.html`, styles de `devis.html`, `outils/partage.html`, `sitemap.xml`, `README.md`.

## Idées pour la suite
- [ ] Lien de reprise de la charte graphique (retrouver sa charte sur un autre appareil, sans compte).
- [ ] Remplacer les démos par de vraies réalisations (avant / après) et ajouter de vrais avis clients.
- [ ] Espace client, plus tard, quand il y aura une quinzaine d'abonnés (portail Stripe et formulaire de demandes).

# À faire plus tard

## Administratif (avant le premier client)
- [ ] Obtenir le SIRET, puis envoyer : nom, statut (micro-entreprise ou autre), SIRET, adresse ou domiciliation.
  - Compléter `mentions-legales.html` (éditeur, responsable de la publication, mention « EI »).
  - Ajouter la mention de TVA à côté des prix (`tarifs.html`, `devis.html`), par exemple « TVA non applicable, article 293 B du CGI » en micro-entreprise.
- [ ] Adhérer à un médiateur de la consommation (CM2C, Medicys…) et l'indiquer à l'article 13 de `cgv.html`.
- [ ] Faire relire `cgv.html` (expert-comptable, juriste ou CCI de Corse). Paiement de la création choisi : 50 % à la signature, 50 % à la mise en ligne.
- [ ] Souscrire une assurance responsabilité civile professionnelle.
- [x] Boîte contact@saitora.fr créée.

## Technique
- [x] Formulaire Formspree branché sur `devis.html` (demandes reçues sur contact@saitora.fr), cité dans les mentions légales.
- [ ] GitHub Pages : activer « Enforce HTTPS ».
- [ ] OVH : vérifier que l'entrée CNAME est bien `www` (et non `ftp`).
- [ ] Google Search Console : déclarer saitora.fr et envoyer `https://saitora.fr/sitemap.xml`.
- [ ] Créer la fiche Google Business Profile de Saitora (Ajaccio).
- [ ] Mesure d'audience sans cookies (Plausible ou GoatCounter), si besoin.

## Idées pour la suite
- [ ] Boutique en ligne, quand un client la demandera. Trois niveaux :
  1. Commande à retirer (comme Bobyshop) : site HTML actuel, paiement sur place.
  2. Petite boutique (moins de 20-30 produits) : site HTML + paiement Stripe ; je mets à jour les produits (dans l'abonnement).
  3. Vraie boutique (catalogue, stock, livraison sur le continent) : Shopify, le commerçant gère tout lui-même ; notre style via un thème Shopify sur mesure ou un site Astro branché dessus.
  Avant le premier client : une démo (épicerie fine corse qui expédie, Stripe en mode test), puis une offre « Boutique » dans les tarifs et le devis. Les vitrines restent en HTML.
- [ ] Lien de reprise de la charte graphique (retrouver sa charte sur un autre appareil, sans compte).
- [ ] Remplacer les démos par de vraies réalisations (avant / après) et ajouter de vrais avis clients.
- [ ] Espace client, plus tard, quand il y aura une quinzaine d'abonnés (portail Stripe et formulaire de demandes).

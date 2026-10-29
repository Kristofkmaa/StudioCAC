# Saitorapp

L'appli où chaque client de Saitora gère son site : ses commandes, son stock, ses produits, ses réservations et ses textes. Une seule appli web, installable sur le téléphone (écran d'accueil, plein écran, s'ouvre sans réseau).

## Ce qui existe (version 1, démonstration)

- `index.html` (cadre et styles), `app.js` (les écrans), `donnees.js` (données de démonstration), `charts.js` (graphiques, repris du skill design-taste-frontend, légende en français), `manifest.webmanifest` et `sw.js` (installation et hors ligne), `icone-192.png` / `icone-512.png`.
- Deux clients de démonstration :
  - **Mademoiselle Charlotte** (boutique) : Aujourd'hui (à préparer, prêtes, ventes du mois, stock bas, « À l'atelier » : chaque pièce à broder avec son prénom, ventes par semaine), Commandes (filtres par étape, fiche avec les étapes Nouvelle → À coudre → Prête → Remise), Produits et stock (ajouter, modifier, photo réduite à 700 px, stock + / −, en ligne ou retiré, fait sur commande, personnalisable), Mon site (annonce du haut, phrase d'accueil, délai, contact).
  - **U Fucone** (maison d'hôtes) : Aujourd'hui (arrivées, départs, remplissage sur 30 jours, demandes à confirmer, « la maison chambre par chambre » sur 14 jours), Réservations (mois par chambre, séjours, ajouter un séjour avec contrôle des chevauchements, fermer des dates, accepter / refuser une demande), Mon site.
- **Modules** : chaque client a les siens (Commandes, Produits et stock, Réservations, Mon site ; Rendez-vous et Carte et menu annoncés). On les ajoute ou retire depuis « Ajouter un module ».
- **Tous les clients** : la vue de Saitora (tous les sites suivis, ce qu'il y a à traiter), et « Remettre la démo à zéro ».
- **Lien avec le site de Charlotte** : une commande envoyée depuis son panier (`clients/mademoiselle-charlotte/panier.html`) est déposée dans le navigateur (clé `saitorapp-commandes-recues`) et apparaît dans les commandes de l'appli, sur le même appareil seulement.

Tout est gardé dans le navigateur (localStorage) : rien n'est partagé entre deux appareils tant que le serveur n'est pas branché.

## La suite : le vrai service

1. **Serveur : Supabase** (base de données, comptes, stockage des photos, temps réel ; offre gratuite au départ, hébergé en Europe). Il faut que l'utilisateur crée le compte ; la clé publique peut aller dans le site, la clé de service jamais (variable d'environnement seulement).
   - Tables : `clients`, `membres` (qui a accès à quel client), `modules`, `produits`, `commandes`, `lignes`, `chambres`, `reservations`, `contenus`.
   - Règles d'accès (RLS) : un commerçant ne voit que son site ; Saitora voit tout ; le public peut seulement lire les produits en ligne, les contenus et les dates prises, et créer une commande ou une demande de réservation.
2. **Connexion** par lien envoyé par e-mail (pas de mot de passe à retenir).
3. **Les sites lisent l'appli** : `pieces.js` de Charlotte et le calendrier d'U Fucone viennent de Supabase au lieu d'être écrits dans la page ; l'annonce du haut aussi. Le panier écrit la commande dans Supabase et Charlotte est prévenue.
4. **Notifications** sur le téléphone (Web Push) pour une nouvelle commande ou une demande de réservation, et un e-mail de secours.
5. **Paiement** (plus tard, au choix du client) : liens de paiement SumUp ou Stripe.
6. **Nouveaux modules** : Rendez-vous (instituts), Carte et menu (restaurants), Photos du site.
7. Si un jour il faut être dans les magasins d'applications : emballer la même appli (Capacitor), sans tout réécrire.

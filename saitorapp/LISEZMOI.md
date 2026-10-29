# Saitorapp

Une appli par site, faite pour son métier, que le commerçant installe sur son téléphone. **Toutes les applis ont le même visuel** (demande de l'utilisateur) : le style de l'appli Fitness d'Apple vu sur Mobbin. Fond noir, cartes gris foncé très arrondies, trois anneaux de couleur pour les objectifs (rouge, vert, cyan), chiffres arrondis en couleur avec l'unité en petites capitales, cartes de mesure avec petites barres, carte d'activité en barres à parcourir au doigt, barre d'onglets en pilule arrondie (onglet actif en vert), « + » vert rond, pavé numérique pour les prix et le stock. Seuls les onglets changent selon le métier ; la pastille en haut à droite porte le logo du commerce.

## Comment c'est rangé

- `sites.json` : la liste des applis (nom, nom court, métier, couleur, logo, adresse du site, démo ou non, textes du site). Écrite à la main ou par `python3 outils/saitorapp.py ajoute …`.
- `python3 outils/saitorapp.py` fabrique pour chaque site `saitorapp/<id>/` : sa page, son `manifest.webmanifest` (nom et icône sur l'écran d'accueil), la même icône pour toutes les applis sur l'écran d'accueil (le symbole de Saitora, `saitorapp/icone-*.png`), et une vignette `apercu.png` tirée du logo pour la liste de Saitora. Il refait aussi `saitorapp/index.html`, la liste de toutes les applis pour Saitora.
- `sites.js` : quel métier a quels modules, et les données de démonstration.
- `app.js` et `app.css` : l'appli elle-même, la même pour tous ; elle n'affiche que les modules du métier.

## Les métiers et leurs modules

| Métier | Onglets |
| --- | --- |
| `boutique` | Aujourd'hui, Commandes, Produits (et stock), Mon site |
| `institut` (coiffure, soins) | Aujourd'hui, Agenda (rendez-vous, créneaux libres, équipe), Clients (fiche, note, historique), Carte (prestations, durées, prix), Mon site |
| `hebergement` | Aujourd'hui, Séjours (planning chambre par chambre, demandes, fermetures), Chambres (prix), Mon site |
| `restaurant` | Tables et Carte du jour : à faire |
| `artisan` | Demandes de devis : à faire |
| `vitrine` | Aujourd'hui, Mon site |

Démos : `mademoiselle-charlotte` (boutique), `a-funtana` (institut), `u-fucone` (hébergement).

## Ce qui reste démo

Les données sont gardées dans le navigateur (localStorage, une clé par site) : rien n'est partagé entre deux appareils. Seul lien réel : une commande envoyée depuis le panier du site de Mademoiselle Charlotte apparaît dans son appli, sur le même appareil (clé `saitorapp-commandes-recues`).

## La suite : le vrai service

1. **Serveur : Supabase** (base de données, comptes, photos, temps réel ; offre gratuite au départ, hébergé en Europe). Compte à créer par l'utilisateur ; la clé publique peut aller dans le site, la clé de service jamais (variable d'environnement seulement).
   - Tables : `sites`, `membres` (qui a accès à quel site), `produits`, `commandes`, `lignes`, `prestations`, `equipe`, `clients`, `rendezvous`, `chambres`, `sejours`, `contenus`.
   - Règles d'accès (RLS) : un commerçant ne voit que son site ; Saitora voit tout ; le public lit seulement ce qui est en ligne (produits, prestations, créneaux pris, dates prises, textes) et peut créer une commande, une demande de rendez-vous ou de séjour.
2. **Connexion** par lien reçu par e-mail.
3. **Les sites lisent l'appli** : produits et stock, créneaux libres, dates prises, annonce du haut.
4. **Notifications** sur le téléphone (Web Push) pour une commande, un rendez-vous ou une demande de séjour.
5. **Paiement** au choix du client : liens de paiement SumUp ou Stripe.
6. Modules à venir : Tables et Carte (restaurants), Demandes de devis (artisans), Photos du site.
7. Pour être dans l'App Store et le Play Store : emballer la même appli avec Capacitor.

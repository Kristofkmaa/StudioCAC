# Saitorapp

Une appli par site, faite pour son métier, que le commerçant installe sur son téléphone avec son nom et son logo. Style choisi par l'utilisateur sur Mobbin, d'après les applis Fuse et Ro : fond blanc, grande photo du site en haut avec la phrase du jour et deux cartes translucides, gros chiffre noir dont les centimes passent en gris avec sa courbe et ses périodes (7 J, 1 M, 3 M), tuiles à bord pointillé avec de petites icônes de couleur, boutons pilule noirs, « + » noir rond à côté de la barre d'onglets flottante, pavé numérique pour les prix et le stock. La photo du haut se règle dans sites.json (`photo`, ou `fond` et `marque` sans photo).

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

## L'agenda, le même partout

Un seul agenda pour tous les métiers qui en ont un (`agenda()` et l'objet `AGENDA` dans `app.js`) : chaque métier dit seulement ce qu'il y met. Une bascule **Jour / Mois** en haut, retenue par appli (clé `saitorapp-vue-<id>`).

- **Jour** : la bande de la semaine, puis la journée en blocs de couleur. Institut : les heures, un bloc par rendez-vous de la hauteur de sa durée, couleur de la personne de l'équipe, ligne rouge de l'heure, toucher un moment libre pour ajouter. Hébergement : chaque chambre et qui y dort, ou « Libre ce soir » pour ajouter. Glisser la journée à gauche ou à droite change de jour.
- **Mois** : le mois en un seul bloc. Hébergement : les séjours en barres qui s'étirent sur leurs nuits, une ligne par chambre. Institut : le nombre de rendez-vous et le remplissage de la journée aux couleurs de l'équipe. Toucher un jour montre sa liste dessous.
- Mêmes blocs partout : plein = confirmé, pointillé = à confirmer, hachuré = fermé, pâli = passé (venu, départ).
- Nouveau métier avec un agenda (restaurant, artisan) : ajouter son entrée dans `AGENDA` (titre, blocs, journée, liste).

## Les gestes et les animations

- **Écran d'ouverture** : le symbole de Saitora et le nom court, puis l'appli (fabriqué par `outils/saitorapp.py`, retiré par `app.js`).
- **Passer d'un écran à l'autre** (`route()` dans `app.js`) : une fiche arrive par la droite par-dessus la liste, qui recule et s'assombrit ; le retour fait l'inverse et remet la liste où on l'avait laissée. Changement d'onglet : un léger fondu. La flèche de retour ramène là d'où l'on vient.
- **Glisser depuis le bord gauche** pour revenir, avec l'écran d'avant visible dessous (une image figée gardée à chaque départ). Coupé dans Safari quand l'appli n'est pas installée : Safari le fait déjà.
- **Réactions** : coche verte qui se dessine dans le message du haut ; une ligne qui quitte la liste après une action se replie, sinon son étiquette fait un petit saut ; le gros chiffre défile depuis le dernier montant affiché et la courbe ne se redessine que si elle change. Une action ne fait plus remonter la page.

## Le guide d'accueil

À la première ouverture, un petit guide en 6 pages animées présente l'appli (adapté au métier : pavé des prix pour une boutique, créneaux libres pour un institut, planning pour un hébergement) et finit sur l'installation à l'écran d'accueil. Il ne revient pas tout seul (clé `saitorapp-tuto-<id>`) ; on le revoit dans Mon site → « Revoir le guide de l'appli ». Code : `pagesTuto()` et `tutoriel()` dans `app.js`, styles `.tuto` / `.tu-*` dans `app.css`.

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

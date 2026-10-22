# Modèles pour les sites clients

`mentions-legales-client.html` : mentions légales et politique de confidentialité, à adapter pour chaque site client et à relier en bas de chaque page du site (« Mentions légales »).

Ce sont des bases sérieuses, pas des conseils juridiques. En cas de doute (activité réglementée, vente aux particuliers), faire relire.

## À demander au client avant la mise en ligne

| Repère | Exemple |
|---|---|
| `{{NOM_COMMERCE}}` | La Table du Port |
| `{{PRENOM_NOM}}` ou `{{RAISON_SOCIALE}}`, `{{FORME}}`, `{{CAPITAL}}` | Marie Santoni, EI ; ou SARL Santoni au capital de 5 000 € |
| `{{ADRESSE_POSTALE}}` | adresse du commerce ou du siège |
| `{{SIRET}}`, ou `{{VILLE_RCS}}` et `{{SIREN}}` pour une société | 123 456 789 00012 |
| `{{TVA_INTRA}}` | seulement pour une société assujettie à la TVA |
| `{{TELEPHONE}}`, `{{EMAIL}}` | coordonnées publiques du commerce |
| `{{PRENOM_NOM_RESPONSABLE}}` | le gérant, en général |
| `{{MENTIONS_ACTIVITE_REGLEMENTEE}}` | BTP : assureur décennale et zone couverte ; profession réglementée : ordre, titre ; sinon supprimer |
| `{{CHAMPS_DU_FORMULAIRE}}`, `{{FINALITE}}`, `{{DUREE}}` | selon le formulaire du site |
| `{{SERVICE_FORMULAIRE}}` | le service de formulaires utilisé (Formspree, par exemple) |
| `{{SERVICE_TIERS}}`, `{{SOURCE_AVIS}}` | seulement s'il y en a ; sinon supprimer les paragraphes |

## La liste de vérification d'un site client

- [ ] Mentions légales remplies et reliées depuis le bas de chaque page.
- [ ] Aucun cookie sans consentement : pas de Google Analytics, pas de Google Maps ou de vidéo YouTube chargés d'office. Utiliser une image de carte avec un lien, et une mesure d'audience sans cookie si besoin.
- [ ] Polices hébergées sur le site (voir `outils/polices.py`), pas chargées chez Google.
- [ ] Photos : celles du client (il garantit en avoir le droit) ou libres de droits (source notée).
- [ ] Avis clients : vrais, avec leur source et leur date, sans tri selon la note.
- [ ] Prix affichés : TTC pour une clientèle de particuliers (restaurant, salon, boutique).
- [ ] Formulaire : uniquement les champs nécessaires, avec une phrase qui dit à quoi servent les données et un lien vers la politique de confidentialité.
- [ ] Nom de domaine enregistré au nom du client.
- [ ] Devis signé, avec les conditions générales de vente de Saitora (https://saitora.fr/cgv.html).

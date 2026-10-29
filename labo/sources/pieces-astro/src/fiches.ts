// Les fiches du catalogue : ce qu'est chaque pièce, où on l'a essayée, et notre verdict.
// « poids » : le script propre à la pièce, compressé, en plus du socle commun (React et Motion, environ 110 Ko compressés, chargés une seule fois).
type Fiche = { id: string; n: string; nom: string; lib: string; metier: string; poids: string; tel: string; avis: "oui" | "peut-être" | "non"; texte: string }

const RAW: Fiche[] = [
  { id: "titre", n: "01", nom: "TextEffect", lib: "Motion Primitives", metier: "Hébergement · le titre de l'ouverture", poids: "1,4 Ko", tel: "Parfait", avis: "oui", texte: "Le titre se révèle mot à mot : discret, lisible, presque gratuit. Idéal pour l'ouverture d'un site." },
  { id: "avant", n: "02", nom: "ImageComparison", lib: "Motion Primitives", metier: "Artisan, coiffeur, photographe · l'avant / après", poids: "1,5 Ko", tel: "Se glisse au doigt", avis: "oui", texte: "Ce qui vend le mieux un artisan, un coiffeur ou une rénovation : le résultat se voit d'un geste." },
  { id: "produits", n: "03", nom: "TiltedCard", lib: "React Bits", metier: "Épicerie · les produits", poids: "5,2 Ko", tel: "Pas de souris : la carte ne penche que si le gyroscope est autorisé", avis: "peut-être", texte: "Joli sur ordinateur mais gadget : à garder pour trois ou quatre produits phares, pas pour tout un catalogue." },
  { id: "tampon", n: "04", nom: "CircularText", lib: "React Bits", metier: "Boulangerie · le tampon « cuit ce matin »", poids: "2,7 Ko", tel: "Tourne bien, taille à réduire", avis: "oui", texte: "Un tampon qui tourne, simple et chaleureux : parfait pour une boulangerie, un torréfacteur, un artisan de bouche." },
  { id: "etincelles", n: "05", nom: "ClickSpark", lib: "React Bits", metier: "Restaurant · le bouton de réservation", poids: "3,4 Ko", tel: "Marche au toucher", avis: "peut-être", texte: "Fugace et sympathique sur le bouton qui compte (réserver, commander) ; à ne pas mettre partout." },
  { id: "aimant", n: "06", nom: "Magnetic", lib: "Motion Primitives", metier: "Garage · le bouton d'appel", poids: "0,8 Ko", tel: "Aucun effet sans souris", avis: "non", texte: "Invisible pour la plupart de nos visiteurs, qui arrivent du téléphone : il n'apporte rien." },
  { id: "surligne", n: "07", nom: "Highlighter", lib: "Magic UI", metier: "Immobilier · l'argument à retenir", poids: "4,7 Ko", tel: "Suit le texte, même à la ligne", avis: "oui", texte: "L'argument mis en valeur comme au feutre. Une ou deux phrases par page, pas plus." },
  { id: "formules", n: "08", nom: "MagicCard", lib: "Magic UI", metier: "Salle de sport · les formules", poids: "2,3 Ko", tel: "Aucun effet sans souris", avis: "non", texte: "Le halo ne se voit qu'à la souris ; sur téléphone, ce sont des cartes plates. Pas la peine." },
  { id: "aurore", n: "09", nom: "Aurora", lib: "React Bits", metier: "Spa · le fond de l'ouverture", poids: "5,1 Ko (WebGL)", tel: "Fonctionne, mais tourne en continu", avis: "peut-être", texte: "Superbe en fond d'ouverture pour un spa ou un hôtel ; une seule fois par site, et coupé si le visiteur demande moins d'animations." },
  { id: "galerie", n: "10", nom: "Masonry", lib: "React Bits", metier: "Fleuriste · la galerie", poids: "8,6 Ko + icônes", tel: "Deux colonnes, agrandissement au toucher", avis: "peut-être", texte: "La plus lourde : les photos arrivent au fil du défilement et s'ouvrent en grand. Une galerie en CSS fait presque aussi bien." },
  { id: "carte", n: "11", nom: "MorphingDialog", lib: "Motion Primitives", metier: "Restaurant · la carte", poids: "3,7 Ko", tel: "Parfait : la fiche s'ouvre en plein écran", avis: "oui", texte: "La fiche du plat s'ouvre depuis sa photo : élégant et utile, pour une carte, des chambres ou un catalogue." },
  { id: "fete", n: "12", nom: "Confetti", lib: "Magic UI", metier: "Boulangerie · la commande envoyée", poids: "5,1 Ko", tel: "Marche", avis: "non", texte: "Fait « application de jeu » : déplacé pour la plupart des commerces, sauf peut-être un pâtissier pour les anniversaires." },
]
const AVIS = { "oui": "À brancher", "peut-être": "Avec précaution", "non": "À éviter" }
const CLASSE = { "oui": "oui", "peut-être": "peut", "non": "non" }

export const FICHES = RAW.map(f => ({
  ...f,
  entete: `<span class="n">${f.n}</span><div><h2>${f.nom}</h2><p>${f.lib} · ${f.metier}</p></div>`,
  verdict: `<p class="avis ${CLASSE[f.avis]}">${AVIS[f.avis]}</p><dl><div><dt>Poids</dt><dd>${f.poids || "à mesurer"}</dd></div><div><dt>Téléphone</dt><dd>${f.tel || "à essayer"}</dd></div></dl><p>${f.texte}</p>`,
}))

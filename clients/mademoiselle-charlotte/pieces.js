/* Les créations de Mademoiselle Charlotte (prix relevés sur sa boutique SumUp ; textes à valider avec elle).
   s : nom du fichier image et adresse de la fiche (produit.html?p=…), f : famille, perso : personnalisable */
window.BOUTIQUE = "https://mademoiselle-charlotte-1.sumupstore.com/";
window.FAMILLES = { bavoirs: "Bavoirs", naissance: "Naissance", doudous: "Doudous", deco: "Déco", quotidien: "Au quotidien" };
window.PIECES = [
  { s: "bavoir-prenom-fille", n: "Bavoir prénom, gaze fille", f: "bavoirs", p: 6, perso: 1, t: "Un bavoir bandana en gaze de coton, brodé au prénom de votre fille en lettres dorées pailletées, avec un petit cœur. Doux contre le cou, il se ferme par un bouton pression." },
  { s: "bavoir-prenom-garcon", n: "Bavoir prénom, gaze garçon", f: "bavoirs", p: 6, perso: 1, t: "Le bavoir bandana en gaze de coton, brodé au prénom de votre garçon en lettres dorées, avec une petite étoile. Il se ferme par un bouton pression." },
  { s: "bavoir-corse-fille", n: "Bavoir expression corse fille", f: "bavoirs", p: 6, perso: 1, t: "Une gaze rose, un mot corse brodé en doré : le bavoir qui fait sourire toute la famille. Le mot se choisit avec Charlotte à la commande." },
  { s: "bavoir-corse-garcon", n: "Bavoir expression corse garçon", f: "bavoirs", p: 6, perso: 1, t: "« Stragnu », « O Basta », « Pianu »… Un mot corse brodé en doré sur une gaze bleu nuit étoilée, ou sur la couleur de votre choix." },
  { s: "bavoirs-jours", n: "Bavoirs « jours de la semaine » en corse", f: "bavoirs", p: 50, perso: 0, t: "Une semaine de bavoirs, un par jour, chacun brodé du nom du jour en corse, de Luni à Dumenica. Présentés dans leur boîte, prêts à offrir." },
  { s: "coffret-matteu", n: "Coffret de naissance « Matteu »", f: "naissance", p: 35, perso: 1, t: "Un coffret de naissance au prénom du bébé : lange en gaze brodé, doudou et petits accessoires, rangés dans une corbeille marquée à son prénom." },
  { s: "coffret-40", n: "Coffret bavoirs et bandeau", f: "naissance", p: 40, perso: 1, t: "Deux bavoirs en gaze et un bandeau à oreilles de lapin, en écru et terracotta. Un joli premier cadeau, qui se personnalise au prénom." },
  { s: "coffret-58", n: "Coffret de naissance en bois", f: "naissance", p: 58, perso: 1, t: "Une caisse en bois gravée au prénom, garnie de linge doux et de petites attentions pour accueillir le bébé." },
  { s: "coffret-100", n: "Grand coffret de naissance", f: "naissance", p: 100, perso: 1, t: "Le grand coffret : bavoirs, coussin brodé, sac en tissu et petits accessoires, assortis et personnalisés. Le cadeau de naissance complet." },
  { s: "boite-souris", n: "Boîte souris pour la dent de lait", f: "naissance", p: 50, perso: 0, t: "Une petite chambre de souris, avec son lit, sa porte et ses lumières, où la souris vient chercher la première dent de lait." },
  { s: "souris-garcon", n: "Souris dent de lait garçon", f: "naissance", p: 30, perso: 0, t: "Une souris doudou dans son bocal, qui garde la dent de lait en attendant la nuit." },
  { s: "doudou-grenouille", n: "Doudou grenouille", f: "doudous", p: 40, perso: 0, t: "Une grenouille en tissu aux longues jambes, en salopette à pois, cousue à la main." },
  { s: "doudou-abeille", n: "Doudou abeille", f: "doudous", p: 40, perso: 0, t: "Une petite abeille en tissu, rayée jaune et noir, avec ses ailes et sa couronne de fleurs." },
  { s: "lapin", n: "Lapin en tissu et sa carotte", f: "doudous", p: 30, perso: 0, t: "Un lapin en tissu habillé de rose, qui ne se sépare jamais de sa grande carotte." },
  { s: "ourson", n: "Ourson ou panda personnalisé", f: "doudous", p: 40, perso: 1, t: "Un ourson ou un panda en tissu, en salopette, personnalisé au prénom de l'enfant." },
  { s: "danseuse-40", n: "Danseuse au tutu vert", f: "doudous", p: 40, perso: 0, t: "Une poupée danseuse en tissu, au tutu vert et aux cheveux en chignons." },
  { s: "danseuse-50", n: "Danseuse rose", f: "doudous", p: 50, perso: 0, t: "Une poupée danseuse en tissu, en rose poudré, avec ses chaussons et son béret." },
  { s: "cadre-rond", n: "Cadre enfant rond", f: "deco", p: 35, perso: 1, t: "Un cadre rond en vichy et osier, pour garder les premiers chaussons, avec le prénom et la date de naissance." },
  { s: "cadre-mural", n: "Cadre mural à l'initiale", f: "deco", p: 30, perso: 1, t: "Un cadre mural ovale avec l'initiale de l'enfant et un ourson en tissu, à accrocher dans sa chambre." },
  { s: "montgolfiere", n: "Montgolfière décorative", f: "deco", p: 50, perso: 0, t: "Une montgolfière à suspendre au-dessus du lit, avec son petit passager en tissu." },
  { s: "attache-sucette", n: "Attache-sucette", f: "quotidien", p: 5, perso: 1, grand: "attache-grand", t: "« Parce que les petites choses font les plus grands bonheurs… A prestu aux sucettes perdues ! » Un prénom ou un mot corse brodé en doré, une pince en bois. Personnalisé et fabriqué avec amour." },
  { s: "pochette-sucette", n: "Pochette à sucette", f: "quotidien", p: 10, perso: 0, t: "Une petite pochette en tissu fleuri pour ranger la sucette : pratique et pleine de charme." },
  { s: "poncho", n: "Poncho de bain enfant", f: "quotidien", p: 35, perso: 1, t: "Un poncho de bain à capuche en éponge, brodé au prénom, pour sortir du bain bien au chaud." },
  { s: "sac-tissu", n: "Sac en tissu", f: "quotidien", p: 28, perso: 0, t: "Un sac en tissu imprimé, avec ses anses, pour les affaires de la crèche ou les petites courses." }
];

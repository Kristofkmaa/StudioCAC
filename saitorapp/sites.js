/* Saitorapp : chaque site a sa propre appli, avec son nom, sa couleur, son icône et seulement les modules de son métier.
   La liste des sites est dans sites.json (écrite par outils/saitorapp.py) ; ce fichier dit quels modules va avec quel métier
   et prépare les données de démonstration. */
window.Saitorapp = window.Saitorapp || {};

/* le métier décide des modules : un coiffeur a l'agenda des rendez-vous, pas la vente en ligne */
Saitorapp.METIERS = {
  boutique:    { nom: "Boutique, créatrice", modules: ["aujourdhui", "commandes", "produits", "site"] },
  institut:    { nom: "Coiffure, institut, soins", modules: ["aujourdhui", "agenda", "clients", "prestations", "site"] },
  hebergement: { nom: "Gîte, chambres d'hôtes, hôtel", modules: ["aujourdhui", "sejours", "chambres", "site"] },
  restaurant:  { nom: "Restaurant, café", modules: ["aujourdhui", "tables", "carte", "site"] },
  artisan:     { nom: "Artisan, dépannage", modules: ["aujourdhui", "demandes", "site"] },
  vitrine:     { nom: "Site vitrine simple", modules: ["aujourdhui", "site"] }
};

Saitorapp.MODULES = {
  aujourdhui:  { nom: "Aujourd'hui", onglet: "Aujourd'hui", icone: "jour" },
  commandes:   { nom: "Commandes", onglet: "Commandes", icone: "sac" },
  produits:    { nom: "Produits et stock", onglet: "Produits", icone: "boite" },
  agenda:      { nom: "Agenda des rendez-vous", onglet: "Agenda", icone: "agenda" },
  clients:     { nom: "Clientèle", onglet: "Clients", icone: "gens" },
  prestations: { nom: "Prestations et prix", onglet: "Carte", icone: "ciseaux" },
  sejours:     { nom: "Séjours", onglet: "Séjours", icone: "agenda" },
  chambres:    { nom: "Chambres et prix", onglet: "Chambres", icone: "lit" },
  tables:      { nom: "Réservations de tables", onglet: "Tables", icone: "agenda", bientot: true },
  carte:       { nom: "Carte et menu du jour", onglet: "Carte", icone: "carte", bientot: true },
  demandes:    { nom: "Demandes de devis", onglet: "Demandes", icone: "boite", bientot: true },
  site:        { nom: "Mon site", onglet: "Mon site", icone: "site" }
};

/* ---------- données de démonstration ---------- */
(() => {
  const jour = 864e5;
  const auj = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const plus = (d, n) => new Date(+new Date(d) + n * jour);
  const graine = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  Saitorapp.temps = { auj, iso, plus, jour };

  const SEMIS = {};

  /* une boutique : Mademoiselle Charlotte */
  SEMIS.boutique = site => {
    const r = graine(20261029), t = auj(), pick = a => a[Math.floor(r() * a.length)];
    const produits = (window.PIECES || []).map((p, i) => ({
      id: p.s, nom: p.n, famille: p.f, prix: p.p, perso: !!p.perso, texte: p.t,
      photo: `${site.racine}images/${p.s}.webp`, surCommande: !!p.perso, stock: p.perso ? null : [3, 2, 0, 4, 5, 1, 3][i % 7], seuil: 1, enLigne: true
    }));
    const prenoms = ["Lisandru", "Ghjulia", "Matteu", "Livia", "Anto", "Chjara", "Petru", "Lucia", "Emma", "Louis", "Nina", "Jules", "Maria", "Paulu"];
    const clientes = ["Sandrine P.", "Marie-Laure F.", "Julie C.", "Anaïs R.", "Céline B.", "Laetitia M.", "Vanessa T.", "Sophie G.", "Audrey L.", "Pauline D."];
    const commandes = []; let num = 1040;
    for (let d = -63; d <= 0; d++) {
      if (r() > (d > -14 ? 0.62 : 0.42)) continue;
      const lignes = [], n = 1 + Math.floor(r() * 2.4);
      for (let k = 0; k < n; k++) { const p = pick(produits); lignes.push({ produit: p.id, nom: p.nom, prix: p.prix, q: p.prix < 15 && r() > .6 ? 2 : 1, prenom: p.perso ? pick(prenoms) : "", detail: "" }); }
      const age = -d, statut = age > 16 ? "remise" : age > 9 ? pick(["remise", "prete"]) : age > 3 ? pick(["a-coudre", "prete"]) : pick(["nouvelle", "nouvelle", "a-coudre"]);
      commandes.push({ id: `${++num}`, date: iso(plus(t, d)) + `T${String(8 + Math.floor(r() * 12)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
        client: pick(clientes), tel: `06 ${10 + Math.floor(r() * 89)} •• •• ${10 + Math.floor(r() * 89)}`, remise: r() > .7 ? "Par la poste" : "En main propre", mot: "", statut, lignes, source: "démo" });
    }
    return { produits, commandes };
  };

  /* un institut : A Funtana (hammam, soins, coiffure) */
  SEMIS.institut = () => {
    const r = graine(4242), t = auj(), pick = a => a[Math.floor(r() * a.length)];
    const P = [["acces", "Accès libre", "Hammam, sauna et tisane", 60, 25, "eau"], ["savon", "Hammam et savon noir", "Avec gommage au gant", 60, 45, "eau"],
      ["massage", "Massage relaxant", "Huile d'olive et immortelle", 60, 85, "soin"], ["massage-court", "Massage court", "Dos, nuque et épaules", 30, 50, "soin"],
      ["pierres", "Pierres chaudes", "Galets de rivière chauffés", 75, 95, "soin"], ["visage", "Soin visage à l'immortelle", "Nettoyage, masque, massage du visage", 60, 75, "soin"],
      ["visage-express", "Soin visage express", "Pour un coup d'éclat", 30, 45, "soin"], ["gommage", "Gommage sel et myrte", "Tout le corps, puis hydratation", 45, 55, "soin"],
      ["manucure", "Manucure", "Limage, cuticules, vernis", 45, 35, "soin"], ["coupe", "Coupe et brushing", "Femme, cheveux courts à longs", 60, 48, "coiffure"],
      ["brushing", "Brushing", "Lisse ou wavy", 30, 30, "coiffure"], ["couleur", "Couleur", "Coloration et brushing", 90, 65, "coiffure"],
      ["balayage", "Balayage", "Éclaircissement naturel et soin", 150, 110, "coiffure"], ["coupe-homme", "Coupe homme", "Shampooing, coupe, coiffage", 30, 28, "coiffure"],
      ["barbe", "Coupe et barbe", "Contours au rasoir", 45, 38, "coiffure"]];
    const prestations = P.map(([id, nom, texte, duree, prix, famille]) => ({ id, nom, texte, duree, prix, famille, enLigne: true }));
    const equipe = [{ id: "nadia", nom: "Nadia", role: "Soins", couleur: "#2E7D6B", familles: ["eau", "soin"] }, { id: "sarah", nom: "Sarah", role: "Coiffure", couleur: "#B5674D", familles: ["coiffure"] }, { id: "lea", nom: "Léa", role: "Soins et coiffure", couleur: "#5A6FB0", familles: ["soin", "coiffure"] }];
    const gens = ["Marie Antonetti", "Julie Casanova", "Laura Peretti", "Sophie Mattei", "Camille Rossi", "Elsa Leca", "Pauline Ottavi", "Chloé Bartoli", "Manon Pieri", "Inès Agostini", "Emma Santucci", "Clara Filippi", "Thomas Luciani", "Hugo Sialelli", "Anaïs Marchetti", "Léa Graziani"];
    const clients = gens.map((n, i) => ({ id: `c${i + 1}`, nom: n, tel: `06 ${10 + Math.floor(r() * 89)} •• •• ${10 + Math.floor(r() * 89)}`, note: i % 5 === 0 ? pick(["Cuir chevelu sensible", "Préfère Sarah", "Allergie aux huiles essentielles", "Toujours le samedi matin"]) : "" }));
    const rdv = []; let id = 500;
    for (let d = -45; d <= 21; d++) {
      const date = plus(t, d); if (date.getDay() === 0) continue;
      for (const e of equipe) {
        let h = 9 * 60 + (r() > .5 ? 30 : 0);
        while (h < 18 * 60) {
          if (r() < (d < 0 ? .3 : d < 4 ? .32 : .55)) { h += 30; continue; }
          const p = pick(prestations.filter(x => e.familles.includes(x.famille)));
          if (h + p.duree > 19 * 60) break;
          const c = pick(clients);
          rdv.push({ id: `${++id}`, date: iso(date), debut: h, presta: p.id, equipe: e.id, client: c.id, statut: d < 0 ? (r() > .06 ? "venu" : "absent") : d > 1 && d < 10 && r() > .94 ? "demande" : "confirme", source: r() > .4 ? "site" : "téléphone" });
          h += p.duree + (r() > .6 ? 30 : 0);
        }
      }
    }
    return { prestations, equipe, clients, rdv, horaires: { ouverture: 9 * 60, fermeture: 19 * 60, ferme: [0] } };
  };

  /* un hébergement : U Fucone */
  SEMIS.hebergement = () => {
    const r = graine(20261029), t = auj(), pick = a => a[Math.floor(r() * a.length)];
    const chambres = [{ id: "a-trave", nom: "A Trave", prix: 95, places: 2, texte: "Sous les poutres" }, { id: "u-sole", nom: "U Sole", prix: 105, places: 2, texte: "Sur le jardin" },
      { id: "a-nichja", nom: "A Nichja", prix: 90, places: 2, texte: "La chambre à niche" }, { id: "a-casetta", nom: "A Casetta", prix: 120, places: 4, texte: "La maisonnette" }];
    const hotes = ["Famille Moretti", "M. et Mme Durand", "Clara et Tom", "Famille Santoni", "Hélène V.", "M. Ferrandi", "Lena et Jonas", "Famille Leclerc", "Marc et Sylvie", "Irène B.", "Famille Cristofari", "Paul et Inès"];
    const sejours = []; let id = 300;
    chambres.forEach(c => {
      let d = -8 + Math.floor(r() * 4);
      while (d < 44) {
        const nuits = 2 + Math.floor(r() * 4);
        sejours.push({ id: `${++id}`, chambre: c.id, arrivee: iso(plus(t, d)), depart: iso(plus(t, d + nuits)), nom: pick(hotes), personnes: c.places > 2 && r() > .5 ? 4 : 2, statut: d > 6 && r() > .82 ? "demande" : "confirme", source: r() > .3 ? "site" : "téléphone" });
        d += nuits + Math.floor(r() * 5);
      }
    });
    sejours.push({ id: `${++id}`, chambre: "a-casetta", arrivee: iso(plus(t, 20)), depart: iso(plus(t, 23)), nom: "Travaux du toit", personnes: 0, statut: "ferme", source: "" });
    return { chambres, sejours };
  };

  Saitorapp.semer = site => {
    const base = { contenu: Object.assign({ annonce: "", annonceVisible: false, accueil: "", horaires: "", contact: "" }, site.contenu || {}) };
    if (!site.demo) return Object.assign(base, { produits: [], commandes: [], prestations: [], equipe: [], clients: [], rdv: [], chambres: [], sejours: [] });
    return Object.assign(base, (SEMIS[site.metier] || (() => ({})))(site));
  };
})();

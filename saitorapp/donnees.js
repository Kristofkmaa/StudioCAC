/* Saitorapp : les données de démonstration et leur rangement.
   Tant que le serveur (Supabase) n'est pas branché, tout est gardé dans le navigateur (localStorage).
   Les commandes envoyées depuis le panier du site de Mademoiselle Charlotte arrivent ici quand on utilise
   le même navigateur sur le même domaine (clé « saitorapp-commandes-recues »). */
window.Donnees = (() => {
  const CLE = "saitorapp-v1", RECUES = "saitorapp-commandes-recues";
  const jour = 864e5;
  const aujourdhui = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const plus = (d, n) => new Date(+new Date(d) + n * jour);
  /* tirage pseudo-aléatoire fixe : la démo est la même à chaque ouverture */
  const graine = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  const MODULES = {
    commandes: { nom: "Commandes", texte: "Les commandes du panier du site, à préparer, prêtes, remises." },
    produits: { nom: "Produits et stock", texte: "Ajouter un produit, changer un prix, suivre le stock, mettre en ligne ou retirer." },
    reservations: { nom: "Réservations", texte: "Le calendrier des chambres ou des places, les demandes à confirmer, les dates fermées." },
    rendezvous: { nom: "Rendez-vous", texte: "Les créneaux d'un institut ou d'un artisan, pris depuis le site." },
    carte: { nom: "Carte et menu", texte: "Les plats, les prix et le menu du jour, changés en un geste." },
    site: { nom: "Mon site", texte: "L'annonce en haut du site, les horaires, les textes et les photos." }
  };

  function semer() {
    const r = graine(20261029), t = aujourdhui();
    const pick = a => a[Math.floor(r() * a.length)];

    /* Mademoiselle Charlotte : les produits viennent de la liste de son site */
    const produits = (window.PIECES || []).map((p, i) => ({
      id: p.s, nom: p.n, famille: p.f, prix: p.p, perso: !!p.perso, texte: p.t,
      photo: `../clients/mademoiselle-charlotte/images/${p.s}.webp`,
      surCommande: !!p.perso, stock: p.perso ? null : [3, 2, 0, 4, 5, 1, 3][i % 7], seuil: 1, enLigne: true
    }));
    const prenoms = ["Lisandru", "Ghjulia", "Matteu", "Livia", "Anto", "Chjara", "Petru", "Lucia", "Emma", "Louis", "Nina", "Jules", "Maria", "Paulu"];
    const clientes = ["Sandrine P.", "Marie-Laure F.", "Julie C.", "Anaïs R.", "Céline B.", "Laetitia M.", "Vanessa T.", "Sophie G.", "Audrey L.", "Pauline D."];
    const commandes = [];
    let num = 1040;
    for (let d = -63; d <= 0; d++) {
      if (r() > (d > -14 ? 0.62 : 0.42)) continue;
      const lignes = [];
      const n = 1 + Math.floor(r() * 2.4);
      for (let k = 0; k < n; k++) {
        const p = pick(produits);
        lignes.push({ produit: p.id, nom: p.nom, prix: p.prix, q: p.prix < 15 && r() > .6 ? 2 : 1, prenom: p.perso ? pick(prenoms) : "", detail: "" });
      }
      const age = -d;
      const statut = age > 16 ? "remise" : age > 9 ? pick(["remise", "prete"]) : age > 3 ? pick(["a-coudre", "prete"]) : pick(["nouvelle", "nouvelle", "a-coudre"]);
      const tel = `06 ${String(10 + Math.floor(r() * 89))} •• •• ${String(10 + Math.floor(r() * 89))}`;
      commandes.push({ id: `MC-${++num}`, date: iso(plus(t, d)) + `T${String(8 + Math.floor(r() * 12)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
        cliente: pick(clientes), tel, remise: r() > .7 ? "Par la poste" : "En main propre", mot: "", statut, lignes, source: "démo" });
    }

    /* U Fucone : quatre chambres, des séjours sur six semaines */
    const chambres = [
      { id: "a-trave", nom: "A Trave", prix: 95, places: 2 }, { id: "u-sole", nom: "U Sole", prix: 105, places: 2 },
      { id: "a-nichja", nom: "A Nichja", prix: 90, places: 2 }, { id: "a-casetta", nom: "A Casetta", prix: 120, places: 4 }
    ];
    const hotes = ["Famille Moretti", "M. et Mme Durand", "Clara et Tom", "Famille Santoni", "Hélène V.", "M. Ferrandi", "Lena et Jonas", "Famille Leclerc", "Marc et Sylvie", "Irène B.", "Famille Cristofari", "Paul et Inès"];
    const reservations = [];
    let rid = 300;
    chambres.forEach(c => {
      let d = -8 + Math.floor(r() * 4);
      while (d < 44) {
        const nuits = 2 + Math.floor(r() * 4);
        const statut = d > 6 && r() > .7 ? "demande" : "confirmee";
        reservations.push({ id: `UF-${++rid}`, chambre: c.id, arrivee: iso(plus(t, d)), depart: iso(plus(t, d + nuits)), nom: pick(hotes), personnes: c.places > 2 && r() > .5 ? 4 : 2, statut, source: r() > .3 ? "site" : "téléphone" });
        d += nuits + Math.floor(r() * 5);
      }
    });
    reservations.push({ id: `UF-${++rid}`, chambre: "a-casetta", arrivee: iso(plus(t, 20)), depart: iso(plus(t, 23)), nom: "Travaux du toit", personnes: 0, statut: "ferme", source: "" });

    return {
      clients: {
        "mademoiselle-charlotte": {
          nom: "Mademoiselle Charlotte", metier: "Accessoires sur mesure pour enfants", site: "../clients/mademoiselle-charlotte/",
          logo: "../clients/mademoiselle-charlotte/images/logo-petit.webp",
          modules: ["commandes", "produits", "site"], produits, commandes,
          contenu: { annonce: "Commandes de Noël jusqu'au 10 décembre", annonceVisible: true, accueil: "Bavoirs en gaze de coton, coffrets de naissance, doudous et cadres pour les tout-petits, cousus à la main et brodés à leur prénom.", delai: "10 à 15 jours de confection", contact: "Par le formulaire du panier" }
        },
        "u-fucone": {
          nom: "U Fucone", metier: "Maison d'hôtes", site: "../demo-u-fucone.html", logo: "",
          modules: ["reservations", "site"], chambres, reservations,
          contenu: { annonce: "Fermé en janvier, réouverture le 1er février", annonceVisible: false, accueil: "Quatre chambres dans une maison de pierre, la table du soir au coin du feu.", delai: "Arrivée à partir de 16 h, départ avant 11 h", contact: "Par le calendrier du site" }
        }
      }
    };
  }

  let etat;
  try { etat = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
  if (!etat || !etat.clients) etat = semer();

  /* les commandes reçues du panier du site (même navigateur) */
  function recevoir() {
    let recues = [];
    try { recues = JSON.parse(localStorage.getItem(RECUES)) || []; } catch (e) {}
    const c = etat.clients["mademoiselle-charlotte"];
    let n = 0;
    recues.forEach(o => { if (!c.commandes.some(x => x.id === o.id)) { c.commandes.push(o); n++; } });
    if (n) enregistrer();
    return n;
  }
  function enregistrer() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {} }
  function remettre() { try { localStorage.removeItem(CLE); } catch (e) {} etat = semer(); recevoir(); enregistrer(); }
  recevoir();

  return { get etat() { return etat; }, MODULES, enregistrer, remettre, recevoir, iso, plus, aujourdhui };
})();

// Les formules Saitora et leurs prix : une seule source pour la page Tarifs et le devis.
// Prix de lancement (premiers clients).
// Pour changer un prix, on le change ici (et on monte le numéro ?v= dans tarifs.html et devis.html).
window.OFFRES = {
  essentiel:  { nom: "Essentiel",   creation: 290,  mois: 25 },
  pro:        { nom: "Pro",         creation: 590,  mois: 45 },
  surmesure:  { nom: "Sur mesure",  creation: null, mois: null },   // sur devis
  sansavance: { nom: "Sans avance", creation: 0,    mois: 39, duree: 24, ensuite: "essentiel" },
};
// Charte graphique finalisée par Saitora (pistes de logo, fichiers propres, fiche validée) :
// offerte avec toute formule de site ; seule, au prix ci-dessous, déduit du site s'il est commandé dans le délai.
window.CHARTE = { prix: 49, deductionMois: 3 };
// Repères du marché pour un site vitrine, coût total sur 3 ans (création et maintenance).
// Source : baromètre Les Créavores, juin 2026, 103 prix réels. À mettre à jour si on change de source.
window.MARCHE = {
  freelance3ans: 4000, agence3ans: 6100,
  source: "Baromètre des prix de création de sites, Les Créavores, juin 2026",
  url: "https://lescreavores.fr/prix-creation-site-internet/",
};
window.eur = n => n.toLocaleString("fr-FR") + " €";
// « 590 € puis 45 € par mois », « Sur devis, selon le projet », « 0 € puis 39 € par mois pendant 24 mois »
window.prixTexte = k => {
  const o = OFFRES[k];
  if (o.creation == null) return "Sur devis, selon le projet";
  return `${eur(o.creation)} puis ${eur(o.mois)} par mois${o.duree ? ` pendant ${o.duree} mois` : ""}`;
};

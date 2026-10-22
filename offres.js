// Les formules Saitora et leurs prix : une seule source pour la page Tarifs et le devis.
// Pour changer un prix, on le change ici (et on monte le numéro ?v= dans tarifs.html et devis.html).
window.OFFRES = {
  essentiel:  { nom: "Essentiel",   creation: 490,  mois: 29 },
  pro:        { nom: "Pro",         creation: 890,  mois: 49 },
  surmesure:  { nom: "Sur mesure",  creation: null, mois: null },   // sur devis
  sansavance: { nom: "Sans avance", creation: 0,    mois: 69, duree: 24, ensuite: "essentiel" },
};
window.eur = n => n.toLocaleString("fr-FR") + " €";
// « 890 € puis 49 € par mois », « Sur devis », « 0 € puis 69 € par mois pendant 24 mois »
window.prixTexte = k => {
  const o = OFFRES[k];
  if (o.creation == null) return "Sur devis, selon le projet";
  return `${eur(o.creation)} puis ${eur(o.mois)} par mois${o.duree ? ` pendant ${o.duree} mois` : ""}`;
};

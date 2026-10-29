// Libecciu : les données de la démo (mêmes que demo-libecciu.html), partagées par les versions Astro et Next.js.

export type Bateau = { k: string; nom: string; detail: string; prix: Record<number, number>; photo: string; texte: string }

export const FLOTTE: Bateau[] = [
  { k: "kayak1", nom: "Kayak une place", detail: "dès 12 ans", prix: { 1: 15, 2: 25, 4: 40, 8: 60 }, photo: "kayak", texte: "Léger et stable, pour longer la côte jusqu'à la crique aux pins." },
  { k: "kayak2", nom: "Kayak deux places", detail: "dès 6 ans avec un adulte", prix: { 1: 20, 2: 35, 4: 55, 8: 80 }, photo: "kayak", texte: "Un adulte derrière, un enfant devant : le plus demandé en famille." },
  { k: "paddle", nom: "Paddle", detail: "dès 12 ans", prix: { 1: 15, 2: 25, 4: 40 }, photo: "paddle", texte: "Pour le calme du matin, quand l'eau est un miroir." },
  { k: "bateau", nom: "Bateau sans permis, 6 cv", detail: "cinq places", prix: { 2: 90, 4: 140, 8: 220 }, photo: "bateau", texte: "Une coque ouverte et un petit moteur : la baie et les criques proches, sans permis." },
  { k: "semi", nom: "Semi-rigide, 115 cv", detail: "huit places, permis bateau", prix: { 4: 290, 8: 450 }, photo: "golfe", texte: "Jusqu'aux Sanguinaires et au-delà, carte des mouillages remise au départ." },
  { k: "jetski", nom: "Jet-ski", detail: "deux places, permis côtier", prix: { 1: 120, 2: 220 }, photo: "jetski", texte: "Seul aux commandes, avec votre permis côtier." },
  { k: "guide", nom: "Jet-ski accompagné", detail: "sans permis, derrière le moniteur", prix: { 0.5: 90, 1: 160 }, photo: "jetski", texte: "Trente minutes ou une heure derrière le moniteur, sans permis." },
]

export const DUREES: [number, string][] = [[0.5, "30 min"], [1, "1 heure"], [2, "2 heures"], [4, "Demi-journée"], [8, "Journée"]]
export const nomDuree = (h: number) => DUREES.find(d => d[0] === h)![1]
export const prixMin = (p: Record<number, number>) => Math.min(...Object.values(p))
export const eur = (n: number) => n.toLocaleString("fr-FR") + " €"
export const hm = (m: number) => `${Math.floor(m / 60)} h${m % 60 ? " " + String(m % 60).padStart(2, "0") : ""}`
export const bateau = (k: string) => FLOTTE.find(f => f.k === k)!

// la mer du jour (démo : tirée de la date, toujours la même pour un jour donné)
const jourAn = (d: Date) => Math.round((+d - +new Date(d.getFullYear(), 0, 1)) / 864e5) + 1
const VENTS = ["Libecciu, sud-ouest", "Maestrale, nord-ouest", "Ponente, ouest", "Sciroccu, sud-est", "Tramuntana, nord"]
const graine = (d: Date, x: number) => ((Math.sin((d.getFullYear() * 400 + jourAn(d)) * x) * 10000) % 1 + 1) % 1
export function merDu(d: Date) {
  const kn = Math.round(4 + graine(d, 12.9898) * 22)
  return { kn, vent: VENTS[Math.floor(graine(d, 78.233) * 5)], drapeau: (kn < 15 ? "vert" : kn < 20 ? "orange" : "rouge") as "vert" | "orange" | "rouge" }
}
export const COULEUR_DRAPEAU = { vert: "#2E9E5B", orange: "#F08A24", rouge: "#D52B2B" }

// les prochains départs : toutes les demi-heures de 9 h à 18 h 30, les places libres tirées du jour
export const OUVRE = 9 * 60, DERNIER = 18 * 60 + 30
const TABLEAU: [string, number][] = [["kayak2", 1], ["paddle", 1], ["bateau", 2], ["kayak1", 2], ["guide", 0.5], ["semi", 4], ["jetski", 1]]
export type Depart = { jour: Date; t: number; k: string; h: number; libres: number }
export function departs(maintenant: Date): Depart[] {
  const jour = new Date(maintenant), m = maintenant.getHours() * 60 + maintenant.getMinutes()
  let debut = Math.max(OUVRE, Math.ceil((m + 20) / 30) * 30)
  if (debut > DERNIER) { jour.setDate(jour.getDate() + 1); debut = OUVRE }
  const out: Depart[] = []
  for (let t = debut; t <= DERNIER && out.length < 6; t += 30) {
    const [k, h] = TABLEAU[(t / 30 + jourAn(jour)) % TABLEAU.length]
    out.push({ jour, t, k, h, libres: Math.floor(graine(jour, 3.1 + t) * 4) })
  }
  return out
}
export const cleJour = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
export function nomJour(d: Date) {
  const a = new Date(); a.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0)
  return +x - +a === 0 ? "Aujourd'hui" : +x - +a === 864e5 ? "Demain" : x.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
}

// « Réserver » sur le tableau remplit le formulaire plus bas : les deux îlots se parlent par un événement
export type Choix = { k: string; h: number; jour: string; t: number }
export const choisir = (c: Choix) => window.dispatchEvent(new CustomEvent<Choix>("libecciu:choix", { detail: c }))

"use client"
// 08 Réserver : les listes déroulantes de shadcn/ui (Radix Select), le résumé encadré d'un BorderBeam (Magic UI),
// le bouton ShimmerButton (Magic UI) et la confirmation en toast (Sonner).
import { useEffect, useMemo, useState } from "react"
import { Toaster, toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { BorderBeam } from "./magicui/border-beam"
import { ShimmerButton } from "./magicui/shimmer-button"
import { bateau, cleJour, DERNIER, DUREES, eur, FLOTTE, hm, nomDuree, OUVRE, type Choix } from "./donnees"

const champ = "h-[52px] w-full rounded-none border border-[var(--ink)] bg-white px-[14px] text-base shadow-none data-[size=default]:h-[52px] [&_svg]:!text-[var(--ink)] [&_svg]:opacity-100"
const liste = "rounded-none border border-[var(--ink)] bg-white text-[var(--ink)]"

export default function Reserver() {
  const [jours, setJours] = useState<[string, string][]>([])
  const [k, setK] = useState("kayak1"), [h, setH] = useState("1"), [jour, setJour] = useState(""), [t, setT] = useState(String(OUVRE))
  const [nom, setNom] = useState(""), [tel, setTel] = useState("")

  useEffect(() => {   // les sept prochains jours, calculés dans le navigateur
    const j = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i)
      return [cleJour(d), i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })] as [string, string] })
    setJours(j); setJour(j[0][0])
    const prend = (e: Event) => { const c = (e as CustomEvent<Choix>).detail; setK(c.k); setH(String(c.h)); setJour(c.jour); setT(String(c.t)) }
    window.addEventListener("libecciu:choix", prend)
    return () => window.removeEventListener("libecciu:choix", prend)
  }, [])

  const b = bateau(k)
  const durees = DUREES.filter(([d]) => b.prix[d])
  const hh = b.prix[+h] ? +h : durees[0][0]
  const heures = useMemo(() => Array.from({ length: (DERNIER - OUVRE) / 30 + 1 }, (_, i) => OUVRE + i * 30), [])
  const nomDuJour = jours.find(j => j[0] === jour)?.[1] ?? ""

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim() || !tel.trim()) { toast.error("Il manque votre nom ou votre téléphone."); return }
    toast.success("Demande prête", { description: "Démonstration : la demande partirait au loueur, qui vous rappelle dans l'heure." })
  }

  return (
    <form className="grid book" onSubmit={envoyer} noValidate>
      <div className="fields">
        <div className="field"><label>L'embarcation</label>
          <Select value={k} onValueChange={v => { setK(v); if (!bateau(v).prix[+h]) setH(String(DUREES.find(([d]) => bateau(v).prix[d])![0])) }}>
            <SelectTrigger className={champ} aria-label="L'embarcation"><SelectValue /></SelectTrigger>
            <SelectContent className={liste}>{FLOTTE.map(f => <SelectItem key={f.k} value={f.k}>{f.nom}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="field"><label>La durée</label>
          <Select value={String(hh)} onValueChange={setH}>
            <SelectTrigger className={champ} aria-label="La durée"><SelectValue /></SelectTrigger>
            <SelectContent className={liste}>{durees.map(([d, l]) => <SelectItem key={d} value={String(d)}>{l} · {eur(b.prix[d])}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="field"><label>Le jour</label>
          <Select value={jour} onValueChange={setJour}>
            <SelectTrigger className={champ} aria-label="Le jour"><SelectValue placeholder="…" /></SelectTrigger>
            <SelectContent className={liste}>{jours.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="field"><label>Le départ</label>
          <Select value={t} onValueChange={setT}>
            <SelectTrigger className={champ} aria-label="Le départ"><SelectValue /></SelectTrigger>
            <SelectContent className={liste}>{heures.map(m => <SelectItem key={m} value={String(m)}>{hm(m)}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="field"><label htmlFor="fName">Votre nom</label><input id="fName" autoComplete="name" placeholder="Prénom et nom" value={nom} onChange={e => setNom(e.target.value)} /></div>
        <div className="field"><label htmlFor="fTel">Téléphone</label><input id="fTel" type="tel" autoComplete="tel" inputMode="tel" placeholder="06 00 00 00 00" value={tel} onChange={e => setTel(e.target.value)} /></div>
      </div>
      <div className="sum relative overflow-hidden" aria-live="polite">
        <small>Votre sortie</small>
        <b className="num">{eur(b.prix[hh])}</b>
        <p>{b.nom}, {nomDuree(hh).toLowerCase()}{nomDuJour && `, ${nomDuJour.toLowerCase()}`} à {hm(+t)}.</p>
        <ShimmerButton type="submit" className="send" borderRadius="0px" background="#0E1A26" shimmerColor="#F5C518">Envoyer la demande</ShimmerButton>
        <BorderBeam size={90} duration={7} colorFrom="#0E1A26" colorTo="#D52B2B" borderWidth={2} />
      </div>
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: 0, border: "1px solid #0E1A26", fontFamily: "Archivo, system-ui, sans-serif" } }} />
    </form>
  )
}

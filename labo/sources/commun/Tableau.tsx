"use client"
// 01 Prochains départs : le tableau de quai, animé avec Motion (les lignes arrivent l'une après l'autre,
// se réordonnent en douceur quand l'heure tourne).
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { bateau, choisir, cleJour, COULEUR_DRAPEAU, departs, hm, merDu, nomDuree, nomJour, type Depart } from "./donnees"

export default function Tableau() {
  const [now, setNow] = useState<Date | null>(null)
  const calme = useReducedMotion()
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id) }, [])
  if (!now) return <div className="board" style={{ minHeight: 520 }} />   // rendu serveur : place réservée, l'heure vient du navigateur

  const liste = departs(now), mer = merDu(liste[0].jour), jour = nomJour(liste[0].jour)
  const pris = (d: Depart) => d.libres === 0 || mer.drapeau === "rouge"
  const vers = (d: Depart) => {
    choisir({ k: d.k, h: d.h, jour: cleJour(d.jour), t: d.t })
    document.getElementById("reserver")?.scrollIntoView({ behavior: calme ? "auto" : "smooth" })
  }
  return (
    <div className="board">
      <div className="top">
        <span><b>{jour}{jour === "Demain" ? ", premiers départs" : ""}</b> · <span className="num">Il est {hm(now.getHours() * 60 + now.getMinutes())}</span></span>
        <span className="sea"><motion.i style={{ background: COULEUR_DRAPEAU[mer.drapeau] }} animate={calme ? undefined : { scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2.4 }} />Drapeau {mer.drapeau} · {mer.vent}, {mer.kn} nœuds</span>
      </div>
      <motion.div layout>
        <AnimatePresence initial={!calme}>
          {liste.map((d, i) => {
            const b = bateau(d.k), plein = pris(d)
            return (
              <motion.div key={`${cleJour(d.jour)}-${d.t}`} layout className={`row${plein ? " full" : ""}`}
                initial={calme ? false : { opacity: 0, y: 14 }} animate={{ opacity: plein ? .45 : 1, y: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ delay: calme ? 0 : i * .06, duration: .35, ease: [.23, 1, .32, 1] }}>
                <span className="t num">{hm(d.t)}</span>
                <span className="e">{b.nom}<small>{b.detail}</small></span>
                <span className="d">{nomDuree(d.h)}</span>
                <span className="left">{mer.drapeau === "rouge" ? "Pas de sortie" : d.libres === 0 ? "Complet" : `${d.libres} place${d.libres > 1 ? "s libres" : " libre"}`}</span>
                <motion.button className="pick" type="button" disabled={plein} onClick={() => vers(d)} whileTap={plein ? undefined : { scale: .96 }}>{plein ? "–" : "Réserver"}</motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
      <p className="note">Démonstration : les places libres changent chaque jour.</p>
    </div>
  )
}

"use client"
// Magic UI · MagicCard — Salle de sport : un halo suit la souris sur les cartes des formules.
import { MagicCard } from "../communaute/magicui/magic-card"

const F = [["Découverte", "offerte", "Une séance avec un coach pour faire le point."], ["Mensuel", "39 €", "Accès libre de 6 h à 22 h, cours compris."], ["Coaching", "45 €", "La séance individuelle, programme écrit."]]
export default function Formules() {
  return (
    <div className="formules">
      {F.map(([n, p, d]) => (
        <MagicCard key={n} className="carte-sport" gradientColor="#2A2A2A" gradientFrom="#E8FF3A" gradientTo="#FF4D2E" gradientSize={180}>
          <div className="p-5"><h4>{n}</h4><b>{p}</b><p>{d}</p></div>
        </MagicCard>
      ))}
    </div>
  )
}

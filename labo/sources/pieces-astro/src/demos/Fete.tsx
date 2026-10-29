"use client"
// Magic UI · Confetti — Boulangerie : des confettis quand la commande est envoyée.
import { useState } from "react"
import { ConfettiButton } from "../communaute/magicui/confetti"

export default function Fete() {
  const [ok, setOk] = useState(false)
  return (
    <div className="commande">
      <p>2 traditions, 4 croissants, 1 fiadone · <b>17,40 €</b> · à retirer demain à 7 h 30</p>
      <ConfettiButton className="btn-pain" onClick={() => setOk(true)} options={{ particleCount: 90, spread: 70, colors: ["#C9772B", "#F3D9A4", "#7A3E1D"] }}>Envoyer ma commande</ConfettiButton>
      <p className="merci" aria-live="polite">{ok ? "C'est noté, elle sera prête à 7 h 30." : ""}</p>
    </div>
  )
}

"use client"
// React Bits · CircularText — Boulangerie : le tampon qui tourne autour de la photo.
import CircularText from "../communaute/react-bits/CircularText"

export default function Tampon() {
  return (
    <div className="tampon">
      <img src="/images/boulangerie/croi.webp" alt="Croissants sur une planche" loading="lazy" />
      <div className="rond"><CircularText text="CUIT CE MATIN · FAIT MAISON · AJACCIO · " spinDuration={22} onHover="slowDown" size={150} fontSize={14} fontWeight={800} color="#3B2410" /></div>
    </div>
  )
}

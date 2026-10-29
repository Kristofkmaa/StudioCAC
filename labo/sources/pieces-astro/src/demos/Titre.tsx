"use client"
// Motion Primitives · TextEffect — Hébergement : le titre apparaît mot à mot, en sortant du flou.
import { useState } from "react"
import { TextEffect } from "../communaute/motion-primitives/text-effect"

export default function Titre() {
  const [n, setN] = useState(0)
  return (
    <div className="demo-hebergement">
      <img src="/images/villa/oliveraie-hero.webp" alt="" loading="lazy" />
      <div className="voile" />
      <div className="txt">
        <TextEffect key={n} per="word" preset="fade-in-blur" as="h3" speedReveal={1.1} className="titre-villa">Cinq chambres sous les oliviers, à vingt minutes de la mer.</TextEffect>
        <button type="button" className="rejouer" onClick={() => setN(n + 1)}>Rejouer</button>
      </div>
    </div>
  )
}

"use client"
// Motion Primitives · Magnetic — Garage : le bouton d'appel attire la souris.
import { Magnetic } from "../communaute/motion-primitives/magnetic"

export default function Aimant() {
  return (
    <div className="garage">
      <p className="plaque">Panne ? On vient vous chercher.</p>
      <Magnetic intensity={0.35} range={160} actionArea="parent">
        <a href="tel:+33400000000" className="btn-appel"><Magnetic intensity={0.12} range={160} actionArea="parent"><span>Appeler le garage</span></Magnetic></a>
      </Magnetic>
    </div>
  )
}

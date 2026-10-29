"use client"
// React Bits · Aurora — Spa : un fond lumineux qui ondule doucement (WebGL).
import Aurora from "../communaute/react-bits/Aurora"

export default function Aurore() {
  return (
    <div className="spa">
      <Aurora colorStops={["#9BB7A4", "#E8D9C4", "#7FA1A8"]} amplitude={0.9} blend={0.6} speed={0.6} />
      <div className="txt"><p className="petit">A Funtana · spa</p><h3>Une heure pour soi, sans regarder l'heure.</h3></div>
    </div>
  )
}

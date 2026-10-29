"use client"
// 03 Le ponton en quatre chiffres : le compteur de Magic UI (NumberTicker), qui monte quand la section arrive.
import { NumberTicker } from "./magicui/number-ticker"
import { BlurFade } from "./magicui/blur-fade"

const CHIFFRES: [number, string, string][] = [
  [7, "", "embarcations, du kayak une place au semi-rigide"],
  [0, "", "permis pour les kayaks, les paddles et le bateau de 6 chevaux"],
  [25, "′", "de pagaie jusqu'à la première crique"],
  [19, " h", "dernier retour au ponton, coucher de soleil compris"],
]

export default function Chiffres() {
  return (
    <div className="grid figs">
      {CHIFFRES.map(([n, suite, texte], i) => (
        <BlurFade key={i} inView delay={i * .08} className="f">
          <b className="num">{n === 0 ? "0" : <NumberTicker value={n} className="text-[var(--yellow)] tracking-[-.05em]" />}{suite}</b>
          <span>{texte}</span>
        </BlurFade>
      ))}
    </div>
  )
}

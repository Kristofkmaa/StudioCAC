"use client"
// L'en-tête numéroté de chaque section, qui apparaît en fondu flouté (BlurFade de Magic UI).
import { BlurFade } from "./magicui/blur-fade"

export default function Entete({ n, titre, texte }: { n: string; titre: string; texte?: string }) {
  return (
    <BlurFade inView inViewMargin="-80px" offset={14} direction="up" className="grid head">
      <span className="n">{n}</span><h2>{titre}</h2>{texte && <p>{texte}</p>}
    </BlurFade>
  )
}

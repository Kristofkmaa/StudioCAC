"use client"
// Magic UI · Highlighter — Immobilier : le surligneur dessiné à la main, déclenché à l'arrivée.
import { Highlighter } from "../communaute/magicui/highlighter"

export default function Surligne() {
  return (
    <p className="immo">
      Vous vendez ? L'<Highlighter action="highlight" color="#F2C8B8" isView>estimation est offerte</Highlighter>, sous 48 heures, et
      on vous explique le prix <Highlighter action="underline" color="#D2452B" isView>ligne par ligne</Highlighter>.
    </p>
  )
}

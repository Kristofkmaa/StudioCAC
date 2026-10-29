"use client"
// React Bits · Masonry — Fleuriste : la galerie en briques, qui s'ouvre en grand au toucher.
import Masonry from "../communaute/react-bits/Masonry"

const I = ["bouquet-bleu", "roses", "panier", "etal", "boutique", "planche-ciste", "planche-pavot", "planche-tournesol"]
export default function Galerie() {
  return <Masonry items={I.map((n, i) => ({ id: n, img: `/images/fleuriste/${n}.webp`, height: [420, 300, 360, 280, 320, 400, 340, 300][i], title: n.replace("planche-", "").replace("-", " ") }))}
    columns="auto" columnWidth={150} gap={10} radius={6} animateFrom="bottom" hoverEffect="zoom" captions="none" lightbox revealOnScroll />
}

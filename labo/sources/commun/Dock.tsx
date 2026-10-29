"use client"
// Le bandeau collant du téléphone (Appeler / Réserver), qui n'apparaît qu'une fois l'ouverture passée.
import { useEffect, useState } from "react"

export default function Dock() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const hero = document.querySelector(".hero")
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setOn(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  return <nav className={`dock${on ? " on" : ""}`} aria-label="Accès rapide"><a href="tel:+33400000000">Appeler</a><a href="#reserver">Réserver</a></nav>
}

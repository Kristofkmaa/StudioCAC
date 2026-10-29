import type { Metadata, Viewport } from "next"
import "../commun/styles.css"

export const metadata: Metadata = { title: "Libecciu (version Next.js), labo Saitora", robots: { index: false }, icons: { icon: "/favicon.svg" } }
export const viewport: Viewport = { themeColor: "#0F2A4A", viewportFit: "cover" }

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><link rel="stylesheet" href="/polices/archivo-1da6c8.css" /></head>
      <body>{children}</body>
    </html>
  )
}

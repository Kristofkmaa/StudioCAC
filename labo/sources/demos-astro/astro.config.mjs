import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// Construit dans labo/08-demos/ (GitHub Pages sert le dossier tel quel).
// Chaque page relit la démo en ligne (demo-*.html à la racine) au moment de la construction : rien n'est recopié à la main.
export default defineConfig({
  base: "/labo/08-demos",
  outDir: "../../08-demos",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})

import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// Construit dans labo/04-astro/ : GitHub Pages sert le dossier tel quel (pas d'étape de construction en ligne).
export default defineConfig({
  base: "/labo/04-astro",
  outDir: "../../04-astro",
  trailingSlash: "ignore",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})

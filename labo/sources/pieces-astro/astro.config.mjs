import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// Construit dans labo/07-pieces/ (GitHub Pages sert le dossier tel quel).
export default defineConfig({
  base: "/labo/07-pieces",
  outDir: "../../07-pieces",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})

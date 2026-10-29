import type { NextConfig } from "next"

// Export statique dans labo/05-next/ : GitHub Pages sert les fichiers tels quels (.nojekyll garde le dossier _next).
const config: NextConfig = {
  output: "export",
  basePath: "/labo/05-next",
  trailingSlash: true,
  images: { unoptimized: true },
}
export default config

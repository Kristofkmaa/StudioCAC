// Capture le haut de chaque démo pour les cartes de la page d'accueil (media/apercus/*.webp).
// Usage : npm i playwright && node outils/apercus.js   (ffmpeg requis pour la conversion WebP)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

const ROOT = path.resolve(__dirname, "..");
const DEMOS = fs.readdirSync(ROOT).filter(f => /^demo-.*\.html$/.test(f));

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "apercus-"));
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const file of DEMOS) {
    await page.goto("file://" + path.join(ROOT, file));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const png = path.join(tmp, file.replace(".html", ".png"));
    // on saute le bandeau « site de démonstration » pour un aperçu plus propre
    const top = await page.evaluate(() => { const d = document.querySelector(".demo"); return d ? d.offsetHeight : 0; });
    await page.screenshot({ path: png, clip: { x: 0, y: top, width: 1280, height: 800 } });
    const out = path.join(ROOT, "media/apercus", file.replace(/^demo-|\.html$/g, "") + ".webp");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-vf", "scale=720:450:flags=lanczos", "-quality", "78", out]);
    console.log(out);
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
})();

// Capture le haut de chaque démo, sur ordinateur et sur mobile, pour les cartes de la page d'accueil
// (media/apercus/<démo>.webp et <démo>-mobile.webp).
// Usage : npm i playwright && node outils/apercus.js [démo …]   (ffmpeg requis pour la conversion WebP)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

const ROOT = path.resolve(__dirname, "..");
// sans argument : toutes les démos ; sinon seulement celles nommées (node outils/apercus.js a-funtana)
const ONLY = process.argv.slice(2).map(n => `demo-${n.replace(/^demo-|\.html$/g, "")}.html`);
const DEMOS = fs.readdirSync(ROOT).filter(f => /^demo-.*\.html$/.test(f) && (!ONLY.length || ONLY.includes(f)));

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "apercus-"));
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: "fr-FR" });   // en français (Libecciu suit la langue du navigateur)
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "fr-FR" });
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

    await phone.goto("file://" + path.join(ROOT, file));
    await phone.evaluate(() => document.fonts.ready);
    await phone.waitForTimeout(800);
    const mtop = await phone.evaluate(() => { const d = document.querySelector(".demo"); return d ? d.offsetHeight : 0; });
    const mpng = path.join(tmp, file.replace(".html", "-m.png"));
    await phone.screenshot({ path: mpng, clip: { x: 0, y: mtop, width: 390, height: 760 } });
    const mout = out.replace(".webp", "-mobile.webp");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mpng, "-vf", "scale=300:-2:flags=lanczos", "-quality", "78", mout]);
    console.log(mout);
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
})();

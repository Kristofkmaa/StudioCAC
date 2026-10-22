// Génère l'image d'aperçu des liens (images/partage.jpg, 1200 × 630) à partir de outils/partage.html.
// Usage : npm i playwright && node outils/partage.js
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("file://" + path.join(__dirname, "partage.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, "..", "images", "partage.jpg"), type: "jpeg", quality: 86 });
  await browser.close();
  console.log("images/partage.jpg");
})();

// Vérifie une ou plusieurs pages avant de les livrer, comme un visiteur les verrait.
// Usage : node outils/verifier.js demo-libecciu.html clients/la-grotte-napoleon/index.html [--captures <dossier>]
// (playwright requis : npm i playwright dans un dossier de travail, puis NODE_PATH=<ce dossier>/node_modules ;
//  CHROMIUM=<chemin> pour utiliser un navigateur déjà installé.)
//
// Pour chaque page, à 360, 390, 768 et 1440 px de large :
//  - la page ne doit pas être plus large que l'écran ;
//  - aucune zone ne doit défiler sur le côté (règle de CLAUDE.md) ;
//  - aucune erreur dans la console ni dans le code.
// Avec --captures, enregistre la page entière sur ordinateur (1440) et sur téléphone (390), animations terminées,
// découpée en morceaux lisibles : <dossier>/<page>-ordinateur-1.jpg, <page>-telephone-1.jpg…
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const capIdx = args.indexOf("--captures");
const CAPTURES = capIdx >= 0 ? path.resolve(args[capIdx + 1]) : null;
const PAGES = args.filter((a, i) => !a.startsWith("--") && !(capIdx >= 0 && i === capIdx + 1));
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm" };

// un petit serveur local : certaines pages lisent des fichiers (themes.json), ce qui ne marche pas en file://
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});

(async () => {
  if (!PAGES.length) { console.log("Indiquez les pages à vérifier, par exemple : node outils/verifier.js demo-libecciu.html"); process.exit(1); }
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM, args: ["--no-sandbox"] } : {});
  let problems = 0;
  for (const page of PAGES) {
    for (const w of [360, 390, 768, 1440]) {
      const p = await browser.newPage({ viewport: { width: w, height: w < 800 ? 844 : 900 } });
      const errs = [];
      p.on("pageerror", e => errs.push("erreur : " + e.message));
      p.on("console", m => m.type() === "error" && errs.push("console : " + m.text()));
      await p.goto(base + page, { waitUntil: "networkidle" }).catch(e => errs.push("chargement : " + e.message));
      const found = await p.evaluate(() => {
        const out = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`la page dépasse de ${document.documentElement.scrollWidth - innerWidth} px`);
        document.querySelectorAll("body *").forEach(e => { const cs = getComputedStyle(e);
          if (/(auto|scroll)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
            out.push(`${e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].join(".") : "")} défile sur le côté`); });
        return out;
      });
      const all = [...found, ...errs];
      if (all.length) { problems += all.length; console.log(`✗ ${page} à ${w} px : ${all.join(" ; ")}`); }
      if (CAPTURES && (w === 1440 || w === 390)) {
        fs.mkdirSync(CAPTURES, { recursive: true });
        // les éléments qui apparaissent au défilement sont montrés tels qu'à l'arrivée, les images chargées
        await p.evaluate(() => { document.querySelectorAll("img").forEach(i => i.loading = "eager"); document.querySelectorAll(".rise,.ph,.rideau,.curtain,.zoom,.words").forEach(e => e.classList.add("on")); });
        await p.waitForTimeout(1800);
        const h = await p.evaluate(() => document.documentElement.scrollHeight), step = w === 1440 ? 2700 : 2400;
        const name = page.replace(/\/index\.html$/, "").replace(/[\/.]/g, "-").replace(/-html$/, "") + (w === 1440 ? "-ordinateur" : "-telephone");
        for (let y = 0, i = 1; y < h; y += step, i++)
          await p.screenshot({ path: path.join(CAPTURES, `${name}-${i}.jpg`), type: "jpeg", quality: 70, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(step, h - y) } });
      }
      await p.close();
    }
    console.log(`  ${page} vérifiée`);
  }
  await browser.close(); server.close();
  console.log(problems ? `${problems} problème(s) à corriger.` : "Tout est bon : rien ne dépasse, rien ne défile sur le côté, aucune erreur.");
  process.exit(problems ? 1 : 0);
})();

// Filme la composition de la vidéo Saitora image par image et assemble le film.
//   node outils/video.js [--essai]        (playwright et ffmpeg requis ; un serveur local est lancé le temps du tournage)
// Sorties : media/saitora-presentation.mp4 (H.264), .webm (VP9) et media/saitora-presentation.webp (image d'attente).
// « --essai » ne sort qu'une planche de douze images (media/video-saitora/essai.jpg), pour regarder avant de tout filmer.
const { chromium } = require("playwright");
const { execFileSync, spawn } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

const RACINE = path.resolve(__dirname, ".."), ESSAI = process.argv.includes("--essai");
const L = 1920, H = 1080, IPS = 30, PORT = 8791;

(async () => {
  const serveur = spawn("python3", ["-m", "http.server", String(PORT), "-d", RACINE], { stdio: "ignore" });
  await new Promise(r => setTimeout(r, 1200));
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "film-"));
  const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try {
    const page = await nav.newPage({ viewport: { width: L, height: H }, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:${PORT}/media/video-saitora/composition.html?film`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
    await page.waitForTimeout(600);
    const duree = await page.evaluate(() => window.DUREE);
    if (ESSAI) {
      const instants = [1.2, 3, 5.5, 9.3, 10.6, 13.2, 15.5, 19.5, 22, 25, 27, 31];
      for (const [k, t] of instants.entries()) { await page.evaluate(t => rendu(t), t); await page.screenshot({ path: path.join(dossier, `e${String(k).padStart(2, "0")}.jpg`), quality: 88 }); }
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-pattern_type", "glob", "-i", path.join(dossier, "e*.jpg"), "-vf", "scale=640:360,tile=4x3:padding=6:color=white", "-frames:v", "1", path.join(RACINE, "media/video-saitora/essai.jpg")]);
      console.log("planche d'essai : media/video-saitora/essai.jpg");
    } else {
      const n = Math.round(duree * IPS);
      for (let i = 0; i < n; i++) {
        await page.evaluate(t => rendu(t), i / IPS);
        await page.screenshot({ path: path.join(dossier, `i${String(i).padStart(5, "0")}.jpg`), quality: 94 });
        if (i % 150 === 0) console.log(`image ${i} / ${n}`);
      }
      const src = ["-y", "-loglevel", "error", "-framerate", String(IPS), "-i", path.join(dossier, "i%05d.jpg")];
      const sortie = path.join(RACINE, "media/saitora-presentation");
      execFileSync("ffmpeg", [...src, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", sortie + ".mp4"]);
      execFileSync("ffmpeg", [...src, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-an", sortie + ".webm"]);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(dossier, `i${String(Math.round(15 * IPS)).padStart(5, "0")}.jpg`), "-quality", "82", sortie + ".webp"]);
      for (const e of [".mp4", ".webm", ".webp"]) console.log(path.basename(sortie + e), Math.round(fs.statSync(sortie + e).size / 1024) + " Ko");
    }
  } finally { await nav.close(); serveur.kill(); fs.rmSync(dossier, { recursive: true, force: true }); }
})();

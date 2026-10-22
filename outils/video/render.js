// Génère media/showreel.mp4 (+ poster) à partir des démos du site.
// Usage : npm i playwright && node outils/video/render.js   (ffmpeg requis)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

const ROOT = path.resolve(__dirname, "../..");
const FPS = 30;
const SITES = [
  ["demo-villa-oliviers.html", "studiocac.fr/demos/villa-les-oliviers"],
  ["demo-table-du-port.html", "studiocac.fr/demos/la-table-du-port"],
  ["demo-durand-plomberie.html", "studiocac.fr/demos/durand-plomberie"],
  ["demo-coupe-and-co.html", "studiocac.fr/demos/coupe-and-co"],
  ["demo-pain-dore.html", "studiocac.fr/demos/au-pain-dore"],
  ["demo-bois-massif.html", "studiocac.fr/demos/atelier-bois-massif"],
];

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

  // 1. capture pleine page de chaque démo
  const shots = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const [file, url] of SITES) {
    await page.goto("file://" + path.join(ROOT, file));
    await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach(i => i.loading = "eager"));
    await page.waitForTimeout(1200);
    const out = path.join(tmp, file.replace(".html", ".png"));
    await page.screenshot({ path: out, fullPage: true });
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    shots.push({ img: "file://" + out, url, h });
  }

  // 2. rendu image par image de la scène
  const scene = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await scene.addInitScript(s => { window.SITES = s; }, shots);
  await scene.goto("file://" + path.join(__dirname, "scene.html"));
  await scene.waitForTimeout(1000);
  const loop = await scene.evaluate(() => window.LOOP);
  const frames = Math.round(loop * FPS);
  for (let f = 0; f < frames; f++) {
    await scene.evaluate(t => window.render(t), f / FPS);
    await scene.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  await browser.close();

  // 3. encodage
  const media = path.join(ROOT, "media");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(tmp, "f%04d.jpg"),
    "-vf", "scale=960:600:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-an", path.join(media, "showreel.mp4")]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(tmp, "f%04d.jpg"),
    "-vf", "scale=960:600:flags=lanczos", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1",
    "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", path.join(media, "showreel.webm")]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(tmp, "f0000.jpg"),
    "-vf", "scale=960:600:flags=lanczos", "-quality", "80", path.join(media, "showreel-poster.webp")]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`OK : ${frames} images, ${loop.toFixed(1)} s`);
})();

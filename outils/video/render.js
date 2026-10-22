// Génère la vidéo d'accueil (media/showreel.*) à partir de outils/video/scene.html.
// Usage : npm i playwright && node outils/video/render.js   (ffmpeg requis)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

const ROOT = path.resolve(__dirname, "../..");
const FPS = 30;

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  // captures de la démo racontée dans le film (ordinateur pleine page + mobile)
  const DEMO = "file://" + path.join(ROOT, "demo-table-du-port.html");
  const shots = { thumbs: fs.readdirSync(path.join(ROOT, "media/apercus")).filter(f => !f.includes("-mobile")).map(f => "../../media/apercus/" + f) };
  for (const [key, viewport, full] of [["desk", { width: 1280, height: 800 }, true], ["mob", { width: 390, height: 844 }, false]]) {
    const p = await browser.newPage({ viewport, deviceScaleFactor: key === "mob" ? 2 : 1 });
    await p.goto(DEMO);
    await p.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach(i => i.loading = "eager"));
    for (let y = 0; y < 6000; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
    const out = path.join(tmp, key + ".png");
    await p.screenshot({ path: out, fullPage: full });
    shots[key] = "file://" + out;
    if (full) shots.deskH = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.close();
  }

  const scene = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await scene.addInitScript(s => { window.SHOTS = s; }, shots);
  await scene.goto("file://" + path.join(__dirname, "scene.html"));
  await scene.evaluate(() => document.fonts.ready);
  await scene.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await scene.waitForTimeout(500);
  const [loop, poster] = await scene.evaluate(() => [window.LOOP, window.POSTER]);
  const frames = Math.round(loop * FPS);
  for (let f = 0; f < frames; f++) {
    await scene.evaluate(t => window.render(t), f / FPS);
    await scene.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  await browser.close();

  const media = path.join(ROOT, "media"), input = ["-framerate", String(FPS), "-i", path.join(tmp, "f%04d.jpg")];
  const scale = ["-vf", "scale=960:600:flags=lanczos"];
  const ff = args => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
  ff([...input, ...scale, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(media, "showreel.mp4")]);
  ff([...input, ...scale, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", path.join(media, "showreel.webm")]);
  // image d'attente : le site en ligne
  ff(["-i", path.join(tmp, `f${String(Math.round(poster * FPS)).padStart(4, "0")}.jpg`), ...scale, "-quality", "80", path.join(media, "showreel-poster.webp")]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`OK : ${frames} images, ${loop.toFixed(1)} s`);
})();

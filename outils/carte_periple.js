// Carte du périple de la Grotte Napoléon, de 1769 à 1804 (section « L'enfance d'Ajaccio » de l'accueil).
// Côtes : Natural Earth 1:10m (domaine public), paquet npm world-atlas@2.0.2, lu avec topojson-client@3.1.0.
//
//   mkdir /tmp/carte && cd /tmp/carte && npm pack world-atlas@2.0.2 topojson-client@3.1.0
//   tar xzf world-atlas-2.0.2.tgz && tar xzf topojson-client-3.1.0.tgz --transform 's/^package/tc/'
//   node outils/carte_periple.js /tmp/carte
//
// Écrit clients/la-grotte-napoleon/images/periple-terre.svg (les terres, appelées par <use>) et
// <dossier>/periple.html (le SVG de la carte et les étapes, à recopier dans index.html entre
// les commentaires « periple: début » et « periple: fin »). Les noms traduits ont un data-t (textes.js).
const fs = require("fs"), path = require("path");
const dossier = process.argv[2] || "/tmp/carte";
const tc = require(path.join(dossier, "tc/dist/topojson-client.js"));
const site = path.join(__dirname, "../clients/la-grotte-napoleon");

// projection : équirectangulaire, de l'Atlantique à l'Égypte
const LON = [-6, 34], LAT = [26.5, 52.5], k = Math.cos(40 * Math.PI / 180);
const W = 4000, sx = W / ((LON[1] - LON[0]) * k), H = Math.round((LAT[1] - LAT[0]) * sx);
const P = ([lo, la]) => [(lo - LON[0]) * k * sx, (LAT[1] - la) * sx];

// ---------- les terres ----------
function coupe(pts) { // Sutherland-Hodgman sur le cadre
  const m = 6, bords = [[p => p[0] >= -m, 0, -m], [p => p[0] <= W + m, 0, W + m], [p => p[1] >= -m, 1, -m], [p => p[1] <= H + m, 1, H + m]];
  for (const [dedans, axe, v] of bords) {
    const o = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const cut = () => { const t = (v - a[axe]) / (b[axe] - a[axe]); return axe ? [a[0] + t * (b[0] - a[0]), v] : [v, a[1] + t * (b[1] - a[1])]; };
      if (dedans(b)) { if (!dedans(a)) o.push(cut()); o.push(b); } else if (dedans(a)) o.push(cut());
    }
    pts = o; if (!pts.length) break;
  }
  return pts;
}
function simplifie(pts, tol) { // Douglas-Peucker
  if (pts.length < 4) return pts;
  const garde = new Uint8Array(pts.length); garde[0] = garde[pts.length - 1] = 1;
  const pile = [[0, pts.length - 1]];
  while (pile.length) {
    const [a, b] = pile.pop(); let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L; if (d > max) { max = d; idx = i; } }
    if (max > tol) { garde[idx] = 1; pile.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => garde[i]);
}
const t = JSON.parse(fs.readFileSync(path.join(dossier, "package/land-10m.json")));
const land = tc.feature(t, t.objects.land), g = land.features ? land.features[0].geometry : land.geometry;
let d = "";
for (const poly of (g.type === "Polygon" ? [g.coordinates] : g.coordinates)) for (const ring of poly) {
  let r = coupe(ring.map(P)); if (r.length < 3) continue;
  r = simplifie(r, .28); if (r.length < 3) continue;
  let surf = 0; r.forEach((p, i) => { const q = r[(i + 1) % r.length]; surf += p[0] * q[1] - q[0] * p[1]; });
  if (Math.abs(surf) < 6) continue; // îlots invisibles
  d += "M" + r.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
}
fs.writeFileSync(path.join(site, "images/periple-terre.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><path id="terre" d="${d}"/></svg>\n`);

// ---------- les lieux ----------
// [clé, lon, lat, nom (ou clé de traduction précédée de « t: »), décalage de l'étiquette en unités d'étiquette, étapes où il s'affiche]
const L = {
  ajaccio: [8.737, 41.919, "t:lieu-ajaccio", [-1, .35, "end"], [0, 1, 3, 4, 7]],
  calvi: [8.757, 42.567, "Calvi", [-1, .1, "end"], [4]],
  autun: [4.299, 46.951, "Autun", [-1, .35, "end"], [1]],
  brienne: [4.527, 48.392, "Brienne", [1, .35, "start"], [1, 2]],
  paris: [2.352, 48.857, "Paris", [-1, .35, "end"], [2, 3, 7, 8]],
  valence: [4.892, 44.933, "Valence", [-1, .35, "end"], [3]],
  toulon: [5.928, 43.124, "Toulon", [-1, 1.1, "end"], [4, 5, 6]],
  nice: [7.262, 43.710, "Nice", [.2, 1.25, "start"], [5]],
  montenotte: [8.370, 44.360, "Montenotte", [-1, -.6, "end"], [5]],
  lodi: [9.503, 45.314, "Lodi", [.2, 1.25, "start"], [5]],
  milan: [9.190, 45.464, "t:lieu-milan", [-.3, -.7, "end"], [5]],
  arcole: [11.283, 45.358, "Arcole", [1, .35, "start"], [5]],
  malte: [14.514, 35.899, "t:lieu-malte", [1, .35, "start"], [6]],
  alexandrie: [29.919, 31.200, "t:lieu-alexandrie", [-1, -.5, "end"], [6, 7]],
  caire: [31.236, 30.044, "t:lieu-caire", [-1, 1.4, "end"], [6]],
  frejus: [6.737, 43.433, "Fréjus", [.4, -.7, "start"], [7]],
};
// les trajets de chaque étape (la première n'en a pas)
const TRAJETS = [[], ["ajaccio", "autun", "brienne"], ["brienne", "paris"], ["paris", "valence", "ajaccio"], ["ajaccio", "calvi", "toulon"],
  ["toulon", "nice", "montenotte", "lodi", "milan", "arcole"], ["toulon", "malte", "alexandrie", "caire"], ["alexandrie", "ajaccio", "frejus", "paris"], []];
// le cadrage de chaque étape : les lieux à montrer (la vue garde les proportions de la carte, avec de l'air autour)
const VUES = [["ajaccio", "calvi"], ["ajaccio", "brienne", "autun"], ["brienne", "paris"], ["paris", "ajaccio"], ["ajaccio", "toulon", "calvi"],
  ["nice", "arcole", "milan"], ["toulon", "caire", "malte"], ["alexandrie", "paris", "ajaccio"], ["paris"]];
const ANNEES = ["1769", "1779", "1784", "1786", "1793", "1796", "1798", "1799", "1804"];
const RATIO = 1000 / 760, LARGEUR_MIN = 300;

const xy = n => P([L[n][0], L[n][1]]);
function vue(noms, min = LARGEUR_MIN) {
  const ps = noms.map(xy), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let w = Math.min(W, Math.max(min, (x1 - x0) * 1.5)), h = Math.max(w / RATIO, (y1 - y0) * 1.5); w = h * RATIO; if (w > W) { w = W; h = w / RATIO; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const x = Math.min(Math.max(0, cx - w / 2), W - w), y = Math.min(Math.max(0, cy - h / 2), H - h); // la vue reste dans la carte
  return [x, y, w, h].map(v => Math.round(v));
}
function trajet(noms) { // une courbe souple qui passe par chaque lieu (Catmull-Rom), un simple arc s'il n'y en a que deux
  const p = noms.map(xy), f = v => v.toFixed(1);
  if (p.length === 2) {
    const [[ax, ay], [bx, by]] = p, dx = bx - ax, dy = by - ay, cx = (ax + bx) / 2 - dy * .18, cy = (ay + by) / 2 + dx * .18;
    return { d: `M${f(ax)} ${f(ay)}Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`, fin: [bx, by], avant: [cx, cy] };
  }
  let d = `M${f(p[0][0])} ${f(p[0][1])}`, avant;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`; avant = c2;
  }
  return { d, fin: p[p.length - 1], avant };
}
function seg(tr, i) { // le trajet tiré en tirets, révélé par un masque qui se trace ; une flèche à l'arrivée
  const { d, fin, avant } = trajet(tr), ang = Math.atan2(fin[1] - avant[1], fin[0] - avant[0]) * 180 / Math.PI;
  return `<g class="seg" data-e="${i}"><mask id="trace${i}" maskUnits="userSpaceOnUse" x="-${W}" y="-${H}" width="${W * 3}" height="${H * 3}"><path class="rev" d="${d}" pathLength="1"/></mask>`
    + `<path class="ancien" d="${d}"/><path class="trait" d="${d}" mask="url(#trace${i})"/>`
    + `<path class="fleche" d="M-9 -5.5L0 0L-9 5.5" style="--fx:${fin[0].toFixed(1)}px;--fy:${fin[1].toFixed(1)}px;--fa:${ang.toFixed(1)}deg"/></g>`;
}
const nom = n => L[n][2].startsWith("t:") ? `<text data-t="${L[n][2].slice(2)}"></text>` : `<text>${L[n][2]}</text>`;
const lieux = Object.keys(L).map(n => {
  const [x, y] = xy(n), [ox, oy, ancre] = L[n][3];
  return `<g class="lieu" data-l="${n}" data-e="${L[n][4].join(" ")}" style="--x:${x.toFixed(1)};--y:${y.toFixed(1)};--ox:${ox};--oy:${oy}" text-anchor="${ancre}"><circle class="halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"/><circle class="pt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"/>${nom(n)}</g>`;
}).join("\n");
const regions = [["GALLIA", 2.2, 46.6], ["ITALIA", 14.6, 41.5], ["HISPANIA", -3.6, 40.3], ["AFRICA", 6.5, 33.2], ["AEGYPTUS", 29.4, 27.6], ["CORSICA", 10.45, 42.35]]
  .map(([t, lo, la]) => { const [x, y] = P([lo, la]); return `<text class="region" x="${x.toFixed(0)}" y="${y.toFixed(0)}">${t}</text>`; }).join("");
const mers = [["MARE MEDITERRANEUM", 13.5, 37.6]].map(([t, lo, la]) => { const [x, y] = P([lo, la]); return `<text class="mer" x="${x.toFixed(0)}" y="${y.toFixed(0)}">${t}</text>`; }).join("");

const v0 = vue(VUES[0]);
const html = `<!-- periple: début (fait par outils/carte_periple.js) -->
    <div class="periple" id="periple">
      <figure class="carte-h rise" id="carteH" data-e="0">
        <svg class="carte-svg" viewBox="${v0.join(" ")}" data-plein="0 0 ${W} ${H}" role="img" aria-labelledby="carteTitre">
          <title id="carteTitre" data-t="h-carte">Carte : d’Ajaccio à Paris, 1769-1804</title>
          <rect class="mer-fond" x="-${W}" y="-${H}" width="${W * 3}" height="${H * 3}"/>
          <!-- les lignes d'eau des cartes gravées : deux contours qui suivent la côte au large (un trait, puis la mer par-dessus), puis la terre -->
          <use class="onde o2" href="images/periple-terre.svg#terre"/><use class="onde o2 mer" href="images/periple-terre.svg#terre"/>
          <use class="onde o1" href="images/periple-terre.svg#terre"/><use class="onde o1 mer" href="images/periple-terre.svg#terre"/>
          <use class="terre" href="images/periple-terre.svg#terre"/>
          <g class="noms">${regions}${mers}</g>
          <g class="trajets">${TRAJETS.map((tr, i) => tr.length ? seg(tr, i) : "").join("")}<circle class="voyageur"/></g>
          <g class="lieux">
${lieux}
          </g>
        </svg>
        <p class="sacre-titre" data-t="pe-sacre">Napoléon Ier, Empereur des Français</p>
        <img class="couronne-sacre" src="images/laurier-sacre.webp" alt="" width="520" height="339" loading="lazy" decoding="async">
        <p class="annee-carte" aria-hidden="true">1769</p>
        <div class="dates" role="group" data-t-aria="h-dates" aria-label="Dates">${ANNEES.map((a, i) => `<button type="button" data-aller="${i}" aria-pressed="${i ? "false" : "true"}">${a}</button>`).join("")}</div>
      </figure>
      <ol class="etapes">
${ANNEES.map((a, i) => `        <li data-e="${i}" data-vue="${vue(VUES[i], i === 8 ? 900 : LARGEUR_MIN).join(" ")}"><b>${a}</b><span class="lieu-etape" data-t="pe-${i}-lieu"></span><p data-t="pe-${i}"></p></li>`).join("\n")}
      </ol>
    </div>
    <!-- periple: fin -->`;
fs.writeFileSync(path.join(dossier, "periple.html"), html + "\n");
console.log("terres", (d.length / 1024).toFixed(0), "Ko ; carte", W, "x", H, "; étapes", ANNEES.length);

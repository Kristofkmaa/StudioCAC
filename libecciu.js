// Libecciu : le script commun aux cinq pages (accueil, flotte, prix, criques, réserver).
// Chaque bloc ne s'exécute que si la page contient l'élément qu'il remplit.
(() => {
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
const eur = n => n.toLocaleString("fr-FR") + " €";
const hm = m => `${Math.floor(m / 60)} h${m % 60 ? " " + String(m % 60).padStart(2, "0") : ""}`;
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
const OPEN = 9 * 60, LAST = 18 * 60 + 30, CLOSE = 19 * 60;

// ——— la flotte : [clé, nom, détail, prix par durée en heures, photo, cadrage, texte]
const FLEET = [
  ["kayak1", "Kayak une place", "dès 12 ans", { 1: 15, 2: 25, 4: 40, 8: 60 }, "kayak", "50% 52%", "Léger et stable, pour longer la côte jusqu'à la crique aux pins."],
  ["kayak2", "Kayak deux places", "dès 6 ans avec un adulte", { 1: 20, 2: 35, 4: 55, 8: 80 }, "kayak", "50% 32%", "Un adulte derrière, un enfant devant : le plus demandé en famille."],
  ["paddle", "Paddle", "dès 12 ans", { 1: 15, 2: 25, 4: 40 }, "paddle", "50% 50%", "Pour le calme du matin, quand l'eau est un miroir."],
  ["bateau", "Bateau sans permis, 6 cv", "cinq places", { 2: 90, 4: 140, 8: 220 }, "bateau", "50% 10%", "Une coque ouverte et un petit moteur : la baie et les criques proches, sans permis."],
  ["semi", "Semi-rigide, 115 cv", "huit places, permis bateau", { 4: 290, 8: 450 }, "golfe", "70% 60%", "Jusqu'aux Sanguinaires et au-delà, carte des mouillages remise au départ."],
  ["jetski", "Jet-ski", "deux places, permis côtier", { 1: 120, 2: 220 }, "jetski", "50% 8%", "Seul aux commandes, avec votre permis côtier."],
  ["guide", "Jet-ski accompagné", "sans permis, derrière le moniteur", { 0.5: 90, 1: 160 }, "jetski", "30% 22%", "Trente minutes ou une heure derrière le moniteur, sans permis."],
];
const DUR = [[0.5, "30 min"], [1, "1 heure"], [2, "2 heures"], [4, "Demi-journée"], [8, "Journée"]];
const durName = h => DUR.find(d => d[0] === h)[1];
const minPrice = p => Math.min(...Object.values(p));
const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// ——— 24 : chaque caractère d'un prix remonte à sa place
const roule = el => { if (calme) return; const t = el.textContent; el.classList.add("roule"); el.setAttribute("aria-label", t);
  el.innerHTML = [...t].map((c, k) => /\s/.test(c) ? c : `<span aria-hidden="true" style="--k:${k}">${esc(c)}</span>`).join(""); };

// ——— ouvert maintenant ? (la ligne du haut de chaque page)
{ const E = $("etat"); if (E) { const n = new Date(), m = n.getHours() * 60 + n.getMinutes(), ouvert = m >= OPEN && m < CLOSE;
  E.classList.toggle("ferme", !ouvert);
  E.querySelector("span").textContent = ouvert ? `Ouvert, dernier retour à ${hm(CLOSE)}` : m < OPEN ? `Fermé, le ponton ouvre à ${hm(OPEN)}` : `Fermé, le ponton rouvre demain à ${hm(OPEN)}`; } }

// ——— le menu plein écran (téléphone)
{ const F = $("feuille"), B = $("menuBtn"); if (F && B) {
  const met = o => { F.classList.toggle("ouverte", o); B.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; (o ? $("fermerBtn") : B).focus(); };
  B.addEventListener("click", () => met(true)); $("fermerBtn").addEventListener("click", () => met(false));
  addEventListener("keydown", e => { if (e.key === "Escape" && F.classList.contains("ouverte")) met(false); }); } }

// ——— la mer du jour (démo : tirée de la date, toujours la même pour un jour donné)
const doy = d => Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1;
const WINDS = ["Libecciu, sud-ouest", "Maestrale, nord-ouest", "Ponente, ouest", "Sciroccu, sud-est", "Tramuntana, nord"];
const seed = (d, x) => ((Math.sin((d.getFullYear() * 400 + doy(d)) * x) * 10000) % 1 + 1) % 1;
const seaOf = d => { const kn = Math.round(4 + seed(d, 12.9898) * 22); return { kn, wind: WINDS[Math.floor(seed(d, 78.233) * 5)], flag: kn < 15 ? "vert" : kn < 20 ? "orange" : "rouge" }; };
const FC = { vert: "#1E9E62", orange: "#F08A24", rouge: "#D8362B" };
const merHtml = s => `<i style="background:${FC[s.flag]}"></i>Drapeau ${s.flag} · ${esc(s.wind)}, ${s.kn} nœuds`;
document.querySelectorAll("[data-mer]").forEach(el => { el.innerHTML = merHtml(seaOf(new Date())); });

// ——— les prochains départs : toutes les demi-heures de 9 h à 18 h 30, les places libres tirées du jour
const BOARD = [["kayak2", 1], ["paddle", 1], ["bateau", 2], ["kayak1", 2], ["guide", 0.5], ["semi", 4], ["jetski", 1]];
function departures(now) {
  let day = new Date(now), m = now.getHours() * 60 + now.getMinutes(), start = Math.max(OPEN, Math.ceil((m + 20) / 30) * 30);
  if (start > LAST) { day.setDate(day.getDate() + 1); start = OPEN; }
  const out = [];
  for (let t = start; t <= LAST && out.length < 6; t += 30) { const [k, h] = BOARD[(t / 30 + doy(day)) % BOARD.length]; out.push({ day, t, k, h, left: Math.floor(seed(day, 3.1 + t) * 4) }); }
  return out;
}
const dayLabel = d => { const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0);
  return x - t === 0 ? "Aujourd'hui" : x - t === 864e5 ? "Demain" : x.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); };
function renderBoard() {
  const now = new Date(), deps = departures(now), s = seaOf(deps[0].day);
  $("qJour").textContent = dayLabel(deps[0].day) + (dayLabel(deps[0].day) === "Demain" ? ", premiers départs" : "");
  $("qHeure").textContent = "Il est " + hm(now.getHours() * 60 + now.getMinutes());
  $("qMer").innerHTML = merHtml(s);
  $("lignes").innerHTML = deps.map(d => { const f = FLEET.find(x => x[0] === d.k), plein = d.left === 0 || s.flag === "rouge";
    return `<div class="ligne${plein ? " plein" : ""}"><span class="h num">${hm(d.t)}</span><span class="quoi">${esc(f[1])}<small>${esc(f[2])}</small></span><span class="duree">${durName(d.h)}</span><span class="reste">${s.flag === "rouge" ? "Pas de sortie" : d.left === 0 ? "Complet" : d.left + (d.left > 1 ? " places libres" : " place libre")}</span><a class="btn" ${plein ? 'aria-disabled="true" tabindex="-1"' : `href="libecciu-reserver.html?bateau=${d.k}&duree=${d.h}&jour=${dayKey(d.day)}&heure=${d.t}"`}>${plein ? "–" : "Réserver"}</a></div>`; }).join("");
}
if ($("lignes")) { renderBoard(); setInterval(renderBoard, 60000); }

// ——— accueil : le sommaire illustré de la flotte (la photo suit la ligne survolée ou touchée)
{ const S = $("sommaire"); if (S) { const FAM = [["Kayaks", "kayak1", "kayak", "50% 60%", 15], ["Paddle", "paddle", "paddle", "50% 50%", 15], ["Bateau sans permis", "bateau", "bateau", "50% 18%", 90], ["Semi-rigide", "semi", "golfe", "70% 60%", 290], ["Jet-skis", "jetski", "jetski", "50% 10%", 90]];
  S.querySelector("ul").innerHTML = FAM.map(([n, k, , , p], i) => `<li class="${i ? "" : "actif"}"><a href="libecciu-flotte.html#${k}"><span class="i num">${String(i + 1).padStart(2, "0")}</span><h3>${n}</h3><span class="de">dès ${eur(p)}</span></a></li>`).join("");
  const V = S.querySelector(".vue"); V.innerHTML = FAM.map(([n, , img, pos], i) => `<img src="images/libecciu/${img}.webp" alt="${i ? "" : esc(n)}" style="object-position:${pos}" class="${i ? "" : "vu"}" loading="lazy">`).join("");
  const li = [...S.querySelectorAll("li")], im = [...V.children], va = i => { li.forEach((l, k) => l.classList.toggle("actif", k === i)); im.forEach((m, k) => m.classList.toggle("vu", k === i)); };
  li.forEach((l, i) => { l.addEventListener("pointerenter", () => va(i)); l.querySelector("a").addEventListener("focus", () => va(i)); }); } }

// ——— la page de la flotte : une ligne par embarcation
{ const B = $("bateaux"); if (B) B.innerHTML = FLEET.map(([k, n, d, p, img, pos, txt], i) => `
  <article class="grid bateau" id="${k}"><span class="i num">${String(i + 1).padStart(2, "0")}</span>
    <figure><img src="images/libecciu/${img}.webp" alt="" style="object-position:${pos}" width="1000" height="750" loading="${i < 2 ? "eager" : "lazy"}"></figure>
    <div class="txt"><h2>${esc(n)}</h2><p class="qui">${esc(d)}</p><p>${esc(txt)}</p>
      <ul class="tarifs">${DUR.filter(([h]) => p[h]).map(([h, l]) => `<li><span>${l}</span><b class="num">${eur(p[h])}</b></li>`).join("")}</ul>
      <a class="btn" href="libecciu-reserver.html?bateau=${k}">Réserver cette embarcation</a></div>
  </article>`).join(""); }

// ——— la page des prix : le tableau (une fiche par embarcation sur téléphone) et les trois formules
{ const T = $("pTable"); if (T) { T.innerHTML = `<thead><tr><th>Embarcation</th>${DUR.map(([, l]) => `<th>${l}</th>`).join("")}</tr></thead><tbody>` +
    FLEET.map(([, n, d, p]) => `<tr><td><b>${esc(n)}</b><small>${esc(d)}</small></td>${DUR.map(([h, l]) => p[h] ? `<td class="p" data-l="${l}">${eur(p[h])}</td>` : `<td class="non">–</td>`).join("")}</tr>`).join("") + "</tbody>";
  $("formules").innerHTML = [["Coucher de soleil", 120, "Bateau sans permis, les deux heures avant la nuit, glacière offerte.", "var(--corail)"], ["Journée aux Sanguinaires", 390, "Semi-rigide à la journée, carte des mouillages et conseils du matin.", "var(--eau)"], ["Baptême de jet-ski", 90, "Trente minutes derrière le moniteur, sans permis, dès 16 ans pour conduire.", "var(--encre)"]]
    .map(([n, p, d, c]) => `<div class="fo" style="--c:${c}"><h3>${n}</h3><span class="pr num">${p} €</span><p>${d}</p></div>`).join(""); } }

// ——— la page « réserver » : le formulaire et le prix (les choix peuvent arriver par l'adresse, depuis le tableau des départs ou la flotte)
{ const F = $("resa"); if (F) {
  $("fBoat").innerHTML = FLEET.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join("");
  const fillDur = () => { const p = FLEET.find(f => f[0] === $("fBoat").value)[3], keep = $("fDur").value;
    $("fDur").innerHTML = DUR.filter(([h]) => p[h]).map(([h, l]) => `<option value="${h}">${l} · ${eur(p[h])}</option>`).join("");
    if ([...$("fDur").options].some(o => o.value === keep)) $("fDur").value = keep; };
  $("fDay").innerHTML = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return `<option value="${dayKey(d)}">${i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</option>`; }).join("");
  $("fTime").innerHTML = Array.from({ length: (LAST - OPEN) / 30 + 1 }, (_, i) => `<option value="${OPEN + i * 30}">${hm(OPEN + i * 30)}</option>`).join("");
  let dernier = "";
  const update = () => { const f = FLEET.find(x => x[0] === $("fBoat").value), h = +$("fDur").value, prix = eur(f[3][h]);
    if (prix !== dernier) { dernier = $("sPrice").textContent = prix; roule($("sPrice")); }
    $("sTxt").textContent = `${f[1]}, ${durName(h).toLowerCase()}, ${$("fDay").selectedOptions[0].text.toLowerCase()} à ${$("fTime").selectedOptions[0].text}.`; };
  const q = new URLSearchParams(location.search), pose = (id, v) => { if (v && [...$(id).options].some(o => o.value === v)) $(id).value = v; };
  pose("fBoat", q.get("bateau")); fillDur(); pose("fDur", q.get("duree")); pose("fDay", q.get("jour")); pose("fTime", q.get("heure")); update();
  $("fBoat").addEventListener("change", () => { fillDur(); update(); });
  ["fDur", "fDay", "fTime"].forEach(id => $(id).addEventListener("change", update));
  F.addEventListener("submit", e => { e.preventDefault(); const bon = $("fName").value.trim() && $("fTel").value.trim();
    $("ok").textContent = bon ? "Démonstration : la demande partirait au loueur, qui vous rappelle dans l'heure." : "Il manque votre nom ou votre téléphone.";
    if (bon) { const b = F.querySelector(".btn"); b.classList.add("fait"); b.textContent = "✓ Demande envoyée"; setTimeout(() => { b.classList.remove("fait"); b.textContent = "Envoyer la demande"; }, 3200); } }); } }

// ——— la barre du bas (téléphone) : seulement une fois le haut de la page passé
{ const Q = document.querySelector(".quai-bas"), H = document.querySelector("[data-haut]");
  if (Q && H) new IntersectionObserver(([e]) => Q.classList.toggle("on", !e.isIntersecting && e.boundingClientRect.top < 0)).observe(H); }

// ——— les mouvements de la banque (animations/mouvements.html) : 02 blocs en décalé, 04 chiffres qui comptent,
// 14 heures du tableau qui se décodent, 33 frise de la journée
if (!calme) {
  document.querySelectorAll(".mosaique>*").forEach((el, i) => el.style.setProperty("--i", i));
  const compte = el => { const n = el && [...el.childNodes].find(c => c.nodeType === 3 && /\d/.test(c.textContent)); if (!n) return; const m = n.textContent.match(/^(\D*)(\d+)(.*)$/s), to = +m[2]; if (!to) return;
    const t0 = performance.now(), f = t => { const p = Math.min(1, (t - t0) / 1200); n.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - p, 3))) + m[3]; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const decode = () => document.querySelectorAll("#lignes .h").forEach((el, i) => { const fin = el.textContent, t0 = performance.now(), dur = 450 + i * 130;
    const f = t => { if ((t - t0) / dur >= 1) { el.textContent = fin; return; } el.textContent = fin.replace(/\d/g, () => Math.floor(Math.random() * 10)); setTimeout(() => requestAnimationFrame(f), 45); }; requestAnimationFrame(f); });
  const vu = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; vu.unobserve(e.target); const el = e.target; el.classList.add("on");
    if (el.classList.contains("quai")) decode();
    if (el.matches(".chiffres .f, .criques .c")) compte(el.querySelector("b, .min")); }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".sec .chapo, .quai, .sommaire ul, .sommaire .vue, .chiffres .f, .ponton .txt, .ponton figure, .appel p, .bateau, .tw, .formules .fo, .questions .q, .criques .c, .large, .reserver .infos, .carte").forEach(el => { el.classList.add("leve"); vu.observe(el); });
  [".chiffres .f", ".formules .fo", ".criques .c", ".questions .q"].forEach(q => document.querySelectorAll(q).forEach((el, k) => el.style.setProperty("--d", (k % 4) * 90 + "ms")));
  const J = document.querySelector(".jour"); if (J) { J.classList.add("frise"); [...J.children].forEach((li, k) => li.style.setProperty("--i", k)); vu.observe(J); }
}
})();

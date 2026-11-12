// CioCio maison : le script commun aux trois pages. Chaque bloc ne s'exécute que si la page contient ce qu'il remplit.
(() => {
const $ = id => document.getElementById(id);
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const cle = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const jour = s => { const [a, m, j] = s.split("-").map(Number); return new Date(a, m - 1, j); };
const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dit = d => `${d.getDate()}${d.getDate() === 1 ? "er" : ""} ${MOIS[d.getMonth()]}`;
const eur = n => n.toLocaleString("fr-FR") + " €";

/* ——— La saison : de juin à septembre. Hors saison, on montre l'été suivant.
   EXEMPLE À VALIDER : les prix par nuit et les semaines prises sont inventés pour la maquette.
   À brancher sur le vrai calendrier du propriétaire (voir NOTES.md). */
const auj = new Date(); auj.setHours(0, 0, 0, 0);
const AN = auj.getMonth() > 8 ? auj.getFullYear() + 1 : auj.getFullYear();
const SAISON = [5, 6, 7, 8];                                   // juin, juillet, août, septembre
const NUIT = { 5: 220, 6: 320, 7: 360, 8: 220 };               // prix d'une nuit selon le mois (à valider)
const debut = new Date(AN, 5, 1), fin = new Date(AN, 8, 30);
const premierMois = auj >= debut && auj <= fin ? auj.getMonth() : 5;   // le mois en cours en avant, pendant la saison
// les semaines vont du samedi au samedi ; une semaine sur trois environ est déjà prise (tirage fixe, pour la maquette)
const samedis = []; for (let d = new Date(debut); d <= fin; d = plus(d, 1)) if (d.getDay() === 6) samedis.push(new Date(d));
const prise = s => ((s.getDate() * 7 + s.getMonth() * 13 + AN) % 3) === 0;
const PRIS = new Set(); samedis.filter(prise).forEach(s => { for (let i = 0; i < 7; i++) PRIS.add(cle(plus(s, i))); });
const libre = d => d >= debut && d <= fin && d >= auj && !PRIS.has(cle(d));
const prixSejour = (a, b) => { let t = 0; for (let d = new Date(a); d < b; d = plus(d, 1)) t += NUIT[d.getMonth()] || NUIT[8]; return t; };

/* ——— accueil : l'été, semaine par semaine (l'idée vivante) */
{ const Z = $("semaines"); if (Z) { let m = premierMois;
  const boutons = $("mois");
  const dessine = () => {
    boutons.replaceChildren(...SAISON.map(k => { const b = document.createElement("button"); b.type = "button"; b.textContent = MOIS[k]; b.setAttribute("aria-pressed", k === m); b.onclick = () => { m = k; dessine(); }; return b; }));
    const liste = samedis.filter(s => s.getMonth() === m);
    Z.innerHTML = liste.map(s => { const f = plus(s, 7), pr = prise(s) || s < auj, quand = `Du samedi ${dit(s)} au samedi ${dit(f)}`;
      return pr ? `<li><div class="prise"><span class="dates">${quand}</span><span class="etat">Déjà prise</span><span class="prix"></span><span></span></div></li>`
        : `<li><a href="reserver.html?du=${cle(s)}&au=${cle(f)}"><span class="dates">${quand}</span><span class="etat">Libre</span><span class="prix num">${eur(prixSejour(s, f))} la semaine</span><span class="va" aria-hidden="true">→</span></a></li>`; }).join("");
    $("saison").textContent = `Été ${AN}`; };
  dessine(); } }

/* ——— accueil : le tour de la maison (58, adapté : le cylindre tourne dans son cadre, rien ne défile sur le côté) */
{ const T = $("tour"); if (T) { const figs = [...T.querySelectorAll("figure")], n = figs.length; let i = 0, a = 0;
  figs.forEach((f, k) => f.style.setProperty("--i", k));
  const va = k => { i = k; a = -k * 60; T.style.setProperty("--a", a + "deg"); const f = figs[((k % n) + n) % n];
    $("tourNom").firstChild.textContent = f.dataset.nom; $("tourTxt").textContent = f.dataset.txt; };
  $("tourAvant").onclick = () => va(i - 1); $("tourApres").onclick = () => va(i + 1);
  // au doigt ou à la souris : on tire la roue, elle se cale sur la photo la plus proche (un mouvement court, sans élan)
  let x0 = null, a0 = 0;
  T.addEventListener("pointerdown", e => { x0 = e.clientX; a0 = a; T.classList.add("tient"); });
  addEventListener("pointermove", e => { if (x0 === null) return; a = a0 + (e.clientX - x0) * .22; T.style.setProperty("--a", a + "deg"); });
  const lache = () => { if (x0 === null) return; x0 = null; T.classList.remove("tient"); va(Math.round(-a / 60)); };
  addEventListener("pointerup", lache); addEventListener("pointercancel", lache);
  T.addEventListener("keydown", e => { if (e.key === "ArrowLeft") va(i - 1); if (e.key === "ArrowRight") va(i + 1); });
  va(0); } }

/* ——— réserver : le calendrier (82 : on touche l'arrivée puis le départ, la plage se remplit, le prix suit) */
{ const J = $("jours"); if (J) { let m = premierMois, arr = null, dep = null, avis = "";
  const ete = d => d.getMonth() === 6 || d.getMonth() === 7;       // juillet et août : du samedi au samedi (règle à valider)
  const q = new URLSearchParams(location.search);
  if (q.get("du") && q.get("au")) { const a = jour(q.get("du")), b = jour(q.get("au")); let bon = b > a; for (let d = new Date(a); d < b && bon; d = plus(d, 1)) bon = libre(d); if (bon) { arr = a; dep = b; m = a.getMonth(); } }
  const boutons = $("mois");
  const libreEntre = (a, b) => { for (let d = new Date(a); d < b; d = plus(d, 1)) if (!libre(d)) return false; return true; };
  const resume = () => {
    const Q = $("quand"), P = $("prix"), F = $("resaForm");
    if (arr && dep) { const n = Math.round((dep - arr) / 864e5); Q.textContent = `Du ${JOURS[arr.getDay()]} ${dit(arr)} au ${JOURS[dep.getDay()]} ${dit(dep)}, ${n} nuit${n > 1 ? "s" : ""}.`; P.textContent = eur(prixSejour(arr, dep)); F.hidden = false; }
    else if (avis) { Q.textContent = avis; P.textContent = "—"; F.hidden = true; }
    else { Q.textContent = arr ? `Arrivée le ${JOURS[arr.getDay()]} ${dit(arr)}. Touchez maintenant le jour du départ.` : "Touchez un jour libre : c'est le jour où vous arrivez."; P.textContent = "—"; F.hidden = true; } };
  const dessine = () => {
    boutons.replaceChildren(...SAISON.map(k => { const b = document.createElement("button"); b.type = "button"; b.textContent = MOIS[k]; b.setAttribute("aria-pressed", k === m); b.onclick = () => { m = k; dessine(); }; return b; }));
    const p = new Date(AN, m, 1), nb = new Date(AN, m + 1, 0).getDate(), vide = (p.getDay() + 6) % 7;
    J.innerHTML = ["L", "M", "M", "J", "V", "S", "D"].map(x => `<span class="jn">${x}</span>`).join("") + "<span></span>".repeat(vide) +
      Array.from({ length: nb }, (_, k) => { const d = new Date(AN, m, k + 1), l = libre(d) || (arr && !dep && d > arr && libreEntre(arr, d)), bout = (arr && +d === +arr) || (dep && +d === +dep), dans = arr && dep && d > arr && d < dep, attend = l && ete(d) && d.getDay() !== 6 && !dans;
        return `<button type="button" data-j="${cle(d)}" class="${l ? "" : "pris"}${bout ? " bout" : ""}${dans ? " dans" : ""}${attend ? " attend" : ""}"${l ? "" : " disabled"} aria-label="${dit(d)}${l ? "" : ", déjà pris"}">${k + 1}</button>`; }).join("");
    $("saison").textContent = `Été ${AN}`; resume(); };
  J.addEventListener("click", e => { const b = e.target.closest("button[data-j]"); if (!b || b.disabled) return; const d = jour(b.dataset.j);
    avis = "";
    if (ete(d) && d.getDay() !== 6) { avis = "En juillet et en août, on arrive et on repart le samedi : touchez un samedi."; if (dep) { arr = dep = null; } }
    else if (!arr || dep || d <= arr || !libreEntre(arr, d)) { arr = d; dep = null; }
    else if ((d - arr) / 864e5 < 3) avis = "Trois nuits au moins : touchez un jour de départ plus tard.";
    else dep = d;
    $("retour").textContent = ""; dessine(); });
  dessine(); } }

/* ——— les formulaires (26 : le bouton confirme d'une coche). Maquette : rien n'est envoyé. */
document.querySelectorAll("form.formulaire").forEach(F => F.addEventListener("submit", e => { e.preventDefault(); const R = F.querySelector(".retour"), B = F.querySelector(".envoi");
  const manque = [...F.querySelectorAll("[required]")].find(c => !c.value.trim());
  if (manque) { R.textContent = "Il manque : " + manque.nextElementSibling.textContent.toLowerCase() + "."; manque.focus(); return; }
  B.classList.add("fait"); B.querySelector("b").textContent = "Demande notée";
  R.textContent = "Merci. Maquette : la demande partira par e-mail au propriétaire, qui vous répond dans la journée.";
  setTimeout(() => { B.classList.remove("fait"); B.querySelector("b").textContent = B.dataset.texte; }, 3600); }));

/* ——— la barre du bas (téléphone) : seulement une fois le haut de la page passé */
{ const B = document.querySelector(".bas"), H = document.querySelector("[data-haut]");
  if (B && H) new IntersectionObserver(([e]) => B.classList.toggle("on", !e.isIntersecting && e.boundingClientRect.top < 0)).observe(H); }

/* ——— les mouvements au défilement */
const charge = img => !img || (img.complete && img.naturalWidth) ? Promise.resolve() : new Promise(r => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); });
if (!calme) {
  // 02 : les blocs montent ; 19 : les photos au rideau (une fois chargées) ; 33 : la ligne du temps
  const vu = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; vu.unobserve(e.target); const el = e.target;
    charge(el.classList.contains("rideau") ? el.querySelector("img") : null).then(() => requestAnimationFrame(() => el.classList.add("on"))); }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rideau img").forEach(i => { i.loading = "eager"; });   // une image cachée par son rideau ne se chargerait pas « à la demande »
  document.querySelectorAll(".geant, .chapo, .bref > div, .pieces details, .tour, .tour-bas, .mois, .semaines, .duo > *, .resa > *, .tarifs, .compris, .etages > div, .pied .mot, .formulaire, .rideau").forEach(el => { if (!el.classList.contains("rideau")) el.classList.add("leve"); vu.observe(el); });
  document.querySelectorAll(".bref > div, .etages > div").forEach((el, k) => el.style.setProperty("--d", (k % 4) * 90 + "ms"));
  const L = document.querySelector(".temps"); if (L) { L.classList.add("frise"); [...L.children].forEach((li, k) => li.style.setProperty("--i", k)); vu.observe(L); }
  // 40 : la photo d'ouverture descend un peu moins vite que la page ; 23 : la vue grandit jusqu'à remplir l'écran
  const fond = document.querySelector(".ouverture .fond img"), V = document.querySelector(".vue"); let tic = false;
  const suit = () => { tic = false; const h = innerHeight;
    if (fond && scrollY < h * 1.2) fond.style.setProperty("--py", (scrollY * .16).toFixed(1) + "px");
    if (V) { const r = V.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - h))), z = Math.min(1, p / .78); V.style.setProperty("--z", (z * z * (3 - 2 * z)).toFixed(4)); } };
  addEventListener("scroll", () => { if (!tic) { tic = true; requestAnimationFrame(suit); } }, { passive: true }); addEventListener("resize", suit); suit();
}
})();

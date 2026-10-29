/* Saitorapp : l'appli d'un site. Sa page pose window.SITE (nom, couleur, métier) ; les modules viennent du métier. */
(() => {
  const S = window.SITE, A = window.Saitorapp, T = A.temps, $ = id => document.getElementById(id);
  const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const eur = v => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  const dC = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const dL = d => { const t = new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); return t[0].toUpperCase() + t.slice(1); };
  const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  const nbj = (a, b) => Math.round((new Date(b) - new Date(a)) / T.jour);
  const initiales = n => n.split(/\s+/).filter(Boolean).map(x => x[0]).slice(0, 2).join("").toUpperCase();
  const pl = (n, m, p) => `${n} ${n > 1 ? (p || m + "s") : m}`;

  /* ---------- les données de ce site ---------- */
  const CLE = `saitorapp-${S.id}`;
  let D;
  try { D = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
  if (!D) D = A.semer(S);
  const sauver = msg => { try { localStorage.setItem(CLE, JSON.stringify(D)); } catch (e) {} if (msg) hud(msg); };
  /* les commandes envoyées par le panier du site, sur ce même appareil */
  function recevoir() {
    if (S.metier !== "boutique") return 0;
    let r = []; try { r = JSON.parse(localStorage.getItem("saitorapp-commandes-recues")) || []; } catch (e) {}
    let n = 0;
    r.forEach(o => { if (!D.commandes.some(x => x.id === o.id)) { D.commandes.push(Object.assign({}, o, { client: o.client || o.cliente })); n++; } });
    if (n) sauver();
    return n;
  }
  recevoir();
  const MODS = (S.modules || A.METIERS[S.metier].modules).filter(m => A.MODULES[m] && !A.MODULES[m].bientot);

  /* ---------- icônes, dessinées comme celles d'iOS ---------- */
  const ICO = {
    jour: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    sac: '<path d="M5 8h14l-1 12.5H6z"/><path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3"/>',
    boite: '<path d="M12 2.8l8.5 4.6v9.2L12 21.2l-8.5-4.6V7.4z"/><path d="M3.5 7.4L12 12l8.5-4.6M12 12v9.2"/>',
    agenda: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4"/><path d="M8 14h2M14 14h2M8 17.5h2"/>',
    gens: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6"/><path d="M16 4.6a3.4 3.4 0 0 1 0 6.8M18.2 14.4c1.8.9 3 2.8 3.3 5.6"/>',
    ciseaux: '<circle cx="6.5" cy="17.5" r="3"/><circle cx="17.5" cy="17.5" r="3"/><path d="M8.6 15.4L19 3M15.4 15.4L5 3"/>',
    lit: '<path d="M2.5 19V6M2.5 15.5h19V19M21.5 15.5v-3a3 3 0 0 0-3-3H11v6"/><circle cx="6.8" cy="11.5" r="2"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
    carte: '<path d="M6 3.5h12v17H6z"/><path d="M9 8h6M9 11.5h6M9 15h4"/>'
  };
  const ico = (k, t = 26) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k] || ICO.jour}</svg>`;
  const chev = '<svg class="chevron" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>';
  const plusIco = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4v14M4 11h14"/></svg>';
  const retourIco = '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>';
  const telIco = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>';
  const msgIco = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.5 6.1L5 21l4.2-2.4c.9.2 1.8.4 2.8.4 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/></svg>';

  /* ---------- la structure ---------- */
  $("appli").innerHTML = `<div class="page" id="page"></div><div class="onglets"><nav id="onglets" aria-label="Onglets"></nav><button type="button" class="plus" id="plus" hidden>${plusIco.replace('width="22" height="22"', 'width="24" height="24"')}</button></div><div class="hud" id="hud" role="status" aria-live="polite"></div>`;
  function hud(t) { const h = $("hud"); h.textContent = t; h.classList.add("vu"); clearTimeout(hud.t); hud.t = setTimeout(() => h.classList.remove("vu"), 2200); }

  function onglets(actif) {
    const b = { commandes: (D.commandes || []).filter(o => o.statut === "nouvelle").length, agenda: (D.rdv || []).filter(r => r.statut === "demande").length, sejours: (D.sejours || []).filter(r => r.statut === "demande").length };
    $("onglets").innerHTML = MODS.slice(0, 5).map(m => `<a href="#/${m}" ${m === actif ? 'aria-current="page"' : ""}>${ico(A.MODULES[m].icone, 24)}<span>${A.MODULES[m].onglet}</span>${b[m] ? `<span class="badge num" aria-label="${b[m]} en attente">${b[m]}</span>` : ""}</a>`).join("");
  }

  /* une page : barre du haut (retour en rond, petit titre), titre avec son sourcil, contenu ; le + noir à côté des onglets */
  function ecran({ titre, sourcil = "", sous = "", retour = "", corps, pousse = false, plus = null, plusLabel = "Ajouter", hero = "" }) {
    $("page").innerHTML = `<header class="nav-haut ${hero ? "sur-photo" : ""}" id="navHaut"><div class="g">${retour ? `<a class="rond" href="${retour}" aria-label="Retour">${retourIco}</a>` : ""}</div><div class="titre-petit">${esc(titre)}</div><div class="d"></div></header>
      <div class="ecran ${pousse ? "pousse" : ""}">${hero || `<div class="grand-titre">${sourcil ? `<p class="sourcil">${esc(sourcil)}</p>` : ""}<h1 id="grandTitre">${esc(titre)}</h1>${sous ? `<p>${sous}</p>` : ""}</div>`}${corps}</div>`;
    if (hero) { const n = $("navHaut"); n.style.position = "fixed"; n.style.left = n.style.right = "0"; n.style.margin = "0"; }
    /* un seul observateur à la fois : l'ancien titre retiré ne doit pas remplir la nouvelle barre */
    if (ecran.io) ecran.io.disconnect();
    const cible = $("grandTitre") || document.querySelector(".hero");
    ecran.io = new IntersectionObserver(([e]) => $("navHaut").classList.toggle("pleine", !e.isIntersecting), { rootMargin: "-52px 0px 0px 0px" });
    if (cible) ecran.io.observe(cible);
    const p = $("plus"); p.hidden = !plus; p.onclick = plus; p.setAttribute("aria-label", plusLabel);
    scrollTo(0, 0);
  }

  /* feuille qui monte du bas */
  function feuille({ titre, sous = "", droite = "", corps, ok }) {
    fermeFeuille(true);
    const v = document.createElement("div"); v.className = "voile";
    const f = document.createElement("div"); f.className = "feuille"; f.setAttribute("role", "dialog"); f.setAttribute("aria-modal", "true"); f.setAttribute("aria-label", titre);
    f.innerHTML = `<div class="poignee"></div><div class="tete-feuille"><div class="g"><button type="button" class="rond" data-ferme aria-label="Fermer"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg></button></div><h2>${esc(titre)}${sous ? `<small>${sous}</small>` : ""}</h2><div class="d"></div></div>${corps}${droite ? `<div class="boutons"><button type="button" class="bouton" data-ok>${droite}</button></div>` : ""}`;
    document.body.append(v, f);
    requestAnimationFrame(() => { v.classList.add("vu"); f.classList.add("vu"); });
    v.onclick = () => fermeFeuille();
    f.querySelector("[data-ferme]").onclick = () => fermeFeuille();
    if (ok) f.querySelectorAll("[data-ok]").forEach(b => b.onclick = () => ok(f));
    document.body.style.overflow = "hidden";
    /* glisser vers le bas pour fermer */
    let y0 = null;
    f.addEventListener("touchstart", e => { y0 = f.scrollTop <= 0 && e.target.closest(".poignee,.tete-feuille") ? e.touches[0].clientY : null; }, { passive: true });
    f.addEventListener("touchmove", e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) { f.style.transition = "none"; f.style.transform = `translateY(${dy}px)`; } }, { passive: true });
    f.addEventListener("touchend", e => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null; f.style.transition = ""; f.style.transform = ""; if (dy > 110) fermeFeuille(); });
    return f;
  }
  function fermeFeuille(vite) {
    document.querySelectorAll(".feuille,.voile").forEach(el => { if (vite) return el.remove(); el.classList.remove("vu"); setTimeout(() => el.remove(), 420); });
    document.body.style.overflow = "";
  }
  addEventListener("keydown", e => { if (e.key === "Escape") fermeFeuille(); });

  /* le pavé numérique, pour un prix ou un stock : le chiffre en grand, comme dans Fuse */
  function pave({ titre, sous = "", valeur = 0, unite = "€", entier = false, ok }) {
    let s = String(valeur).replace(".", ",");
    const f = feuille({ titre, sous, corps: `<div class="montant"><b class="num" id="pvVal"></b><small>${unite === "€" ? "prix affiché sur le site" : "pièces"}</small></div>
      <div class="pave" id="pv">${["1", "2", "3", "4", "5", "6", "7", "8", "9", entier ? "" : ",", "0", "⌫"].map(k => `<button type="button" data-k="${k}" ${k ? "" : 'disabled style="visibility:hidden"'} aria-label="${k === "⌫" ? "Effacer" : k}">${k === "⌫" ? '<svg width="26" height="20" viewBox="0 0 26 20" fill="currentColor"><path d="M8 1h15a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8L1 10z"/><path d="M12 6l8 8M20 6l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' : k}</button>`).join("")}</div>
      <button type="button" class="bouton" data-ok>Valider</button>`, ok: () => { ok(+s.replace(",", ".") || 0); fermeFeuille(); } });
    const aff = () => { const [e, d] = s.split(","); f.querySelector("#pvVal").innerHTML = `${e || "0"}${d != null ? `<span class="cts">,${d}</span>` : ""}${unite ? ` <span class="cts">${unite}</span>` : ""}`; };
    f.querySelector("#pv").onclick = e => {
      const k = e.target.closest("button")?.dataset.k; if (!k) return;
      if (k === "⌫") s = s.slice(0, -1);
      else if (k === ",") { if (!s.includes(",")) s = (s || "0") + ","; }
      else if (s.replace(",", "").length < 6 && !(s.includes(",") && s.split(",")[1].length >= 2)) s = s === "0" ? k : s + k;
      aff();
    };
    aff();
  }

  /* un montant dont les centimes passent en gris */
  const eurG = v => { const [e, d] = (Math.round(v * 100) / 100).toFixed(2).split("."); return `${Number(e).toLocaleString("fr-FR")}<span class="cts">,${d} €</span>`; };
  const segments = (id, liste, actif) => `<div class="segments" id="${id}" role="group">${liste.map(([k, t, n]) => `<button type="button" data-s="${k}" aria-pressed="${k === actif}">${t}${n != null ? `<span class="n num">${n}</span>` : ""}</button>`).join("")}</div>`;
  const surSegments = (id, fn) => $(id).addEventListener("click", e => { const b = e.target.closest("button"); if (b) fn(b.dataset.s); });
  const interr = (id, on, label) => `<button type="button" class="ligne" role="switch" id="${id}" aria-checked="${on}"><span>${label}</span><span class="interrupteur"></span></button>`;
  const basculer = id => $(id).addEventListener("click", () => $(id).setAttribute("aria-checked", $(id).getAttribute("aria-checked") !== "true"));
  const coche = id => $(id).getAttribute("aria-checked") === "true";
  const pastille = (s, t) => `<span class="pastille p-${s}"><i></i>${t}</span>`;

  /* la grande photo du haut, avec la phrase du jour et deux cartes translucides */
  function hero({ phrase, verres = [] }) {
    const photo = S.photo ? `background-image:url('${S.photo}')` : `background:${S.fond || "var(--accent)"}`;
    return `<section class="hero ${S.photo ? "" : "clair"}" style="${photo}"><div class="h-marque">${S.marque ? `<img src="${esc(S.marque)}" alt="">` : ""}${esc(S.nom)}</div>
      <p class="h-date">${dL(T.auj())}</p><h1 id="grandTitre">${phrase}</h1>
      <div class="verres">${verres.map(([t, icone, href, id]) => `<${href ? `a href="${href}"${href.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}` : `button type="button" id="${id}"`} class="verre">${ico(icone, 22)}<span>${t}</span></${href ? "a" : "button"}>`).join("")}</div></section>`;
  }
  /* le gros chiffre et sa courbe (Fuse) */
  function chiffre({ id, lbl, val, delta = null, periodes, actif, points }) {
    const max = Math.max(1, ...points), min = Math.min(...points), n = points.length;
    const xy = points.map((v, i) => `${(i / Math.max(1, n - 1) * 100).toFixed(2)},${(52 - (v - min) / Math.max(1, max - min) * 46).toFixed(2)}`).join(" ");
    return `<section class="chiffre" id="${id}"><p class="c-lbl">${lbl}${delta == null ? "" : ` <span class="delta ${delta < 0 ? "bas" : delta === 0 ? "zero" : ""}">${delta < 0 ? "↘" : "↗"} ${Math.abs(delta)} %</span>`}</p><p class="c-val num">${val}</p>
      <svg class="courbe" viewBox="0 0 100 56" preserveAspectRatio="none" role="img" aria-label="${esc(lbl)}"><polyline points="${xy}" fill="none" stroke="var(--encre)" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>
      <div class="periodes" role="group">${periodes.map(([k, t]) => `<button type="button" data-per="${k}" aria-pressed="${k === actif}">${t}</button>`).join("")}</div></section>`;
  }
  const tuile = ({ titre, sous = "", val = "", icone, couleur, href = "", cls = "" }) =>
    `<${href ? `a href="${href}"` : "div"} class="tuile ${cls}"><span class="ic ${couleur}">${ico(icone, 19)}</span><b>${titre}</b>${val !== "" ? `<span class="t-val num">${val}</span>` : ""}${sous ? `<small>${sous}</small>` : ""}</${href ? "a" : "div"}>`;

  /* =====================================================================
     BOUTIQUE : commandes et produits
     ===================================================================== */
  const ETAPES = [["nouvelle", "Nouvelle"], ["a-coudre", "À coudre"], ["prete", "Prête"], ["remise", "Remise"]];
  const nomEtape = s => (ETAPES.find(x => x[0] === s) || [s, s])[1];
  const total = o => o.lignes.reduce((t, l) => t + l.prix * l.q, 0);
  const photoDe = id => { const p = (D.produits || []).find(x => x.id === id); return p && p.photo ? `<img class="photo" src="${esc(p.photo)}" alt="">` : ""; };
  const ligneCommande = o => `<a class="ligne" href="#/commandes/${o.id}"><span><b class="${o.statut === "nouvelle" ? "gras" : ""}">${esc(o.client)}</b><small>${o.lignes.map(l => esc(l.prenom ? `« ${l.prenom} »` : l.nom)).join(", ")}</small></span><span class="valeur" style="text-align:right"><span class="num" style="color:var(--texte);display:block">${eur(total(o))}</span>${pastille(o.statut, nomEtape(o.statut))}</span>${chev}</a>`;


  let filtreCmd = "a-faire";
  function commandes(id) {
    if (id) return ficheCommande(id);
    const cmd = [...D.commandes].sort((a, b) => new Date(b.date) - new Date(a.date));
    const F = { "a-faire": o => o.statut === "nouvelle" || o.statut === "a-coudre", prete: o => o.statut === "prete", remise: o => o.statut === "remise", toutes: () => true };
    if (!F[filtreCmd]) filtreCmd = "a-faire";
    const l = cmd.filter(F[filtreCmd]);
    ecran({ titre: "Commandes", sous: `${pl(cmd.filter(F["a-faire"]).length, "commande")} à préparer`, corps: `${segments("segCmd", [["a-faire", "À préparer"], ["prete", "Prêtes"], ["remise", "Remises"], ["toutes", "Toutes"]], filtreCmd)}
      <div style="margin-top:12px">${l.length ? `<div class="groupe">${l.slice(0, 60).map(ligneCommande).join("")}</div>` : `<div class="vide-doux">Aucune commande ici.</div>`}</div>` });
    surSegments("segCmd", s => { filtreCmd = s; commandes(); });
  }
  function ficheCommande(id) {
    const o = D.commandes.find(x => x.id === id);
    if (!o) return introuvable("#/commandes");
    const i = ETAPES.findIndex(x => x[0] === o.statut), suiv = ETAPES[i + 1];
    const tel = (o.tel || "").replace(/[^0-9+]/g, "");
    ecran({ titre: `Commande ${o.id}`, retour: "#/commandes", pousse: true, corps: `
      <div class="fiche-tete"><div class="avatar">${esc(initiales(o.client))}</div><h2>${esc(o.client)}</h2><p class="num">${dL(o.date)} · ${new Date(o.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p></div>
      ${tel.length > 8 ? `<div class="actions-rondes"><a href="tel:${tel}">${telIco}appeler</a><a href="sms:${tel}">${msgIco}message</a></div>` : ""}
      <div class="etapes">${ETAPES.map(([k, t], j) => `${j ? '<svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l4 4-4 4"/></svg>' : ""}<span class="${j < i ? "fait" : j === i ? "ici" : ""}">${t}</span>`).join("")}</div>
      <p class="entete-groupe">Pièces</p>
      <div class="groupe">${o.lignes.map(l => `<div class="ligne av-image">${photoDe(l.produit)}<span><b>${esc(l.nom)}${l.q > 1 ? ` × ${l.q}` : ""}</b>${l.prenom ? `<small style="color:var(--texte);font-weight:600">« ${esc(l.prenom)} »</small>` : ""}${l.detail ? `<small>${esc(l.detail)}</small>` : ""}</span><span class="valeur num">${eur(l.prix * l.q)}</span></div>`).join("")}
        <div class="ligne"><span><b class="gras">Total</b></span><span class="valeur fort num" style="font-weight:600">${eur(total(o))}</span></div></div>
      <p class="entete-groupe">Remise</p>
      <div class="groupe"><div class="ligne"><span><b>${esc(o.remise)}</b>${o.mot ? `<small class="deux">« ${esc(o.mot)} »</small>` : ""}</span></div>${o.email ? `<div class="ligne"><span><b>${esc(o.email)}</b></span></div>` : ""}</div>
      ${o.source === "site" ? '<p class="pied-groupe">Envoyée depuis le panier du site.</p>' : ""}
      ${suiv ? `<div class="boutons"><button class="bouton" id="avance">${{ "a-coudre": "Commencer à coudre", prete: "Marquer prête", remise: "Marquer remise" }[suiv[0]]}</button></div>` : ""}` });
    if (suiv) $("avance").onclick = () => { o.statut = suiv[0]; sauver(suiv[0] === "prete" ? "Prête : prévenez la cliente" : suiv[1]); ficheCommande(id); onglets("commandes"); };
  }

  let filtrePro = "tous", cherche = "";
  function produits(id) {
    if (id) return ficheProduit(id);
    const F = { tous: () => true, ligne: p => p.enLigne, bas: p => !p.surCommande && p.stock <= p.seuil };
    if (!F[filtrePro]) filtrePro = "tous";
    const filtre = () => { const q = cherche.toLowerCase(); return D.produits.filter(F[filtrePro]).filter(p => !q || p.nom.toLowerCase().includes(q)); };
    ecran({ titre: "Produits", sous: `${D.produits.filter(p => p.enLigne).length} en ligne sur le site`, plus: () => feuilleProduit(), plusLabel: "Ajouter un produit", corps: `
      <label class="recherche"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg><input id="cherche" type="search" placeholder="Rechercher" value="${esc(cherche)}" aria-label="Rechercher un produit"></label>
      ${segments("segPro", [["tous", "Tous", D.produits.length], ["ligne", "En ligne", D.produits.filter(F.ligne).length], ["bas", "Stock bas", D.produits.filter(F.bas).length]], filtrePro)}
      <div style="margin-top:12px" id="listePro">${listeProduits(filtre())}</div>` });
    surSegments("segPro", s => { filtrePro = s; produits(); });
    $("cherche").addEventListener("input", e => { cherche = e.target.value; $("listePro").innerHTML = listeProduits(filtre()); });
  }
  const listeProduits = l => l.length ? `<div class="groupe">${l.map(p => `<a class="ligne av-image" href="#/produits/${p.id}">${p.photo ? `<img class="photo" src="${esc(p.photo)}" alt="" loading="lazy">` : `<span class="photo" style="width:48px;height:48px;border-radius:10px;background:var(--carte-2);flex:none"></span>`}<span><b>${esc(p.nom)}</b><small>${eur(p.prix)} · ${p.surCommande ? "sur commande" : `<span class="${p.stock <= p.seuil ? "danger" : ""}">${p.stock ? `${p.stock} en stock` : "épuisé"}</span>`}${p.enLigne ? "" : " · retiré du site"}</small></span>${chev}</a>`).join("")}</div>` : `<div class="vide-doux">Aucun produit.</div>`;
  function ficheProduit(id) {
    const p = D.produits.find(x => x.id === id);
    if (!p) return introuvable("#/produits");
    const fam = window.FAMILLES || {};
    ecran({ titre: p.nom, retour: "#/produits", pousse: true, corps: `
      ${p.photo ? `<div class="photo-produit"><img src="${esc(p.photo)}" alt=""></div>` : ""}
      <p class="entete-groupe">Vente</p>
      <div class="groupe">
        <button type="button" class="champ-ligne" id="pPrixB" style="width:100%"><label>Prix</label><span class="chiffre-bouton num" id="pPrix" data-v="${p.prix}">${eurG(p.prix)}</span></button>
        ${Object.keys(fam).length ? `<div class="champ-ligne"><label for="pFam">Famille</label><select id="pFam">${Object.entries(fam).map(([k, t]) => `<option value="${k}" ${k === p.famille ? "selected" : ""}>${t}</option>`).join("")}</select></div>` : ""}
        ${interr("pLigne", p.enLigne, "En ligne sur le site")}
      </div>
      <p class="entete-groupe">Stock</p>
      <div class="groupe">
        ${interr("pCmd", p.surCommande, "Fait sur commande")}
        <div class="ligne" id="pStockL" ${p.surCommande ? "hidden" : ""}><span><b>En stock</b></span><button type="button" class="valeur fort num" id="pStock" style="min-width:36px;text-align:right;font-weight:600" aria-label="Changer le stock">${p.stock ?? 0}</button><span style="display:flex;gap:6px;flex:none"><button type="button" class="rond" id="pMoins" aria-label="Un de moins" style="background:#fff">−</button><button type="button" class="rond" id="pPlus" aria-label="Un de plus" style="background:#fff">+</button></span></div>
        ${interr("pPerso", p.perso, "Prénom à broder")}
      </div>
      <p class="pied-groupe">L'appli vous prévient quand il en reste ${p.seuil} ou moins.</p>
      <p class="entete-groupe">Description</p>
      <div class="groupe"><div class="champ-ligne bloc"><textarea id="pTexte" aria-label="Description">${esc(p.texte)}</textarea></div></div>
      <div class="boutons"><button class="bouton" id="pOk">Enregistrer</button></div>
      <div class="groupe" style="margin-top:28px"><button class="ligne" id="pSuppr" style="justify-content:center"><b class="danger" style="text-align:center">Supprimer le produit</b></button></div>` });
    let st = p.stock ?? 0;
    $("pPrixB").onclick = () => pave({ titre: "Prix", sous: esc(p.nom), valeur: +$("pPrix").dataset.v, ok: v => { $("pPrix").dataset.v = v; $("pPrix").innerHTML = eurG(v); } });
    $("pStock").onclick = () => pave({ titre: "En stock", sous: esc(p.nom), valeur: st, unite: "", entier: true, ok: v => { st = Math.round(v); $("pStock").textContent = st; } });
    ["pLigne", "pPerso"].forEach(basculer);
    $("pCmd").onclick = () => { const v = !coche("pCmd"); $("pCmd").setAttribute("aria-checked", v); $("pStockL").hidden = v; };
    $("pMoins").onclick = () => { st = Math.max(0, st - 1); $("pStock").textContent = st; };
    $("pPlus").onclick = () => { st++; $("pStock").textContent = st; };
    $("pOk").onclick = () => {
      Object.assign(p, { prix: +$("pPrix").dataset.v, famille: $("pFam") ? $("pFam").value : p.famille, enLigne: coche("pLigne"), surCommande: coche("pCmd"), perso: coche("pPerso"), texte: $("pTexte").value.trim() });
      p.stock = p.surCommande ? null : st; sauver("Enregistré"); location.hash = "#/produits";
    };
    $("pSuppr").onclick = () => { if (!confirm(`Supprimer « ${p.nom} » ?`)) return; D.produits.splice(D.produits.indexOf(p), 1); sauver("Produit supprimé"); location.hash = "#/produits"; };
  }
  function feuilleProduit() {
    const fam = window.FAMILLES || {};
    let photo = "";
    const f = feuille({ titre: "Nouveau produit", droite: "Ajouter", corps: `
      <div style="display:flex;justify-content:center;margin:8px 0 4px"><label id="nPhotoL" style="display:grid;place-items:center;width:120px;height:120px;border-radius:18px;background:var(--carte) center/cover no-repeat;color:var(--accent);cursor:pointer;text-align:center;font-size:15px"><span id="nPhotoT">Ajouter<br>une photo</span><input id="nPhoto" type="file" accept="image/*" hidden></label></div>
      <div class="groupe" style="margin-top:14px">
        <div class="champ-ligne"><label for="nNom">Nom</label><input id="nNom" placeholder="Bavoir étoilé" autocomplete="off"></div>
        <div class="champ-ligne"><label for="nPrix">Prix (€)</label><input id="nPrix" type="number" inputmode="decimal" min="0" placeholder="10"></div>
        ${Object.keys(fam).length ? `<div class="champ-ligne"><label for="nFam">Famille</label><select id="nFam">${Object.entries(fam).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select></div>` : ""}
      </div>
      <div class="groupe" style="margin-top:20px">${interr("nCmd", false, "Fait sur commande")}${interr("nPerso", false, "Prénom à broder")}${interr("nLigne", true, "En ligne tout de suite")}</div>
      <p class="pied-groupe" id="nErr"></p>`, ok: () => {
        const nom = $("nNom").value.trim();
        if (!nom) { $("nErr").textContent = "Donnez un nom au produit."; $("nNom").focus(); return; }
        D.produits.unshift({ id: nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36).slice(-4), nom, prix: +$("nPrix").value || 0, famille: $("nFam") ? $("nFam").value : "", perso: coche("nPerso"), texte: "", photo, surCommande: coche("nCmd"), stock: coche("nCmd") ? null : 1, seuil: 1, enLigne: coche("nLigne") });
        sauver(`${nom} ajouté`); fermeFeuille(); produits();
      } });
    ["nCmd", "nPerso", "nLigne"].forEach(basculer);
    /* la photo est réduite à 700 px avant d'être gardée */
    $("nPhoto").onchange = e => {
      const fi = e.target.files[0]; if (!fi) return;
      const img = new Image();
      img.onload = () => { const s = Math.min(1, 700 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = img.width * s; cv.height = img.height * s; cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); photo = cv.toDataURL("image/jpeg", .82); $("nPhotoL").style.backgroundImage = `url(${photo})`; $("nPhotoT").hidden = true; URL.revokeObjectURL(img.src); };
      img.src = URL.createObjectURL(fi);
    };
    setTimeout(() => f.querySelector("#nNom").focus(), 350);
  }

  /* =====================================================================
     INSTITUT, COIFFEUR : agenda, clientèle, prestations
     ===================================================================== */
  const presta = id => D.prestations.find(p => p.id === id) || { nom: "Prestation", duree: 30, prix: 0 };
  const membre = id => D.equipe.find(e => e.id === id) || { nom: "", couleur: "var(--accent)", familles: [] };
  const client = id => D.clients.find(c => c.id === id) || { nom: "Client", tel: "" };
  const STATUT_RDV = { confirme: "Confirmé", demande: "À confirmer", venu: "Venu", absent: "Absent", annule: "Annulé" };
  const ligneRdv = r => { const p = presta(r.presta), m = membre(r.equipe); return `<button type="button" class="ligne" data-rdv="${r.id}"><span class="heure num">${hm(r.debut)}<small style="display:block;color:var(--gris)">${hm(r.debut + p.duree)}</small></span><span class="trait" style="background:${m.couleur}"></span><span><b class="${r.statut === "demande" ? "gras" : ""}">${esc(client(r.client).nom)}</b><small>${esc(p.nom)}${D.equipe.length > 1 ? ` · ${esc(m.nom)}` : ""}</small></span>${r.statut !== "confirme" ? pastille(r.statut, STATUT_RDV[r.statut]) : ""}${chev}</button>`; };
  const brancheRdv = () => document.querySelectorAll("[data-rdv]").forEach(b => b.onclick = () => feuilleRdv(b.dataset.rdv));
  const rdvDuJour = iso => D.rdv.filter(r => r.date === iso && r.statut !== "annule").sort((a, b) => a.debut - b.debut);


  let jourVu = null, filtreEq = "tous";
  function agenda() {
    const t = T.auj(); jourVu = jourVu || T.iso(t);
    const j = new Date(jourVu), lundi = T.plus(j, -((j.getDay() + 6) % 7));
    const semaine = [...Array(7)].map((_, i) => T.plus(lundi, i));
    const l = rdvDuJour(jourVu).filter(r => filtreEq === "tous" || r.equipe === filtreEq);
    const dem = D.rdv.filter(r => r.statut === "demande");
    const ferme = D.horaires.ferme.includes(j.getDay());
    ecran({ titre: "Agenda", sous: `<span>${dL(jourVu)}</span>`, plus: () => feuilleNouveauRdv({ date: jourVu }), plusLabel: "Nouveau rendez-vous", corps: `
      <div class="semaine-nav"><button class="rond" id="semAv" aria-label="Semaine précédente">${retourIco}</button><p>${(t => t[0].toUpperCase() + t.slice(1))(lundi.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }))}</p><button class="rond" id="semAp" aria-label="Semaine suivante" style="transform:scaleX(-1)">${retourIco}</button></div>
      <div class="jours" id="jours">${semaine.map(d => { const iso = T.iso(d), n = rdvDuJour(iso).length; return `<button type="button" data-j="${iso}" aria-pressed="${iso === jourVu}" class="${iso === T.iso(t) ? "aujourdhui" : ""}" aria-label="${dL(d)}, ${pl(n, "rendez-vous", "rendez-vous")}"><span>${d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span><b class="num">${d.getDate()}</b><i class="${n ? "" : "vide"}"></i></button>`; }).join("")}</div>
      ${D.equipe.length > 1 ? segments("segEq", [["tous", "Tous"], ...D.equipe.map(e => [e.id, e.nom])], filtreEq) : ""}
      ${dem.length ? `<p class="pied-groupe" style="padding-top:10px"><button class="lien-texte" id="voirDem">${pl(dem.length, "demande")} à confirmer</button></p>` : ""}
      <div style="margin-top:12px">${ferme ? `<div class="vide-doux">Fermé ce jour-là.</div>` : l.length ? `<div class="groupe">${l.map(ligneRdv).join("")}</div>` : `<div class="vide-doux">Aucun rendez-vous.<br><button class="lien-texte" id="ajoutVide" style="margin-top:8px">Ajouter un rendez-vous</button></div>`}</div>` });
    $("jours").onclick = e => { const b = e.target.closest("button"); if (b) { jourVu = b.dataset.j; agenda(); } };
    $("semAv").onclick = () => { jourVu = T.iso(T.plus(jourVu, -7)); agenda(); };
    $("semAp").onclick = () => { jourVu = T.iso(T.plus(jourVu, 7)); agenda(); };
    if ($("segEq")) surSegments("segEq", s => { filtreEq = s; agenda(); });
    if ($("ajoutVide")) $("ajoutVide").onclick = () => feuilleNouveauRdv({ date: jourVu });
    if ($("voirDem")) $("voirDem").onclick = () => { const r = [...dem].sort((a, b) => a.date.localeCompare(b.date))[0]; jourVu = r.date; agenda(); feuilleRdv(r.id); };
    brancheRdv();
  }
  function feuilleRdv(id) {
    const r = D.rdv.find(x => x.id === id); if (!r) return;
    const p = presta(r.presta), c = client(r.client), m = membre(r.equipe), tel = (c.tel || "").replace(/[^0-9+]/g, "");
    const f = feuille({ titre: "Rendez-vous", gauche: "Fermer", corps: `
      <div class="fiche-tete" style="padding-top:4px"><div class="avatar">${esc(initiales(c.nom))}</div><h2>${esc(c.nom)}</h2><p>${esc(p.nom)}</p></div>
      <div class="groupe" style="margin-top:14px">
        <div class="ligne"><span><b>Date</b></span><span class="valeur">${dL(r.date)}</span></div>
        <div class="ligne"><span><b>Heure</b></span><span class="valeur num">${hm(r.debut)} – ${hm(r.debut + p.duree)}</span></div>
        ${D.equipe.length ? `<div class="ligne"><span><b>Avec</b></span><span class="valeur">${esc(m.nom)}</span></div>` : ""}
        <div class="ligne"><span><b>Prix</b></span><span class="valeur num">${eur(p.prix)}</span></div>
        <div class="ligne"><span><b>État</b></span>${pastille(r.statut, STATUT_RDV[r.statut])}</div>
      </div>
      ${r.source ? `<p class="pied-groupe">Pris ${r.source === "site" ? "sur le site" : r.source === "téléphone" ? "par téléphone" : esc(r.source)}.</p>` : ""}
      <div class="boutons">${r.statut === "demande" ? `<button class="bouton" data-oui="${r.id}">Accepter</button>` : r.date <= T.iso(T.auj()) && r.statut === "confirme" ? `<button class="bouton" id="rVenu">Venu</button><button class="bouton gris" id="rAbsent">Absent</button>` : ""}</div>
      ${tel.length > 8 ? `<div class="groupe" style="margin-top:16px"><a class="ligne" href="tel:${tel}"><span><b class="lien-texte">Appeler</b></span><span class="valeur num">${esc(c.tel)}</span></a><a class="ligne" href="sms:${tel}"><span><b class="lien-texte">Envoyer un message</b></span></a><a class="ligne" href="#/clients/${c.id}"><span><b class="lien-texte">Fiche client</b></span></a></div>` : ""}
      ${["confirme", "demande"].includes(r.statut) ? `<div class="groupe" style="margin-top:16px"><button class="ligne" id="rAnnule" style="justify-content:center"><b class="danger" style="text-align:center">${r.statut === "demande" ? "Refuser la demande" : "Annuler le rendez-vous"}</b></button></div>` : ""}` });
    brancheOui(f);
    f.querySelector("#rVenu")?.addEventListener("click", () => { r.statut = "venu"; sauver("Noté : venu"); fermeFeuille(); route(); });
    f.querySelector("#rAbsent")?.addEventListener("click", () => { r.statut = "absent"; sauver("Noté : absent"); fermeFeuille(); route(); });
    f.querySelector("#rAnnule")?.addEventListener("click", () => { const dem = r.statut === "demande"; r.statut = "annule"; sauver(dem ? "Demande refusée" : "Rendez-vous annulé"); fermeFeuille(); route(); });
  }
  function brancheOui(scope = document) { scope.querySelectorAll("[data-oui]").forEach(b => b.onclick = () => { const r = D.rdv.find(x => x.id === b.dataset.oui); r.statut = "confirme"; sauver("Rendez-vous confirmé"); fermeFeuille(); route(); }); }

  /* les créneaux libres : la prestation tient entre deux rendez-vous, dans les horaires */
  function creneaux(date, prId, eqId) {
    const p = presta(prId), d = new Date(date), H = D.horaires || { ouverture: 540, fermeture: 1140, ferme: [0] };
    if (!date || H.ferme.includes(d.getDay())) return [];
    const qui = !D.equipe.length ? [{ id: "" }] : eqId === "peu" ? D.equipe.filter(e => e.familles.includes(p.famille)) : D.equipe.filter(e => e.id === eqId);
    const pris = e => D.rdv.filter(r => r.date === date && (r.equipe || "") === e && r.statut !== "annule").map(r => [r.debut, r.debut + presta(r.presta).duree]);
    const out = [], maintenant = new Date(), mn = date === T.iso(maintenant) ? maintenant.getHours() * 60 + maintenant.getMinutes() : date < T.iso(maintenant) ? 1e9 : -1;
    for (let h = H.ouverture; h + p.duree <= H.fermeture; h += 15) {
      if (h <= mn) continue;
      const libre = qui.find(e => pris(e.id).every(([a, b]) => h + p.duree <= a || h >= b));
      if (libre) out.push([h, libre.id]);
    }
    return out;
  }
  function feuilleNouveauRdv({ date, clientId = "" }) {
    let pr = D.prestations[0]?.id, eq = "peu", heure = null;
    const f = feuille({ titre: "Nouveau rendez-vous", droite: "Ajouter", corps: `
      <div class="groupe"><div class="champ-ligne"><label for="rCli">Client</label><input id="rCli" list="rClis" placeholder="Nom" autocomplete="off" value="${esc(clientId ? client(clientId).nom : "")}"><datalist id="rClis">${D.clients.map(c => `<option value="${esc(c.nom)}">`).join("")}</datalist></div>
      <div class="champ-ligne"><label for="rDate">Jour</label><input id="rDate" type="date" value="${date}"></div></div>
      <p class="entete-groupe">Prestation</p><div class="groupe"><div class="puces" id="rPr"></div></div>
      ${D.equipe.length > 1 ? `<p class="entete-groupe">Avec</p><div class="groupe"><div class="puces" id="rEq"></div></div>` : ""}
      <p class="entete-groupe" id="rHt">Heure</p><div class="groupe"><div class="creneaux" id="rH"></div></div>
      <p class="pied-groupe" id="rErr"></p>`, ok: () => {
        const nom = $("rCli").value.trim();
        if (!nom) { $("rErr").textContent = "Indiquez le nom du client."; $("rCli").focus(); return; }
        if (!heure) { $("rErr").textContent = "Choisissez une heure."; return; }
        let c = D.clients.find(x => x.nom.toLowerCase() === nom.toLowerCase());
        if (!c) { c = { id: "c" + Date.now().toString(36), nom, tel: "", note: "" }; D.clients.push(c); }
        D.rdv.push({ id: Date.now().toString(36), date: $("rDate").value, debut: heure[0], presta: pr, equipe: heure[1], client: c.id, statut: "confirme", source: "ajouté dans l'appli" });
        jourVu = $("rDate").value; sauver(`Rendez-vous à ${hm(heure[0])} ajouté`); fermeFeuille();
        if (location.hash.startsWith("#/agenda")) agenda(); else location.hash = "#/agenda";
      } });
    const dessine = () => {
      $("rPr").innerHTML = D.prestations.filter(p => p.enLigne !== false || p.id === pr).map(p => `<button type="button" data-p="${p.id}" aria-pressed="${p.id === pr}">${esc(p.nom)}</button>`).join("");
      if ($("rEq")) $("rEq").innerHTML = [["peu", "Peu importe", ""], ...D.equipe.filter(e => e.familles.includes(presta(pr).famille)).map(e => [e.id, e.nom, e.couleur])].map(([k, t, c]) => `<button type="button" data-e="${k}" aria-pressed="${k === eq}">${c ? `<i style="background:${c}"></i>` : ""}${t}</button>`).join("");
      const L = creneaux($("rDate").value, pr, eq);
      if (heure && !L.some(x => x[0] === heure[0])) heure = null;
      $("rHt").textContent = `Heure · ${presta(pr).duree} min · ${eur(presta(pr).prix)}`;
      $("rH").innerHTML = L.length ? L.map(([h, e]) => `<button type="button" data-h="${h}" data-qui="${e}" aria-pressed="${!!heure && heure[0] === h}" class="num">${hm(h)}</button>`).join("") : `<p style="grid-column:1/-1;color:var(--gris);font-size:15px">Plus de place ce jour-là.</p>`;
    };
    dessine();
    f.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.p) { pr = b.dataset.p; if (eq !== "peu" && !membre(eq).familles.includes(presta(pr).famille)) eq = "peu"; dessine(); }
      else if (b.dataset.e) { eq = b.dataset.e; dessine(); }
      else if (b.dataset.h) { heure = [+b.dataset.h, b.dataset.qui]; dessine(); }
    });
    $("rDate").onchange = () => { heure = null; dessine(); };
  }

  function clients(id) {
    if (id) return ficheClient(id);
    const visites = c => D.rdv.filter(r => r.client === c.id && r.statut === "venu");
    const l = [...D.clients].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    ecran({ titre: "Clients", sous: pl(l.length, "client"), corps: `
      <label class="recherche"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg><input id="chercheCli" type="search" placeholder="Rechercher" aria-label="Rechercher un client"></label>
      ${l.length ? `<div class="groupe" id="listeCli">${l.map(c => { const v = visites(c).sort((a, b) => b.date.localeCompare(a.date)); return `<a class="ligne av-icone" href="#/clients/${c.id}" data-nom="${esc(c.nom.toLowerCase())}"><span class="icone-carre" style="border-radius:50%;background:color-mix(in srgb,var(--accent) 16%,#fff);color:var(--accent);font-size:12px;font-weight:600">${esc(initiales(c.nom))}</span><span><b>${esc(c.nom)}</b><small>${v.length ? `${pl(v.length, "visite")}, la dernière le ${dC(v[0].date)}` : "pas encore venu"}</small></span>${chev}</a>`; }).join("")}</div>` : `<div class="vide-doux">Vos clients apparaissent ici après leur premier rendez-vous.</div>`}` });
    $("chercheCli").addEventListener("input", e => { const q = e.target.value.toLowerCase(); document.querySelectorAll("#listeCli [data-nom]").forEach(a => a.hidden = !a.dataset.nom.includes(q)); });
  }
  function ficheClient(id) {
    const c = D.clients.find(x => x.id === id); if (!c) return introuvable("#/clients");
    const h = D.rdv.filter(r => r.client === id && r.statut !== "annule").sort((a, b) => (b.date + String(b.debut).padStart(4, "0")).localeCompare(a.date + String(a.debut).padStart(4, "0")));
    const tel = (c.tel || "").replace(/[^0-9+]/g, ""), venus = h.filter(r => r.statut === "venu"), depense = venus.reduce((s, r) => s + presta(r.presta).prix, 0);
    ecran({ titre: c.nom, retour: "#/clients", pousse: true, corps: `
      <div class="fiche-tete"><div class="avatar">${esc(initiales(c.nom))}</div><h2>${esc(c.nom)}</h2><p class="num">${pl(venus.length, "visite")} · ${eur(depense)}</p></div>
      <div class="actions-rondes">${tel.length > 8 ? `<a href="tel:${tel}">${telIco}appeler</a><a href="sms:${tel}">${msgIco}message</a>` : ""}<button type="button" id="cRdv">${ico("agenda", 22)}rendez-vous</button></div>
      <p class="entete-groupe">Note</p><div class="groupe"><div class="champ-ligne bloc"><textarea id="cNote" placeholder="Allergies, préférences, couleur utilisée…" aria-label="Note">${esc(c.note)}</textarea></div></div>
      <p class="entete-groupe">Historique</p>
      ${h.length ? `<div class="groupe">${h.slice(0, 20).map(r => `<button type="button" class="ligne" data-rdv="${r.id}"><span><b>${esc(presta(r.presta).nom)}</b><small>${dC(r.date)} à ${hm(r.debut)}${D.equipe.length ? ` · ${esc(membre(r.equipe).nom)}` : ""}</small></span>${pastille(r.statut, STATUT_RDV[r.statut])}</button>`).join("")}</div>` : `<div class="vide-doux">Pas encore de rendez-vous.</div>`}` });
    $("cNote").addEventListener("change", e => { c.note = e.target.value.trim(); sauver("Note enregistrée"); });
    $("cRdv").onclick = () => feuilleNouveauRdv({ date: T.iso(T.auj()), clientId: c.id });
    brancheRdv();
  }

  const FAMILLES_PRESTA = { eau: "Hammam", soin: "Soins", coiffure: "Coiffure" };
  function prestations() {
    const fams = [...new Set(D.prestations.map(p => p.famille))];
    ecran({ titre: "Carte", sous: "vos prestations et leurs prix, comme sur le site", plus: () => feuillePresta(null), plusLabel: "Ajouter une prestation", corps: (fams.length ? fams.map(fa => `
      <p class="entete-groupe">${esc(FAMILLES_PRESTA[fa] || fa || "Prestations")}</p>
      <div class="groupe">${D.prestations.filter(p => p.famille === fa).map(p => `<button type="button" class="ligne" data-pr="${p.id}"><span><b>${esc(p.nom)}</b><small>${p.duree} min${p.enLigne === false ? " · pas réservable en ligne" : ""}</small></span><span class="valeur num">${eur(p.prix)}</span>${chev}</button>`).join("")}</div>`).join("") : `<div class="vide-doux">Ajoutez votre première prestation avec +.</div>`) + `<p class="pied-groupe">Une prestation qui n'est plus réservable reste dans l'historique de vos clients.</p>` });
    document.querySelectorAll("[data-pr]").forEach(b => b.onclick = () => feuillePresta(b.dataset.pr));
  }
  function feuillePresta(id) {
    const p = id ? D.prestations.find(x => x.id === id) : { id: "", nom: "", duree: 30, prix: 30, famille: Object.keys(FAMILLES_PRESTA)[0], enLigne: true };
    feuille({ titre: id ? "Prestation" : "Nouvelle prestation", droite: id ? "OK" : "Ajouter", corps: `
      <div class="groupe"><div class="champ-ligne"><label for="xNom">Nom</label><input id="xNom" value="${esc(p.nom)}" placeholder="Coupe et brushing"></div>
      <div class="champ-ligne"><label for="xDur">Durée</label><select id="xDur">${[15, 30, 45, 60, 75, 90, 120, 150, 180].map(d => `<option value="${d}" ${d === p.duree ? "selected" : ""}>${d} min</option>`).join("")}</select></div>
      <div class="champ-ligne"><label for="xPrix">Prix (€)</label><input id="xPrix" type="number" inputmode="decimal" min="0" value="${p.prix}"></div>
      <div class="champ-ligne"><label for="xFam">Rubrique</label><select id="xFam">${Object.entries(FAMILLES_PRESTA).map(([k, t]) => `<option value="${k}" ${k === p.famille ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>
      <div class="groupe" style="margin-top:20px">${interr("xLigne", p.enLigne !== false, "Réservable sur le site")}</div><p class="pied-groupe" id="xErr"></p>`, ok: () => {
        const nom = $("xNom").value.trim(); if (!nom) { $("xErr").textContent = "Donnez un nom."; return; }
        Object.assign(p, { nom, duree: +$("xDur").value, prix: +$("xPrix").value || 0, famille: $("xFam").value, enLigne: coche("xLigne") });
        if (!id) { p.id = "p" + Date.now().toString(36); D.prestations.push(p); }
        sauver(id ? "Enregistré" : `${nom} ajoutée`); fermeFeuille(); prestations();
      } });
    basculer("xLigne");
  }

  /* =====================================================================
     HÉBERGEMENT : séjours et chambres
     ===================================================================== */
  const chambre = id => D.chambres.find(c => c.id === id) || { nom: id, prix: 0 };
  const STATUT_SEJ = { confirme: "Confirmé", demande: "À confirmer", ferme: "Fermé", annule: "Annulé" };
  function planning(debut, n) {
    const jours = [...Array(n)].map((_, i) => T.plus(debut, i)), ti = T.iso(T.auj());
    return `<div class="planning"><div class="p-dates" style="grid-template-columns:repeat(${n},1fr)">${jours.map(d => `<span class="num ${T.iso(d) === ti ? "auj" : ""}">${d.getDate()}</span>`).join("")}</div>
      <div class="p-rangs">${D.chambres.map(c => `<span class="p-nom">${esc(c.nom)}</span><div class="p-ligne">${D.sejours.filter(s => s.chambre === c.id && s.statut !== "annule" && new Date(s.depart) > debut && new Date(s.arrivee) < T.plus(debut, n)).map(s => {
        const a = Math.max(0, nbj(debut, s.arrivee)), b = Math.min(n, nbj(debut, s.depart));
        return `<button type="button" class="p-sej ${s.statut}" data-sej="${s.id}" style="left:calc(${a / n * 100}% + 2px);width:calc(${(b - a) / n * 100}% - 4px)" aria-label="${esc(s.nom)}, ${dC(s.arrivee)} au ${dC(s.depart)}">${esc(s.nom)}</button>`; }).join("")}</div>`).join("")}</div></div>`;
  }
  const brancheSej = () => document.querySelectorAll("[data-sej]").forEach(b => b.onclick = () => feuilleSejour(b.dataset.sej));
  const ligneSejour = s => { const n = nbj(s.arrivee, s.depart); return `<button type="button" class="ligne" data-sej="${s.id}"><span><b class="${s.statut === "demande" ? "gras" : ""}">${esc(s.nom)}</b><small>${esc(chambre(s.chambre).nom)} · ${dC(s.arrivee)} → ${dC(s.depart)} · ${pl(n, "nuit")}</small></span>${s.statut === "confirme" ? `<span class="valeur num">${eur(chambre(s.chambre).prix * n)}</span>` : pastille(s.statut, STATUT_SEJ[s.statut])}${chev}</button>`; };

  let filtreSej = "avenir", decal = 0;
  function sejours() {
    const t = T.auj(), ti = T.iso(t);
    const F = { avenir: s => s.depart >= ti && s.statut !== "annule", demande: s => s.statut === "demande", passes: s => s.depart < ti && s.statut !== "annule" };
    if (!F[filtreSej]) filtreSej = "avenir";
    const l = D.sejours.filter(F[filtreSej]).sort((a, b) => filtreSej === "passes" ? b.arrivee.localeCompare(a.arrivee) : a.arrivee.localeCompare(b.arrivee));
    const deb = T.plus(t, decal * 14);
    ecran({ titre: "Séjours", sous: pl(D.chambres.length, "chambre"), plus: () => feuilleNouveauSejour(), plusLabel: "Ajouter un séjour", corps: `
      <div class="semaine-nav"><button class="rond" id="plAv" aria-label="Deux semaines plus tôt">${retourIco}</button><p class="num">${dC(deb)} – ${dC(T.plus(deb, 13))}</p><button class="rond" id="plAp" aria-label="Deux semaines plus tard" style="transform:scaleX(-1)">${retourIco}</button></div>
      <div style="margin-top:6px">${planning(deb, 14)}</div>
      <div style="margin-top:18px">${segments("segSej", [["avenir", "À venir"], ["demande", "À confirmer", D.sejours.filter(F.demande).length], ["passes", "Passés"]], filtreSej)}</div>
      <div style="margin-top:12px">${l.length ? `<div class="groupe">${l.slice(0, 40).map(ligneSejour).join("")}</div>` : `<div class="vide-doux">Rien ici.</div>`}</div>` });
    $("plAv").onclick = () => { decal--; sejours(); };
    $("plAp").onclick = () => { decal++; sejours(); };
    surSegments("segSej", s => { filtreSej = s; sejours(); });
    brancheSej();
  }
  function feuilleSejour(id) {
    const s = D.sejours.find(x => x.id === id); if (!s) return;
    const c = chambre(s.chambre), n = nbj(s.arrivee, s.depart);
    const f = feuille({ titre: s.statut === "ferme" ? "Dates fermées" : "Séjour", gauche: "Fermer", corps: `
      <div class="fiche-tete" style="padding-top:4px"><div class="avatar">${esc(initiales(s.nom))}</div><h2>${esc(s.nom)}</h2><p>${esc(c.nom)}</p></div>
      <div class="groupe" style="margin-top:14px">
        <div class="ligne"><span><b>Arrivée</b></span><span class="valeur">${dL(s.arrivee)}</span></div>
        <div class="ligne"><span><b>Départ</b></span><span class="valeur">${dL(s.depart)}</span></div>
        ${s.statut !== "ferme" ? `<div class="ligne"><span><b>Personnes</b></span><span class="valeur num">${s.personnes}</span></div><div class="ligne"><span><b>Montant</b></span><span class="valeur num">${pl(n, "nuit")} · ${eur(c.prix * n)}</span></div>` : ""}
        <div class="ligne"><span><b>État</b></span>${pastille(s.statut, STATUT_SEJ[s.statut])}</div>
      </div>
      ${s.source ? `<p class="pied-groupe">Réservé ${s.source === "site" ? "sur le site" : s.source === "téléphone" ? "par téléphone" : esc(s.source)}.</p>` : ""}
      ${s.statut === "demande" ? `<div class="boutons"><button class="bouton" id="sOui">Accepter</button></div>` : ""}
      ${s.statut !== "annule" ? `<div class="groupe" style="margin-top:16px"><button class="ligne" id="sNon" style="justify-content:center"><b class="danger" style="text-align:center">${s.statut === "demande" ? "Refuser la demande" : s.statut === "ferme" ? "Rouvrir ces dates" : "Annuler le séjour"}</b></button></div>` : ""}` });
    f.querySelector("#sOui")?.addEventListener("click", () => { s.statut = "confirme"; sauver("Séjour confirmé"); fermeFeuille(); route(); });
    f.querySelector("#sNon")?.addEventListener("click", () => { const etait = s.statut; if (etait === "ferme") D.sejours.splice(D.sejours.indexOf(s), 1); else s.statut = "annule"; sauver(etait === "ferme" ? "Dates rouvertes" : etait === "demande" ? "Demande refusée" : "Séjour annulé"); fermeFeuille(); route(); });
  }
  function feuilleNouveauSejour(mode = "sejour") {
    let ch = D.chambres[0]?.id;
    const t = T.iso(T.auj());
    const f = feuille({ titre: "Ajouter", droite: "Ajouter", corps: `
      ${segments("sMode", [["sejour", "Un séjour"], ["ferme", "Fermer des dates"]], mode)}
      <p class="entete-groupe">Chambre</p><div class="groupe"><div class="puces" id="sCh">${D.chambres.map(c => `<button type="button" data-c="${c.id}" aria-pressed="${c.id === ch}">${esc(c.nom)}</button>`).join("")}</div></div>
      <div class="groupe" style="margin-top:20px">
        <div class="champ-ligne" id="sNomL" ${mode === "ferme" ? "hidden" : ""}><label for="sNom">Hôtes</label><input id="sNom" placeholder="Famille Martin" autocomplete="off"></div>
        <div class="champ-ligne"><label for="sA">Arrivée</label><input id="sA" type="date" value="${t}"></div>
        <div class="champ-ligne"><label for="sD">Départ</label><input id="sD" type="date" value="${T.iso(T.plus(t, 2))}"></div>
        <div class="champ-ligne" id="sPL" ${mode === "ferme" ? "hidden" : ""}><label for="sP">Personnes</label><input id="sP" type="number" inputmode="numeric" min="1" max="8" value="2"></div>
      </div><p class="pied-groupe" id="sErr"></p>`, ok: () => {
        const nom = mode === "ferme" ? "Fermé" : $("sNom").value.trim(), a = $("sA").value, d = $("sD").value;
        if (!nom) { $("sErr").textContent = "Indiquez le nom des hôtes."; $("sNom").focus(); return; }
        if (!a || !d || d <= a) { $("sErr").textContent = "Le départ doit être après l'arrivée."; return; }
        const pris = D.sejours.find(s => s.chambre === ch && s.statut !== "annule" && s.arrivee < d && s.depart > a);
        if (pris) { $("sErr").textContent = `${chambre(ch).nom} est déjà prise du ${dC(pris.arrivee)} au ${dC(pris.depart)} (${pris.nom}).`; return; }
        D.sejours.push({ id: Date.now().toString(36), chambre: ch, arrivee: a, depart: d, nom, personnes: mode === "ferme" ? 0 : +$("sP").value || 2, statut: mode === "ferme" ? "ferme" : "confirme", source: mode === "ferme" ? "" : "ajouté dans l'appli" });
        sauver(mode === "ferme" ? "Dates fermées sur le site" : "Séjour ajouté"); fermeFeuille(); route();
      } });
    f.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.c) { ch = b.dataset.c; f.querySelectorAll("[data-c]").forEach(x => x.setAttribute("aria-pressed", x === b)); }
      if (b.dataset.s) { mode = b.dataset.s; f.querySelectorAll("[data-s]").forEach(x => x.setAttribute("aria-pressed", x === b)); $("sNomL").hidden = $("sPL").hidden = mode === "ferme"; }
    });
  }
  function chambres() {
    ecran({ titre: "Chambres", sous: "les prix par nuit, comme sur le site", corps: `<div class="groupe">${D.chambres.map(c => `<button type="button" class="ligne" data-ch="${c.id}"><span><b>${esc(c.nom)}</b><small>${esc(c.texte || "")}${c.texte ? " · " : ""}${c.places} pers.</small></span><span class="valeur num">${eur(c.prix)}</span>${chev}</button>`).join("")}</div>` });
    document.querySelectorAll("[data-ch]").forEach(b => b.onclick = () => {
      const c = chambre(b.dataset.ch);
      feuille({ titre: c.nom, droite: "OK", corps: `<div class="groupe"><div class="champ-ligne"><label for="kPrix">Prix par nuit</label><input id="kPrix" type="number" inputmode="decimal" value="${c.prix}"></div><div class="champ-ligne"><label for="kPl">Personnes</label><input id="kPl" type="number" inputmode="numeric" value="${c.places}"></div><div class="champ-ligne"><label for="kTx">Phrase</label><input id="kTx" value="${esc(c.texte || "")}"></div></div>`,
        ok: () => { c.prix = +$("kPrix").value || c.prix; c.places = +$("kPl").value || c.places; c.texte = $("kTx").value.trim(); sauver("Enregistré"); fermeFeuille(); chambres(); } });
    });
  }

  /* =====================================================================
     COMMUN : aujourd'hui, mon site
     ===================================================================== */
  /* la période du gros chiffre : 7 jours, 1 mois, 3 mois */
  let per = "1m";
  const PERIODES = [["7j", "7 J"], ["1m", "1 M"], ["3m", "3 M"]], NJ = { "7j": 7, "1m": 30, "3m": 90 };
  /* une série par jour sur la fenêtre, et la même somme sur la fenêtre d'avant pour l'évolution */
  function serie(debut, n, parJour, cumul) {
    let c = 0; const pts = [...Array(n)].map((_, i) => { const v = parJour(T.iso(T.plus(debut, i))); c += v; return cumul ? c : v; });
    const tot = pts.length ? (cumul ? pts[n - 1] : pts.reduce((a, b) => a + b, 0)) : 0;
    let av = 0; for (let i = 1; i <= n; i++) av += parJour(T.iso(T.plus(debut, -i)));
    return { pts, tot, delta: av ? Math.round((tot - av) / av * 100) : null };
  }
  function brancheChiffre(refaire) {
    document.querySelectorAll("[data-per]").forEach(b => b.onclick = () => { per = b.dataset.per; const el = document.querySelector(".chiffre"); el.outerHTML = refaire(); brancheChiffre(refaire); });
  }

  function aujBoutique() {
    const t = T.auj(), cmd = [...D.commandes].sort((a, b) => new Date(b.date) - new Date(a.date));
    const ouvertes = cmd.filter(o => o.statut === "nouvelle" || o.statut === "a-coudre"), pretes = cmd.filter(o => o.statut === "prete");
    const nouv = ouvertes.filter(o => o.statut === "nouvelle").length, bas = D.produits.filter(p => !p.surCommande && p.stock <= p.seuil);
    const atelier = ouvertes.flatMap(o => o.lignes.map(l => ({ o, l }))).sort((a, b) => new Date(a.o.date) - new Date(b.o.date));
    const parJour = d => cmd.filter(o => o.date.slice(0, 10) === d).reduce((s, o) => s + total(o), 0);
    const leChiffre = () => { const n = NJ[per], r = serie(T.plus(t, -n + 1), n, parJour, true); return chiffre({ id: "leChiffre", lbl: `Ventes sur ${n} jours`, val: eurG(r.tot), delta: r.delta, periodes: PERIODES, actif: per, points: r.pts }); };
    ecran({ titre: "Aujourd'hui",
      hero: hero({ phrase: ouvertes.length ? `${pl(ouvertes.length, "commande")} à préparer<span>${nouv ? `, dont ${pl(nouv, "nouvelle")}` : ""}.</span>` : `Tout est prêt.<span> Aucune commande en attente.</span>`,
        verres: [["Nouveau produit", "boite", "", "vNouv"], ["Voir mon site", "site", S.site]] }),
      corps: `${leChiffre()}
      <div class="tuiles">
        ${tuile({ titre: "À préparer", val: ouvertes.length, sous: nouv ? pl(nouv, "nouvelle") : "rien de nouveau", icone: "sac", couleur: "bleu", href: "#/commandes" })}
        ${tuile({ titre: "Prêtes", val: pretes.length, sous: "à remettre", icone: "sac", couleur: "vert", href: "#/commandes?prete" })}
        ${tuile({ titre: "Stock bas", val: bas.length, sous: bas.length ? "à recoudre" : "tout va bien", icone: "boite", couleur: "orange", href: "#/produits?bas", cls: bas.length ? "alerte" : "" })}
        ${tuile({ titre: "En ligne", val: D.produits.filter(p => p.enLigne).length, sous: "produits sur le site", icone: "site", couleur: "noir", href: "#/produits" })}
      </div>
      <p class="entete-groupe fort">À l'atelier <a href="#/commandes">Tout voir</a></p>
      ${atelier.length ? `<div class="groupe">${atelier.slice(0, 6).map(({ o, l }) => `<a class="ligne av-image" href="#/commandes/${o.id}">${photoDe(l.produit)}<span><b class="gras">${l.prenom ? esc(l.prenom) : esc(l.nom)}</b><small>${l.prenom ? esc(l.nom) + " · " : ""}${esc(o.client)}, ${dC(o.date)}</small></span>${l.q > 1 ? `<span class="valeur num">× ${l.q}</span>` : ""}${chev}</a>`).join("")}</div>` : `<div class="vide-doux">Rien à coudre pour l'instant.</div>`}` });
    $("vNouv").onclick = () => feuilleProduit();
    brancheChiffre(leChiffre);
  }

  function aujInstitut() {
    const t = T.auj(), ti = T.iso(t), now = new Date(), mn = now.getHours() * 60 + now.getMinutes();
    const jourL = rdvDuJour(ti), restants = jourL.filter(r => r.debut + presta(r.presta).duree > mn && r.statut !== "absent"), proch = restants.find(r => r.debut >= mn) || restants[0];
    const dem = D.rdv.filter(r => r.statut === "demande").sort((a, b) => (a.date + String(a.debut).padStart(4, "0")).localeCompare(b.date + String(b.debut).padStart(4, "0")));
    const parJour = d => D.rdv.filter(r => r.date === d && ["venu", "confirme"].includes(r.statut) && d <= ti).reduce((s, r) => s + presta(r.presta).prix, 0);
    const leChiffre = () => { const n = NJ[per], r = serie(T.plus(t, -n + 1), n, parJour, true); return chiffre({ id: "leChiffre", lbl: `Chiffre sur ${n} jours`, val: eurG(r.tot), delta: r.delta, periodes: PERIODES, actif: per, points: r.pts }); };
    ecran({ titre: "Aujourd'hui",
      hero: hero({ phrase: jourL.length ? `${pl(jourL.length, "rendez-vous", "rendez-vous")} aujourd'hui<span>${proch ? `, prochain à ${hm(proch.debut)} avec ${esc(client(proch.client).nom.split(" ")[0])}` : ", la journée est finie"}.</span>` : `Journée libre.<span> Aucun rendez-vous aujourd'hui.</span>`,
        verres: [["Nouveau rendez-vous", "agenda", "", "vRdv"], ["Voir l'agenda", "gens", "#/agenda"]] }),
      corps: `${leChiffre()}
      <div class="tuiles">
        ${tuile({ titre: "À confirmer", val: dem.length, sous: "demandes du site", icone: "agenda", couleur: "bleu", href: "#/agenda" })}
        ${tuile({ titre: "Restants", val: restants.length, sous: "aujourd'hui", icone: "agenda", couleur: "vert", href: "#/agenda" })}
        ${tuile({ titre: "Clients", val: D.clients.length, sous: "dans le fichier", icone: "gens", couleur: "violet", href: "#/clients" })}
        ${tuile({ titre: "Carte", val: D.prestations.length, sous: "prestations", icone: "ciseaux", couleur: "noir", href: "#/prestations" })}
      </div>
      ${dem.length ? `<p class="entete-groupe fort">À confirmer</p><div class="groupe">${dem.slice(0, 4).map(r => `<div class="ligne"><span><b class="gras">${esc(client(r.client).nom)}</b><small>${esc(presta(r.presta).nom)} · ${dC(r.date)} à ${hm(r.debut)}</small></span><button class="bouton petit" data-oui="${r.id}">Accepter</button></div>`).join("")}</div>` : ""}
      <p class="entete-groupe fort">Rendez-vous du jour <a href="#/agenda">Agenda</a></p>
      ${restants.length ? `<div class="groupe">${restants.map(ligneRdv).join("")}</div>` : `<div class="vide-doux">${jourL.length ? "La journée est terminée." : "Pas de rendez-vous aujourd'hui."}</div>`}` });
    $("vRdv").onclick = () => feuilleNouveauRdv({ date: ti });
    brancheChiffre(leChiffre);
  }

  function aujHebergement() {
    const t = T.auj(), ti = T.iso(t), L = D.sejours.filter(s => !["annule", "ferme"].includes(s.statut));
    const arr = L.filter(s => s.arrivee === ti), dep = L.filter(s => s.depart === ti), dem = L.filter(s => s.statut === "demande");
    let nuits = 0; const cap = D.chambres.length * 30 || 1;
    L.filter(s => s.statut === "confirme").forEach(s => { for (let d = new Date(s.arrivee); d < new Date(s.depart); d = T.plus(d, 1)) if (d >= t && d < T.plus(t, 30)) nuits++; });
    const semaine = L.filter(s => s.statut === "confirme" && new Date(s.arrivee) > t && new Date(s.arrivee) < T.plus(t, 8)).sort((a, b) => a.arrivee.localeCompare(b.arrivee));
    /* ce que rapportent les nuits réservées, jour par jour, sur les jours à venir */
    const parJour = d => L.filter(s => s.statut === "confirme" && s.arrivee <= d && s.depart > d).reduce((x, s) => x + chambre(s.chambre).prix, 0);
    const leChiffre = () => { const n = NJ[per], r = serie(t, n, parJour, true); return chiffre({ id: "leChiffre", lbl: `Réservé, ${n} prochains jours`, val: eurG(r.tot), periodes: PERIODES, actif: per, points: r.pts }); };
    ecran({ titre: "Aujourd'hui",
      hero: hero({ phrase: arr.length ? `${pl(arr.length, "arrivée")} aujourd'hui<span>, ${Math.round(nuits / cap * 100)} % de remplissage sur 30 jours.</span>` : `Pas d'arrivée aujourd'hui.<span> ${Math.round(nuits / cap * 100)} % de remplissage sur 30 jours.</span>`,
        verres: [["Ajouter un séjour", "lit", "", "vSej"], ["Fermer des dates", "agenda", "", "vFerme"]] }),
      corps: `${leChiffre()}
      <div class="tuiles">
        ${tuile({ titre: "Arrivées", val: arr.length, sous: arr.map(s => esc(s.nom)).join(", ") || "aujourd'hui", icone: "lit", couleur: "bleu" })}
        ${tuile({ titre: "Départs", val: dep.length, sous: dep.map(s => esc(s.nom)).join(", ") || "aujourd'hui", icone: "lit", couleur: "orange" })}
        ${tuile({ titre: "Remplissage", val: `${Math.round(nuits / cap * 100)} %`, sous: `${nuits} nuits sur ${cap}`, icone: "agenda", couleur: "vert" })}
        ${tuile({ titre: "À confirmer", val: dem.length, sous: "demandes du site", icone: "agenda", couleur: "noir", href: "#/sejours?demande" })}
      </div>
      <p class="entete-groupe fort">La maison, 14 jours <a href="#/sejours">Séjours</a></p>
      ${planning(t, 14)}
      ${arr.length ? `<p class="entete-groupe fort">Arrivent aujourd'hui</p><div class="groupe">${arr.map(ligneSejour).join("")}</div>` : ""}
      <p class="entete-groupe fort">Cette semaine</p>
      ${semaine.length ? `<div class="groupe">${semaine.map(ligneSejour).join("")}</div>` : `<div class="vide-doux">Pas d'autre arrivée cette semaine.</div>`}` });
    $("vSej").onclick = () => feuilleNouveauSejour();
    $("vFerme").onclick = () => feuilleNouveauSejour("ferme");
    brancheChiffre(leChiffre);
  }

  function aujourdhui() {
    if (S.metier === "boutique") aujBoutique();
    else if (S.metier === "institut") aujInstitut();
    else if (S.metier === "hebergement") aujHebergement();
    else ecran({ titre: "Aujourd'hui", hero: hero({ phrase: `Votre site est en ligne.<span> Ses textes se changent dans « Mon site ».</span>`, verres: [["Mon site", "site", "#/site"], ["Voir le site", "site", S.site]] }), corps: "" });
    brancheRdv(); brancheOui(); brancheSej();
  }

  let installer = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); installer = e; });
  function site() {
    const k = D.contenu;
    ecran({ titre: "Mon site", sous: "ce que vos visiteurs lisent", corps: `
      ${S.site ? `<div class="groupe" style="margin-top:4px"><a class="ligne av-icone" href="${esc(S.site)}" target="_blank" rel="noopener"><span class="icone-carre">${ico("site", 18)}</span><span><b>Voir mon site</b></span>${chev}</a></div>` : ""}
      <p class="entete-groupe">L'annonce en haut du site</p>
      <div class="groupe">${interr("kVis", k.annonceVisible, "Afficher l'annonce")}<div class="champ-ligne"><input id="kAnn" value="${esc(k.annonce)}" maxlength="90" placeholder="Fermé le 1er novembre" style="text-align:left;color:var(--texte)" aria-label="Texte de l'annonce"></div></div>
      <div class="annonce" id="kApercu" ${k.annonceVisible && k.annonce ? "" : "hidden"}>${esc(k.annonce)}</div>
      <p class="entete-groupe">Accueil</p>
      <div class="groupe"><div class="champ-ligne bloc"><textarea id="kAcc" aria-label="Phrase d'accueil">${esc(k.accueil)}</textarea></div></div>
      <p class="entete-groupe">Infos pratiques</p>
      <div class="groupe"><div class="champ-ligne"><label for="kHor">${S.metier === "boutique" ? "Délai" : S.metier === "hebergement" ? "Arrivée" : "Horaires"}</label><input id="kHor" value="${esc(k.horaires)}"></div><div class="champ-ligne"><label for="kCon">Contact</label><input id="kCon" value="${esc(k.contact)}"></div></div>
      <div class="boutons"><button class="bouton" id="kOk">Enregistrer</button></div>
      <p class="pied-groupe">Dans cette démo, les changements restent sur ce téléphone ; ils iront sur le site quand il sera relié à l'appli.</p>
      <p class="entete-groupe">L'appli</p>
      <div class="groupe"><button class="ligne" id="kInstall"><span><b class="lien-texte">Mettre sur l'écran d'accueil</b></span>${chev}</button>${S.demo ? `<button class="ligne" id="kZero"><span><b class="danger">Remettre la démo à zéro</b></span></button>` : ""}</div>
      <p class="pied-groupe">${esc(S.nom)} · ${esc(A.METIERS[S.metier].nom)} · Saitorapp par <a class="lien-texte" href="https://saitora.fr">Saitora</a></p>` });
    const ap = () => { $("kApercu").textContent = $("kAnn").value; $("kApercu").hidden = !(coche("kVis") && $("kAnn").value.trim()); };
    $("kVis").onclick = () => { $("kVis").setAttribute("aria-checked", !coche("kVis")); ap(); };
    $("kAnn").oninput = ap;
    $("kOk").onclick = () => { Object.assign(k, { annonce: $("kAnn").value.trim(), annonceVisible: coche("kVis"), accueil: $("kAcc").value.trim(), horaires: $("kHor").value.trim(), contact: $("kCon").value.trim() }); sauver("Enregistré"); };
    $("kInstall").onclick = () => {
      if (installer) { installer.prompt(); installer = null; return; }
      feuille({ titre: "Écran d'accueil", gauche: "OK", corps: `<div class="groupe"><div class="ligne"><span><b>Sur iPhone</b><small class="deux">Dans Safari, touchez le bouton Partager, puis « Sur l'écran d'accueil ».</small></span></div><div class="ligne"><span><b>Sur Android</b><small class="deux">Dans Chrome, ouvrez le menu, puis « Installer l'application ».</small></span></div></div><p class="pied-groupe">L'appli apparaît avec le nom et le logo de ${esc(S.nom)}.</p>` });
    };
    if ($("kZero")) $("kZero").onclick = () => { if (!confirm("Remettre les données de démonstration à zéro ?")) return; try { localStorage.removeItem(CLE); } catch (e) {} D = A.semer(S); recevoir(); sauver("Démo remise à zéro"); route(); };
  }

  function introuvable(retour) { ecran({ titre: "Introuvable", retour, corps: `<div class="vide-doux">Cette page n'existe plus.</div>` }); }

  /* ---------- les adresses ---------- */
  const ECRANS = { aujourdhui, commandes, produits, agenda, clients, prestations, sejours, chambres, site };
  function route() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    const [chemin, q] = h.split("?"); let [m, id] = chemin.split("/");
    if (!MODS.includes(m) || !ECRANS[m]) m = MODS[0];
    if (q && m === "commandes") filtreCmd = q;
    if (q && m === "produits") filtrePro = q;
    if (q && m === "sejours") filtreSej = q;
    fermeFeuille(true);
    onglets(m);
    ECRANS[m](id);
  }
  addEventListener("hashchange", route);
  addEventListener("storage", e => { if (e.key === "saitorapp-commandes-recues" && recevoir()) { hud("Nouvelle commande du site"); route(); } });
  /* pas de zoom dans l'appli : ni au pincement, ni au double toucher (Safari ignore user-scalable=no) */
  ["gesturestart", "gesturechange", "gestureend"].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  /* le double toucher est coupé par touch-action: manipulation (app.css), sans gêner le pavé numérique */
  route();
})();

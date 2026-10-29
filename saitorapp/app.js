/* Saitorapp : les écrans. Une page, des adresses en #/…, les données dans donnees.js. */
(() => {
  const D = Donnees, $ = id => document.getElementById(id);
  const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const eur = v => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  const dateC = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const dateL = d => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const heure = d => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const moisNom = d => new Date(d).toLocaleDateString("fr-FR", { month: "long" });
  const jours = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

  let clientId = "mademoiselle-charlotte";
  try { clientId = localStorage.getItem("saitorapp-client") || clientId; } catch (e) {}
  const C = () => D.etat.clients[clientId];
  const a = m => C().modules.includes(m);

  /* les étapes d'une commande */
  const STATUTS = [["nouvelle", "Nouvelle"], ["a-coudre", "À coudre"], ["prete", "Prête"], ["remise", "Remise"]];
  const nomStatut = s => (STATUTS.find(x => x[0] === s) || [s, s])[1];
  const totalCmd = c => c.lignes.reduce((t, l) => t + l.prix * l.q, 0);
  const RES = { confirmee: "Confirmée", demande: "À confirmer", ferme: "Fermé", annulee: "Annulée" };

  const ICONES = {
    aujourdhui: '<path d="M2.5 6.5L8 2l5.5 4.5V14h-11z"/><path d="M6.5 14v-4h3v4"/>',
    commandes: '<path d="M3 4h10l-1 9H4z"/><path d="M5.5 6V4a2.5 2.5 0 0 1 5 0v2"/>',
    produits: '<path d="M8 1.8l5.5 3v6.4L8 14.2l-5.5-3V4.8z"/><path d="M2.5 4.8L8 8l5.5-3.2M8 8v6.2"/>',
    calendrier: '<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>',
    site: '<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 5.5h13"/>'
  };
  const icone = k => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${ICONES[k]}</svg>`;
  const rubriques = () => [
    ["aujourdhui", "Aujourd'hui", true],
    ["commandes", "Commandes", a("commandes")],
    ["produits", "Produits et stock", a("produits")],
    ["calendrier", "Réservations", a("reservations")],
    ["site", "Mon site", a("site")]
  ].filter(r => r[2]);

  function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("vu"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("vu"), 2600); }
  const sauver = (msg) => { D.enregistrer(); if (msg) toast(msg); };

  /* ---------- le cadre ---------- */
  function cadre(route) {
    const c = C();
    $("commerce").innerHTML = `<span class="vign">${c.logo ? `<img src="${c.logo}" alt="">` : esc(c.nom[0])}</span><span><b>${esc(c.nom)}</b><small>${esc(c.metier)}</small></span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 6l3-3 3 3M5 10l3 3 3-3"/></svg>`;
    const aFaire = a("commandes") ? c.commandes.filter(x => x.statut === "nouvelle" || x.statut === "a-coudre").length : 0;
    const demandes = a("reservations") ? c.reservations.filter(x => x.statut === "demande").length : 0;
    $("nav").innerHTML = rubriques().map(([k, t]) => `<a href="#/${k}" ${route === k ? 'aria-current="page"' : ""}>${icone(k)}${t}${k === "commandes" && aFaire ? `<span class="cpt num">${aFaire}</span>` : ""}${k === "calendrier" && demandes ? `<span class="cpt num">${demandes}</span>` : ""}</a>`).join("");
    document.querySelectorAll(".cote .bas a").forEach(x => x.dataset.r === route ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"));
    $("onglets").innerHTML = rubriques().slice(0, 4).map(([k, t]) => `<a href="#/${k}" ${route === k ? 'aria-current="page"' : ""}>${icone(k)}${{ aujourdhui: "Aujourd'hui", commandes: "Commandes", produits: "Produits", calendrier: "Réservations", site: "Site" }[k]}</a>`).join("");
    $("voirSite").href = c.site;
    const titre = { aujourdhui: "Aujourd'hui", commandes: "Commandes", produits: "Produits et stock", calendrier: "Réservations", site: "Mon site", modules: "Modules", clients: "Tous les clients" }[route] || "";
    $("ou").innerHTML = `<span class="cache-tel-h">${esc(c.nom)} · </span><b>${titre}</b>`;
  }

  /* ---------- Aujourd'hui ---------- */
  function ecranAujourdhui() {
    const c = C(), t = D.aujourdhui(), parts = [];
    parts.push(`<div class="tete"><h1>Aujourd'hui</h1><span class="sous">${dateL(t)}</span></div>`);
    if (a("commandes")) {
      const mois = c.commandes.filter(x => new Date(x.date).getMonth() === t.getMonth() && new Date(x.date).getFullYear() === t.getFullYear());
      const ouvertes = c.commandes.filter(x => x.statut === "nouvelle" || x.statut === "a-coudre");
      const pretes = c.commandes.filter(x => x.statut === "prete");
      const bas = a("produits") ? c.produits.filter(p => !p.surCommande && p.stock <= p.seuil) : [];
      parts.push(`<div class="carte" style="margin-bottom:16px"><div class="chiffres">
        <div><p class="lbl">À préparer</p><p class="val num ${ouvertes.length ? "" : "zero"}">${ouvertes.length}</p><p class="note">${ouvertes.filter(x => x.statut === "nouvelle").length} nouvelle${ouvertes.filter(x => x.statut === "nouvelle").length > 1 ? "s" : ""}</p></div>
        <div><p class="lbl">Prêtes à remettre</p><p class="val num ${pretes.length ? "" : "zero"}">${pretes.length}</p><p class="note">la cliente attend un message</p></div>
        <div><p class="lbl">Ventes de ${moisNom(t)}</p><p class="val num">${eur(mois.reduce((s, x) => s + totalCmd(x), 0))}</p><p class="note">${mois.length} commande${mois.length > 1 ? "s" : ""}</p></div>
        <div><p class="lbl">Stock bas</p><p class="val num ${bas.length ? "bas-stock" : "zero"}">${bas.length}</p><p class="note">${bas.length ? "à recoudre" : "rien à recoudre"}</p></div>
      </div></div>`);
      /* l'atelier du jour : chaque pièce à broder, avec son prénom */
      const aBroder = ouvertes.flatMap(o => o.lignes.map(l => ({ o, l }))).sort((x, y) => new Date(x.o.date) - new Date(y.o.date));
      parts.push(`<div class="grille">
        <section class="carte s3"><header><h2>À l'atelier</h2><span class="sous num">${aBroder.length} pièce${aBroder.length > 1 ? "s" : ""}</span></header>
          ${aBroder.length ? `<ul class="liste" style="margin-top:8px">${aBroder.slice(0, 7).map(({ o, l }) => `<li><div><p>${l.prenom ? `<span class="prenom">${esc(l.prenom)}</span> · ` : ""}${esc(l.nom)}${l.q > 1 ? ` <span class="gris num">× ${l.q}</span>` : ""}</p><p class="gris" style="font-size:12px">${esc(l.detail || "")}${l.detail ? " · " : ""}${esc(o.cliente)}, commandé le ${dateC(o.date)}</p></div><div class="fin"><a class="btn petit" href="#/commandes/${o.id}">${o.id}</a></div></li>`).join("")}</ul>
          ${aBroder.length > 7 ? `<div class="corps"><a class="btn lien" href="#/commandes">Voir les ${aBroder.length} pièces</a></div>` : ""}` : `<div class="corps"><p class="vide">Rien à coudre pour l'instant. Les nouvelles commandes du site arrivent ici.</p></div>`}
        </section>
        <section class="carte s3"><header><h2>Ventes par semaine</h2><span class="sous">8 dernières semaines</span></header><div class="corps"><div id="graphe" style="height:220px"></div></div></section>
        <section class="carte s4"><header><h2>Dernières commandes</h2><a class="btn petit" href="#/commandes">Tout voir</a></header>${tableCommandes([...c.commandes].sort((x, y) => new Date(y.date) - new Date(x.date)).slice(0, 5))}</section>
        ${a("produits") ? `<section class="carte s2"><header><h2>Stock bas</h2></header>${bas.length ? `<ul class="liste" style="margin-top:8px">${bas.map(p => `<li><img class="vignette" src="${esc(p.photo)}" alt=""><div style="min-width:0"><p>${esc(p.nom)}</p><p class="${p.stock ? "gris" : "bas-stock"}" style="font-size:12px">${p.stock ? `plus que ${p.stock}` : "épuisé"}</p></div><div class="fin">${stockCtl(p)}</div></li>`).join("")}</ul>` : `<div class="corps"><p class="vide">Tout est en stock.</p></div>`}</section>` : ""}
      </div>`);
      $("ecran").innerHTML = parts.join("");
      /* ventes par semaine, la semaine en cours en couleur */
      const sem = [...Array(8)].map((_, i) => { const fin = D.plus(t, -7 * (7 - i) + 1), deb = D.plus(fin, -7); return { deb, fin, v: c.commandes.filter(x => new Date(x.date) >= deb && new Date(x.date) < fin).reduce((s, x) => s + totalCmd(x), 0) }; });
      Charts.bars($("graphe"), { labels: sem.map(s => dateC(s.deb)), values: sem.map(s => s.v), highlight: 7, format: Charts.fmt.money("EUR", 0), height: 220, xAt: [0, 2, 4, 6, 7] });
      brancherStock();
      return;
    }
    if (a("reservations")) {
      const r = c.reservations.filter(x => x.statut !== "annulee"), ti = D.iso(t);
      const arr = r.filter(x => x.arrivee === ti && x.statut !== "ferme"), dep = r.filter(x => x.depart === ti && x.statut !== "ferme");
      const dem = r.filter(x => x.statut === "demande");
      let nuits = 0; const cap = c.chambres.length * 30;
      r.filter(x => x.statut === "confirmee").forEach(x => { for (let d = new Date(x.arrivee); d < new Date(x.depart); d = D.plus(d, 1)) if (d >= t && d < D.plus(t, 30)) nuits++; });
      parts.push(`<div class="carte" style="margin-bottom:16px"><div class="chiffres">
        <div><p class="lbl">Arrivées aujourd'hui</p><p class="val num ${arr.length ? "" : "zero"}">${arr.length}</p><p class="note">${arr.map(x => esc(x.nom)).join(", ") || "personne"}</p></div>
        <div><p class="lbl">Départs aujourd'hui</p><p class="val num ${dep.length ? "" : "zero"}">${dep.length}</p><p class="note">${dep.map(x => esc(x.nom)).join(", ") || "personne"}</p></div>
        <div><p class="lbl">Remplissage, 30 jours</p><p class="val num">${Math.round(nuits / cap * 100)}<small> %</small></p><p class="note num">${nuits} nuits sur ${cap}</p></div>
        <div><p class="lbl">Demandes à confirmer</p><p class="val num ${dem.length ? "" : "zero"}">${dem.length}</p><p class="note">${dem.length ? "depuis le site" : "aucune en attente"}</p></div>
      </div></div>
      <div class="grille">
        <section class="carte s6"><header><h2>La maison, chambre par chambre</h2><span class="sous">14 prochains jours</span><a class="btn petit" href="#/calendrier">Calendrier</a></header><div class="corps"><div id="maison"></div><div class="legende" id="legende" style="margin-top:10px"></div></div></section>
        <section class="carte s3"><header><h2>À confirmer</h2></header>${dem.length ? `<ul class="liste" style="margin-top:8px">${dem.map(x => `<li><div><p><b style="font-weight:500">${esc(x.nom)}</b> · ${esc(nomChambre(x.chambre))}</p><p class="gris num" style="font-size:12px">${dateC(x.arrivee)} → ${dateC(x.depart)}, ${jours(x.arrivee, x.depart)} nuits, ${x.personnes} pers.</p></div><div class="fin"><button class="btn petit" data-refuse="${x.id}">Refuser</button><button class="btn petit prim" data-accepte="${x.id}">Accepter</button></div></li>`).join("")}</ul>` : `<div class="corps"><p class="vide">Aucune demande en attente.</p></div>`}</section>
        <section class="carte s3"><header><h2>Arrivées de la semaine</h2></header>${(() => { const s = r.filter(x => x.statut === "confirmee" && new Date(x.arrivee) >= t && new Date(x.arrivee) < D.plus(t, 7)).sort((x, y) => x.arrivee.localeCompare(y.arrivee)); return s.length ? `<ul class="liste" style="margin-top:8px">${s.map(x => `<li><div><p>${esc(x.nom)}</p><p class="gris" style="font-size:12px">${esc(nomChambre(x.chambre))}, ${x.personnes} pers.</p></div><div class="fin num gris">${dateC(x.arrivee)}</div></li>`).join("")}</ul>` : `<div class="corps"><p class="vide">Pas d'arrivée cette semaine.</p></div>`; })()}</section>
      </div>`);
      $("ecran").innerHTML = parts.join("");
      dessineMaison($("maison"), t, 14, $("legende"));
      brancherDemandes();
      return;
    }
    $("ecran").innerHTML = parts.join("") + `<p class="vide">Ajoutez un module pour suivre ce site.</p>`;
  }

  /* ---------- Commandes ---------- */
  function tableCommandes(l) {
    if (!l.length) return `<div class="corps"><p class="vide">Aucune commande ici.</p></div>`;
    return `<table class="table pliable" style="margin-top:12px"><thead><tr><th>Commande</th><th>Cliente</th><th>Pièces</th><th class="droite">Total</th><th>Étape</th></tr></thead><tbody>
      ${l.map(o => `<tr class="clic" data-cmd="${o.id}"><td><b style="font-weight:500">${o.id}</b> <span class="gris num">${dateC(o.date)}</span></td><td class="l2">${esc(o.cliente)}</td><td class="l2 cache-tel">${o.lignes.map(x => esc(x.prenom || x.nom)).join(", ")}</td><td class="droite num">${eur(totalCmd(o))}</td><td class="coin"><span class="pill p-${o.statut}">${nomStatut(o.statut)}</span></td></tr>`).join("")}
    </tbody></table>`;
  }
  function brancherLignes() { document.querySelectorAll("[data-cmd]").forEach(tr => tr.addEventListener("click", () => location.hash = `#/commandes/${tr.dataset.cmd}`)); }
  let filtreCmd = "a-faire";
  function ecranCommandes() {
    const c = C(), tri = [...c.commandes].sort((x, y) => new Date(y.date) - new Date(x.date));
    const F = [["a-faire", "À préparer", o => o.statut === "nouvelle" || o.statut === "a-coudre"], ["nouvelle", "Nouvelles", o => o.statut === "nouvelle"], ["prete", "Prêtes", o => o.statut === "prete"], ["remise", "Remises", o => o.statut === "remise"], ["toutes", "Toutes", () => true]];
    const f = F.find(x => x[0] === filtreCmd) || F[0];
    $("ecran").innerHTML = `<div class="tete"><h1>Commandes</h1><span class="sous">venues du panier du site</span></div>
      <div class="filtres" id="filtresCmd">${F.map(([k, t, fn]) => `<button type="button" data-f="${k}" aria-pressed="${k === f[0]}"><span>${t}</span><b class="num">${tri.filter(fn).length}</b></button>`).join("")}</div>
      <section class="carte">${tableCommandes(tri.filter(f[2]))}</section>`;
    $("filtresCmd").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; filtreCmd = b.dataset.f; ecranCommandes(); });
    brancherLignes();
  }
  function ecranCommande(id) {
    const c = C(), o = c.commandes.find(x => x.id === id);
    if (!o) return introuvable("Cette commande n'existe pas.", "#/commandes");
    const i = STATUTS.findIndex(s => s[0] === o.statut), suiv = STATUTS[i + 1];
    $("ecran").innerHTML = `<p class="fil"><a href="#/commandes">Commandes</a> / ${o.id}</p>
      <div class="objet"><div><h1>${o.id} · ${esc(o.cliente)}</h1><p class="meta num">${dateL(o.date)} à ${heure(o.date)} · ${esc(o.remise)} · ${eur(totalCmd(o))}</p></div>
        <div class="act">${o.tel ? `<a class="btn" href="tel:${esc(o.tel.replace(/[^0-9+]/g, ""))}">Appeler</a>` : ""}${suiv ? `<button class="btn prim" id="avance">${suiv[0] === "a-coudre" ? "Commencer à coudre" : suiv[0] === "prete" ? "Marquer prête" : "Marquer remise"}</button>` : ""}</div></div>
      <div class="etapes">${STATUTS.map((s, k) => `<span class="${k <= i ? "fait" : ""}">${k === i ? `<span class="pill p-${s[0]}">${s[1]}</span>` : s[1]}</span>`).join("")}</div>
      <div class="grille">
        <section class="carte s4"><header><h2>Pièces</h2></header>
          <table class="table pliable" style="margin-top:12px"><thead><tr><th>Pièce</th><th>À broder</th><th class="droite">Qté</th><th class="droite">Prix</th></tr></thead><tbody>
          ${o.lignes.map(l => { const p = (c.produits || []).find(x => x.id === l.produit); return `<tr><td><div class="cellnom">${p ? `<img class="vignette" src="${esc(p.photo)}" alt="">` : ""}<span><b>${esc(l.nom)}</b>${l.detail ? `<small>${esc(l.detail)}</small>` : ""}</span></div></td><td class="l2">${l.prenom ? `<span class="prenom">${esc(l.prenom)}</span>` : '<span class="gris">—</span>'}</td><td class="droite num cache-tel">${l.q}</td><td class="droite num">${eur(l.prix * l.q)}</td></tr>`; }).join("")}
          <tr><td colspan="3" class="cache-tel" style="font-weight:500">Total</td><td class="droite num" style="font-weight:600">${eur(totalCmd(o))}</td></tr>
          </tbody></table></section>
        <section class="carte s2"><header><h2>Cliente</h2></header><div class="corps"><p style="font-weight:500">${esc(o.cliente)}</p><p class="gris num">${esc(o.tel || "")}${o.email ? `<br>${esc(o.email)}` : ""}</p><p style="margin-top:10px">${esc(o.remise)}</p>${o.mot ? `<p style="margin-top:10px">« ${esc(o.mot)} »</p>` : ""}${o.source === "site" ? `<p class="gris" style="margin-top:10px;font-size:12px">Envoyée depuis le panier du site</p>` : ""}</div></section>
      </div>`;
    if (suiv) $("avance").addEventListener("click", () => { o.statut = suiv[0]; sauver(`${o.id} : ${suiv[1].toLowerCase()}`); route(); });
  }

  /* ---------- Produits et stock ---------- */
  const stockCtl = p => p.surCommande ? `<span class="gris">sur commande</span>` : `<span class="stock" data-stock="${p.id}"><button type="button" data-d="-1" aria-label="Un de moins">−</button><output class="num ${p.stock <= p.seuil ? "bas-stock" : ""}">${p.stock}</output><button type="button" data-d="1" aria-label="Un de plus">+</button></span>`;
  function brancherStock() {
    document.querySelectorAll("[data-stock]").forEach(s => s.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; e.stopPropagation();
      const p = C().produits.find(x => x.id === s.dataset.stock);
      p.stock = Math.max(0, p.stock + +b.dataset.d);
      sauver(p.stock === 0 ? `${p.nom} : épuisé` : "");
      const o = s.querySelector("output"); o.textContent = p.stock; o.classList.toggle("bas-stock", p.stock <= p.seuil);
    }));
  }
  let filtrePro = "tous";
  function ecranProduits() {
    const c = C();
    const F = [["tous", "Tous", () => true], ["ligne", "En ligne", p => p.enLigne], ["hors", "Hors ligne", p => !p.enLigne], ["bas", "Stock bas", p => !p.surCommande && p.stock <= p.seuil], ["commande", "Sur commande", p => p.surCommande]];
    const f = F.find(x => x[0] === filtrePro) || F[0], l = c.produits.filter(f[2]);
    $("ecran").innerHTML = `<div class="tete"><h1>Produits et stock</h1><span class="sous num">${c.produits.filter(p => p.enLigne).length} en ligne sur le site</span><div class="act"><a class="btn prim" href="#/produits/nouveau">Ajouter un produit</a></div></div>
      <div class="filtres" id="filtresPro">${F.map(([k, t, fn]) => `<button type="button" data-f="${k}" aria-pressed="${k === f[0]}"><span>${t}</span><b class="num">${c.produits.filter(fn).length}</b></button>`).join("")}</div>
      <section class="carte">${l.length ? `<table class="table pliable" style="margin-top:12px"><thead><tr><th>Produit</th><th>Famille</th><th class="droite">Prix</th><th>Stock</th><th>Sur le site</th></tr></thead><tbody>
        ${l.map(p => `<tr class="clic" data-pro="${p.id}"><td><div class="cellnom"><img class="vignette" src="${esc(p.photo)}" alt="" loading="lazy"><span><b>${esc(p.nom)}</b>${p.perso ? "<small>brodé au prénom</small>" : ""}</span></div></td><td class="l2 cache-tel">${esc((window.FAMILLES || {})[p.famille] || p.famille)}</td><td class="droite num">${eur(p.prix)}</td><td class="l2">${stockCtl(p)}</td><td class="coin"><button type="button" class="bascule" role="switch" aria-checked="${p.enLigne}" data-ligne="${p.id}" aria-label="${esc(p.nom)} sur le site"><span class="interr"></span><span class="cache-tel gris">${p.enLigne ? "En ligne" : "Retiré"}</span></button></td></tr>`).join("")}
      </tbody></table>` : `<div class="corps"><p class="vide">Aucun produit dans cette liste.</p></div>`}</section>`;
    $("filtresPro").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; filtrePro = b.dataset.f; ecranProduits(); });
    brancherStock();
    document.querySelectorAll("[data-ligne]").forEach(b => b.addEventListener("click", e => {
      e.stopPropagation(); const p = c.produits.find(x => x.id === b.dataset.ligne); p.enLigne = !p.enLigne;
      sauver(p.enLigne ? `${p.nom} remis en ligne` : `${p.nom} retiré du site`); ecranProduits();
    }));
    document.querySelectorAll("[data-pro]").forEach(tr => tr.addEventListener("click", e => { if (e.target.closest("[data-stock],[data-ligne]")) return; location.hash = `#/produits/${tr.dataset.pro}`; }));
  }
  function ecranProduit(id) {
    const c = C(), nouveau = id === "nouveau";
    const p = nouveau ? { id: "", nom: "", famille: "bavoirs", prix: 10, perso: false, texte: "", photo: "", surCommande: false, stock: 1, seuil: 1, enLigne: true } : c.produits.find(x => x.id === id);
    if (!p) return introuvable("Ce produit n'existe pas.", "#/produits");
    const fam = window.FAMILLES || {};
    $("ecran").innerHTML = `<p class="fil"><a href="#/produits">Produits et stock</a> / ${nouveau ? "Nouveau produit" : esc(p.nom)}</p>
      <div class="tete"><h1>${nouveau ? "Ajouter un produit" : esc(p.nom)}</h1></div>
      <form class="form" id="formPro" novalidate>
        <div class="champ large"><span class="lbl">Photo</span><div class="photo-choix"><img id="apercuPhoto" src="${esc(p.photo)}" alt="" ${p.photo ? "" : "hidden"}><span class="vide" id="sansPhoto" ${p.photo ? "hidden" : ""}>Pas encore de photo</span><label class="btn" for="fPhoto">Choisir une photo</label><input id="fPhoto" type="file" accept="image/*" hidden></div></div>
        <div class="champ large"><label for="fNom">Nom</label><input class="saisie" id="fNom" value="${esc(p.nom)}" required></div>
        <div class="champ"><label for="fPrix">Prix (€)</label><input class="saisie num" id="fPrix" type="number" min="0" step="1" inputmode="decimal" value="${p.prix}"></div>
        <div class="champ"><label for="fFam">Famille</label><select class="saisie" id="fFam">${Object.entries(fam).map(([k, t]) => `<option value="${k}" ${k === p.famille ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="champ"><span class="lbl">Fabrication</span><button type="button" class="bascule" role="switch" id="fSurCmd" aria-checked="${p.surCommande}"><span class="interr"></span>Faite sur commande, pas de stock</button></div>
        <div class="champ" id="blocStock" ${p.surCommande ? "hidden" : ""}><label for="fStock">En stock</label><input class="saisie num" id="fStock" type="number" min="0" step="1" inputmode="numeric" value="${p.stock ?? 0}"><span class="aide">L'appli vous prévient quand il en reste ${p.seuil} ou moins.</span></div>
        <div class="champ"><span class="lbl">Personnalisation</span><button type="button" class="bascule" role="switch" id="fPerso" aria-checked="${p.perso}"><span class="interr"></span>Le client écrit un prénom à broder</button></div>
        <div class="champ"><span class="lbl">Sur le site</span><button type="button" class="bascule" role="switch" id="fLigne" aria-checked="${p.enLigne}"><span class="interr"></span>En ligne</button></div>
        <div class="champ large"><label for="fTexte">Description</label><textarea class="saisie" id="fTexte">${esc(p.texte)}</textarea></div>
        <div class="large" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn prim" type="submit">${nouveau ? "Ajouter le produit" : "Enregistrer"}</button><a class="btn" href="#/produits">Annuler</a>${nouveau ? "" : `<button class="btn" type="button" id="suppr" style="margin-left:auto;color:var(--negative)">Supprimer</button>`}</div>
        <p class="gris large" id="erreurPro" aria-live="polite"></p>
      </form>`;
    let photo = p.photo;
    ["fSurCmd", "fPerso", "fLigne"].forEach(k => $(k).addEventListener("click", () => { const v = $(k).getAttribute("aria-checked") !== "true"; $(k).setAttribute("aria-checked", v); if (k === "fSurCmd") $("blocStock").hidden = v; }));
    /* la photo est réduite à 700 px avant d'être gardée */
    $("fPhoto").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image(); img.onload = () => {
        const s = Math.min(1, 700 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        photo = cv.toDataURL("image/jpeg", .82); $("apercuPhoto").src = photo; $("apercuPhoto").hidden = false; $("sansPhoto").hidden = true; URL.revokeObjectURL(img.src);
      }; img.src = URL.createObjectURL(f);
    });
    $("formPro").addEventListener("submit", e => {
      e.preventDefault();
      const nom = $("fNom").value.trim();
      if (!nom) { $("erreurPro").textContent = "Donnez un nom au produit."; $("fNom").focus(); return; }
      Object.assign(p, { nom, prix: Math.max(0, +$("fPrix").value || 0), famille: $("fFam").value, surCommande: $("fSurCmd").getAttribute("aria-checked") === "true", perso: $("fPerso").getAttribute("aria-checked") === "true", enLigne: $("fLigne").getAttribute("aria-checked") === "true", texte: $("fTexte").value.trim(), photo });
      p.stock = p.surCommande ? null : Math.max(0, parseInt($("fStock").value, 10) || 0);
      if (nouveau) { p.id = nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36).slice(-4); c.produits.unshift(p); }
      sauver(nouveau ? `${nom} ajouté` : "Enregistré"); location.hash = "#/produits";
    });
    if (!nouveau) $("suppr").addEventListener("click", () => { if (!confirm(`Supprimer « ${p.nom} » ?`)) return; c.produits.splice(c.produits.indexOf(p), 1); sauver(`${p.nom} supprimé`); location.hash = "#/produits"; });
  }

  /* ---------- Réservations ---------- */
  const nomChambre = id => (C().chambres.find(x => x.id === id) || {}).nom || id;
  const KINDS = { confirmee: { label: "Confirmée", mark: "hue" }, demande: { label: "À confirmer", mark: "outline", dash: true }, ferme: { label: "Fermé", mark: "hatch" } };
  function dessineMaison(el, debut, n, legende, onSelect) {
    const c = C(), days = [...Array(n)].map((_, i) => { const d = D.plus(debut, i); return { label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }), short: String(d.getDate()) }; });
    const weekends = [...Array(n)].map((_, i) => D.plus(debut, i).getDay()).map((w, i) => (w === 0 || w === 6) ? i : -1).filter(i => i >= 0);
    const rows = c.chambres.map(ch => ({ label: ch.nom, sub: `${ch.places} pers. · ${ch.prix} €`, bars: c.reservations.filter(x => x.chambre === ch.id && x.statut !== "annulee").map(x => ({ from: jours(debut, x.arrivee), to: jours(debut, x.depart) - 1, kind: x.statut, label: x.statut === "ferme" ? x.nom : x.nom, id: x.id })) }));
    const t = jours(debut, D.aujourdhui());
    const r = Charts.timeline(el, rows, KINDS, { days, weekends, today: t >= 0 && t < n ? t : null, onSelect });
    if (legende && r.legend && !legende.childElementCount) legende.appendChild(r.legend);
  }
  let moisVu = 0;
  function ecranCalendrier() {
    const c = C(), t = D.aujourdhui(), deb = new Date(t.getFullYear(), t.getMonth() + moisVu, 1), n = new Date(deb.getFullYear(), deb.getMonth() + 1, 0).getDate();
    const resMois = c.reservations.filter(x => x.statut !== "annulee" && new Date(x.depart) > deb && new Date(x.arrivee) < D.plus(deb, n)).sort((x, y) => x.arrivee.localeCompare(y.arrivee));
    $("ecran").innerHTML = `<div class="tete"><h1>Réservations</h1><span class="sous">${deb.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
      <div class="act"><button class="btn" id="avant" aria-label="Mois précédent">←</button><button class="btn" id="ceMois" ${moisVu ? "" : "disabled"}>Ce mois</button><button class="btn" id="apres" aria-label="Mois suivant">→</button><button class="btn" id="fermer">Fermer des dates</button><button class="btn prim" id="ajout">Ajouter un séjour</button></div></div>
      <section class="carte" style="margin-bottom:16px"><div class="corps" style="padding-top:16px"><div id="cal"></div><div class="legende" id="legCal" style="margin-top:10px"></div></div></section>
      <section class="carte"><header><h2>Séjours du mois</h2><span class="sous num">${resMois.filter(x => x.statut !== "ferme").length}</span></header>
      ${resMois.length ? `<table class="table pliable" style="margin-top:12px"><thead><tr><th>Hôtes</th><th>Chambre</th><th>Dates</th><th class="droite">Montant</th><th>État</th></tr></thead><tbody>${resMois.map(x => { const ch = c.chambres.find(y => y.id === x.chambre); const nts = jours(x.arrivee, x.depart); return `<tr class="clic" data-res="${x.id}"><td><b style="font-weight:500">${esc(x.nom)}</b></td><td class="l2">${esc(ch.nom)}${x.personnes ? `, ${x.personnes} pers.` : ""}</td><td class="l2 num cache-tel">${dateC(x.arrivee)} → ${dateC(x.depart)} · ${nts} nuit${nts > 1 ? "s" : ""}</td><td class="droite num">${x.statut === "ferme" ? '<span class="gris">—</span>' : eur(ch.prix * nts)}</td><td class="coin"><span class="pill p-${x.statut}">${RES[x.statut]}</span></td></tr>`; }).join("")}</tbody></table>` : `<div class="corps"><p class="vide">Aucun séjour ce mois-ci.</p></div>`}</section>`;
    /* sur téléphone, dix jours à la fois pour que les séjours restent lisibles */
    const tel = innerWidth < 640, debVu = tel ? (moisVu ? deb : t) : deb;
    dessineMaison($("cal"), debVu, tel ? 10 : n, $("legCal"), b => panneauSejour(b.id));
    $("avant").onclick = () => { moisVu--; ecranCalendrier(); };
    $("apres").onclick = () => { moisVu++; ecranCalendrier(); };
    $("ceMois").onclick = () => { moisVu = 0; ecranCalendrier(); };
    $("ajout").onclick = () => formSejour(false);
    $("fermer").onclick = () => formSejour(true);
    document.querySelectorAll("[data-res]").forEach(tr => tr.addEventListener("click", () => panneauSejour(tr.dataset.res)));
  }
  function fermePanneau() { document.querySelector(".panneau")?.remove(); }
  function panneauSejour(id) {
    const c = C(), x = c.reservations.find(y => y.id === id); if (!x) return; fermePanneau();
    const ch = c.chambres.find(y => y.id === x.chambre), nts = jours(x.arrivee, x.depart);
    const el = document.createElement("div"); el.className = "panneau"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", x.nom);
    el.innerHTML = `<h3>${esc(x.nom)}</h3><p class="gris num">${esc(ch.nom)} · ${dateC(x.arrivee)} → ${dateC(x.depart)} · ${nts} nuit${nts > 1 ? "s" : ""}${x.personnes ? ` · ${x.personnes} pers.` : ""}</p>
      <p style="margin-top:8px"><span class="pill p-${x.statut}">${RES[x.statut]}</span>${x.statut !== "ferme" ? ` <span class="num">${eur(ch.prix * nts)}</span>` : ""}${x.source ? ` <span class="gris">· par ${esc(x.source)}</span>` : ""}</p>
      <div class="act">${x.statut === "demande" ? `<button class="btn prim" data-accepte="${x.id}">Accepter</button><button class="btn" data-refuse="${x.id}">Refuser</button>` : `<button class="btn" id="annule">${x.statut === "ferme" ? "Rouvrir ces dates" : "Annuler le séjour"}</button>`}<button class="btn" id="ferme" style="margin-left:auto">Fermer</button></div>`;
    document.body.appendChild(el);
    el.querySelector("#ferme").onclick = fermePanneau;
    el.querySelector("#annule")?.addEventListener("click", () => { if (x.statut === "ferme") c.reservations.splice(c.reservations.indexOf(x), 1); else x.statut = "annulee"; sauver(x.statut === "annulee" ? "Séjour annulé" : "Dates rouvertes"); fermePanneau(); route(); });
    brancherDemandes(el);
    el.querySelector("button").focus();
  }
  function brancherDemandes(scope = document) {
    scope.querySelectorAll("[data-accepte]").forEach(b => b.addEventListener("click", () => { const x = C().reservations.find(y => y.id === b.dataset.accepte); x.statut = "confirmee"; sauver(`${x.nom} : séjour confirmé`); fermePanneau(); route(); }));
    scope.querySelectorAll("[data-refuse]").forEach(b => b.addEventListener("click", () => { const x = C().reservations.find(y => y.id === b.dataset.refuse); x.statut = "annulee"; sauver(`${x.nom} : demande refusée`); fermePanneau(); route(); }));
  }
  function formSejour(fermeture) {
    const c = C(); fermePanneau();
    const t = D.iso(D.aujourdhui()), el = document.createElement("div"); el.className = "panneau"; el.setAttribute("role", "dialog");
    el.innerHTML = `<h3>${fermeture ? "Fermer des dates" : "Ajouter un séjour"}</h3><form id="fs" style="display:grid;gap:12px;margin-top:10px" novalidate>
      ${fermeture ? "" : `<div class="champ"><label for="sNom">Nom des hôtes</label><input class="saisie" id="sNom" autocomplete="off"></div>`}
      <div class="champ"><label for="sCh">Chambre</label><select class="saisie" id="sCh">${c.chambres.map(ch => `<option value="${ch.id}">${esc(ch.nom)}</option>`).join("")}</select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="champ"><label for="sA">${fermeture ? "Du" : "Arrivée"}</label><input class="saisie" id="sA" type="date" value="${t}"></div><div class="champ"><label for="sD">${fermeture ? "Au" : "Départ"}</label><input class="saisie" id="sD" type="date" value="${D.iso(D.plus(t, 2))}"></div></div>
      ${fermeture ? `<div class="champ"><label for="sNom">Raison (pour vous)</label><input class="saisie" id="sNom" value="Fermé"></div>` : `<div class="champ"><label for="sP">Personnes</label><input class="saisie num" id="sP" type="number" min="1" max="6" value="2"></div>`}
      <p class="gris" id="sErr" aria-live="polite"></p>
      <div class="act" style="margin-top:0"><button class="btn prim" type="submit">${fermeture ? "Fermer ces dates" : "Ajouter"}</button><button class="btn" type="button" id="sAnn">Annuler</button></div></form>`;
    document.body.appendChild(el);
    el.querySelector("#sAnn").onclick = fermePanneau;
    el.querySelector("#fs").addEventListener("submit", e => {
      e.preventDefault();
      const nom = el.querySelector("#sNom").value.trim(), ch = el.querySelector("#sCh").value, ar = el.querySelector("#sA").value, de = el.querySelector("#sD").value;
      if (!nom) return el.querySelector("#sErr").textContent = "Indiquez un nom.";
      if (!ar || !de || de <= ar) return el.querySelector("#sErr").textContent = "Le départ doit être après l'arrivée.";
      const pris = c.reservations.find(x => x.chambre === ch && x.statut !== "annulee" && x.arrivee < de && x.depart > ar);
      if (pris) return el.querySelector("#sErr").textContent = `${nomChambre(ch)} est déjà prise du ${dateC(pris.arrivee)} au ${dateC(pris.depart)} (${pris.nom}).`;
      c.reservations.push({ id: `UF-${Date.now().toString(36).slice(-5)}`, chambre: ch, arrivee: ar, depart: de, nom, personnes: fermeture ? 0 : +el.querySelector("#sP").value || 2, statut: fermeture ? "ferme" : "confirmee", source: fermeture ? "" : "ajouté à la main" });
      sauver(fermeture ? "Dates fermées sur le site" : `${nom} ajouté au calendrier`); fermePanneau(); route();
    });
    el.querySelector("input,select").focus();
  }

  /* ---------- Mon site ---------- */
  function ecranSite() {
    const c = C(), k = c.contenu;
    $("ecran").innerHTML = `<div class="tete"><h1>Mon site</h1><span class="sous">ce que les visiteurs lisent</span><div class="act"><a class="btn" href="${c.site}" target="_blank" rel="noopener">Ouvrir le site</a></div></div>
      <form class="form" id="formSite" novalidate>
        <div class="champ large"><span class="lbl">L'annonce en haut du site</span>
          <div class="apercu-annonce" id="apAnn" ${k.annonceVisible ? "" : "hidden"}><div class="bandeau" id="apTxt">${esc(k.annonce)}</div></div>
          <input class="saisie" id="cAnn" value="${esc(k.annonce)}" maxlength="90" aria-label="Texte de l'annonce">
          <button type="button" class="bascule" role="switch" id="cVis" aria-checked="${k.annonceVisible}"><span class="interr"></span>Afficher l'annonce</button></div>
        <div class="champ large"><label for="cAcc">Phrase d'accueil</label><textarea class="saisie" id="cAcc">${esc(k.accueil)}</textarea></div>
        <div class="champ"><label for="cDel">${a("reservations") ? "Arrivées et départs" : "Délai"}</label><input class="saisie" id="cDel" value="${esc(k.delai)}"></div>
        <div class="champ"><label for="cCon">Contact</label><input class="saisie" id="cCon" value="${esc(k.contact)}"></div>
        <div class="large" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn prim" type="submit">Enregistrer</button><span class="gris" style="font-size:13px">Dans cette démo, les changements restent dans l'appli : ils iront sur le site quand il sera relié.</span></div>
      </form>`;
    $("cAnn").addEventListener("input", () => $("apTxt").textContent = $("cAnn").value);
    $("cVis").addEventListener("click", () => { const v = $("cVis").getAttribute("aria-checked") !== "true"; $("cVis").setAttribute("aria-checked", v); $("apAnn").hidden = !v; });
    $("formSite").addEventListener("submit", e => { e.preventDefault(); Object.assign(k, { annonce: $("cAnn").value.trim(), annonceVisible: $("cVis").getAttribute("aria-checked") === "true", accueil: $("cAcc").value.trim(), delai: $("cDel").value.trim(), contact: $("cCon").value.trim() }); sauver("Enregistré"); });
  }

  /* ---------- Modules ---------- */
  function ecranModules() {
    const c = C();
    $("ecran").innerHTML = `<div class="tete"><h1>Modules</h1><span class="sous">ce que ${esc(c.nom)} gère dans l'appli</span></div>
      <section class="carte">${Object.entries(D.MODULES).map(([k, m]) => `<div class="module"><div><b>${m.nom}</b><p>${m.texte}</p>${["rendezvous", "carte"].includes(k) ? '<p class="gris" style="font-size:12px;margin-top:4px">Bientôt</p>' : ""}</div><button type="button" class="bascule" role="switch" data-mod="${k}" aria-checked="${c.modules.includes(k)}" ${["rendezvous", "carte"].includes(k) ? "disabled" : ""} aria-label="${m.nom}"><span class="interr"></span></button></div>`).join("")}</section>`;
    document.querySelectorAll("[data-mod]").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.mod, on = !c.modules.includes(k);
      if (on && k === "commandes" && !c.commandes) c.commandes = [];
      if (on && k === "produits" && !c.produits) c.produits = [];
      if (on && k === "reservations" && !c.reservations) { c.chambres = [{ id: "chambre-1", nom: "Chambre 1", prix: 80, places: 2 }]; c.reservations = []; }
      c.modules = on ? [...c.modules, k] : c.modules.filter(x => x !== k);
      sauver(`${D.MODULES[k].nom} ${on ? "ajouté" : "retiré"}`); route();
    }));
  }

  /* ---------- Tous les clients (vue Saitora) ---------- */
  function ecranClients() {
    const L = Object.entries(D.etat.clients);
    $("ecran").innerHTML = `<div class="tete"><h1>Tous les clients</h1><span class="sous num">${L.length} sites suivis</span><div class="act"><button class="btn" id="remettre">Remettre la démo à zéro</button></div></div>
      <section class="carte"><table class="table pliable" style="margin-top:12px"><thead><tr><th>Client</th><th>Métier</th><th>Modules</th><th class="droite">À traiter</th></tr></thead><tbody>
      ${L.map(([id, c]) => { const n = (c.commandes || []).filter(x => x.statut === "nouvelle" || x.statut === "a-coudre").length + (c.reservations || []).filter(x => x.statut === "demande").length; return `<tr class="clic" data-cli="${id}"><td><b style="font-weight:500">${esc(c.nom)}</b></td><td class="l2">${esc(c.metier)}</td><td class="l2 cache-tel">${c.modules.map(m => D.MODULES[m].nom).join(", ")}</td><td class="droite num">${n || '<span class="gris">0</span>'}</td></tr>`; }).join("")}
      </tbody></table></section>`;
    document.querySelectorAll("[data-cli]").forEach(tr => tr.addEventListener("click", () => choisir(tr.dataset.cli)));
    $("remettre").onclick = () => { if (confirm("Remettre toutes les données de démonstration à zéro ?")) { D.remettre(); toast("Démo remise à zéro"); route(); } };
  }

  function introuvable(t, retour) { $("ecran").innerHTML = `<div class="tete"><h1>Introuvable</h1></div><p class="vide">${t} <a href="${retour}">Retour</a></p>`; }

  /* ---------- changer de client ---------- */
  function choisir(id) {
    clientId = id; try { localStorage.setItem("saitorapp-client", id); } catch (e) {}
    $("commerces").hidden = true; $("commerce").setAttribute("aria-expanded", false);
    location.hash = "#/aujourdhui"; route();
  }
  $("commerce").addEventListener("click", () => {
    const l = $("commerces"), o = l.hidden;
    l.hidden = !o; $("commerce").setAttribute("aria-expanded", o);
    l.innerHTML = `<div class="nav">${Object.entries(D.etat.clients).filter(([id]) => id !== clientId).map(([id, c]) => `<a href="#" data-choix="${id}">${esc(c.nom)}</a>`).join("")}</div>`;
    l.querySelectorAll("[data-choix]").forEach(x => x.addEventListener("click", e => { e.preventDefault(); choisir(x.dataset.choix); }));
  });

  /* ---------- menu du téléphone ---------- */
  const app = $("app");
  const fermeMenu = () => { app.classList.remove("menu-ouvert"); $("menuBtn").setAttribute("aria-expanded", false); };
  $("menuBtn").addEventListener("click", () => { const o = !app.classList.contains("menu-ouvert"); app.classList.toggle("menu-ouvert", o); $("menuBtn").setAttribute("aria-expanded", o); });
  $("cote").addEventListener("click", e => { if (e.target.closest("a[href^='#/']")) fermeMenu(); });
  addEventListener("keydown", e => { if (e.key === "Escape") { fermeMenu(); fermePanneau(); } });

  /* ---------- les adresses ---------- */
  function route() {
    const [, r = "aujourdhui", id] = (location.hash || "#/aujourdhui").split("/");
    const ok = { commandes: a("commandes"), produits: a("produits"), calendrier: a("reservations"), site: a("site") };
    const rr = r in ok && !ok[r] ? "aujourdhui" : r;
    cadre(rr); fermePanneau();
    ({ aujourdhui: ecranAujourdhui, commandes: () => id ? ecranCommande(id) : ecranCommandes(), produits: () => id ? ecranProduit(id) : ecranProduits(), calendrier: ecranCalendrier, site: ecranSite, modules: ecranModules, clients: ecranClients }[rr] || ecranAujourdhui)();
    $("feuille").scrollTop = 0; scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  /* une commande envoyée depuis le site dans un autre onglet arrive sans recharger */
  addEventListener("storage", e => { if (e.key === "saitorapp-commandes-recues" && D.recevoir()) { toast("Nouvelle commande reçue du site"); route(); } });
  route();
})();

/* N3E Graphics : le configurateur de kit (l'idée du site), la boutique et les mouvements.
   Les animations viennent de la banque animations/mouvements.html : 01, 02, 03, 06, 19, 20, 23, 25, 29, 34, 38, 44.
   Sans JavaScript la page reste lisible en entier ; avec « moins de mouvement », rien ne bouge. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const borne = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ---------- 02 et 19 : ce qui arrive quand on le regarde ---------- */
  $$(".etapes li, .parole").forEach((e, i) => e.style.setProperty("--i", i % 3));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".rise, .rideau").forEach(e => io.observe(e));
  } else $$(".rise, .rideau").forEach(e => e.classList.add("on"));

  /* ---------- 25 : le voile d'attente tant que la photo n'est pas chargée ---------- */
  $$(".sq").forEach(b => { const im = $("img", b); if (im && !im.complete) { b.classList.add("charge"); const fin = () => b.classList.remove("charge"); im.addEventListener("load", fin); im.addEventListener("error", fin); } });

  /* ---------- 03 : la bande des marques (doublée pour boucler) ---------- */
  if (!calme) { const fil = $(".bande-fil"); $$("span", fil).forEach(s => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); fil.append(c); }); }

  /* ---------- 06 : l'onde du bouton plein ---------- */
  document.addEventListener("pointerdown", e => { const b = e.target.closest(".btn"); if (!b) return; const r = b.getBoundingClientRect(); b.style.setProperty("--x", e.clientX - r.left + "px"); b.style.setProperty("--y", e.clientY - r.top + "px"); b.classList.remove("onde"); void b.offsetWidth; b.classList.add("onde"); });

  /* ---------- le dessin de la moto ---------- */
  const COULEURS = [["Blanc", "#F5F3EE"], ["Noir", "#1B1917"], ["Rose", "#E40977"], ["Bleu", "#1F5FD1"], ["Jaune", "#F2C200"], ["Rouge", "#D7262B"], ["Vert", "#1E9E57"], ["Orange", "#F26B1D"], ["Turquoise", "#19B5C8"], ["Violet", "#7A3FD0"]];
  const MARQUES = [["KTM", "#F26B1D"], ["GasGas", "#D7262B"], ["Husqvarna", "#F5F3EE"], ["Beta", "#D7262B"], ["Yamaha", "#1F5FD1"], ["Suzuki", "#F2C200"], ["Sherco", "#1F5FD1"], ["Stark Varg", "#E9E6E0"], ["Fantic", "#D7262B"], ["Triumph", "#1B1917"], ["Kawasaki", "#3BB54A"], ["TM Racing", "#19A0D8"], ["Honda", "#D7262B"], ["Talaria", "#1B1917"], ["Surron", "#1B1917"]];
  const ZONES = { ar: "M92 250 Q196 176 352 204 L366 240 Q236 224 108 270 Z", plaque: "M318 232 L452 238 L430 352 L330 332 Z", air: "M452 244 L528 240 L552 318 L512 360 L436 340 Z", ouie: "M520 232 L676 184 Q722 186 732 224 L664 350 L552 318 Z",
    front: "M676 128 L734 116 L754 222 L708 240 Z", av: "M700 282 Q800 228 926 300 L918 322 Q800 270 714 312 Z", fourche: "M752 338 L778 330 L812 442 L786 450 Z", bras: "M262 438 L480 392 L494 420 L272 468 Z" };
  const clair = h => { const n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + (n >> 8 & 255) * 587 + (n & 255) * 114) / 1000 > 150; };
  const roue = x => `<g transform="translate(${x} 455)"><circle r="126" fill="none" stroke="#1D1B18" stroke-width="9" stroke-dasharray="11 7"/><circle r="110" fill="none" stroke="#1D1B18" stroke-width="24"/><circle r="94" fill="none" stroke="#A7A298" stroke-width="5"/>${[0, 30, 60, 90, 120, 150].map(a => `<path d="M-92 0H92" stroke="#B9B4AA" stroke-width="1.6" transform="rotate(${a})"/>`).join("")}<circle r="38" fill="none" stroke="#8F8A80" stroke-width="4"/><circle r="15" fill="#2B2824"/></g>`;
  let serie = 0;
  function moto(o) {
    const id = "m" + (++serie), z = Object.values(ZONES).map(d => `<path d="${d}"/>`).join("");
    const fond = o.origine ? o.plastique : o.fond, encre = clair(fond) ? "#17140F" : "#FBFAF7";
    const plaque = o.origine ? (clair(fond) ? "#1B1917" : "#F5F3EE") : (clair(o.accent) === clair(fond) ? (clair(fond) ? "#1B1917" : "#F5F3EE") : o.accent);
    const chiffre = clair(plaque) ? "#17140F" : "#FBFAF7";
    let motif = "";
    if (!o.origine && o.motif === "eclats") motif = `<g fill="${o.accent}"><path d="M70 318 L430 176 L372 262 L132 342 Z"/><path d="M430 392 L706 166 L770 176 L528 408 Z"/><path d="M650 372 L944 262 L934 312 L708 392 Z"/><path d="M236 492 L520 388 L500 446 Z"/><path d="M700 150 L760 118 L760 150 L716 196 Z"/></g><g fill="${encre}" opacity=".9"><path d="M96 352 L392 246 L384 258 L110 360 Z"/><path d="M470 400 L742 196 L748 206 L486 408 Z"/><path d="M690 396 L940 318 L938 328 L700 404 Z"/></g>`;
    if (!o.origine && o.motif === "lignes") motif = `<g transform="rotate(-15 500 320)"><g fill="${o.accent}">${[150, 262, 374].map(y => `<rect x="-200" y="${y}" width="1400" height="46"/>`).join("")}</g><g fill="${encre}" opacity=".9">${[204, 316, 428].map(y => `<rect x="-200" y="${y}" width="1400" height="8"/>`).join("")}</g></g>`;
    if (!o.origine && o.motif === "uni") motif = `<g fill="none" stroke="${o.accent}" stroke-width="7" stroke-linejoin="round">${z}</g>`;
    const fini = o.origine ? "" : o.fini === "chrome" ? `<rect width="1000" height="640" fill="url(#${id}c)" opacity=".55"/>` : o.fini === "holo" ? `<rect width="1000" height="640" fill="url(#${id}h)" opacity=".34" style="mix-blend-mode:screen"/>` : "";
    const num = esc((o.num || "").replace(/\D/g, "").slice(0, 3)), n = num.length || 1, nom = esc((o.nom || "").trim().toUpperCase());
    const textes = o.origine ? "" : `<g font-family="Geist,system-ui,sans-serif" font-weight="600" font-style="italic" text-anchor="middle">
      <text x="384" y="${296 + 22 - n * 3}" font-size="${[84, 70, 54][n - 1]}" fill="${chiffre}" transform="rotate(4 384 292)">${num}</text>
      <text x="715" y="${180 + 12}" font-size="${[46, 36, 27][n - 1]}" fill="${chiffre}" transform="rotate(-10 715 180)">${num}</text>
      <text x="628" y="274" font-size="${nom.length > 8 ? 20 : 27}" fill="${encre}" transform="rotate(-17 628 266)" paint-order="stroke" stroke="${fond}" stroke-width="5" stroke-linejoin="round">${nom}</text></g>`;
    return `<svg viewBox="0 0 1000 640" role="img" aria-label="${o.origine ? "Croquis de la moto avec ses plastiques d’origine" : "Croquis de ta moto avec son kit déco"}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}"><path d="${ZONES.ar}"/><path d="${ZONES.air}"/><path d="${ZONES.ouie}"/><path d="${ZONES.av}"/><path d="${ZONES.fourche}"/><path d="${ZONES.bras}"/></clipPath><clipPath id="${id}t">${z}</clipPath>
    <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2=".5"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".28" stop-color="#fff"/><stop offset=".42" stop-color="#8E99A8" stop-opacity=".5"/><stop offset=".6" stop-color="#fff"/><stop offset=".8" stop-color="#9AA3AF" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2=".6"><stop offset="0" stop-color="#FF4FD8"/><stop offset=".25" stop-color="#5BE7FF"/><stop offset=".5" stop-color="#C6FF6B"/><stop offset=".75" stop-color="#FFD85B"/><stop offset="1" stop-color="#9B6BFF"/></linearGradient></defs>
    <ellipse cx="505" cy="588" rx="400" ry="12" fill="#17140F" opacity=".1"/>
    ${roue(225)}${roue(790)}
    <g fill="none" stroke="#2B2824" stroke-linecap="round" stroke-linejoin="round"><path d="M700 180 L562 236 M700 180 L648 432 L474 474 L446 352 M452 246 L332 230" stroke-width="15"/><path d="M700 180 L790 455 M716 174 L806 449" stroke-width="11"/><path d="M700 180 L682 130 L642 116" stroke-width="10"/><path d="M480 406 L225 455" stroke-width="20"/><path d="M628 116 L654 119" stroke-width="16"/></g>
    <path d="M520 252 L604 238 L624 334 L522 348 Z" fill="#4A4640"/><path d="M452 352 L622 332 L652 432 L586 482 L464 474 Z" fill="#3A3631"/><circle cx="548" cy="412" r="34" fill="#4A4640"/><circle cx="548" cy="412" r="14" fill="#2B2824"/>
    <path d="M606 300 Q668 384 566 430" fill="none" stroke="#A7A298" stroke-width="15" stroke-linecap="round"/><path d="M292 372 L408 388" stroke="#C2BDB3" stroke-width="30" stroke-linecap="round"/>
    <path d="M352 204 Q470 180 560 214 L528 240 L366 240 Z" fill="#1D1B18"/><path d="M520 478 L570 474" stroke="#2B2824" stroke-width="9" stroke-linecap="round"/>
    <g fill="${fond}" stroke="#17140F" stroke-opacity=".16" stroke-width="2" stroke-linejoin="round">${z}</g>
    <g clip-path="url(#${id})">${motif}</g>
    <g fill="${plaque}"><path d="${ZONES.plaque}"/><path d="${ZONES.front}"/></g>
    <g clip-path="url(#${id}t)">${fini}</g>
    <g fill="none" stroke="#17140F" stroke-opacity=".22" stroke-width="2" stroke-linejoin="round">${z}</g>
    ${textes}</svg>`;
  }

  /* ---------- le configurateur ---------- */
  const f = $("#reglages"), sel = [];
  if (f) {
    $("#marque").innerHTML = MARQUES.map(([n]) => `<option>${n}</option>`).join("");
    const pastilles = (nom, defaut, liste) => liste.map(([n, c]) => `<label title="${n}"><input type="radio" name="${nom}" value="${c}"${c === defaut ? " checked" : ""}><span style="--c:${c}"></span><span hidden>${n}</span></label>`).join("");
    $("#fonds").innerHTML = pastilles("fond", "#E40977", COULEURS.slice(0, 8));
    $("#accents").innerHTML = pastilles("accent", "#F5F3EE", COULEURS);
    $$(".pastilles input").forEach(i => i.setAttribute("aria-label", i.parentNode.title));
    const etat = () => { const d = new FormData(f); return { formule: d.get("formule"), marque: d.get("marque"), cyl: +d.get("cyl"), fond: d.get("fond"), accent: d.get("accent"), motif: d.get("motif"), num: d.get("num") || "", nom: d.get("nom") || "", fini: d.get("fini"), logo: !!d.get("logo") }; };
    const nomCouleur = c => (COULEURS.find(x => x[1] === c) || [""])[0].toLowerCase();
    /* les prix sont ceux de son site : 100 % perso 155 € (50 cc) et 210 € (125 et plus) ; semi-perso 110 € et 165 € ; logo 10 €, base chrome 75 €, holographique 85 € */
    function prix(o) {
      const [petit, grand] = o.formule === "perso" ? [155, 210] : [110, 165];
      const plus = (o.fini === "chrome" ? 75 : o.fini === "holo" ? 85 : 0) + (o.formule === "semi" && o.logo ? 10 : 0);
      const milieu = o.cyl === 65 || o.cyl === 85;
      return { texte: milieu ? `${petit + plus} à ${grand + plus} €` : `${(o.cyl === 50 ? petit : grand) + plus} €`, milieu };
    }
    let avant = "";
    function dessine() {
      const o = etat(), p = prix(o), plastique = (MARQUES.find(m => m[0] === o.marque) || MARQUES[0])[1];
      $("#vueKit").innerHTML = moto(o);
      $("#vueOrigine").innerHTML = moto({ origine: true, plastique });
      $("#lLogo").hidden = o.formule !== "semi";
      $("#aideFormule").textContent = o.formule === "perso" ? "Un dessin créé pour toi, de zéro. Une mini plaque offerte." : "Un dessin déjà prêt, à tes couleurs, ton nom et ton numéro. Dix mini plaques offertes.";
      const n = $("#prix");
      if (p.texte !== avant) { n.textContent = p.texte; n.classList.remove("change"); void n.offsetWidth; n.classList.add("change"); avant = p.texte; }
      $("#prixDetail").textContent = "À partir de, TTC, pour une " + o.marque + " " + o.cyl + (p.milieu ? ". Prix exact à confirmer pour cette cylindrée." : ".") + (o.fini !== "mat" ? " Finition comprise." : "");
    }
    const resume = () => { const o = etat(); return `Kit ${o.formule === "perso" ? "100 % perso" : "semi-perso"} · ${o.marque} ${o.cyl} · fond ${nomCouleur(o.fond)}, accent ${nomCouleur(o.accent)}, dessin ${({ eclats: "éclats", lignes: "lignes", uni: "uni" })[o.motif]}${o.num ? ", n° " + o.num.replace(/\D/g, "") : ""}${o.nom.trim() ? ", nom " + o.nom.trim() : ""}${o.fini === "chrome" ? ", base chrome" : o.fini === "holo" ? ", base holographique" : ""}${o.formule === "semi" && o.logo ? ", avec logo" : ""} · ${prix(o).texte}`; };
    f.addEventListener("input", dessine);
    dessine();
    const poseKit = () => { const i = sel.findIndex(s => s.kit); const e = { kit: true, nom: resume() }; if (i >= 0) sel[i] = e; else sel.push(e); liste(); };
    $("#ajouterKit").addEventListener("click", e => { poseKit(); vole(e.currentTarget); e.currentTarget.textContent = "Dans ta sélection"; setTimeout(() => { e.currentTarget.textContent = "Ajouter à ma sélection"; }, 1800); });
    $("#demanderKit").addEventListener("click", poseKit);
    /* 20 : avant / après, à faire glisser (ou flèches du clavier) */
    const ba = $("#ba"), r = $("#baRange");
    r.addEventListener("input", () => ba.style.setProperty("--p", r.value + "%"));
  }

  /* ---------- 34 : la sélection (j'aime, ajout, pastille qui vole) ---------- */
  const panier = $("#panier"), compte = $("#compte");
  function vole(depuis) {
    panier.classList.remove("bosse"); void panier.offsetWidth; panier.classList.add("bosse");
    if (calme || !depuis.animate) return;
    const a = depuis.getBoundingClientRect(), b = panier.getBoundingClientRect(), pt = document.createElement("i");
    pt.className = "vol-pt"; document.body.append(pt);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    pt.animate([{ transform: `translate(${x0}px,${y0}px) scale(1)` }, { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 60}px) scale(1.2)`, offset: .5 }, { transform: `translate(${x1}px,${y1}px) scale(.3)` }], { duration: 650, easing: "cubic-bezier(.3,.6,.3,1)" }).onfinish = () => pt.remove();
  }
  function liste() {
    compte.textContent = sel.length; panier.classList.toggle("plein", sel.length > 0);
    panier.setAttribute("aria-label", `Ma sélection : ${sel.length} article${sel.length > 1 ? "s" : ""}`);
    const z = $("#selection"), ul = $("#liste"); if (!z) return;
    z.hidden = !sel.length; ul.innerHTML = "";
    sel.forEach((s, i) => { const li = document.createElement("li"), sp = document.createElement("span"), b = document.createElement("button"); sp.textContent = s.nom; b.type = "button"; b.textContent = "Retirer"; b.setAttribute("aria-label", "Retirer " + s.nom);
      b.onclick = () => { sel.splice(i, 1); liste(); $$(".plus").forEach(p => { if (!sel.some(x => x.nom === p.dataset.nom)) { p.classList.remove("fait"); p.textContent = "Ajouter"; } }); }; li.append(sp, b); ul.append(li); });
  }
  const COEUR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1z"/></svg>';
  $$(".carte").forEach(c => {
    const nom = c.dataset.nom, act = document.createElement("div"); act.className = "carte-act";
    const plus = Object.assign(document.createElement("button"), { type: "button", className: "plus", textContent: "Ajouter" }); plus.dataset.nom = nom;
    const coeur = Object.assign(document.createElement("button"), { type: "button", className: "coeur", innerHTML: COEUR }); coeur.setAttribute("aria-pressed", "false"); coeur.setAttribute("aria-label", "J’aime : " + nom);
    plus.onclick = () => { const i = sel.findIndex(s => s.nom === nom); if (i >= 0) { sel.splice(i, 1); plus.classList.remove("fait"); plus.textContent = "Ajouter"; } else { sel.push({ nom }); plus.classList.add("fait"); plus.textContent = "Ajouté"; vole(plus); } liste(); };
    coeur.onclick = () => { const v = coeur.getAttribute("aria-pressed") !== "true"; coeur.setAttribute("aria-pressed", v); coeur.classList.remove("pop"); void coeur.offsetWidth; if (v) coeur.classList.add("pop"); };
    act.append(plus, coeur); $(".carte-bas", c).after(act); 
  });

  /* ---------- 44 : les filtres, les cartes se rangent en glissant ---------- */
  const filtres = $("#filtres");
  if (filtres) filtres.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", filtres).forEach(x => x.setAttribute("aria-pressed", x === b));
    const cartes = $$(".carte"), avant = new Map(cartes.filter(c => !c.hidden).map(c => [c, c.getBoundingClientRect()]));
    cartes.forEach(c => { c.hidden = !(b.dataset.f === "tout" || c.dataset.c === b.dataset.f); });
    if (calme) return;
    cartes.filter(c => !c.hidden).forEach(c => { const a = avant.get(c), n = c.getBoundingClientRect();
      if (!c.animate) return;
      if (a) c.animate([{ transform: `translate(${a.left - n.left}px,${a.top - n.top}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.22,.8,.2,1)" });
      else c.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.22,.8,.2,1)" }); });
  });

  /* ---------- 38 : la galerie en accordéon ---------- */
  const vols = $$(".vol"), ouvre = v => vols.forEach(x => x.classList.toggle("ouvert", x === v));
  vols.forEach(v => { v.addEventListener("click", () => ouvre(v)); v.addEventListener("focus", () => ouvre(v)); if (matchMedia("(hover:hover)").matches) v.addEventListener("mouseenter", () => ouvre(v)); });

  /* ---------- 23 : la photo qui grandit avec le défilement ---------- */
  const zoom = $("#zoom");
  if (zoom && !calme) {
    let prevu = false;
    const regle = () => { prevu = false; const r = zoom.getBoundingClientRect(), k = borne(-r.top / (r.height - innerHeight), 0, 1), d = borne(k / .7, 0, 1);
      zoom.style.setProperty("--s", (.5 + .5 * d).toFixed(4)); zoom.style.setProperty("--k", borne((k - .55) / .3, 0, 1).toFixed(3)); };
    addEventListener("scroll", () => { if (!prevu) { prevu = true; requestAnimationFrame(regle); } }, { passive: true });
    addEventListener("resize", regle); regle();
  }

  /* ---------- la demande : la messagerie s'ouvre, message prêt ---------- */
  const form = $("#formulaire");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form), corps = [`Bonjour, c'est ${d.get("prenom")}.`, "", ...(sel.length ? ["Ma sélection :", ...sel.map(s => "- " + s.nom), ""] : []), d.get("message")].join("\n");
    location.href = "mailto:nine3eightgraphics@gmail.com?subject=" + encodeURIComponent("Demande depuis le site N3E Graphics") + "&body=" + encodeURIComponent(corps);
  });
})();

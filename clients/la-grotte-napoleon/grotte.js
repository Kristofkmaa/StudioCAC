/* La Grotte Napoléon : le script commun (langues, séances, chapeau, réservation). */
(() => {
  const $ = id => document.getElementById(id);
  const T = window.TEXTES, LANGUES = ["fr", "en", "it", "de", "es", "co"];
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- la langue : l'adresse (?lang=), le dernier choix, puis celle du téléphone ---------- */
  let L = new URLSearchParams(location.search).get("lang");
  if (!LANGUES.includes(L)) { try { L = localStorage.getItem("grotte-langue"); } catch (e) {} }
  if (!LANGUES.includes(L)) L = (navigator.languages || [navigator.language || "fr"]).map(x => x.slice(0, 2).toLowerCase()).find(x => LANGUES.includes(x)) || "fr";
  const t = (k, n) => { const s = (T[L] && T[L][k]) ?? T.fr[k] ?? ""; return n == null ? s : s.replace("{n}", n); };
  const locale = () => L === "co" ? "fr" : L;

  /* les dates : le corse a ses propres noms de jours et de mois */
  const D = window.DATES_CORSE;
  const jourLong = d => L === "co" ? `${D.jours[d.getDay()]} ${d.getDate()} ${D.mois[d.getMonth()]}` : d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
  const moisAn = d => L === "co" ? `${D.mois[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString(locale(), { month: "long", year: "numeric" });
  const jourCourt = i => { const d = new Date(2024, 0, 1 + i); return L === "co" ? D.jours[d.getDay()].slice(0, 2) : d.toLocaleDateString(locale(), { weekday: "short" }).replace(".", "").slice(0, 3); };
  const heure = m => { const h = Math.floor(m / 60), mn = m % 60; return L === "fr" ? `${h}&nbsp;h${mn ? `&nbsp;${String(mn).padStart(2, "0")}` : ""}` : `${h}:${String(mn).padStart(2, "0")}`; };
  const euros = n => `${n}&nbsp;€`;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const auj = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

  /* ---------- les séances : mêmes heures que l'ancien site, une seule salle de 30 places ---------- */
  const PLACES = 30;
  const HEURES = { complete: [720, 810, 1200, 1290], decouverte: [720, 810, 900, 960, 1020, 1200, 1290] };
  const PRIX = { complete: { adulte: 48, enfant: 30 }, decouverte: { adulte: 15, enfant: 15 } };
  const toutes = [...new Set([...HEURES.complete, ...HEURES.decouverte])].sort((a, b) => a - b);
  /* maquette : des places déjà prises, toujours les mêmes pour un jour et une heure donnés, plus celles réservées ici */
  let resas = []; try { resas = JSON.parse(localStorage.getItem("grotte-resas")) || []; } catch (e) {}
  const prises = (j, h) => {
    let x = 0; for (const c of j + h) x = (x * 31 + c.charCodeAt(0)) % 9973;
    const soir = h >= 1200 ? 9 : 0, base = (x % 23) + soir;
    return Math.min(PLACES, base + (x % 11 === 0 ? 30 : 0)) + resas.filter(r => r.jour === j && r.heure === h).reduce((s, r) => s + r.n, 0);
  };
  const libres = (j, h) => Math.max(0, PLACES - prises(j, h));
  const passee = (j, h) => { const d = new Date(j + "T00:00"); d.setMinutes(h - 10); return d < new Date(); };

  function dessineSeances() {
    if (!$("joursSeances")) return;
    const a = auj(); let jours = [a, plus(a, 1)];
    if (toutes.every(h => passee(iso(a), h))) jours = [plus(a, 1), plus(a, 2)];
    $("joursSeances").innerHTML = jours.map((d, k) => {
      const j = iso(d), nom = iso(d) === iso(a) ? t("sea-auj") : iso(d) === iso(plus(a, 1)) ? t("sea-demain") : "";
      const hs = toutes.filter(h => !passee(j, h));
      return `<div class="jour-seance"><h3>${nom || jourLong(d)}${nom ? ` <span>${jourLong(d)}</span>` : ""}</h3><div class="creneaux">${hs.map(h => {
        const n = libres(j, h), f = [HEURES.complete.includes(h) ? `<i class="c">${t("fo-o1")}</i>` : "", HEURES.decouverte.includes(h) ? `<i>${t("fo-o2")}</i>` : ""].join("");
        return `<button type="button" class="creneau" data-j="${j}" data-h="${h}" ${n ? "" : "disabled"}><b>${HEURES.complete.includes(h) ? '<span class="losange" aria-hidden="true"></span>' : ""}${heure(h)}</b><span class="f">${f}</span><small class="${n && n <= 8 ? "peu" : ""}">${n ? (n === 1 ? t("sea-place") : t("sea-places", n)) : t("sea-complet")}</small></button>`;
      }).join("")}</div></div>`;
    }).join("");
  }
  /* toucher une heure : la page « Réserver » s'ouvre avec cette séance déjà choisie */
  $("joursSeances")?.addEventListener("click", e => { const b = e.target.closest(".creneau"); if (b && !b.disabled) location.href = versReserver({ jour: b.dataset.j, heure: b.dataset.h }); });

  /* ---------- appliquer la langue ---------- */
  function langue(l, garder) {
    L = l; if (garder) { try { localStorage.setItem("grotte-langue", l); } catch (e) {} }
    document.documentElement.lang = l === "co" ? "co" : l;
    document.title = t(document.body.dataset.titre || "meta-titre"); document.querySelector('meta[name="description"]').content = t("meta-desc");
    document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll("[data-t-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.tAria)));
    document.querySelectorAll("[data-t-alt]").forEach(el => el.alt = t(el.dataset.tAlt));
    document.querySelectorAll("[data-heures]").forEach(el => el.innerHTML = HEURES[el.dataset.heures].map(heure).join(" · "));
    document.querySelectorAll("[data-langue]").forEach(el => el.innerHTML = `<button type="button" aria-expanded="false" aria-haspopup="true" aria-label="${t("nav-langue")} : ${t("nom-langue")}">${l.toUpperCase()}<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1l4 4 4-4"/></svg></button><div class="langues">${LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === l}"><span>${T[x]["nom-langue"]}</span><b>${x.toUpperCase()}</b></button>`).join("")}</div>`);
    $("langueMenu").innerHTML = LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === l}" aria-label="${T[x]["nom-langue"]}">${x.toUpperCase()}</button>`).join("");
    dessineSeances(); if (etat.ouvert) dessinePanneau();
  }
  document.addEventListener("click", e => {
    const ouvre = e.target.closest("[data-langue]>button");
    document.querySelectorAll(".langues.ouvertes").forEach(m => { if (!ouvre || m !== ouvre.nextElementSibling) { m.classList.remove("ouvertes"); m.previousElementSibling.setAttribute("aria-expanded", "false"); } });
    if (ouvre) { const m = ouvre.nextElementSibling, o = !m.classList.contains("ouvertes"); m.classList.toggle("ouvertes", o); ouvre.setAttribute("aria-expanded", o); return; }
    const b = e.target.closest("[data-l]"); if (b) langue(b.dataset.l, true);
  });

  /* les blocs apparaissent en montant ; la vidéo de la séance se lance quand on la voit */
  const ioR = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); ioR.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rise").forEach(el => calme ? el.classList.add("on") : ioR.observe(el));
  const vid = $("video");
  if (vid) new IntersectionObserver(([e]) => { if (calme) return; if (e.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }, { threshold: .3 }).observe(vid);

  /* ---------- en-tête, menu du téléphone, barre du bas ---------- */
  const tete = $("tete"), barre = $("barre");
  /* la barre du bas : dès qu'on descend, sauf quand les boutons de l'ouverture sont à l'écran */
  let boutonsVus = false;
  if ($("boutonsOuv")) new IntersectionObserver(([e]) => { boutonsVus = e.isIntersecting; haut(); }).observe($("boutonsOuv"));
  const haut = () => { barre.classList.toggle("vue", scrollY > 120 && !boutonsVus); tete.classList.toggle("pleine", scrollY > 10); };

  /* ---------- le bicorne tombe sur sa tête, le titre repart de chaque côté ---------- */
  const chapeau = $("chapeau"), bicorne = $("bicorne"), scene = chapeau && chapeau.querySelector(".scene"), chapeaux = chapeau ? [...chapeau.querySelectorAll(".bicorne")] : [], couronne = !!document.querySelector(".portrait.sacre"), cue = chapeau && chapeau.querySelector(".cue"), lignes = chapeau ? [...chapeau.querySelectorAll(".ln")] : [], sens = [-1, 1, -1];
  const borne = x => Math.min(1, Math.max(0, x));
  let tic = false;
  function anime() {
    tic = false; haut();
    if (calme || !chapeau) return;
    const p = borne((scrollY - chapeau.offsetTop) / (chapeau.offsetHeight - innerHeight));
    /* la chute : de tout en haut jusqu'à la tête, en se balançant un peu, puis un petit rebond en se posant */
    const q = borne(p / .82), r = 1 - q, b = borne((p - .82) / .16), rebond = Math.sin(b * Math.PI);
    /* le bicorne se tasse un peu en se posant ; la couronne (boutique), elle, s'enfile : jamais plus bas que sa place, et droite à l'arrivée,
       sinon le bandeau passerait sous la ligne du front et semblerait entrer dans le crâne */
    const y = -innerHeight * 1.05 * Math.pow(r, 1.5) + (couronne ? -6 : 5) * rebond, x = 34 * Math.sin(q * Math.PI * 2.2) * r;
    const rot = couronne ? -26 * r * r + 9 * Math.sin(q * Math.PI * 1.6) * r * r : -26 * r + 9 * Math.sin(q * Math.PI * 1.6) * r;
    const tasse = couronne ? 0 : rebond;
    /* une fois le chapeau posé, le site remonte par-dessus Napoléon, resté en fond : il s'efface doucement dans la roche pour les textes */
    const v = borne((scrollY - chapeau.offsetTop - chapeau.offsetHeight + innerHeight) / (innerHeight * .5));
    scene.style.setProperty("--voile", (v * .5).toFixed(3));
    if (cue) cue.style.opacity = (1 - borne(p / .15)).toFixed(3);
    $("ombreChapeau").style.opacity = (Math.pow(q, 6) * (1 - v * .5)).toFixed(3);
    const pose = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(1 + .02 * tasse).toFixed(3)},${(1 - .06 * tasse).toFixed(3)})`;
    chapeaux.forEach(c => c.style.transform = pose);
    const e = Math.pow(borne((p - .04) / .7), 2);
    lignes.forEach((l, i) => { l.style.transform = `translate3d(${(sens[i] * e * 110).toFixed(2)}vw,0,0)`; l.style.opacity = (1 - e * .85).toFixed(3); });
  }
  addEventListener("scroll", () => { if (!tic) { tic = true; requestAnimationFrame(anime); } }, { passive: true });
  addEventListener("resize", anime);
  anime();
  const menu = $("menuTel");
  const ouvreMenu = o => { if (o) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("ouverte")); } else { menu.classList.remove("ouverte"); setTimeout(() => menu.hidden = true, 300); } $("menuBtn").setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
  $("menuBtn").onclick = () => ouvreMenu(true);
  $("menuFerme").onclick = () => ouvreMenu(false);
  menu.addEventListener("click", e => { if (e.target.closest("nav a")) ouvreMenu(false); });

  /* la vidéo de la séance : muette au départ, le son au toucher */
  if ($("son")) $("son").onclick = () => { const v = $("video"), on = v.muted; v.muted = !on; if (on) { v.currentTime = 0; v.play().catch(() => {}); } $("son").setAttribute("aria-pressed", on); };

  /* ---------- le film : la vidéo n'est chargée qu'au toucher ---------- */
  if ($("filmLire")) $("filmLire").onclick = () => { const v = document.createElement("video"); v.src = "images/film.mp4"; v.poster = "images/film-affiche.webp"; v.controls = true; v.playsInline = true; v.title = t("vid-titre"); $("filmEcran").replaceChildren(v); v.play().catch(() => {}); };

  /* ---------- les formules en onglets ---------- */
  const onglets = [...document.querySelectorAll('[role="tab"]')];
  const choisit = b => { onglets.forEach(o => { const v = o === b; o.setAttribute("aria-selected", v); o.tabIndex = v ? 0 : -1; $(o.getAttribute("aria-controls")).hidden = !v; }); };
  onglets.forEach((o, i) => { o.onclick = () => choisit(o); o.onkeydown = e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (k) { const n = onglets[(i + k + onglets.length) % onglets.length]; choisit(n); n.focus(); } }; });

  /* ---------- la boutique : filtrer les souvenirs par catégorie ---------- */
  const filtres = [...document.querySelectorAll("[data-filtre]")], produits = [...document.querySelectorAll(".produit")];
  function filtre(cat) {
    filtres.forEach(f => f.setAttribute("aria-pressed", f.dataset.filtre === cat));
    produits.forEach(p => { p.hidden = cat !== "tout" && p.dataset.cat !== cat; if (!p.hidden) p.classList.add("on"); });
  }
  filtres.forEach(f => f.onclick = () => filtre(f.dataset.filtre));
  document.querySelectorAll("[data-filtre-va]").forEach(b => b.onclick = () => { filtre(b.dataset.filtreVa); $("souvenirs").scrollIntoView({ behavior: calme ? "auto" : "smooth" }); });

  /* ---------- la réservation ---------- */
  const etat = { ouvert: false, formule: "complete", jour: null, heure: null, adultes: 2, enfants: 0, petits: 0, paiement: "enligne", mois: null, fait: null, nom: "", tel: "", email: "", note: "", langueFilm: null };
  /* la réservation se fait sur sa propre page (reserver.html) ; ailleurs, les boutons « Réserver » et les heures y mènent, avec la langue */
  const panneau = $("panneau"), enPage = !!panneau;
  function versReserver(o = {}) { const q = new URLSearchParams(o); q.set("lang", L); return "reserver.html?" + q; }
  function ouvrir(o = {}) {
    Object.assign(etat, { fait: null }, o);
    if (!etat.jour) { const a = auj(); etat.jour = toutes.some(h => !passee(iso(a), h)) ? iso(a) : iso(plus(a, 1)); }
    if (etat.heure != null && !HEURES[etat.formule].includes(etat.heure)) etat.formule = HEURES.complete.includes(etat.heure) ? "complete" : "decouverte";
    etat.mois = etat.jour.slice(0, 7); etat.langueFilm = etat.langueFilm || L;
    ouvreMenu(false);
    panneau.hidden = false; etat.ouvert = true; dessinePanneau();
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-reserver]"); if (!b) return;
    e.preventDefault();
    if (!enPage) { location.href = versReserver(b.dataset.reserver ? { formule: b.dataset.reserver } : {}); return; }
    /* déjà sur la page : on remonte au formulaire, avec la formule demandée */
    if (b.dataset.reserver) { etat.formule = b.dataset.reserver; etat.heure = null; redessine(); }
    ouvreMenu(false); panneau.scrollIntoView({ behavior: calme ? "auto" : "smooth", block: "start" });
  });
  if (enPage) $("rFerme").onclick = () => { location.href = "./"; };
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) ouvreMenu(false); });

  const total = () => etat.formule === "complete" ? etat.adultes * PRIX.complete.adulte + etat.enfants * PRIX.complete.enfant : (etat.adultes + etat.enfants) * PRIX.decouverte.adulte;
  const nbPers = () => etat.adultes + etat.enfants + etat.petits;
  function dessinePanneau() {
    const c = $("rCorps");
    if (etat.fait) {
      const r = etat.fait;
      c.innerHTML = `<p class="ok-titre">${t("r-ok")}</p><p style="color:var(--gris);margin:0">${t("r-ok-texte")}</p>
        <div class="billet"><div class="tete-billet"><img src="images/logo-blanc.png" alt="La Grotte Napoléon" width="898" height="383"><span>${t("r-billet")}</span></div>
        <dl><dt>${t("r-formule")}</dt><dd>${t(r.formule === "complete" ? "f-complete" : "f-decouverte")}</dd><dt>${t("r-jour")}</dt><dd>${jourLong(new Date(r.jour + "T00:00"))}</dd><dt>${t("r-heure")}</dt><dd>${heure(r.heure)}</dd><dt>${t("r-personnes")}</dt><dd>${r.n}</dd><dt>${t("r-langue")}</dt><dd>${T[r.langue]["nom-langue"]}</dd><dt>${t("r-total")}</dt><dd>${euros(r.total)} · ${t(r.paiement === "enligne" ? "r-billet-place" : "r-billet-sur")}</dd><dt>${t("r-nom")}</dt><dd>${esc(r.nom)}</dd></dl></div>
        <p class="note-maquette">${t("r-ok-maquette")}</p>`;
      $("rPied").innerHTML = `<button type="button" class="btn creux" style="flex:1" id="rFin">${t("r-fermer")}</button>`;
      $("rFin").onclick = () => { location.href = "./"; }; return;
    }
    const [an, mo] = etat.mois.split("-").map(Number), prem = new Date(an, mo - 1, 1), nbJ = new Date(an, mo, 0).getDate(), decal = (prem.getDay() + 6) % 7, a = auj();
    const moisMin = iso(a).slice(0, 7), hs = HEURES[etat.formule];
    const reste = etat.heure != null ? libres(etat.jour, etat.heure) : null;
    c.innerHTML = `
      <p class="champ-titre">${t("r-formule")}</p>
      <div class="choix2" id="rFormule">${["complete", "decouverte"].map(f => `<button type="button" data-f="${f}" aria-pressed="${f === etat.formule}"><b>${t(f === "complete" ? "fo-o1" : "fo-o2")}</b><span>${f === "complete" ? `${euros(48)} · ${euros(30)}` : euros(15)}</span></button>`).join("")}</div>
      <p class="champ-titre">${t("r-jour")}</p>
      <div class="mois-nav"><button type="button" id="rMoisAv" aria-label="${t("r-mois-prec")}" ${etat.mois <= moisMin ? "disabled" : ""}><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1L1 8l7 7"/></svg></button><p>${moisAn(prem)}</p><button type="button" id="rMoisAp" aria-label="${t("r-mois-suiv")}"><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 1l7 7-7 7"/></svg></button></div>
      <div class="jours-noms" aria-hidden="true">${[0, 1, 2, 3, 4, 5, 6].map(i => `<span>${jourCourt(i)}</span>`).join("")}</div>
      <div class="jours-grille" id="rJours">${"<span></span>".repeat(decal)}${[...Array(nbJ)].map((_, i) => { const d = new Date(an, mo - 1, i + 1), j = iso(d), fini = hs.every(h => passee(j, h)); return `<button type="button" data-j="${j}" aria-pressed="${j === etat.jour}" class="${j === iso(a) ? "auj" : ""}" ${fini ? "disabled" : ""} aria-label="${jourLong(d)}">${i + 1}</button>`; }).join("")}</div>
      <p class="champ-titre">${t("r-heure")} · <span style="color:var(--gris);letter-spacing:.04em;text-transform:none">${jourLong(new Date(etat.jour + "T00:00"))}</span></p>
      <div class="heures-choix" id="rHeures">${hs.map(h => { const n = libres(etat.jour, h), p = passee(etat.jour, h); return `<button type="button" data-h="${h}" aria-pressed="${h === etat.heure}" ${n && !p ? "" : "disabled"}><b>${heure(h)}</b><span>${p ? "–" : n ? (n === 1 ? t("sea-place") : t("sea-places", n)) : t("sea-complet")}</span></button>`; }).join("")}</div>
      <p class="champ-titre">${t("r-personnes")}</p>
      ${compteur("adultes", etat.formule === "complete" ? t("r-adultes") : t("r-personnes"), euros(etat.formule === "complete" ? 48 : 15))}
      ${etat.formule === "complete" ? compteur("enfants", t("r-enfants"), euros(30)) : ""}
      ${compteur("petits", t("r-petits"), t("r-gratuit"))}
      ${reste != null ? `<p class="reste ${nbPers() > reste ? "alerte" : ""}">${nbPers() > reste ? t("r-trop", reste) : t("r-reste", reste)}</p>` : ""}
      <label class="champ"><span class="champ-titre" style="display:block;margin:26px 0 10px">${t("r-langue")}</span><select id="rLangue">${LANGUES.map(x => `<option value="${x}" ${x === etat.langueFilm ? "selected" : ""}>${T[x]["nom-langue"]}</option>`).join("")}</select></label>
      <p class="champ-titre">${t("r-paiement")}</p>
      <div class="paiement" id="rPaiement">${["enligne", "surplace"].map(p => `<button type="button" data-p="${p}" aria-pressed="${p === etat.paiement}"><i></i><span>${t("r-" + p)}</span></button>`).join("")}</div>
      ${etat.paiement === "enligne" ? `<p class="paiement-note">${t("r-stripe")}</p>` : ""}
      <p class="champ-titre">${t("r-vous")}</p>
      <label class="champ"><span>${t("r-nom")}</span><input id="rNom" autocomplete="name" value="${esc(etat.nom)}"></label>
      <label class="champ"><span>${t("r-tel")}</span><input id="rTel" type="tel" inputmode="tel" autocomplete="tel" value="${esc(etat.tel)}"></label>
      <label class="champ"><span>${t("r-email")}</span><input id="rEmail" type="email" inputmode="email" autocomplete="email" value="${esc(etat.email)}"></label>
      <label class="champ"><span>${t("r-note")}</span><textarea id="rNote">${esc(etat.note)}</textarea></label>
      <p class="paiement-note">${t("r-cgv")} <a href="cgv.html" target="_blank" style="color:var(--or-clair)">${t("r-cgv-lien")}</a>.</p>
      <p class="erreur" id="rErreur" role="alert"></p>`;
    $("rPied").innerHTML = `<div class="total"><small>${t("r-total")}</small><b id="rTotal">${euros(total())}</b></div><button type="button" class="btn" id="rValider">${t(etat.paiement === "enligne" ? "r-payer" : "r-valider")}</button>`;
    $("rValider").onclick = valider;
    ["rNom", "rTel", "rEmail", "rNote"].forEach(id => $(id).addEventListener("input", e => { etat[{ rNom: "nom", rTel: "tel", rEmail: "email", rNote: "note" }[id]] = e.target.value; }));
    $("rLangue").onchange = e => etat.langueFilm = e.target.value;
  }
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const compteur = (k, nom, prix) => `<div class="compteur"><span>${nom}<small>${prix}</small></span><div class="pas"><button type="button" data-moins="${k}" aria-label="−" ${etat[k] ? "" : "disabled"}>−</button><output aria-live="polite">${etat[k]}</output><button type="button" data-plus="${k}" aria-label="+" ${nbPers() >= PLACES ? "disabled" : ""}>+</button></div></div>`;
  /* garder la place dans le panneau quand on le redessine */
  const redessine = () => { if (!etat.ouvert) return; const c = $("rCorps"), y = c.scrollTop, w = scrollY; dessinePanneau(); c.scrollTop = y; if (enPage) scrollTo(0, w); };
  if (enPage) $("rCorps").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.f) { etat.formule = b.dataset.f; if (etat.heure != null && !HEURES[etat.formule].includes(etat.heure)) etat.heure = null; if (etat.formule === "decouverte") { etat.adultes += etat.enfants; etat.enfants = 0; } }
    else if (b.dataset.j) { etat.jour = b.dataset.j; if (etat.heure != null && (passee(etat.jour, etat.heure) || !libres(etat.jour, etat.heure))) etat.heure = null; }
    else if (b.dataset.h) etat.heure = +b.dataset.h;
    else if (b.dataset.moins) etat[b.dataset.moins] = Math.max(0, etat[b.dataset.moins] - 1);
    else if (b.dataset.plus) etat[b.dataset.plus]++;
    else if (b.dataset.p) etat.paiement = b.dataset.p;
    else if (b.id === "rMoisAv" || b.id === "rMoisAp") { const [y, m] = etat.mois.split("-").map(Number), d = new Date(y, m - 1 + (b.id === "rMoisAp" ? 1 : -1), 1); etat.mois = iso(d).slice(0, 7); }
    else return;
    redessine();
  });
  function valider() {
    const err = $("rErreur"), dire = k => { err.textContent = t(k); err.scrollIntoView({ block: "center", behavior: calme ? "auto" : "smooth" }); };
    if (etat.heure == null) return dire("r-err-heure");
    if (!nbPers()) return dire("r-err-pers");
    const reste = libres(etat.jour, etat.heure); if (nbPers() > reste) { err.textContent = t("r-trop", reste); return; }
    if (!etat.nom.trim()) { dire("r-err-nom"); $("rNom").focus(); return; }
    if (!etat.tel.trim() && !etat.email.trim()) { dire("r-err-contact"); $("rTel").focus(); return; }
    const r = { jour: etat.jour, heure: etat.heure, n: nbPers(), formule: etat.formule, total: total(), paiement: etat.paiement, langue: etat.langueFilm, nom: etat.nom.trim() };
    resas.push(r); try { localStorage.setItem("grotte-resas", JSON.stringify(resas)); } catch (e) {}
    etat.fait = r; $("rCorps").scrollTop = 0; dessinePanneau(); dessineSeances();
    if (enPage) panneau.scrollIntoView({ behavior: calme ? "auto" : "smooth", block: "start" });
  }

  langue(L, false);
  /* la page « Réserver » : le panneau est ouvert d'office, une adresse peut choisir la formule, le jour et l'heure
     (reserver.html?formule=complete&jour=2026-11-02&heure=1200) */
  if (enPage) {
    const q = new URLSearchParams(location.search), o = {};
    if (["complete", "decouverte"].includes(q.get("formule"))) o.formule = q.get("formule");
    if (/^\d{4}-\d\d-\d\d$/.test(q.get("jour") || "") && q.get("jour") >= iso(auj())) o.jour = q.get("jour");
    if (toutes.includes(+q.get("heure"))) o.heure = +q.get("heure");
    ouvrir(o);
  }
})();

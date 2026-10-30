/* La Grotte Napoléon : le script commun (langues, séances, chapeau, réservation). */
(() => {
  const $ = id => document.getElementById(id);
  const T = window.TEXTES, LANGUES = ["fr", "en", "it", "de", "es", "co"];
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* on arrive toujours tout en haut de la page, même en revenant en arrière ou en rechargeant (sauf un lien vers une section, #…) */
  history.scrollRestoration = "manual";
  /* sans glisser (le défilement doux du site ne doit pas jouer ici) ; et quand le site est affiché dans un cadre (l'aperçu dans Claude),
     scrollIntoView remonte aussi la page qui l'entoure, sinon on arriverait à la hauteur où l'on était sur la page d'avant */
  const enHaut = () => { scrollTo({ top: 0, left: 0, behavior: "instant" }); if (window.top !== window) document.documentElement.scrollIntoView({ block: "start", behavior: "instant" }); };
  let bouge = false;
  ["wheel", "touchstart", "keydown"].forEach(t => addEventListener(t, () => bouge = true, { once: true, passive: true }));
  if (!location.hash) { enHaut(); requestAnimationFrame(enHaut); addEventListener("load", () => { if (!bouge) enHaut(); }); }
  addEventListener("pageshow", e => { if (e.persisted && !location.hash) enHaut(); });

  /* ---------- la langue : l'adresse (?lang=), le dernier choix, puis celle du téléphone ---------- */
  let L = new URLSearchParams(location.search).get("lang");
  if (LANGUES.includes(L)) { try { localStorage.setItem("grotte-langue", L); } catch (e) {} }  /* ?lang= vaut pour les pages suivantes */
  else { try { L = localStorage.getItem("grotte-langue"); } catch (e) {} }
  if (!LANGUES.includes(L)) L = (navigator.languages || [navigator.language || "fr"]).map(x => x.slice(0, 2).toLowerCase()).find(x => LANGUES.includes(x)) || "fr";
  const t = (k, n) => { const s = (T[L] && T[L][k]) ?? T.fr[k] ?? ""; return n == null ? s : s.replace("{n}", n); };
  const locale = () => L === "co" ? "fr" : L;

  /* les dates : le corse a ses propres noms de jours et de mois */
  const D = window.DATES_CORSE;
  const jourLong = d => L === "co" ? `${D.jours[d.getDay()]} ${d.getDate()} ${D.mois[d.getMonth()]}` : d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
  const moisAn = d => L === "co" ? `${D.mois[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString(locale(), { month: "long", year: "numeric" });
  const jourCourt = i => { const d = new Date(2024, 0, 1 + i); return L === "co" ? D.jours[d.getDay()].slice(0, 2) : d.toLocaleDateString(locale(), { weekday: "short" }).replace(".", "").slice(0, 3); };
  const heure = m => { const h = Math.floor(m / 60), mn = m % 60; return L === "fr" ? `${h}&nbsp;h${mn ? `&nbsp;${String(mn).padStart(2, "0")}` : ""}` : `${h}:${String(mn).padStart(2, "0")}`; };
  const euros = n => `${n.toLocaleString("fr-FR").replace(/\s/g, "&nbsp;")}&nbsp;€`;  /* 1&nbsp;000&nbsp;€ */
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

  /* ---------- les drapeaux des langues (dessinés ici : les drapeaux emoji ne s'affichent pas partout) ---------- */
  const DRAPEAUX = {
    fr: '<rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/>',
    en: '<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.5"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.4"/>',
    it: '<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE2B37"/>',
    de: '<rect width="30" height="7" fill="#000"/><rect y="6.67" width="30" height="7" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/>',
    es: '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>',
    co: '<rect width="30" height="20" fill="#fff"/><path d="M10.5 18.5c0-3.2 1.2-4.9 2.6-5.7-1.7-1.1-2.6-2.9-2.3-4.9.4-2.7 2.7-4.5 5.3-4.3 2.8.3 4.8 2.8 4.4 5.6-.2 1.3-.8 2.4-1.7 3.2 1.8.9 2.9 3 2.9 6.1z" fill="#111"/><path d="M10.6 8.6l10.6-2.2" stroke="#fff" stroke-width="1.4"/>'
  };
  const drapeau = l => `<svg class="drapeau" viewBox="0 0 30 20" aria-hidden="true">${DRAPEAUX[l]}</svg>`;

  /* ---------- appliquer la langue ---------- */
  function langue(l, garder) {
    L = l; if (garder) { try { localStorage.setItem("grotte-langue", l); } catch (e) {} }
    document.documentElement.lang = l === "co" ? "co" : l;
    document.title = t(document.body.dataset.titre || "meta-titre"); document.querySelector('meta[name="description"]').content = t("meta-desc");
    document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll("[data-t-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.tAria)));
    document.querySelectorAll("[data-t-alt]").forEach(el => el.alt = t(el.dataset.tAlt));
    document.querySelectorAll("[data-heures]").forEach(el => el.innerHTML = HEURES[el.dataset.heures].map(heure).join(" · "));
    document.querySelectorAll("[data-langue]").forEach(el => el.innerHTML = `<button type="button" aria-expanded="false" aria-haspopup="true" aria-label="${t("nav-langue")} : ${t("nom-langue")}">${drapeau(l)}<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1l4 4 4-4"/></svg></button><div class="langues">${LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === l}"><span>${T[x]["nom-langue"]}</span>${drapeau(x)}</button>`).join("")}</div>`);
    $("langueMenu").innerHTML = LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === l}" aria-label="${T[x]["nom-langue"]}">${drapeau(x)}</button>`).join("");
    dessineFlotte();
    dessineSeances(); if (etat.ouvert) dessinePanneau(); dessineFiche(); dessinePanier();
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

  /* ---------- sur téléphone : une petite flèche en bas à droite qui s'ouvre sur l'essentiel (réserver, appeler, plan, panier, langue),
     à la place de la barre du bas et du coin gauche de l'en-tête ---------- */
  const flotte = document.createElement("div");
  flotte.className = "flotte"; flotte.id = "flotte";
  document.body.append(flotte);
  let flotteOuverte = false, langueOuverte = false;  /* sur ordinateur, un petit drapeau accroché à la flèche ouvre les langues */
  function dessineFlotte() {
    const liens = [["./#seance", "nav-seance"], ["formules.html", "nav-formules"], ["./#histoire", "nav-histoire"], ["boutique.html", "nav-boutique"], ["./#venir", "nav-acces"]];
    flotte.innerHTML = `<div class="flotte-panneau" id="flottePanneau" ${flotteOuverte ? "" : "hidden"}>
        <nav class="flotte-nav" aria-label="Menu">${liens.map(([h, k]) => `<a href="${h}">${t(k)}</a>`).join("")}</nav>
        <a class="btn lg" href="reserver.html" data-reserver>${t("ouv-reserver")}</a>
        <div class="flotte-deux"><a class="btn creux" href="tel:+33495280461">${t("barre-appeler")}</a><a class="btn creux" href="./#venir">${t("barre-plan")}</a></div>
        <a class="flotte-panier" href="panier.html"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3.5 6.5h11l-.9 9.5H4.4z"/><path d="M6.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5"/></svg><span>${t("nav-panier")}</span><span class="nb-panier" hidden></span></a>
        <div class="flotte-langues" role="group" aria-label="${t("nav-langue")}">${LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === L}" aria-label="${T[x]["nom-langue"]}">${drapeau(x)}</button>`).join("")}</div>
      </div>
      <div class="flotte-langue-liste" id="flotteLangues" ${langueOuverte ? "" : "hidden"} role="group" aria-label="${t("nav-langue")}">${LANGUES.map(x => `<button type="button" data-l="${x}" aria-current="${x === L}">${drapeau(x)}<span>${T[x]["nom-langue"]}</span></button>`).join("")}</div>
      <button type="button" class="flotte-drapeau" aria-expanded="${langueOuverte}" aria-controls="flotteLangues" aria-label="${t("nav-langue")} : ${t("nom-langue")}">${drapeau(L)}</button>
      <button type="button" class="flotte-btn" aria-expanded="${flotteOuverte}" aria-controls="flottePanneau" aria-label="${t("nav-menu")}"><span class="flotte-mot">${t("nav-menu")}</span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 11.5l5-5 5 5"/></svg></button>`;
    if (typeof compteurPanier === "function") compteurPanier();
  }
  const ouvreFlotte = o => { flotteOuverte = o; const p = $("flottePanneau"); flotte.querySelector(".flotte-btn").setAttribute("aria-expanded", o); flotte.classList.toggle("ouverte", o); if (o) { p.hidden = false; } else setTimeout(() => { if (!flotteOuverte) p.hidden = true; }, 250); };
  const ouvreLangues = o => { langueOuverte = o; $("flotteLangues").hidden = !o; flotte.querySelector(".flotte-drapeau").setAttribute("aria-expanded", o); };
  flotte.addEventListener("click", e => {
    if (e.target.closest(".flotte-btn")) { ouvreLangues(false); ouvreFlotte(!flotteOuverte); }
    else if (e.target.closest(".flotte-drapeau")) { if (flotteOuverte) ouvreFlotte(false); ouvreLangues(!langueOuverte); }
    else if (e.target.closest(".flotte-langue-liste [data-l]")) langueOuverte = false;
  });
  document.addEventListener("click", e => { if (!e.composedPath().includes(flotte)) { if (flotteOuverte) ouvreFlotte(false); if (langueOuverte) ouvreLangues(false); } });  /* composedPath : le panneau est redessiné quand on change de langue */
  addEventListener("keydown", e => { if (e.key === "Escape") { if (flotteOuverte) ouvreFlotte(false); if (langueOuverte) ouvreLangues(false); } });

  /* « Entrer dans la Grotte » : on descend vers la suite du site sans laisser de #… dans l'adresse (le rechargement repart de l'enfant) */
  document.querySelectorAll("[data-entrer]").forEach(b => b.onclick = e => { e.preventDefault(); $("seance").scrollIntoView({ block: "start" }); });

  /* ---------- en-tête, menu du téléphone, barre du bas ---------- */
  const tete = $("tete"), barre = $("barre");
  /* la barre du bas : dès qu'on descend, sauf quand les boutons de l'ouverture sont à l'écran */
  let boutonsVus = false;
  if ($("boutonsOuv")) new IntersectionObserver(([e]) => { boutonsVus = e.isIntersecting; haut(); }).observe($("boutonsOuv"));
  const haut = () => { barre.classList.toggle("vue", scrollY > 120 && !boutonsVus); tete.classList.toggle("pleine", scrollY > 10); };

  /* ---------- le bicorne tombe sur sa tête, le titre repart de chaque côté ---------- */
  const chapeau = $("chapeau"), bicorne = $("bicorne"), enfant = $("enfant"), portrait = chapeau && chapeau.querySelector(".portrait"), scene = chapeau && chapeau.querySelector(".scene"), chapeaux = chapeau ? [...chapeau.querySelectorAll(".bicorne")] : [], couronne = !!document.querySelector(".portrait.sacre"), lueur = chapeau && chapeau.querySelector(".eclat"), lignes = chapeau ? [...chapeau.querySelectorAll("#t-titre .ln")] : [], lignes2 = chapeau ? [...chapeau.querySelectorAll("#titreEmpereur .ln")] : [], titreEmpereur = $("titreEmpereur"), sensTel = [-1, 1, -1], ordi = matchMedia("(min-width: 981px)");
  const borne = x => Math.min(1, Math.max(0, x));
  /* la transformation (le chapeau tombe, l'enfant devient l'Empereur, les titres changent) se joue d'elle-même, à sa vitesse : à l'accueil
     quand on touche « Découvrir » (ou qu'on essaie de descendre), à la boutique dès qu'on commence à défiler. Elle ne se joue qu'une fois :
     en remontant on garde l'Empereur, l'enfant ne revient qu'en rechargeant la page. Le défilement ne règle que l'arrivée du site et
     l'effacement de Napoléon en fond. */
  const DUREE = couronne ? 1600 : 2500, intro = $("decouvrir"), accroche = $("accroche"), concept = $("concept"), bloc = chapeau && chapeau.querySelector(".ouverture-texte"), racine = document.documentElement;
  let a = 0, cible = 0, joue = false, avant = 0, tic = false, vu = false;
  const lance = () => { if (vu) return; vu = true; cible = 1; if (!joue) { joue = true; requestAnimationFrame(boucle); } };
  /* arrivé par un lien (#seance…) ou déjà plus bas : on saute l'ouverture */
  const saute = () => { vu = true; a = cible = 1; racine.classList.remove("verrou"); dessine(); };
  function dessine() {
    const p = a;
    /* la chute : de tout en haut jusqu'à la tête, en se balançant un peu, puis un petit rebond en se posant */
    const q = borne(p / .82), r = 1 - q, b = borne((p - .82) / .16), rebond = Math.sin(b * Math.PI);
    /* le bicorne se tasse un peu en se posant ; la couronne (boutique), elle, s'enfile : jamais plus bas que sa place, et droite à l'arrivée,
       sinon le bandeau passerait sous la ligne du front et semblerait entrer dans le crâne */
    const y = -innerHeight * 1.05 * Math.pow(r, 1.5) + (couronne ? -6 : 5) * rebond, x = 34 * Math.sin(q * Math.PI * 2.2) * r;
    const rot = couronne ? -26 * r * r + 9 * Math.sin(q * Math.PI * 1.6) * r * r : -26 * r + 9 * Math.sin(q * Math.PI * 1.6) * r;
    const tasse = couronne ? 0 : rebond;
    /* l'enfant devient l'Empereur sous le bicorne : une ligne au bord doux descend de la tête (quand le chapeau la touche) jusqu'au bas du portrait ;
       au-dessus l'adulte, en dessous l'enfant, jamais les deux visages l'un sur l'autre */
    /* l'enfant devient l'Empereur d'un coup, sous un éclat de lumière dorée, au moment où le bicorne se pose (plus de rideau qui descend :
       sa ligne floue faisait une vague) ; l'éclat monte, l'échange se fait au plus fort, puis il retombe */
    if (enfant) {
      const passe = p >= .84, eclat = Math.max(0, 1 - Math.abs(p - .84) / .09);
      portrait.style.setProperty("--l", passe ? "1.2" : "-.15"); portrait.style.setProperty("--le", passe ? "1" : "-.1");
      enfant.style.visibility = passe ? "hidden" : "";
      if (lueur) lueur.style.opacity = Math.pow(eclat, 1.4).toFixed(3);
    }
    if (accroche) { const f = borne(p / .14); accroche.style.opacity = (1 - f).toFixed(3); accroche.style.transform = `translate3d(0,${(f * -10).toFixed(1)}px,0)`; accroche.style.visibility = f >= 1 ? "hidden" : ""; }
    /* puis, l'Empereur en place, ce qu'on vit à la Grotte et les boutons pour réserver */
    if (concept) concept.classList.toggle("vu", p > .82);
    $("ombreChapeau").style.opacity = (Math.pow(q, 6) * (1 - voile() * .5)).toFixed(3);
    const pose = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(1 + .02 * tasse).toFixed(3)},${(1 - .06 * tasse).toFixed(3)})`;
    chapeaux.forEach(c => c.style.transform = pose);
    const sens = ordi.matches ? [-1, -1, -1] : sensTel;  /* sur ordinateur le titre est dans le coin gauche : tout part et revient par la gauche */
    const e = Math.pow(borne((p - .04) / .7), 2);
    if (titreEmpereur) lignes.forEach((l, i) => { l.style.transform = `translate3d(${(sens[i] * e * 110).toFixed(2)}vw,0,0)`; l.style.opacity = (1 - e * .85).toFixed(3); });
    /* quand l'Empereur apparaît, « Napoléon, empereur des Français » revient des côtés et reste en entier */
    const e2 = 1 - Math.pow(1 - borne((p - .74) / .2), 3);
    lignes2.forEach((l, i) => { l.style.transform = `translate3d(${((ordi.matches ? 1 : -sens[i]) * (1 - e2) * 110).toFixed(2)}vw,0,0)`;  /* sur ordinateur il arrive par la droite, où il se pose */ l.style.opacity = e2.toFixed(3); });
  }
  function boucle(t) {
    const dt = avant ? t - avant : 16; avant = t;
    a = cible > a ? Math.min(cible, a + dt / DUREE) : Math.max(cible, a - dt / DUREE * 1.6);
    dessine();
    if (a !== cible) requestAnimationFrame(boucle); else { joue = false; avant = 0; setTimeout(() => racine.classList.remove("verrou"), couronne ? 200 : 0); }  /* la boutique : on attend que la phrase soit là */
  }
  /* une fois l'animation jouée, le site remonte par-dessus Napoléon, resté en fond : il s'efface doucement dans la roche pour les textes */
  const fin = () => chapeau.offsetTop + chapeau.offsetHeight - innerHeight;
  const voile = () => borne((scrollY - fin()) / (innerHeight * .5));
  function anime() {
    tic = false; haut();
    if (calme || !chapeau) return;
    scene.style.setProperty("--voile", (voile() * (ordi.matches || couronne ? 1 : .5)).toFixed(3));  /* sur ordinateur, et à la boutique (les produits passent sur lui), il s'efface tout à fait */
    /* le titre de l'Empereur et le bloc du concept remontent ensuite avec la page, comme s'ils en faisaient partie */
    if (bloc) bloc.style.transform = `translate3d(0,${(-Math.max(0, scrollY - fin())).toFixed(1)}px,0)`;
    if (bloc && couronne) bloc.style.opacity = (1 - voile()).toFixed(3);  /* à la boutique, le titre et la phrase s'effacent avec l'Empereur */
    if (!vu && scrollY > 24) intro ? saute() : lance();
    if (a !== cible && !joue) { joue = true; requestAnimationFrame(boucle); }
    if (!joue) dessine();
  }
  addEventListener("scroll", () => { if (!tic) { tic = true; requestAnimationFrame(anime); } }, { passive: true });
  addEventListener("resize", anime);
  if (chapeau && !calme) {
    /* la boutique : la couronne se pose d'elle-même peu après l'arrivée, le titre reste en place ; on ne descend qu'une fois
       la couronne posée et la phrase arrivée (au plus tard après 6 s, au cas où l'animation ne pourrait pas se jouer) */
    if (couronne) {
      if (location.hash || scrollY > 0) saute();
      else { racine.classList.add("verrou"); setTimeout(lance, 150); setTimeout(() => racine.classList.remove("verrou"), 3500); }
    }
    if (intro) {
      /* l'accueil repart toujours d'en haut, sur l'enfant ; on ne peut pas descendre avant la transformation, mais toute tentative la lance */
      if (location.hash || scrollY > 0) saute();
      else {
        racine.classList.add("verrou"); enHaut();
        intro.onclick = lance;
        /* « Entrer dans la Grotte » : on descend vers la suite du site sans laisser de #… dans l'adresse (le rechargement repart de l'enfant) */
        const essai = () => { if (racine.classList.contains("verrou")) lance(); };
        addEventListener("wheel", e => { if (e.deltaY > 0) essai(); }, { passive: true });
        addEventListener("touchmove", essai, { passive: true });
        addEventListener("keydown", e => { if (["ArrowDown", "PageDown", "End", " "].includes(e.key) && e.target === document.body) essai(); });
        addEventListener("hashchange", () => { if (!vu) saute(); });
      }
    }
  }
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
    if ($("compte")) $("compte").textContent = produits.filter(p => !p.hidden).length;
  }
  filtres.forEach(f => f.onclick = () => filtre(f.dataset.filtre));
  document.querySelectorAll("[data-filtre-va]").forEach(b => b.onclick = () => { filtre(b.dataset.filtreVa); $("souvenirs").scrollIntoView({ behavior: calme ? "auto" : "smooth" }); });

  /* ---------- la boutique en ligne : fiche produit, panier, commande ----------
     Le panier reste sur l'appareil (localStorage) : [{ id, c: couleur, t: taille, q: quantité }]. Le paiement (Stripe) sera branché
     plus tard : pour l'instant « Payer » affiche la commande comme confirmée, avec une mention de démonstration, sans rien envoyer. */
  const PRODUITS = window.PRODUITS || [], produit = id => PRODUITS.find(p => p.id === id);
  const lirePanier = () => { try { return JSON.parse(localStorage.getItem("grotte-panier")) || []; } catch (e) { return []; } };
  const ecrirePanier = p => { try { localStorage.setItem("grotte-panier", JSON.stringify(p)); } catch (e) {} compteurPanier(); };
  function compteurPanier() {
    const n = lirePanier().reduce((s, l) => s + l.q, 0);
    document.querySelectorAll(".nb-panier").forEach(b => { b.hidden = !n; b.textContent = n; });
  }
  compteurPanier();
  addEventListener("storage", e => { if (e.key === "grotte-panier") { compteurPanier(); dessinePanier(); } });

  /* la fiche : grande photo et vignettes, couleur, taille, quantité, « Ajouter au panier » */
  const choix = { id: new URLSearchParams(location.search).get("id"), vue: 0, c: "", t: "", q: 1, erreur: false };
  function dessineFiche() {
    const f = $("fiche"); if (!f) return;
    const p = produit(choix.id) || PRODUITS[0]; if (!p) return;
    choix.id = p.id;
    if (!choix.c && p.coloris.length) choix.c = p.coloris[0].nom;
    document.title = p.nom + " · La Grotte Napoléon";
    const vues = [{ src: p.photo, fond: !p.plein }, ...p.photos.slice(p.plein ? 1 : 0).map(src => ({ src, fond: false }))];
    const v = vues[choix.vue] || vues[0];
    const commandable = p.prix != null && !p.epuise;
    f.innerHTML = `
      <div class="galerie">
        <div class="vue-p${v.fond ? " fond" : ""}"><img src="${v.src}" alt="${esc(p.nom)}"></div>
        ${vues.length > 1 ? `<div class="vignettes" role="group" aria-label="Photos">${vues.map((x, i) => `<button type="button" data-vue="${i}" aria-pressed="${i === choix.vue}" class="${x.fond ? "fond" : ""}"><img src="${x.src}" alt=""></button>`).join("")}</div>` : ""}
      </div>
      <div class="infos">
        <p class="eyebrow">${t("btq-f-" + p.cat)}</p>
        <h1>${esc(p.nom)}</h1>
        <p class="prix-fiche">${p.prix != null ? euros(p.prix) : `<span class="sans">${t("p-prix-boutique")}</span>`}</p>
        <p class="desc">${esc(p.desc)}</p>
        ${p.coloris.length ? `<div class="option"><p class="libelle">${t("p-coloris")} <b>${esc(choix.c)}</b></p><div class="pastilles" role="radiogroup" aria-label="${t("p-coloris")}">${p.coloris.map(c => `<button type="button" role="radio" data-c="${esc(c.nom)}" aria-checked="${c.nom === choix.c}" aria-label="${esc(c.nom)}" style="--c:${c.hex}"></button>`).join("")}</div></div>` : ""}
        ${p.tailles.length ? `<div class="option"><p class="libelle">${t("p-taille")}${choix.erreur ? ` <em class="erreur">${t("p-choisir-taille")}</em>` : ""}</p><div class="tailles-choix" role="radiogroup" aria-label="${t("p-taille")}">${p.tailles.map(x => `<button type="button" role="radio" data-t-choix="${x}" aria-checked="${x === choix.t}">${x}</button>`).join("")}</div></div>` : ""}
        ${commandable ? `<div class="option"><p class="libelle">${t("p-quantite")}</p><div class="pas quantite"><button type="button" data-q="-1" aria-label="−" ${choix.q <= 1 ? "disabled" : ""}>−</button><output>${choix.q}</output><button type="button" data-q="1" aria-label="+" ${choix.q >= 20 ? "disabled" : ""}>+</button></div></div>
          <button type="button" class="btn lg ajouter" id="ajouter">${t("p-ajouter")} · ${euros(p.prix * choix.q)}</button>`
        : p.epuise ? `<button type="button" class="btn lg ajouter" disabled>${t("p-epuise")}</button>`
        : `<p class="note">${t("p-prix-boutique-t")}</p><a class="btn lg ajouter" href="mailto:grotte@lagrottenapoleon.fr?subject=${encodeURIComponent("Boutique : " + p.nom)}">${t("btq-demander")}</a>`}
        <ul class="assurances"><li>${t("p-retrait")}</li><li>${t("p-paiement")}</li></ul>
      </div>`;
    const aussi = $("aussi");
    if (aussi) {
      const memes = PRODUITS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
      $("aussiSec").hidden = !memes.length;
      aussi.innerHTML = memes.map(x => `<article class="produit on"><a class="carte-p" href="produit.html?id=${x.id}"><span class="img${x.plein ? " plein" : ""}"><img src="${x.photo}" alt="" loading="lazy"></span><span class="nom-prix"><span class="nom">${esc(x.nom)}</span>${x.prix != null ? `<span class="prix-p">${euros(x.prix)}</span>` : `<span class="prix-p sans">${t("p-prix-boutique")}</span>`}</span></a></article>`).join("");
    }
  }
  if ($("fiche")) {
    $("fiche").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      const p = produit(choix.id);
      if (b.dataset.vue) choix.vue = +b.dataset.vue;
      else if (b.dataset.c) choix.c = b.dataset.c;
      else if (b.dataset.tChoix) { choix.t = b.dataset.tChoix; choix.erreur = false; }
      else if (b.dataset.q) choix.q = Math.min(20, Math.max(1, choix.q + +b.dataset.q));
      else if (b.id === "ajouter") {
        if (p.tailles.length && !choix.t) { choix.erreur = true; dessineFiche(); return; }
        const panier = lirePanier(), c = choix.c, ta = choix.t, l = panier.find(x => x.id === p.id && x.c === c && x.t === ta);
        if (l) l.q = Math.min(20, l.q + choix.q); else panier.push({ id: p.id, c, t: ta, q: choix.q });
        ecrirePanier(panier);
        $("ajouteImg").innerHTML = `<img src="${p.photo}" alt="">`; $("ajouteNom").textContent = [p.nom, c, ta].filter(Boolean).join(" · ") + " × " + choix.q;
        $("ajoute").hidden = false; requestAnimationFrame(() => $("ajoute").classList.add("vu"));
        choix.q = 1;
      }
      dessineFiche();
    });
    $("ajouteFerme").onclick = () => { $("ajoute").classList.remove("vu"); setTimeout(() => $("ajoute").hidden = true, 300); };
  }

  /* le panier : les lignes, retrait ou livraison, les coordonnées, le total ; puis la commande confirmée */
  const commande = { mode: "retrait", nom: "", email: "", tel: "", adresse: "", cp: "", ville: "", erreurs: [], faite: null };
  function dessinePanier() {
    const z = $("panier"); if (!z) return;
    if (commande.faite) {
      const c = commande.faite;
      z.innerHTML = `<div class="commande-ok"><p class="ok-titre">${t("pa-ok")}</p><p>${t("pa-ok-t")}</p>
        <div class="billet"><div class="tete-billet"><span>${t("pa-numero")} ${c.numero}</span><span>${euros(c.total)}${c.mode === "envoi" ? " + " + t("pa-livraison").toLowerCase() : ""}</span></div>
        <ul class="recap-lignes">${c.lignes.map(l => `<li><span>${esc(l.nom)}${l.opt ? ` <small>${esc(l.opt)}</small>` : ""} × ${l.q}</span><b>${euros(l.prix * l.q)}</b></li>`).join("")}</ul>
        <p class="note">${c.mode === "retrait" ? t("pa-retrait") + " · " + t("pa-retrait-t") : t("pa-envoi") + " · " + esc(c.adresse)}</p></div>
        <p class="note-maquette">${t("pa-ok-maquette")}</p>
        <a class="btn lg" href="boutique.html#souvenirs">${t("p-retour")}</a></div>`;
      return;
    }
    const lignes = lirePanier().map(l => ({ ...l, p: produit(l.id) })).filter(l => l.p && l.p.prix != null);
    if (!lignes.length) { z.innerHTML = `<div class="panier-vide"><p>${t("pa-vide")}</p><a class="btn lg" href="boutique.html#souvenirs">${t("pa-vide-lien")}</a></div>`; return; }
    const sous = lignes.reduce((s, l) => s + l.p.prix * l.q, 0), n = lignes.reduce((s, l) => s + l.q, 0), err = k => commande.erreurs.includes(k);
    const champ = (k, type, auto, large) => `<label class="champ${large ? " large" : ""}${err(k) ? " faux" : ""}"><span>${t("pa-" + k)}</span><input type="${type}" data-champ="${k}" autocomplete="${auto}" value="${esc(commande[k])}"></label>`;
    z.innerHTML = `<div class="panier-grille">
      <div class="panier-gauche">
        <ul class="lignes">${lignes.map((l, i) => `<li class="ligne-p">
          <a class="vi${l.p.plein ? " plein" : ""}" href="produit.html?id=${l.p.id}"><img src="${l.p.photo}" alt=""></a>
          <div class="quoi"><a href="produit.html?id=${l.p.id}">${esc(l.p.nom)}</a><small>${[l.c, l.t].filter(Boolean).map(esc).join(" · ")}</small>
            <div class="pas quantite"><button type="button" data-l="${i}" data-dq="-1" aria-label="−" ${l.q <= 1 ? "disabled" : ""}>−</button><output>${l.q}</output><button type="button" data-l="${i}" data-dq="1" aria-label="+" ${l.q >= 20 ? "disabled" : ""}>+</button></div></div>
          <div class="combien"><b>${euros(l.p.prix * l.q)}</b><button type="button" class="retirer" data-l="${i}" data-retirer>${t("pa-retirer")}</button></div></li>`).join("")}</ul>
        <fieldset class="bloc-commande"><legend>${t("pa-mode")}</legend>
          <div class="modes">${["retrait", "envoi"].map(m => `<button type="button" class="mode" data-mode="${m}" aria-pressed="${commande.mode === m}"><b>${t("pa-" + m)}</b><small>${t("pa-" + m + "-t")}</small><span class="cout">${m === "retrait" ? t("pa-gratuit") : t("pa-a-confirmer")}</span></button>`).join("")}</div>
        </fieldset>
        <fieldset class="bloc-commande"><legend>${t("pa-coord")}</legend>
          <div class="champs">${champ("nom", "text", "name", true)}${champ("email", "email", "email")}${champ("tel", "tel", "tel")}
          ${commande.mode === "envoi" ? champ("adresse", "text", "street-address", true) + champ("cp", "text", "postal-code") + champ("ville", "text", "address-level2") : ""}</div>
          ${commande.erreurs.length ? `<p class="erreur" role="alert">${commande.erreurs.map(k => t({ nom: "pa-err-nom", email: "pa-err-email", adresse: "pa-err-adresse" }[k])).join(" ")}</p>` : ""}
        </fieldset>
      </div>
      <aside class="recap"><h2>${t("pa-recap")}</h2>
        <dl><div><dt>${t("pa-sous-total")} <small>(${n} ${t("pa-articles")})</small></dt><dd>${euros(sous)}</dd></div>
        <div><dt>${t("pa-livraison")}</dt><dd>${commande.mode === "retrait" ? t("pa-gratuit") : t("pa-a-confirmer")}</dd></div>
        <div class="total"><dt>${t("pa-total")}</dt><dd>${euros(sous)}</dd></div></dl>
        <button type="button" class="btn lg" id="payer">${t("pa-payer")} · ${euros(sous)}</button>
        <p class="note">${t("pa-cgv")} <a href="cgv.html">${t("r-cgv-lien")}</a>.</p>
        <p class="securise"><svg width="13" height="15" viewBox="0 0 13 15" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="1" y="6.5" width="11" height="7.5" rx="1.5"/><path d="M3.5 6.5V4.5a3 3 0 0 1 6 0v2"/></svg>${t("pa-securise")}</p>
      </aside></div>`;
  }
  if ($("panier")) {
    $("panier").addEventListener("input", e => { const k = e.target.dataset.champ; if (k) commande[k] = e.target.value; });
    $("panier").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      const panier = lirePanier().filter(l => produit(l.id) && produit(l.id).prix != null);
      if (b.dataset.dq) { const l = panier[+b.dataset.l]; l.q = Math.min(20, Math.max(1, l.q + +b.dataset.dq)); ecrirePanier(panier); }
      else if (b.hasAttribute("data-retirer")) { panier.splice(+b.dataset.l, 1); ecrirePanier(panier); }
      else if (b.dataset.mode) { commande.mode = b.dataset.mode; commande.erreurs = []; }
      else if (b.id === "payer") {
        commande.erreurs = [];
        if (!commande.nom.trim()) commande.erreurs.push("nom");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(commande.email.trim())) commande.erreurs.push("email");
        if (commande.mode === "envoi" && !(commande.adresse.trim() && commande.cp.trim() && commande.ville.trim())) commande.erreurs.push("adresse");
        if (!commande.erreurs.length) {
          const lignes = panier.map(l => { const p = produit(l.id); return { nom: p.nom, opt: [l.c, l.t].filter(Boolean).join(" · "), q: l.q, prix: p.prix }; });
          commande.faite = { numero: "GN-" + Date.now().toString(36).slice(-6).toUpperCase(), lignes, total: lignes.reduce((s, l) => s + l.prix * l.q, 0), mode: commande.mode, adresse: [commande.adresse, commande.cp, commande.ville].join(", ") };
          ecrirePanier([]);
          scrollTo({ top: 0, behavior: calme ? "auto" : "smooth" });
        }
      }
      dessinePanier();
      if (commande.erreurs.length && b.id === "payer") { const x = $("panier").querySelector(".faux input"); if (x) x.focus(); }
    });
  }

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

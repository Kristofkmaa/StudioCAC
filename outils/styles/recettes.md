# Recettes : le code de chaque option du catalogue

À reprendre tel quel puis à régler aux couleurs de la charte (variables `--bg`, `--ink`, `--accent`).
Toutes les animations ont une version calme pour `prefers-reduced-motion`.
Sur téléphone, garder les zones de toucher à 44 px au moins.

## Police d'appoint

```html
<!-- manuscrite -->   <link rel="stylesheet" href="../../polices/caveat-familjen-grotesk-48bed4.css">
<!-- affiche -->      <link rel="stylesheet" href="../../polices/jost-archivo-narrow-90ef28.css">  (ou bebas-neue-eb-garamond)
```
```css
.hand{font:400 clamp(1.8rem,1.4rem + 1.4vw,2.6rem)/1 "Caveat",cursive;color:var(--accent)}
.poster-type{font:600 1rem/1 "Archivo Narrow",sans-serif;letter-spacing:.08em;text-transform:uppercase}
.mag{font-style:italic;font-weight:400}   /* italique de la police des titres */
```

## Texture

```css
/* grain de papier : un bruit SVG très léger, sans fichier */
.grain{position:relative;isolation:isolate}
.grain::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.35;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* motif tiré du logo : le symbole en fond, très pâle */
.motif{background:url(images/logo-symbole.png) 0 0/72px repeat;background-blend-mode:luminosity}
.motif-wrap{position:relative}.motif-wrap::before{content:"";position:absolute;inset:0;background:inherit;opacity:.06;pointer-events:none}

/* carreaux : un carreau de ciment dessiné en SVG, répété */
.carreaux{background:var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L60 30 30 60 0 30Z' fill='none' stroke='%23000' stroke-opacity='.12'/%3E%3Ccircle cx='30' cy='30' r='6' fill='%23000' fill-opacity='.08'/%3E%3C/svg%3E") 0 0/60px}

/* grande forme : un cercle de couleur derrière une photo */
.shape{position:relative}.shape::before{content:"";position:absolute;width:80%;aspect-ratio:1;border-radius:50%;background:var(--accent);opacity:.15;right:-10%;top:-10%;z-index:-1}
```

## Arrivée des éléments

```css
.js .rise{opacity:0;transform:translateY(16px);transition:opacity .8s cubic-bezier(.23,1,.32,1),transform .8s cubic-bezier(.23,1,.32,1)}
.js .rise.on{opacity:1;transform:none}
/* dévoilement (option « rideau ») : fondu et léger recul, en opacité et transform seulement (fluide sur téléphone).
   Pas de clip-path : il saccade et montre un cadre vide si l'image n'est pas encore chargée. */
.js .curtain img{opacity:0;transform:scale(1.045);transition:opacity .9s ease-out,transform 1.4s cubic-bezier(.23,1,.32,1);transition-delay:var(--d,0ms)}
.js .curtain.on img{opacity:1;transform:none}
/* zoom lent */
.js .zoom img{transform:scale(1.08);transition:transform 1.8s cubic-bezier(.23,1,.32,1)}
.js .zoom.on img{transform:none}
@media (prefers-reduced-motion:reduce){.js .rise,.js .curtain img,.js .zoom img{opacity:1;transform:none;clip-path:none;transition:none}}
```
```js
// mot par mot : chaque mot du titre devient un <span> qui arrive avec un léger retard
document.querySelectorAll(".words").forEach(h => { h.innerHTML = h.textContent.split(" ").map((w, i) => `<span style="--i:${i}">${w}</span>`).join(" "); });
// CSS : .js .words span{display:inline-block;opacity:0;transform:translateY(.4em);transition:.7s cubic-bezier(.23,1,.32,1) calc(var(--i)*70ms)} .js .words.on span{opacity:1;transform:none}
// une seule observation pour tout : .rise, .curtain, .zoom, .words
// une photo ne s'anime qu'une fois chargée (sinon l'animation passe sur du vide puis l'image tombe d'un coup)
const ready = img => img.complete && img.naturalWidth ? Promise.resolve() : new Promise(r => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); });
const show = el => { const img = el.querySelector("img"); if (!img) return el.classList.add("on"); (img.decode ? img.decode().catch(() => {}) : ready(img)).then(() => ready(img)).then(() => requestAnimationFrame(() => el.classList.add("on"))); };
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
// dans une mosaïque, décaler les photos : style="--d:120ms", "--d:240ms"…
document.querySelectorAll(".rise,.curtain,.zoom,.words").forEach(el => io.observe(el));
```

## Passage entre les sections

```css
/* vague : un SVG en bas de la section, de la couleur de la section suivante */
.wave{position:relative}
.wave::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:60px;background:var(--next);
  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 30C240 0 480 0 720 30s480 30 720 0V60H0Z'/%3E%3C/svg%3E") 0 0/100% 100%;
          mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 30C240 0 480 0 720 30s480 30 720 0V60H0Z'/%3E%3C/svg%3E") 0 0/100% 100%}
/* diagonale */
.diag{clip-path:polygon(0 0,100% 4vw,100% 100%,0 100%);margin-top:-4vw;padding-top:calc(4vw + 90px)}
/* sections arrondies : un panneau de couleur posé sur le fond */
.panel{margin-inline:clamp(10px,2vw,24px);border-radius:clamp(20px,3vw,40px);background:var(--accent);color:var(--bg)}
/* chevauchement : la photo dépasse dans la section suivante */
.overlap{position:relative;z-index:2;margin-bottom:calc(-1 * clamp(80px,12vw,180px))}
.after-overlap{padding-top:calc(clamp(80px,12vw,180px) + 60px)}
```

## Boutons

```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 26px;border:1px solid var(--accent);background:var(--accent);color:var(--bg);text-decoration:none;cursor:pointer;transition:background-color .16s,transform .16s cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn.rect{border-radius:4px} .btn.pill{border-radius:999px}
/* souligné avec flèche */
.link-arrow{display:inline-flex;align-items:center;gap:10px;min-height:44px;font-weight:500;text-decoration:underline;text-underline-offset:.3em}
.link-arrow::after{content:"→";transition:transform .2s cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){.link-arrow:hover::after{transform:translateX(5px)}}
/* rond avec flèche */
.btn-round{display:inline-flex;align-items:center;gap:14px;min-height:52px;font-weight:500;text-decoration:none}
.btn-round i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--accent);color:var(--bg);font-style:normal;transition:transform .2s}
@media (hover:hover) and (pointer:fine){.btn-round:hover i{transform:translateX(4px)}}
```

## Pied de page

```css
/* nom géant, coupé par le bas */
.foot-giant{overflow:hidden;padding-top:60px}
.foot-giant .name{font:500 clamp(4rem,16vw,16rem)/.8 var(--serif);letter-spacing:-.04em;white-space:nowrap;margin-bottom:-.12em}
/* bloc de couleur */
.foot-color{background:var(--accent);color:var(--bg);padding-block:clamp(80px,10vw,140px) 32px}
```

## Ornement

```html
<!-- sceau tournant (voir clients/la-grotte-napoleon) -->
<div class="seal"><svg viewBox="0 0 200 200"><defs><path id="c" d="M100 100 m-86 0 a86 86 0 1 1 172 0 a86 86 0 1 1 -172 0"/></defs><text><textPath href="#c">Texte · du · sceau · </textPath></text></svg><img src="images/logo-symbole.png" alt=""></div>
```
```css
.seal svg{animation:turn 40s linear infinite}@keyframes turn{to{transform:rotate(360deg)}}
.tag{position:absolute;top:14px;left:14px;padding:6px 12px;background:var(--bg);color:var(--ink);font-size:13px;font-weight:500;transform:rotate(-4deg);border-radius:4px}
.gold-rule{width:64px;height:2px;background:#B08B3A;margin:20px 0}
.chapter{position:relative}.chapter::before{content:attr(data-n);position:absolute;top:-.2em;right:0;font:500 clamp(6rem,18vw,16rem)/1 var(--serif);opacity:.06;pointer-events:none}
```

## Rappels pour les familles déjà là

- **Photos teintées** (vitrier-prince) : `background:#C3CCE2` sur le cadre, `filter:grayscale(1);mix-blend-mode:multiply` sur l'image.
- **Noir et blanc** : `filter:grayscale(1) contrast(1.05)`. À éviter pour la cuisine.
- **Douces** : `filter:saturate(.82)`.
- **Menu plein écran, barre basse, sommaire illustré, une photo à la fois, trois questions, ouvert maintenant** : voir `clients/vitrier-prince` et `clients/la-grotte-napoleon`.

## Rien ne défile sur le côté

Tout tient dans la largeur de l'écran. Un tableau, sur téléphone, devient une fiche par ligne :
```css
@media (max-width:760px){
  .prices thead{display:none}
  .prices tr{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;padding:16px 0;border-bottom:1px solid var(--line)}
  .prices td{padding:0;border:0}
  .prices td:first-child{grid-column:1 / -1}
  .prices td:nth-child(2)::before{content:"1 heure"}   /* le nom de la colonne devant chaque prix */
}
```
Une longue liste de cartes devient une grille (4 colonnes, 2 sur téléphone) avec des filtres par groupe ; un calendrier mois par mois devient douze boutons de mois puis la fiche du mois (voir demo-castagnetu.html).

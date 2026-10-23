/* Aperçu de chaque thème de la base (themes.json) : une petite page d'exemple dessinée dans le style du thème,
   avec ses polices, ses couleurs et ses formes. Le contenu est neutre (« Votre commerce ») : c'est le style qu'on montre.
   Utilisé par devis.html (étape du style) et outils/themes.html (le catalogue).

   Themes.load(base)            → la liste des thèmes (base : chemin vers la racine du site, "" ou "../")
   Themes.fonts(list, base)     → charge les polices des thèmes (une feuille par thème, hébergée sur le site)
   Themes.render(t, opts, base) → le HTML de l'aperçu ; opts : { nom, quoi } */
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);

  // la feuille commune : l'aperçu se dessine en unités de conteneur (cqw), il garde ses proportions à toutes les tailles
  const CSS = `
.tp{container-type:inline-size;position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--f);color:var(--t);font-family:var(--fx),system-ui,sans-serif;line-height:1.35;text-align:left}
/* tout se dessine dans .tq, à l'intérieur du conteneur : les unités cqw s'y rapportent bien à la largeur de l'aperçu */
.tp .tq{position:absolute;inset:0;font-size:2.3cqw;isolation:isolate}
.tp *{box-sizing:border-box;margin:0;padding:0}
.tp img{display:block;width:100%;height:100%;object-fit:cover}
.tp .ft{font-family:var(--ft),Georgia,serif}
.tp .nav{display:flex;align-items:center;gap:3cqw;padding:2.6cqw 4cqw}
.tp .nav .lg{font-family:var(--ft),Georgia,serif;font-size:3cqw;font-weight:700;margin-right:auto;white-space:nowrap}
.tp .nav .lk{display:flex;gap:2.6cqw;font-size:1.9cqw;opacity:.8}
.tp .btn{display:inline-block;padding:1.2cqw 2.6cqw;background:var(--a);color:var(--f);font-size:1.9cqw;font-weight:700;white-space:nowrap}

/* Art déco : noir et or, centré, rayons de soleil, double cadre doré */
.tp-art-deco{text-align:center}
.tp-art-deco .tq::before{content:"";position:absolute;inset:2cqw;border:.25cqw solid var(--a);outline:.25cqw solid var(--a);outline-offset:-1.2cqw;z-index:2;pointer-events:none}
.tp-art-deco .rays{position:absolute;left:50%;top:55%;width:150cqw;aspect-ratio:1;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 0deg,rgba(201,165,90,.22) 0 .6deg,transparent .6deg 7deg);border-radius:50%;z-index:-1}
.tp-art-deco .nav{justify-content:center;padding-top:5cqw}
.tp-art-deco .nav .lg{margin:0;font-weight:400;letter-spacing:.4em;text-transform:uppercase;font-size:2.2cqw;color:var(--a)}
.tp-art-deco .kick{margin-top:3cqw;font-size:1.6cqw;letter-spacing:.4em;text-transform:uppercase;color:var(--a)}
.tp-art-deco h4{margin-top:1.5cqw;font-size:7cqw;font-weight:400;line-height:1;letter-spacing:.06em;text-transform:uppercase}
.tp-art-deco .filet{display:flex;align-items:center;justify-content:center;gap:1.4cqw;margin:2.6cqw auto 0;color:var(--a)}
.tp-art-deco .filet::before,.tp-art-deco .filet::after{content:"";width:9cqw;height:.2cqw;background:currentColor}
.tp-art-deco .filet i{width:1.2cqw;height:1.2cqw;background:currentColor;transform:rotate(45deg)}
.tp-art-deco p{margin:2.6cqw auto 0;max-width:46cqw;font-size:2cqw;opacity:.85}
.tp-art-deco .lnk{display:inline-block;margin-top:3cqw;font-size:1.7cqw;letter-spacing:.3em;text-transform:uppercase;color:var(--a);border-bottom:.2cqw solid var(--a);padding-bottom:.6cqw}
.tp-art-deco .arch{position:absolute;bottom:-1cqw;left:50%;transform:translateX(-50%);width:18cqw;height:13cqw;clip-path:polygon(0 100%,0 40%,12% 40%,12% 22%,26% 22%,26% 8%,74% 8%,74% 22%,88% 22%,88% 40%,100% 40%,100% 100%);opacity:.9}

/* Magazine : manchette, grande photo légendée, titre en serif avec italique, texte en colonnes */
.tp-magazine .nav{justify-content:space-between;border-bottom:.15cqw solid rgba(255,255,255,.2);padding-block:2cqw}
.tp-magazine .nav .lg{margin:0 auto;font-size:3.6cqw;font-weight:900}
.tp-magazine .nav small{font-size:1.5cqw;opacity:.6;position:absolute;left:4cqw}
.tp-magazine .nav .lk{position:absolute;right:4cqw}
.tp-magazine .ph{margin:2.4cqw 4cqw 0;height:24cqw}
.tp-magazine .cap{margin:.8cqw 4cqw 0;font-size:1.4cqw;font-style:italic;opacity:.7}
.tp-magazine .cover{display:grid;grid-template-columns:1.2fr 1fr;gap:4cqw;margin:2.4cqw 4cqw 0}
.tp-magazine h4{font-size:5.6cqw;font-weight:500;line-height:1}
.tp-magazine h4 em{color:var(--a)}
.tp-magazine .cols{columns:2;column-gap:2cqw;font-size:1.5cqw;opacity:.85}
.tp-magazine .cols::first-letter{float:left;font-family:var(--ft),serif;font-size:4.6cqw;line-height:.8;color:var(--a);margin:.3cqw .6cqw 0 0;font-weight:900}

/* Grille suisse : tout à gauche, un grand chiffre, aplats francs */
.tp-suisse .nav{margin:2.4cqw 4cqw 0;padding:0 0 0 2cqw;border:.25cqw solid var(--t);background:#fff;height:6cqw}
.tp-suisse .nav .lg{font-family:var(--fx);font-weight:900}
.tp-suisse .nav .btn{align-self:stretch;display:flex;align-items:center;color:var(--t);border-left:.25cqw solid var(--t)}
.tp-suisse .hero{display:grid;grid-template-columns:repeat(12,1fr);gap:1.6cqw;margin:4cqw 4cqw 0}
.tp-suisse .n{grid-column:span 2;font-weight:900;font-size:7cqw;line-height:.8;color:var(--s);letter-spacing:-.05em}
.tp-suisse h4{grid-column:3 / span 6;font-family:var(--fx);font-weight:900;font-size:6.4cqw;line-height:.92;letter-spacing:-.04em}
.tp-suisse .ph{grid-column:10 / span 3;grid-row:span 2;height:22cqw}
.tp-suisse p{grid-column:3 / span 6;font-size:1.9cqw}
.tp-suisse .row{display:grid;grid-template-columns:repeat(3,1fr);gap:1.6cqw;margin:3cqw 4cqw 0}
.tp-suisse .row span{height:9cqw;padding:1.4cqw;font-weight:900;font-size:4cqw;line-height:1;color:#fff}

/* Affiche brute : titre énorme en capitales, surligné, bords noirs épais et ombres pleines */
.tp-affiche-brute .nav{border-bottom:.4cqw solid var(--t)}
.tp-affiche-brute .nav .lg{font-weight:400;text-transform:uppercase;font-size:3.2cqw}
.tp-affiche-brute .btn,.tp-affiche-brute .go{border:.35cqw solid var(--t);color:var(--t);text-transform:uppercase;box-shadow:.8cqw .8cqw 0 var(--t)}
.tp-affiche-brute h4{margin:3cqw 4cqw 0;font-size:9.5cqw;font-weight:400;line-height:1.14;text-transform:uppercase}
.tp-affiche-brute h4 em{font-style:normal;background:var(--a);padding:0 .1em}
.tp-affiche-brute .go{display:inline-block;margin:3cqw 0 0 4cqw;padding:1.4cqw 2.4cqw;background:var(--a);font-weight:800;font-size:1.9cqw}
.tp-affiche-brute .ph{position:absolute;right:4cqw;bottom:4cqw;width:30cqw;height:20cqw;border:.4cqw solid var(--t);box-shadow:1cqw 1cqw 0 var(--t);filter:grayscale(1) contrast(1.15);transform:rotate(2deg)}
.tp-affiche-brute .tag{position:absolute;right:26cqw;bottom:20cqw;z-index:2;padding:.6cqw 1.4cqw;background:var(--s);color:#fff;border:.3cqw solid var(--t);font-weight:800;font-size:1.6cqw;text-transform:uppercase;transform:rotate(-5deg)}

/* Rétro 70 : bandes de couleur, serif grasse et ronde, coins très arrondis, sceau */
.tp-retro-70 .bands{height:3cqw;background:linear-gradient(var(--t) 0 25%,#B4431F 0 50%,var(--a) 0 75%,var(--s) 0)}
.tp-retro-70 .nav{justify-content:center;flex-direction:column;gap:.6cqw;padding-bottom:1cqw}
.tp-retro-70 .nav .lg{margin:0;font-weight:900;font-size:3.6cqw}
.tp-retro-70 .hand{font-family:"Yellowtail",cursive;color:#B4431F;font-size:2.4cqw}
.tp-retro-70 .ph{position:absolute;left:2.6cqw;right:2.6cqw;bottom:2.6cqw;top:21cqw;border-radius:4cqw;overflow:hidden}
.tp-retro-70 .card{position:absolute;left:6cqw;bottom:5cqw;width:46cqw;background:#FBF0DB;border-radius:3cqw;padding:3cqw}
.tp-retro-70 h4{font-size:7.4cqw;font-weight:900;line-height:.9;letter-spacing:-.03em}
.tp-retro-70 p{margin-top:1.4cqw;font-size:1.8cqw}
.tp-retro-70 .go{display:inline-flex;align-items:center;gap:1.2cqw;margin-top:2cqw;font-weight:700;font-size:1.8cqw}
.tp-retro-70 .go i{width:4.4cqw;height:4.4cqw;border-radius:50%;background:#B4431F;color:#fff;display:grid;place-items:center;font-style:normal}
.tp-retro-70 .seal{position:absolute;left:44cqw;bottom:30cqw;width:11cqw;height:11cqw;border-radius:50%;background:var(--s);display:grid;place-items:center;font-family:var(--ft);font-weight:900;font-size:3cqw;z-index:2}

/* Fait main : papier, photo posée de travers avec du ruban, écriture à la main, vichy */
.tp-fait-main .tq{display:grid;grid-template-columns:26cqw 1fr}
.tp-fait-main .side{background:var(--s);padding:3cqw 2.6cqw;display:flex;flex-direction:column;gap:1.4cqw;border-right:.3cqw dashed #C9A473}
.tp-fait-main .side b{font-family:"Kalam",cursive;font-size:3cqw;line-height:1}
.tp-fait-main .side span{font-family:var(--ft);font-size:1.9cqw}
.tp-fait-main .main{position:relative;padding:4cqw 4cqw 0}
.tp-fait-main .tag{display:inline-block;padding:.4cqw 1.2cqw;background:#EFC35A;font-family:"Kalam",cursive;font-weight:700;font-size:1.6cqw;transform:rotate(-2deg)}
.tp-fait-main h4{margin-top:1.6cqw;width:34cqw;font-size:5.6cqw;font-weight:700;line-height:1}
.tp-fait-main h4 em{color:var(--a);font-weight:500}
.tp-fait-main .snap{position:absolute;right:4cqw;top:6cqw;width:26cqw;background:#fff;padding:1cqw 1cqw 4cqw;box-shadow:0 1.4cqw 3cqw -1.4cqw rgba(58,34,16,.6);transform:rotate(3deg)}
.tp-fait-main .snap::before{content:"";position:absolute;top:-1.4cqw;left:50%;width:10cqw;height:2.8cqw;transform:translateX(-50%) rotate(-4deg);background:rgba(239,195,90,.8)}
.tp-fait-main .snap .ph{height:20cqw}
.tp-fait-main .snap i{position:absolute;bottom:.8cqw;left:0;right:0;text-align:center;font-family:"Kalam",cursive;font-style:normal;font-size:1.7cqw}
.tp-fait-main .vichy{position:absolute;left:0;right:0;bottom:0;height:3cqw;background:repeating-linear-gradient(0deg,rgba(194,54,31,.55) 0 1.5cqw,transparent 1.5cqw 3cqw),repeating-linear-gradient(90deg,rgba(194,54,31,.55) 0 1.5cqw,#FBF5E9 1.5cqw 3cqw)}
.tp-fait-main .go{display:inline-flex;align-items:center;gap:1.2cqw;margin-top:2.4cqw;font-weight:700;font-size:1.8cqw}
.tp-fait-main .go i{width:4.4cqw;height:4.4cqw;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-style:normal}

/* Luxe minimal : beaucoup d'air, le nom de part et d'autre d'une arche, capitales minuscules */
.tp-luxe-minimal{text-align:center}
.tp-luxe-minimal .nav{flex-direction:column;gap:1cqw;padding-top:4cqw}
.tp-luxe-minimal .nav .lg{margin:0;font-weight:400;letter-spacing:.4em;text-transform:uppercase;font-size:2.2cqw}
.tp-luxe-minimal .nav .lk{font-size:1.3cqw;letter-spacing:.3em;text-transform:uppercase;opacity:.6}
.tp-luxe-minimal .hero{display:flex;align-items:center;justify-content:center;gap:3cqw;margin-top:3cqw}
.tp-luxe-minimal .w{font-family:var(--ft);font-size:8cqw;line-height:1}
.tp-luxe-minimal .arch{width:20cqw;height:27cqw;border-radius:99cqw 99cqw 0 0;overflow:hidden;outline:.15cqw solid rgba(30,30,28,.2);outline-offset:1cqw}
.tp-luxe-minimal .kick{margin-top:3cqw;font-size:1.4cqw;letter-spacing:.4em;text-transform:uppercase;color:var(--a)}
.tp-luxe-minimal .lnk{display:inline-block;margin-top:1.6cqw;font-size:1.4cqw;letter-spacing:.3em;text-transform:uppercase;border-bottom:.15cqw solid currentColor;padding-bottom:.6cqw}

/* Méditerranéen : bloc bleu avec carreaux de faïence, italique terre cuite, coins doux, vague */
.tp-mediterraneen .nav{margin:2cqw auto 0;width:max-content;background:#fff;border-radius:99cqw;padding:1cqw 1cqw 1cqw 3cqw;box-shadow:0 1cqw 3cqw -1.6cqw rgba(22,63,94,.5)}
.tp-mediterraneen .nav .btn,.tp-mediterraneen .go{border-radius:99cqw;color:#fff}
.tp-mediterraneen .mos{display:grid;grid-template-columns:1.2fr 1fr .8fr;gap:1.4cqw;margin:2cqw 4cqw 0;height:40cqw}
.tp-mediterraneen .mos>*{border-radius:2.4cqw;overflow:hidden;position:relative}
.tp-mediterraneen .blue{background:var(--s);color:var(--f);padding:2.6cqw;display:flex;flex-direction:column;justify-content:flex-end}
.tp-mediterraneen .blue::before{content:"";position:absolute;inset:0 0 auto;height:7cqw;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23FBF6EC'/%3E%3Cpath d='M32 4 L60 32 L32 60 L4 32Z' fill='none' stroke='%231F5C86' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='9' fill='%231F5C86'/%3E%3Ccircle cx='32' cy='32' r='4' fill='%23E3A63B'/%3E%3C/svg%3E") 0 0/3.6cqw}
.tp-mediterraneen h4{font-size:4.8cqw;font-weight:400;line-height:1}
.tp-mediterraneen h4 em{color:#E3A63B}
.tp-mediterraneen .go{display:inline-block;align-self:flex-start;margin-top:2cqw;padding:1.2cqw 2.4cqw;background:var(--a);font-weight:700;font-size:1.7cqw}
.tp-mediterraneen .ochre{background:#E3A63B;padding:2cqw;font-family:var(--ft);font-size:2.6cqw;line-height:1.1}
.tp-mediterraneen .stack{display:grid;grid-template-rows:1fr 1fr;gap:1.4cqw;background:none!important}
.tp-mediterraneen .stack>*{border-radius:2.4cqw;overflow:hidden}

/* Moderne doux : pastel, pilules, coins arrondis, une forme ronde derrière la photo */
.tp-moderne-doux .nav{margin:2cqw 3cqw 0;background:#fff;border-radius:99cqw;padding:1cqw 1cqw 1cqw 3cqw;box-shadow:0 1cqw 3cqw -1.8cqw rgba(46,36,34,.4)}
.tp-moderne-doux .btn,.tp-moderne-doux .go{border-radius:99cqw;color:#fff}
.tp-moderne-doux .hero{display:grid;grid-template-columns:1.1fr 1fr;gap:3cqw;align-items:center;margin:4cqw 5cqw 0}
.tp-moderne-doux .hand{font-family:"Caveat",cursive;font-weight:600;color:#D98C6F;font-size:2.8cqw}
.tp-moderne-doux h4{font-size:5.6cqw;font-weight:700;line-height:1.02;letter-spacing:-.02em}
.tp-moderne-doux h4 em{font-family:var(--fx);font-style:italic;font-weight:600;color:var(--a)}
.tp-moderne-doux p{margin-top:1.4cqw;font-size:1.8cqw;opacity:.75}
.tp-moderne-doux .go{display:inline-block;margin-top:2cqw;padding:1.3cqw 2.8cqw;background:var(--a);font-weight:700;font-size:1.8cqw}
.tp-moderne-doux .pic{position:relative}
.tp-moderne-doux .pic::before{content:"";position:absolute;width:34cqw;aspect-ratio:1;border-radius:50%;background:var(--s);right:-5cqw;top:-5cqw;z-index:-1}
.tp-moderne-doux .ph{height:27cqw;border-radius:3cqw;overflow:hidden}
.tp-moderne-doux .chips{display:flex;gap:1cqw;margin:3cqw 5cqw 0}
.tp-moderne-doux .chips span{padding:.8cqw 2cqw;border-radius:99cqw;background:#D3DECF;font-size:1.6cqw;font-weight:600}

/* Sombre cinéma : photo plein cadre, titre immense en bas à gauche, petites capitales */
.tp-sombre-cinema .ph{position:absolute;inset:0;z-index:-2}
.tp-sombre-cinema .ph img{filter:contrast(1.1)}
.tp-sombre-cinema .tq::after{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse 85% 75% at 0% 100%,rgba(13,11,10,.94),rgba(13,11,10,.55) 50%,rgba(13,11,10,.2) 80%),linear-gradient(rgba(13,11,10,.6),transparent 25%)}
.tp-sombre-cinema .nav{justify-content:center}
.tp-sombre-cinema .nav .lg{margin:0;font-weight:900;letter-spacing:.14em;text-transform:uppercase;font-size:2.4cqw}
.tp-sombre-cinema .nav .lk{display:none}
.tp-sombre-cinema .bottom{position:absolute;left:5cqw;bottom:5cqw;width:60cqw}
.tp-sombre-cinema .kick{font-size:1.4cqw;letter-spacing:.3em;text-transform:uppercase;color:var(--a);font-weight:600}
.tp-sombre-cinema h4{margin-top:1cqw;font-size:10cqw;font-weight:900;line-height:.86;text-transform:uppercase}
.tp-sombre-cinema .lnk{display:inline-block;margin-top:2cqw;font-size:1.6cqw;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border-bottom:.3cqw solid var(--a);padding-bottom:.5cqw}

/* Atelier mécanique : béton, jaune de signalisation, pochoir, bandes hachurées, plaque d'immatriculation */
.tp-atelier .nav{background:#16181A;color:#fff}
.tp-atelier .nav .lg{color:var(--a);font-weight:400;text-transform:uppercase}
.tp-atelier .nav .btn{color:#16181A}
.tp-atelier .hero{display:grid;grid-template-columns:1fr 1fr;gap:3cqw;margin:6cqw 4cqw 0;align-items:center}
.tp-atelier .ph{height:30cqw!important}
.tp-atelier h4{font-size:6cqw;font-weight:400;line-height:1.22;text-transform:uppercase}
.tp-atelier h4 em{font-style:normal;background:#16181A;color:#fff;padding:0 .1em}
.tp-atelier .ph{height:24cqw;filter:grayscale(1) contrast(1.1)}
.tp-atelier .plate{display:inline-flex;margin-top:2cqw;border:.3cqw solid #16181A;border-radius:.8cqw;overflow:hidden;background:#fff;font-weight:800;font-size:2.6cqw;letter-spacing:.06em}
.tp-atelier .plate i{width:3cqw;background:#039;font-style:normal}
.tp-atelier .plate span{padding:.6cqw 1.6cqw}
.tp-atelier .hz{position:absolute;left:0;right:0;bottom:0;height:3.6cqw;background:repeating-linear-gradient(-45deg,var(--a) 0 2cqw,#16181A 2cqw 4cqw)}

/* Herbier : papier crème, planche de fleur avec son étiquette, noms latins en italique */
.tp-herbier .nav{border-bottom:.15cqw solid rgba(43,42,34,.2);margin:0 4cqw;padding-inline:0}
.tp-herbier .nav .lg{font-weight:500}
.tp-herbier .nav .btn{color:var(--f)}
.tp-herbier .hero{display:grid;grid-template-columns:1.1fr 1fr;gap:4cqw;margin:4cqw 4cqw 0;align-items:center}
.tp-herbier h4{font-size:6.4cqw;font-weight:500;line-height:1}
.tp-herbier h4 em{color:var(--a)}
.tp-herbier p{margin-top:1.6cqw;font-size:1.8cqw}
.tp-herbier .sheet{position:relative;background:#F6F1E4;border:.15cqw solid rgba(43,42,34,.2);padding:2cqw 2cqw 6cqw;height:36cqw}
.tp-herbier .sheet .ph img{object-fit:contain}
.tp-herbier .sheet .ph{height:100%}
.tp-herbier .label{position:absolute;right:1.4cqw;bottom:1.4cqw;background:#FBF7EE;border:.15cqw solid rgba(43,42,34,.2);padding:.6cqw 1.2cqw;font-family:var(--ft);font-style:italic;font-size:1.8cqw}

/* Énergie : titre immense et penché, orange vif, citron vert, photos en noir et blanc */
.tp-energie .nav .lg{font-weight:900;text-transform:uppercase;font-size:2.6cqw}
.tp-energie .nav .btn{border-radius:99cqw;color:#111}
.tp-energie h4{margin:2cqw 4cqw 0;font-size:17cqw;font-weight:900;line-height:.86;text-transform:uppercase;letter-spacing:-.05em;transform:skewX(-8deg);transform-origin:left}
.tp-energie h4 i{font-style:normal;color:var(--a)}
.tp-energie .row{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:1.4cqw;margin:3cqw 4cqw 0;align-items:end}
.tp-energie .row .ph{height:18cqw;filter:grayscale(1) contrast(1.15)}
.tp-energie .row .ph:nth-child(2){height:22cqw}
.tp-energie .chip{position:absolute;left:5.5cqw;bottom:4cqw;padding:.6cqw 1.6cqw;border-radius:99cqw;background:var(--s);font-weight:800;font-size:1.7cqw}

/* Carnet d'architecte : papier quadrillé, encre bleu nuit, trait rouge, plan coté */
.tp-carnet .tq{background-image:linear-gradient(rgba(31,42,68,.07) .1cqw,transparent .1cqw),linear-gradient(90deg,rgba(31,42,68,.07) .1cqw,transparent .1cqw);background-size:2.6cqw 2.6cqw}
.tp-carnet .nav{border-bottom:.15cqw solid rgba(31,42,68,.2);margin:0 4cqw;padding-inline:0}
.tp-carnet .nav .lg{font-weight:400;font-size:3.4cqw}
.tp-carnet .nav .btn{background:var(--a);color:#fff}
.tp-carnet .hero{display:grid;grid-template-columns:1fr 1fr;gap:4cqw;margin:4cqw 4cqw 0;align-items:center}
.tp-carnet h4{font-size:6.8cqw;font-weight:400;line-height:.98}
.tp-carnet h4 em{color:var(--a)}
.tp-carnet .plan{margin-top:2.4cqw;width:100%;height:auto}
.tp-carnet .ph{height:30cqw;background:#fff;padding:1cqw;outline:.15cqw solid rgba(31,42,68,.2);outline-offset:.8cqw}
`;

  // le dessin de chaque thème : n = nom, q = activité, img = photo d'exemple
  const VIEWS = {
    "art-deco": (n, q, img) => `<i class="rays"></i><div class="nav"><b class="lg">${n}</b></div><p class="kick">${q}</p><h4 class="ft">Bienvenue</h4><div class="filet"><i></i></div><p>Une phrase pour dire ce que vous faites, et pourquoi venir chez vous.</p><span class="lnk">Réserver une table</span><div class="arch">${img}</div>`,
    "magazine": (n, q, img) => `<div class="nav"><small>N° 1 · Automne</small><b class="lg">${n}</b><span class="lk">Sommaire</span></div><div class="ph">${img}</div><p class="cap">Votre atelier, votre ferme, votre salle : la photo qui vous ressemble.</p><div class="cover"><h4 class="ft">Une histoire <em>à raconter</em></h4><p class="cols">Le texte se lit comme un article, en colonnes, avec une lettrine. Chaque photo a sa légende, chaque rubrique son numéro.</p></div>`,
    "suisse": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Services</i><i>Prix</i><i>Contact</i></span><span class="btn">Réserver</span></div><div class="hero"><span class="n">01</span><h4>Ce que vous faites, en clair.</h4><div class="ph">${img}</div><p>Une grille stricte, de grands chiffres et des couleurs franches.</p></div><div class="row"><span style="background:#0F2A4A">7</span><span style="background:#F5C518;color:#0E1A26">24 h</span><span style="background:#D52B2B">0 €</span></div>`,
    "affiche-brute": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="btn" style="background:var(--a)">Appeler</span></div><h4 class="ft">Un besoin ?<br><em>On arrive.</em></h4><span class="go">Prendre rendez-vous</span><div class="ph">${img}</div><span class="tag">Devis gratuit</span>`,
    "retro-70": (n, q, img) => `<div class="bands"></div><div class="nav"><b class="lg">${n}</b><span class="hand">depuis toujours</span></div><div class="ph">${img}</div><div class="card"><h4 class="ft">${n}</h4><p>Une phrase chaleureuse pour dire ce que vous faites.</p><span class="go"><i>→</i>Venir nous voir</span></div><span class="seal">★</span>`,
    "fait-main": (n, q, img) => `<div class="side"><b>${n}</b><span>Nos produits</span><span>Commander</span><span>Horaires</span></div><div class="main"><span class="tag">fait maison</span><h4 class="ft">Fait ici, <em>chaque matin.</em></h4><span class="go"><i>→</i>Commander</span><figure class="snap"><div class="ph">${img}</div><i>tout juste sorti</i></figure></div><div class="vichy"></div>`,
    "luxe-minimal": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk">La maison · Autour · Réserver</span></div><div class="hero"><span class="w">Votre</span><div class="arch">${img}</div><span class="w">Maison</span></div><p class="kick">Une adresse pour vous seuls</p><span class="lnk">Voir les dates libres →</span>`,
    "mediterraneen": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>La carte</i><i>Le lieu</i></span><span class="btn">Réserver</span></div><div class="mos"><div class="blue"><h4 class="ft">Le soleil, <em>la mer</em></h4><span class="go">Réserver</span></div><div>${img}</div><div class="stack"><div class="ochre">Ouvert ce soir</div><div style="background:#7C8B4C"></div></div></div>`,
    "moderne-doux": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Soins</i><i>Tarifs</i></span><span class="btn">Réserver</span></div><div class="hero"><div><span class="hand">prenez soin de vous</span><h4 class="ft">Un moment <em>rien qu'à vous</em></h4><p>Doux, clair et accueillant.</p><span class="go">Voir les places libres</span></div><div class="pic"><div class="ph">${img}</div></div></div><div class="chips"><span>Demain 10 h</span><span>Mardi 15 h</span><span>Jeudi 9 h</span></div>`,
    "sombre-cinema": (n, q, img) => `<div class="ph">${img}</div><div class="nav"><b class="lg">${n}</b></div><div class="bottom"><p class="kick">${n} présente</p><h4 class="ft">Un savoir-faire à part</h4><span class="lnk">Découvrir →</span></div>`,
    "atelier": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Suivi</i><i>Prix</i></span><span class="btn">Appeler</span></div><div class="hero"><div><h4 class="ft">Réparée, et vous savez <em>quand.</em></h4><span class="plate"><i></i><span>AB-123-CD</span></span></div><div class="ph">${img}</div></div><i class="hz"></i>`,
    "herbier": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Bouquets</i><i>Venir</i></span><span class="btn">Commander</span></div><div class="hero"><div><h4 class="ft">Les fleurs <em>de saison</em>, en bouquet</h4><p>Délicat et naturel, comme un herbier ancien.</p></div><figure class="sheet"><div class="ph">${img}</div><span class="label">Cistus salviifolius</span></figure></div>`,
    "energie": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Planning</i><i>Tarifs</i></span><span class="btn">Essai gratuit</span></div><h4 class="ft">Forza<i>.</i></h4><div class="row"><div class="ph">${img}</div><div class="ph" style="background:#111"></div><div class="ph" style="background:var(--a)"></div></div><span class="chip">12 places max</span>`,
    "carnet": (n, q, img) => `<div class="nav"><b class="lg">${n}</b><span class="lk"><i>Estimer</i><i>Les biens</i></span><span class="btn">Estimer</span></div><div class="hero"><div><h4 class="ft">Votre bien, <em>au juste prix.</em></h4><svg class="plan" viewBox="0 0 200 90"><rect x="40" y="6" width="120" height="66" fill="rgba(210,69,43,.06)" stroke="#1F2A44" stroke-width="2.5"/><line x1="80" y1="6" x2="80" y2="44" stroke="#1F2A44"/><line x1="40" y1="82" x2="160" y2="82" stroke="#D2452B"/><text x="100" y="45" text-anchor="middle" font-size="16" fill="#1F2A44" font-family="Georgia">75 m²</text><text x="100" y="90" text-anchor="middle" font-size="8" fill="#D2452B">10,2 m</text></svg></div><div class="ph">${img}</div></div>`,
  };

  let cssDone = false;
  const injectCss = () => { if (cssDone) return; cssDone = true; const s = document.createElement("style"); s.textContent = CSS; document.head.append(s); };
  window.Themes = {
    async load(base = "") { const r = await fetch(base + "themes.json"); return (await r.json()).themes; },
    fonts(list, base = "") {
      list.forEach(t => { const href = base + t.polices.css; if (document.querySelector(`link[data-th="${href}"]`)) return;
        const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.dataset.th = href; document.head.append(l); });
    },
    render(t, opts = {}, base = "") {
      injectCss();
      const n = esc(opts.nom || "Votre commerce"), q = esc(opts.quoi || "Depuis toujours"), c = t.couleurs;
      const img = `<img src="${base}${t.photo}" alt="" loading="lazy">`;
      const view = VIEWS[t.id] || VIEWS["luxe-minimal"];
      return `<div class="tp tp-${t.id}" style="--f:${c.fond};--t:${c.texte};--a:${c.accent};--s:${c.second};--ft:'${t.polices.titres}';--fx:'${t.polices.texte}'" aria-hidden="true"><div class="tq">${view(n, q, img)}</div></div>`;
    },
  };
})();

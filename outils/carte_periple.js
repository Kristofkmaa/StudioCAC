// Carte du périple de la Grotte Napoléon (2/2) : à partir de carte.json, écrit le SVG gravé (mer en hachures, côtes, lieux, trajets
// des étapes 1769-1799) à coller dans clients/la-grotte-napoleon/index.html (section #histoire). Les noms traduits ont un data-t.
const o=require('./carte.json');const fs=require('fs');
const P={ajaccio:o.pts.ajaccio,calvi:o.pts.calvi,toulon:o.pts.toulon,frejus:[383.6,242.8]};
const segs={
 s1:'M734.5 604.2C640 600 430 430 330 -8',
 s2:'M372 -8C480 330 650 560 734.5 604.2',
 s3:'M734.5 604.2C700 560 700 490 738.1 449.5C600 380 330 380 241.8 316.5',
 s4:'M1008 836C900 770 800 690 734.5 604.2C640 520 450 330 383.6 242.8'};
const pt=(n,[x,y],lab,dx,dy,cls)=>`<g class="lieu ${cls}"><circle cx="${x}" cy="${y}" r="7"/><circle class="halo" cx="${x}" cy="${y}" r="16"/><text x="${x+dx}" y="${y+dy}">${lab}</text></g>`;
const svg=`<svg class="carte-svg" viewBox="0 0 1000 836" role="img" aria-labelledby="carteTitre">
<title id="carteTitre" data-t="h-carte">Carte : d’Ajaccio au continent, 1769-1799</title>
<defs><pattern id="hachures" width="8" height="5" patternUnits="userSpaceOnUse"><path d="M0 2.5H8" stroke="#6B5634" stroke-opacity=".28" stroke-width=".8"/></pattern>
<path id="terre" d="${o.d}"/><clipPath id="cadre"><rect width="1000" height="836"/></clipPath></defs>
<g clip-path="url(#cadre)">
<rect width="1000" height="836" fill="url(#hachures)"/>
<use href="#terre" class="cote" fill="none" stroke="#E9DECA" stroke-width="22"/>
<use href="#terre" class="cote2" fill="none" stroke="#6B5634" stroke-opacity=".25" stroke-width="12"/>
<use href="#terre" fill="#F2EADA" stroke="#4A3A22" stroke-width="1.4" stroke-linejoin="round"/>
<text class="nom-mer" x="70" y="520" transform="rotate(-6 70 520)">MARE MEDITERRANEUM</text>
<text class="nom-ile" x="905" y="640" transform="rotate(-80 905 640)">CORSICA</text>
<text class="nom-terre" x="250" y="130">PROVINCIA</text>
${Object.entries(segs).map(([k,d])=>`<path class="seg ${k}" d="${d}" pathLength="1"/>`).join('')}
${pt('ajaccio',P.ajaccio,'Ajaccio',-108,8,'p-ajaccio')}
${pt('calvi',P.calvi,'Calvi',-72,-6,'p-calvi')}
${pt('toulon',P.toulon,'Toulon',-20,38,'p-toulon')}
${pt('frejus',P.frejus,'Fréjus',14,38,'p-frejus')}
<text class="hors h-vers" x="230" y="34" data-t="h-vers">vers Autun et Brienne</text>
<text class="hors h-egypte" x="975" y="800" text-anchor="end" data-t="h-egypte">depuis l’Égypte</text>
</g>
<rect class="filet1" x="10" y="10" width="980" height="816"/><rect class="filet2" x="18" y="18" width="964" height="800"/>
<text class="annee" x="44" y="800">1769</text>
</svg>`;
fs.writeFileSync('carte.svg.html',svg);console.log(svg.length);

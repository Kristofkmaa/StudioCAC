// Carte du périple de la Grotte Napoléon (1/2) : extrait les côtes (Natural Earth 1:10m, domaine public, paquet npm world-atlas@2.0.2)
// de la Provence à la Corse, les projette sur 1000 de large et les coupe au cadre ; écrit carte.json.
// Préparer un dossier : npm pack world-atlas@2.0.2 topojson-client@3.1.0, décompresser (package/ et tc/), lancer ce script dedans.
const tc=require('./tc/dist/topojson-client.js');const fs=require('fs');
const t=JSON.parse(fs.readFileSync('package/land-10m.json'));
const land=tc.feature(t,t.objects.land);
const W=[4.55,10.25],H=[40.95,44.45],k=Math.cos(42.7*Math.PI/180);
const sx=1000/((W[1]-W[0])*k), w=1000, h=Math.round((H[1]-H[0])*sx);
const P=([lo,la])=>[((lo-W[0])*k*sx),((H[1]-la)*sx)];
let d='';
function clip(pts){const E=[[p=>p[0]>=-4,(a,b)=>{const t=(-4-a[0])/(b[0]-a[0]);return[-4,a[1]+t*(b[1]-a[1])]}],[p=>p[0]<=w+4,(a,b)=>{const t=(w+4-a[0])/(b[0]-a[0]);return[w+4,a[1]+t*(b[1]-a[1])]}],[p=>p[1]>=-4,(a,b)=>{const t=(-4-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),-4]}],[p=>p[1]<=h+4,(a,b)=>{const t=(h+4-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),h+4]}]];
for(const[ins,cut]of E){const o=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if(ins(b)){if(!ins(a))o.push(cut(a,b));o.push(b)}else if(ins(a))o.push(cut(a,b))}pts=o;if(!pts.length)break}return pts}
const g=land.features?land.features[0].geometry:land.geometry; const polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
for(const poly of polys){for(const ring of poly){
 if(!ring.some(([lo,la])=>lo>W[0]-1&&lo<W[1]+1&&la>H[0]-1&&la<H[1]+1))continue;
 let R=clip(ring.map(P));if(R.length<3)continue;let last=null,s='';R.forEach((c,i)=>{const [x,y]=c;if(last&&Math.hypot(x-last[0],y-last[1])<1.6&&i<R.length-1)return;s+=(s?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);last=[x,y]});d+=s+'Z';}}
const pts={ajaccio:[8.7369,41.9192],toulon:[5.9280,43.1242],marseille:[5.3698,43.2965],bastia:[9.4500,42.6970],calvi:[8.7570,42.5670],corte:[9.1490,42.3060],nice:[7.262,43.7102]};
const o={w,h,d,pts:Object.fromEntries(Object.entries(pts).map(([n,c])=>[n,P(c).map(v=>+v.toFixed(1))]))};
fs.writeFileSync('carte.json',JSON.stringify(o));console.log(w,h,d.length,o.pts);

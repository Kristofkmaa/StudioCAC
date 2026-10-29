/* Saitorapp hors ligne : l'appli s'ouvre même sans réseau (les fichiers sont gardés, les données sont déjà dans le navigateur). */
const CACHE = "saitorapp-v1";
const FICHIERS = ["./", "./index.html", "./app.js", "./donnees.js", "./charts.js", "./symbole.svg", "../polices/ibm-plex-sans-754611.css", "./manifest.webmanifest", "./icone-192.png", "../clients/mademoiselle-charlotte/pieces.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
/* le réseau d'abord, la copie si on est hors ligne */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r; }).catch(() => caches.match(e.request)));
});

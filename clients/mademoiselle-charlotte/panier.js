/* Le panier de Mademoiselle Charlotte, gardé dans le navigateur du visiteur.
   Une ligne : { s: nom de la création (voir pieces.js), q: quantité, prenom: texte à broder, detail: choix du bavoir, n: nom affiché s'il diffère de la fiche } */
window.Panier = (() => {
  const CLE = "mlle-charlotte-panier";
  let memoire = [];
  const lire = () => { try { return JSON.parse(localStorage.getItem(CLE)) || memoire; } catch (e) { return memoire; } };
  const ecrire = l => { memoire = l; try { localStorage.setItem(CLE, JSON.stringify(l)); } catch (e) {} majCompte(); };
  const piece = s => PIECES.find(x => x.s === s);
  const nombre = () => lire().reduce((n, l) => n + l.q, 0);
  const total = () => lire().reduce((t, l) => t + (piece(l.s) ? piece(l.s).p * l.q : 0), 0);
  function majCompte() {
    const n = nombre();
    document.querySelectorAll("[data-compte]").forEach(el => { el.textContent = n ? ` (${n})` : ""; });
  }
  function ajoute(s, q = 1, prenom = "", detail = "", n = "") {
    const l = lire();
    const meme = l.find(x => x.s === s && x.prenom === prenom && x.detail === detail);
    if (meme) meme.q = Math.min(20, meme.q + q); else l.push({ s, q, prenom, detail, n });
    ecrire(l);
  }
  document.addEventListener("DOMContentLoaded", majCompte);
  addEventListener("pageshow", majCompte);
  return { lire, ecrire, piece, nombre, total, ajoute, majCompte };
})();

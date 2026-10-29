// Libecciu, version Next.js : toute la page est un arbre React ; Next la précalcule en HTML puis la « réhydrate » dans le navigateur.
import Drapeaux from "../commun/Drapeaux"
import Entete from "../commun/Entete"
import Tableau from "../commun/Tableau"
import Flotte from "../commun/Flotte"
import Chiffres from "../commun/Chiffres"
import Reserver from "../commun/Reserver"
import Dock from "../commun/Dock"
import { DUREES, eur, FLOTTE } from "../commun/donnees"

const FORMULES: [string, number, string, string][] = [["Coucher de soleil", 120, "Bateau sans permis, les deux heures avant la nuit, glacière offerte.", "var(--red)"], ["Journée aux Sanguinaires", 390, "Semi-rigide à la journée, carte des mouillages et conseils du matin.", "var(--blue)"], ["Baptême de jet-ski", 90, "Trente minutes derrière le moniteur, sans permis.", "var(--yellow)"]]
const JOURNEE: string[][] = [["8 h 30", "Vérification de la flotte, pleins faits", ""], ["9 h", "Premiers départs, mer la plus calme", "var(--white)"], ["11 h", "Les kayaks arrivent à la crique aux pins", "var(--white)"], ["14 h", "Le vent se lève, on reste dans la baie si besoin", "var(--red)"], ["17 h 30", "Départ « coucher de soleil » en bateau", "var(--white)"], ["19 h", "Derniers retours, rinçage, on range", ""]]
const CRIQUES: string[][] = [["25", "La crique aux pins", "Une plage de galets à l'ombre des pins, à portée de pagaie. L'eau y est la plus claire le matin.", "En kayak · 5 min en bateau"], ["50", "La Parata", "Le promontoire de granit et sa tour génoise. On mouille au pied, on monte à pied en dix minutes.", "En kayak · 12 min en bateau"], ["30", "Les Sanguinaires", "Quatre îles rouges au bout du golfe, et le phare. On y va en semi-rigide, au calme du matin.", "En semi-rigide"]]
const QUESTIONS: string[][] = [["Faut-il un permis ?", "Non pour les kayaks, les paddles, le bateau de 6 chevaux et le jet-ski accompagné. Oui pour le semi-rigide et le jet-ski seul : apportez votre permis côtier."], ["À partir de quel âge ?", "Kayak deux places dès 6 ans avec un adulte, kayak seul et paddle dès 12 ans, jet-ski accompagné dès 16 ans pour conduire."], ["Et si la météo tourne ?", "Par drapeau rouge, la sortie est remboursée ou déplacée, au choix. Par drapeau orange, on reste dans la baie."], ["Que faut-il apporter ?", "Maillot, crème solaire, chapeau et une pièce d'identité pour la caution. Les gilets et le bidon étanche sont fournis."]]

export default function Page() {
  return (<>

<div className="demo">Comparatif du labo : version Next.js + React · <a href="/labo/06-comparatif/">voir le comparatif</a></div>

<header className="bar">
  <a className="mark" href="#" aria-label="Libecciu, haut de page"><svg viewBox="0 0 30 30" aria-hidden="true"><rect width="15" height="15" fill="#F5C518"/><rect x="15" width="15" height="15" fill="#0E1A26"/><rect y="15" width="15" height="15" fill="#0E1A26"/><rect x="15" y="15" width="15" height="15" fill="#F5C518"/></svg>Libecciu</a>
  <nav aria-label="Navigation"><a href="#departs">Départs</a><a href="#flotte">La flotte</a><a href="#prix">Les prix</a><a href="#criques">Les criques</a></nav>
  <a className="go" href="#reserver">Réserver</a>
</header>

<main>
<section className="hero" aria-label="Libecciu">
  <img src="/images/libecciu/golfe.webp" alt="Le golfe vu des hauteurs, bateaux au mouillage dans une crique d'eau turquoise" width="1280" height="800" fetchPriority="high" />
  <div className="wrap grid">
    <div className="card">
      <Drapeaux />
      <h1>Kayaks, bateaux et <span style={{ whiteSpace: "nowrap" }}>jet-skis.</span></h1>
      <p className="say">Location à l'heure ou à la journée dans le golfe d'Ajaccio. Gilets, bidon étanche et carte des criques compris.</p>
      <div className="acts"><a className="arrow" href="#departs">Voir les prochains départs</a><a className="arrow" href="#prix">Les prix</a></div>
      <div className="where"><span>Plage du golfe, route des Sanguinaires</span><span>Avril à octobre, 9 h à 19 h</span></div>
    </div>
  </div>
</section>

<section className="dark" id="departs"><div className="wrap">
  <Entete n="01" titre="Prochains départs" texte="Les embarcations encore libres aujourd'hui. Touchez « Réserver » : on garde la place et on vous rappelle dans l'heure." />
  <Tableau />
</div></section>

<section className="paper" id="flotte"><div className="wrap">
  <Entete n="02" titre="La flotte" texte="Sept embarcations, de la pagaie aux 115 chevaux. Toutes vérifiées chaque matin avant le premier départ." />
  <Flotte />
</div></section>

<section className="dark"><div className="wrap">
  <Entete n="03" titre="Le ponton en quatre chiffres" />
  <Chiffres />
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img className="wide" src="/images/libecciu/bateau.webp" alt="Une barque bleue tirée sur le sable, au bord de l'eau" width="1000" height="1500" loading="lazy" />
</div></section>

<section className="paper" id="prix"><div className="wrap">
  <Entete n="04" titre="Les prix" texte="Par embarcation, pas par personne. Caution par empreinte de carte, rendue au retour." />
  <div className="tw"><table className="prices">
    <thead><tr><th>Embarcation</th>{DUREES.map(([, l]) => <th key={l}>{l}</th>)}</tr></thead>
    <tbody>{FLOTTE.map(f => <tr key={f.k}><td><b>{f.nom}</b><small>{f.detail}</small></td>{DUREES.map(([h]) => f.prix[h] ? <td key={h} className="p">{eur(f.prix[h])}</td> : <td key={h} className="no">–</td>)}</tr>)}</tbody>
  </table></div>
  <div className="grid formulas">{FORMULES.map(([n, p, d, c]) => <div key={n} className="fo" style={{ "--c": c } as React.CSSProperties}><h3>{n}</h3><span className="pr num">{p} €</span><p>{d}</p></div>)}</div>
  <p className="fineprint">Prix de démonstration.</p>
</div></section>

<section className="dark"><div className="wrap">
  <Entete n="05" titre="Une journée au ponton" texte="Le matin pour le calme et l'eau claire, la fin d'après-midi pour la lumière." />
  <ol className="day">{JOURNEE.map(([h, t, c]) => <li key={h} style={c ? { "--c": c } as React.CSSProperties : undefined}><b className="num">{h}</b><span>{t}</span></li>)}</ol>
</div></section>

<section className="paper" id="criques"><div className="wrap">
  <Entete n="06" titre="Trois criques depuis le ponton" />
  <div className="grid coves">{CRIQUES.map(([m, n, t, h]) => <div key={n} className="c"><div className="min num">{m}<small>min</small></div><h3>{n}</h3><p>{t}</p><p className="how">{h}</p></div>)}</div>
</div></section>

<section className="paper" style={{ paddingTop: 0 }}><div className="wrap">
  <Entete n="07" titre="Avant de partir" />
  <div className="grid qa">{QUESTIONS.map(([q, r]) => <div key={q} className="q"><h3>{q}</h3><p>{r}</p></div>)}</div>
</div></section>

<section className="paper" id="reserver" style={{ paddingTop: 0 }}><div className="wrap">
  <Entete n="08" titre="Réserver" texte="Choisissez l'embarcation, le jour et l'heure. On vous rappelle dans l'heure pour confirmer." />
  <Reserver />
</div></section>
</main>

<footer>
  <div className="wrap">
    <div className="grid"><p className="last">La mer est plus calme le matin. Le ponton ouvre à 9 h.</p><div className="cta"><a className="arrow" href="#departs">Voir les départs du jour</a></div></div>
    <div className="grid infos">
      <div><h3>Le ponton</h3><p>Plage du golfe, route des Sanguinaires, Ajaccio. Parking à deux minutes à pied.</p></div>
      <div><h3>La saison</h3><p>D'avril à octobre, tous les jours de 9 h à 19 h.</p></div>
      <div><h3>Nous joindre</h3><p><a href="tel:+33400000000">04 00 00 00 00</a><br />ponton@libecciu.fr</p></div>
    </div>
    <div className="legal"><span>Loueur fictif, site réalisé par <a href="/accueil.html">Saitora</a></span><span>Photos : Pixabay</span></div>
  </div>
</footer>
<Dock />

  </>)
}

// Le nom écrit en pavillons du code international : L I B E C C I U (rendu une fois, sans JavaScript côté navigateur).
const Y = "#F5C518", K = "#0E1A26", R = "#D52B2B", B = "#1F4FA8", W = "#fff"
const PAVILLON: Record<string, React.ReactNode> = {
  L: <><rect width="30" height="20" fill={Y} /><rect x="15" width="15" height="10" fill={K} /><rect y="10" width="15" height="10" fill={K} /></>,
  I: <><rect width="30" height="20" fill={Y} /><circle cx="15" cy="10" r="5.5" fill={K} /></>,
  B: <path d="M0 0H30L22 10L30 20H0Z" fill={R} />,
  E: <><rect width="30" height="10" fill={B} /><rect y="10" width="30" height="10" fill={R} /></>,
  C: <><rect width="30" height="20" fill={B} /><rect y="4" width="30" height="12" fill={W} /><rect y="8" width="30" height="4" fill={R} /></>,
  U: <><rect width="30" height="20" fill={W} /><rect width="15" height="10" fill={R} /><rect x="15" y="10" width="15" height="10" fill={R} /></>,
}
export default function Drapeaux() {
  return <div className="flags" role="img" aria-label="Le mot Libecciu écrit en pavillons du code maritime">
    {[..."LIBECCIU"].map((l, i) => <svg key={i} viewBox="0 0 30 20" aria-hidden="true">{PAVILLON[l]}</svg>)}
  </div>
}

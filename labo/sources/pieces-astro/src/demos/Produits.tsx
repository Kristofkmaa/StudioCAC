"use client"
// React Bits · TiltedCard — Épicerie : les produits penchent sous la souris, et avec le téléphone (gyroscope).
import TiltedCard from "../communaute/react-bits/TiltedCard"

const P = [["zia-rosa/tomme-coupe", "Tomme de brebis", "32 € le kilo"], ["zia-rosa/jambons", "Prisuttu", "45 € le kilo"], ["castagnetu/farine", "Farine de châtaigne", "9 € le kilo"]]
export default function Produits() {
  return (
    <div className="produits">
      {P.map(([img, nom, prix]) => (
        <TiltedCard key={nom} imageSrc={`/images/${img}.webp`} altText={nom} containerHeight="260px" containerWidth="100%" imageHeight="260px" imageWidth="100%"
          rotateAmplitude={12} scaleOnHover={1.05} showTooltip={false} radius={6} displayOverlayContent
          overlayContent={<p className="etiquette-produit"><b>{nom}</b><span>{prix}</span></p>} />
      ))}
    </div>
  )
}

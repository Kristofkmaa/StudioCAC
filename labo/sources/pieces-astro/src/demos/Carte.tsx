"use client"
// Motion Primitives · MorphingDialog — Restaurant : la carte du plat s'agrandit en fiche détaillée.
import { MorphingDialog, MorphingDialogClose, MorphingDialogContainer, MorphingDialogContent, MorphingDialogDescription, MorphingDialogImage, MorphingDialogSubtitle, MorphingDialogTitle, MorphingDialogTrigger } from "../communaute/motion-primitives/morphing-dialog"

const PLATS = [["port/plat-daurade", "Daurade grillée", "24 €", "Pêchée le matin dans le golfe, grillée entière au feu de bois, fenouil et citron confit."], ["port/plat-pastilla", "Pastilla de la mer", "19 €", "Feuilles croustillantes, poissons de roche et amandes, une pointe de cannelle."]]
export default function Carte() {
  return (
    <div className="plats">
      {PLATS.map(([img, nom, prix, texte]) => (
        <MorphingDialog key={nom} transition={{ type: "spring", bounce: 0.05, duration: 0.3 }}>
          <MorphingDialogTrigger style={{ borderRadius: "8px" }} className="flex w-full flex-col overflow-hidden border border-white/15 bg-[#1C1517] text-left">
            <MorphingDialogImage src={`/images/${img}.webp`} alt={nom} className="h-44 w-full object-cover" />
            <div className="flex items-baseline justify-between gap-3 px-4 py-3"><MorphingDialogTitle className="font-medium">{nom}</MorphingDialogTitle><MorphingDialogSubtitle className="text-[#C9A55A]">{prix}</MorphingDialogSubtitle></div>
          </MorphingDialogTrigger>
          <MorphingDialogContainer>
            <MorphingDialogContent style={{ borderRadius: "14px" }} className="pointer-events-auto relative flex w-[min(92vw,520px)] flex-col overflow-hidden bg-[#1C1517] text-[#F5E6E1]">
              <MorphingDialogImage src={`/images/${img}.webp`} alt={nom} className="h-64 w-full object-cover" />
              <div className="p-6">
                <MorphingDialogTitle className="text-2xl">{nom}</MorphingDialogTitle>
                <MorphingDialogSubtitle className="text-[#C9A55A]">{prix}</MorphingDialogSubtitle>
                <MorphingDialogDescription disableLayoutAnimation variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 16 } }}>
                  <p className="mt-3 text-[#D8C9C4]">{texte}</p>
                </MorphingDialogDescription>
              </div>
              <MorphingDialogClose className="text-white" />
            </MorphingDialogContent>
          </MorphingDialogContainer>
        </MorphingDialog>
      ))}
    </div>
  )
}

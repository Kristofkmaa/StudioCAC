"use client"
// Motion Primitives · ImageComparison — Artisan, coiffeur, photographe : l'avant / après qu'on fait glisser.
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "../communaute/motion-primitives/image-comparison"

export default function AvantApres() {
  return (
    <ImageComparison className="aspect-[3/2] w-full select-none overflow-hidden rounded-md">
      <ImageComparisonImage src="/images/guide-photo/lumiere-oui.webp" alt="Après : la même devanture en plein jour" position="left" />
      <ImageComparisonImage src="/images/guide-photo/lumiere-non.webp" alt="Avant : la devanture le soir, au flash" position="right" />
      <ImageComparisonSlider className="w-0.5 bg-white">
        <div className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-semibold text-black shadow">⇆</div>
      </ImageComparisonSlider>
      <span className="etiq gauche">Avant</span><span className="etiq droite">Après</span>
    </ImageComparison>
  )
}

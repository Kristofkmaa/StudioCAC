"use client"
// 02 La flotte : l'accordéon de shadcn/ui (Radix), habillé aux couleurs de Libecciu ; la photo glisse à l'ouverture (Motion).
import { motion } from "motion/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { DUREES, eur, FLOTTE, prixMin } from "./donnees"

export default function Flotte({ base = "" }: { base?: string }) {
  return (
    <Accordion type="single" collapsible defaultValue="kayak1" className="fleet">
      {FLOTTE.map((b, i) => (
        <AccordionItem key={b.k} value={b.k} className="border-b border-[var(--line)] last:border-b">
          <AccordionTrigger className="fleet-sum group items-baseline gap-x-[clamp(12px,2vw,28px)] gap-y-0 rounded-none py-[22px] text-base font-normal hover:no-underline focus-visible:ring-0 [&>svg]:hidden">
            <span className="i num">{String(i + 1).padStart(2, "0")}</span>
            <span className="nm">{b.nom}</span>
            <span className="from">{b.detail} · dès {eur(prixMin(b.prix))}</span>
            <span className="pm" aria-hidden="true" />
          </AccordionTrigger>
          <AccordionContent className="pb-0 text-base">
            <div className="in">
              <motion.img src={`${base}/images/libecciu/${b.photo}.webp`} alt="" width={1000} height={1500} loading="lazy"
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .5, ease: [.23, 1, .32, 1] }} />
              <div className="txt">
                <p>{b.texte}</p>
                <ul>{DUREES.filter(([h]) => b.prix[h]).map(([h, l]) => <li key={h}><span>{l}</span><b className="num">{eur(b.prix[h])}</b></li>)}</ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

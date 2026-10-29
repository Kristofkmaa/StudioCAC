"use client"
// React Bits · ClickSpark — Restaurant : des étincelles au toucher du bouton.
import ClickSpark from "../communaute/react-bits/ClickSpark"

export default function Etincelles() {
  return (
    <ClickSpark sparkColor={["#C9A55A", "#F5E6E1"]} sparkCount={10} sparkRadius={28} duration={450}>
      <div className="restau">
        <p>Ce soir, il reste <b>4 tables</b> en terrasse.</p>
        <button type="button" className="btn-or">Réserver une table</button>
      </div>
    </ClickSpark>
  )
}

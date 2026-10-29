// Remplace le bouton de shadcn/ui que le composant Confetti importe : un simple <button>.
import { forwardRef, type ComponentPropsWithoutRef } from "react"
export const Button = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>((props, ref) => <button ref={ref} {...props} />)
Button.displayName = "Button"

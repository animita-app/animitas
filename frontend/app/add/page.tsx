import { Metadata } from "next"
import { AddForm } from "@/components/forms/add-form"

export const metadata: Metadata = {
  title: "Añadir animita",
  description: "Sube una foto, márcala en el mapa y cuenta a quién recuerda.",
}

export default function AddPage() {
  return (
    // The whole page scrolls, with room around the form; Publicar stays at the bottom of the screen.
    <div className="mx-auto min-h-svh w-full max-w-xl md:max-w-4xl">
      <AddForm />
    </div>
  )
}

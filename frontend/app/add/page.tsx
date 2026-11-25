import { Metadata } from "next"
import { AddForm } from "@/components/forms/add-form"

export const metadata: Metadata = {
  title: "Añadir animita",
  description: "Sube una foto, márcala en el mapa y cuenta a quién recuerda.",
}

export default function AddPage() {
  return (
    <div className="flex h-svh w-full justify-center md:items-center md:p-6">
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden md:h-4/5">
        <AddForm />
      </div>
    </div>
  )
}

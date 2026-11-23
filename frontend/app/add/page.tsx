import { Metadata } from "next"
import { AddForm } from "@/components/forms/add-form"

export const metadata: Metadata = {
  title: "Agregar animita",
  description: "Sube una foto, márcala en el mapa y cuenta a quién recuerda.",
}

export default function AddPage() {
  return (
    <div className="flex h-svh w-full justify-center bg-background-weak md:items-center md:p-6">
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-background md:h-4/5 md:rounded-xl md:border md:border-border-weak md:shadow-sm">
        <AddForm />
      </div>
    </div>
  )
}

import { Metadata } from "next"
import { AddForm } from "@/components/forms/add-form"

export const metadata: Metadata = {
  title: "Crea una entrada",
  description: "Registra un nuevo lugar de memoria y comparte su historia",
}

export default function AddPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background-weak p-6">
      <div className="w-full max-w-lg h-[60vh] bg-background rounded-xl shadow-sm overflow-hidden flex flex-col border border-border-weak">
        <AddForm />
      </div>
    </div>
  )
}

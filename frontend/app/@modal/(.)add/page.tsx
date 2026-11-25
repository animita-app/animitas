"use client"

import { useRouter } from "next/navigation"
import { AddForm } from "@/components/forms/add-form"
import { ModalWrapper } from "@/components/modal/modal-wrapper"

export default function AddModal() {
  const router = useRouter()
  return (
    <ModalWrapper
      title="Añadir animita"
      description="Sube una foto, márcala en el mapa y cuenta a quién recuerda"
      showTitle={false}
      showCloseButton={false}
      className="p-0 gap-0 sm:!max-w-lg h-4/5 flex flex-col overflow-hidden"
    >
      <AddForm onCancel={() => router.back()} />
    </ModalWrapper>
  )
}

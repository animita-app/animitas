"use client"

import { useRouter } from "next/navigation"
import { AddForm } from "@/components/forms/add-form"
import { ModalWrapper } from "@/components/modal/modal-wrapper"

export default function AddModal() {
  const router = useRouter()
  return (
    <ModalWrapper
      title="Crea una entrada"
      description="Registra una animita en el mapa"
      showTitle={false}
      className="p-0 gap-0 !w-full md:!max-w-lg h-[60vh] flex flex-col overflow-hidden"
    >
      <AddForm onCancel={() => router.back()} />
    </ModalWrapper>
  )
}

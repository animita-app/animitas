"use client"

import { AddForm } from "@/components/forms/add-form"
import { ModalWrapper } from "@/components/modal/modal-wrapper"

export default function AddModal() {
  return (
    <ModalWrapper title="Registrar animita" description="Añade una animita al mapa" showTitle={false}>
      <AddForm />
    </ModalWrapper>
  )
}

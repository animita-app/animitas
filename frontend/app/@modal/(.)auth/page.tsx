"use client"

import { ModalWrapper } from '@/components/modal/modal-wrapper'
import { LoginForm } from '@/components/forms/login-form'

export default function LoginModal() {
  const handleSuccess = () => {
    window.location.reload()
  }

  return (
    <ModalWrapper title="Inicia sesión" description="Entra para agregar animitas, prender velas y comentar" showTitle={false}>
      <div className="px-6 pb-8 sm:p-0">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </ModalWrapper>
  )
}

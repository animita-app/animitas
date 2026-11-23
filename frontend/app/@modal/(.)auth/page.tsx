"use client"

import { ModalWrapper } from '@/components/modal/modal-wrapper'
import { LoginForm } from '@/components/forms/login-form'
import { useRouter } from 'next/navigation'

export default function LoginModal() {
  const router = useRouter()

  const handleSuccess = () => {
    window.location.reload()
  }

  return (
    <ModalWrapper title="Inicia sesión" description="Entra para agregar animitas, prender velas y comentar" showTitle={false}>
      <LoginForm onSuccess={handleSuccess} />
    </ModalWrapper>
  )
}

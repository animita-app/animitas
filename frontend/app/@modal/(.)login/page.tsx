"use client"

import { ModalWrapper } from '@/components/modal/modal-wrapper'
import { LoginForm } from '@/components/auth/login-form'
import { useRouter } from 'next/navigation'

export default function LoginModal() {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
    router.back()
  }

  return (
    <ModalWrapper title="Inicia sesión" description="Accede a tu cuenta en ÁNIMA" showTitle={false}>
      <LoginForm onSuccess={handleSuccess} />
    </ModalWrapper>
  )
}

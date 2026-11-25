import { LoginForm } from "@/components/forms/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <h1 className="sr-only">Inicia sesión en [ÁNIMA]</h1>
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}

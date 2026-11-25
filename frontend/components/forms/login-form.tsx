"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearAuthCookies } from "@/lib/auth-utils"
import { StepLayout } from "@/components/forms/atoms/step-layout"
import { uploadAvatar } from "@/lib/photos"

interface LoginFormProps {
  onSuccess?: () => void
}


type Step = 'login' | 'otp' | 'name' | 'username' | 'avatar'
const ONBOARDING_STEPS: Step[] = ['name', 'username', 'avatar']

export function LoginForm({ onSuccess }: LoginFormProps) {
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const onboardingStep = searchParams.get('step') as Step | null
  const [step, setStep] = useState<Step>(isOnboarding ? (onboardingStep || 'name') : 'login')
  const [email, setEmail] = useState("")
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const loading = loadingAction !== null
  const onboardingIndex = ONBOARDING_STEPS.indexOf(step)

  useEffect(() => {
    const savedStep = localStorage.getItem('onboarding_step') as Step | null
    if (savedStep && ONBOARDING_STEPS.includes(savedStep)) setStep(savedStep)
  }, [])

  const saveOnboardingStep = (stepName: Step) => {
    if (ONBOARDING_STEPS.includes(stepName)) localStorage.setItem('onboarding_step', stepName)
  }

  const finishAuth = () => {
    localStorage.removeItem('onboarding_step')
    if (onSuccess) {
      onSuccess()
    } else {
      setTimeout(() => window.location.href = '/', 300)
    }
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setLoadingAction('name')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      const { error: saveError } = await supabase.from('user_profiles').upsert({ id: user.id, display_name: fullName.trim() })
      if (saveError) throw saveError
      saveOnboardingStep('username')
      setStep('username')
    } catch (error: any) {
      toast.error(error.message || "Error al guardar nombre")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoadingAction('username')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      const normalizedUsername = username.trim().toLowerCase()
      const { error: saveError } = await supabase.from('user_profiles').upsert({ id: user.id, username: normalizedUsername })
      if (saveError) throw saveError
      saveOnboardingStep('avatar')
      setStep('avatar')
    } catch (error: any) {
      if (error.code === '23505') { toast.error("Ese nombre de usuario ya está en uso"); return }
      toast.error(error.message || "Error al guardar usuario")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) return
    setLoadingAction('avatar')
    const timeoutId = setTimeout(() => { toast.error("La foto está tardando demasiado en subir"); setLoadingAction(null) }, 15000)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      const publicUrl = await uploadAvatar(supabase, user.id, avatarFile)
      const { error: saveError } = await supabase.from('user_profiles').upsert({ id: user.id, image: publicUrl })
      if (saveError) throw saveError
      clearTimeout(timeoutId)
      finishAuth()
    } catch (error: any) {
      clearTimeout(timeoutId)
      toast.error(error.message || "Error al subir la foto")
      setLoadingAction(null)
    }
  }

  const handleGoogleLogin = async () => {
    clearAuthCookies()
    setLoadingAction('google')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (error: any) {
      toast.error(error.message || "Error al conectar con Google")
      setLoadingAction(null)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    clearAuthCookies()
    setLoadingAction('email')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setStep('otp')
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el código")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otpCode.length !== 6) return
    clearAuthCookies()
    setLoadingAction('otp')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otpCode }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Verification failed')
      saveOnboardingStep('name')
      setStep('name')
    } catch (error: any) {
      toast.error(error.name === 'AbortError' ? 'Request timed out' : error.message || "Código inválido o expirado")
    } finally {
      setLoadingAction(null)
    }
  }

  if (step === 'avatar') {
    return (
      <StepLayout
        title="Añade una foto de perfil"
        cutout="tu foto"
        description="Así es un poco más humano."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-slide-in-right"
        actions={<>
          <Button type="button" variant="sign" size="lg" className="-rotate-1" disabled={loading || !avatarFile} onClick={handleSaveAvatar}>
            {loadingAction === 'avatar' && <Spinner />}
            {loadingAction === 'avatar' ? "Subiendo…" : "Continuar"}
          </Button>
          <Button variant="link" className="h-auto p-0 text-text-weak" onClick={() => finishAuth()}>
            Omitir por ahora
          </Button>
        </>}
      >
        <div className="flex justify-center">
          <label className="group relative cursor-pointer rounded-xs focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="sr-only">Elegir foto</span>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setAvatarFile(file)
              setAvatarPreview(URL.createObjectURL(file))
            }} className="sr-only" />
            <div className="photo-vignette flex size-28 rotate-2 items-center justify-center print-frame p-2 pb-6 transition-[rotate] duration-200 group-hover:rotate-0 motion-reduce:transition-none">
              {avatarPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarPreview} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-background-weaker text-text-weaker">
                  <Camera aria-hidden />
                </div>
              )}
            </div>
          </label>
        </div>
      </StepLayout>
    )
  }

  if (step === 'username') {
    return (
      <StepLayout
        title="Elige tu nombre de usuario"
        cutout="tu usuario"
        description="Para que tus amigos te puedan encontrar."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-slide-in-right"
        actions={
          <Button type="submit" form="username-form" variant="sign" size="lg" className="-rotate-1" disabled={loading || !username.trim()}>
            {loadingAction === 'username' && <Spinner />}
            {loadingAction === 'username' ? "Guardando…" : "Continuar"}
          </Button>
        }
      >
        <form id="username-form" onSubmit={handleSaveUsername}>
          <Label htmlFor="username" className="sr-only">Nombre de usuario</Label>
          <Input
            id="username"
            placeholder="tu_usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            required
            autoFocus
            variant="paper" className="rotate-[0.5deg]"
          />
        </form>
      </StepLayout>
    )
  }

  if (step === 'name') {
    return (
      <StepLayout
        title="¿Cuál es tu nombre?"
        cutout="tu nombre"
        description="Sí, el nombre que te pusieron tus papás."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-fade-in"
        actions={
          <Button type="submit" form="name-form" variant="sign" size="lg" className="rotate-1" disabled={loading || !fullName.trim()}>
            {loadingAction === 'name' && <Spinner />}
            {loadingAction === 'name' ? "Guardando…" : "Continuar"}
          </Button>
        }
      >
        <form id="name-form" onSubmit={handleSaveName}>
          <Label htmlFor="fullName" className="sr-only">Nombre completo</Label>
          <Input id="fullName" placeholder="Tu nombre" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus variant="paper" className="-rotate-[0.5deg]" />
        </form>
      </StepLayout>
    )
  }

  if (step === 'otp') {
    return (
      <StepLayout
        title="Revisa tu correo"
        cutout="revisa tu correo"
        description={<>Escribe el código que llegó a <span className="font-medium text-text-strong">{email}</span></>}
        actions={
          <Button type="submit" form="otp-form" variant="sign" size="lg" className="-rotate-1" disabled={loading || otpCode.length !== 6}>
            {loadingAction === 'otp' && <Spinner />}
            {loadingAction === 'otp' ? "Verificando…" : "Verificar"}
          </Button>
        }
      >
        <form id="otp-form" onSubmit={handleVerifyOtp}>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} aria-label="Código">
              <InputOTPGroup className="gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={cn(
                      "paper-note paper-line size-12 rounded-none border-0 text-xl shadow-none first:rounded-none last:rounded-none",
                      i % 2 ? "rotate-1" : "-rotate-1"
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </form>
      </StepLayout>
    )
  }

  return (
    <StepLayout
      title="Inicia sesión en [ÁNIMA]"
      cutout="inicia sesión"
      description="Para añadir animitas, prender velas y dejar recuerdos."
      actions={
        <Button type="submit" form="login-form" variant="sign" size="lg" className="rotate-1" disabled={loading}>
          {loadingAction === 'email' && <Spinner />}
          {loadingAction === 'email' ? "Enviando…" : "Continuar"}
        </Button>
      }
    >
      <Button type="button" variant="sign-service" size="lg" className="-rotate-1 self-center" onClick={handleGoogleLogin} disabled={loading}>
        {loadingAction === 'google' ? <Spinner /> : (
          <svg aria-hidden viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continuar con Google
      </Button>

      <form id="login-form" onSubmit={handleEmailSubmit} className="pt-2">
        <Label htmlFor="email" className="sr-only">Correo electrónico</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="o tu correo" value={email} onChange={(e) => setEmail(e.target.value)} required variant="paper" className="rotate-[0.4deg]" />
      </form>
    </StepLayout>
  )
}

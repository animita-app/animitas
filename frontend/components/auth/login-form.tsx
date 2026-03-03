"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { Camera } from "lucide-react"
import { clearAuthCookies } from "@/lib/auth-utils"

// ─── Layout ──────────────────────────────────────────────────

interface StepLayoutProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  actions: React.ReactNode
  stepIndex?: number
  totalSteps?: number
  className?: string
}

function StepLayout({ title, description, children, actions, stepIndex, totalSteps, className }: StepLayoutProps) {
  const showStepper = stepIndex !== undefined && totalSteps !== undefined

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-0.5 text-center pb-1.5">
        <h2 className="text-xl font-medium tracking-tight text-text-strong">{title}</h2>
        {description && <p className="text-sm text-text-weak">{description}</p>}
      </div>

      {children}

      <div className="flex flex-col gap-3 pt-2">{actions}</div>

      {showStepper && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIndex
                  ? "w-6 bg-accent"
                  : i < stepIndex
                    ? "w-3 bg-accent/25"
                    : "w-3 bg-background-weaker"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Form ────────────────────────────────────────────────────

interface LoginFormProps {
  onSuccess?: () => void
}

type Step = 'login' | 'otp' | 'name' | 'username' | 'avatar'

const ONBOARDING_STEPS: Step[] = ['name', 'username', 'avatar']

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
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
    if (savedStep && ONBOARDING_STEPS.includes(savedStep)) {
      setStep(savedStep)
    }
  }, [])

  // ─── Handlers ──────────────────────────────────────────────

  const saveOnboardingStep = (stepName: Step) => {
    if (ONBOARDING_STEPS.includes(stepName)) {
      localStorage.setItem('onboarding_step', stepName)
    }
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
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      await supabase.from('user_profiles').upsert({ id: user.id, display_name: fullName.trim() })

      saveOnboardingStep('username')
      setStep('username')
    } catch (error: any) {
      console.error('[Auth] Save name error:', error)
      toast.error(error.message || "Error al guardar nombre")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoadingAction('username')
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const normalizedUsername = username.trim().toLowerCase()

      await supabase.from('user_profiles').upsert({ id: user.id, username: normalizedUsername })

      saveOnboardingStep('avatar')
      setStep('avatar')
    } catch (error: any) {
      console.error('[Auth] Save username error:', error)
      if (error.code === '23505') {
        toast.error("Ese nombre de usuario ya está en uso")
        return
      }
      toast.error(error.message || "Error al guardar usuario")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) return
    setLoadingAction('avatar')
    const supabase = createClient()

    const timeoutId = setTimeout(() => {
      toast.error("Upload taking too long, please try again")
      setLoadingAction(null)
    }, 15000)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      await supabase.from('user_profiles').upsert({ id: user.id, image: publicUrl })

      clearTimeout(timeoutId)
      finishAuth()
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('[Auth] Save avatar error:', error)
      toast.error(error.message || "Error al subir la foto")
      setLoadingAction(null)
    }
  }

  const handleGoogleLogin = async () => {
    clearAuthCookies()
    const supabase = createClient()
    setLoadingAction('google')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (error: any) {
      console.warn('[Auth] Google login error:', error.message)
      toast.error(error.message || "Error al conectar con Google")
      setLoadingAction(null)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    clearAuthCookies()
    setLoadingAction('email')
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setStep('otp')

    } catch (error: any) {
      console.warn('[Auth] Email OTP error:', error.message)
      toast.error(error.message || "Error al enviar el código")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otpCode.length !== 6) return

    clearAuthCookies()
    console.log('[Auth Debug] Verifying OTP...', { email, codeLength: otpCode.length })
    setLoadingAction('otp')
    const supabase = createClient()

    try {
      console.log('[Auth Debug] Calling API verify-otp...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      let result
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token: otpCode }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        result = await res.json()

        if (!res.ok) {
          throw new Error(result.error || 'Verification failed')
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Try clearing cache and try again.')
        }
        throw fetchError
      }

      console.log('[Auth Debug] verifyOtp success, starting onboarding...')
      saveOnboardingStep('name')
      setStep('name')
      setLoadingAction(null)
    } catch (error: any) {
      console.error('[Auth Debug] Caught error:', error.message || error)
      toast.error(error.message || "Código inválido o expirado")
      setLoadingAction(null)
    }
  }



  // ─── Onboarding Steps ─────────────────────────────────────

  if (step === 'avatar') {
    return (
      <StepLayout
        title="Añade una foto de perfil"
        description="Así es un poco más humano."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-slide-in-right"
        actions={<>
          <Button className="w-full" disabled={loading || !avatarFile} onClick={handleSaveAvatar}>
            {loadingAction === 'avatar' ? <Spinner /> : "Continuar"}
          </Button>
          <Button variant="ghost" className="w-full text-text-weak" onClick={() => finishAuth()}>
            Omitir por ahora
          </Button>
        </>}
      >
        <div className="flex justify-center pt-2">
          <label className="relative cursor-pointer group">
            <input type="file" accept="image/*" onChange={handleAvatarSelect} className="sr-only" />
            {avatarPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent ring-offset-2 ring-offset-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-background-weaker flex items-center justify-center group-hover:bg-background-weak transition-colors">
                <p className="text-text-weaker/70 font-ibm-plex-mono text-4xl">Á</p>
              </div>
            )}
          </label>
        </div>
      </StepLayout>
    )
  }

  if (step === 'username') {
    return (
      <StepLayout
        title="Elige tu nombre de usuario"
        description="Para que tus amigos te puedan encontrar."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-slide-in-right"
        actions={
          <Button type="submit" form="username-form" className="w-full" disabled={loading || !username.trim()}>
            {loadingAction === 'username' ? <Spinner /> : "Continuar"}
          </Button>
        }
      >
        <form id="username-form" onSubmit={handleSaveUsername}>
          <Label htmlFor="username" className="sr-only">Nombre de usuario</Label>
          <Input
            id="username"
            type="text"
            placeholder="tu_usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            required
            autoFocus
          />
        </form>
      </StepLayout>
    )
  }

  if (step === 'name') {
    return (
      <StepLayout
        title="¿Cuál es tu nombre?"
        description="Sí, el nombre que te pusieron tus papás."
        stepIndex={onboardingIndex}
        totalSteps={3}
        className="animate-fade-in"
        actions={
          <Button type="submit" form="name-form" className="w-full" disabled={loading || !fullName.trim()}>
            {loadingAction === 'name' ? <Spinner /> : "Continuar"}
          </Button>
        }
      >
        <form id="name-form" onSubmit={handleSaveName}>
          <Label htmlFor="fullName" className="sr-only">Nombre completo</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />
        </form>
      </StepLayout>
    )
  }

  // ─── OTP Step ──────────────────────────────────────────────

  if (step === 'otp') {
    return (
      <StepLayout
        title="Revisa tu correo"
        description={<>Ingresa el código de 6 dígitos enviado a{" "}<span className="font-medium text-text-strong">{email}</span></>}
        actions={
          <Button type="submit" form="otp-form" className="w-full" disabled={loading || otpCode.length !== 6}>
            {loadingAction === 'otp' ? <Spinner /> : "Verificar"}
          </Button>
        }
      >
        <form id="otp-form" onSubmit={handleVerifyOtp}>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={(val) => setOtpCode(val)}>
              <InputOTPGroup className="w-full *:w-12 *:h-12">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </form>
      </StepLayout>
    )
  }

  // ─── Login (default) ───────────────────────────────────────

  return (
    <StepLayout
      title={<>Bienvenido a <span className="font-ibm-plex-mono text-accent ml-px">[ÁNIMA]</span></>}
      actions={
        <Button type="submit" form="login-form" className="w-full" disabled={loading}>
          {loadingAction === 'email' ? <Spinner /> : "Continuar"}
        </Button>
      }
    >
      <Button variant="outline" className="w-full bg-background text-text-strong flex items-center justify-center gap-2" onClick={handleGoogleLogin} disabled={loading}>
        {loadingAction === 'google' ? <Spinner /> : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border-weak" />
        </div>
        <div className="relative flex justify-center text-sm select-none">
          <span className="bg-background px-2 text-text-weaker">o también</span>
        </div>
      </div>

      <form id="login-form" onSubmit={handleEmailSubmit}>
        <Label htmlFor="email" className="sr-only">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </form>
    </StepLayout>
  )
}

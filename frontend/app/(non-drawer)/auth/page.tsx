'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { AUTH_COPY } from '@/lib/auth-copy'
import { cn, getErrorMessage } from '@/lib/utils'
import { showError, showSuccess } from '@/lib/notifications'
import { apiPost } from '@/lib/api'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type Step = 'phone' | 'code' | 'name' | 'username'

const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, AUTH_COPY.phone.error.minDigits)
    .max(9, AUTH_COPY.phone.error.maxDigits)
    .regex(/^\d+$/, AUTH_COPY.phone.error.invalidFormat),
})

const codeSchema = z.object({
  code: z
    .string()
    .length(6, AUTH_COPY.code.error.length)
    .regex(/^\d+$/, AUTH_COPY.code.error.invalidFormat),
})

const nameSchema = z.object({
  displayName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
})

const usernameSchema = z.object({
  username: z.string().optional().refine((val) => !val || (val.length >= 3 && /^[a-zA-Z0-9_]+$/.test(val)), {
    message: 'El usuario debe tener al menos 3 caracteres (solo letras, números y guiones bajos)',
  }),
})

function StepIndicator({
  completed,
  active,
}: {
  completed?: boolean
  active?: boolean
}) {
  return (
    <div
      className={cn("flex w-6 h-1 items-center justify-center transition-colors",
        completed
          ? 'bg-accent'
          : active
            ? 'bg-accent'
            : 'bg-secondary'
      )}
    />
  )
}

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { displayName: '' },
  })

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: '' },
  })

  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setApiError('')
    const phoneWithCountry = `+56${values.phone}`

    try {
      console.log('[AUTH] Phone submission:', { phone: phoneWithCountry })
      const { data, error } = await apiPost('/api/auth/send-code', {
        phoneNumber: phoneWithCountry
      })

      console.log('[AUTH] Send code response:', { data, error })

      if (error) throw new Error(error)

      setPhone(phoneWithCountry)
      setStep('code')
      showSuccess('Code sent to your phone')
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('[AUTH] Phone submission error:', message, err)
      setApiError(message)
      showError(message)
    }
  }

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setApiError('')
    setIsLoading(true)

    try {
      console.log('[AUTH] Code submission:', { phone, code: values.code })
      const checkPhoneRes = await apiPost<{ exists: boolean }>('/api/auth/check-phone', { phone })

      console.log('[AUTH] Check phone response:', checkPhoneRes)

      if (!checkPhoneRes.data?.exists) {
        console.log('[AUTH] New user detected, proceeding to name step')
        setCode(values.code)
        setStep('name')
        showSuccess('Código verificado. Por favor completa tu perfil.')
        return
      }

      console.log('[AUTH] Existing user, attempting sign in')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: phone,
        password: values.code,
      })

      console.log('[AUTH] Sign in response:', { data, error })

      if (error) {
        console.error('[AUTH] Sign in error:', error)
        setApiError('Código inválido o expirado')
        showError('Código inválido o expirado')
        return
      }

      if (data.session) {
        console.log('[AUTH] Sign in successful, redirecting')
        showSuccess('¡Sesión iniciada exitosamente!')
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('[AUTH] Code submission error:', message, err)
      setApiError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onNameSubmit = async (values: z.infer<typeof nameSchema>) => {
    console.log('[AUTH] Name submission:', { displayName: values.displayName })
    setDisplayName(values.displayName)
    setStep('username')
    setApiError('')
  }

  const onUsernameSubmit = async (values: z.infer<typeof usernameSchema>) => {
    setApiError('')
    setIsLoading(true)

    try {
      console.log('[AUTH] Username submission start:', {
        phone,
        displayName,
        username: values.username,
        code: code ? '***' : 'missing',
      })

      const result = await apiPost('/api/auth/complete-signup', {
        phone,
        displayName,
        username: values.username,
        code,
      })

      console.log('[AUTH] Complete signup response:', {
        data: result.data,
        error: result.error,
      })

      if (result.error) {
        console.error('[AUTH] Complete signup error:', result.error)
        throw new Error(result.error)
      }

      console.log('[AUTH] Signup completed successfully, attempting sign in')
      showSuccess('¡Registro completado! Iniciando sesión...')

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: phone,
        password: code,
      })

      console.log('[AUTH] Final sign in response:', {
        session: signInData?.session ? 'exists' : 'missing',
        error: signInError,
      })

      if (signInError) {
        console.error('[AUTH] Final sign in error:', signInError)
        throw new Error('Error al iniciar sesión')
      }

      if (signInData.session) {
        console.log('[AUTH] Complete signup flow successful, redirecting')
        showSuccess('¡Bienvenido!')
        router.push('/')
        router.refresh()
      } else {
        console.error('[AUTH] No session after sign in')
        throw new Error('Error al iniciar sesión')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      console.error('[AUTH] Username submission error:', message, err)
      setApiError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const stepNumber = step === 'phone' ? 1 : step === 'code' ? 2 : step === 'name' ? 3 : 4

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="max-w-md mx-auto w-full p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-8">
          <span className="text-xs text-muted-foreground">
            {AUTH_COPY.stepFormat(stepNumber, 4)}
          </span>
          <div className="flex gap-2">
            <StepIndicator
              completed={stepNumber > 1}
              active={stepNumber === 1}
            />
            <StepIndicator
              completed={stepNumber > 2}
              active={stepNumber === 2}
            />
            <StepIndicator
              completed={stepNumber > 3}
              active={stepNumber === 3}
            />
            <StepIndicator
              active={stepNumber === 4}
            />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-medium mb-2">
            {step === 'phone' ? AUTH_COPY.steps[1].title : step === 'code' ? AUTH_COPY.steps[2].title : step === 'name' ? AUTH_COPY.steps[3].title : step === 'username' ? AUTH_COPY.steps[4].title : null}
          </h1>
          <p className="sr-only text-sm text-muted-foreground">
            {step === 'phone' ? AUTH_COPY.steps[1].description : step === 'code' ? AUTH_COPY.steps[2].description : step === 'name' ? AUTH_COPY.steps[3].description : step === 'username' ? AUTH_COPY.steps[4].description : null}
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-start">
          {step === 'phone' && (
            <Form {...phoneForm}>
              <form
                id="phone-form"
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-4 w-full max-w-sm"
              >
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{AUTH_COPY.phone.label}</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>{AUTH_COPY.phone.addon}</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            placeholder={AUTH_COPY.phone.placeholder}
                            type="tel"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormDescription className="sr-only">
                        {AUTH_COPY.phone.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              </form>
            </Form>
          )}

          {step === 'code' && (
            <Form {...codeForm}>
              <form
                id="code-form"
                onSubmit={codeForm.handleSubmit(onCodeSubmit)}
                className="space-y-4 w-full max-w-sm"
              >
                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{AUTH_COPY.code.label}</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription className="sr-only">
                        {AUTH_COPY.code.description(phone)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              </form>
            </Form>
          )}

          {step === 'name' && (
            <Form {...nameForm}>
              <form
                id="name-form"
                onSubmit={nameForm.handleSubmit(onNameSubmit)}
                className="space-y-4 w-full max-w-sm"
              >
                <FormField
                  control={nameForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{AUTH_COPY.onboarding.displayName.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={AUTH_COPY.onboarding.displayName.placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="sr-only">{AUTH_COPY.onboarding.displayName.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              </form>
            </Form>
          )}

          {step === 'username' && (
            <Form {...usernameForm}>
              <form
                id="username-form"
                onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}
                className="space-y-4 w-full max-w-sm"
              >
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{AUTH_COPY.onboarding.username.label}</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>{AUTH_COPY.onboarding.username.addon}</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            placeholder={AUTH_COPY.onboarding.username.placeholder}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormDescription className="sr-only">{AUTH_COPY.onboarding.username.description} (opcional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              </form>
            </Form>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-6 max-w-md mx-auto space-y-2">
        <p className="text-center text-balance text-muted-foreground pb-4">
          {AUTH_COPY.page.footer}
        </p>
        {step === 'phone' && (
          <>
            <Button type="submit" form="phone-form" className="w-full">
              {AUTH_COPY.phone.button}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              asChild
            >
              <Link href="/">
                Cancelar
              </Link>
            </Button>
          </>
        )}
        {step === 'code' && (
          <>
            <Button type="submit" form="code-form" className="w-full" disabled={isLoading}>
              {isLoading ? AUTH_COPY.code.buttonLoading : AUTH_COPY.code.button}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('phone')
                codeForm.reset()
                setApiError('')
              }}
            >
              {AUTH_COPY.code.backButton}
            </Button>
          </>
        )}
        {step === 'name' && (
          <>
            <Button type="submit" form="name-form" className="w-full">
              Siguiente
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('code')
                nameForm.reset()
                setApiError('')
              }}
            >
              {AUTH_COPY.code.backButton}
            </Button>
          </>
        )}
        {step === 'username' && (
          <>
            <Button type="submit" form="username-form" className="w-full" disabled={isLoading}>
              {isLoading ? AUTH_COPY.onboarding.buttonLoading : AUTH_COPY.onboarding.button}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('name')
                usernameForm.reset()
                setApiError('')
              }}
            >
              {AUTH_COPY.code.backButton}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

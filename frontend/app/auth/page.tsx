'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { uploadToCloudinary } from '@/lib/cloudinary'
import { cn, getInitials } from '@/lib/utils'

type Step = 'phone' | 'code' | 'onboarding'

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

const onboardingSchema = z.object({
  displayName: z
    .string()
    .min(1, AUTH_COPY.onboarding.displayName.error.required)
    .min(2, AUTH_COPY.onboarding.displayName.error.minLength),
  username: z
    .string()
    .min(3, AUTH_COPY.onboarding.username.error.minLength)
    .max(20, AUTH_COPY.onboarding.username.error.maxLength)
    .regex(/^[a-z0-9_-]+$/, AUTH_COPY.onboarding.username.error.invalidFormat),
})

function StepIndicator({
  number,
  completed,
  active,
}: {
  number: number
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
  const { data: session, status } = useSession()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [apiError, setApiError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const onboardingForm = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: '',
      username: '',
    },
  })

  const [profilePicture, setProfilePicture] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setApiError('')
    const phoneWithCountry = `+56${values.phone}`

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneWithCountry }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send code')
      }

      setPhone(phoneWithCountry)
      setStep('code')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to send code')
    }
  }

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setApiError('')

    try {
      const checkResponse = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const checkData = await checkResponse.json()

      if (!checkData.exists) {
        setIsNewUser(true)
        setStep('onboarding')
        return
      }

      const result = await signIn('phone', {
        phone,
        code: values.code,
        redirect: false,
      })

      if (result?.error) {
        setApiError(AUTH_COPY.code.error.invalidCode)
        codeForm.reset()
        return
      }

      if (result?.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setApiError('Verification failed')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const url = await uploadToCloudinary(file)
      setProfilePicture(url)
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to upload image'
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 4) {
      setUsernameAvailable(null)
      return
    }

    try {
      const response = await fetch(`/api/auth/check-username?username=${username}`)
      const data = await response.json()
      setUsernameAvailable(!data.taken)
    } catch (err) {
      console.error('Username check error:', err)
    }
  }

  const onOnboardingSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    setApiError('')

    if (usernameAvailable === false) {
      setApiError(AUTH_COPY.onboarding.username.error.notAvailable)
      return
    }

    try {
      const completeResponse = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          displayName: values.displayName.trim(),
          username: values.username.trim().toLowerCase(),
          profilePicture,
        }),
      })

      if (!completeResponse.ok) {
        const data = await completeResponse.json()
        throw new Error(data.error || 'Failed to complete signup')
      }

      const code = codeForm.getValues('code')
      const result = await signIn('phone', {
        phone,
        code,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  const getStepNumber = () => {
    if (step === 'phone') return 1
    if (step === 'code') return 2
    if (step === 'onboarding') return isNewUser ? 3 : 2
    return 1
  }

  const stepNumber = getStepNumber()
  const currentStepCopy = AUTH_COPY.steps[stepNumber as keyof typeof AUTH_COPY.steps]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <span className="text-xs text-muted-foreground">
          {AUTH_COPY.stepFormat(stepNumber, 4)}
        </span>
        <div className="flex gap-2">
          <StepIndicator
            number={1}
            completed={stepNumber > 1}
            active={stepNumber === 1}
          />
          <StepIndicator
            number={2}
            completed={stepNumber > 2}
            active={stepNumber === 2}
          />
          <StepIndicator
            number={3}
            completed={stepNumber > 3}
            active={stepNumber === 3}
          />
          <StepIndicator number={4} />
        </div>
      </div>

      <h1 className="text-xl font-medium mb-8">{currentStepCopy.title}</h1>
      <p className="sr-only text-sm text-muted-foreground">
        {currentStepCopy.description}
      </p>

      <div className="flex-1 flex flex-col justify-start">
        {step === 'phone' && (
          <Form {...phoneForm}>
            <form
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
                    <FormDescription>
                      {AUTH_COPY.phone.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {step === 'code' && (
          <Form {...codeForm}>
            <form
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
                    <FormDescription>
                      {AUTH_COPY.code.description(phone)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        {step === 'onboarding' && isNewUser && (
          <div className="flex flex-col justify-start">
            <div className="flex flex-col items-center gap-6 mb-8">
              <Avatar className="h-24 w-24 *:bg-secondary">
                {profilePicture && <AvatarImage src={profilePicture} />}
                <AvatarFallback className="text-2xl">
                  {getInitials(onboardingForm.watch('displayName'))}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex gap-2 [&_svg]:size-3 items-center text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 />
                    {AUTH_COPY.onboarding.profilePicture.buttonUploading}
                  </>
                ) : profilePicture ? (
                  <>
                    <Upload />
                    {AUTH_COPY.onboarding.profilePicture.buttonChange}
                  </>
                ) : (
                  <>
                    <Upload />
                    {AUTH_COPY.onboarding.profilePicture.button}
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>

            <Form {...onboardingForm}>
              <form
                onSubmit={onboardingForm.handleSubmit(onOnboardingSubmit)}
                className="space-y-6 w-full max-w-sm"
              >
                <FormField
                  control={onboardingForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {AUTH_COPY.onboarding.displayName.label}
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            placeholder={AUTH_COPY.onboarding.displayName.placeholder}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={onboardingForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {AUTH_COPY.onboarding.username.label}
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>
                              {AUTH_COPY.onboarding.username.addon}
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            placeholder={AUTH_COPY.onboarding.username.placeholder}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              checkUsernameAvailability(e.target.value)
                            }}
                          />
                        </InputGroup>
                      </FormControl>
                      <div className="h-5">
                        {usernameAvailable === true && (
                          <p className="text-xs text-green-600">
                            {AUTH_COPY.onboarding.username.available}
                          </p>
                        )}
                        {usernameAvailable === false && (
                          <p className="text-xs text-destructive">
                            {AUTH_COPY.onboarding.username.unavailable}
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}
      </div>

      <div>
        {apiError && (
          <p className="text-sm text-destructive text-center pb-6">{apiError}</p>
        )}

        <p className="text-center text-xs text-muted-foreground text-balance pb-6">
          {step === 'onboarding' ? AUTH_COPY.onboarding.footer : AUTH_COPY.page.footer}
        </p>

        <div className="flex flex-col-reverse gap-3 w-full max-w-sm">
          {step === 'code' && (
            <Button
              variant="outline"
              className="h-9"
              onClick={() => {
                setStep('phone')
                codeForm.reset()
                setApiError('')
              }}
            >
              {AUTH_COPY.code.backButton}
            </Button>
          )}

          {step === 'phone' && (
            <Button
              className="h-9"
              onClick={() => phoneForm.handleSubmit(onPhoneSubmit)()}
              disabled={
                phoneForm.formState.isSubmitting || !phoneForm.formState.isValid
              }
            >
              {phoneForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {AUTH_COPY.phone.buttonLoading}
                </>
              ) : (
                AUTH_COPY.phone.button
              )}
            </Button>
          )}

          {step === 'code' && (
            <Button
              className="h-9"
              onClick={() => codeForm.handleSubmit(onCodeSubmit)()}
              disabled={
                codeForm.formState.isSubmitting ||
                codeForm.watch('code').length < 6
              }
            >
              {codeForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {AUTH_COPY.code.buttonLoading}
                </>
              ) : (
                AUTH_COPY.code.button
              )}
            </Button>
          )}

          {step === 'onboarding' && (
            <Button
              onClick={() => onboardingForm.handleSubmit(onOnboardingSubmit)()}
              className="w-full max-w-sm"
              disabled={
                onboardingForm.formState.isSubmitting ||
                !onboardingForm.formState.isValid ||
                usernameAvailable === false
              }
            >
              {onboardingForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {AUTH_COPY.onboarding.buttonLoading}
                </>
              ) : (
                AUTH_COPY.onboarding.button
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
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

type Step = 'phone' | 'code'

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

  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setApiError('')
    const phoneWithCountry = `+56${values.phone}`

    try {
      const { data, error } = await apiPost('/api/auth/send-code', {
        phoneNumber: phoneWithCountry
      })

      if (error) throw new Error(error)

      setPhone(phoneWithCountry)
      setStep('code')
      showSuccess('Code sent to your phone')
    } catch (err) {
      const message = getErrorMessage(err)
      setApiError(message)
      showError(message)
    }
  }

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setApiError('')
    setIsLoading(true)

    try {
      const result = await signIn('sms', {
        phone,
        code: values.code,
        redirect: false,
      })

      if (result?.error) {
        setApiError('Invalid code')
        showError('Invalid code')
        return
      }

      if (result?.ok) {
        showSuccess('Signed in successfully')
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setApiError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const stepNumber = step === 'phone' ? 1 : 2

  return (
    <div className="p-8 flex flex-col min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-8">
        <span className="text-xs text-muted-foreground">
          {AUTH_COPY.stepFormat(stepNumber, 2)}
        </span>
        <div className="flex gap-2">
          <StepIndicator
            completed={stepNumber > 1}
            active={stepNumber === 1}
          />
          <StepIndicator
            active={stepNumber === 2}
          />
        </div>
      </div>

      <h1 className="text-xl font-medium mb-8">
        {step === 'phone' ? AUTH_COPY.phone.label : AUTH_COPY.code.label}
      </h1>

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
              {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              <Button type="submit" className="w-full">
                Send Code
              </Button>
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
              {apiError && <p className="text-sm text-destructive">{apiError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
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
                Back
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}

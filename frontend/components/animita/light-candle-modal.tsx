'use client'

import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Button } from '@/components/ui/button'
import { Candle3D } from './candle-3d-simple'
import {
  StyleSelector,
  STAND_OPTIONS,
  STICK_OPTIONS,
  FLAME_OPTIONS,
  BACKGROUND_OPTIONS,
} from './style-selector'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

type CandleStyle = {
  standStyle: string
  stickStyle: string
  flameStyle: string
  backgroundColor: string
}

type LightCandleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  memorialId: string
  onSubmit: (data: {
    candleStyle: CandleStyle
    testimony: string
    duration: 'ONE_DAY' | 'THREE_DAYS' | 'SEVEN_DAYS'
    isAnonymous: boolean
  }) => Promise<void>
}

export function LightCandleModal({
  open,
  onOpenChange,
  memorialId,
  onSubmit,
}: LightCandleModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [candleStyle, setCandleStyle] = useState<CandleStyle>({
    standStyle: 'classic',
    stickStyle: 'smooth',
    flameStyle: 'warm',
    backgroundColor: 'plain',
  })
  const [testimony, setTestimony] = useState('')
  const [duration, setDuration] = useState<'ONE_DAY' | 'THREE_DAYS' | 'SEVEN_DAYS'>('ONE_DAY')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!testimony.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({ candleStyle, testimony, duration, isAnonymous })
      handleClose()
    } catch (error) {
      console.error('Error lighting candle:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setCandleStyle({
      standStyle: 'classic',
      stickStyle: 'smooth',
      flameStyle: 'warm',
      backgroundColor: 'plain',
    })
    setTestimony('')
    setDuration('ONE_DAY')
    setIsAnonymous(false)
    onOpenChange(false)
  }

  return (
    <>Test</>
    // <ResponsiveDialog
    //   open={open}
    //   onOpenChange={handleClose}
    //   title={step === 1 ? 'Personaliza tu vela' : 'Tu mensaje'}
    //   description={
    //     step === 1
    //       ? 'Elige los colores y estilos de tu vela'
    //       : 'Escribe un testimonio o mensaje para acompañar tu vela'
    //   }
    // >
    //   <div className="space-y-6">
    //     {step === 1 ? (
    //       <FieldGroup>
    //         <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    //           <Candle3D candleStyle={candleStyle} />
    //         </div>

    //         <StyleSelector
    //           label="Base"
    //           value={candleStyle.standStyle}
    //           options={STAND_OPTIONS}
    //           onChange={(value) => setCandleStyle({ ...candleStyle, standStyle: value })}
    //         />

    //         <StyleSelector
    //           label="Cera"
    //           value={candleStyle.stickStyle}
    //           options={STICK_OPTIONS}
    //           onChange={(value) => setCandleStyle({ ...candleStyle, stickStyle: value })}
    //         />

    //         <StyleSelector
    //           label="Llama"
    //           value={candleStyle.flameStyle}
    //           options={FLAME_OPTIONS}
    //           onChange={(value) => setCandleStyle({ ...candleStyle, flameStyle: value })}
    //         />

    //         <StyleSelector
    //           label="Fondo"
    //           value={candleStyle.backgroundColor}
    //           options={BACKGROUND_OPTIONS}
    //           onChange={(value) => setCandleStyle({ ...candleStyle, backgroundColor: value })}
    //         />

    //         <Button onClick={() => setStep(2)} className="w-full">
    //           Continuar
    //         </Button>
    //       </FieldGroup>
    //     ) : (
    //       <><FieldGroup>
    //           <Field>
    //             <FieldLabel>Tu testimonio</FieldLabel>
    //             <Textarea
    //               value={testimony}
    //               onChange={(e) => setTestimony(e.target.value)}
    //               placeholder="Escribe tu mensaje o testimonio..."
    //               rows={6} />
    //           </Field>

    //           <Field>
    //             <FieldLabel>Duración</FieldLabel>
    //             <div className="grid grid-cols-3 gap-2">
    //               {[
    //                 { value: 'ONE_DAY', label: '1 día' },
    //                 { value: 'THREE_DAYS', label: '3 días' },
    //                 { value: 'SEVEN_DAYS', label: '7 días' },
    //               ].map((option) => (
    //                 <button
    //                   key={option.value}
    //                   type="button"
    //                   onClick={() => setDuration(option.value as 'ONE_DAY' | 'THREE_DAYS' | 'SEVEN_DAYS')}
    //                   className={`rounded-lg border-2 py-3 text-sm font-medium uppercase tracking-wide transition ${duration === option.value
    //                       ? 'border-white/60 bg-white/10'
    //                       : 'border-white/20 bg-white/5 hover:border-white/40'}`}
    //                 >
    //                   {option.label}
    //                 </button>
    //               ))}
    //             </div>
    //           </Field>

    //           <label className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-4">
    //             <input
    //               type="checkbox"
    //               checked={isAnonymous}
    //               onChange={(e) => setIsAnonymous(e.target.checked)}
    //               className="size-5 rounded border-white/40 bg-white/10" />
    //             <span className="text-sm">Publicar anónimamente</span>
    //           </label>
    //         </div><div className="flex gap-3">
    //             <Button
    //               variant="secondary"
    //               onClick={() => setStep(1)}
    //               className="flex-1"
    //               disabled={isSubmitting}
    //             >
    //               Volver
    //             </Button>
    //             <Button
    //               onClick={handleSubmit}
    //               className="flex-1"
    //               disabled={!testimony.trim() || isSubmitting}
    //             >
    //               {isSubmitting ? 'Prendiendo...' : 'Prender vela'}
    //             </Button>
    //           </div></>
    //       </>
    //     )}
    //   </div>
    // </ResponsiveDialog>
  )
}

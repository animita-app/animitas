'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { addPetition } from '@/lib/localStorage'
import type { PetitionDuration } from '@/types/mock'

interface PetitionFormProps {
  animitaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPetitionAdded?: () => void
}

const DURATIONS: Array<{ value: PetitionDuration; label: string }> = [
  { value: '1 dia', label: '1 día' },
  { value: '3 dias', label: '3 días' },
  { value: '7 dias', label: '7 días' },
]

export function PetitionForm({ animitaId, open, onOpenChange, onPetitionAdded }: PetitionFormProps) {
  const [texto, setTexto] = useState('')
  const [duracion, setDuracion] = useState<PetitionDuration>('3 dias')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!texto.trim()) return

    setIsSubmitting(true)
    try {
      addPetition(animitaId, texto, duracion)
      setTexto('')
      setDuracion('3 dias')
      onOpenChange(false)
      onPetitionAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Hacer una petición</DialogTitle>
          <DialogDescription>
            Escribe tu petición y elige por cuánto tiempo deseas que esté activa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="¿Qué deseas pedir?"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-24 resize-none text-sm"
          />

          <div>
            <label className="text-sm font-medium block mb-2">Duración</label>
            <Select value={duracion} onValueChange={(value) => setDuracion(value as PetitionDuration)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-foreground/60 p-3 bg-muted rounded">
            La petición se marcará como expirada después del tiempo seleccionado, pero permanecerá visible en el registro.
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !texto.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Hacer petición'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Flower, Flame, Heart, Cross, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { addSticker } from '@/lib/localStorage'
import type { StickerType } from '@/types/mock'

interface StickerPickerProps {
  animitaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onStickerAdded?: () => void
}

const STICKER_TYPES: Array<{ type: StickerType; label: string; icon: React.ReactNode }> = [
  { type: 'flower', label: 'Flor', icon: <Flower className="w-6 h-6" /> },
  { type: 'candle', label: 'Vela', icon: <Flame className="w-6 h-6" /> },
  { type: 'rose', label: 'Rosa', icon: <Flower className="w-6 h-6" /> },
  { type: 'heart', label: 'Corazón', icon: <Heart className="w-6 h-6" /> },
  { type: 'cross', label: 'Cruz', icon: <Cross className="w-6 h-6" /> },
]

export function StickerPicker({ animitaId, open, onOpenChange, onStickerAdded }: StickerPickerProps) {
  const [selectedType, setSelectedType] = useState<StickerType | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSticker = async () => {
    if (!selectedType) return

    setIsSubmitting(true)
    try {
      addSticker(animitaId, selectedType, message || undefined)
      setSelectedType(null)
      setMessage('')
      onOpenChange(false)
      onStickerAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Dejar un sticker</DialogTitle>
          <DialogDescription>
            Elige un sticker para dejar en esta animita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {STICKER_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded border-2 transition-all ${
                  selectedType === type
                    ? 'border-black bg-black/5'
                    : 'border-border hover:border-black/50'
                }`}
              >
                <div className="text-foreground">{icon}</div>
                <span className="text-xs mt-1 text-center">{label}</span>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="space-y-3">
              <Input
                placeholder="Agregar un mensaje (opcional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-sm"
              />

              <div className="flex gap-2">
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
                  onClick={handleAddSticker}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Dejando...' : 'Dejar sticker'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

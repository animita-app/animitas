'use client'

import { FieldLabel } from "@/components/ui/field"

type StyleOption = {
  value: string
  label: string
  preview: string
}

type StyleSelectorProps = {
  label: string
  value: string
  options: StyleOption[]
  onChange: (value: string) => void
}

export function StyleSelector({ label, value, options, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
              value === option.value
                ? 'border-white/60 bg-white/10'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
            }`}
          >
            <div
              className="h-12 w-full rounded-lg"
              style={{ background: option.preview }}
            />
            <span className="text-xs font-medium uppercase tracking-wide">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export const STAND_OPTIONS: StyleOption[] = [
  { value: 'classic', label: 'Clásico', preview: '#8B7355' },
  { value: 'modern', label: 'Moderno', preview: '#2C2C2C' },
  { value: 'vintage', label: 'Vintage', preview: '#C9A961' },
  { value: 'minimal', label: 'Minimal', preview: '#E8E8E8' },
]

export const STICK_OPTIONS: StyleOption[] = [
  { value: 'smooth', label: 'Suave', preview: '#FFF8DC' },
  { value: 'textured', label: 'Textura', preview: '#FFFACD' },
  { value: 'ivory', label: 'Marfil', preview: '#FFFFF0' },
  { value: 'natural', label: 'Natural', preview: '#F5E6D3' },
]

export const FLAME_OPTIONS: StyleOption[] = [
  {
    value: 'warm',
    label: 'Cálida',
    preview: 'linear-gradient(180deg, #FFF4E6 0%, #FF6B35 100%)',
  },
  {
    value: 'cool',
    label: 'Fría',
    preview: 'linear-gradient(180deg, #E8F4F8 0%, #4A90E2 100%)',
  },
  {
    value: 'bright',
    label: 'Brillante',
    preview: 'linear-gradient(180deg, #FFFEF0 0%, #FFD700 100%)',
  },
  {
    value: 'soft',
    label: 'Suave',
    preview: 'linear-gradient(180deg, #FFF9F0 0%, #FF8C42 100%)',
  },
]

export const BACKGROUND_OPTIONS: StyleOption[] = [
  { value: 'plain', label: 'Simple', preview: '#1a1a1a' },
  {
    value: 'warm',
    label: 'Cálido',
    preview: 'linear-gradient(180deg, #2C1810 0%, #1a1a1a 100%)',
  },
  {
    value: 'cool',
    label: 'Frío',
    preview: 'linear-gradient(180deg, #1a2332 0%, #1a1a1a 100%)',
  },
  {
    value: 'twilight',
    label: 'Crepúsculo',
    preview: 'linear-gradient(180deg, #4A2C4A 0%, #1a1a1a 100%)',
  },
]

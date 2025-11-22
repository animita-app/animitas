import type { Sticker } from '@/types/mock'

interface StickerItemProps {
  sticker: Sticker
}

const STICKER_EMOJIS: Record<string, string> = {
  flower: '🌸',
  candle: '🕯️',
  rose: '🌹',
  heart: '❤️',
  cross: '✝️',
}

const STICKER_LABELS: Record<string, string> = {
  flower: 'Flor',
  candle: 'Vela',
  rose: 'Rosa',
  heart: 'Corazón',
  cross: 'Cruz',
}

export function StickerItem({ sticker }: StickerItemProps) {
  const date = new Date(sticker.date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="flex items-start gap-3 p-3 rounded border border-border bg-muted/30">
      <div className="text-2xl flex-shrink-0">
        {STICKER_EMOJIS[sticker.type] || STICKER_EMOJIS.flower}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {STICKER_LABELS[sticker.type] || sticker.type}
        </p>
        {sticker.message && (
          <p className="text-xs text-foreground/70 mt-1">
            {sticker.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {date}
        </p>
      </div>
    </div>
  )
}

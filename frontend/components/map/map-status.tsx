'use client'

import { Candle, LoadingVignette } from '@/components/loaders'
import { CutoutText } from '@/components/cutout-text'
import type { AnimitasStatus } from '@/contexts/animitas-context'

interface MapStatusProps {
  status: AnimitasStatus
  count: number
  onRetry: () => void
  // The place the map is narrowed to, if any: an empty map then means none there, not none at all.
  area?: string
}

export function MapStatus({ status, count, onRetry, area }: MapStatusProps) {
  if (status === 'ready' && count > 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {status === 'loading' && (
        <div role="status">
          <LoadingVignette />
          <span className="sr-only">Cargando animitas</span>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="pointer-events-auto">
          <p className="sr-only">No pudimos cargar las animitas.</p>
          <button
            type="button"
            onClick={onRetry}
            aria-label="Reintentar"
            className="group flex flex-col items-center gap-3 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Candle lit={false} className="h-16 transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 motion-reduce:transition-none" />
            <CutoutText text="reintentar" height={18} />
          </button>
        </div>
      )}
      {status === 'ready' && count === 0 && (
        <div role="status" className="paper-bloom flex max-w-64 flex-col items-center gap-3 text-center">
          <Candle lit={false} className="h-14" />
          <CutoutText text="todavía no hay" height={22} />
          <p className="text-pretty text-sm text-text-weak">
            {area ? `Nadie ha añadido una animita en ${area}.` : 'Nadie ha añadido una animita todavía.'}
          </p>
        </div>
      )}
    </div>
  )
}

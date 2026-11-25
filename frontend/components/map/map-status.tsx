'use client'

import { Candle, GluingWord } from '@/components/loaders'
import { CutoutText } from '@/components/cutout-text'
import type { AnimitasStatus } from '@/contexts/animitas-context'

interface MapStatusProps {
  status: AnimitasStatus
  count: number
  onRetry: () => void
}

export function MapStatus({ status, count, onRetry }: MapStatusProps) {
  if (status === 'ready' && count > 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {status === 'loading' && (
        <div role="status">
          <GluingWord />
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
        <div role="status" className="flex flex-col items-center gap-3">
          <Candle lit={false} className="h-14 opacity-70" />
          <CutoutText text="todavía no hay" height={14} />
          <span className="sr-only">Todavía no hay animitas. Añade la primera.</span>
        </div>
      )}
    </div>
  )
}

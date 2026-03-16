'use client'

import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  'Analizando historia...',
  'Extrayendo insights...',
  'Identificando detalles...',
  'Procesando información...',
  'Completando análisis...',
  'Preparando resultado...',
]

export function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="z-[99999] absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded">
      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <p className="mt-3 text-sm font-medium h-5">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  )
}

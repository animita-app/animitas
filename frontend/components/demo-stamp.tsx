'use client'

import { useEffect, useState } from 'react'
import { isDemo } from '@/lib/demo/flag'

// A rubber stamp in the corner while demo mode is on, so nobody mistakes the demo's candles and
// recuerdos for real ones. Plain links: they go through the server to change the cookie.
export function DemoStamp() {
  const [on, setOn] = useState(false)
  useEffect(() => setOn(isDemo()), [])
  if (!on) return null
  return (
    <div className="ink-stamp fixed top-24 right-4 z-40 flex -rotate-6 flex-col items-center gap-1 rounded-xs px-3 py-1.5">
      <span className="road-sign-text">Modo demo</span>
      <span className="flex gap-3 text-xs">
        <a href="/demo?reiniciar" className="underline-offset-2 hover:underline">Reiniciar</a>
        <a href="/demo?salir" className="underline-offset-2 hover:underline">Salir</a>
      </span>
    </div>
  )
}

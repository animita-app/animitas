'use client'

import { useEffect, useState } from 'react'
import { isDemo } from '@/lib/demo/flag'

// A small ink stamp in the corner while demo mode is on, so nobody mistakes the demo's candles and
// recuerdos for real ones. It never covers anything you can press; reset and leave live in the account
// menu.
export function DemoStamp() {
  const [on, setOn] = useState(false)
  useEffect(() => setOn(isDemo()), [])
  if (!on) return null
  return (
    <span aria-hidden className="ink-stamp road-sign-text pointer-events-none fixed top-16 right-3 z-40 rotate-6 rounded-xs px-2 py-0.5 text-sm md:top-20 md:right-5">
      Demo
    </span>
  )
}

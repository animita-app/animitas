'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { playTruckPass } from '@/lib/truck-sound'

// The part of the app a path belongs to. Opening an animita's sheet over the map isn't a change of
// place, so animitas don't count.
function section(pathname: string) {
  const first = pathname.split('/')[1] ?? ''
  if (first.startsWith('@') || first === 'profile') return 'profile'
  return first || 'map'
}

// Changing section is a drive down the road: you hear a truck go by while the new page fades in.
export function TruckTransition() {
  const pathname = usePathname()
  const previous = useRef(pathname)
  const [pass, setPass] = useState(0)
  const [passing, setPassing] = useState(false)

  useEffect(() => {
    const from = section(previous.current)
    const to = section(pathname)
    previous.current = pathname
    if (from === to || from === 'animita' || to === 'animita') return
    playTruckPass()
    setPass(n => n + 1)
    setPassing(true)
  }, [pathname])

  if (!passing) return null
  return <span key={pass} aria-hidden onAnimationEnd={() => setPassing(false)} className="page-arrive pointer-events-none fixed inset-0 z-70 bg-background" />
}

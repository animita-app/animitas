'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// The part of the app a path belongs to. Opening an animita's sheet over the map isn't a change of
// place, so animitas don't count.
function section(pathname: string) {
  const first = pathname.split('/')[1] ?? ''
  if (first.startsWith('@') || first === 'profile') return 'profile'
  return first || 'map'
}

// Changing section, the new page shows through a sheet of paper that lifts away.
export function PageArrive() {
  const pathname = usePathname()
  const previous = useRef(pathname)
  const [pass, setPass] = useState(0)
  const [passing, setPassing] = useState(false)

  useEffect(() => {
    const from = section(previous.current)
    const to = section(pathname)
    previous.current = pathname
    if (from === to || from === 'animita' || to === 'animita') return
    setPass(n => n + 1)
    setPassing(true)
  }, [pathname])

  if (!passing) return null
  return <span key={pass} aria-hidden onAnimationEnd={() => setPassing(false)} className="page-arrive pointer-events-none fixed inset-0 z-70 bg-background" />
}

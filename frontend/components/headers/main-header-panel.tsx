'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShelfObject } from '@/components/shelf-object'
import { preloadCutouts } from '@/components/cutout-text'
import { useAnimitas } from '@/contexts/animitas-context'

// Real objects stand on the page like offerings at an animita. No labels until you reach for one.
const SHELF = [
  { href: '/map', src: '/cutouts/map.png', label: 'Mapa', size: 'h-14' },
  { href: '/add', src: '/cutouts/pin-red.png', label: 'Añadir', size: 'h-16' },
  { href: '/list', src: '/cutouts/shrines.png', label: 'Animitas', size: 'h-14' },
]

function Shelf({ pathname }: { pathname: string }) {
  const { requestReset } = useAnimitas()
  return (
    <div className="shelf pointer-events-auto flex items-end gap-6 px-6 pb-1 w-max">
      {SHELF.map(item => {
        const active = pathname === item.href || (item.href === '/map' && pathname.startsWith('/animita'))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              // The map object always brings the whole country back into view: in place on the map,
              // or closing an animita's sheet on the way.
              if (item.href !== '/map') return
              if (pathname === '/map') e.preventDefault()
              if (pathname === '/map' || pathname.startsWith('/animita')) requestReset()
            }}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className="shelf-item relative flex flex-col items-center outline-none"
          >
            <ShelfObject {...item} active={active} />
          </Link>
        )
      })}
    </div>
  )
}

export function MainHeaderPanel() {
  const pathname = usePathname()
  useEffect(() => {
    const warm = () => preloadCutouts([...SHELF.map(item => item.label), 'entrar'].join(''))
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(warm, 1500)
    return () => clearTimeout(id)
  }, [])
  return (
    <nav aria-label="Navegación principal">
      <Shelf pathname={pathname} />
    </nav>
  )
}

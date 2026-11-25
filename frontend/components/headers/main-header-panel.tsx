'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShelfObject } from '@/components/shelf-object'
import { useAnimitas } from '@/contexts/animitas-context'

// Real objects stand on the page like offerings at an animita. No labels until you reach for one.
const SHELF = [
  { href: '/map', src: '/cutouts/map.png', label: 'Mapa', size: 'h-14' },
  { href: '/add', src: '/cutouts/pin.png', label: 'Añadir', size: 'h-16' },
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
            className="shelf-item relative flex flex-col items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
  return (
    <nav aria-label="Navegación principal">
      <Shelf pathname={pathname} />
    </nav>
  )
}

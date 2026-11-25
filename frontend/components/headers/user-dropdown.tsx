"use client"

import Link from 'next/link'
import Image from 'next/image'
import { PenLoop, RedPenDot } from '@/components/pen'
import { useUser } from '@/contexts/user-context'
import { useNewRecuerdos } from '@/hooks/use-new-recuerdos'

// You: your initial circled in pen (or your photo as a small print), with a red pen dot when someone left a
// recuerdo on your animitas. It opens your page, where your recuerdos and the way out are.
export function UserDropdown() {
  const { currentUser } = useUser()
  const recuerdos = useNewRecuerdos()
  if (!currentUser) return null
  const count = recuerdos.length

  return (
    <Link
      href={`/@${currentUser.username}`}
      aria-label={count ? `Tu perfil, ${count} ${count === 1 ? 'recuerdo nuevo' : 'recuerdos nuevos'}` : 'Tu perfil'}
      className="pen-redraw relative flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {currentUser.avatarUrl ? (
        <span className="print-frame block size-10 rotate-3 p-1 pb-2">
          <Image src={currentUser.avatarUrl} alt="" width={64} height={64} className="size-full object-cover" />
        </span>
      ) : (
        <PenLoop className="size-10 text-xl">{(currentUser.name || currentUser.username || 'v')[0].toUpperCase()}</PenLoop>
      )}
      {/* Centered on the circle's line, up and to the right (its 45° point), as if marked over it. */}
      {count > 0 && <RedPenDot className="absolute size-3.5 rotate-12" style={{ left: 25, top: 5 }} />}
    </Link>
  )
}

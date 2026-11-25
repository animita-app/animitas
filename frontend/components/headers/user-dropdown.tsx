"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isDemo } from '@/lib/demo/flag'
import { PenLoop, RedPenDot } from '@/components/pen'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { useNewRecuerdos } from '@/hooks/use-new-recuerdos'
import { storyExcerpt } from '@/lib/story'

const ITEM = 'pen-underline w-max rounded-none p-0 text-sm text-text-strong data-[highlighted]:bg-transparent'

// You, and what's new for you, in one place: the recuerdos people left on your animitas and where you can go.
export function UserDropdown() {
  const { currentUser } = useUser()
  const recuerdos = useNewRecuerdos()
  const [demo, setDemo] = useState(false)
  useEffect(() => setDemo(isDemo()), [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!currentUser) return null
  const count = recuerdos.length
  const latest = recuerdos[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Your initial circled in pen (or your photo as a small print); a red pen dot when someone left a
            recuerdo on your animitas. Reaching for it draws the circle again. */}
        <button
          type="button"
          aria-label={count ? `Tu cuenta, ${count} ${count === 1 ? 'recuerdo nuevo' : 'recuerdos nuevos'}` : 'Tu cuenta'}
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
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="paper-bloom flex w-64 flex-col gap-5 rounded-none px-2 py-2">
        {/* Only the newest recuerdo, short: the menu is a glance, the animita has the rest. */}
        {latest && (
          <DropdownMenuItem asChild className="group flex-col items-start gap-1 rounded-none p-0 data-[highlighted]:bg-transparent">
            <Link href={latest.href}>
              <span className="text-xs text-text-weak">{count === 1 ? 'Un recuerdo nuevo' : `${count} recuerdos nuevos`}</span>
              <span className="text-pretty text-sm text-text transition-colors group-data-[highlighted]:text-text-strong">
                “{storyExcerpt(latest.text, 70).text}”
              </span>
              <span className="text-xs text-text-weak">{latest.who}, {latest.timeAgo}</span>
            </Link>
          </DropdownMenuItem>
        )}

        <div className="flex flex-col gap-3">
          <DropdownMenuItem asChild className={ITEM}>
            <Link href={`/@${currentUser.username}`}>Tu perfil</Link>
          </DropdownMenuItem>
          {demo ? (
            // Plain links: they go through the server to change the demo cookie.
            <DropdownMenuItem asChild className={ITEM}>
              <a href="/demo?salir">Salir del demo</a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={handleLogout} className={ITEM}>
              Cerrar sesión
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

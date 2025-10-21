'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export function TopHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [memorialName, setMemorialName] = useState<string>('')

  const isInAnimita = pathname.includes('/animita/')
  const animitaId = isInAnimita ? pathname.split('/animita/')[1]?.split('/')[0] : null

  useEffect(() => {
    if (!isInAnimita || !animitaId) {
      setMemorialName('')
      return
    }

    const fetchMemorialData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${apiUrl}/api/memorials/${animitaId}`)
        if (response.ok) {
          const data = await response.json()
          const memorial = data.memorial || data
          const people = memorial.people || []
          const names = people.map((p: any) => p.name).filter(Boolean)
          const displayName = names.length > 0 ? names.join(', ') : memorial.name || ''
          setMemorialName(displayName)
        }
      } catch (error) {
        setMemorialName('')
      }
    }

    fetchMemorialData()
  }, [isInAnimita, animitaId])

  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      <div className="w-full flex h-16 items-center justify-between p-4">
        <Link href="/" className="text-sm">
          [ÁNIMA]
        </Link>

        {isInAnimita && memorialName && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-sm font-medium truncate animate-in fade-in duration-300">
              {memorialName}
            </p>
          </div>
        )}

        {user ? (
          <Link href={`/${user.user_metadata?.username || user.email}`}>
            <Button variant="ghost" size="icon" className="group hover:!bg-border rounded-full *:*:!bg-transparent *:text-black *:*:border *:*:!border-black">
              <Avatar className="size-8 group-hover:bg-border">
                {user.user_metadata?.image && <AvatarImage src={user.user_metadata.image} alt={(user.user_metadata?.displayName || user.email || '') + "1"} />}
                <AvatarFallback>{getInitials(user.user_metadata?.displayName || user.email || '')}</AvatarFallback>
              </Avatar>
            </Button>
          </Link>
        ) : (
          <Button size="default" asChild>
            <Link href="/auth">Únete</Link>
          </Button>
        )}
      </div>
    </header>
  )
}

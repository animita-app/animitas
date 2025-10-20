'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export function TopHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()


  const user = session?.user
  const username = (user as any)?.username
  const [memorialName, setMemorialName] = useState<string>('')
  const [memorialCount, setMemorialCount] = useState<string>('')

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

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/memorials/count')
        const data = await response.json()
        setMemorialCount(data.count)
      } catch (error) {
        console.error('Error fetching memorial count:', error)
      }
    }

    fetchCount()
  }, [])

  const userName = (user as any)?.displayName || user?.name || 'Usuario'
  const userImage = user?.image


  return (
    <header className="fixed top-0 left-0 right-0 z-[999999]">
      <div className="w-full flex h-16 items-center justify-between p-4">
        {isInAnimita ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
          >
            <X className="size-5" />
          </Button>
        ) : (
          <p className="text-sm">
            [ÁNIMA]
          </p>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {isInAnimita && memorialName ? (
            <p className="text-sm font-medium truncate animate-in fade-in duration-300">
              {memorialName}
            </p>
          ) : (
            <span>{memorialCount !== null ? `${memorialCount} animitas` : ''}</span>
          )}
        </div>

        {user ? (
          <Link href={username ? `/${username}` : '/profile'}>
            <Button variant="ghost" size="icon" className="p-1 *:*:!bg-transparent *:text-black *:*:border *:*:!border-black">
              <Avatar className="size-8">
                {userImage && <AvatarImage src={userImage} alt={userName} />}
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
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

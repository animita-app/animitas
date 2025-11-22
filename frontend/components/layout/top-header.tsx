'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnimitaById } from '@/lib/mockService'

export function TopHeader() {
  const pathname = usePathname()
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
        const animita = await getAnimitaById(animitaId)
        if (animita) {
          setMemorialName(animita.name)
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
      </div>
    </header>
  )
}

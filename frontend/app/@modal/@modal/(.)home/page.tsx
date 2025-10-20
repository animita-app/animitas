'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { ListSection } from '@/components/animita/list-section'
import { Skeleton } from '@/components/ui/skeleton'

export default function ListMemorialsModal() {
  const router = useRouter()
  const [memorials, setMemorials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMemorials() {
      try {
        const response = await fetch('/api/memorials')
        if (!response.ok) {
          throw new Error('Failed to fetch memorials')
        }
        const data = await response.json()
        if (data && Array.isArray(data.memorials)) {
          setMemorials(data.memorials)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchMemorials()
  }, [])

  const handleClose = () => {
    router.back()
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={handleClose}
      title="Explorar Memoriales"
      description="Descubre los memoriales creados por la comunidad."
    >
      <div className="p-0">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="flex space-x-4">
              <Skeleton className="h-48 w-1/2" />
              <Skeleton className="h-48 w-1/2" />
            </div>
          </div>
        ) : (
          <>
            <ListSection title="Recién añadidos" memorials={memorials} onClose={handleClose} />
            <ListSection title="Más populares" memorials={memorials.slice().reverse()} onClose={handleClose} />
          </>
        )}
      </div>
    </ResponsiveDialog>
  )
}

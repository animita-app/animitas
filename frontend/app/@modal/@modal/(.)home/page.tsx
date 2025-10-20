'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { ListSection } from '@/components/animita/list-section'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'

export default function ListMemorialsModal() {
  const router = useRouter()
  const [memorials, setMemorials] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch('/memorials')
        if (data?.memorials) {
          setMemorials(data.memorials)
          setCount(data.memorials.length)
        }
      } catch (error) {
        console.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleClose = () => {
    router.back()
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={handleClose}
      title={`Explorar Memoriales (${count})`}
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

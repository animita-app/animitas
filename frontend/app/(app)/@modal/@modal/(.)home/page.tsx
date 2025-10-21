'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { ListSection } from '@/components/animita/list-section'
import { apiFetch } from '@/lib/api'
import { Memorial } from '@prisma/client'

export default function ListMemorialsModal() {
  const router = useRouter()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiFetch<{ memorials: any[] }>('/memorials')
        if (data?.memorials) {
          setMemorials(data.memorials)
          setCount(data.memorials.length)
        }
      } catch (error) {
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
      title="Explorar Memoriales"
      description="Descubre los memoriales creados por la comunidad."
    >
        <p>
        {loading ? (
          <>Cargando...</>
        ) : (
          <>{count} animitas</>
        )}
        </p>
      <ListSection title="Recién añadidos" memorials={memorials} onClose={handleClose} />
      <ListSection title="Más populares" memorials={memorials.slice().reverse()} onClose={handleClose} />
    </ResponsiveDialog>
  )
}

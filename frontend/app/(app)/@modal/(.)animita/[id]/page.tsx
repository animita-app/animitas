'use client'

import { useParams } from 'next/navigation'
import { MemorialContent } from '@/app/(app)/animita/[id]/memorial-content'

export default function MemorialModal() {
  const params = useParams<{ id: string }>()
  const { id } = params

  return <MemorialContent id={id} key={id} />
}

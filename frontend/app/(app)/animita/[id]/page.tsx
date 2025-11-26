'use client'

import { useParams } from 'next/navigation'
import { MemorialContent } from './memorial-content'

export default function MemorialPage() {
  const params = useParams<{ id: string }>()
  const { id } = params

  return <MemorialContent id={id} />
}

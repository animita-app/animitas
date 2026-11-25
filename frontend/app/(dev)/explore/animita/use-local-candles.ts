'use client'

import { useState } from 'react'

// The prototype never writes to the real database: candles and notes stay in memory.
export function useLocalCandles(initial = 0) {
  const [count, setCount] = useState(initial)
  const [isLit, setIsLit] = useState(false)
  const toggle = () => {
    setCount(c => c + (isLit ? -1 : 1))
    setIsLit(l => !l)
  }
  return { count, isLit, toggle }
}

export function candlesLabel(count: number) {
  return count === 1 ? '1 vela prendida' : `${count.toLocaleString('es-CL')} velas prendidas`
}

export function sinceYear(iso: string) {
  return new Date(iso).getFullYear()
}

export type Note = { id: string; text: string; author: string }

export function useLocalNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState('')
  const add = () => {
    const text = draft.trim()
    if (!text) return
    setNotes(n => [{ id: crypto.randomUUID(), text, author: 'Tú' }, ...n])
    setDraft('')
  }
  return { notes, draft, setDraft, add }
}

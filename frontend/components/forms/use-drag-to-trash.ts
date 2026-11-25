import { useCallback, useRef, useState } from 'react'

// Lifting a print and dropping it in the trash: pointer based, so it works with a mouse and a finger.
// A small move first, so a tap still taps.
const LIFT_AFTER_PX = 6

export function useDragToTrash(onTrash: (index: number) => void) {
  const trashRef = useRef<HTMLDivElement>(null)
  const start = useRef<{ index: number; x: number; y: number; rect: DOMRect } | null>(null)
  // Where the lifted print is on screen: it's drawn above everything, so no scrolling area clips it.
  const [drag, setDrag] = useState<{ index: number; left: number; top: number; width: number } | null>(null)
  const [overTrash, setOverTrash] = useState(false)

  const isOver = (x: number, y: number) => {
    const r = trashRef.current?.getBoundingClientRect()
    return !!r && x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 24 && y <= r.bottom + 24
  }

  const handlers = useCallback((index: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      start.current = { index, x: e.clientX, y: e.clientY, rect: e.currentTarget.getBoundingClientRect() }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const s = start.current
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (!drag && Math.hypot(dx, dy) < LIFT_AFTER_PX) return
      setDrag({ index: s.index, left: s.rect.left + dx, top: s.rect.top + dy, width: s.rect.width })
      setOverTrash(isOver(e.clientX, e.clientY))
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const s = start.current
      start.current = null
      if (s && drag && isOver(e.clientX, e.clientY)) onTrash(s.index)
      setDrag(null)
      setOverTrash(false)
    },
    onPointerCancel: () => {
      start.current = null
      setDrag(null)
      setOverTrash(false)
    },
  }), [drag, onTrash])

  return { trashRef, drag, overTrash, handlers }
}

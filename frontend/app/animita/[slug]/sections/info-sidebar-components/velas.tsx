"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Candle } from "@/components/loaders"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { TABLES } from "@/lib/animitas"

const VELA = "🕯️"

interface VelasProps {
  siteId: string
}

export function countVelas(rows: { user_id: string }[], userId?: string) {
  const users = new Set(rows.map(r => r.user_id))
  return { count: users.size, isLit: userId ? users.has(userId) : false }
}

export function Velas({ siteId }: VelasProps) {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useUser()
  const [count, setCount] = useState(0)
  const [isLit, setIsLit] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    async function fetchVelas() {
      const supabase = createClient()
      const { data } = await supabase
        .from(TABLES.velas)
        .select('user_id')
        .eq('site_id', siteId)
      if (cancelled) return
      const result = countVelas(data ?? [], currentUser?.id)
      setCount(result.count)
      setIsLit(result.isLit)
      setLoading(false)
    }
    fetchVelas()
    return () => { cancelled = true }
  }, [siteId, currentUser?.id])

  const toggle = async () => {
    if (!isAuthenticated || !currentUser) {
      router.push('/auth')
      return
    }
    const wasLit = isLit
    setIsLit(!wasLit)
    setCount(c => c + (wasLit ? -1 : 1))

    const supabase = createClient()
    const { error } = wasLit
      ? await supabase.from(TABLES.velas).delete().eq('site_id', siteId).eq('user_id', currentUser.id)
      : await supabase.from(TABLES.velas).insert({ site_id: siteId, user_id: currentUser.id, emoji: VELA })

    if (error) {
      setIsLit(wasLit)
      setCount(c => c + (wasLit ? 1 : -1))
      toast.error(wasLit ? "No se pudo apagar la vela" : "No se pudo prender la vela", { description: error.message })
    }
  }

  const status = count === 0 ? "Nadie ha prendido una vela" : count === 1 ? "1 vela prendida" : `${count.toLocaleString("es-CL")} velas prendidas`
  const invite = isLit ? "La tuya está prendida" : count === 0 ? "Sé la primera persona" : "Prende la tuya"

  // The candle is the button; the count and an invitation sit beside it, on the same left edge as the
  // rest of the sheet.
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={isLit}
        aria-label={isLit ? "Apagar tu vela" : "Prender una vela"}
        className="candle-toggle -ml-1 flex shrink-0 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Candle lit={isLit} className="h-14" />
      </button>
      <div className="flex flex-col gap-0.5" aria-live="polite">
        {loading ? (
          <span className="text-sm text-text-weak">Contando velas…</span>
        ) : (
          <>
            <span className="text-sm text-text-strong">{status}</span>
            <span className="text-sm text-text-weak">{invite}</span>
          </>
        )}
      </div>
    </div>
  )
}

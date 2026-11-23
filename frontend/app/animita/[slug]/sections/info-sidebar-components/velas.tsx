"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

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
        .from('heritage_site_reactions')
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
      ? await supabase.from('heritage_site_reactions').delete().eq('site_id', siteId).eq('user_id', currentUser.id)
      : await supabase.from('heritage_site_reactions').insert({ site_id: siteId, user_id: currentUser.id, emoji: VELA })

    if (error) {
      setIsLit(wasLit)
      setCount(c => c + (wasLit ? 1 : -1))
      toast.error(wasLit ? "No se pudo apagar la vela" : "No se pudo prender la vela", { description: error.message })
    }
  }

  if (loading) {
    return <Skeleton className="h-9 w-36" />
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isLit ? "secondary" : "outline"}
        onClick={toggle}
        aria-pressed={isLit}
        className={cn(isLit && "text-accent")}
      >
        <Flame className={cn(isLit && "fill-current")} />
        <span className="grid text-left">
          <span inert={isLit || undefined} className={cn("[grid-area:1/1] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity", isLit && "opacity-0 blur-[4px] scale-90")}>
            Prender vela
          </span>
          <span inert={!isLit || undefined} className={cn("[grid-area:1/1] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity", !isLit && "opacity-0 blur-[4px] scale-90")}>
            Vela prendida
          </span>
        </span>
      </Button>
      <p className="text-sm text-text-weak" aria-live="polite">
        {count === 0 ? "Sé la primera persona en prender una" : count === 1 ? "1 vela prendida" : `${count.toLocaleString('es-CL')} velas prendidas`}
      </p>
    </div>
  )
}

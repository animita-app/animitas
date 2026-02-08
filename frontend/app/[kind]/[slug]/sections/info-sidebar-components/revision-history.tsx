"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { History, User as UserIcon } from "lucide-react"

interface Revision {
  id: string
  site_id: string
  author_id: string
  author_name?: string
  diff_summary: string
  created_at: string
}

export function RevisionHistory({ siteId }: { siteId: string }) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('heritage_site_revisions')
          .select(`
            id,
            site_id,
            author_id,
            diff_summary,
            created_at,
            profiles ( full_name )
          `)
          .eq('site_id', siteId)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          setRevisions(data.map((r: any) => ({
            ...r,
            author_name: r.profiles?.full_name || 'Anónimo'
          })))
        }
      } catch (err) {
        console.error("Error fetching revisions:", err)
      } finally {
        setLoading(false)
      }
    }

    if (siteId) {
      fetchRevisions()
    }
  }, [siteId])

  if (loading) return <div className="animate-pulse h-20 bg-muted rounded-md" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-tight">
        <History className="size-4" />
        <span>Historial de ediciones</span>
      </div>

      {revisions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No hay ediciones registradas todavía.</p>
      ) : (
        <div className="space-y-4 divide-y divide-border-weak">
          {revisions.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium">{rev.author_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(rev.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{rev.diff_summary || 'Edición sin resumen'}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import React from "react"
import { HeritageSite } from "@/types/heritage"
import { InlineEdit } from "@/components/ui/inline-edit"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useSiteEditing } from "../site-edit-context"
import { toast } from "sonner"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { role, currentUser } = useUser()
  const { isEditing, setIsEditing, cancelToken, confirmToken } = useSiteEditing()
  const canEdit = role === ROLES.EDITOR || role === ROLES.SUPERADMIN || currentUser?.id === site.creator_id

  const kindSlug = (site as any).kind || 'animita'
  const prefix = kindSlug === 'animita' ? 'Animita de ' : ''

  const pendingChangesRef = React.useRef<Record<string, any>>({})
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const saveField = async (field: string, value: string) => {
    pendingChangesRef.current[field] = value

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      const changes = { ...pendingChangesRef.current }
      pendingChangesRef.current = {}

      const supabase = createClient()
      const { error } = await supabase
        .from('heritage_sites')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', site.id)

      if (error) { toast.error("Error al actualizar datos"); return }

      const keys = Object.keys(changes)
      const summary = keys.length === 1
        ? `Campo "${keys[0]}" actualizado`
        : `Campos actualizados: ${keys.join(', ')}`

      await supabase.from('heritage_site_revisions').insert({
        site_id: site.id,
        snapshot: changes,
        diff_summary: summary,
        author_id: currentUser?.id,
      })

      setIsEditing(false)
      window.location.reload()
    }, 150)
  }

  const editingProps = canEdit ? {
    onEditingChange: setIsEditing,
    externalCancelToken: cancelToken,
    externalConfirmToken: confirmToken,
    deferredSave: true,
  } : {}

  return (
    <div>
      <span className="inline-flex items-baseline gap-0">
        {prefix && (
          <p className="text-2xl shrink-0 font-medium text-text-strong mr-1.5">{prefix}</p>
        )}
        {canEdit ? (
          <InlineEdit
            value={site.title}
            onSave={(val) => saveField('title', val)}
            placeholder="Nombre"
            className="text-2xl font-medium text-text-strong leading-tight"
            {...editingProps}
          />
        ) : (
          <h1 className="text-2xl font-medium text-text-strong">{site.title}</h1>
        )}
      </span>

      {canEdit ? (
        <InlineEdit
          type="textarea"
          value={site.story ?? ''}
          onSave={(val) => saveField('story', val)}
          placeholder="Agrega una historia..."
          className={cn(
            "mt-4 text-sm leading-relaxed text-text-strong",
            !isExpanded && !isEditing && "line-clamp-4"
          )}
          {...editingProps}
        />
      ) : (
        <p className={cn(
          "mt-4 text-sm leading-relaxed text-text-strong whitespace-pre-line",
          !isExpanded && !isEditing && "line-clamp-4"
        )}>
          {site.story}
        </p>
      )}

      {!isEditing && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-accent hover:text-accent/80"
          size="sm"
          variant="link"
        >
          {isExpanded ? "Leer menos" : "Leer más"}
        </Button>
      )}
    </div>
  )
}

"use client"

import React from "react"
import { HeritageSite } from "@/types/heritage"
import { InlineEdit } from "@/components/ui/inline-edit"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { role, currentUser } = useUser()
  const canEdit = role === ROLES.EDITOR || role === ROLES.SUPERADMIN || currentUser?.id === site.creator_id

  const saveField = async (field: 'title' | 'story', value: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_sites')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', site.id)
    if (error) throw error
  }

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-strong leading-tight text-balance">
        <span>Animita de </span>
        {canEdit ? (
          <InlineEdit
            value={site.title}
            onSave={(val) => saveField('title', val)}
            placeholder="Nombre"
            className="inline text-inherit !mb-0"
            inline
          />
        ) : (
          <span>{site.title}</span>
        )}
      </h1>

      {canEdit ? (
        <InlineEdit
          type="textarea"
          value={site.story ?? ''}
          onSave={(val) => saveField('story', val)}
          placeholder="Cuenta su historia"
          className="mt-4 text-sm leading-relaxed text-text-strong"
        />
      ) : site.story ? (
        <>
          <p className={cn(
            "mt-4 text-sm leading-relaxed text-text-strong whitespace-pre-line text-pretty",
            !isExpanded && "line-clamp-4"
          )}>
            {site.story}
          </p>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-accent hover:text-accent/80"
            size="sm"
            variant="link"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Leer menos" : "Leer más"}
          </Button>
        </>
      ) : null}
    </div>
  )
}

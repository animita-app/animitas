"use client"

import React from "react"
import { Animita } from "@/types/animita"
import { InlineEdit } from "@/components/ui/inline-edit"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"
import { TABLES } from "@/lib/animitas"

interface MainInfoProps {
  site: Animita
}

export function MainInfo({ site }: MainInfoProps) {
  const { role, currentUser } = useUser()
  const canEdit = role === ROLES.EDITOR || role === ROLES.SUPERADMIN || currentUser?.id === site.creator_id

  const saveField = async (field: 'title' | 'story', value: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLES.animitas)
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
        <p className="mt-4 text-sm leading-relaxed text-text-strong whitespace-pre-line text-pretty">
          {site.story}
        </p>
      ) : null}
    </div>
  )
}

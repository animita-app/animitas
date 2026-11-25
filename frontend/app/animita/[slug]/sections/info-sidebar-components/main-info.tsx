"use client"

import React from "react"
import { Animita } from "@/types/animita"
import { InlineEdit } from "@/components/ui/inline-edit"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { TABLES, canEditAnimita } from "@/lib/animitas"

interface MainInfoProps {
  site: Animita
}

export function MainInfo({ site }: MainInfoProps) {
  const { currentUser, isEditor } = useUser()
  const canEdit = canEditAnimita(currentUser, isEditor, site)

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
            label="Nombre"
            placeholder="Nombre"
            className="text-inherit"
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
          label="Historia"
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

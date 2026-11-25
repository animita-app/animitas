"use client"

import React from "react"
import { Animita } from "@/types/animita"
import { InlineEdit } from "@/components/ui/inline-edit"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { TABLES, canEditAnimita } from "@/lib/animitas"
import { storyExcerpt } from "@/lib/story"
import { CutoutText } from "@/components/cutout-text"

interface MainInfoProps {
  site: Animita
  // In the sheet over the map: the name cut out and the start of the story; the full page has the rest.
  compact?: boolean
}

export function MainInfo({ site, compact = false }: MainInfoProps) {
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

  if (compact) {
    const { text } = storyExcerpt(site.story)
    return (
      <div className="flex flex-col gap-4">
        <h1 className="sr-only">Animita de {site.title}</h1>
        <div aria-hidden className="flex flex-col gap-2">
          <span className="text-sm text-text-weak">Animita de</span>
          <span className="flex flex-wrap items-end gap-x-5 gap-y-2">
            {site.title.split(/\s+/).filter(Boolean).map((word, i) => <CutoutText key={`${word}-${i}`} text={word} height={32} />)}
          </span>
        </div>
        {text && <p className="text-pretty text-base leading-relaxed text-text-strong">{text}</p>}
      </div>
    )
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

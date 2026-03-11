"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { HeritageSite } from "@/types/heritage"
import { InlineEdit } from "@/components/ui/inline-edit"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { ROLES } from "@/types/roles"
import { Button } from "@/components/ui/button"
import { useSiteEditing } from "../site-edit-context"

interface MainInfoProps {
  site: HeritageSite
}

export function MainInfo({ site }: MainInfoProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { role, currentUser } = useUser()
  const { isEditing, setIsEditing, cancelToken, confirmToken } = useSiteEditing()
  const canEdit = role === ROLES.EDITOR || role === ROLES.SUPERADMIN || currentUser?.id === site.creator_id

  const kindSlug = (site as any).kind || 'animita'
  const prefix = kindSlug === 'animita' ? 'Animita de ' : ''

  const { updateStagedChange } = useSiteEditing()

  const saveField = async (field: string, value: string) => {
    updateStagedChange(field as any, value)
    return Promise.resolve()
  }

  const editingProps = canEdit ? {
    onEditingChange: setIsEditing,
    externalCancelToken: cancelToken,
    externalConfirmToken: confirmToken,
    deferredSave: true,
  } : {}

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-strong leading-tight">
        {prefix && (
          <span className="mr-0">{prefix}</span>
        )}
        {canEdit ? (
          <InlineEdit
            value={site.title}
            onSave={(val) => saveField('title', val)}
            placeholder="Nombre"
            className="inline text-inherit !mb-0"
            inline
            {...editingProps}
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
          placeholder="Agrega una historia..."
          className={cn("mt-4 text-sm leading-relaxed text-text-strong", isEditing && "-mb-4")}
          {...editingProps}
        />
      ) : (
        <p className={cn(
          "mt-4 text-sm leading-relaxed text-text-strong whitespace-pre-line",
          !isExpanded && "line-clamp-4"
        )}>
          {site.story}
        </p>
      )}

      {(() => {
        return !isEditing && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-accent hover:text-accent/80"
            size="sm"
            variant="link"
          >
            {isExpanded ? "Leer menos" : "Leer más"}
          </Button>
        )
      })()}
    </div>
  )
}

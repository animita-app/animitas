"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onSave: (value: string) => Promise<void>
  type?: 'text' | 'textarea'
  label: string
  placeholder?: string
  className?: string
  inline?: boolean
}

export function InlineEdit({ value, onSave, type = 'text', label, placeholder, className, inline = false }: InlineEditProps) {
  const [saved, setSaved] = useState(value)
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaved(value)
    setDraft(value)
  }, [value])

  const cancel = () => {
    setDraft(saved)
    setEditing(false)
  }

  const save = async () => {
    const next = draft.trim()
    if (next === saved.trim()) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(next)
      setSaved(next)
      setEditing(false)
    } catch (err: any) {
      toast.error('No se pudo guardar', { description: err?.message })
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    const shared = {
      value: draft,
      'aria-label': label,
      placeholder,
      disabled: saving,
      autoFocus: true,
      onBlur: save,
      className: cn('w-full bg-transparent p-0 border-0 outline-none caret-accent', className),
    }
    return type === 'textarea' ? (
      <textarea
        {...shared}
        rows={1}
        onChange={(e) => {
          setDraft(e.target.value)
          e.target.style.height = 'auto'
          e.target.style.height = `${e.target.scrollHeight}px`
        }}
        ref={(el) => {
          if (el) {
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') cancel()
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
        }}
        className={cn(shared.className, 'resize-none overflow-hidden whitespace-pre-line')}
      />
    ) : (
      <input
        {...shared}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); save() }
          if (e.key === 'Escape') cancel()
        }}
      />
    )
  }

  const Tag = inline ? 'span' : 'div'
  return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setEditing(true)
        }
      }}
      className={cn(
        'cursor-text rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        type === 'textarea' && 'whitespace-pre-line',
        inline ? 'inline' : 'block',
        className
      )}
    >
      {saved || <span className="text-text-weak">{placeholder}</span>}
      {/* The text it shows stays its name, so a heading still reads as the name; the action comes after. */}
      <span className="sr-only">, editar {label.toLowerCase()}</span>
    </Tag>
  )
}

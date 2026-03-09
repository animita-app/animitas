"use client"

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

export interface InlineEditOption {
  value: string
  label: string
}

interface InlineEditBaseProps {
  className?: string
  placeholder?: string
  disabled?: boolean
  successMessage?: string
  onEditingChange?: (editing: boolean) => void
  externalCancelToken?: number
  externalConfirmToken?: number
}

interface InlineEditTextProps extends InlineEditBaseProps {
  type?: 'text' | 'textarea'
  value: string
  onSave: (value: string) => Promise<void>
}

interface InlineEditSelectProps extends InlineEditBaseProps {
  type: 'select'
  options: InlineEditOption[]
  value: string
  onSave: (value: string) => Promise<void>
}

interface InlineEditMultiSelectProps extends InlineEditBaseProps {
  type: 'multiselect'
  options: InlineEditOption[]
  value: string[]
  onSave: (value: string[]) => Promise<void>
}

type InlineEditProps =
  | InlineEditTextProps
  | InlineEditSelectProps
  | InlineEditMultiSelectProps

export function InlineEdit(props: InlineEditProps) {
  const {
    className, placeholder, disabled = false,
    successMessage = 'Cambios guardados',
    onEditingChange, externalCancelToken, externalConfirmToken,
  } = props

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localValue, setLocalValue] = useState<string | string[]>(props.value)
  const [draft, setDraft] = useState<string | string[]>(props.value)

  const startEdit = () => {
    if (disabled) return
    setDraft(localValue)
    setEditing(true)
    onEditingChange?.(true)
  }

  const cancel = () => {
    setDraft(localValue)
    setEditing(false)
    onEditingChange?.(false)
  }

  const save = useCallback(async (valueToSave?: string | string[]) => {
    const raw = valueToSave ?? draft
    const val = typeof raw === 'string' ? raw.trim() : raw
    if (JSON.stringify(val) === JSON.stringify(localValue)) {
      setEditing(false)
      onEditingChange?.(false)
      return
    }
    setSaving(true)
    try {
      if (props.type === 'multiselect') {
        await (props as InlineEditMultiSelectProps).onSave(val as string[])
      } else {
        await (props as InlineEditTextProps | InlineEditSelectProps).onSave(val as string)
      }
      setLocalValue(val)
      toast.success(successMessage)
    } catch {
      toast.error('Error al guardar')
      setDraft(localValue)
    } finally {
      setSaving(false)
      setEditing(false)
      onEditingChange?.(false)
    }
  }, [draft, localValue, props, successMessage, onEditingChange])

  useEffect(() => {
    if (externalCancelToken && editing) cancel()
  }, [externalCancelToken])

  useEffect(() => {
    if (externalConfirmToken && editing) save()
  }, [externalConfirmToken])

  if (props.type === 'multiselect') {
    const multiProps = props as InlineEditMultiSelectProps
    const current = localValue as string[]
    return (
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          className={cn('flex items-center gap-1 text-left', !disabled && 'cursor-pointer', className)}
        >
          {current.length
            ? current.map((v) => multiProps.options.find((o) => o.value === v)?.label ?? v).join(', ')
            : <span className="opacity-50">{placeholder}</span>
          }
          {!disabled && <ChevronDown className="opacity-40 shrink-0" />}
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          {multiProps.options.map((opt) => (
            <button
              key={opt.value}
              onClick={async () => {
                const next = current.includes(opt.value)
                  ? current.filter((v) => v !== opt.value)
                  : [...current, opt.value]
                setLocalValue(next)
                setSaving(true)
                try {
                  await multiProps.onSave(next)
                  toast.success(successMessage)
                } catch {
                  toast.error('Error al guardar')
                  setLocalValue(current)
                } finally {
                  setSaving(false)
                }
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-background-weak',
                current.includes(opt.value) && 'font-medium text-text-strong'
              )}
            >
              <span className={cn(
                'size-3.5 rounded-sm border border-border flex items-center justify-center shrink-0',
                current.includes(opt.value) && 'bg-accent border-accent'
              )}>
                {current.includes(opt.value) && (
                  <svg viewBox="0 0 10 8" className="size-2.5 stroke-white fill-none stroke-2">
                    <polyline points="1,4 4,7 9,1" />
                  </svg>
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    )
  }

  if (props.type === 'select') {
    const selectProps = props as InlineEditSelectProps
    if (editing) {
      return (
        <Select
          value={draft as string}
          onValueChange={async (val) => {
            setSaving(true)
            try {
              await selectProps.onSave(val)
              setLocalValue(val)
              toast.success(successMessage)
            } catch {
              toast.error('Error al guardar')
            } finally {
              setSaving(false)
              setEditing(false)
              onEditingChange?.(false)
            }
          }}
          onOpenChange={(open) => { if (!open) { setEditing(false); onEditingChange?.(false) } }}
          defaultOpen
        >
          <SelectTrigger className={cn('h-auto', className)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectProps.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    return (
      <div onClick={startEdit} className={cn(!disabled && 'cursor-pointer', className)}>
        {selectProps.options.find((o) => o.value === localValue)?.label
          ?? <span className="opacity-50">{placeholder}</span>}
      </div>
    )
  }

  if (props.type === 'textarea') {
    if (editing) {
      return (
        <textarea
          value={draft as string}
          onChange={(e) => { setDraft(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
          onBlur={() => save()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel()
            if (e.key === 'Enter' && e.ctrlKey) save()
          }}
          ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }}
          className={cn('w-full resize-none overflow-hidden bg-transparent p-0 border-0 outline-none focus:ring-0 caret-accent whitespace-pre-line', className)}
          placeholder={placeholder}
          disabled={saving}
          autoFocus
          rows={1}
        />
      )
    }
    return (
      <div
        onClick={startEdit}
        className={cn('whitespace-pre-line', !disabled && 'cursor-text', className)}
      >
        {(localValue as string) || <span className="opacity-50">{placeholder}</span>}
      </div>
    )
  }

  return (
    <div className={cn('min-h-[1lh]', className)}>
      {editing ? (
        <input
          value={draft as string}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => save()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); save() }
            if (e.key === 'Escape') cancel()
          }}
          className={cn('w-full bg-transparent p-0 border-0 focus:ring-0 focus:outline-0 caret-accent', className)}
          placeholder={placeholder}
          disabled={saving}
          autoFocus
        />
      ) : (
        <div onClick={startEdit} className={cn(!disabled && 'cursor-text')}>
          {(localValue as string) || <span className="opacity-50">{placeholder}</span>}
        </div>
      )}
    </div>
  )
}

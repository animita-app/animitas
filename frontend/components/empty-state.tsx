import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="text-sm font-medium text-text-strong text-balance">{title}</p>
      {description && <p className="text-sm text-text-weak text-pretty">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

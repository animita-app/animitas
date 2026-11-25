import type { ReactNode } from 'react'
import { Candle } from '@/components/loaders'
import { CutoutText } from '@/components/cutout-text'

interface EmptyStateProps {
  title: string
  // The few words glued from print that the eye reads instead of the title.
  cutout: string
  description?: string
  action?: ReactNode
}

// An unlit candle where something should be, like a shrine nobody has visited yet.
export function EmptyState({ title, cutout, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Candle lit={false} className="h-16" />
      <p className="sr-only">{title}</p>
      <CutoutText text={cutout} height={26} arc={20} />
      {description && <p className="text-pretty text-sm text-text-weak">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  completed?: boolean
  active?: boolean
}

export function StepIndicator({ completed, active }: StepIndicatorProps) {
  return (
    <div
      className={cn(
        'flex w-6 h-1 items-center justify-center transition-colors',
        completed ? 'bg-accent' : active ? 'bg-accent' : 'bg-secondary'
      )}
    />
  )
}

import { CheckCircle2, Flame, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchResultItemProps {
  label: string
  isAnimita?: boolean
  isSelected?: boolean
  onClick: () => void
}

export function SearchResultItem({ label, isAnimita = false, isSelected = false, onClick }: SearchResultItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn('w-full justify-start font-normal text-left', isSelected && 'bg-accent/10')}
    >
      {isAnimita ? <Flame className="text-accent" /> : <MapPin className="text-muted-foreground" />}
      <span className="flex-1">{label}</span>
      {isSelected && <CheckCircle2 className="text-accent" />}
    </Button>
  )
}

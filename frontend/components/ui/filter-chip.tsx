'use client'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export type FilterOption = { value: string; label: string }

interface FilterChipProps {
  defaultLabel: string
  options: FilterOption[]
  value: string | null
  onSelect: (v: string | null) => void
}

export function FilterChip({ defaultLabel, options, value, onSelect }: FilterChipProps) {
  const isActive = value !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-[30px] -mt-px rounded-full bg-black text-white border-0 hover:bg-black/90 hover:text-white !px-2.5 gap-1.5 border-border font-normal relative',
            isActive && 'bg-accent text-background border-0 hover:bg-accent/90 hover:text-background'
          )}
        >
          <span className="text-lg">🐕</span>
          {isActive && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              1
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {value !== null && (
          <DropdownMenuItem onSelect={() => onSelect(null)} className="!font-normal">
            {defaultLabel}
          </DropdownMenuItem>
        )}
        {options.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onSelect(opt.value)}
            className="!font-normal flex items-center justify-between"
          >
            <span>{opt.label}</span>
            {value === opt.value && <Check className="w-4 h-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

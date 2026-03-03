'use client'
import { ChevronDown } from 'lucide-react'
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
  const activeLabel = options.find(o => o.value === value)?.label ?? null
  const isActive = value !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-[30px] -mt-px rounded-full [&_svg]:opacity-50 [&_svg]:-mx-1 bg-black text-white border-0 hover:bg-black/90 hover:text-white !px-2.5 gap-1.5 border-border font-normal',
            isActive && 'bg-accent text-background border-0 hover:bg-accent/90 hover:text-background'
          )}
        >
          {activeLabel ?? defaultLabel}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {value !== null && (
          <DropdownMenuItem onSelect={() => onSelect(null)}>
            {defaultLabel}
          </DropdownMenuItem>
        )}
        {options.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onSelect(opt.value)}
            className="!font-normal"
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

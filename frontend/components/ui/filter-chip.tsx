'use client'
import { Check, ChevronDown } from 'lucide-react'
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
  const count = isActive ? 1 : 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-[30px] -mt-px pr-2 rounded-full bg-black text-white border-0 hover:bg-black/90 hover:text-white !px-2.5 gap-1.5 border-border font-normal relative',
            isActive && 'bg-accent text-background border-0 hover:bg-accent/90 hover:text-background'
          )}
        >
          {defaultLabel}
          {isActive ? (
            <span className="bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          ) : (
            <ChevronDown className="size-3 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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

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
  value: string[]
  onSelect: (v: string[]) => void
}

export function FilterChip({ defaultLabel, options, value, onSelect }: FilterChipProps) {
  const count = value.length
  const isActive = count > 0

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onSelect(value.filter(v => v !== optionValue))
    } else {
      onSelect([...value, optionValue])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'h-[30px] -mt-px bg-transparent hover:bg-muted shadow-none rounded-full !px-2.5 gap-1.5 font-normal relative !pr-1.5',
            isActive && "bg-black text-white border-0 hover:bg-black/90 hover:text-white border-border"
          )}
        >
          {defaultLabel}
          {isActive ? (
            <span className="-ml-px bg-white text-black text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          ) : (
            <ChevronDown className="size-5 p-0.5 -ml-0.5 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="!z-999" sideOffset={2}>
        {options.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => handleSelect(opt.value)}
            className="!font-normal flex items-center justify-between"
          >
            <span>{opt.label}</span>
            {value.includes(opt.value) && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

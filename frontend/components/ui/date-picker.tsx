'use client'

import * as React from 'react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date' }: DatePickerProps) {
  const [captionLayout, ] = React.useState<'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'>('dropdown')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full normal-case justify-start text-left font-normal rounded-none border-0 bg-background-weaker hover:bg-background-weaker',
            !value && 'text-foreground/50 hover:text-foreground/50'
          )}
        >
          {value ? format(value, 'PPP', { locale: require('date-fns/locale/es').default }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background w-auto p-0 rounded-none overflow-visible" align="start">
        <Calendar
          mode="single"
          defaultMonth={value}
          selected={value}
          onSelect={onChange}
          captionLayout={captionLayout}
        />
      </PopoverContent>
    </Popover>
  )
}

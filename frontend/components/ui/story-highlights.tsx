"use client"

import React from "react"
import { cn } from "@/lib/utils"

export type HighlightCategory = 'patrimonial' | 'spiritual' | 'memory'

export interface Highlight {
  text: string
  category: HighlightCategory
  label?: string
}

interface StoryHighlightsProps {
  text: string
  highlights: Highlight[]
  className?: string
}

export function StoryHighlights({ text, highlights, className }: StoryHighlightsProps) {
  // Simple replacement logic: split text by highlights and wrap them
  // To handle overlapping or nested highlights, we'd need a more complex parser.
  // For now, we'll assume they are simple and non-overlapping.

  let elements: (string | React.ReactNode)[] = [text]
  let keyCounter = 0

  highlights.forEach((highlight) => {
    const newElements: (string | React.ReactNode)[] = []

    elements.forEach((el) => {
      if (typeof el !== 'string') {
        newElements.push(el)
        return
      }

      const parts = el.split(highlight.text)
      parts.forEach((part, i) => {
        newElements.push(part)
        if (i < parts.length - 1) {
          newElements.push(
            <span
              key={`highlight-${keyCounter++}`}
              className={cn(
                "mix-blend-screen relative inline-block px-1 text-white font-medium transition-all duration-500 animate-in fade-in zoom-in-95",
                highlight.category === 'patrimonial' && "bg-blue-600/20",
                highlight.category === 'spiritual' && "bg-cyan-500/20",
                highlight.category === 'memory' && "bg-neutral-500/20"
              )}
            >
              {highlight.label && (
                <span className="absolute -top-4 left-0 text-[10px] uppercase opacity-70 whitespace-nowrap">
                  {highlight.label}:
                </span>
              )}
              {highlight.text}
            </span>
          )
        }
      })
    })
    elements = newElements
  })

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none space-y-4 leading-relaxed", className)}>
      <p>
        {elements}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 mt-4 border-t border-border-weak">
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-blue-600" />
          <span className="text-[9px] font-bold uppercase tracking-tight text-blue-600">Patrimonial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-cyan-500" />
          <span className="text-[9px] font-bold uppercase tracking-tight text-cyan-500">Espiritual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-neutral-500" />
          <span className="text-[9px] font-bold uppercase tracking-tight text-neutral-500">De Memoria</span>
        </div>
      </div>
    </div>
  )
}

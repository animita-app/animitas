"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface ProgressSegment {
  value: number
  color: string
  label?: string
  onClick?: () => void
  isActive?: boolean
}

interface MultiProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: ProgressSegment[]
  total?: number
  height?: number | string
}

export function MultiProgress({
  segments,
  total,
  height = "0.25rem",
  className,
  ...props
}: MultiProgressProps) {
  const totalValue = total || segments.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-secondary",
        className
      )}
      style={{ height }}
      {...props}
    >
      <div className="flex h-full w-full">
        {segments.map((segment, index) => {
          const percentage = totalValue > 0 ? (segment.value / totalValue) * 100 : 0

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-full",
                    segment.onClick && "cursor-pointer hover:opacity-80"
                  )}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: segment.color,
                    opacity: segment.isActive === false ? 0.3 : 1
                  }}
                  onClick={(e) => {
                    if (segment.onClick) {
                      e.stopPropagation()
                      segment.onClick()
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs flex gap-4 mb-1 justify-between items-center">
                <p className="font-normal">{segment.label}</p>
                <p className="ibm-plex-mono opacity-80">
                  {segment.value} ({Math.round(percentage)}%)
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

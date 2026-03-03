"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StepLayoutProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  actions: React.ReactNode
  stepIndex?: number
  totalSteps?: number
  className?: string
}

export function StepLayout({ title, description, children, actions, stepIndex, totalSteps, className }: StepLayoutProps) {
  const showStepper = stepIndex !== undefined && totalSteps !== undefined

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-0.5 text-center pb-1.5">
        <h2 className="text-xl font-medium tracking-tight text-text-strong">{title}</h2>
        {description && <p className="text-sm text-text-weak">{description}</p>}
      </div>

      {children}

      <div className="flex flex-col gap-2 pt-2">{actions}</div>

      {showStepper && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIndex
                  ? "w-6 bg-accent"
                  : i < stepIndex
                    ? "w-3 bg-accent/25"
                    : "w-3 bg-background-weaker"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

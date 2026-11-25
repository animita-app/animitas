"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CutoutText } from "@/components/cutout-text"

interface StepLayoutProps {
  // Read by screen readers; the eye gets `cutout`, the same words glued from print.
  title: string
  cutout?: string
  description?: React.ReactNode
  children: React.ReactNode
  actions: React.ReactNode
  stepIndex?: number
  totalSteps?: number
  className?: string
}

export function StepLayout({ title, cutout, description, children, actions, stepIndex, totalSteps, className }: StepLayoutProps) {
  const showStepper = stepIndex !== undefined && totalSteps !== undefined

  return (
    <div className={cn("flex w-full flex-col items-center gap-5", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="sr-only">{title}</h2>
        <CutoutText text={cutout ?? title} height={34} arc={24} className="min-h-12" />
        {description && <p className="text-pretty text-sm text-text-weak">{description}</p>}
      </div>

      <div className="flex w-full flex-col gap-3">{children}</div>

      <div className="flex flex-col items-center gap-2">{actions}</div>

      {showStepper && (
        <p className="text-xs text-text-weaker">
          <span className="sr-only">Paso </span>{stepIndex + 1} de {totalSteps}
        </p>
      )}
    </div>
  )
}

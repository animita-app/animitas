import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface InfoBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  children: React.ReactNode
}

export function InfoBlock({
  label,
  children,
  className,
  ...props
}: InfoBlockProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

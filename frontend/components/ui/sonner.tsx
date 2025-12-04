"use client"

import {
  CheckCircle,
  Info,
  Loader2,
  XCircle,
  Triangle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircle className="size-4" />,
        info: <Info className="size-4" />,
        warning: <Triangle className="size-4" />,
        error: <XCircle className="size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--black)",
          "--normal-text": "var(--white)",
          "--normal-border": "var(--neutral-800)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

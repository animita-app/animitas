"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="!font-sans gap-2"
      icons={{
        success: <CheckCircle2 className="!size-4" />,
        error: <XCircle className="!size-4" />
      }}
      toastOptions={{
        classNames: {
          success: '!bg-success !text-white !border-success',
          error: '!bg-destructive !text-white !border-destructive',
          icon: '[&_svg]:text-current',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

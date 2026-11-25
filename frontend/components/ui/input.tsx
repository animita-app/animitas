import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium text-text-strong placeholder:text-text-weak selection:bg-accent/30 selection:text-text-strong disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "border border-border-weak bg-background-weak file:text-text dark:bg-input/30 h-9 rounded-md px-3 py-1 text-sm shadow-xs focus-visible:border-ring aria-invalid:border-destructive",
        // A one-line slip of paper to write on (see .paper-note and .paper-line).
        paper: "paper-note paper-line h-12 rounded-none border-0 px-4 text-base aria-invalid:ring-[3px] aria-invalid:ring-destructive/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Input({ className, type, variant, ...props }: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }

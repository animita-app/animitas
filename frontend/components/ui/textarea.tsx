import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full transition-[color,box-shadow] outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-border-weak bg-muted placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive dark:bg-input/30 field-sizing-content min-h-12 rounded-md px-3 py-2 text-base shadow-xs md:text-sm",
        // A ruled note left at the animita (see .paper-note).
        paper: "paper-note paper-ruled min-h-28 resize-none rounded-none border-0 px-4 text-base placeholder:text-text-weak",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Textarea({ className, variant, ...props }: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }

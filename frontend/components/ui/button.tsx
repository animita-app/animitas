import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer select-none active:scale-[0.97] motion-reduce:active:scale-100 rounded-sm shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-accent text-primary-foreground hover:bg-accent/70 aria-expanded:bg-accent/70",
        destructive:
          "text-destructive bg-destructive/10 hover:bg-destructive/15 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border-weak bg-background shadow-xs hover:bg-muted hover:text-accent-foreground aria-expanded:bg-muted dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-foreground hover:bg-secondary/80 aria-expanded:bg-secondary/80",
        ghost:
          "hover:bg-background-weaker aria-expanded:bg-background-weaker !shadow-none",
        link: "!px-0 !h-auto !shadow-none text-primary underline-offset-4 hover:underline relative group",
        // Chilean road signs as buttons: green to move on, blue for an outside service (see .road-sign).
        sign: "road-sign road-sign-text road-sign-action disabled:opacity-60",
        "sign-service": "road-sign road-sign-blue road-sign-text road-sign-action disabled:opacity-60",
      },
      size: {
        default: "h-9 px-4 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3",
        sm: "h-8 px-3 has-[>svg:first-child]:pl-2 has-[>svg:last-child]:pr-2",
        lg: "h-10 px-4 has-[>svg:first-child]:pl-3 has-[>svg:last-child]:pr-3",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xs": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

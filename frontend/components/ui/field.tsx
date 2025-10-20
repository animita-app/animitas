'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const fieldGroupVariants = cva("grid gap-6", {
  variants: {
    orientation: {
      vertical: "grid-cols-1",
      horizontal: "sm:grid-cols-2 sm:gap-8",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof fieldGroupVariants>
>(({ className, orientation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(fieldGroupVariants({ orientation, className }))}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.HTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset ref={ref} className={cn("grid gap-6", className)} {...props} />
))
FieldSet.displayName = "FieldSet"

const fieldVariants = cva("grid gap-2", {
  variants: {
    orientation: {
      vertical: "grid-cols-1",
      horizontal: "grid-cols-1 items-center gap-4 sm:grid-cols-3 sm:gap-2",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof fieldVariants>
>(({ className, orientation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(fieldVariants({ orientation, className }))}
    {...props}
  />
))
Field.displayName = "Field"

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid gap-2 has-[[data-slot=description]]:gap-1",
      className
    )}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

const FieldSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("border-border my-2 border-t", className)}
    {...props}
  />
))
FieldSeparator.displayName = "FieldSeparator"

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn(
      "text-text-strong text-lg font-semibold leading-none",
      className
    )}
    {...props}
  />
))
FieldLegend.displayName = "FieldLegend"

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-text-strong font-semibold", className)}
    {...props}
  />
))
FieldTitle.displayName = "FieldTitle"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.HTMLAttributes<HTMLLabelElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "label"
  return (
    <Comp
      ref={ref}
      className={cn(
        "text-text-strong sm:text-sm",
        "data-[disabled]:opacity-70",
        "group-has-[[data-orientation=horizontal]]:sm:col-span-2 group-has-[[data-orientation=horizontal]]:sm:text-right",
        className
      )}
      {...props}
    />
  )
})
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="description"
    className={cn(
      "text-text text-sm",
      "group-has-[[data-orientation=horizontal]]:sm:col-span-2 group-has-[[data-orientation=horizontal]]:sm:col-start-1 group-has-[[data-orientation=horizontal]]:sm:row-start-2 group-has-[[data-orientation=horizontal]]:sm:text-right",
      className
    )}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="error"
    className={cn(
      "text-destructive text-sm",
      "group-has-[[data-orientation=horizontal]]:sm:col-span-2 group-has-[[data-orientation=horizontal]]:sm:col-start-1 group-has-[[data-orientation=horizontal]]:sm:row-start-2",
      className
    )}
    {...props}
  />
))
FieldError.displayName = "FieldError"

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}

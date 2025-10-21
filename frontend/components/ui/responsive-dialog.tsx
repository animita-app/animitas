"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type ResponsiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [drawerOpen, setDrawerOpen] = React.useState(open)

  React.useEffect(() => {
    setDrawerOpen(open)
  }, [open])

  const handleDrawerOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setDrawerOpen(nextOpen)
      onOpenChange(nextOpen)
    },
    [onOpenChange]
  )

  const handleSheetOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        return
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange]
  )

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          overlayTransparent
          className="view-transition-fade"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
      <DrawerContent className={`view-transition-fade ${className || ""}`}>
        <DrawerHeader className="sr-only">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  )
}

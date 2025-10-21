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

export interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  snapPoints?: (string | number)[]
  activeSnapPoint?: string | number | null
  setActiveSnapPoint?: (point: string | number | null) => void
  drawerHeight?: number
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  drawerHeight,
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
    <Drawer
      open={drawerOpen}
      onOpenChange={handleDrawerOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <DrawerContent className={`view-transition-fade ${className || ""}`}>
        <DrawerHeader className="sr-only">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        {React.isValidElement(children)
          ? React.cloneElement(children, { drawerHeight } as React.Attributes)
          : children}
      </DrawerContent>
    </Drawer>
  )
}

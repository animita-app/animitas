"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Scroller } from "@/components/ui/scroller"
import { cn } from "@/lib/utils"

const ResponsiveDialogContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
})

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: string
  description?: string
  snapPoints?: (string | number)[]
  activeSnapPoint?: string | number | null
  setActiveSnapPoint?: (snap: string | number | null) => void
  drawerHeight?: number
  className?: string
}

export function ResponsiveDialog({
  children,
  title,
  description,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  className,
  ...props
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Debug: Track media query and component selection
  React.useEffect(() => {
  }, [isDesktop])

  // Debug: Track open state
  React.useEffect(() => {
    if (props.open !== undefined) {
    }
  }, [props.open])

  if (title) {
    return (
      <ResponsiveDialogContext.Provider value={{ isDesktop }}>
        {isDesktop ? (
          <Dialog {...props}>
            <DialogContent className={cn("sm:max-w-3xl max-h-[90vh] overflow-y-auto", className)}>
              <DialogHeader className="sr-only">
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
              {children}
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer
            snapPoints={snapPoints}
            activeSnapPoint={activeSnapPoint}
            setActiveSnapPoint={setActiveSnapPoint}
            {...props}
          >
            <DrawerContent
              className={cn("overflow-hidden", className)}
              style={
                activeSnapPoint && typeof activeSnapPoint === 'string' && activeSnapPoint.endsWith('px')
                  ? { height: activeSnapPoint }
                  : {}
              }
            >
              <DrawerHeader className="text-left sr-only">
                <DrawerTitle>{title}</DrawerTitle>
                {description && <DrawerDescription>{description}</DrawerDescription>}
              </DrawerHeader>
              {(() => {
                // Determine if we are at the max snap point (fully expanded)
                // If snapPoints is not provided, we assume it's fully open (standard drawer)
                // If snapPoints is provided, we check if activeSnapPoint is the last one (max height)
                // Note: snapPoints can be numbers (0-1) or strings ("px").
                // We assume the last snap point is the "max" one.
                const isAtMaxSnapPoint = !snapPoints || !activeSnapPoint || activeSnapPoint === snapPoints[snapPoints.length - 1]

                return (
                  <Scroller className={cn("flex-1", !isAtMaxSnapPoint && "overflow-hidden pointer-events-none")}>
                    <div className={cn(!isAtMaxSnapPoint && "pointer-events-auto")}>
                      {children}
                    </div>
                  </Scroller>
                )
              })()}
            </DrawerContent>
          </Drawer>
        )}
      </ResponsiveDialogContext.Provider>
    )
  }

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <Dialog {...props}>{children}</Dialog>
      ) : (
        <Drawer
          snapPoints={snapPoints}
          activeSnapPoint={activeSnapPoint}
          setActiveSnapPoint={setActiveSnapPoint}
          {...props}
        >
          {children}
        </Drawer>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

export function ResponsiveDialogTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogTrigger className={className} {...props}>
        {children}
      </DialogTrigger>
    )
  }

  return (
    <DrawerTrigger className={className} {...props}>
      {children}
    </DrawerTrigger>
  )
}

export function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  return (
    <DrawerContent className={className} {...props}>
      {children}
    </DrawerContent>
  )
}

export function ResponsiveDialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogHeader className={className} {...props}>
        {children}
      </DialogHeader>
    )
  }

  return (
    <DrawerHeader className={className} {...props}>
      {children}
    </DrawerHeader>
  )
}

export function ResponsiveDialogTitle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogTitle className={className} {...props}>
        {children}
      </DialogTitle>
    )
  }

  return (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  )
}

export function ResponsiveDialogDescription({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogDescription className={className} {...props}>
        {children}
      </DialogDescription>
    )
  }

  return (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  )
}

export function ResponsiveDialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogFooter className={className} {...props}>
        {children}
      </DialogFooter>
    )
  }

  return (
    <DrawerFooter className={className} {...props}>
      {children}
    </DrawerFooter>
  )
}

export function ResponsiveDialogClose({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const { isDesktop } = React.useContext(ResponsiveDialogContext)

  if (isDesktop) {
    return (
      <DialogClose className={className} {...props}>
        {children}
      </DialogClose>
    )
  }

  return (
    <DrawerClose className={className} {...props}>
      {children}
    </DrawerClose>
  )
}

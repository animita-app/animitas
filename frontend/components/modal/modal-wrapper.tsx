'use client'

import { useRouter } from 'next/navigation'
import { useIsMobileOverlay } from '@/hooks/use-mobile'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface ModalWrapperProps {
  children: React.ReactNode
  title: string
  description: string
  className?: string
  showTitle?: boolean
}

export function ModalWrapper({ children, title, description, className, showTitle = true }: ModalWrapperProps) {
  const router = useRouter()
  const isMobile = useIsMobileOverlay()

  const onOpenChange = (open: boolean) => {
    if (!open) router.back()
  }

  if (isMobile === undefined) return null

  if (isMobile) {
    return (
      <Drawer open onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className="overflow-hidden">
          <DrawerTitle className={showTitle ? "px-4 text-2xl font-medium" : "sr-only"}>{title}</DrawerTitle>
          <DrawerDescription className="sr-only">{description}</DrawerDescription>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-9/10 sm:!max-w-sm overflow-y-auto", className)}>
        <DialogHeader className={showTitle ? "" : "sr-only"}>
          <DialogTitle className={showTitle ? "text-2xl font-medium" : undefined}>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  showTitle?: boolean
}

export function ModalWrapper({
  children,
  title = "Modal",
  description = "Description",
  className,
  showTitle = true
}: ModalWrapperProps) {
  const router = useRouter()

  const onOpenChange = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] sm:!max-w-sm overflow-y-auto", className)}>
        <DialogHeader className={showTitle ? "" : "sr-only"}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {showTitle && <h1 className="text-2xl font-medium">{title}</h1>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

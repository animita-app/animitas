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
      <DialogContent className={cn("gap-8 py-12 md:p-16 md:max-w-5xl bg-background text-black border-none shadow-xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {showTitle && <h1 className="text-2xl font-medium">{title}</h1>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

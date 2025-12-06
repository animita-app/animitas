'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const onOpenChange = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="gap-8 py-12 md:p-16 md:max-w-5xl bg-background text-black border-none shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Mejora tu plan</DialogTitle>
          <DialogDescription>Accede a más funcionalidades en ÁNIMA</DialogDescription>
        </DialogHeader>
        <h1 className="text-2xl font-medium">Mejora tu plan</h1>
        {children}
      </DialogContent>
    </Dialog>
  )
}

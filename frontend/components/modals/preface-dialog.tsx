'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Map, Headphones } from "lucide-react"

interface PrefaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrefaceDialog({ open, onOpenChange }: PrefaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-12 gap-8 bg-transparent border-0 shadow-none [&_button:has(svg)]:sr-only focus:ring-0"
        overlayClassName="backdrop-blur-xs bg-background/20"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            Bienvenido a Animitas
          </DialogTitle>
          <DialogDescription>
            Una experiencia inmersiva para explorar el patrimonio memorial de las carreteras.
          </DialogDescription>
        </DialogHeader>

        <p className="text-black">
          ÁNIMA es un mapa vivo de memorias al borde del camino. <br /><br />
          Al viajar por Chile, estas huellas del duelo y la devoción aparecen como puntos de luz en el territorio. <br /><br />
          Un espacio para detenerse, mirar y acompañar las historias que siguen resonando en medio del tránsito.
        </p>

        <Button size="sm" className="w-fit focus-visible:!ring-accent/10" onClick={() => onOpenChange(false)}>
          Empezar
        </Button>
      </DialogContent>
    </Dialog>
  )
}

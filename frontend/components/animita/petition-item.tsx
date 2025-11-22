import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import type { Petition } from '@/types/mock'

interface PetitionItemProps {
  petition: Petition
}

const STATUS_ICONS = {
  activa: <Circle className="w-4 h-4 text-blue-500 fill-blue-500" />,
  cumplida: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  expirada: <XCircle className="w-4 h-4 text-muted-foreground" />,
}

const STATUS_LABELS = {
  activa: 'Activa',
  cumplida: 'Cumplida',
  expirada: 'Expirada',
}

const STATUS_COLORS = {
  activa: 'bg-blue-50 border-blue-200',
  cumplida: 'bg-green-50 border-green-200',
  expirada: 'bg-muted border-border',
}

export function PetitionItem({ petition }: PetitionItemProps) {
  const date = new Date(petition.fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className={`p-3 rounded border ${STATUS_COLORS[petition.estado]}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {STATUS_ICONS[petition.estado]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">
            {petition.texto}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{date}</span>
            <span>•</span>
            <span>{petition.duracion}</span>
            <span>•</span>
            <span>{STATUS_LABELS[petition.estado]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { CheckCircle2 } from 'lucide-react'
import { CutoutText } from '@/components/cutout-text'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAnimitas } from '@/contexts/animitas-context'

// The list's only filter. The trigger is the word itself, cut out; chosen comunas replace it.
export function ComunaFilter() {
  const { comunas, selectedComunas, setSelectedComunas } = useAnimitas()
  const label = selectedComunas.length === 0 ? 'comuna' : selectedComunas.length === 1 ? selectedComunas[0] : `${selectedComunas.length} comunas`

  const toggle = (comuna: string) =>
    setSelectedComunas(selectedComunas.includes(comuna) ? selectedComunas.filter(c => c !== comuna) : [...selectedComunas, comuna])

  return (
    <div className="flex items-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={selectedComunas.length ? `Comuna: ${selectedComunas.join(', ')}` : 'Filtrar por comuna'}
          className="rounded-md outline-none transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
        >
          <CutoutText text={label} height={26} arc={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80">
          {comunas.map(comuna => (
            <DropdownMenuItem key={comuna} onSelect={(e) => { e.preventDefault(); toggle(comuna) }} className="justify-between gap-6">
              {comuna}
              {selectedComunas.includes(comuna) && <CheckCircle2 />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedComunas.length > 0 && (
        <button
          type="button"
          onClick={() => setSelectedComunas([])}
          aria-label="Ver todas las comunas"
          className="rounded-md opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <CutoutText text="todas" height={18} />
        </button>
      )}
    </div>
  )
}

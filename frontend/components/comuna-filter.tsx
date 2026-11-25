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
import { cn } from '@/lib/utils'

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
        {/* Comunas as street plates stacked under the word, like the search results: blue, green once chosen. */}
        <DropdownMenuContent align="start" className="flex max-h-96 flex-col items-start gap-1.5 bg-transparent p-2 shadow-none">
          {comunas.map((comuna, i) => {
            const chosen = selectedComunas.includes(comuna)
            return (
              <DropdownMenuItem
                key={comuna}
                onSelect={(e) => { e.preventDefault(); toggle(comuna) }}
                className={cn(
                  'road-sign road-sign-text w-max gap-3 px-3 py-1.5 text-base transition-[translate] duration-150 data-[highlighted]:translate-x-1',
                  chosen ? '' : 'road-sign-blue',
                  i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.4deg]'
                )}
              >
                {comuna}
                {chosen && <CheckCircle2 className="text-current" />}
              </DropdownMenuItem>
            )
          })}
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

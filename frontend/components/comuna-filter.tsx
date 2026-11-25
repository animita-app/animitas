'use client'

import { CheckCircle2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAnimitas } from '@/contexts/animitas-context'
import { cn } from '@/lib/utils'

// The list's only filter: a street plate that names the comunas shown and opens the rest.
export function ComunaFilter() {
  const { comunas, selectedComunas, setSelectedComunas } = useAnimitas()
  const label = selectedComunas.length === 1 ? selectedComunas[0] : `${selectedComunas.length} comunas`

  const toggle = (comuna: string) =>
    setSelectedComunas(selectedComunas.includes(comuna) ? selectedComunas.filter(c => c !== comuna) : [...selectedComunas, comuna])

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        {/* A street plate like the search's results, with a chevron so it reads as something that opens. */}
        <DropdownMenuTrigger asChild>
          <Button
            variant="sign-service"
            aria-label={selectedComunas.length ? `Comuna: ${selectedComunas.join(', ')}` : 'Filtrar por comuna'}
            className="-rotate-1"
          >
            {selectedComunas.length === 0 ? 'Todas las comunas' : label}
            <ChevronDown aria-hidden />
          </Button>
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
        <Button variant="link" className="h-auto p-0 text-text-weak" onClick={() => setSelectedComunas([])} aria-label="Ver todas las comunas">
          Ver todas
        </Button>
      )}
    </div>
  )
}

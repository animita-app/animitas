'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSearchLocation } from '@/hooks/use-search-location'
import { useAnimitas } from '@/contexts/animitas-context'

// A green Chilean road sign you write on. Results stack under it as destination plates, like at a junction.
export function RoadSignSearch() {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [active, setActive] = useState(-1)
  const { setQuery, area, setArea } = useAnimitas()
  const { open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation(setQuery)

  useEffect(() => setActive(-1), [searchResults])

  const choose = (result: any) => {
    handleSelect(result)
    setValue('')
    setQuery('')
    inputRef.current?.blur()
  }

  const results = open ? searchResults : []
  const searching = value.trim().length >= 3
  const empty = searching && open && !isLoading && results.length === 0

  return (
    <div className="relative -rotate-1">
      <label htmlFor={`${id}-input`} className="road-sign flex items-center gap-2 px-5 py-3">
        <span className="sr-only">Buscar una animita o un lugar</span>
        <input
          ref={inputRef}
          id={`${id}-input`}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={`${id}-results`}
          aria-activedescendant={active >= 0 ? `${id}-result-${active}` : undefined}
          autoComplete="off"
          value={value}
          placeholder="Busca una animita o un lugar"
          onChange={(e) => {
            setValue(e.target.value)
            handleSearch(e.target.value)
          }}
          onBlur={() => setOpen(false)}
          onFocus={() => { if (searchResults.length) setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, -1)) }
            if (e.key === 'Enter' && results[Math.max(active, 0)]) { e.preventDefault(); choose(results[Math.max(active, 0)]) }
            if (e.key === 'Escape') { setValue(''); resetSearch(); setOpen(false) }
          }}
          className="road-sign-text w-52 bg-transparent outline-none md:w-64"
        />
      </label>

      {/* The chosen area, as a street plate hanging under the sign, with an X to take it off. */}
      {area && results.length === 0 && (
        <div className="absolute left-2 top-full mt-2 flex w-max rotate-1 items-center gap-2">
          <span className="road-sign road-sign-blue road-sign-text px-3 py-1">{area.label}</span>
          <Button variant="link" className="h-auto p-0 text-text-weak" onClick={() => setArea(null)} aria-label={`Quitar el filtro de ${area.label}`}>
            <X />
          </Button>
        </div>
      )}

      <p role="status" className={cn('absolute left-0 top-full mt-1.5 w-max', !empty && 'sr-only')}>
        {empty && <span className="road-sign road-sign-text block rotate-[0.4deg] px-3 py-1.5 opacity-80">Sin resultados</span>}
      </p>

      {results.length > 0 && (
        <ul id={`${id}-results`} role="listbox" aria-label="Resultados" className="absolute left-0 top-full mt-1.5 flex w-max max-w-[calc(100vw-2rem)] flex-col gap-1.5">
          {results.map((result, i) => (
            <li
              key={result.id}
              id={`${id}-result-${i}`}
              role="option"
              aria-selected={active === i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(result)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'road-sign road-sign-text flex cursor-pointer items-center gap-3 px-3 py-1.5 transition-[translate] duration-150',
                result.type === 'local' ? '' : 'road-sign-blue',
                i % 2 ? 'rotate-[0.6deg]' : '-rotate-[0.4deg]',
                active === i && 'translate-x-1'
              )}
            >
              <span className="text-pretty">{result.title || result.text || result.place_name}</span>
              <ArrowUpRight aria-hidden className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

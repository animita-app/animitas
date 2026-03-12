"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface TwoLevelItem {
  value: string
  label: string
}

export interface TwoLevelCategory {
  key: string
  label: string
  items: TwoLevelItem[]
  multiSelect?: boolean
}

export interface TwoLevelComboboxProps {
  trigger: React.ReactElement
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: TwoLevelCategory[]
  selectedValues: string[]
  onToggle: (value: string, categoryKey: string, isSelected: boolean) => void
  canCreate?: boolean
  onCreateItem?: (value: string, categoryKey: string) => void
  contentClassName?: string
  contentWidth?: string
}

type ItemWithCategory = TwoLevelItem & { categoryKey: string }

export function TwoLevelCombobox({
  trigger,
  open,
  onOpenChange,
  categories,
  selectedValues,
  onToggle,
  canCreate = false,
  onCreateItem,
  contentClassName,
  contentWidth = 'w-56',
}: TwoLevelComboboxProps) {
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const directionRef = useRef<"forward" | "back" | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedSet = new Set(selectedValues)
  const activeCategory = categories.find(c => c.key === activeCategoryKey) ?? null
  const isSearching = !!query.trim()
  const q = query.toLowerCase()

  useEffect(() => {
    if (!open) {
      setActiveCategoryKey(null)
      setQuery("")
      directionRef.current = null
    } else if (categories.length === 1 && !activeCategoryKey) {
      setActiveCategoryKey(categories[0].key)
    }
  }, [open, categories, activeCategoryKey])

  const navigateForward = (key: string) => {
    directionRef.current = "forward"
    setActiveCategoryKey(key)
    setQuery("")
  }

  const navigateBack = () => {
    directionRef.current = "back"
    setActiveCategoryKey(null)
    setQuery("")
  }

  const focusInput = () => {
    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus()
  }

  const focusFirstItem = () => {
    containerRef.current?.querySelector<HTMLButtonElement>("[data-list-item]")?.focus()
  }

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return
    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>("[data-list-item]") ?? []
    )
    const idx = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      items[Math.min(idx + 1, items.length - 1)]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (idx <= 0) focusInput()
      else items[idx - 1]?.focus()
    }
  }

  const showCategoryList = !activeCategoryKey
  const showItemList = !!activeCategoryKey

  const visibleCategories: TwoLevelCategory[] = showCategoryList
    ? (isSearching
        ? categories.filter(cat => cat.label.toLowerCase().includes(q))
        : categories)
    : []

  const visibleItems: ItemWithCategory[] = showItemList
    ? (isSearching
        ? activeCategory!.items
            .filter(item => item.label.toLowerCase().includes(q))
            .map(item => ({ ...item, categoryKey: activeCategory!.key }))
        : activeCategory!.items.map(item => ({ ...item, categoryKey: activeCategory!.key }))
      )
    : []

  const canCreateItem =
    canCreate &&
    isSearching &&
    !!activeCategoryKey &&
    !visibleItems.some(item => item.label.toLowerCase() === query.trim().toLowerCase())

  const allValues = categories.flatMap(cat => cat.items.map(i => i.value))

  return (
    <Combobox
      items={allValues}
      value={selectedValues}
      onValueChange={() => {}}
      multiple
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setActiveCategoryKey(null)
          setQuery("")
          directionRef.current = null
        }
        onOpenChange(nextOpen)
      }}
    >
      <ComboboxTrigger render={trigger} />
      <ComboboxContent
        align="start"
        className={cn(contentWidth, "p-0 border-0 shadow-2xl overflow-hidden", contentClassName)}
      >
        <div
          ref={containerRef}
          className="flex flex-col w-full backdrop-blur-md rounded-md"
          onKeyDown={handleListKeyDown}
          onKeyDownCapture={(e) => {
            if (!activeCategoryKey) return
            if (e.key === "Escape") {
              e.preventDefault()
              e.stopPropagation()
              navigateBack()
              return
            }
            if (e.key === "ArrowLeft") {
              const isInput = (e.target as HTMLElement).tagName === "INPUT"
              if (!isInput || !query) {
                e.preventDefault()
                e.stopPropagation()
                navigateBack()
              }
            }
          }}
        >
          <ComboboxInput
            showTrigger={false}
            placeholder="Buscar..."
            autoFocus
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
            className="!bg-neutral-900/50 !border-b-0 !border-b-transparent h-10 shrink-0"
            onKeyDown={(e: any) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                focusFirstItem()
                return
              }
              if (e.key === "Enter" && canCreateItem) {
                e.preventDefault()
                onCreateItem?.(query.trim(), activeCategoryKey ?? "")
                setQuery("")
              }
            }}
            customLeftSection={
              activeCategoryKey ? (
                <button
                  onClick={navigateBack}
                  className="group size-6 flex items-center justify-center transition-all hover:bg-white/10 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="size-4 text-white/25 group-hover:text-white transition-colors" />
                </button>
              ) : (
                <div className="size-6 flex items-center justify-center">
                  <Search className="size-4 text-white/25" />
                </div>
              )
            }
          />

          <ScrollArea className="max-h-64">
            <div className="relative">
              {showCategoryList && (
                <div
                  className={cn(
                    "p-1 flex flex-col gap-0.5",
                    directionRef.current === "back" && "animate-in slide-in-from-left-4 fade-in duration-200"
                  )}
                >
                  {visibleCategories.length > 0 ? (
                    visibleCategories.map(cat => {
                      const selectedInCat = cat.items.filter(item => selectedSet.has(item.value))
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          data-list-item
                          onClick={() => navigateForward(cat.key)}
                          className="group flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer select-none"
                        >
                          <span className="text-white font-normal truncate text-left">{cat.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {selectedInCat.length > 0 && (
                              <span className="bg-white/20 text-white tabular-nums min-w-4 h-4 px-1 rounded-full text-xs font-normal flex items-center justify-center">
                                {selectedInCat.length}
                              </span>
                            )}
                            <ChevronRight className="size-4 text-white" />
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <p className="px-2 py-6 text-sm text-white/30 font-normal text-center">
                      No se encontraron resultados
                    </p>
                  )}
                </div>
              )}

              {showItemList && (
                <div
                  className={cn(
                    "w-full flex flex-col",
                    directionRef.current === "forward" && "animate-in slide-in-from-right-4 fade-in duration-200"
                  )}
                >
                  {visibleItems.length > 0 && (
                    <div className="p-1 flex flex-col gap-0.5">
                      {(() => {
                        const anySelected = visibleItems.some(i => selectedSet.has(i.value))
                        return visibleItems.map(item => {
                          const isSelected = selectedSet.has(item.value)
                          return (
                            <button
                              key={`${item.categoryKey}/${item.value}`}
                              type="button"
                              data-list-item
                              onClick={() => {
                                onToggle(item.value, item.categoryKey, isSelected)
                                if (!isSelected && !activeCategory?.multiSelect) navigateBack()
                              }}
                              className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer"
                            >
                              <span className={cn(
                                "transition-colors text-left font-normal",
                                anySelected && !isSelected ? "text-white/50" : "text-white"
                              )}>
                                {item.label}
                              </span>
                              {isSelected && <Check className="size-4 text-white shrink-0" />}
                            </button>
                          )
                        })
                      })()}
                    </div>
                  )}

                  {visibleItems.length === 0 && !canCreateItem && (
                    <p className="px-2 py-6 text-sm text-white/30 font-normal text-center">
                      No se encontraron resultados
                    </p>
                  )}

                  {canCreateItem && (
                    <div className="p-1 border-t border-white/5 mt-1">
                      <button
                        type="button"
                        data-list-item
                        onClick={() => { onCreateItem?.(query.trim(), activeCategoryKey ?? ""); setQuery("") }}
                        className="w-full flex items-center px-2 py-2 text-sm font-medium text-white/60 hover:bg-white/10 focus:bg-white/10 hover:text-white rounded-sm transition-colors"
                      >
                        <Plus className="mr-2 size-4" />
                        Crear &quot;{query.trim()}&quot;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </ComboboxContent>
    </Combobox>
  )
}

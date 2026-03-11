"use client"

import { cn } from "@/lib/utils"
import { TwoLevelCombobox, TwoLevelCategory } from "@/components/ui/two-level-combobox"

export interface InsightChipConfig {
  label: string
  dot: string
  trigger: string
}

export interface InsightChipProps {
  config: InsightChipConfig
  categories: TwoLevelCategory[]
  selectedValues: string[]
  onToggle: (value: string, subcategory: string, isSelected: boolean) => void
  canCreate?: boolean
  onCreateItem?: (value: string, subcategory: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsightChip({
  config,
  categories,
  selectedValues,
  onToggle,
  canCreate,
  onCreateItem,
  open,
  onOpenChange,
}: InsightChipProps) {
  const count = selectedValues.length

  return (
    <TwoLevelCombobox
      open={open}
      onOpenChange={onOpenChange}
      categories={categories}
      selectedValues={selectedValues}
      onToggle={onToggle}
      canCreate={canCreate}
      onCreateItem={onCreateItem}
      trigger={
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full pl-2.5 pr-1 py-0.5 text-sm font-medium transition-colors cursor-pointer outline-none",
            count > 0
              ? config.trigger
              : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
            open && "brightness-90 shadow-inner ring-1 ring-white/10"
          )}
        >
          {config.label}
          <span
            className={cn(
              "ml-1.5 tabular-nums min-w-4 min-h-4 rounded-full text-xs flex items-center justify-center",
              count > 0 ? config.dot : "bg-neutral-300"
            )}
          >
            {count || "0"}
          </span>
        </button>
      }
    />
  )
}

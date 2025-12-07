"use client"

import React from "react"
import { HeritageSite } from "@/types/mock"
import { InfoBlock } from "./info-block"
import { cn } from "@/lib/utils"

// Helper to safely access nested properties
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj)
}

interface AttributeConfig {
  key: string
  label: string
  format?: (value: any) => React.ReactNode
}

const SITE_ATTRIBUTES: AttributeConfig[] = [
  // Top level
  { key: "typology", label: "Tipología" },
  { key: "size", label: "Tamaño" },


  // Memorial Insights
  { key: "insights.memorial.death_cause", label: "Causa de muerte" },
  {
    key: "insights.memorial.social_roles",
    label: "Roles sociales",
    format: (val: string[]) => val?.join(", ")
  },
  { key: "insights.memorial.narrator_relation", label: "Relación del narrador" },

  // Spiritual Insights
  {
    key: "insights.spiritual.rituals_mentioned",
    label: "Rituales",
    format: (val: string[]) => val?.join(", ")
  },
  {
    key: "insights.spiritual.offerings_mentioned",
    label: "Ofrendas",
    format: (val: string[]) => val?.join(", ")
  },


  // Patrimonial Insights

  // 'size' is also in patrimonial sometimes, but we have top level size too.
]

interface DetailedInfoSectionProps {
  site: HeritageSite
}

export function DetailedInfoSection({ site }: DetailedInfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 items-center">
      {SITE_ATTRIBUTES.map((attr) => {
        const rawValue = getNestedValue(site, attr.key)

        // Skip if value is null, undefined, or empty array
        if (rawValue === null || rawValue === undefined || (Array.isArray(rawValue) && rawValue.length === 0)) {
          return null
        }

        const displayValue = attr.format ? attr.format(rawValue) : rawValue

        return (
          <InfoBlock key={attr.key} label={attr.label}>
            <p className="text-sm text-foreground/90">{displayValue}</p>
          </InfoBlock>
        )
      })}
    </div>
  )
}

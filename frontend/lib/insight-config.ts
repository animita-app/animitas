import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Centralized color config for heritage site insight categories.
 * Chip classes are built from badgeVariants for consistency with
 * the design system, with category-specific color overrides.
 */
export const INSIGHT_CATEGORY_CONFIG: Record<string, {
  label: string;
  chip: string; // badge classes for chip display
  dot: string; // small dot indicator (bg only)
  trigger: string; // active trigger badge
}> = {
  memorial: {
    label: "Memorial",
    chip: cn(
      badgeVariants({ variant: "outline" }),
      "bg-pink-100 text-pink-700",
    ),
    dot: "bg-pink-300/60",
    trigger: "rounded-full bg-pink-100 text-pink-700",
  },
  spiritual: {
    label: "Espiritual",
    chip: cn(
      badgeVariants({ variant: "outline" }),
      "bg-sky-400 text-sky-700",
    ),
    dot: "bg-sky-300/60",
    trigger: "rounded-full bg-sky-100 text-sky-700",
  },
  patrimonial: {
    label: "Patrimonial",
    chip: cn(
      badgeVariants({ variant: "outline" }),
      "rounded-full bg-amber-100 text-amber-700",
    ),
    dot: "bg-amber-300/60",
    trigger: "rounded-full bg-amber-100 text-amber-700",
  },
};

/** Ordered list of categories for consistent rendering */
export const INSIGHT_CATEGORIES = [
  "memorial",
  "spiritual",
  "patrimonial",
] as const;
export type InsightCategory = typeof INSIGHT_CATEGORIES[number];

/** Base chip class — use with cfg.chip which already includes badgeVariants */
export const INSIGHT_CHIP_BASE = "rounded-full";

/** Map heritage kind/category to available insight categories */
export const INSIGHT_CATEGORIES_BY_KIND: Record<string, InsightCategory[]> = {
  animita: ["memorial"],
  "burial-site": ["memorial", "spiritual"],
  shrine: ["spiritual", "patrimonial"],
  monument: ["patrimonial"],
  "sacred-site": ["spiritual"],
};

/**
 * Get available insight categories for a heritage site kind
 * Falls back to all categories if kind not found
 */
export function getAvailableInsightCategories(kind?: string): InsightCategory[] {
  if (!kind) return [...INSIGHT_CATEGORIES];
  return INSIGHT_CATEGORIES_BY_KIND[kind] || [...INSIGHT_CATEGORIES];
}

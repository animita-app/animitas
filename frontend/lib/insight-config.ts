/**
 * Centralized color config for heritage site insight categories.
 * Single source of truth used by InsightsSection, any future
 * component that renders insight chips, dots, or triggers.
 */
export const INSIGHT_CATEGORY_CONFIG: Record<string, {
  label: string;
  chip: string; // colored chip (bg + text)
  dot: string; // small dot indicator (bg only)
  trigger: string; // active trigger badge (bg + text)
}> = {
  memorial: {
    label: "Memorial",
    chip: "text-pink-700 bg-pink-200",
    dot: "bg-rose-400",
    trigger: "bg-pink-200 text-pink-700",
  },
  spiritual: {
    label: "Espiritual",
    chip: "text-sky-700 bg-sky-200",
    dot: "bg-violet-400",
    trigger: "bg-sky-200 text-sky-700",
  },
  patrimonial: {
    label: "Patrimonial",
    chip: "text-accent bg-accent/10",
    dot: "bg-amber-400",
    trigger: "bg-amber-100 text-amber-700",
  },
};

/** Ordered list of categories for consistent rendering */
export const INSIGHT_CATEGORIES = [
  "memorial",
  "spiritual",
  "patrimonial",
] as const;
export type InsightCategory = typeof INSIGHT_CATEGORIES[number];

export const INSIGHT_CHIP_BASE =
  "inline-flex items-center gap-1 px-2 h-6 rounded-full text-sm font-normal";

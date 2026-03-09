/**
 * Centralized color config for heritage site insight categories.
 * Used in InsightsSection chips, DetailedInfoSection combobox, and any
 * other place that needs consistent insight category styling.
 */
export const INSIGHT_CATEGORY_CONFIG: Record<string, {
  label: string;
  chip: string; // full chip class (bg + text + border)
  dot: string; // small dot indicator class (bg only)
}> = {
  memorial: {
    label: "Memorial",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-400",
  },
  spiritual: {
    label: "Espiritual",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-400",
  },
  patrimonial: {
    label: "Patrimonial",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
};

export const INSIGHT_CHIP_BASE =
  "inline-flex items-center gap-1 px-2 h-6 rounded-full border text-xs font-normal";

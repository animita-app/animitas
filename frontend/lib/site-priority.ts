export type SitePriority = 'urgent' | 'medium' | 'ok'

const MIN_VOTES = 3

export function getSitePriority(voteCounts: Record<string, number>): SitePriority {
  const correct = voteCounts['correct'] ?? 0
  const incomplete = voteCounts['incomplete'] ?? 0
  const errors = voteCounts['errors'] ?? 0
  const total = correct + incomplete + errors

  if (total < MIN_VOTES) return 'ok'

  const errorPct = errors / total
  const incompletePct = incomplete / total

  if (errorPct >= 0.4) return 'urgent'
  if (incompletePct >= 0.4 || errorPct + incompletePct >= 0.5) return 'medium'
  return 'ok'
}

export const PRIORITY_CONFIG: Record<SitePriority, { label: string | null; className: string | null }> = {
  urgent: {
    label: 'Urgente',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  medium: {
    label: 'Prioridad media',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  ok: {
    label: null,
    className: null,
  },
}

export const PRIORITY_ORDER: Record<SitePriority, number> = {
  urgent: 0,
  medium: 1,
  ok: 2,
}

export function aggregateVoteCounts(
  votes: { site_id: string; option: string }[]
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {}
  for (const { site_id, option } of votes) {
    if (!result[site_id]) result[site_id] = {}
    result[site_id][option] = (result[site_id][option] ?? 0) + 1
  }
  return result
}

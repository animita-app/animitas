// The sheet only tells the start of a story: whole sentences up to a length, never a cut word.
// The full page tells the rest.
export function storyExcerpt(story: string | null | undefined, max = 260): { text: string; more: boolean } {
  const clean = (story ?? '').trim()
  if (clean.length <= max) return { text: clean, more: false }
  const sentences = clean.split(/(?<=[.!?…])\s+/)
  let text = ''
  for (const sentence of sentences) {
    const next = text ? `${text} ${sentence}` : sentence
    if (next.length > max) break
    text = next
  }
  if (!text) {
    const cut = clean.slice(0, max)
    text = `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`
  }
  return { text, more: true }
}

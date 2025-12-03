export function formatPlaceName(name: string): string {
  if (!name) return ''

  // Example: "Providencia, Santiago, Chile" -> "Providencia"
  // Example: "Región Metropolitana de Santiago, Chile" -> "Región Metropolitana"

  const parts = name.split(',')
  if (parts.length > 0) {
    return parts[0].trim()
  }

  return name
}

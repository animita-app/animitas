export const sanitizeSlugPart = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
}

export const createSlugFromParts = (...parts: string[]): string => {
  const sanitizedParts = parts
    .filter(part => part && part.trim().length > 0)
    .map(sanitizeSlugPart)
    .filter(part => part.length > 0)

  if (sanitizedParts.length === 0) {
    return 'animita-memorial'
  }

  return sanitizedParts.join('-')
}

export const generateMemorialSlugPreview = (memorialName: string, personName: string): string => {
  const slug = createSlugFromParts(memorialName, personName)
  return `/animita/${slug}`
}

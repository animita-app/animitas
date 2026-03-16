export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  backoffMultiplier?: number
  maxDelayMs?: number
}

export class RetryError extends Error {
  constructor(public attempts: number, message: string) {
    super(message)
    this.name = 'RetryError'
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    backoffMultiplier = 2,
    maxDelayMs = 10000,
  } = options

  let lastError: Error | null = null
  let delayMs = initialDelayMs

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        throw new RetryError(attempt, `Failed after ${maxAttempts} attempts: ${lastError.message}`)
      }

      await new Promise(resolve => setTimeout(resolve, delayMs))
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs)
    }
  }

  throw lastError || new RetryError(maxAttempts, 'Unknown error')
}

export function validateImageFile(file: File): string | null {
  const MAX_SIZE_MB = 20
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo de archivo no válido: ${file.type}. Usa JPG, PNG, WebP o GIF.`
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo ${MAX_SIZE_MB}MB.`
  }

  return null
}

import { getErrorMessage } from './utils'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

interface ApiRequestOptions extends RequestInit {
  timeout?: number
}

export async function apiCall<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `HTTP ${response.status}`,
        message: errorData.message
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      return { error: 'Request timeout' }
    }

    return { error: getErrorMessage(error) }
  }
}

export async function apiGet<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { method: 'GET' })
}

export async function apiPost<T = unknown>(
  url: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function apiPatch<T = unknown>(
  url: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

export async function apiDelete<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { method: 'DELETE' })
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  const url = path.startsWith('http') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`
  const response = await apiCall<T>(url, options)

  if (response.error) {
    throw new Error(response.error)
  }

  return response.data as T
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

export function buildUrl(base: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return base
  const query = buildQueryString(params)
  return query ? `${base}?${query}` : base
}

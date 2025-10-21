export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  title?: string
  duration?: number
}

let notificationListeners: ((notification: Notification) => void)[] = []

function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function notifyListeners(notification: Notification): void {
  notificationListeners.forEach((listener) => listener(notification))
}

export function subscribe(listener: (notification: Notification) => void): () => void {
  notificationListeners.push(listener)
  return () => {
    notificationListeners = notificationListeners.filter((l) => l !== listener)
  }
}

export function showNotification(
  type: NotificationType,
  message: string,
  title?: string,
  duration?: number
): string {
  const id = generateId()

  const notification: Notification = {
    id,
    type,
    message,
    title,
    duration: duration ?? (type === 'error' ? 5000 : 3000)
  }

  notifyListeners(notification)

  return id
}

export function showSuccess(message: string, title?: string, duration?: number): string {
  return showNotification('success', message, title, duration)
}

export function showError(message: string, title?: string, duration?: number): string {
  return showNotification('error', message, title, duration)
}

export function showInfo(message: string, title?: string, duration?: number): string {
  return showNotification('info', message, title, duration)
}

export function showWarning(message: string, title?: string, duration?: number): string {
  return showNotification('warning', message, title, duration)
}

export function showLoading(message: string): string {
  return showNotification('info', message, undefined, 0)
}

export async function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error?: string
  }
): Promise<T> {
  const id = showLoading(messages.loading)

  try {
    const result = await promise
    notifyListeners({
      id,
      type: 'success',
      message: messages.success,
      duration: 3000
    })
    return result
  } catch (error) {
    const errorMessage = messages.error || (error instanceof Error ? error.message : 'An error occurred')
    notifyListeners({
      id,
      type: 'error',
      message: errorMessage,
      duration: 5000
    })
    throw error
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => {
      showSuccess('Copied to clipboard')
      return true
    })
    .catch(() => {
      showError('Failed to copy to clipboard')
      return false
    })
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function shareContent(data: {
  title?: string
  text?: string
  url?: string
}): Promise<void> {
  if (!navigator.share) {
    await copyToClipboard(data.url || window.location.href)
    return
  }

  return navigator.share(data).catch((error) => {
    if (error.name !== 'AbortError') {
      showError('Failed to share')
    }
  })
}

import { getErrorMessage } from './utils'

export class StorageManager {
  static set(key: string, value: any, storage: Storage = localStorage): void {
    try {
      const serialized = JSON.stringify(value)
      storage.setItem(key, serialized)
    } catch (error) {
      console.error(`Failed to set ${key}:`, getErrorMessage(error))
    }
  }

  static get<T = any>(key: string, storage: Storage = localStorage): T | null {
    try {
      const item = storage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get ${key}:`, getErrorMessage(error))
      return null
    }
  }

  static remove(key: string, storage: Storage = localStorage): void {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove ${key}:`, getErrorMessage(error))
    }
  }

  static clear(storage: Storage = localStorage): void {
    try {
      storage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', getErrorMessage(error))
    }
  }

  static setWithExpiry(key: string, value: any, expiryMs: number): void {
    const now = new Date()
    const item = {
      value,
      expiry: now.getTime() + expiryMs
    }
    this.set(key, item)
  }

  static getWithExpiry<T = any>(key: string): T | null {
    const item = this.get<{ value: T; expiry: number }>(key)

    if (!item) return null

    const now = new Date()
    if (now.getTime() > item.expiry) {
      this.remove(key)
      return null
    }

    return item.value
  }

  static exists(key: string, storage: Storage = localStorage): boolean {
    return storage.getItem(key) !== null
  }

  static keys(storage: Storage = localStorage): string[] {
    const keys: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) keys.push(key)
    }
    return keys
  }

  static size(storage: Storage = localStorage): number {
    return this.keys(storage).reduce((total, key) => {
      const item = storage.getItem(key)
      return total + (item ? item.length : 0)
    }, 0)
  }
}

export const useLocalStorage = (key: string, initialValue?: any) => {
  const setValue = (value: any) => StorageManager.set(key, value, localStorage)
  const getValue = () => StorageManager.get(key, localStorage)
  const removeValue = () => StorageManager.remove(key, localStorage)

  return {
    value: getValue() ?? initialValue,
    setValue,
    getValue,
    removeValue
  }
}

export const useSessionStorage = (key: string, initialValue?: any) => {
  const setValue = (value: any) => StorageManager.set(key, value, sessionStorage)
  const getValue = () => StorageManager.get(key, sessionStorage)
  const removeValue = () => StorageManager.remove(key, sessionStorage)

  return {
    value: getValue() ?? initialValue,
    setValue,
    getValue,
    removeValue
  }
}

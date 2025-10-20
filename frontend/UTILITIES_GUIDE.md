# Frontend Utilities Guide

Complete reference for all available utility functions across the codebase.

## 📍 Import Paths

All utilities are located in the `lib/` directory:

```typescript
// Formatting & validation
import { formatDate, formatDateRelative, formatPhoneNumber, truncate, capitalize } from '@/lib/utils'
import { isValidEmail, isValidPhone, isValidUsername } from '@/lib/utils'

// API calls
import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from '@/lib/api'
import { buildUrl, buildQueryString } from '@/lib/api'

// Image handling
import { uploadToCloudinary, getImageDimensions, isValidImageFile, getImageError } from '@/lib/image'
import { cloudinaryUrl, thumbnailUrl } from '@/lib/image'

// User management
import { getUserFromSession, fetchUserProfile, updateUserProfile } from '@/lib/user'
import { isAdmin, isPremium, getUserDisplayName, compareUsers } from '@/lib/user'

// Memorial operations
import { fetchMemorials, fetchMemorialById, lightCandle, addTestimony } from '@/lib/memorial'
import { calculateDistance, getMemorialStats, isMemorialOwner } from '@/lib/memorial'

// Storage
import { StorageManager, useLocalStorage, useSessionStorage } from '@/lib/storage'

// Notifications
import { showSuccess, showError, showInfo, showWarning, subscribe } from '@/lib/notifications'
import { copyToClipboard, downloadFile, shareContent } from '@/lib/notifications'

// Browser/DOM
import { isBrowser, scrollToElement, isElementInViewport, getDeviceType } from '@/lib/browser'
import { addClass, removeClass, hasClass, setAttribute, getAttribute } from '@/lib/browser'

// Constants & config
import { ADMIN_USERNAMES, USER_ROLES, API_ENDPOINTS, VALIDATION_RULES } from '@/lib/constants'
```

---

## 🎯 Common Use Cases

### Formatting Dates

```typescript
import { formatDate, formatDateRelative } from '@/lib/utils'

// Output: "Oct 20, 2025"
const date1 = formatDate('2025-10-20')

// Output: "2 hours ago"
const date2 = formatDateRelative(new Date())

// Custom format: "20/10/2025"
const date3 = formatDate('2025-10-20', 'dd/MM/yyyy')
```

### API Calls

```typescript
import { apiGet, apiPost, apiFetch } from '@/lib/api'

// Simple GET
const { data, error } = await apiGet('/memorials?page=1')
if (error) console.error(error)

// POST with data
const { data: user } = await apiPost('/users', { name: 'John' })

// Convenience method with auto-prefixed /api
const memorials = await apiFetch('/memorials')

// Build URLs with query params
import { buildUrl } from '@/lib/api'
const url = buildUrl('/users', { page: 1, limit: 10 })
```

### Image Upload

```typescript
import { uploadToCloudinary, getImageError } from '@/lib/image'

const file = event.target.files?.[0]

// Validate first
const error = getImageError(file)
if (error) {
  console.error(error) // "Image is too large. Maximum size is 5MB."
  return
}

// Upload to Cloudinary
const imageUrl = await uploadToCloudinary(file, {
  folder: 'profiles'
})

// Generate thumbnail
import { thumbnailUrl } from '@/lib/image'
const thumb = thumbnailUrl(imageUrl, 200)
```

### User Management

```typescript
import { getUserFromSession, isAdmin, getUserDisplayName } from '@/lib/user'
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
const user = getUserFromSession(session)

if (isAdmin(session)) {
  // Show admin panel
}

const displayName = getUserDisplayName(user) // "John Doe" or "johndoe"
```

### Memorial Operations

```typescript
import { fetchMemorials, lightCandle, calculateDistance } from '@/lib/memorial'

// Fetch with pagination
const { memorials, total } = await fetchMemorials({
  page: 1,
  limit: 10,
  search: 'query'
})

// Light a virtual candle
await lightCandle(memorialId, {
  duration: 'SEVEN_DAYS',
  message: 'Rest in peace'
})

// Calculate distance between two points
const distanceKm = calculateDistance(
  -33.8688,  // lat1
  -70.7678,  // lng1
  -33.4489,  // lat2
  -70.6693   // lng2
)
```

### Storage

```typescript
import { StorageManager } from '@/lib/storage'

// Save data
StorageManager.set('preferences', { theme: 'dark', language: 'es' })

// Retrieve data
const prefs = StorageManager.get('preferences')

// Save with expiry (expires in 1 hour)
StorageManager.setWithExpiry('session', token, 60 * 60 * 1000)

// Retrieve and auto-cleanup if expired
const token = StorageManager.getWithExpiry('session')

// Hook-like API
const { value, setValue, removeValue } = useLocalStorage('key', 'default')
```

### Notifications

```typescript
import { showSuccess, showError, showPromise, subscribe } from '@/lib/notifications'

// Simple notifications
showSuccess('Profile updated!')
showError('Something went wrong')

// Promise-based
showPromise(
  fetch('/api/save'),
  {
    loading: 'Saving...',
    success: 'Saved successfully',
    error: 'Failed to save'
  }
)

// Subscribe to all notifications
const unsubscribe = subscribe((notification) => {
  console.log(notification.type, notification.message)
})

// Cleanup
unsubscribe()

// Utility functions
copyToClipboard('Text to copy')
downloadFile('https://example.com/file.pdf', 'file.pdf')
shareContent({ title: 'Check this out', url: window.location.href })
```

### DOM/Browser

```typescript
import { scrollToElement, getDeviceType, isDarkMode, addClass, hasClass } from '@/lib/browser'

// Scroll
scrollToElement(element, true) // smooth scroll
scrollToElement(element, false) // instant scroll

// Device detection
const device = getDeviceType() // 'mobile' | 'tablet' | 'desktop'
const isTouch = isTouchDevice()

// Theme detection
if (isDarkMode()) {
  // Apply dark styles
}

// Listen to theme changes
const unsubscribe = onDarkModeChange((isDark) => {
  console.log(isDark ? 'Dark mode' : 'Light mode')
})

// DOM helpers
addClass(element, 'active')
removeClass(element, 'disabled')
toggleClass(element, 'expanded')
hasClass(element, 'active') // true/false
setAttribute(element, 'aria-label', 'Button')
```

---

## 🔄 Migration Guide: Replacing fetch() with API utilities

### Before
```typescript
try {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  const result = await response.json()
  return result
} catch (error) {
  console.error(error)
}
```

### After
```typescript
import { apiPost } from '@/lib/api'
import { showError } from '@/lib/notifications'

const { data, error } = await apiPost('/users', data)
if (error) {
  showError(error)
  return
}

return data
```

---

## 📋 Constants Reference

```typescript
import {
  ADMIN_USERNAMES,
  USER_ROLES,
  CANDLE_DURATIONS,
  API_ENDPOINTS,
  VALIDATION_RULES,
  IMAGE_CONFIG,
  ERROR_MESSAGES,
  ROUTES,
  STORAGE_KEYS
} from '@/lib/constants'

// Usage examples
if (ADMIN_USERNAMES.includes(username)) {
  // Is admin
}

const maxImageSize = IMAGE_CONFIG.MAX_SIZE // 5MB
const validImageTypes = IMAGE_CONFIG.VALID_TYPES // ['image/jpeg', ...]

const endpoint = API_ENDPOINTS.MEMORIALS.LIST // '/api/memorials'
const getUserEndpoint = API_ENDPOINTS.MEMORIALS.GET('123') // '/api/memorials/123'

if (value.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
  // Too short
}
```

---

## 🛡️ Error Handling Pattern

Always use the error handling utilities for consistency:

```typescript
import { getErrorMessage } from '@/lib/utils'
import { showError } from '@/lib/notifications'

try {
  // Perform operation
} catch (error) {
  // Extract error message (works with any error type)
  const message = getErrorMessage(error)

  // Show to user
  showError(message)

  // Log for debugging
  console.error('Operation failed:', error)
}
```

---

## 🎨 UI Component Helpers

```typescript
import { getInitials } from '@/lib/utils'

// Avatar initials
const initials = getInitials('John Doe') // "JD"
const initials = getInitials('Jane') // "J"

// Text formatting
import { truncate, capitalize, slugify } from '@/lib/utils'

truncate('Very long text here...', 20) // "Very long text here..."
capitalize('hello') // "Hello"
slugify('Hello World!') // "hello-world"
```

---

## 🔐 Security Best Practices

1. **Always validate input**
   ```typescript
   if (!isValidEmail(email)) {
     showError('Invalid email')
     return
   }
   ```

2. **Check user permissions**
   ```typescript
   if (!isAdmin(session)) {
     return { error: 'Unauthorized' }
   }
   ```

3. **Use Cloudinary for uploads**
   - Never store images locally
   - Always validate file size and type
   - Use folders to organize images

4. **Handle errors consistently**
   - Use `getErrorMessage()` for all error extraction
   - Show user-friendly messages with `showError()`
   - Log technical details for debugging

---

## 📚 More Examples

See individual files for comprehensive documentation:
- `lib/utils.ts` - Formatting, validation, utilities
- `lib/api.ts` - API wrapper functions
- `lib/image.ts` - Image upload and manipulation
- `lib/user.ts` - User profile management
- `lib/memorial.ts` - Memorial CRUD operations
- `lib/storage.ts` - Browser storage helpers
- `lib/notifications.ts` - Toast/notification system
- `lib/browser.ts` - DOM and browser APIs
- `lib/constants.ts` - App-wide constants and config

export const ADMIN_USERNAMES = ['icarus', 'admin']

export const USER_ROLES = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  ADMIN: 'ADMIN'
} as const

export const CANDLE_DURATIONS = {
  ONE_DAY: 'ONE_DAY',
  THREE_DAYS: 'THREE_DAYS',
  SEVEN_DAYS: 'SEVEN_DAYS'
} as const

export const CANDLE_DURATION_HOURS = {
  ONE_DAY: 24,
  THREE_DAYS: 72,
  SEVEN_DAYS: 168
} as const

export const CANDLE_DURATION_LABELS = {
  ONE_DAY: '1 day',
  THREE_DAYS: '3 days',
  SEVEN_DAYS: '7 days'
} as const

export const CANDLE_STYLES = {
  standStyle: ['classic', 'ornate', 'simple', 'elegant'],
  stickStyle: ['smooth', 'ridged', 'twisted', 'grooved'],
  flameStyle: ['warm', 'cool', 'bright', 'soft'],
  backgroundColor: ['plain', 'gold', 'silver', 'bronze']
} as const

export const API_ENDPOINTS = {
  AUTH: {
    SEND_CODE: '/api/auth/send-code',
    CHECK_PHONE: '/api/auth/check-phone',
    CHECK_USERNAME: '/api/auth/check-username',
    COMPLETE_SIGNUP: '/api/auth/complete-signup'
  },
  MEMORIALS: {
    LIST: '/api/memorials',
    CREATE: '/api/memorials',
    GET: (id: string) => `/api/memorials/${id}`,
    UPDATE: (id: string) => `/api/memorials/${id}`,
    DELETE: (id: string) => `/api/memorials/${id}`,
    COUNT: '/api/memorials/count'
  },
  CANDLES: {
    CREATE: '/api/candles'
  },
  PROFILE: {
    GET: '/api/profile',
    UPDATE: '/api/profile'
  },
  ADMIN: {
    USERS: '/api/admin/users',
    MEMORIALS: '/api/admin/memorials',
  }
} as const

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  PHONE: {
    LENGTH: 9,
    COUNTRY_CODE: '+56'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  },
  MEMORIAL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  STORY: {
    MAX_LENGTH: 5000
  },
  TESTIMONY: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000
  }
} as const

export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  VALID_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  THUMBNAIL_WIDTH: 200,
  QUALITY: 0.8
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const

export const DEBOUNCE_DELAYS = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000
} as const

export const TIME_DELAYS = {
  TRANSITION: 300,
  ANIMATION: 500,
  RETRY: 1000,
  TIMEOUT: 30000
} as const

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  INVALID_INPUT: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.'
} as const

export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SAVED: 'Saved successfully.',
  COPIED: 'Copied to clipboard.'
} as const

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    MAP: '/map',
    AUTH: '/auth',
    PROFILE: (username: string) => `/${username}`
  },
  PROTECTED: {
    PROFILE: '/profile',
    CREATE_MEMORIAL: '/memorial/create',
    ADMIN: '/admin',
    ADMIN_USERS: '/admin?tab=users',
    ADMIN_MEMORIALS: '/admin?tab=memorials'
  }
} as const

export const SORT_OPTIONS = {
  NEWEST: { label: 'Newest', value: 'newest' },
  OLDEST: { label: 'Oldest', value: 'oldest' },
  NAME_ASC: { label: 'Name (A-Z)', value: 'name_asc' },
  NAME_DESC: { label: 'Name (Z-A)', value: 'name_desc' }
} as const

export const FILTER_OPTIONS = {
  PUBLIC: { label: 'Public', value: 'public' },
  PRIVATE: { label: 'Private', value: 'private' },
  ALL: { label: 'All', value: 'all' }
} as const

export const LOCALE = {
  LANGUAGE: 'es',
  COUNTRY: 'CL',
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm'
} as const

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+?56)?[0-9]{9}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  URL: /^https?:\/\/.+/,
  HASHTAG: /#[a-zA-Z0-9_]+/g
} as const

export const SOCIAL_LINKS = {
  INSTAGRAM: (handle: string) => `https://instagram.com/${handle}`,
  TIKTOK: (handle: string) => `https://tiktok.com/@${handle}`,
  FACEBOOK: (handle: string) => `https://facebook.com/${handle}`,
  WHATSAPP: (phone: string) => `https://wa.me/${phone}`
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  RECENTLY_VIEWED: 'recently_viewed_memorials',
  MEMORIAL_DRAFT: 'memorial_draft',
  SEARCH_HISTORY: 'search_history'
} as const

export const FEATURE_FLAGS = {
  ENABLE_ADMIN: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_3D_CANDLES: true,
  ENABLE_MEMORIALS_EXPORT: false
} as const

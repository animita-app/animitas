import { SEED_ANIMITAS, SEED_MOCK_STICKERS, SEED_MOCK_PETITIONS } from '@/constants/seedData'
import type { StoredSticker, StoredPetition } from './localStorage'

const SEED_VERSION_KEY = 'animitas_seed_version'
const CURRENT_SEED_VERSION = '1.0'

export function hasSeedBeenRun(): boolean {
  if (typeof window === 'undefined') return false
  const version = localStorage.getItem(SEED_VERSION_KEY)
  return version === CURRENT_SEED_VERSION
}

export function initializeSeed(): void {
  if (typeof window === 'undefined') return

  if (hasSeedBeenRun()) return

  const stickersKey = 'animitas_stickers'
  const petitionsKey = 'animitas_petitions'

  const existingStickers = localStorage.getItem(stickersKey)
  const existingPetitions = localStorage.getItem(petitionsKey)

  const stickers: StoredSticker[] = existingStickers ? JSON.parse(existingStickers) : []
  const petitions: StoredPetition[] = existingPetitions ? JSON.parse(existingPetitions) : []

  for (const seedSticker of SEED_MOCK_STICKERS) {
    const alreadyExists = stickers.some(s => s.id === seedSticker.id)
    if (!alreadyExists) {
      stickers.push(seedSticker as StoredSticker)
    }
  }

  for (const seedPetition of SEED_MOCK_PETITIONS) {
    const alreadyExists = petitions.some(p => p.id === seedPetition.id)
    if (!alreadyExists) {
      petitions.push(seedPetition as StoredPetition)
    }
  }

  localStorage.setItem(stickersKey, JSON.stringify(stickers))
  localStorage.setItem(petitionsKey, JSON.stringify(petitions))
  localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION)
}

export function resetSeed(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('animitas_stickers')
  localStorage.removeItem('animitas_petitions')
  localStorage.removeItem('animitas_user_id')
  localStorage.removeItem(SEED_VERSION_KEY)

  window.location.reload()
}

export function getSeedStatus(): {
  isRunning: boolean
  stickersCount: number
  petitionsCount: number
} {
  if (typeof window === 'undefined') {
    return { isRunning: false, stickersCount: 0, petitionsCount: 0 }
  }

  const stickers = localStorage.getItem('animitas_stickers')
  const petitions = localStorage.getItem('animitas_petitions')

  return {
    isRunning: hasSeedBeenRun(),
    stickersCount: stickers ? JSON.parse(stickers).length : 0,
    petitionsCount: petitions ? JSON.parse(petitions).length : 0,
  }
}

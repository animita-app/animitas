import type { Animita } from '@/types/mock'
import { SEED_ANIMITAS } from './seedData'

export const MOCK_ANIMITAS: Animita[] = SEED_ANIMITAS;

export const STICKER_TYPES = ["flower", "candle", "rose", "heart", "cross"] as const

export const PETITION_DURATIONS = ["1 dia", "3 dias", "7 dias"] as const

export const PETITION_STATES = ["activa", "cumplida", "expirada"] as const

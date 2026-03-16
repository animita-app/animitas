import {
  saveOnboardingStep,
  getSavedOnboardingStep,
  getRecoveryState,
  clearOnboardingData,
  clearRecoveryState,
  isOnboardingStale,
  getNextStep,
  getPreviousStep,
} from '@/lib/onboarding-recovery'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('onboarding-recovery', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveOnboardingStep', () => {
    it('saves valid step to localStorage', () => {
      saveOnboardingStep('name')
      expect(localStorage.getItem('onboarding_step')).toBe('name')
    })

    it('saves recovery state with timestamp', () => {
      const before = Date.now()
      saveOnboardingStep('username', { name: 'John' })
      const after = Date.now()

      const recovery = JSON.parse(localStorage.getItem('onboarding_recovery') || '{}')
      expect(recovery.step).toBe('username')
      expect(recovery.timestamp).toBeGreaterThanOrEqual(before)
      expect(recovery.timestamp).toBeLessThanOrEqual(after)
      expect(recovery.userData.name).toBe('John')
    })

    it('ignores invalid steps', () => {
      saveOnboardingStep('invalid' as any)
      expect(localStorage.getItem('onboarding_step')).toBeNull()
    })
  })

  describe('getSavedOnboardingStep', () => {
    it('retrieves saved step', () => {
      saveOnboardingStep('avatar')
      expect(getSavedOnboardingStep()).toBe('avatar')
    })

    it('returns null for invalid saved step', () => {
      localStorage.setItem('onboarding_step', 'invalid')
      expect(getSavedOnboardingStep()).toBeNull()
    })

    it('returns null if nothing saved', () => {
      expect(getSavedOnboardingStep()).toBeNull()
    })
  })

  describe('getRecoveryState', () => {
    it('retrieves recovery state with metadata', () => {
      saveOnboardingStep('name', { name: 'Jane' })
      const recovery = getRecoveryState()

      expect(recovery).not.toBeNull()
      expect(recovery?.step).toBe('name')
      expect(recovery?.userData.name).toBe('Jane')
      expect(recovery?.timestamp).toBeGreaterThan(0)
    })

    it('returns null if no recovery data', () => {
      expect(getRecoveryState()).toBeNull()
    })

    it('handles corrupted recovery data gracefully', () => {
      localStorage.setItem('onboarding_recovery', 'invalid json')
      expect(getRecoveryState()).toBeNull()
      expect(localStorage.getItem('onboarding_recovery')).toBeNull()
    })
  })

  describe('clearOnboardingData', () => {
    it('removes both step and recovery data', () => {
      saveOnboardingStep('username')
      clearOnboardingData()

      expect(localStorage.getItem('onboarding_step')).toBeNull()
      expect(localStorage.getItem('onboarding_recovery')).toBeNull()
    })
  })

  describe('clearRecoveryState', () => {
    it('removes only recovery data', () => {
      saveOnboardingStep('avatar')
      clearRecoveryState()

      expect(localStorage.getItem('onboarding_step')).toBe('avatar')
      expect(localStorage.getItem('onboarding_recovery')).toBeNull()
    })
  })

  describe('isOnboardingStale', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns false for recent data', () => {
      saveOnboardingStep('name')
      expect(isOnboardingStale(3600000)).toBe(false)
    })

    it('returns true for old data', () => {
      saveOnboardingStep('name')
      jest.advanceTimersByTime(3600001)
      expect(isOnboardingStale(3600000)).toBe(true)
    })

    it('returns false if no recovery data', () => {
      expect(isOnboardingStale()).toBe(false)
    })
  })

  describe('getNextStep', () => {
    it('returns next step in sequence', () => {
      expect(getNextStep('name')).toBe('username')
      expect(getNextStep('username')).toBe('avatar')
    })

    it('returns null after last step', () => {
      expect(getNextStep('avatar')).toBeNull()
    })

    it('returns null for invalid step', () => {
      expect(getNextStep('invalid' as any)).toBeNull()
    })
  })

  describe('getPreviousStep', () => {
    it('returns previous step in sequence', () => {
      expect(getPreviousStep('avatar')).toBe('username')
      expect(getPreviousStep('username')).toBe('name')
    })

    it('returns null before first step', () => {
      expect(getPreviousStep('name')).toBeNull()
    })

    it('returns null for invalid step', () => {
      expect(getPreviousStep('invalid' as any)).toBeNull()
    })
  })
})

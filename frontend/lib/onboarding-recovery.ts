type OnboardingStep = 'name' | 'username' | 'avatar'

const ONBOARDING_STEPS: OnboardingStep[] = ['name', 'username', 'avatar']
const STORAGE_KEY = 'onboarding_step'
const RECOVERY_KEY = 'onboarding_recovery'

interface RecoveryState {
  step: OnboardingStep
  timestamp: number
  userData: {
    name?: string
    username?: string
  }
}

export function saveOnboardingStep(step: OnboardingStep, userData?: Record<string, string>): void {
  if (!ONBOARDING_STEPS.includes(step)) return

  try {
    localStorage.setItem(STORAGE_KEY, step)

    const recovery: RecoveryState = {
      step,
      timestamp: Date.now(),
      userData: userData || {},
    }
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(recovery))
  } catch (error) {
    console.error('[onboarding] Failed to save step:', error)
  }
}

export function getSavedOnboardingStep(): OnboardingStep | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ONBOARDING_STEPS.includes(saved as OnboardingStep)) {
      return saved as OnboardingStep
    }
  } catch (error) {
    console.error('[onboarding] Failed to read step:', error)
  }
  return null
}

export function getRecoveryState(): RecoveryState | null {
  try {
    const recovery = localStorage.getItem(RECOVERY_KEY)
    if (recovery) {
      const parsed = JSON.parse(recovery) as RecoveryState
      if (parsed.step && parsed.timestamp) {
        return parsed
      }
    }
  } catch (error) {
    console.error('[onboarding] Failed to parse recovery state:', error)
    clearRecoveryState()
  }
  return null
}

export function clearOnboardingData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(RECOVERY_KEY)
  } catch (error) {
    console.error('[onboarding] Failed to clear data:', error)
  }
}

export function clearRecoveryState(): void {
  try {
    localStorage.removeItem(RECOVERY_KEY)
  } catch (error) {
    console.error('[onboarding] Failed to clear recovery:', error)
  }
}

export function isOnboardingStale(maxAgeMs: number = 1800000): boolean {
  const recovery = getRecoveryState()
  if (!recovery) return false

  const ageMs = Date.now() - recovery.timestamp
  return ageMs > maxAgeMs
}

export function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null
  }
  return ONBOARDING_STEPS[currentIndex + 1]
}

export function getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
  if (currentIndex <= 0) return null
  return ONBOARDING_STEPS[currentIndex - 1]
}

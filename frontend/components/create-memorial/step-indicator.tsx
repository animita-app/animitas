import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  goToStep: (step: number) => void
}

export function StepIndicator({ currentStep, goToStep }: StepIndicatorProps) {
  const steps = [1, 2, 3, 4] // Assuming 4 steps for the memorial creation form

  return (
    <div className="flex justify-center gap-2 mb-8">
      {steps.map((stepNum) => (
        <button
          key={stepNum}
          onClick={() => goToStep(stepNum)}
          className={cn(
            'flex w-6 h-1 items-center justify-center transition-colors rounded-full',
            stepNum <= currentStep ? 'bg-accent' : 'bg-secondary'
          )}
        >
          {/* Optionally add step numbers or icons here */}
        </button>
      ))}
    </div>
  )
}
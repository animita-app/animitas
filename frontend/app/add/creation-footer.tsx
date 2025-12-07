"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const STEPS = [
  { path: "/add/photos", label: "Fotos" },
  { path: "/add/name", label: "Nombre" },
  { path: "/add/story", label: "Historia" },
  { path: "/add/location", label: "Ubicación" },
]

export function CreationFooter() {
  const pathname = usePathname()
  const router = useRouter()

  const currentStepIndex = STEPS.findIndex((step) => step.path === pathname)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      // Handle publish logic here or trigger it
      console.log("Publishing...")
      return
    }
    router.push(STEPS[currentStepIndex + 1].path)
  }

  const handleBack = () => {
    if (isFirstStep) return
    router.push(STEPS[currentStepIndex - 1].path)
  }

  if (currentStepIndex === -1) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 border-t z-50">
      <div className="mx-auto flex items-center justify-between">
        {!isFirstStep ? (
          <Button variant="ghost" onClick={handleBack} className="!pl-1.5 !gap-1 [&_svg]:opacity-50">
             <ChevronLeft />
             Anterior
          </Button>
        ) : (
          <div />
        )}

        {isLastStep ? (
            <Button onClick={handleNext} className="!pr-1.5 !gap-1">
              Publicar
              <ChevronRight />
            </Button>
        ) : (
            <Button onClick={handleNext} className="!pr-1.5 !gap-1">
              Siguiente
              <ChevronRight />
            </Button>
        )}
      </div>
    </div>
  )
}

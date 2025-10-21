interface MemorialFormData {
  name: string
  latitude: string
  longitude: string
  story?: string
  people: Array<{
    image?: string
  }>
}

interface SummaryStepProps {
  memorialData: MemorialFormData
  onPrev: () => void
  onSubmit: () => Promise<void>
  isLoading: boolean
  apiError: string
}

export function SummaryStep({ memorialData, onPrev, onSubmit, isLoading, apiError }: SummaryStepProps) {
  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium">Resumen de la Animita</p>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Nombre:</span> {memorialData.name}
          </p>
          <p>
            <span className="font-medium">Ubicación:</span> {memorialData.latitude}, {memorialData.longitude}
          </p>
          {memorialData.story && (
            <p>
              <span className="font-medium">Historia:</span> {memorialData.story.substring(0, 100)}...
            </p>
          )}
          <p>
            <span className="font-medium">Fotos:</span> {memorialData.people.filter(p => p.image).length}
          </p>
        </div>
      </div>
      {apiError && <p className="text-sm text-destructive">{apiError}</p>}
    </div>
  )
}
'use client'

import { Button } from '@/components/ui/button'
import { InfoStep } from '@/components/create-memorial/info-step'
import { LocationStep } from '@/components/create-memorial/location-step'
import { StoryStep } from '@/components/create-memorial/story-step'
import { SummaryStep } from '@/components/create-memorial/summary-step'
import { StepIndicator } from '@/components/create-memorial/step-indicator'
import { useCreateMemorialForm } from '@/hooks/use-create-memorial-form'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { getErrorMessage } from '@/lib/utils'
import { showError, showSuccess } from '@/lib/notifications'

export default function CreateMemorialPage() {
  const {
    step,
    apiError,
    isLoading,
    uploadingIndex,
    setUploadingIndex,
    memorialData,
    infoForm,
    locationForm,
    storyForm,
    fields,
    append,
    remove,
    onInfoSubmit,
    onLocationSubmit,
    onStorySubmit,
    onImagesSubmit,
    goToPreviousStep,
  } = useCreateMemorialForm()

  const handlePersonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, personIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(personIndex)
    try {
      const url = await uploadToCloudinary(file)
      const currentPeople = infoForm.getValues('people')
      currentPeople[personIndex].image = url
      infoForm.setValue('people', currentPeople)
      showSuccess('Foto subida exitosamente')
    } catch (error) {
      showError(getErrorMessage(error))
    } finally {
      setUploadingIndex(null)
      e.target.value = ''
    }
  }

  const stepNumber = step === 'info' ? 1 : step === 'location' ? 2 : step === 'story' ? 3 : step === 'images' ? 4 : 5
  const totalSteps = 4

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed z-40 inset-0 flex flex-col min-h-screen bg-background">
        <div className="max-w-md mx-auto w-full p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-8">
            <span className="text-xs text-muted-foreground">
              Paso {stepNumber} de {totalSteps}
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <StepIndicator
                  key={i}
                  completed={stepNumber > i}
                  active={stepNumber === i}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-medium mb-2">
              {step === 'info' && 'Información de la Persona'}
              {step === 'location' && 'Ubicación'}
              {step === 'story' && 'Historia'}
              {step === 'images' && 'Resumen'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'info' && 'Agrega los datos de las personas recordadas'}
              {step === 'location' && 'Indica las coordenadas donde se encuentra'}
              {step === 'story' && 'Comparte una historia sobre la animita (opcional)'}
              {step === 'images' && 'Revisa los datos antes de crear'}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-start overflow-y-auto">
            {step === 'info' && (
              <InfoStep
                form={infoForm as any}
                fields={fields as any}
                append={append as any}
                remove={remove as any}
                onSubmit={onInfoSubmit}
                uploadingIndex={uploadingIndex}
                onImageUpload={handlePersonImageUpload}
                apiError={apiError}
              />
            )}

            {step === 'location' && (
              <LocationStep
                form={locationForm}
                onSubmit={onLocationSubmit}
                apiError={apiError}
              />
            )}

            {step === 'story' && (
              <StoryStep
                form={storyForm}
                onSubmit={onStorySubmit}
                apiError={apiError}
              />
            )}

            {step === 'images' && (
              <SummaryStep
                memorialData={memorialData}
                apiError={apiError}
              />
            )}
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 p-6 max-w-md mx-auto space-y-2">
          {step === 'info' && (
            <Button type="submit" form="info-form" className="w-full rounded-none">
              Siguiente
            </Button>
          )}
          {step === 'location' && (
            <>
              <Button type="submit" form="location-form" className="w-full rounded-none">
                Siguiente
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none"
                onClick={goToPreviousStep}
              >
                Atrás
              </Button>
            </>
          )}
          {step === 'story' && (
            <>
              <Button type="submit" form="story-form" className="w-full rounded-none">
                Siguiente
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none"
                onClick={goToPreviousStep}
              >
                Atrás
              </Button>
            </>
          )}
          {step === 'images' && (
            <>
              <Button
                onClick={onImagesSubmit}
                className="w-full rounded-none"
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Animita'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none"
                onClick={goToPreviousStep}
                disabled={isLoading}
              >
                Atrás
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useCreateMemorialForm, Step } from '@/hooks/use-create-memorial-form'
import { StepIndicator } from '@/components/create-memorial/step-indicator'
import { InfoStep } from '@/components/create-memorial/info-step'
import { StoryStep } from '@/components/create-memorial/story-step'
import { LocationStep } from '@/components/create-memorial/location-step'
import { SummaryStep } from '@/components/create-memorial/summary-step'
import { Button } from '@/components/ui/button'
import type { SubmitHandler, FieldValues } from 'react-hook-form'

const showError = (msg: string) => {
  console.error(msg)
  alert(msg)
}

const uploadImage = async (file: File, options?: Record<string, any>) => {
  return URL.createObjectURL(file)
}

export default function CreateMemorialPage() {
  const router = useRouter()
  const {
    step,
    setStep,
    isLoading,
    apiError,
    infoForm,
    locationForm,
    storyForm,
    onInfoSubmit,
    onLocationSubmit,
    onStorySubmit,
    onImagesSubmit,
    goToPreviousStep,
    memorialData,
    setMemorialData,
    uploadingIndex,
    setUploadingIndex,
    fields,
    append,
    remove,
  } = useCreateMemorialForm()

  const handleImageUploadForPerson = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const url = await uploadImage(file, { folder: 'persons' });
      setMemorialData((prev) => {
        const newPeople = [...prev.people];
        newPeople[index] = { ...newPeople[index], image: url };
        return { ...prev, people: newPeople };
      });
      infoForm.setValue(`people.${index}.image`, url);
    } catch (error) {
      showError('Failed to upload image.');
    } finally {
      setUploadingIndex(null);
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return (
          <InfoStep
            form={infoForm}
            fields={fields}
            append={append}
            remove={remove}
            onSubmit={onInfoSubmit}
            onImageUpload={handleImageUploadForPerson}
            uploadingIndex={uploadingIndex}
            apiError={apiError}
          />
        )
      case 'location':
        return (
          <LocationStep
            form={locationForm}
            onSubmit={onLocationSubmit}
            apiError={apiError}
          />
        )
      case 'story':
        return (
          <StoryStep
            form={storyForm}
            onSubmit={onStorySubmit}
            apiError={apiError}
          />
        )
      case 'images':
        return (
          <SummaryStep
            memorialData={memorialData}
            onPrev={goToPreviousStep}
            onSubmit={onImagesSubmit}
            isLoading={isLoading}
            apiError={apiError}
          />
        )
      default:
        return null
    }
  }

  const getStepNumber = (currentStep: Step) => {
    switch (currentStep) {
      case 'info': return 1
      case 'location': return 2
      case 'story': return 3
      case 'images': return 4
      default: return 1
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Memorial</h1>

      <StepIndicator currentStep={getStepNumber(step)} goToStep={(num) => {
        switch (num) {
          case 1: setStep('info'); break;
          case 2: setStep('location'); break;
          case 3: setStep('story'); break;
          case 4: setStep('images'); break;
        }
      }} />

      <div className="space-y-8">
        {renderStepContent()}

        <div className="flex justify-between mt-8">
          {step !== 'info' && (
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Previous
            </Button>
          )}
          {step !== 'images' && (
            <Button
              type="button"
              onClick={() => {
                if (step === 'info') infoForm.handleSubmit(onInfoSubmit as SubmitHandler<FieldValues>)();
                else if (step === 'location') locationForm.handleSubmit(onLocationSubmit as SubmitHandler<FieldValues>)();
                else if (step === 'story') storyForm.handleSubmit(onStorySubmit as SubmitHandler<FieldValues>)();
              }}
            >
              Next
            </Button>
          )}
          {step === 'images' && (
            <Button type="submit" disabled={isLoading} onClick={() => onImagesSubmit()}>
              {isLoading ? 'Creating...' : 'Create Memorial'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
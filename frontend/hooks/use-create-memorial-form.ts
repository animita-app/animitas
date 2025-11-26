import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getErrorMessage } from '@/lib/utils'

const showError = (msg: string) => {
  console.error(msg)
  alert(msg)
}

const log = (msg: string) => {
}

const apiPost = async <T = any,>(endpoint: string, data: any): Promise<T> => {
  throw new Error('API calls not available in mockup mode')
}

type Step = 'info' | 'location' | 'story' | 'images'

const personSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  birthDate: z.date().optional(),
  deathDate: z.date().optional(),
  image: z.string().optional(),
})

const infoSchema = z.object({
  customMemorialName: z.boolean(), // Removed .default(false)
  customName: z.string().optional(),
  people: z.array(personSchema).min(1, 'Agrega al menos una persona'),
})

const locationSchema = z.object({
  latitude: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= -90 && num <= 90
  }, 'Latitud inválida (-90 a 90)'),
  longitude: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= -180 && num <= 180
  }, 'Longitud inválida (-180 a 180)'),
})

const storySchema = z.object({
  story: z.string().min(10, 'La historia debe tener al menos 10 caracteres').optional().or(z.literal('')),
})

interface MemorialFormData {
  name: string
  customName: string
  latitude: string
  longitude: string
  story?: string
  people: Array<{
    name: string
    birthDate?: Date
    deathDate?: Date
    image?: string
  }>
}

export function useCreateMemorialForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [memorialData, setMemorialData] = useState<MemorialFormData>({
    name: '',
    customName: '',
    latitude: '',
    longitude: '',
    story: '',
    people: [],
  })

  // Define the type for defaultValues explicitly
  type InfoFormDefaultValues = {
    customMemorialName: boolean;
    customName?: string;
    people: { name: string; birthDate?: Date; deathDate?: Date; image?: string }[];
  }

  const infoForm = useForm<z.infer<typeof infoSchema>>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      customMemorialName: false, // Explicitly set default here
      customName: '',
      people: [{ name: '', birthDate: undefined, deathDate: undefined, image: undefined }],
    } as InfoFormDefaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: infoForm.control,
    name: 'people',
  })

  const locationForm = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: { latitude: '', longitude: '' } as z.infer<typeof locationSchema>,
  })

  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: { story: '' } as z.infer<typeof storySchema>,
  })

  const onInfoSubmit = async (values: z.infer<typeof infoSchema>) => {
    setMemorialData({
      ...memorialData,
      name: values.customMemorialName ? values.customName || `ANIMITA DE ${values.people[0]?.name}` : `ANIMITA DE ${values.people[0]?.name}`,
      people: values.people,
    })
    setStep('location')
    setApiError('')
  }

  const onLocationSubmit = async (values: z.infer<typeof locationSchema>) => {
    setMemorialData({
      ...memorialData,
      latitude: values.latitude,
      longitude: values.longitude,
    })
    setStep('story')
    setApiError('')
  }

  const onStorySubmit = async (values: z.infer<typeof storySchema>) => {
    setMemorialData({
      ...memorialData,
      story: values.story,
    })
    setStep('images')
    setApiError('')
  }

  const onImagesSubmit = async () => {
    setApiError('')
    setIsLoading(true)

    try {
      showError('La creación de nuevas animitas no está disponible en el mockup. Puedes ver las animitas existentes en el mapa.')
      router.push('/')
    } catch (error) {
      const message = getErrorMessage(error)
      setApiError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const goToPreviousStep = () => {
    if (step === 'location') setStep('info')
    else if (step === 'story') setStep('location')
    else if (step === 'images') setStep('story')
  }

  return {
    step,
    setStep,
    apiError,
    isLoading,
    uploadingIndex,
    setUploadingIndex,
    memorialData,
    setMemorialData,
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
  }
}

export { infoSchema, locationSchema, storySchema, personSchema, type Step }

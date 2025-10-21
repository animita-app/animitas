import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showError, showSuccess } from '@/lib/notifications'
import { getErrorMessage } from '@/lib/utils'
import { apiPost } from '@/lib/api'

type Step = 'info' | 'location' | 'story' | 'images'

const personSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  birthDate: z.date().optional(),
  deathDate: z.date().optional(),
  image: z.string().optional(),
})

const infoSchema = z.object({
  customMemorialName: z.boolean().default(false),
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
  story: string
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

  const infoForm = useForm({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      customMemorialName: false,
      customName: '',
      people: [{ name: '', birthDate: undefined, deathDate: undefined, image: undefined }],
    },
  } as any)

  const { fields, append, remove } = useFieldArray({
    control: infoForm.control,
    name: 'people',
  })

  const locationForm = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: { latitude: '', longitude: '' },
  })

  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: { story: '' },
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
      const result = await apiPost<{ id: string }>('/api/memorials/create', {
        name: memorialData.name,
        personName: memorialData.people[0]?.name || 'Unknown',
        latitude: parseFloat(memorialData.latitude),
        longitude: parseFloat(memorialData.longitude),
        story: memorialData.story || null,
        images: memorialData.people.filter(p => p.image).map(p => p.image),
      })

      if (result.error) {
        throw new Error(result.error)
      }

      showSuccess('¡Animita creada exitosamente!')
      router.push(`/animita/${result.data?.id}`)
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

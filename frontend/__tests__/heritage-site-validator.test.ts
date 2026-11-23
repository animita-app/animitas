import { heritageSitePayloadSchema } from '@/lib/validators/heritage-site'

describe('heritageSitePayloadSchema', () => {
  it('accepts a valid payload', () => {
    const result = heritageSitePayloadSchema.safeParse({
      name: 'Animita de Prueba',
      story: 'Historia suficientemente larga para pasar la validación.',
      isPublic: true,
      location: {
        lat: -33.45,
        lng: -70.66,
        address: 'Ubicación actual',
        cityRegion: 'Santiago, RM'
      }
    })

    expect(result.success).toBe(true)
  })

  it('rejects payloads sin ubicación', () => {
    const result = heritageSitePayloadSchema.safeParse({
      name: 'Animita sin ubicación',
      story: 'Historia válida',
      isPublic: true,
      location: null
    })

    expect(result.success).toBe(false)
  })

  it('accepts an animita without a story', () => {
    const result = heritageSitePayloadSchema.safeParse({
      name: 'Juanito',
      location: { lat: -33.45, lng: -70.66 }
    })

    expect(result.success).toBe(true)
  })

  it('explains in Spanish when the name is too short', () => {
    const result = heritageSitePayloadSchema.safeParse({
      name: 'Jo',
      location: { lat: -33.45, lng: -70.66 }
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Escribe al menos 3 letras')
  })
})

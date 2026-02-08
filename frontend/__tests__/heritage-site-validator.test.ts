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
})

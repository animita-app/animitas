/**
 * @jest-environment node
 */

import { POST } from '@/app/api/heritage-sites/route'
import { createClient } from '@/lib/supabase/server'

type SupabaseMockOptions = {
  user?: { id: string } | null
  slugCollisions?: string[]
  insertError?: string | null
  insertResult?: { id: string; slug: string }
}

type CapturedPayload = Record<string, any> | null

type SupabaseBuilder = {
  select?: jest.Mock<any, any>
  eq?: jest.Mock<any, any>
  maybeSingle?: jest.Mock<Promise<{ data: any; error: null }>, any>
  insert?: jest.Mock<any, any>
  single?: jest.Mock<Promise<{ data: any; error: any }>, any>
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.Mock

function createSlugQueryBuilder(slug: string | null): SupabaseBuilder {
  const builder: SupabaseBuilder = {}
  builder.select = jest.fn(() => builder)
  builder.eq = jest.fn(() => builder)
  builder.maybeSingle = jest.fn(async () => ({ data: slug ? { slug } : null, error: null }))
  return builder
}

function createInsertBuilder(
  capturedPayload: { current: CapturedPayload },
  insertResult: { id: string; slug: string },
  insertError: string | null
): SupabaseBuilder {
  const builder: SupabaseBuilder = {}
  builder.insert = jest.fn((payload) => {
    capturedPayload.current = payload
    return builder
  })
  builder.select = jest.fn(() => builder)
  builder.single = jest.fn(async () => {
    if (insertError) {
      return { data: null, error: { message: insertError } }
    }
    return { data: insertResult, error: null }
  })
  return builder
}

function buildSupabaseMock(options: SupabaseMockOptions = {}) {
  const {
    user = { id: 'user-123' },
    slugCollisions = [],
    insertError = null,
    insertResult = { id: 'site-1', slug: 'animita-de-prueba' },
  } = options

  const capturedPayload = { current: null as CapturedPayload }

  const slugBuilders = [
    ...slugCollisions.map((slug) => createSlugQueryBuilder(slug)),
    createSlugQueryBuilder(null),
  ]

  const insertBuilder = createInsertBuilder(capturedPayload, insertResult, insertError)
  const builderQueue = [...slugBuilders, insertBuilder]

  const supabase = {
    auth: {
      getUser: jest.fn(async () => ({ data: { user }, error: null })),
    },
    from: jest.fn(() => {
      const builder = builderQueue.shift()
      if (!builder) {
        throw new Error('No query builders left in queue')
      }
      return builder
    }),
  }

  return { supabase, capturedPayload }
}

function createRequest(body: any) {
  return new Request('http://localhost/api/heritage-sites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/heritage-sites', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects unauthenticated users', async () => {
    const { supabase } = buildSupabaseMock({ user: null })
    mockedCreateClient.mockResolvedValueOnce(supabase)

    const request = createRequest({})
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toMatch(/iniciar sesión/i)
  })

  it('validates payload before touching Supabase', async () => {
    const { supabase } = buildSupabaseMock()
    mockedCreateClient.mockResolvedValueOnce(supabase)

    const request = createRequest({ name: 'Hi', story: 'short' })
    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(422)
    expect(json.error).toBe('Datos inválidos')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('creates a site, enforcing slug uniqueness and PostGIS formatting', async () => {
    const { supabase, capturedPayload } = buildSupabaseMock({
      slugCollisions: ['animita-de-prueba'],
      insertResult: { id: 'site-77', slug: 'animita-de-prueba-1' },
    })
    mockedCreateClient.mockResolvedValueOnce(supabase)

    const request = createRequest({
      name: 'Animita de Prueba',
      story: 'Historia suficientemente larga para validar el flujo.',
      isPublic: true,
      location: {
        lat: -33.45,
        lng: -70.66,
        address: 'Ubicación actual',
        cityRegion: 'Santiago, RM',
      },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.slug).toBe('animita-de-prueba-1')
    expect(capturedPayload.current?.slug).toBe('animita-de-prueba-1')
    expect(capturedPayload.current?.location).toBe('SRID=4326;POINT(-70.66 -33.45)')
    expect(capturedPayload.current?.status).toBe('published')
  })

  it('surfaces Supabase insertion errors', async () => {
    const { supabase } = buildSupabaseMock({ insertError: 'duplicate key value' })
    mockedCreateClient.mockResolvedValueOnce(supabase)

    const request = createRequest({
      name: 'Animita de Error',
      story: 'Historia válida para probar errores en Supabase.',
      isPublic: false,
      location: {
        lat: -33.5,
        lng: -70.7,
        address: 'Dirección',
        cityRegion: 'Región',
      },
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toMatch(/duplicate/i)
  })
})

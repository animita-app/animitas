import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AddForm } from '@/components/forms/add-form'
import { useUser } from '@/contexts/user-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { useLocationSearch } from '@/hooks/use-location-search'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

jest.mock('@/contexts/user-context')
jest.mock('@/hooks/use-heritage-taxonomy')
jest.mock('@/hooks/use-location-search')
jest.mock('@/lib/supabase/client')
jest.mock('sonner')

const mockUseUser = useUser as jest.Mock
const mockUseHeritageTaxonomy = useHeritageTaxonomy as jest.Mock
const mockUseLocationSearch = useLocationSearch as jest.Mock
const mockCreateClient = createClient as jest.Mock
const mockToast = toast as jest.Mocked<typeof toast>

describe('AddForm - Insights Extraction Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseUser.mockReturnValue({
      currentUser: { id: 'user-123', name: 'Test User' },
      setUser: jest.fn(),
      setRole: jest.fn(),
      setResearchMode: jest.fn(),
      role: 'default',
      researchMode: false,
    })

    mockUseHeritageTaxonomy.mockReturnValue({
      categories: [{ id: 'cat-1', slug: 'memorial', name: 'Memorial' }],
      kinds: [{ id: 'kind-1', slug: 'santuarios', name: 'Santuarios', category_id: 'cat-1' }],
      isLoading: false,
    })

    mockUseLocationSearch.mockReturnValue({
      isLoading: false,
      searchResults: [],
      handleSearch: jest.fn(),
    })

    mockToast.error = jest.fn()
    mockToast.warning = jest.fn()
    mockToast.success = jest.fn()
  })

  it('handles OpenAI API timeout gracefully', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('extract-insights')) {
        return new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      }
      return new Response(JSON.stringify({ success: true }))
    })

    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: null })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    expect(mockToast.warning).toHaveBeenCalledWith(
      expect.stringContaining('no se pudo analizar'),
      expect.any(Object)
    )
  })

  it('shows API error message to user', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('extract-insights')) {
        return new Response(
          JSON.stringify({
            error: 'OpenAI API key not configured',
          }),
          { status: 500 }
        )
      }
      return new Response(JSON.stringify({ success: true }))
    })

    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: null })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    expect(mockToast.warning).toHaveBeenCalledWith(
      expect.stringContaining('OpenAI API key not configured'),
      expect.any(Object)
    )
  })

  it('continues with site creation even if insights extraction fails', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('extract-insights')) {
        return new Response(
          JSON.stringify({
            error: 'Quota exceeded',
          }),
          { status: 429 }
        )
      }
      if (url.includes('heritage-sites')) {
        return new Response(
          JSON.stringify({
            success: true,
            id: 'site-123',
            slug: 'test-site',
          }),
          { status: 201 }
        )
      }
      return new Response(JSON.stringify({ success: true }))
    })

    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: null })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    expect(mockToast.warning).toHaveBeenCalledWith(
      expect.stringContaining('Quota exceeded'),
      expect.any(Object)
    )

    expect(mockToast.success).toHaveBeenCalled()
  })

  it('displays timeout message when extraction takes too long', async () => {
    let resolveInsight: ((value: any) => void) | null = null
    const insightPromise = new Promise(resolve => {
      resolveInsight = resolve
    })

    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('extract-insights')) {
        return insightPromise
      }
      return new Response(JSON.stringify({ success: true }))
    })

    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: null })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    jest.useFakeTimers()
    jest.advanceTimersByTime(10100)
    jest.useRealTimers()

    expect(mockToast.warning).toHaveBeenCalledWith(
      expect.stringContaining('tardó demasiado'),
      expect.any(Object)
    )
  })

  it('handles malformed insights response gracefully', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.includes('extract-insights')) {
        return new Response('Invalid JSON {', { status: 200 })
      }
      return new Response(JSON.stringify({ success: true }))
    })

    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: null })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    expect(mockToast.warning).toHaveBeenCalled()
  })
})

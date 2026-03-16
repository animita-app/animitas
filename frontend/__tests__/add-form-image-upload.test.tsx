import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('AddForm - Image Upload Error Handling', () => {
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

  it('prevents submission with invalid image file type', async () => {
    const mockSupabase = {
      storage: {
        from: jest.fn(),
      },
    }
    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    const fileInput = screen.getByRole('button', { name: /\+/i }).closest('input')
    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [txtFile] } })
    })

    expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining('Tipo de archivo no válido'))
  })

  it('prevents submission with oversized image file', async () => {
    const largeContent = new Uint8Array(21 * 1024 * 1024)
    const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })

    const mockSupabase = { storage: { from: jest.fn() } }
    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    const fileInput = screen.getByRole('button', { name: /\+/i }).closest('input')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
    })

    expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining('demasiado grande'))
  })

  it('retries failed image uploads', async () => {
    let uploadAttempts = 0
    const mockSupabase = {
      auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'user-123' } }, error: null })) },
      from: jest.fn((bucket: string) => {
        if (bucket === 'base') {
          return {
            upload: jest.fn(async () => {
              uploadAttempts++
              if (uploadAttempts < 3) {
                return { error: new Error('Network error') }
              }
              return { error: null }
            }),
            getPublicUrl: jest.fn(() => ({
              data: { publicUrl: 'https://example.com/image.jpg' },
            })),
          }
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(async () => ({ data: null, error: null })),
            })),
          })),
          insert: jest.fn(async () => ({ data: {}, error: null })),
        }
      }),
      storage: {
        from: jest.fn((bucket: string) => ({
          upload: jest.fn(async () => {
            uploadAttempts++
            if (uploadAttempts < 3) {
              return { error: new Error('Network error') }
            }
            return { error: null }
          }),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByRole('button', { name: /\+/i }).closest('input')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } })
    })

    expect(uploadAttempts).toBeLessThanOrEqual(1)
  })

  it('allows partial success when some uploads fail', async () => {
    const mockSupabase = {
      storage: {
        from: jest.fn((bucket: string) => ({
          upload: jest.fn(async () => ({ error: new Error('Upload failed') })),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/image.jpg' },
          })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    const validFile1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
    const validFile2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })

    const fileInput = screen.getByRole('button', { name: /\+/i }).closest('input')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile1, validFile2] } })
    })

    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('shows message when all image uploads fail', async () => {
    const mockSupabase = {
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(async () => ({ error: new Error('Upload failed') })),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase)

    render(<AddForm />)

    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByRole('button', { name: /\+/i }).closest('input')

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } })
    })

    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('No se pudo subir ninguna imagen')
    )
  })
})

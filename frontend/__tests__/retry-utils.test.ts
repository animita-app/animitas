import { retryWithBackoff, RetryError, validateImageFile } from '@/lib/retry-utils'

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('succeeds on first attempt', async () => {
    const fn = jest.fn(async () => 'success')
    const result = await retryWithBackoff(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('attempt 1'))
      .mockRejectedValueOnce(new Error('attempt 2'))
      .mockResolvedValueOnce('success')

    const promise = retryWithBackoff(fn, { maxAttempts: 3, initialDelayMs: 100 })
    jest.runAllTimers()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('fails after max attempts', async () => {
    const fn = jest.fn(async () => {
      throw new Error('persistent error')
    })

    const promise = retryWithBackoff(fn, { maxAttempts: 2, initialDelayMs: 100 })
    jest.runAllTimers()

    await expect(promise).rejects.toThrow(RetryError)
    await expect(promise).rejects.toMatchObject({
      attempts: 2,
      message: expect.stringContaining('Failed after 2 attempts'),
    })
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('applies exponential backoff', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success')

    const promise = retryWithBackoff(fn, { maxAttempts: 3, initialDelayMs: 100, backoffMultiplier: 2 })

    jest.advanceTimersByTime(100)
    jest.runOnlyPendingTimers()
    jest.advanceTimersByTime(200)
    jest.runOnlyPendingTimers()

    const result = await promise
    expect(result).toBe('success')
  })

  it('caps delay at maxDelayMs', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('success')

    const promise = retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 3,
      maxDelayMs: 2000,
    })

    jest.runAllTimers()
    const result = await promise
    expect(result).toBe('success')
  })
})

describe('validateImageFile', () => {
  it('accepts valid image files', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    expect(validateImageFile(file)).toBeNull()
  })

  it('rejects invalid file types', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const error = validateImageFile(file)
    expect(error).toContain('Tipo de archivo no válido')
  })

  it('rejects oversized files', () => {
    const largeContent = new Uint8Array(21 * 1024 * 1024)
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
    const error = validateImageFile(file)
    expect(error).toContain('demasiado grande')
  })

  it('accepts all allowed formats', () => {
    const formats = [
      { type: 'image/jpeg', name: 'test.jpg' },
      { type: 'image/png', name: 'test.png' },
      { type: 'image/webp', name: 'test.webp' },
      { type: 'image/gif', name: 'test.gif' },
    ]

    formats.forEach(({ type, name }) => {
      const file = new File(['content'], name, { type })
      expect(validateImageFile(file)).toBeNull()
    })
  })
})

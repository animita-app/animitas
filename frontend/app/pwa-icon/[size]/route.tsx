import { appIcon } from '@/lib/app-icon'

const SIZES = new Set([192, 512])

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const [value, variant] = size.split('-')
  const pixels = Number(value)
  if (!SIZES.has(pixels)) return new Response('Not found', { status: 404 })
  return appIcon(pixels, { padded: variant === 'maskable' })
}

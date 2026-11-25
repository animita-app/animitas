import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-medium text-text-strong text-balance">No encontramos esta página</h1>
      <p className="text-sm text-text-weak text-pretty">Puede que el enlace esté mal escrito o que ya no exista.</p>
      <Button asChild>
        <Link href="/map">Ir al mapa</Link>
      </Button>
    </main>
  )
}

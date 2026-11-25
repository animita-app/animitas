import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CutoutText } from '@/components/cutout-text'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="sr-only">No encontramos esta página</h1>
      <CutoutText text="por aquí no es" height={36} arc={26} />
      <p className="text-pretty text-sm text-text-weak">El enlace está mal escrito o la página ya no existe.</p>
      <Button asChild variant="sign" size="lg" className="mt-2 -rotate-1">
        <Link href="/map">Ir al mapa</Link>
      </Button>
    </main>
  )
}

import Link from 'next/link'
import { CutoutText } from '@/components/cutout-text'
import { Tumbleweed } from '@/components/loaders'

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center">
      <h1 className="sr-only">No encontramos esta página</h1>
      <CutoutText text="por aquí no es" height={36} arc={26} />
      <p className="text-pretty text-sm text-text-weak">El enlace está mal escrito o la página ya no existe.</p>
      <Link href="/map" className="road-sign road-sign-text road-sign-action mt-2 inline-flex -rotate-1 items-center px-5 py-1.5">
        Ir al mapa
      </Link>
      <Tumbleweed />
    </main>
  )
}

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UserProfilePage() {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Perfiles de usuario</h1>
        <p className="text-muted-foreground mb-6">Esta funcionalidad no está disponible en el mockup</p>
        <Link href="/">
          <Button>Volver al mapa</Button>
        </Link>
      </div>
    </div>
  )
}

/**
 * Demo Mode - Index Page
 *
 * Lists all available demo components for easy navigation
 */

import Link from 'next/link'

const demos = [
  {
    id: 'map',
    title: 'Mapa Interactivo',
    description: 'Explora animitas con clustering y navegación',
    duration: '10s',
    href: '/demo/map'
  },
  {
    id: 'add',
    title: 'Formulario de Creación',
    description: 'Agrega nuevas animitas con fotos y ubicación',
    duration: '10s',
    href: '/demo/add'
  },
  {
    id: 'detail',
    title: 'Página de Detalle',
    description: 'Historia completa de Hermógenes San Martín',
    duration: '8s',
    href: '/demo/detail/hermogenes'
  },
  {
    id: 'research',
    title: 'Modo Investigación',
    description: 'Análisis GIS, gráficos y filtros espaciales',
    duration: '12s',
    href: '/demo/research'
  }
]

export default function DemoIndexPage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-neutral-50 to-neutral-100 p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Demo Mode</h1>
          <p className="text-xl text-neutral-600">
            Componentes optimizados para grabación en 1080x1350px @ 4x
          </p>
        </div>

        <div className="grid gap-6">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              href={demo.href}
              className="group block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 hover:border-black"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-semibold group-hover:text-blue-600 transition-colors">
                  {demo.title}
                </h2>
                <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600">
                  {demo.duration}
                </span>
              </div>
              <p className="text-neutral-600 text-lg">
                {demo.description}
              </p>
              <div className="mt-4 text-sm text-neutral-400">
                {demo.href}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📹 Recording Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set Screen Studio to record at 4K (4320x5400)</li>
            <li>• Enable smooth cursor and zoom effects</li>
            <li>• Record at 60fps for smooth playback</li>
            <li>• Export final video at 1080x1350 for Instagram/TikTok</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

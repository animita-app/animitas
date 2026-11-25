import Link from 'next/link'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { slug: 'plaque', label: 'Placa' },
  { slug: 'altar', label: 'Altar' },
  { slug: 'vigil', label: 'Vigilia' },
]

export function VersionPicker({ current, slug }: { current: string; slug?: string }) {
  return (
    <nav aria-label="Versiones" className="fixed inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex gap-1 rounded-full border border-border-weak bg-background p-1 shadow-md">
        {OPTIONS.map(o => (
          <Link
            key={o.slug}
            href={{ query: { v: o.slug, ...(slug ? { slug } : {}) } }}
            aria-current={current === o.slug ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm text-text-weak hover:bg-background-weaker focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              current === o.slug && 'bg-text-strong text-background hover:bg-text-strong'
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

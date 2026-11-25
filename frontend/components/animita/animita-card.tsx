import Link from 'next/link'
import Image from 'next/image'
import { animitaHref } from '@/lib/routes'

interface AnimitaCardProps {
  site: { slug: string; title: string; images: string[] | null; city_region?: string | null }
}

export function AnimitaCard({ site }: AnimitaCardProps) {
  const imageUrl = site.images?.[0]

  return (
    <Link
      href={animitaHref(site.slug)}
      className="group flex flex-col gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="photo-vignette aspect-square overflow-hidden rounded-md bg-background-weak">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover [filter:url(#stipple)] group-hover:[filter:none] group-focus-visible:[filter:none]"
          />
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-text-strong text-pretty">{site.title}</h3>
        {site.city_region && <p className="text-sm text-text-weak">{site.city_region}</p>}
      </div>
    </Link>
  )
}

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HeritageSiteCard } from '@/components/cards/heritage-site-card'
import Image from 'next/image'
import Link from 'next/link'

interface Creator {
  display_name: string
  username: string
  image: string | null
}

interface Site {
  id: string
  slug: string
  title: string
  images: string[]
  city_region: string
  heritage_kinds: { slug: string }
}

interface RouteItem {
  sort_order: number
  heritage_sites: Site
}

interface Route {
  id: string
  title: string
  description: string | null
  creator_id: string
  created_at: string
  site_route_items: RouteItem[]
}

interface RouteViewProps {
  route: Route | null
  creator: Creator | null
}

export function RouteView({ route, creator }: RouteViewProps) {
  if (!route) {
    return (
      <div className="flex min-h-svh items-center justify-center text-text-weak text-sm">
        Ruta no encontrada.
      </div>
    )
  }

  const sites = route.site_route_items || []
  const coverImages = sites.slice(0, 4).map((item) => item.heritage_sites?.images?.[0]).filter(Boolean)

  return (
    <div className="flex w-full flex-col bg-background">
      <div className="relative w-full aspect-square md:aspect-video overflow-hidden bg-background-weaker">
        {coverImages && coverImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-0 w-full h-full">
            {coverImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-full overflow-hidden">
                <Image
                  src={img}
                  alt={`${route.title} - cover ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-weak">
            No hay imágenes
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="flex flex-col items-start gap-4 px-6 pt-8">
        <div>
          <h1 className="text-3xl font-semibold text-text-strong tracking-tight mb-2">
            {route.title}
          </h1>
          {route.description && (
            <p className="text-base text-text-weak mb-4">{route.description}</p>
          )}
        </div>

        {creator && (
          <Link href={`/profile/${creator.username}`} className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={creator.image || undefined} alt={creator.display_name} />
              <AvatarFallback className="text-xs font-normal">
                {creator.display_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-text-strong">{creator.display_name}</p>
              <p className="text-xs text-text-weak">@{creator.username}</p>
            </div>
          </Link>
        )}

        <p className="text-sm text-text-weak">
          {sites.length} {sites.length === 1 ? 'sitio' : 'sitios'}
        </p>
      </div>

      <div className="px-6 py-8">
        {sites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sites.map((item) => {
              const site = item.heritage_sites
              const kindSlug = site.heritage_kinds?.slug || 'animita'
              return (
                <HeritageSiteCard
                  key={site.id}
                  site={{ ...site, kind: kindSlug }}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-text-weak">
            Esta ruta no tiene sitios aún.
          </div>
        )}
      </div>
    </div>
  )
}

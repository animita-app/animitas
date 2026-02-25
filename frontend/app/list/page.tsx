import * as React from "react"
import { createClient } from "@/lib/supabase/server"
import { HeritageSiteCard } from "@/components/cards/heritage-site-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export const metadata = {
  title: "Lista de Sitios | Animitas",
}

export default async function ListPage() {
  const supabase = await createClient()

  // Fetch published sites
  const { data: sites, error } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sites for list view:", error)
  }

  const allSites = sites || []

  // Group sites into some mock categories
  const recentSites = allSites.slice(0, 8)

  // Usually this would come from a geospatial query,
  // but for the MVP listing we can just slice data differently
  const popularSites = [...allSites].reverse().slice(0, 8)

  return (
    <div className="min-h-svh w-full bg-background pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">

        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-text-strong font-ibm-plex-mono uppercase">
            Explorar Patrimonio
          </h1>
          <p className="text-text-weak text-base max-w-2xl">
            Descubre animitas y sitios de memoria documentados por la comunidad.
          </p>
        </header>

        {/* Categoria 1: Agregados recientemente */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-text-strong">Agregados recientemente</h2>
          </div>
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {recentSites.map((site) => (
                  <CarouselItem key={site.id} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <HeritageSiteCard site={site} />
                  </CarouselItem>
                ))}
                {recentSites.length === 0 && (
                  <div className="pl-4 py-8 text-sm text-text-weak">No hay sitios disponibles en esta categoría.</div>
                )}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-4 bg-background" />
                <CarouselNext className="-right-4 bg-background" />
              </div>
            </Carousel>
          </div>
        </section>

        {/* Categoria 2: Destacados */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-text-strong">Destacados por la comunidad</h2>
          </div>
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {popularSites.map((site) => (
                  <CarouselItem key={site.id} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <HeritageSiteCard site={site} />
                  </CarouselItem>
                ))}
                {popularSites.length === 0 && (
                  <div className="pl-4 py-8 text-sm text-text-weak">No hay sitios disponibles en esta categoría.</div>
                )}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-4 bg-background" />
                <CarouselNext className="-right-4 bg-background" />
              </div>
            </Carousel>
          </div>
        </section>

      </div>
    </div>
  )
}

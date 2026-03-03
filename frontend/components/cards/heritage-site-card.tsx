import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import { ProgressiveBlur } from "../ui/progressive-blur"

interface HeritageSiteCardProps {
  site: any // Replace with HeritageSite type if available
}

export function HeritageSiteCard({ site }: HeritageSiteCardProps) {
  const imageUrl = site.images && site.images[0]

  return (
    <Link href={`/${site.kind?.toLowerCase() || 'animita'}/${site.slug}`}>
      <Card className="hover:ring-2 hover:ring-offset-4 hover:ring-accent aspect-square relative group !py-0 overflow-hidden shadow-none transition-all hover:shadow-md bg-background">
        <CardContent className="translate-y-8 group-hover:translate-y-0 duration-150 ease-out items-start z-20 p-4 flex flex-col gap-2 flex-grow justify-start">
          <div className="space-y-0 mt-auto">
            <h3 className="text-lg font-medium text-white line-clamp-1">{site.title}</h3>
            {(site.city_region || site.address) && (
              <p className="inline-flex items-center gap-1 text-sm text-white/80">
                {site.city_region && <span className="shrink-0">{site.city_region}</span>}
                {/* {site.address && <span className="shrink-0">{site.address}</span>} */}
              </p>
            )}
          </div>
          <Button
            variant="link"
            className="text-white hover:text-white underline !decoration-current/25 gap-1"
          >
            Ver detalles
            <ArrowRight />
          </Button>
        </CardContent>
        <ProgressiveBlur
          height="75%"
          className="translate-y-12 group-hover:translate-y-0 duration-150 ease-out"
        />
        {/* <div className="z-10 absolute inset-x-0 bottom-0 w-full h-48 bg-gradiento-to-t from-background to-background-weak" /> */}
        <Image
          src={imageUrl}
          alt={site.title}
          width={1080}
          height={1080}
          className="absolute top-0 left-0 h-full w-full object-cover"
          />
      </Card>
    </Link>
  )
}

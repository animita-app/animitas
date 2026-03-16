import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Route } from "lucide-react"
import Image from "next/image"

interface RouteCardProps {
  id: string
  title: string
  description?: string | null
  coverImages: string[]
  itemCount: number
}

export function RouteCard({ id, title, description, coverImages, itemCount }: RouteCardProps) {
  return (
    <Link href={`/rutas/${id}`}>
      <Card className="aspect-square relative group overflow-hidden shadow-none transition-all hover:shadow-md bg-background hover:ring-2 hover:ring-offset-4 hover:ring-accent">
        <div className="absolute inset-0 bg-background-weaker flex items-center justify-center z-10">
          {coverImages && coverImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-0 w-full h-full">
              {coverImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative w-full h-full overflow-hidden">
                  <Image
                    src={img}
                    alt={`${title} - image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Route className="text-text-weak" size={48} />
          )}
        </div>

        <CardContent className="absolute inset-0 translate-y-8 group-hover:translate-y-0 duration-150 ease-out items-start z-20 p-4 flex flex-col gap-2 flex-grow justify-start bg-gradient-to-t from-background to-transparent">
          <div className="space-y-0 mt-auto">
            <h3 className="text-lg font-medium text-white line-clamp-2">{title}</h3>
            {description && (
              <p className="text-sm text-white/80 line-clamp-1">{description}</p>
            )}
            <p className="text-xs text-white/70 mt-2">{itemCount} {itemCount === 1 ? 'sitio' : 'sitios'}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

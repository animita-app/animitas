import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getFullSiteData, Site, Person, SiteStory, Testimonial, SiteInsights } from '@/constants/mockData'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, User, BookOpen, MessageSquare, Activity } from 'lucide-react'

interface SiteDetailProps {
  id: string
}

export function SiteDetail({ id }: SiteDetailProps) {
  const [data, setData] = useState<{
    site: Site
    person?: Person
    story?: SiteStory
    testimonials: Testimonial[]
    insights?: SiteInsights
  } | null>(null)

  useEffect(() => {
    // In a real app, we would fetch by ID, but our mock helper uses slug.
    // For this prototype, we'll find the site by ID first from the MOCK_SITES array
    // or just assume the ID passed is actually the ID and we need to find the slug.

    // Since getFullSiteData expects a slug, let's find the slug from the ID first.
    // Importing MOCK_SITES directly here would be circular if we put this in mockData,
    // but we are in a component. However, getFullSiteData is available.
    // Let's just iterate MOCK_SITES in the helper if needed, but for now let's assume
    // we can find the site by ID in the helper or just loop through MOCK_SITES here.

    // Actually, let's just use the helper and pass the slug if we had it.
    // Since we only have ID, let's modify the helper or just find it here.
    // For simplicity, I'll import MOCK_SITES to find the slug.

    import('@/constants/mockData').then(({ MOCK_SITES, getFullSiteData }) => {
      const site = MOCK_SITES.find(s => s.id === id)
      if (site) {
        const fullData = getFullSiteData(site.slug)
        // @ts-ignore - The helper returns a spread object, we need to cast or adjust types.
        // The helper returns { ...site, person, ... } which matches our state structure mostly.
        if (fullData) {
          setData({
            site: fullData as unknown as Site, // The spread includes site props
            person: fullData.person,
            story: fullData.story,
            testimonials: fullData.testimonials,
            insights: fullData.insights
          })
        }
      }
    })
  }, [id])

  if (!data) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  const { site, person, story, testimonials, insights } = data

  return (
    <div className="flex flex-col h-full">
      {/* Header Image */}
      {site.images[0] && (
        <div className="relative w-full h-48 shrink-0">
          <Image
            src={site.images[0]}
            alt={site.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Badge variant="secondary" className="mb-2 capitalize">
              {site.typology}
            </Badge>
            <h1 className="text-2xl font-bold leading-tight">{site.title}</h1>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">

          {/* Person Info */}
          {person && (
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-background rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{person.full_name}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  {person.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Nacimiento: {person.birth_date}</span>
                    </div>
                  )}
                  {site.created_at && (
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      <span>Fallecimiento: {site.created_at}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="story" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="story">Historia</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
            </TabsList>

            <TabsContent value="story" className="mt-4 space-y-4">
              {story ? (
                <div className="prose dark:prose-invert text-sm">
                  <p>{story.content}</p>
                  <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    Escrito por {story.created_by.name} • v{story.version}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay historia registrada aún.
                </div>
              )}
            </TabsContent>

            <TabsContent value="testimonials" className="mt-4 space-y-4">
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <Card key={t.id}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-sm">{t.created_by?.name || 'Anónimo'}</div>
                        <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      {t.content}
                      {t.tags && (
                        <div className="flex gap-2 mt-2">
                          {t.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-5">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay testimonios aún.
                </div>
              )}
            </TabsContent>

          </Tabs>

        </div>
      </ScrollArea>
    </div>
  )
}

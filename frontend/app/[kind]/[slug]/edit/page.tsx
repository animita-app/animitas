"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import {
  Camera,
  ChevronLeft,
  X,
  Plus,
  Sparkles,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"

export default function EditSitePage() {
  const router = useRouter()
  const params = useParams()
  const { slug } = params as { slug: string }
  const { currentUser, role, isEditor, isAuthenticated } = useUser()

  const [site, setSite] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [unauthorized, setUnauthorized] = React.useState(false)

  const [name, setName] = React.useState("")
  const [story, setStory] = React.useState("")
  const [summary, setSummary] = React.useState("")

  React.useEffect(() => {
    async function fetchSite() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('heritage_sites')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        // Permission check: creator or editor+
        const isCreator = currentUser?.id === data.creator_id
        if (!isCreator && !isEditor) {
          setUnauthorized(true)
          setLoading(false)
          return
        }
        setSite(data)
        setName(data.title)
        setStory(data.story || '')
      }
      setLoading(false)
    }

    if (slug && !isAuthenticated) {
      // Middleware should redirect, but extra safety
      setUnauthorized(true)
      setLoading(false)
    } else if (slug && currentUser) {
      fetchSite()
    }
  }, [slug, currentUser, isEditor, isAuthenticated])

  async function handleUpdate() {
    if (!name || !story) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // 1. Update Site
      const { data: updatedSite, error: updateError } = await supabase
        .from('heritage_sites')
        .update({
          title: name,
          story: story,
          updated_at: new Date().toISOString()
        })
        .eq('id', site.id)
        .select()
        .single()

      if (updateError) throw updateError

      // 2. Create revision
      await supabase
        .from('heritage_site_revisions')
        .insert({
          site_id: site.id,
          snapshot: updatedSite,
          diff_summary: summary || 'Edición de contenido',
          author_id: currentUser?.id
        })

      toast.success("Cambios guardados con éxito")
      router.push(`/animita/${slug}`)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar los cambios")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="flex h-svh items-center justify-center font-ibm-plex-mono uppercase text-sm animate-pulse text-text-weak">Cargando...</div>
  if (unauthorized) return (
    <div className="flex h-svh items-center justify-center flex-col gap-4">
      <p className="text-text-strong font-medium">No tienes permiso para editar esta animita</p>
      <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
    </div>
  )
  if (!site) return <div className="flex h-svh items-center justify-center text-text-strong">No se encontró la animita</div>

  return (
    <div className="flex flex-col min-h-full bg-background px-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between py-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <X className="size-6" />
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting || name === site.title && story === site.story}
            className="gap-2"
          >
            {isSubmitting ? "Guardando..." : (
              <>
                <Save className="size-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-16 pb-24 px-4">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-text-strong">Editar Animita</h1>
          <p className="text-text-weak text-sm uppercase font-ibm-plex-mono tracking-wide">Tus cambios quedarán registrados en el historial.</p>
        </header>

        <section className="space-y-10">
          <div className="space-y-4">
            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono">Nombre</Label>
            <input
              id="name"
              type="text"
              className="text-3xl font-bold w-full bg-transparent border-b border-border-weak focus:border-accent focus:ring-0 pb-4 transition-colors text-text-strong outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="story" className="text-sm font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono">Historia</Label>
            <textarea
              id="story"
              className="w-full bg-background-weak border border-border-weak rounded-xl p-6 focus:border-accent focus:ring-0 min-h-[300px] text-lg leading-relaxed transition-colors text-text outline-none"
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="summary" className="text-sm font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono">Resumen de cambios (opcional)</Label>
            <Input
              id="summary"
              placeholder="Ej: Corregí la fecha del accidente"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

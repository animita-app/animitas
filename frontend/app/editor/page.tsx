import * as React from "react"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth-guard"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit3, ExternalLink } from "lucide-react"

export const metadata = {
  title: "Editor Queue | Animita",
}

export default async function EditorPage() {
  await requireRole("editor")
  const supabase = await createClient()

  const { data: sites, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      slug,
      title,
      status,
      updated_at,
      kind,
      profiles ( full_name )
    `)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching sites for editor:", error)
  }

  return (
    <div className="min-h-svh w-full bg-background pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-text-strong font-ibm-plex-mono uppercase">
            Cola de Revisión
          </h1>
          <p className="text-text-weak text-base max-w-2xl">
            Gestiona las animitas publicadas, revisa los borradores y modera el contenido reportado.
          </p>
        </header>

        <div className="border border-border-weak rounded-xl overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-background-weak">
              <TableRow className="border-border-weak hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono h-12">Nombre</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono h-12">Estado</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono h-12">Autor</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono h-12">Última ed.</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-text-weak font-ibm-plex-mono h-12 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites?.map((site: any) => (
                <TableRow key={site.id} className="border-border-weak hover:bg-background-weak transition-colors">
                  <TableCell className="font-medium text-text-strong">
                    <div className="flex flex-col">
                      <span>{site.title}</span>
                      <span className="text-xs text-text-weak font-normal">{site.kind}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        font-normal border-border-weak px-2 py-0.5
                        ${site.status === 'published' ? 'bg-green-500/10 text-green-700' : ''}
                        ${site.status === 'draft' ? 'bg-orange-500/10 text-orange-700' : ''}
                        ${site.status === 'flagged' ? 'bg-red-500/10 text-red-700' : ''}
                      `}
                    >
                      {site.status === 'published' ? 'Publicado' : site.status === 'draft' ? 'Borrador' : 'Reportado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text">
                    {site.profiles?.full_name || 'Desconocido'}
                  </TableCell>
                  <TableCell className="text-text-weak text-sm">
                    {site.updated_at
                      ? formatDistanceToNow(new Date(site.updated_at), { addSuffix: true, locale: es })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-text-weak hover:text-text-strong">
                        <Link href={`/${site.kind.toLowerCase()}/${site.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary" size="sm" className="h-8 gap-2 bg-background-weaker hover:bg-background-weak border border-border-weak">
                        <Link href={`/${site.kind.toLowerCase()}/${site.slug}/edit`}>
                          <Edit3 className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!sites?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-text-weak">
                    No hay animitas registradas en el sistema.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

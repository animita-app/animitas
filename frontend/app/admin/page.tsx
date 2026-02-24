import * as React from "react"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, AlertTriangle, Layers } from "lucide-react"
import { AdminChart } from "./admin-chart"

export const metadata = {
  title: "Admin Dashboard | Animita",
}

export default async function AdminDashboardPage() {
  await requireRole("superadmin")
  const supabase = await createClient()

  // Fetch metrics: just selecting necessary fields to minimize payload
  const { data: sites, error } = await supabase
    .from("heritage_sites")
    .select("id, status")

  if (error) {
    console.error("Error fetching sites for admin:", error)
  }

  const allSites = sites || []
  const publishedCount = allSites.filter(s => s.status === 'published').length
  const draftCount = allSites.filter(s => s.status === 'draft').length
  const flaggedCount = allSites.filter(s => s.status === 'flagged').length

  const chartData = [
    { name: 'Publicadas', value: publishedCount, fill: '#10b981' }, // green-500
    { name: 'Borradores', value: draftCount, fill: '#f59e0b' },     // amber-500
    { name: 'Reportadas', value: flaggedCount, fill: '#ef4444' },   // red-500
  ]

  return (
    <div className="min-h-svh w-full bg-background pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-text-strong font-ibm-plex-mono uppercase">
            Panel de Administración
          </h1>
          <p className="text-text-weak text-base max-w-2xl">
            Métricas generales y control de plataforma.
          </p>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-none border-border-weak bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-weak">Total Animitas</CardTitle>
              <Layers className="h-4 w-4 text-text-weak" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-strong">{allSites.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border-weak bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-weak">Publicadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-strong">{publishedCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border-weak bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-weak">En Borrador</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-strong">{draftCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border-weak bg-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-weak">Reportadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-strong">{flaggedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-none border-border-weak bg-background">
            <CardHeader>
              <CardTitle className="text-lg font-ibm-plex-mono uppercase text-text-strong">
                Distribución por Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <AdminChart data={chartData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

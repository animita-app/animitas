import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AnalysisResult } from "@/lib/analysis-engine"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalysisPanelProps {
  data: AnalysisResult | null
  onClose?: () => void
}

const COLORS = ['#00E', '#292625', '#75706E', '#CFCECC', '#F2F2F2']

export function AnalysisPanel({ data, onClose }: AnalysisPanelProps) {
  if (!data) return null

  return (
    <Card className="absolute right-4 bottom-4 z-10 w-[350px] shadow-sm border-border-weak">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border-weak">
        <CardTitle className="text-sm font-bold text-text-strong uppercase font-ibm-plex-mono">Análisis Espacial</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1 max-h-[500px]">
        <CardContent className="p-4 space-y-6">
          <Tabs defaultValue="typology" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background-weak">
              <TabsTrigger value="typology" className="text-xs">Tipología</TabsTrigger>
              <TabsTrigger value="context" className="text-xs">Contexto</TabsTrigger>
              <TabsTrigger value="distance" className="text-xs">Distancia</TabsTrigger>
            </TabsList>

            <TabsContent value="typology" className="space-y-4">
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.typology.labels.map((label, i) => ({ name: label, value: data.charts.typology.datasets[0].data[i] }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#00E"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.charts.typology.labels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-ibm-plex-mono uppercase">
                {data.charts.typology.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-bold text-text-strong truncate">{label}:</span>
                    <span className="text-text-weak">{data.charts.typology.datasets[0].data[i]}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="context" className="space-y-4">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.context.labels.map((label, i) => ({ name: label, count: data.charts.context.datasets[0].data[i] }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E2E2" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#75706E' }} axisLine={{ stroke: '#E2E2E2' }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#75706E' }} axisLine={{ stroke: '#E2E2E2' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#00E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distance" className="space-y-4">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.distance.labels.map((label, i) => ({ range: label, count: data.charts.distance.datasets[0].data[i] }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#75706E' }} axisLine={{ stroke: '#E2E2E2' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#75706E' }} axisLine={{ stroke: '#E2E2E2' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#292625" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-weak">
            <div className="space-y-1">
              <p className="text-[10px] text-text-weak uppercase font-bold font-ibm-plex-mono">Total Elementos</p>
              <p className="text-2xl font-bold text-text-strong">{data.charts.typology.datasets[0].data.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-text-weak uppercase font-bold font-ibm-plex-mono">Densidad Promedio</p>
              <p className="text-2xl font-bold text-text-strong">High</p>
            </div>
          </div>

        </CardContent>
      </ScrollArea>
    </Card>
  )
}

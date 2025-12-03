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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function AnalysisPanel({ data, onClose }: AnalysisPanelProps) {
  if (!data) return null

  return (
    <Card className="absolute right-4 bottom-4 z-10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-sm font-medium">Análisis Espacial</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-6">
          <Tabs defaultValue="typology" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="typology">Tipología</TabsTrigger>
              <TabsTrigger value="context">Contexto</TabsTrigger>
              <TabsTrigger value="distance">Distancia</TabsTrigger>
            </TabsList>

            <TabsContent value="typology" className="space-y-4">
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.typologyDistribution.labels.map((label, i) => ({ name: label, value: data.typologyDistribution.values[i] }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.typologyDistribution.labels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.typologyDistribution.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium">{label}:</span>
                    <span className="text-muted-foreground">{data.typologyDistribution.values[i]}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="context" className="space-y-4">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.contextCounts.labels.map((label, i) => ({ name: label, count: data.contextCounts.values[i] }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distance" className="space-y-4">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.distanceHistogram.labels.map((label, i) => ({ range: label, count: data.distanceHistogram.values[i] }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Total Elementos</p>
              <p className="text-2xl font-bold">{data.typologyDistribution.values.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">Densidad Promedio</p>
              <p className="text-2xl font-bold">High</p>
            </div>
          </div>

        </CardContent>
      </ScrollArea>
    </Card>
  )
}

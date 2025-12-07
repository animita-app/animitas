import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function StoryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-ibm-plex-mono">Historia</h1>
        <p className="text-muted-foreground text-sm">
          Cuéntanos un poco sobre la historia de esta animita. ¿Por qué está aquí? ¿Qué milagros concede?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="story">Historia</Label>
        <Textarea
          id="story"
          placeholder="Escribe la historia aquí..."
          className="min-h-[200px] text-base"
        />
      </div>
    </div>
  )
}

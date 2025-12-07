import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NamePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-ibm-plex-mono">Nombre</h1>
        <p className="text-muted-foreground text-sm">
          ¿Cómo se llama la persona o entidad a la que está dedicada esta animita?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la animita</Label>
        <Input id="name" placeholder="Ej: Animita de Romualdito" className="text-lg" />
      </div>
    </div>
  )
}

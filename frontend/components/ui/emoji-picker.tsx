"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

const EMOJI_GROUPS = [
  {
    label: "Espiritual",
    items: [
      { emoji: "🙏", terms: ["oración", "rezo", "gracias", "paz"] },
      { emoji: "🕊️", terms: ["paloma", "paz", "espíritu", "libertad"] },
      { emoji: "✝️", terms: ["cruz", "cristiano", "religión", "iglesia"] },
      { emoji: "☪️", terms: ["islam", "musulmán", "luna", "estrella"] },
      { emoji: "✡️", terms: ["judaísmo", "estrella", "david"] },
      { emoji: "🕉️", terms: ["om", "hinduismo", "meditación"] },
      { emoji: "☸️", terms: ["budismo", "rueda", "dharma"] },
      { emoji: "🛐", terms: ["rezo", "templo", "worship"] },
      { emoji: "🙌", terms: ["alabanza", "celebración", "manos"] },
      { emoji: "🤲", terms: ["manos", "ofrenda", "rezo"] },
      { emoji: "⛪", terms: ["iglesia", "catedral", "templo"] },
      { emoji: "🕌", terms: ["mezquita", "islam"] },
      { emoji: "🛕", terms: ["templo", "hinduismo"] },
      { emoji: "🕍", terms: ["sinagoga", "judaísmo"] },
    ],
  },
  {
    label: "Flores & Naturaleza",
    items: [
      { emoji: "🌺", terms: ["flor", "hibisco", "rosa", "tropical"] },
      { emoji: "🌸", terms: ["flor", "cerezo", "sakura", "primavera"] },
      { emoji: "🌹", terms: ["rosa", "flor", "amor", "rojo"] },
      { emoji: "🌷", terms: ["tulipán", "flor", "primavera"] },
      { emoji: "🌼", terms: ["margarita", "flor", "amarilla"] },
      { emoji: "🌻", terms: ["girasol", "sol", "flor", "amarilla"] },
      { emoji: "💐", terms: ["ramo", "flores", "bouquet"] },
      { emoji: "🌿", terms: ["hoja", "verde", "planta", "naturaleza"] },
      { emoji: "🍀", terms: ["trébol", "suerte", "verde"] },
      { emoji: "🌱", terms: ["semilla", "brote", "vida", "nueva"] },
      { emoji: "🌲", terms: ["árbol", "pino", "bosque"] },
      { emoji: "🌳", terms: ["árbol", "roble", "sombra"] },
      { emoji: "🍃", terms: ["hojas", "viento", "verde"] },
      { emoji: "🍂", terms: ["hojas", "otoño", "caída"] },
      { emoji: "🍁", terms: ["hoja", "otoño", "maple"] },
      { emoji: "🌾", terms: ["trigo", "cosecha", "campo"] },
    ],
  },
  {
    label: "Corazones & Amor",
    items: [
      { emoji: "❤️", terms: ["corazón", "amor", "rojo"] },
      { emoji: "🤍", terms: ["corazón", "blanco", "pureza", "paz"] },
      { emoji: "🖤", terms: ["corazón", "negro", "luto"] },
      { emoji: "💛", terms: ["corazón", "amarillo", "amistad"] },
      { emoji: "💙", terms: ["corazón", "azul", "calma"] },
      { emoji: "💜", terms: ["corazón", "morado", "espiritual"] },
      { emoji: "🩵", terms: ["corazón", "celeste", "cielo"] },
      { emoji: "🩷", terms: ["corazón", "rosa", "ternura"] },
      { emoji: "🤎", terms: ["corazón", "café", "tierra"] },
      { emoji: "💚", terms: ["corazón", "verde", "esperanza"] },
      { emoji: "🧡", terms: ["corazón", "naranja", "cálido"] },
      { emoji: "💕", terms: ["corazones", "amor", "afecto"] },
      { emoji: "💔", terms: ["corazón", "roto", "duelo"] },
      { emoji: "❤️‍🔥", terms: ["corazón", "fuego", "pasión"] },
    ],
  },
  {
    label: "Luz & Cielo",
    items: [
      { emoji: "🕯️", terms: ["vela", "luz", "memorial", "llama"] },
      { emoji: "🪔", terms: ["lámpara", "diya", "luz", "festivo"] },
      { emoji: "✨", terms: ["brillante", "estrellas", "magia", "luz"] },
      { emoji: "⭐", terms: ["estrella", "cielo", "noche"] },
      { emoji: "🌟", terms: ["estrella", "brillante", "especial"] },
      { emoji: "💫", terms: ["estrella", "girando", "magia"] },
      { emoji: "🌙", terms: ["luna", "noche", "cielo"] },
      { emoji: "🌛", terms: ["luna", "cuarto", "noche"] },
      { emoji: "🌕", terms: ["luna llena", "cielo", "blanca"] },
      { emoji: "☀️", terms: ["sol", "día", "luz", "calor"] },
      { emoji: "⛅", terms: ["nube", "sol", "cielo"] },
      { emoji: "🌈", terms: ["arcoíris", "colores", "esperanza"] },
      { emoji: "❄️", terms: ["nieve", "frío", "invierno"] },
      { emoji: "🌊", terms: ["ola", "mar", "agua"] },
    ],
  },
  {
    label: "Animales",
    items: [
      { emoji: "🦋", terms: ["mariposa", "transformación", "libertad"] },
      { emoji: "🐝", terms: ["abeja", "trabajo", "miel"] },
      { emoji: "🦅", terms: ["águila", "libertad", "vuelo"] },
      { emoji: "🦉", terms: ["búho", "sabiduría", "noche"] },
      { emoji: "🐦", terms: ["pájaro", "vuelo", "libertad"] },
      { emoji: "🦜", terms: ["loro", "colorido", "pájaro"] },
      { emoji: "🐬", terms: ["delfín", "mar", "alegría"] },
      { emoji: "🌸", terms: ["flor", "cerezo"] },
      { emoji: "🐾", terms: ["huellas", "animal", "mascota"] },
    ],
  },
  {
    label: "Memoriales",
    items: [
      { emoji: "🎗️", terms: ["cinta", "memorial", "recuerdo"] },
      { emoji: "📿", terms: ["rosario", "collar", "rezo"] },
      { emoji: "🪬", terms: ["hamsa", "protección", "amuleto"] },
      { emoji: "🧿", terms: ["mal de ojo", "protección", "turco"] },
      { emoji: "🏺", terms: ["urna", "vasija", "memorial"] },
      { emoji: "⚱️", terms: ["urna", "cenizas", "memorial"] },
      { emoji: "🪦", terms: ["tumba", "lápida", "memorial"] },
      { emoji: "🎶", terms: ["música", "canción", "melodía"] },
      { emoji: "📖", terms: ["libro", "biblia", "lectura"] },
      { emoji: "🕊️", terms: ["paloma", "paz", "espíritu"] },
    ],
  },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  trigger: React.ReactNode
  align?: "start" | "end" | "center"
}

export function EmojiPicker({ onSelect, trigger, align = "start" }: EmojiPickerProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return EMOJI_GROUPS.flatMap(g => g.items).filter(
      item => item.terms.some(t => t.includes(q)) || item.emoji.includes(q)
    )
  }, [query])

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setQuery("") }}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="!p-0 w-64">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/10">
            <Search className="size-3.5 text-white/30 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar emoji..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <ScrollArea className="h-56">
            <div className="p-1.5">
              {filtered ? (
                filtered.length > 0 ? (
                  <div className="grid grid-cols-7 gap-0.5">
                    {filtered.map(({ emoji }) => (
                      <EmojiButton key={emoji} emoji={emoji} onSelect={onSelect} />
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs text-white/30">Sin resultados</p>
                )
              ) : (
                EMOJI_GROUPS.map(group => (
                  <div key={group.label} className="mb-2">
                    <p className="px-1 mb-1 text-[10px] font-medium text-white/30 uppercase tracking-wider">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-7 gap-0.5">
                      {group.items.map(({ emoji }) => (
                        <EmojiButton key={emoji} emoji={emoji} onSelect={onSelect} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmojiButton({ emoji, onSelect }: { emoji: string; onSelect: (emoji: string) => void }) {
  return (
    <button
      type="button"
      className="size-8 hover:bg-neutral-900/70 rounded-sm text-lg aspect-square cursor-pointer flex items-center justify-center"
      onClick={() => onSelect(emoji)}
    >
      {emoji}
    </button>
  )
}

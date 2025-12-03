import {
  Cross,
  Mountain,
  Church,
  Home,
  Leaf,
  Handshake,
  Gem,
  Star,
  MapPin,
  Car,
  Skull,
  Syringe,
  Activity,
  HelpCircle,
  Users,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Heart
} from 'lucide-react';

export const COLORS = {
  animitas: "#0000ff", // Fixed blue color for animitas
  context: {
    highways: "#E57373",
    cemeteries: "#2E8B57",
    bars: "#FF8C00",
    churches: "#6A6AD3"
  },
  searchElements: "#A855F7",
  heatmap: {
    low: "#00FF00",
    mid: "#FFFF00",
    high: "#FF0000"
  },
  clusters: {
    default: "#EC4899"
  },
  highlights: {
    default: "#FDE047" // Yellow
  }
} as const;

// Helper to generate SVG string for geometry icons (for Mapbox/HTML usage)
const svgIcon = (content: string, color: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const ICONS = {
  geometry: {
    point: (color: string) => svgIcon('<circle cx="12" cy="12" r="10"/>', color), // Circle
    line: (color: string) => svgIcon('<path d="M5 12h14"/>', color), // Line
    polygon: (color: string) => svgIcon('<path d="M3 3h18v18H3z"/>', color) // Square
  },
  typology: {
    cruz: { icon: Cross, label: "Cruz" },
    gruta: { icon: Mountain, label: "Gruta" }, // Using Mountain as proxy for 'cave/grotto'
    iglesia: { icon: Church, label: "Iglesia" },
    casa: { icon: Home, label: "Casa" },
    organica: { icon: Leaf, label: "Orgánica" },
    social: { icon: Handshake, label: "Social" },
    moderna: { icon: Gem, label: "Moderna" },
    monumental: { icon: Star, label: "Monumental" },
    default: { icon: MapPin, label: "Animita" }
  },
  deathCause: {
    accident: { icon: Car, label: "Accidente" },
    suicidio: { icon: Skull, label: "Suicidio" }, // Using Skull for suicide
    violence: { icon: Zap, label: "Violencia" }, // Zap/Flash for violence
    illness: { icon: Syringe, label: "Enfermedad" },
    natural: { icon: Leaf, label: "Natural" },
    default: { icon: HelpCircle, label: "Desconocida" }
  },
  socialRoles: {
    familiar: { icon: Users, label: "Familiar" },
    amigo: { icon: Heart, label: "Amigo" },
    devoto: { icon: Handshake, label: "Devoto" },
    trabajador: { icon: Briefcase, label: "Trabajador" },
    estudiante: { icon: GraduationCap, label: "Estudiante" },
    default: { icon: User, label: "Rol" }
  }
};

export const LABELS = {
  animitas: "Animitas",
  contextLayers: {
    highways: "Carreteras",
    cemeteries: "Cementerios",
    bars: "Bares",
    churches: "Iglesias"
  },
  elementos: "Elementos"
};

export const LEGENDS = {
  animitas: { label: LABELS.animitas, color: COLORS.animitas, icon: ICONS.typology.default.icon },
  context: {
    highways: { label: LABELS.contextLayers.highways, color: COLORS.context.highways },
    cemeteries: { label: LABELS.contextLayers.cemeteries, color: COLORS.context.cemeteries },
    bars: { label: LABELS.contextLayers.bars, color: COLORS.context.bars },
    churches: { label: LABELS.contextLayers.churches, color: COLORS.context.churches }
  }
};

export const DEFAULT_STYLES = {
  opacity: 1,
  fillOpacity: 0.4,
  strokeWidth: 2,
  iconSize: 16,
  casingWidth: 1
};

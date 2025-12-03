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
    // Transporte
    highways: "#FF0000", // Red
    critical_points: "#FF4500", // Orange Red for critical points
    urban_streets: "#FFA500", // Orange
    traffic_lights: "#FFD700", // Gold

    // Servicios
    hospitals: "#00FFFF", // Cyan
    cemeteries: "#00FF00", // Green
    police: "#00008B", // Dark Blue
    fire_station: "#FF4500", // Orange Red

    // Sociabilidad
    churches: "#FFFF00", // Yellow
    schools: "#32CD32", // Lime Green
    universities: "#4169E1", // Royal Blue
    bars: "#FF00FF" // Magenta
  },
  searchElements: "#A855F7",
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
    Cruz: { icon: Cross, label: "Cruz" },
    Gruta: { icon: Mountain, label: "Gruta" }, // Using Mountain as proxy for 'cave/grotto'
    Iglesia: { icon: Church, label: "Iglesia" },
    Casa: { icon: Home, label: "Casa" },
    Orgánica: { icon: Leaf, label: "Orgánica" },
    Social: { icon: Handshake, label: "Social" },
    Moderna: { icon: Gem, label: "Moderna" },
    Monumental: { icon: Star, label: "Monumental" },
    Tumba: { icon: Cross, label: "Tumba" }, // Using Cross for Tumba
    Muro: { icon: MapPin, label: "Muro" }, // Using MapPin for Muro
    default: { icon: MapPin, label: "Animita" }
  },
  deathCause: {
    Accidente: { icon: Car, label: "Accidente" },
    Suicidio: { icon: Skull, label: "Suicidio" }, // Using Skull for suicide
    Violencia: { icon: Zap, label: "Violencia" }, // Zap/Flash for violence
    Asesinato: { icon: Zap, label: "Asesinato" }, // Zap/Flash for murder
    Enfermedad: { icon: Syringe, label: "Enfermedad" },
    Natural: { icon: Leaf, label: "Natural" },
    Desconocida: { icon: HelpCircle, label: "Desconocida" },
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
    // Transporte
    highways: "Carreteras Principales",
    critical_points: "Mapa de Calor de Accidentes",
    urban_streets: "Calles Urbanas",
    traffic_lights: "Semáforos",

    // Servicios
    hospitals: "Hospitales",
    cemeteries: "Cementerios",
    police: "Comisarías",
    fire_station: "Bomberos",

    // Sociabilidad
    churches: "Iglesias",
    schools: "Colegios/Liceos",
    universities: "Universidades",
    bars: "Bares"
  },
  elementos: "Elementos"
};

export const LEGENDS = {
  animitas: { label: LABELS.animitas, color: COLORS.animitas, icon: ICONS.typology.default.icon },
  context: {
    highways: { label: LABELS.contextLayers.highways, color: COLORS.context.highways },
    urban_streets: { label: LABELS.contextLayers.urban_streets, color: COLORS.context.urban_streets },
    traffic_lights: { label: LABELS.contextLayers.traffic_lights, color: COLORS.context.traffic_lights },

    hospitals: { label: LABELS.contextLayers.hospitals, color: COLORS.context.hospitals },
    cemeteries: { label: LABELS.contextLayers.cemeteries, color: COLORS.context.cemeteries },
    police: { label: LABELS.contextLayers.police, color: COLORS.context.police },
    fire_station: { label: LABELS.contextLayers.fire_station, color: COLORS.context.fire_station },

    churches: { label: LABELS.contextLayers.churches, color: COLORS.context.churches },
    schools: { label: LABELS.contextLayers.schools, color: COLORS.context.schools },
    universities: { label: LABELS.contextLayers.universities, color: COLORS.context.universities },
    bars: { label: LABELS.contextLayers.bars, color: COLORS.context.bars }
  }
};

export const DEFAULT_STYLES = {
  opacity: 1,
  fillOpacity: 0.4,
  strokeWidth: 2,
  iconSize: 16,
  casingWidth: 1
};

// --- PCI Platform Interfaces ---

// 1. Person (Entidad biográfica)
export interface Person {
  id: string;
  full_name: string;
  birth_date?: string; // ISO 8601 YYYY-MM-DD
  birth_place?: string;
  death_place?: { lat: number; lng: number } | string;
}

// 2. Site (Punto de patrimonio)
export interface Site {
  id: string;
  slug: string;
  title: string;
  person_id: string | null;
  location: { lat: number; lng: number };
  typology: "Gruta" | "Iglesia" | "Casa" | "Cruz" | "Orgánica" | "Social" | "Moderna" | "Monumental" | "Tumba" | "Muro"; // (según Lautaro Ojeda en Animitas: deseos cristalizados de un duelo inacabado)
  images: string[] | null;
  story?: string;
  insights?: SiteInsights;
  created_at: string; // ISO 8601
  created_by: { id: string; name: string };
  allow_edits: boolean;
  size?: "Pequeña" | "Mediana" | "Grande";
}

// 3. Site Story (Historia versionable)
export interface SiteStory {
  id: string;
  site_id: string;
  content: string; // Markdown supported
  created_by: { id: string; name: string };
  created_at: string;
  version: number;
  approved: boolean;
}

// 4. Testimonial (Aportes)
export interface Testimonial {
  id: string;
  site_id: string;
  content: string;
  images?: string[];
  created_by?: {
    id: string;
    name: string;
    relation?: 'familiar' | 'devoto' | 'investigador' | 'otro';
  };
  created_at: string;
  tags?: string[];
}

// Standardized Death Causes
export type DeathCause =
  | 'Accidente'
  | 'Violencia'
  | 'Enfermedad'
  | 'Natural'
  | 'Desconocida'
  | 'Suicidio'
  | 'Asesinato'

// 5. Site Insights (Auto-extraídos)
export interface SiteInsights {
  site_id: string;
  memorial: {
    death_cause?: DeathCause | string; // Allow string for legacy/unmapped, but prefer DeathCause
    social_roles?: string[];
    narrator_relation?: string | null;
    narrator_name_mentioned?: string[];
  };
  spiritual: {
    rituals_mentioned?: string[];
    offerings_mentioned?: string[];
    digital_visit_count?: number;
  };
  patrimonial: {
    antiquity_year?: number | null;
    size?: 'Pequeña' | 'Mediana' | 'Grande';
  };
  generated_at: string;
}

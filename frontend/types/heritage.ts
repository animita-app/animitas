// --- PCI Platform Interfaces ---

// 1. Heritage Category (UNESCO-aligned taxonomy domains)
export interface HeritageCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at: string;
}

// 2. Heritage Kind (specific types within a category)
export interface HeritageKind {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description?: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  category?: HeritageCategory;
}

// 3. HeritageSite (Punto de patrimonio)
export interface HeritageSite {
  id: string;
  slug: string;
  kind_id: string;
  kind?: HeritageKind;
  title: string;
  location: { lat: number; lng: number };
  address?: string | null;
  city_region?: string | null;
  images: string[] | null;
  story?: string;
  insights?: HeritageSiteInsights;
  categories?: HeritageCategory[];
  created_at: string; // ISO 8601
  created_by: { id: string; name: string };
  allow_edits: boolean;
  creator_id: string;
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

// 4. HeritageSite Insights (Auto-extraídos)
export interface HeritageSiteInsights {
  heritage_site_id: string;
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
    form?: string; // Migrated from legacy typology column
  };
  generated_at: string;
}

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
  categories?: HeritageCategory[];
  created_at: string; // ISO 8601
  created_by: { id: string; name: string };
  allow_edits: boolean;
  creator_id: string;
  digital_visit_count?: number;
}

// Standardized Death Causes
export type DeathCause =
  | "Accidente"
  | "Violencia"
  | "Enfermedad"
  | "Natural"
  | "Desconocida"
  | "Suicidio"
  | "Asesinato";

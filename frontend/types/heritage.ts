export interface HeritageSite {
  id: string;
  slug: string;
  title: string;
  location: { lat: number; lng: number };
  address?: string | null;
  city_region?: string | null;
  images: string[] | null;
  story?: string;
  created_at: string; // ISO 8601
  created_by: { id: string; name: string };
  allow_edits: boolean;
  creator_id: string;
  digital_visit_count?: number;
}

// 4. Site Insight (tag attached to a heritage site)
export interface SiteInsight {
  id: string
  site_id: string
  category: string
  subcategory: string
  label: string
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

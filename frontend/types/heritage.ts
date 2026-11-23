export interface HeritageSite {
  id: string;
  slug: string;
  title: string;
  location: { lat: number; lng: number } | null;
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

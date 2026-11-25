-- Heritage Taxonomy Restructure
-- Migrate from simple 'kind' text to structured category + kind system
-- with many-to-many linking via heritage_site_categories

-- 1. CREATE heritage_categories
CREATE TABLE IF NOT EXISTS public.heritage_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.heritage_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Heritage categories are viewable by everyone"
  ON heritage_categories FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify heritage categories"
  ON heritage_categories FOR INSERT
  WITH CHECK (true);

-- 2. CREATE heritage_kinds
CREATE TABLE IF NOT EXISTS public.heritage_kinds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.heritage_categories(id),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  enabled boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.heritage_kinds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Heritage kinds are viewable by everyone"
  ON heritage_kinds FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify heritage kinds"
  ON heritage_kinds FOR INSERT
  WITH CHECK (true);

-- 3. CREATE heritage_site_categories (many-to-many junction)
CREATE TABLE IF NOT EXISTS public.heritage_site_categories (
  site_id uuid NOT NULL REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.heritage_categories(id),
  PRIMARY KEY (site_id, category_id)
);

ALTER TABLE public.heritage_site_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Heritage site categories are viewable by everyone"
  ON heritage_site_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage heritage site categories"
  ON heritage_site_categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete heritage site categories"
  ON heritage_site_categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. INSERT seed categories (6 UNESCO-aligned domains)
INSERT INTO public.heritage_categories (slug, name, icon, sort_order)
VALUES
  ('patrimonio-funerario', 'Patrimonio funerario y conmemorativo', '🕯️', 1),
  ('tradiciones-orales', 'Tradiciones y expresiones orales', '🗣️', 2),
  ('artes-escenicas', 'Artes del espectáculo', '🎭', 3),
  ('usos-sociales-rituales', 'Usos sociales, rituales y actos festivos', '🫂', 4),
  ('conocimiento-naturaleza', 'Conocimientos y usos de la naturaleza', '🌿', 5),
  ('tecnicas-artesanales', 'Técnicas artesanales tradicionales', '🔨', 6)
ON CONFLICT (slug) DO NOTHING;

-- 5. INSERT seed kinds (patrimonio funerario focus — others mostly disabled)
INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'animita', 'Animita', true, 1
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'santuario-vial', 'Santuario vial', true, 2
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'gruta-votiva', 'Gruta votiva', false, 3
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'mausoleo', 'Mausoleo', false, 4
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'placa-conmemorativa', 'Placa conmemorativa', false, 5
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.heritage_kinds (category_id, slug, name, enabled, sort_order)
SELECT id, 'memorial-colectivo', 'Memorial colectivo', false, 6
FROM public.heritage_categories WHERE slug = 'patrimonio-funerario'
ON CONFLICT (slug) DO NOTHING;

-- 6. DELETE records with 0 images (20 seed stubs)
DELETE FROM public.heritage_sites
WHERE jsonb_array_length(images) = 0;

-- 7. MIGRATE typology → insights.patrimonial.form for remaining records
UPDATE public.heritage_sites
SET insights = jsonb_set(
  COALESCE(insights, '{}'::jsonb),
  '{patrimonial,form}',
  to_jsonb(typology)
)
WHERE typology IS NOT NULL;

-- 8. ADD columns and PREPARE for foreign key
ALTER TABLE public.heritage_sites
ADD COLUMN IF NOT EXISTS kind_id uuid REFERENCES public.heritage_kinds(id),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city_region text;

-- 9. BACKFILL kind_id for all remaining records to 'animita' kind
UPDATE public.heritage_sites
SET kind_id = (
  SELECT id FROM public.heritage_kinds WHERE slug = 'animita'
)
WHERE kind_id IS NULL AND status = 'published';

-- 10. ADD heritage_site_categories for all records (link to patrimonio-funerario)
INSERT INTO public.heritage_site_categories (site_id, category_id)
SELECT
  hs.id,
  hc.id
FROM public.heritage_sites hs
CROSS JOIN public.heritage_categories hc
WHERE hc.slug = 'patrimonio-funerario'
AND NOT EXISTS (
  SELECT 1 FROM public.heritage_site_categories
  WHERE site_id = hs.id AND category_id = hc.id
);

-- 11. ADD NOT NULL constraint on kind_id (after backfill)
ALTER TABLE public.heritage_sites
ALTER COLUMN kind_id SET NOT NULL;

-- 12. DROP old columns
ALTER TABLE public.heritage_sites
DROP COLUMN IF EXISTS kind,
DROP COLUMN IF EXISTS typology,
DROP COLUMN IF EXISTS person_id;

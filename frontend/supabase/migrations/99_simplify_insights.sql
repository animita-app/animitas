-- 1. Prepare heritage_sites table
ALTER TABLE public.heritage_sites ADD COLUMN IF NOT EXISTS digital_visit_count int DEFAULT 0;

-- 2. Clean up old structures
DROP TABLE IF EXISTS public.heritage_site_insight_tags CASCADE;
DROP TABLE IF EXISTS public.insight_tags CASCADE;

-- 3. Create simplified insights table
CREATE TABLE IF NOT EXISTS public.site_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.heritage_sites(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  subcategory text,
  label text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(site_id, category, subcategory, label)
);

-- 4. Set RLS
ALTER TABLE public.site_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site insights viewable by everyone" ON public.site_insights;
CREATE POLICY "Site insights viewable by everyone" ON public.site_insights FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users can manage insights" ON public.site_insights;
CREATE POLICY "Auth users can manage insights" ON public.site_insights FOR ALL USING (auth.role() = 'authenticated');

-- 5. Drop legacy column
ALTER TABLE public.heritage_sites DROP COLUMN IF EXISTS insights;

-- 6. Increment function
CREATE OR REPLACE FUNCTION public.increment_visit_count(site_id_param uuid)
RETURNS int AS $$
DECLARE
  new_count int;
BEGIN
  UPDATE public.heritage_sites
  SET digital_visit_count = COALESCE(digital_visit_count, 0) + 1
  WHERE id = site_id_param
  RETURNING digital_visit_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Refresh cache
NOTIFY pgrst, 'reload schema';

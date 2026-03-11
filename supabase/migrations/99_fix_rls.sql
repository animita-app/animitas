-- Fix RLS policies for insights
DROP POLICY IF EXISTS "Auth users can create tags" ON public.insight_tags;
CREATE POLICY "Auth users can create tags" ON public.insight_tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Auth users can link tags" ON public.heritage_site_insight_tags;
CREATE POLICY "Auth users can link tags" ON public.heritage_site_insight_tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Auth users can unlink tags" ON public.heritage_site_insight_tags;
CREATE POLICY "Auth users can unlink tags" ON public.heritage_site_insight_tags FOR DELETE USING (true);

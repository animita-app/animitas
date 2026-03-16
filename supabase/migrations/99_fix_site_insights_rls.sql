-- Fix site_insights RLS: Add missing INSERT/UPDATE/DELETE policies

CREATE POLICY "site_insights_insert" ON public.site_insights
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "site_insights_update" ON public.site_insights
  FOR UPDATE
  USING (true);

CREATE POLICY "site_insights_delete" ON public.site_insights
  FOR DELETE
  USING (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

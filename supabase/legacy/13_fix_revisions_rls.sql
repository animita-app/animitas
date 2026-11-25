-- Fix RLS policy for heritage_site_revisions
-- Allow authenticated users to create revisions for any site

DROP POLICY IF EXISTS "Users can create revisions for sites they can edit" ON public.heritage_site_revisions;

CREATE POLICY "Authenticated users can create revisions"
  ON public.heritage_site_revisions FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

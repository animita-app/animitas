-- Fix foreign key constraint on heritage_site_revisions
-- Add ON DELETE CASCADE so revisions are deleted when site is deleted

ALTER TABLE public.heritage_site_revisions
DROP CONSTRAINT IF EXISTS heritage_site_revisions_site_id_fkey;

ALTER TABLE public.heritage_site_revisions
ADD CONSTRAINT heritage_site_revisions_site_id_fkey
FOREIGN KEY (site_id)
REFERENCES public.heritage_sites(id)
ON DELETE CASCADE;

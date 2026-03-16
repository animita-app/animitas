-- Fix foreign key constraint on heritage_site_votes
-- Add ON DELETE CASCADE so votes are deleted when site is deleted

ALTER TABLE public.heritage_site_votes
DROP CONSTRAINT IF EXISTS heritage_site_votes_site_id_fkey;

ALTER TABLE public.heritage_site_votes
ADD CONSTRAINT heritage_site_votes_site_id_fkey
FOREIGN KEY (site_id)
REFERENCES public.heritage_sites(id)
ON DELETE CASCADE;

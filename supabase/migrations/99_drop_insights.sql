-- Drop legacy insights column from heritage_sites
ALTER TABLE public.heritage_sites DROP COLUMN IF EXISTS insights;

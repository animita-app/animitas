-- Clean up duplicate categories and kinds, keeping only the UNESCO approved list

-- 1. Clear all heritage site category associations
DELETE FROM public.heritage_site_categories;

-- 2. Get list of approved category slugs to keep
-- Delete all heritage_kinds NOT in the approved list
DELETE FROM public.heritage_kinds
WHERE slug NOT IN (
  'lenguas', 'lugares-miticos', 'gastronomia',
  'teatro', 'danza', 'musica',
  'santuarios', 'peregrinaciones', 'fiestas', 'funerales', 'rituales',
  'agricultura', 'agua', 'territorio',
  'arquitectura', 'ceramica', 'textileria'
);

-- 3. Delete all heritage_categories NOT in the approved list
DELETE FROM public.heritage_categories
WHERE slug NOT IN (
  'tradiciones-expresiones-orales',
  'artes-espectaculo',
  'usos-sociales-rituales-festivos',
  'conocimientos-naturaleza',
  'artesanias'
);

-- 4. Ensure approved categories exist with correct data
INSERT INTO public.heritage_categories (name, slug, enabled) VALUES
  ('Tradiciones y expresiones orales', 'tradiciones-expresiones-orales', true),
  ('Artes del espectáculo', 'artes-espectaculo', true),
  ('Usos sociales, rituales y actos festivos', 'usos-sociales-rituales-festivos', true),
  ('Conocimientos sobre la naturaleza', 'conocimientos-naturaleza', true),
  ('Artesanías', 'artesanias', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = true;

-- 5. Ensure approved kinds exist with correct data
INSERT INTO public.heritage_kinds (name, slug, category_id, enabled) VALUES
  -- Tradiciones y expresiones orales
  ('Lenguas', 'lenguas', (SELECT id FROM heritage_categories WHERE slug = 'tradiciones-expresiones-orales'), true),
  ('Lugares míticos', 'lugares-miticos', (SELECT id FROM heritage_categories WHERE slug = 'tradiciones-expresiones-orales'), true),
  ('Gastronomía', 'gastronomia', (SELECT id FROM heritage_categories WHERE slug = 'tradiciones-expresiones-orales'), true),
  -- Artes del espectáculo
  ('Teatro', 'teatro', (SELECT id FROM heritage_categories WHERE slug = 'artes-espectaculo'), true),
  ('Danza', 'danza', (SELECT id FROM heritage_categories WHERE slug = 'artes-espectaculo'), true),
  ('Música', 'musica', (SELECT id FROM heritage_categories WHERE slug = 'artes-espectaculo'), true),
  -- Usos sociales, rituales y actos festivos
  ('Santuarios', 'santuarios', (SELECT id FROM heritage_categories WHERE slug = 'usos-sociales-rituales-festivos'), true),
  ('Peregrinaciones', 'peregrinaciones', (SELECT id FROM heritage_categories WHERE slug = 'usos-sociales-rituales-festivos'), true),
  ('Fiestas', 'fiestas', (SELECT id FROM heritage_categories WHERE slug = 'usos-sociales-rituales-festivos'), true),
  ('Funerales', 'funerales', (SELECT id FROM heritage_categories WHERE slug = 'usos-sociales-rituales-festivos'), true),
  ('Rituales', 'rituales', (SELECT id FROM heritage_categories WHERE slug = 'usos-sociales-rituales-festivos'), true),
  -- Conocimientos sobre la naturaleza
  ('Agricultura', 'agricultura', (SELECT id FROM heritage_categories WHERE slug = 'conocimientos-naturaleza'), true),
  ('Agua', 'agua', (SELECT id FROM heritage_categories WHERE slug = 'conocimientos-naturaleza'), true),
  ('Territorio', 'territorio', (SELECT id FROM heritage_categories WHERE slug = 'conocimientos-naturaleza'), true),
  -- Artesanías
  ('Arquitectura', 'arquitectura', (SELECT id FROM heritage_categories WHERE slug = 'artesanias'), true),
  ('Cerámica', 'ceramica', (SELECT id FROM heritage_categories WHERE slug = 'artesanias'), true),
  ('Textilería', 'textileria', (SELECT id FROM heritage_categories WHERE slug = 'artesanias'), true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = true;

-- 6. Assign all existing heritage sites to "Santuarios" kind
UPDATE public.heritage_sites
SET kind_id = (SELECT id FROM heritage_kinds WHERE slug = 'santuarios' LIMIT 1)
WHERE kind_id IS NULL OR kind_id NOT IN (SELECT id FROM heritage_kinds);

-- 7. Assign all existing sites to the "Usos sociales, rituales y actos festivos" category
INSERT INTO public.heritage_site_categories (site_id, category_id)
SELECT DISTINCT hs.id, hc.id
FROM public.heritage_sites hs
CROSS JOIN public.heritage_categories hc
WHERE hc.slug = 'usos-sociales-rituales-festivos'
ON CONFLICT DO NOTHING;

-- Verify the cleanup
SELECT 'Taxonomy cleanup completed successfully' as status;
SELECT count(*) as total_categories FROM public.heritage_categories;
SELECT count(*) as total_kinds FROM public.heritage_kinds;
SELECT count(*) as total_site_categories FROM public.heritage_site_categories;

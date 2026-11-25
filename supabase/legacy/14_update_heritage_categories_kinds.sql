-- 1. Insert UNESCO heritage categories (don't delete old ones to avoid foreign key issues)
INSERT INTO public.heritage_categories (name, slug) VALUES
  ('Tradiciones y expresiones orales', 'tradiciones-expresiones-orales'),
  ('Artes del espectáculo', 'artes-espectaculo'),
  ('Usos sociales, rituales y actos festivos', 'usos-sociales-rituales-festivos'),
  ('Conocimientos sobre la naturaleza', 'conocimientos-naturaleza'),
  ('Artesanías', 'artesanias')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert heritage kinds with their categories
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
ON CONFLICT (slug) DO NOTHING;

-- 3. Migrate existing sites to Santuarios kind (all animitas)
UPDATE public.heritage_sites
SET kind_id = (SELECT id FROM heritage_kinds WHERE slug = 'santuarios' LIMIT 1)
WHERE id IN (SELECT id FROM public.heritage_sites);

-- 4. Assign "Usos sociales, rituales y actos festivos" category to all existing sites
INSERT INTO public.heritage_site_categories (site_id, category_id)
SELECT DISTINCT hs.id, hc.id
FROM public.heritage_sites hs
CROSS JOIN public.heritage_categories hc
WHERE hc.slug = 'usos-sociales-rituales-festivos'
AND NOT EXISTS (
  SELECT 1 FROM public.heritage_site_categories hsc
  WHERE hsc.site_id = hs.id
)
ON CONFLICT DO NOTHING;

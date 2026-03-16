-- Populate heritage_site_categories for existing sites
-- Links all heritage sites to their appropriate categories
-- If a site already has a category link, it will be skipped

INSERT INTO public.heritage_site_categories (site_id, category_id)
SELECT
  hs.id,
  (SELECT id FROM public.heritage_categories ORDER BY sort_order LIMIT 1) as default_category_id
FROM public.heritage_sites hs
WHERE NOT EXISTS (
  SELECT 1 FROM public.heritage_site_categories hsc
  WHERE hsc.site_id = hs.id
)
ON CONFLICT (site_id, category_id) DO NOTHING;

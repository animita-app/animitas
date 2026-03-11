-- Populate insights for site_insights table
-- This script adds 5 subcategories for each of the 3 main categories (memorial, spiritual, patrimonial)
-- and several tags for each subcategory.

-- We'll use a specific site_id for testing (animita-del-cabo-gomez approx ID or the one from screenshot)
-- Or better, we can insert for all sites to make testing easier globally.

DO $$
DECLARE
    target_site_id UUID;
BEGIN
    -- Try to find the site 'animita-del-cabo-gomez'
    SELECT id INTO target_site_id FROM public.heritage_sites WHERE slug = 'animita-del-cabo-gomez' LIMIT 1;

    -- If not found, just use the first one available
    IF target_site_id IS NULL THEN
        SELECT id INTO target_site_id FROM public.heritage_sites LIMIT 1;
    END IF;

    IF target_site_id IS NOT NULL THEN
        -- Clear existing insights for this site to avoid duplication
        DELETE FROM public.site_insights WHERE site_id = target_site_id;

        -- Insert Memorial insights
        INSERT INTO public.site_insights (site_id, category, subcategory, label) VALUES
        (target_site_id, 'memorial', 'Causa de muerte', 'Homicidios y Violencia'),
        (target_site_id, 'memorial', 'Causa de muerte', 'Natural'),
        (target_site_id, 'memorial', 'Rol social', 'Obrero / Trabajador'),
        (target_site_id, 'memorial', 'Rol social', 'Militar / Uniformado'),
        (target_site_id, 'memorial', 'Vinculación', 'Vecino del sector'),
        (target_site_id, 'memorial', 'Contexto histórico', 'Dictadura Militar'),
        (target_site_id, 'memorial', 'Rango de edad', 'Adulto Joven (18-29)');

        -- Insert Spiritual insights
        INSERT INTO public.site_insights (site_id, category, subcategory, label) VALUES
        (target_site_id, 'spiritual', 'Rituales', 'Prender Velas'),
        (target_site_id, 'spiritual', 'Rituales', 'Rezos y Oraciones'),
        (target_site_id, 'spiritual', 'Ofrendas', 'Juguetes y Peluches'),
        (target_site_id, 'spiritual', 'Ofrendas', 'Fotos y Recuerdos'),
        (target_site_id, 'spiritual', 'Creencias', 'Popular'),
        (target_site_id, 'spiritual', 'Manifestaciones', 'Milagros'),
        (target_site_id, 'spiritual', 'Espacios sagrados', 'Altar principal');

        -- Insert Patrimonial insights
        INSERT INTO public.site_insights (site_id, category, subcategory, label) VALUES
        (target_site_id, 'patrimonial', 'Tipología', 'Muro Conmemorativo'),
        (target_site_id, 'patrimonial', 'Escala', 'Monumental'),
        (target_site_id, 'patrimonial', 'Materialidad', 'Ladrillo'),
        (target_site_id, 'patrimonial', 'Estado de conservación', 'Excelente'),
        (target_site_id, 'patrimonial', 'Época', 'Siglo XXI');
    END IF;
END $$;

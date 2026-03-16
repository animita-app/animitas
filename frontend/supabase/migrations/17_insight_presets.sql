-- Create insight_presets table for kind-specific insight library
CREATE TABLE IF NOT EXISTS public.insight_presets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kind_id uuid NOT NULL REFERENCES public.heritage_kinds(id) ON DELETE CASCADE,
  category text NOT NULL,
  label text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(kind_id, category, label)
);

ALTER TABLE public.insight_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insight presets viewable by everyone"
  ON public.insight_presets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert insight presets"
  ON public.insight_presets FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Update site_insights: simplify by removing subcategory
ALTER TABLE public.site_insights DROP COLUMN IF EXISTS subcategory;

-- Update UNIQUE constraint
ALTER TABLE public.site_insights DROP CONSTRAINT IF EXISTS site_insights_site_id_category_subcategory_label_key;
ALTER TABLE public.site_insights ADD CONSTRAINT site_insights_site_id_category_label_key UNIQUE(site_id, category, label);

-- Seed insight presets for animita kind
INSERT INTO public.insight_presets (kind_id, category, label)
SELECT
  hk.id,
  cat,
  label
FROM public.heritage_kinds hk
CROSS JOIN (
  VALUES
    ('Causa de muerte', 'Accidente'),
    ('Causa de muerte', 'Violencia'),
    ('Causa de muerte', 'Enfermedad'),
    ('Causa de muerte', 'Natural'),
    ('Causa de muerte', 'Suicidio'),
    ('Causa de muerte', 'Asesinato'),
    ('Causa de muerte', 'Homicidio'),
    ('Causa de muerte', 'Incendio'),
    ('Rol social', 'Trabajador'),
    ('Rol social', 'Padre'),
    ('Rol social', 'Madre'),
    ('Rol social', 'Estudiante'),
    ('Rol social', 'Niño/a'),
    ('Rol social', 'Líder'),
    ('Ritual', 'Prender velas'),
    ('Ritual', 'Rezos y oraciones'),
    ('Ritual', 'Velatón'),
    ('Ofrenda', 'Flores'),
    ('Ofrenda', 'Agua'),
    ('Ofrenda', 'Juguetes y peluches'),
    ('Ofrenda', 'Fotos y recuerdos'),
    ('Ofrenda', 'Cigarrillos'),
    ('Ofrenda', 'Alcohol'),
    ('Forma', 'Cruz'),
    ('Forma', 'Gruta'),
    ('Forma', 'Casita'),
    ('Forma', 'Placa'),
    ('Forma', 'Estatua'),
    ('Forma', 'Mural'),
    ('Escala', 'Pequeña'),
    ('Escala', 'Mediana'),
    ('Escala', 'Grande'),
    ('Escala', 'Monumental')
) AS presets(cat, label)
WHERE hk.slug = 'animita'
ON CONFLICT (kind_id, category, label) DO NOTHING;

-- Seed presets for santuario-vial
INSERT INTO public.insight_presets (kind_id, category, label)
SELECT
  hk.id,
  cat,
  label
FROM public.heritage_kinds hk
CROSS JOIN (
  VALUES
    ('Tipo de evento', 'Accidente vehicular'),
    ('Tipo de evento', 'Derrumbe'),
    ('Tipo de evento', 'Caída'),
    ('Rol de víctima', 'Conductor'),
    ('Rol de víctima', 'Pasajero'),
    ('Rol de víctima', 'Peatón'),
    ('Lugar', 'Esquina'),
    ('Lugar', 'Curva'),
    ('Lugar', 'Recta'),
    ('Lugar', 'Puente'),
    ('Condiciones', 'Neblina'),
    ('Condiciones', 'Lluvia'),
    ('Condiciones', 'Noche'),
    ('Material', 'Flores'),
    ('Material', 'Cruces'),
    ('Material', 'Mensajes'),
    ('Material', 'Fotos')
) AS presets(cat, label)
WHERE hk.slug = 'santuario-vial'
ON CONFLICT (kind_id, category, label) DO NOTHING;

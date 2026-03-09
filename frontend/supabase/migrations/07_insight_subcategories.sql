-- Add subcategory column to insight_tags
alter table public.insight_tags add column if not exists subcategory text;

-- Update existing tags with subcategories
update public.insight_tags set subcategory = 'Causa de muerte' where label in ('Accidente', 'Violencia', 'Enfermedad', 'Natural', 'Suicidio', 'Asesinato');
update public.insight_tags set subcategory = 'Roles sociales' where label in ('Trabajador', 'Padre', 'Madre', 'Estudiante');
update public.insight_tags set subcategory = 'Ofrendas' where label in ('Flores', 'Velas', 'Agua');
update public.insight_tags set subcategory = 'Rituales' where label in ('Velatón', 'Oración');
update public.insight_tags set subcategory = 'Morfología' where label in ('Cruz', 'Gruta', 'Casita', 'Placa');
update public.insight_tags set subcategory = 'Dimensiones' where label in ('Pequeña', 'Mediana', 'Grande');

-- Seed additional tags if needed
insert into insight_tags (category, subcategory, label) values
  ('memorial', 'Causa de muerte', 'Homicidio'),
  ('memorial', 'Causa de muerte', 'Incendio'),
  ('memorial', 'Roles sociales', 'Niño/a'),
  ('memorial', 'Roles sociales', 'Líder'),
  ('spiritual', 'Ofrendas', 'Juguetes'),
  ('spiritual', 'Ofrendas', 'Cigarrillos'),
  ('spiritual', 'Ofrendas', 'Alcohol'),
  ('patrimonial', 'Morfología', 'Estatua'),
  ('patrimonial', 'Morfología', ' Mural')
on conflict (category, label) do update set subcategory = excluded.subcategory;

-- Reactions (emoji-based, replaces hardcoded data)
create table if not exists public.heritage_site_reactions (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.heritage_sites(id) on delete cascade not null,
  user_id uuid not null,
  emoji text not null,
  created_at timestamptz default now() not null,
  unique(site_id, user_id, emoji)
);

alter table public.heritage_site_reactions enable row level security;
create policy "Reactions viewable by everyone" on heritage_site_reactions for select using (true);
create policy "Auth users can react" on heritage_site_reactions for insert with check (auth.uid() = user_id);
create policy "Users can remove own reaction" on heritage_site_reactions for delete using (auth.uid() = user_id);

-- Comments
create table if not exists public.heritage_site_comments (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.heritage_sites(id) on delete cascade not null,
  user_id uuid not null,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.heritage_site_comments enable row level security;
create policy "Comments viewable by everyone" on heritage_site_comments for select using (true);
create policy "Auth users can comment" on heritage_site_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comment" on heritage_site_comments for delete using (auth.uid() = user_id);

-- Insight tags (global catalog)
create table if not exists public.insight_tags (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('memorial', 'spiritual', 'patrimonial')),
  label text not null,
  created_at timestamptz default now() not null,
  unique(category, label)
);

alter table public.insight_tags enable row level security;
create policy "Insight tags viewable by everyone" on insight_tags for select using (true);
create policy "Auth users can create tags" on insight_tags for insert with check (auth.uid() is not null);

-- Site ↔ insight tag junction
create table if not exists public.heritage_site_insight_tags (
  site_id uuid references public.heritage_sites(id) on delete cascade not null,
  tag_id uuid references public.insight_tags(id) on delete cascade not null,
  primary key (site_id, tag_id)
);

alter table public.heritage_site_insight_tags enable row level security;
create policy "Site insight tags viewable by everyone" on heritage_site_insight_tags for select using (true);
create policy "Auth users can link tags" on heritage_site_insight_tags for insert with check (auth.uid() is not null);
create policy "Auth users can unlink tags" on heritage_site_insight_tags for delete using (auth.uid() is not null);

-- Routes (collections of sites)
create table if not exists public.site_routes (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.site_routes enable row level security;
create policy "Routes viewable by everyone" on site_routes for select using (true);
create policy "Auth users can create routes" on site_routes for insert with check (auth.uid() = creator_id);
create policy "Users can update own routes" on site_routes for update using (auth.uid() = creator_id);
create policy "Users can delete own routes" on site_routes for delete using (auth.uid() = creator_id);

-- Route items (junction)
create table if not exists public.site_route_items (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.site_routes(id) on delete cascade not null,
  site_id uuid references public.heritage_sites(id) on delete cascade not null,
  sort_order integer default 0,
  added_at timestamptz default now() not null,
  unique(route_id, site_id)
);

alter table public.site_route_items enable row level security;
create policy "Route items viewable by everyone" on site_route_items for select using (true);
create policy "Route owners can add items" on site_route_items for insert with check (
  auth.uid() = (select creator_id from site_routes where id = route_id)
);
create policy "Route owners can remove items" on site_route_items for delete using (
  auth.uid() = (select creator_id from site_routes where id = route_id)
);

-- Seed common insight tags
insert into insight_tags (category, label) values
  ('memorial', 'Accidente'),
  ('memorial', 'Violencia'),
  ('memorial', 'Enfermedad'),
  ('memorial', 'Natural'),
  ('memorial', 'Suicidio'),
  ('memorial', 'Asesinato'),
  ('memorial', 'Trabajador'),
  ('memorial', 'Padre'),
  ('memorial', 'Madre'),
  ('memorial', 'Estudiante'),
  ('spiritual', 'Velatón'),
  ('spiritual', 'Flores'),
  ('spiritual', 'Velas'),
  ('spiritual', 'Agua'),
  ('spiritual', 'Oración'),
  ('patrimonial', 'Cruz'),
  ('patrimonial', 'Gruta'),
  ('patrimonial', 'Casita'),
  ('patrimonial', 'Placa'),
  ('patrimonial', 'Pequeña'),
  ('patrimonial', 'Mediana'),
  ('patrimonial', 'Grande')
on conflict do nothing;

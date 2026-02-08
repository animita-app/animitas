-- Enable PostGIS
create extension if not exists postgis;

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  role text default 'default' check (role in ('default', 'editor', 'superadmin')),
  research_mode boolean default false,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. HERITAGE SITES
create table if not exists public.heritage_sites (
  id uuid default gen_random_uuid() primary key,
  slug text unique,
  kind text default 'Animita',
  title text not null,
  location geometry(Point, 4326),
  typology text,
  images jsonb default '[]'::jsonb,
  story text,
  person_id uuid, -- could be a foreign key to a 'people' table if it existed
  insights jsonb,
  creator_id uuid references public.profiles(id),
  status text default 'published' check (status in ('draft', 'published', 'flagged')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for spatial queries
create index if not exists heritage_sites_location_idx
  on public.heritage_sites
  using GIST (location);

alter table public.heritage_sites enable row level security;

create policy "Heritage sites are viewable by everyone."
  on heritage_sites for select
  using ( true );

create policy "Authenticated users can insert heritage sites"
  on heritage_sites for insert
  with check ( auth.role() = 'authenticated' );

create policy "Editors and Superadmins can update heritage sites"
  on heritage_sites for update
  using (
    auth.uid() in (
      select id from profiles where role in ('editor', 'superadmin')
    )
    OR
    auth.uid() = creator_id -- Creators can edit their own? maybe constraint this later
  );

-- 3. REVISIONS (Wikipedia-style)
create table if not exists public.heritage_site_revisions (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.heritage_sites(id) not null,
  author_id uuid references public.profiles(id),
  snapshot jsonb not null,
  diff_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.heritage_site_revisions enable row level security;

create policy "Revisions are viewable by everyone."
  on heritage_site_revisions for select
  using ( true );

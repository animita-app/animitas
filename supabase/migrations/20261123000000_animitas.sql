-- Minimal schema for a fresh Supabase project: animitas, candles, comments and profiles.
-- Table names match the previous project so the app also works if that one is restored.
-- The old migrations are kept in supabase/legacy for reference only.

create extension if not exists postgis with schema extensions;

-- Profiles ------------------------------------------------------------------

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.]{3,30}$'),
  display_name text check (char_length(display_name) <= 80),
  image text,
  role text not null default 'default' check (role in ('default', 'editor', 'superadmin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role in ('editor', 'superadmin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, display_name, image)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Animitas ------------------------------------------------------------------

create table public.heritage_sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 120),
  story text not null default '' check (char_length(story) <= 10000),
  location extensions.geometry (Point, 4326) not null,
  -- PostgREST returns geometry as WKB; plain coordinates let the app read the point directly.
  lat double precision generated always as (extensions.st_y(location)) stored,
  lng double precision generated always as (extensions.st_x(location)) stored,
  address text,
  city_region text,
  images text[] not null default '{}' check (cardinality(images) <= 5),
  status text not null default 'published' check (status in ('draft', 'published', 'flagged')),
  creator_id uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index heritage_sites_location_idx on public.heritage_sites using gist (location);
create index heritage_sites_creator_idx on public.heritage_sites (creator_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger heritage_sites_touch
  before update on public.heritage_sites
  for each row execute function public.touch_updated_at();

-- Candles (one per person per animita; the emoji column is kept for compatibility)

create table public.heritage_site_reactions (
  site_id uuid not null references public.heritage_sites (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  emoji text not null default '🕯️',
  created_at timestamptz not null default now(),
  primary key (site_id, user_id, emoji)
);

-- Comments ------------------------------------------------------------------

create table public.heritage_site_comments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.heritage_sites (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index heritage_site_comments_site_idx on public.heritage_site_comments (site_id, created_at desc);

-- Row level security --------------------------------------------------------

alter table public.user_profiles enable row level security;
alter table public.heritage_sites enable row level security;
alter table public.heritage_site_reactions enable row level security;
alter table public.heritage_site_comments enable row level security;

create policy "Profiles are public" on public.user_profiles
  for select using (true);
create policy "People create their own profile" on public.user_profiles
  for insert to authenticated with check (id = auth.uid());
create policy "People edit their own profile" on public.user_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Nobody can set their own role from the app: only these columns are writable.
revoke insert, update on public.user_profiles from anon, authenticated;
grant insert (id, username, display_name, image) on public.user_profiles to authenticated;
grant update (username, display_name, image) on public.user_profiles to authenticated;

create policy "Published animitas are public" on public.heritage_sites
  for select using (status = 'published' or creator_id = auth.uid() or public.is_editor());
create policy "Signed-in people add animitas" on public.heritage_sites
  for insert to authenticated with check (creator_id = auth.uid());
create policy "Creators and editors edit animitas" on public.heritage_sites
  for update to authenticated
  using (creator_id = auth.uid() or public.is_editor())
  with check (creator_id = auth.uid() or public.is_editor());

create policy "Candles are public" on public.heritage_site_reactions
  for select using (true);
create policy "People light their own candle" on public.heritage_site_reactions
  for insert to authenticated with check (user_id = auth.uid());
create policy "People put out their own candle" on public.heritage_site_reactions
  for delete to authenticated using (user_id = auth.uid());

create policy "Comments are public" on public.heritage_site_comments
  for select using (true);
create policy "Signed-in people comment" on public.heritage_site_comments
  for insert to authenticated with check (user_id = auth.uid());
create policy "People delete their own comments" on public.heritage_site_comments
  for delete to authenticated using (user_id = auth.uid() or public.is_editor());

-- Storage -------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('base', 'base', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Photos are public" on storage.objects
  for select using (bucket_id in ('base', 'avatars'));
create policy "People upload to their own folder in base" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'base' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "People replace their own files in base" on storage.objects
  for update to authenticated
  using (bucket_id = 'base' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "People upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "People replace their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

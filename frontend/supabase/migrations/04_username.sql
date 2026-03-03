-- Add username column to profiles
alter table public.profiles add column if not exists username text unique;

-- Index for username lookups
create index if not exists profiles_username_idx on public.profiles (username);

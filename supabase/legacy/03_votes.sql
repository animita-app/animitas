-- Create votes table for poll persistence
create table if not exists public.heritage_site_votes (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.heritage_sites(id) not null,
  user_id uuid references public.profiles(id) not null,
  option text not null check (option in ('correct','incomplete','errors')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(site_id, user_id)
);

alter table public.heritage_site_votes enable row level security;

-- Everyone can see vote counts
create policy "Votes are viewable by everyone"
  on heritage_site_votes for select
  using (true);

-- Authenticated users can insert their own vote
create policy "Authenticated users can insert votes"
  on heritage_site_votes for insert
  with check (auth.uid() = user_id);

-- Users can update their own vote (change option)
create policy "Users can update own vote"
  on heritage_site_votes for update
  using (auth.uid() = user_id);

-- Users can delete their own vote
create policy "Users can delete own vote"
  on heritage_site_votes for delete
  using (auth.uid() = user_id);

CREATE TABLE public.heritage_site_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.heritage_sites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.heritage_site_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone"
  ON public.heritage_site_comments FOR SELECT USING (true);

CREATE POLICY "Auth users can insert comments"
  ON public.heritage_site_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.heritage_site_comments FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.heritage_site_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.heritage_sites(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(site_id, user_id, emoji)
);

ALTER TABLE public.heritage_site_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by everyone"
  ON public.heritage_site_reactions FOR SELECT USING (true);

CREATE POLICY "Auth users can insert reactions"
  ON public.heritage_site_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.heritage_site_reactions FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

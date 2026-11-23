CREATE TABLE public.heritage_comment_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid REFERENCES public.heritage_site_comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(comment_id, user_id, emoji)
);

ALTER TABLE public.heritage_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment reactions viewable by everyone"
  ON public.heritage_comment_reactions FOR SELECT USING (true);

CREATE POLICY "Auth users can insert comment reactions"
  ON public.heritage_comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment reactions"
  ON public.heritage_comment_reactions FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

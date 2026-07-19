-- ⚠️ JALANKAN INI DI SUPABASE SQL EDITOR

-- 1. DROP table lama (catat data dulu jika penting!)
DROP TABLE IF EXISTS public.posts CASCADE;

-- 2. CREATE table baru dengan struktur yang benar
CREATE TABLE public.posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  photo TEXT,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  lastSeen TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'found')),
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ratings JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. Set RLS policy agar bisa diakses dari frontend
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert posts" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (true);

-- 4. Create index untuk performa
CREATE INDEX idx_posts_userId ON public.posts(userId);
CREATE INDEX idx_posts_createdAt ON public.posts(createdAt DESC);
CREATE INDEX idx_posts_status ON public.posts(status);

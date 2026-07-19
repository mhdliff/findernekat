-- Supabase/PostgreSQL schema for FinderNeekat temukembali project
-- Run this in Supabase SQL Editor to recreate the database schema.

-- NOTE: If you see "cannot execute CREATE EXTENSION in a read-only transaction",
-- run the following statement separately first in the Supabase SQL editor:
--   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Then run the rest of this file.

-- Enable pgcrypto for UUID generation
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  initials TEXT,
  online BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
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

-- Error reports table
CREATE TABLE IF NOT EXISTS public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT,
  url TEXT,
  user_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert posts" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (true);

-- Recommended indexes
CREATE INDEX IF NOT EXISTS idx_posts_userId ON public.posts(userId);
CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON public.posts(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- SynergyHub Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories (Silos) table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'star',
  color_theme TEXT NOT NULL DEFAULT '#6366f1',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('daily', 'checklist')),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Task logs table (histori penyelesaian)
CREATE TABLE public.task_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_user_position ON public.categories(user_id, position);
CREATE INDEX idx_tasks_category_id ON public.tasks(category_id);
CREATE INDEX idx_tasks_category_position ON public.tasks(category_id, position);
CREATE INDEX idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX idx_task_logs_completed_at ON public.task_logs(completed_at);
CREATE INDEX idx_task_logs_date_completed ON public.task_logs(completed_at, is_completed) WHERE is_completed = true;

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = tasks.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = tasks.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = tasks.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = tasks.category_id
      AND categories.user_id = auth.uid()
    )
  );

-- Task logs policies
CREATE POLICY "Users can view own task logs" ON public.task_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.categories ON categories.id = tasks.category_id
      WHERE tasks.id = task_logs.task_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own task logs" ON public.task_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.categories ON categories.id = tasks.category_id
      WHERE tasks.id = task_logs.task_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task logs" ON public.task_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.categories ON categories.id = tasks.category_id
      WHERE tasks.id = task_logs.task_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task logs" ON public.task_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      JOIN public.categories ON categories.id = tasks.category_id
      WHERE tasks.id = task_logs.task_id
      AND categories.user_id = auth.uid()
    )
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get daily task logs (for today)
CREATE OR REPLACE FUNCTION public.get_today_task_logs(p_task_id UUID)
RETURNS TABLE(id UUID, task_id UUID, completed_at TIMESTAMPTZ, is_completed BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT tl.id, tl.task_id, tl.completed_at, tl.is_completed
  FROM public.task_logs tl
  WHERE tl.task_id = p_task_id
    AND DATE(tl.completed_at) = CURRENT_DATE
    AND tl.is_completed = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get contribution heatmap data
CREATE OR REPLACE FUNCTION public.get_contribution_heatmap(p_user_id UUID, p_days INTEGER DEFAULT 365)
RETURNS TABLE(date DATE, count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date::DATE,
    COUNT(tl.id)::INTEGER
  FROM generate_series(
    CURRENT_DATE - (p_days - 1)::INTERVAL,
    CURRENT_DATE,
    '1 day'::INTERVAL
  ) AS d(date)
  LEFT JOIN public.task_logs tl 
    ON DATE(tl.completed_at) = d.date 
    AND tl.is_completed = true
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.categories c ON c.id = t.category_id
      WHERE t.id = tl.task_id AND c.user_id = p_user_id
    )
  WHERE p_user_id = auth.uid() OR p_user_id = NULL
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
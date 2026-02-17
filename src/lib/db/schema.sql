-- ─── 1. Enable Extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 2. Create Types ──────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE venture_stage AS ENUM ('discovery', 'analysis', 'report_ready');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── 3. Create Tables ──────────────────────────────────────────────

-- Ventures Table
CREATE TABLE public.ventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL DEFAULT auth.uid(), -- Links to Supabase Auth user
    stage venture_stage NOT NULL DEFAULT 'discovery',
    knowledge_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 4. Row Level Security (RLS) ───────────────────────────────────

-- Enable RLS
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Ventures Policies
CREATE POLICY "Users can create their own ventures"
    ON public.ventures FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ventures"
    ON public.ventures FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ventures"
    ON public.ventures FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ventures"
    ON public.ventures FOR DELETE
    USING (auth.uid() = user_id);

-- Messages Policies
-- Users can access messages if they own the parent venture
CREATE POLICY "Users can insert messages for their ventures"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ventures
            WHERE id = venture_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view messages for their ventures"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ventures
            WHERE id = venture_id AND user_id = auth.uid()
        )
    );

-- ─── 5. Indexes for Performance ────────────────────────────────────
CREATE INDEX idx_ventures_user_id ON public.ventures(user_id);
CREATE INDEX idx_messages_venture_id ON public.messages(venture_id);

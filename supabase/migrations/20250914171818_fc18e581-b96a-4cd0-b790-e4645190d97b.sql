-- Create table for storing user secrets securely (encrypted via Edge Function)
CREATE TABLE IF NOT EXISTS public.user_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  username TEXT,
  secret_type TEXT DEFAULT 'password',
  value_encrypted TEXT NOT NULL,
  notes_encrypted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_secrets' AND policyname = 'Users can view their own secrets'
  ) THEN
    CREATE POLICY "Users can view their own secrets"
      ON public.user_secrets FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_secrets' AND policyname = 'Users can insert their own secrets'
  ) THEN
    CREATE POLICY "Users can insert their own secrets"
      ON public.user_secrets FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_secrets' AND policyname = 'Users can update their own secrets'
  ) THEN
    CREATE POLICY "Users can update their own secrets"
      ON public.user_secrets FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_secrets' AND policyname = 'Users can delete their own secrets'
  ) THEN
    CREATE POLICY "Users can delete their own secrets"
      ON public.user_secrets FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_secrets_updated_at'
  ) THEN
    CREATE TRIGGER update_user_secrets_updated_at
    BEFORE UPDATE ON public.user_secrets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_secrets_user_id ON public.user_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_secrets_created_at ON public.user_secrets(created_at DESC);

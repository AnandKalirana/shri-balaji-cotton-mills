-- Run ONCE in the Supabase SQL Editor after `npx prisma db push`.
--
-- Supabase exposes every table in the "public" schema through a public REST API
-- that anyone holding the (public) anon key can call. Turning on Row Level Security
-- with no policies blocks that API completely.
-- This app talks to the database through Prisma as the "postgres" role, which
-- bypasses RLS, so the website keeps working normally.

DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

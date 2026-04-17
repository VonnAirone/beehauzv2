-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT,
  proof_url TEXT,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tickets
CREATE POLICY "Users can insert own support tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own support tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create storage bucket for support proof images
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-proofs', 'support-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to support-proofs bucket
CREATE POLICY "Authenticated users can upload support proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'support-proofs' AND auth.role() = 'authenticated');

-- Allow public read access to support proofs
CREATE POLICY "Public read access to support proofs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'support-proofs');

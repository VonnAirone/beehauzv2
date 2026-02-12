-- Allow users to read their own tenant records
CREATE POLICY "Users read own tenant record"
  ON public.tenants
  FOR SELECT
  USING (user_id = auth.uid());

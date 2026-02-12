-- Allow tenants to update their own record (for move-out requests)
CREATE POLICY "Tenants update own record"
  ON public.tenants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

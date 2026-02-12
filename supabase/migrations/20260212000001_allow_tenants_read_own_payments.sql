-- Allow tenants to read their own payment records
CREATE POLICY "Tenants read own payment records"
  ON public.tenant_payments
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

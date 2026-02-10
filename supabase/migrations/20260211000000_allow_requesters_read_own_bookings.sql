-- Allow users to read their own booking requests
CREATE POLICY "Users read own booking requests"
  ON public.booking_requests
  FOR SELECT
  USING (requester_id = auth.uid());

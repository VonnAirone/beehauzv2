-- Create property_reviews table for tenant feedback on properties

CREATE TABLE public.property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_property_reviews_property_id ON public.property_reviews(property_id);
CREATE INDEX idx_property_reviews_created_at ON public.property_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;

-- Owners can read reviews on their own properties
CREATE POLICY "Owners can view reviews on their properties"
  ON public.property_reviews FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE owner_id = auth.uid()
    )
  );

-- Tenants can read reviews (for public display)
CREATE POLICY "Tenants can view all reviews"
  ON public.property_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'tenant'
    )
  );

-- Tenants can create reviews
CREATE POLICY "Tenants can create reviews"
  ON public.property_reviews FOR INSERT
  WITH CHECK (
    tenant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'tenant'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to reviews"
  ON public.property_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

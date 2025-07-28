-- Update shipping_zones table structure for state-based pricing
DROP TABLE IF EXISTS shipping_zones;

CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  shipping_cost NUMERIC NOT NULL,
  collection_cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "shipping_zones_select_all" 
ON public.shipping_zones 
FOR SELECT 
USING (true);

-- Insert state-based pricing data
INSERT INTO public.shipping_zones (state, shipping_cost, collection_cost) VALUES
-- $75 zone
('CT', 75, 75),
('DE', 75, 75),
('MD', 75, 75),
('MA', 75, 75),
('NH', 75, 75),
('NJ', 75, 75),
('PA', 75, 75),
('RI', 75, 75),
('VT', 75, 75),
('VA', 75, 75),
('DC', 75, 75),

-- $82 zone
('FL', 82, 82),
('GA', 82, 82),
('IL', 82, 82),
('IN', 82, 82),
('IA', 82, 82),
('LA', 82, 82),
('MN', 82, 82),
('MS', 82, 82),
('NY', 82, 82),
('NC', 82, 82),
('OH', 82, 82),
('SC', 82, 82),
('TN', 82, 82),
('WV', 82, 82),

-- $104 zone
('AL', 104, 104),
('AR', 104, 104),
('KY', 104, 104),
('ME', 104, 104),
('MI', 104, 104),
('MO', 104, 104),
('OK', 104, 104),
('WI', 104, 104),
('KS', 104, 104),
('MT', 104, 104),
('NE', 104, 104),
('TX', 104, 104),

-- $116 zone
('AZ', 116, 116),
('CA', 116, 116),
('CO', 116, 116),
('NM', 116, 116),
('WA', 116, 116),
('WY', 116, 116),

-- $95 zone
('ID', 95, 95),
('OR', 95, 95),
('UT', 95, 95),

-- $124 zone
('NV', 124, 124),
('ND', 124, 124),
('SD', 124, 124);
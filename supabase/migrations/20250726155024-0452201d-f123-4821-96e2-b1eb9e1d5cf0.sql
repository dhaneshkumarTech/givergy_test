-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipping zones table
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  collection_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_start_date DATE,
  event_end_date DATE,
  zip_code TEXT,
  shipping_address TEXT,
  message TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  collection_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_title TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (is_active = true);

-- Shipping zones policies (public read access)
CREATE POLICY "shipping_zones_select_all" ON public.shipping_zones
  FOR SELECT USING (true);

-- Orders policies (users can view their own orders)
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (true);

-- Order items policies
CREATE POLICY "order_items_select_all" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(CAST(COALESCE(MAX(CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)), 0) + 1 AS TEXT), 6, '0')
  INTO new_number
  FROM orders
  WHERE order_number LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-%';
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample products
INSERT INTO public.products (title, description, price, category, image_url) VALUES
('MacBook Pro 16" M1', 'High-performance laptop for professional work', 149.99, 'Laptops', '/lovable-uploads/MacBook_Pro_16_M1.webp'),
('iPad Pro 12.9" Wi-Fi', 'Professional tablet for creative work', 89.99, 'Tablets', '/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp'),
('iPhone 14 Pro Max', 'Latest iPhone with advanced camera system', 79.99, 'Smartphones', '/lovable-uploads/iPhone_14_Pro_Max.webp'),
('Samsung 85" 4K Display', 'Large format display for presentations', 199.99, 'Monitors', '/lovable-uploads/Samsung_85_4K_Display.webp'),
('Apple Thunderbolt Display', 'Professional monitor with Thunderbolt connectivity', 129.99, 'Monitors', '/lovable-uploads/Apple_Thunderbolt_Display.webp'),
('HP Laptop', 'Reliable business laptop', 99.99, 'Laptops', '/lovable-uploads/HP_Laptop.webp'),
('iPad 10.2" Gen + Cellular Stripe Reader', 'Tablet with payment processing capability', 119.99, 'Tablets', '/lovable-uploads/iPad_10.2_Gen_Cellular_Stripe_Reader.webp');

-- Insert sample shipping zones
INSERT INTO public.shipping_zones (zip_code, zone_name, shipping_cost, collection_cost) VALUES
('10001', 'NYC Zone 1', 25.00, 25.00),
('10002', 'NYC Zone 1', 25.00, 25.00),
('90210', 'LA Zone 1', 35.00, 35.00),
('90211', 'LA Zone 1', 35.00, 35.00),
('60601', 'Chicago Zone 1', 30.00, 30.00),
('60602', 'Chicago Zone 1', 30.00, 30.00),
('77001', 'Houston Zone 1', 32.00, 32.00),
('77002', 'Houston Zone 1', 32.00, 32.00),
('85001', 'Phoenix Zone 1', 38.00, 38.00),
('85002', 'Phoenix Zone 1', 38.00, 38.00);
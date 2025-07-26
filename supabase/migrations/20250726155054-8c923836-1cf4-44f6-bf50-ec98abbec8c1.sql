-- Fix the security warning for function search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
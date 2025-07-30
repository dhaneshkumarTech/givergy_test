-- Clear existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM bundle_pricing;

-- Insert bundle pricing data
INSERT INTO bundle_pricing (bundle_type, price_multiplier) VALUES
(3, 1.0),
(5, 0.9),
(10, 0.8);

-- Insert 2 bundle products
INSERT INTO products (title, description, price, category, image_url, is_active) VALUES
('iPad Event Bundle - Basic', 'Complete iPad setup for events\n• iPad 10.2" (Wi-Fi + Cellular)\n• Stripe Reader for payments\n• Pre-configured with event software\n• Training and support included\n\nChoose your bundle size for bulk pricing!', 150.00, 'Bundle', '/products/iPad_10.2_Gen_Cellular_Stripe_Reader.png', true),
('iPad Event Bundle - Pro', 'Premium iPad setup for professional events\n• iPad Pro 12.9" (Wi-Fi)\n• Stripe Reader for payments\n• Advanced event management software\n• Priority support and training\n\nChoose your bundle size for bulk pricing!', 200.00, 'Bundle', '/products/iPad_Pro_12.9_Wi-Fi.png', true);

-- Insert individual products
INSERT INTO products (title, description, price, category, image_url, is_active) VALUES
('HP Laptop', 'High-performance laptop for event management and administration', 75.00, 'Computing', '/products/HP_Laptop.png', true),
('Mobile Hotspots', 'Reliable internet connectivity for your events', 25.00, 'Connectivity', '/products/Mobile_Hotspots.png', true),
('Stripe Reader', 'Contactless payment processing device', 15.00, 'Payment', '/products/Stripe_Reader.png', true),
('iPad 10.2" (Wi-Fi + Cellular)', 'Versatile tablet with cellular connectivity for event management', 50.00, 'Tablets', '/products/iPad_10.2_Gen_Cellular.png', true),
('iPad Pro 12.9" (Wi-Fi)', 'Professional-grade tablet for premium event experiences', 80.00, 'Tablets', '/products/iPad_Pro_12.9_Wi-Fi.png', true);
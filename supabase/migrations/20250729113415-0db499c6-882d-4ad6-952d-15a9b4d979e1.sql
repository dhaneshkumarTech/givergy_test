-- Delete existing products
DELETE FROM products;

-- Insert new bundle products with different bundle types
INSERT INTO products (title, description, price, category, image_url, is_active) VALUES 
-- Bundle type 3
('iPad Bundle (3 Units) - WiFi + Stripe Reader', 'iPad 10.2" 7th Gen or better Gen WiFi with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better WiFi (latest iOS) provided with carry case
• Stripe Reader  
• Custom app installation', 389.97, 'Bundle-3', '/lovable-uploads/iPad_10.2_Gen_Cellular_Stripe_Reader.webp', true),

('iPad Bundle (3 Units) - Cellular + Stripe Reader', 'iPad 10.2" 7th Gen or better (Cellular) with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better (Cellular) provided with carry case
• Stripe Reader
• Data Included
• Custom app installation', 479.97, 'Bundle-3', '/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp', true),

-- Bundle type 5  
('iPad Bundle (5 Units) - WiFi + Stripe Reader', 'iPad 10.2" 7th Gen or better Gen WiFi with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better WiFi (latest iOS) provided with carry case
• Stripe Reader
• Custom app installation', 649.95, 'Bundle-5', '/lovable-uploads/iPad_10.2_Gen_Cellular_Stripe_Reader.webp', true),

('iPad Bundle (5 Units) - Cellular + Stripe Reader', 'iPad 10.2" 7th Gen or better (Cellular) with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better (Cellular) provided with carry case
• Stripe Reader
• Data Included
• Custom app installation', 799.95, 'Bundle-5', '/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp', true),

-- Bundle type 10
('iPad Bundle (10 Units) - WiFi + Stripe Reader', 'iPad 10.2" 7th Gen or better Gen WiFi with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better WiFi (latest iOS) provided with carry case
• Stripe Reader
• Custom app installation', 1299.9, 'Bundle-10', '/lovable-uploads/iPad_10.2_Gen_Cellular_Stripe_Reader.webp', true),

('iPad Bundle (10 Units) - Cellular + Stripe Reader', 'iPad 10.2" 7th Gen or better (Cellular) with Stripe Reader is the basic kit you need to start taking payments anywhere. This kit includes carry cases, plugs, and cables.

• iPad 10.2" 7th Gen or better (Cellular) provided with carry case
• Stripe Reader
• Data Included
• Custom app installation', 1599.9, 'Bundle-10', '/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp', true),

-- Individual products (minimum quantity 3)
('iPad 10.2" 7th Gen or better (WiFi)', '10.2" iPad provided with plug and carry case. Custom app installation and charging cables are also included.', 89.99, 'Individual', '/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp', true),

('iPad 10.2" 7th Gen or better (Cellular)', '10.2" iPad provided with plug and carry case. Custom app installation and charging cables are also included.
*Cellular iPad with Data included.', 119.99, 'Individual', '/lovable-uploads/iPad_10.2_Gen_Cellular_Stripe_Reader.webp', true),

('Swiper/Reader', 'Stripe mobile card reader and swiper are provided with a station and charging cables.', 59.99, 'Individual', '/lovable-uploads/Samsung_85_4K_Display.webp', true),

('Windows Intel i5 Laptop', 'Windows 10 Intel i5 Laptop provided with charging cables.', 149.99, 'Individual', '/lovable-uploads/HP_Laptop.webp', true),

('4G/5G Mobile Hotspots', 'Delivering fast, reliable 4G/5G mobile hotspot connectivity for events, teams, and remote operations. provided with charging cable.', 79.99, 'Individual', '/lovable-uploads/MacBook_Pro_16_M1.webp', true);
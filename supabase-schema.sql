-- =============================================
-- SUPABASE SQL SCHEMA
-- Bu kodni Supabase > SQL Editor da ishga tushiring
-- =============================================

-- Products jadvali
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 0),
  old_price DECIMAL(12, 0),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at avtomatik yangilansin
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Hamma foydalanuvchi o'qiy oladi
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Faqat authenticated (admin) yoza oladi
CREATE POLICY "Authenticated can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- Storage bucket (mahsulot rasmlari uchun)
-- =============================================

-- Storage > Buckets da "product-images" nomli bucket yarating
-- Public qilib belgilang

-- Storage policies (SQL orqali)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- =============================================
-- ADMIN USER yaratish
-- Supabase > Authentication > Users > Add User
-- Email: admin@shop.com
-- Password: shox123
-- Yoki quyidagi SQL dan foydalaning:
-- =============================================

-- Test ma'lumotlari (ixtiyoriy)
INSERT INTO products (name, description, price, old_price) VALUES
  ('Misol mahsulot 1', 'Bu misol tavsif', 150000, 200000),
  ('Misol mahsulot 2', 'Ikkinchi mahsulot tavsifi', 85000, NULL),
  ('Misol mahsulot 3', 'Uchinchi mahsulot', 320000, 400000);

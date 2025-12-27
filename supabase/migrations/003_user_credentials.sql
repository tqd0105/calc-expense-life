-- ================================================
-- SQL Script: Create user_credentials table
-- Purpose: Lưu API credentials theo từng user
-- ================================================

-- Tạo bảng user_credentials
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_type TEXT NOT NULL CHECK (store_type IN ('bachhoaxanh', 'kingfoodmart')),
  credentials JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: mỗi user chỉ có 1 credentials cho mỗi store
  UNIQUE(user_id, store_type)
);

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_store_type ON user_credentials(store_type);

-- Enable RLS (Row Level Security)
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Users chỉ có thể xem credentials của chính họ
CREATE POLICY "Users can view own credentials"
  ON user_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users chỉ có thể insert credentials của chính họ
CREATE POLICY "Users can insert own credentials"
  ON user_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users chỉ có thể update credentials của chính họ
CREATE POLICY "Users can update own credentials"
  ON user_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users chỉ có thể delete credentials của chính họ
CREATE POLICY "Users can delete own credentials"
  ON user_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger để tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- USAGE:
-- 1. Mở Supabase Dashboard > SQL Editor
-- 2. Paste toàn bộ script này và chạy
-- ================================================

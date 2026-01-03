-- ================================================
-- SQL Script: Add is_not_split column to invoices table
-- Purpose: Thêm cột đánh dấu hóa đơn không chia tiền
-- ================================================

-- Thêm cột is_not_split vào bảng invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS is_not_split BOOLEAN DEFAULT FALSE;

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_invoices_is_not_split ON invoices(is_not_split);

-- Comment
COMMENT ON COLUMN invoices.is_not_split IS 'Đánh dấu hóa đơn không cần chia tiền (true) hay chia tiền (false)';
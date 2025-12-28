-- ================================================
-- SQL Script: Add is_paid column to weeks table
-- Purpose: Thêm cột đánh dấu tuần đã trả/chưa trả
-- ================================================

-- Thêm cột is_paid vào bảng weeks
ALTER TABLE weeks 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_weeks_is_paid ON weeks(is_paid);

-- Comment
COMMENT ON COLUMN weeks.is_paid IS 'Đánh dấu tuần đã được thanh toán (true) hay chưa (false)';

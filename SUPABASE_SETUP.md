# 🚀 Hướng dẫn Setup Supabase

## Bước 1: Tạo tài khoản Supabase (5 phút)

1. Truy cập: https://supabase.com
2. Đăng nhập bằng GitHub/Google
3. Tạo project mới:
   - **Name**: `bill-splitter` (hoặc tên bạn thích)
   - **Password**: Tạo password mạnh (lưu lại)
   - **Region**: `Southeast Asia (Singapore)` (gần Việt Nam nhất)
4. Đợi 1-2 phút để project được tạo

## Bước 2: Lấy API Keys

Sau khi project tạo xong:

1. Vào **Settings** (icon ⚙️ bên trái)
2. Chọn **API**
3. Copy 2 thông tin:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (key rất dài)

## Bước 3: Tạo Database Tables

1. Vào **SQL Editor** (icon ⚡ bên trái)
2. Click **New Query**
3. Copy đoạn SQL sau và chạy:

```sql
-- Bảng weeks (tuần)
CREATE TABLE weeks (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng invoices (hóa đơn)
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY,
  order_code TEXT NOT NULL,
  store TEXT NOT NULL,
  total NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  week_id BIGINT REFERENCES weeks(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE weeks;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

-- Row Level Security (RLS)
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies: Mỗi user chỉ thấy data của mình
CREATE POLICY "Users can view their own weeks"
  ON weeks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weeks"
  ON weeks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weeks"
  ON weeks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weeks"
  ON weeks FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);
```

4. Click **Run** (hoặc Ctrl+Enter)
5. Nếu thấy "Success", là đã xong!

## Bước 4: Enable Email Authentication

1. Vào **Authentication** → **Providers**
2. Enable **Email** (mặc định đã bật)
3. Tắt **Confirm email** nếu muốn test nhanh (không recommend production)

## Bước 5: Cấu hình Frontend

1. Tạo file `.env.local` trong thư mục `frontend/`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

2. Thay `xxxxx` bằng thông tin từ Bước 2

## Bước 6: Test

```bash
cd frontend
npm run dev
```

Truy cập http://localhost:3001 → Đăng ký tài khoản → Bắt đầu dùng!

## ⚠️ Quan trọng: Chia sẻ với roommate

**CÁCH 1: Cùng 1 tài khoản** (Đơn giản nhất)
- 2 người dùng chung email/password
- Tự động sync realtime

**CÁCH 2: 2 tài khoản riêng** (Cần sửa RLS policy)
- Mỗi người tạo tài khoản riêng
- Cần thêm logic "shared workspace"
- Phức tạp hơn, tôi sẽ hướng dẫn nếu cần

→ **Đề xuất: CÁCH 1** cho 2 người bạn thân

## 🎉 Xong!

Sau khi setup xong, app sẽ:
- ✅ Realtime sync giữa 2 máy
- ✅ Không cần localhost backend (dùng Supabase cloud)
- ✅ Có authentication
- ✅ Data an toàn trên cloud
- ✅ Miễn phí vĩnh viễn cho 2 người

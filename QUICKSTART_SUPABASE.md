# 🚀 Cách Dùng Supabase

## TL;DR - Setup nhanh (10 phút)

### 1. Tạo Supabase Project
```
https://supabase.com → Sign up → New Project
- Name: bill-splitter
- Region: Singapore
- Password: Lưu lại!
```

### 2. Chạy SQL
Vào **SQL Editor** → Copy paste đoạn này:
```sql
-- Copy từ file SUPABASE_SETUP.md phần "Bước 3"
```

### 3. Lấy Keys
**Settings** → **API** → Copy:
- Project URL
- anon/public key

### 4. Config Frontend
Tạo file `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Chạy
```bash
cd frontend
npm run dev
```

### 6. Đăng ký tài khoản
- Mở http://localhost:3001
- Đăng ký email/password
- **Share email + password** cho roommate
- Cả 2 dùng chung → Tự động sync! ✨

---

## Không muốn dùng Supabase?

**Xóa file `.env.local`** → App sẽ dùng localStorage như cũ!

Supabase chỉ hoạt động khi có `.env.local` file.

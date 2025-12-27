# 👤 Tạo Tài Khoản User (Chỉ Admin)

## Cách 1: Qua Supabase Dashboard (Dễ nhất)

1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. **Authentication** (icon 👤 bên trái)
4. **Users** tab
5. Click **"Add user"**
6. **Create new user**:
   - Email: `roommate@example.com`
   - Password: Tạo password mạnh
   - ✅ Auto Confirm User (bỏ qua email verification)
7. Click **Create user**

✅ Xong! Share email + password cho người dùng.

---

## Cách 2: Bằng SQL

1. Vào **SQL Editor**
2. Copy & Run:

```sql
-- Tạo user mới (thay email và password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'roommate@example.com', -- ĐỔI EMAIL NÀY
  crypt('YourPassword123', gen_salt('bf')), -- ĐỔI PASSWORD NÀY
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## Cách 3: Tạo nhiều user cùng lúc

```sql
-- User 1: Bạn
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
  'you@example.com', 
  crypt('YourPassword123', gen_salt('bf')), 
  NOW(), 
  '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());

-- User 2: Roommate
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
  'roommate@example.com', 
  crypt('RoommatePass456', gen_salt('bf')), 
  NOW(), 
  '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
```

---

## ⚠️ Quan trọng: RLS Policy

Hiện tại mỗi user chỉ thấy data của mình. Nếu muốn **2 user cùng thấy data**:

### Option A: Cùng dùng 1 tài khoản (Đơn giản nhất)
- Tạo 1 tài khoản chung: `shared@example.com`
- Share cho 2 người
- Cả 2 đăng nhập cùng tài khoản

### Option B: 2 tài khoản riêng nhưng share data (Phức tạp)
Cần sửa RLS policy:

```sql
-- Cho phép user xem data của nhau (ví dụ: whitelist)
DROP POLICY IF EXISTS "Users can view their own weeks" ON weeks;
CREATE POLICY "Users can view shared weeks"
  ON weeks FOR SELECT
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      'uuid-user-1-here'::uuid,
      'uuid-user-2-here'::uuid
    )
  );

-- Tương tự cho invoices...
```

---

## 🎯 Đề xuất

**Cho 2 người bạn thân:**
→ Tạo 1 tài khoản chung, cả 2 dùng chung (Option A)

**Nhiều người:**
→ Mỗi người 1 tài khoản, cần workspace sharing logic phức tạp hơn

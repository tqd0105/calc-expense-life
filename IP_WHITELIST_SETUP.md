# 🔒 IP Whitelist Setup - Giới hạn truy cập chỉ trong phòng

## Cách hoạt động:

App chỉ hoạt động khi:
- ✅ Kết nối WiFi phòng (local IP: 192.168.1.x)
- ✅ Hoặc IP public của WiFi phòng

❌ Chặn:
- 4G/5G mobile data
- WiFi bên ngoài
- VPN không được whitelist

---

## Setup (5 phút):

### Bước 1: Lấy IP của WiFi phòng

**A. Lấy Local IP** (Đơn giản nhất):
```bash
# Linux/Mac
ip addr show | grep "inet 192.168"

# Windows
ipconfig | findstr "IPv4"
```

Kết quả: `192.168.1.15` → Range là `192.168.1.` ✅

**B. Lấy Public IP** (Nếu muốn chặt chẽ hơn):
```bash
curl ifconfig.me
```

Kết quả: `113.161.123.45` ← IP công khai của WiFi phòng

---

### Bước 2: Config Backend

Edit file `backend/.env`:

```env
PORT=5001

# Option 1: Chỉ cho phép local network (Dễ nhất)
ALLOWED_LOCAL_RANGES=192.168.1.,192.168.0.

# Option 2: Chặt chẽ - Chỉ cho phép IP public cụ thể
ALLOWED_IPS=113.161.123.45
ALLOWED_LOCAL_RANGES=192.168.1.
```

**Giải thích:**
- `ALLOWED_LOCAL_RANGES`: Cho phép bất kỳ IP nào bắt đầu bằng `192.168.1.`
  - ✅ `192.168.1.5` - OK
  - ✅ `192.168.1.100` - OK  
  - ❌ `192.168.0.15` - Blocked
  
- `ALLOWED_IPS`: Chỉ cho phép IP public cụ thể (phân cách bằng dấu phẩy)
  - VD: `113.161.123.45,42.118.234.56`

---

### Bước 3: Khởi động Backend

```bash
cd backend
npm start
```

Kiểm tra:
```bash
curl http://localhost:5001/api/check-access
```

✅ Thành công:
```json
{
  "allowed": true,
  "clientIP": "192.168.1.15",
  "message": "Access granted from room WiFi"
}
```

---

### Bước 4: Config Frontend

File `frontend/.env.local`:
```env
VITE_BACKEND_URL=http://localhost:5001
```

---

### Bước 5: Chạy App

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

Mở browser: http://localhost:3000

---

## Test:

### ✅ Trong phòng (WiFi):
1. Connect WiFi phòng
2. Tắt mobile data
3. Mở app → Thấy màn hình "Checking Access..." → Vào app OK

### ❌ Ngoài phòng (4G):
1. Bật mobile data, tắt WiFi
2. Mở app → Màn hình "Access Denied" 🚫

---

## Troubleshooting:

### Vấn đề: "Access Denied" dù đang ở phòng

**Nguyên nhân:** IP không khớp với config

**Giải pháp:**
1. Kiểm tra IP hiện tại:
   ```bash
   curl http://localhost:5001/api/check-access
   ```
   
2. Xem response `clientIP`, VD: `192.168.0.15`

3. Update `backend/.env`:
   ```env
   ALLOWED_LOCAL_RANGES=192.168.0.,192.168.1.
   ```

4. Restart backend

---

### Vấn đề: IP public thay đổi

**Nguyên nhân:** ISP cấp IP động (dynamic IP)

**Giải pháp:**
- Option 1: Chỉ dùng `ALLOWED_LOCAL_RANGES` (không check public IP)
- Option 2: Contact ISP để xin Static IP
- Option 3: Dùng DDNS (Dynamic DNS)

---

### Vấn đề: Router dùng range khác

**Ví dụ:** Router của bạn dùng `10.0.0.x` thay vì `192.168.1.x`

**Giải pháp:**
```env
ALLOWED_LOCAL_RANGES=10.0.0.
```

---

## Deploy Production:

Khi deploy lên VPS/Cloud:

1. **Backend `.env`:**
   ```env
   PORT=5001
   # Chỉ cho phép IP phòng
   ALLOWED_IPS=113.161.123.45
   # Không cho local range khi deploy public
   ALLOWED_LOCAL_RANGES=
   ```

2. **Lưu ý:** Phải biết IP public của WiFi phòng

3. **Nếu IP thay đổi:** Update `.env` và restart backend

---

## Security Notes:

✅ **Ưu điểm:**
- Chặn access từ bên ngoài phòng
- Đơn giản, không cần VPN
- Hoạt động tốt với IP tĩnh

⚠️ **Hạn chế:**
- IP public có thể thay đổi
- Không bảo vệ nếu ai đó vào được WiFi phòng
- Dễ bypass nếu spoof IP (cần HTTPS + token để chặt chẽ hơn)

🎯 **Phù hợp cho:** 2 người cùng phòng, tin tưởng nhau, không có yêu cầu bảo mật cao.

# 💰 Chia Bill - Ứng dụng chia hóa đơn tự động (2 người)

Ứng dụng web giúp tự động tính toán và chia đôi hóa đơn điện tử từ các trang thương mại điện tử Việt Nam (Bách Hóa Xanh, KingFoodMart).

## ✨ Tính năng

- 📋 Parse HTML từ hóa đơn điện tử
- 💵 Tự động tính toán và chia đôi hóa đơn
- 💾 Lưu lịch sử hóa đơn
- 📊 Xem thống kê chi tiêu
- 📱 Giao diện responsive, thân thiện
- Chia bill đối với nhiều người (đang phát triển)

## 🏗️ Kiến trúc

```
bill-splitter/
├── frontend/          # React + TailwindCSS + Vite
├── backend/           # Node.js + Express (Phase 2+)
└── shared/            # Types và utilities chung
```

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies

```bash
# Cài đặt tất cả packages
npm install

# Hoặc cài đặt riêng từng phần
cd frontend && npm install
cd ../backend && npm install
```

### Chạy ứng dụng

**Chạy frontend (Phase 1):**
```bash
npm run dev:frontend
```

Frontend sẽ chạy tại: http://localhost:3000

**Chạy cả frontend + backend:**
```bash
npm run dev
```

## 📖 Hướng dẫn sử dụng

### Phase 1: Copy/Paste JSON (Hiện tại)

**Cách 1: Bookmarklet** ⭐ (Khuyến nghị - Siêu nhanh!)

1. Mở file `bookmarklet.html` trong trình duyệt
2. Kéo nút "💰 Chia Bill Import" vào thanh Bookmarks
3. Mở trang hóa đơn BHX/KFM → Click bookmark
4. Làm theo hướng dẫn trong popup → Xong!

**⏱️ Chỉ mất 15 giây!**

---

**Cách 2: Thủ công** (Backup)

1. Đăng nhập vào bachhoaxanh.com hoặc kingfoodmart.com
2. Mở hóa đơn của bạn
3. **F12** → Tab **Network** → Tìm request `GetDetailHistory` (BHX) hoặc `gateway` (KFM)
4. Tab **Response** → Copy toàn bộ JSON
5. Paste vào app → Click "Phân tích hóa đơn"
6. Xem kết quả chia bill tự động!

## 📝 License


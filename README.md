# 💰 Chia Bill - Ứng dụng chia hóa đơn tự động

Ứng dụng web giúp tự động tính toán và chia đôi hóa đơn điện tử từ các trang thương mại điện tử Việt Nam (Bách Hóa Xanh, KingFoodMart).

## ✨ Tính năng

- 📋 Parse HTML từ hóa đơn điện tử
- 💵 Tự động tính toán và chia đôi hóa đơn
- 💾 Lưu lịch sử hóa đơn
- 📊 Xem thống kê chi tiêu
- 📱 Giao diện responsive, thân thiện

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

## 🗺️ Roadmap

### ✅ Phase 1 (Hiện tại)
- [x] Giao diện nhập JSON/HTML
- [x] Parser cho Bách Hóa Xanh
- [x] Parser cho KingFoodMart
- [x] Tính toán chia bill
- [x] LocalStorage để lưu lịch sử
- [x] Chrome Extension (v1.0)

### 🔜 Phase 2 (Tương lai)
- [ ] Backend API với Express
- [ ] Database PostgreSQL
- [ ] Authentication
- [ ] Multi-user support
- [ ] Deploy lên cloud

### 💡 Phase 3 (Tính năng nâng cao)
- [ ] Chrome Extension v2.0 (auto sync)
- [ ] Bookmarklet
- [ ] Export PDF/Excel
- [ ] Thống kê và biểu đồ
- [ ] Mobile app

## 🎯 Chrome Extension

Extension tự động nhập hóa đơn vào app!

**Cài đặt:**
1. Vào `chrome://extensions/`
2. Bật **Developer mode**
3. Click **Load unpacked** → Chọn folder `extension/`
4. ✅ Xong!

**Sử dụng:**
1. Mở trang hóa đơn BHX/KFM
2. Click nút "Gửi lên Chia Bill"
3. Hóa đơn tự động import!

Chi tiết: [extension/README.md](extension/README.md)

## 🛠️ Tech Stack

- **Frontend**: React 18, TailwindCSS, Vite
- **Parser**: Cheerio (HTML parsing)
- **Storage**: LocalStorage (Phase 1)
- **Backend**: Node.js + Express (Phase 2+)
- **Database**: PostgreSQL (Phase 2+)

## 📝 License

MIT

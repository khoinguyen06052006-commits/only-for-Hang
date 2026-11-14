# 💌 Thiệp Điện Tử Tình Yêu - Tích Hợp Google Sheets (Web App)

Website thiệp tình yêu tự động lưu trữ lời nhắn phản hồi của người yêu kèm **Lượt gửi ôm** và **Điều muốn làm nhất hôm nay** trực tiếp vào file **Google Sheets** của bạn thông qua **Google Apps Script** (Hoàn toàn Serverless, không tốn chi phí và bảo mật tuyệt đối).

---

## 📊 1. Cấu Trúc Bảng Tính Google Sheets Của Bạn

File Google Sheet đích: [Bảng tính lưu lời nhắn](https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/edit?usp=sharing)
- **Tên Sheet**: `Trang tính1`
- **Hàng 2 - 3**: Bảng thống kê tổng quan (`Tổng tin nhắn`, `Đã phản hồi`, `Chờ xử lý`) được giữ nguyên, không bị ghi đè.
- **Hàng 5 (A5:F5)**: Tự động khởi tạo dòng tiêu đề 6 cột màu hồng pastel:
  - Cột A: **Thời gian gửi** (Giờ VN: `HH:mm:ss dd/MM/yyyy`)
  - Cột B: **Ngày của thiệp** (Ví dụ: `2026-11-14`)
  - Cột C: **Nội dung tin nhắn**
  - Cột D: **Lượt gửi ôm** (Số lần người dùng đã bấm nút ôm trên bức thư)
  - Cột E: **Điều muốn làm hôm nay** (Các lựa chọn hoặc mong muốn tự nhập của người yêu)
  - Cột F: **Trạng thái** (Mặc định: `"Chờ xử lý"`)
- **Hàng 6 trở xuống**: Mỗi lời nhắn người yêu gửi sẽ tự động ghi nối tiếp vào một hàng mới đủ 6 cột!

---

## 🛠️ 2. Hướng Dẫn Cài Đặt Google Apps Script (`Code.gs`)

### Bước 1: Mở trình soạn thảo Apps Script
1. Mở file [Google Sheet của bạn](https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/edit?usp=sharing).
2. Trên thanh menu, chọn: **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.

### Bước 2: Dán mã nguồn `Code.gs`
1. Xóa toàn bộ mã mặc định có trong ô soạn thảo `Mã.gs` hoặc `Code.gs`.
2. Sao chép toàn bộ mã trong file [Code.gs](file:///C:/Users/Khoi%20Nguyen/.gemini/antigravity/scratch/love-letter/Code.gs) của dự án và dán vào.
3. Nhấn nút **Lưu (Save)** (biểu tượng đĩa mềm 💾 hoặc phím `Ctrl + S`).

### Bước 3: Triển khai dưới dạng Web App (Deploy)
1. Ở góc trên bên phải giao diện Apps Script, nhấn nút **Triển khai (Deploy)** ➔ chọn **Tùy chọn triển khai mới (New deployment)**.
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn: **Ứng dụng web (Web app)**.
3. Điền cấu hình như sau (RẤT QUAN TRỌNG):
   - **Mô tả (Description)**: *Thiệp Tình Yêu Backend v2*
   - **Thực thi dưới dạng (Execute as)**: **Tôi (Me - địa chỉ email của bạn)**
   - **Người có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)** *(Bắt buộc chọn mục này để người yêu bạn có thể gửi tin nhắn mà không cần đăng nhập tài khoản Google)*.
4. Nhấn nút **Triển khai (Deploy)**.
5. Google sẽ hiện hộp thoại yêu cầu cấp quyền:
   - Nhấn **Ủy quyền truy cập (Authorize access)**.
   - Chọn tài khoản Google của bạn.
   - Nhấn **Nâng cao (Advanced)** ở góc dưới bên trái ➔ Nhấn **Đi tới... (không an toàn) / Go to... (unsafe)**.
   - Nhấn **Cho phép (Allow)**.
6. Sao chép chuỗi **URL ứng dụng web (Web app URL)** (link có đuôi `/exec`).

---

## 🔗 3. Kết Nối Vào Website (script.js)

Mở file [script.js](file:///C:/Users/Khoi%20Nguyen/.gemini/antigravity/scratch/love-letter/script.js#L15-L27), dán link Web App vừa sao chép vào biến `GOOGLE_SCRIPT_URL`:

```javascript
const INTEGRATION_CONFIG = {
  // Dán link Web App vừa copy vào đây:
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",

  // Link đọc dữ liệu các bức thư từ Google Sheets (đã cấu hình sẵn cho sheet của bạn)
  GOOGLE_SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/gviz/tq?tqx=out:csv",

  // Tùy chọn Telegram (nếu muốn nhận song song cả Telegram)
  TELEGRAM_BOT_TOKEN: "",
  TELEGRAM_CHAT_ID: ""
};
```

---

## ✨ 4. Trải Nghiệm & Kiểm Thử

1. Mở file [index.html](file:///C:/Users/Khoi%20Nguyen/.gemini/antigravity/scratch/love-letter/index.html) trên trình duyệt.
2. Nhập mật mã **`1402`** ➔ Mở con dấu sáp ➔ Cuộn xuống cuối thiệp.
3. Thử nghiệm các tính năng tương tác mới:
   - Bấm nút **"Gửi Một Cái Ôm"** vài lần (số trên nút sẽ tăng lên, ví dụ: 3, 5,...).
   - Chọn một hoặc nhiều mong muốn trong khung **"Điều em muốn làm nhất hôm nay"** (Ví dụ: bấm *Đi ăn món ngon 🍜*, *Chỉ cần được ôm 🥺* hoặc bấm *Lựa chọn khác... ✍️* để tự nhập mong muốn).
   - Gõ nội dung lời nhắn vào ô *"Viết gì đó cho anh nhé... 💕"*.
   - Bấm nút **"Gửi lời nhắn 💌"**.
4. Mở file [Google Sheet](https://docs.google.com/spreadsheets/d/1fzesb7HrcuS7spJ88lpVKb-1PEIWvdPEwNlZm5lt1-8/edit?usp=sharing) lên:
   - Dòng mới lập tức xuất hiện tại Hàng 6 với đủ 6 cột dữ liệu!
   - Ô Lượt gửi ôm (Cột D) hiển thị đúng số lần bấm ôm.
   - Ô Điều muốn làm hôm nay (Cột E) ghi nhận chính xác mong muốn được chọn!

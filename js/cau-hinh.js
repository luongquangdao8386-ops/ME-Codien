/* ME – Quản lý Cơ điện · 机电管理系统
   cau-hinh.js — cấu hình của bản app này. Sửa tệp này khi phát hành bản mới (đổi phienBan) và tăng PHIEN_BAN trong sw.js.

   mayChuMacDinh: link Web App /exec của máy chủ Apps Script.
     - Để trống (khuyên dùng khi kho GitHub công khai): lần đầu mở app, mỗi máy dán link /exec hoặc quét
       "Mã QR kết nối" (Tài khoản → Mã QR kết nối, chỉ quản trị thấy).
     - Điền link: app tự kết nối, không hỏi. Ai đọc được kho GitHub cũng thấy link này; không có mã NV + PIN
       thì vẫn không xem được dữ liệu, nhưng có thể bị gọi thử làm tốn hạn mức của Google. */
window.ME_CAU_HINH = {
  phienBan: '1.0.0',
  mayChuMacDinh: ''
};

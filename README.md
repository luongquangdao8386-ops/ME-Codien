# ME – Quản lý Cơ điện · 机电管理系统

App quản lý cơ điện nhà máy: thiết bị, kho linh kiện, điện nước (đợt 1); sửa chữa, bảo trì (đợt 2); báo cáo (đợt 3).
Chạy trên iPhone (thêm vào Màn hình chính), song ngữ Việt – Trung, dùng được khi mất mạng.

Mở app: https://luongquangdao8386-ops.github.io/ME-Codien/

## Thành phần

| Phần | Nằm ở đâu | Công nghệ |
| --- | --- | --- |
| Dữ liệu | File Google Sheets "ME – Dữ liệu" (20 sheet) | Google Sheets |
| Máy chủ | Thư mục `may-chu/` (bản lưu của mã đã dán trong Apps Script) | Apps Script 2.0.0, Web App trả JSON |
| Giao diện | Gốc kho này | HTML, CSS, JavaScript thuần (không cần build), GitHub Pages |

## Giao diện (gốc kho)

| Tệp | Việc |
| --- | --- |
| `index.html` | Trang duy nhất của app |
| `manifest.webmanifest`, `icons/` | Tên, biểu tượng khi thêm vào Màn hình chính |
| `sw.js` | Lưu sẵn app trên máy để mở khi mất mạng; báo "Có bản mới" |
| `css/app.css` | Giao diện theo bản vẽ (xanh than – vàng an toàn) |
| `fonts/` | Be Vietnam Pro (giấy phép OFL, xem `fonts/OFL.txt`); chữ Trung dùng font sẵn của iPhone |
| `js/cau-hinh.js` | Phiên bản app; link máy chủ mặc định (để trống) |
| `js/nen.js`, `js/nhan.js`, `js/ui.js` | Dựng giao diện, nhãn song ngữ, số và ngày kiểu Việt / Trung |
| `js/du-lieu.js` | Dữ liệu trên máy (IndexedDB), gọi máy chủ, hàng chờ khi mất mạng, đồng bộ, PIN |
| `js/chi-so.js`, `js/bieu-do.js` | Tính tiêu thụ điện nước giống máy chủ; biểu đồ |
| `js/man-*.js` | Các màn: chung, thiết bị, kho, điện nước, quản trị |
| `js/app.js` | Điều hướng, khóa app sau 10 phút ở nền, cập nhật bản mới |
| `js/lib/` | JSZip (đọc .xlsx), jsQR (quét QR), QR Code Generator (in tem) – giấy phép kèm theo |

## Thư mục `may-chu/`

| Tệp | Việc |
| --- | --- |
| `appsscript.json` | Múi giờ Asia/Ho_Chi_Minh, V8, cấu hình Web App |
| `CauTruc.gs` | Cấu trúc 20 sheet và cột, hàm dùng chung |
| `BaoMat.gs` | Băm PIN, chặn PIN dễ đoán, tạo PIN tạm |
| `CaiDat.gs` | Menu ME: cài đặt, tạo quản trị viên, cấp PIN tạm, sao lưu tuần |
| `Code.gs` | Máy chủ 2.0.0: đăng nhập, đọc ghi dữ liệu, đồng bộ, nhập file kho, điện nước |
| `kiem-tra-may-chu.html` | Công cụ kiểm tra máy chủ (mở bằng trình duyệt, dán link `/exec`) |

Mã ở đây chỉ là bản lưu. Bản chạy thật là bản đã dán trong Apps Script; sửa ở đâu thì chép sang chỗ kia cho khớp.
Bước 3 không đổi mã máy chủ: app 1.0.0 chạy với máy chủ 2.0.0.

## Phát hành bản mới

1. Sửa tệp, rồi đổi `PHIEN_BAN` trong `sw.js` (VD `me-1.0.1`) và `phienBan` trong `js/cau-hinh.js`.
2. Tải các tệp đã sửa lên kho (Add file → Upload files → Commit).
3. Đợi 1–2 phút. Máy người dùng hiện dải vàng "Có bản mới – bấm để cập nhật".

Không đổi `PHIEN_BAN` thì máy đã cài vẫn dùng bản cũ lưu trên máy.

## Bảo mật

Kho này để công khai (GitHub Pages miễn phí yêu cầu vậy), nên:

- Không đưa lên đây mật khẩu, PIN, khóa bí mật, địa chỉ file Sheets hay ID thư mục Drive.
- Link Web App `/exec` không ghi trong mã: mỗi máy dán link lần đầu, hoặc quét Mã QR kết nối trên máy quản trị.
- Khóa bí mật do menu ME → Cài đặt tạo ngẫu nhiên và cất trong Script Properties của Apps Script, không nằm trong mã.
- Mọi yêu cầu tới máy chủ đều phải có phiên đăng nhập hợp lệ và được kiểm quyền.

## Tiến độ

- [x] Bước 1 – Dựng file Google Sheets (02/10/2026)
- [x] Bước 2 – Máy chủ: đăng nhập PIN, đọc ghi dữ liệu, đồng bộ (02/10/2026, máy chủ 2.0.0)
- [x] Bước 3 – Giao diện PWA đợt 1 trên GitHub Pages (02/10/2026, app 1.0.0)
- [ ] Đợt 2 – Sửa chữa, bảo trì
- [ ] Đợt 3 – Báo cáo

# ME – Quản lý Cơ điện · 机电管理系统

App quản lý cơ điện nhà máy: thiết bị, kho linh kiện, điện nước, sửa chữa, bảo trì.
Chạy trên iPhone (thêm vào Màn hình chính), song ngữ Việt – Trung, dùng được khi mất mạng.

## Thành phần

| Phần | Nằm ở đâu | Công nghệ |
| --- | --- | --- |
| Dữ liệu | File Google Sheets "ME – Dữ liệu" (20 sheet) | Google Sheets |
| Máy chủ | Thư mục `may-chu/` (dán vào Apps Script của file Sheets) | Apps Script, Web App trả JSON |
| Giao diện | Gốc kho này (làm ở bước 3) | HTML, CSS, JavaScript thuần, GitHub Pages |

## Thư mục `may-chu/`

| Tệp | Việc |
| --- | --- |
| `appsscript.json` | Múi giờ Asia/Ho_Chi_Minh, V8, cấu hình Web App |
| `CauTruc.gs` | Cấu trúc 20 sheet và cột, hàm dùng chung |
| `BaoMat.gs` | Băm PIN, chặn PIN dễ đoán, tạo PIN tạm |
| `CaiDat.gs` | Menu ME: cài đặt, tạo quản trị viên, cấp PIN tạm, sao lưu tuần |

Mã ở đây chỉ là bản lưu. Bản chạy thật là bản đã dán trong Apps Script; sửa ở đâu thì chép sang chỗ kia cho khớp.

## Bảo mật

Kho này để công khai (GitHub Pages miễn phí yêu cầu vậy), nên:

- Không đưa lên đây mật khẩu, PIN, khóa bí mật, địa chỉ file Sheets hay ID thư mục Drive.
- Khóa bí mật do menu ME → Cài đặt tạo ngẫu nhiên và cất trong Script Properties của Apps Script, không nằm trong mã.
- Mọi yêu cầu tới máy chủ đều phải có phiên đăng nhập hợp lệ và được kiểm quyền.

## Tiến độ

- [x] Bước 1 – Dựng file Google Sheets (02/10/2026)
- [ ] Bước 2 – Máy chủ: đăng nhập PIN, đọc ghi dữ liệu, đồng bộ
- [ ] Bước 3 – Giao diện PWA trên GitHub Pages

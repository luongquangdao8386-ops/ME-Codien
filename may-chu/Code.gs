/**
 * ME – Quản lý Cơ điện · 机电管理系统
 * Code.gs — máy chủ Web App (bước 2): cửa vào, đăng nhập PIN, phân quyền, đọc ghi Sheets có khóa và bộ nhớ đệm,
 * đồng bộ và hàng chờ khi mất mạng, các phân hệ đợt 1: Thiết bị, Kho linh kiện, Điện nước, Quản trị.
 *
 * Cần các tệp bước 1 trong cùng dự án (bản cập nhật ở bước 2): CauTruc.gs (cấu trúc phiên bản 2), BaoMat.gs, CaiDat.gs.
 *
 * ── Giao tiếp ──
 * App gửi POST tới địa chỉ Web App (/exec); nội dung JSON gửi dạng text/plain để tránh lỗi CORS:
 *     { action, token, data, clientId, phienBanApp }
 * Máy chủ trả JSON:
 *     { ok: true,  data, tokenMoi?, mayChu, api, gio, ms }
 *     { ok: false, loi: { ma, vi, zh, chiTiet? }, mayChu, api, gio, ms }
 *   - clientId: mã ngẫu nhiên (8–64 ký tự) cho mỗi thao tác ghi; gửi lại cùng clientId thì máy chủ chỉ ghi một lần
 *     và trả { daXuLy: true, ma }.
 *   - tokenMoi: token đã gia hạn, app thay token cũ bằng token này.
 *   - Số: nên gửi dạng số JSON. Gửi dạng chữ thì "7,5" = "7.5"; "4.000" = bốn nghìn (kiểu Việt);
 *     riêng chỉ số công tơ, một dấu chấm luôn là thập phân ("250.125" m³).
 *   - Lỗi PHIEN_HET_HAN → đăng nhập lại; PHAI_DOI_PIN → mở màn Đổi PIN;
 *     CAN_XAC_NHAN → hỏi người dùng (loi.vi / loi.zh) rồi gửi lại với data.xacNhan = true (data.lk.xacNhan với themLinhKien).
 * GET tới /exec trả phiên bản máy chủ và kết quả tự kiểm tra cài đặt.
 *
 * ── Danh sách action ── (quyền theo bảng QUYEN bên dưới; * = hàm còn kiểm thêm theo từng dòng dữ liệu)
 *   ping              công khai           –
 *   dangNhap          công khai           { maNV, pin }  → { token, hetHan, hoSo, phaiDoiPin }
 *   doiPin            đã đăng nhập        { pinCu, pinMoi }  → { token, hetHan, hoSo }
 *   dangXuatMayKhac   đã đăng nhập        –  → { token, hetHan } (máy khác phải đăng nhập lại)
 *   taiBanDau         XEM                 –  → { moc, hoSo, cauHinh, bang: { Ten: { khoa, cot, dong } } }
 *   dongBo            XEM                 { moc }  → { moc, hoSo, cauHinh, bang } hoặc { taiLai: true }
 *   guiHangDoi        XEM                 { thaoTac: [{ clientId, action, data }] }  → { ketQua: [{ clientId, ok, data | loi }] }
 *   luuThietBi        SUA_THIET_BI        { tb: { MaTB, TenVi, TenZh, LoaiTB, KhuVuc, …, PhienBan?, laMoi?, anh? },
 *                                           thongSo: [{ MaTS, GiaTri, xoa? }] }
 *   xoaThietBi        XOA_THIET_BI        { maTB }
 *   luuLinhKienTB     DE_XUAT_LINH_KIEN*  { maTB, ds: [{ MaLK, SoLuongLap, ChuKyThay, DonViChuKy, LanThayCuoi, ViTriLapVi, ViTriLapZh, GhiChu, xoa? }] }
 *   themLinhKien      THEM_LINH_KIEN*     { lk: { MaLK?, TenVi, TenZh, QuyCach, DVT, NhomLK, MaNSX, ViTriKho, TonToiThieu, GhiChu,
 *                                                 dsMaTB?, anh?, dichMay?, xacNhan? } }
 *   suaLinhKien       SUA_LINH_KIEN       { lk: { MaLK, …các trường của app…, PhienBan?, duyetDich?, anh? } }
 *   duyetLinhKien     DUYET_LINH_KIEN     { maLK }
 *   gopMaTam          DUYET_LINH_KIEN     { maTam, maChinhThuc }
 *   dichTen           THEM_LINH_KIEN      { ds: ['tên tiếng Việt', …] }  → { ds: ['中文', …] }
 *   nhapKhoBatDau     NHAP_KHO            { tenFile, ngayFile, tongDong, soGoi, ghepCot? }  → { maLan, goiToiDa }
 *   nhapKhoGoi        NHAP_KHO            { maLan, soGoi, dong: [{ _dong, MaLK, TenVi, QuyCach, DVT, TonKho, DonGia, ViTriKho }] }
 *   nhapKhoKetThuc    NHAP_KHO            { maLan, dsMa: [mã có trong file] }  → tổng kết + gợi ý gộp mã tạm
 *   luuGhepCotKho     NHAP_KHO            { ds: [{ CotFile, TruongApp, BatBuoc, ChuyenDoi }] }
 *   luuAnh            theo loại ảnh*      { base64, loai: THIET_BI | LINH_KIEN | CONG_TO | SUA_CHUA | BAO_TRI, maLienKet }  → { anhId }
 *   layAnh            XEM                 { anhId }  → { anhId, mime, base64 }
 *   luuChiSo          GHI_CHI_SO          { MaCT, ChiSoBT, ChiSoCD?, ChiSoTD?, GhiLuc?, anh | AnhId, GhiChu?, xacNhan? }
 *   duyetChiSo        GHI_CHI_SO*         { maGhi, ghiChu?, sua?: { ChiSoBT, ChiSoCD, ChiSoTD } }
 *   xoaChiSo          GHI_CHI_SO*         { maGhi, lyDo? }
 *   thayCongTo        QUAN_LY_DIEN_NUOC   { maCT, soCuoiCu, soDauMoi, heSoMoi?, soToiDaMoi?, GhiLuc?, ghiChu?, anh?, xacNhan? }
 *   luuCongTo         QUAN_LY_DIEN_NUOC   { ct: { MaCT, TenVi, TenZh, Loai, …, PhienBan?, xoa? } }
 *   luuBieuGia        QUAN_LY_DIEN_NUOC   { ds: [{ Loai, DonGia, TuNgay, DenNgay?, GhiChu?, xoa? }] }
 *   tongHopDienNuoc   XEM                 { thang: 'YYYY-MM' }  (chi phí chỉ trả cho cấp 1–2)
 *   lichSuChiSo       XEM                 { maCT, tuNgay?, denNgay?, gioiHan? }
 *   luuNguoiDung      NGUOI_DUNG*         { nd: { MaNV, HoTen, BoPhan, ChucVuVi, ChucVuZh, Cap, QuyenThem, TrangThai, moKhoa?, PhienBan? } }
 *   datLaiPin         NGUOI_DUNG*         { maNV }  → { maNV, hoTen, pinTam }
 *   luuDanhMuc        QUAN_TRI            { ds: [{ Loai, Ma, TenVi, TenZh, ThuTu, KichHoat }] }
 *   luuMauThongSo     QUAN_TRI            { ds: [{ LoaiTB, MaTS, TenVi, TenZh, Nhom, DonVi, KieuDL, BatBuoc, ThuTu, xoa? }] }
 *   luuTuDien         QUAN_TRI            { ds: [{ Khoa, Vi, Zh, GhiChu }] }
 *   boSungTuDien      QUAN_TRI            { ds: [{ Khoa, Vi, Zh, GhiChu }] }  (chỉ thêm khóa chưa có, không ghi đè bản dịch)
 *   luuCauHinh        QUAN_TRI*           { ds: { KHOA: giaTri } }
 *   xemNhatKy         QUAN_TRI            { tuNgay?, denNgay?, maNV?, bang?, hanhDong?, tu?, gioiHan? }
 *
 * ── Triển khai ──
 * Lần đầu: Triển khai → Tùy chọn triển khai mới → Ứng dụng web; Thực thi: Tôi; Người có quyền truy cập: Bất kỳ ai.
 * Sửa mã về sau: Triển khai → Quản lý tùy chọn triển khai → bút chì → Phiên bản: Phiên bản mới → Triển khai.
 * Không tạo "Tùy chọn triển khai mới" mỗi lần sửa: URL đổi thì app mất kết nối.
 */

// ───────────────────────── Hằng số ─────────────────────────

const PHIEN_BAN_MAY_CHU = '2.0.0';
const PHIEN_BAN_API = 1;
const CAU_TRUC_CAN = 2;             // cần CauHinh PHIEN_BAN_CAU_TRUC từ 2 trở lên
const PHIEN_BAN_DONG_BO = 1;        // đổi khi đổi danh sách bảng đồng bộ → app tải lại toàn bộ một lần
const PHUT_LUI_MOC = 5;             // mốc đồng bộ lùi 5 phút để không sót dòng ghi cùng lúc
const NGAY_TAI_LAI = 7;             // mốc cũ hơn 7 ngày → app tải lại toàn bộ (tự sửa mọi sai lệch)
const NGAY_CHI_SO_TAI_DAU = 62;     // tải lần đầu: chỉ số 62 ngày gần nhất + lần ghi cuối của mỗi công tơ
const GIAY_CACHE = 600;             // bộ nhớ đệm 10 phút
const GIAY_TOI_DA_HANG_DOI = 240;   // hàng chờ: xử lý tối đa 4 phút mỗi lần gửi, phần còn lại app gửi tiếp
const TOI_DA_YEU_CAU = 20 * 1024 * 1024;
const TOI_DA_ANH = 3 * 1024 * 1024;
const NGUOI_HE_THONG = 'HE_THONG';
const TIEN_TO_MA_TAM = 'TẠM';  // "TẠM"
const MA_HOP_LE = /^[A-Z0-9][A-Z0-9._\-]{0,29}$/;
const MA_DANH_MUC_HOP_LE = /^[A-Z0-9][A-Z0-9_]{0,39}$/;
const CLIENT_ID_HOP_LE = /^[A-Za-z0-9_\-]{8,64}$/;
const ID_DRIVE_HOP_LE = /^[A-Za-z0-9_\-]{20,120}$/;
const TRUONG_FILE_KHO = ['MaLK', 'TenVi', 'QuyCach', 'DVT', 'TonKho', 'DonGia', 'ViTriKho'];

/** Cấu hình gửi xuống app. Không gửi ID thư mục. */
const CAU_HINH_CONG_KHAI = ['THOI_HAN_PHIEN_NGAY', 'SO_LAN_SAI_PIN_TOI_DA', 'PHUT_KHOA_PIN', 'PHIEN_BAN_APP_TOI_THIEU',
  'ANH_CANH_DAI_PX', 'GOI_NHAP_KHO_DONG', 'GIO_GHI_CHI_SO', 'GIO_HAN_GHI_CHI_SO', 'NGUONG_BAT_THUONG_PT',
  'SO_NGAY_TRUNG_BINH', 'HE_SO_NGHI_NHAP_SAI'];

/** Cấu hình sửa được trong app: [cấp tối đa được sửa, kiểu, nhỏ nhất, lớn nhất]. */
const CAU_HINH_SUA_DUOC = {
  GIO_GHI_CHI_SO: [2, 'gio'],
  GIO_HAN_GHI_CHI_SO: [2, 'gio'],
  NGUONG_BAT_THUONG_PT: [2, 'so', 1, 1000],
  SO_NGAY_TRUNG_BINH: [2, 'nguyen', 3, 60],
  HE_SO_NGHI_NHAP_SAI: [2, 'so', 2, 100],
  THOI_HAN_PHIEN_NGAY: [1, 'nguyen', 1, 365],
  SO_LAN_SAI_PIN_TOI_DA: [1, 'nguyen', 3, 20],
  PHUT_KHOA_PIN: [1, 'nguyen', 1, 1440],
  PHIEN_BAN_APP_TOI_THIEU: [1, 'phienBan'],
  ANH_CANH_DAI_PX: [1, 'nguyen', 480, 4096],
  GOI_NHAP_KHO_DONG: [1, 'nguyen', 50, 2000],
  SO_BAN_SAO_LUU: [1, 'nguyen', 1, 52]
};

/** Danh mục máy chủ dựa vào mã: chỉ sửa tên và thứ tự, không thêm mã, không tắt. */
const DANH_MUC_HE_THONG = ['CAP', 'QUYEN_THEM', 'TRANG_THAI_ND', 'KIEU_DL', 'NGUON_LK', 'TRANG_THAI_FILE',
  'TRANG_THAI_DUYET', 'TRANG_THAI_LAN_NHAP', 'LOAI_CONG_TO', 'KHUNG_GIO', 'TRANG_THAI_CONG_TO', 'CO_CHI_SO', 'LOAI_GIA'];

/**
 * Quyền: cap = cấp lớn nhất được làm (1 cao nhất); co = cờ trong cột QuyenThem cũng cho phép.
 * Đúng bảng phân quyền trong tài liệu khung. Quyền chi tiết theo từng dòng (cấp 4 chỉ sửa số mình ghi trong ngày,
 * cấp 2 chỉ quản lý người cấp 3–5…) kiểm trong từng hàm.
 */
const QUYEN = {
  XEM: { cap: 5 },                 // xem thiết bị, kho, biểu đồ điện nước
  SUA_THIET_BI: { cap: 3 },        // thêm, sửa thiết bị và thông số
  XOA_THIET_BI: { cap: 2 },
  GAN_LINH_KIEN: { cap: 3 },       // gắn linh kiện cho máy, duyệt đề xuất
  DE_XUAT_LINH_KIEN: { cap: 4 },   // cấp 4 đề xuất gắn linh kiện (chờ duyệt)
  XEM_DON_GIA: { cap: 2 },
  NHAP_KHO: { cap: 2, co: 'NHAP_KHO' },
  THEM_LINH_KIEN: { cap: 4 },      // cấp 4: linh kiện mới chờ duyệt
  SUA_LINH_KIEN: { cap: 3 },
  DUYET_LINH_KIEN: { cap: 2 },     // duyệt linh kiện mới, gộp mã tạm
  GHI_CHI_SO: { cap: 4 },
  DUYET_CHI_SO: { cap: 3 },        // sửa chỉ số, duyệt số bất thường (cấp 4: số mình ghi, trong ngày)
  QUAN_LY_DIEN_NUOC: { cap: 2 },   // xem chi phí; sửa công tơ, hệ số nhân, bảng giá; thay công tơ
  NGUOI_DUNG: { cap: 2 },          // người dùng, đặt lại PIN (cấp 2: người cấp 3–5)
  QUAN_TRI: { cap: 2 },            // danh mục, mẫu thông số, từ điển, ghép cột, nhật ký
  HE_THONG: { cap: 1 }
};

// ───────────────────────── Lỗi song ngữ ─────────────────────────

const LOI = {
  DU_LIEU_SAI: ['Dữ liệu gửi lên không hợp lệ.', '提交的数据无效。'],
  QUA_LON: ['Dữ liệu gửi lên quá lớn.', '提交的数据过大。'],
  HANH_DONG_SAI: ['Thao tác không hợp lệ: {action}.', '无效的操作：{action}。'],
  KHONG_XEP_HANG_DOI: ['Thao tác {action} không gửi qua hàng chờ được.', '操作{action}不能通过待发队列提交。'],
  PHIEN_HET_HAN: ['Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.', '登录已过期，请重新登录。'],
  TAI_KHOAN_NGUNG: ['Tài khoản đã ngừng dùng. Liên hệ quản trị.', '账户已停用，请联系管理员。'],
  KHONG_DU_QUYEN: ['Bạn không có quyền làm việc này.', '您没有执行此操作的权限。'],
  PHAI_DOI_PIN: ['Bạn cần đổi PIN trước khi dùng app.', '使用前请先修改PIN码。'],
  CAN_CAP_NHAT_APP: ['App đã cũ (cần từ bản {toiThieu}). Hãy cập nhật app.', '应用版本过旧（需要{toiThieu}或以上），请更新应用。'],
  CAN_CAI_DAT: ['Máy chủ chưa cập nhật cấu trúc dữ liệu. Quản trị mở file Sheets → menu ME → Cài đặt / cập nhật cấu trúc.',
    '服务器数据结构未更新。请管理员打开表格 → ME菜单 → 安装/更新结构。'],
  MAY_CHU_BAN: ['Máy chủ đang bận, thử lại sau ít giây.', '服务器繁忙，请稍后重试。'],
  MA_NV_SAI_DANG: ['Mã nhân viên không hợp lệ.', '员工编号无效。'],
  PIN_SAI_DANG: ['PIN gồm đúng 6 chữ số.', 'PIN码必须为6位数字。'],
  SAI_MA_HOAC_PIN: ['Mã nhân viên hoặc PIN không đúng.', '员工编号或PIN码错误。'],
  SAI_PIN_CON: ['PIN không đúng. Còn {con} lần thử trước khi bị khóa.', 'PIN码错误，再错{con}次将被锁定。'],
  DANG_KHOA: ['Tài khoản tạm khóa do nhập sai PIN nhiều lần. Thử lại sau {gio}.', '因多次输错PIN码，账户已暂时锁定，请在{gio}之后重试。'],
  CHUA_CO_PIN: ['Tài khoản chưa có PIN. Liên hệ quản trị để được cấp PIN tạm.', '账户尚未设置PIN码，请联系管理员获取临时PIN码。'],
  PIN_DE_DOAN: ['PIN quá dễ đoán (lặp, dãy số, đối xứng…). Chọn PIN khác.', 'PIN码过于简单（重复、连续或对称等），请换一个。'],
  PIN_TRUNG_CU: ['PIN mới phải khác PIN cũ.', '新PIN码不能与旧PIN码相同。'],
  TU_DAT_LAI_PIN: ['Muốn đổi PIN của chính mình, dùng chức năng Đổi PIN.', '修改自己的PIN码请使用“修改PIN码”功能。'],
  CAP_2_GIOI_HAN: ['Cấp 2 chỉ quản lý người dùng cấp 3–5.', '2级只能管理3–5级用户。'],
  QUAN_TRI_CUOI: ['Phải còn ít nhất một quản trị cấp 1 đang hoạt động.', '必须至少保留一名启用中的1级管理员。'],
  THIEU_TRUONG: ['Thiếu {truong}.', '缺少{truong}。'],
  GIA_TRI_SAI: ['{truong} không hợp lệ: «{giaTri}».', '{truong}无效：「{giaTri}」。'],
  KHONG_CO_TRONG_DANH_MUC: ['{truong} «{giaTri}» không có trong danh mục.', '{truong}「{giaTri}」不在目录中。'],
  MA_KHONG_HOP_LE: ['Mã «{ma}» không hợp lệ: chỉ dùng chữ không dấu, số, dấu chấm, gạch ngang, gạch dưới.',
    '编号「{ma}」无效：只能使用无声调字母、数字、点、横线或下划线。'],
  KHONG_TIM_THAY: ['Không tìm thấy {ma}.', '未找到{ma}。'],
  TRUNG_MA: ['Mã {ma} đã có.', '编号{ma}已存在。'],
  MA_DA_XOA: ['Mã {ma} đã bị xóa trước đây. Chọn mã khác, hoặc nhờ quản trị khôi phục trong file.',
    '编号{ma}曾被删除。请使用其他编号，或请管理员在表格中恢复。'],
  XUNG_DOT: ['{ma} vừa được {nguoi} sửa lúc {luc}. Tải lại rồi sửa tiếp.', '{ma}已于{luc}被{nguoi}修改，请刷新后再改。'],
  THIEU_THONG_SO: ['Thiếu thông số bắt buộc: {ds}.', '缺少必填参数：{ds}。'],
  VONG_LAP_CHA: ['{truong} tạo vòng lặp (là chính nó hoặc cấp dưới của nó).', '{truong}形成循环（是自身或其下级）。'],
  CAN_XAC_NHAN: ['{vi}', '{zh}'],
  THIEU_ANH: ['Cần chụp ảnh mặt công tơ.', '需要拍摄电表读数照片。'],
  ANH_SAI: ['Ảnh không hợp lệ hoặc lớn hơn 3 MB.', '照片无效或超过3MB。'],
  LOAI_ANH_SAI: ['Loại ảnh không hợp lệ: {loai}.', '照片类型无效：{loai}。'],
  GIO_GHI_SAI: ['Giờ ghi không hợp lệ (ở tương lai hoặc quá 30 ngày trước).', '抄表时间无效（未来时间或30天以前）。'],
  CONG_TO_NGUNG: ['Công tơ {ma} không ở trạng thái đang dùng.', '电表{ma}不在使用中。'],
  SO_NHO_HON_TRUOC: ['Chỉ số {khung} ({moi}) nhỏ hơn lần trước ({truoc}). Kiểm tra lại số, hoặc dùng Thay công tơ nếu đã thay.',
    '{khung}读数（{moi}）小于上次（{truoc}）。请核对；如已换表请使用“更换电表”。'],
  SO_LON_HON_SAU: ['Chỉ số lớn hơn lần ghi sau đó lúc {luc}. Kiểm tra lại giờ ghi và số.', '读数大于之后{luc}的抄表记录，请核对抄表时间和读数。'],
  TRUOC_THAY_CONG_TO: ['Công tơ đã được thay sau thời điểm này nên không ghi chen, sửa hay xóa được. Nhờ quản trị sửa trong file.',
    '此时间之后已更换电表，无法补录、修改或删除，请管理员在表格中处理。'],
  CHI_SO_THAY_CONG_TO: ['Đây là dòng thay công tơ, không sửa hay xóa trong app được. Nhờ quản trị sửa trong file.',
    '这是换表记录，不能在应用中修改或删除，请管理员在表格中处理。'],
  NHAP_KHO_DANG_CHAY: ['Đang có lần cập nhật kho {ma} của {nguoi} bắt đầu lúc {luc}. Đợi xong rồi thử lại.',
    '{nguoi}于{luc}开始的库存导入{ma}尚未完成，请稍后再试。'],
  NHAP_KHO_DA_DONG: ['Lần cập nhật {ma} đã kết thúc hoặc đã hủy.', '导入批次{ma}已结束或已取消。'],
  NHAP_KHO_THIEU_GOI: ['Còn thiếu gói {goi}. Gửi lại các gói đó rồi kết thúc.', '缺少第{goi}包，请重新发送后再结束。'],
  NHAP_KHO_THIEU_MA: ['Có {so} mã trong file chưa được ghi (VD {vd}). Gửi lại các gói rồi kết thúc.',
    '文件中有{so}个料号尚未写入（如{vd}），请重新发送后再结束。'],
  QUA_NHIEU: ['Quá nhiều dòng trong một lần gửi (tối đa {toiDa}).', '单次提交行数过多（最多{toiDa}行）。'],
  DICH_LOI: ['Không dịch tự động được lúc này. Thử lại sau hoặc gõ tên tiếng Trung.', '暂时无法自动翻译，请稍后重试或手动输入中文名称。'],
  THANG_SAI: ['Tháng không hợp lệ, dùng dạng 2026-09.', '月份无效，请使用2026-09格式。'],
  DANH_MUC_HE_THONG: ['Danh mục {loai} do máy chủ dùng: chỉ sửa được tên và thứ tự, không thêm hay tắt mã.',
    '目录{loai}由系统使用：只能修改名称和顺序，不能新增或停用编码。'],
  LOAI_CONG_TO_KHOA: ['Công tơ {ma} đã có chỉ số nên không đổi loại được.', '电表{ma}已有读数，不能更改类型。'],
  KHONG_GOP_DUOC: ['Không gộp được: {lyDo}.', '无法合并：{lyDo}。'],
  LOI_HE_THONG: ['Lỗi máy chủ: {chiTiet}', '服务器错误：{chiTiet}']
};

/** Câu hỏi xác nhận (lỗi CAN_XAC_NHAN, chiTiet.lyDo). */
const XAC_NHAN = {
  DA_GHI_NGAY: ['Công tơ {ma} đã có lần ghi tính cho ngày {ngay} (lúc {luc}, {nguoi}). Vẫn lưu thêm?',
    '电表{ma}已有{ngay}的抄表记录（{luc}，{nguoi}）。仍要保存吗？'],
  NGHI_NHAP_SAI: ['Tiêu thụ {khung} gấp {lan} lần trung bình {soNgay} ngày trước ({tb} {donVi}/ngày). Có thể nhập sai số: đối chiếu ảnh mặt công tơ rồi xác nhận.',
    '{khung}用量是前{soNgay}日均值（{tb} {donVi}/日）的{lan}倍，可能输入有误，请对照电表照片后确认。'],
  TRUNG_MA_NSX: ['Đã có linh kiện cùng mã nhà sản xuất {maNSX}: {ds}. Vẫn thêm?', '已有相同原厂料号{maNSX}的备件：{ds}。仍要新增吗？'],
  TRUNG_TEN: ['Đã có linh kiện cùng tên và quy cách: {ds}. Vẫn thêm?', '已有名称和规格相同的备件：{ds}。仍要新增吗？']
};

/** Tên trường trong câu báo lỗi: [Việt, Trung]. */
const TEN_TRUONG = {
  MaTB: ['Mã thiết bị', '设备编号'], TenVi: ['Tên tiếng Việt', '越南语名称'], TenZh: ['Tên tiếng Trung', '中文名称'],
  LoaiTB: ['Loại máy', '设备类型'], KhuVuc: ['Khu vực', '区域'], TrangThai: ['Trạng thái', '状态'],
  MucQuanTrong: ['Mức quan trọng', '重要等级'], NguoiPhuTrach: ['Người phụ trách', '负责人'], MaTBCha: ['Máy cha', '上级设备'],
  NamSX: ['Năm sản xuất', '出厂年份'], NgayDuaVaoSD: ['Ngày đưa vào sử dụng', '投用日期'], TaiLieuUrl: ['Link tài liệu', '资料链接'],
  MaLK: ['Mã linh kiện', '料号'], DVT: ['Đơn vị tính', '单位'], NhomLK: ['Nhóm linh kiện', '备件类别'],
  TonKho: ['Tồn kho', '库存'], TonToiThieu: ['Tồn tối thiểu', '安全库存'], DonGia: ['Đơn giá', '单价'],
  SoLuongLap: ['Số lượng lắp', '安装数量'], ChuKyThay: ['Chu kỳ thay', '更换周期'], DonViChuKy: ['Đơn vị chu kỳ', '周期单位'],
  LanThayCuoi: ['Lần thay cuối', '上次更换'], MaCT: ['Mã công tơ', '电表编号'], Loai: ['Loại', '类型'],
  HeSoNhan: ['Hệ số nhân', '倍率'], SoToiDa: ['Số tối đa mặt công tơ', '满量程'], DinhMucNgay: ['Định mức mỗi ngày', '每日定额'],
  MaCTCha: ['Công tơ cha', '上级电表'], NgayLap: ['Ngày lắp', '安装日期'],
  ChiSoBT: ['Chỉ số bình thường', '平段读数'], ChiSoCD: ['Chỉ số cao điểm', '峰段读数'], ChiSoTD: ['Chỉ số thấp điểm', '谷段读数'],
  TuNgay: ['Từ ngày', '起始日期'], DenNgay: ['Đến ngày', '截止日期'], MaNV: ['Mã nhân viên', '员工编号'], HoTen: ['Họ tên', '姓名'],
  Cap: ['Cấp', '级别'], BoPhan: ['Bộ phận', '部门'], QuyenThem: ['Quyền thêm', '附加权限'], Khoa: ['Khóa', '键'],
  Ma: ['Mã', '编码'], MaTS: ['Mã thông số', '参数编码'], GiaTri: ['Giá trị', '数值'], KieuDL: ['Kiểu dữ liệu', '数据类型'],
  Nhom: ['Nhóm', '分组'], ThuTu: ['Thứ tự', '顺序'], ngayFile: ['Ngày file', '文件日期'], tenFile: ['Tên file', '文件名'],
  tongDong: ['Số dòng', '行数'], soGoi: ['Số gói', '包数'], CotFile: ['Cột trong file', '文件列'], TruongApp: ['Trường trong app', '应用字段'],
  maLan: ['Mã lần nhập', '导入批次'], heSoMoi: ['Hệ số nhân mới', '新倍率'], soCuoiCu: ['Số cuối công tơ cũ', '旧表末次读数'],
  soDauMoi: ['Số đầu công tơ mới', '新表起始读数'], GiaTriCauHinh: ['Giá trị cấu hình', '配置值']
};

/** Tên khung giờ trong câu báo. */
const TEN_KHUNG = {
  TONG: ['tổng', '总'], BT: ['giờ bình thường', '平段'], CD: ['giờ cao điểm', '峰段'], TD: ['giờ thấp điểm', '谷段']
};

function loi_(ma, thamSo) {
  const ts = thamSo || {};
  const l = dinhDangLoi_(ma, ts);
  const e = new Error(l.vi);
  e.laLoiME = true;
  e.ma = ma;
  e.thamSo = ts;
  return e;
}

function dinhDangLoi_(ma, ts) {
  ts = ts || {};
  let mau = LOI[ma] || LOI.LOI_HE_THONG;
  if (ma === 'CAN_XAC_NHAN' && XAC_NHAN[ts.lyDo]) mau = XAC_NHAN[ts.lyDo];
  const thay = function (s, zh) {
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      if (zh && ts[k + 'Zh'] !== undefined && ts[k + 'Zh'] !== null) return String(ts[k + 'Zh']);
      return ts[k] === undefined || ts[k] === null ? '' : String(ts[k]);
    });
  };
  return { ma: LOI[ma] ? ma : 'LOI_HE_THONG', vi: thay(mau[0], false), zh: thay(mau[1], true) };
}

/** Lỗi → đối tượng trả cho app. Lỗi lạ (không phải loi_) ghi vào nhật ký thực thi của Apps Script. */
function loiTraVe_(e) {
  if (e && e.laLoiME) {
    const l = dinhDangLoi_(e.ma, e.thamSo);
    if (e.thamSo && e.thamSo.chiTiet !== undefined) l.chiTiet = e.thamSo.chiTiet;
    if (e.ma === 'CAN_XAC_NHAN') l.chiTiet = Object.assign({ lyDo: e.thamSo.lyDo }, e.thamSo.chiTiet || {});
    return l;
  }
  console.error('ME – lỗi máy chủ: ' + (e && e.stack ? e.stack : e));
  return dinhDangLoi_('LOI_HE_THONG', { chiTiet: String(e && e.message ? e.message : e).slice(0, 300) });
}

function tenTruong_(c) {
  const t = TEN_TRUONG[c];
  return t ? { truong: t[0], truongZh: t[1] } : { truong: c, truongZh: c };
}

function loiTruong_(ma, cot, them) {
  return loi_(ma, Object.assign(tenTruong_(cot), them || {}));
}

// ───────────────────────── Cửa vào ─────────────────────────

/** GET /exec: phiên bản và tự kiểm tra cài đặt. Không cần đăng nhập, không trả dữ liệu. */
function doGet(e) {
  let kq;
  try {
    const kt = kiemTraCaiDat_();
    kq = { ok: kt.dat, app: 'ME', ten: 'ME – Quản lý Cơ điện · 机电管理系统', kiemTra: kt };
  } catch (err) {
    kq = { ok: false, app: 'ME', loi: loiTraVe_(err) };
  }
  kq.mayChu = PHIEN_BAN_MAY_CHU;
  kq.api = PHIEN_BAN_API;
  kq.gio = bayGio_();
  return traJson_(kq);
}

/** POST /exec: một cửa cho mọi thao tác. */
function doPost(e) {
  const batDau = Date.now();
  let kq;
  try {
    kq = xuLyYeuCau_(docYeuCau_(e));
  } catch (err) {
    kq = { ok: false, loi: loiTraVe_(err) };
    if (err && err.tokenMoi) kq.tokenMoi = err.tokenMoi;
  }
  kq.mayChu = PHIEN_BAN_MAY_CHU;
  kq.api = PHIEN_BAN_API;
  kq.gio = bayGio_();
  kq.ms = Date.now() - batDau;
  return traJson_(kq);
}

function traJson_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function docYeuCau_(e) {
  const s = e && e.postData && typeof e.postData.contents === 'string' ? e.postData.contents : '';
  if (!s) throw loi_('DU_LIEU_SAI');
  if (s.length > TOI_DA_YEU_CAU) throw loi_('QUA_LON');
  let yc;
  try {
    yc = JSON.parse(s);
  } catch (err) {
    throw loi_('DU_LIEU_SAI');
  }
  if (!yc || typeof yc !== 'object' || typeof yc.action !== 'string') throw loi_('DU_LIEU_SAI');
  return yc;
}

function xuLyYeuCau_(yc) {
  const action = yc.action;
  if (!Object.prototype.hasOwnProperty.call(HANH_DONG, action)) throw loi_('HANH_DONG_SAI', { action: String(action).slice(0, 40) });
  const hd = HANH_DONG[action];
  kiemPhienBanApp_(yc.phienBanApp, action);
  const data = yc.data && typeof yc.data === 'object' && !Array.isArray(yc.data) ? yc.data : {};
  const ctx = { action: action, clientId: chuanClientId_(yc.clientId), phienBanApp: yc.phienBanApp || '' };
  if (hd.moCong) return { ok: true, data: hd.ham(null, data, ctx) };
  const xt = kiemTraToken_(yc.token);
  // Token còn hợp lệ nhưng sắp hết hạn → gửi kèm token mới (cả khi thao tác báo lỗi).
  const moi = hd.traToken ? null : giaHanToken_(xt);
  let kq;
  try {
    kq = { ok: true, data: route_(action, xt.user, data, ctx) };
  } catch (err) {
    if (moi && err && typeof err === 'object') err.tokenMoi = moi;
    throw err;
  }
  if (moi) kq.tokenMoi = moi;
  return kq;
}

/**
 * Bảng tra action → hàm + quyền. Kiểm: bắt đổi PIN, quyền theo cấp và cờ, cấu trúc dữ liệu,
 * thao tác ghi gửi lại cùng clientId thì trả kết quả cũ.
 */
function route_(action, user, data, ctx) {
  if (!Object.prototype.hasOwnProperty.call(HANH_DONG, action)) throw loi_('HANH_DONG_SAI', { action: String(action).slice(0, 40) });
  const hd = HANH_DONG[action];
  ctx = ctx || {};
  if (hd.moCong) return hd.ham(user, data || {}, ctx);
  if (user.phaiDoiPin && !hd.khiPhaiDoiPin) throw loi_('PHAI_DOI_PIN');
  if (!coQuyen_(user, hd.quyen || 'XEM')) throw loi_('KHONG_DU_QUYEN');
  kiemCauTruc_();
  if (hd.ghi && ctx.clientId) {
    const ma = timClientId_(ctx.clientId);
    if (ma !== null) return { daXuLy: true, ma: ma };
  }
  return hd.ham(user, data || {}, ctx);
}

/**
 * Action của app. moCong: không cần đăng nhập. ghi: có ghi dữ liệu (chống ghi trùng bằng clientId).
 * hangDoi: được gửi qua hàng chờ khi mất mạng. traToken: hàm tự trả token mới.
 */
const HANH_DONG = {
  ping: { moCong: true, ham: function () { return { pong: true }; } },
  dangNhap: { moCong: true, ham: function (u, d, c) { return dangNhap_(d.maNV, d.pin, c); } },
  doiPin: { khiPhaiDoiPin: true, traToken: true, ham: function (u, d, c) { return doiPin_(u, d.pinCu, d.pinMoi, c); } },
  dangXuatMayKhac: { khiPhaiDoiPin: true, traToken: true, ham: function (u, d, c) { return dangXuatMayKhac_(u, c); } },

  taiBanDau: { quyen: 'XEM', ham: function (u) { return taiBanDau_(u); } },
  dongBo: { quyen: 'XEM', ham: function (u, d) { return dongBo_(u, d.moc); } },
  guiHangDoi: { quyen: 'XEM', ham: function (u, d) { return guiHangDoi_(u, d.thaoTac); } },

  luuThietBi: { quyen: 'SUA_THIET_BI', ghi: true, hangDoi: true, ham: function (u, d, c) { return luuThietBi_(u, d.tb, d.thongSo, c); } },
  xoaThietBi: { quyen: 'XOA_THIET_BI', ghi: true, hangDoi: true, ham: function (u, d, c) { return xoaThietBi_(u, d.maTB, c); } },
  luuLinhKienTB: { quyen: 'DE_XUAT_LINH_KIEN', ghi: true, hangDoi: true, ham: function (u, d, c) { return luuLinhKienTB_(u, d.maTB, d.ds, c); } },

  themLinhKien: { quyen: 'THEM_LINH_KIEN', ghi: true, hangDoi: true, ham: function (u, d, c) { return themLinhKien_(u, d.lk, c); } },
  suaLinhKien: { quyen: 'SUA_LINH_KIEN', ghi: true, hangDoi: true, ham: function (u, d, c) { return suaLinhKien_(u, d.lk, c); } },
  duyetLinhKien: { quyen: 'DUYET_LINH_KIEN', ghi: true, hangDoi: true, ham: function (u, d, c) { return duyetLinhKien_(u, d.maLK, c); } },
  gopMaTam: { quyen: 'DUYET_LINH_KIEN', ghi: true, ham: function (u, d, c) { return gopMaTam_(u, d.maTam, d.maChinhThuc, c); } },
  dichTen: { quyen: 'THEM_LINH_KIEN', ham: function (u, d) { return { ds: dichTen_(d.ds) }; } },
  nhapKhoBatDau: { quyen: 'NHAP_KHO', ghi: true, ham: function (u, d, c) { return nhapKhoBatDau_(u, d, c); } },
  nhapKhoGoi: { quyen: 'NHAP_KHO', ham: function (u, d, c) { return nhapKhoGoi_(u, d.maLan, d.soGoi, d.dong, c); } },
  nhapKhoKetThuc: { quyen: 'NHAP_KHO', ham: function (u, d, c) { return nhapKhoKetThuc_(u, d.maLan, d.dsMa, c); } },
  luuGhepCotKho: { quyen: 'NHAP_KHO', ghi: true, ham: function (u, d, c) { return luuGhepCotKho_(u, d.ds, c); } },

  luuAnh: { quyen: 'XEM', ghi: true, hangDoi: true, ham: function (u, d, c) { return luuAnh_(u, d.base64, d.loai, d.maLienKet, c); } },
  layAnh: { quyen: 'XEM', ham: function (u, d) { return layAnh_(u, d.anhId); } },

  luuChiSo: { quyen: 'GHI_CHI_SO', ghi: true, hangDoi: true, ham: function (u, d, c) { return luuChiSo_(u, d, c); } },
  duyetChiSo: { quyen: 'GHI_CHI_SO', ghi: true, hangDoi: true, ham: function (u, d, c) { return duyetChiSo_(u, d, c); } },
  xoaChiSo: { quyen: 'GHI_CHI_SO', ghi: true, hangDoi: true, ham: function (u, d, c) { return xoaChiSo_(u, d, c); } },
  thayCongTo: { quyen: 'QUAN_LY_DIEN_NUOC', ghi: true, ham: function (u, d, c) { return thayCongTo_(u, d, c); } },
  luuCongTo: { quyen: 'QUAN_LY_DIEN_NUOC', ghi: true, ham: function (u, d, c) { return luuCongTo_(u, d.ct, c); } },
  luuBieuGia: { quyen: 'QUAN_LY_DIEN_NUOC', ghi: true, ham: function (u, d, c) { return luuBieuGia_(u, d.ds, c); } },
  tongHopDienNuoc: { quyen: 'XEM', ham: function (u, d) { return tongHopDienNuoc_(u, d.thang); } },
  lichSuChiSo: { quyen: 'XEM', ham: function (u, d) { return lichSuChiSo_(u, d); } },

  luuNguoiDung: { quyen: 'NGUOI_DUNG', ghi: true, ham: function (u, d, c) { return luuNguoiDung_(u, d.nd, c); } },
  datLaiPin: { quyen: 'NGUOI_DUNG', ghi: true, ham: function (u, d, c) { return datLaiPin_(u, d.maNV, c); } },
  luuDanhMuc: { quyen: 'QUAN_TRI', ghi: true, ham: function (u, d, c) { return luuDanhMuc_(u, d.ds, c); } },
  luuMauThongSo: { quyen: 'QUAN_TRI', ghi: true, ham: function (u, d, c) { return luuMauThongSo_(u, d.ds, c); } },
  luuTuDien: { quyen: 'QUAN_TRI', ghi: true, ham: function (u, d, c) { return luuTuDien_(u, d.ds, c, false); } },
  boSungTuDien: { quyen: 'QUAN_TRI', ghi: true, ham: function (u, d, c) { return luuTuDien_(u, d.ds, c, true); } },
  luuCauHinh: { quyen: 'QUAN_TRI', ghi: true, ham: function (u, d, c) { return luuCauHinh_(u, d.ds, c); } },
  xemNhatKy: { quyen: 'QUAN_TRI', ham: function (u, d) { return xemNhatKy_(u, d); } }
};

function kiemPhienBanApp_(phienBan, action) {
  if (action === 'ping') return;
  const toiThieu = String(cauHinh_().PHIEN_BAN_APP_TOI_THIEU || '').trim();
  if (!toiThieu) return;
  if (soSanhPhienBan_(String(phienBan || '0'), toiThieu) < 0) throw loi_('CAN_CAP_NHAT_APP', { toiThieu: toiThieu });
}

function kiemCauTruc_() {
  if ((Number(cauHinh_().PHIEN_BAN_CAU_TRUC) || 0) < CAU_TRUC_CAN) throw loi_('CAN_CAI_DAT');
}

function chuanClientId_(v) {
  const s = v === undefined || v === null ? '' : String(v);
  return CLIENT_ID_HOP_LE.test(s) ? s : '';
}

/** Kiểm cài đặt cho doGet và kiemTraMayChu. */
function kiemTraCaiDat_() {
  const props = PropertiesService.getScriptProperties();
  const kt = {
    idSheets: !!props.getProperty('ID_SHEETS'),
    khoaBiMat: !!(props.getProperty('KHOA_TOKEN') && props.getProperty('KHOA_PIN')),
    soSheet: 0, canSheet: BANG.length, cauTruc: 0, canCauTruc: CAU_TRUC_CAN, coQuanTri: false
  };
  if (kt.idSheets) {
    const ss = moFile_();
    kt.soSheet = BANG.filter(function (b) { return !!ss.getSheetByName(b.ten); }).length;
    if (ss.getSheetByName('CauHinh')) kt.cauTruc = Number(cauHinh_().PHIEN_BAN_CAU_TRUC) || 0;
    if (ss.getSheetByName('NguoiDung')) {
      kt.coQuanTri = docBang_('NguoiDung').dong.some(function (d) {
        return Number(d.Cap) === 1 && String(d.TrangThai) !== 'NGUNG' && !d.DaXoa && !!d.PinHash;
      });
    }
  }
  kt.dat = kt.idSheets && kt.khoaBiMat && kt.soSheet === kt.canSheet && kt.cauTruc >= kt.canCauTruc && kt.coQuanTri;
  if (!kt.dat) {
    kt.huongDan = !kt.idSheets || !kt.khoaBiMat || kt.soSheet < kt.canSheet || kt.cauTruc < kt.canCauTruc
      ? 'Mở file Sheets → menu ME → Cài đặt / cập nhật cấu trúc.'
      : 'Chưa có quản trị cấp 1 có PIN: menu ME → Tạo quản trị viên đầu tiên.';
  }
  return kt;
}

/** Chạy tay trong trình chỉnh sửa Apps Script để xem máy chủ đã sẵn sàng chưa (Xem → Nhật ký thực thi). */
function kiemTraMayChu() {
  const kt = kiemTraCaiDat_();
  let url = '';
  try {
    url = ScriptApp.getService().getUrl() || '';
  } catch (e) {
    url = '';
  }
  console.log('ME máy chủ ' + PHIEN_BAN_MAY_CHU + (kt.dat ? ' – SẴN SÀNG' : ' – CHƯA XONG: ' + kt.huongDan) +
    '\n' + JSON.stringify(kt, null, 2) + (url ? '\nWeb App: ' + url : '\nChưa triển khai Web App.'));
  return kt;
}

// ───────────────────────── Quyền và người dùng ─────────────────────────

function coQuyen_(user, quyen) {
  const q = QUYEN[quyen];
  if (!q || !user) return false;
  if (user.Cap <= q.cap) return true;
  return !!(q.co && user.quyenThem.indexOf(q.co) >= 0);
}

/** Dòng NguoiDung → người dùng dùng trong máy chủ. Cấp sai thì coi là 5 (ít quyền nhất). */
function taoNguoiDung_(d) {
  let cap = Number(d.Cap);
  if (!(cap >= 1 && cap <= 5 && Math.floor(cap) === cap)) cap = 5;
  return {
    MaNV: chuanMaNV_(d.MaNV), HoTen: String(d.HoTen || ''), BoPhan: String(d.BoPhan || ''),
    ChucVuVi: String(d.ChucVuVi || ''), ChucVuZh: String(d.ChucVuZh || ''), Cap: cap,
    quyenThem: tachDs_(d.QuyenThem), TrangThai: String(d.TrangThai || 'HOAT_DONG'),
    TokenVer: Number(d.TokenVer) || 0, phaiDoiPin: laDung_(d.PhaiDoiPin)
  };
}

function hoSo_(user) {
  return {
    MaNV: user.MaNV, HoTen: user.HoTen, BoPhan: user.BoPhan, ChucVuVi: user.ChucVuVi, ChucVuZh: user.ChucVuZh,
    Cap: user.Cap, QuyenThem: user.quyenThem, phaiDoiPin: !!user.phaiDoiPin,
    quyen: Object.keys(QUYEN).filter(function (q) { return coQuyen_(user, q); })
  };
}

function timTrongNguoiDung_(b, maNV) {
  return layChiMuc_(b, 'MaNV', chuanMaNV_)[chuanMaNV_(maNV)] || null;
}

function timNguoiDung_(maNV) {
  return timTrongNguoiDung_(docBang_('NguoiDung'), maNV);
}

function soNgayPhien_() {
  return soCH_('THOI_HAN_PHIEN_NGAY', 30, 1, 365);
}

/** Token còn dưới nửa thời hạn thì cấp token mới (người dùng thường xuyên không phải đăng nhập lại). */
function giaHanToken_(xt) {
  const soNgay = soNgayPhien_();
  if (Number(xt.tai.e) - Date.now() / 1000 > soNgay * 86400 / 2) return null;
  return taoToken_(xt.user, soNgay);
}

// ───────────────────────── Đăng nhập ─────────────────────────

/**
 * Đăng nhập bằng mã NV + PIN. Sai PIN tăng SaiPin; cứ đủ SO_LAN_SAI_PIN_TOI_DA lần sai liên tiếp thì khóa:
 * lần đầu PHUT_KHOA_PIN phút, mỗi lần khóa sau gấp đôi, tối đa 24 giờ. Đúng PIN thì đặt lại SaiPin.
 */
function dangNhap_(maNV, pin, ctx) {
  maNV = chuanMaNV_(maNV);
  if (!MA_NV_HOP_LE.test(maNV)) throw loi_('MA_NV_SAI_DANG');
  pin = pin === undefined || pin === null ? '' : String(pin);
  if (!pinHopLe_(pin)) throw loi_('PIN_SAI_DANG');
  const toiDa = soCH_('SO_LAN_SAI_PIN_TOI_DA', 5, 3, 20);
  const phut = soCH_('PHUT_KHOA_PIN', 15, 1, 1440);
  const soNgay = soNgayPhien_();
  return voiKhoa_(function () {
    const d = timTrongNguoiDung_(docBang_('NguoiDung', true), maNV);
    const bayGio = new Date();
    if (!d || d.DaXoa) {
      bamPin_(pin, 'khong-co-nguoi-dung'); // để thời gian trả lời giống trường hợp có người dùng
      ghiNhatKy_(maNV, 'DANG_NHAP_SAI', 'NguoiDung', maNV, { lyDo: 'KHONG_CO_MA' });
      throw loi_('SAI_MA_HOAC_PIN');
    }
    kiemKhoaPin_(d, bayGio);
    if (!d.PinHash) throw loi_('CHUA_CO_PIN');
    if (!kiemTraPin_(pin, d.PinSalt, d.PinHash)) ghiSaiPin_(d, toiDa, phut, bayGio);
    if (String(d.TrangThai) === 'NGUNG') throw loi_('TAI_KHOAN_NGUNG');
    if ((Number(d.SaiPin) || 0) !== 0 || d.KhoaDen) {
      ghiNhieu_('NguoiDung', [{ MaNV: d.MaNV, SaiPin: 0, KhoaDen: '' }], { nguoi: NGUOI_HE_THONG });
    }
    const user = taoNguoiDung_(d);
    ghiNhatKy_(user, 'DANG_NHAP', 'NguoiDung', user.MaNV, '');
    const tk = taoToken_(user, soNgay);
    return { token: tk.token, hetHan: tk.hetHan, hoSo: hoSo_(user), phaiDoiPin: user.phaiDoiPin };
  });
}

function kiemKhoaPin_(d, bayGio) {
  if (!d.KhoaDen) return;
  const den = new Date(String(d.KhoaDen));
  if (!isNaN(den.getTime()) && den.getTime() > bayGio.getTime()) throw loi_('DANG_KHOA', gioThamSo_(den, 'gio'));
}

/** Ghi một lần sai PIN (có thể khóa) rồi báo lỗi. */
function ghiSaiPin_(d, toiDa, phut, bayGio) {
  const sai = (Number(d.SaiPin) || 0) + 1;
  const thayDoi = { MaNV: d.MaNV, SaiPin: sai };
  let khoaDen = null;
  if (sai % toiDa === 0) {
    const soPhut = Math.min(phut * Math.pow(2, sai / toiDa - 1), 1440);
    khoaDen = new Date(bayGio.getTime() + soPhut * 60000);
    thayDoi.KhoaDen = bayGio_(khoaDen);
  }
  ghiNhieu_('NguoiDung', [thayDoi], { nguoi: NGUOI_HE_THONG });
  ghiNhatKy_(chuanMaNV_(d.MaNV), khoaDen ? 'KHOA_PIN' : 'DANG_NHAP_SAI', 'NguoiDung', chuanMaNV_(d.MaNV),
    { SaiPin: sai, KhoaDen: thayDoi.KhoaDen || '' });
  if (khoaDen) throw loi_('DANG_KHOA', gioThamSo_(khoaDen, 'gio'));
  throw loi_('SAI_PIN_CON', { con: toiDa - (sai % toiDa) });
}

/** Đổi PIN: kiểm PIN cũ (sai cũng tính lần sai), chặn PIN dễ đoán, đăng xuất máy khác, trả token mới. */
function doiPin_(user, pinCu, pinMoi, ctx) {
  pinCu = pinCu === undefined || pinCu === null ? '' : String(pinCu);
  pinMoi = pinMoi === undefined || pinMoi === null ? '' : String(pinMoi);
  if (!pinHopLe_(pinCu) || !pinHopLe_(pinMoi)) throw loi_('PIN_SAI_DANG');
  if (pinMoi === pinCu) throw loi_('PIN_TRUNG_CU');
  if (pinDeDoan_(pinMoi)) throw loi_('PIN_DE_DOAN');
  const toiDa = soCH_('SO_LAN_SAI_PIN_TOI_DA', 5, 3, 20);
  const phut = soCH_('PHUT_KHOA_PIN', 15, 1, 1440);
  const soNgay = soNgayPhien_();
  return voiKhoa_(function () {
    const d = timTrongNguoiDung_(docBang_('NguoiDung', true), user.MaNV);
    if (!d || d.DaXoa) throw loi_('PHIEN_HET_HAN');
    const bayGio = new Date();
    kiemKhoaPin_(d, bayGio);
    if (!kiemTraPin_(pinCu, d.PinSalt, d.PinHash)) ghiSaiPin_(d, toiDa, phut, bayGio);
    const muoi = taoMuoi_();
    const tokenVer = (Number(d.TokenVer) || 0) + 1;
    ghiNhieu_('NguoiDung', [{
      MaNV: d.MaNV, PinHash: bamPin_(pinMoi, muoi), PinSalt: muoi, PhaiDoiPin: false, SaiPin: 0, KhoaDen: '', TokenVer: tokenVer
    }], { nguoi: user.MaNV });
    ghiNhatKy_(user, 'DOI_PIN', 'NguoiDung', user.MaNV, { TokenVer: [Number(d.TokenVer) || 0, tokenVer] }, ctx && ctx.clientId);
    const moi = Object.assign({}, user, { TokenVer: tokenVer, phaiDoiPin: false });
    const tk = taoToken_(moi, soNgay);
    return { token: tk.token, hetHan: tk.hetHan, hoSo: hoSo_(moi) };
  });
}

/** Đăng xuất mọi máy khác: tăng TokenVer, trả token mới cho máy đang dùng. */
function dangXuatMayKhac_(user, ctx) {
  return voiKhoa_(function () {
    const d = timTrongNguoiDung_(docBang_('NguoiDung', true), user.MaNV);
    if (!d || d.DaXoa) throw loi_('PHIEN_HET_HAN');
    const tokenVer = (Number(d.TokenVer) || 0) + 1;
    ghiNhieu_('NguoiDung', [{ MaNV: d.MaNV, TokenVer: tokenVer }], { nguoi: user.MaNV });
    ghiNhatKy_(user, 'DANG_XUAT_MAY_KHAC', 'NguoiDung', user.MaNV, { TokenVer: [Number(d.TokenVer) || 0, tokenVer] }, ctx && ctx.clientId);
    const tk = taoToken_(Object.assign({}, user, { TokenVer: tokenVer }), soNgayPhien_());
    return { token: tk.token, hetHan: tk.hetHan };
  });
}

/** Cấp PIN tạm cho người khác (quên PIN). Cấp 2 chỉ cho người cấp 3–5. PIN chỉ trả về một lần. */
function datLaiPin_(admin, maNV, ctx) {
  maNV = chuanMaNV_(maNV);
  if (!MA_NV_HOP_LE.test(maNV)) throw loi_('MA_NV_SAI_DANG');
  if (maNV === admin.MaNV) throw loi_('TU_DAT_LAI_PIN');
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const d = timTrongNguoiDung_(docBang_('NguoiDung', true), maNV);
    if (!d || d.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maNV });
    if (admin.Cap > 1 && taoNguoiDung_(d).Cap < 3) throw loi_('CAP_2_GIOI_HAN');
    const pin = taoPinTam_();
    const muoi = taoMuoi_();
    const tokenVer = (Number(d.TokenVer) || 0) + 1;
    ghiNhieu_('NguoiDung', [{
      MaNV: d.MaNV, PinHash: bamPin_(pin, muoi), PinSalt: muoi, PhaiDoiPin: true, SaiPin: 0, KhoaDen: '', TokenVer: tokenVer
    }], { nguoi: admin.MaNV });
    ghiNhatKy_(admin, 'DAT_LAI_PIN', 'NguoiDung', maNV, { TokenVer: [Number(d.TokenVer) || 0, tokenVer] }, ctx && ctx.clientId);
    return { maNV: maNV, hoTen: String(d.HoTen || ''), pinTam: pin };
  });
}

/**
 * Thêm hoặc sửa người dùng. Người mới được cấp PIN tạm (trả về một lần). Cấp 2 chỉ thêm, sửa người cấp 3–5
 * và không đổi cấp của chính mình. Luôn phải còn ít nhất một quản trị cấp 1 đang hoạt động.
 */
function luuNguoiDung_(admin, nd, ctx) {
  nd = nd && typeof nd === 'object' ? nd : {};
  const maNV = chuanMaNV_(nd.MaNV);
  if (!MA_NV_HOP_LE.test(maNV)) throw loi_('MA_NV_SAI_DANG');
  const o = { MaNV: maNV };
  if (nd.HoTen !== undefined) {
    o.HoTen = chu_(nd.HoTen, 60).replace(/\s+/g, ' ');
    if (!o.HoTen) throw loiTruong_('THIEU_TRUONG', 'HoTen');
  }
  if (nd.BoPhan !== undefined) o.BoPhan = maDanhMuc_('BO_PHAN', nd.BoPhan, 'BoPhan', false);
  if (nd.ChucVuVi !== undefined) o.ChucVuVi = chu_(nd.ChucVuVi, 80);
  if (nd.ChucVuZh !== undefined) o.ChucVuZh = chu_(nd.ChucVuZh, 80);
  if (nd.Cap !== undefined) {
    const c = Number(nd.Cap);
    if (!(c >= 1 && c <= 5 && Math.floor(c) === c)) throw loiTruong_('GIA_TRI_SAI', 'Cap', { giaTri: nd.Cap });
    o.Cap = c;
  }
  if (nd.QuyenThem !== undefined) {
    o.QuyenThem = boTrung_(tachDs_(nd.QuyenThem).map(function (x) { return maDanhMuc_('QUYEN_THEM', x, 'QuyenThem', true); })).join(',');
  }
  if (nd.TrangThai !== undefined) o.TrangThai = maDanhMuc_('TRANG_THAI_ND', nd.TrangThai, 'TrangThai', true);
  if (nd.moKhoa === true) {
    o.SaiPin = 0;
    o.KhoaDen = '';
  }
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('NguoiDung', true);
    const cu = timTrongNguoiDung_(b, maNV);
    const laMoi = !cu;
    const capCu = cu ? taoNguoiDung_(cu).Cap : null;
    const capMoi = o.Cap !== undefined ? o.Cap : capCu;
    if (admin.Cap > 1) {
      if (maNV === admin.MaNV) {
        if ((o.Cap !== undefined && o.Cap !== capCu) || o.TrangThai === 'NGUNG') throw loi_('CAP_2_GIOI_HAN');
      } else if ((cu && capCu < 3) || capMoi < 3) {
        throw loi_('CAP_2_GIOI_HAN');
      }
    }
    let pinTam = '';
    if (laMoi) {
      if (!o.HoTen) throw loiTruong_('THIEU_TRUONG', 'HoTen');
      if (o.Cap === undefined) throw loiTruong_('THIEU_TRUONG', 'Cap');
      pinTam = taoPinTam_();
      const muoi = taoMuoi_();
      Object.assign(o, {
        PinHash: bamPin_(pinTam, muoi), PinSalt: muoi, PhaiDoiPin: true, SaiPin: 0, KhoaDen: '', TokenVer: 1,
        TrangThai: o.TrangThai || 'HOAT_DONG', DaXoa: false
      });
    } else {
      if (nd.PhienBan !== undefined && nd.PhienBan !== null && nd.PhienBan !== '') o._phienBan = nd.PhienBan;
      if (cu.DaXoa) o.DaXoa = false;
      if (o.TrangThai === 'NGUNG' && String(cu.TrangThai) !== 'NGUNG') o.TokenVer = (Number(cu.TokenVer) || 0) + 1;
    }
    const sau = b.dong.map(function (d) { return d === cu ? Object.assign({}, d, o) : d; });
    if (laMoi) sau.push(o);
    const conQuanTri = sau.some(function (d) {
      return taoNguoiDung_(d).Cap === 1 && String(d.TrangThai || 'HOAT_DONG') !== 'NGUNG' && !d.DaXoa;
    });
    if (!conQuanTri) throw loi_('QUAN_TRI_CUOI');
    const kq = ghiNhieu_('NguoiDung', [o], { nguoi: admin.MaNV });
    if (kq.xungDot.length) throw loiXungDot_(kq.xungDot[0], maNV);
    const ghi = kq.them[0] || kq.sua[0] || kq.khongDoi[0];
    ghiNhatKy_(admin, laMoi ? 'THEM_NGUOI_DUNG' : 'SUA_NGUOI_DUNG', 'NguoiDung', maNV,
      boCotBiMat_(laMoi ? { sau: ghi.dong } : { truoc: ghi.truoc, sau: ghi.sau }), ctx && ctx.clientId);
    const kqTra = { maNV: maNV, laMoi: laMoi, phienBan: ghi.dong.PhienBan };
    if (pinTam) kqTra.pinTam = pinTam;
    return kqTra;
  });
}

/** Bỏ PinHash, PinSalt khỏi nội dung ghi nhật ký. */
function boCotBiMat_(o) {
  const sach = function (x) {
    if (!x || typeof x !== 'object') return x;
    const y = Object.assign({}, x);
    delete y.PinHash;
    delete y.PinSalt;
    delete y._so;
    delete y._i;
    return y;
  };
  return { truoc: sach(o.truoc), sau: sach(o.sau) };
}

// ───────────────────────── Đọc dữ liệu ─────────────────────────

let BO_NHO_ = {};           // bảng đã đọc trong lần chạy này (đã chuẩn hóa)
let THO_ = {};              // dữ liệu thô đọc trong khóa: { sh, tieuDe, giaTri, soDongCu, phien, chuan, chiMuc }
let MOC_BANG_ = null;       // mốc thay đổi của từng bảng (Script Properties "MOC|<bảng>")
let CAU_HINH_ = null;
let DANH_MUC_ = null;
let KHOA_DEM_ = 0;          // số tầng đang giữ khóa (cho phép gọi lồng nhau)
let KHOA_PHIEN_ = 0;        // tăng mỗi lần lấy khóa mới; dữ liệu thô chỉ dùng trong cùng phiên khóa
let NHAT_KY_CHO_ = [];      // dòng nhật ký chờ ghi khi nhả khóa
let CLIENT_ID_DA_GHI_ = {}; // clientId đã ghi trong lần chạy này

/** Bảng nhỏ, đọc nhiều: giữ trong CacheService 10 phút, khóa cache gồm mốc thay đổi nên ghi là tự làm mới. */
const BANG_CACHE = ['CauHinh', 'NguoiDung', 'TuDien', 'DanhMuc', 'MauThongSo', 'GhepCotKho', 'CongTo', 'BieuGia'];

/**
 * Đọc cả sheet một lần, trả { ten, def, cot, dong: [{ cột: giá trị, _so: số dòng, _i: vị trí }] }.
 * tuoi = true: đọc mới từ sheet (bắt buộc trước khi ghi; trong khóa thì dùng lại bản đọc cùng phiên khóa).
 * Bỏ dòng trống; cột chữ trả chuỗi, cột số trả số hoặc '', cột đúng/sai trả true/false hoặc ''.
 */
function docBang_(ten, tuoi) {
  if (KHOA_DEM_ > 0 && (tuoi || (THO_[ten] && THO_[ten].phien === KHOA_PHIEN_))) {
    const tho = layTho_(ten);
    if (!tho.chuan) tho.chuan = chuanHoaBang_(ten, tho);
    return tho.chuan;
  }
  if (!tuoi && BO_NHO_[ten]) return BO_NHO_[ten];
  const coCache = BANG_CACHE.indexOf(ten) >= 0;
  const khoaCache = coCache ? 'B|' + ten + '|' + mocBang_(ten) : '';
  let b = !tuoi && coCache ? docCache_(khoaCache) : null;
  if (b) {
    b.def = timBang_(ten);
  } else {
    b = chuanHoaBang_(ten, docTho_(ten));
    if (coCache) ghiCache_(khoaCache, { ten: b.ten, cot: b.cot, dong: b.dong });
  }
  BO_NHO_[ten] = b;
  return b;
}

function docTho_(ten) {
  const sh = moFile_().getSheetByName(ten);
  if (!sh) throw loi_('CAN_CAI_DAT');
  const tieuDe = docTieuDe_(sh);
  const n = sh.getLastRow();
  const giaTri = n >= 2 && tieuDe.length ? sh.getRange(2, 1, n - 1, tieuDe.length).getValues() : [];
  return { sh: sh, tieuDe: tieuDe, giaTri: giaTri, soDongCu: giaTri.length };
}

/** Dữ liệu thô trong khóa: đọc một lần mỗi phiên khóa, các lần ghi sau cập nhật thẳng vào đây. */
function layTho_(ten) {
  const t = THO_[ten];
  if (t && t.phien === KHOA_PHIEN_ && KHOA_DEM_ > 0) return t;
  const moi = docTho_(ten);
  moi.phien = KHOA_PHIEN_;
  THO_[ten] = moi;
  return moi;
}

function chuanHoaBang_(ten, tho) {
  const def = timBang_(ten);
  if (!def) throw new Error('Không có bảng ' + ten + ' trong CauTruc.gs');
  const cotDu = cotCuaBang_(def);
  const iCot = viTriCot_(tho.tieuDe);
  const cot = cotDu.filter(function (c) { return iCot[c] !== undefined; });
  const thieu = cotDu.filter(function (c) { return iCot[c] === undefined; });
  const dong = [];
  tho.giaTri.forEach(function (r, i) {
    if (dongTrong_(r)) return;
    const o = { _so: i + 2, _i: i };
    cot.forEach(function (c) { o[c] = chuanO_(def, c, r[iCot[c]]); });
    thieu.forEach(function (c) { o[c] = chuanO_(def, c, ''); });
    dong.push(o);
  });
  return { ten: ten, def: def, cot: cot, dong: dong };
}

function viTriCot_(tieuDe) {
  const m = {};
  tieuDe.forEach(function (c, i) {
    if (c && m[c] === undefined) m[c] = i;
  });
  return m;
}

function dongTrong_(r) {
  for (let i = 0; i < r.length; i++) {
    if (r[i] !== '' && r[i] !== null) return false;
  }
  return true;
}

/** Giá trị ô → giá trị chuẩn theo kiểu cột (bỏ dấu nháy chặn công thức, đổi ngày thành chuỗi). */
function chuanO_(def, c, v) {
  const k = kieuCot_(def, c);
  if (v === null || v === undefined) v = '';
  if (k === 'so') {
    if (v === '' || v instanceof Date || typeof v === 'boolean') return '';
    const n = typeof v === 'number' ? v : docSo_(v);
    return isFinite(n) ? n : '';
  }
  if (k === 'dung') {
    if (v === true || v === false) return v;
    const s = String(v).trim().toUpperCase();
    if (s === 'TRUE' || s === 'ĐÚNG' || s === '1') return true;
    if (s === 'FALSE' || s === 'SAI' || s === '0') return false;
    return c === 'DaXoa' ? false : '';
  }
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    return Utilities.formatDate(v, MUI_GIO, 'HH:mm:ss') === '00:00:00' ? Utilities.formatDate(v, MUI_GIO, 'yyyy-MM-dd') : bayGio_(v);
  }
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  let s = String(v);
  if (/^'[=+\-@]/.test(s)) s = s.slice(1);
  return s.trim();
}

/** Giá trị từ app → giá trị ghi vào ô (chữ được làm sạch và chặn công thức). */
function giaTriGhi_(def, c, v, toiDa) {
  const k = kieuCot_(def, c);
  if (v === null || v === undefined) return '';
  if (k === 'so') {
    if (v === '') return '';
    const n = typeof v === 'number' ? v : docSo_(v);
    return isFinite(n) ? n : '';
  }
  if (k === 'dung') {
    if (v === '') return c === 'DaXoa' ? false : '';
    return v === true || String(v).trim().toUpperCase() === 'TRUE';
  }
  return lamSach_(v, toiDa);
}

function giongNhau_(def, c, cu, moi) {
  const a = chuanO_(def, c, cu);
  const b = chuanO_(def, c, moi);
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  return a === b;
}

/** Ô chữ bắt đầu bằng = + - @ (kể cả dữ liệu cũ đọc ra) được chặn lại trước khi ghi trả. */
function baoVeO_(def, c, v) {
  return typeof v === 'string' && kieuCot_(def, c) === 'chu' ? chanCongThuc_(v) : v;
}

/** Chỉ mục theo một cột (đệm theo bảng đã đọc). chuanHoa: hàm chuẩn hóa khóa, VD chuanMaNV_. */
function layChiMuc_(b, cot, chuanHoa) {
  b._cm = b._cm || {};
  const k = cot + (chuanHoa ? '#c' : '');
  if (!b._cm[k]) {
    const m = Object.create(null);
    b.dong.forEach(function (d) {
      const v = chuanHoa ? chuanHoa(d[cot]) : String(d[cot]);
      if (v !== '' && !(v in m)) m[v] = d;
    });
    b._cm[k] = m;
  }
  return b._cm[k];
}

/** Tìm dòng theo khóa nhiều cột: timDong_(b, { MaTB: 'MNK-01', MaLK: 'VT-1' }). */
function timDong_(b, dk) {
  const cot = Object.keys(dk);
  if (cot.length === 1) return layChiMuc_(b, cot[0])[String(dk[cot[0]])] || null;
  for (let i = 0; i < b.dong.length; i++) {
    const d = b.dong[i];
    if (cot.every(function (c) { return String(d[c]) === String(dk[c]); })) return d;
  }
  return null;
}

// ───────────────────────── Ghi dữ liệu ─────────────────────────

/**
 * Chạy fn trong khóa của cả dự án (LockService), chờ tối đa 30 giây. Gọi lồng nhau được.
 * Khi nhả khóa: ghi nhật ký đang chờ, flush Sheets.
 */
function voiKhoa_(fn) {
  if (KHOA_DEM_ > 0) {
    KHOA_DEM_++;
    try {
      return fn();
    } finally {
      KHOA_DEM_--;
    }
  }
  const khoa = LockService.getScriptLock();
  if (!khoa.tryLock(30000)) throw loi_('MAY_CHU_BAN');
  KHOA_DEM_ = 1;
  KHOA_PHIEN_++;
  try {
    return fn();
  } finally {
    try {
      xaNhatKy_();
    } catch (e) {
      console.error('Không ghi được nhật ký: ' + e);
    }
    try {
      SpreadsheetApp.flush();
    } catch (e) {
      console.error('flush: ' + e);
    }
    KHOA_DEM_ = 0;
    khoa.releaseLock();
  }
}

/**
 * Thêm hoặc sửa nhiều dòng theo khóa của bảng (def.khoa) trong một lần, ghi theo khối, tự điền cột hệ thống.
 * Mỗi phần tử ds là { cột: giá trị } có đủ cột khóa; chỉ ghi cột có trong phần tử.
 *   _phienBan: PhienBan app đã thấy → khác bản hiện tại thì không ghi, trả trong xungDot.
 *   _i: sửa đúng dòng thứ _i của lần đọc trong khóa (dùng khi cần đổi cả cột khóa).
 * tc: { nguoi, chiThem, chiSua, toiDaChu }.
 * Trả { them, sua: [{ khoa, truoc, sau, dong }], khongDoi, xungDot }.
 */
function ghiNhieu_(ten, ds, tc) {
  tc = tc || {};
  const kq = { them: [], sua: [], khongDoi: [], xungDot: [] };
  if (!ds || !ds.length) return kq;
  return voiKhoa_(function () {
    const def = timBang_(ten);
    const tho = layTho_(ten);
    const tieuDe = tho.tieuDe;
    const iCot = viTriCot_(tieuDe);
    const cotChuan = cotCuaBang_(def);
    def.khoa.forEach(function (c) {
      if (iCot[c] === undefined) throw loi_('CAN_CAI_DAT');
    });
    const coHeThong = !def.chiGhiThem;
    if (coHeThong && (iCot.CapNhatLuc === undefined || iCot.PhienBan === undefined)) throw loi_('CAN_CAI_DAT');
    const giaTri = tho.giaTri;
    if (!tho.chiMuc) {
      tho.chiMuc = Object.create(null);
      if (def.khoa.length) {
        giaTri.forEach(function (r, i) {
          if (dongTrong_(r)) return;
          const k = khoaTuMang_(def, r, iCot);
          if (k && !(k in tho.chiMuc)) tho.chiMuc[k] = i;
        });
      }
    }
    const chiMuc = tho.chiMuc;
    const luc = bayGio_();
    const nguoi = tc.nguoi || NGUOI_HE_THONG;
    const ban = {};
    const ganGiaTri = function (r, o) {
      const truoc = {};
      const sau = {};
      let doi = false;
      Object.keys(o).forEach(function (c) {
        if (c.charAt(0) === '_' || iCot[c] === undefined || cotChuan.indexOf(c) < 0) return;
        if (c === 'CapNhatLuc' || c === 'CapNhatBoi' || c === 'PhienBan') return;
        const vMoi = giaTriGhi_(def, c, o[c], tc.toiDaChu);
        if (giongNhau_(def, c, r[iCot[c]], vMoi)) return;
        truoc[c] = chuanO_(def, c, r[iCot[c]]);
        sau[c] = chuanO_(def, c, vMoi);
        r[iCot[c]] = vMoi;
        doi = true;
      });
      return { doi: doi, truoc: truoc, sau: sau };
    };
    ds.forEach(function (o) {
      let i;
      let k = def.khoa.length ? khoaTuDoiTuong_(def, o) : '';
      if (o._i !== undefined) {
        i = Number(o._i);
        if (!(i >= 0 && i < giaTri.length) || dongTrong_(giaTri[i])) throw loi_('KHONG_TIM_THAY', { ma: ten });
      } else {
        if (def.khoa.length && !k) throw loi_('DU_LIEU_SAI');
        i = k ? chiMuc[k] : undefined;
      }
      if (i !== undefined) {
        if (tc.chiThem) throw loi_('TRUNG_MA', { ma: hienKhoa_(k) });
        const r = giaTri[i];
        if (coHeThong && o._phienBan !== undefined && o._phienBan !== null && o._phienBan !== '' &&
            (Number(r[iCot.PhienBan]) || 0) !== Number(o._phienBan)) {
          kq.xungDot.push({ khoa: k, dong: dongTuMang_(def, tieuDe, iCot, r, i) });
          return;
        }
        const kOld = def.khoa.length ? khoaTuMang_(def, r, iCot) : '';
        const g = ganGiaTri(r, o);
        if (g.doi) {
          if (coHeThong) {
            r[iCot.PhienBan] = (Number(r[iCot.PhienBan]) || 0) + 1;
            r[iCot.CapNhatLuc] = luc;
            if (iCot.CapNhatBoi !== undefined) r[iCot.CapNhatBoi] = nguoi;
            if (iCot.DaXoa !== undefined && (r[iCot.DaXoa] === '' || r[iCot.DaXoa] === null)) r[iCot.DaXoa] = false;
          }
          if (def.khoa.length) {
            const kNew = khoaTuMang_(def, r, iCot);
            if (kNew !== kOld) {
              if (chiMuc[kOld] === i) delete chiMuc[kOld];
              if (kNew) chiMuc[kNew] = i;
              k = kNew;
            }
          }
          ban[i] = true;
          kq.sua.push({ khoa: k, truoc: g.truoc, sau: g.sau, dong: dongTuMang_(def, tieuDe, iCot, r, i) });
        } else {
          kq.khongDoi.push({ khoa: k, dong: dongTuMang_(def, tieuDe, iCot, r, i) });
        }
      } else {
        if (tc.chiSua) throw loi_('KHONG_TIM_THAY', { ma: hienKhoa_(k) });
        const r = tieuDe.map(function () { return ''; });
        ganGiaTri(r, o);
        if (coHeThong) {
          r[iCot.CapNhatLuc] = luc;
          if (iCot.CapNhatBoi !== undefined) r[iCot.CapNhatBoi] = nguoi;
          r[iCot.PhienBan] = 1;
          if (iCot.DaXoa !== undefined && r[iCot.DaXoa] === '') r[iCot.DaXoa] = false;
        }
        const iMoi = giaTri.length;
        giaTri.push(r);
        if (k) chiMuc[k] = iMoi;
        ban[iMoi] = true;
        kq.them.push({ khoa: k, dong: dongTuMang_(def, tieuDe, iCot, r, iMoi) });
      }
    });
    const coGhi = Object.keys(ban).length > 0;
    if (coGhi) {
      ghiDongBan_(tho, def, ban);
      tho.chuan = null;
      if (tho._cm) tho._cm = null;
      delete BO_NHO_[ten];
      if (ten === 'CauHinh') CAU_HINH_ = null;
      if (ten === 'DanhMuc') DANH_MUC_ = null;
      danhDauBangDoi_(ten);
    }
    return kq;
  });
}

function khoaTuMang_(def, r, iCot) {
  const p = [];
  for (let j = 0; j < def.khoa.length; j++) {
    const c = def.khoa[j];
    const v = giaTriKhoa_(def, c, r[iCot[c]]);
    if (v === '') return '';
    p.push(v);
  }
  return p.join('\u0001');
}

function khoaTuDoiTuong_(def, o) {
  const p = [];
  for (let j = 0; j < def.khoa.length; j++) {
    const c = def.khoa[j];
    const v = giaTriKhoa_(def, c, o[c]);
    if (v === '') return '';
    p.push(v);
  }
  return p.join('\u0001');
}

function giaTriKhoa_(def, c, v) {
  if (c === 'MaNV') return chuanMaNV_(v);
  const s = chuanO_(def, c, v === undefined ? '' : v);
  return s === '' ? '' : String(s);
}

function hienKhoa_(k) {
  return String(k || '').split('\u0001').join(' · ');
}

function dongTuMang_(def, tieuDe, iCot, r, i) {
  const o = { _so: i + 2, _i: i };
  cotCuaBang_(def).forEach(function (c) {
    o[c] = chuanO_(def, c, iCot[c] === undefined ? '' : r[iCot[c]]);
  });
  return o;
}

/** Ghi các dòng đã đổi: dòng cũ theo từng đoạn liền nhau (quá 12 đoạn thì ghi một khối bao), dòng mới nối cuối. */
function ghiDongBan_(tho, def, ban) {
  const ds = Object.keys(ban).map(Number).sort(function (a, b) { return a - b; });
  const sh = tho.sh;
  const iCot = viTriCot_(tho.tieuDe);
  let soCot = 0;
  cotCuaBang_(def).forEach(function (c) {
    if (iCot[c] !== undefined && iCot[c] + 1 > soCot) soCot = iCot[c] + 1;
  });
  const cu = ds.filter(function (i) { return i < tho.soDongCu; });
  let doan = [];
  cu.forEach(function (i) {
    const d = doan[doan.length - 1];
    if (d && i === d[1] + 1) d[1] = i;
    else doan.push([i, i]);
  });
  if (doan.length > 12) doan = [[doan[0][0], doan[doan.length - 1][1]]];
  doan.forEach(function (d) {
    ghiKhoi_(sh, def, tho.tieuDe, d[0] + 2, tho.giaTri.slice(d[0], d[1] + 1), soCot);
  });
  if (tho.giaTri.length > tho.soDongCu) {
    const dau = tho.soDongCu;
    const can = tho.giaTri.length + 1;
    if (sh.getMaxRows() < can) sh.insertRowsAfter(sh.getMaxRows(), can - sh.getMaxRows());
    ghiKhoi_(sh, def, tho.tieuDe, dau + 2, tho.giaTri.slice(dau), soCot);
    tho.soDongCu = tho.giaTri.length;
  }
}

function ghiKhoi_(sh, def, tieuDe, dongDau, mang, soCot) {
  const n = mang.length;
  if (!n || !soCot) return;
  datDinhDangChu_(sh, def, tieuDe, dongDau, n, soCot);
  const ra = mang.map(function (r) {
    const x = [];
    for (let j = 0; j < soCot; j++) x.push(baoVeO_(def, tieuDe[j], r[j] === undefined ? '' : r[j]));
    return x;
  });
  sh.getRange(dongDau, 1, n, soCot).setValues(ra);
}

/** Đặt định dạng Văn bản thuần (@) cho cột chữ trước khi ghi: giữ số 0 đầu mã, giữ ngày giờ ISO. */
function datDinhDangChu_(sh, def, tieuDe, dongDau, n, soCot) {
  const cotChuan = cotCuaBang_(def);
  const vung = [];
  for (let j = 0; j < soCot; j++) {
    const c = tieuDe[j];
    if (c && cotChuan.indexOf(c) >= 0 && kieuCot_(def, c) === 'chu') {
      vung.push(chuCot_(j + 1) + dongDau + ':' + chuCot_(j + 1) + (dongDau + n - 1));
    }
  }
  if (vung.length) sh.getRangeList(vung).setNumberFormat('@');
}

/** Lỗi xung đột phiên bản (người khác vừa sửa). */
function loiXungDot_(xd, ma) {
  const d = xd.dong || {};
  const t = gioThamSo_(d.CapNhatLuc, 'luc');
  return loi_('XUNG_DOT', Object.assign({ ma: ma || hienKhoa_(xd.khoa), nguoi: tenNguoi_(d.CapNhatBoi), chiTiet: { dong: d } }, t));
}

// ───────────────────────── Nhật ký, mã, chống ghi trùng ─────────────────────────

/** Ghi vết một thay đổi (ghi thật khi nhả khóa). TruocSau không bao giờ chứa PIN. */
function ghiNhatKy_(user, hanhDong, bang, ma, truocSau, clientId) {
  const maNV = user && typeof user === 'object' ? user.MaNV : String(user || '');
  let ts = truocSau === undefined || truocSau === null ? '' : (typeof truocSau === 'string' ? truocSau : JSON.stringify(truocSau));
  if (ts.length > 40000) ts = ts.slice(0, 40000) + '…';
  NHAT_KY_CHO_.push({
    ThoiGian: bayGio_(), MaNV: maNV, HanhDong: hanhDong, Bang: bang || '',
    MaBanGhi: ma === undefined || ma === null ? '' : String(ma), TruocSau: ts, ClientId: clientId || ''
  });
  if (clientId) CLIENT_ID_DA_GHI_[clientId] = ma === undefined || ma === null ? '' : String(ma);
  if (KHOA_DEM_ === 0) voiKhoa_(function () {});
}

function xaNhatKy_() {
  if (!NHAT_KY_CHO_.length) return;
  const ds = NHAT_KY_CHO_;
  NHAT_KY_CHO_ = [];
  const def = timBang_('NhatKy');
  const sh = moFile_().getSheetByName('NhatKy');
  if (!sh) return;
  const tieuDe = docTieuDe_(sh);
  const mang = ds.map(function (o) {
    return tieuDe.map(function (c) { return c && o[c] !== undefined ? giaTriGhi_(def, c, o[c], 45000) : ''; });
  });
  const dau = sh.getLastRow() + 1;
  const can = dau + mang.length - 1;
  if (sh.getMaxRows() < can) sh.insertRowsAfter(sh.getMaxRows(), can - sh.getMaxRows());
  ghiKhoi_(sh, def, tieuDe, dau, mang, tieuDe.length);
  if (THO_.NhatKy) delete THO_.NhatKy;
}

/** Tìm clientId đã ghi (cột ClientId của NhatKy). Trả mã bản ghi đã tạo, chưa có trả null. */
function timClientId_(id) {
  if (!id) return null;
  if (Object.prototype.hasOwnProperty.call(CLIENT_ID_DA_GHI_, id)) return CLIENT_ID_DA_GHI_[id];
  const sh = moFile_().getSheetByName('NhatKy');
  if (!sh) return null;
  const n = sh.getLastRow();
  if (n < 2) return null;
  const tieuDe = docTieuDe_(sh);
  const c = tieuDe.indexOf('ClientId');
  const cm = tieuDe.indexOf('MaBanGhi');
  if (c < 0) return null;
  const o = sh.getRange(2, c + 1, n - 1, 1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext();
  if (!o) return null;
  const ma = cm >= 0 ? String(sh.getRange(o.getRow(), cm + 1).getValue()) : '';
  CLIENT_ID_DA_GHI_[id] = ma;
  return ma;
}

/** Gọi đầu đoạn ghi (trong khóa): clientId đã xử lý thì trả { daXuLy, ma } để hàm trả luôn. */
function trungClientId_(ctx) {
  if (!ctx || !ctx.clientId) return null;
  const ma = timClientId_(ctx.clientId);
  return ma === null ? null : { daXuLy: true, ma: ma };
}

/**
 * Cấp mã tăng dần, gọi trong khóa: taoMa_('CS', dsMaCo, true) → CS-2610-0001 (theo năm tháng),
 * taoMa_(TIEN_TO_MA_TAM, dsMaCo, false, 'TAM') → TẠM-0001. Bộ đếm lưu ở Script Properties "MA|…",
 * luôn lớn hơn số lớn nhất đang có trong bảng nên không trùng.
 */
function taoMa_(tienTo, dsMaCo, theoThang, khoaDem) {
  const goc = theoThang ? tienTo + '-' + Utilities.formatDate(new Date(), MUI_GIO, 'yyMM') : tienTo;
  const dau = goc + '-';
  const props = PropertiesService.getScriptProperties();
  const khoa = 'MA|' + (khoaDem || tienTo) + (theoThang ? goc.slice(tienTo.length) : '');
  let lonNhat = parseInt(props.getProperty(khoa), 10) || 0;
  const co = Object.create(null);
  (dsMaCo || []).forEach(function (m) {
    m = String(m);
    if (m.indexOf(dau) !== 0) return;
    co[m] = true;
    const x = parseInt(m.slice(dau.length), 10);
    if (x > lonNhat) lonNhat = x;
  });
  let so = lonNhat + 1;
  let ma = dau + (so < 10000 ? ('000' + so).slice(-4) : String(so));
  while (co[ma]) {
    so++;
    ma = dau + (so < 10000 ? ('000' + so).slice(-4) : String(so));
  }
  props.setProperty(khoa, String(so));
  return ma;
}

// ───────────────────────── Mốc thay đổi, bộ nhớ đệm, cấu hình ─────────────────────────

/** Mốc thay đổi của bảng: "giờ ISO|ngẫu nhiên", đổi mỗi lần bảng được ghi (kể cả sửa tay qua onEdit). */
function mocBang_(ten) {
  if (!MOC_BANG_) {
    MOC_BANG_ = {};
    const p = PropertiesService.getScriptProperties().getProperties();
    Object.keys(p).forEach(function (k) {
      if (k.indexOf('MOC|') === 0) MOC_BANG_[k.slice(4)] = p[k];
    });
  }
  return MOC_BANG_[ten] || '';
}

/** Đánh dấu bảng vừa đổi: bộ nhớ đệm của bảng hết hiệu lực, lần đồng bộ sau app nhận dòng mới. */
function danhDauBangDoi_(ten) {
  const v = bayGio_() + '|' + Math.random().toString(36).slice(2, 8);
  PropertiesService.getScriptProperties().setProperty('MOC|' + ten, v);
  if (MOC_BANG_) MOC_BANG_[ten] = v;
  delete BO_NHO_[ten];
}

function docCache_(khoa) {
  try {
    const s = CacheService.getScriptCache().get(khoa);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

function ghiCache_(khoa, o) {
  try {
    const s = JSON.stringify(o);
    if (doDaiByte_(s) <= 98000) CacheService.getScriptCache().put(khoa, s, GIAY_CACHE);
  } catch (e) {
    console.warn('Không ghi được bộ nhớ đệm: ' + e);
  }
}

function doDaiByte_(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    n += c < 0x80 ? 1 : (c < 0x800 ? 2 : (c >= 0xD800 && c <= 0xDBFF ? 2 : 3));
  }
  return n;
}

/** CauHinh dạng { Khoa: 'GiaTri' }. */
function cauHinh_() {
  if (!CAU_HINH_) {
    const m = {};
    docBang_('CauHinh').dong.forEach(function (d) {
      if (d.Khoa) m[String(d.Khoa).trim()] = d.GiaTri === undefined || d.GiaTri === null ? '' : String(d.GiaTri);
    });
    CAU_HINH_ = m;
  }
  return CAU_HINH_;
}

/** Số trong CauHinh (đọc được "7,5" và "7.5"), ngoài khoảng thì kẹp lại, trống dùng mặc định. */
function soCH_(khoa, macDinh, min, max) {
  const n = docSo_(cauHinh_()[khoa]);
  let v = isNaN(n) ? macDinh : n;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function cauHinhCongKhai_() {
  const ch = cauHinh_();
  const o = {};
  CAU_HINH_CONG_KHAI.forEach(function (k) { o[k] = ch[k] === undefined ? '' : ch[k]; });
  return o;
}

/** Danh mục theo loại: { Ma: dòng }, gồm cả mã đã tắt (dữ liệu cũ vẫn hợp lệ). */
function danhMucTheoLoai_(loai) {
  if (!DANH_MUC_) {
    DANH_MUC_ = Object.create(null);
    docBang_('DanhMuc').dong.forEach(function (d) {
      if (d.DaXoa || !d.Loai || !d.Ma) return;
      const l = DANH_MUC_[d.Loai] || (DANH_MUC_[d.Loai] = Object.create(null));
      l[d.Ma] = d;
    });
  }
  return DANH_MUC_[loai] || Object.create(null);
}

/** Mã danh mục hợp lệ (trống → '' nếu không bắt buộc). */
function maDanhMuc_(loai, v, truong, batBuoc) {
  const s = chu_(v, 60);
  if (!s) {
    if (batBuoc) throw loiTruong_('THIEU_TRUONG', truong);
    return '';
  }
  const m = danhMucTheoLoai_(loai);
  if (m[s]) return s;
  if (m[s.toUpperCase()]) return s.toUpperCase();
  throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', truong, { giaTri: s });
}

/** Đơn vị tính: nhận mã danh mục DVT (lưu tên Việt, VD "cái") hoặc chữ tự do ngắn. */
function dvt_(v) {
  const s = chu_(v, 20);
  if (!s) return '';
  const m = danhMucTheoLoai_('DVT');
  const d = m[s] || m[s.toUpperCase()];
  return d ? String(d.TenVi) : s;
}

// ───────────────────────── Đồng bộ ─────────────────────────

/**
 * Bảng gửi xuống app. cot: chỉ gửi các cột này (NguoiDung không bao giờ gửi PinHash, PinSalt, TokenVer);
 * anCot: cột cần quyền mới gửi; quyen: cả bảng cần quyền; cuaSo: chỉ số tải lần đầu theo cửa sổ ngày.
 * Bảng đợt 2 (sửa chữa, bảo trì) sẽ thêm vào đây và tăng PHIEN_BAN_DONG_BO.
 */
const DONG_BO = [
  { ten: 'NguoiDung', cot: ['MaNV', 'HoTen', 'BoPhan', 'ChucVuVi', 'ChucVuZh', 'Cap', 'TrangThai'],
    cotQuanTri: ['QuyenThem', 'PhaiDoiPin', 'SaiPin', 'KhoaDen'] },
  { ten: 'TuDien' },
  { ten: 'DanhMuc' },
  { ten: 'ThietBi' },
  { ten: 'MauThongSo' },
  { ten: 'ThongSoTB' },
  { ten: 'LinhKienTB' },
  { ten: 'KhoLinhKien', anCot: { DonGia: 'XEM_DON_GIA' } },
  { ten: 'LanNhapKho' },
  { ten: 'GhepCotKho' },
  { ten: 'CongTo' },
  { ten: 'ChiSo', cuaSo: true },
  { ten: 'BieuGia', quyen: 'QUAN_LY_DIEN_NUOC' }
];

/** Một lần gọi trả hồ sơ, quyền, cấu hình và dữ liệu các bảng (dạng cột + mảng dòng cho gọn). */
function taiBanDau_(user) {
  const batDau = new Date();
  const bang = {};
  DONG_BO.forEach(function (cfg) {
    if (cfg.quyen && !coQuyen_(user, cfg.quyen)) return;
    const b = docBang_(cfg.ten);
    let dong = b.dong.filter(function (d) { return !d.DaXoa; });
    if (cfg.cuaSo) dong = locCuaSoChiSo_(dong);
    bang[cfg.ten] = goiBang_(cfg, user, b, dong);
  });
  return { moc: taoMoc_(user, batDau), hoSo: hoSo_(user), cauHinh: cauHinhCongKhai_(), bang: bang, taiLai: false };
}

/**
 * Chỉ trả các dòng đổi sau mốc (gồm dòng xóa mềm, app tự bỏ). Bảng không đổi từ mốc thì không đọc
 * (mốc cũ hơn 6 giờ thì vẫn quét hết các bảng, phòng khi sửa tay trong file mà mốc bảng chưa kịp đổi).
 * Mốc sai, cũ hơn 7 ngày, khác phiên bản đồng bộ hay cấp người dùng đã đổi → { taiLai: true }, app gọi taiBanDau.
 */
function dongBo_(user, moc) {
  const m = docMoc_(moc);
  const bayGio = new Date();
  if (!m || m.ver !== PHIEN_BAN_DONG_BO || m.cap !== user.Cap || m.luc > bayGio_(bayGio) ||
      m.luc < bayGio_(new Date(bayGio.getTime() - NGAY_TAI_LAI * 86400000))) {
    return { taiLai: true };
  }
  const quetHet = m.luc < bayGio_(new Date(bayGio.getTime() - 6 * 3600000));
  const bang = {};
  DONG_BO.forEach(function (cfg) {
    if (cfg.quyen && !coQuyen_(user, cfg.quyen)) return;
    const mk = mocBang_(cfg.ten);
    if (!quetHet && mk && mk.split('|')[0] < m.luc) return;
    const b = docBang_(cfg.ten);
    const dong = b.dong.filter(function (d) { return String(d.CapNhatLuc) > m.luc; });
    if (dong.length) bang[cfg.ten] = goiBang_(cfg, user, b, dong);
  });
  return { moc: taoMoc_(user, bayGio), hoSo: hoSo_(user), cauHinh: cauHinhCongKhai_(), bang: bang, taiLai: false };
}

function taoMoc_(user, luc) {
  return 'm|' + PHIEN_BAN_DONG_BO + '|' + user.Cap + '|' + bayGio_(new Date(luc.getTime() - PHUT_LUI_MOC * 60000));
}

function docMoc_(s) {
  const p = String(s || '').split('|');
  if (p.length !== 4 || p[0] !== 'm' || !/^\d{4}-\d{2}-\d{2}T/.test(p[3])) return null;
  return { ver: Number(p[1]), cap: Number(p[2]), luc: p[3] };
}

function cotDongBo_(cfg, user, b) {
  let cot;
  if (cfg.cot) {
    cot = cfg.cot.concat(coQuyen_(user, 'NGUOI_DUNG') ? cfg.cotQuanTri || [] : []).concat(COT_HE_THONG);
  } else {
    cot = cotCuaBang_(b.def).slice();
  }
  if (cfg.anCot) {
    cot = cot.filter(function (c) { return !cfg.anCot[c] || coQuyen_(user, cfg.anCot[c]); });
  }
  return cot;
}

function goiBang_(cfg, user, b, dong) {
  const cot = cotDongBo_(cfg, user, b);
  return {
    khoa: b.def.khoa,
    cot: cot,
    dong: dong.map(function (d) { return cot.map(function (c) { return d[c] === undefined ? '' : d[c]; }); })
  };
}

/** Chỉ số tải lần đầu: 62 ngày gần nhất và lần ghi cuối của mỗi công tơ (để tính tiêu thụ khi mất mạng). */
function locCuaSoChiSo_(dong) {
  const tu = congNgay_(homNay_(), -NGAY_CHI_SO_TAI_DAU);
  const cuoi = Object.create(null);
  dong.forEach(function (d) {
    const c = cuoi[d.MaCT];
    if (!c || soSanhChiSo_(d, c) > 0) cuoi[d.MaCT] = d;
  });
  return dong.filter(function (d) { return String(d.NgayTinh) >= tu || cuoi[d.MaCT] === d; });
}

/**
 * Hàng chờ khi mất mạng: xử lý lần lượt từng thao tác { clientId, action, data }, mỗi thao tác một kết quả.
 * clientId đã ghi thì trả { daXuLy: true }. Quá 4 phút thì các thao tác còn lại trả lỗi HET_THOI_GIAN để app gửi lại.
 */
function guiHangDoi_(user, thaoTac) {
  if (!Array.isArray(thaoTac)) throw loi_('DU_LIEU_SAI');
  if (thaoTac.length > 200) throw loi_('QUA_NHIEU', { toiDa: 200 });
  const batDau = Date.now();
  const daGap = {};
  const ketQua = thaoTac.map(function (op) {
    const id = op && typeof op === 'object' ? chuanClientId_(op.clientId) : '';
    const kq = { clientId: op && op.clientId ? String(op.clientId) : '' };
    try {
      if (!id) throw loi_('DU_LIEU_SAI');
      if (daGap[id]) return Object.assign({}, daGap[id], { clientId: kq.clientId });
      if (Date.now() - batDau > GIAY_TOI_DA_HANG_DOI * 1000) {
        kq.ok = false;
        kq.loi = { ma: 'HET_THOI_GIAN', vi: 'Hết thời gian xử lý, app sẽ gửi lại.', zh: '处理超时，应用将重新发送。' };
        kq.thuLai = true;
        return kq;
      }
      const action = String(op.action || '');
      if (!Object.prototype.hasOwnProperty.call(HANH_DONG, action) || !HANH_DONG[action].hangDoi) {
        throw loi_('KHONG_XEP_HANG_DOI', { action: action.slice(0, 40) });
      }
      const data = op.data && typeof op.data === 'object' && !Array.isArray(op.data) ? op.data : {};
      kq.ok = true;
      kq.data = route_(action, user, data, { action: action, clientId: id, tuHangDoi: true });
    } catch (e) {
      kq.ok = false;
      kq.loi = loiTraVe_(e);
      kq.thuLai = !!(e && e.laLoiME && e.ma === 'MAY_CHU_BAN');
    }
    if (id) daGap[id] = kq;
    return kq;
  });
  return { ketQua: ketQua };
}

// ───────────────────────── Thiết bị ─────────────────────────

/** Lưu hồ sơ máy và các dòng thông số cùng lúc. Thêm mới khi mã chưa có; sửa thì so PhienBan nếu app gửi. */
function luuThietBi_(user, tb, thongSo, ctx) {
  tb = tb && typeof tb === 'object' ? tb : {};
  thongSo = Array.isArray(thongSo) ? thongSo : [];
  if (thongSo.length > 200) throw loi_('QUA_NHIEU', { toiDa: 200 });
  const maTB = chuanMa_(tb.MaTB);
  if (!MA_HOP_LE.test(maTB)) throw loi_('MA_KHONG_HOP_LE', { ma: tb.MaTB === undefined ? '' : String(tb.MaTB) });
  const o = { MaTB: maTB };
  const chuDai = { TenVi: 200, TenZh: 200, ViTri: 200, HangSX: 100, Model: 100, SoSeri: 100, TaiLieuUrl: 1000, GhiChu: 2000 };
  Object.keys(chuDai).forEach(function (c) {
    if (tb[c] !== undefined) o[c] = chu_(tb[c], chuDai[c]);
  });
  if (o.TenVi !== undefined && !o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
  if (tb.LoaiTB !== undefined) o.LoaiTB = maDanhMuc_('LOAI_TB', tb.LoaiTB, 'LoaiTB', true);
  if (tb.KhuVuc !== undefined) o.KhuVuc = maDanhMuc_('KHU_VUC', tb.KhuVuc, 'KhuVuc', false);
  if (tb.TrangThai !== undefined) o.TrangThai = maDanhMuc_('TRANG_THAI_TB', tb.TrangThai, 'TrangThai', true);
  if (tb.MucQuanTrong !== undefined) o.MucQuanTrong = maDanhMuc_('MUC_QUAN_TRONG', tb.MucQuanTrong, 'MucQuanTrong', false);
  if (tb.NamSX !== undefined) {
    const nam = String(tb.NamSX).trim() === '' ? '' : docSo_(tb.NamSX);
    if (nam !== '' && !(nam >= 1900 && nam <= new Date().getFullYear() + 1 && Math.floor(nam) === nam)) {
      throw loiTruong_('GIA_TRI_SAI', 'NamSX', { giaTri: tb.NamSX });
    }
    o.NamSX = nam;
  }
  if (tb.NgayDuaVaoSD !== undefined) o.NgayDuaVaoSD = chuanNgay_(tb.NgayDuaVaoSD, 'NgayDuaVaoSD', false);
  if (tb.NguoiPhuTrach !== undefined) {
    o.NguoiPhuTrach = chuanMaNV_(tb.NguoiPhuTrach);
    if (o.NguoiPhuTrach && !timNguoiDung_(o.NguoiPhuTrach)) throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', 'NguoiPhuTrach', { giaTri: o.NguoiPhuTrach });
  }
  if (tb.MaTBCha !== undefined) o.MaTBCha = chuanMa_(tb.MaTBCha);
  if (tb.AnhId !== undefined) o.AnhId = kiemAnhId_(tb.AnhId);
  let anhMoi = null;
  if (tb.anh) anhMoi = luuAnhFile_(tb.anh, 'THIET_BI', maTB);
  if (anhMoi) o.AnhId = anhMoi.anhId;
  try {
    return voiKhoa_(function () {
      const trung = trungClientId_(ctx);
      if (trung) {
        boAnh_(anhMoi);
        return trung;
      }
      const bTB = docBang_('ThietBi', true);
      const cu = timDong_(bTB, { MaTB: maTB });
      if (cu && cu.DaXoa) throw loi_('MA_DA_XOA', { ma: maTB });
      const laMoi = !cu;
      if (!laMoi && tb.laMoi === true) throw loi_('TRUNG_MA', { ma: maTB });
      if (laMoi) {
        if (!o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
        if (!o.LoaiTB) throw loiTruong_('THIEU_TRUONG', 'LoaiTB');
        if (o.TrangThai === undefined) o.TrangThai = 'DANG_CHAY';
        o.DaXoa = false;
      } else if (tb.PhienBan !== undefined && tb.PhienBan !== null && tb.PhienBan !== '') {
        o._phienBan = tb.PhienBan;
      }
      if (o.MaTBCha) {
        const cha = timDong_(bTB, { MaTB: o.MaTBCha });
        if (!cha || cha.DaXoa) throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', 'MaTBCha', { giaTri: o.MaTBCha });
        if (taoVongCha_(bTB.dong, 'MaTB', 'MaTBCha', maTB, o.MaTBCha)) throw loiTruong_('VONG_LAP_CHA', 'MaTBCha');
      }
      // Kiểm hết thông số trước khi ghi gì (lỗi thì không để lại máy ghi dở).
      const dsTS = chuanThongSo_(maTB, o.LoaiTB || cu.LoaiTB, thongSo, laMoi);
      const kqTB = ghiNhieu_('ThietBi', [o], { nguoi: user.MaNV });
      if (kqTB.xungDot.length) throw loiXungDot_(kqTB.xungDot[0], maTB);
      const dongTB = (kqTB.them[0] || kqTB.sua[0] || kqTB.khongDoi[0]).dong;
      const kqTS = dsTS.length ? ghiNhieu_('ThongSoTB', dsTS, { nguoi: user.MaNV }) : { them: [], sua: [] };
      ghiNhatKy_(user, laMoi ? 'THEM_THIET_BI' : 'SUA_THIET_BI', 'ThietBi', maTB, {
        truoc: laMoi ? null : (kqTB.sua[0] ? kqTB.sua[0].truoc : {}),
        sau: laMoi ? boCotNoiBo_(dongTB) : (kqTB.sua[0] ? kqTB.sua[0].sau : {}),
        thongSo: kqTS.them.concat(kqTS.sua).map(function (x) { return x.dong.MaTS + '=' + x.dong.GiaTri + (x.dong.DaXoa ? ' (xóa)' : ''); })
      }, ctx && ctx.clientId);
      return { maTB: maTB, laMoi: laMoi, phienBan: dongTB.PhienBan, anhId: dongTB.AnhId, soThongSoDoi: kqTS.them.length + kqTS.sua.length };
    });
  } catch (e) {
    boAnh_(anhMoi);
    throw e;
  }
}

/** Kiểm và chuẩn hóa thông số theo mẫu của loại máy. Máy mới phải có đủ thông số bắt buộc. */
function chuanThongSo_(maTB, loaiTB, ds, laMoi) {
  const mau = docBang_('MauThongSo').dong.filter(function (d) { return d.LoaiTB === loaiTB && !d.DaXoa; });
  const theoMa = Object.create(null);
  mau.forEach(function (m) { theoMa[m.MaTS] = m; });
  const ra = [];
  const daCo = Object.create(null);
  ds.forEach(function (x, i) {
    if (!x || typeof x !== 'object') return;
    const maTS = chuanMa_(x.MaTS);
    if (!MA_DANH_MUC_HOP_LE.test(maTS)) throw loi_('MA_KHONG_HOP_LE', { ma: x.MaTS === undefined ? '' : String(x.MaTS) });
    if (daCo[maTS]) return;
    daCo[maTS] = true;
    const m = theoMa[maTS];
    const o = { MaTB: maTB, MaTS: maTS };
    if (x.xoa === true) {
      o.DaXoa = true;
      ra.push(o);
      return;
    }
    o.DaXoa = false;
    const kieu = m ? String(m.KieuDL || 'CHU') : 'CHU';
    const ten = m ? { truong: m.TenVi, truongZh: m.TenZh || m.TenVi } : { truong: maTS, truongZh: maTS };
    let gt = x.GiaTri === undefined || x.GiaTri === null ? '' : x.GiaTri;
    if (String(gt).trim() === '') {
      gt = '';
    } else if (kieu === 'SO') {
      const n = docSo_(gt);
      if (isNaN(n)) throw loi_('GIA_TRI_SAI', Object.assign({ giaTri: String(gt) }, ten));
      gt = String(n);
    } else if (kieu === 'CHON') {
      gt = chu_(gt, 60);
      const dm = danhMucTheoLoai_(maTS);
      if (!dm[gt] && dm[gt.toUpperCase()]) gt = gt.toUpperCase();
      if (!dm[gt]) throw loi_('KHONG_CO_TRONG_DANH_MUC', Object.assign({ giaTri: gt }, ten));
    } else {
      gt = chu_(gt, 500);
    }
    if (m && laDung_(m.BatBuoc) && gt === '') throw loi_('THIEU_THONG_SO', { ds: m.TenVi, dsZh: m.TenZh || m.TenVi });
    o.GiaTri = gt;
    if (m) {
      o.TenVi = m.TenVi;
      o.TenZh = m.TenZh;
      o.Nhom = m.Nhom;
      o.DonVi = m.DonVi;
      o.ThuTu = m.ThuTu;
    } else {
      o.TenVi = chu_(x.TenVi, 120);
      if (!o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
      o.TenZh = chu_(x.TenZh, 120);
      o.Nhom = x.Nhom ? maDanhMuc_('NHOM_TS', x.Nhom, 'Nhom', false) : 'VAN_HANH';
      o.DonVi = chu_(x.DonVi, 30);
      const tt = docSo_(x.ThuTu);
      o.ThuTu = isNaN(tt) ? 900 + i : tt;
    }
    ra.push(o);
  });
  if (laMoi) {
    const thieu = mau.filter(function (m) {
      return laDung_(m.BatBuoc) && !ra.some(function (o) { return o.MaTS === m.MaTS && !o.DaXoa && o.GiaTri !== ''; });
    });
    if (thieu.length) {
      throw loi_('THIEU_THONG_SO', {
        ds: thieu.map(function (m) { return m.TenVi; }).join(', '),
        dsZh: thieu.map(function (m) { return m.TenZh || m.TenVi; }).join('、')
      });
    }
  }
  return ra;
}

/** Xóa mềm thiết bị (thông số và linh kiện của máy giữ nguyên để khôi phục được). */
function xoaThietBi_(user, maTB, ctx) {
  maTB = chuanMa_(maTB);
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const cu = timDong_(docBang_('ThietBi', true), { MaTB: maTB });
    if (!cu || cu.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maTB });
    ghiNhieu_('ThietBi', [{ MaTB: maTB, DaXoa: true }], { nguoi: user.MaNV, chiSua: true });
    ghiNhatKy_(user, 'XOA_THIET_BI', 'ThietBi', maTB, { truoc: { DaXoa: false }, sau: { DaXoa: true } }, ctx && ctx.clientId);
    return { maTB: maTB };
  });
}

/**
 * Gắn, sửa, bỏ linh kiện lắp trên máy (mỗi phần tử một linh kiện, xoa: true để bỏ).
 * Cấp 1–3: ghi thẳng, đã duyệt (gửi lại một đề xuất là duyệt nó). Cấp 4: chỉ thêm đề xuất mới, chờ duyệt.
 */
function luuLinhKienTB_(user, maTB, ds, ctx) {
  maTB = chuanMa_(maTB);
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  if (ds.length > 200) throw loi_('QUA_NHIEU', { toiDa: 200 });
  const duocDuyet = coQuyen_(user, 'GAN_LINH_KIEN');
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const tb = timDong_(docBang_('ThietBi', true), { MaTB: maTB });
    if (!tb || tb.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maTB });
    const kho = docBang_('KhoLinhKien', true);
    const bLK = docBang_('LinhKienTB', true);
    const ra = [];
    let choDuyet = 0;
    ds.forEach(function (x) {
      if (!x || typeof x !== 'object') return;
      const maLK = chuanMaLK_(x.MaLK);
      const lk = timDong_(kho, { MaLK: maLK });
      if (!lk || lk.DaXoa) throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', 'MaLK', { giaTri: maLK });
      const cu = timDong_(bLK, { MaTB: maTB, MaLK: maLK });
      const conDung = cu && !cu.DaXoa;
      if (!duocDuyet) {
        const deXuatCuaMinh = conDung && cu.TrangThaiDuyet === 'CHO_DUYET' && cu.CapNhatBoi === user.MaNV;
        if (x.xoa === true || (conDung && !deXuatCuaMinh)) throw loi_('KHONG_DU_QUYEN');
      }
      const o = { MaTB: maTB, MaLK: maLK };
      if (x.xoa === true) {
        o.DaXoa = true;
        ra.push(o);
        return;
      }
      o.DaXoa = false;
      o.TrangThaiDuyet = duocDuyet ? 'DA_DUYET' : 'CHO_DUYET';
      if (!duocDuyet) choDuyet++;
      if (x.ViTriLapVi !== undefined) o.ViTriLapVi = chu_(x.ViTriLapVi, 200);
      if (x.ViTriLapZh !== undefined) o.ViTriLapZh = chu_(x.ViTriLapZh, 200);
      if (x.SoLuongLap !== undefined || !conDung) {
        const sl = x.SoLuongLap === undefined || String(x.SoLuongLap).trim() === '' ? 1 : docSo_(x.SoLuongLap);
        if (!(sl > 0)) throw loiTruong_('GIA_TRI_SAI', 'SoLuongLap', { giaTri: x.SoLuongLap });
        o.SoLuongLap = sl;
      }
      if (x.ChuKyThay !== undefined) {
        const ck = String(x.ChuKyThay).trim() === '' ? '' : docSo_(x.ChuKyThay);
        if (ck !== '' && !(ck > 0)) throw loiTruong_('GIA_TRI_SAI', 'ChuKyThay', { giaTri: x.ChuKyThay });
        o.ChuKyThay = ck;
      }
      if (x.DonViChuKy !== undefined) o.DonViChuKy = maDanhMuc_('DON_VI_CHU_KY', x.DonViChuKy, 'DonViChuKy', false);
      if (x.LanThayCuoi !== undefined) o.LanThayCuoi = chuanNgay_(x.LanThayCuoi, 'LanThayCuoi', false);
      if (x.GhiChu !== undefined) o.GhiChu = chu_(x.GhiChu, 1000);
      ra.push(o);
    });
    const kq = ghiNhieu_('LinhKienTB', ra, { nguoi: user.MaNV });
    ghiNhatKy_(user, duocDuyet ? 'GAN_LINH_KIEN' : 'DE_XUAT_LINH_KIEN', 'LinhKienTB', maTB, {
      doi: kq.them.concat(kq.sua).map(function (x) { return x.dong.MaLK + (x.dong.DaXoa ? ' (bỏ)' : ''); })
    }, ctx && ctx.clientId);
    return { maTB: maTB, them: kq.them.length, sua: kq.sua.length, choDuyet: choDuyet };
  });
}

/** Cha – con tạo vòng lặp? (ma nhận cha mới; đi ngược lên từ cha mà gặp lại ma là vòng lặp). */
function taoVongCha_(dong, cotMa, cotCha, ma, cha) {
  const theoMa = Object.create(null);
  dong.forEach(function (d) { theoMa[d[cotMa]] = d; });
  let hienTai = cha;
  const daQua = Object.create(null);
  while (hienTai) {
    if (hienTai === ma) return true;
    if (daQua[hienTai]) return true;
    daQua[hienTai] = true;
    const d = theoMa[hienTai];
    hienTai = d ? d[cotCha] : '';
  }
  return false;
}

// ───────────────────────── Kho linh kiện ─────────────────────────

/**
 * Thêm linh kiện mới (thêm tay). Để trống mã thì cấp mã tạm TẠM-0001. Cấp 1–3 thêm thẳng, cấp 4 chờ duyệt.
 * Trùng mã nhà sản xuất hoặc trùng tên + quy cách thì hỏi xác nhận (lk.xacNhan = true để vẫn thêm).
 * lk.dsMaTB: gắn luôn linh kiện vào các máy này.
 */
function themLinhKien_(user, lk, ctx) {
  lk = lk && typeof lk === 'object' ? lk : {};
  const o = {
    TenVi: chu_(lk.TenVi, 200), TenZh: chu_(lk.TenZh, 200), QuyCach: chu_(lk.QuyCach, 200), DVT: dvt_(lk.DVT),
    NhomLK: maDanhMuc_('NHOM_LK', lk.NhomLK, 'NhomLK', false), MaNSX: chu_(lk.MaNSX, 100), ViTriKho: chu_(lk.ViTriKho, 60),
    GhiChu: chu_(lk.GhiChu, 1000), DichMay: lk.dichMay === true, Nguon: 'THU_CONG', TrangThaiFile: '',
    TrangThaiDuyet: user.Cap <= 3 ? 'DA_DUYET' : 'CHO_DUYET', DaXoa: false
  };
  if (!o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
  if (!o.TenZh) throw loiTruong_('THIEU_TRUONG', 'TenZh');
  if (lk.TonToiThieu !== undefined && String(lk.TonToiThieu).trim() !== '') {
    const t = docSo_(lk.TonToiThieu);
    if (!(t >= 0)) throw loiTruong_('GIA_TRI_SAI', 'TonToiThieu', { giaTri: lk.TonToiThieu });
    o.TonToiThieu = t;
  }
  let maLK = chuanMaLK_(lk.MaLK);
  if (maLK && (maLK.length > 50 || maLK.toUpperCase().indexOf(TIEN_TO_MA_TAM + '-') === 0 || /^TAM-/i.test(maLK))) {
    throw loi_('MA_KHONG_HOP_LE', { ma: maLK });
  }
  const dsMaTB = boTrung_((Array.isArray(lk.dsMaTB) ? lk.dsMaTB : []).map(chuanMa_).filter(String)).slice(0, 50);
  if (lk.AnhId !== undefined) o.AnhId = kiemAnhId_(lk.AnhId);
  let anhMoi = null;
  if (lk.anh) anhMoi = luuAnhFile_(lk.anh, 'LINH_KIEN', maLK || 'moi');
  if (anhMoi) o.AnhId = anhMoi.anhId;
  try {
    return voiKhoa_(function () {
      const trung = trungClientId_(ctx);
      if (trung) {
        boAnh_(anhMoi);
        return trung;
      }
      const kho = docBang_('KhoLinhKien', true);
      if (maLK) {
        const cu = timDong_(kho, { MaLK: maLK });
        if (cu && cu.DaXoa) throw loi_('MA_DA_XOA', { ma: maLK });
        if (cu) throw loi_('TRUNG_MA', { ma: maLK });
      }
      if (!lk.xacNhan) {
        const conDung = kho.dong.filter(function (d) { return !d.DaXoa; });
        if (o.MaNSX) {
          const nsx = chuanSoSanh_(o.MaNSX);
          const cung = conDung.filter(function (d) { return d.MaNSX && chuanSoSanh_(d.MaNSX) === nsx; });
          if (cung.length) {
            throw loi_('CAN_XAC_NHAN', { lyDo: 'TRUNG_MA_NSX', maNSX: o.MaNSX, ds: tomTatLK_(cung, 'TenVi'),
              dsZh: tomTatLK_(cung, 'TenZh'), chiTiet: { ds: cung.slice(0, 5).map(function (d) { return d.MaLK; }) } });
          }
        }
        const ten = chuanSoSanh_(o.TenVi + '|' + o.QuyCach);
        const cungTen = conDung.filter(function (d) { return chuanSoSanh_(d.TenVi + '|' + d.QuyCach) === ten; });
        if (cungTen.length) {
          throw loi_('CAN_XAC_NHAN', { lyDo: 'TRUNG_TEN', ds: tomTatLK_(cungTen, 'TenVi'), dsZh: tomTatLK_(cungTen, 'TenZh'),
            chiTiet: { ds: cungTen.slice(0, 5).map(function (d) { return d.MaLK; }) } });
        }
      }
      if (dsMaTB.length) {
        const bTB = docBang_('ThietBi', true);
        dsMaTB.forEach(function (m) {
          const tb = timDong_(bTB, { MaTB: m });
          if (!tb || tb.DaXoa) throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', 'MaTB', { giaTri: m });
        });
      }
      if (!maLK) maLK = taoMa_(TIEN_TO_MA_TAM, kho.dong.map(function (d) { return d.MaLK; }), false, 'TAM');
      o.MaLK = maLK;
      const duyet = coQuyen_(user, 'GAN_LINH_KIEN') ? 'DA_DUYET' : 'CHO_DUYET';
      const lien = dsMaTB.map(function (m) {
        return { MaTB: m, MaLK: maLK, SoLuongLap: 1, DaXoa: false, TrangThaiDuyet: duyet };
      });
      ghiNhieu_('KhoLinhKien', [o], { nguoi: user.MaNV, chiThem: true });
      const soMay = lien.length ? ghiNhieu_('LinhKienTB', lien, { nguoi: user.MaNV }).them.length : 0;
      ghiNhatKy_(user, 'THEM_LINH_KIEN', 'KhoLinhKien', maLK, { sau: o, dsMaTB: dsMaTB }, ctx && ctx.clientId);
      return { maLK: maLK, choDuyet: o.TrangThaiDuyet === 'CHO_DUYET', soMayGan: soMay, anhId: o.AnhId || '' };
    });
  } catch (e) {
    boAnh_(anhMoi);
    throw e;
  }
}

function tomTatLK_(ds, cotTen) {
  return ds.slice(0, 3).map(function (d) { return d.MaLK + ' ' + (d[cotTen] || d.TenVi); }).join('; ') + (ds.length > 3 ? '…' : '');
}

/**
 * Sửa linh kiện (cấp 1–3): các cột của app (tên Trung, nhóm, mã NSX, tồn tối thiểu, ảnh, ghi chú).
 * Linh kiện thêm tay sửa được cả tên Việt, quy cách, ĐVT, vị trí kho; linh kiện từ file thì các cột đó theo file.
 * Sửa tên Trung là coi như đã duyệt bản dịch (DichMay = FALSE), trừ khi app gửi dichMay = true.
 */
function suaLinhKien_(user, lk, ctx) {
  lk = lk && typeof lk === 'object' ? lk : {};
  const maLK = chuanMaLK_(lk.MaLK);
  if (!maLK) throw loiTruong_('THIEU_TRUONG', 'MaLK');
  let anhMoi = null;
  if (lk.anh) anhMoi = luuAnhFile_(lk.anh, 'LINH_KIEN', maLK);
  try {
    return voiKhoa_(function () {
      const trung = trungClientId_(ctx);
      if (trung) {
        boAnh_(anhMoi);
        return trung;
      }
      const cu = timDong_(docBang_('KhoLinhKien', true), { MaLK: maLK });
      if (!cu || cu.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maLK });
      const o = { MaLK: maLK };
      if (lk.TenZh !== undefined) {
        o.TenZh = chu_(lk.TenZh, 200);
        if (!o.TenZh) throw loiTruong_('THIEU_TRUONG', 'TenZh');
        if (o.TenZh !== cu.TenZh) o.DichMay = lk.dichMay === true;
      }
      if (lk.duyetDich === true) o.DichMay = false;
      if (lk.NhomLK !== undefined) o.NhomLK = maDanhMuc_('NHOM_LK', lk.NhomLK, 'NhomLK', false);
      if (lk.MaNSX !== undefined) o.MaNSX = chu_(lk.MaNSX, 100);
      if (lk.GhiChu !== undefined) o.GhiChu = chu_(lk.GhiChu, 1000);
      if (lk.TonToiThieu !== undefined) {
        const t = String(lk.TonToiThieu).trim() === '' ? '' : docSo_(lk.TonToiThieu);
        if (t !== '' && !(t >= 0)) throw loiTruong_('GIA_TRI_SAI', 'TonToiThieu', { giaTri: lk.TonToiThieu });
        o.TonToiThieu = t;
      }
      if (lk.AnhId !== undefined) o.AnhId = kiemAnhId_(lk.AnhId);
      if (anhMoi) o.AnhId = anhMoi.anhId;
      if (cu.Nguon !== 'FILE') {
        if (lk.TenVi !== undefined) {
          o.TenVi = chu_(lk.TenVi, 200);
          if (!o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
        }
        if (lk.QuyCach !== undefined) o.QuyCach = chu_(lk.QuyCach, 200);
        if (lk.DVT !== undefined) o.DVT = dvt_(lk.DVT);
        if (lk.ViTriKho !== undefined) o.ViTriKho = chu_(lk.ViTriKho, 60);
      }
      if (lk.PhienBan !== undefined && lk.PhienBan !== null && lk.PhienBan !== '') o._phienBan = lk.PhienBan;
      const kq = ghiNhieu_('KhoLinhKien', [o], { nguoi: user.MaNV, chiSua: true });
      if (kq.xungDot.length) throw loiXungDot_(kq.xungDot[0], maLK);
      const g = kq.sua[0] || kq.khongDoi[0];
      if (kq.sua[0]) ghiNhatKy_(user, 'SUA_LINH_KIEN', 'KhoLinhKien', maLK, { truoc: g.truoc, sau: g.sau }, ctx && ctx.clientId);
      return { maLK: maLK, phienBan: g.dong.PhienBan, anhId: g.dong.AnhId };
    });
  } catch (e) {
    boAnh_(anhMoi);
    throw e;
  }
}

/** Duyệt linh kiện mới do kỹ thuật viên thêm (CHO_DUYET → DA_DUYET). */
function duyetLinhKien_(user, maLK, ctx) {
  maLK = chuanMaLK_(maLK);
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const cu = timDong_(docBang_('KhoLinhKien', true), { MaLK: maLK });
    if (!cu || cu.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maLK });
    ghiNhieu_('KhoLinhKien', [{ MaLK: maLK, TrangThaiDuyet: 'DA_DUYET' }], { nguoi: user.MaNV, chiSua: true });
    ghiNhatKy_(user, 'DUYET_LINH_KIEN', 'KhoLinhKien', maLK, { truoc: { TrangThaiDuyet: cu.TrangThaiDuyet }, sau: { TrangThaiDuyet: 'DA_DUYET' } },
      ctx && ctx.clientId);
    return { maLK: maLK };
  });
}

/**
 * Gộp mã tạm vào mã chính thức: chuyển liên kết máy (và linh kiện đã thay trong phiếu, đợt 2) sang mã chính thức,
 * chép các cột của app còn trống, xóa mềm mã tạm.
 */
function gopMaTam_(user, maTam, maChinhThuc, ctx) {
  maTam = chuanMaLK_(maTam);
  maChinhThuc = chuanMaLK_(maChinhThuc);
  if (maTam.indexOf(TIEN_TO_MA_TAM + '-') !== 0) {
    throw loi_('KHONG_GOP_DUOC', { lyDo: maTam + ' không phải mã tạm', lyDoZh: maTam + '不是临时编号' });
  }
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const kho = docBang_('KhoLinhKien', true);
    const tam = timDong_(kho, { MaLK: maTam });
    const chinh = timDong_(kho, { MaLK: maChinhThuc });
    if (!tam || tam.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maTam });
    if (!chinh || chinh.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maChinhThuc });
    if (maChinhThuc.indexOf(TIEN_TO_MA_TAM + '-') === 0) {
      throw loi_('KHONG_GOP_DUOC', { lyDo: maChinhThuc + ' cũng là mã tạm', lyDoZh: maChinhThuc + '也是临时编号' });
    }
    let soLienKet = 0;
    ['LinhKienTB', 'LinhKienDung'].forEach(function (ten) {
      const b = docBang_(ten, true);
      const khoaKhac = b.def.khoa.filter(function (c) { return c !== 'MaLK'; })[0];
      const ra = [];
      b.dong.filter(function (d) { return d.MaLK === maTam && !d.DaXoa; }).forEach(function (d) {
        const dk = {};
        dk[khoaKhac] = d[khoaKhac];
        dk.MaLK = maChinhThuc;
        const daCo = timDong_(b, dk);
        if (!daCo || daCo.DaXoa) {
          const moi = boCotNoiBo_(d);
          COT_HE_THONG.forEach(function (c) { delete moi[c]; });
          moi.MaLK = maChinhThuc;
          moi.DaXoa = false;
          ra.push(moi);
        }
        const xoa = { MaLK: maTam, DaXoa: true };
        xoa[khoaKhac] = d[khoaKhac];
        ra.push(xoa);
        soLienKet++;
      });
      if (ra.length) ghiNhieu_(ten, ra, { nguoi: user.MaNV });
    });
    const bu = { MaLK: maChinhThuc };
    ['TenZh', 'NhomLK', 'MaNSX', 'TonToiThieu', 'AnhId'].forEach(function (c) {
      if ((chinh[c] === '' || chinh[c] === null) && tam[c] !== '' && tam[c] !== null) bu[c] = tam[c];
    });
    if (bu.TenZh !== undefined) bu.DichMay = tam.DichMay === true;
    if (tam.GhiChu) bu.GhiChu = (chinh.GhiChu ? chinh.GhiChu + ' · ' : '') + tam.GhiChu;
    ghiNhieu_('KhoLinhKien', [bu, {
      MaLK: maTam, DaXoa: true, GhiChu: 'Đã gộp vào ' + maChinhThuc + (tam.GhiChu ? ' · ' + tam.GhiChu : '')
    }], { nguoi: user.MaNV });
    ghiNhatKy_(user, 'GOP_MA_TAM', 'KhoLinhKien', maTam, { vao: maChinhThuc, soLienKet: soLienKet }, ctx && ctx.clientId);
    return { maTam: maTam, maChinhThuc: maChinhThuc, soLienKet: soLienKet };
  });
}

/**
 * Dịch Việt → Trung giản thể bằng LanguageApp. Gộp nhiều tên vào một lượt (cách nhau xuống dòng) để tiết kiệm
 * hạn mức; lượt gộp lệch số dòng thì dịch từng tên. Trả mảng cùng thứ tự, tên dịch lỗi để ''.
 */
function dichTen_(ds) {
  if (!Array.isArray(ds)) throw loi_('DU_LIEU_SAI');
  if (ds.length > 500) throw loi_('QUA_NHIEU', { toiDa: 500 });
  const nguon = ds.map(function (s) { return chu_(s, 300).replace(/\n+/g, ' '); });
  const kq = nguon.map(function () { return ''; });
  const canDich = [];
  nguon.forEach(function (s, i) { if (s) canDich.push(i); });
  let loiDich = 0;
  let k = 0;
  while (k < canDich.length) {
    let j = k;
    let dai = 0;
    while (j < canDich.length && j - k < 50 && dai + nguon[canDich[j]].length + 1 <= 3500) {
      dai += nguon[canDich[j]].length + 1;
      j++;
    }
    if (j === k) j = k + 1;
    const nhom = canDich.slice(k, j);
    let dich = null;
    try {
      const ra = String(LanguageApp.translate(nhom.map(function (i) { return nguon[i]; }).join('\n'), 'vi', 'zh-CN')).split('\n');
      if (ra.length === nhom.length) dich = ra;
    } catch (e) {
      loiDich++;
    }
    if (!dich) {
      dich = nhom.map(function (i) {
        try {
          return String(LanguageApp.translate(nguon[i], 'vi', 'zh-CN'));
        } catch (e) {
          loiDich++;
          return '';
        }
      });
    }
    nhom.forEach(function (i, x) { kq[i] = chu_(dich[x], 300); });
    k = j;
  }
  if (canDich.length && loiDich && kq.every(function (s) { return !s; })) throw loi_('DICH_LOI');
  return kq;
}

/**
 * Mở một lần cập nhật kho từ file tuần. Mỗi lúc chỉ một lần nhập (lần bỏ dở quá 2 giờ tự đánh dấu LOI).
 * thongTinFile: { tenFile, ngayFile, tongDong, soGoi, ghepCot? } – ghepCot: lưu luôn cách ghép cột.
 */
function nhapKhoBatDau_(user, tt, ctx) {
  tt = tt && typeof tt === 'object' ? tt : {};
  const tenFile = chu_(tt.tenFile, 200);
  if (!tenFile) throw loiTruong_('THIEU_TRUONG', 'tenFile');
  const ngayFile = chuanNgay_(tt.ngayFile, 'ngayFile', true);
  if (ngayFile > congNgay_(homNay_(), 1)) throw loiTruong_('GIA_TRI_SAI', 'ngayFile', { giaTri: ngayFile });
  const tongDong = docSo_(tt.tongDong);
  if (!(tongDong >= 1 && tongDong <= 200000)) throw loiTruong_('GIA_TRI_SAI', 'tongDong', { giaTri: tt.tongDong });
  const soGoi = docSo_(tt.soGoi);
  if (!(soGoi >= 1 && soGoi <= 300 && Math.floor(soGoi) === soGoi)) throw loiTruong_('GIA_TRI_SAI', 'soGoi', { giaTri: tt.soGoi });
  const ghep = Array.isArray(tt.ghepCot) && tt.ghepCot.length ? chuanGhepCot_(tt.ghepCot) : null;
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const bLan = docBang_('LanNhapKho', true);
    const bayGio = new Date();
    const dangMo = bLan.dong.filter(function (d) { return !d.DaXoa && d.TrangThai === 'DANG_NHAP'; });
    const conChay = function (d) {
      const batDau = new Date(String(d.BatDau));
      return !isNaN(batDau.getTime()) && bayGio.getTime() - batDau.getTime() <= 2 * 3600000;
    };
    dangMo.forEach(function (d) {
      if (conChay(d) && chuanMaNV_(d.NguoiNhap) !== user.MaNV) {
        throw loi_('NHAP_KHO_DANG_CHAY', Object.assign({ ma: d.MaLan, nguoi: tenNguoi_(d.NguoiNhap) }, gioThamSo_(d.BatDau, 'luc')));
      }
    });
    // Lần bỏ dở (quá 2 giờ, hoặc của chính người này) → đánh dấu LOI.
    const ra = dangMo.map(function (d) {
      PropertiesService.getScriptProperties().deleteProperty('NK|' + d.MaLan);
      return { MaLan: d.MaLan, TrangThai: 'LOI', KetThuc: bayGio_() };
    });
    if (ra.length) ghiNhieu_('LanNhapKho', ra, { nguoi: NGUOI_HE_THONG });
    if (ghep) {
      ghiGhepCot_(user, ghep);
      ghiNhatKy_(user, 'LUU_GHEP_COT_KHO', 'GhepCotKho', '', { ds: ghep.ra });
    }
    const maLan = taoMa_('NK', bLan.dong.map(function (d) { return d.MaLan; }), true);
    ghiNhieu_('LanNhapKho', [{
      MaLan: maLan, TenFile: tenFile, NgayFile: ngayFile, NguoiNhap: user.MaNV, BatDau: bayGio_(), KetThuc: '',
      TongDong: tongDong, Moi: 0, ThayDoi: 0, KhongDoi: 0, VangMat: 0, Loi: 0, TrangThai: 'DANG_NHAP', DaXoa: false
    }], { nguoi: user.MaNV, chiThem: true });
    PropertiesService.getScriptProperties().setProperty('NK|' + maLan, JSON.stringify({ soGoi: soGoi, goi: {} }));
    ghiNhatKy_(user, 'NHAP_KHO_BAT_DAU', 'LanNhapKho', maLan, { tenFile: tenFile, ngayFile: ngayFile, tongDong: tongDong, soGoi: soGoi },
      ctx && ctx.clientId);
    return { maLan: maLan, goiToiDa: soCH_('GOI_NHAP_KHO_DONG', 500, 50, 2000) };
  });
}

/** Lần nhập đang mở của người dùng (người khác thì chỉ cấp 1–2 được tiếp tục). */
function lanNhapDangMo_(user, maLan) {
  const lan = timDong_(docBang_('LanNhapKho', true), { MaLan: chu_(maLan, 40) });
  if (!lan || lan.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: String(maLan || '') });
  if (lan.TrangThai !== 'DANG_NHAP') throw loi_('NHAP_KHO_DA_DONG', { ma: lan.MaLan });
  if (chuanMaNV_(lan.NguoiNhap) !== user.MaNV && user.Cap > 2) throw loi_('KHONG_DU_QUYEN');
  return lan;
}

function docTheoDoiNhap_(maLan) {
  const s = PropertiesService.getScriptProperties().getProperty('NK|' + maLan);
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

/**
 * Ghi một gói dòng của file kho theo mã: có thì sửa các cột lấy từ file, chưa có thì thêm (tên Trung dịch máy,
 * gắn cờ DichMay). Cột của app (tên Trung, ảnh, tồn tối thiểu, nhóm…) giữ nguyên. Gửi lại gói đã nhận thì
 * ghi lại an toàn nhưng không cộng số liệu hai lần.
 */
function nhapKhoGoi_(user, maLan, soGoi, dong, ctx) {
  soGoi = docSo_(soGoi);
  if (!(soGoi >= 1 && Math.floor(soGoi) === soGoi)) throw loiTruong_('GIA_TRI_SAI', 'soGoi', { giaTri: soGoi });
  if (!Array.isArray(dong)) throw loi_('DU_LIEU_SAI');
  const toiDa = Math.ceil(soCH_('GOI_NHAP_KHO_DONG', 500, 50, 2000) * 1.2);
  if (dong.length > toiDa) throw loi_('QUA_NHIEU', { toiDa: toiDa });
  // Đọc, kiểm từng dòng trước khi giữ khóa.
  const loi = [];
  const hopLe = [];
  const daGap = Object.create(null);
  dong.forEach(function (x, i) {
    const soDong = x && x._dong !== undefined ? x._dong : i + 1;
    const r = docDongKho_(x);
    if (r.loi) {
      loi.push({ dong: soDong, ma: r.ma || '', loi: r.loi });
      return;
    }
    if (daGap[r.o.MaLK]) {
      loi.push({ dong: soDong, ma: r.o.MaLK, loi: 'TRUNG_MA' });
      return;
    }
    daGap[r.o.MaLK] = true;
    hopLe.push(r.o);
  });
  // Dịch trước tên của mã mới chưa có tên Trung (chậm, không giữ khóa lúc dịch).
  const khoCu = docBang_('KhoLinhKien');
  const canDich = hopLe.filter(function (o) {
    const d = timDong_(khoCu, { MaLK: o.MaLK });
    return (!d || !d.TenZh) && o.TenVi;
  });
  const dich = Object.create(null);
  if (canDich.length) {
    try {
      const ra = dichTen_(canDich.map(function (o) { return o.TenVi; }));
      canDich.forEach(function (o, i) { if (ra[i]) dich[o.MaLK] = ra[i]; });
    } catch (e) {
      console.warn('Không dịch được tên linh kiện: ' + e);
    }
  }
  return voiKhoa_(function () {
    const lan = lanNhapDangMo_(user, maLan);
    const td = docTheoDoiNhap_(lan.MaLan) || { soGoi: 0, goi: {} };
    const daNhan = td.goi[String(soGoi)];
    const kho = docBang_('KhoLinhKien', true);
    const tk = { moi: 0, doi: 0, khongDoi: 0, loi: loi.length };
    const ra = hopLe.map(function (o) {
      const cu = timDong_(kho, { MaLK: o.MaLK });
      const x = Object.assign({}, o, { NgayFile: lan.NgayFile, TrangThaiFile: 'CO_TRONG_FILE', DaXoa: false });
      if (!cu) {
        if (!x.TenVi) x.TenVi = x.MaLK;
        x.Nguon = 'FILE';
        x.TrangThaiDuyet = 'DA_DUYET';
        x.TenZh = dich[o.MaLK] || '';
        x.DichMay = !!dich[o.MaLK];
        tk.moi++;
      } else {
        const doi = TRUONG_FILE_KHO.some(function (c) {
          return c !== 'MaLK' && o[c] !== undefined && !giongNhau_(kho.def, c, cu[c], giaTriGhi_(kho.def, c, o[c]));
        });
        if (doi) tk.doi++;
        else tk.khongDoi++;
        if (cu.Nguon !== 'FILE') {
          x.Nguon = 'FILE';
          x.TrangThaiDuyet = 'DA_DUYET';
        }
        if (!cu.TenZh && dich[o.MaLK]) {
          x.TenZh = dich[o.MaLK];
          x.DichMay = true;
        }
        if (x.TenVi === '') delete x.TenVi;
      }
      return x;
    });
    ghiNhieu_('KhoLinhKien', ra, { nguoi: user.MaNV });
    const thongKe = daNhan ? { moi: daNhan[0], doi: daNhan[1], khongDoi: daNhan[2], loi: daNhan[3] } : tk;
    if (!daNhan) {
      td.goi[String(soGoi)] = [tk.moi, tk.doi, tk.khongDoi, tk.loi];
      PropertiesService.getScriptProperties().setProperty('NK|' + lan.MaLan, JSON.stringify(td));
      ghiNhatKy_(user, 'NHAP_KHO_GOI', 'LanNhapKho', lan.MaLan, { goi: soGoi, moi: tk.moi, doi: tk.doi, khongDoi: tk.khongDoi, loi: tk.loi });
    }
    return { maLan: lan.MaLan, soGoi: soGoi, daNhanTruoc: !!daNhan, moi: thongKe.moi, doi: thongKe.doi, khongDoi: thongKe.khongDoi,
      soLoi: loi.length, loi: loi.slice(0, 200) };
  });
}

/** Đọc một dòng file kho (app đã ghép cột sang tên trường của app). */
function docDongKho_(x) {
  if (!x || typeof x !== 'object') return { loi: 'DONG_SAI' };
  const ma = chuanMaLK_(x.MaLK);
  if (!ma) return { loi: 'THIEU_MA' };
  if (ma.length > 50) return { ma: ma, loi: 'MA_QUA_DAI' };
  if (ma.indexOf(TIEN_TO_MA_TAM + '-') === 0) return { ma: ma, loi: 'MA_TAM' };
  const o = { MaLK: ma };
  if (x.TenVi !== undefined) o.TenVi = chu_(x.TenVi, 200);
  if (x.QuyCach !== undefined) o.QuyCach = chu_(x.QuyCach, 200);
  if (x.DVT !== undefined) o.DVT = chu_(x.DVT, 20);
  if (x.ViTriKho !== undefined) o.ViTriKho = chu_(x.ViTriKho, 60);
  if (x.TonKho !== undefined) {
    if (String(x.TonKho).trim() === '') {
      o.TonKho = '';
    } else {
      const n = docSo_(x.TonKho);
      if (isNaN(n)) return { ma: ma, loi: 'TON_KHO_SAI' };
      o.TonKho = n;
    }
  }
  if (x.DonGia !== undefined) {
    if (String(x.DonGia).trim() === '') {
      o.DonGia = '';
    } else {
      const n = docSo_(x.DonGia);
      if (isNaN(n) || n < 0) return { ma: ma, loi: 'DON_GIA_SAI' };
      o.DonGia = n;
    }
  }
  return { o: o };
}

/**
 * Kết thúc lần nhập: kiểm đủ gói, gắn nhãn KHONG_CON cho mã từ file không còn trong file (không xóa, có thể đang
 * gắn với máy), ghi tổng kết vào LanNhapKho, gợi ý gộp mã tạm trùng mã NSX hoặc tên với mã chính thức.
 * dsMa: toàn bộ mã có trong file (app gửi sau gói cuối).
 */
function nhapKhoKetThuc_(user, maLan, dsMa, ctx) {
  if (!Array.isArray(dsMa) || !dsMa.length) throw loi_('DU_LIEU_SAI');
  if (dsMa.length > 200000) throw loi_('QUA_NHIEU', { toiDa: 200000 });
  return voiKhoa_(function () {
    const lan = lanNhapDangMo_(user, maLan);
    const td = docTheoDoiNhap_(lan.MaLan);
    if (!td) throw loi_('NHAP_KHO_DA_DONG', { ma: lan.MaLan });
    const thieuGoi = [];
    for (let g = 1; g <= td.soGoi; g++) if (!td.goi[String(g)]) thieuGoi.push(g);
    if (thieuGoi.length) throw loi_('NHAP_KHO_THIEU_GOI', { goi: thieuGoi.slice(0, 20).join(', '), chiTiet: { goi: thieuGoi } });
    const trongFile = Object.create(null);
    dsMa.forEach(function (m) {
      const s = chuanMaLK_(m);
      if (s) trongFile[s] = true;
    });
    const kho = docBang_('KhoLinhKien', true);
    const chiMuc = layChiMuc_(kho, 'MaLK');
    const chuaGhi = Object.keys(trongFile).filter(function (m) { return !chiMuc[m] || chiMuc[m].DaXoa; });
    if (chuaGhi.length) throw loi_('NHAP_KHO_THIEU_MA', { so: chuaGhi.length, vd: chuaGhi.slice(0, 3).join(', ') });
    const ra = [];
    let vangMat = 0;
    let chuaDich = 0;
    kho.dong.forEach(function (d) {
      if (d.DaXoa || d.Nguon !== 'FILE') return;
      if (!trongFile[d.MaLK]) {
        vangMat++;
        if (d.TrangThaiFile !== 'KHONG_CON') ra.push({ MaLK: d.MaLK, TrangThaiFile: 'KHONG_CON' });
      } else if (!d.TenZh) {
        chuaDich++;
      }
    });
    if (ra.length) ghiNhieu_('KhoLinhKien', ra, { nguoi: user.MaNV });
    const tong = [0, 0, 0, 0];
    Object.keys(td.goi).forEach(function (g) {
      for (let k = 0; k < 4; k++) tong[k] += Number(td.goi[g][k]) || 0;
    });
    ghiNhieu_('LanNhapKho', [{
      MaLan: lan.MaLan, KetThuc: bayGio_(), Moi: tong[0], ThayDoi: tong[1], KhongDoi: tong[2], Loi: tong[3], VangMat: vangMat,
      TrangThai: 'HOAN_TAT'
    }], { nguoi: user.MaNV, chiSua: true });
    PropertiesService.getScriptProperties().deleteProperty('NK|' + lan.MaLan);
    const goiY = goiYGopMaTam_(kho, trongFile);
    ghiNhatKy_(user, 'NHAP_KHO_XONG', 'LanNhapKho', lan.MaLan,
      { moi: tong[0], thayDoi: tong[1], khongDoi: tong[2], loi: tong[3], vangMat: vangMat, goiYGop: goiY.length }, ctx && ctx.clientId);
    return { maLan: lan.MaLan, moi: tong[0], thayDoi: tong[1], khongDoi: tong[2], loi: tong[3], vangMat: vangMat,
      moiKhongCon: ra.length, chuaDich: chuaDich, goiYGop: goiY };
  });
}

/** Mã tạm có mã NSX hoặc tên + quy cách trùng mã chính thức có trong file → gợi ý gộp (app cho người dùng chọn). */
function goiYGopMaTam_(kho, trongFile) {
  const theoNSX = Object.create(null);
  const theoTen = Object.create(null);
  const them = function (m, k, ma) { (m[k] = m[k] || []).push(ma); };
  kho.dong.forEach(function (d) {
    if (d.DaXoa || !trongFile[d.MaLK]) return;
    if (d.MaNSX) them(theoNSX, chuanSoSanh_(d.MaNSX), d.MaLK);
    them(theoTen, chuanSoSanh_(d.TenVi + '|' + d.QuyCach), d.MaLK);
  });
  const ra = [];
  kho.dong.forEach(function (d) {
    if (d.DaXoa || String(d.MaLK).indexOf(TIEN_TO_MA_TAM + '-') !== 0 || ra.length >= 100) return;
    const daCo = Object.create(null);
    (d.MaNSX ? theoNSX[chuanSoSanh_(d.MaNSX)] || [] : []).forEach(function (m) {
      if (!daCo[m]) ra.push({ maTam: d.MaLK, maChinhThuc: m, theo: 'MaNSX' });
      daCo[m] = true;
    });
    (theoTen[chuanSoSanh_(d.TenVi + '|' + d.QuyCach)] || []).forEach(function (m) {
      if (!daCo[m]) ra.push({ maTam: d.MaLK, maChinhThuc: m, theo: 'TenVi' });
      daCo[m] = true;
    });
  });
  return ra;
}

/** Lưu cách ghép cột file kho (thay toàn bộ): trường MaLK bắt buộc có. */
function luuGhepCotKho_(user, ds, ctx) {
  const g = chuanGhepCot_(ds);
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const kq = ghiGhepCot_(user, g);
    ghiNhatKy_(user, 'LUU_GHEP_COT_KHO', 'GhepCotKho', '', { ds: g.ra }, ctx && ctx.clientId);
    return { soCot: g.ra.length, doi: kq.them.length + kq.sua.length };
  });
}

function chuanGhepCot_(ds) {
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  const ra = [];
  const daCo = Object.create(null);
  ds.forEach(function (x) {
    if (!x || typeof x !== 'object') return;
    const truong = chu_(x.TruongApp, 40);
    if (TRUONG_FILE_KHO.indexOf(truong) < 0) throw loiTruong_('GIA_TRI_SAI', 'TruongApp', { giaTri: truong });
    const cotFile = chu_(x.CotFile, 120);
    if (!cotFile) throw loiTruong_('THIEU_TRUONG', 'CotFile');
    if (daCo[truong]) return;
    daCo[truong] = true;
    ra.push({ TruongApp: truong, CotFile: cotFile, BatBuoc: x.BatBuoc === true || truong === 'MaLK', ChuyenDoi: chu_(x.ChuyenDoi, 200), DaXoa: false });
  });
  if (!daCo.MaLK) throw loiTruong_('THIEU_TRUONG', 'MaLK');
  return { ra: ra, daCo: daCo };
}

/** Ghi cách ghép cột (trong khóa): trường không còn trong danh sách mới thì xóa mềm. */
function ghiGhepCot_(user, g) {
  const ra = g.ra.slice();
  docBang_('GhepCotKho', true).dong.forEach(function (d) {
    if (!d.DaXoa && d.TruongApp && !g.daCo[d.TruongApp]) ra.push({ TruongApp: d.TruongApp, DaXoa: true });
  });
  return ghiNhieu_('GhepCotKho', ra, { nguoi: user.MaNV });
}

// ───────────────────────── Ảnh ─────────────────────────

/** Loại ảnh: thư mục (CauHinh), quyền cần có, có chia sẻ bằng link khó đoán không. */
const LOAI_ANH = {
  THIET_BI: { thuMuc: 'THU_MUC_ANH_THIET_BI', quyen: 'SUA_THIET_BI', chiaSe: true },
  LINH_KIEN: { thuMuc: 'THU_MUC_ANH_LINH_KIEN', quyen: 'THEM_LINH_KIEN', chiaSe: true },
  CONG_TO: { thuMuc: 'THU_MUC_ANH_CONG_TO', quyen: 'GHI_CHI_SO', chiaSe: false },
  SUA_CHUA: { thuMuc: 'THU_MUC_ANH_SUA_CHUA', quyen: 'XEM', chiaSe: false },
  BAO_TRI: { thuMuc: 'THU_MUC_ANH_BAO_TRI', quyen: 'GHI_CHI_SO', chiaSe: false }
};

/** Lưu ảnh đã nén trên máy (JPEG/PNG, base64) vào thư mục Drive của loại, trả ID. */
function luuAnh_(user, base64, loai, maLienKet, ctx) {
  const l = LOAI_ANH[String(loai || '')];
  if (!l || !Object.prototype.hasOwnProperty.call(LOAI_ANH, String(loai))) throw loi_('LOAI_ANH_SAI', { loai: String(loai || '') });
  if (!coQuyen_(user, l.quyen)) throw loi_('KHONG_DU_QUYEN');
  const anh = luuAnhFile_(base64, String(loai), chu_(maLienKet, 60) || 'anh');
  ghiNhatKy_(user, 'LUU_ANH', '', anh.anhId, { loai: loai, maLienKet: chu_(maLienKet, 60) }, ctx && ctx.clientId);
  return anh;
}

function luuAnhFile_(base64, loai, ma) {
  const s = String(base64 || '').replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
  if (!s || s.length > Math.ceil(TOI_DA_ANH * 4 / 3) + 4) throw loi_('ANH_SAI');
  let byte;
  try {
    byte = Utilities.base64Decode(s);
  } catch (e) {
    throw loi_('ANH_SAI');
  }
  const b0 = byte[0] & 0xff;
  const b1 = byte[1] & 0xff;
  const b2 = byte[2] & 0xff;
  const b3 = byte[3] & 0xff;
  let mime;
  let duoi;
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
    mime = 'image/jpeg';
    duoi = '.jpg';
  } else if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
    mime = 'image/png';
    duoi = '.png';
  } else {
    throw loi_('ANH_SAI');
  }
  if (byte.length > TOI_DA_ANH) throw loi_('ANH_SAI');
  const l = LOAI_ANH[loai];
  const thuMuc = thuMucAnh_(l.thuMuc);
  const ten = loai + '_' + String(ma || 'anh').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 40) + '_' +
    Utilities.formatDate(new Date(), MUI_GIO, 'yyyyMMdd-HHmmss') + '_' + taoChuoiNgauNhien_().slice(0, 6) + duoi;
  const f = thuMuc.createFile(Utilities.newBlob(byte, mime, ten));
  let chiaSe = false;
  if (l.chiaSe) {
    try {
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      chiaSe = true;
    } catch (e) {
      console.warn('Không chia sẻ được ảnh ' + f.getId() + ': ' + e);
    }
  }
  return { anhId: f.getId(), chiaSe: chiaSe };
}

function thuMucAnh_(khoa) {
  const id = cauHinh_()[khoa];
  if (!id) throw loi_('CAN_CAI_DAT');
  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    throw loi_('CAN_CAI_DAT');
  }
}

/** Bỏ ảnh vừa lưu khi thao tác không thành công (vào thùng rác Drive). */
function boAnh_(anh) {
  if (!anh || !anh.anhId) return;
  try {
    DriveApp.getFileById(anh.anhId).setTrashed(true);
  } catch (e) {
    console.warn('Không bỏ được ảnh ' + anh.anhId + ': ' + e);
  }
}

function kiemAnhId_(v) {
  const s = chu_(v, 200);
  if (s && !ID_DRIVE_HOP_LE.test(s)) throw loiTruong_('GIA_TRI_SAI', 'AnhId', { giaTri: s });
  return s;
}

/** Tải một ảnh (kể cả ảnh riêng tư như ảnh công tơ). Chỉ trả ảnh nằm trong các thư mục ảnh của ME. */
function layAnh_(user, anhId) {
  const id = kiemAnhId_(anhId);
  if (!id) throw loi_('KHONG_TIM_THAY', { ma: '' });
  const ch = cauHinh_();
  const hopLe = {};
  ['THU_MUC_ANH'].concat(Object.keys(LOAI_ANH).map(function (k) { return LOAI_ANH[k].thuMuc; })).forEach(function (k) {
    if (ch[k]) hopLe[ch[k]] = true;
  });
  let f;
  try {
    f = DriveApp.getFileById(id);
  } catch (e) {
    throw loi_('KHONG_TIM_THAY', { ma: id });
  }
  let trongME = false;
  const it = f.getParents();
  while (it.hasNext()) {
    if (hopLe[it.next().getId()]) trongME = true;
  }
  if (!trongME || f.isTrashed()) throw loi_('KHONG_TIM_THAY', { ma: id });
  const blob = f.getBlob();
  const byte = blob.getBytes();
  if (byte.length > 6 * 1024 * 1024) throw loi_('ANH_SAI');
  return { anhId: id, mime: blob.getContentType(), base64: Utilities.base64Encode(byte) };
}

// ───────────────────────── Điện nước ─────────────────────────

function khungCuaCongTo_(ct) {
  return String(ct.Loai) === 'DIEN_3_GIA' ? ['BT', 'CD', 'TD'] : ['BT'];
}

function loaiDienNuoc_(ct) {
  return String(ct.Loai).indexOf('NUOC') === 0 ? 'nuoc' : 'dien';
}

/** Các lần ghi (chưa xóa) của một công tơ, xếp theo giờ ghi. */
function chiSoCuaCongTo_(bCS, maCT) {
  return bCS.dong.filter(function (d) { return d.MaCT === maCT && !d.DaXoa; }).sort(soSanhChiSo_);
}

function soSanhChiSo_(a, b) {
  const x = String(a.GhiLuc);
  const y = String(b.GhiLuc);
  if (x !== y) return x < y ? -1 : 1;
  const m = String(a.MaGhi);
  const n = String(b.MaGhi);
  return m === n ? 0 : (m.length !== n.length ? m.length - n.length : (m < n ? -1 : 1));
}

/**
 * Quy tắc tính và cảnh báo chỉ số — dùng chung máy chủ và app (app chép nguyên hàm này để cảnh báo khi mất mạng).
 * Không gọi dịch vụ Apps Script nào.
 *   congTo: { Loai, HeSoNhan, SoToiDa, DinhMucNgay }
 *   truoc:  lần ghi trước { ChiSoBT, ChiSoCD, ChiSoTD, NgayTinh } hoặc null (lần đầu: chỉ là mốc, chưa có tiêu thụ)
 *   moi:    { ChiSoBT, ChiSoCD, ChiSoTD, NgayTinh, HeSo } (HeSo trống → HeSoNhan của công tơ)
 *   thamSo: { tbNgay: { tong, BT, CD, TD } | null, soNgayTB, nguongPT, heSoNghiSai }
 * Trả { TieuThuBT/CD/TD, TieuThu, HeSoDung, soNgay, moiNgay, Co, canhBao: [], chan: null | {…}, canXacNhan: null | {…} }
 *   - Tiêu thụ = (mới − trước) × hệ số; nhỏ hơn lần trước mà công tơ đang gần số tối đa → quay vòng:
 *     (tối đa − trước) + mới; còn lại → chan (không lưu).
 *   - Cách ngày (bỏ sót) → Co GOP, tiêu thụ chia đều cho các ngày khi vẽ.
 *   - Tiêu thụ mỗi ngày cao hơn trung bình quá ngưỡng (mặc định 30%) → Co BAT_THUONG (cấp 1–3 duyệt).
 *   - Gấp từ heSoNghiSai lần (mặc định 5) trở lên, xét tổng và từng khung giờ → canXacNhan (nghi nhập sai).
 */
function kiemTraChiSo_(congTo, truoc, moi, thamSo) {
  const khung = String(congTo.Loai) === 'DIEN_3_GIA' ? ['BT', 'CD', 'TD'] : ['BT'];
  const heSo = Number(moi.HeSo) > 0 ? Number(moi.HeSo) : (Number(congTo.HeSoNhan) > 0 ? Number(congTo.HeSoNhan) : 1);
  const kq = {
    TieuThuBT: '', TieuThuCD: '', TieuThuTD: '', TieuThu: '', HeSoDung: heSo, soNgay: 0, moiNgay: null,
    Co: 'BINH_THUONG', canhBao: [], chan: null, canXacNhan: null
  };
  if (!truoc) return kq;
  const lamTron = function (x) { return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 1000) / 1000; };
  const ngay = function (s) {
    const p = String(s).split('-');
    return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  };
  const soNgay = Math.max(1, Math.round((ngay(moi.NgayTinh) - ngay(truoc.NgayTinh)) / 86400000));
  const toiDa = Number(congTo.SoToiDa) || 0;
  let tong = 0;
  for (let i = 0; i < khung.length; i++) {
    const k = khung[i];
    const a = Number(truoc['ChiSo' + k]) || 0;
    const b = Number(moi['ChiSo' + k]) || 0;
    let d = b - a;
    if (d < 0) {
      if (toiDa > 0 && a >= toiDa * 0.9 && b <= toiDa * 0.1) {
        d = toiDa - a + b;
        kq.canhBao.push({ ma: 'QUAY_VONG', khung: k });
      } else {
        kq.chan = { ma: 'SO_NHO_HON_TRUOC', khung: k, truoc: a, moi: b };
        return kq;
      }
    }
    const t = lamTron(d * heSo);
    kq['TieuThu' + k] = t;
    tong += t;
  }
  kq.TieuThu = lamTron(tong);
  kq.soNgay = soNgay;
  kq.moiNgay = lamTron(tong / soNgay);
  if (soNgay > 1) {
    kq.Co = 'GOP';
    kq.canhBao.push({ ma: 'GOP', soNgay: soNgay });
  }
  const tb = thamSo && thamSo.tbNgay;
  if (tb) {
    const nguong = 1 + (Number(thamSo.nguongPT) > 0 ? Number(thamSo.nguongPT) : 30) / 100;
    const nghi = Number(thamSo.heSoNghiSai) > 0 ? Number(thamSo.heSoNghiSai) : 5;
    if (tb.tong > 0 && kq.moiNgay > tb.tong * nguong) {
      kq.Co = 'BAT_THUONG';
      kq.canhBao.push({ ma: 'VUOT_NGUONG', tb: lamTron(tb.tong), phanTram: Math.round((kq.moiNgay / tb.tong - 1) * 100) });
    }
    const phan = [{ khung: 'TONG', gt: kq.moiNgay, tb: tb.tong }];
    if (khung.length > 1) {
      khung.forEach(function (k) { phan.push({ khung: k, gt: Number(kq['TieuThu' + k]) / soNgay, tb: tb[k] }); });
    }
    const nghiSai = phan.filter(function (p) { return p.tb > 0 && p.gt >= p.tb * nghi; })
      .map(function (p) { return { khung: p.khung, moiNgay: lamTron(p.gt), tb: lamTron(p.tb), lan: Math.round(p.gt / p.tb * 10) / 10 }; })
      .sort(function (x, y) { return y.lan - x.lan; });
    if (nghiSai.length) kq.canXacNhan = { ma: 'NGHI_NHAP_SAI', ds: nghiSai };
  }
  const dm = Number(congTo.DinhMucNgay);
  if (dm > 0 && kq.moiNgay > dm) {
    kq.canhBao.push({ ma: 'VUOT_DINH_MUC', dinhMuc: dm, phanTram: Math.round((kq.moiNgay / dm - 1) * 1000) / 10 });
  }
  return kq;
}

/**
 * Chia tiêu thụ của từng lần ghi cho các ngày nó phủ (từ ngày sau lần ghi trước đến NgayTinh), trong [tu, den].
 * ds: chuỗi lần ghi của một công tơ, đã xếp theo giờ ghi. Lần đầu (TieuThu trống) chỉ là mốc.
 * Trả { ngay: { 'YYYY-MM-DD': { tong, BT, CD, TD } }, gop: { ngày: true }, batThuong: { ngày: true } }.
 */
function phanBoNgay_(ds, tu, den) {
  const kq = { ngay: {}, gop: {}, batThuong: {} };
  for (let i = 1; i < ds.length; i++) {
    const r = ds[i];
    if (r.TieuThu === '' || r.TieuThu === null || r.TieuThu === undefined) continue;
    const b = String(r.NgayTinh);
    if (b < tu) continue;
    let soNgay = soNgayGiua_(String(ds[i - 1].NgayTinh), b);
    const dau = soNgay >= 1 ? congNgay_(String(ds[i - 1].NgayTinh), 1) : b;
    if (soNgay < 1) soNgay = 1;
    if (dau > den) continue;
    for (let k = 0; k < soNgay; k++) {
      const d = k === 0 ? dau : congNgay_(dau, k);
      if (d < tu) continue;
      if (d > den) break;
      const o = kq.ngay[d] || (kq.ngay[d] = { tong: 0, BT: 0, CD: 0, TD: 0 });
      o.tong += (Number(r.TieuThu) || 0) / soNgay;
      o.BT += (Number(r.TieuThuBT) || 0) / soNgay;
      o.CD += (Number(r.TieuThuCD) || 0) / soNgay;
      o.TD += (Number(r.TieuThuTD) || 0) / soNgay;
      if (soNgay > 1) kq.gop[d] = true;
      if (r.Co === 'BAT_THUONG') kq.batThuong[d] = true;
    }
  }
  return kq;
}

/** Trung bình mỗi ngày trong soNgay ngày trước ngayTinh (cần ít nhất 3 ngày có số). ds: các lần ghi trước. */
function trungBinhNgay_(ds, ngayTinh, soNgay) {
  const tu = congNgay_(ngayTinh, -soNgay);
  const den = congNgay_(ngayTinh, -1);
  const pb = phanBoNgay_(ds, tu, den);
  const cacNgay = Object.keys(pb.ngay);
  if (cacNgay.length < Math.min(3, soNgay)) return null;
  const tb = { tong: 0, BT: 0, CD: 0, TD: 0 };
  cacNgay.forEach(function (d) {
    ['tong', 'BT', 'CD', 'TD'].forEach(function (k) { tb[k] += pb.ngay[d][k]; });
  });
  ['tong', 'BT', 'CD', 'TD'].forEach(function (k) { tb[k] = tb[k] / cacNgay.length; });
  return tb;
}

function thamSoCanhBao_(dsTruoc, ngayTinh) {
  const soNgay = soCH_('SO_NGAY_TRUNG_BINH', 7, 3, 60);
  return {
    tbNgay: trungBinhNgay_(dsTruoc, ngayTinh, soNgay), soNgayTB: soNgay,
    nguongPT: soCH_('NGUONG_BAT_THUONG_PT', 30, 1, 1000), heSoNghiSai: soCH_('HE_SO_NGHI_NHAP_SAI', 5, 2, 100)
  };
}

/** Lỗi chặn của kiemTraChiSo_ → câu báo song ngữ. */
function loiChanChiSo_(chan, ct) {
  const t = TEN_KHUNG[chan.khung] || TEN_KHUNG.TONG;
  return loi_('SO_NHO_HON_TRUOC', {
    khung: String(ct.Loai) === 'DIEN_3_GIA' ? t[0] : '', khungZh: String(ct.Loai) === 'DIEN_3_GIA' ? t[1] : '',
    moi: soVi_(chan.moi), moiZh: soZh_(chan.moi), truoc: soVi_(chan.truoc), truocZh: soZh_(chan.truoc), chiTiet: chan
  });
}

function loiNghiSai_(cx, ct, thamSo, kq) {
  const p = cx.ds[0];
  const t = TEN_KHUNG[p.khung] || TEN_KHUNG.TONG;
  const donVi = String(ct.DonVi || (loaiDienNuoc_(ct) === 'nuoc' ? 'm³' : 'kWh'));
  return loi_('CAN_XAC_NHAN', {
    lyDo: 'NGHI_NHAP_SAI', khung: t[0], khungZh: t[1], lan: soVi_(p.lan, 1), lanZh: soZh_(p.lan, 1),
    tb: soVi_(p.tb, 2), tbZh: soZh_(p.tb, 2), donVi: donVi, soNgay: thamSo.soNgayTB,
    chiTiet: { ds: cx.ds, TieuThu: kq.TieuThu, moiNgay: kq.moiNgay }
  });
}

/**
 * Tính lại lần ghi thứ i (sau khi lần trước nó đổi). Dòng thay công tơ không tính lại được → báo lỗi.
 * Trả phần cần ghi { MaGhi, TieuThu…, Co }.
 */
function tinhLaiChiSo_(ct, ds, i) {
  const r = ds[i];
  if (r.Co === 'THAY_CONG_TO') throw loi_('TRUOC_THAY_CONG_TO');
  const ts = thamSoCanhBao_(ds.slice(0, i), r.NgayTinh);
  const kq = kiemTraChiSo_(ct, i > 0 ? ds[i - 1] : null,
    { ChiSoBT: r.ChiSoBT, ChiSoCD: r.ChiSoCD, ChiSoTD: r.ChiSoTD, NgayTinh: r.NgayTinh, HeSo: r.HeSoDung }, ts);
  if (kq.chan) throw loi_('SO_LON_HON_SAU', gioThamSo_(r.GhiLuc, 'luc'));
  return { MaGhi: r.MaGhi, TieuThuBT: kq.TieuThuBT, TieuThuCD: kq.TieuThuCD, TieuThuTD: kq.TieuThuTD, TieuThu: kq.TieuThu, Co: kq.Co };
}

/**
 * Ghi chỉ số một công tơ: kiểm quyền và ClientId, bắt buộc ảnh mặt công tơ, lấy lần ghi trước, tính tiêu thụ từng
 * khung giờ × hệ số, xử lý quay vòng, gắn cờ, ghi một dòng ChiSo. Số ghi sáng D+1 tính cho ngày D (NgayTinh).
 * Ghi chen (máy mất mạng gửi muộn) thì tính lại lần ghi ngay sau nó.
 */
function luuChiSo_(user, cs, ctx) {
  cs = cs && typeof cs === 'object' ? cs : {};
  const maCT = chuanMa_(cs.MaCT);
  const ct0 = timDong_(docBang_('CongTo'), { MaCT: maCT });
  if (!maCT || !ct0 || ct0.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maCT || String(cs.MaCT || '') });
  if (ct0.TrangThai && ct0.TrangThai !== 'DANG_DUNG') throw loi_('CONG_TO_NGUNG', { ma: maCT });
  const moi = docChiSoNhap_(cs, ct0);
  const ghiLuc = docGhiLuc_(cs.GhiLuc);
  const ghiLucIso = bayGio_(ghiLuc);
  const ngayTinh = ngayTinhCua_(ghiLuc);
  if (!cs.anh && !cs.AnhId) throw loi_('THIEU_ANH');
  if (ctx && ctx.clientId) {
    const ma = timClientId_(ctx.clientId);
    if (ma !== null) return { daXuLy: true, ma: ma };
  }
  let anhId = cs.AnhId ? kiemAnhId_(cs.AnhId) : '';
  let anhMoi = null;
  if (cs.anh) {
    anhMoi = luuAnhFile_(cs.anh, 'CONG_TO', maCT);
    anhId = anhMoi.anhId;
  }
  try {
    return voiKhoa_(function () {
      const trung = trungClientId_(ctx);
      if (trung) {
        boAnh_(anhMoi);
        return trung;
      }
      const ct = timDong_(docBang_('CongTo', true), { MaCT: maCT });
      const bCS = docBang_('ChiSo', true);
      const ds = chiSoCuaCongTo_(bCS, maCT);
      let viTri = ds.length;
      for (let i = 0; i < ds.length; i++) {
        if (String(ds[i].GhiLuc) > ghiLucIso) {
          viTri = i;
          break;
        }
      }
      const truoc = viTri > 0 ? ds[viTri - 1] : null;
      const sau = viTri < ds.length ? ds[viTri] : null;
      if (sau && ds.slice(viTri).some(function (d) { return d.Co === 'THAY_CONG_TO'; })) throw loi_('TRUOC_THAY_CONG_TO');
      if (!cs.xacNhan) {
        const cung = ds.filter(function (d) { return d.NgayTinh === ngayTinh; })[0];
        if (cung) {
          throw loi_('CAN_XAC_NHAN', Object.assign({
            lyDo: 'DA_GHI_NGAY', ma: maCT, ngay: ngayVi_(ngayTinh), ngayZh: ngayTinh, nguoi: tenNguoi_(cung.NguoiGhi),
            chiTiet: { maGhi: cung.MaGhi }
          }, gioThamSo_(cung.GhiLuc, 'luc')));
        }
      }
      const thamSo = thamSoCanhBao_(ds.slice(0, viTri), ngayTinh);
      const kq = kiemTraChiSo_(ct, truoc, Object.assign({ NgayTinh: ngayTinh, HeSo: ct.HeSoNhan }, moi), thamSo);
      if (kq.chan) throw loiChanChiSo_(kq.chan, ct);
      if (kq.canXacNhan && !cs.xacNhan) throw loiNghiSai_(kq.canXacNhan, ct, thamSo, kq);
      const dong = {
        MaGhi: '', ClientId: ctx && ctx.clientId ? ctx.clientId : '', MaCT: maCT, GhiLuc: ghiLucIso, NgayTinh: ngayTinh,
        NguoiGhi: user.MaNV, ChiSoBT: moi.ChiSoBT, ChiSoCD: moi.ChiSoCD, ChiSoTD: moi.ChiSoTD,
        TieuThuBT: kq.TieuThuBT, TieuThuCD: kq.TieuThuCD, TieuThuTD: kq.TieuThuTD, TieuThu: kq.TieuThu, HeSoDung: kq.HeSoDung,
        Co: kq.Co, AnhId: anhId, GhiChu: chu_(cs.GhiChu, 500), NguoiDuyet: '', DuyetLuc: '', DaXoa: false
      };
      const ghi = [dong];
      if (sau) {
        const dsMoi = ds.slice(0, viTri).concat([dong], ds.slice(viTri));
        ghi.push(tinhLaiChiSo_(ct, dsMoi, viTri + 1));
      }
      const maGhi = taoMa_('CS', bCS.dong.map(function (d) { return d.MaGhi; }), true);
      dong.MaGhi = maGhi;
      ghiNhieu_('ChiSo', ghi, { nguoi: user.MaNV });
      ghiNhatKy_(user, 'GHI_CHI_SO', 'ChiSo', maGhi,
        { MaCT: maCT, ChiSo: moi, TieuThu: kq.TieuThu, Co: kq.Co, ghiChen: !!sau }, ctx && ctx.clientId);
      return {
        maGhi: maGhi, maCT: maCT, ngayTinh: ngayTinh, ghiLuc: ghiLucIso, tieuThu: kq.TieuThu, tieuThuBT: kq.TieuThuBT,
        tieuThuCD: kq.TieuThuCD, tieuThuTD: kq.TieuThuTD, heSo: kq.HeSoDung, co: kq.Co, canhBao: kq.canhBao,
        moiNgay: kq.moiNgay, tbNgay: thamSo.tbNgay ? lamTron_(thamSo.tbNgay.tong, 3) : null, anhId: anhId
      };
    });
  } catch (e) {
    boAnh_(anhMoi);
    throw e;
  }
}

/** Đọc các số người dùng nhập theo loại công tơ (1 số hoặc 3 số), không âm. Một dấu chấm là thập phân. */
function docChiSoNhap_(cs, ct) {
  const moi = { ChiSoBT: '', ChiSoCD: '', ChiSoTD: '' };
  khungCuaCongTo_(ct).forEach(function (k) {
    const v = cs['ChiSo' + k];
    const n = v === undefined || v === null || String(v).trim() === '' ? NaN : docSo_(v, true);
    if (isNaN(n) || n < 0) throw loiTruong_('GIA_TRI_SAI', 'ChiSo' + k, { giaTri: v === undefined || v === null ? '' : String(v) });
    moi['ChiSo' + k] = n;
  });
  return moi;
}

/**
 * Duyệt hoặc sửa một lần ghi. Cấp 1–3: sửa số và duyệt (ghi người duyệt, giờ duyệt). Cấp 4: chỉ sửa số mình ghi,
 * trong ngày ghi, không duyệt được. Sửa số thì tính lại cả lần ghi ngay sau.
 * data: { maGhi, ghiChu?, sua?: { ChiSoBT, ChiSoCD, ChiSoTD } }
 */
function duyetChiSo_(user, data, ctx) {
  const maGhi = chu_(data.maGhi || data.MaGhi, 40);
  const sua = data.sua && typeof data.sua === 'object' ? data.sua : null;
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const bCS = docBang_('ChiSo', true);
    const r = timDong_(bCS, { MaGhi: maGhi });
    if (!r || r.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maGhi });
    const duocDuyet = coQuyen_(user, 'DUYET_CHI_SO');
    const cuaMinhTrongNgay = chuanMaNV_(r.NguoiGhi) === user.MaNV && ngayCua_(r.GhiLuc) === homNay_();
    if (!duocDuyet && !(sua && cuaMinhTrongNgay)) throw loi_('KHONG_DU_QUYEN');
    const ct = timDong_(docBang_('CongTo', true), { MaCT: r.MaCT });
    if (!ct) throw loi_('KHONG_TIM_THAY', { ma: r.MaCT });
    const ghi = [];
    const o = { MaGhi: maGhi };
    if (sua) {
      if (r.Co === 'THAY_CONG_TO') throw loi_('CHI_SO_THAY_CONG_TO');
      const ds = chiSoCuaCongTo_(bCS, r.MaCT);
      const i = ds.indexOf(r);
      const moi = docChiSoNhap_(Object.assign({}, { ChiSoBT: r.ChiSoBT, ChiSoCD: r.ChiSoCD, ChiSoTD: r.ChiSoTD }, sua), ct);
      const rMoi = Object.assign({}, r, moi);
      const dsMoi = ds.slice();
      dsMoi[i] = rMoi;
      const thamSo = thamSoCanhBao_(ds.slice(0, i), r.NgayTinh);
      const kq = kiemTraChiSo_(ct, i > 0 ? ds[i - 1] : null, Object.assign({ NgayTinh: r.NgayTinh, HeSo: r.HeSoDung }, moi), thamSo);
      if (kq.chan) throw loiChanChiSo_(kq.chan, ct);
      Object.assign(o, moi, { TieuThuBT: kq.TieuThuBT, TieuThuCD: kq.TieuThuCD, TieuThuTD: kq.TieuThuTD, TieuThu: kq.TieuThu, Co: kq.Co });
      Object.assign(rMoi, o);
      if (i + 1 < dsMoi.length) ghi.push(tinhLaiChiSo_(ct, dsMoi, i + 1));
    }
    if (duocDuyet) {
      o.NguoiDuyet = user.MaNV;
      o.DuyetLuc = bayGio_();
    }
    const ghiChu = chu_(data.ghiChu, 300);
    if (ghiChu) o.GhiChu = (r.GhiChu ? r.GhiChu + ' · ' : '') + ghiChu;
    ghi.unshift(o);
    const kqGhi = ghiNhieu_('ChiSo', ghi, { nguoi: user.MaNV });
    const g = kqGhi.sua[0] || kqGhi.khongDoi[0];
    ghiNhatKy_(user, sua ? 'SUA_CHI_SO' : 'DUYET_CHI_SO', 'ChiSo', maGhi, { truoc: g.truoc || {}, sau: g.sau || {} }, ctx && ctx.clientId);
    return { maGhi: maGhi, co: g.dong.Co, tieuThu: g.dong.TieuThu, daDuyet: !!g.dong.NguoiDuyet };
  });
}

/** Xóa mềm một lần ghi (cấp 1–3; cấp 4: số mình ghi, trong ngày), tính lại lần ghi ngay sau. */
function xoaChiSo_(user, data, ctx) {
  const maGhi = chu_(data.maGhi || data.MaGhi, 40);
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const bCS = docBang_('ChiSo', true);
    const r = timDong_(bCS, { MaGhi: maGhi });
    if (!r || r.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maGhi });
    const cuaMinhTrongNgay = chuanMaNV_(r.NguoiGhi) === user.MaNV && ngayCua_(r.GhiLuc) === homNay_();
    if (!coQuyen_(user, 'DUYET_CHI_SO') && !cuaMinhTrongNgay) throw loi_('KHONG_DU_QUYEN');
    if (r.Co === 'THAY_CONG_TO') throw loi_('CHI_SO_THAY_CONG_TO');
    const ct = timDong_(docBang_('CongTo', true), { MaCT: r.MaCT });
    const ds = chiSoCuaCongTo_(bCS, r.MaCT);
    const i = ds.indexOf(r);
    const dsMoi = ds.slice(0, i).concat(ds.slice(i + 1));
    const lyDo = chu_(data.lyDo, 300);
    const ghi = [{ MaGhi: maGhi, DaXoa: true, GhiChu: lyDo ? (r.GhiChu ? r.GhiChu + ' · ' : '') + 'Xóa: ' + lyDo : r.GhiChu }];
    if (i < dsMoi.length && ct) ghi.push(tinhLaiChiSo_(ct, dsMoi, i));
    ghiNhieu_('ChiSo', ghi, { nguoi: user.MaNV });
    ghiNhatKy_(user, 'XOA_CHI_SO', 'ChiSo', maGhi, { MaCT: r.MaCT, ChiSoBT: r.ChiSoBT, ChiSoCD: r.ChiSoCD, ChiSoTD: r.ChiSoTD, lyDo: lyDo },
      ctx && ctx.clientId);
    return { maGhi: maGhi };
  });
}

/**
 * Thay công tơ trong một lần ghi: dòng THAY_CONG_TO có chỉ số = số đầu công tơ mới, tiêu thụ = (số cuối công tơ cũ
 * − lần trước) × hệ số cũ; công tơ nhận hệ số nhân mới (nếu có), số tối đa mới, ngày lắp. Lần ghi sau tính từ số đầu
 * công tơ mới, nên ngày thay không bị âm hay vọt.
 * data: { maCT, soCuoiCu, soDauMoi, heSoMoi?, soToiDaMoi?, GhiLuc?, ghiChu?, anh?, xacNhan? }
 *   soCuoiCu / soDauMoi: số (công tơ 1 giá, nước) hoặc { BT, CD, TD } (công tơ 3 giá).
 */
function thayCongTo_(user, data, ctx) {
  const maCT = chuanMa_(data.maCT || data.MaCT);
  const ct0 = timDong_(docBang_('CongTo'), { MaCT: maCT });
  if (!maCT || !ct0 || ct0.DaXoa) throw loi_('KHONG_TIM_THAY', { ma: maCT });
  const tachSo = function (v, ten) {
    const o = {};
    khungCuaCongTo_(ct0).forEach(function (k) {
      o['ChiSo' + k] = typeof v === 'object' && v !== null ? v[k] : (k === 'BT' ? v : undefined);
    });
    try {
      return docChiSoNhap_(o, ct0);
    } catch (e) {
      throw loiTruong_('GIA_TRI_SAI', ten, { giaTri: JSON.stringify(v === undefined ? '' : v) });
    }
  };
  const soCuoi = tachSo(data.soCuoiCu, 'soCuoiCu');
  const soDau = tachSo(data.soDauMoi, 'soDauMoi');
  let heSoMoi = '';
  if (data.heSoMoi !== undefined && String(data.heSoMoi).trim() !== '') {
    heSoMoi = docSo_(data.heSoMoi);
    if (!(heSoMoi > 0)) throw loiTruong_('GIA_TRI_SAI', 'heSoMoi', { giaTri: data.heSoMoi });
  }
  let soToiDaMoi = '';
  if (data.soToiDaMoi !== undefined && String(data.soToiDaMoi).trim() !== '') {
    soToiDaMoi = docSo_(data.soToiDaMoi);
    if (!(soToiDaMoi > 0)) throw loiTruong_('GIA_TRI_SAI', 'SoToiDa', { giaTri: data.soToiDaMoi });
  }
  const ghiLuc = docGhiLuc_(data.GhiLuc);
  const ghiLucIso = bayGio_(ghiLuc);
  const ngayTinh = ngayTinhCua_(ghiLuc);
  let anhMoi = null;
  if (data.anh) anhMoi = luuAnhFile_(data.anh, 'CONG_TO', maCT);
  try {
    return voiKhoa_(function () {
      const trung = trungClientId_(ctx);
      if (trung) {
        boAnh_(anhMoi);
        return trung;
      }
      const ct = timDong_(docBang_('CongTo', true), { MaCT: maCT });
      const bCS = docBang_('ChiSo', true);
      const ds = chiSoCuaCongTo_(bCS, maCT);
      if (ds.length && String(ds[ds.length - 1].GhiLuc) > ghiLucIso) throw loi_('SO_LON_HON_SAU', gioThamSo_(ds[ds.length - 1].GhiLuc, 'luc'));
      const truoc = ds.length ? ds[ds.length - 1] : null;
      const thamSo = thamSoCanhBao_(ds, ngayTinh);
      const kq = kiemTraChiSo_(ct, truoc, Object.assign({ NgayTinh: ngayTinh, HeSo: ct.HeSoNhan }, soCuoi), thamSo);
      if (kq.chan) throw loiChanChiSo_(kq.chan, ct);
      if (kq.canXacNhan && !data.xacNhan) throw loiNghiSai_(kq.canXacNhan, ct, thamSo, kq);
      const khung = khungCuaCongTo_(ct);
      const vanBan = function (o) {
        return khung.map(function (k) { return (khung.length > 1 ? k + ' ' : '') + soVi_(o['ChiSo' + k]); }).join(' / ');
      };
      const heSoCu = kq.HeSoDung;
      const ghiChu = 'Thay công tơ: số cuối công tơ cũ ' + vanBan(soCuoi) + '; số đầu công tơ mới ' + vanBan(soDau) +
        '; hệ số ×' + soVi_(heSoCu) + (heSoMoi !== '' && heSoMoi !== heSoCu ? ' → ×' + soVi_(heSoMoi) : '') +
        (chu_(data.ghiChu, 300) ? ' · ' + chu_(data.ghiChu, 300) : '');
      const maGhi = taoMa_('CS', bCS.dong.map(function (d) { return d.MaGhi; }), true);
      ghiNhieu_('ChiSo', [{
        MaGhi: maGhi, ClientId: ctx && ctx.clientId ? ctx.clientId : '', MaCT: maCT, GhiLuc: ghiLucIso, NgayTinh: ngayTinh,
        NguoiGhi: user.MaNV, ChiSoBT: soDau.ChiSoBT, ChiSoCD: soDau.ChiSoCD, ChiSoTD: soDau.ChiSoTD,
        TieuThuBT: kq.TieuThuBT, TieuThuCD: kq.TieuThuCD, TieuThuTD: kq.TieuThuTD, TieuThu: kq.TieuThu, HeSoDung: heSoCu,
        Co: 'THAY_CONG_TO', AnhId: anhMoi ? anhMoi.anhId : '', GhiChu: ghiChu, NguoiDuyet: user.MaNV, DuyetLuc: bayGio_(), DaXoa: false
      }], { nguoi: user.MaNV });
      const doiCT = { MaCT: maCT, NgayLap: ngayCua_(ghiLucIso), TrangThai: 'DANG_DUNG' };
      if (heSoMoi !== '') doiCT.HeSoNhan = heSoMoi;
      if (soToiDaMoi !== '') doiCT.SoToiDa = soToiDaMoi;
      ghiNhieu_('CongTo', [doiCT], { nguoi: user.MaNV, chiSua: true });
      ghiNhatKy_(user, 'THAY_CONG_TO', 'ChiSo', maGhi, { MaCT: maCT, soCuoiCu: soCuoi, soDauMoi: soDau, heSoCu: heSoCu, heSoMoi: heSoMoi },
        ctx && ctx.clientId);
      return { maGhi: maGhi, maCT: maCT, tieuThuCongToCu: kq.TieuThu, heSo: heSoMoi !== '' ? heSoMoi : heSoCu };
    });
  } catch (e) {
    boAnh_(anhMoi);
    throw e;
  }
}

/**
 * Thêm, sửa công tơ (cấp 1–2): loại, đơn vị, khu vực, công tơ cha (cùng loại điện/nước, không vòng lặp),
 * hệ số nhân, số tối đa, định mức ngày, mã QR, trạng thái, ngày lắp. Công tơ đã có chỉ số không đổi loại được.
 */
function luuCongTo_(user, ct, ctx) {
  ct = ct && typeof ct === 'object' ? ct : {};
  const maCT = chuanMa_(ct.MaCT);
  if (!MA_HOP_LE.test(maCT)) throw loi_('MA_KHONG_HOP_LE', { ma: ct.MaCT === undefined ? '' : String(ct.MaCT) });
  const o = { MaCT: maCT };
  ['TenVi', 'TenZh', 'ViTri', 'GhiChu'].forEach(function (c) {
    if (ct[c] !== undefined) o[c] = chu_(ct[c], c === 'GhiChu' ? 500 : 200);
  });
  if (o.TenVi !== undefined && !o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
  if (ct.Loai !== undefined) o.Loai = maDanhMuc_('LOAI_CONG_TO', ct.Loai, 'Loai', true);
  if (ct.DonVi !== undefined) o.DonVi = chu_(ct.DonVi, 20);
  if (ct.KhuVuc !== undefined) o.KhuVuc = maDanhMuc_('KHU_VUC', ct.KhuVuc, 'KhuVuc', false);
  if (ct.MaCTCha !== undefined) o.MaCTCha = chuanMa_(ct.MaCTCha);
  if (ct.TrangThai !== undefined) o.TrangThai = maDanhMuc_('TRANG_THAI_CONG_TO', ct.TrangThai, 'TrangThai', true);
  if (ct.NgayLap !== undefined) o.NgayLap = chuanNgay_(ct.NgayLap, 'NgayLap', false);
  if (ct.MaQR !== undefined) o.MaQR = chu_(ct.MaQR, 100);
  [['HeSoNhan', false], ['SoToiDa', true], ['DinhMucNgay', true]].forEach(function (x) {
    const c = x[0];
    if (ct[c] === undefined) return;
    const trong = String(ct[c]).trim() === '';
    if (trong && x[1]) {
      o[c] = '';
      return;
    }
    const n = docSo_(ct[c]);
    if (!(n > 0)) throw loiTruong_('GIA_TRI_SAI', c, { giaTri: ct[c] });
    o[c] = n;
  });
  if (ct.xoa === true) o.DaXoa = true;
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('CongTo', true);
    const cu = timDong_(b, { MaCT: maCT });
    const laMoi = !cu || (cu.DaXoa && ct.xoa !== true);
    if (laMoi) {
      if (!o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
      if (!o.Loai) throw loiTruong_('THIEU_TRUONG', 'Loai');
      if (o.HeSoNhan === undefined) o.HeSoNhan = 1;
      if (o.TrangThai === undefined) o.TrangThai = 'DANG_DUNG';
      if (!o.MaQR) o.MaQR = maCT;
      o.DaXoa = false;
    } else if (ct.PhienBan !== undefined && ct.PhienBan !== null && ct.PhienBan !== '') {
      o._phienBan = ct.PhienBan;
    }
    const loai = o.Loai || (cu ? cu.Loai : '');
    if (o.DonVi === undefined && (laMoi || (o.Loai && cu && o.Loai !== cu.Loai))) o.DonVi = String(loai).indexOf('NUOC') === 0 ? 'm³' : 'kWh';
    if (cu && o.Loai && o.Loai !== cu.Loai) {
      const coSo = docBang_('ChiSo').dong.some(function (d) { return d.MaCT === maCT && !d.DaXoa; });
      if (coSo) throw loi_('LOAI_CONG_TO_KHOA', { ma: maCT });
    }
    if (o.MaCTCha) {
      const cha = timDong_(b, { MaCT: o.MaCTCha });
      if (!cha || cha.DaXoa) throw loiTruong_('KHONG_CO_TRONG_DANH_MUC', 'MaCTCha', { giaTri: o.MaCTCha });
      if (loaiDienNuoc_(cha) !== loaiDienNuoc_({ Loai: loai })) throw loiTruong_('GIA_TRI_SAI', 'MaCTCha', { giaTri: o.MaCTCha });
      if (taoVongCha_(b.dong, 'MaCT', 'MaCTCha', maCT, o.MaCTCha)) throw loiTruong_('VONG_LAP_CHA', 'MaCTCha');
    }
    if (o.MaQR) {
      const trungQR = b.dong.filter(function (d) { return !d.DaXoa && d.MaCT !== maCT && d.MaQR === o.MaQR; })[0];
      if (trungQR) throw loi_('TRUNG_MA', { ma: 'QR ' + o.MaQR + ' (' + trungQR.MaCT + ')' });
    }
    const kq = ghiNhieu_('CongTo', [o], { nguoi: user.MaNV });
    if (kq.xungDot.length) throw loiXungDot_(kq.xungDot[0], maCT);
    const g = kq.them[0] || kq.sua[0] || kq.khongDoi[0];
    ghiNhatKy_(user, laMoi ? 'THEM_CONG_TO' : (ct.xoa === true ? 'XOA_CONG_TO' : 'SUA_CONG_TO'), 'CongTo', maCT,
      { truoc: g.truoc || null, sau: g.sau || boCotNoiBo_(g.dong) }, ctx && ctx.clientId);
    return { maCT: maCT, laMoi: laMoi, phienBan: g.dong.PhienBan };
  });
}

/**
 * Lưu đơn giá điện 3 khung giờ và giá nước theo ngày hiệu lực (khóa: Loai + TuNgay). Dòng chờ điền sẵn
 * (TuNgay và DonGia trống) của cùng loại được điền vào thay vì thêm dòng mới.
 */
function luuBieuGia_(user, ds, ctx) {
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  if (ds.length > 100) throw loi_('QUA_NHIEU', { toiDa: 100 });
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('BieuGia', true);
    const daDung = {};
    const ra = ds.map(function (x) {
      x = x && typeof x === 'object' ? x : {};
      const loai = maDanhMuc_('LOAI_GIA', x.Loai, 'Loai', true);
      const tuNgay = chuanNgay_(x.TuNgay, 'TuNgay', true);
      if (x.xoa === true) return { Loai: loai, TuNgay: tuNgay, DaXoa: true };
      const gia = docSo_(x.DonGia);
      if (!(gia > 0)) throw loiTruong_('GIA_TRI_SAI', 'DonGia', { giaTri: x.DonGia === undefined ? '' : x.DonGia });
      const denNgay = chuanNgay_(x.DenNgay, 'DenNgay', false);
      if (denNgay && denNgay < tuNgay) throw loiTruong_('GIA_TRI_SAI', 'DenNgay', { giaTri: denNgay });
      const o = { Loai: loai, TuNgay: tuNgay, DonGia: gia, DenNgay: denNgay, GhiChu: chu_(x.GhiChu, 300), DaXoa: false };
      if (!timDong_(b, { Loai: loai, TuNgay: tuNgay })) {
        const cho = b.dong.filter(function (d) {
          return d.Loai === loai && d.TuNgay === '' && d.DonGia === '' && !d.DaXoa && !daDung[d._i];
        })[0];
        if (cho) {
          o._i = cho._i;
          daDung[cho._i] = true;
        }
      }
      return o;
    });
    const kq = ghiNhieu_('BieuGia', ra, { nguoi: user.MaNV });
    ghiNhatKy_(user, 'LUU_BIEU_GIA', 'BieuGia', '', { doi: kq.them.concat(kq.sua).map(function (x) { return boCotNoiBo_(x.dong); }) },
      ctx && ctx.clientId);
    return { them: kq.them.length, sua: kq.sua.length };
  });
}

/** Đơn giá theo loại và ngày: giá có TuNgay lớn nhất ≤ ngày, chưa hết hạn. */
function taoBangGia_() {
  const theoLoai = {};
  docBang_('BieuGia').dong.forEach(function (d) {
    if (d.DaXoa || !(Number(d.DonGia) > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.TuNgay))) return;
    (theoLoai[d.Loai] = theoLoai[d.Loai] || []).push(d);
  });
  Object.keys(theoLoai).forEach(function (k) {
    theoLoai[k].sort(function (a, b) { return a.TuNgay < b.TuNgay ? 1 : -1; });
  });
  return {
    coGia: Object.keys(theoLoai).length > 0,
    gia: function (loai, ngay) {
      const ds = theoLoai[loai] || [];
      for (let i = 0; i < ds.length; i++) {
        if (ds[i].TuNgay <= ngay && (!ds[i].DenNgay || ds[i].DenNgay >= ngay)) return Number(ds[i].DonGia);
      }
      return null;
    }
  };
}

/**
 * Số cho màn Tổng quan điện nước của một tháng: theo ngày (định mức, ngày vượt, bất thường, gộp), tổng tháng và
 * so tháng trước, 3 khung giờ, theo công tơ nhánh và khu vực (+ "Khác, chưa đo"), xu hướng 12 tháng, chi phí ước
 * tính theo BieuGia (chỉ cấp 1–2), tiến độ ghi hôm nay, chi tiết từng công tơ. Cache 10 phút, tự làm mới khi có
 * chỉ số, công tơ, bảng giá hay cấu hình mới.
 */
function tongHopDienNuoc_(user, thang) {
  const homNay = homNay_();
  thang = thang ? String(thang).trim() : homNay.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(thang)) throw loi_('THANG_SAI');
  const coChiPhi = coQuyen_(user, 'QUAN_LY_DIEN_NUOC');
  const dau = ['ChiSo', 'CongTo', 'BieuGia', 'CauHinh', 'NguoiDung'].map(mocBang_).join('#');
  const khoa = 'TH|' + thang + '|' + homNay + '|' + (coChiPhi ? 1 : 0) + '|' + bam_(dau);
  let kq = docCache_(khoa);
  if (!kq) {
    kq = tinhTongHop_(thang, homNay, coChiPhi);
    ghiCache_(khoa, kq);
  }
  const td = kq.tienDo;
  const gioNay = Utilities.formatDate(new Date(), MUI_GIO, 'HH:mm');
  td.quaHan = !!(td.gioHan && td.chuaGhi.length && gioNay >= td.gioHan);
  return kq;
}

function tinhTongHop_(thang, homNay, coChiPhi) {
  const lt = function (x) { return lamTron_(x, 2); };
  const dsCT = docBang_('CongTo').dong.filter(function (d) { return !d.DaXoa && d.MaCT; });
  const theoMa = Object.create(null);
  dsCT.forEach(function (c) { theoMa[c.MaCT] = c; });
  const chaHopLe = function (c) {
    const p = c.MaCTCha;
    return p && theoMa[p] && p !== c.MaCT && loaiDienNuoc_(theoMa[p]) === loaiDienNuoc_(c) &&
      !taoVongCha_(dsCT, 'MaCT', 'MaCTCha', c.MaCT, p) ? p : '';
  };
  const con = Object.create(null);
  dsCT.forEach(function (c) {
    const p = chaHopLe(c);
    if (p) (con[p] = con[p] || []).push(c.MaCT);
  });
  const soNgay = soNgayTrongThang_(thang);
  const cacThang = [];
  for (let k = 11; k >= 0; k--) cacThang.push(congThang_(thang, -k));
  const thangTruoc = cacThang[10];
  const tu = cacThang[0] + '-01';
  const den = thang + '-' + pad2_(soNgay);
  const theoCT = Object.create(null);
  docBang_('ChiSo').dong.forEach(function (d) {
    if (!d.DaXoa && theoMa[d.MaCT]) (theoCT[d.MaCT] = theoCT[d.MaCT] || []).push(d);
  });
  Object.keys(theoCT).forEach(function (m) { theoCT[m].sort(soSanhChiSo_); });
  const pb = Object.create(null);
  dsCT.forEach(function (c) { pb[c.MaCT] = phanBoNgay_(theoCT[c.MaCT] || [], tu, den); });
  const ngayCua = function (th, d) { return th + '-' + pad2_(d); };
  const tongThang = function (ma, th, denNgay) {
    const n = Math.min(soNgayTrongThang_(th), denNgay || 31);
    let s = 0;
    for (let d = 1; d <= n; d++) {
      const o = pb[ma].ngay[ngayCua(th, d)];
      if (o) s += o.tong;
    }
    return s;
  };
  const giaBang = coChiPhi ? taoBangGia_() : null;
  const chiPhiThang = function (dsGoc, th, loai) {
    if (!giaBang || !giaBang.coGia) return null;
    const kq = { tong: 0, BT: 0, CD: 0, TD: 0, khongChia: 0, thieuGia: false };
    const n = soNgayTrongThang_(th);
    dsGoc.forEach(function (c) {
      const baGia = String(c.Loai) === 'DIEN_3_GIA';
      for (let d = 1; d <= n; d++) {
        const ngay = ngayCua(th, d);
        const o = pb[c.MaCT].ngay[ngay];
        if (!o || !o.tong) continue;
        if (loai === 'nuoc') {
          const g = giaBang.gia('NUOC', ngay);
          if (g === null) kq.thieuGia = true;
          else kq.khongChia += o.tong * g;
        } else if (baGia) {
          ['BT', 'CD', 'TD'].forEach(function (k) {
            const g = giaBang.gia('DIEN_' + k, ngay);
            if (g === null) {
              if (o[k]) kq.thieuGia = true;
            } else {
              kq[k] += o[k] * g;
            }
          });
        } else {
          const g = giaBang.gia('DIEN_BT', ngay);
          if (g === null) kq.thieuGia = true;
          else kq.khongChia += o.tong * g;
        }
      }
    });
    kq.tong = kq.BT + kq.CD + kq.TD + kq.khongChia;
    Object.keys(kq).forEach(function (k) { if (typeof kq[k] === 'number') kq[k] = Math.round(kq[k]); });
    return kq;
  };
  const ngayCuoiCoSo = (function () {
    let cuoi = 0;
    dsCT.forEach(function (c) {
      for (let d = soNgay; d > cuoi; d--) {
        if (pb[c.MaCT].ngay[ngayCua(thang, d)]) {
          cuoi = d;
          break;
        }
      }
    });
    return cuoi;
  })();
  const tongHopLoai = function (loai) {
    const cua = dsCT.filter(function (c) { return loaiDienNuoc_(c) === loai; });
    const goc = cua.filter(function (c) { return !chaHopLe(c); });
    const la = cua.filter(function (c) { return !con[c.MaCT]; });
    const theoNgay = [];
    const ngayVuot = [];
    const ngayBatThuong = [];
    const ngayGop = [];
    const coDM = goc.filter(function (c) { return Number(c.DinhMucNgay) > 0; });
    const dinhMuc = coDM.length ? coDM.reduce(function (s, c) { return s + Number(c.DinhMucNgay); }, 0) : null;
    for (let d = 1; d <= soNgay; d++) {
      const ngay = ngayCua(thang, d);
      let s = 0;
      let sDM = 0;
      let co = false;
      goc.forEach(function (c) {
        const o = pb[c.MaCT].ngay[ngay];
        if (o) {
          s += o.tong;
          if (Number(c.DinhMucNgay) > 0) sDM += o.tong;
          co = true;
        }
        if (pb[c.MaCT].batThuong[ngay]) ngayBatThuong.indexOf(d) < 0 && ngayBatThuong.push(d);
        if (pb[c.MaCT].gop[ngay]) ngayGop.indexOf(d) < 0 && ngayGop.push(d);
      });
      theoNgay.push(co ? lt(s) : null);
      // So định mức với đúng các công tơ gốc có định mức (công tơ gốc chưa đặt định mức không làm lệch).
      if (co && dinhMuc !== null && sDM > dinhMuc) ngayVuot.push(d);
    }
    const tong = goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thang); }, 0);
    const tongTruoc = goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thangTruoc); }, 0);
    const cungKy = ngayCuoiCoSo ? goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thangTruoc, ngayCuoiCoSo); }, 0) : 0;
    const khung = { BT: 0, CD: 0, TD: 0, khongChia: 0 };
    goc.forEach(function (c) {
      for (let d = 1; d <= soNgay; d++) {
        const o = pb[c.MaCT].ngay[ngayCua(thang, d)];
        if (!o) continue;
        if (String(c.Loai) === 'DIEN_3_GIA') {
          khung.BT += o.BT;
          khung.CD += o.CD;
          khung.TD += o.TD;
        } else {
          khung.khongChia += o.tong;
        }
      }
    });
    Object.keys(khung).forEach(function (k) { khung[k] = lt(khung[k]); });
    const theoCongTo = la.map(function (c) { return { MaCT: c.MaCT, KhuVuc: c.KhuVuc || '', tong: lt(tongThang(c.MaCT, thang)) }; })
      .sort(function (a, b) { return b.tong - a.tong; });
    const kv = {};
    theoCongTo.forEach(function (x) { kv[x.KhuVuc] = (kv[x.KhuVuc] || 0) + x.tong; });
    let khac = 0;
    cua.forEach(function (c) {
      if (!con[c.MaCT]) return;
      const nhanh = con[c.MaCT].reduce(function (s, m) { return s + tongThang(m, thang); }, 0);
      khac += tongThang(c.MaCT, thang) - nhanh;
    });
    return {
      donVi: loai === 'nuoc' ? 'm³' : 'kWh', soCongTo: cua.length, tong: lt(tong), tongTruoc: lt(tongTruoc), cungKyTruoc: lt(cungKy),
      theoNgay: theoNgay, dinhMucNgay: dinhMuc, ngayVuot: ngayVuot, ngayBatThuong: ngayBatThuong.sort(function (a, b) { return a - b; }),
      ngayGop: ngayGop.sort(function (a, b) { return a - b; }), khungGio: loai === 'dien' ? khung : null,
      theoCongTo: theoCongTo, theoKhuVuc: Object.keys(kv).map(function (k) { return { KhuVuc: k, tong: lt(kv[k]) }; })
        .sort(function (a, b) { return b.tong - a.tong; }),
      khacChuaDo: lt(khac),
      xuHuong: cacThang.map(function (th) {
        return { thang: th, tong: lt(goc.reduce(function (s, c) { return s + tongThang(c.MaCT, th); }, 0)) };
      }),
      chiPhi: coChiPhi ? chiPhiThang(goc, thang, loai) : null,
      chiPhiThangTruoc: coChiPhi ? chiPhiThang(goc, thangTruoc, loai) : null
    };
  };
  const congTo = {};
  dsCT.forEach(function (c) {
    const ds = theoCT[c.MaCT] || [];
    const cuoi = ds.length ? ds[ds.length - 1] : null;
    const homNayGhi = ds.filter(function (d) { return ngayCua_(d.GhiLuc) === homNay; });
    const theoNgay = [];
    let cao = null;
    let tong = 0;
    let soNgayCo = 0;
    for (let d = 1; d <= soNgay; d++) {
      const o = pb[c.MaCT].ngay[ngayCua(thang, d)];
      theoNgay.push(o ? lt(o.tong) : null);
      if (o) {
        tong += o.tong;
        soNgayCo++;
        if (!cao || o.tong > cao.giaTri) cao = { ngay: d, giaTri: lt(o.tong) };
      }
    }
    const ngayIdx = function (m) {
      return Object.keys(m).filter(function (x) { return x.slice(0, 7) === thang; }).map(function (x) { return Number(x.slice(8)); })
        .sort(function (a, b) { return a - b; });
    };
    congTo[c.MaCT] = {
      loai: loaiDienNuoc_(c), tongThang: lt(tong), tbNgay: soNgayCo ? lt(tong / soNgayCo) : null, caoNhat: cao,
      theoNgay: theoNgay, ngayBatThuong: ngayIdx(pb[c.MaCT].batThuong), ngayGop: ngayIdx(pb[c.MaCT].gop),
      thang12: cacThang.map(function (th) { return lt(tongThang(c.MaCT, th)); }),
      cuoi: cuoi ? { MaGhi: cuoi.MaGhi, GhiLuc: cuoi.GhiLuc, NgayTinh: cuoi.NgayTinh, TieuThu: cuoi.TieuThu, Co: cuoi.Co, NguoiGhi: cuoi.NguoiGhi } : null,
      daGhiHomNay: homNayGhi.length ? String(homNayGhi[homNayGhi.length - 1].GhiLuc) : ''
    };
  });
  const dangDung = dsCT.filter(function (c) { return !c.TrangThai || c.TrangThai === 'DANG_DUNG'; });
  const chuaGhi = dangDung.filter(function (c) { return !congTo[c.MaCT].daGhiHomNay; }).map(function (c) { return c.MaCT; });
  const ch = cauHinh_();
  return {
    thang: thang, soNgay: soNgay, ngayCuoiCoSo: ngayCuoiCoSo, homNay: homNay, cacThang: cacThang,
    dien: tongHopLoai('dien'), nuoc: tongHopLoai('nuoc'), congTo: congTo,
    tienDo: {
      tong: dangDung.length, daGhi: dangDung.length - chuaGhi.length, chuaGhi: chuaGhi,
      gioGhi: String(ch.GIO_GHI_CHI_SO || ''), gioHan: String(ch.GIO_HAN_GHI_CHI_SO || ''), quaHan: false
    },
    coChiPhi: coChiPhi, tinhLuc: bayGio_()
  };
}

/** Lịch sử ghi của một công tơ trong khoảng ngày (mới nhất trước), tối đa 400 dòng. */
function lichSuChiSo_(user, data) {
  const maCT = chuanMa_(data.maCT || data.MaCT);
  if (!maCT) throw loiTruong_('THIEU_TRUONG', 'MaCT');
  const tu = data.tuNgay ? chuanNgay_(data.tuNgay, 'TuNgay', false) : '';
  const den = data.denNgay ? chuanNgay_(data.denNgay, 'DenNgay', false) : '';
  let gioiHan = docSo_(data.gioiHan);
  if (!(gioiHan > 0)) gioiHan = 100;
  gioiHan = Math.min(gioiHan, 400);
  const b = docBang_('ChiSo');
  const ds = b.dong.filter(function (d) {
    return d.MaCT === maCT && !d.DaXoa && (!tu || d.NgayTinh >= tu) && (!den || d.NgayTinh <= den);
  }).sort(soSanhChiSo_).reverse();
  return { maCT: maCT, tong: ds.length, bang: goiBang_({ ten: 'ChiSo' }, user, b, ds.slice(0, gioiHan)) };
}

// ───────────────────────── Quản trị ─────────────────────────

/** Danh mục: thêm, sửa tên, thứ tự, bật/tắt (KichHoat). Mã đã có không đổi; danh mục hệ thống chỉ sửa tên. */
function luuDanhMuc_(user, ds, ctx) {
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  if (ds.length > 500) throw loi_('QUA_NHIEU', { toiDa: 500 });
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('DanhMuc', true);
    const ra = ds.map(function (x) {
      x = x && typeof x === 'object' ? x : {};
      const loai = chuanMa_(x.Loai);
      const ma = chuanMa_(x.Ma);
      if (!MA_DANH_MUC_HOP_LE.test(loai)) throw loi_('MA_KHONG_HOP_LE', { ma: x.Loai === undefined ? '' : String(x.Loai) });
      if (!/^[A-Z0-9][A-Z0-9_.\-]{0,39}$/.test(ma)) throw loi_('MA_KHONG_HOP_LE', { ma: x.Ma === undefined ? '' : String(x.Ma) });
      const cu = timDong_(b, { Loai: loai, Ma: ma });
      const heThong = DANH_MUC_HE_THONG.indexOf(loai) >= 0;
      if (heThong && (!cu || x.KichHoat === false)) throw loi_('DANH_MUC_HE_THONG', { loai: loai });
      const o = { Loai: loai, Ma: ma };
      if (x.TenVi !== undefined) o.TenVi = chu_(x.TenVi, 200);
      if (x.TenZh !== undefined) o.TenZh = chu_(x.TenZh, 200);
      if (!cu && (!o.TenVi || !o.TenZh)) throw loiTruong_('THIEU_TRUONG', !o.TenVi ? 'TenVi' : 'TenZh');
      if (x.ThuTu !== undefined) {
        const t = docSo_(x.ThuTu);
        if (isNaN(t)) throw loiTruong_('GIA_TRI_SAI', 'ThuTu', { giaTri: x.ThuTu });
        o.ThuTu = t;
      } else if (!cu) {
        o.ThuTu = b.dong.filter(function (d) { return d.Loai === loai; })
          .reduce(function (m, d) { return Math.max(m, Number(d.ThuTu) || 0); }, 0) + 10;
      }
      if (x.KichHoat !== undefined) o.KichHoat = x.KichHoat !== false;
      else if (!cu) o.KichHoat = true;
      if (!cu) o.DaXoa = false;
      return o;
    });
    const kq = ghiNhieu_('DanhMuc', ra, { nguoi: user.MaNV });
    ghiNhatKy_(user, 'LUU_DANH_MUC', 'DanhMuc', '', { doi: kq.them.concat(kq.sua).map(function (x) { return hienKhoa_(x.khoa); }) },
      ctx && ctx.clientId);
    return { them: kq.them.length, sua: kq.sua.length };
  });
}

/** Mẫu thông số theo loại máy (thêm, sửa, xóa mềm). */
function luuMauThongSo_(user, ds, ctx) {
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  if (ds.length > 500) throw loi_('QUA_NHIEU', { toiDa: 500 });
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('MauThongSo', true);
    const ra = ds.map(function (x) {
      x = x && typeof x === 'object' ? x : {};
      const loaiTB = maDanhMuc_('LOAI_TB', x.LoaiTB, 'LoaiTB', true);
      const maTS = chuanMa_(x.MaTS);
      if (!MA_DANH_MUC_HOP_LE.test(maTS)) throw loi_('MA_KHONG_HOP_LE', { ma: x.MaTS === undefined ? '' : String(x.MaTS) });
      const o = { LoaiTB: loaiTB, MaTS: maTS };
      if (x.xoa === true) {
        o.DaXoa = true;
        return o;
      }
      const cu = timDong_(b, { LoaiTB: loaiTB, MaTS: maTS });
      if (x.TenVi !== undefined) o.TenVi = chu_(x.TenVi, 120);
      if (x.TenZh !== undefined) o.TenZh = chu_(x.TenZh, 120);
      if ((!cu || cu.DaXoa) && !o.TenVi) throw loiTruong_('THIEU_TRUONG', 'TenVi');
      if (x.Nhom !== undefined) o.Nhom = maDanhMuc_('NHOM_TS', x.Nhom, 'Nhom', true);
      if (x.DonVi !== undefined) o.DonVi = chu_(x.DonVi, 30);
      if (x.KieuDL !== undefined) o.KieuDL = maDanhMuc_('KIEU_DL', x.KieuDL, 'KieuDL', true);
      else if (!cu) o.KieuDL = 'CHU';
      if (x.BatBuoc !== undefined) o.BatBuoc = x.BatBuoc === true;
      if (x.ThuTu !== undefined) {
        const t = docSo_(x.ThuTu);
        if (isNaN(t)) throw loiTruong_('GIA_TRI_SAI', 'ThuTu', { giaTri: x.ThuTu });
        o.ThuTu = t;
      }
      if (!cu || cu.DaXoa) {
        o.DaXoa = false;
        if (o.Nhom === undefined) o.Nhom = 'VAN_HANH';
        if (o.ThuTu === undefined) {
          o.ThuTu = b.dong.filter(function (d) { return d.LoaiTB === loaiTB; })
            .reduce(function (m, d) { return Math.max(m, Number(d.ThuTu) || 0); }, 0) + 10;
        }
      }
      return o;
    });
    const kq = ghiNhieu_('MauThongSo', ra, { nguoi: user.MaNV });
    ghiNhatKy_(user, 'LUU_MAU_THONG_SO', 'MauThongSo', '', { doi: kq.them.concat(kq.sua).map(function (x) { return hienKhoa_(x.khoa); }) },
      ctx && ctx.clientId);
    return { them: kq.them.length, sua: kq.sua.length };
  });
}

/**
 * Từ điển nhãn giao diện. chiThemMoi = true (boSungTuDien): chỉ thêm khóa chưa có, không ghi đè bản dịch đã sửa —
 * app gọi khi nạp nhãn mặc định.
 */
function luuTuDien_(user, ds, ctx, chiThemMoi) {
  if (!Array.isArray(ds) || !ds.length) throw loi_('DU_LIEU_SAI');
  if (ds.length > 3000) throw loi_('QUA_NHIEU', { toiDa: 3000 });
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('TuDien', true);
    const daCo = layChiMuc_(b, 'Khoa');
    const ra = [];
    ds.forEach(function (x) {
      x = x && typeof x === 'object' ? x : {};
      const khoa = chu_(x.Khoa, 80);
      if (!/^[A-Za-z0-9_.\-]{1,80}$/.test(khoa)) throw loi_('MA_KHONG_HOP_LE', { ma: khoa });
      if (chiThemMoi && daCo[khoa]) return;
      const o = { Khoa: khoa };
      if (x.Vi !== undefined) o.Vi = chu_(x.Vi, 500);
      if (x.Zh !== undefined) o.Zh = chu_(x.Zh, 500);
      if (x.GhiChu !== undefined) o.GhiChu = chu_(x.GhiChu, 300);
      if (!daCo[khoa]) o.DaXoa = false;
      ra.push(o);
    });
    const kq = ghiNhieu_('TuDien', ra, { nguoi: user.MaNV });
    if (kq.them.length || kq.sua.length) {
      ghiNhatKy_(user, chiThemMoi ? 'BO_SUNG_TU_DIEN' : 'LUU_TU_DIEN', 'TuDien', '',
        { them: kq.them.length, sua: kq.sua.map(function (x) { return x.khoa; }).slice(0, 200) }, ctx && ctx.clientId);
    }
    return { them: kq.them.length, sua: kq.sua.length };
  });
}

/** Sửa cấu hình trong app: chỉ các khóa ở CAU_HINH_SUA_DUOC, đúng định dạng, đúng cấp. */
function luuCauHinh_(user, ds, ctx) {
  if (!ds || typeof ds !== 'object' || Array.isArray(ds)) throw loi_('DU_LIEU_SAI');
  const ra = Object.keys(ds).map(function (k) {
    const q = CAU_HINH_SUA_DUOC[k];
    if (!q || !Object.prototype.hasOwnProperty.call(CAU_HINH_SUA_DUOC, k)) throw loi_('KHONG_DU_QUYEN');
    if (user.Cap > q[0]) throw loi_('KHONG_DU_QUYEN');
    let v = chu_(ds[k], 40);
    const sai = function () { return loi_('GIA_TRI_SAI', { truong: k, truongZh: k, giaTri: v }); };
    if (q[1] === 'gio') {
      if (v && !/^([01]?\d|2[0-3])[:h.]([0-5]\d)$/.test(v)) throw sai();
      if (v) {
        const p = v.split(/[:h.]/);
        v = pad2_(Number(p[0])) + ':' + p[1];
      }
    } else if (q[1] === 'phienBan') {
      if (v && !/^\d+(\.\d+){0,3}$/.test(v)) throw sai();
    } else {
      const n = docSo_(v);
      if (isNaN(n) || n < q[2] || n > q[3] || (q[1] === 'nguyen' && Math.floor(n) !== n)) throw sai();
      v = String(n);
    }
    return { Khoa: k, GiaTri: v };
  });
  if (!ra.length) throw loi_('DU_LIEU_SAI');
  return voiKhoa_(function () {
    const trung = trungClientId_(ctx);
    if (trung) return trung;
    const b = docBang_('CauHinh', true);
    ra.forEach(function (o) {
      if (!timDong_(b, { Khoa: o.Khoa })) o.DaXoa = false;
    });
    const kq = ghiNhieu_('CauHinh', ra, { nguoi: user.MaNV });
    ghiNhatKy_(user, 'LUU_CAU_HINH', 'CauHinh', '', {
      truoc: kq.sua.map(function (x) { return x.truoc; }), sau: kq.sua.map(function (x) { return x.sau; })
    }, ctx && ctx.clientId);
    return { sua: kq.sua.length + kq.them.length, cauHinh: cauHinhCongKhai_() };
  });
}

/** Nhật ký hệ thống (mới nhất trước), lọc theo ngày, người, bảng, hành động; phân trang tu / gioiHan. */
function xemNhatKy_(user, loc) {
  loc = loc && typeof loc === 'object' ? loc : {};
  const tu = loc.tuNgay ? chuanNgay_(loc.tuNgay, 'TuNgay', false) : '';
  const den = loc.denNgay ? chuanNgay_(loc.denNgay, 'DenNgay', false) : '';
  const maNV = loc.maNV ? chuanMaNV_(loc.maNV) : '';
  const bang = chu_(loc.bang, 40);
  const hanhDong = chu_(loc.hanhDong, 40).toUpperCase();
  let tuViTri = docSo_(loc.tu);
  if (!(tuViTri >= 0)) tuViTri = 0;
  let gioiHan = docSo_(loc.gioiHan);
  if (!(gioiHan > 0)) gioiHan = 100;
  gioiHan = Math.min(gioiHan, 500);
  const b = docBang_('NhatKy');
  const ds = b.dong.filter(function (d) {
    const ngay = String(d.ThoiGian).slice(0, 10);
    return (!tu || ngay >= tu) && (!den || ngay <= den) && (!maNV || chuanMaNV_(d.MaNV) === maNV) &&
      (!bang || d.Bang === bang) && (!hanhDong || d.HanhDong === hanhDong);
  }).reverse();
  return { tong: ds.length, tu: tuViTri, bang: goiBang_({ ten: 'NhatKy' }, user, b, ds.slice(tuViTri, tuViTri + gioiHan)) };
}

// ───────────────────────── Tiện ích ─────────────────────────

/** Chữ: chuẩn NFC, bỏ ký tự điều khiển, cắt khoảng trắng hai đầu, giới hạn độ dài (mặc định 5.000). */
function chu_(v, toiDa) {
  if (v === null || v === undefined) return '';
  let s = (typeof v === 'string' ? v : String(v)).normalize('NFC').replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​﻿]/g, '').trim();
  const n = toiDa || 5000;
  if (s.length > n) s = s.slice(0, n).trim();
  return s;
}

/**
 * Làm sạch trước khi ghi vào ô chữ: như chu_, và chuỗi bắt đầu bằng = + - @ được thêm dấu nháy đơn
 * để Sheets không hiểu thành công thức (khi đọc, máy chủ bỏ dấu nháy này).
 */
function lamSach_(giaTri, toiDa) {
  return chanCongThuc_(chu_(giaTri, toiDa));
}

/**
 * Đọc số kiểu Việt và kiểu Anh: "7,5" = "7.5" = 7,5; "1.234,5" = "1,234.5" = 1234,5; "12.345.678" = 12345678.
 * Một dấu chấm theo sau đúng 3 chữ số (VD "4.000", "12.500") là phân nghìn kiểu Việt = 4000, 12500;
 * riêng chỉ số công tơ (thapPhan = true) một dấu chấm luôn là thập phân: "250.125" = 250,125 m³.
 * Một dấu phẩy luôn là thập phân. Sai dạng (VD "1.2.0") trả NaN. App nên gửi số dạng số JSON.
 */
function docSo_(v, thapPhan) {
  if (typeof v === 'number') return isFinite(v) ? v : NaN;
  if (v === null || v === undefined || typeof v === 'boolean' || v instanceof Date) return NaN;
  let s = String(v).normalize('NFC').replace(/[\s  ]/g, '');
  if (!s) return NaN;
  let dau = '';
  if (s.charAt(0) === '-' || s.charAt(0) === '+') {
    dau = s.charAt(0) === '-' ? '-' : '';
    s = s.slice(1);
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  const nhomNghin = function (x, k) {
    return new RegExp('^\\d{1,3}(\\' + k + '\\d{3})+$').test(x);
  };
  const coCham = s.indexOf('.') >= 0;
  const coPhay = s.indexOf(',') >= 0;
  if (coCham && coPhay) {
    const viTri = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
    const thapPhanKy = s.charAt(viTri);
    const nghin = thapPhanKy === ',' ? '.' : ',';
    const nguyen = s.slice(0, viTri);
    const le = s.slice(viTri + 1);
    if (nguyen.indexOf(thapPhanKy) >= 0 || !/^\d*$/.test(le)) return NaN;
    if (nguyen.indexOf(nghin) >= 0 && !nhomNghin(nguyen, nghin)) return NaN;
    s = nguyen.split(nghin).join('') + '.' + le;
  } else if (coCham || coPhay) {
    const k = coCham ? '.' : ',';
    const dem = s.split(k).length - 1;
    if (dem > 1) {
      if (!nhomNghin(s, k)) return NaN;
      s = s.split(k).join('');
    } else if (k === '.' && !thapPhan && s.charAt(0) !== '0' && nhomNghin(s, '.')) {
      s = s.replace('.', '');
    } else {
      s = s.replace(k, '.');
    }
  }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(dau + s);
}

function lamTron_(x, so) {
  const f = Math.pow(10, so === undefined ? 2 : so);
  return Math.round((Number(x) + (x >= 0 ? 1e-9 : -1e-9)) * f) / f;
}

/** Số kiểu Việt: 1.234,5 */
function soVi_(x, le) {
  return dinhDangSo_(x, le, '.', ',');
}

/** Số cho dòng Trung: 1,234.5 */
function soZh_(x, le) {
  return dinhDangSo_(x, le, ',', '.');
}

function dinhDangSo_(x, le, nghin, thapPhan) {
  const n = Number(x);
  if (!isFinite(n)) return String(x);
  const s = lamTron_(Math.abs(n), le === undefined ? 3 : le).toString();
  const p = s.split('.');
  return (n < 0 ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, nghin) + (p[1] ? thapPhan + p[1] : '');
}

/** Tham số giờ cho câu báo: { ten: 'HH:mm dd/MM', tenZh: 'MM-dd HH:mm' }. */
function gioThamSo_(v, ten) {
  const d = v instanceof Date ? v : new Date(String(v || ''));
  const o = {};
  if (isNaN(d.getTime())) {
    o[ten] = String(v || '');
    return o;
  }
  o[ten] = Utilities.formatDate(d, MUI_GIO, 'HH:mm dd/MM');
  o[ten + 'Zh'] = Utilities.formatDate(d, MUI_GIO, 'MM-dd HH:mm');
  return o;
}

function ngayVi_(ngay) {
  const p = String(ngay).split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(ngay);
}

/** Tên người theo mã NV (không có thì trả mã). */
function tenNguoi_(maNV) {
  const m = chuanMaNV_(maNV);
  if (!m) return '';
  if (m === 'SUA_TAY' || m === NGUOI_HE_THONG || m === 'CAI_DAT' || m === 'QUAN_TRI_SHEET') return m;
  try {
    const d = timNguoiDung_(m);
    return d && d.HoTen ? d.HoTen + ' (' + m + ')' : m;
  } catch (e) {
    return m;
  }
}

function homNay_() {
  return Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd');
}

/** Ngày (giờ Việt Nam) của một thời điểm ISO. */
function ngayCua_(iso) {
  const d = new Date(String(iso || ''));
  return isNaN(d.getTime()) ? '' : Utilities.formatDate(d, MUI_GIO, 'yyyy-MM-dd');
}

/** Số ghi sáng ngày D+1 tính cho ngày D. */
function ngayTinhCua_(d) {
  return Utilities.formatDate(new Date(d.getTime() - 86400000), MUI_GIO, 'yyyy-MM-dd');
}

/** Cộng n ngày vào 'YYYY-MM-DD' (không phụ thuộc múi giờ). */
function congNgay_(ngay, n) {
  const p = String(ngay).split('-');
  const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n));
  return d.getUTCFullYear() + '-' + pad2_(d.getUTCMonth() + 1) + '-' + pad2_(d.getUTCDate());
}

function soNgayGiua_(a, b) {
  const x = String(a).split('-');
  const y = String(b).split('-');
  return Math.round((Date.UTC(Number(y[0]), Number(y[1]) - 1, Number(y[2])) - Date.UTC(Number(x[0]), Number(x[1]) - 1, Number(x[2]))) / 86400000);
}

function congThang_(thang, n) {
  const p = String(thang).split('-');
  const t = Number(p[0]) * 12 + Number(p[1]) - 1 + n;
  return Math.floor(t / 12) + '-' + pad2_(t % 12 + 1);
}

function soNgayTrongThang_(thang) {
  const p = String(thang).split('-');
  return new Date(Date.UTC(Number(p[0]), Number(p[1]), 0)).getUTCDate();
}

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

/** Ngày từ app: 'YYYY-MM-DD', 'DD/MM/YYYY' hoặc Date → 'YYYY-MM-DD'. */
function chuanNgay_(v, truong, batBuoc) {
  if (v instanceof Date && !isNaN(v.getTime())) return Utilities.formatDate(v, MUI_GIO, 'yyyy-MM-dd');
  const s = chu_(v, 30);
  if (!s) {
    if (batBuoc) throw loiTruong_('THIEU_TRUONG', truong);
    return '';
  }
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(T.*)?$/);
  let y;
  let mo;
  let d;
  if (m) {
    y = Number(m[1]);
    mo = Number(m[2]);
    d = Number(m[3]);
  } else {
    m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (!m) throw loiTruong_('GIA_TRI_SAI', truong, { giaTri: s });
    d = Number(m[1]);
    mo = Number(m[2]);
    y = Number(m[3]);
  }
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (y < 1900 || y > 2200 || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) throw loiTruong_('GIA_TRI_SAI', truong, { giaTri: s });
  return y + '-' + pad2_(mo) + '-' + pad2_(d);
}

/** Giờ ghi từ app (máy mất mạng gửi muộn): không ở tương lai quá 10 phút, không cũ hơn 30 ngày. */
function docGhiLuc_(v) {
  const bayGio = Date.now();
  if (v === undefined || v === null || v === '') return new Date(bayGio);
  const d = new Date(String(v));
  if (isNaN(d.getTime()) || d.getTime() > bayGio + 10 * 60000 || d.getTime() < bayGio - 30 * 86400000) throw loi_('GIO_GHI_SAI');
  return d;
}

/** Mã thiết bị, công tơ, mã thông số: bỏ khoảng trắng, chữ in hoa. */
function chuanMa_(v) {
  return String(v === null || v === undefined ? '' : v).normalize('NFC').replace(/\s+/g, '').toUpperCase();
}

/** Mã linh kiện theo app kho: giữ chữ hoa thường, bỏ khoảng trắng thừa. */
function chuanMaLK_(v) {
  return String(v === null || v === undefined ? '' : v).normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** Chuẩn để so trùng: bỏ dấu tiếng Việt, chữ thường, gộp khoảng trắng. */
function chuanSoSanh_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

/** "A, B" hoặc mảng → mảng chuỗi đã cắt khoảng trắng. */
function tachDs_(v) {
  if (Array.isArray(v)) return v.map(function (x) { return chu_(x, 60); }).filter(String);
  return String(v === null || v === undefined ? '' : v).split(/[,;]/).map(function (x) { return x.trim(); }).filter(String);
}

function boTrung_(ds) {
  const co = Object.create(null);
  return ds.filter(function (x) {
    if (co[x]) return false;
    co[x] = true;
    return true;
  });
}

function boCotNoiBo_(d) {
  const o = Object.assign({}, d);
  delete o._so;
  delete o._i;
  return o;
}

/** Mã băm ngắn (MD5, hex) cho khóa cache. */
function bam_(s) {
  return byteSangHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(s), Utilities.Charset.UTF_8));
}

function soSanhPhienBan_(a, b) {
  const x = String(a).split('.').map(Number);
  const y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const p = x[i] || 0;
    const q = y[i] || 0;
    if (p !== q) return p < q ? -1 : 1;
  }
  return 0;
}

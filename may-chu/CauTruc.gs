/**
 * ME – Quản lý Cơ điện · 机电管理系统
 * CauTruc.gs — cấu trúc 20 sheet dữ liệu và các hàm dùng chung (mở file, đọc tiêu đề, giờ Việt Nam).
 *
 * Nguồn chuẩn: tài liệu "Khung app Quản lý Cơ điện", mục Cấu trúc Google Sheets.
 * Muốn thêm cột: ghi tên cột vào CUỐI danh sách `cot` của bảng, rồi chạy lại menu ME → Cài đặt.
 * Code luôn đọc cột theo tên ở dòng 1, nên thêm cột không làm hỏng dữ liệu cũ.
 *
 * Kiểu cột
 *   - Mặc định là CHỮ: ô định dạng Văn bản thuần, giữ số 0 đầu mã và giữ ngày giờ dạng ISO
 *     (VD 2026-10-02T07:05:00.000+07:00) không bị Sheets tự đổi kiểu.
 *   - Cột ghi trong `so` là SỐ; cột ghi trong `dung` là ĐÚNG/SAI (TRUE/FALSE).
 * Mọi sheet, trừ NhatKy (chỉ ghi thêm), có 4 cột hệ thống ở cuối:
 *   CapNhatLuc, CapNhatBoi, PhienBan (tăng 1 mỗi lần sửa), DaXoa (xóa mềm).
 *
 * Phiên bản cấu trúc
 *   1 (bước 1, 02/10/2026): 20 sheet.
 *   2 (bước 2, 02/10/2026): thêm LinhKienTB.TrangThaiDuyet (kỹ thuật viên đề xuất gắn linh kiện, chờ duyệt),
 *     CongTo.NgayLap và CongTo.GhiChu. Máy chủ (Code.gs) cần phiên bản 2: dán tệp này rồi chạy lại menu ME → Cài đặt.
 */

const PHIEN_BAN_CAU_TRUC = 2;
const MUI_GIO = 'Asia/Ho_Chi_Minh';
const COT_HE_THONG = ['CapNhatLuc', 'CapNhatBoi', 'PhienBan', 'DaXoa'];

/** Nhóm sheet: tên và màu tab trong file Sheets. */
const NHOM_BANG = {
  HE_THONG:         { ten: 'Hệ thống',            mau: '#667085' },
  THIET_BI:         { ten: 'Thiết bị',            mau: '#1B365D' },
  KHO:              { ten: 'Kho linh kiện',       mau: '#FFC72C' },
  SUA_CHUA_BAO_TRI: { ten: 'Sửa chữa và bảo trì', mau: '#B54708' },
  DIEN_NUOC:        { ten: 'Điện nước',           mau: '#2A78D6' }
};

/**
 * 20 sheet theo đúng thứ tự trong file.
 * khoa: cột (hoặc nhóm cột) xác định một dòng — dùng khi thêm/sửa theo khóa.
 */
const BANG = [
  // ── Hệ thống ──
  { ten: 'CauHinh', nhom: 'HE_THONG', khoa: ['Khoa'],
    cot: ['Khoa', 'GiaTri', 'MoTa'] },
  { ten: 'NguoiDung', nhom: 'HE_THONG', khoa: ['MaNV'],
    cot: ['MaNV', 'HoTen', 'BoPhan', 'ChucVuVi', 'ChucVuZh', 'Cap', 'QuyenThem', 'PinHash', 'PinSalt',
          'PhaiDoiPin', 'SaiPin', 'KhoaDen', 'TokenVer', 'TrangThai'],
    so: ['Cap', 'SaiPin', 'TokenVer'], dung: ['PhaiDoiPin'] },
  { ten: 'TuDien', nhom: 'HE_THONG', khoa: ['Khoa'],
    cot: ['Khoa', 'Vi', 'Zh', 'GhiChu'] },
  { ten: 'DanhMuc', nhom: 'HE_THONG', khoa: ['Loai', 'Ma'],
    cot: ['Loai', 'Ma', 'TenVi', 'TenZh', 'ThuTu', 'KichHoat'],
    so: ['ThuTu'], dung: ['KichHoat'] },
  { ten: 'NhatKy', nhom: 'HE_THONG', khoa: [], chiGhiThem: true,
    cot: ['ThoiGian', 'MaNV', 'HanhDong', 'Bang', 'MaBanGhi', 'TruocSau', 'ClientId'] },

  // ── Thiết bị ──
  { ten: 'ThietBi', nhom: 'THIET_BI', khoa: ['MaTB'],
    cot: ['MaTB', 'TenVi', 'TenZh', 'LoaiTB', 'KhuVuc', 'ViTri', 'HangSX', 'Model', 'SoSeri', 'NamSX',
          'NgayDuaVaoSD', 'MucQuanTrong', 'TrangThai', 'NguoiPhuTrach', 'MaTBCha', 'AnhId', 'TaiLieuUrl', 'GhiChu'],
    so: ['NamSX'] },
  { ten: 'MauThongSo', nhom: 'THIET_BI', khoa: ['LoaiTB', 'MaTS'],
    cot: ['LoaiTB', 'MaTS', 'TenVi', 'TenZh', 'Nhom', 'DonVi', 'KieuDL', 'BatBuoc', 'ThuTu'],
    so: ['ThuTu'], dung: ['BatBuoc'] },
  { ten: 'ThongSoTB', nhom: 'THIET_BI', khoa: ['MaTB', 'MaTS'],
    cot: ['MaTB', 'MaTS', 'TenVi', 'TenZh', 'Nhom', 'GiaTri', 'DonVi', 'ThuTu'],
    so: ['ThuTu'] },
  { ten: 'LinhKienTB', nhom: 'THIET_BI', khoa: ['MaTB', 'MaLK'],
    cot: ['MaTB', 'MaLK', 'ViTriLapVi', 'ViTriLapZh', 'SoLuongLap', 'ChuKyThay', 'DonViChuKy', 'LanThayCuoi', 'GhiChu',
          'TrangThaiDuyet'],
    so: ['SoLuongLap', 'ChuKyThay'] },

  // ── Kho linh kiện ──
  // KhoLinhKien: 8 cột đầu lấy từ file kho tuần; các cột sau là của app, nhập file không ghi đè.
  { ten: 'KhoLinhKien', nhom: 'KHO', khoa: ['MaLK'],
    cot: ['MaLK', 'TenVi', 'QuyCach', 'DVT', 'TonKho', 'DonGia', 'ViTriKho', 'NgayFile',
          'TenZh', 'DichMay', 'NhomLK', 'MaNSX', 'TonToiThieu', 'AnhId', 'Nguon', 'TrangThaiFile', 'TrangThaiDuyet', 'GhiChu'],
    so: ['TonKho', 'DonGia', 'TonToiThieu'], dung: ['DichMay'] },
  { ten: 'LanNhapKho', nhom: 'KHO', khoa: ['MaLan'],
    cot: ['MaLan', 'TenFile', 'NgayFile', 'NguoiNhap', 'BatDau', 'KetThuc', 'TongDong', 'Moi', 'ThayDoi',
          'KhongDoi', 'VangMat', 'Loi', 'TrangThai'],
    so: ['TongDong', 'Moi', 'ThayDoi', 'KhongDoi', 'VangMat', 'Loi'] },
  { ten: 'GhepCotKho', nhom: 'KHO', khoa: ['TruongApp'],
    cot: ['CotFile', 'TruongApp', 'BatBuoc', 'ChuyenDoi'],
    dung: ['BatBuoc'] },

  // ── Sửa chữa và bảo trì (dùng ở đợt 2, tạo sẵn từ bây giờ) ──
  { ten: 'PhieuSuaChua', nhom: 'SUA_CHUA_BAO_TRI', khoa: ['MaPhieu'],
    cot: ['MaPhieu', 'ClientId', 'MaTB', 'NguoiBao', 'BaoLuc', 'MoTaVi', 'MoTaZh', 'UuTien', 'TrangThai', 'NguoiNhan',
          'BatDau', 'KetThuc', 'PhutDungMay', 'NguyenNhan', 'CachSuaVi', 'CachSuaZh', 'NguoiNghiemThu', 'NghiemThuLuc',
          'AnhTruoc', 'AnhSau'],
    so: ['PhutDungMay'] },
  { ten: 'LinhKienDung', nhom: 'SUA_CHUA_BAO_TRI', khoa: ['MaPhieu', 'MaLK'],
    cot: ['MaPhieu', 'MaLK', 'SoLuong', 'GhiChu'],
    so: ['SoLuong'] },
  { ten: 'KeHoachBT', nhom: 'SUA_CHUA_BAO_TRI', khoa: ['MaKH'],
    cot: ['MaKH', 'MaTB', 'CongViecVi', 'CongViecZh', 'ChuKy', 'DonViChuKy', 'MaChecklist', 'LanGanNhat', 'LanToiHan',
          'NguoiPhuTrach', 'KichHoat'],
    so: ['ChuKy'], dung: ['KichHoat'] },
  { ten: 'ChecklistMau', nhom: 'SUA_CHUA_BAO_TRI', khoa: ['MaChecklist', 'STT'],
    cot: ['MaChecklist', 'STT', 'NoiDungVi', 'NoiDungZh', 'KieuKQ', 'Min', 'Max', 'DonVi'],
    so: ['STT', 'Min', 'Max'] },
  { ten: 'PhieuBaoTri', nhom: 'SUA_CHUA_BAO_TRI', khoa: ['MaPhieuBT'],
    cot: ['MaPhieuBT', 'ClientId', 'MaKH', 'MaTB', 'HanLam', 'NgayLam', 'NguoiLam', 'KetQua', 'KetQuaChiTiet',
          'GhiChuVi', 'GhiChuZh', 'AnhId'] },

  // ── Điện nước ──
  { ten: 'CongTo', nhom: 'DIEN_NUOC', khoa: ['MaCT'],
    cot: ['MaCT', 'TenVi', 'TenZh', 'Loai', 'DonVi', 'KhuVuc', 'ViTri', 'MaCTCha', 'HeSoNhan', 'SoToiDa',
          'DinhMucNgay', 'MaQR', 'TrangThai', 'NgayLap', 'GhiChu'],
    so: ['HeSoNhan', 'SoToiDa', 'DinhMucNgay'] },
  { ten: 'ChiSo', nhom: 'DIEN_NUOC', khoa: ['MaGhi'],
    cot: ['MaGhi', 'ClientId', 'MaCT', 'GhiLuc', 'NgayTinh', 'NguoiGhi', 'ChiSoBT', 'ChiSoCD', 'ChiSoTD',
          'TieuThuBT', 'TieuThuCD', 'TieuThuTD', 'TieuThu', 'HeSoDung', 'Co', 'AnhId', 'GhiChu', 'NguoiDuyet', 'DuyetLuc'],
    so: ['ChiSoBT', 'ChiSoCD', 'ChiSoTD', 'TieuThuBT', 'TieuThuCD', 'TieuThuTD', 'TieuThu', 'HeSoDung'] },
  { ten: 'BieuGia', nhom: 'DIEN_NUOC', khoa: ['Loai', 'TuNgay'],
    cot: ['Loai', 'DonGia', 'TuNgay', 'DenNgay', 'GhiChu'],
    so: ['DonGia'] }
];

/**
 * Ghi chú hiện khi rê chuột vào ô tiêu đề (dòng 1) — giúp quản trị hiểu cột khi xem hoặc sửa tay.
 * Khóa "Bang.Cot" cho cột riêng của bảng; khóa "Cot" dùng chung mọi bảng.
 */
const GHI_CHU_COT = {
  // Cột hệ thống
  'CapNhatLuc': 'Lần sửa cuối, giờ Việt Nam dạng ISO. App tự ghi.',
  'CapNhatBoi': 'Mã NV người sửa cuối (SUA_TAY = sửa tay trong file). App tự ghi.',
  'PhienBan': 'Tăng 1 mỗi lần sửa, để đồng bộ và chống ghi đè. App tự ghi.',
  'DaXoa': 'TRUE = đã xóa (xóa mềm). Muốn bỏ một dòng thì đặt TRUE, không xóa dòng thật.',
  'ClientId': 'Mã ngẫu nhiên của thao tác trên máy, chống ghi trùng khi mạng chập chờn. App tự ghi.',
  'AnhId': 'ID ảnh trên Google Drive. App tự ghi.',

  // Hệ thống
  'CauHinh.Khoa': 'Tên thông số. Không đổi tên.',
  'CauHinh.GiaTri': 'Giá trị. Số thập phân viết 7,5 hay 7.5 đều được; giờ viết dạng 07:00.',
  'NguoiDung.MaNV': 'Mã nhân viên để đăng nhập: chữ in hoa không dấu, số, . - _ (2–20 ký tự).',
  'NguoiDung.BoPhan': 'Mã bộ phận trong DanhMuc loại BO_PHAN, VD TO_DIEN.',
  'NguoiDung.Cap': 'Cấp quyền 1–5: 1 Quản trị hệ thống · 2 Trưởng bộ phận cơ điện · 3 Tổ trưởng, giám sát ca · 4 Kỹ thuật viên · 5 Người báo hỏng, người xem.',
  'NguoiDung.QuyenThem': 'Quyền lẻ ngoài cấp, cách nhau dấu phẩy. VD NHAP_KHO = được cập nhật file kho tuần.',
  'NguoiDung.PinHash': 'Bản băm của PIN, không phải PIN thật. Không sửa tay: dùng menu ME → Cấp PIN tạm.',
  'NguoiDung.PinSalt': 'Muối của PIN. Không sửa tay.',
  'NguoiDung.PhaiDoiPin': 'TRUE = lần đăng nhập tới phải đổi PIN.',
  'NguoiDung.SaiPin': 'Số lần nhập sai PIN liên tiếp.',
  'NguoiDung.KhoaDen': 'Bị khóa đến thời điểm này sau nhiều lần sai PIN. Xóa trống để mở khóa ngay.',
  'NguoiDung.TokenVer': 'Tăng 1 để đăng xuất người này khỏi mọi máy.',
  'NguoiDung.TrangThai': 'HOAT_DONG hoặc NGUNG (ngừng thì không đăng nhập được).',
  'TuDien.Khoa': 'Khóa nhãn giao diện, app dùng để tra. Không đổi.',
  'TuDien.Zh': 'Tiếng Trung giản thể. Sửa ở đây là app đổi theo, không cần sửa code.',
  'DanhMuc.Loai': 'Loại danh sách, VD KHU_VUC, LOAI_TB, DVT, NHOM_LK. Thông số kiểu chọn dùng Loai = MaTS của thông số.',
  'DanhMuc.Ma': 'Mã lưu trong dữ liệu. Đã dùng thì không đổi mã; muốn bỏ thì đặt KichHoat = FALSE.',
  'DanhMuc.KichHoat': 'FALSE = ẩn khỏi danh sách chọn; dữ liệu cũ vẫn hiện đúng tên.',
  'NhatKy.TruocSau': 'Giá trị trước và sau khi sửa (JSON). Không bao giờ chứa PIN.',

  // Thiết bị
  'ThietBi.MaTB': 'Mã máy, VD MNK-01. Đã dùng thì không đổi.',
  'ThietBi.LoaiTB': 'Mã loại máy trong DanhMuc LOAI_TB; quyết định mẫu thông số.',
  'ThietBi.KhuVuc': 'Mã khu vực trong DanhMuc KHU_VUC.',
  'ThietBi.NgayDuaVaoSD': 'Ngày đưa vào sử dụng, dạng 2020-03-15.',
  'ThietBi.MucQuanTrong': 'A, B hoặc C (DanhMuc MUC_QUAN_TRONG).',
  'ThietBi.TrangThai': 'Mã trong DanhMuc TRANG_THAI_TB.',
  'ThietBi.NguoiPhuTrach': 'Mã NV phụ trách máy.',
  'ThietBi.MaTBCha': 'Mã máy cha khi khai báo cụm máy (VD máy sấy khí đi kèm máy nén). Để trống nếu không dùng.',
  'MauThongSo.MaTS': 'Mã thông số không dấu, VD CONG_SUAT.',
  'MauThongSo.Nhom': 'DIEN, CO hoặc VAN_HANH (DanhMuc NHOM_TS).',
  'MauThongSo.KieuDL': 'SO (số), CHU (chữ) hoặc CHON (chọn từ DanhMuc có Loai = MaTS).',
  'MauThongSo.BatBuoc': 'TRUE = bắt buộc nhập khi thêm máy.',
  'ThongSoTB.GiaTri': 'Giá trị thông số của máy này.',
  'LinhKienTB.ChuKyThay': 'Chu kỳ thay, đơn vị ở cột DonViChuKy.',
  'LinhKienTB.DonViChuKy': 'GIO (giờ chạy), NGAY, TUAN, THANG hoặc NAM.',
  'LinhKienTB.LanThayCuoi': 'Ngày thay gần nhất, dạng 2026-09-28.',
  'LinhKienTB.TrangThaiDuyet': 'CHO_DUYET = kỹ thuật viên cấp 4 đề xuất, chờ cấp 1–3 duyệt; DA_DUYET hoặc để trống = đã duyệt.',

  // Kho linh kiện
  'KhoLinhKien.MaLK': 'Mã vật tư theo app kho. Mã tạm do app cấp dạng TẠM-0001.',
  'KhoLinhKien.NgayFile': 'Ngày của file tồn kho đã nhập.',
  'KhoLinhKien.DichMay': 'TRUE = tên Trung do máy dịch, chờ người biết tiếng Trung duyệt.',
  'KhoLinhKien.TonToiThieu': 'Tồn tối thiểu; tồn dưới số này app báo thiếu.',
  'KhoLinhKien.Nguon': 'FILE (từ file kho) hoặc THU_CONG (thêm tay trong app).',
  'KhoLinhKien.TrangThaiFile': 'CO_TRONG_FILE hoặc KHONG_CON (không còn trong file tuần gần nhất).',
  'KhoLinhKien.TrangThaiDuyet': 'CHO_DUYET hoặc DA_DUYET.',
  'GhepCotKho.CotFile': 'Tên cột trong file kho, VD "Mã vật tư".',
  'GhepCotKho.TruongApp': 'Trường của app, VD MaLK, TenVi, TonKho.',
  'GhepCotKho.ChuyenDoi': 'Cách chuyển dữ liệu nếu cần; để trống là giữ nguyên.',

  // Điện nước
  'CongTo.MaCT': 'Mã công tơ, VD CT-01; đồng hồ nước VD DN-01.',
  'CongTo.Loai': 'DIEN_1_GIA, DIEN_3_GIA hoặc NUOC.',
  'CongTo.DonVi': 'kWh hoặc m³.',
  'CongTo.KhuVuc': 'Mã khu vực trong DanhMuc KHU_VUC.',
  'CongTo.MaCTCha': 'Công tơ tổng phía trên, để tính phần "Khác, chưa đo".',
  'CongTo.HeSoNhan': 'Hệ số nhân TU × TI; công tơ đấu trực tiếp ghi 1. Chỉ cấp 1–2 sửa.',
  'CongTo.SoToiDa': 'Số lớn nhất mặt công tơ hiện được trước khi quay về 0, VD 99999,99.',
  'CongTo.DinhMucNgay': 'Định mức mỗi ngày (kWh hoặc m³). Để trống thì không vẽ đường định mức.',
  'CongTo.MaQR': 'Nội dung tem QR dán trên công tơ.',
  'CongTo.TrangThai': 'DANG_DUNG, NGUNG hoặc DA_THAY.',
  'CongTo.NgayLap': 'Ngày lắp công tơ đang dùng, dạng 2024-03-15. Thay công tơ trong app thì tự ghi.',
  'CongTo.GhiChu': 'Ghi chú, VD biến dòng TI 200/5.',
  'ChiSo.NgayTinh': 'Ngày được tính tiêu thụ: số ghi sáng D+1 tính cho ngày D.',
  'ChiSo.ChiSoBT': 'Số trên mặt công tơ. Công tơ 1 giá và đồng hồ nước chỉ dùng cột này.',
  'ChiSo.HeSoDung': 'Hệ số nhân đã dùng khi tính lần ghi này.',
  'ChiSo.Co': 'BINH_THUONG, BAT_THUONG, GOP hoặc THAY_CONG_TO. Dòng thay công tơ: chỉ số là số đầu của công tơ mới, tiêu thụ là phần của công tơ cũ.',
  'BieuGia.Loai': 'DIEN_BT, DIEN_CD, DIEN_TD hoặc NUOC.',
  'BieuGia.DonGia': 'Đơn giá: đồng/kWh với điện, đồng/m³ với nước. Để trống thì app ẩn chi phí.',
  'BieuGia.TuNgay': 'Ngày bắt đầu áp dụng, dạng 2026-10-01.',
  'BieuGia.DenNgay': 'Ngày hết áp dụng; để trống = đang áp dụng.'
};

// ───────────────────────── Hàm dùng chung ─────────────────────────

/** Định nghĩa bảng theo tên sheet, không có thì trả null. */
function timBang_(ten) {
  for (let i = 0; i < BANG.length; i++) {
    if (BANG[i].ten === ten) return BANG[i];
  }
  return null;
}

/** Danh sách cột đầy đủ của bảng (kèm cột hệ thống nếu có). */
function cotCuaBang_(def) {
  return def.chiGhiThem ? def.cot.slice() : def.cot.concat(COT_HE_THONG);
}

/** Kiểu cột: 'chu' | 'so' | 'dung'. */
function kieuCot_(def, cot) {
  if (cot === 'PhienBan') return 'so';
  if (cot === 'DaXoa') return 'dung';
  if (def && def.so && def.so.indexOf(cot) >= 0) return 'so';
  if (def && def.dung && def.dung.indexOf(cot) >= 0) return 'dung';
  return 'chu';
}

function ghiChuCot_(tenBang, cot) {
  return GHI_CHU_COT[tenBang + '.' + cot] || GHI_CHU_COT[cot] || '';
}

/** Số cột → chữ cột (1 → A, 27 → AA). */
function chuCot_(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Đọc dòng tiêu đề, bỏ khoảng trắng hai đầu và các ô trống ở cuối. */
function docTieuDe_(sh) {
  const n = sh.getLastColumn();
  if (n < 1) return [];
  const t = sh.getRange(1, 1, 1, n).getValues()[0].map(function (v) { return String(v).trim(); });
  while (t.length && t[t.length - 1] === '') t.pop();
  return t;
}

let FILE_DANG_MO_ = null;

/** Mở file Sheets dữ liệu (ID lưu khi cài đặt), dùng được cả khi chạy từ Web App hoặc trigger. */
function moFile_() {
  if (FILE_DANG_MO_) return FILE_DANG_MO_;
  const id = PropertiesService.getScriptProperties().getProperty('ID_SHEETS');
  FILE_DANG_MO_ = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!FILE_DANG_MO_) throw new Error('Chưa cài đặt: mở file Sheets → menu ME → Cài đặt.');
  return FILE_DANG_MO_;
}

/** Thời điểm hiện tại theo giờ Việt Nam, dạng ISO: 2026-10-02T07:05:00.000+07:00 */
function bayGio_(d) {
  d = d || new Date();
  const z = Utilities.formatDate(d, MUI_GIO, 'Z'); // +0700
  return Utilities.formatDate(d, MUI_GIO, "yyyy-MM-dd'T'HH:mm:ss.SSS") + z.slice(0, 3) + ':' + z.slice(3);
}

/** TRUE/true/'TRUE' → true. */
function laDung_(v) {
  return v === true || String(v).trim().toUpperCase() === 'TRUE';
}

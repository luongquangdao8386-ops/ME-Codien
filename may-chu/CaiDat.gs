/**
 * ME – Quản lý Cơ điện · 机电管理系统
 * CaiDat.gs — cài đặt lần đầu và công cụ quản trị ngay trên file Google Sheets (bước 1).
 *
 * Cài đặt
 *   1. Mở file Google Sheets → Tiện ích mở rộng → Apps Script; dán appsscript.json, CauTruc.gs, BaoMat.gs, CaiDat.gs.
 *   2. Tải lại file Sheets → menu ME → "Cài đặt / cập nhật cấu trúc". Lần đầu Google hỏi cấp quyền; cấp xong bấm lại.
 *   3. Khi được hỏi, tạo quản trị viên đầu tiên và ghi lại PIN tạm.
 *
 * Chạy lại "Cài đặt" bao nhiêu lần cũng được: chỉ thêm sheet, cột, cấu hình còn thiếu; không xóa, không ghi đè
 * dữ liệu; không đổi khóa bí mật; dữ liệu mẫu (danh mục, mẫu thông số) chỉ nạp một lần.
 *
 * Menu ME
 *   - Cài đặt / cập nhật cấu trúc      → caiDatLanDau()
 *   - Tạo quản trị viên đầu tiên       → taoQuanTriDauTien()
 *   - Cấp PIN tạm cho dòng đang chọn   → capPinTamDongChon()   (đứng ở sheet NguoiDung)
 *   - Sao lưu ngay                     → saoLuuHangTuan()      (cũng tự chạy mỗi Chủ nhật, 2–3 giờ sáng)
 * Sửa tay trong sheet: onEdit() tự ghi CapNhatLuc, CapNhatBoi = SUA_TAY và tăng PhienBan để app nhận thay đổi.
 */

const TEN_THU_MUC_ANH = 'ME – Ảnh';
const THU_MUC_ANH_CON = [
  ['THU_MUC_ANH_THIET_BI', 'Thiết bị'],
  ['THU_MUC_ANH_LINH_KIEN', 'Linh kiện'],
  ['THU_MUC_ANH_SUA_CHUA', 'Sửa chữa'],
  ['THU_MUC_ANH_BAO_TRI', 'Bảo trì'],
  ['THU_MUC_ANH_CONG_TO', 'Công tơ']
];
const TEN_THU_MUC_SAO_LUU = 'ME – Sao lưu';
const TIEN_TO_SAO_LUU = 'ME – Sao lưu ';
const NGUOI_CAI_DAT = 'CAI_DAT';
const NGUOI_QUAN_TRI_SHEET = 'QUAN_TRI_SHEET';
const NGUOI_SUA_TAY = 'SUA_TAY';
const PHIEN_BAN_DU_LIEU_MAU = 1;

/** Cấu hình mặc định: [Khoa, GiaTri, MoTa]. Chỉ thêm khóa còn thiếu, không ghi đè giá trị bạn đã sửa. */
const CAU_HINH_MAC_DINH = [
  ['THOI_HAN_PHIEN_NGAY', '30', 'Số ngày app nhớ máy; hết hạn thì đăng nhập lại bằng mã NV + PIN.'],
  ['SO_LAN_SAI_PIN_TOI_DA', '5', 'Sai PIN liên tiếp số lần này thì khóa tạm tài khoản.'],
  ['PHUT_KHOA_PIN', '15', 'Số phút khóa sau khi sai PIN quá số lần cho phép.'],
  ['PHIEN_BAN_APP_TOI_THIEU', '', 'App cũ hơn phiên bản này bị yêu cầu cập nhật. Để trống = không chặn.'],
  ['ANH_CANH_DAI_PX', '1280', 'Ảnh được nén trên máy trước khi gửi, cạnh dài tối đa (px).'],
  ['GOI_NHAP_KHO_DONG', '500', 'Số dòng mỗi gói khi cập nhật file kho tuần.'],
  ['GIO_GHI_CHI_SO', '', 'Giờ ghi chỉ số điện nước mỗi ngày, dạng 07:00. Bạn tự điền.'],
  ['GIO_HAN_GHI_CHI_SO', '', 'Quá giờ này mà còn công tơ chưa ghi thì Trang chủ nhắc, dạng 08:00. Để trống = không nhắc.'],
  ['NGUONG_BAT_THUONG_PT', '30', 'Cao hơn trung bình các ngày trước quá số % này thì gắn cờ Bất thường, cấp 1–3 duyệt.'],
  ['SO_NGAY_TRUNG_BINH', '7', 'Số ngày lấy trung bình để so khi ghi chỉ số.'],
  ['HE_SO_NGHI_NHAP_SAI', '5', 'Gấp từ số lần này trở lên so với trung bình thì hỏi lại trước khi lưu (nghi nhập sai).'],
  ['SO_BAN_SAO_LUU', '8', 'Số bản sao lưu hằng tuần được giữ lại.'],
  ['THU_MUC_ANH', '', 'ID thư mục ảnh trên Drive. Cài đặt tự điền, không sửa.'],
  ['THU_MUC_ANH_THIET_BI', '', 'ID thư mục ảnh thiết bị. Cài đặt tự điền.'],
  ['THU_MUC_ANH_LINH_KIEN', '', 'ID thư mục ảnh linh kiện. Cài đặt tự điền.'],
  ['THU_MUC_ANH_SUA_CHUA', '', 'ID thư mục ảnh sửa chữa. Cài đặt tự điền.'],
  ['THU_MUC_ANH_BAO_TRI', '', 'ID thư mục ảnh bảo trì. Cài đặt tự điền.'],
  ['THU_MUC_ANH_CONG_TO', '', 'ID thư mục ảnh mặt công tơ. Cài đặt tự điền.'],
  ['THU_MUC_SAO_LUU', '', 'ID thư mục chứa bản sao lưu hằng tuần. Cài đặt tự điền.'],
  ['PHIEN_BAN_CAU_TRUC', '', 'Phiên bản cấu trúc dữ liệu. Cài đặt tự ghi.'],
  ['PHIEN_BAN_DU_LIEU_MAU', '0', 'Đợt dữ liệu mẫu đã nạp (danh mục, mẫu thông số). Cài đặt tự ghi.']
];

/**
 * Danh mục mẫu: { Loai: [[Ma, TenVi, TenZh], ...] }. Tên Trung lấy theo bản vẽ đã duyệt.
 * KHU_VUC là ví dụ lấy từ bản vẽ — sửa tên cho đúng nhà máy, không dùng thì đặt KichHoat = FALSE.
 * Thông số kiểu "chọn" lấy lựa chọn từ danh mục có Loai = MaTS (VD KIEU_KHOI_DONG).
 */
const DANH_MUC_MAU = {
  CAP: [
    ['1', 'Quản trị hệ thống', '系统管理员'],
    ['2', 'Trưởng bộ phận cơ điện', '机电部主管'],
    ['3', 'Tổ trưởng, giám sát ca', '组长、值班主管'],
    ['4', 'Kỹ thuật viên điện, cơ', '电气、机械技术员'],
    ['5', 'Người báo hỏng, người xem', '报修人、查看人员']
  ],
  QUYEN_THEM: [
    ['NHAP_KHO', 'Cập nhật file kho tuần', '导入每周库存文件']
  ],
  TRANG_THAI_ND: [
    ['HOAT_DONG', 'Đang dùng', '启用'],
    ['NGUNG', 'Ngừng dùng', '停用']
  ],
  BO_PHAN: [
    ['CO_DIEN', 'Bộ phận cơ điện', '机电部'],
    ['TO_DIEN', 'Tổ Điện', '电气组'],
    ['TO_CO', 'Tổ Cơ', '机械组'],
    ['SAN_XUAT', 'Sản xuất', '生产部'],
    ['CHAT_LUONG', 'Chất lượng (QA)', '品质部'],
    ['KHO', 'Kho', '仓库'],
    ['HANH_CHINH', 'Hành chính – Nhân sự', '行政人事部'],
    ['KHAC', 'Khác', '其他']
  ],
  KHU_VUC: [
    ['TRAM_KHI_NEN', 'Trạm khí nén', '空压站'],
    ['PHONG_CHILLER', 'Phòng chiller', '冷冻站'],
    ['TRAM_BIEN_AP', 'Trạm biến áp & phòng điện', '变电站及配电房'],
    ['PHONG_MAY_PHAT', 'Phòng máy phát', '发电机房'],
    ['XU_LY_NUOC_THAI', 'Xử lý nước thải', '污水处理站']
  ],
  LOAI_TB: [
    ['MNK', 'Máy nén khí', '空压机'],
    ['CHL', 'Chiller', '冷水机组'],
    ['MBA', 'Máy biến áp', '变压器'],
    ['TU_DIEN', 'Tủ điện', '配电柜'],
    ['DONG_CO_BOM', 'Động cơ, bơm', '电机、水泵'],
    ['MPD', 'Máy phát điện', '发电机']
  ],
  TRANG_THAI_TB: [
    ['DANG_CHAY', 'Đang chạy', '运行中'],
    ['SU_CO', 'Sự cố', '故障'],
    ['CHO_LK', 'Chờ linh kiện', '待备件'],
    ['DUNG', 'Dừng', '停机']
  ],
  MUC_QUAN_TRONG: [
    ['A', 'A – Then chốt', 'A – 关键设备'],
    ['B', 'B – Quan trọng', 'B – 重要设备'],
    ['C', 'C – Thông thường', 'C – 一般设备']
  ],
  NHOM_TS: [
    ['DIEN', 'Thông số điện', '电气参数'],
    ['CO', 'Thông số cơ', '机械参数'],
    ['VAN_HANH', 'Thông số vận hành', '运行参数']
  ],
  KIEU_DL: [
    ['SO', 'Số', '数字'],
    ['CHU', 'Chữ', '文本'],
    ['CHON', 'Chọn', '选项']
  ],
  DON_VI_CHU_KY: [
    ['GIO', 'giờ chạy', '运行小时'],
    ['NGAY', 'ngày', '天'],
    ['TUAN', 'tuần', '周'],
    ['THANG', 'tháng', '月'],
    ['NAM', 'năm', '年']
  ],
  DVT: [
    ['CAI', 'cái', '个'],
    ['BO', 'bộ', '套'],
    ['CHIEC', 'chiếc', '台'],
    ['MET', 'mét', '米'],
    ['CUON', 'cuộn', '卷'],
    ['HOP', 'hộp', '盒'],
    ['CAN', 'can', '桶'],
    ['LIT', 'lít', '升'],
    ['KG', 'kg', '千克'],
    ['DOI', 'đôi', '对']
  ],
  NHOM_LK: [
    ['VONG_BI', 'Vòng bi', '轴承'],
    ['LOC', 'Lọc', '滤芯'],
    ['DAU_MO', 'Dầu, mỡ', '油脂'],
    ['PHOT_GIOANG', 'Phớt, gioăng', '密封件'],
    ['DAY_DAI', 'Dây đai', '皮带'],
    ['THIET_BI_DIEN', 'Thiết bị điện', '电气元件'],
    ['CAM_BIEN', 'Cảm biến, điều khiển', '传感器与控制'],
    ['VAN_ONG', 'Van, ống', '阀门管件'],
    ['CO_KHI_KHAC', 'Cơ khí khác', '其他机械件'],
    ['TIEU_HAO', 'Vật tư tiêu hao', '消耗品']
  ],
  NGUON_LK: [
    ['FILE', 'Từ file kho', '来自库存文件'],
    ['THU_CONG', 'Thêm thủ công', '手动新增']
  ],
  TRANG_THAI_FILE: [
    ['CO_TRONG_FILE', 'Có trong file', '文件中有'],
    ['KHONG_CON', 'Không còn trong file', '文件中已无']
  ],
  TRANG_THAI_DUYET: [
    ['CHO_DUYET', 'Chờ duyệt', '待审核'],
    ['DA_DUYET', 'Đã duyệt', '已审核']
  ],
  TRANG_THAI_LAN_NHAP: [
    ['DANG_NHAP', 'Đang nhập', '导入中'],
    ['HOAN_TAT', 'Hoàn tất', '已完成'],
    ['LOI', 'Lỗi', '失败']
  ],
  LOAI_CONG_TO: [
    ['DIEN_1_GIA', 'Điện 1 giá', '单一费率'],
    ['DIEN_3_GIA', 'Điện 3 giá', '三费率'],
    ['NUOC', 'Nước', '水表']
  ],
  KHUNG_GIO: [
    ['BT', 'Bình thường', '平段'],
    ['CD', 'Cao điểm', '峰段'],
    ['TD', 'Thấp điểm', '谷段']
  ],
  TRANG_THAI_CONG_TO: [
    ['DANG_DUNG', 'Đang dùng', '使用中'],
    ['NGUNG', 'Ngừng dùng', '停用'],
    ['DA_THAY', 'Đã thay', '已更换']
  ],
  CO_CHI_SO: [
    ['BINH_THUONG', 'Bình thường', '正常'],
    ['BAT_THUONG', 'Bất thường', '异常'],
    ['GOP', 'Gộp ngày thiếu', '合并计算'],
    ['THAY_CONG_TO', 'Thay công tơ', '换表']
  ],
  LOAI_GIA: [
    ['DIEN_BT', 'Điện giờ bình thường', '平段电价'],
    ['DIEN_CD', 'Điện giờ cao điểm', '峰段电价'],
    ['DIEN_TD', 'Điện giờ thấp điểm', '谷段电价'],
    ['NUOC', 'Nước', '水价']
  ],
  // Lựa chọn cho thông số kiểu CHON (Loai = MaTS)
  KIEU_KHOI_DONG: [
    ['TRUC_TIEP', 'Trực tiếp (DOL)', '直接启动'],
    ['SAO_TAM_GIAC', 'Sao – tam giác', '星三角启动'],
    ['KHOI_DONG_MEM', 'Khởi động mềm', '软启动'],
    ['BIEN_TAN', 'Biến tần', '变频']
  ],
  KIEU_LAM_MAT: [
    ['GIO', 'Làm mát bằng gió', '风冷'],
    ['NUOC', 'Làm mát bằng nước', '水冷']
  ],
  LAM_MAT_MBA: [
    ['ONAN', 'Dầu, tự nhiên (ONAN)', '油浸自冷 (ONAN)'],
    ['ONAF', 'Dầu, quạt gió (ONAF)', '油浸风冷 (ONAF)'],
    ['AN', 'Khô, tự nhiên (AN)', '干式自冷 (AN)'],
    ['AF', 'Khô, quạt gió (AF)', '干式风冷 (AF)']
  ],
  NHIEN_LIEU: [
    ['DIESEL', 'Dầu diesel', '柴油'],
    ['GAS', 'Khí gas', '燃气']
  ]
};

/**
 * Mẫu thông số theo loại máy (bộ mẫu đề xuất trong tài liệu, nhãn Trung theo bản vẽ "Thông số kỹ thuật").
 * [MaTS, TenVi, TenZh, Nhom, DonVi, KieuDL, BatBuoc]
 */
const MAU_THONG_SO_MAU = {
  MNK: [
    ['CONG_SUAT', 'Công suất động cơ', '电机功率', 'DIEN', 'kW', 'SO', true],
    ['DIEN_AP_TAN_SO', 'Điện áp · Tần số', '电压 · 频率', 'DIEN', '', 'CHU', false],
    ['DONG_DINH_MUC', 'Dòng định mức', '额定电流', 'DIEN', 'A', 'SO', false],
    ['CAP_BAO_VE', 'Cấp bảo vệ', '防护等级', 'DIEN', '', 'CHU', false],
    ['KIEU_KHOI_DONG', 'Kiểu khởi động', '启动方式', 'DIEN', '', 'CHON', false],
    ['AP_SUAT_LAM_VIEC', 'Áp suất làm việc', '工作压力', 'VAN_HANH', 'bar', 'SO', false],
    ['LUU_LUONG_KHI', 'Lưu lượng khí', '排气量', 'VAN_HANH', 'm³/min', 'SO', false],
    ['KIEU_LAM_MAT', 'Kiểu làm mát', '冷却方式', 'VAN_HANH', '', 'CHON', false],
    ['LUONG_DAU', 'Lượng dầu bôi trơn', '润滑油量', 'VAN_HANH', 'L', 'SO', false],
    ['GIO_CHAY', 'Giờ chạy', '运行小时', 'VAN_HANH', 'h', 'SO', false]
  ],
  CHL: [
    ['NANG_SUAT_LANH', 'Năng suất lạnh', '制冷量', 'VAN_HANH', 'kW', 'SO', true],
    ['CONG_SUAT', 'Công suất điện', '电功率', 'DIEN', 'kW', 'SO', false],
    ['DIEN_AP_TAN_SO', 'Điện áp · Tần số', '电压 · 频率', 'DIEN', '', 'CHU', false],
    ['MOI_CHAT_LANH', 'Môi chất lạnh', '制冷剂', 'VAN_HANH', '', 'CHU', false],
    ['KIEU_LAM_MAT', 'Kiểu giải nhiệt', '冷却方式', 'VAN_HANH', '', 'CHON', false],
    ['LUU_LUONG_NUOC', 'Lưu lượng nước lạnh', '冷冻水流量', 'VAN_HANH', 'm³/h', 'SO', false],
    ['NHIET_DO_NUOC_VAO', 'Nhiệt độ nước vào', '进水温度', 'VAN_HANH', '°C', 'SO', false],
    ['NHIET_DO_NUOC_RA', 'Nhiệt độ nước ra', '出水温度', 'VAN_HANH', '°C', 'SO', false]
  ],
  MBA: [
    ['CONG_SUAT_KVA', 'Công suất', '额定容量', 'DIEN', 'kVA', 'SO', true],
    ['DIEN_AP_SO_CAP', 'Điện áp sơ cấp', '一次电压', 'DIEN', 'kV', 'SO', false],
    ['DIEN_AP_THU_CAP', 'Điện áp thứ cấp', '二次电压', 'DIEN', 'V', 'SO', false],
    ['TO_DAU_DAY', 'Tổ đấu dây', '联结组别', 'DIEN', '', 'CHU', false],
    ['UK', 'Điện áp ngắn mạch Uk', '短路阻抗 Uk', 'DIEN', '%', 'SO', false],
    ['LAM_MAT_MBA', 'Kiểu làm mát', '冷却方式', 'VAN_HANH', '', 'CHON', false],
    ['KHOI_LUONG_DAU', 'Khối lượng dầu', '油重', 'VAN_HANH', 'kg', 'SO', false]
  ],
  TU_DIEN: [
    ['DONG_THANH_CAI', 'Dòng định mức thanh cái', '母排额定电流', 'DIEN', 'A', 'SO', true],
    ['DONG_CAT_TONG', 'Thiết bị đóng cắt tổng', '总开关', 'DIEN', '', 'CHU', false],
    ['ICU', 'Dòng cắt Icu', '分断能力 Icu', 'DIEN', 'kA', 'SO', false],
    ['SO_LO_RA', 'Số lộ ra', '出线回路数', 'DIEN', '', 'SO', false],
    ['CAP_BAO_VE', 'Cấp bảo vệ', '防护等级', 'DIEN', '', 'CHU', false]
  ],
  DONG_CO_BOM: [
    ['CONG_SUAT', 'Công suất', '功率', 'DIEN', 'kW', 'SO', true],
    ['DONG_DINH_MUC', 'Dòng định mức', '额定电流', 'DIEN', 'A', 'SO', false],
    ['TOC_DO', 'Tốc độ', '转速', 'CO', 'rpm', 'SO', false],
    ['MA_VONG_BI', 'Mã vòng bi', '轴承型号', 'CO', '', 'CHU', false],
    ['LUU_LUONG', 'Lưu lượng', '流量', 'VAN_HANH', 'm³/h', 'SO', false],
    ['COT_AP', 'Cột áp', '扬程', 'VAN_HANH', 'm', 'SO', false]
  ],
  MPD: [
    ['CONG_SUAT_KVA', 'Công suất', '额定功率', 'DIEN', 'kVA', 'SO', true],
    ['DIEN_AP', 'Điện áp', '电压', 'DIEN', 'V', 'SO', false],
    ['NHIEN_LIEU', 'Nhiên liệu', '燃料', 'VAN_HANH', '', 'CHON', false],
    ['DUNG_TICH_BON', 'Dung tích bồn', '油箱容量', 'VAN_HANH', 'L', 'SO', false],
    ['GIO_CHAY', 'Giờ chạy', '运行小时', 'VAN_HANH', 'h', 'SO', false]
  ]
};

/** Dòng chờ điền trong BieuGia (chỉ nạp khi sheet còn trống). Giá để trống thì app ẩn chi phí. */
const BIEU_GIA_MAU = [
  ['DIEN_BT', 'Điện giờ bình thường: điền DonGia (đồng/kWh) và TuNgay (VD 2026-10-01)'],
  ['DIEN_CD', 'Điện giờ cao điểm: điền DonGia (đồng/kWh) và TuNgay'],
  ['DIEN_TD', 'Điện giờ thấp điểm: điền DonGia (đồng/kWh) và TuNgay'],
  ['NUOC', 'Nước: điền DonGia (đồng/m³) và TuNgay']
];

// ───────────────────────── Menu ─────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('ME')
    .addItem('Cài đặt / cập nhật cấu trúc · 安装/更新结构', 'caiDatLanDau')
    .addItem('Tạo quản trị viên đầu tiên · 创建首个管理员', 'taoQuanTriDauTien')
    .addItem('Cấp PIN tạm cho dòng đang chọn · 发放临时PIN', 'capPinTamDongChon')
    .addSeparator()
    .addItem('Sao lưu ngay · 立即备份', 'saoLuuHangTuan')
    .addToUi();
}

// ───────────────────────── Cài đặt ─────────────────────────

/** Chạy tay: tạo hoặc bổ sung cấu trúc. Chạy lại an toàn. */
function caiDatLanDau() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Không thấy file Google Sheets. Mở Apps Script từ chính file Sheets (Tiện ích mở rộng → Apps Script) rồi chạy lại.');
  }
  const ui = ui_();
  const khoa = LockService.getScriptLock();
  if (!khoa.tryLock(30000)) throw new Error('Đang có một lần cài đặt khác chạy. Đợi 1 phút rồi thử lại.');
  let bc;
  try {
    bc = caiDat_(ss);
  } finally {
    khoa.releaseLock();
  }

  const noiDung = bc.dong.map(function (x) { return '• ' + x; }).join('\n') +
    (bc.canhBao.length ? '\n\nCần xem:\n' + bc.canhBao.map(function (x) { return '• ' + x; }).join('\n') : '');
  if (!ui) {
    console.log('ME – Cài đặt xong\n' + noiDung +
      (bc.coQuanTri ? '' : '\n\nChưa có quản trị viên: mở file Sheets → menu ME → Tạo quản trị viên đầu tiên.'));
    return bc;
  }
  if (bc.coQuanTri) {
    ui.alert('ME – Cài đặt xong', noiDung, ui.ButtonSet.OK);
    return bc;
  }
  const traLoi = ui.alert('ME – Cài đặt xong', noiDung + '\n\nChưa có tài khoản quản trị. Tạo ngay bây giờ?', ui.ButtonSet.YES_NO);
  if (traLoi === ui.Button.YES) taoQuanTri_(ui, ss);
  return bc;
}

function caiDat_(ss) {
  const bc = { dong: [], canhBao: [], coQuanTri: false };
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ID_SHEETS', ss.getId());

  // Khóa bí mật: chỉ tạo khi chưa có. Đổi KHOA_PIN sẽ làm mọi PIN hết hiệu lực.
  const khoaMoi = [];
  ['KHOA_TOKEN', 'KHOA_PIN'].forEach(function (k) {
    if (!props.getProperty(k)) {
      props.setProperty(k, taoChuoiNgauNhien_());
      khoaMoi.push(k);
    }
  });

  // Múi giờ: file Sheets và dự án Apps Script đều phải là giờ Việt Nam.
  ss.setSpreadsheetTimeZone(MUI_GIO);
  const tzScript = Session.getScriptTimeZone();
  if (Utilities.formatDate(new Date(), tzScript, 'Z') !== '+0700') {
    bc.canhBao.push('Múi giờ dự án Apps Script đang là ' + tzScript +
      '. Dán lại appsscript.json (timeZone Asia/Ho_Chi_Minh), lưu, rồi chạy lại Cài đặt.');
  }

  // 1. Sheet, tiêu đề, định dạng, bảo vệ
  const kqBang = BANG.map(function (def) { return dungBang_(ss, def); });
  const soTao = kqBang.filter(function (k) { return k.taoMoi; }).length;
  let soThemCot = 0;
  kqBang.forEach(function (k) {
    soThemCot += k.themCot.length;
    if (k.cotLa.length) bc.canhBao.push(k.ten + ': có cột ngoài cấu trúc (' + k.cotLa.join(', ') + '); app bỏ qua, giữ nguyên.');
    if (k.cotTrung.length) bc.canhBao.push(k.ten + ': trùng tên cột ' + k.cotTrung.join(', ') + '; đổi tên hoặc xóa cột trùng.');
  });
  if (soTao) sapXepBang_(ss);
  xoaSheetMacDinh_(ss);

  // 2. Cấu hình, thư mục ảnh, thư mục sao lưu
  const ch = damBaoCauHinh_(ss);
  const tm = damBaoThuMuc_(ss, ch);
  datCauHinh_(ch, 'PHIEN_BAN_CAU_TRUC', String(PHIEN_BAN_CAU_TRUC));

  // 3. Dữ liệu mẫu: chỉ nạp một lần, để bạn xóa hay sửa mẫu mà không bị nạp lại.
  let gieo = null;
  if ((parseInt(layCauHinh_(ch, 'PHIEN_BAN_DU_LIEU_MAU'), 10) || 0) < PHIEN_BAN_DU_LIEU_MAU) {
    gieo = gieoDuLieuMau_(ss);
    datCauHinh_(ch, 'PHIEN_BAN_DU_LIEU_MAU', String(PHIEN_BAN_DU_LIEU_MAU));
  }

  // 4. Sao lưu tự động hằng tuần
  const triggerMoi = damBaoTriggerSaoLuu_();
  const soBan = parseInt(layCauHinh_(ch, 'SO_BAN_SAO_LUU'), 10) || 8;

  // 5. Quản trị viên
  const nd = docBangCaiDat_(ss.getSheetByName('NguoiDung'));
  bc.coQuanTri = coQuanTri_(nd.dong);
  if (bc.coQuanTri && !nd.dong.some(function (d) { return laQuanTri_(d) && String(d.PinHash || '') !== ''; })) {
    bc.canhBao.push('Tài khoản cấp 1 chưa có PIN: ở sheet NguoiDung bấm vào dòng đó → ME → Cấp PIN tạm cho dòng đang chọn.');
  }

  bc.dong.push('Sheet: đủ ' + BANG.length + '/' + BANG.length +
    (soTao ? ' (tạo mới ' + soTao + ')' : ' (đã có từ trước)') + (soThemCot ? ', thêm ' + soThemCot + ' cột mới' : ''));
  bc.dong.push('Khóa bí mật: ' + (khoaMoi.length ? 'đã tạo ' + khoaMoi.join(', ') : 'đã có, giữ nguyên'));
  bc.dong.push('Thư mục "' + TEN_THU_MUC_ANH + '" (5 thư mục con) và "' + TEN_THU_MUC_SAO_LUU + '" cạnh file này' +
    (tm.soMoi ? ': tạo mới ' + tm.soMoi + ' thư mục' : ': đã có'));
  bc.dong.push('Sao lưu tự động: Chủ nhật 2–3 giờ sáng, giữ ' + soBan + ' bản' + (triggerMoi ? ' (vừa bật)' : ''));
  bc.dong.push('Dữ liệu mẫu: ' + (gieo
    ? gieo.danhMuc + ' dòng danh mục, ' + gieo.thongSo + ' dòng mẫu thông số, ' + gieo.bieuGia + ' dòng bảng giá chờ điền giá'
    : 'đã nạp từ lần trước, không nạp lại'));
  if (ch.soMoi) bc.dong.push('Cấu hình: thêm ' + ch.soMoi + ' thông số mặc định (sheet CauHinh)');

  ghiNhatKyCaiDat_(ss, NGUOI_CAI_DAT, 'CAI_DAT', '', '',
    JSON.stringify({ taoSheet: soTao, themCot: soThemCot, khoaMoi: khoaMoi, duLieuMau: gieo, canhBao: bc.canhBao.length }));
  ss.setActiveSheet(ss.getSheetByName('NguoiDung'));
  return bc;
}

/** Tạo sheet nếu thiếu, thêm cột còn thiếu vào cuối, định dạng, bảo vệ. Không đụng dữ liệu. */
function dungBang_(ss, def) {
  const cot = cotCuaBang_(def);
  const kq = { ten: def.ten, taoMoi: false, themCot: [], cotLa: [], cotTrung: [] };
  let sh = ss.getSheetByName(def.ten);
  if (!sh) {
    sh = ss.insertSheet(def.ten);
    kq.taoMoi = true;
  }
  let tieuDe = docTieuDe_(sh);
  const thieu = cot.filter(function (c) { return tieuDe.indexOf(c) < 0; });
  if (thieu.length) {
    const can = tieuDe.length + thieu.length;
    if (sh.getMaxColumns() < can) sh.insertColumnsAfter(sh.getMaxColumns(), can - sh.getMaxColumns());
    sh.getRange(1, tieuDe.length + 1, 1, thieu.length).setValues([thieu]);
    tieuDe = tieuDe.concat(thieu);
    if (!kq.taoMoi) kq.themCot = thieu;
  }
  kq.cotLa = tieuDe.filter(function (c) { return c && cot.indexOf(c) < 0; });
  kq.cotTrung = tieuDe.filter(function (c, i) { return c && tieuDe.indexOf(c) !== i; });
  if (kq.taoMoi && sh.getMaxColumns() > tieuDe.length) {
    sh.deleteColumns(tieuDe.length + 1, sh.getMaxColumns() - tieuDe.length);
  }
  dinhDangBang_(sh, def, tieuDe, kq.taoMoi);
  baoVeBang_(sh, tieuDe.length);
  return kq;
}

function dinhDangBang_(sh, def, tieuDe, taoMoi) {
  const n = tieuDe.length;
  sh.getRange(1, 1, 1, n)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#1B365D')
    .setVerticalAlignment('middle')
    .setNotes([tieuDe.map(function (c) { return ghiChuCot_(def.ten, c); })]);
  sh.setFrozenRows(1);
  sh.setTabColor(NHOM_BANG[def.nhom].mau);

  // Cột chữ để định dạng Văn bản thuần: giữ "00123", giữ ngày ISO, không tự đổi kiểu.
  const cuoi = sh.getMaxRows();
  if (cuoi >= 2) {
    const cotChuan = cotCuaBang_(def);
    const vung = [];
    tieuDe.forEach(function (c, i) {
      if (c && cotChuan.indexOf(c) >= 0 && kieuCot_(def, c) === 'chu') {
        vung.push(chuCot_(i + 1) + '2:' + chuCot_(i + 1) + cuoi);
      }
    });
    if (vung.length) sh.getRangeList(vung).setNumberFormat('@');
  }
  if (taoMoi) sh.autoResizeColumns(1, n);
}

/** Bảo vệ sheet: chỉ chủ file sửa tay; dòng tiêu đề hiện cảnh báo khi sửa (kể cả chủ file). */
function baoVeBang_(sh, soCot) {
  const MO_TA_SHEET = 'ME: chỉ chủ file được sửa tay';
  const MO_TA_TIEU_DE = 'ME: dòng tiêu đề – không đổi tên, không xóa cột';
  if (!sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) {
    const p = sh.protect().setDescription(MO_TA_SHEET);
    p.addEditor(Session.getEffectiveUser());
    p.removeEditors(p.getEditors());
    if (p.canDomainEdit()) p.setDomainEdit(false);
  }
  const cu = sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).filter(function (p) {
    return p.getDescription() === MO_TA_TIEU_DE;
  });
  const dungRoi = cu.length === 1 && cu[0].getRange().getRow() === 1 && cu[0].getRange().getColumn() === 1 &&
    cu[0].getRange().getNumColumns() === soCot;
  if (dungRoi) return;
  cu.forEach(function (p) { p.remove(); });
  try {
    sh.getRange(1, 1, 1, soCot).protect().setDescription(MO_TA_TIEU_DE).setWarningOnly(true);
  } catch (e) {
    console.warn('Không đặt được cảnh báo dòng tiêu đề cho ' + sh.getName() + ': ' + e);
  }
}

/** Xếp 20 sheet đúng thứ tự trong tài liệu (chỉ chạy khi vừa tạo sheet mới). */
function sapXepBang_(ss) {
  BANG.forEach(function (def, i) {
    const sh = ss.getSheetByName(def.ten);
    if (!sh) return;
    ss.setActiveSheet(sh);
    ss.moveActiveSheet(i + 1);
  });
}

/** Xóa sheet mặc định còn trống ("Trang tính1", "Sheet1"). Không đụng sheet có dữ liệu. */
function xoaSheetMacDinh_(ss) {
  ss.getSheets().forEach(function (sh) {
    if (timBang_(sh.getName())) return;
    if (!/^(sheet|trang tính|工作表)\s*\d+$/i.test(sh.getName())) return;
    if (sh.getLastRow() > 0 || sh.getLastColumn() > 0) return;
    if (ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
}

// ───────────────────────── Cấu hình và thư mục ─────────────────────────

function damBaoCauHinh_(ss) {
  const sh = ss.getSheetByName('CauHinh');
  const def = timBang_('CauHinh');
  let b = docBangCaiDat_(sh);
  const co = {};
  b.dong.forEach(function (d) { co[String(d.Khoa).trim()] = true; });
  const moi = CAU_HINH_MAC_DINH
    .filter(function (x) { return !co[x[0]]; })
    .map(function (x) { return { Khoa: x[0], GiaTri: x[1], MoTa: x[2] }; });
  const soMoi = themDongCaiDat_(sh, def, b.tieuDe, moi, NGUOI_CAI_DAT);
  if (soMoi) b = docBangCaiDat_(sh);
  const map = {};
  b.dong.forEach(function (d) { map[String(d.Khoa).trim()] = d; });
  return { sh: sh, def: def, tieuDe: b.tieuDe, map: map, soMoi: soMoi };
}

function layCauHinh_(ch, khoa) {
  const d = ch.map[khoa];
  return d ? String(d.GiaTri) : '';
}

function datCauHinh_(ch, khoa, giaTri) {
  const d = ch.map[khoa];
  if (!d || String(d.GiaTri) === String(giaTri)) return;
  suaDongCaiDat_(ch.sh, ch.def, ch.tieuDe, d._so, { GiaTri: String(giaTri) }, NGUOI_CAI_DAT);
  d.GiaTri = String(giaTri);
}

/** Thư mục ảnh (5 thư mục con) và thư mục sao lưu, đặt cạnh file Sheets. Đã có thì dùng lại. */
function damBaoThuMuc_(ss, ch) {
  const kq = { soMoi: 0 };
  const cha = thuMucCuaFile_(ss);
  const goc = layHoacTaoThuMuc_(layCauHinh_(ch, 'THU_MUC_ANH'), TEN_THU_MUC_ANH, cha, kq);
  datCauHinh_(ch, 'THU_MUC_ANH', goc.getId());
  THU_MUC_ANH_CON.forEach(function (x) {
    const f = layHoacTaoThuMuc_(layCauHinh_(ch, x[0]), x[1], goc, kq);
    datCauHinh_(ch, x[0], f.getId());
  });
  const saoLuu = layHoacTaoThuMuc_(layCauHinh_(ch, 'THU_MUC_SAO_LUU'), TEN_THU_MUC_SAO_LUU, cha, kq);
  datCauHinh_(ch, 'THU_MUC_SAO_LUU', saoLuu.getId());
  return kq;
}

function thuMucCuaFile_(ss) {
  const it = DriveApp.getFileById(ss.getId()).getParents();
  return it.hasNext() ? it.next() : DriveApp.getRootFolder();
}

function layHoacTaoThuMuc_(id, ten, cha, kq) {
  if (id) {
    try {
      const f = DriveApp.getFolderById(id);
      if (!f.isTrashed()) return f;
    } catch (e) {
      // ID cũ không còn: tìm theo tên hoặc tạo mới
    }
  }
  const it = cha.getFoldersByName(ten);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed()) return f;
  }
  kq.soMoi++;
  return cha.createFolder(ten);
}

// ───────────────────────── Dữ liệu mẫu ─────────────────────────

function gieoDuLieuMau_(ss) {
  const kq = { danhMuc: 0, thongSo: 0, bieuGia: 0 };

  const shDM = ss.getSheetByName('DanhMuc');
  const bDM = docBangCaiDat_(shDM);
  const coDM = {};
  bDM.dong.forEach(function (d) { coDM[String(d.Loai) + '|' + String(d.Ma)] = true; });
  const moiDM = [];
  Object.keys(DANH_MUC_MAU).forEach(function (loai) {
    DANH_MUC_MAU[loai].forEach(function (x, i) {
      if (coDM[loai + '|' + x[0]]) return;
      moiDM.push({ Loai: loai, Ma: x[0], TenVi: x[1], TenZh: x[2], ThuTu: (i + 1) * 10, KichHoat: true });
    });
  });
  kq.danhMuc = themDongCaiDat_(shDM, timBang_('DanhMuc'), bDM.tieuDe, moiDM, NGUOI_CAI_DAT);

  const shTS = ss.getSheetByName('MauThongSo');
  const bTS = docBangCaiDat_(shTS);
  const coTS = {};
  bTS.dong.forEach(function (d) { coTS[String(d.LoaiTB) + '|' + String(d.MaTS)] = true; });
  const moiTS = [];
  Object.keys(MAU_THONG_SO_MAU).forEach(function (loai) {
    MAU_THONG_SO_MAU[loai].forEach(function (x, i) {
      if (coTS[loai + '|' + x[0]]) return;
      moiTS.push({ LoaiTB: loai, MaTS: x[0], TenVi: x[1], TenZh: x[2], Nhom: x[3], DonVi: x[4], KieuDL: x[5], BatBuoc: x[6], ThuTu: (i + 1) * 10 });
    });
  });
  kq.thongSo = themDongCaiDat_(shTS, timBang_('MauThongSo'), bTS.tieuDe, moiTS, NGUOI_CAI_DAT);

  const shBG = ss.getSheetByName('BieuGia');
  const bBG = docBangCaiDat_(shBG);
  if (!bBG.dong.length) {
    kq.bieuGia = themDongCaiDat_(shBG, timBang_('BieuGia'), bBG.tieuDe,
      BIEU_GIA_MAU.map(function (x) { return { Loai: x[0], DonGia: '', TuNgay: '', DenNgay: '', GhiChu: x[1] }; }), NGUOI_CAI_DAT);
  }
  return kq;
}

// ───────────────────────── Người dùng ─────────────────────────

/** Menu: tạo tài khoản cấp 1 đầu tiên, hiện PIN tạm một lần. */
function taoQuanTriDauTien() {
  const ui = ui_();
  if (!ui) throw new Error('Hãy chạy từ menu ME trong file Google Sheets.');
  taoQuanTri_(ui, SpreadsheetApp.getActiveSpreadsheet());
}

function taoQuanTri_(ui, ss) {
  const sh = ss.getSheetByName('NguoiDung');
  if (!sh) {
    ui.alert('Chưa có sheet NguoiDung. Chọn ME → Cài đặt / cập nhật cấu trúc trước.');
    return;
  }
  const def = timBang_('NguoiDung');
  const b = docBangCaiDat_(sh);
  if (coQuanTri_(b.dong)) {
    ui.alert('Đã có quản trị viên',
      'File đã có tài khoản cấp 1. Muốn thêm người: gõ một dòng mới ở sheet NguoiDung (MaNV, HoTen, BoPhan, Cap…), ' +
      'bấm vào dòng đó rồi chọn ME → Cấp PIN tạm cho dòng đang chọn.', ui.ButtonSet.OK);
    return;
  }
  const r1 = ui.prompt('Tạo quản trị viên đầu tiên (1/2)', 'Mã nhân viên của bạn, không dấu, VD NV001:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  const maNV = chuanMaNV_(r1.getResponseText());
  if (!MA_NV_HOP_LE.test(maNV)) {
    ui.alert('Mã nhân viên chỉ gồm chữ không dấu, số, dấu chấm, gạch ngang hoặc gạch dưới, dài 2–20 ký tự. Chọn lại menu để nhập lại.');
    return;
  }
  if (b.dong.some(function (d) { return chuanMaNV_(d.MaNV) === maNV; })) {
    ui.alert('Mã ' + maNV + ' đã có ở sheet NguoiDung. Đặt cột Cap của dòng đó là 1, bấm vào dòng rồi chọn ME → Cấp PIN tạm cho dòng đang chọn.');
    return;
  }
  const r2 = ui.prompt('Tạo quản trị viên đầu tiên (2/2)', 'Họ và tên:', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  const hoTen = String(r2.getResponseText()).normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!hoTen || hoTen.length > 60) {
    ui.alert('Họ tên không được trống và dài tối đa 60 ký tự. Chọn lại menu để nhập lại.');
    return;
  }

  const pin = taoPinTam_();
  const muoi = taoMuoi_();
  const khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    themDongCaiDat_(sh, def, b.tieuDe, [{
      MaNV: maNV, HoTen: hoTen, BoPhan: 'CO_DIEN', ChucVuVi: 'Quản trị hệ thống', ChucVuZh: '系统管理员',
      Cap: 1, QuyenThem: '', PinHash: bamPin_(pin, muoi), PinSalt: muoi, PhaiDoiPin: true,
      SaiPin: 0, KhoaDen: '', TokenVer: 1, TrangThai: 'HOAT_DONG'
    }], NGUOI_CAI_DAT);
    ghiNhatKyCaiDat_(ss, NGUOI_QUAN_TRI_SHEET, 'TAO_QUAN_TRI', 'NguoiDung', maNV, '');
  } finally {
    khoa.releaseLock();
  }
  ui.alert('Đã tạo quản trị viên',
    'Mã NV: ' + maNV + '\nHọ tên: ' + hoTen + '\nPIN tạm: ' + pin +
    '\n\nGhi lại PIN này ngay: file chỉ lưu bản băm nên không xem lại được. ' +
    'Lần đăng nhập đầu, app sẽ bắt đổi sang PIN của riêng bạn.', ui.ButtonSet.OK);
}

/** Menu: cấp PIN tạm cho người ở dòng đang chọn trong sheet NguoiDung (thêm người mới hoặc quên PIN). */
function capPinTamDongChon() {
  const ui = ui_();
  if (!ui) throw new Error('Hãy chạy từ menu ME trong file Google Sheets.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  if (sh.getName() !== 'NguoiDung') {
    ui.alert('Mở sheet NguoiDung, bấm vào dòng của người cần cấp PIN, rồi chọn lại menu này.');
    return;
  }
  const soDong = sh.getActiveRange().getRow();
  if (soDong < 2) {
    ui.alert('Bấm vào dòng của người cần cấp PIN (từ dòng 2 trở xuống).');
    return;
  }
  const def = timBang_('NguoiDung');
  const b = docBangCaiDat_(sh);
  const d = b.dong.filter(function (x) { return x._so === soDong; })[0];
  if (!d) {
    ui.alert('Dòng ' + soDong + ' đang trống. Gõ MaNV, HoTen, BoPhan, Cap cho người mới trước.');
    return;
  }
  const maNV = chuanMaNV_(d.MaNV);
  if (!MA_NV_HOP_LE.test(maNV)) {
    ui.alert('MaNV ở dòng ' + soDong + ' chưa hợp lệ: chỉ gồm chữ không dấu, số, dấu chấm, gạch ngang, gạch dưới, dài 2–20 ký tự.');
    return;
  }
  if (b.dong.some(function (x) { return x._so !== soDong && chuanMaNV_(x.MaNV) === maNV; })) {
    ui.alert('Mã ' + maNV + ' bị trùng ở dòng khác. Sửa trùng rồi thử lại.');
    return;
  }
  const cap = Number(d.Cap);
  if (!(cap >= 1 && cap <= 5 && Math.floor(cap) === cap)) {
    ui.alert('Điền cột Cap (số từ 1 đến 5) cho dòng này trước.');
    return;
  }
  const hoTen = String(d.HoTen || '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!hoTen) {
    ui.alert('Điền cột HoTen cho dòng này trước.');
    return;
  }
  if (laDung_(d.DaXoa) || String(d.TrangThai || '') === 'NGUNG') {
    ui.alert('Tài khoản này đang bị xóa hoặc ngừng dùng. Đặt DaXoa = FALSE và TrangThai = HOAT_DONG trước.');
    return;
  }
  const xacNhan = ui.alert('Cấp PIN tạm',
    'Cấp PIN tạm cho ' + maNV + ' – ' + hoTen + ' (cấp ' + cap + ')?\n' +
    'PIN cũ (nếu có) hết hiệu lực và người này bị đăng xuất khỏi mọi máy.', ui.ButtonSet.YES_NO);
  if (xacNhan !== ui.Button.YES) return;

  const pin = taoPinTam_();
  const muoi = taoMuoi_();
  const tokenCu = Number(d.TokenVer) || 0;
  const khoa = LockService.getScriptLock();
  khoa.waitLock(30000);
  try {
    suaDongCaiDat_(sh, def, b.tieuDe, soDong, {
      MaNV: maNV, HoTen: hoTen, PinHash: bamPin_(pin, muoi), PinSalt: muoi, PhaiDoiPin: true,
      SaiPin: 0, KhoaDen: '', TokenVer: tokenCu + 1, TrangThai: String(d.TrangThai || '') || 'HOAT_DONG'
    }, NGUOI_QUAN_TRI_SHEET);
    ghiNhatKyCaiDat_(ss, NGUOI_QUAN_TRI_SHEET, 'CAP_PIN_TAM', 'NguoiDung', maNV, JSON.stringify({ TokenVer: [tokenCu, tokenCu + 1] }));
  } finally {
    khoa.releaseLock();
  }
  ui.alert('PIN tạm của ' + maNV,
    'Họ tên: ' + hoTen + '\nPIN tạm: ' + pin +
    '\n\nĐưa PIN này tận tay người dùng. File chỉ lưu bản băm nên không xem lại được. ' +
    'Lần đăng nhập đầu, app bắt đổi PIN.', ui.ButtonSet.OK);
}

function laQuanTri_(d) {
  return Number(d.Cap) === 1 && String(d.TrangThai || '') !== 'NGUNG' && !laDung_(d.DaXoa);
}

function coQuanTri_(dong) {
  return dong.some(laQuanTri_);
}

// ───────────────────────── Sao lưu ─────────────────────────

/** Tạo bản sao file Sheets vào thư mục "ME – Sao lưu", giữ số bản theo CauHinh SO_BAN_SAO_LUU. */
function saoLuuHangTuan() {
  const ss = moFile_();
  const ch = {};
  docBangCaiDat_(ss.getSheetByName('CauHinh')).dong.forEach(function (d) { ch[String(d.Khoa).trim()] = String(d.GiaTri); });
  let thuMuc = null;
  try {
    thuMuc = DriveApp.getFolderById(ch.THU_MUC_SAO_LUU);
    if (thuMuc.isTrashed()) thuMuc = null;
  } catch (e) {
    thuMuc = null;
  }
  if (!thuMuc) throw new Error('Chưa có thư mục sao lưu. Chọn ME → Cài đặt / cập nhật cấu trúc trước.');

  const ten = TIEN_TO_SAO_LUU + Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd HH.mm');
  DriveApp.getFileById(ss.getId()).makeCopy(ten, thuMuc);
  const giu = Math.max(parseInt(ch.SO_BAN_SAO_LUU, 10) || 8, 1);
  const ds = [];
  const it = thuMuc.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName().indexOf(TIEN_TO_SAO_LUU) === 0) ds.push(f);
  }
  ds.sort(function (a, b) { return b.getDateCreated().getTime() - a.getDateCreated().getTime(); });
  ds.slice(giu).forEach(function (f) { f.setTrashed(true); });
  ghiNhatKyCaiDat_(ss, 'HE_THONG', 'SAO_LUU', '', '', ten);

  const ui = ui_();
  if (ui) {
    ui.alert('Đã sao lưu', ten + '\nThư mục "' + TEN_THU_MUC_SAO_LUU + '" đang giữ ' + Math.min(ds.length, giu) + ' bản gần nhất.', ui.ButtonSet.OK);
  }
}

function damBaoTriggerSaoLuu_() {
  const co = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'saoLuuHangTuan'; });
  if (co) return false;
  ScriptApp.newTrigger('saoLuuHangTuan').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(2).inTimezone(MUI_GIO).create();
  return true;
}

// ───────────────────────── Sửa tay trong sheet ─────────────────────────

/**
 * Chạy tự động khi chủ file sửa tay một ô: ghi CapNhatLuc, CapNhatBoi = SUA_TAY và tăng PhienBan
 * cho các dòng vừa sửa, để app đồng bộ được thay đổi. App ghi qua máy chủ thì không kích hoạt hàm này.
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.range.getSheet();
    const def = timBang_(sh.getName());
    if (!def || def.chiGhiThem) return;
    const dau = Math.max(e.range.getRow(), 2);
    const cuoi = e.range.getRow() + e.range.getNumRows() - 1;
    if (cuoi < dau) return;
    const tieuDe = docTieuDe_(sh);
    const iLuc = tieuDe.indexOf('CapNhatLuc');
    const iBoi = tieuDe.indexOf('CapNhatBoi');
    const iPB = tieuDe.indexOf('PhienBan');
    if (iLuc < 0 || iBoi < 0 || iPB < 0) return;

    // Chỉ sửa đúng các cột CapNhatLuc / CapNhatBoi / PhienBan thì bỏ qua.
    const cotHeThong = [iLuc + 1, iBoi + 1, iPB + 1];
    const c1 = e.range.getColumn();
    const c2 = c1 + e.range.getNumColumns() - 1;
    let chiHeThong = true;
    for (let c = c1; c <= c2; c++) {
      if (cotHeThong.indexOf(c) < 0) { chiHeThong = false; break; }
    }
    if (chiHeThong) return;

    const soDong = cuoi - dau + 1;
    const dl = sh.getRange(dau, 1, soDong, tieuDe.length).getValues();
    const luc = bayGio_();
    const iXoa = tieuDe.indexOf('DaXoa');
    const ra = dl.map(function (r) {
      const trong = r.every(function (v, i) {
        return i === iLuc || i === iBoi || i === iPB || i === iXoa || v === '' || v === null;
      });
      if (trong) return [r[iLuc], r[iBoi], r[iPB]];
      return [luc, NGUOI_SUA_TAY, (Number(r[iPB]) || 0) + 1];
    });
    sh.getRange(dau, iLuc + 1, soDong, 1).setValues(ra.map(function (x) { return [x[0]]; }));
    sh.getRange(dau, iBoi + 1, soDong, 1).setValues(ra.map(function (x) { return [x[1]]; }));
    sh.getRange(dau, iPB + 1, soDong, 1).setValues(ra.map(function (x) { return [x[2]]; }));
  } catch (err) {
    console.error('onEdit: ' + err);
  }
}

// ───────────────────────── Đọc ghi dùng riêng cho cài đặt ─────────────────────────

/** Đọc cả sheet thành danh sách đối tượng theo tên cột; _so = số dòng trong sheet. Bỏ dòng trống. */
function docBangCaiDat_(sh) {
  const tieuDe = docTieuDe_(sh);
  const n = sh.getLastRow();
  const dong = [];
  if (n >= 2 && tieuDe.length) {
    sh.getRange(2, 1, n - 1, tieuDe.length).getValues().forEach(function (r, i) {
      if (r.every(function (v) { return v === '' || v === null; })) return;
      const o = { _so: i + 2 };
      tieuDe.forEach(function (c, j) { if (c) o[c] = r[j]; });
      dong.push(o);
    });
  }
  return { tieuDe: tieuDe, dong: dong };
}

/** Giá trị đúng kiểu cột trước khi ghi. */
function giaTriO_(def, cot, v) {
  if (v === null || v === undefined) return '';
  const k = kieuCot_(def, cot);
  if (k === 'so') {
    if (v === '') return '';
    const n = Number(v);
    return isNaN(n) ? '' : n;
  }
  if (k === 'dung') return v === '' ? '' : laDung_(v);
  return String(v);
}

/** Thêm nhiều dòng vào cuối sheet trong một lần ghi; tự điền cột hệ thống. Trả số dòng đã thêm. */
function themDongCaiDat_(sh, def, tieuDe, ds, nguoi) {
  if (!ds.length) return 0;
  const luc = bayGio_();
  const hang = ds.map(function (o) {
    const d = Object.assign({}, o);
    if (!def.chiGhiThem) {
      d.CapNhatLuc = luc;
      d.CapNhatBoi = nguoi;
      d.PhienBan = 1;
      d.DaXoa = false;
    }
    return tieuDe.map(function (c) { return Object.prototype.hasOwnProperty.call(d, c) ? giaTriO_(def, c, d[c]) : ''; });
  });
  const dau = sh.getLastRow() + 1;
  const can = dau + hang.length - 1;
  if (sh.getMaxRows() < can) sh.insertRowsAfter(sh.getMaxRows(), can - sh.getMaxRows());
  sh.getRange(dau, 1, hang.length, tieuDe.length).setValues(hang);
  return hang.length;
}

/** Sửa một dòng: chỉ ghi các cột trong `thayDoi`, tăng PhienBan, ghi CapNhatLuc / CapNhatBoi. */
function suaDongCaiDat_(sh, def, tieuDe, soDong, thayDoi, nguoi) {
  const vung = sh.getRange(soDong, 1, 1, tieuDe.length);
  const cu = vung.getValues()[0];
  const moi = cu.slice();
  Object.keys(thayDoi).forEach(function (c) {
    const i = tieuDe.indexOf(c);
    if (i >= 0) moi[i] = giaTriO_(def, c, thayDoi[c]);
  });
  if (!def.chiGhiThem) {
    const iPB = tieuDe.indexOf('PhienBan');
    const iLuc = tieuDe.indexOf('CapNhatLuc');
    const iBoi = tieuDe.indexOf('CapNhatBoi');
    const iXoa = tieuDe.indexOf('DaXoa');
    if (iPB >= 0) moi[iPB] = (Number(cu[iPB]) || 0) + 1;
    if (iLuc >= 0) moi[iLuc] = bayGio_();
    if (iBoi >= 0) moi[iBoi] = nguoi;
    if (iXoa >= 0 && cu[iXoa] === '') moi[iXoa] = false;
  }
  vung.setValues([moi]);
}

function ghiNhatKyCaiDat_(ss, maNV, hanhDong, bang, maBanGhi, truocSau) {
  const sh = ss.getSheetByName('NhatKy');
  if (!sh) return;
  themDongCaiDat_(sh, timBang_('NhatKy'), docTieuDe_(sh), [{
    ThoiGian: bayGio_(), MaNV: maNV, HanhDong: hanhDong, Bang: bang, MaBanGhi: maBanGhi,
    TruocSau: truocSau || '', ClientId: ''
  }], maNV);
}

/** Giao diện hộp thoại của Sheets; null khi chạy từ trình soạn thảo hoặc trigger. */
function ui_() {
  try {
    return SpreadsheetApp.getUi();
  } catch (e) {
    return null;
  }
}

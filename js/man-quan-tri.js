/* ME – Quản lý Cơ điện · 机电管理系统
   man-quan-tri.js — Quản trị (cấp 1–2): người dùng và PIN tạm, phân quyền, danh mục, mẫu thông số, ghép cột file kho,
   từ điển song ngữ, nhật ký, cấu hình. Các việc này cần có mạng (ghi thẳng lên máy chủ, không qua hàng chờ). */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;
  const enc = encodeURIComponent;

  ME.nhan('Quản trị', {
    'nd.tieuDe': ['Người dùng', '用户'],
    'nd.tim': ['Tìm mã, tên', '搜索用户'],
    'nd.them': ['Thêm người dùng', '新增用户'],
    'nd.sua': ['Sửa người dùng', '编辑用户'],
    'nd.dangDung': ['Đang dùng', '启用'],
    'nd.ngung': ['Ngừng', '停用'],
    'nd.khoa': ['Đang khóa', '已锁定'],
    'nd.choDoiPin': ['Chờ đổi PIN', '待改PIN'],
    'nd.ma': ['Mã nhân viên', '员工编号'],
    'nd.maGoiY': ['Chữ in hoa không dấu, số, . - _ (2–20 ký tự) · VD NV007', '大写无声调字母、数字、. - _（2–20个字符）· 例 NV007'],
    'nd.hoTen': ['Họ tên', '姓名'],
    'nd.boPhan': ['Bộ phận', '部门'],
    'nd.chucVuVi': ['Chức vụ (tiếng Việt)', '职务（越南语）'],
    'nd.chucVuZh': ['Chức vụ (tiếng Trung)', '职务（中文）'],
    'nd.cap': ['Cấp quyền', '权限级别'],
    'nd.capGoiY': ['Cấp 2 chỉ quản lý người cấp 3–5.', '2级只能管理3–5级用户。'],
    'nd.quyenThem': ['Quyền thêm', '附加权限'],
    'nd.trangThai': ['Trạng thái', '状态'],
    'nd.luu': ['Lưu người dùng', '保存用户'],
    'nd.daLuu': ['Đã lưu {ma}', '已保存{ma}'],
    'nd.capPinTam': ['Cấp PIN tạm', '发放临时PIN码'],
    'nd.capPinHoi': ['Cấp PIN tạm mới cho {ten}? PIN cũ hết hiệu lực, người này bị đăng xuất khỏi mọi máy và phải đổi PIN khi đăng nhập.',
      '为{ten}发放新的临时PIN码？旧PIN码失效，该用户将在所有设备上退出，登录时需修改PIN码。'],
    'nd.pinTam': ['PIN tạm của {ten}', '{ten}的临时PIN码'],
    'nd.pinTamGiai': ['Chỉ hiện một lần. Đưa trực tiếp hoặc nhắn riêng cho người dùng. Lần đăng nhập đầu sẽ phải đổi PIN.', '仅显示一次。请当面告知或私信发送给用户。首次登录时需修改PIN码。'],
    'nd.moKhoa': ['Mở khóa PIN', '解除PIN锁定'],
    'nd.daMoKhoa': ['Đã mở khóa', '已解除锁定'],
    'nd.saiPin': ['Sai PIN {n} lần · khóa đến {gio}', '输错{n}次 · 锁定至{gio}'],
    'nd.saiPinN': ['Sai PIN {n} lần liên tiếp', '连续输错{n}次'],
    'nd.thongTinPin': ['PIN và đăng nhập', 'PIN与登录'],
    'nd.chinhMinh': ['Đây là tài khoản của bạn: đổi PIN ở Tài khoản → Đổi PIN.', '这是您的账户：请在“我的 → 修改PIN码”中修改。'],
    'nd.trong': ['Không có người dùng khớp', '没有匹配的用户'],
    'pq.tieuDe': ['Phân quyền theo cấp', '按级别的权限'],
    'pq.giai': ['Quyền đi theo cấp (1 cao nhất). Đổi cấp của một người ở Người dùng → chọn người → Cấp quyền. Quyền thêm NHAP_KHO cho người cấp 3–5 cập nhật file kho tuần.',
      '权限按级别划分（1级最高）。在“用户 → 选择用户 → 权限级别”中修改。附加权限NHAP_KHO可让3–5级用户导入每周库存文件。'],
    'pq.quyen': ['Quyền', '权限'],
    'dm.tieuDe': ['Danh mục', '基础资料'],
    'dm.loai': ['Loại danh mục', '目录类型'],
    'dm.heThong': ['Danh mục máy chủ dùng: chỉ sửa tên và thứ tự.', '系统使用的目录：只能修改名称和顺序。'],
    'dm.chonLuaChon': ['Lựa chọn của thông số «{ten}»', '参数「{ten}」的选项'],
    'dm.ma': ['Mã', '编码'],
    'dm.maGoiY': ['Chữ in hoa không dấu, số, _ · không đổi được sau khi lưu', '大写无声调字母、数字、_ · 保存后不能修改'],
    'dm.tenVi': ['Tên tiếng Việt', '越南语名称'],
    'dm.tenZh': ['Tên tiếng Trung', '中文名称'],
    'dm.thuTu': ['Thứ tự', '顺序'],
    'dm.kichHoat': ['Đang dùng (hiện trong danh sách chọn)', '启用（显示在选项中）'],
    'dm.them': ['Thêm mục', '新增条目'],
    'dm.sua': ['Sửa mục', '编辑条目'],
    'dm.daLuu': ['Đã lưu danh mục', '目录已保存'],
    'dm.tat': ['Đã tắt', '已停用'],
    'dm.trong': ['Danh mục này chưa có mục nào.', '此目录暂无条目。'],
    'ts.tieuDe': ['Mẫu thông số', '参数模板'],
    'ts.loaiTB': ['Loại thiết bị', '设备类别'],
    'ts.them': ['Thêm thông số', '新增参数'],
    'ts.sua': ['Sửa thông số', '编辑参数'],
    'ts.ma': ['Mã thông số', '参数编码'],
    'ts.maGoiY': ['VD CONG_SUAT · không đổi được sau khi lưu', '例 CONG_SUAT · 保存后不能修改'],
    'ts.nhom': ['Nhóm', '分组'],
    'ts.donVi': ['Đơn vị', '单位'],
    'ts.kieu': ['Kiểu dữ liệu', '数据类型'],
    'ts.batBuoc': ['Bắt buộc nhập khi thêm máy', '新增设备时必填'],
    'ts.luaChon': ['Sửa lựa chọn', '编辑选项'],
    'ts.xoa': ['Xóa thông số khỏi mẫu', '从模板删除参数'],
    'ts.xoaHoi': ['Xóa «{ten}» khỏi mẫu? Giá trị đã nhập ở các máy vẫn giữ.', '从模板删除「{ten}」？设备上已录入的数值仍保留。'],
    'ts.daLuu': ['Đã lưu mẫu thông số', '参数模板已保存'],
    'ts.trong': ['Loại máy này chưa có thông số mẫu.', '此设备类别暂无参数模板。'],
    'ts.chonGoiY': ['Kiểu «Chọn»: lựa chọn khai ở Danh mục, loại = mã thông số.', '“选项”类型：选项在基础资料中设置，类型=参数编码。'],
    'gc.tieuDe': ['Ghép cột file kho', '库存文件字段映射'],
    'gc.giai': ['Ghi đúng tên cột trong file kho tuần (dòng tiêu đề). Lần cập nhật file sau, app tự ghép theo các tên này.', '填写每周库存文件中的列名（标题行）。之后导入时应用将按这些名称自动匹配。'],
    'gc.cotFile': ['Tên cột trong file', '文件中的列名'],
    'gc.luu': ['Lưu cách ghép cột', '保存字段映射'],
    'gc.daLuu': ['Đã lưu cách ghép cột', '字段映射已保存'],
    'gc.thieuMa': ['Cần tên cột cho Mã linh kiện.', '需要填写料号列名。'],
    'td.tieuDe': ['Từ điển song ngữ', '双语词典'],
    'td.giai': ['Sửa chữ hiện trên app cho đúng cách nói trong nhà máy. Bản sửa áp dụng cho mọi máy sau khi đồng bộ.', '按厂内习惯修改应用中的文字。同步后所有设备生效。'],
    'td.tim': ['Tìm khóa, chữ Việt, chữ Trung', '搜索键、越南语、中文'],
    'td.daSua': ['Đã sửa', '已修改'],
    'td.mucKhac': ['Khác', '其他'],
    'td.sua': ['Sửa nhãn', '编辑标签'],
    'td.vi': ['Tiếng Việt', '越南语'],
    'td.zh': ['Tiếng Trung giản thể', '简体中文'],
    'td.macDinh': ['Mặc định: {vi} · {zh}', '默认：{vi} · {zh}'],
    'td.khoiPhuc': ['Khôi phục mặc định', '恢复默认'],
    'td.daLuu': ['Đã lưu bản dịch', '翻译已保存'],
    'td.soNhan': ['{n} nhãn · {m} đã sửa', '{n}个标签 · {m}个已修改'],
    'nk.nhatKy': ['Nhật ký hệ thống', '系统日志'],
    'nk.nguoi': ['Người', '人员'],
    'nk.bang': ['Bảng', '数据表'],
    'nk.xem': ['Xem nhật ký', '查看日志'],
    'nk.tong': ['{n} dòng khớp', '共{n}条'],
    'nk.trong': ['Không có dòng nhật ký khớp', '没有匹配的日志'],
    'nk.batDauXem': ['Chọn khoảng ngày rồi bấm Xem nhật ký.', '选择日期范围后点击“查看日志”。'],
    'ch.tieuDe': ['Cấu hình', '系统配置'],
    'ch.giai': ['Đổi cấu hình áp dụng cho mọi máy sau khi đồng bộ. Mục chỉ cấp 1 sửa được có khóa.', '修改后同步即对所有设备生效。带锁的项目仅1级可改。'],
    'ch.daLuu': ['Đã lưu cấu hình', '配置已保存'],
    'ch.trong': ['(trống)', '（空）'],
    'ch.GIO_GHI_CHI_SO': ['Giờ ghi chỉ số mỗi ngày (VD 07:00)', '每日抄表时间（例 07:00）'],
    'ch.GIO_HAN_GHI_CHI_SO': ['Hạn ghi chỉ số – quá giờ này Trang chủ nhắc (VD 08:00)', '抄表截止时间（例 08:00）'],
    'ch.NGUONG_BAT_THUONG_PT': ['Ngưỡng bất thường (% trên trung bình)', '异常阈值（高于均值的%）'],
    'ch.SO_NGAY_TRUNG_BINH': ['Số ngày lấy trung bình', '均值天数'],
    'ch.HE_SO_NGHI_NHAP_SAI': ['Gấp bao nhiêu lần trung bình thì hỏi lại (nghi nhập sai)', '超过均值多少倍时提示（疑似输错）'],
    'ch.THOI_HAN_PHIEN_NGAY': ['Số ngày app nhớ đăng nhập', '登录有效天数'],
    'ch.SO_LAN_SAI_PIN_TOI_DA': ['Sai PIN bao nhiêu lần thì khóa', '输错PIN几次锁定'],
    'ch.PHUT_KHOA_PIN': ['Số phút khóa khi sai PIN', 'PIN锁定分钟数'],
    'ch.PHIEN_BAN_APP_TOI_THIEU': ['Phiên bản app tối thiểu (để trống = không chặn)', '最低应用版本（留空=不限制）'],
    'ch.ANH_CANH_DAI_PX': ['Cạnh dài tối đa của ảnh (px)', '照片最长边（像素）'],
    'ch.GOI_NHAP_KHO_DONG': ['Số dòng mỗi gói khi cập nhật file kho', '库存导入每包行数']
  });

  const QUYEN = [
    ['XEM', 5, 'Xem thiết bị, kho, điện nước', '查看设备、库存、水电'],
    ['GHI_CHI_SO', 4, 'Ghi chỉ số điện nước', '抄水电表'],
    ['THEM_LINH_KIEN', 4, 'Thêm linh kiện (cấp 4 chờ duyệt)', '新增备件（4级需审核）'],
    ['DE_XUAT_LINH_KIEN', 4, 'Đề xuất gắn linh kiện cho máy', '建议设备关联备件'],
    ['SUA_THIET_BI', 3, 'Thêm, sửa thiết bị và thông số', '新增、编辑设备及参数'],
    ['GAN_LINH_KIEN', 3, 'Gắn linh kiện cho máy, duyệt đề xuất', '关联备件、审核建议'],
    ['SUA_LINH_KIEN', 3, 'Sửa linh kiện, duyệt bản dịch', '编辑备件、审核翻译'],
    ['DUYET_CHI_SO', 3, 'Sửa, duyệt chỉ số bất thường', '修改、审核异常读数'],
    ['XOA_THIET_BI', 2, 'Xóa thiết bị', '删除设备'],
    ['XEM_DON_GIA', 2, 'Xem đơn giá linh kiện', '查看备件单价'],
    ['NHAP_KHO', 2, 'Cập nhật file kho tuần (hoặc quyền thêm)', '导入每周库存文件（或附加权限）'],
    ['DUYET_LINH_KIEN', 2, 'Duyệt linh kiện mới, gộp mã tạm', '审核新增备件、合并临时编号'],
    ['QUAN_LY_DIEN_NUOC', 2, 'Chi phí, công tơ, bảng giá, thay công tơ', '费用、电表、价格、换表'],
    ['NGUOI_DUNG', 2, 'Người dùng, PIN tạm (cấp 2: người cấp 3–5)', '用户、临时PIN（2级：3–5级）'],
    ['QUAN_TRI', 2, 'Danh mục, mẫu thông số, từ điển, nhật ký', '基础资料、参数模板、词典、日志'],
    ['HE_THONG', 1, 'Cấu hình hệ thống (phiên, PIN, ảnh…)', '系统配置（会话、PIN、照片等）']
  ];
  const DM_HE_THONG = ['CAP', 'QUYEN_THEM', 'TRANG_THAI_ND', 'KIEU_DL', 'NGUON_LK', 'TRANG_THAI_FILE', 'TRANG_THAI_DUYET', 'TRANG_THAI_LAN_NHAP', 'LOAI_CONG_TO', 'KHUNG_GIO', 'TRANG_THAI_CONG_TO', 'CO_CHI_SO', 'LOAI_GIA'];
  const TEN_LOAI_DM = {
    KHU_VUC: ['Khu vực', '区域'], LOAI_TB: ['Loại thiết bị', '设备类别'], TRANG_THAI_TB: ['Trạng thái thiết bị', '设备状态'], MUC_QUAN_TRONG: ['Mức quan trọng', '重要等级'],
    BO_PHAN: ['Bộ phận', '部门'], DVT: ['Đơn vị tính', '单位'], NHOM_LK: ['Nhóm linh kiện', '备件类别'], DON_VI_CHU_KY: ['Đơn vị chu kỳ', '周期单位'], NHOM_TS: ['Nhóm thông số', '参数分组'],
    CAP: ['Cấp quyền', '权限级别'], QUYEN_THEM: ['Quyền thêm', '附加权限'], TRANG_THAI_ND: ['Trạng thái người dùng', '用户状态'], KIEU_DL: ['Kiểu dữ liệu', '数据类型'],
    NGUON_LK: ['Nguồn linh kiện', '备件来源'], TRANG_THAI_FILE: ['Trạng thái trong file', '文件状态'], TRANG_THAI_DUYET: ['Trạng thái duyệt', '审核状态'],
    TRANG_THAI_LAN_NHAP: ['Trạng thái lần nhập', '导入状态'], LOAI_CONG_TO: ['Loại công tơ', '电表类型'], KHUNG_GIO: ['Khung giờ', '时段'],
    TRANG_THAI_CONG_TO: ['Trạng thái công tơ', '电表状态'], CO_CHI_SO: ['Cờ chỉ số', '读数标记'], LOAI_GIA: ['Loại giá', '价格类型']
  };
  const HANH_DONG = {
    DANG_NHAP: ['Đăng nhập', '登录'], DANG_NHAP_SAI: ['Đăng nhập sai', '登录失败'], KHOA_PIN: ['Khóa do sai PIN', '因输错PIN锁定'], DOI_PIN: ['Đổi PIN', '修改PIN'],
    DANG_XUAT_MAY_KHAC: ['Đăng xuất máy khác', '退出其他设备'], DAT_LAI_PIN: ['Cấp PIN tạm', '发放临时PIN'], CAP_PIN_TAM: ['Cấp PIN tạm (trong file)', '发放临时PIN（表格）'],
    TAO_QUAN_TRI: ['Tạo quản trị', '创建管理员'], CAI_DAT: ['Cài đặt', '安装'], SAO_LUU: ['Sao lưu', '备份'],
    THEM_NGUOI_DUNG: ['Thêm người dùng', '新增用户'], SUA_NGUOI_DUNG: ['Sửa người dùng', '编辑用户'],
    THEM_THIET_BI: ['Thêm thiết bị', '新增设备'], SUA_THIET_BI: ['Sửa thiết bị', '编辑设备'], XOA_THIET_BI: ['Xóa thiết bị', '删除设备'],
    GAN_LINH_KIEN: ['Gắn linh kiện', '关联备件'], DE_XUAT_LINH_KIEN: ['Đề xuất gắn linh kiện', '建议关联备件'],
    THEM_LINH_KIEN: ['Thêm linh kiện', '新增备件'], SUA_LINH_KIEN: ['Sửa linh kiện', '编辑备件'], DUYET_LINH_KIEN: ['Duyệt linh kiện', '审核备件'], GOP_MA_TAM: ['Gộp mã tạm', '合并临时编号'],
    NHAP_KHO_BAT_DAU: ['Bắt đầu cập nhật kho', '开始导入库存'], NHAP_KHO_GOI: ['Ghi gói file kho', '写入库存数据包'], NHAP_KHO_XONG: ['Xong cập nhật kho', '库存导入完成'],
    LUU_GHEP_COT_KHO: ['Lưu ghép cột kho', '保存字段映射'], LUU_ANH: ['Lưu ảnh', '保存照片'],
    GHI_CHI_SO: ['Ghi chỉ số', '抄表'], SUA_CHI_SO: ['Sửa chỉ số', '修改读数'], DUYET_CHI_SO: ['Duyệt chỉ số', '审核读数'], XOA_CHI_SO: ['Xóa chỉ số', '删除读数'],
    THAY_CONG_TO: ['Thay công tơ', '换表'], THEM_CONG_TO: ['Thêm công tơ', '新增电表'], SUA_CONG_TO: ['Sửa công tơ', '编辑电表'], XOA_CONG_TO: ['Xóa công tơ', '删除电表'],
    LUU_BIEU_GIA: ['Lưu bảng giá', '保存价格'], LUU_DANH_MUC: ['Lưu danh mục', '保存目录'], LUU_MAU_THONG_SO: ['Lưu mẫu thông số', '保存参数模板'],
    LUU_TU_DIEN: ['Lưu từ điển', '保存词典'], BO_SUNG_TU_DIEN: ['Bổ sung từ điển', '补充词典'], LUU_CAU_HINH: ['Lưu cấu hình', '保存配置']
  };
  const BANG_NK = ['NguoiDung', 'ThietBi', 'ThongSoTB', 'LinhKienTB', 'KhoLinhKien', 'LanNhapKho', 'GhepCotKho', 'CongTo', 'ChiSo', 'BieuGia', 'DanhMuc', 'MauThongSo', 'TuDien', 'CauHinh'];

  function canQuyen(q, tieuDe) { return ME.co(q) ? null : ME.ui.manKhongQuyen(tieuDe); }
  function tenDM(loai) {
    if (TEN_LOAI_DM[loai]) return { vi: TEN_LOAI_DM[loai][0], zh: TEN_LOAI_DM[loai][1] };
    const ts = ME.du.ds('MauThongSo').filter(function (m) { return m.MaTS === loai; })[0];
    if (ts) return { vi: ME.tv('dm.chonLuaChon', { ten: ts.TenVi }), zh: ME.tz('dm.chonLuaChon', { ten: ts.TenZh || ts.TenVi }) };
    return { vi: loai, zh: '' };
  }
  /** Ô dịch tự động cho ô tiếng Trung. */
  function nutDich(oVi, oZh) {
    return h('button', {
      type: 'button', class: 'nut-canh', onClick: function () {
        const vi = oVi.value.trim();
        if (!vi) { oVi.focus(); return; }
        ME.goiMang('dichTen', { ds: [vi] }).then(function (d) { if (d.ds && d.ds[0]) oZh.value = d.ds[0]; }).catch(ME.boQua);
      }
    }, ME.ic('dich', 18, 2), h('span', null, ME.L('tb.dich')));
  }
  function hienPin(ten, pin) {
    const so = String(pin);
    ME.hoi({
      tieuDe: { vi: ME.tv('nd.pinTam', { ten: ten }), zh: ME.tz('nd.pinTam', { ten: ten }) },
      noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:12px;align-items:center' },
        h('div', { style: 'font-size:34px;font-weight:700;letter-spacing:0.12em;font-variant-numeric:tabular-nums;color:#1B365D;user-select:all;-webkit-user-select:all' }, so.slice(0, 3) + ' ' + so.slice(3)),
        h('div', { class: 'hop-cb' }, ME.ic('khoa', 20, 2), h('div', { class: 'chu' }, ME.L('nd.pinTamGiai'))),
        h('button', { type: 'button', class: 'nut-vien', onClick: function () { ME.saoChep(so); } }, ME.ic('saoChep', 18, 2), h('span', null, ME.L('chung.saoChep')))),
      nut: [{ nhan: 'chung.dong', gt: true, chinh: true }], dongNgoai: false
    });
  }

  // ═════════ Người dùng ═════════
  const locND = { tu: '', tt: 'HOAT_DONG' };
  function dangKhoa(r) { const t = new Date(String(r.KhoaDen || '')).getTime(); return !isNaN(t) && t > Date.now() ? t : 0; }
  ME.tuyen('/qt/nguoi-dung', {
    ve: function () {
      const cq = canQuyen('NGUOI_DUNG', 'nd.tieuDe');
      if (cq) return cq;
      const vung = h('div', { class: 'the', style: 'padding:4px 14px' });
      const chip = h('div', { class: 'hang-chip' });
      function veChip() {
        ME.xoaCon(chip);
        [['', 'chung.tatCa'], ['HOAT_DONG', 'nd.dangDung'], ['NGUNG', 'nd.ngung']].forEach(function (x) {
          chip.appendChild(ME.ui.chip(x[1], { chon: locND.tt === x[0], onClick: function () { locND.tt = x[0]; veChip(); veDS(); } }));
        });
      }
      function veDS() {
        ME.xoaCon(vung);
        const q = ME.boDau(locND.tu);
        const ds = ME.du.ds('NguoiDung').filter(function (r) {
          if (locND.tt && (r.TrangThai || 'HOAT_DONG') !== locND.tt) return false;
          return !q || ME.boDau(r.MaNV + ' ' + r.HoTen + ' ' + r.ChucVuVi).indexOf(q) >= 0;
        }).sort(function (a, b) { return (Number(a.Cap) - Number(b.Cap)) || String(a.HoTen).localeCompare(String(b.HoTen), 'vi'); });
        if (!ds.length) { vung.appendChild(ME.ui.trong('nd.trong')); return; }
        ds.forEach(function (r) {
          const bp = ME.dmTen('BO_PHAN', r.BoPhan);
          const nhan = [];
          if (r.TrangThai === 'NGUNG') nhan.push(ME.ui.nhanTTK('nd.ngung', 'xam'));
          if (dangKhoa(r)) nhan.push(ME.ui.nhanTTK('nd.khoa', 'do'));
          if (r.PhaiDoiPin === true) nhan.push(ME.ui.nhanTTK('nd.choDoiPin', 'cam'));
          vung.appendChild(h('a', { class: 'dong-qt' + (r.TrangThai === 'NGUNG' ? ' tat' : ''), href: '#/qt/nguoi-dung/' + enc(r.MaNV) },
            ME.ui.avt(r.HoTen, 'bieu-tuong b40'),
            h('div', { class: 'giua' }, h('span', { class: 'vi' }, r.HoTen),
              h('div', { class: 'phu' }, [r.MaNV, r.ChucVuVi, ME.tv('chung.capN', { n: String(r.Cap) }), bp.vi].filter(Boolean).join(' · ')),
              h('div', { class: 'phu zh' }, [r.MaNV, r.ChucVuZh || r.ChucVuVi, ME.tz('chung.capN', { n: String(r.Cap) }), bp.zh].filter(Boolean).join(' · '))),
            h('div', { style: 'display:flex;flex-direction:column;gap:4px;align-items:flex-end' }, nhan)));
        });
      }
      this._ve = veDS;
      veChip();
      veDS();
      return h('div', { class: 'trang' },
        ME.ui.dau({ tieuDe: 'nd.tieuDe', quayLai: '/tai-khoan', phai: ME.ui.nutIcon('cong', 'nd.them', '/qt/nguoi-dung/them', 'phai') }),
        h('main', { class: 'noi-dung' }, ME.ui.oTim({ goiY: 'nd.tim', giaTri: locND.tu, onTim: function (tu) { locND.tu = tu; veDS(); } }), chip, vung));
    },
    capNhat: function (el, loai) { if (loai === 'du-lieu' && this._ve) this._ve(); }
  });
  function formND(maSua) {
    const cq = canQuyen('NGUOI_DUNG', maSua ? 'nd.sua' : 'nd.them');
    if (cq) return cq;
    const r = maSua ? ME.du.lay('NguoiDung', maSua) : null;
    if (maSua && !r) return ME.ui.manKhongQuyen('nd.sua');
    const x = r || {};
    const capToi = ME.cap();
    const chinhMinh = ME.tt.phien && maSua === ME.tt.phien.maNV;
    const f = {
      MaNV: ME.ui.oNhap({ value: x.MaNV || '', disabled: !!maSua, autocapitalize: 'characters', maxlength: 20 }),
      HoTen: ME.ui.oNhap({ value: x.HoTen || '', maxlength: 60 }),
      BoPhan: ME.ui.chonO(ME.dsDM('BO_PHAN'), { giaTri: x.BoPhan, nhanTrong: 'chung.khongChon' }),
      ChucVuVi: ME.ui.oNhap({ value: x.ChucVuVi || '', maxlength: 80 }),
      ChucVuZh: ME.ui.oNhap({ value: x.ChucVuZh || '', maxlength: 80, lang: 'zh-Hans' }),
      Cap: ME.ui.chonO(ME.dsDM('CAP', true).filter(function (c) { return capToi === 1 || Number(c.gt) >= 3 || (chinhMinh && Number(c.gt) === Number(x.Cap)); })
        .map(function (c) { return { gt: c.gt, vi: c.gt + ' – ' + c.vi, zh: c.zh }; }), { giaTri: x.Cap === undefined ? '4' : String(x.Cap), trong: false, disabled: chinhMinh && capToi > 1 }),
      TrangThai: ME.ui.chonO(ME.dsDM('TRANG_THAI_ND', true), { giaTri: x.TrangThai || 'HOAT_DONG', trong: false, disabled: chinhMinh })
    };
    const quyenThem = String(x.QuyenThem || '').split(/[,;\s]+/).filter(String);
    const cbNhap = h('input', { type: 'checkbox', checked: quyenThem.indexOf('NHAP_KHO') >= 0, style: 'width:22px;height:22px;accent-color:#1B365D;flex-shrink:0' });
    const tNhap = ME.dmTen('QUYEN_THEM', 'NHAP_KHO');
    const vungLoi = h('div');
    function luu() {
      ME.xoaCon(vungLoi);
      const nd = { MaNV: maSua || ME.chuanMaNV(f.MaNV.value) };
      if (!/^[A-Z0-9][A-Z0-9._-]{1,19}$/.test(nd.MaNV)) { vungLoi.appendChild(ME.ui.loiTruong(ME.t('nd.maGoiY'))); return; }
      nd.HoTen = f.HoTen.value.trim();
      if (!nd.HoTen) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiThieu('nd.hoTen'))); return; }
      nd.BoPhan = f.BoPhan.value;
      nd.ChucVuVi = f.ChucVuVi.value.trim();
      nd.ChucVuZh = f.ChucVuZh.value.trim();
      if (!f.Cap.disabled) nd.Cap = Number(f.Cap.value);
      if (!f.TrangThai.disabled) nd.TrangThai = f.TrangThai.value;
      const qt = quyenThem.filter(function (q) { return q !== 'NHAP_KHO'; });
      if (cbNhap.checked) qt.push('NHAP_KHO');
      nd.QuyenThem = qt.join(',');
      if (maSua && x.PhienBan !== undefined && x.PhienBan !== '') nd.PhienBan = x.PhienBan;
      ME.goiMang('luuNguoiDung', { nd: nd }, { nhan: 'chung.dangLuu' }).then(function (d) {
        ME.thongBao('nd.daLuu', null, { ma: nd.MaNV });
        if (d.pinTam) hienPin(nd.HoTen, d.pinTam);
        return ME.dongBo().then(function () { ME.di('/qt/nguoi-dung/' + enc(nd.MaNV), true); });
      }).catch(ME.boQua);
    }
    const khoa = maSua ? dangKhoa(x) : 0;
    const hanhDong = [];
    if (maSua && !chinhMinh) {
      hanhDong.push(h('button', {
        type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
          ME.hoi({ tieuDe: 'nd.capPinTam', loiNhan: ME.t('nd.capPinHoi', { ten: x.HoTen }), nut: [{ nhan: 'nd.capPinTam', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }] }).then(function (ok) {
            if (!ok) return;
            ME.goiMang('datLaiPin', { maNV: maSua }).then(function (d) { hienPin(d.hoTen || x.HoTen, d.pinTam); ME.dongBo(); }).catch(ME.boQua);
          });
        }
      }, ME.ic('khoa', 18, 2), h('span', null, ME.L('nd.capPinTam'))));
      if (khoa || Number(x.SaiPin) > 0) {
        hanhDong.push(h('button', {
          type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
            ME.goiMang('luuNguoiDung', { nd: { MaNV: maSua, moKhoa: true } }).then(function () { ME.thongBao('nd.daMoKhoa'); return ME.dongBo(); }).catch(ME.boQua);
          }
        }, ME.ic('khoa', 18, 2), h('span', null, ME.L('nd.moKhoa'))));
      }
    }
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: maSua ? 'nd.sua' : 'nd.them', nho: true, quayLai: '/qt/nguoi-dung' }),
      h('main', { class: 'noi-dung' },
        h('div', { class: 'bieu-mau' },
          ME.ui.truongGY('nd.ma', f.MaNV, !maSua, maSua ? null : 'nd.maGoiY'),
          ME.ui.truong('nd.hoTen', f.HoTen, true),
          ME.ui.truong('nd.boPhan', f.BoPhan),
          h('div', { class: 'luoi-2' }, ME.ui.truong('nd.chucVuVi', f.ChucVuVi), ME.ui.truong('nd.chucVuZh', h('div', { class: 'hang-o' }, f.ChucVuZh))),
          ME.ui.truongGY('nd.cap', f.Cap, true, capToi > 1 ? 'nd.capGoiY' : null),
          ME.ui.truong('nd.quyenThem', h('label', { style: 'display:flex;gap:10px;align-items:center;min-height:44px' }, cbNhap, h('span', null, ME.L2(tNhap.vi || 'NHAP_KHO', tNhap.zh)))),
          ME.ui.truong('nd.trangThai', f.TrangThai),
          vungLoi),
        maSua ? h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' }, ME.ui.theTieuDe('nd.thongTinPin'),
          chinhMinh ? h('div', { class: 'ghi-chu' }, ME.L('nd.chinhMinh')) : null,
          x.PhaiDoiPin === true ? ME.ui.nhanTTK('nd.choDoiPin', 'cam') : null,
          Number(x.SaiPin) > 0 ? h('div', { class: 'ghi-chu' }, khoa ? ME.L('nd.saiPin', { n: Number(x.SaiPin), gio: ME.ngayGioVi(x.KhoaDen) }) : ME.L('nd.saiPinN', { n: Number(x.SaiPin) })) : null,
          hanhDong) : null),
      h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('nd.luu'))));
  }
  ME.tuyen('/qt/nguoi-dung/them', { ve: function () { return formND(null); } });
  ME.tuyen('/qt/nguoi-dung/:ma', { ve: function (ts) { return formND(ts.ma); } });

  // ═════════ Phân quyền ═════════
  ME.tuyen('/qt/phan-quyen', {
    ve: function () {
      const cq = canQuyen('NGUOI_DUNG', 'pq.tieuDe');
      if (cq) return cq;
      const cap = ME.dsDM('CAP', true);
      const o = function (noi, lop) { return h('div', { style: 'padding:8px 2px;text-align:center;border-top:1px solid #EAECF0;' + (lop || '') }, noi); };
      const luoi = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) repeat(5,30px);align-items:center;column-gap:2px' },
        h('div', { class: 'ghi-chu', style: 'padding:6px 0' }, ME.L('pq.quyen')),
        [1, 2, 3, 4, 5].map(function (n) { return h('div', { style: 'text-align:center;font-size:13px;font-weight:700' }, String(n)); }));
      QUYEN.forEach(function (q) {
        luoi.appendChild(h('div', { style: 'padding:8px 0;border-top:1px solid #EAECF0;line-height:1.3' }, h('span', { class: 'vi', style: 'font-size:13px;font-weight:600' }, q[2]), h('span', { class: 'zh', style: 'font-size:11px;color:#475467' }, q[3]),
          h('span', { class: 'vi', style: 'font-size:11px;color:#98A2B3;font-family:ui-monospace,Menlo,monospace' }, q[0])));
        for (let n = 1; n <= 5; n++) {
          luoi.appendChild(o(n <= q[1] ? ME.ic('check', 18, 2.6, { style: 'color:#0B6234', 'aria-label': 'có' }) : h('span', { style: 'color:#D0D5DD' }, '–')));
        }
      });
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'pq.tieuDe', nho: true, quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('pq.giai'))),
          h('section', { class: 'the' }, h('dl', { class: 'ds-tt nho' }, cap.map(function (c) { return ME.ui.dongTT([ME.tv('chung.capN', { n: c.gt }), ME.tz('chung.capN', { n: c.gt })], c.vi, c.zh); }))),
          h('section', { class: 'the' }, luoi)));
    }
  });

  // ═════════ Danh mục ═════════
  const stDM = { loai: 'KHU_VUC' };
  ME.tuyen('/qt/danh-muc', {
    ve: function (ts, q) {
      const cq = canQuyen('QUAN_TRI', 'dm.tieuDe');
      if (cq) return cq;
      if (q.loai) stDM.loai = q.loai;
      const coLoai = {};
      ME.du.ds('DanhMuc').forEach(function (r) { coLoai[r.Loai] = true; });
      Object.keys(TEN_LOAI_DM).forEach(function (k) { coLoai[k] = true; });
      ME.du.ds('MauThongSo').forEach(function (m) { if (m.KieuDL === 'CHON') coLoai[m.MaTS] = true; });
      coLoai[stDM.loai] = true;
      const dsLoai = Object.keys(coLoai).map(function (k) { const t = tenDM(k); return { gt: k, vi: t.vi, zh: t.zh, ht: DM_HE_THONG.indexOf(k) >= 0 }; })
        .sort(function (a, b) { return (a.ht - b.ht) || a.vi.localeCompare(b.vi, 'vi'); });
      const heThong = DM_HE_THONG.indexOf(stDM.loai) >= 0;
      const ds = ME.dm(stDM.loai, true);
      function suaMuc(r) {
        const laMoi = !r;
        r = r || {};
        const oMa = ME.ui.oNhap({ value: r.Ma || '', disabled: !laMoi, autocapitalize: 'characters', maxlength: 40 });
        const oVi = ME.ui.oNhap({ value: r.TenVi || '', maxlength: 200 });
        const oZh = ME.ui.oNhap({ value: r.TenZh || '', maxlength: 200, lang: 'zh-Hans' });
        const oTT = ME.ui.oNhap({ value: r.ThuTu === undefined ? '' : String(r.ThuTu), inputmode: 'numeric' });
        const cb = h('input', { type: 'checkbox', checked: r.KichHoat !== false, disabled: heThong, style: 'width:22px;height:22px;accent-color:#1B365D' });
        ME.hoi({
          tieuDe: laMoi ? 'dm.them' : 'dm.sua',
          noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            ME.ui.truongGY('dm.ma', oMa, true, laMoi ? 'dm.maGoiY' : null),
            ME.ui.truong('dm.tenVi', oVi, true),
            ME.ui.truong('dm.tenZh', h('div', { class: 'hang-o' }, oZh, nutDich(oVi, oZh)), true),
            ME.ui.truong('dm.thuTu', oTT),
            heThong ? null : h('label', { style: 'display:flex;gap:10px;align-items:center' }, cb, h('span', null, ME.L('dm.kichHoat')))),
          nut: [{ nhan: 'chung.luu', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true, dongNgoai: false
        }).then(function (ok) {
          if (!ok) return;
          const o = { Loai: stDM.loai, Ma: ME.chuanMa(oMa.value), TenVi: oVi.value.trim(), TenZh: oZh.value.trim() };
          if (oTT.value.trim() !== '') o.ThuTu = oTT.value.trim();
          if (!heThong) o.KichHoat = cb.checked;
          ME.goiMang('luuDanhMuc', { ds: [o] }, { nhan: 'chung.dangLuu' }).then(function () { ME.thongBao('dm.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
        });
      }
      return h('div', { class: 'trang' },
        ME.ui.dau({ tieuDe: 'dm.tieuDe', nho: true, quayLai: '/tat-ca', phai: heThong ? null : ME.ui.nutIcon('cong', 'dm.them', function () { suaMuc(null); }, 'phai') }),
        h('main', { class: 'noi-dung' },
          ME.ui.truong('dm.loai', ME.ui.chonO(dsLoai, { giaTri: stDM.loai, trong: false, onChange: function (v) { stDM.loai = v; ME.veLai(); } })),
          heThong ? h('div', { class: 'hop-tin' }, ME.ic('khoa', 20, 2), h('div', { class: 'chu' }, ME.L('dm.heThong'))) : null,
          h('section', { class: 'the', style: 'padding:4px 14px' }, ds.length ? ds.map(function (r) {
            return h('button', { type: 'button', class: 'dong-qt' + (r.KichHoat === false ? ' tat' : ''), onClick: function () { suaMuc(r); } },
              h('div', { class: 'giua' }, ME.L2(r.TenVi, r.TenZh), h('div', { class: 'phu' }, r.Ma + ' · ' + ME.tv('dm.thuTu') + ' · ' + ME.tz('dm.thuTu') + ' ' + (r.ThuTu === '' ? '–' : r.ThuTu))),
              r.KichHoat === false ? ME.ui.nhanTTK('dm.tat', 'xam') : null, ME.ic('but', 18, 1.8, { class: 'mui-ten' }));
          }) : ME.ui.trong('dm.trong'))));
    },
    tuLamMoi: true
  });

  // ═════════ Mẫu thông số ═════════
  const stTS = { loai: '' };
  ME.tuyen('/qt/mau-ts', {
    ve: function (ts, q) {
      const cq = canQuyen('QUAN_TRI', 'ts.tieuDe');
      if (cq) return cq;
      const loaiDS = ME.dsDM('LOAI_TB', true);
      if (q.loai) stTS.loai = q.loai;
      if (!stTS.loai && loaiDS.length) stTS.loai = loaiDS[0].gt;
      const thuTuNhom = {};
      ME.dm('NHOM_TS', true).forEach(function (x, i) { thuTuNhom[x.Ma] = i; });
      const ds = ME.du.ds('MauThongSo').filter(function (m) { return m.LoaiTB === stTS.loai; })
        .sort(function (a, b) { return ((thuTuNhom[a.Nhom] || 0) - (thuTuNhom[b.Nhom] || 0)) || ((Number(a.ThuTu) || 0) - (Number(b.ThuTu) || 0)); });
      function sua(m) {
        const laMoi = !m;
        m = m || {};
        const oMa = ME.ui.oNhap({ value: m.MaTS || '', disabled: !laMoi, autocapitalize: 'characters', maxlength: 40 });
        const oVi = ME.ui.oNhap({ value: m.TenVi || '', maxlength: 120 });
        const oZh = ME.ui.oNhap({ value: m.TenZh || '', maxlength: 120, lang: 'zh-Hans' });
        const oNhom = ME.ui.chonO(ME.dsDM('NHOM_TS', true), { giaTri: m.Nhom || 'VAN_HANH', trong: false });
        const oDV = ME.ui.oNhap({ value: m.DonVi || '', maxlength: 30 });
        const oKieu = ME.ui.chonO(ME.dsDM('KIEU_DL', true), { giaTri: m.KieuDL || 'CHU', trong: false });
        const oTT = ME.ui.oNhap({ value: m.ThuTu === undefined ? '' : String(m.ThuTu), inputmode: 'numeric' });
        const cb = h('input', { type: 'checkbox', checked: m.BatBuoc === true, style: 'width:22px;height:22px;accent-color:#1B365D' });
        const nut = [{ nhan: 'chung.luu', gt: 'luu', chinh: true }, { nhan: 'chung.huy', gt: null }];
        if (!laMoi) nut.push({ nhan: 'ts.xoa', gt: 'xoa', nguy: true });
        if (!laMoi && m.KieuDL === 'CHON') nut.splice(1, 0, { nhan: 'ts.luaChon', gt: 'chon' });
        ME.hoi({
          tieuDe: laMoi ? 'ts.them' : 'ts.sua',
          noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            ME.ui.truongGY('ts.ma', oMa, true, laMoi ? 'ts.maGoiY' : null),
            ME.ui.truong('dm.tenVi', oVi, true),
            ME.ui.truong('dm.tenZh', h('div', { class: 'hang-o' }, oZh, nutDich(oVi, oZh))),
            h('div', { class: 'luoi-2' }, ME.ui.truong('ts.nhom', oNhom), ME.ui.truong('ts.donVi', oDV)),
            h('div', { class: 'luoi-2' }, ME.ui.truongGY('ts.kieu', oKieu, false, 'ts.chonGoiY'), ME.ui.truong('dm.thuTu', oTT)),
            h('label', { style: 'display:flex;gap:10px;align-items:center' }, cb, h('span', null, ME.L('ts.batBuoc')))),
          nut: nut, dongNgoai: false
        }).then(function (gt) {
          if (!gt) return;
          if (gt === 'chon') { ME.di('/qt/danh-muc?loai=' + enc(m.MaTS)); return; }
          if (gt === 'xoa') {
            ME.hoi({ loiNhan: ME.t('ts.xoaHoi', { ten: m.TenVi }), nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true }).then(function (ok) {
              if (!ok) return;
              ME.goiMang('luuMauThongSo', { ds: [{ LoaiTB: stTS.loai, MaTS: m.MaTS, xoa: true }] }, { nhan: 'chung.dangLuu' }).then(function () { ME.thongBao('ts.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
            });
            return;
          }
          const o = { LoaiTB: stTS.loai, MaTS: ME.chuanMa(oMa.value), TenVi: oVi.value.trim(), TenZh: oZh.value.trim(), Nhom: oNhom.value, DonVi: oDV.value.trim(), KieuDL: oKieu.value, BatBuoc: cb.checked };
          if (oTT.value.trim() !== '') o.ThuTu = oTT.value.trim();
          ME.goiMang('luuMauThongSo', { ds: [o] }, { nhan: 'chung.dangLuu' }).then(function () { ME.thongBao('ts.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
        });
      }
      let nhomTruoc = null;
      const dong = [];
      ds.forEach(function (m) {
        if (m.Nhom !== nhomTruoc) { nhomTruoc = m.Nhom; const t = ME.dmTen('NHOM_TS', m.Nhom); dong.push(h('div', { class: 'nhom-tieu', style: 'margin:12px 0 2px' }, ME.L2(t.vi, t.zh))); }
        const kieu = ME.dmTen('KIEU_DL', m.KieuDL);
        dong.push(h('button', { type: 'button', class: 'dong-qt', onClick: function () { sua(m); } },
          h('div', { class: 'giua' }, ME.L2(m.TenVi, m.TenZh), h('div', { class: 'phu' }, [m.MaTS, m.DonVi, kieu.vi, kieu.zh].filter(Boolean).join(' · '))),
          m.BatBuoc === true ? ME.ui.nhanTTK('chung.batBuoc', 'do') : null, ME.ic('but', 18, 1.8, { class: 'mui-ten' })));
      });
      return h('div', { class: 'trang' },
        ME.ui.dau({ tieuDe: 'ts.tieuDe', nho: true, quayLai: '/tat-ca', phai: ME.ui.nutIcon('cong', 'ts.them', function () { sua(null); }, 'phai') }),
        h('main', { class: 'noi-dung' },
          ME.ui.truong('ts.loaiTB', ME.ui.chonO(loaiDS, { giaTri: stTS.loai, trong: false, onChange: function (v) { stTS.loai = v; ME.veLai(); } })),
          h('section', { class: 'the', style: 'padding:4px 14px' }, dong.length ? dong : ME.ui.trong('ts.trong'))));
    },
    tuLamMoi: true
  });

  // ═════════ Ghép cột file kho ═════════
  ME.tuyen('/qt/ghep-cot', {
    ve: function () {
      const cq = canQuyen('NHAP_KHO', 'gc.tieuDe');
      if (cq) return cq;
      const truong = [['MaLK', 'lk.ma', true], ['TenVi', 'lk.tenVi'], ['QuyCach', 'lk.quyCach'], ['DVT', 'lk.dvt'], ['TonKho', 'nk.tonKho'], ['DonGia', 'lk.donGia'], ['ViTriKho', 'lk.viTri']];
      const o = {};
      truong.forEach(function (t) {
        const r = ME.du.ds('GhepCotKho').filter(function (x) { return x.TruongApp === t[0]; })[0];
        o[t[0]] = ME.ui.oNhap({ value: r ? r.CotFile : '', placeholder: ME.t1('gc.cotFile') });
      });
      const vungLoi = h('div');
      function luu() {
        ME.xoaCon(vungLoi);
        if (!o.MaLK.value.trim()) { vungLoi.appendChild(ME.ui.loiTruong(ME.t('gc.thieuMa'))); return; }
        const ds = truong.filter(function (t) { return o[t[0]].value.trim(); }).map(function (t) { return { TruongApp: t[0], CotFile: o[t[0]].value.trim(), BatBuoc: t[0] === 'MaLK' }; });
        ME.goiMang('luuGhepCotKho', { ds: ds }, { nhan: 'chung.dangLuu' }).then(function () { ME.thongBao('gc.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
      }
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'gc.tieuDe', nho: true, quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('gc.giai'))),
          h('div', { class: 'bieu-mau' }, truong.map(function (t) { return ME.ui.truong(t[1], o[t[0]], !!t[2]); }), vungLoi)),
        h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('gc.luu'))));
    }
  });

  // ═════════ Từ điển song ngữ ═════════
  const stTD = { tu: '' };
  ME.tuyen('/qt/tu-dien', {
    ve: function () {
      const cq = canQuyen('QUAN_TRI', 'td.tieuDe');
      if (cq) return cq;
      const sheet = {};
      ME.du.ds('TuDien').forEach(function (r) { sheet[r.Khoa] = r; });
      const khoa = Array.from(new Set(Object.keys(ME.NHAN).concat(Object.keys(sheet)))).sort();
      const muc = khoa.map(function (k) {
        const goc = ME.NHAN[k];
        const t = ME.t(k);
        return { k: k, vi: t.vi, zh: t.zh, nhom: goc ? goc[2] : ME.tv('td.mucKhac'), daSua: !!ME.tuDien(k), goc: goc };
      });
      const daSua = muc.filter(function (m) { return m.daSua; }).length;
      const vung = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      function sua(m) {
        const oVi = h('textarea', { class: 'o-nhap', rows: 2 });
        oVi.value = m.vi;
        const oZh = h('textarea', { class: 'o-nhap', rows: 2, lang: 'zh-Hans' });
        oZh.value = m.zh;
        const nut = [{ nhan: 'chung.luu', gt: 'luu', chinh: true }, { nhan: 'chung.huy', gt: null }];
        if (m.daSua && m.goc) nut.push({ nhan: 'td.khoiPhuc', gt: 'goc' });
        ME.hoi({
          tieuDe: 'td.sua',
          noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            h('div', { class: 'ghi-chu', style: 'font-family:ui-monospace,Menlo,monospace' }, m.k),
            ME.ui.truong('td.vi', oVi), ME.ui.truong('td.zh', oZh),
            m.goc ? h('div', { class: 'ghi-chu c11' }, ME.L('td.macDinh', { vi: m.goc[0], zh: m.goc[1] })) : null),
          nut: nut, dongNgoai: false
        }).then(function (gt) {
          if (!gt) return;
          const o = { Khoa: m.k, Vi: gt === 'goc' ? m.goc[0] : oVi.value.trim(), Zh: gt === 'goc' ? m.goc[1] : oZh.value.trim() };
          ME.goiMang('luuTuDien', { ds: [o] }, { nhan: 'chung.dangLuu' }).then(function () { ME.thongBao('td.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
        });
      }
      function veDS() {
        ME.xoaCon(vung);
        const q = ME.boDau(stTD.tu);
        const ds = muc.filter(function (m) { return !q || ME.boDau(m.k + ' ' + m.vi).indexOf(q) >= 0 || m.zh.indexOf(stTD.tu.trim()) >= 0; });
        if (!ds.length) { vung.appendChild(ME.ui.trong('chung.khongThay')); return; }
        ME.ui.dsDai(ds, function (m) {
          return h('button', { type: 'button', class: 'muc', style: 'flex-direction:column;align-items:stretch;gap:2px', onClick: function () { sua(m); } },
            h('div', { style: 'display:flex;justify-content:space-between;gap:8px' }, h('span', { style: 'font-size:11.5px;color:#667085;font-family:ui-monospace,Menlo,monospace;overflow-wrap:anywhere' }, m.k + ' · ' + m.nhom),
              m.daSua ? ME.ui.nhanTTK('td.daSua', 'tim') : null),
            h('div', { class: 'ten' }, ME.L2(m.vi, m.zh)));
        }, 60, vung);
      }
      veDS();
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'td.tieuDe', nho: true, quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('dich', 20, 2), h('div', { class: 'chu' }, ME.L('td.giai'), h('span', { class: 'vi', style: 'margin-top:6px;font-weight:600' }, ME.tv('td.soNhan', { n: muc.length, m: daSua })), h('span', { class: 'zh' }, ME.tz('td.soNhan', { n: muc.length, m: daSua })))),
          ME.ui.oTim({ goiY: 'td.tim', giaTri: stTD.tu, onTim: function (tu) { stTD.tu = tu; veDS(); } }),
          vung));
    },
    tuLamMoi: true
  });

  // ═════════ Nhật ký ═════════
  const stNK = { tu: '', den: '', maNV: '', bang: '', ds: [], tong: 0, daXem: false };
  ME.tuyen('/qt/nhat-ky', {
    ve: function () {
      const cq = canQuyen('QUAN_TRI', 'nk.nhatKy');
      if (cq) return cq;
      if (!stNK.tu) { stNK.tu = ME.congNgay(ME.homNay(), -7); stNK.den = ME.homNay(); }
      const oTu = ME.ui.oNhap({ type: 'date', value: stNK.tu });
      const oDen = ME.ui.oNhap({ type: 'date', value: stNK.den });
      const oNguoi = ME.ui.chonO(ME.du.ds('NguoiDung').map(function (r) { return { gt: r.MaNV, vi: r.HoTen + ' (' + r.MaNV + ')', zh: '' }; }), { giaTri: stNK.maNV, nhanTrong: 'chung.tatCa' });
      const oBang = ME.ui.chonO(BANG_NK.map(function (b) { return { gt: b, vi: b, zh: '' }; }), { giaTri: stNK.bang, nhanTrong: 'chung.tatCa' });
      const vung = h('section', { class: 'the', style: 'padding:4px 14px' });
      const dongNK = function (r) {
        const hd = HANH_DONG[r.HanhDong] || [r.HanhDong, ''];
        let ct = r.TruocSau || '';
        try { if (ct && /^[{[]/.test(ct)) ct = JSON.stringify(JSON.parse(ct), null, 1); } catch (e) { /* để nguyên */ }
        const chiTiet = ct ? h('div', { class: 'chi-tiet', hidden: true }, ct) : null;
        return h('div', { class: 'nk-dong', role: ct ? 'button' : null, tabindex: ct ? '0' : null, onClick: function () { if (chiTiet) chiTiet.hidden = !chiTiet.hidden; } },
          h('div', { class: 'tren' }, h('span', { class: 'vi' }, hd[0] + (hd[1] ? ' · ' + hd[1] : '')), h('span', { class: 'gio' }, ME.ngayGioVi(r.ThoiGian))),
          h('div', { class: 'phu' }, [ME.tenNguoi(r.MaNV) + (r.MaNV && ME.tenNguoi(r.MaNV) !== r.MaNV ? ' (' + r.MaNV + ')' : ''), r.Bang, r.MaBanGhi].filter(Boolean).join(' · ')),
          chiTiet);
      };
      function veDS() {
        ME.xoaCon(vung);
        if (!stNK.daXem) { vung.appendChild(h('div', { class: 'ghi-chu', style: 'padding:12px 0' }, ME.L('nk.batDauXem'))); return; }
        vung.appendChild(h('div', { class: 'ghi-chu', style: 'padding:8px 0' }, ME.L('nk.tong', { n: stNK.tong })));
        if (!stNK.ds.length) { vung.appendChild(ME.ui.trong('nk.trong')); return; }
        stNK.ds.forEach(function (r) { vung.appendChild(dongNK(r)); });
        if (stNK.ds.length < stNK.tong) vung.appendChild(h('button', { type: 'button', class: 'lien-ket-phai', style: 'width:100%;text-align:center;min-height:48px', onClick: function () { xem(true); } }, ME.L('chung.xemThem')));
      }
      function xem(them) {
        stNK.tu = oTu.value;
        stNK.den = oDen.value;
        stNK.maNV = oNguoi.value;
        stNK.bang = oBang.value;
        const loc = { tuNgay: stNK.tu, denNgay: stNK.den, maNV: stNK.maNV, bang: stNK.bang, tu: them ? stNK.ds.length : 0, gioiHan: 100 };
        ME.goiMang('xemNhatKy', loc, { nhan: 'chung.dangTai' }).then(function (d) {
          const b = d.bang || {};
          const moi = (b.dong || []).map(function (row) { const r = {}; (b.cot || []).forEach(function (c, i) { r[c] = row[i]; }); return r; });
          stNK.ds = them ? stNK.ds.concat(moi) : moi;
          stNK.tong = d.tong || 0;
          stNK.daXem = true;
          veDS();
        }).catch(ME.boQua);
      }
      veDS();
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'nk.nhatKy', nho: true, quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'bieu-mau', style: 'gap:12px' },
            h('div', { class: 'luoi-2' }, ME.ui.truong('chung.tuNgay', oTu), ME.ui.truong('chung.denNgay', oDen)),
            h('div', { class: 'luoi-2' }, ME.ui.truong('nk.nguoi', oNguoi), ME.ui.truong('nk.bang', oBang)),
            h('button', { type: 'button', class: 'nut-chinh n14', onClick: function () { xem(false); } }, ME.L('nk.xem'))),
          vung));
    }
  });

  // ═════════ Cấu hình ═════════
  const CAU_HINH = [
    ['GIO_GHI_CHI_SO', 2, 'gio'], ['GIO_HAN_GHI_CHI_SO', 2, 'gio'], ['NGUONG_BAT_THUONG_PT', 2, 'so'], ['SO_NGAY_TRUNG_BINH', 2, 'so'], ['HE_SO_NGHI_NHAP_SAI', 2, 'so'],
    ['THOI_HAN_PHIEN_NGAY', 1, 'so'], ['SO_LAN_SAI_PIN_TOI_DA', 1, 'so'], ['PHUT_KHOA_PIN', 1, 'so'], ['PHIEN_BAN_APP_TOI_THIEU', 1, 'chu'],
    ['ANH_CANH_DAI_PX', 1, 'so'], ['GOI_NHAP_KHO_DONG', 1, 'so']
  ];
  ME.tuyen('/qt/cau-hinh', {
    ve: function () {
      const cq = canQuyen('QUAN_TRI', 'ch.tieuDe');
      if (cq) return cq;
      const cap = ME.cap();
      function sua(k, kieu) {
        const o = ME.ui.oNhap({ value: String(ME.cauHinh(k) || ''), inputmode: kieu === 'so' ? 'decimal' : (kieu === 'gio' ? 'numeric' : 'text'), placeholder: kieu === 'gio' ? '07:00' : '' });
        ME.hoi({ tieuDe: 'ch.' + k, noiDung: o, nut: [{ nhan: 'chung.luu', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true }).then(function (ok) {
          if (!ok) return;
          const ds = {};
          ds[k] = o.value.trim();
          ME.goiMang('luuCauHinh', { ds: ds }, { nhan: 'chung.dangLuu' }).then(function (d) {
            if (d.cauHinh) { ME.tt.dongBo.cauHinh = d.cauHinh; ME.luuMeta('dongBo'); }
            ME.thongBao('ch.daLuu');
            ME.veLai();
          }).catch(ME.boQua);
        });
      }
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'ch.tieuDe', nho: true, quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('ch.giai'))),
          h('section', { class: 'the', style: 'padding:4px 14px' }, CAU_HINH.map(function (x) {
            const duoc = cap <= x[1];
            const gt = String(ME.cauHinh(x[0]) || '');
            return h('button', { type: 'button', class: 'dong-qt', disabled: !duoc, style: duoc ? '' : 'opacity:0.6', onClick: function () { if (duoc) sua(x[0], x[2]); } },
              h('div', { class: 'giua' }, ME.L('ch.' + x[0]), h('div', { class: 'phu' }, x[0])),
              h('span', { style: 'font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;flex-shrink:0' }, gt === '' ? ME.tv('ch.trong') : gt),
              ME.ic(duoc ? 'but' : 'khoa', 18, 1.8, { class: 'mui-ten' }));
          }))));
    }
  });
})();

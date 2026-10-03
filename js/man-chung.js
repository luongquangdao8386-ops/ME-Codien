/* ME – Quản lý Cơ điện · 机电管理系统
   man-chung.js — Kết nối máy chủ, Đăng nhập PIN (bản vẽ 1), Đổi PIN, Trang chủ (bản vẽ 2), Cần xử lý,
   Tất cả chức năng (bản vẽ 3), Quét QR, Tài khoản, Mã QR kết nối. */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;
  const enc = encodeURIComponent;

  ME.nhan('Kết nối', {
    'kn.tieuDe': ['Kết nối máy chủ', '连接服务器'],
    'kn.giaiThich': ['Dán link Web App (kết thúc bằng /exec) quản trị gửi cho bạn, hoặc quét Mã QR kết nối trên máy của quản trị.',
      '粘贴管理员发给您的Web App链接（以/exec结尾），或扫描管理员手机上的连接二维码。'],
    'kn.link': ['Link máy chủ', '服务器链接'],
    'kn.dan': ['Dán link', '粘贴链接'],
    'kn.quet': ['Quét mã QR kết nối', '扫描连接二维码'],
    'kn.ketNoi': ['Kiểm tra và kết nối', '检查并连接'],
    'kn.dangKiem': ['Đang kiểm tra máy chủ…', '正在检查服务器…'],
    'kn.chuaCaiDat': ['Máy chủ trả lời nhưng chưa cài đặt xong. {ly}', '服务器有响应，但尚未完成安装。{ly}'],
    'kn.daKetNoi': ['Đã kết nối máy chủ {ban}.', '已连接服务器 {ban}。'],
    'kn.riengTu': ['Link chỉ lưu trên máy này. Đừng đăng link lên nơi công khai.', '链接只保存在本机，请勿公开发布。'],
    'kn.doiMayChu': ['Đổi máy chủ', '更换服务器'],
    'kn.mayChu': ['Máy chủ', '服务器'],
    'kn.lanDau404': ['Vừa triển khai thì vài phút đầu Google có thể báo 404 – đợi rồi bấm lại.', '刚部署的几分钟内Google可能返回404，请稍候再试。'],
    'kn.caiApp': ['Cài app vào màn hình chính trước', '请先把应用添加到主屏幕'],
    'kn.caiAppND': ['Safari: bấm Chia sẻ (hoặc ••• → Chia sẻ) → Thêm vào MH chính → Thêm. Rồi mở ME từ biểu tượng mới và kết nối, đăng nhập trong đó. Dữ liệu trong Safari và trong app đã cài là riêng nhau.',
      'Safari：点“分享”（或 ••• → 分享）→“添加到主屏幕”→添加。然后从新图标打开ME，在应用内连接并登录。Safari与已安装应用的数据互不相通。']
  });
  ME.nhan('Đăng nhập', {
    'dn.tieuDe': ['Đăng nhập PIN', 'PIN码登录'],
    'dn.ten': ['Quản lý Cơ điện', '机电管理系统'],
    'dn.doiNguoi': ['Đổi người', '切换用户'],
    'dn.nhapPin': ['Nhập mã PIN 6 số', '请输入6位PIN码'],
    'dn.maNV': ['Mã nhân viên', '员工编号'],
    'dn.maNVGoiY': ['VD NV001', '例 NV001'],
    'dn.saiKhoa': ['Sai {n} lần liên tiếp sẽ khóa {p} phút', '连续输错{n}次将锁定{p}分钟'],
    'dn.quenPin': ['Quên PIN?', '忘记PIN码'],
    'dn.quenPinND': ['Nhờ quản trị (cấp 1–2) cấp PIN tạm: Quản trị → Người dùng → chọn tên bạn → Cấp PIN tạm. Đăng nhập bằng PIN tạm, app sẽ bắt đặt PIN mới.',
      '请管理员（1–2级）发放临时PIN码：管理 → 用户 → 选择您的名字 → 发放临时PIN码。用临时PIN码登录后，应用会要求设置新PIN码。'],
    'dn.moKhiMatMang': ['Mở được cả khi mất mạng', '断网时也能打开'],
    'dn.canMangLanDau': ['Đăng nhập lần đầu trên máy cần có mạng', '首次在本机登录需要联网'],
    'dn.dangKiem': ['Đang kiểm tra…', '正在验证…'],
    'dn.thieuMa': ['Nhập mã nhân viên trước.', '请先输入员工编号。'],
    'dn.quayLaiNguoiCu': ['Quay lại {ten}', '返回 {ten}'],
    'dn.dangKhoaDen': ['Tạm khóa đến {gio}', '暂时锁定至{gio}'],
    'dn.hetPhien': ['Phiên đăng nhập đã hết hạn hoặc đã đổi PIN ở máy khác. Nhập PIN để đăng nhập lại.', '登录已过期或已在其他设备修改PIN码，请输入PIN码重新登录。'],
    'dn.taiKhoanNgung': ['Tài khoản đã ngừng dùng. Liên hệ quản trị.', '账户已停用，请联系管理员。']
  });
  ME.nhan('Đổi PIN', {
    'pin.tieuDe': ['Đổi PIN', '修改PIN码'],
    'pin.buoc1': ['Nhập PIN hiện tại', '请输入当前PIN码'],
    'pin.buoc1Tam': ['Nhập PIN tạm quản trị đưa', '请输入管理员提供的临时PIN码'],
    'pin.buoc2': ['Đặt PIN mới 6 số', '设置6位新PIN码'],
    'pin.buoc3': ['Nhập lại PIN mới', '再次输入新PIN码'],
    'pin.batBuoc': ['Bạn đang dùng PIN tạm. Đặt PIN mới để tiếp tục.', '您正在使用临时PIN码，请设置新PIN码后继续。'],
    'pin.deDoan': ['PIN quá dễ đoán (lặp, dãy số, đối xứng…). Chọn PIN khác.', 'PIN码过于简单（重复、连续或对称等），请换一个。'],
    'pin.trungCu': ['PIN mới phải khác PIN cũ.', '新PIN码不能与旧PIN码相同。'],
    'pin.khongKhop': ['Hai lần nhập không giống nhau. Đặt lại PIN mới.', '两次输入不一致，请重新设置新PIN码。'],
    'pin.daDoi': ['Đã đổi PIN. Các máy khác sẽ phải đăng nhập lại.', 'PIN码已修改，其他设备需要重新登录。'],
    'pin.goiY': ['Không dùng ngày sinh, số điện thoại hay dãy dễ đoán.', '请勿使用生日、电话号码或容易猜到的数字。']
  });
  ME.nhan('Trang chủ', {
    'home.tieuDe': ['Trang chủ', '首页'],
    'home.chucVuCap': ['{cv} · Cấp {cap}', '{cv} · {cap}级'],
    'home.daDongBo': ['Đã đồng bộ {gio} · {n} mục chờ gửi', '已同步 {gio} · {n}项待发送'],
    'home.dangDongBo': ['Đang đồng bộ…', '同步中…'],
    'home.matMang': ['Mất mạng · {n} mục chờ gửi', '离线 · {n}项待发送'],
    'home.loiDongBo': ['Chưa đồng bộ được · bấm để thử lại', '同步失败 · 点击重试'],
    'home.chuaDongBo': ['Chưa đồng bộ', '尚未同步'],
    'home.dongBoNgay': ['Đồng bộ ngay', '立即同步'],
    'home.suCo': ['Máy đang sự cố', '故障设备'],
    'home.suCoDuoi': ['{lk} chờ LK · {dung} dừng', '{lk}台待备件 · {dung}台停机'],
    'home.ghiSo': ['Ghi chỉ số hôm nay', '今日抄表'],
    'home.ghiSoCon': ['Còn {n}{han}', '还有{n}个{han}'],
    'home.ghiSoDu': ['Đã ghi đủ hôm nay', '今日已全部抄完'],
    'home.chuaCoCT': ['Chưa khai báo công tơ', '尚未添加电表'],
    'home.han': [' · hạn {gio}', ' · 截止{gio}'],
    'home.thaoTacNhanh': ['Thao tác nhanh', '快捷操作'],
    'home.ghiChiSo': ['Ghi chỉ số', '抄表'],
    'home.traThietBi': ['Tra thiết bị', '查设备'],
    'home.traLinhKien': ['Tra linh kiện', '查备件'],
    'home.dienNuoc': ['Điện nước', '水电'],
    'home.quetQR': ['Quét QR', '扫码'],
    'home.phoBien': ['Chức năng phổ biến', '常用功能'],
    'home.thietBi': ['Thiết bị', '设备'],
    'home.suaChua': ['Sửa chữa', '维修'],
    'home.baoTri': ['Bảo trì', '保养'],
    'home.khoLK': ['Kho linh kiện', '备件库'],
    'home.themLK': ['Thêm LK mới', '新增备件'],
    'home.baoCao': ['Báo cáo', '报表'],
    'home.tatCa': ['Tất cả', '全部'],
    'home.canXuLy': ['Cần xử lý', '待处理'],
    'home.khongViec': ['Không có việc cần xử lý', '暂无待处理事项'],
    'home.viecCanXuLy': ['Việc cần xử lý', '待处理事项'],
    // Nhãn và nội dung các việc
    'xl.loiGui': ['Lỗi gửi', '发送失败'],
    'xl.loiGuiND': ['{n} thao tác chưa gửi được', '{n}项操作发送失败'],
    'xl.loiGuiPhu': ['Mở để xem lý do, thử lại hoặc xóa', '查看原因、重试或删除'],
    'xl.ghiSo': ['Ghi số', '抄表'],
    'xl.quaHan': ['Quá hạn', '逾期'],
    'xl.ghiSoND': ['{n} công tơ chưa ghi chỉ số hôm nay', '今日有{n}个电表未抄'],
    'xl.suCo': ['Sự cố', '故障'],
    'xl.choLK': ['Chờ LK', '待备件'],
    'xl.batThuong': ['Bất thường', '异常'],
    'xl.batThuongND': ['{ma} · số bất thường ngày {ngay} chờ duyệt', '{ma} · {ngayZh}读数异常待审核'],
    'xl.duyet': ['Duyệt', '审核'],
    'xl.duyetLKND': ['{n} linh kiện mới chờ duyệt', '{n}个新增备件待审核'],
    'xl.duyetGanND': ['{n} đề xuất gắn linh kiện chờ duyệt', '{n}项备件关联建议待审核'],
    'xl.kho': ['Kho', '库存'],
    'xl.duoiMinND': ['{n} linh kiện dưới tồn tối thiểu', '{n}个备件低于安全库存'],
    'xl.dich': ['Bản dịch', '翻译'],
    'xl.dichND': ['{n} tên tiếng Trung do máy dịch, chờ người duyệt', '{n}个机器翻译的中文名待人工审核']
  });
  ME.nhan('Tất cả chức năng', {
    'tc.tieuDe': ['Tất cả chức năng', '全部功能'],
    'tc.tim': ['Tìm chức năng', '搜索功能'],
    'tc.thietBi': ['Thiết bị', '设备'],
    'tc.suaChua': ['Sửa chữa', '维修'],
    'tc.baoTri': ['Bảo trì', '保养'],
    'tc.khoLK': ['Kho LK', '备件'],
    'tc.khoLKDai': ['Kho linh kiện', '备件库'],
    'tc.dienNuoc': ['Điện nước', '水电'],
    'tc.dienNuocDai': ['Điện nước', '水电能源'],
    'tc.baoCao': ['Báo cáo', '报表'],
    'tc.quanTri': ['Quản trị', '管理'],
    'tc.quanTriDai': ['Quản trị', '系统管理'],
    'tc.chiCap12': ['Chỉ cấp 1–2 thấy', '仅1–2级可见'],
    'tc.danhSach': ['Danh sách', '设备清单'],
    'tc.themTB': ['Thêm thiết bị', '新增设备'],
    'tc.inTem': ['In tem QR', '打印二维码'],
    'tc.mauTS': ['Mẫu thông số', '参数模板'],
    'tc.baoHong': ['Báo hỏng', '报修'],
    'tc.phieuSC': ['Phiếu sửa chữa', '维修单'],
    'tc.nghiemThu': ['Nghiệm thu', '验收'],
    'tc.lichSuSC': ['Lịch sử', '维修履历'],
    'tc.denHan': ['Đến hạn', '到期保养'],
    'tc.checklist': ['Checklist', '点检表'],
    'tc.keHoach': ['Kế hoạch', '保养计划'],
    'tc.traCuu': ['Tra cứu', '备件查询'],
    'tc.themMoi': ['Thêm mới', '新增备件'],
    'tc.capNhatFile': ['Cập nhật file', '文件导入'],
    'tc.duoiMin': ['Dưới tối thiểu', '低于安全库存'],
    'tc.lichSuNhap': ['Lịch sử cập nhật', '导入记录'],
    'tc.tongQuan': ['Tổng quan', '总览'],
    'tc.ghiChiSo': ['Ghi chỉ số', '抄表'],
    'tc.congTo': ['Công tơ', '电表清单'],
    'tc.bangGia': ['Bảng giá', '水电价格'],
    'tc.dungMay': ['Dừng máy', '停机分析'],
    'tc.tuanThu': ['Tuân thủ bảo trì', '保养达成率'],
    'tc.nguoiDung': ['Người dùng', '用户'],
    'tc.phanQuyen': ['Phân quyền', '权限'],
    'tc.danhMuc': ['Danh mục', '基础资料'],
    'tc.tuDien': ['Từ điển song ngữ', '双语词典'],
    'tc.ghepCot': ['Ghép cột file kho', '字段映射'],
    'tc.nhatKy': ['Nhật ký', '系统日志'],
    'tc.cauHinh': ['Cấu hình', '系统配置'],
    'tc.qrKetNoi': ['Mã QR kết nối', '连接二维码'],
    'tc.khongThay': ['Không có chức năng khớp', '没有匹配的功能']
  });
  ME.nhan('Quét QR', {
    'quet.khongThay': ['Không tìm thấy mã «{ma}»', '未找到编号「{ma}」'],
    'quet.khongThayND': ['Mã này chưa có trong thiết bị, công tơ hay kho linh kiện trên máy. Đồng bộ rồi thử lại, hoặc kiểm tra tem.',
      '本机的设备、电表和备件中都没有此编号。请同步后重试，或检查标签。'],
    'quet.chonMa': ['Mã này khớp nhiều mục', '此编号匹配多项'],
    'quet.maKetNoi': ['Đây là mã kết nối máy chủ, máy này đã kết nối rồi.', '这是服务器连接码，本机已连接。']
  });
  ME.nhan('Tài khoản', {
    'tk.tieuDe': ['Tài khoản', '我的'],
    'tk.dongBo': ['Đồng bộ và hàng chờ', '同步与待发送'],
    'tk.lanCuoi': ['Lần đồng bộ cuối', '上次同步'],
    'tk.chuaCo': ['Chưa đồng bộ', '尚未同步'],
    'tk.dongBoNgay': ['Đồng bộ ngay', '立即同步'],
    'tk.hangTrong': ['Không có thao tác chờ gửi', '没有待发送的操作'],
    'tk.hangCua': ['Của {ten} – gửi khi người này đăng nhập lại', '属于{ten}，该用户重新登录后发送'],
    'tk.dangGuiMuc': ['Đang gửi', '发送中'],
    'tk.choGuiMuc': ['Chờ gửi', '待发送'],
    'tk.loiMuc': ['Lỗi', '失败'],
    'tk.canXacNhanMuc': ['Cần xác nhận', '需确认'],
    'tk.xoaMuc': ['Xóa thao tác này? Dữ liệu chưa gửi sẽ mất.', '删除此操作？未发送的数据将丢失。'],
    'tk.guiLaiTatCa': ['Gửi lại ngay', '立即重发'],
    'tk.baoMat': ['Bảo mật', '安全'],
    'tk.doiPin': ['Đổi PIN', '修改PIN码'],
    'tk.khoaNgay': ['Khóa app ngay', '立即锁定'],
    'tk.khoaNgayPhu': ['Mở lại bằng PIN, được cả khi mất mạng', '用PIN码解锁，断网也可以'],
    'tk.dangXuatKhac': ['Đăng xuất các máy khác', '退出其他设备'],
    'tk.dangXuatKhacPhu': ['Dùng khi mất điện thoại hoặc cho người khác mượn máy', '手机丢失或借给他人时使用'],
    'tk.dangXuatKhacHoi': ['Mọi máy khác đang đăng nhập bằng tài khoản này sẽ phải nhập lại mã NV + PIN.', '所有用本账户登录的其他设备都需要重新输入员工编号和PIN码。'],
    'tk.daDangXuatKhac': ['Đã đăng xuất các máy khác.', '已退出其他设备。'],
    'tk.dangXuat': ['Đăng xuất khỏi máy này', '退出本机登录'],
    'tk.dangXuatPhu': ['Xóa dữ liệu của bạn trên máy này', '清除本机上的您的数据'],
    'tk.dangXuatHoi': ['Đăng xuất và xóa dữ liệu trên máy này? Lần sau phải nhập mã NV + PIN và cần có mạng.', '退出并清除本机数据？下次需要输入员工编号和PIN码并联网。'],
    'tk.conHang': ['Còn {n} thao tác chưa gửi. Đăng xuất bây giờ sẽ mất các thao tác này.', '还有{n}项操作未发送，现在退出将丢失这些操作。'],
    'tk.vanDangXuat': ['Vẫn đăng xuất', '仍然退出'],
    'tk.quanTri': ['Quản trị', '管理'],
    'tk.mayChu': ['Máy chủ', '服务器'],
    'tk.kiemTra': ['Kiểm tra kết nối', '检查连接'],
    'tk.ketNoiTot': ['Máy chủ {ban} trả lời sau {ms} ms.', '服务器{ban}响应时间{ms}毫秒。'],
    'tk.doiMayChuHoi': ['Đổi sang máy chủ khác cần đăng xuất khỏi máy này. Tiếp tục?', '更换服务器需要先退出本机登录。继续吗？'],
    'tk.veApp': ['Về app', '关于应用'],
    'tk.phienBan': ['Phiên bản app', '应用版本'],
    'tk.kiemBanMoi': ['Kiểm tra bản mới', '检查更新'],
    'tk.banMoiNhat': ['Đang dùng bản mới nhất.', '已是最新版本。'],
    'tk.taiLaiToanBo': ['Tải lại toàn bộ dữ liệu', '重新下载全部数据'],
    'tk.taiLaiPhu': ['Dùng khi số liệu trên máy có vẻ sai', '本机数据看起来不对时使用'],
    'tk.dangTaiLai': ['Đang tải lại toàn bộ dữ liệu…', '正在重新下载全部数据…'],
    'tk.daTaiLai': ['Đã tải lại dữ liệu.', '数据已重新下载。'],
    'tk.boPhan': ['Bộ phận', '部门'],
    'tk.dungLuong': ['Dữ liệu trên máy', '本机数据'],
    'tk.dungLuongND': ['{tb} thiết bị · {lk} linh kiện · {cs} lần ghi số', '{tb}台设备 · {lk}个备件 · {cs}条抄表记录']
  });
  ME.nhan('Tìm kiếm chung', {
    'tim.tieuDe': ['Tìm kiếm chung', '综合搜索'],
    'tim.goiY': ['Mã, tên Việt hoặc tên Trung', '编号或名称'],
    'tim.thietBi': ['Thiết bị', '设备'],
    'tim.linhKien': ['Linh kiện', '备件'],
    'tim.congTo': ['Công tơ, đồng hồ nước', '电表与水表'],
    'tim.batDau': ['Gõ mã hoặc tên để tìm máy, linh kiện, công tơ. Có dấu, không dấu hay chữ Trung đều được.', '输入编号或名称搜索设备、备件、电表。越南语带不带声调或中文均可。'],
    'tim.khongThay': ['Không thấy kết quả cho «{tu}»', '未找到「{tu}」的结果'],
    'tim.conNua': ['Còn {n} kết quả nữa – gõ thêm chữ để lọc', '还有{n}个结果，请输入更多文字筛选'],
    'tim.trongDuLieu': ['Tìm «{tu}» trong máy, linh kiện, công tơ', '在设备、备件、电表中搜索「{tu}」'],
    'tim.ganDung': ['Tìm gần đúng', '模糊搜索']
  });
  ME.nhan('Mã QR kết nối', {
    'qr.tieuDe': ['Mã QR kết nối', '连接二维码'],
    'qr.giaiThich': ['Người mới cài app: mở app → Quét mã QR kết nối → đưa camera vào mã này. Mở bằng camera iPhone thì vào trang app có sẵn link.',
      '新安装应用的人：打开应用 → 扫描连接二维码 → 对准此码。用iPhone相机扫描会打开已带链接的应用页面。'],
    'qr.chiNguoiTrongNhaMay': ['Chỉ cho người trong nhà máy quét. Không chụp gửi lên nhóm công khai.', '仅供厂内人员扫描，请勿拍照发到公开群组。'],
    'qr.saoChepLink': ['Sao chép link app', '复制应用链接']
  });

  // ───────── Tiện ích chung của màn ─────────
  function avt(hoTen, lop) { return h('span', { class: lop || 'avt', 'aria-hidden': 'true' }, ME.chuCaiDau(hoTen)); }
  function chucVu(hs) {
    const dmCap = ME.dmTen('CAP', String(hs.Cap || ''));
    return { vi: hs.ChucVuVi || dmCap.vi, zh: hs.ChucVuZh || dmCap.zh || hs.ChucVuVi || dmCap.vi };
  }
  function boPhan(ma) { const t = ME.dmTen('BO_PHAN', ma); return t; }
  ME.ui.avt = avt;
  ME.chucVu = chucVu;

  // ═════════ Kết nối máy chủ ═════════
  /** Lấy link /exec từ chữ dán vào hoặc mã QR (kể cả link app có #/ket-noi?may=…). */
  ME.chuanLinkMayChu = function (s) {
    s = String(s || '').trim();
    const m = s.match(/[?&#]may=([^&\s]+)/);
    if (m) { try { s = decodeURIComponent(m[1]); } catch (e) { s = m[1]; } }
    const u = s.match(/https?:\/\/[^\s"'<>]+/);
    if (u) s = u[0];
    return s.replace(/[?#].*$/, '').replace(/\/+$/, '');
  };
  ME.linkHopLe = function (s) {
    return /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[A-Za-z0-9_-]{20,}\/exec$/.test(s) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/([^?#]*\/)?exec$/.test(s);
  };
  /** Rút gọn link để hiện: script.google.com/…/AKfy…sgGm/exec */
  ME.linkNgan = function (s) {
    const m = String(s || '').match(/^https?:\/\/([^/]+)\/.*\/s\/([^/]+)\/exec$/);
    if (!m) return String(s || '');
    return m[1] + '/…/' + m[2].slice(0, 4) + '…' + m[2].slice(-5) + '/exec';
  };
  /** Đang mở trong Safari của iPhone/iPad (chưa mở từ biểu tượng trên màn hình chính). */
  ME.trongSafariIOS = function () {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const daCai = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    return ios && !daCai;
  };
  ME.ui.goiYCaiApp = function () {
    if (!ME.trongSafariIOS()) return null;
    return h('div', { class: 'hop-cb', style: 'text-align:left' }, ME.ic('dienThoai', 20, 2),
      h('div', { class: 'chu' }, h('b', { class: 'vi', style: 'display:block' }, ME.tv('kn.caiApp')), h('span', { class: 'zh', style: 'display:block' }, ME.tz('kn.caiApp')),
        h('span', { class: 'vi', style: 'display:block;margin-top:6px;font-weight:500' }, ME.tv('kn.caiAppND')), h('span', { class: 'zh', style: 'display:block;font-weight:400' }, ME.tz('kn.caiAppND'))));
  };
  function huongDanCaiDat(kt) {
    const vi = kt && kt.huongDan ? kt.huongDan : '';
    const zh = /Cài đặt/.test(vi) ? '请打开表格 → ME菜单 → 安装/更新结构。' : '尚无设置PIN的1级管理员：ME菜单 → 创建第一位管理员。';
    return { vi: vi, zh: zh };
  }
  /** Kiểm tra link: GET /exec phải trả app ME đã cài đặt xong. */
  ME.kiemTraMayChu = function (url) {
    return ME.api.kiemTra(url).then(function (r) {
      if (!r || r.app !== 'ME') throw ME.loiMoi('KHONG_PHAI_ME');
      if (!r.ok || (r.kiemTra && r.kiemTra.dat === false)) {
        const hd = huongDanCaiDat(r.kiemTra);
        const e = new Error('chua cai dat');
        e.vi = ME.tv('kn.chuaCaiDat', { ly: hd.vi });
        e.zh = ME.tz('kn.chuaCaiDat', { ly: hd.zh });
        throw e;
      }
      return r;
    });
  };

  ME.tuyen('/ket-noi', {
    ve: function (ts, q) {
      const o = ME.ui.oNhap({ type: 'url', inputmode: 'url', placeholder: 'https://script.google.com/macros/s/…/exec', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', id: 'link-may-chu' });
      o.value = q.may ? ME.chuanLinkMayChu(q.may) : (ME.tt.mayChu || '');
      const tb = h('div', { class: 'dn-tb', role: 'status', 'aria-live': 'polite' });
      const bao = function (x, loi) { ME.xoaCon(tb); tb.className = 'dn-tb' + (loi ? ' loi' : ''); if (x) ME.them(tb, ME.L2(x.vi, x.zh)); };
      const nutKetNoi = h('button', { type: 'button', class: 'nut-chinh', onClick: ketNoi }, ME.L('kn.ketNoi'));
      function ketNoi() {
        const url = ME.chuanLinkMayChu(o.value);
        o.value = url;
        if (!ME.linkHopLe(url)) { bao(ME.t('loi.LINK_SAI'), true); return; }
        nutKetNoi.disabled = true;
        bao(ME.t('kn.dangKiem'));
        ME.kiemTraMayChu(url).then(function (r) {
          ME.tt.mayChu = url;
          return ME.luuMeta('mayChu').then(function () {
            ME.thongBao('kn.daKetNoi', null, { ban: String(r.mayChu || '') });
            ME.di('/dang-nhap', true);
          });
        }).catch(function (e) {
          nutKetNoi.disabled = false;
          const x = ME.loiChu(e);
          if (e && e.ma === 'HTML_404') bao({ vi: x.vi + ' ' + ME.tv('kn.lanDau404'), zh: x.zh + ME.tz('kn.lanDau404') }, true);
          else bao(x, true);
        });
      }
      const dan = navigator.clipboard && navigator.clipboard.readText ? h('button', {
        type: 'button', class: 'nut-canh', onClick: function () {
          navigator.clipboard.readText().then(function (s) { o.value = ME.chuanLinkMayChu(s); }, function () { o.focus(); });
        }
      }, ME.ic('saoChep', 18, 2), h('span', null, ME.L('kn.dan'))) : null;
      return h('div', { class: 'trang nen-xanh' },
        h('div', { class: 'dn-dau' }, ME.logo(64, false), h('div', null, h('h1', null, 'ME'), ME.L('dn.ten'))),
        h('main', { class: 'dn-than', style: 'align-items:stretch' },
          ME.ui.goiYCaiApp(),
          h('div', { class: 'dn-loi-moi' }, ME.L('kn.tieuDe')),
          h('div', { class: 'ghi-chu', style: 'text-align:center' }, ME.L('kn.giaiThich')),
          ME.ui.truong('kn.link', h('div', { class: 'hang-o' }, o, dan), false, 'link-may-chu'),
          h('button', {
            type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
              ME.quet({ tieuDe: 'kn.quet' }).then(function (chu) { if (chu) { o.value = ME.chuanLinkMayChu(chu); ketNoi(); } });
            }
          }, ME.ic('qr', 20, 2), h('span', null, ME.L('kn.quet'))),
          nutKetNoi, tb,
          h('div', { class: 'dn-chan', style: 'justify-content:center' }, ME.ic('khoa', 18, 1.8), h('div', null, ME.L('kn.riengTu')))));
    }
  });

  // ═════════ Đăng nhập PIN (bản vẽ 1) ═════════
  ME.tuyen('/dang-nhap', {
    ve: function (ts, q) {
      const p = ME.tt.phien;
      const st = { pin: '', dang: false, doiNguoi: !p || !!q.moi, ma: '' };
      const vo = h('div', { class: 'trang nen-xanh' });
      let tb;
      let cham;
      let oMa;
      function hienTB(x, loi) {
        ME.xoaCon(tb);
        tb.className = 'dn-tb' + (loi ? ' loi' : '');
        if (x) ME.them(tb, ME.L2(x.vi, x.zh));
      }
      function tbMacDinh() {
        const kd = ME.phien.dangKhoa();
        if (kd && !st.doiNguoi) return hienTB(ME.t('dn.dangKhoaDen', { gio: ME.gio(ME.isoVN(kd)) }), true);
        if (p && p.hetHieuLuc && !st.doiNguoi) return hienTB(ME.t(p.lyDo === 'TAI_KHOAN_NGUNG' ? 'dn.taiKhoanNgung' : 'dn.hetPhien'), true);
        hienTB(ME.t('dn.saiKhoa', { n: Number(ME.cauHinh('SO_LAN_SAI_PIN_TOI_DA')) || 5, p: Number(ME.cauHinh('PHUT_KHOA_PIN')) || 15 }));
      }
      function veCham(lac) {
        const moi = ME.ui.chamPin(st.pin.length);
        if (lac) moi.classList.add('lac');
        cham.replaceWith(moi);
        cham = moi;
      }
      function xong(kq) {
        st.dang = false;
        if (kq.ok) {
          if (ME.tt.phien && ME.tt.phien.phaiDoiPin) {
            // PIN tạm vừa nhập đúng: giữ trong bộ nhớ (không lưu) để màn Đổi PIN không hỏi lại.
            ME.tt.pinVuaNhap = st.pin;
            ME.di('/doi-pin', true);
          } else ME.vaoApp();
          return;
        }
        st.pin = '';
        veCham(true);
        if (navigator.vibrate) navigator.vibrate(120);
        hienTB(ME.loiChu(kq.loi), true);
      }
      function guiPin() {
        st.dang = true;
        hienTB(ME.t('dn.dangKiem'));
        if (st.doiNguoi) {
          const ma = ME.chuanMaNV(oMa.value);
          if (!ma) { xong({ ok: false, loi: ME.t('dn.thieuMa') }); oMa.focus(); return; }
          ME.phien.dangNhap(ma, st.pin).then(function () { return { ok: true }; }, function (e) { return { ok: false, loi: e }; }).then(xong);
        } else {
          ME.phien.moKhoa(st.pin).then(xong);
        }
      }
      function so(d) {
        if (st.dang || st.pin.length >= 6) return;
        if (!st.doiNguoi && ME.phien.dangKhoa()) { tbMacDinh(); return; }
        st.pin += d;
        veCham(false);
        if (st.pin.length === 6) guiPin();
      }
      function xoa() {
        if (st.dang || !st.pin) return;
        st.pin = st.pin.slice(0, -1);
        veCham(false);
      }
      st.phim = function (e) {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (/^\d$/.test(e.key)) { so(e.key); e.preventDefault(); } else if (e.key === 'Backspace') { xoa(); e.preventDefault(); }
      };
      this._st = st;
      function ve() {
        ME.xoaCon(vo);
        st.pin = '';
        tb = h('div', { class: 'dn-tb', role: 'status', 'aria-live': 'polite' });
        cham = ME.ui.chamPin(0);
        let tren;
        if (st.doiNguoi) {
          oMa = ME.ui.oNhap({ id: 'ma-nv', autocapitalize: 'characters', autocorrect: 'off', spellcheck: 'false', placeholder: ME.t1('dn.maNVGoiY'), enterkeyhint: 'next' });
          oMa.addEventListener('keydown', function (e) { if (e.key === 'Enter') oMa.blur(); });
          tren = h('div', { class: 'dn-ma' }, ME.ui.truong('dn.maNV', oMa, false, 'ma-nv'),
            p ? h('button', {
              type: 'button', class: 'lien-ket-phai nho', style: 'margin-top:8px;text-align:left',
              onClick: function () { st.doiNguoi = false; ve(); }
            }, ME.L('dn.quayLaiNguoiCu', { ten: p.hoSo ? p.hoSo.HoTen : p.maNV })) : null);
        } else {
          const hs = p.hoSo || { HoTen: p.maNV };
          const bp = boPhan(hs.BoPhan);
          tren = h('div', { class: 'dn-nguoi' }, avt(hs.HoTen),
            h('div', { class: 'giua' }, h('div', { class: 'ten' }, hs.HoTen),
              h('span', { class: 'vi phu' }, p.maNV + (bp.vi ? ' · ' + bp.vi : '')), h('span', { class: 'zh' }, p.maNV + (bp.zh ? ' · ' + bp.zh : ''))),
            h('button', { type: 'button', class: 'doi', onClick: function () { st.doiNguoi = true; ve(); setTimeout(function () { if (oMa) oMa.focus(); }, 50); } }, ME.L('dn.doiNguoi')));
        }
        const quen = h('button', {
          type: 'button', class: 'quen', onClick: function () {
            ME.hoi({ tieuDe: 'dn.quenPin', loiNhan: 'dn.quenPinND' });
          }
        }, ME.L('dn.quenPin'));
        ME.them(vo, [
          h('div', { class: 'dn-dau' }, ME.logo(64, false), h('div', null, h('h1', null, 'ME'), ME.L('dn.ten'))),
          h('main', { class: 'dn-than' }, st.doiNguoi ? ME.ui.goiYCaiApp() : null, tren, h('div', { class: 'dn-loi-moi' }, ME.L('dn.nhapPin')), cham, tb,
            ME.ui.banPhim({ onSo: so, onXoa: xoa, trai: quen }),
            h('div', { class: 'dn-chan' }, ME.ic(st.doiNguoi ? 'dongBo' : 'matMang', 18, 1.8), h('div', null, ME.L(st.doiNguoi ? 'dn.canMangLanDau' : 'dn.moKhiMatMang'))),
            st.doiNguoi && !p ? h('a', { href: '#/ket-noi', class: 'lien-ket-phai nho', style: 'text-align:center' }, ME.L('kn.doiMayChu')) : null)
        ]);
        tbMacDinh();
      }
      ve();
      return vo;
    },
    sauVe: function (el, ts, q, laVeLai) {
      if (laVeLai) return;
      const st = this._st;
      this._phim = st.phim;
      document.addEventListener('keydown', this._phim);
    },
    roiDi: function () { if (this._phim) document.removeEventListener('keydown', this._phim); this._phim = null; }
  });

  // ═════════ Đổi PIN ═════════
  ME.tuyen('/doi-pin', {
    ve: function () {
      const p = ME.tt.phien;
      const batBuoc = !!(p && p.phaiDoiPin);
      const st = { buoc: 1, cu: '', moi: '', pin: '', dang: false };
      if (batBuoc && ME.tt.pinVuaNhap) { st.cu = ME.tt.pinVuaNhap; st.buoc = 2; }
      delete ME.tt.pinVuaNhap;
      const tieuBuoc = h('div', { class: 'dn-loi-moi' });
      let cham = ME.ui.chamPin(0);
      const tb = h('div', { class: 'dn-tb', role: 'status', 'aria-live': 'polite' });
      function hienTB(x, loi) { ME.xoaCon(tb); tb.className = 'dn-tb' + (loi ? ' loi' : ''); if (x) ME.them(tb, ME.L2(x.vi, x.zh)); }
      function veBuoc() {
        ME.xoaCon(tieuBuoc);
        ME.them(tieuBuoc, ME.L(st.buoc === 1 ? (batBuoc ? 'pin.buoc1Tam' : 'pin.buoc1') : (st.buoc === 2 ? 'pin.buoc2' : 'pin.buoc3')));
      }
      function veCham(lac) { const m = ME.ui.chamPin(st.pin.length); if (lac) m.classList.add('lac'); cham.replaceWith(m); cham = m; }
      function sai(x, veBuoc2) {
        st.pin = '';
        if (veBuoc2) { st.buoc = 2; st.moi = ''; veBuoc(); }
        veCham(true);
        hienTB(x, true);
      }
      function du() {
        const pin = st.pin;
        if (st.buoc === 1) { st.cu = pin; st.buoc = 2; st.pin = ''; veBuoc(); veCham(); hienTB(ME.t('pin.goiY')); return; }
        if (st.buoc === 2) {
          if (ME.phien.deDoan(pin)) return sai(ME.t('pin.deDoan'));
          if (pin === st.cu) return sai(ME.t('pin.trungCu'));
          st.moi = pin; st.buoc = 3; st.pin = ''; veBuoc(); veCham(); hienTB(null); return;
        }
        if (pin !== st.moi) return sai(ME.t('pin.khongKhop'), true);
        st.dang = true;
        hienTB(ME.t('dn.dangKiem'));
        ME.phien.doiPin(st.cu, st.moi).then(function () {
          ME.thongBao('pin.daDoi');
          if (batBuoc) ME.vaoApp(); else ME.quayLai('/tai-khoan');
        }, function (e) {
          st.dang = false;
          // Sai PIN cũ: làm lại từ đầu.
          st.buoc = 1; st.cu = ''; st.moi = ''; st.pin = '';
          veBuoc(); veCham(true);
          hienTB(ME.loiChu(e), true);
        });
      }
      function so(d) { if (st.dang || st.pin.length >= 6) return; st.pin += d; veCham(); if (st.pin.length === 6) setTimeout(du, 120); }
      function xoa() { if (st.dang || !st.pin) return; st.pin = st.pin.slice(0, -1); veCham(); }
      this._phim = function (e) {
        if (/^\d$/.test(e.key)) { so(e.key); e.preventDefault(); } else if (e.key === 'Backspace') { xoa(); e.preventDefault(); }
      };
      veBuoc();
      if (batBuoc) hienTB(ME.t('pin.batBuoc'));
      const nutLui = batBuoc
        ? h('button', { type: 'button', class: 'quen', onClick: dangXuatHoi }, ME.L('tk.dangXuat'))
        : h('button', { type: 'button', class: 'quen', onClick: function () { ME.quayLai('/tai-khoan'); } }, ME.L('chung.huy'));
      return h('div', { class: 'trang nen-xanh' },
        h('div', { class: 'dn-dau' }, ME.logo(56, false), h('div', null, h('h1', { style: 'font-size:24px' }, ME.tv('pin.tieuDe')), h('span', { class: 'zh' }, ME.tz('pin.tieuDe')))),
        h('main', { class: 'dn-than' }, tieuBuoc, cham, tb, ME.ui.banPhim({ onSo: so, onXoa: xoa, trai: nutLui })));
    },
    sauVe: function (el, ts, q, laVeLai) { if (!laVeLai && this._phim) document.addEventListener('keydown', this._phim); },
    roiDi: function () { if (this._phim) document.removeEventListener('keydown', this._phim); }
  });

  // ═════════ Việc cần xử lý (Trang chủ, chuông, Cần xử lý) ═════════
  /** Danh sách việc cần xử lý theo quyền, xếp theo mức ưu tiên. */
  ME.canXuLy = function () {
    const ds = [];
    const nhan = function (k, loai) { const t = ME.t(k); return { vi: t.vi, zh: t.zh, loai: loai }; };
    const soLoi = ME.hang.soLoi();
    if (soLoi) ds.push({ u: 0, nhan: nhan('xl.loiGui', 'do'), noi: ME.t('xl.loiGuiND', { n: soLoi }), phu: ME.t('xl.loiGuiPhu'), dich: '/tai-khoan' });
    if (ME.co('GHI_CHI_SO')) {
      const td = ME.dn.tienDo();
      if (td.tong && td.chuaGhi.length) {
        const han = td.gioHan ? ' · ' + td.gioHan : '';
        const ma = td.chuaGhi.slice(0, 4).join(' · ') + (td.chuaGhi.length > 4 ? ' …' : '') + han;
        ds.push({ u: td.quaHan ? 0.5 : 1, nhan: nhan(td.quaHan ? 'xl.quaHan' : 'xl.ghiSo', td.quaHan ? 'do' : 'than'), noi: ME.t('xl.ghiSoND', { n: td.chuaGhi.length }), phu: { vi: ma, zh: '' }, dich: '/dn/ghi' });
      }
    }
    const tb = ME.du.ds('ThietBi');
    // Dòng phụ một dòng: mã · khu vực "Việt · 中文".
    const maKV = function (x) { const kv = ME.dmTen('KHU_VUC', x.KhuVuc); return [x.MaTB, kv.vi, kv.zh].filter(Boolean).join(' · '); };
    tb.filter(function (x) { return x.TrangThai === 'SU_CO'; }).forEach(function (x) {
      ds.push({ u: 2, nhan: nhan('xl.suCo', 'do'), noi: { vi: x.TenVi, zh: x.TenZh }, phu: { vi: maKV(x) }, dich: '/tb/' + enc(x.MaTB) });
    });
    tb.filter(function (x) { return x.TrangThai === 'CHO_LK'; }).forEach(function (x) {
      ds.push({ u: 3, nhan: nhan('xl.choLK', 'cam'), noi: { vi: x.TenVi, zh: x.TenZh }, phu: { vi: maKV(x) }, dich: '/tb/' + enc(x.MaTB) + '/lk' });
    });
    if (ME.co('DUYET_CHI_SO')) {
      const tu = ME.congNgay(ME.homNay(), -14);
      const theoCT = {};
      ME.du.ds('ChiSo').forEach(function (r) {
        if (r.DaXoa || r.Co !== 'BAT_THUONG' || r.NguoiDuyet || String(r.NgayTinh) < tu) return;
        (theoCT[r.MaCT] = theoCT[r.MaCT] || []).push(r);
      });
      Object.keys(theoCT).sort().forEach(function (ma) {
        const r = theoCT[ma].sort(function (a, b) { return a.NgayTinh < b.NgayTinh ? 1 : -1; })[0];
        const ct = ME.du.lay('CongTo', ma) || {};
        ds.push({ u: 2.5, nhan: nhan('xl.batThuong', 'tim'), noi: ME.t('xl.batThuongND', { ma: ma, ngay: ME.ngayVi(r.NgayTinh, true), ngayZh: ME.ngayZh(r.NgayTinh, true) }),
          phu: { vi: [ct.TenVi, ct.TenZh, theoCT[ma].length > 1 ? '×' + theoCT[ma].length : ''].filter(Boolean).join(' · ') }, dich: '/dn/ct/' + enc(ma) });
      });
    }
    const kho = ME.du.ds('KhoLinhKien');
    if (ME.co('DUYET_LINH_KIEN')) {
      const n = kho.filter(function (x) { return x.TrangThaiDuyet === 'CHO_DUYET'; }).length;
      if (n) ds.push({ u: 4, nhan: nhan('xl.duyet', 'tim'), noi: ME.t('xl.duyetLKND', { n: n }), dich: '/kho?loc=cho-duyet' });
    }
    if (ME.co('GAN_LINH_KIEN')) {
      const cho = ME.du.ds('LinhKienTB').filter(function (x) { return x.TrangThaiDuyet === 'CHO_DUYET'; });
      if (cho.length) {
        const may = Array.from(new Set(cho.map(function (x) { return x.MaTB; })));
        ds.push({ u: 4, nhan: nhan('xl.duyet', 'tim'), noi: ME.t('xl.duyetGanND', { n: cho.length }), phu: { vi: may.slice(0, 4).join(' · ') }, dich: '/tb/' + enc(may[0]) + '/lk' });
      }
    }
    const duoiMin = ME.khoDuoiMin ? ME.khoDuoiMin().length : 0;
    if (duoiMin) ds.push({ u: 5, nhan: nhan('xl.kho', 'cam'), noi: ME.t('xl.duoiMinND', { n: duoiMin }), dich: '/kho?loc=duoi-min' });
    if (ME.co('SUA_LINH_KIEN')) {
      const n = kho.filter(function (x) { return x.DichMay === true; }).length;
      if (n) ds.push({ u: 6, nhan: nhan('xl.dich', 'xam'), noi: ME.t('xl.dichND', { n: n }), dich: '/kho?loc=dich-may' });
    }
    return ds.sort(function (a, b) { return a.u - b.u; });
  };
  function dongViec(v) {
    return h('a', { href: '#' + v.dich },
      ME.ui.nhanTT(v.nhan.vi, v.nhan.zh, v.nhan.loai, 'r60'),
      h('div', { class: 'giua' }, h('span', { class: 'vi' }, v.noi.vi), v.noi.zh ? h('span', { class: 'zh' }, v.noi.zh) : null,
        v.phu && v.phu.vi ? h('div', { class: 'phu' }, v.phu.vi) : null),
      ME.ic('phai', 20, 2, { class: 'mui-ten' }));
  }

  // ═════════ Trang chủ (bản vẽ 2) ═════════
  function soGhiTheoNgay(n) {
    const dem = {};
    const them = function (ngay, ma) { (dem[ngay] = dem[ngay] || {})[ma] = 1; };
    ME.du.ds('ChiSo').forEach(function (r) { if (!r.DaXoa) them(ME.ngayCua(r.GhiLuc), r.MaCT); });
    ME.hang.ds().forEach(function (m) { if (m.action === 'luuChiSo') them(ME.ngayCua(m.data.GhiLuc || ME.isoVN(m.tao)), m.data.MaCT); });
    const ra = [];
    for (let i = n - 1; i >= 0; i--) ra.push(Object.keys(dem[ME.congNgay(ME.homNay(), -i)] || {}).length);
    return ra;
  }
  function dongDongBo() {
    const dang = ME.dangDongBo();
    const n = ME.hang.soCho();
    const db = ME.tt.dongBo;
    let x;
    let loi = false;
    if (dang) x = ME.t('home.dangDongBo');
    else if (!ME.coMang()) x = ME.t('home.matMang', { n: n });
    else if (db.loi) { x = ME.t('home.loiDongBo'); loi = true; } else if (db.luc) {
      const iso = ME.isoVN(db.luc);
      const gio = (iso.slice(0, 10) === ME.homNay() ? '' : ME.ngayVi(iso, true) + ' ') + iso.slice(11, 16);
      x = ME.t('home.daDongBo', { gio: gio, n: n });
    } else x = ME.t('home.chuaDongBo');
    return h('div', { class: 'home-dongbo' },
      h('div', { class: 'giua', role: 'status', 'aria-live': 'polite' }, ME.L2(x.vi, x.zh)),
      h('button', {
        type: 'button', class: dang ? 'quay' : '', 'aria-label': ME.t1('home.dongBoNgay'),
        onClick: function () {
          if (loi && db.loi && db.loi.vi && db.loi.ma !== 'MAT_MANG') ME.thongBao({ vi: db.loi.vi, zh: db.loi.zh || db.loi.vi }, 'loi');
          ME.dongBo();
        }
      }, ME.ic('dongBo', 20, 2)));
  }
  function oCN(o) {
    // o: { nhan, ic, dich, dem, sapCo, do }
    const noiDung = [ME.ic(o.ic, 28, 1.7, { class: 'icon' + (o.do ? ' do' : '') }), h('div', { class: 'chu' }, ME.L(o.nhan)),
      o.dem ? h('span', { class: 'dem-vien' }, o.dem > 99 ? '99+' : String(o.dem)) : null];
    if (o.sapCo) return h('button', { type: 'button', class: 'o-chuc-nang sap-co', onClick: function () { ME.sapCo(o.sapCo); } }, noiDung);
    return h('a', { class: 'o-chuc-nang', href: '#' + o.dich }, noiDung);
  }
  ME.tuyen('/', {
    ve: function () {
      const hs = ME.hoSo() || { HoTen: '', Cap: '' };
      const cv = chucVu(hs);
      const tb = ME.du.ds('ThietBi');
      const suCo = tb.filter(function (x) { return x.TrangThai === 'SU_CO'; }).length;
      const choLK = tb.filter(function (x) { return x.TrangThai === 'CHO_LK'; }).length;
      const dung = tb.filter(function (x) { return x.TrangThai === 'DUNG'; }).length;
      const td = ME.dn.tienDo();
      const viec = ME.canXuLy();
      const coGhi = ME.co('GHI_CHI_SO');
      const duoiMin = ME.khoDuoiMin ? ME.khoDuoiMin().length : 0;
      let duoiGhi;
      if (!td.tong) duoiGhi = ME.t('home.chuaCoCT');
      else if (!td.chuaGhi.length) duoiGhi = ME.t('home.ghiSoDu');
      else {
        const han = td.gioHan ? ME.t('home.han', { gio: td.gioHan }) : { vi: '', zh: '' };
        duoiGhi = ME.t('home.ghiSoCon', { n: td.chuaGhi.length, han: [han.vi, han.zh] });
      }
      const nhanh = [
        coGhi ? { nhan: 'home.ghiChiSo', ic: 'set', dich: '/dn/ghi', dem: td.chuaGhi.length } : { nhan: 'home.quetQR', ic: 'qr', dich: '/quet' },
        { nhan: 'home.traThietBi', ic: 'tim', dich: '/tb' },
        { nhan: 'home.traLinhKien', ic: 'hop', dich: '/kho' },
        { nhan: 'home.dienNuoc', ic: 'cot2', dich: '/dn' }
      ];
      const phoBien = [
        { nhan: 'home.thietBi', ic: 'banhRang', dich: '/tb' },
        { nhan: 'home.suaChua', ic: 'coLe', sapCo: 2 },
        { nhan: 'home.baoTri', ic: 'lichCheck', sapCo: 2 },
        { nhan: 'home.khoLK', ic: 'hop', dich: '/kho', dem: duoiMin },
        ME.co('THEM_LINH_KIEN') ? { nhan: 'home.themLK', ic: 'vuongCong', dich: '/kho/them' } : { nhan: 'home.quetQR', ic: 'qr', dich: '/quet' },
        { nhan: 'home.dienNuoc', ic: 'set', dich: '/dn', dem: coGhi ? td.chuaGhi.length : 0 },
        { nhan: 'home.baoCao', ic: 'cot', sapCo: 3 },
        { nhan: 'home.tatCa', ic: 'luoi', dich: '/tat-ca' }
      ];
      return h('div', { class: 'trang' },
        h('header', { class: 'dau-home' },
          h('div', { class: 'home-nguoi' },
            h('a', { class: 'avt', href: '#/tai-khoan', 'aria-label': ME.t1('nav.taiKhoan') }, ME.chuCaiDau(hs.HoTen)),
            h('div', { class: 'giua' }, h('div', { class: 'ten' }, hs.HoTen),
              h('span', { class: 'vi phu' }, ME.tv('home.chucVuCap', { cv: cv.vi, cap: String(hs.Cap) })),
              h('span', { class: 'zh', lang: 'zh-Hans' }, ME.tz('home.chucVuCap', { cv: cv.zh, cap: String(hs.Cap) }))),
            h('a', { class: 'home-chuong', href: '#/tim', 'aria-label': ME.t1('tim.tieuDe') }, ME.ic('tim', 22, 1.8)),
            h('a', { class: 'home-chuong', href: '#/can-xu-ly', 'aria-label': ME.t1('home.canXuLy') + (viec.length ? ' (' + viec.length + ')' : '') },
              ME.ic('chuong', 24, 1.8), viec.length ? h('span', { class: 'dem-do' }, viec.length > 99 ? '99+' : String(viec.length)) : null)),
          dongDongBo(),
          h('div', { class: 'home-the' },
            h('a', { class: 'the-so dam', href: '#/tb?tt=SU_CO' },
              h('div', { class: 'tieu' }, ME.L('home.suCo')),
              h('div', { class: 'giua' }, h('div', { class: 'so-lon' }, String(suCo)), ME.ic('canhBao', 30, 1.8, { style: 'color:#FFC72C' })),
              h('div', { class: 'duoi' }, h('div', null, ME.L('home.suCoDuoi', { lk: choLK, dung: dung })), ME.ic('phai', 18, 2))),
            h('a', { class: 'the-so vang', href: coGhi ? '#/dn/ghi' : '#/dn' },
              h('div', { class: 'tieu' }, ME.L('home.ghiSo')),
              h('div', { class: 'giua' }, h('div', { class: 'so-lon' }, String(td.daGhi), h('small', null, ' / ' + td.tong)), ME.bd.cotNho(soGhiTheoNgay(5), '#E0A800')),
              h('div', { class: 'duoi' }, h('div', null, ME.L2(duoiGhi.vi, duoiGhi.zh)), ME.ic('phai', 18, 2))))),
        h('main', { class: 'home-main' },
          h('nav', { class: 'nhanh', 'aria-label': ME.t1('home.thaoTacNhanh') }, nhanh.map(oCN)),
          h('section', { class: 'the', style: 'padding:16px 10px 8px' },
            h('div', { style: 'padding:0 6px 4px' }, h('div', { class: 'tieu-the t16' }, h('h2', { class: 'vi' }, ME.tv('home.phoBien')), h('span', { class: 'zh' }, ME.tz('home.phoBien')))),
            h('div', { class: 'luoi-chuc-nang' }, phoBien.map(oCN))),
          h('section', { class: 'the can-xu-ly', style: 'padding:16px 16px 4px' },
            h('div', { class: 'the-dau', style: 'margin-bottom:4px' },
              h('div', { class: 'tieu tieu-the t16' }, h('h2', { class: 'vi' }, ME.tv('home.canXuLy')), h('span', { class: 'zh' }, ME.tz('home.canXuLy'))),
              viec.length > 4 ? ME.ui.lienKetPhai('chung.xemTatCa', '/can-xu-ly') : null),
            viec.length ? viec.slice(0, 4).map(dongViec)
              : h('div', { class: 'trong-rong', style: 'padding:16px 8px 20px' }, ME.ic('checkTron', 28, 1.6), ME.L('home.khongViec')))),
        ME.ui.thanhDuoi('/'));
    },
    capNhat: function () { ME.veLai(); }
  });

  ME.tuyen('/can-xu-ly', {
    ve: function () {
      const viec = ME.canXuLy();
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'home.viecCanXuLy', quayLai: '/' }),
        h('main', { class: 'noi-dung' }, h('section', { class: 'the can-xu-ly', style: 'padding:4px 16px' },
          viec.length ? viec.map(dongViec) : h('div', { class: 'trong-rong' }, ME.ic('checkTron', 28, 1.6), ME.L('home.khongViec')))));
    },
    capNhat: function () { ME.veLai(); }
  });

  // ═════════ Tất cả chức năng (bản vẽ 3) ═════════
  function nhomTatCa() {
    const co = ME.co;
    return [
      { id: 'tb', chip: 'tc.thietBi', ten: 'tc.thietBi', ds: [
        { nhan: 'tc.danhSach', ic: 'danhSach', dich: '/tb' },
        co('SUA_THIET_BI') && { nhan: 'tc.themTB', ic: 'vuongCong', dich: '/tb/them' },
        { nhan: 'tc.inTem', ic: 'mayIn', dich: '/tb/in-tem' },
        co('QUAN_TRI') && { nhan: 'tc.mauTS', ic: 'thanhTruot', dich: '/qt/mau-ts' }] },
      { id: 'sc', chip: 'tc.suaChua', ten: 'tc.suaChua', ds: [
        { nhan: 'tc.baoHong', ic: 'canhBao', sapCo: 2, do: true }, { nhan: 'tc.phieuSC', ic: 'tep', sapCo: 2 },
        { nhan: 'tc.nghiemThu', ic: 'duyet', sapCo: 2 }, { nhan: 'tc.lichSuSC', ic: 'lichSu', sapCo: 2 }] },
      { id: 'bt', chip: 'tc.baoTri', ten: 'tc.baoTri', ds: [
        { nhan: 'tc.denHan', ic: 'lichCheck', sapCo: 2 }, { nhan: 'tc.checklist', ic: 'viec', sapCo: 2 }, { nhan: 'tc.keHoach', ic: 'lich', sapCo: 2 }] },
      { id: 'kho', chip: 'tc.khoLK', ten: 'tc.khoLKDai', ds: [
        { nhan: 'tc.traCuu', ic: 'tim', dich: '/kho' },
        co('THEM_LINH_KIEN') && { nhan: 'tc.themMoi', ic: 'vuongCong', dich: '/kho/them' },
        co('NHAP_KHO') && { nhan: 'tc.capNhatFile', ic: 'tepLen', dich: '/kho/nhap' },
        { nhan: 'tc.duoiMin', ic: 'canhBaoTron', dich: '/kho?loc=duoi-min' },
        { nhan: 'tc.lichSuNhap', ic: 'lichSu', dich: '/kho/lich-su' }] },
      { id: 'dn', chip: 'tc.dienNuoc', ten: 'tc.dienNuocDai', ds: [
        { nhan: 'tc.tongQuan', ic: 'cot2', dich: '/dn' },
        co('GHI_CHI_SO') && { nhan: 'tc.ghiChiSo', ic: 'set', dich: '/dn/ghi' },
        { nhan: 'tc.congTo', ic: 'danhSach', dich: '/dn/cong-to' },
        co('QUAN_LY_DIEN_NUOC') && { nhan: 'tc.bangGia', ic: 'nhan', dich: '/dn/bang-gia' }] },
      { id: 'bc', chip: 'tc.baoCao', ten: 'tc.baoCao', ds: [
        { nhan: 'tc.tongQuan', ic: 'cot', sapCo: 3 }, { nhan: 'tc.dungMay', ic: 'hoatDong', sapCo: 3 }, { nhan: 'tc.tuanThu', ic: 'checkTron', sapCo: 3 }] },
      (co('QUAN_TRI') || co('NGUOI_DUNG') || co('NHAP_KHO')) && { id: 'qt', chip: 'tc.quanTri', ten: 'tc.quanTriDai', khoa: ME.cap() <= 2, ds: [
        co('NGUOI_DUNG') && { nhan: 'tc.nguoiDung', ic: 'nhom', dich: '/qt/nguoi-dung' },
        co('NGUOI_DUNG') && { nhan: 'tc.phanQuyen', ic: 'khoa', dich: '/qt/phan-quyen' },
        co('QUAN_TRI') && { nhan: 'tc.danhMuc', ic: 'danhSach', dich: '/qt/danh-muc' },
        co('QUAN_TRI') && { nhan: 'tc.tuDien', ic: 'dich', dich: '/qt/tu-dien' },
        co('NHAP_KHO') && { nhan: 'tc.ghepCot', ic: 'gop', dich: '/qt/ghep-cot' },
        co('QUAN_TRI') && { nhan: 'tc.nhatKy', ic: 'lichSu', dich: '/qt/nhat-ky' },
        co('QUAN_TRI') && { nhan: 'tc.cauHinh', ic: 'banhRang', dich: '/qt/cau-hinh' },
        co('QUAN_TRI') && { nhan: 'tc.qrKetNoi', ic: 'qr', dich: '/qt/ket-noi' }] }
    ].filter(Boolean).map(function (n) { n.ds = n.ds.filter(Boolean); return n; }).filter(function (n) { return n.ds.length; });
  }
  ME.tuyen('/tat-ca', {
    ve: function () {
      const nhom = nhomTatCa();
      const khoiNhom = {};
      const trong = h('div', { class: 'trong-rong', hidden: true }, ME.L('tc.khongThay'));
      const timDL = h('a', { class: 'the tim-du-lieu', hidden: true, href: '#/tim' });
      function loc(tu) {
        const q = ME.boDau(tu);
        ME.xoaCon(timDL);
        timDL.hidden = !tu.trim();
        if (tu.trim()) {
          timDL.href = '#/tim?q=' + enc(tu.trim());
          ME.them(timDL, [ME.ic('tim', 20, 2), h('span', { class: 'giua' }, ME.L('tim.trongDuLieu', { tu: tu.trim() })), ME.ic('phai', 18, 2)]);
        }
        let con = 0;
        nhom.forEach(function (n) {
          let hien = 0;
          n.ds.forEach(function (x) {
            const t = ME.t(x.nhan);
            const khop = !q || ME.boDau(t.vi + ' ' + t.zh + ' ' + ME.tv(n.ten)).indexOf(q) >= 0 || (t.zh + ME.tz(n.ten)).indexOf(tu.trim()) >= 0;
            x.el.hidden = !khop;
            if (khop) hien++;
          });
          khoiNhom[n.id].hidden = !hien;
          con += hien;
        });
        trong.hidden = con > 0;
      }
      const tc = ME.t('tc.tieuDe');
      return h('div', { class: 'trang' },
        h('header', { class: 'dau-trang' },
          h('div', null, h('h1', null, tc.vi), h('span', { class: 'zh', lang: 'zh-Hans' }, tc.zh)),
          h('button', { type: 'button', class: 'nut-icon', 'aria-label': ME.t1('chung.dong'), onClick: function () { ME.quayLai('/'); } }, ME.ic('dong', 26, 2))),
        h('div', { class: 'tc-loc' }, ME.ui.oTim({ goiY: 'tc.tim', xam: true, onTim: loc, tre: 80 }),
          h('div', { class: 'hang-chip' }, nhom.map(function (n) {
            return ME.ui.chip(n.chip, { onClick: function () { khoiNhom[n.id].scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
          }))),
        h('main', { class: 'noi-dung' }, timDL, nhom.map(function (n) {
          const t = ME.t(n.ten);
          khoiNhom[n.id] = h('section', { class: 'tc-nhom', id: 'nhom-' + n.id },
            h('div', { class: 'dau-tc' }, h('div', null, h('h2', null, t.vi), h('span', { class: 'zh' }, t.zh)),
              n.khoa ? h('span', { class: 'nhan-khoa' }, ME.ic('khoa', 14, 2), h('span', null, ME.L('tc.chiCap12'))) : null),
            h('div', { class: 'luoi-chuc-nang tat-ca' }, n.ds.map(function (x) { x.el = oCN(x); return x.el; })));
          return khoiNhom[n.id];
        }), trong));
    }
  });

  // ═════════ Quét QR ═════════
  /** Tìm mục theo nội dung mã QR: công tơ (MaQR, MaCT), thiết bị, linh kiện, link app, mã kết nối. */
  ME.timTheoMa = function (chu) {
    const s = String(chu || '').trim();
    const ra = { ds: [], ma: s };
    const m = s.match(/#(\/(tb|kho|dn)\/[^\s]+)$/);
    if (m) { ra.ds.push({ duong: m[1], vi: m[1], zh: '' }); return ra; }
    if (/\/exec\b|[?&#]may=/.test(s)) { ra.ketNoi = s; return ra; }
    const ma = ME.chuanMa(s);
    ME.du.ds('CongTo').forEach(function (c) {
      if (ME.chuanMa(c.MaQR) === ma || ME.chuanMa(c.MaCT) === ma) {
        const dung = !c.TrangThai || c.TrangThai === 'DANG_DUNG';
        ra.ds.push({ duong: (ME.co('GHI_CHI_SO') && dung ? '/dn/ghi/' : '/dn/ct/') + enc(c.MaCT), vi: c.MaCT + ' · ' + (c.TenVi || ''), zh: c.TenZh || '', ic: 'set' });
      }
    });
    const tb = ME.du.lay('ThietBi', ma);
    if (tb) ra.ds.push({ duong: '/tb/' + enc(tb.MaTB), vi: tb.MaTB + ' · ' + tb.TenVi, zh: tb.TenZh || '', ic: 'banhRang' });
    const lk = ME.du.lay('KhoLinhKien', ME.chuanMaLK(s)) ||
      ME.du.ds('KhoLinhKien').filter(function (x) { return String(x.MaLK).toUpperCase() === s.toUpperCase(); })[0];
    if (lk) ra.ds.push({ duong: '/kho/' + enc(lk.MaLK), vi: lk.MaLK + ' · ' + lk.TenVi, zh: lk.TenZh || '', ic: 'hop' });
    return ra;
  };
  /** Mở mục theo mã quét được. thay: thay màn hiện tại (màn Quét QR) thay vì thêm màn. */
  ME.moTheoMa = function (chu, thay) {
    const kq = ME.timTheoMa(chu);
    if (kq.ketNoi) { ME.thongBao('quet.maKetNoi'); if (thay) ME.quayLai('/'); return Promise.resolve(); }
    if (kq.ds.length === 1) { ME.di(kq.ds[0].duong, thay); return Promise.resolve(); }
    if (kq.ds.length > 1) {
      return ME.chonTu({ tieuDe: 'quet.chonMa', ds: kq.ds.map(function (x) { return { gt: x.duong, vi: x.vi, zh: x.zh, ic: x.ic ? h('span', { class: 'bieu-tuong b40' }, ME.ic(x.ic, 20, 1.8)) : null }; }) })
        .then(function (gt) { if (gt) ME.di(gt, thay); else if (thay) ME.quayLai('/'); });
    }
    return ME.hoi({
      tieuDe: { vi: ME.tv('quet.khongThay', { ma: kq.ma }), zh: ME.tz('quet.khongThay', { ma: kq.ma }) }, loiNhan: 'quet.khongThayND',
      nut: [{ nhan: 'tim.ganDung', gt: 'tim', chinh: true }, { nhan: 'chung.dong', gt: null }]
    }).then(function (gt) {
      if (gt === 'tim') ME.di('/tim?q=' + enc(kq.ma), thay);
      else if (thay) ME.quayLai('/');
    });
  };
  ME.tuyen('/quet', {
    ve: function () { return h('div', { class: 'trang', style: 'background:#000000' }); },
    sauVe: function (el, ts, q, laVeLai) {
      if (laVeLai) return;
      ME.quet({}).then(function (chu) {
        if (location.hash.indexOf('#/quet') !== 0) return;
        if (chu === null) { ME.quayLai('/'); return; }
        ME.moTheoMa(chu, true);
      });
    }
  });

  // ═════════ Tìm kiếm chung (tài liệu khung: đợt 1, chưa có bản vẽ) ═════════
  const CJK = /[\u3400-\u9fff]/;
  /** Điểm khớp: 0 mã trùng, 1 mã bắt đầu bằng, 2 mã chứa, 3 tên chứa, 4 thông tin khác chứa; -1 không khớp. */
  function diemKhop(q, ma, ten, khac) {
    const m = ME.boDau(ma);
    if (m === q) return 0;
    if (m.indexOf(q) === 0) return 1;
    if (m.indexOf(q) >= 0) return 2;
    if (ten.indexOf(q) >= 0) return 3;
    return khac && khac.indexOf(q) >= 0 ? 4 : -1;
  }
  /** Tìm trong dữ liệu trên máy (kể cả thay đổi chờ gửi). Trả { tb, lk, ct } đã xếp, mỗi phần tử { r, d }. */
  ME.timChung = function (tu) {
    const q = ME.boDau(String(tu || '').trim());
    const ra = { tb: [], lk: [], ct: [] };
    if (!q || (q.length < 2 && !CJK.test(q))) return ra;
    const xep = function (a, b, ma) { return a.d - b.d || String(a.r[ma]).localeCompare(String(b.r[ma]), 'vi', { numeric: true }); };
    (ME.dsTB ? ME.dsTB() : ME.du.ds('ThietBi')).forEach(function (r) {
      const kv = ME.dmTen('KHU_VUC', r.KhuVuc);
      const d = diemKhop(q, r.MaTB, ME.boDau([r.TenVi, r.TenZh].join(' ')), ME.boDau([r.Model, r.HangSX, r.SoSeri, r.ViTri, kv.vi, kv.zh].join(' ')));
      if (d >= 0) ra.tb.push({ r: r, d: d });
    });
    (ME.dsLK ? ME.dsLK().map(function (x) { return x.r; }) : ME.du.ds('KhoLinhKien')).forEach(function (r) {
      if (r.DaXoa) return;
      const d = diemKhop(q, r.MaLK, ME.boDau([r.TenVi, r.TenZh].join(' ')), ME.boDau([r.QuyCach, r.MaNSX, r.ViTriKho].join(' ')));
      if (d >= 0) ra.lk.push({ r: r, d: d });
    });
    ME.du.ds('CongTo').forEach(function (r) {
      const d = Math.min.apply(null, [diemKhop(q, r.MaCT, ME.boDau([r.TenVi, r.TenZh].join(' ')), ME.boDau(r.ViTri || '')), r.MaQR ? diemKhop(q, r.MaQR, '') : -1].map(function (x) { return x < 0 ? 99 : x; }));
      if (d < 99) ra.ct.push({ r: r, d: d });
    });
    ra.tb.sort(function (a, b) { return xep(a, b, 'MaTB'); });
    ra.lk.sort(function (a, b) { return xep(a, b, 'MaLK'); });
    ra.ct.sort(function (a, b) { return xep(a, b, 'MaCT'); });
    return ra;
  };
  const TIM_TOI_DA = 30;
  let timTu = '';
  function dongTimTB(r) {
    const kv = ME.dmTen('KHU_VUC', r.KhuVuc);
    return h('a', { class: 'dong-qt', href: '#/tb/' + enc(r.MaTB) },
      h('span', { class: 'bieu-tuong b40' }, ME.ic(ME.icTB ? ME.icTB(r.LoaiTB) : 'banhRang', 20, 1.8)),
      h('div', { class: 'giua' }, h('span', { class: 'vi' }, r.MaTB + ' · ' + (r.TenVi || '')), r.TenZh ? h('span', { class: 'zh' }, r.TenZh) : null,
        kv.vi ? h('div', { class: 'phu' }, [kv.vi, kv.zh].filter(Boolean).join(' · ')) : null),
      ME.nhanTB ? ME.nhanTB(r.TrangThai) : null);
  }
  function dongTimLK(r) {
    const tt = ME.ttTon ? ME.ttTon(r) : null;
    const ton = r.TonKho === '' || r.TonKho === undefined || r.TonKho === null ? '' : ME.soVi(r.TonKho) + (r.DVT ? ' ' + r.DVT : '');
    return h('a', { class: 'dong-qt', href: '#/kho/' + enc(r.MaLK) },
      h('span', { class: 'bieu-tuong b40' }, ME.ic(ME.icLK ? ME.icLK(r.NhomLK) : 'hop', 20, 1.8)),
      h('div', { class: 'giua' }, h('span', { class: 'vi' }, r.MaLK + ' · ' + (r.TenVi || '')), r.TenZh ? h('span', { class: 'zh' }, r.TenZh) : null,
        h('div', { class: 'phu' }, [r.QuyCach, ton, r.ViTriKho].filter(Boolean).join(' · '))),
      tt ? ME.ui.nhanTTK(tt.nhan, tt.mau) : null);
  }
  function dongTimCT(r) {
    const loai = ME.dmTen('LOAI_CONG_TO', r.Loai);
    return h('a', { class: 'dong-qt', href: '#/dn/ct/' + enc(r.MaCT) },
      h('span', { class: 'bieu-tuong b40' }, ME.ic(r.Loai === 'NUOC' ? 'giot' : 'set', 20, 1.8)),
      h('div', { class: 'giua' }, h('span', { class: 'vi' }, r.MaCT + ' · ' + (r.TenVi || '')), r.TenZh ? h('span', { class: 'zh' }, r.TenZh) : null,
        loai.vi ? h('div', { class: 'phu' }, [loai.vi, loai.zh].filter(Boolean).join(' · ')) : null));
  }
  ME.tuyen('/tim', {
    ve: function (ts, q) {
      if (q.q !== undefined) timTu = q.q;
      const vung = h('div', { style: 'display:flex;flex-direction:column;gap:12px' });
      function veKQ() {
        ME.xoaCon(vung);
        const tu = timTu.trim();
        if (!tu) { vung.appendChild(h('div', { class: 'ghi-chu', style: 'padding:4px' }, ME.L('tim.batDau'))); return; }
        const kq = ME.timChung(tu);
        if (!kq.tb.length && !kq.lk.length && !kq.ct.length) { vung.appendChild(ME.ui.trong('tim.khongThay', { tu: tu }, 'tim')); return; }
        [['tim.thietBi', kq.tb, dongTimTB], ['tim.linhKien', kq.lk, dongTimLK], ['tim.congTo', kq.ct, dongTimCT]].forEach(function (n) {
          if (!n[1].length) return;
          const the = h('section', { class: 'the', style: 'padding:14px 14px 4px' },
            ME.ui.theTieuDe(n[0], null, h('span', { class: 'ghi-chu' }, ME.soVi(n[1].length))));
          n[1].slice(0, TIM_TOI_DA).forEach(function (x) { the.appendChild(n[2](x.r)); });
          if (n[1].length > TIM_TOI_DA) the.appendChild(h('div', { class: 'ghi-chu', style: 'padding:10px 0;border-top:1px solid #EAECF0' }, ME.L('tim.conNua', { n: n[1].length - TIM_TOI_DA })));
          vung.appendChild(the);
        });
      }
      this._ve = veKQ;
      veKQ();
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'tim.tieuDe', quayLai: '/' }),
        h('main', { class: 'noi-dung' }, ME.ui.oTim({ goiY: 'tim.goiY', giaTri: timTu, onTim: function (tu) { timTu = tu; veKQ(); }, tre: 150 }), vung));
    },
    sauVe: function (el, ts, q, laVeLai) {
      if (laVeLai || timTu) return;
      const i = el.querySelector('.o-tim input');
      if (i) setTimeout(function () { i.focus(); }, 60);
    },
    capNhat: function (el, loai) { if (loai === 'du-lieu' && this._ve) this._ve(); }
  });

  // ═════════ Tài khoản ═════════
  function trangThaiMuc(m) {
    if (m.trangThai === 'dangGui') return ME.ui.nhanTTK('tk.dangGuiMuc', 'than');
    if (m.trangThai === 'loi') return ME.ui.nhanTTK('tk.loiMuc', 'do');
    if (m.trangThai === 'canXacNhan') return ME.ui.nhanTTK('tk.canXacNhanMuc', 'tim');
    return ME.ui.nhanTTK('tk.choGuiMuc', 'cam');
  }
  function dongHang(m) {
    const cuaMinh = ME.tt.phien && m.maNV === ME.tt.phien.maNV;
    const nut = [];
    if (cuaMinh && m.trangThai === 'loi') nut.push(h('button', { type: 'button', class: 'nut-vien', onClick: function () { ME.hang.thuLai(m.id); } }, h('span', null, ME.L('chung.thuLai'))));
    if (cuaMinh && m.trangThai === 'canXacNhan') nut.push(h('button', { type: 'button', class: 'nut-vien', onClick: function () { ME.hang.xacNhan(m.id); } }, h('span', null, ME.L('chung.vanLuu'))));
    if (m.trangThai !== 'dangGui') {
      nut.push(h('button', {
        type: 'button', class: 'nut-vien do', onClick: function () {
          ME.hoi({ loiNhan: 'tk.xoaMuc', nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true })
            .then(function (ok) { if (ok) ME.hang.xoa(m.id); });
        }
      }, h('span', null, ME.L('chung.xoa'))));
    }
    return h('div', { class: 'dong-hang' },
      h('span', { class: 'bieu-tuong b34' }, ME.ic(m.action === 'luuChiSo' ? 'set' : (m.action.indexOf('LinhKien') >= 0 ? 'hop' : 'banhRang'), 18, 1.8)),
      h('div', { class: 'giua' }, ME.L2(m.tomTat.vi, m.tomTat.zh),
        h('div', { class: 'phu' }, ME.ngayGioVi(ME.isoVN(m.tao)) + (m.lanGui ? ' · ' + m.lanGui + '×' : '') + (cuaMinh ? '' : ' · ' + ME.tv('tk.hangCua', { ten: ME.tenNguoi(m.maNV) }))),
        m.loi ? h('div', { class: 'loi-hang' }, ME.L2(m.loi.vi, m.loi.zh)) : null,
        nut.length ? h('div', { class: 'nut-hang' }, nut) : null),
      trangThaiMuc(m));
  }
  function dongCaiDat(ic, khoa, dich, phu, nguy) {
    const nd = [h('span', { class: 'ico' + (nguy ? ' do' : '') }, ME.ic(ic, 20, 1.8)),
      h('div', { class: 'giua' }, ME.L(khoa),
        phu ? h('div', { class: 'phu' }, typeof phu === 'string' ? phu : phu.vi) : null,
        phu && phu.zh ? h('div', { class: 'phu zh' }, phu.zh) : null), ME.ic('phai', 18, 2, { class: 'mui-ten' })];
    if (typeof dich === 'function') return h('button', { type: 'button', class: 'dong-cai-dat', onClick: dich }, nd);
    return h('a', { class: 'dong-cai-dat', href: '#' + dich }, nd);
  }
  function dangXuatHoi() {
    const n = ME.hang.ds().filter(function (m) { return ME.tt.phien && m.maNV === ME.tt.phien.maNV; }).length;
    const hoi = n
      ? ME.hoi({ tieuDe: 'tk.dangXuat', loiNhan: ME.t('tk.conHang', { n: n }), nut: [{ nhan: 'tk.vanDangXuat', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }] })
      : ME.hoi({ tieuDe: 'tk.dangXuat', loiNhan: 'tk.dangXuatHoi', nut: [{ nhan: 'tk.dangXuat', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }] });
    return hoi.then(function (ok) {
      if (!ok) return false;
      return ME.phien.dangXuat().then(function () { ME.di('/dang-nhap', true); return true; });
    });
  }
  ME.dangXuatHoi = dangXuatHoi;
  ME.tuyen('/tai-khoan', {
    ve: function () {
      const p = ME.tt.phien;
      const hs = ME.hoSo() || {};
      const cv = chucVu(hs);
      const bp = boPhan(hs.BoPhan);
      const db = ME.tt.dongBo;
      const hang = ME.hang.ds();
      const nutDB = h('button', { type: 'button', class: 'nut-vien', onClick: function () { ME.dongBo(); } },
        ME.ic('dongBo', 18, 2), h('span', null, ME.L('tk.dongBoNgay')));
      if (ME.dangDongBo()) nutDB.disabled = true;
      const lanCuoi = db.luc ? ME.ngayGioVi(ME.isoVN(db.luc)) : ME.tv('tk.chuaCo');
      const quanTri = [];
      if (ME.co('NGUOI_DUNG')) quanTri.push(dongCaiDat('nhom', 'tc.nguoiDung', '/qt/nguoi-dung'));
      if (ME.co('QUAN_TRI')) {
        quanTri.push(dongCaiDat('danhSach', 'tc.danhMuc', '/qt/danh-muc'));
        quanTri.push(dongCaiDat('dich', 'tc.tuDien', '/qt/tu-dien'));
        quanTri.push(dongCaiDat('banhRang', 'tc.cauHinh', '/qt/cau-hinh'));
        quanTri.push(dongCaiDat('lichSu', 'tc.nhatKy', '/qt/nhat-ky'));
        quanTri.push(dongCaiDat('qr', 'tc.qrKetNoi', '/qt/ket-noi'));
      }
      const kq = h('div', { class: 'ghi-chu', role: 'status', 'aria-live': 'polite' });
      return h('div', { class: 'trang' },
        h('header', { class: 'dau-lon' },
          h('div', { class: 'tk-dau' }, h('span', { class: 'avt', 'aria-hidden': 'true' }, ME.chuCaiDau(hs.HoTen)),
            h('div', { style: 'min-width:0' }, h('div', { class: 'ten' }, hs.HoTen || ''),
              h('span', { class: 'vi phu' }, (p ? p.maNV : '') + ' · ' + ME.tv('home.chucVuCap', { cv: cv.vi, cap: String(hs.Cap) })),
              h('span', { class: 'zh' }, ME.tz('home.chucVuCap', { cv: cv.zh, cap: String(hs.Cap) }) + (bp.zh ? ' · ' + bp.zh : ''))))),
        h('main', { class: 'noi-dung' },
          h('section', { class: 'the' },
            ME.ui.theTieuDe('tk.dongBo', null, nutDB),
            h('dl', { class: 'ds-tt nho', style: 'margin-top:8px' },
              ME.ui.dongTT('tk.lanCuoi', lanCuoi, ''),
              ME.ui.dongTT('tk.dungLuong', ME.tv('tk.dungLuongND', { tb: ME.du.soDong('ThietBi'), lk: ME.du.soDong('KhoLinhKien'), cs: ME.du.soDong('ChiSo') }),
                ME.tz('tk.dungLuongND', { tb: ME.du.soDong('ThietBi'), lk: ME.du.soDong('KhoLinhKien'), cs: ME.du.soDong('ChiSo') }))),
            db.loi && db.loi.vi ? h('div', { class: 'hop-cb', style: 'margin-top:8px' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L2(db.loi.vi, db.loi.zh))) : null,
            hang.length ? h('div', { style: 'margin-top:4px' }, hang.slice().reverse().map(dongHang))
              : h('div', { class: 'ghi-chu', style: 'padding-top:10px;border-top:1px solid #EAECF0;margin-top:4px' }, ME.L('tk.hangTrong'))),
          h('section', { class: 'the', style: 'padding:6px 14px' },
            dongCaiDat('khoa', 'tk.doiPin', '/doi-pin'),
            dongCaiDat('khoa', 'tk.khoaNgay', function () { ME.phien.khoa(); ME.di('/dang-nhap'); }, ME.t('tk.khoaNgayPhu')),
            dongCaiDat('dienThoai', 'tk.dangXuatKhac', function () {
              ME.hoi({ tieuDe: 'tk.dangXuatKhac', loiNhan: 'tk.dangXuatKhacHoi', nut: [{ nhan: 'chung.xacNhan', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }] }).then(function (ok) {
                if (!ok) return;
                ME.goiMang('dangXuatMayKhac', {}).then(function (d) {
                  ME.tt.phien.token = d.token;
                  ME.tt.phien.hetHan = d.hetHan;
                  ME.luuMeta('phien');
                  ME.thongBao('tk.daDangXuatKhac');
                }).catch(ME.boQua);
              });
            }, ME.t('tk.dangXuatKhacPhu')),
            dongCaiDat('dangXuat', 'tk.dangXuat', dangXuatHoi, ME.t('tk.dangXuatPhu'), true)),
          quanTri.length ? h('section', { class: 'the', style: 'padding:6px 14px' }, h('div', { class: 'nhom-tieu', style: 'margin:8px 0 4px' }, ME.L('tk.quanTri')), quanTri) : null,
          h('section', { class: 'the', style: 'padding:6px 14px' },
            h('div', { class: 'nhom-tieu', style: 'margin:8px 0 4px' }, ME.L('tk.mayChu')),
            dongCaiDat('mayChu', 'tk.kiemTra', function () {
              ME.xoaCon(kq);
              const bd = Date.now();
              const dong = ME.ui.choXuLy('kn.dangKiem');
              ME.kiemTraMayChu(ME.tt.mayChu).then(function (r) {
                dong();
                ME.them(kq, ME.L('tk.ketNoiTot', { ban: String(r.mayChu || ''), ms: Date.now() - bd }));
              }, function (e) { dong(); ME.baoLoi(e); });
            }, ME.linkNgan(ME.tt.mayChu)),
            kq,
            dongCaiDat('lienKet', 'kn.doiMayChu', function () {
              ME.hoi({ loiNhan: 'tk.doiMayChuHoi', nut: [{ nhan: 'chung.tiepTuc', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }] }).then(function (ok) {
                if (!ok) return;
                dangXuatHoi().then(function (da) {
                  if (!da) return;
                  ME.tt.mayChu = '';
                  ME.kho.xoa('meta', 'mayChu').then(function () { ME.di('/ket-noi', true); });
                });
              });
            })),
          h('section', { class: 'the', style: 'padding:6px 14px' },
            h('div', { class: 'nhom-tieu', style: 'margin:8px 0 4px' }, ME.L('tk.veApp')),
            dongCaiDat('dienThoai', 'tk.kiemBanMoi', function () {
              ME.kiemBanMoi().then(function (co) { if (!co) ME.thongBao('tk.banMoiNhat'); }, function () { ME.thongBao('loi.MAT_MANG', 'loi'); });
            }, { vi: ME.tv('tk.phienBan') + ' ' + ME.PHIEN_BAN, zh: ME.tz('tk.phienBan') + ' ' + ME.PHIEN_BAN }),
            dongCaiDat('taiXuong', 'tk.taiLaiToanBo', function () {
              if (!ME.coMang()) { ME.hoi({ loiNhan: 'chung.canMang' }); return; }
              const dong = ME.ui.choXuLy('tk.dangTaiLai');
              ME.dongBo({ toanBo: true }).then(function (ok) {
                dong();
                if (ok) ME.thongBao('tk.daTaiLai');
                else ME.baoLoi(ME.tt.dongBo.loi);
              });
            }, ME.t('tk.taiLaiPhu')))),
        ME.ui.thanhDuoi('/tai-khoan'));
    },
    capNhat: function () { ME.veLai(); }
  });

  // ═════════ Mã QR kết nối (quản trị) ═════════
  ME.linkApp = function () { return location.origin + location.pathname.replace(/index\.html$/, ''); };
  ME.tuyen('/qt/ket-noi', {
    ve: function () {
      if (!ME.co('QUAN_TRI')) return ME.ui.manKhongQuyen('qr.tieuDe');
      const link = ME.linkApp() + '#/ket-noi?may=' + enc(ME.tt.mayChu);
      const oQR = h('div', { class: 'ma-qr' }, ME.ui.dangTai());
      ME.napQR().then(function () { ME.xoaCon(oQR).appendChild(ME.taoQR(link, 240)); }, function (e) { ME.xoaCon(oQR).appendChild(ME.ui.loiTruong(e)); });
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'qr.tieuDe', quayLai: '/tai-khoan' }),
        h('main', { class: 'noi-dung' },
          h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:12px;align-items:stretch' },
            oQR,
            h('div', { class: 'ghi-chu', style: 'text-align:center' }, ME.linkNgan(ME.tt.mayChu)),
            h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('qr.giaiThich'))),
            h('div', { class: 'hop-cb' }, ME.ic('khoa', 20, 2), h('div', { class: 'chu' }, ME.L('qr.chiNguoiTrongNhaMay'))),
            h('button', { type: 'button', class: 'nut-vien', onClick: function () { ME.saoChep(link); } }, ME.ic('saoChep', 18, 2), h('span', null, ME.L('qr.saoChepLink'))))));
    }
  });
})();

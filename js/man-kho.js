/* ME – Quản lý Cơ điện · 机电管理系统
   man-kho.js — Kho linh kiện (bản vẽ 7), Cập nhật kho từ file tuần (bản vẽ 8), Thêm linh kiện mới (bản vẽ 9),
   chi tiết / sửa linh kiện, duyệt, gộp mã tạm, duyệt bản dịch máy, lịch sử cập nhật file.
   File kho đọc ngay trên máy: .xlsx (JSZip, nạp khi cần) hoặc .csv; chỉ gửi lên máy chủ các cột đã ghép. */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;
  const enc = encodeURIComponent;
  const TIEN_TO_TAM = 'TẠM-';

  ME.nhan('Kho linh kiện', {
    'kho.tieuDe': ['Kho linh kiện', '备件库'],
    'kho.tim': ['Tìm mã, tên, quy cách', '搜索备件'],
    'kho.capNhatFile': ['Cập nhật từ file', '文件导入'],
    'kho.themLK': ['Thêm linh kiện mới', '新增备件'],
    'kho.theoFile': ['Tồn kho theo file ngày {ngay}', '库存数据截至 {ngay}'],
    'kho.chuaNhap': ['Chưa nhập file kho tuần nào', '尚未导入每周库存文件'],
    'kho.soMa': ['{n} mã · cập nhật {luc}', '共{n}个料号 · {luc}更新'],
    'kho.soMaChuaNhap': ['{n} mã trong kho trên máy', '本机共{n}个料号'],
    'kho.capNhatTuan': ['Cập nhật file tuần này', '导入本周库存文件'],
    'kho.duoiMin': ['Dưới tối thiểu', '低于安全库存'],
    'kho.thuCong': ['Thêm thủ công', '手动新增'],
    'kho.khongCon': ['Không còn trong file', '文件中已无'],
    'kho.choDuyet': ['Chờ duyệt', '待审核'],
    'kho.dichMay': ['Dịch máy', '机器翻译'],
    'kho.ton': ['Tồn ({dv})', '库存（{dv}）'],
    'kho.het': ['Hết hàng', '缺货'],
    'kho.duoiMinN': ['Dưới tối thiểu ({n})', '低于安全库存（{n}）'],
    'kho.du': ['Đủ', '充足'],
    'kho.chuaCoTon': ['Chưa có số tồn', '暂无库存数据'],
    'kho.thuCongTam': ['Thêm thủ công · chờ mã chính thức', '手动新增 · 待正式料号'],
    'kho.khongConTu': ['Không còn trong file · lần cuối có {ngay}', '文件中已无 · 最后出现 {ngay}'],
    'kho.tenMayDich': ['Tên Trung do máy dịch', '中文名为机器翻译'],
    'kho.trong': ['Không có linh kiện khớp', '没有匹配的备件'],
    'kho.trongKho': ['Kho trên máy chưa có linh kiện. Cập nhật file kho tuần hoặc thêm thủ công.', '本机库存为空。请导入每周库存文件或手动新增。'],
    'kho.choGuiMoi': ['{n} linh kiện mới đang chờ gửi', '{n}个新增备件待发送'],
    'kho.dung': ['Đúng', '正确'],
    'kho.dungHet': ['Duyệt các tên đang hiện', '审核当前显示的名称'],
    'kho.dichGoiY': ['Sửa tên Trung nếu chưa đúng rồi bấm Đúng. Tên đã duyệt không còn nhãn "dịch máy".', '如中文名不准确请修改后点“正确”。审核后不再标记为机器翻译。'],
    'kho.daDuyetDich': ['Đã duyệt bản dịch', '翻译已审核'],
    'kho.daDuyetN': ['Đã duyệt {n} tên', '已审核{n}个名称'],
    // Chi tiết
    'lk.chiTiet': ['Chi tiết linh kiện', '备件详情'],
    'lk.sua': ['Sửa linh kiện', '编辑备件'],
    'lk.ma': ['Mã linh kiện', '料号'],
    'lk.tenVi': ['Tên tiếng Việt', '越南语名称'],
    'lk.tenZh': ['Tên tiếng Trung', '中文名称'],
    'lk.quyCach': ['Quy cách', '规格'],
    'lk.dvt': ['Đơn vị tính', '单位'],
    'lk.nhom': ['Nhóm linh kiện', '备件类别'],
    'lk.maNSX': ['Mã của nhà sản xuất', '原厂料号'],
    'lk.viTri': ['Vị trí kho', '库位'],
    'lk.tonMin': ['Tồn tối thiểu', '安全库存'],
    'lk.donGia': ['Đơn giá', '单价'],
    'lk.nguon': ['Nguồn', '来源'],
    'lk.ngayFile': ['Ngày file', '文件日期'],
    'lk.dungChoMay': ['Dùng cho máy', '适用设备'],
    'lk.chuaGanMay': ['Chưa gắn với máy nào', '尚未关联设备'],
    'lk.anh': ['Ảnh linh kiện', '备件照片'],
    'lk.duyet': ['Duyệt linh kiện', '审核备件'],
    'lk.daDuyet': ['Đã duyệt linh kiện', '备件已审核'],
    'lk.duyetDich': ['Duyệt bản dịch', '审核翻译'],
    'lk.suaTenZh': ['Sửa tên tiếng Trung', '修改中文名称'],
    'lk.gop': ['Gộp vào mã chính thức', '合并到正式料号'],
    'lk.gopChon': ['Chọn mã chính thức', '选择正式料号'],
    'lk.gopHoi': ['Gộp {tam} vào {chinh}? Liên kết với máy chuyển sang {chinh}, mã tạm bị xóa.', '将{tam}合并到{chinh}？设备关联将转到{chinh}，临时编号将被删除。'],
    'lk.daGop': ['Đã gộp {tam} vào {chinh}', '已将{tam}合并到{chinh}'],
    'lk.ganMay': ['Gắn vào máy', '关联设备'],
    'lk.ganChonMay': ['Chọn máy', '选择设备'],
    'lk.khongThay': ['Không tìm thấy linh kiện {ma} trên máy. Đồng bộ rồi thử lại.', '本机上未找到备件{ma}，请同步后重试。'],
    'lk.lap': ['Lắp {n}', '用量{n}'],
    'lk.choGuiChiTiet': ['Linh kiện này đang chờ gửi lên máy chủ.', '此备件正在等待发送到服务器。'],
    // Thêm, sửa
    'lk.themGiaiThich': ['Linh kiện thêm tay không bị xóa khi cập nhật file tuần. Khi file có cùng mã, hệ thống tự gộp về một dòng.',
      '手动新增的备件不会因每周导入而被删除；文件中出现相同料号时自动合并。'],
    'lk.maGoiY': ['Để trống: hệ thống tạo mã tạm {ma}', '留空：系统生成临时编号 {ma}'],
    'lk.quyCachGoiY': ['VD: Ø35, mặt SiC/SiC', '例：Ø35, SiC/SiC'],
    'lk.maNSXGoiY': ['Mã in trên hộp', '包装上的料号'],
    'lk.viTriGoiY': ['VD: B2-04', '例：B2-04'],
    'lk.themMay': ['Thêm máy', '添加设备'],
    'lk.boMay': ['Bỏ máy này', '移除'],
    'lk.luu': ['Lưu linh kiện', '保存备件'],
    'lk.choDuyetGhi': ['Kỹ thuật viên lưu → chờ quản lý duyệt', '技术员提交后需主管审核'],
    'lk.daThem': ['Đã thêm linh kiện {ma}', '已新增备件{ma}'],
    'lk.daSua': ['Đã lưu linh kiện {ma}', '已保存备件{ma}'],
    'lk.cotFile': ['Tên Việt, quy cách, đơn vị, vị trí lấy từ file kho tuần: sửa trong file rồi cập nhật lại.', '越南语名称、规格、单位、库位来自每周库存文件：请在文件中修改后重新导入。'],
    'lk.maTamCam': ['Mã bắt đầu bằng TẠM- do hệ thống cấp, không tự đặt được.', 'TẠM-开头的编号由系统生成，不能手动设置。'],
    // Lịch sử nhập
    'ls.tieuDe': ['Lịch sử cập nhật', '导入记录'],
    'ls.trong': ['Chưa có lần cập nhật file kho nào', '暂无导入记录'],
    'ls.moi': ['Mới {n}', '新增{n}'],
    'ls.doi': ['Đổi {n}', '变动{n}'],
    'ls.khongDoi': ['Giữ {n}', '无变化{n}'],
    'ls.vang': ['Vắng {n}', '已无{n}'],
    'ls.loi': ['Lỗi {n}', '错误{n}'],
    'ls.dong': ['{n} dòng', '{n}行']
  });
  ME.nhan('Cập nhật file kho', {
    'nk.tieuDe': ['Cập nhật kho từ file tuần', '导入每周库存文件'],
    'nk.b1': ['Chọn file', '选择文件'],
    'nk.b2': ['Ghép cột', '字段映射'],
    'nk.b3': ['Xem trước', '预览'],
    'nk.b4': ['Ghi dữ liệu', '写入'],
    'nk.chonFile': ['Chọn file tồn kho (.xlsx hoặc .csv)', '选择库存文件（.xlsx或.csv）'],
    'nk.chonFileGoiY': ['File xuất từ app kho, mỗi dòng một mã vật tư. App đọc file ngay trên máy, chỉ gửi các cột đã ghép.', '从仓库系统导出的文件，每行一个料号。应用在本机读取文件，只发送已映射的列。'],
    'nk.dangDoc': ['Đang đọc file…', '正在读取文件…'],
    'nk.thongTinFile': ['{n} dòng · {sheet} · tải về {ngay}', '{n}行 · {sheet} · {ngay} 下载'],
    'nk.doiFile': ['Đổi file', '更换文件'],
    'nk.sheet': ['Trang tính', '工作表'],
    'nk.ngayFile': ['Ngày của file (số tồn tính đến ngày)', '文件日期（库存截至日期）'],
    'nk.dungGhepCu': ['Dùng cách ghép cột đã lưu', '使用已保存的字段映射'],
    'nk.ghepCot': ['Ghép cột', '字段映射'],
    'nk.ghepMoi': ['App tự đoán cột. Kiểm tra lại rồi xem trước.', '应用已自动匹配列，请核对后预览。'],
    'nk.cotFile': ['Cột trong file', '文件中的列'],
    'nk.truongApp': ['Trường trong app', '应用字段'],
    'nk.khongLay': ['— Không lấy —', '— 不导入 —'],
    'nk.tonKho': ['Tồn kho', '库存'],
    'nk.thieuMaCot': ['Chưa chọn cột Mã linh kiện.', '尚未选择料号列。'],
    'nk.moi': ['Mã mới', '新增料号'],
    'nk.doiTon': ['Thay đổi tồn kho', '库存变动'],
    'nk.khongDoi': ['Không đổi', '无变化'],
    'nk.khongCon': ['Không còn trong file', '文件中已无'],
    'nk.doiKhac': ['Ngoài ra {n} mã đổi tên, quy cách, đơn vị, vị trí hoặc đơn giá.', '另有{n}个料号的名称、规格、单位、库位或单价有变动。'],
    'nk.dongLoi': ['{n} dòng lỗi – sẽ bỏ qua', '{n}行错误 – 将跳过'],
    'nk.taiLoi': ['Tải danh sách lỗi', '下载错误清单'],
    'nk.xemTruoc': ['Thay đổi tồn kho (xem trước)', '库存变动预览'],
    'nk.xemTatCa': ['Xem tất cả {n} thay đổi', '查看全部{n}项变动'],
    'nk.khongThayDoi': ['Không có mã nào đổi tồn kho.', '没有料号的库存发生变动。'],
    'nk.ghiChu': ['Chỉ ghi đè các cột lấy từ file. Tên tiếng Trung, ảnh, tồn tối thiểu và liên kết với máy được giữ nguyên. Mã không còn trong file vẫn giữ lại và gắn nhãn.',
      '仅覆盖文件中的字段；中文名、照片、安全库存及设备关联保持不变。文件中已无的料号保留并标记。'],
    'nk.xacNhan': ['Xác nhận cập nhật', '确认导入'],
    'nk.dangGhi': ['Đang ghi gói {i} / {n}…', '正在写入第{i}/{n}包…'],
    'nk.dangBatDau': ['Đang mở lần cập nhật…', '正在开始导入…'],
    'nk.dangKetThuc': ['Đang kiểm tra và đánh dấu mã không còn trong file…', '正在核对并标记文件中已无的料号…'],
    'nk.dichCham': ['Mã mới được dịch tên sang tiếng Trung nên gói đầu có thể chậm 1–2 phút.', '新料号需要翻译成中文，第一批可能需要1–2分钟。'],
    'nk.dungGiua': ['Đang dừng ở gói {i}. Kiểm tra mạng rồi bấm Gửi tiếp.', '在第{i}包暂停，请检查网络后点击“继续发送”。'],
    'nk.guiTiep': ['Gửi tiếp', '继续发送'],
    'nk.xong': ['Đã cập nhật kho', '库存已更新'],
    'nk.kqMoi': ['Mã mới', '新增料号'],
    'nk.kqDoi': ['Có thay đổi', '有变动'],
    'nk.kqKhongDoi': ['Không đổi', '无变化'],
    'nk.kqLoi': ['Dòng lỗi', '错误行'],
    'nk.kqVang': ['Không còn trong file', '文件中已无'],
    'nk.chuaDich': ['{n} mã chưa có tên tiếng Trung (dịch lỗi). Người biết tiếng Trung điền sau.', '{n}个料号尚无中文名（翻译失败），请懂中文的人员补充。'],
    'nk.dichMay': ['Tên tiếng Trung của mã mới do máy dịch: vào Kho → Dịch máy để duyệt.', '新料号的中文名为机器翻译：请到 备件库 → 机器翻译 审核。'],
    'nk.goiYGop': ['Mã tạm có thể trùng mã chính thức', '临时编号可能与正式料号重复'],
    'nk.goiYGopGiai': ['Cùng mã nhà sản xuất hoặc cùng tên và quy cách. Gộp để chuyển liên kết máy sang mã chính thức.', '原厂料号或名称规格相同。合并后设备关联将转到正式料号。'],
    'nk.gop': ['Gộp', '合并'],
    'nk.veKho': ['Về kho linh kiện', '返回备件库'],
    'nk.huyHoi': ['Bỏ lần cập nhật này?', '放弃本次导入？'],
    'nk.loiTHIEU_MA': ['Dòng {dong}: thiếu mã linh kiện', '第{dong}行：缺少料号'],
    'nk.loiMA_QUA_DAI': ['Dòng {dong}: mã dài quá 50 ký tự', '第{dong}行：料号超过50个字符'],
    'nk.loiMA_TAM': ['Dòng {dong}: mã {ma} là mã tạm, không nhập từ file được', '第{dong}行：{ma}是临时编号，不能从文件导入'],
    'nk.loiTON_KHO_SAI': ['Dòng {dong}: số lượng không hợp lệ «{gt}»', '第{dong}行：数量格式无效「{gt}」'],
    'nk.loiDON_GIA_SAI': ['Dòng {dong}: đơn giá không hợp lệ «{gt}»', '第{dong}行：单价格式无效「{gt}」'],
    'nk.loiTRUNG_MA': ['Dòng {dong}: trùng mã {ma}', '第{dong}行：料号重复 {ma}'],
    'nk.khongQuyen': ['Cần quyền cập nhật file kho (cấp 1–2 hoặc quyền thêm NHAP_KHO).', '需要导入库存文件的权限（1–2级或附加权限NHAP_KHO）。']
  });

  // ───────── Trạng thái tồn ─────────
  function so(v) { return v === '' || v === null || v === undefined ? null : Number(v); }
  /** { ma: 'het' | 'duoiMin' | 'du' | 'chuaCo', nhan, mau } */
  ME.ttTon = function (lk) {
    const ton = so(lk.TonKho);
    const min = Number(lk.TonToiThieu) || 0;
    if (ton === null || isNaN(ton)) return { ma: 'chuaCo', nhan: 'kho.chuaCoTon', mau: 'xam' };
    if (ton <= 0) return { ma: 'het', nhan: 'kho.het', mau: 'do' };
    if (min > 0 && ton < min) return { ma: 'duoiMin', nhan: 'kho.duoiMin', mau: 'cam' };
    return { ma: 'du', nhan: 'kho.du', mau: 'xanh' };
  };
  const IC_NHOM = { VONG_BI: 'vongBi', LOC: 'giot', DAU_MO: 'giot', PHOT_GIOANG: 'vongBi', DAY_DAI: 'lienKet', THIET_BI_DIEN: 'set', CAM_BIEN: 'hoatDong', VAN_ONG: 'gio', CO_KHI_KHAC: 'coLe', TIEU_HAO: 'hop' };
  ME.icLK = function (nhom) { return IC_NHOM[nhom] || 'hop'; };
  function laMaTam(ma) { return String(ma || '').indexOf(TIEN_TO_TAM) === 0; }

  // ───────── Dữ liệu kho + thao tác chờ gửi ─────────
  function lkCho() {
    const m = new Map();
    ME.hang.ds().forEach(function (q) {
      if (q.action === 'suaLinhKien' && q.data && q.data.lk) {
        const x = Object.assign({}, q.data.lk);
        delete x.anh;
        if (x.duyetDich) x.DichMay = false;
        if (x.TenZh !== undefined) x.DichMay = x.dichMay === true;
        m.set(x.MaLK, Object.assign(m.get(x.MaLK) || {}, x, { _cho: true }));
      } else if (q.action === 'duyetLinhKien') {
        m.set(q.data.maLK, Object.assign(m.get(q.data.maLK) || {}, { TrangThaiDuyet: 'DA_DUYET', _cho: true }));
      }
    });
    return m;
  }
  ME.layLK = function (ma) {
    const r = ME.du.lay('KhoLinhKien', ma);
    const c = lkCho().get(ma);
    if (!r) return null;
    return c ? Object.assign({}, r, c) : r;
  };
  let dsLKDem = -1;
  let dsLKHang = -1;
  let dsLKCache = [];
  /** Toàn bộ linh kiện (đã gộp thay đổi chờ gửi), có chuỗi tìm sẵn. */
  function dsLK() {
    const dem = ME.du.dem('KhoLinhKien');
    const hangSo = ME.hang.ds().length + ME.hang.ds().reduce(function (s, q) { return s + (q.trangThai === 'cho' ? 1 : 0); }, 0);
    if (dem === dsLKDem && hangSo === dsLKHang) return dsLKCache;
    const cho = lkCho();
    dsLKCache = ME.du.ds('KhoLinhKien').map(function (r) {
      const x = cho.has(r.MaLK) ? Object.assign({}, r, cho.get(r.MaLK)) : r;
      return { r: x, tim: ME.boDau([x.MaLK, x.TenVi, x.QuyCach, x.MaNSX, x.ViTriKho].join(' ')), zh: String(x.TenZh || '') };
    });
    dsLKDem = dem;
    dsLKHang = hangSo;
    return dsLKCache;
  }
  ME.dsLK = dsLK;
  ME.khoDuoiMin = function () {
    return dsLK().filter(function (x) { return ME.ttTon(x.r).ma !== 'chuaCo' && (Number(x.r.TonToiThieu) || 0) > 0 && Number(x.r.TonKho) < Number(x.r.TonToiThieu); }).map(function (x) { return x.r; });
  };
  function lkMoiCho() {
    return ME.hang.ds().filter(function (q) { return q.action === 'themLinhKien'; });
  }
  function lanNhapCuoi() {
    return ME.du.ds('LanNhapKho').filter(function (x) { return x.TrangThai === 'HOAN_TAT'; })
      .sort(function (a, b) { return String(a.KetThuc || a.BatDau) < String(b.KetThuc || b.BatDau) ? 1 : -1; })[0] || null;
  }
  function dvHaiDong(dvt) { return [dvt || 'cái', ME.dvtZh(dvt) || '个']; }

  // ═════════ Danh sách kho (bản vẽ 7) ═════════
  const LOC = {
    '': { nhan: 'chung.tatCa' },
    'duoi-min': { nhan: 'kho.duoiMin', mau: 'do', loc: function (r) { return (Number(r.TonToiThieu) || 0) > 0 && r.TonKho !== '' && r.TonKho !== null && r.TonKho !== undefined && Number(r.TonKho) < Number(r.TonToiThieu); } },
    'thu-cong': { nhan: 'kho.thuCong', mau: 'tim', loc: function (r) { return r.Nguon === 'THU_CONG'; } },
    'khong-con': { nhan: 'kho.khongCon', mau: 'xam', loc: function (r) { return r.TrangThaiFile === 'KHONG_CON'; } },
    'cho-duyet': { nhan: 'kho.choDuyet', mau: 'tim', quyen: 'DUYET_LINH_KIEN', loc: function (r) { return r.TrangThaiDuyet === 'CHO_DUYET'; } },
    'dich-may': { nhan: 'kho.dichMay', mau: 'xam', quyen: 'SUA_LINH_KIEN', loc: function (r) { return r.DichMay === true; } }
  };
  const locKho = { tu: '', loc: '' };
  function nhanDong(r, tt) {
    if (tt.ma === 'het' && (Number(r.TonToiThieu) || 0) > 0) return ME.ui.nhanTTK('kho.het', 'do', 'nhan-nho');
    if (tt.ma === 'het') return ME.ui.nhanTTK('kho.het', 'do', 'nhan-nho');
    if (tt.ma === 'duoiMin') return ME.ui.nhanTTK('kho.duoiMinN', 'cam', 'nhan-nho', { n: Number(r.TonToiThieu) });
    if (r.TrangThaiDuyet === 'CHO_DUYET') return ME.ui.nhanTTK('kho.choDuyet', 'tim', 'nhan-nho');
    if (r.Nguon === 'THU_CONG') return ME.ui.nhanTTK(laMaTam(r.MaLK) ? 'kho.thuCongTam' : 'kho.thuCong', 'tim', 'nhan-nho');
    if (r.TrangThaiFile === 'KHONG_CON') {
      return ME.ui.nhanTT(ME.tv('kho.khongConTu', { ngay: ME.ngayVi(r.NgayFile, true) }), ME.tz('kho.khongConTu', { ngay: ME.ngayZh(r.NgayFile, true) }), 'xam', 'nhan-nho');
    }
    return null;
  }
  function dongLK(r) {
    const tt = ME.ttTon(r);
    const lop = tt.ma === 'het' ? 'do' : (tt.ma === 'duoiMin' ? 'cam' : (r.Nguon === 'THU_CONG' ? 'tim' : (r.TrangThaiFile === 'KHONG_CON' ? 'xam' : '')));
    const dv = dvHaiDong(r.DVT);
    const ton = tt.ma === 'chuaCo' ? '–' : ME.soVi(r.TonKho);
    return h('a', { class: 'muc dau-tren', href: '#/kho/' + enc(r.MaLK) },
      ME.ui.oAnhNho(r.AnhId, ME.icLK(r.NhomLK), 'b44 ' + lop, 22),
      h('div', { class: 'giua' }, h('div', { class: 'ten' }, ME.L2(r.TenVi || r.MaLK, r.TenZh)),
        h('div', { class: 'ma' }, r.MaLK + (r.ViTriKho ? ' · ' + r.ViTriKho : '') + (r._cho ? ' · ' + ME.tv('chung.choGui') : '')),
        nhanDong(r, tt)),
      h('div', { class: 'ton-phai' }, h('div', { class: 'so-ton ' + (tt.ma === 'het' ? 'so-do' : (tt.ma === 'duoiMin' ? 'so-cam' : (r.TrangThaiFile === 'KHONG_CON' ? 'so-mo' : ''))) }, ton),
        ME.L('kho.ton', { dv: dv })));
  }
  function dongDuyetDich(r, xong) {
    const o = ME.ui.oNhap({ value: r.TenZh || '', lang: 'zh-Hans', 'aria-label': ME.t1('lk.tenZh') });
    const nut = h('button', {
      type: 'button', class: 'nut-vien', onClick: function () {
        const lk = { MaLK: r.MaLK, duyetDich: true };
        const moi = o.value.trim();
        if (!moi) { o.focus(); return; }
        if (moi !== r.TenZh) lk.TenZh = moi;
        ME.hang.them('suaLinhKien', { lk: lk }, { vi: ME.tv('lk.duyetDich') + ' ' + r.MaLK, zh: ME.tz('lk.duyetDich') + ' ' + r.MaLK }).then(function () { ME.hang.gui(); });
        el.style.opacity = '0.4';
        nut.disabled = true;
        if (xong) xong();
      }
    }, ME.ic('check', 18, 2.4), h('span', null, ME.L('kho.dung')));
    const el = h('div', { class: 'muc', style: 'flex-direction:column;align-items:stretch;gap:8px' },
      h('div', { style: 'display:flex;gap:8px;justify-content:space-between' }, h('div', { class: 'ten', style: 'min-width:0' }, h('span', { class: 'vi' }, r.TenVi || r.MaLK), h('div', { class: 'ma' }, r.MaLK + (r.QuyCach ? ' · ' + r.QuyCach : '')))),
      h('div', { class: 'hang-o' }, o, nut));
    return el;
  }
  ME.tuyen('/kho', {
    ve: function (ts, q) {
      if (q.loc !== undefined) locKho.loc = LOC[q.loc] ? q.loc : '';
      if (LOC[locKho.loc] && LOC[locKho.loc].quyen && !ME.co(LOC[locKho.loc].quyen)) locKho.loc = '';
      const vungDS = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      const chip = h('div', { class: 'hang-chip', style: 'padding:14px 12px 4px' });
      const self = this;
      function veChip() {
        ME.xoaCon(chip);
        const all = dsLK();
        Object.keys(LOC).forEach(function (k) {
          const l = LOC[k];
          if (l.quyen && !ME.co(l.quyen)) return;
          const dem = l.loc ? all.filter(function (x) { return l.loc(x.r); }).length : null;
          if (k && !dem && locKho.loc !== k && (k === 'cho-duyet' || k === 'dich-may')) return;
          chip.appendChild(ME.ui.chip(l.nhan, { chon: locKho.loc === k, dem: k ? dem : null, mauDem: l.mau, vien: !!k, onClick: function () { locKho.loc = k; veChip(); veDS(); } }));
        });
      }
      function veDS() {
        ME.xoaCon(vungDS);
        const all = dsLK();
        const choMoi = lkMoiCho();
        if (choMoi.length) {
          vungDS.appendChild(h('a', { class: 'hop-cb', href: '#/tai-khoan' }, ME.ic('dongBo', 20, 2), h('div', { class: 'chu' }, ME.L('kho.choGuiMoi', { n: choMoi.length }))));
        }
        if (!all.length) { vungDS.appendChild(ME.ui.trong('kho.trongKho', null, 'hop')); return; }
        const l = LOC[locKho.loc];
        const tu = locKho.tu.trim();
        const q2 = ME.boDau(tu);
        let ds = all.filter(function (x) {
          if (l.loc && !l.loc(x.r)) return false;
          return !q2 || x.tim.indexOf(q2) >= 0 || (tu && x.zh.indexOf(tu) >= 0);
        });
        const hang = function (r) {
          const tt = ME.ttTon(r);
          if (tt.ma === 'het' && (Number(r.TonToiThieu) || 0) > 0) return 0;
          if (tt.ma === 'duoiMin') return 1;
          if (r.TrangThaiDuyet === 'CHO_DUYET') return 2;
          return 3;
        };
        const q3 = q2.toUpperCase();
        ds = ds.map(function (x) { return { r: x.r, k: q2 && ME.boDau(x.r.MaLK).toUpperCase().indexOf(q3) === 0 ? 0 : (q2 ? 1 : hang(x.r)) }; })
          .sort(function (a, b) { return a.k - b.k || String(a.r.MaLK).localeCompare(String(b.r.MaLK), 'vi', { numeric: true }); })
          .map(function (x) { return x.r; });
        if (!ds.length) { vungDS.appendChild(ME.ui.trong('kho.trong', null, 'tim')); return; }
        if (locKho.loc === 'dich-may') {
          vungDS.appendChild(h('div', { class: 'hop-tin' }, ME.ic('dich', 20, 2), h('div', { class: 'chu' }, ME.L('kho.dichGoiY'))));
          ME.ui.dsDai(ds, function (r) { return dongDuyetDich(r); }, 40, vungDS);
          return;
        }
        ME.ui.dsDai(ds, dongLK, 60, vungDS);
      }
      self._ve = function () { veChip(); veDS(); };
      veChip();
      veDS();
      const nl = lanNhapCuoi();
      let ngayFile = nl ? nl.NgayFile : '';
      if (!ngayFile) ME.du.ds('KhoLinhKien').forEach(function (r) { if (String(r.NgayFile || '') > ngayFile) ngayFile = String(r.NgayFile); });
      const soMa = ME.du.soDong('KhoLinhKien');
      const bl = nl ? ME.baoLau(nl.KetThuc || nl.BatDau) : null;
      const phai = [];
      if (ME.co('NHAP_KHO')) phai.push(ME.ui.nutTron('tepLen', 'kho.capNhatFile', '/kho/nhap'));
      if (ME.co('THEM_LINH_KIEN')) phai.push(ME.ui.nutTron('cong', 'kho.themLK', '/kho/them', true));
      return h('div', { class: 'trang' },
        ME.ui.dauLon({ tieuDe: 'kho.tieuDe', keo: true, phai: phai, duoi: ME.ui.oTim({ goiY: 'kho.tim', giaTri: locKho.tu, onTim: function (tu) { locKho.tu = tu; veDS(); } }) }),
        h('section', { class: 'kho-the' },
          h('div', { class: 'hang' }, h('span', { class: 'bieu-tuong b40 xl' }, ME.ic('tepCheck', 22, 1.8)),
            h('div', { class: 'giua' },
              ngayFile ? [h('span', { class: 'vi chinh' }, ME.tv('kho.theoFile', { ngay: ME.ngayVi(ngayFile) })), h('span', { class: 'zh chinh' }, ME.tz('kho.theoFile', { ngay: ME.ngayZh(ngayFile) }))]
                : [h('span', { class: 'vi chinh' }, ME.tv('kho.chuaNhap')), h('span', { class: 'zh chinh' }, ME.tz('kho.chuaNhap'))],
              bl ? [h('span', { class: 'vi phu' }, ME.tv('kho.soMa', { n: soMa, luc: bl.vi })), h('span', { class: 'zh phu' }, ME.tz('kho.soMa', { n: soMa, luc: bl.zh }))]
                : [h('span', { class: 'vi phu' }, ME.tv('kho.soMaChuaNhap', { n: soMa })), h('span', { class: 'zh phu' }, ME.tz('kho.soMaChuaNhap', { n: soMa }))])),
          ME.co('NHAP_KHO') ? h('a', { class: 'nut-vang-tron', href: '#/kho/nhap' }, ME.ic('tepLen', 20, 2), h('span', null, ME.L('kho.capNhatTuan'))) : null),
        chip,
        h('main', { class: 'noi-dung', style: 'padding-top:8px;gap:8px' }, vungDS),
        ME.ui.thanhDuoi('/kho'));
    },
    capNhat: function (el, loai) { if (loai !== 'dong-bo' && this._ve && locKho.loc !== 'dich-may') this._ve(); }
  });

  // ═════════ Thêm / sửa linh kiện (bản vẽ 9) ═════════
  function maTamTiepTheo() {
    let lon = 0;
    ME.du.ds('KhoLinhKien').forEach(function (r) {
      const m = String(r.MaLK).match(/^TẠM-(\d+)$/);
      if (m) lon = Math.max(lon, Number(m[1]));
    });
    return TIEN_TO_TAM + ('000' + (lon + 1)).slice(-4);
  }
  function formLK(maSua, q) {
    const cu = maSua ? ME.layLK(maSua) : null;
    if (maSua && !cu) return manKhongThayLK(maSua);
    if (!ME.co(maSua ? 'SUA_LINH_KIEN' : 'THEM_LINH_KIEN')) return ME.ui.manKhongQuyen(maSua ? 'lk.sua' : 'kho.themLK');
    const r = cu || {};
    const tuFile = maSua && r.Nguon === 'FILE';
    const st = { dichMay: r.DichMay === true, may: [], anh: null, boAnh: false };
    if (!maSua && q.tb) st.may.push(q.tb);
    const loi = {};
    const truong = function (khoa, el, batBuoc, goiY, ts) { const t = ME.ui.truongGY(khoa, el, batBuoc, goiY, ts); loi[khoa] = t; return t; };
    const oMa = ME.ui.oNhap({ id: 'l-ma', value: r.MaLK || '', disabled: !!maSua, maxlength: 50, autocapitalize: 'characters' });
    const oTenVi = ME.ui.oNhap({ id: 'l-tenvi', value: r.TenVi || '', disabled: tuFile, maxlength: 200 });
    const oTenZh = ME.ui.oNhap({ id: 'l-tenzh', value: r.TenZh || '', maxlength: 200, lang: 'zh-Hans' });
    oTenZh.addEventListener('input', function () { st.dichMay = false; });
    const oQC = ME.ui.oNhap({ id: 'l-qc', value: r.QuyCach || '', disabled: tuFile, placeholder: ME.t1('lk.quyCachGoiY') });
    const dvtDS = ME.dsDM('DVT');
    const dvtMa = (dvtDS.filter(function (x) { return x.vi.toLowerCase() === String(r.DVT || '').toLowerCase() || x.gt === r.DVT; })[0] || {}).gt || r.DVT || (maSua ? '' : 'CAI');
    const oDVT = ME.ui.chonO(dvtDS, { id: 'l-dvt', giaTri: dvtMa, disabled: tuFile, nhanTrong: 'chung.khongChon' });
    const oNhom = ME.ui.chonO(ME.dsDM('NHOM_LK'), { id: 'l-nhom', giaTri: r.NhomLK, nhanTrong: 'chung.khongChon' });
    const oNSX = ME.ui.oNhap({ id: 'l-nsx', value: r.MaNSX || '', placeholder: ME.t1('lk.maNSXGoiY'), autocapitalize: 'characters' });
    const oViTri = ME.ui.oNhap({ id: 'l-vt', value: r.ViTriKho || '', disabled: tuFile, placeholder: ME.t1('lk.viTriGoiY'), autocapitalize: 'characters' });
    const oMin = ME.ui.soTang(r.TonToiThieu === undefined ? '' : r.TonToiThieu, 1);
    const oGC = h('textarea', { class: 'o-nhap', id: 'l-gc', rows: 3 });
    oGC.value = r.GhiChu || '';
    const vungMay = h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px' });
    function veMay() {
      ME.xoaCon(vungMay);
      st.may.forEach(function (ma) {
        const tb = ME.layTB(ma) || { MaTB: ma, TenVi: '' };
        vungMay.appendChild(h('span', { class: 'the-may' }, h('span', null, ME.L2(ma + (tb.TenVi ? ' · ' + tb.TenVi : ''), tb.TenZh)),
          h('button', { type: 'button', 'aria-label': ME.t1('lk.boMay'), onClick: function () { st.may = st.may.filter(function (x) { return x !== ma; }); veMay(); } }, ME.ic('dong', 18, 2))));
      });
      vungMay.appendChild(h('button', {
        type: 'button', class: 'nut-them-net', onClick: function () {
          ME.chonTu({
            tieuDe: 'lk.ganChonMay', timKiem: true,
            ds: ME.dsTB().filter(function (x) { return st.may.indexOf(x.MaTB) < 0; }).sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); })
              .map(function (x) { return { gt: x.MaTB, vi: x.MaTB + ' · ' + x.TenVi, zh: x.TenZh || '' }; })
          }).then(function (gt) { if (gt) { st.may.push(gt); veMay(); } });
        }
      }, ME.ic('cong', 18, 2), h('span', null, ME.L('lk.themMay'))));
    }
    veMay();
    const chonAnh = ME.ui.chonAnh({ anhUrl: r.AnhId ? ME.anhUrl(r.AnhId, 600) : '', onAnh: function (a) { st.anh = a; st.boAnh = false; }, onBo: function () { st.anh = null; st.boAnh = true; } });
    const nutDich = h('button', {
      type: 'button', class: 'nut-canh', onClick: function () {
        const vi = oTenVi.value.trim();
        if (!vi) { oTenVi.focus(); return; }
        // Chỉ dịch tên (giống máy chủ dịch mã mới khi nhập file); quy cách hiện riêng.
        ME.goiMang('dichTen', { ds: [vi] }, { nhan: 'chung.dangXuLy' }).then(function (d) {
          if (d.ds && d.ds[0]) { oTenZh.value = d.ds[0]; st.dichMay = true; }
        }).catch(ME.boQua);
      }
    }, ME.ic('dich', 18, 2), h('span', null, ME.L('tb.dich')));
    function baoLoi(khoa, x) {
      const t = loi[khoa];
      if (!t) return ME.baoLoi(x);
      const c2 = t.querySelector('.loi-truong');
      if (c2) c2.remove();
      t.appendChild(ME.ui.loiTruong(x));
      const inp = t.querySelector('input,select,textarea');
      if (inp) { inp.classList.add('loi'); inp.focus(); }
      t.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    function luu() {
      Array.prototype.forEach.call(document.querySelectorAll('.loi-truong'), function (x) { x.remove(); });
      Array.prototype.forEach.call(document.querySelectorAll('.o-nhap.loi'), function (x) { x.classList.remove('loi'); });
      const lk = {};
      if (!maSua) {
        const ma = ME.chuanMaLK(oMa.value);
        if (ma && (laMaTam(ma.toUpperCase()) || /^TAM-/i.test(ma))) return baoLoi('lk.ma', ME.t('lk.maTamCam'));
        if (ma && ME.du.lay('KhoLinhKien', ma)) return baoLoi('lk.ma', { vi: ME.tv('tb.trungMa', { ma: ma }), zh: ME.tz('tb.trungMa', { ma: ma }) });
        if (ma) lk.MaLK = ma;
      } else lk.MaLK = maSua;
      if (!tuFile) {
        lk.TenVi = oTenVi.value.trim();
        if (!lk.TenVi) return baoLoi('lk.tenVi', ME.loiThieu('lk.tenVi'));
        lk.QuyCach = oQC.value.trim();
        lk.DVT = oDVT.value;
        lk.ViTriKho = oViTri.value.trim();
      }
      lk.TenZh = oTenZh.value.trim();
      if (!lk.TenZh) return baoLoi('lk.tenZh', ME.loiThieu('lk.tenZh'));
      lk.NhomLK = oNhom.value;
      lk.MaNSX = oNSX.value.trim();
      const min = oMin.lay().trim();
      if (min !== '') {
        const n = ME.docSo(min);
        if (isNaN(n) || n < 0) return baoLoi('lk.tonMin', ME.loiMoi('SO_SAI', { gt: min }));
        lk.TonToiThieu = n;
      } else lk.TonToiThieu = '';
      lk.GhiChu = oGC.value.trim();
      if (st.anh) lk.anh = st.anh.base64;
      else if (st.boAnh) lk.AnhId = '';
      if (st.dichMay && lk.TenZh !== r.TenZh) lk.dichMay = true;
      if (maSua) {
        if (lk.TenZh === r.TenZh) delete lk.TenZh;
        if (r.PhienBan !== undefined && r.PhienBan !== '' && !r._cho) lk.PhienBan = r.PhienBan;
        ME.luuQuaHang('suaLinhKien', { lk: lk }, { vi: ME.tv('lk.sua') + ' ' + maSua, zh: ME.tz('lk.sua') + ' ' + maSua }).then(function (kq) {
          if (kq.ok) ME.thongBao('lk.daSua', null, { ma: maSua });
          ME.di('/kho/' + enc(maSua), true);
        }).catch(ME.boQua);
        return;
      }
      if (lk.TonToiThieu === '') delete lk.TonToiThieu;
      lk.dsMaTB = st.may.slice();
      ME.luuQuaHang('themLinhKien', { lk: lk }, { vi: ME.tv('kho.themLK') + ' ' + (lk.MaLK || lk.TenVi), zh: ME.tz('kho.themLK') + ' ' + (lk.MaLK || lk.TenZh) }).then(function (kq) {
        if (kq.ok) {
          ME.thongBao('lk.daThem', null, { ma: kq.data.maLK || '' });
          ME.dongBo().then(function () { ME.di('/kho/' + enc(kq.data.maLK), true); });
        } else ME.di('/kho', true);
      }).catch(ME.boQua);
    }
    const capBon = ME.cap() >= 4;
    return h('div', { class: 'trang' },
      ME.ui.dau({ tieuDe: maSua ? 'lk.sua' : 'kho.themLK', quayLai: maSua ? '/kho/' + enc(maSua) : '/kho', nho: true }),
      h('main', { class: 'noi-dung' },
        maSua ? (tuFile ? h('div', { class: 'hop-tin' }, ME.ic('tep', 20, 2), h('div', { class: 'chu' }, ME.L('lk.cotFile')))
          : null) : h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('lk.themGiaiThich'))),
        h('div', { class: 'bieu-mau' },
          truong('lk.ma', oMa, false, maSua ? null : 'lk.maGoiY', { ma: maTamTiepTheo() }),
          truong('lk.tenVi', oTenVi, true),
          truong('lk.tenZh', h('div', { class: 'hang-o' }, oTenZh, nutDich), true),
          truong('lk.quyCach', oQC),
          h('div', { class: 'luoi-2' }, truong('lk.dvt', oDVT), truong('lk.nhom', oNhom)),
          truong('lk.maNSX', oNSX),
          h('div', { class: 'luoi-2' }, truong('lk.viTri', oViTri), truong('lk.tonMin', oMin)),
          maSua ? null : ME.ui.truong('lk.dungChoMay', vungMay),
          ME.ui.truong('lk.anh', chonAnh),
          truong('chung.ghiChu', oGC))),
      h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('lk.luu')),
        !maSua && capBon ? h('div', { class: 'chu-duoi' }, ME.L('lk.choDuyetGhi')) : null));
  }
  ME.tuyen('/kho/them', { ve: function (ts, q) { return formLK(null, q); } });

  // ═════════ Cập nhật kho từ file tuần (bản vẽ 8) ═════════
  const TRUONG_FILE = [
    { k: 'MaLK', nhan: 'lk.ma', batBuoc: true, doan: ['ma vat tu', 'ma vt', 'ma hang', 'ma lk', 'ma linh kien', 'ma so', 'item code', 'part no', 'code', 'sku', 'ma', '料号', '编码'] },
    { k: 'TenVi', nhan: 'lk.tenVi', doan: ['ten vat tu', 'ten hang', 'ten linh kien', 'ten lk', 'dien giai', 'ten', 'name', '名称'] },
    { k: 'QuyCach', nhan: 'lk.quyCach', doan: ['quy cach', 'thong so', 'spec', '规格'] },
    { k: 'DVT', nhan: 'lk.dvt', doan: ['dvt', 'don vi tinh', 'don vi', 'unit', '单位'] },
    { k: 'TonKho', nhan: 'nk.tonKho', doan: ['sl ton', 'so luong ton', 'ton kho', 'ton cuoi', 'ton', 'so luong', 'qty', '库存'] },
    { k: 'DonGia', nhan: 'lk.donGia', doan: ['don gia', 'gia', 'price', '单价'] },
    { k: 'ViTriKho', nhan: 'lk.viTri', doan: ['vi tri kho', 'vi tri', 'ke', 'location', 'bin', '库位'] }
  ];
  function chuanTieuDe(s) { return ME.boDau(String(s || '')).replace(/[^a-z0-9一-鿿 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  /** Đoán cột: ưu tiên cách ghép đã lưu (khớp đúng tên cột), sau đó đoán theo tên. Trả { MaLK: chỉ số cột | -1, … }. */
  function doanGhep(tieuDe) {
    const chuan = tieuDe.map(chuanTieuDe);
    const daLuu = ME.du.ds('GhepCotKho');
    const ghep = {};
    const daDung = {};
    let dungDaLuu = daLuu.length > 0;
    TRUONG_FILE.forEach(function (t) {
      const r = daLuu.filter(function (x) { return x.TruongApp === t.k; })[0];
      if (r) {
        const i = chuan.indexOf(chuanTieuDe(r.CotFile));
        if (i >= 0) { ghep[t.k] = i; daDung[i] = true; return; }
        dungDaLuu = false;
      }
    });
    if (!dungDaLuu || ghep.MaLK === undefined) {
      dungDaLuu = false;
      TRUONG_FILE.forEach(function (t) {
        if (ghep[t.k] !== undefined) return;
        for (let k = 0; k < t.doan.length; k++) {
          const tu = t.doan[k];
          let i = chuan.findIndex(function (c, j) { return !daDung[j] && c === tu; });
          if (i < 0 && tu.length > 3) i = chuan.findIndex(function (c, j) { return !daDung[j] && c.indexOf(tu) >= 0; });
          if (i >= 0) { ghep[t.k] = i; daDung[i] = true; return; }
        }
      });
    }
    TRUONG_FILE.forEach(function (t) { if (ghep[t.k] === undefined) ghep[t.k] = -1; });
    return { ghep: ghep, daLuu: dungDaLuu };
  }

  // ── Đọc file ──
  function docXml(chu) { return new DOMParser().parseFromString(chu, 'application/xml'); }
  function the(n, ten) { return Array.prototype.slice.call(n.getElementsByTagNameNS('*', ten)); }
  function chuSi(si) {
    let s = '';
    Array.prototype.forEach.call(si.childNodes, function (c) {
      if (c.localName === 't') s += c.textContent;
      else if (c.localName === 'r') the(c, 't').forEach(function (t) { s += t.textContent; });
    });
    return s;
  }
  function cotSo(ref) {
    const m = String(ref || '').match(/^([A-Z]+)/);
    if (!m) return -1;
    let n = 0;
    for (let i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64);
    return n - 1;
  }
  /** .xlsx → { sheets: [{ ten, dong: [{ so, o: [] }] }] } (chỉ đọc sheet đầu khi mở, sheet khác đọc khi chọn). */
  function moXlsx(buf) {
    return ME.napThuVien('js/lib/jszip.min.js').then(function () { return window.JSZip.loadAsync(buf); }).then(function (zip) {
      const doc = function (p) { const f = zip.file(p); return f ? f.async('string') : Promise.resolve(null); };
      return Promise.all([doc('xl/workbook.xml'), doc('xl/_rels/workbook.xml.rels'), doc('xl/sharedStrings.xml')]).then(function (kq) {
        if (!kq[0]) throw ME.loiMoi('TEP_LA');
        const wb = docXml(kq[0]);
        const rels = {};
        if (kq[1]) the(docXml(kq[1]), 'Relationship').forEach(function (r) { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
        const ss = kq[2] ? the(docXml(kq[2]), 'si').map(chuSi) : [];
        const sheets = the(wb, 'sheet').map(function (s, i) {
          const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
          let p = rels[rid] || ('worksheets/sheet' + (i + 1) + '.xml');
          p = p.charAt(0) === '/' ? p.slice(1) : 'xl/' + p.replace(/^\.\//, '');
          return { ten: s.getAttribute('name') || ('Sheet' + (i + 1)), duong: p };
        });
        return {
          sheets: sheets,
          doc: function (i) {
            return doc(sheets[i].duong).then(function (x) {
              if (!x) throw ME.loiMoi('TEP_LA');
              return the(docXml(x), 'row').map(function (row, k) {
                const o = [];
                let vt = 0;
                the(row, 'c').forEach(function (c) {
                  const r = c.getAttribute('r');
                  const j = r ? cotSo(r) : vt;
                  vt = j + 1;
                  const t = c.getAttribute('t');
                  const v = the(c, 'v')[0];
                  let gt = '';
                  if (t === 's') gt = v ? (ss[Number(v.textContent)] || '') : '';
                  else if (t === 'inlineStr') gt = the(c, 't').map(function (x) { return x.textContent; }).join('');
                  else if (t === 'str' || t === 'e') gt = v ? v.textContent : '';
                  else if (t === 'b') gt = v ? (v.textContent === '1' ? 'TRUE' : 'FALSE') : '';
                  else if (v) { const n = Number(v.textContent); gt = isFinite(n) && v.textContent.trim() !== '' ? n : v.textContent; }
                  o[j] = gt;
                });
                for (let j = 0; j < o.length; j++) if (o[j] === undefined) o[j] = '';
                return { so: Number(row.getAttribute('r')) || k + 1, o: o };
              });
            });
          }
        };
      });
    });
  }
  function giaiMaChu(buf) {
    const b = new Uint8Array(buf);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch (e) {
      try { return new TextDecoder('windows-1258').decode(b); } catch (e2) { return new TextDecoder('utf-8').decode(b); }
    }
  }
  function docCsv(chu) {
    chu = chu.replace(/^﻿/, '');
    const dau = chu.slice(0, chu.indexOf('\n') > 0 ? chu.indexOf('\n') : chu.length);
    const dem = function (k) { return dau.split(k).length - 1; };
    const ngan = [',', ';', '\t'].sort(function (a, b) { return dem(b) - dem(a); })[0];
    const dong = [];
    let o = [];
    let gt = '';
    let trongNhay = false;
    let soDong = 1;
    let dongBatDau = 1;
    for (let i = 0; i < chu.length; i++) {
      const c = chu.charAt(i);
      if (trongNhay) {
        if (c === '"') { if (chu.charAt(i + 1) === '"') { gt += '"'; i++; } else trongNhay = false; } else { if (c === '\n') soDong++; gt += c; }
      } else if (c === '"') trongNhay = true;
      else if (c === ngan) { o.push(gt); gt = ''; } else if (c === '\n' || c === '\r') {
        if (c === '\r' && chu.charAt(i + 1) === '\n') i++;
        o.push(gt);
        dong.push({ so: dongBatDau, o: o });
        o = [];
        gt = '';
        soDong++;
        dongBatDau = soDong;
      } else gt += c;
    }
    if (gt !== '' || o.length) { o.push(gt); dong.push({ so: dongBatDau, o: o }); }
    return dong;
  }
  /** Dòng tiêu đề: dòng đầu (trong 30 dòng đầu) có từ 2 ô chữ trở lên. */
  function timTieuDe(dong) {
    for (let i = 0; i < Math.min(30, dong.length); i++) {
      const chu = dong[i].o.filter(function (v) { return typeof v === 'string' && v.trim() !== ''; }).length;
      if (chu >= 2) return i;
    }
    return 0;
  }
  function giaTriO(v) { return typeof v === 'number' ? v : String(v === undefined || v === null ? '' : v).trim(); }
  function docSoO(v) {
    if (typeof v === 'number') return v;
    const s = String(v || '').trim();
    if (s === '') return '';
    return ME.docSo(s);
  }

  /** Kiểm từng dòng như máy chủ (docDongKho_), so với kho trên máy. */
  function xemTruoc(dong, ghep) {
    const kq = { hopLe: [], loi: [], moi: [], doiTon: [], doiKhac: 0, khongDoi: 0, khongCon: 0, dsMa: [], gui: [] };
    const gap = {};
    const lay = function (row, k) { const i = ghep[k]; return i >= 0 ? giaTriO(row.o[i]) : undefined; };
    dong.forEach(function (row) {
      const coGT = TRUONG_FILE.some(function (t) { const v = lay(row, t.k); return v !== undefined && v !== ''; });
      if (!coGT) return;
      const ma = ME.chuanMaLK(lay(row, 'MaLK'));
      const x = { _dong: row.so, MaLK: ma };
      const baoLoi = function (ma2, gt) { kq.loi.push({ dong: row.so, ma: ma, loi: ma2, gt: gt === undefined ? '' : String(gt) }); };
      if (!ma) { baoLoi('THIEU_MA'); kq.gui.push(x); return; }
      if (ma.length > 50) { baoLoi('MA_QUA_DAI'); kq.gui.push(x); return; }
      if (laMaTam(ma.toUpperCase())) { baoLoi('MA_TAM'); kq.gui.push(x); return; }
      if (gap[ma]) { baoLoi('TRUNG_MA'); return; }
      gap[ma] = true;
      ['TenVi', 'QuyCach', 'DVT', 'ViTriKho'].forEach(function (k) { const v = lay(row, k); if (v !== undefined) x[k] = String(v); });
      let sai = false;
      ['TonKho', 'DonGia'].forEach(function (k) {
        const v = lay(row, k);
        if (v === undefined) return;
        const n = docSoO(v);
        if (n !== '' && (isNaN(n) || (k === 'DonGia' && n < 0))) { if (!sai) baoLoi(k === 'TonKho' ? 'TON_KHO_SAI' : 'DON_GIA_SAI', v); sai = true; x[k] = String(v); return; }
        x[k] = n;
      });
      kq.gui.push(x);
      const cu = ME.du.lay('KhoLinhKien', ma);
      if (sai) { if (cu) kq.dsMa.push(ma); return; }
      kq.hopLe.push(x);
      kq.dsMa.push(ma);
      if (!cu) { kq.moi.push(x); return; }
      const tonCu = so(cu.TonKho);
      const tonMoi = x.TonKho === undefined ? tonCu : so(x.TonKho);
      const doiTon = x.TonKho !== undefined && !((tonCu === null && tonMoi === null) || (tonCu !== null && tonMoi !== null && Math.abs(tonCu - tonMoi) < 1e-9));
      const doiKhac = ['TenVi', 'QuyCach', 'DVT', 'ViTriKho'].some(function (k) { return x[k] !== undefined && String(x[k]) !== String(cu[k] || ''); }) ||
        (x.DonGia !== undefined && cu.DonGia !== undefined && String(x.DonGia) !== String(cu.DonGia));
      if (doiTon) kq.doiTon.push({ x: x, cu: cu, tu: tonCu, den: tonMoi });
      else if (doiKhac) kq.doiKhac++;
      else kq.khongDoi++;
    });
    ME.du.ds('KhoLinhKien').forEach(function (r) { if (r.Nguon === 'FILE' && !gap[r.MaLK]) kq.khongCon++; });
    return kq;
  }
  function chuLoi(l) {
    const dong = ME.soVi(l.dong);
    return { vi: ME.tv('nk.loi' + l.loi, { dong: dong, ma: l.ma, gt: l.gt }), zh: ME.tz('nk.loi' + l.loi, { dong: String(l.dong), ma: l.ma, gt: l.gt }) };
  }

  ME.tuyen('/kho/nhap', {
    ve: function () {
      if (!ME.co('NHAP_KHO')) {
        return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'nk.tieuDe', quayLai: '/kho', nho: true }),
          h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb' }, ME.ic('khoa', 20, 2), h('div', { class: 'chu' }, ME.L('nk.khongQuyen')))));
      }
      const st = { buoc: 1, file: null, mo: null, sheet: 0, dong: null, tieuDe: [], dauI: 0, ghep: null, daLuu: false, suaGhep: false, kq: null, ngayFile: ME.homNay(), dangGhi: false };
      const vungBuoc = h('section', { class: 'buoc' });
      const than = h('div', { style: 'display:flex;flex-direction:column;gap:12px' });
      const thanhNut = h('div', { class: 'thanh-nut', hidden: true });
      const inpFile = h('input', { type: 'file', accept: '.xlsx,.csv,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv', style: 'display:none' });
      inpFile.addEventListener('change', function () { const f = inpFile.files && inpFile.files[0]; inpFile.value = ''; if (f) moFile(f); });
      function veBuoc() {
        const ten = ['nk.b1', 'nk.b2', 'nk.b3', 'nk.b4'];
        ME.xoaCon(vungBuoc).appendChild(h('ol', null, ten.map(function (k, i) {
          const so2 = i + 1;
          const lop = so2 < st.buoc ? 'xong' : (so2 === st.buoc ? 'dang' : '');
          return h('li', { class: lop, 'aria-current': so2 === st.buoc ? 'step' : null },
            h('span', { class: 'tron' }, so2 < st.buoc ? ME.ic('check', 16, 3) : String(so2)), h('span', { class: 'chu' }, ME.L(k)));
        })));
      }
      function moFile(f) {
        const ten = f.name || 'file';
        if (/\.xls$/i.test(ten)) { ME.baoLoi(ME.loiMoi('TEP_XLS')); return; }
        const dong = ME.ui.choXuLy('nk.dangDoc');
        f.arrayBuffer().then(function (buf) {
          if (/\.csv$/i.test(ten) || /text\/csv/.test(f.type)) return { sheets: [{ ten: 'CSV' }], doc: function () { return Promise.resolve(docCsv(giaiMaChu(buf))); } };
          return moXlsx(buf);
        }).then(function (mo) {
          st.mo = mo;
          st.file = { ten: ten, ngay: ME.isoVN(f.lastModified || Date.now()).slice(0, 10) };
          st.ngayFile = st.file.ngay > ME.homNay() ? ME.homNay() : st.file.ngay;
          st.sheet = 0;
          return docSheet().then(dong, function (e) { dong(); throw e; });
        }).catch(function (e) { dong(); ME.baoLoi(e && e.vi ? e : ME.loiMoi('TEP_LA')); });
      }
      function docSheet() {
        return st.mo.doc(st.sheet).then(function (dong) {
          if (!dong.length) throw ME.loiMoi('TEP_TRONG');
          st.dauI = timTieuDe(dong);
          st.tieuDe = dong[st.dauI].o.map(function (v, i) { return String(v === undefined ? '' : v).trim() || ('Cột ' + (i + 1)); });
          st.dong = dong.slice(st.dauI + 1);
          if (!st.dong.length) throw ME.loiMoi('TEP_TRONG');
          const d = doanGhep(st.tieuDe);
          st.ghep = d.ghep;
          st.daLuu = d.daLuu;
          st.suaGhep = !d.daLuu;
          tinh();
        });
      }
      function tinh() {
        st.kq = st.ghep.MaLK >= 0 ? xemTruoc(st.dong, st.ghep) : null;
        st.buoc = st.kq ? 3 : 2;
        ve();
      }
      function theFile() {
        const sheetChon = st.mo.sheets.length > 1 ? ME.ui.chonO(st.mo.sheets.map(function (s, i) { return { gt: i, vi: s.ten, zh: '' }; }), {
          giaTri: st.sheet, trong: false, onChange: function (v) { st.sheet = Number(v); const d = ME.ui.choXuLy('nk.dangDoc'); docSheet().then(d, function (e) { d(); ME.baoLoi(e); }); }
        }) : null;
        const ngay = ME.ui.oNhap({ type: 'date', value: st.ngayFile, max: ME.homNay(), id: 'nk-ngay' });
        ngay.addEventListener('change', function () { st.ngayFile = ngay.value || ME.homNay(); });
        const sheetTen = st.mo.sheets[st.sheet].ten;
        return h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:12px' },
          h('div', { style: 'display:flex;align-items:center;gap:12px' },
            h('span', { class: 'bieu-tuong b44 xl' }, ME.ic('tepCheck', 22, 1.8)),
            h('div', { style: 'flex-grow:1;min-width:0;line-height:1.35' },
              h('div', { style: 'font-size:14px;font-weight:600;overflow-wrap:anywhere' }, st.file.ten),
              h('div', { class: 'ghi-chu' }, h('span', { class: 'vi' }, ME.tv('nk.thongTinFile', { n: st.dong.length, sheet: sheetTen, ngay: ME.ngayVi(st.file.ngay) })),
                h('span', { class: 'zh' }, ME.tz('nk.thongTinFile', { n: st.dong.length, sheet: sheetTen, ngay: ME.ngayZh(st.file.ngay) })))),
            st.dangGhi ? null : h('button', { type: 'button', class: 'lien-ket-phai', onClick: function () { inpFile.click(); } }, ME.L('nk.doiFile'))),
          sheetChon ? ME.ui.truong('nk.sheet', sheetChon) : null,
          ME.ui.truong('nk.ngayFile', ngay, true, 'nk-ngay'));
      }
      function theGhep() {
        const luoi = h('div', { class: 'luoi-ghep' },
          h('div', { class: 'dau-cot' }, ME.L('nk.cotFile')), h('div', { class: 'dau-cot' }, ME.L('nk.truongApp')));
        TRUONG_FILE.forEach(function (t) {
          const nt = ME.t(t.nhan);
          let trai;
          if (st.suaGhep) {
            trai = ME.ui.chonO(st.tieuDe.map(function (x, i) { return { gt: i, vi: x, zh: '' }; }), {
              giaTri: st.ghep[t.k] >= 0 ? st.ghep[t.k] : '', nhanTrong: 'nk.khongLay',
              onChange: function (v) { st.ghep[t.k] = v === '' ? -1 : Number(v); st.daLuu = false; tinh(); }
            });
            trai = h('div', { class: 'o-cot' }, trai);
          } else trai = h('div', { class: 'o-cot dam' }, st.ghep[t.k] >= 0 ? st.tieuDe[st.ghep[t.k]] : '—');
          luoi.appendChild(trai);
          luoi.appendChild(h('div', { class: 'o-cot' }, ME.L2(nt.vi + (t.batBuoc ? ' *' : ''), nt.zh)));
        });
        return h('section', { class: 'the' },
          h('div', { style: 'display:flex;align-items:flex-start;gap:10px;margin-bottom:6px' },
            ME.ic(st.daLuu ? 'checkTron' : 'gop', 20, 2, { style: 'color:' + (st.daLuu ? '#0B6234' : '#1B365D') + ';flex-shrink:0;margin-top:2px' }),
            h('div', { class: 'tieu-the', style: 'flex-grow:1' }, ME.L(st.daLuu && !st.suaGhep ? 'nk.dungGhepCu' : 'nk.ghepCot'),
              st.suaGhep ? h('div', { class: 'ghi-chu', style: 'margin-top:4px' }, ME.L('nk.ghepMoi')) : null),
            st.suaGhep || st.dangGhi ? null : h('button', { type: 'button', class: 'lien-ket-phai', onClick: function () { st.suaGhep = true; ve(); } }, ME.L('chung.sua'))),
          luoi,
          st.ghep.MaLK < 0 ? ME.ui.loiTruong(ME.t('nk.thieuMaCot')) : null);
      }
      function theSo() {
        const kq = st.kq;
        const o = function (n, khoa, mau) { return h('div', null, h('div', { class: 'so-tk', style: 'color:' + mau }, ME.soVi(n)), h('div', { class: 'chu' }, ME.L(khoa))); };
        return [h('section', { class: 'luoi-tk' },
          o(kq.moi.length, 'nk.moi', '#1B365D'), o(kq.doiTon.length, 'nk.doiTon', '#B54708'),
          o(kq.khongDoi, 'nk.khongDoi', '#344054'), o(kq.khongCon, 'nk.khongCon', '#A3141D')),
        kq.doiKhac ? h('div', { class: 'ghi-chu', style: 'padding:0 4px' }, ME.L('nk.doiKhac', { n: kq.doiKhac })) : null];
      }
      function theLoi() {
        const kq = st.kq;
        if (!kq.loi.length) return null;
        return h('section', { class: 'hop-loi' },
          h('div', { style: 'display:flex;align-items:flex-start;gap:10px;color:#A3141D' }, ME.ic('canhBaoTron', 20, 2, { style: 'flex-shrink:0' }),
            h('div', { class: 'tieu-the' }, h('h2', { class: 'vi', style: 'color:#A3141D' }, ME.tv('nk.dongLoi', { n: kq.loi.length })), h('span', { class: 'zh', style: 'color:#A3141D' }, ME.tz('nk.dongLoi', { n: kq.loi.length })))),
          h('ul', { style: 'list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:6px' },
            kq.loi.slice(0, 5).map(function (l) { const x = chuLoi(l); return h('li', { class: 'dong-loi' }, ME.L2(x.vi, x.zh)); })),
          h('button', {
            type: 'button', class: 'lien-ket-phai', style: 'display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:6px;text-align:left',
            onClick: function () {
              const dong = [['Dòng · 行', 'Mã · 料号', 'Lỗi', '错误']].concat(kq.loi.map(function (l) { const x = chuLoi(l); return [l.dong, l.ma, x.vi, x.zh]; }));
              ME.taiTep('loi-' + st.file.ten.replace(/\.[^.]+$/, '') + '.csv', ME.csv(dong));
            }
          }, ME.ic('taiXuong', 18, 2), h('span', null, ME.L('nk.taiLoi'))));
      }
      function theDoi() {
        const kq = st.kq;
        const vung = h('section', { class: 'the', style: 'padding:14px 14px 4px' }, ME.ui.theTieuDe('nk.xemTruoc'));
        if (!kq.doiTon.length) { vung.appendChild(h('div', { class: 'ghi-chu', style: 'padding:10px 0' }, ME.L('nk.khongThayDoi'))); return vung; }
        const dongDoi = function (d) {
          const chenh = (d.den || 0) - (d.tu || 0);
          return h('div', { class: 'dong-doi' },
            h('div', { class: 'giua' }, ME.L2(d.cu.TenVi || d.x.MaLK, d.cu.TenZh), h('div', { class: 'ma' }, d.x.MaLK)),
            h('div', { class: 'so-doi' }, h('span', { style: 'color:#667085' }, d.tu === null ? '–' : ME.soVi(d.tu)), ME.ic('muiTenPhai', 14, 2, { style: 'color:#98A2B3' }),
              h('span', null, d.den === null ? '–' : ME.soVi(d.den)),
              h('span', { class: 'chenh', style: chenh >= 0 ? 'background:#E3F6EB;color:#0B6234' : 'background:#FDECEC;color:#A3141D' }, (chenh >= 0 ? '+' : '−') + ME.soVi(Math.abs(chenh)))));
        };
        const ds = kq.doiTon.slice().sort(function (a, b) { return Math.abs((b.den || 0) - (b.tu || 0)) - Math.abs((a.den || 0) - (a.tu || 0)); });
        const goc = h('div');
        ds.slice(0, 3).forEach(function (d) { goc.appendChild(dongDoi(d)); });
        vung.appendChild(goc);
        if (ds.length > 3) {
          const nut = h('button', {
            type: 'button', class: 'lien-ket-phai', style: 'width:100%;text-align:center;min-height:48px;border-top:1px solid #EAECF0',
            onClick: function () { nut.remove(); ME.ui.dsDai(ds.slice(3), dongDoi, 100, goc); }
          }, ME.L('nk.xemTatCa', { n: ds.length }));
          vung.appendChild(nut);
        }
        return vung;
      }
      function veNut() {
        ME.xoaCon(thanhNut);
        thanhNut.hidden = !st.kq || st.dangGhi || st.buoc === 4;
        if (thanhNut.hidden) return;
        thanhNut.appendChild(h('div', { class: 'hai-nut' },
          h('button', { type: 'button', class: 'nut-phu', onClick: function () { ME.quayLai('/kho'); } }, ME.L('chung.huy')),
          h('button', { type: 'button', class: 'nut-chinh', disabled: !st.kq.hopLe.length, onClick: ghi }, ME.L('nk.xacNhan'))));
      }
      function ve() {
        veBuoc();
        ME.xoaCon(than);
        if (!st.file) {
          than.appendChild(h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:12px' },
            h('button', { type: 'button', class: 'o-anh', style: 'height:120px', onClick: function () { inpFile.click(); } }, ME.ic('tepLen', 28, 1.8), ME.L('nk.chonFile')),
            h('div', { class: 'ghi-chu' }, ME.L('nk.chonFileGoiY'))));
        } else {
          than.appendChild(theFile());
          than.appendChild(theGhep());
          if (st.kq) {
            ME.them(than, theSo());
            const l = theLoi();
            if (l) than.appendChild(l);
            than.appendChild(theDoi());
            than.appendChild(h('section', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('nk.ghiChu'))));
          }
        }
        veNut();
      }
      // ── Bước 4: ghi lên máy chủ theo gói ──
      function ghi() {
        if (!ME.coMang()) { ME.hoi({ loiNhan: 'chung.canMang' }); return; }
        const kq = st.kq;
        const goi = Math.max(50, Math.min(2000, Number(ME.cauHinh('GOI_NHAP_KHO_DONG')) || 500));
        const ds = kq.gui;
        const soGoi = Math.max(1, Math.ceil(ds.length / goi));
        const ghepCot = st.daLuu ? null : TRUONG_FILE.filter(function (t) { return st.ghep[t.k] >= 0; }).map(function (t) {
          return { TruongApp: t.k, CotFile: st.tieuDe[st.ghep[t.k]], BatBuoc: t.k === 'MaLK' };
        });
        st.dangGhi = true;
        st.buoc = 4;
        veBuoc();
        veNut();
        const tienDo = h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' });
        const capNhatTD = function (khoa, ts, phan) {
          ME.xoaCon(tienDo);
          ME.them(tienDo, [h('div', { class: 'tieu-the' }, ME.L(khoa, ts)), ME.ui.thanhTien(phan, soGoi + 1),
            kq.moi.length ? h('div', { class: 'ghi-chu' }, ME.L('nk.dichCham')) : null]);
        };
        ME.xoaCon(than);
        than.appendChild(theFile());
        than.appendChild(tienDo);
        capNhatTD('nk.dangBatDau', null, 0);
        let maLan = '';
        const tk = { moi: 0, doi: 0, khongDoi: 0, loi: 0 };
        const guiGoi = function (i, lan) {
          if (i > soGoi) return Promise.resolve();
          capNhatTD('nk.dangGhi', { i: i, n: soGoi }, i - 1);
          return ME.api.goi('nhapKhoGoi', { maLan: maLan, soGoi: i, dong: ds.slice((i - 1) * goi, i * goi) }, { thoiGian: 330000 }).then(function (d) {
            tk.moi += d.moi || 0; tk.doi += d.doi || 0; tk.khongDoi += d.khongDoi || 0; tk.loi += d.soLoi || 0;
            return guiGoi(i + 1, 0);
          }, function (e) {
            if (ME.laLoiMang(e) && lan < 3) return ME.ngu(2000 * (lan + 1)).then(function () { return guiGoi(i, lan + 1); });
            e.goi = i;
            throw e;
          });
        };
        const ketThuc = function () {
          capNhatTD('nk.dangKetThuc', null, soGoi);
          return ME.api.goi('nhapKhoKetThuc', { maLan: maLan, dsMa: kq.dsMa }, { thoiGian: 300000 });
        };
        const batDau = function () {
          return ME.api.goi('nhapKhoBatDau', { tenFile: st.file.ten, ngayFile: st.ngayFile, tongDong: Math.max(1, ds.length), soGoi: soGoi, ghepCot: ghepCot || undefined }, { thoiGian: 90000 })
            .then(function (d) { maLan = d.maLan; });
        };
        const chay = function (tuGoi) {
          const p = tuGoi ? guiGoi(tuGoi, 0) : batDau().then(function () { return guiGoi(1, 0); });
          return p.then(ketThuc).then(function (d) { st.dangGhi = false; ketQua(d); }, function (e) {
            if (ME.laLoiPhien(e)) return;
            ME.xoaCon(tienDo);
            const x = ME.loiChu(e);
            ME.them(tienDo, [h('div', { class: 'hop-cb do' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L2(x.vi, x.zh))),
              maLan && e.goi ? h('div', { class: 'ghi-chu' }, ME.L('nk.dungGiua', { i: e.goi })) : null,
              h('button', { type: 'button', class: 'nut-chinh', onClick: function () { chay(maLan ? (e.goi || soGoi + 1) : 0); } }, ME.L(maLan ? 'nk.guiTiep' : 'chung.thuLai'))]);
            if (maLan && !e.goi && e.ma === 'NHAP_KHO_THIEU_GOI' && e.chiTiet && e.chiTiet.goi) {
              // Máy chủ báo thiếu gói: gửi lại đúng các gói đó.
              const thieu = e.chiTiet.goi.slice();
              const guiLai = function () {
                if (!thieu.length) return Promise.resolve();
                const g = thieu.shift();
                return ME.api.goi('nhapKhoGoi', { maLan: maLan, soGoi: g, dong: ds.slice((g - 1) * goi, g * goi) }, { thoiGian: 330000 }).then(guiLai);
              };
              ME.xoaCon(tienDo);
              capNhatTD('nk.dangKetThuc', null, soGoi);
              guiLai().then(ketThuc).then(function (d) { st.dangGhi = false; ketQua(d); }, function (e2) { ME.baoLoi(e2); });
            }
          });
        };
        chay(0);
      }
      function ketQua(d) {
        ME.dongBo();
        ME.xoaCon(than);
        const o = function (n, khoa, mau) { return h('div', null, h('div', { class: 'so-tk', style: 'color:' + mau }, ME.soVi(n || 0)), h('div', { class: 'chu' }, ME.L(khoa))); };
        than.appendChild(h('div', { class: 'hop-cb xanh' }, ME.ic('checkTron', 20, 2), h('div', { class: 'chu' }, ME.L('nk.xong'))));
        than.appendChild(h('section', { class: 'luoi-tk' }, o(d.moi, 'nk.kqMoi', '#1B365D'), o(d.thayDoi, 'nk.kqDoi', '#B54708'), o(d.khongDoi, 'nk.kqKhongDoi', '#344054'),
          o(d.vangMat, 'nk.kqVang', '#A3141D')));
        const vungLoi = theLoi();
        if (vungLoi) than.appendChild(vungLoi);
        if (d.moi) than.appendChild(h('div', { class: 'hop-tin' }, ME.ic('dich', 20, 2), h('div', { class: 'chu' }, ME.L('nk.dichMay'))));
        if (d.chuaDich) than.appendChild(h('div', { class: 'hop-cb' }, ME.ic('dich', 20, 2), h('div', { class: 'chu' }, ME.L('nk.chuaDich', { n: d.chuaDich }))));
        if (d.goiYGop && d.goiYGop.length && ME.co('DUYET_LINH_KIEN')) {
          const vung = h('section', { class: 'the' }, ME.ui.theTieuDe('nk.goiYGop'), h('div', { class: 'ghi-chu', style: 'margin:4px 0 6px' }, ME.L('nk.goiYGopGiai')));
          d.goiYGop.forEach(function (g) {
            const nut = h('button', { type: 'button', class: 'nut-vien', onClick: function () { gop(g.maTam, g.maChinhThuc, function () { nut.disabled = true; }); } }, h('span', null, ME.L('nk.gop')));
            vung.appendChild(h('div', { class: 'dong-doi' }, h('div', { class: 'giua' }, h('span', { class: 'vi' }, g.maTam + ' → ' + g.maChinhThuc), h('div', { class: 'ma' }, g.theo)), nut));
          });
          than.appendChild(vung);
        }
        than.appendChild(h('a', { class: 'nut-chinh', href: '#/kho', onClick: function (e) { e.preventDefault(); ME.di('/kho', true); } }, ME.L('nk.veKho')));
      }
      ve();
      return h('div', { class: 'trang' },
        ME.ui.dau({
          tieuDe: 'nk.tieuDe', nho: true,
          quayLai: function () {
            if (st.dangGhi) return;
            if (st.kq) {
              ME.hoi({ loiNhan: 'nk.huyHoi', nut: [{ nhan: 'chung.xacNhan', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true }).then(function (ok) { if (ok) ME.quayLai('/kho'); });
            } else ME.quayLai('/kho');
          }
        }),
        h('main', { class: 'noi-dung' }, vungBuoc, than, inpFile),
        thanhNut);
    }
  });

  // ═════════ Lịch sử cập nhật file ═════════
  ME.tuyen('/kho/lich-su', {
    ve: function () {
      const ds = ME.du.ds('LanNhapKho').slice().sort(function (a, b) { return String(a.BatDau) < String(b.BatDau) ? 1 : -1; });
      const mau = { HOAN_TAT: 'xanh', DANG_NHAP: 'cam', LOI: 'do' };
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'ls.tieuDe', quayLai: '/kho', nho: true }),
        h('main', { class: 'noi-dung' }, ds.length ? h('section', { class: 'the', style: 'padding:4px 14px' }, ds.map(function (r) {
          const t = ME.dmTen('TRANG_THAI_LAN_NHAP', r.TrangThai);
          const tk = [['ls.dong', r.TongDong], ['ls.moi', r.Moi], ['ls.doi', r.ThayDoi], ['ls.khongDoi', r.KhongDoi], ['ls.vang', r.VangMat], ['ls.loi', r.Loi]];
          const dongTK = function (f) { return tk.map(function (x) { return f(x[0], { n: Number(x[1]) || 0 }); }).join(' · '); };
          return h('div', { class: 'dong-hang' },
            h('span', { class: 'bieu-tuong b34' }, ME.ic('tep', 18, 1.8)),
            h('div', { class: 'giua' }, h('span', { class: 'vi', style: 'overflow-wrap:anywhere' }, r.TenFile),
              h('div', { class: 'phu' }, ME.ngayVi(r.NgayFile) + ' · ' + ME.tenNguoi(r.NguoiNhap) + ' · ' + ME.ngayGioVi(r.BatDau)),
              h('div', { class: 'phu' }, dongTK(ME.tv)),
              h('div', { class: 'phu zh' }, dongTK(ME.tz))),
            ME.ui.nhanTT(t.vi || r.TrangThai, t.zh, mau[r.TrangThai] || 'xam'));
        })) : ME.ui.trong('ls.trong', null, 'lichSu')));
    },
    tuLamMoi: true
  });

  // ═════════ Chi tiết linh kiện ═════════
  function manKhongThayLK(ma) {
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'lk.chiTiet', quayLai: '/kho' }),
      h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('lk.khongThay', { ma: ma })))));
  }
  function gop(maTam, maChinh, xong) {
    ME.hoi({ tieuDe: 'lk.gop', loiNhan: ME.t('lk.gopHoi', { tam: maTam, chinh: maChinh }), nut: [{ nhan: 'nk.gop', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true })
      .then(function (ok) {
        if (!ok) return;
        ME.goiMang('gopMaTam', { maTam: maTam, maChinhThuc: maChinh }).then(function () {
          ME.thongBao('lk.daGop', null, { tam: maTam, chinh: maChinh });
          if (xong) xong();
          return ME.dongBo();
        }).catch(ME.boQua);
      });
  }
  function veChiTietLK(ma) {
    const r = ME.layLK(ma);
    if (!r) return manKhongThayLK(ma);
    const tt = ME.ttTon(r);
    const dv = dvHaiDong(r.DVT);
    const coSua = ME.co('SUA_LINH_KIEN');
    const nut = [];
    if (r.TrangThaiDuyet === 'CHO_DUYET' && ME.co('DUYET_LINH_KIEN')) {
      nut.push(h('button', {
        type: 'button', class: 'nut-chinh n14', onClick: function () {
          ME.luuQuaHang('duyetLinhKien', { maLK: r.MaLK }, { vi: ME.tv('lk.duyet') + ' ' + r.MaLK, zh: ME.tz('lk.duyet') + ' ' + r.MaLK })
            .then(function (kq) { if (kq.ok) ME.thongBao('lk.daDuyet'); ME.veLai(); }).catch(ME.boQua);
        }
      }, ME.L('lk.duyet')));
    }
    if (r.DichMay === true && coSua) {
      nut.push(h('button', {
        type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
          const o = ME.ui.oNhap({ value: r.TenZh || '', lang: 'zh-Hans' });
          ME.hoi({ tieuDe: 'lk.duyetDich', noiDung: h('div', null, h('div', { class: 'ghi-chu', style: 'margin-bottom:8px' }, ME.L2(r.TenVi, '')), o),
            nut: [{ nhan: 'kho.dung', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true }).then(function (ok) {
            if (!ok || !o.value.trim()) return;
            const lk = { MaLK: r.MaLK, duyetDich: true };
            if (o.value.trim() !== r.TenZh) lk.TenZh = o.value.trim();
            ME.luuQuaHang('suaLinhKien', { lk: lk }, { vi: ME.tv('lk.duyetDich') + ' ' + r.MaLK, zh: ME.tz('lk.duyetDich') + ' ' + r.MaLK })
              .then(function (kq) { if (kq.ok) ME.thongBao('kho.daDuyetDich'); ME.veLai(); }).catch(ME.boQua);
          });
        }
      }, ME.ic('dich', 18, 2), h('span', null, ME.L('lk.duyetDich'))));
    }
    if (laMaTam(r.MaLK) && ME.co('DUYET_LINH_KIEN')) {
      nut.push(h('button', {
        type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
          ME.chonTu({
            tieuDe: 'lk.gopChon', timKiem: true,
            ds: ME.du.ds('KhoLinhKien').filter(function (x) { return !laMaTam(x.MaLK); }).sort(function (a, b) { return String(a.MaLK).localeCompare(String(b.MaLK), 'vi', { numeric: true }); })
              .map(function (x) { return { gt: x.MaLK, vi: x.TenVi || x.MaLK, zh: x.TenZh || '', phu: x.MaLK + (x.QuyCach ? ' · ' + x.QuyCach : '') + (x.MaNSX ? ' · ' + x.MaNSX : '') }; })
          }).then(function (gt) { if (gt) gop(r.MaLK, gt, function () { ME.di('/kho/' + enc(gt), true); }); });
        }
      }, ME.ic('gop', 18, 2), h('span', null, ME.L('lk.gop'))));
    }
    if (ME.co('DE_XUAT_LINH_KIEN')) {
      nut.push(h('button', {
        type: 'button', class: 'nut-vien', style: 'width:100%', onClick: function () {
          const daGan = {};
          (ME.du.theo('LinhKienTB', 'MaLK').get(r.MaLK) || []).forEach(function (x) { daGan[x.MaTB] = true; });
          ME.chonTu({
            tieuDe: 'lk.ganChonMay', timKiem: true,
            ds: ME.dsTB().filter(function (x) { return !daGan[x.MaTB]; }).sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); })
              .map(function (x) { return { gt: x.MaTB, vi: x.MaTB + ' · ' + x.TenVi, zh: x.TenZh || '' }; })
          }).then(function (gt) { if (gt) ME.di('/tb/' + enc(gt) + '/gan?chon=' + enc(r.MaLK)); });
        }
      }, ME.ic('banhRang', 18, 2), h('span', null, ME.L('lk.ganMay'))));
    }
    const lien = (ME.du.theo('LinhKienTB', 'MaLK').get(r.MaLK) || []).slice().sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); });
    const txt = function (v) { return v === undefined || v === null || v === '' ? null : { vi: String(v), zh: '' }; };
    const dong = function (k, x) { return x ? ME.ui.dongTT(k, x.vi, x.zh) : ME.ui.dongTT(k, '—', '', true); };
    const anh = r.AnhId ? h('a', { href: ME.anhUrl(r.AnhId, 1600), target: '_blank', rel: 'noopener' }, ME.ui.oAnhNho(r.AnhId, ME.icLK(r.NhomLK), 'b44', 22)) : ME.ui.oAnhNho('', ME.icLK(r.NhomLK), 'b44', 22);
    const nhanPhu = [];
    if (r.TrangThaiDuyet === 'CHO_DUYET') nhanPhu.push(ME.ui.nhanTTK('kho.choDuyet', 'tim'));
    if (r.Nguon === 'THU_CONG') nhanPhu.push(ME.ui.nhanTTK(laMaTam(r.MaLK) ? 'kho.thuCongTam' : 'kho.thuCong', 'tim'));
    if (r.TrangThaiFile === 'KHONG_CON') nhanPhu.push(ME.ui.nhanTT(ME.tv('kho.khongConTu', { ngay: ME.ngayVi(r.NgayFile, true) }), ME.tz('kho.khongConTu', { ngay: ME.ngayZh(r.NgayFile, true) }), 'xam'));
    if (r.DichMay === true) nhanPhu.push(ME.ui.nhanTTK('kho.tenMayDich', 'xam'));
    if (r._cho) nhanPhu.push(ME.ui.nhanTTK('chung.choGui', 'cam'));
    return h('div', { class: 'trang' },
      ME.ui.dau({ tieuDe: 'lk.chiTiet', nho: true, quayLai: '/kho', phai: coSua ? ME.ui.nutIcon('but', 'lk.sua', '/kho/' + enc(r.MaLK) + '/sua', 'phai') : null }),
      h('main', { class: 'noi-dung' },
        h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:12px' },
          h('div', { style: 'display:flex;gap:12px;align-items:flex-start' }, anh,
            h('div', { style: 'flex-grow:1;min-width:0;line-height:1.35' },
              h('div', { style: 'font-size:16px;font-weight:700' }, r.TenVi || r.MaLK),
              r.TenZh ? h('div', { style: 'font-size:13px;color:#475467', lang: 'zh-Hans' }, r.TenZh) : null,
              h('div', { style: 'font-size:12.5px;color:#667085;margin-top:4px' }, r.MaLK + (r.ViTriKho ? ' · ' + r.ViTriKho : ''))),
            h('div', { class: 'ton-phai' }, h('div', { class: 'so-ton ' + (tt.ma === 'het' ? 'so-do' : (tt.ma === 'duoiMin' ? 'so-cam' : '')) }, tt.ma === 'chuaCo' ? '–' : ME.soVi(r.TonKho)),
              ME.L('kho.ton', { dv: dv }))),
          h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' }, ME.ui.nhanTTK(tt.nhan, tt.mau), nhanPhu),
          nut.length ? h('div', { style: 'display:flex;flex-direction:column;gap:8px' }, nut) : null),
        h('section', { class: 'the', style: 'padding:6px 14px 4px' }, h('dl', { class: 'ds-tt' },
          dong('lk.quyCach', txt(r.QuyCach)),
          dong('lk.dvt', r.DVT ? { vi: r.DVT, zh: ME.dvtZh(r.DVT) } : null),
          dong('lk.nhom', r.NhomLK ? ME.dmTen('NHOM_LK', r.NhomLK) : null),
          dong('lk.maNSX', txt(r.MaNSX)),
          dong('lk.viTri', txt(r.ViTriKho)),
          dong('lk.tonMin', r.TonToiThieu !== '' && r.TonToiThieu !== undefined && r.TonToiThieu !== null ? { vi: ME.soVi(r.TonToiThieu) + ' ' + dv[0], zh: ME.soZh(r.TonToiThieu) + dv[1] } : null),
          ME.co('XEM_DON_GIA') ? dong('lk.donGia', r.DonGia !== '' && r.DonGia !== undefined && r.DonGia !== null ? { vi: ME.soVi(r.DonGia) + ' đ', zh: ME.soZh(r.DonGia) + ' 越南盾' } : null) : null,
          dong('lk.nguon', r.Nguon ? ME.dmTen('NGUON_LK', r.Nguon) : null),
          r.NgayFile ? dong('lk.ngayFile', { vi: ME.ngayVi(r.NgayFile), zh: ME.ngayZh(r.NgayFile) }) : null,
          r.GhiChu ? dong('chung.ghiChu', txt(r.GhiChu)) : null)),
        h('section', { class: 'the', style: 'padding:14px 14px 4px' }, ME.ui.theTieuDe('lk.dungChoMay'),
          lien.length ? h('div', { style: 'margin-top:6px' }, lien.map(function (x) {
            const tb = ME.layTB(x.MaTB) || { MaTB: x.MaTB, TenVi: '' };
            return h('a', { class: 'dong-qt', href: '#/tb/' + enc(x.MaTB) + '/lk' },
              h('span', { class: 'bieu-tuong b40' }, ME.ic(ME.icTB(tb.LoaiTB), 20, 1.8)),
              h('div', { class: 'giua' }, ME.L2(tb.TenVi || x.MaTB, tb.TenZh), h('div', { class: 'phu' }, x.MaTB + ' · ' + ME.tv('lk.lap', { n: Number(x.SoLuongLap) || 1 }))),
              x.TrangThaiDuyet === 'CHO_DUYET' ? ME.ui.nhanTTK('kho.choDuyet', 'tim') : ME.nhanTB(tb.TrangThai));
          })) : h('div', { class: 'ghi-chu', style: 'padding:10px 0' }, ME.L('lk.chuaGanMay')))));
  }
  ME.tuyen('/kho/:ma', { ve: function (ts) { return veChiTietLK(ts.ma); }, capNhat: function (el, loai) { if (loai !== 'dong-bo') ME.veLai(); } });
  ME.tuyen('/kho/:ma/sua', { ve: function (ts) { return formLK(ts.ma, {}); } });
})();

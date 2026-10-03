/* ME – Quản lý Cơ điện · 机电管理系统
   man-dien-nuoc.js — Điện nước – Tổng quan (bản vẽ 10), Ghi chỉ số (bản vẽ 11), Chi tiết công tơ (bản vẽ 12),
   danh sách công tơ, thêm / sửa công tơ, thay công tơ, bảng giá.
   Số tổng hợp lấy từ máy chủ khi có mạng (đủ 12 tháng); mất mạng thì tính ngay trên máy (chi-so.js). */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;
  const enc = encodeURIComponent;
  const dn = ME.dn;

  ME.nhan('Điện nước', {
    'dn.tieuDe': ['Điện nước', '水电能源'],
    'dn.dsCongTo': ['Danh sách công tơ', '电表清单'],
    'dn.ghiChiSo': ['Ghi chỉ số', '抄表'],
    'dn.thang': ['Tháng {m}/{y}', '{y}年{m}月'],
    'dn.chonThang': ['Chọn tháng', '选择月份'],
    'dn.dienThang': ['Điện tháng {m}', '{m}月用电'],
    'dn.nuocThang': ['Nước tháng {m}', '{m}月用水'],
    'dn.tang': ['▲ {pt}% so tháng {m}', '较{m}月上升'],
    'dn.giam': ['▼ {pt}% so tháng {m}', '较{m}月下降'],
    'dn.tangCK': ['▲ {pt}% so cùng kỳ T{m}', '较{m}月同期上升'],
    'dn.giamCK': ['▼ {pt}% so cùng kỳ T{m}', '较{m}月同期下降'],
    'dn.bang': ['Bằng tháng {m}', '与{m}月持平'],
    'dn.chuaSoSanh': ['Chưa có số tháng {m} để so', '暂无{m}月数据可比'],
    'dn.thang12': ['12 tháng gần nhất', '近12个月'],
    'dn.thang12CanMang': ['Xu hướng 12 tháng cần mạng', '12个月趋势需要联网'],
    'dn.chiPhi': ['Chi phí ước tính tháng {m}', '{m}月预估费用'],
    'dn.chiPhiTach': ['điện {d} · nước {n}', '电 {d} · 水 {n}（百万越南盾）'],
    'dn.thieuGia': ['Thiếu đơn giá một số ngày – chưa tính đủ', '部分日期缺少单价，费用未完全计算'],
    'dn.ghiHomNay': ['Ghi chỉ số hôm nay', '今日抄表'],
    'dn.conCT': ['Còn {n} công tơ{han}', '还有{n}个未抄{han}'],
    'dn.han': [' · hạn {gio}', ' · 截止{gio}'],
    'dn.daDu': ['Đã ghi đủ hôm nay', '今日已全部抄完'],
    'dn.ghiTiep': ['Ghi tiếp', '继续抄表'],
    'dn.theoNgay': ['Tiêu thụ theo ngày', '每日用量 · {m}月'],
    'dn.ngayVuot': ['{n} ngày vượt định mức', '{n}天超定额'],
    'dn.dien': ['Điện', '电'],
    'dn.nuoc': ['Nước', '水'],
    'dn.vuotDM': ['vượt định mức {pt}%', '超出定额'],
    'dn.trongDM': ['trong định mức', '定额内'],
    'dn.gopNgay': ['gộp nhiều ngày', '合并计算'],
    'dn.chuaCoSo': ['chưa có số', '暂无数据'],
    'dn.dinhMucNhan': ['Định mức', '定额'],
    'dn.trongDinhMuc': ['Trong định mức', '定额内'],
    'dn.vuotDinhMuc': ['Vượt định mức', '超定额'],
    'dn.dinhMucNgay': ['Định mức {so} {dv}/ngày', '每日定额'],
    'dn.tieuThu': ['Tiêu thụ', '用量'],
    'dn.chamCot': ['Chạm vào cột để xem ngày đó', '点击柱子查看当天数值'],
    'dn.xemBang': ['Xem bảng số', '查看数据表'],
    'dn.xemBieuDo': ['Xem biểu đồ', '查看图表'],
    'dn.khungGio': ['Điện theo khung giờ', '分时电量 · {m}月'],
    'dn.thapDiem': ['Thấp điểm', '谷段'],
    'dn.binhThuong': ['Bình thường', '平段'],
    'dn.caoDiem': ['Cao điểm', '峰段'],
    'dn.khongChia': ['Công tơ 1 giá (không chia giờ)', '单费率电表（不分时段）'],
    'dn.theoKV': ['{loai} theo khu vực', '各区域{loaiZh} · {m}月 · {dv}'],
    'dn.khac': ['Khác, chưa đo', '其他·未计量'],
    'dn.khacGiai': ['Khác = công tơ tổng trừ tổng các công tơ nhánh', '其他 = 总表减各分表之和'],
    'dn.chuaKV': ['Chưa xếp khu vực', '未分区域'],
    'dn.congToVaDH': ['Công tơ và đồng hồ nước', '电表与水表'],
    'dn.xemCa': ['Xem cả {n}', '查看全部{n}个'],
    'dn.daGhi': ['Đã ghi {gio}', '已抄'],
    'dn.chuaGhi': ['Chưa ghi', '未抄'],
    'dn.ngung': ['Ngừng', '停用'],
    'dn.cucBo': ['Đang mất mạng: số tính trên máy từ dữ liệu khoảng 2 tháng gần nhất.', '离线：根据本机近2个月数据计算。'],
    'dn.canMangThang': ['Tháng này không còn dữ liệu trên máy. Cần có mạng để xem.', '本机已无该月数据，需要联网查看。'],
    'dn.dangTaiSo': ['Đang lấy số từ máy chủ…', '正在从服务器获取数据…'],
    'dn.soLuc': ['Số máy chủ tính lúc {gio}', '服务器计算时间 {gio}'],
    'dn.chuaCoCongTo': ['Chưa khai báo công tơ nào.', '尚未添加电表。'],
    'dn.themCongTo': ['Thêm công tơ', '新增电表'],
    'dn.bangNgay': ['Ngày', '日期'],
    // Ghi chỉ số
    'gs.tieuDe': ['Ghi chỉ số', '抄表'],
    'gs.daGhiSo': ['Đã ghi {a} / {b}', '已抄 {a}/{b}'],
    'gs.quetCT': ['Quét QR công tơ', '扫电表二维码'],
    'gs.chonKhac': ['Chọn công tơ khác', '选择其他电表'],
    'gs.lanTruoc': ['Lần trước: {luc} · {nguoi}', '上次抄表：{luc}'],
    'gs.lanDau': ['Lần ghi đầu tiên của công tơ này – chưa tính tiêu thụ.', '此电表首次抄表，不计算用量。'],
    'gs.chiSoMoi': ['Chỉ số mới', '新读数'],
    'gs.gioGhi': ['Giờ ghi {luc}', '抄表时间'],
    'gs.lanTruocO': ['Lần trước', '上次读数'],
    'gs.chiSo': ['Chỉ số', '读数'],
    'gs.tongHomNay': ['Tổng hôm nay', '今日合计'],
    'gs.tongNNgay': ['Tổng {n} ngày (gộp)', '{n}天合计（合并）'],
    'gs.tb': ['TB {n} ngày {so}', '{n}日均值'],
    'gs.nghiSai': ['{khung} gấp {lan} lần trung bình {n} ngày ({tb} {dv}). Có thể nhập sai số – đối chiếu lại với ảnh mặt công tơ trước khi lưu.',
      '{khungZh}是{n}日均值（{tb} {dv}）的{lan}倍，可能输入错误，保存前请对照电表照片核对。'],
    'gs.tieuThuKhung': ['Tiêu thụ', '用量'],
    'gs.batThuong': ['Cao hơn trung bình {n} ngày {pt}% – sẽ gắn cờ Bất thường để tổ trưởng xem.', '比{n}日均值高{pt}%，将标记为异常供组长审核。'],
    'gs.vuotDM': ['Vượt định mức ngày {pt}%.', '超出每日定额{pt}%。'],
    'gs.gop': ['Gộp {n} ngày chưa ghi: tiêu thụ chia đều cho các ngày.', '合并{n}天未抄：用量平均分配到各天。'],
    'gs.quayVong': ['Công tơ đã quay về 0 – app tính phần vượt qua số tối đa.', '电表已归零，按满量程计算。'],
    'gs.nhoHon': ['Chỉ số {khung} ({moi}) nhỏ hơn lần trước ({truoc}). Kiểm tra lại số; nếu đã thay công tơ, báo quản lý dùng Thay công tơ.',
      '{khungZh}读数（{moi}）小于上次（{truoc}）。请核对；如已换表请通知主管使用“更换电表”。'],
    'gs.anh': ['Ảnh mặt công tơ', '电表读数照片'],
    'gs.ghiChuGoiY': ['VD: mất điện 2 giờ', '例：停电2小时'],
    'gs.luu': ['Lưu chỉ số', '保存读数'],
    'gs.luuKhiMatMang': ['Lưu được khi mất mạng', '断网也可保存'],
    'gs.tiepTheo': ['Tiếp theo: {ma}', '下一个：{ma}'],
    'gs.hetCT': ['Đây là công tơ cuối chưa ghi', '这是最后一个未抄电表'],
    'gs.daGhiHomNay': ['Công tơ này đã ghi hôm nay lúc {gio} ({nguoi}). Ghi thêm sẽ được hỏi lại.', '此电表今天{gio}已抄（{nguoi}）。再次抄表将需要确认。'],
    'gs.thieuAnh': ['Cần chụp ảnh mặt công tơ.', '需要拍摄电表读数照片。'],
    'gs.thieuSo': ['Nhập chỉ số {khung}.', '请输入{khungZh}读数。'],
    'gs.hoiNghiSai': ['Số này cao bất thường so với mọi ngày. Đã đối chiếu ảnh mặt công tơ và chắc chắn đúng?', '该读数明显高于平时，确认已对照电表照片且无误吗？'],
    'gs.hoiDaGhi': ['Công tơ này đã có lần ghi tính cho cùng ngày. Vẫn lưu thêm?', '此电表同一天已有抄表记录，仍要再保存一次吗？'],
    'gs.daLuu': ['Đã lưu {ma} · {so}', '已保存 {ma} · {so}'],
    'gs.ghiDu': ['Đã ghi đủ các công tơ hôm nay', '今日电表已全部抄完'],
    'gs.ctNgung': ['Công tơ {ma} không ở trạng thái đang dùng.', '电表{ma}不在使用中。'],
    'gs.khongCoCT': ['Chưa có công tơ đang dùng. Quản lý (cấp 1–2) thêm công tơ ở Điện nước → Công tơ.', '暂无使用中的电表。主管（1–2级）可在 水电 → 电表清单 中添加。'],
    'gs.khongThay': ['Không tìm thấy công tơ {ma}.', '未找到电表{ma}。'],
    'gs.chonCT': ['Chọn công tơ', '选择电表'],
    'gs.khongQuyen': ['Bạn chưa có quyền ghi chỉ số (cấp 1–4).', '您没有抄表权限（1–4级）。'],
    // Chi tiết công tơ
    'ct.tieuDe': ['Chi tiết công tơ', '电表详情'],
    'ct.sua': ['Sửa công tơ', '编辑电表'],
    'ct.heSo': ['hệ số nhân ×{hs}', '倍率×{hs}'],
    'ct.thayCT': ['Thay công tơ', '更换电表'],
    'ct.thangN': ['Tháng {m}', '{m}月合计'],
    'ct.tbNgay': ['TB mỗi ngày', '日均'],
    'ct.caoNhat': ['Cao nhất', '最高'],
    'ct.ngay': ['Ngày', '日'],
    'ct.thang': ['Tháng', '月'],
    'ct.binhThuong': ['Bình thường', '正常'],
    'ct.batThuong': ['Bất thường', '异常'],
    'ct.tbThang': ['TB tháng {so}', '月均值'],
    'ct.giaiBatThuong': ['Bất thường: cao hơn trung bình {n} ngày trước đó trên {pt}%', '异常：高于前{n}日均值{pt}%以上'],
    'ct.caoHonTB': ['cao hơn TB {n} ngày trước {pt}%', '比前{n}日均值高{pt}%'],
    'ct.lichSu': ['Lịch sử ghi', '抄表记录'],
    'ct.xuat': ['Xuất Excel', '导出Excel'],
    'ct.cotNgay': ['Ngày dùng · giờ ghi', '用电日 · 抄表时间'],
    'ct.cotChiSo': ['Chỉ số', '读数'],
    'ct.daDuyet': ['Đã kiểm tra · {nguoi}', '已审核 · {nguoi}'],
    'ct.thayCongToDong': ['Thay công tơ', '换表'],
    'ct.gop': ['Gộp', '合并'],
    'ct.chuaCoGhi': ['Chưa có lần ghi nào', '暂无抄表记录'],
    'ct.ttCongTo': ['Thông tin công tơ', '电表信息'],
    'ct.heSoNhan': ['Hệ số nhân', '倍率'],
    'ct.ctCha': ['Công tơ cha', '上级电表'],
    'ct.soToiDa': ['Quay về 0 sau', '满量程归零'],
    'ct.viTri': ['Vị trí', '位置'],
    'ct.ngayLap': ['Ngày lắp', '安装日期'],
    'ct.dinhMuc': ['Định mức mỗi ngày', '每日定额'],
    'ct.khuVuc': ['Khu vực', '区域'],
    'ct.maQR': ['Mã QR', '二维码内容'],
    'ct.loai': ['Loại', '类型'],
    'ct.trangThai': ['Trạng thái', '状态'],
    'ct.thaoTac': ['Lần ghi {ngay}', '{ngay}抄表记录'],
    'ct.xemAnh': ['Xem ảnh mặt công tơ', '查看电表照片'],
    'ct.duyet': ['Duyệt số này', '审核此读数'],
    'ct.duyetGhiChu': ['Ghi chú kiểm tra (VD nguyên nhân)', '审核备注（如原因）'],
    'ct.daDuyetXong': ['Đã duyệt', '已审核'],
    'ct.suaSo': ['Sửa chỉ số', '修改读数'],
    'ct.daSua': ['Đã sửa chỉ số', '读数已修改'],
    'ct.xoa': ['Xóa lần ghi', '删除抄表记录'],
    'ct.xoaLyDo': ['Lý do xóa', '删除原因'],
    'ct.daXoa': ['Đã xóa lần ghi', '抄表记录已删除'],
    'ct.xoaCho': ['Bỏ lần ghi chờ gửi', '放弃待发送的抄表'],
    'ct.khongThaoTac': ['Không có thao tác cho dòng này.', '此行无可用操作。'],
    'ct.taiAnh': ['Đang tải ảnh…', '正在加载照片…'],
    'ct.xemThemMay': ['Xem thêm từ máy chủ', '从服务器查看更多'],
    // Thay công tơ
    'thay.tieuDe': ['Thay công tơ {ma}', '更换电表 {ma}'],
    'thay.giai': ['Ghi số cuối của công tơ cũ và số đầu của công tơ mới trong một lần. Lần ghi sau tính từ số đầu công tơ mới.', '一次记录旧表末次读数和新表起始读数，之后从新表起始读数开始计算。'],
    'thay.soCuoi': ['Số cuối công tơ cũ', '旧表末次读数'],
    'thay.soDau': ['Số đầu công tơ mới', '新表起始读数'],
    'thay.heSoMoi': ['Hệ số nhân mới', '新倍率'],
    'thay.soToiDaMoi': ['Số tối đa mặt công tơ mới', '新表满量程'],
    'thay.anh': ['Ảnh (không bắt buộc)', '照片（选填）'],
    'thay.luu': ['Lưu thay công tơ', '保存换表'],
    'thay.xong': ['Đã thay công tơ {ma}', '电表{ma}已更换'],
    // Danh sách, form công tơ
    'ctds.tieuDe': ['Công tơ', '电表清单'],
    'ctds.dien': ['Công tơ điện', '电表'],
    'ctds.nuoc': ['Đồng hồ nước', '水表'],
    'ctds.ngung': ['Ngừng dùng, đã thay', '停用、已更换'],
    'ctds.inTem': ['In tem QR công tơ', '打印电表二维码'],
    'ctf.them': ['Thêm công tơ', '新增电表'],
    'ctf.sua': ['Sửa công tơ', '编辑电表'],
    'ctf.ma': ['Mã công tơ', '电表编号'],
    'ctf.maGoiY': ['VD CT-01 (điện), DN-01 (nước)', '例 CT-01（电）、DN-01（水）'],
    'ctf.tenVi': ['Tên tiếng Việt', '越南语名称'],
    'ctf.tenZh': ['Tên tiếng Trung', '中文名称'],
    'ctf.loai': ['Loại công tơ', '电表类型'],
    'ctf.loaiKhoa': ['Đã có chỉ số nên không đổi loại được.', '已有读数，不能更改类型。'],
    'ctf.heSo': ['Hệ số nhân (TU × TI)', '倍率（TU × TI）'],
    'ctf.heSoGoiY': ['Công tơ đấu trực tiếp ghi 1', '直接接入的电表填1'],
    'ctf.soToiDa': ['Số tối đa mặt công tơ', '满量程'],
    'ctf.soToiDaGoiY': ['VD 99999,99 – để app tính khi quay về 0', '例 99999.99，用于归零时计算'],
    'ctf.dinhMuc': ['Định mức mỗi ngày', '每日定额'],
    'ctf.dinhMucGoiY': ['Để trống thì không vẽ đường định mức', '留空则不显示定额线'],
    'ctf.cha': ['Công tơ cha (công tơ tổng phía trên)', '上级电表（上一级总表）'],
    'ctf.maQR': ['Nội dung tem QR', '二维码内容'],
    'ctf.maQRGoiY': ['Để trống = mã công tơ', '留空则使用电表编号'],
    'ctf.luu': ['Lưu công tơ', '保存电表'],
    'ctf.daLuu': ['Đã lưu công tơ {ma}', '已保存电表{ma}'],
    // Bảng giá
    'bg.tieuDe': ['Bảng giá điện nước', '水电价格'],
    'bg.giai': ['Đơn giá dùng để ước tính chi phí (chỉ cấp 1–2 thấy). Giá mới: thêm dòng với ngày bắt đầu áp dụng; giá cũ tự hết khi có giá mới.', '单价用于估算费用（仅1–2级可见）。新价格：添加一行并填写生效日期；有新价格后旧价格自动失效。'],
    'bg.them': ['Thêm đơn giá', '新增单价'],
    'bg.loai': ['Loại giá', '价格类型'],
    'bg.donGia': ['Đơn giá (đồng)', '单价（越南盾）'],
    'bg.dangApDung': ['Đang áp dụng', '当前适用'],
    'bg.tu': ['Từ {ngay}', '自{ngay}'],
    'bg.den': [' đến {ngay}', '至{ngay}'],
    'bg.trong': ['Chưa có đơn giá. App ẩn phần chi phí.', '暂无单价，应用将隐藏费用部分。'],
    'bg.xoaHoi': ['Xóa đơn giá này?', '删除此单价？'],
    'bg.daLuu': ['Đã lưu bảng giá', '价格已保存'],
    'bg.dvDien': ['đ/kWh', '越南盾/kWh'],
    'bg.dvNuoc': ['đ/m³', '越南盾/m³']
  });

  // ───────── Tiện ích ─────────
  function thangHT() { return ME.homNay().slice(0, 7); }
  dn.thangChon = thangHT();
  function tenThang(th) { const p = th.split('-'); return ME.t('dn.thang', { m: String(Number(p[1])), y: p[0] }); }
  function so(v, dv) { const n = Number(v) || 0; return (Math.abs(n) >= 100 ? ME.soVi(Math.round(n)) : ME.soVi(n, 2)) + (dv ? ' ' + dv : ''); }
  dn.soGon = so;
  function thangSo(th) { return String(Number(th.split('-')[1])); }
  function tenKhung(k) { return ME.t(k === 'CD' ? 'dn.caoDiem' : (k === 'TD' ? 'dn.thapDiem' : 'dn.binhThuong')); }
  const MAU_TT_CT = { DANG_DUNG: ['xanh', '#12A150', '#0B6234'], NGUNG: ['xam', '#667085', '#344054'], DA_THAY: ['xam', '#667085', '#344054'] };

  /** Số tổng hợp: máy chủ (lưu tạm theo tháng) hoặc tính trên máy. */
  const TH = {};
  dn.layTongHop = function (thang) {
    const c = TH[thang];
    return c ? c.d : null;
  };
  function taiTongHop(thang, xong) {
    const c = TH[thang] || (TH[thang] = { d: null, luc: 0, dang: false, cuc: null });
    if (c.dang || !ME.coMang() || !ME.tt.phien) return;
    if (c.d && Date.now() - c.luc < 120000) return;
    c.dang = true;
    ME.api.goi('tongHopDienNuoc', { thang: thang }, { thoiGian: 90000 }).then(function (d) {
      c.d = d;
      c.luc = Date.now();
      c.dang = false;
      ME.kho.dat('meta', 'th:' + thang, { d: d, luc: c.luc }).catch(function () {});
      if (xong) xong();
    }, function (e) { c.dang = false; if (!ME.laLoiMang(e)) console.warn('tongHop', e); });
  }
  /** Lấy số để vẽ: máy chủ nếu có, không thì tính trên máy (cucBo). Tiến độ hôm nay luôn tính trên máy. */
  function soLieu(thang) {
    const c = TH[thang];
    let d = c && c.d ? c.d : null;
    let cucBo = false;
    if (!d) {
      if (dn.thangCoTrenMay(thang)) { d = dn.tinhTongHop(thang); cucBo = true; } else return null;
    }
    const td = dn.tienDo();
    return Object.assign({}, d, { tienDo: td, cucBo: cucBo });
  }
  ME.su.nghe('du-lieu', function () { Object.keys(TH).forEach(function (k) { TH[k].luc = 0; }); });

  // ═════════ Điện nước – Tổng quan (bản vẽ 10) ═════════
  const stDN = { loai: 'dien', ngay: null, bang: false };
  function theThang(d, loai) {
    const x = d[loai];
    const m = thangSo(d.thang);
    const thangTruoc = thangSo(ME.congThang(d.thang, -1));
    const laThangNay = d.thang === thangHT();
    const goc = laThangNay ? x.cungKyTruoc : x.tongTruoc;
    let ss;
    let mau = '#475467';
    if (!goc) ss = ME.t('dn.chuaSoSanh', { m: thangTruoc });
    else {
      const pt = (x.tong / goc - 1) * 100;
      const ptS = ME.soVi(Math.abs(pt), 1);
      if (Math.abs(pt) < 0.05) ss = ME.t('dn.bang', { m: thangTruoc });
      else if (pt > 0) { ss = ME.t(laThangNay ? 'dn.tangCK' : 'dn.tang', { pt: ptS, m: thangTruoc }); mau = '#B4171F'; } else { ss = ME.t(laThangNay ? 'dn.giamCK' : 'dn.giam', { pt: ptS, m: thangTruoc }); mau = '#0B6234'; }
    }
    const tieu = ME.t(loai === 'dien' ? 'dn.dienThang' : 'dn.nuocThang', { m: m });
    return h('button', {
      type: 'button', class: 'the-thang', style: 'border:none;text-align:left;font:inherit',
      onClick: function () { stDN.loai = loai; stDN.ngay = null; ME.veLai(); const el = document.getElementById('bd-ngay'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    },
    h('div', { class: 'dau-tt' }, h('span', { class: 'ico', style: loai === 'dien' ? 'background:#FFF4D6;color:#8A6100' : 'background:#E8F1FC;color:#1B5FAE' }, ME.ic(loai === 'dien' ? 'set' : 'giot', 16, 1.9)),
      h('div', null, ME.L2(tieu.vi, tieu.zh))),
    h('div', { class: 'so-thang' }, h('b', null, so(x.tong)), h('span', null, ' ' + x.donVi)),
    h('div', { class: 'so-sanh', style: 'color:' + mau }, ME.L2(ss.vi, ss.zh)),
    d.cucBo ? h('div', { class: 'nho' }, ME.L('dn.thang12CanMang'))
      : [ME.bd.duongNho(x.xuHuong.map(function (t) { return t.tong; }), loai === 'dien' ? ME.bd.MAU.dien : ME.bd.MAU.nuoc), h('div', { class: 'nho' }, ME.L('dn.thang12'))]);
  }
  function theChiPhi(d) {
    if (!d.coChiPhi) return null;
    const cd = d.dien.chiPhi;
    const cn = d.nuoc.chiPhi;
    if (!cd && !cn) return null;
    const tong = (cd ? cd.tong : 0) + (cn ? cn.tong : 0);
    if (!tong) return null;
    const t = ME.tienGon(tong);
    const tr = function (v) { return Math.round((v || 0) / 1e6); };  // số (ME.tv/ME.tz tự định dạng theo tiếng)
    const m = thangSo(d.thang);
    const thieu = (cd && cd.thieuGia) || (cn && cn.thieuGia);
    return h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:8px' },
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:12px' },
        h('div', { class: 'tieu-the' }, h('span', { class: 'vi', style: 'font-size:13px;font-weight:600' }, ME.tv('dn.chiPhi', { m: m })), h('span', { class: 'zh' }, ME.tz('dn.chiPhi', { m: m }))),
        h('div', { style: 'text-align:right;line-height:1.3' }, h('div', { style: 'font-size:17px;font-weight:700' }, '≈ ' + t.vi),
          h('div', { style: 'font-size:12.5px;font-weight:600;color:#344054' }, '≈ ' + t.zh),
          h('div', { style: 'font-size:12px;color:#667085;font-variant-numeric:tabular-nums;margin-top:2px' }, ME.tv('dn.chiPhiTach', { d: tr(cd && cd.tong), n: tr(cn && cn.tong) })),
          h('div', { style: 'font-size:11px;color:#667085;font-variant-numeric:tabular-nums' }, ME.tz('dn.chiPhiTach', { d: tr(cd && cd.tong), n: tr(cn && cn.tong) })))),
      thieu ? h('div', { class: 'ghi-chu' }, ME.L('dn.thieuGia')) : null);
  }
  /** Vị trí công tơ hai tiếng: dòng Việt dùng ViTri (chữ tự do); dòng Trung dùng tên Trung của khu vực (ViTri không có bản Trung). */
  function viTriCT(ct) {
    const kv = ct.KhuVuc ? ME.dmTen('KHU_VUC', ct.KhuVuc) : { vi: '', zh: '' };
    return { vi: ct.ViTri || kv.vi || '', zh: kv.zh || ct.ViTri || '' };
  }
  function theTienDo(td, coNut) {
    const han = td.gioHan ? ME.t('dn.han', { gio: td.gioHan }) : { vi: '', zh: '' };
    const con = td.chuaGhi.length ? ME.t('dn.conCT', { n: td.chuaGhi.length, han: [han.vi, han.zh] }) : ME.t('dn.daDu');
    return h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
      ME.ui.theTieuDe('dn.ghiHomNay', null, h('div', { style: 'line-height:1.2;flex-shrink:0' }, h('span', { style: 'font-size:20px;font-weight:700' }, String(td.daGhi)), h('span', { style: 'font-size:13px;color:#475467' }, ' / ' + td.tong))),
      ME.ui.thanhTien(td.daGhi, td.tong, null, ME.t1('gs.daGhiSo', { a: td.daGhi, b: td.tong })),
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:12px' },
        h('div', { class: 'ghi-chu' }, h('span', { class: 'vi', style: 'color:' + (td.quaHan ? '#A3141D' : '#344054') + ';font-size:12.5px' }, con.vi), h('span', { class: 'zh' }, con.zh)),
        coNut && td.chuaGhi.length ? h('a', { class: 'nut-vien', href: '#/dn/ghi' }, h('span', null, ME.L('dn.ghiTiep'))) : null));
  }
  function moTaNgay(d, loai, i, x) {
    const ngay = d.thang + '-' + ME.p2(i + 1);
    const gt = x.theoNgay[i];
    const vi = [ME.ngayVi(ngay, true), ME.thuVi(ngay)];
    const zh = [ME.ngayZh(ngay, true), ME.thuZh(ngay)];
    if (gt === null || gt === undefined) { vi.push(ME.tv('dn.chuaCoSo')); zh.push(ME.tz('dn.chuaCoSo')); } else if (x.dinhMucNgay) {
      if (gt > x.dinhMucNgay) { vi.push(ME.tv('dn.vuotDM', { pt: ME.soVi((gt / x.dinhMucNgay - 1) * 100, 1) })); zh.push(ME.tz('dn.vuotDM')); } else { vi.push(ME.tv('dn.trongDM')); zh.push(ME.tz('dn.trongDM')); }
    }
    if (x.ngayGop && x.ngayGop.indexOf(i + 1) >= 0) { vi.push(ME.tv('dn.gopNgay')); zh.push(ME.tz('dn.gopNgay')); }
    return { vi: vi.join(' · '), zh: zh.join(' · ') };
  }
  function theTheoNgay(d) {
    const loai = stDN.loai;
    const x = d[loai];
    const n = x.theoNgay.length;
    if (stDN.ngay === null || stDN.ngay >= n || x.theoNgay[stDN.ngay] === null) {
      stDN.ngay = null;
      for (let i = n - 1; i >= 0; i--) if (x.theoNgay[i] !== null) { stDN.ngay = i; break; }
    }
    const m = thangSo(d.thang);
    const doDo = {};
    (x.ngayVuot || []).forEach(function (k) { doDo[k] = true; });
    const mau = loai === 'dien' ? ME.bd.MAU.dien : ME.bd.MAU.nuoc;
    const tab = h('div', { class: 'tab-nho', role: 'tablist' }, [['dien', 'dn.dien'], ['nuoc', 'dn.nuoc']].map(function (t) {
      return h('button', { type: 'button', role: 'tab', 'aria-selected': String(loai === t[0]), onClick: function () { stDN.loai = t[0]; stDN.ngay = null; ME.veLai(); } }, ME.L(t[1]));
    }));
    const diem = h('div', { class: 'diem-nhan' });
    function veDiem() {
      ME.xoaCon(diem);
      if (stDN.ngay === null) { ME.them(diem, h('div', { class: 'vi' }, ME.tv('dn.chuaCoSo'))); return; }
      const mt = moTaNgay(d, loai, stDN.ngay, x);
      ME.them(diem, [h('div', null, h('b', null, so(x.theoNgay[stDN.ngay])), ' ', h('span', { class: 'dv' }, x.donVi)), h('span', { class: 'vi' }, mt.vi), h('span', { class: 'zh' }, mt.zh)]);
    }
    veDiem();
    const vung = h('div');
    function veVung() {
      ME.xoaCon(vung);
      if (stDN.bang) {
        const dong = [];
        x.theoNgay.forEach(function (v, i) {
          if (v === null) return;
          const mt = moTaNgay(d, loai, i, x);
          dong.push(h('div', { class: 'dong' }, h('dt', null, h('span', { class: 'vi' }, mt.vi.split(' · ').slice(0, 2).join(' · ')), h('span', { class: 'zh' }, mt.zh.split(' · ').slice(0, 2).join(' · '))),
            h('dd', null, h('span', { class: 'vi', style: doDo[i + 1] ? 'color:#A3141D' : '' }, so(v, x.donVi)))));
        });
        vung.appendChild(h('dl', { class: 'ds-tt nho' }, dong.length ? dong : ME.ui.trong('chung.chuaCoDuLieu')));
        return;
      }
      vung.appendChild(ME.bd.cotNgay({
        gt: x.theoNgay, mau: mau, do: doDo, duongNgang: x.dinhMucNgay, nhanDuong: x.dinhMucNgay ? ME.t1('dn.dinhMucNhan') : '',
        chon: stDN.ngay, onChon: function (i) { stDN.ngay = i; veDiem(); veVung(); },
        moTa: ME.tv('dn.theoNgay') + ' ' + tenThang(d.thang).vi
      }));
    }
    veVung();
    const chuGiai = x.dinhMucNgay
      ? [h('div', null, h('span', { class: 'o-mau', style: 'background:' + mau }), h('span', { class: 'chu' }, ME.L('dn.trongDinhMuc'))),
        h('div', null, h('span', { class: 'o-mau', style: 'background:' + ME.bd.MAU.vuot }), h('span', { class: 'chu' }, ME.L('dn.vuotDinhMuc'))),
        h('div', null, h('span', { style: 'width:14px;border-top:2px dashed #475467;flex-shrink:0' }), h('span', { class: 'chu' }, h('span', { class: 'vi' }, ME.tv('dn.dinhMucNgay', { so: so(x.dinhMucNgay), dv: x.donVi })), h('span', { class: 'zh' }, ME.tz('dn.dinhMucNgay'))))]
      : [h('div', null, h('span', { class: 'o-mau', style: 'background:' + mau }), h('span', { class: 'chu' }, ME.L('dn.tieuThu')))];
    const nutBang = h('button', { type: 'button', class: 'lien-ket-phai nho', onClick: function () { stDN.bang = !stDN.bang; ME.xoaCon(nutBang); ME.them(nutBang, ME.L(stDN.bang ? 'dn.xemBieuDo' : 'dn.xemBang')); veVung(); } }, ME.L(stDN.bang ? 'dn.xemBieuDo' : 'dn.xemBang'));
    const tieu = ME.t('dn.theoNgay', { m: m });
    return h('section', { class: 'the', id: 'bd-ngay', style: 'display:flex;flex-direction:column;gap:10px;scroll-margin-top:12px' },
      h('div', { class: 'the-dau' },
        h('div', { class: 'tieu tieu-the' }, h('h2', { class: 'vi' }, tieu.vi), h('span', { class: 'zh' }, tieu.zh),
          x.ngayVuot && x.ngayVuot.length ? h('div', { style: 'margin-top:4px;color:#A3141D;line-height:1.35' }, h('span', { class: 'vi', style: 'font-size:12px' }, ME.tv('dn.ngayVuot', { n: x.ngayVuot.length })),
            h('span', { class: 'zh', style: 'font-size:11px;color:#A3141D' }, ME.tz('dn.ngayVuot', { n: x.ngayVuot.length }))) : null),
        tab),
      diem, vung, h('div', { class: 'chu-giai' }, chuGiai),
      h('div', { class: 'chan-the' }, h('div', { class: 'ghi' }, ME.L('dn.chamCot')), nutBang));
  }
  function theKhungGio(d) {
    const k = d.dien.khungGio;
    if (!k || !(k.BT + k.CD + k.TD > 0)) return null;
    const m = thangSo(d.thang);
    const t = ME.t('dn.khungGio', { m: m });
    const dong = [['TD', 'dn.thapDiem'], ['BT', 'dn.binhThuong'], ['CD', 'dn.caoDiem']].map(function (x) {
      return h('div', { class: 'dong-khung' }, h('span', { class: 'o-mau', style: 'background:' + ME.bd.MAU.khung[x[0]] }), h('div', { class: 'giua' }, ME.L(x[1])), h('div', { class: 'gt' }, so(k[x[0]], 'kWh')));
    });
    if (k.khongChia > 0) dong.push(h('div', { class: 'dong-khung' }, h('span', { class: 'o-mau', style: 'background:#D0D5DD' }), h('div', { class: 'giua' }, ME.L('dn.khongChia')), h('div', { class: 'gt' }, so(k.khongChia, 'kWh'))));
    return h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
      h('div', { class: 'tieu-the' }, h('h2', { class: 'vi' }, t.vi), h('span', { class: 'zh' }, t.zh)),
      ME.bd.thanhKhung(k, t.vi), h('div', null, dong));
  }
  function theKhuVuc(d) {
    const loai = stDN.loai;
    const x = d[loai];
    if (!x.theoKhuVuc || !x.theoKhuVuc.length) return null;
    const ds = x.theoKhuVuc.map(function (r) {
      const t = r.KhuVuc ? ME.dmTen('KHU_VUC', r.KhuVuc) : ME.t('dn.chuaKV');
      return { vi: t.vi, zh: t.zh, gt: r.tong };
    });
    if (x.khacChuaDo > 0) ds.push({ vi: ME.tv('dn.khac'), zh: ME.tz('dn.khac'), gt: x.khacChuaDo });
    ds.sort(function (a, b) { return b.gt - a.gt; });
    const tl = ME.t(loai === 'dien' ? 'dn.dien' : 'dn.nuoc');
    const t = { vi: ME.tv('dn.theoKV', { loai: tl.vi }), zh: ME.tz('dn.theoKV', { loaiZh: loai === 'dien' ? '用电' : '用水', m: thangSo(d.thang), dv: x.donVi }) };
    return h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:8px' },
      h('div', { class: 'tieu-the' }, h('h2', { class: 'vi' }, t.vi), h('span', { class: 'zh' }, t.zh)),
      ME.bd.thanhNgang(ds, loai === 'dien' ? ME.bd.MAU.dien : ME.bd.MAU.nuoc),
      x.khacChuaDo > 0 ? h('div', { class: 'ghi-chu' }, ME.L('dn.khacGiai')) : null);
  }
  /** Dòng công tơ (tổng quan, danh sách). */
  function dongCT(c, d) {
    const loai = dn.loai(c);
    const dv = dn.donVi(c);
    const ds = dn.dsGhi(c.MaCT);
    const cuoi = ds.length ? ds[ds.length - 1] : null;
    const homNay = ds.filter(function (r) { return ME.ngayCua(r.GhiLuc) === ME.homNay(); });
    const dung = !c.TrangThai || c.TrangThai === 'DANG_DUNG';
    const hs = Number(c.HeSoNhan) || 1;
    const phu = (hs !== 1 ? '×' + ME.soVi(hs) + ' · ' : '') + (cuoi && cuoi.TieuThu !== '' && cuoi.TieuThu !== undefined ? ME.ngayVi(cuoi.NgayTinh, true) + ': ' + so(cuoi.TieuThu, dv) : '');
    let nhan;
    if (!dung) { const t = ME.dmTen('TRANG_THAI_CONG_TO', c.TrangThai); nhan = ME.ui.nhanTT(t.vi || c.TrangThai, t.zh, 'xam', 'rong'); } else if (homNay.length) nhan = ME.ui.nhanTT(ME.tv('dn.daGhi', { gio: ME.gio(homNay[homNay.length - 1].GhiLuc) }), ME.tz('dn.daGhi'), homNay[homNay.length - 1]._cho ? 'cam' : 'xanh', 'rong');
    else nhan = ME.ui.nhanTTK('dn.chuaGhi', 'cam', 'rong');
    void d;
    return h('a', { class: 'dong-ct', href: '#/dn/ct/' + enc(c.MaCT) },
      h('span', { class: 'bieu-tuong b40 ' + (loai === 'dien' ? 'dien' : 'nuoc') }, ME.ic(loai === 'dien' ? 'set' : 'giot', 20, 1.9)),
      h('div', { class: 'giua' }, h('span', { class: 'vi' }, c.MaCT + ' · ' + (c.TenVi || '')), c.TenZh ? h('span', { class: 'zh' }, c.TenZh) : null, phu ? h('div', { class: 'phu' }, phu) : null),
      nhan);
  }
  function theCongTo(d) {
    const ds = ME.du.ds('CongTo').filter(function (c) { return c.MaCT; }).sort(function (a, b) { return String(a.MaCT).localeCompare(String(b.MaCT), 'vi', { numeric: true }); });
    const dung = ds.filter(function (c) { return !c.TrangThai || c.TrangThai === 'DANG_DUNG'; });
    return h('section', { class: 'the', style: 'padding:14px 14px 4px' },
      ME.ui.theTieuDe('dn.congToVaDH', null, ds.length > 4 ? ME.ui.lienKetPhai('dn.xemCa', '/dn/cong-to', { n: ds.length }) : null),
      dung.length ? h('div', { style: 'margin-top:4px' }, dung.slice(0, 4).map(function (c) { return dongCT(c, d); }))
        : h('div', { class: 'ghi-chu', style: 'padding:10px 0' }, ME.L('dn.chuaCoCongTo'),
          ME.co('QUAN_LY_DIEN_NUOC') ? h('a', { class: 'nut-vien', href: '#/dn/cong-to/them', style: 'margin-top:8px' }, ME.ic('cong', 18, 2), h('span', null, ME.L('dn.themCongTo'))) : null));
  }
  ME.tuyen('/dn', {
    ve: function () {
      const thang = dn.thangChon;
      const d = soLieu(thang);
      const t = tenThang(thang);
      const chonThang = h('button', {
        type: 'button', class: 'nut-tron-dau', style: 'justify-content:flex-start;gap:8px;padding:6px 12px',
        onClick: function () {
          const ds = [];
          for (let i = 0; i < 13; i++) { const th = ME.congThang(thangHT(), -i); const x = tenThang(th); ds.push({ gt: th, vi: x.vi, zh: x.zh }); }
          ME.chonTu({ tieuDe: 'dn.chonThang', ds: ds, hienTai: thang }).then(function (gt) { if (gt) { dn.thangChon = gt; stDN.ngay = null; ME.veLai(); } });
        }
      }, ME.ic('lich', 18, 2), h('span', { style: 'flex-grow:1;text-align:left;line-height:1.2' }, h('span', { class: 'vi' }, t.vi), h('span', { class: 'zh', style: 'color:#C9D6E8' }, t.zh)), ME.ic('xuong', 18, 2));
      const duoi = h('div', { style: 'display:flex;gap:8px' }, chonThang,
        ME.co('GHI_CHI_SO') ? h('a', { class: 'nut-tron-dau vang', href: '#/dn/ghi' }, ME.ic('set', 18, 2), h('span', null, ME.L('dn.ghiChiSo'))) : null);
      const noiDung = [];
      if (!d) {
        noiDung.push(ME.coMang() ? ME.ui.dangTai('dn.dangTaiSo') : h('div', { class: 'hop-cb' }, ME.ic('matMang', 20, 2), h('div', { class: 'chu' }, ME.L('dn.canMangThang'))));
      } else {
        if (d.cucBo && !ME.coMang()) noiDung.push(h('div', { class: 'hop-cb' }, ME.ic('matMang', 20, 2), h('div', { class: 'chu' }, ME.L('dn.cucBo'))));
        noiDung.push(h('div', { class: 'luoi-2the' }, theThang(d, 'dien'), theThang(d, 'nuoc')));
        noiDung.push(theChiPhi(d));
        if (d.tienDo.tong) noiDung.push(theTienDo(d.tienDo, ME.co('GHI_CHI_SO')));
        noiDung.push(theTheoNgay(d));
        if (stDN.loai === 'dien') noiDung.push(theKhungGio(d));
        noiDung.push(theKhuVuc(d));
        noiDung.push(theCongTo(d));
        if (!d.cucBo && d.tinhLuc) noiDung.push(h('div', { class: 'ghi-chu c11', style: 'text-align:center' }, ME.L('dn.soLuc', { gio: ME.ngayGioVi(d.tinhLuc) })));
      }
      return h('div', { class: 'trang' },
        ME.ui.dau({ tieuDe: 'dn.tieuDe', quayLai: '/', lop: 'd16', phai: ME.ui.nutIcon('danhSach', 'dn.dsCongTo', '/dn/cong-to', 'phai'), duoi: duoi }),
        h('main', { class: 'noi-dung' }, noiDung));
    },
    sauVe: function () { taiTongHop(dn.thangChon, function () { if (ME.hienTai() && ME.hienTai().duong === '/dn') ME.veLai(); }); },
    capNhat: function (el, loai) { if (loai !== 'dong-bo') ME.veLai(); }
  });

  // ═════════ Ghi chỉ số (bản vẽ 11) ═════════
  /** Công tơ chưa ghi tiếp theo (sau công tơ đang ghi, vòng lại đầu). */
  function tiepTheo(maHienTai) {
    const td = dn.tienDo();
    const ds = dn.congToDung().map(function (c) { return c.MaCT; });
    const i = ds.indexOf(maHienTai);
    const sau = ds.slice(i + 1).concat(ds.slice(0, Math.max(0, i)));
    return sau.filter(function (m) { return td.chuaGhi.indexOf(m) >= 0; })[0] || '';
  }
  ME.tuyen('/dn/ghi', {
    ve: function () {
      if (!ME.co('GHI_CHI_SO')) return ME.ui.manKhongQuyen('gs.tieuDe');
      const ds = dn.congToDung();
      if (!ds.length) {
        return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'gs.tieuDe', quayLai: '/dn' }),
          h('main', { class: 'noi-dung' }, h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('gs.khongCoCT')))));
      }
      return h('div', { class: 'trang' });
    },
    sauVe: function () {
      if (!ME.co('GHI_CHI_SO')) return;
      const ds = dn.congToDung();
      if (!ds.length) return;
      const td = dn.tienDo();
      const ma = td.chuaGhi[0] || ds[0].MaCT;
      setTimeout(function () { ME.di('/dn/ghi/' + enc(ma), true); }, 0);
    }
  });
  function chonCongTo(maHT, laGhi) {
    const td = dn.tienDo();
    ME.chonTu({
      tieuDe: 'gs.chonCT', hienTai: maHT, timKiem: true,
      ds: dn.congToDung().map(function (c) {
        const g = td.ghiHomNay[c.MaCT];
        return {
          gt: c.MaCT, vi: c.MaCT + ' · ' + (c.TenVi || ''), zh: c.TenZh || '',
          phu: g ? ME.tv('dn.daGhi', { gio: ME.gio(g.GhiLuc) }) : ME.tv('dn.chuaGhi'),
          ic: h('span', { class: 'bieu-tuong b40 ' + (dn.loai(c) === 'dien' ? 'dien' : 'nuoc') }, ME.ic(dn.loai(c) === 'dien' ? 'set' : 'giot', 20, 1.9))
        };
      })
    }).then(function (gt) { if (gt && gt !== maHT) ME.di((laGhi ? '/dn/ghi/' : '/dn/ct/') + enc(gt), true); });
  }
  function quetCongTo() {
    ME.quet({ tieuDe: 'gs.quetCT' }).then(function (chu) {
      if (!chu) return;
      const ma = ME.chuanMa(chu);
      const c = ME.du.ds('CongTo').filter(function (x) { return ME.chuanMa(x.MaQR) === ma || ME.chuanMa(x.MaCT) === ma; })[0];
      if (c) ME.di('/dn/ghi/' + enc(c.MaCT), true);
      else ME.hoi({ tieuDe: { vi: ME.tv('gs.khongThay', { ma: chu }), zh: ME.tz('gs.khongThay', { ma: chu }) }, loiNhan: 'quet.khongThayND' });
    });
  }
  ME.tuyen('/dn/ghi/:ma', {
    ve: function (ts) {
      if (!ME.co('GHI_CHI_SO')) return ME.ui.manKhongQuyen('gs.tieuDe');
      const ct = ME.du.lay('CongTo', ts.ma);
      const td = dn.tienDo();
      const dau = ME.ui.dau({
        tieuDe: 'gs.tieuDe', quayLai: '/dn', lop: 'd14',
        phai: h('div', { class: 'dau-phai' }, ME.L('gs.daGhiSo', { a: td.daGhi, b: td.tong })),
        duoi: h('div', { style: 'height:6px;border-radius:3px;background:rgba(255,255,255,0.18);overflow:hidden' },
          h('div', { style: 'height:100%;border-radius:3px;background:#FFC72C;width:' + (td.tong ? Math.round(td.daGhi / td.tong * 100) : 0) + '%' }))
      });
      if (!ct) {
        return h('div', { class: 'trang' }, dau, h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-cb' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('gs.khongThay', { ma: ts.ma }))),
          h('button', { type: 'button', class: 'nut-vien', onClick: function () { chonCongTo(ts.ma, true); } }, h('span', null, ME.L('gs.chonKhac')))));
      }
      const loai = dn.loai(ct);
      const dv = dn.donVi(ct);
      const khung = dn.khungCua(ct);
      const hs = Number(ct.HeSoNhan) > 0 ? Number(ct.HeSoNhan) : 1;
      const dsGhi = dn.dsGhi(ct.MaCT);
      const truoc = dsGhi.length ? dsGhi[dsGhi.length - 1] : null;
      const dung = !ct.TrangThai || ct.TrangThai === 'DANG_DUNG';
      const st = { anh: null, kq: null };
      const tLoai = ME.dmTen('LOAI_CONG_TO', ct.Loai);
      const homNayGhi = td.ghiHomNay[ct.MaCT];
      const o = {};
      const vungKhung = {};
      const vungTong = h('div');
      const vungCB = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      const oGio = h('div', { style: 'text-align:right;line-height:1.3' });
      function veGio() {
        const luc = st.anh ? st.anh.luc : Date.now();
        const iso = ME.isoVN(luc);
        ME.xoaCon(oGio);
        ME.them(oGio, [h('div', { style: 'font-size:12px;color:#344054' }, ME.tv('gs.gioGhi', { luc: ME.ngayVi(iso, true) + ' ' + iso.slice(11, 16) })), h('div', { style: 'font-size:11px;color:#667085' }, ME.tz('gs.gioGhi'))]);
      }
      veGio();
      function docO() {
        const moi = {};
        let du = true;
        let sai = null;
        khung.forEach(function (k) {
          const v = o[k].value.trim();
          if (v === '') { du = false; return; }
          const n = ME.docSo(v, true);
          if (isNaN(n) || n < 0) { sai = sai || { k: k, v: v }; du = false; return; }
          moi['ChiSo' + k] = n;
        });
        return { moi: moi, du: du, sai: sai };
      }
      function tinh() {
        const x = docO();
        const luc = st.anh ? st.anh.luc : Date.now();
        const ngayTinh = ME.ngayTinhCua(luc);
        st.kq = null;
        khung.forEach(function (k) {
          const v = vungKhung[k];
          const n = x.moi['ChiSo' + k];
          v.o.classList.remove('canh-bao', 'chan');
          ME.xoaCon(v.chenh);
          ME.xoaCon(v.tinh);
          v.tinh.className = 'tinh';
          if (n === undefined || !truoc) return;
          const a = Number(truoc['ChiSo' + k]) || 0;
          const dlt = n - a;
          v.chenh.textContent = (dlt >= 0 ? '+' : '−') + ME.soVi(Math.abs(dlt), 3);
        });
        ME.xoaCon(vungTong);
        ME.xoaCon(vungCB);
        if (x.sai) { vungCB.appendChild(h('div', { class: 'hop-cb do', role: 'alert' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('loi.SO_SAI', { gt: x.sai.v })))); return; }
        if (!truoc) { vungCB.appendChild(h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('gs.lanDau')))); return; }
        if (!x.du) return;
        const ts2 = dn.thamSo(dsGhi, ngayTinh);
        const kq = dn.kiemTra(ct, truoc, Object.assign({ NgayTinh: ngayTinh, HeSo: ct.HeSoNhan }, x.moi), ts2);
        st.kq = kq;
        st.ts = ts2;
        if (kq.chan) {
          const v = vungKhung[kq.chan.khung];
          v.o.classList.add('chan');
          const tk = tenKhung(kq.chan.khung);
          vungCB.appendChild(h('div', { class: 'hop-cb do', role: 'alert' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' },
            h('span', { class: 'vi' }, ME.tv('gs.nhoHon', { khung: khung.length > 1 ? tk.vi.toLowerCase() : '', moi: ME.soVi(kq.chan.moi, 3), truoc: ME.soVi(kq.chan.truoc, 3) }).replace('  ', ' ')),
            h('span', { class: 'zh' }, ME.tz('gs.nhoHon', { khungZh: khung.length > 1 ? tk.zh : '', moi: ME.soZh(kq.chan.moi, 3), truoc: ME.soZh(kq.chan.truoc, 3) })))));
          return;
        }
        const nghi = {};
        if (kq.canXacNhan) kq.canXacNhan.ds.forEach(function (p) { nghi[p.khung] = true; });
        khung.forEach(function (k) {
          const v = vungKhung[k];
          const raw = (Number(x.moi['ChiSo' + k]) || 0) - (Number(truoc['ChiSo' + k]) || 0);
          const tt = kq['TieuThu' + k];
          const canh = nghi[k] || (khung.length === 1 && nghi.TONG);
          if (canh) v.o.classList.add('canh-bao');
          v.tinh.className = 'tinh' + (canh ? ' cam' : '');
          ME.them(v.tinh, [canh ? ME.ic('canhBao', 16, 2) : null, h('span', null,
            (hs !== 1 ? ME.soVi(raw, 3) + ' × ' + ME.soVi(hs) + ' = ' : '') + so(tt, dv))]);
        });
        const coCanh = !!kq.canXacNhan || kq.Co === 'BAT_THUONG';
        const tb = ts2.tbNgay ? ts2.tbNgay.tong : null;
        vungTong.appendChild(h('div', { style: 'display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding-top:12px;border-top:1px solid #EAECF0' },
          h('div', { class: 'tieu-the' }, ME.L(kq.soNgay > 1 ? 'gs.tongNNgay' : 'gs.tongHomNay', { n: kq.soNgay })),
          h('div', { style: 'text-align:right;line-height:1.3' },
            h('div', { style: 'font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;color:' + (coCanh ? '#8A3E00' : '#101828') }, so(kq.TieuThu, dv)),
            tb !== null ? h('div', { style: 'font-size:12px;color:#667085' }, ME.tv('gs.tb', { n: ts2.soNgayTB, so: so(tb) })) : null,
            tb !== null ? h('div', { style: 'font-size:11px;color:#667085' }, ME.tz('gs.tb', { n: ts2.soNgayTB })) : null)));
        if (kq.canXacNhan) {
          const p = kq.canXacNhan.ds[0];
          const tk = p.khung === 'TONG' ? ME.t('gs.tieuThuKhung') : tenKhung(p.khung);
          vungCB.appendChild(h('div', { class: 'hop-cb', role: 'alert' }, ME.ic('canhBao', 20, 2), h('div', { class: 'chu' },
            h('span', { class: 'vi' }, ME.tv('gs.nghiSai', { khung: tk.vi, lan: ME.soVi(p.lan, 1), n: ts2.soNgayTB, tb: so(p.tb), dv: dv })),
            h('span', { class: 'zh' }, ME.tz('gs.nghiSai', { khungZh: tk.zh, lan: ME.soZh(p.lan, 1), n: ts2.soNgayTB, tb: so(p.tb), dv: dv })))));
        }
        kq.canhBao.forEach(function (c) {
          let k;
          let ts3;
          if (c.ma === 'VUOT_NGUONG' && !kq.canXacNhan) { k = 'gs.batThuong'; ts3 = { n: ts2.soNgayTB, pt: c.phanTram }; } else if (c.ma === 'VUOT_DINH_MUC') { k = 'gs.vuotDM'; ts3 = { pt: ME.soVi(c.phanTram, 1) }; } else if (c.ma === 'GOP') { k = 'gs.gop'; ts3 = { n: c.soNgay }; } else if (c.ma === 'QUAY_VONG') { k = 'gs.quayVong'; }
          if (k) vungCB.appendChild(h('div', { class: c.ma === 'GOP' || c.ma === 'QUAY_VONG' ? 'hop-tin' : 'hop-cb' }, ME.ic(c.ma === 'GOP' ? 'lich' : 'canhBao', 20, 2), h('div', { class: 'chu' }, ME.L(k, ts3))));
        });
      }
      const khungEl = khung.map(function (k) {
        const tk = khung.length > 1 ? tenKhung(k) : ME.t('gs.chiSo');
        const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': tk.vi + ' · ' + tk.zh, enterkeyhint: 'next' });
        o[k] = inp;
        const chenh = h('span', { class: 'chenh' });
        const oCS = h('label', { class: 'o-chi-so' }, inp, chenh);
        const tinhEl = h('div', { class: 'tinh' });
        vungKhung[k] = { o: oCS, chenh: chenh, tinh: tinhEl };
        inp.addEventListener('input', ME.tre(tinh, 120));
        inp.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          const i = khung.indexOf(k);
          if (i < khung.length - 1) o[khung[i + 1]].focus(); else inp.blur();
        });
        return h('div', { class: 'khung-so' },
          h('div', { class: 'tren' }, h('div', { class: 'ten' }, ME.L2(tk.vi, tk.zh)),
            truoc ? h('div', { class: 'truoc' }, h('span', { class: 'vi' }, ME.tv('gs.lanTruocO') + ' ', h('b', null, ME.soVi(Number(truoc['ChiSo' + k]) || 0, 3))), h('span', { class: 'zh' }, ME.tz('gs.lanTruocO'))) : null),
          oCS,
          h('div', { class: 'duoi-o' }, h('div', null, ME.L('gs.tieuThuKhung')), tinhEl));
      });
      const chonAnh = ME.ui.chonAnh({ motO: true, batBuoc: true, onAnh: function (a) { st.anh = a; veGio(); tinh(); } });
      const oGhiChu = ME.ui.oNhap({ placeholder: ME.t1('gs.ghiChuGoiY'), maxlength: 500, style: 'font-size:14px' });
      const tt = tiepTheo(ct.MaCT);
      const ctTT = tt ? ME.du.lay('CongTo', tt) : null;
      function luu() {
        if (!dung) { ME.baoLoi(ME.t('gs.ctNgung', { ma: ct.MaCT })); return; }
        const x = docO();
        if (x.sai) { o[x.sai.k].focus(); return; }
        const thieu = khung.filter(function (k) { return o[k].value.trim() === ''; })[0];
        if (thieu) {
          const tk = khung.length > 1 ? tenKhung(thieu) : ME.t('gs.chiSo');
          ME.baoLoi({ vi: ME.tv('gs.thieuSo', { khung: tk.vi.toLowerCase() }), zh: ME.tz('gs.thieuSo', { khungZh: tk.zh }) }).then(function () { o[thieu].focus(); });
          return;
        }
        tinh();
        if (st.kq && st.kq.chan) { o[st.kq.chan.khung].focus(); return; }
        if (!st.anh) { ME.baoLoi(ME.t('gs.thieuAnh')); return; }
        const daXacNhan = [];
        let p = Promise.resolve(true);
        if (st.kq && st.kq.canXacNhan) {
          p = p.then(function (ok) {
            if (!ok) return false;
            return ME.hoi({ tieuDe: 'ui.choXacNhan', loiNhan: 'gs.hoiNghiSai', nut: [{ nhan: 'chung.vanLuu', gt: true, chinh: true }, { nhan: 'chung.suaLai', gt: false }], dongNgoai: false })
              .then(function (v) { if (v) daXacNhan.push('NGHI_NHAP_SAI'); return v; });
          });
        }
        const ngayTinh = ME.ngayTinhCua(st.anh.luc);
        if (dsGhi.some(function (r) { return r.NgayTinh === ngayTinh; })) {
          p = p.then(function (ok) {
            if (!ok) return false;
            return ME.hoi({ tieuDe: 'ui.choXacNhan', loiNhan: 'gs.hoiDaGhi', nut: [{ nhan: 'chung.vanLuu', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], dongNgoai: false })
              .then(function (v) { if (v) daXacNhan.push('DA_GHI_NGAY'); return v; });
          });
        }
        p.then(function (ok) {
          if (!ok) return;
          const data = { MaCT: ct.MaCT, GhiLuc: ME.isoVN(st.anh.luc), anh: st.anh.base64, GhiChu: oGhiChu.value.trim() };
          khung.forEach(function (k) { data['ChiSo' + k] = x.moi['ChiSo' + k]; });
          const tomTat = { vi: ME.tv('gs.tieuDe') + ' ' + ct.MaCT + ' · ' + ME.gio(data.GhiLuc), zh: ME.tz('gs.tieuDe') + ' ' + ct.MaCT + ' · ' + ME.gio(data.GhiLuc), loai: 'chiSo' };
          return ME.luuQuaHang('luuChiSo', data, tomTat, { daXacNhan: daXacNhan, imCho: true }).then(function (kq) {
            const soTT = kq.ok && kq.data && kq.data.tieuThu !== undefined && kq.data.tieuThu !== '' ? so(kq.data.tieuThu, dv) : (st.kq ? so(st.kq.TieuThu, dv) : '');
            if (kq.choGui) ME.thongBao('chung.daLuuCho');
            else ME.thongBao('gs.daLuu', null, { ma: ct.MaCT, so: soTT });
            const sau = tiepTheo(ct.MaCT);
            if (sau) ME.di('/dn/ghi/' + enc(sau), true);
            else { ME.thongBao('gs.ghiDu'); ME.di('/dn', true); }
          });
        }).catch(ME.boQua);
      }
      const congToEl = h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
        h('div', { style: 'display:flex;gap:12px;align-items:flex-start' },
          h('span', { class: 'bieu-tuong b44 ' + (loai === 'dien' ? 'dien' : 'nuoc') }, ME.ic(loai === 'dien' ? 'set' : 'giot', 22, 1.9)),
          h('div', { style: 'flex-grow:1;min-width:0;line-height:1.35' },
            h('div', { style: 'font-size:15px;font-weight:700' }, ct.MaCT + ' · ' + (ct.TenVi || '')), ct.TenZh ? h('div', { style: 'font-size:12.5px;color:#475467' }, ct.TenZh) : null,
            h('div', { style: 'margin-top:4px;font-size:12px;color:#344054' }, [tLoai.vi, ME.tv('ct.heSo', { hs: ME.soVi(hs) }), viTriCT(ct).vi].filter(Boolean).join(' · ')),
            h('div', { style: 'font-size:11px;color:#667085' }, [tLoai.zh, ME.tz('ct.heSo', { hs: ME.soZh(hs) }), viTriCT(ct).zh].filter(Boolean).join(' · ')))),
        h('div', { style: 'display:flex;gap:8px' },
          h('button', { type: 'button', class: 'nut-vien', style: 'flex-grow:1', onClick: quetCongTo }, ME.ic('qr', 18, 2), h('span', null, ME.L('gs.quetCT'))),
          h('button', { type: 'button', class: 'nut-xam', style: 'flex-grow:1;flex-direction:column', onClick: function () { chonCongTo(ct.MaCT, true); } }, ME.L('gs.chonKhac'))),
        truoc ? h('div', { style: 'line-height:1.35;padding-top:10px;border-top:1px solid #EAECF0' },
          h('div', { style: 'font-size:12px;color:#344054' }, ME.tv('gs.lanTruoc', { luc: ME.ngayGioVi(truoc.GhiLuc), nguoi: ME.tenNguoi(truoc.NguoiGhi) })),
          h('div', { style: 'font-size:11px;color:#667085' }, ME.tz('gs.lanTruoc', { luc: ME.ngayGioZh(truoc.GhiLuc) }))) : null);
      const el = h('div', { class: 'trang' }, dau,
        h('main', { class: 'noi-dung' },
          congToEl,
          !dung ? h('div', { class: 'hop-cb do' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('gs.ctNgung', { ma: ct.MaCT }))) : null,
          homNayGhi ? h('div', { class: 'hop-tin' }, ME.ic('lichCheck', 20, 2), h('div', { class: 'chu' }, ME.L('gs.daGhiHomNay', { gio: ME.gio(homNayGhi.GhiLuc), nguoi: ME.tenNguoi(homNayGhi.NguoiGhi) }))) : null,
          h('section', { class: 'the', style: 'padding:14px 14px 12px' },
            h('div', { class: 'the-dau', style: 'padding-bottom:10px' }, h('div', { class: 'tieu tieu-the' }, ME.L('gs.chiSoMoi')), oGio),
            khungEl, vungTong),
          vungCB,
          h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
            ME.ui.theTieuDe('gs.anh', null, ME.ui.nhanTTK('chung.batBuoc', 'do')), chonAnh),
          h('section', { class: 'the' }, h('label', { style: 'display:block' }, h('span', { class: 'tieu-the' }, ME.L('chung.ghiChu')), h('div', { style: 'margin-top:8px' }, oGhiChu)))),
        h('div', { class: 'thanh-nut' },
          h('button', { type: 'button', class: 'nut-chinh', onClick: luu, disabled: !dung }, ME.L('gs.luu')),
          h('div', { class: 'hang-chu' }, h('div', { style: 'flex-shrink:0' }, ME.L('gs.luuKhiMatMang')),
            h('div', { style: 'text-align:right;min-width:0' }, tt ? [
              h('span', { class: 'vi dong-1' }, ME.tv('gs.tiepTheo', { ma: tt + (ctTT && ctTT.TenVi ? ' · ' + ctTT.TenVi : '') })),
              h('span', { class: 'zh dong-1' }, ME.tz('gs.tiepTheo', { ma: tt + (ctTT && ctTT.TenZh ? ' ' + ctTT.TenZh : '') }))] : ME.L('gs.hetCT')))));
      return el;
    }
  });

  // ═════════ Chi tiết công tơ (bản vẽ 12) ═════════
  const stCT = { tab: 'ngay', chon: null, ma: '', them: null };
  function chiSoChu(r, khung) {
    if (khung.length === 1) return ME.soVi(Number(r.ChiSoBT) || 0, 3);
    return khung.map(function (k) { return k + ' ' + ME.soVi(Number(r['ChiSo' + k]) || 0, 3); }).join('\n');
  }
  function thaoTacDong(ct, r) {
    const ds = [];
    if (r._hang) {
      ds.push({ nhan: 'ct.xoaCho', ic: 'thungRac', gt: 'xoaCho', nguy: true });
    } else {
      if (r.AnhId) ds.push({ nhan: 'ct.xemAnh', ic: 'anh', gt: 'anh' });
      const cuaMinhHomNay = ME.tt.phien && r.NguoiGhi === ME.tt.phien.maNV && ME.ngayCua(r.GhiLuc) === ME.homNay();
      const duyet = ME.co('DUYET_CHI_SO');
      if (r.Co !== 'THAY_CONG_TO') {
        if (duyet && r.Co === 'BAT_THUONG' && !r.NguoiDuyet) ds.push({ nhan: 'ct.duyet', ic: 'duyet', gt: 'duyet' });
        if (duyet || cuaMinhHomNay) {
          ds.push({ nhan: 'ct.suaSo', ic: 'but', gt: 'sua' });
          ds.push({ nhan: 'ct.xoa', ic: 'thungRac', gt: 'xoa', nguy: true });
        }
      }
    }
    if (!ds.length) { ME.thongBao('ct.khongThaoTac'); return; }
    const khung = dn.khungCua(ct);
    ME.thaoTac({ vi: ME.tv('ct.thaoTac', { ngay: ME.ngayVi(r.NgayTinh, true) }), zh: ME.tz('ct.thaoTac', { ngay: ME.ngayZh(r.NgayTinh, true) }) }, ds).then(function (gt) {
      if (gt === 'xoaCho') { ME.hang.xoa(r._hang); return; }
      if (gt === 'anh') {
        const vung = h('div', { style: 'min-height:120px;display:flex;align-items:center;justify-content:center' }, ME.ui.dangTai('ct.taiAnh'));
        ME.hoi({ tieuDe: 'ct.xemAnh', noiDung: vung });
        ME.anhRieng(r.AnhId).then(function (url) {
          ME.xoaCon(vung).appendChild(h('img', { src: url, alt: '', style: 'width:100%;border-radius:12px' }));
        }, function (e) { ME.xoaCon(vung).appendChild(ME.ui.loiTruong(e)); });
        return;
      }
      const tomTat = function (k) { return { vi: ME.tv(k) + ' ' + ct.MaCT + ' · ' + ME.ngayVi(r.NgayTinh, true), zh: ME.tz(k) + ' ' + ct.MaCT + ' · ' + ME.ngayZh(r.NgayTinh, true) }; };
      if (gt === 'duyet') {
        const o = ME.ui.oNhap({ placeholder: ME.t1('ct.duyetGhiChu'), maxlength: 300 });
        ME.hoi({ tieuDe: 'ct.duyet', noiDung: o, nut: [{ nhan: 'chung.xacNhan', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true }).then(function (ok) {
          if (!ok) return;
          ME.luuQuaHang('duyetChiSo', { maGhi: r.MaGhi, ghiChu: o.value.trim() }, tomTat('ct.duyet')).then(function (kq) { if (kq.ok) ME.thongBao('ct.daDuyetXong'); ME.veLai(); }).catch(ME.boQua);
        });
      } else if (gt === 'sua') {
        const o = {};
        const noiDung = h('div', { style: 'display:flex;flex-direction:column;gap:10px' }, khung.map(function (k) {
          o[k] = ME.ui.oNhap({ inputmode: 'decimal', value: ME.soVi(Number(r['ChiSo' + k]) || 0, 3) });
          const tk = khung.length > 1 ? tenKhung(k) : ME.t('gs.chiSo');
          return ME.ui.truong([tk.vi, tk.zh], o[k]);
        }));
        ME.hoi({ tieuDe: 'ct.suaSo', noiDung: noiDung, nut: [{ nhan: 'chung.luu', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true }).then(function (ok) {
          if (!ok) return;
          const sua = {};
          for (let i = 0; i < khung.length; i++) {
            const n = ME.docSo(o[khung[i]].value, true);
            if (isNaN(n) || n < 0) { ME.baoLoi(ME.loiMoi('SO_SAI', { gt: o[khung[i]].value })); return; }
            sua['ChiSo' + khung[i]] = n;
          }
          ME.luuQuaHang('duyetChiSo', { maGhi: r.MaGhi, sua: sua }, tomTat('ct.suaSo')).then(function (kq) { if (kq.ok) ME.thongBao('ct.daSua'); ME.veLai(); }).catch(ME.boQua);
        });
      } else if (gt === 'xoa') {
        const o = ME.ui.oNhap({ placeholder: ME.t1('ct.xoaLyDo'), maxlength: 300 });
        ME.hoi({ tieuDe: 'ct.xoa', noiDung: o, nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true }).then(function (ok) {
          if (!ok) return;
          ME.luuQuaHang('xoaChiSo', { maGhi: r.MaGhi, lyDo: o.value.trim() }, tomTat('ct.xoa')).then(function (kq) { if (kq.ok) ME.thongBao('ct.daXoa'); ME.veLai(); }).catch(ME.boQua);
        });
      }
    });
  }
  function bangLichSu(ct, dsGhi) {
    const khung = dn.khungCua(ct);
    const dv = dn.donVi(ct);
    const goc = h('div', { class: 'bang-ls' },
      h('div', { class: 'dau-ls' }, h('div', null, ME.L('ct.cotNgay')), h('div', { class: 'phai' }, ME.L('ct.cotChiSo')), h('div', { class: 'phai' }, h('span', { class: 'vi' }, dv), h('span', { class: 'zh' }, ME.tz('dn.tieuThu')))));
    const veDong = function (r) {
      const bt = r.Co === 'BAT_THUONG';
      const nhan = [];
      if (bt) nhan.push(ME.ui.nhanTTK('ct.batThuong', 'do'));
      if (r.Co === 'GOP') nhan.push(ME.ui.nhanTTK('ct.gop', 'than'));
      if (r.Co === 'THAY_CONG_TO') nhan.push(ME.ui.nhanTTK('ct.thayCongToDong', 'tim'));
      if (r._cho) nhan.push(ME.ui.nhanTTK('chung.choGui', 'cam'));
      const ghi = [];
      if (r.NguoiDuyet && (bt || r.GhiChu)) ghi.push((r.GhiChu ? r.GhiChu + ' · ' : '') + ME.tv('ct.daDuyet', { nguoi: ME.tenNguoi(r.NguoiDuyet) }));
      else if (r.GhiChu) ghi.push(r.GhiChu);
      return h('button', { type: 'button', class: 'dong-ls' + (bt ? ' bat-thuong' : ''), style: 'width:' + (bt ? 'calc(100% + 28px)' : '100%') + ';border-left:none;border-right:none;border-bottom:none;background:' + (bt ? '#FFF5F5' : 'transparent') + ';font:inherit;text-align:left', onClick: function () { thaoTacDong(ct, r); } },
        h('div', { class: 'ngay' }, h('span', { class: 'vi' }, ME.ngayVi(r.NgayTinh, true) + ' · ' + ME.thuNgan(r.NgayTinh)),
          h('div', { class: 'phu' }, ME.ngayGioVi(r.GhiLuc) + ' · ' + ME.tenNguoi(r.NguoiGhi)),
          nhan.length ? h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap;margin-top:4px' }, nhan) : null),
        h('div', { class: 'cs', style: 'white-space:pre-line' }, chiSoChu(r, khung)),
        h('div', { class: 'tt', style: bt ? 'color:#A3141D' : '' }, r.TieuThu === '' || r.TieuThu === undefined || r.TieuThu === null ? '–' : so(r.TieuThu)),
        ghi.length ? h('div', { class: 'ghi-ls' }, h('span', { class: 'vi' }, ghi.join(' · '))) : null);
    };
    const ds = dsGhi.slice().reverse();
    if (!ds.length) goc.appendChild(h('div', { class: 'ghi-chu', style: 'padding:10px 0' }, ME.L('ct.chuaCoGhi')));
    ds.slice(0, 8).forEach(function (r) { goc.appendChild(veDong(r)); });
    const con = ds.slice(8);
    const vung = h('div', null, goc);
    if (con.length) {
      const nut = h('button', { type: 'button', class: 'lien-ket-phai', style: 'width:100%;text-align:center;min-height:48px;border-top:1px solid #EAECF0', onClick: function () { nut.remove(); con.forEach(function (r) { goc.appendChild(veDong(r)); }); themTuMay(); } }, ME.L('chung.xemThem'));
      vung.appendChild(nut);
    } else if (ds.length) {
      const nut2 = h('button', { type: 'button', class: 'lien-ket-phai', style: 'width:100%;text-align:center;min-height:48px;border-top:1px solid #EAECF0', onClick: function () { nut2.remove(); themTuMay(); } }, ME.L('ct.xemThemMay'));
      vung.appendChild(nut2);
    }
    // Lịch sử cũ hơn cửa sổ trên máy: lấy từ máy chủ (lichSuChiSo).
    function themTuMay() {
      if (!ME.coMang()) return;
      const cuNhat = ds.length ? ds[ds.length - 1].NgayTinh : '';
      if (!cuNhat) return;
      ME.goiMang('lichSuChiSo', { maCT: ct.MaCT, denNgay: ME.congNgay(cuNhat, -1), gioiHan: 200 }, { nhan: 'chung.dangTai' }).then(function (d) {
        const b = d.bang || {};
        (b.dong || []).forEach(function (row) {
          const r = {};
          (b.cot || []).forEach(function (c, i) { r[c] = row[i]; });
          goc.appendChild(veDong(r));
          ds.push(r);
        });
      }).catch(ME.boQua);
    }
    vung._ds = ds;
    return vung;
  }
  function xuatCsv(ct, ds) {
    const khung = dn.khungCua(ct);
    const dau = ['MaCT', 'NgayTinh', 'GhiLuc', 'NguoiGhi'].concat(khung.map(function (k) { return 'ChiSo' + k; })).concat(khung.length > 1 ? khung.map(function (k) { return 'TieuThu' + k; }) : []).concat(['TieuThu', 'HeSoDung', 'Co', 'GhiChu', 'NguoiDuyet']);
    const dong = [dau].concat(ds.map(function (r) {
      return dau.map(function (c) {
        if (c === 'NguoiGhi' || c === 'NguoiDuyet') return r[c] ? ME.tenNguoi(r[c]) + ' (' + r[c] + ')' : '';
        if (c === 'GhiLuc') return r.GhiLuc ? ME.ngayGioVi(r.GhiLuc) : '';
        const v = r[c];
        return typeof v === 'number' ? String(v).replace('.', ',') : (v === undefined ? '' : v);
      });
    }));
    ME.taiTep('chi-so-' + ct.MaCT + '-' + ME.homNay() + '.csv', ME.csv(dong));
  }
  ME.tuyen('/dn/ct/:ma', {
    ve: function (ts) {
      const ct = ME.du.lay('CongTo', ts.ma);
      if (!ct) {
        return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'ct.tieuDe', quayLai: '/dn' }),
          h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('gs.khongThay', { ma: ts.ma })))));
      }
      if (stCT.ma !== ct.MaCT) { stCT.ma = ct.MaCT; stCT.chon = null; stCT.tab = 'ngay'; }
      const loai = dn.loai(ct);
      const dv = dn.donVi(ct);
      const hs = Number(ct.HeSoNhan) > 0 ? Number(ct.HeSoNhan) : 1;
      const thang = dn.thangChon;
      const d = soLieu(thang);
      const x = d && d.congTo ? d.congTo[ct.MaCT] : null;
      const tLoai = ME.dmTen('LOAI_CONG_TO', ct.Loai);
      const tTT = ME.dmTen('TRANG_THAI_CONG_TO', ct.TrangThai || 'DANG_DUNG');
      const mTT = MAU_TT_CT[ct.TrangThai || 'DANG_DUNG'] || MAU_TT_CT.NGUNG;
      const dung = !ct.TrangThai || ct.TrangThai === 'DANG_DUNG';
      const dsGhi = dn.dsGhi(ct.MaCT);
      const m = thangSo(thang);
      const nut = [];
      if (ME.co('GHI_CHI_SO') && dung) nut.push(h('a', { class: 'nut-tron-dau vang', href: '#/dn/ghi/' + enc(ct.MaCT) }, ME.ic('set', 18, 2), h('span', null, ME.L('dn.ghiChiSo'))));
      if (ME.co('QUAN_LY_DIEN_NUOC')) nut.push(h('a', { class: 'nut-tron-dau', href: '#/dn/ct/' + enc(ct.MaCT) + '/thay' }, ME.ic('dongBo', 18, 2), h('span', null, ME.L('ct.thayCT'))));
      const dau = ME.ui.dau({
        tieuDe: 'ct.tieuDe', nho: true, quayLai: '/dn', lop: 'd18',
        phai: ME.co('QUAN_LY_DIEN_NUOC') ? ME.ui.nutIcon('but', 'ct.sua', '/dn/cong-to/' + enc(ct.MaCT) + '/sua', 'phai') : null,
        duoi: [h('div', { class: 'ct-dau' }, h('div', { class: 'giua' },
          h('span', { class: 'nhan-trang', style: 'color:' + mTT[2] }, h('span', { class: 'cham', style: 'background:' + mTT[1] }), h('span', null, ME.L2(tTT.vi, tTT.zh))),
          h('h1', null, ct.MaCT + ' · ' + (ct.TenVi || '')), ct.TenZh ? h('div', { class: 'zh-lon' }, ct.TenZh) : null,
          h('div', { class: 'mo-ta-dau' }, h('span', { class: 'vi' }, [tLoai.vi, ME.tv('ct.heSo', { hs: ME.soVi(hs) }), viTriCT(ct).vi].filter(Boolean).join(' · ')),
            h('span', { class: 'zh' }, [tLoai.zh, ME.tz('ct.heSo', { hs: ME.soZh(hs) }), viTriCT(ct).zh].filter(Boolean).join(' · '))))),
        nut.length ? h('div', { style: 'display:flex;gap:8px' }, nut) : null]
      });
      const noiDung = [];
      if (x) {
        noiDung.push(h('div', { class: 'luoi-3the' },
          h('section', null, ME.L('ct.thangN', { m: m }), h('div', { class: 'so3' }, h('b', null, so(x.tongThang)), h('span', null, ' ' + dv))),
          h('section', null, ME.L('ct.tbNgay'), h('div', { class: 'so3' }, h('b', null, x.tbNgay === null ? '–' : so(x.tbNgay)), h('span', null, ' ' + dv))),
          h('section', null, ME.L('ct.caoNhat'), h('div', { class: 'so3' }, h('b', null, x.caoNhat ? so(x.caoNhat.giaTri) : '–'),
            h('span', null, x.caoNhat ? ' · ' + ME.ngayVi(thang + '-' + ME.p2(x.caoNhat.ngay), true) : '')))));
        // Biểu đồ ngày / tháng
        const laNgay = stCT.tab === 'ngay';
        const gt = laNgay ? x.theoNgay : x.thang12;
        if (stCT.chon === null || stCT.chon >= gt.length || gt[stCT.chon] === null) {
          stCT.chon = null;
          if (laNgay && x.caoNhat && x.ngayBatThuong.length) stCT.chon = x.caoNhat.ngay - 1;
          else for (let i = gt.length - 1; i >= 0; i--) if (gt[i] !== null && gt[i] !== 0) { stCT.chon = i; break; }
        }
        const doDo = {};
        if (laNgay) x.ngayBatThuong.forEach(function (k) { doDo[k] = true; });
        const nguong = Number(ME.cauHinh('NGUONG_BAT_THUONG_PT')) || 30;
        const soNgayTB = Number(ME.cauHinh('SO_NGAY_TRUNG_BINH')) || 7;
        const diem = h('div', { class: 'diem-nhan' });
        if (stCT.chon !== null) {
          let vi;
          let zh;
          if (laNgay) {
            const ngay = thang + '-' + ME.p2(stCT.chon + 1);
            vi = [ME.ngayVi(ngay, true), ME.thuVi(ngay)];
            zh = [ME.ngayZh(ngay, true), ME.thuZh(ngay)];
            if (doDo[stCT.chon + 1]) {
              const truocDo = dsGhi.filter(function (r) { return r.NgayTinh < ngay; });
              const tb = dn.trungBinhNgay(truocDo, ngay, soNgayTB);
              if (tb && tb.tong > 0) {
                const pt = Math.round((gt[stCT.chon] / tb.tong - 1) * 100);
                vi.push(ME.tv('ct.caoHonTB', { n: soNgayTB, pt: pt }));
                zh.push(ME.tz('ct.caoHonTB', { n: soNgayTB, pt: pt }));
              } else { vi.push(ME.tv('ct.batThuong').toLowerCase()); zh.push(ME.tz('ct.batThuong')); }
            }
          } else {
            const th = ME.congThang(thang, stCT.chon - 11);
            const t = tenThang(th);
            vi = [t.vi];
            zh = [t.zh];
          }
          ME.them(diem, [h('div', null, h('b', null, so(gt[stCT.chon])), ' ', h('span', { class: 'dv' }, dv)), h('span', { class: 'vi' }, vi.join(' · ')), h('span', { class: 'zh' }, zh.join(' · '))]);
        }
        const nhanThang = [];
        if (!laNgay) for (let i = 0; i < 12; i++) if (i % 2 === 1 || i === 11) nhanThang.push([i, String(Number(ME.congThang(thang, i - 11).slice(5)))]);
        const tbThang = x.tbNgay;
        const tieu = ME.t('dn.theoNgay', { m: m });
        noiDung.push(h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
          h('div', { class: 'the-dau' }, h('div', { class: 'tieu tieu-the' }, h('h2', { class: 'vi' }, laNgay ? tieu.vi : ME.tv('dn.thang12')), h('span', { class: 'zh' }, laNgay ? tieu.zh : ME.tz('dn.thang12'))),
            h('div', { class: 'tab-nho', role: 'tablist' }, [['ngay', 'ct.ngay'], ['thang', 'ct.thang']].map(function (t) {
              return h('button', { type: 'button', role: 'tab', 'aria-selected': String(stCT.tab === t[0]), onClick: function () { stCT.tab = t[0]; stCT.chon = null; ME.veLai(); } }, ME.L(t[1]));
            }))),
          diem,
          d.cucBo && !laNgay ? h('div', { class: 'ghi-chu' }, ME.L('dn.thang12CanMang')) : null,
          ME.bd.cotNgay({
            gt: gt, mau: loai === 'dien' ? ME.bd.MAU.dien : ME.bd.MAU.nuoc, do: doDo, duongNgang: laNgay ? tbThang : null,
            nhanDuong: laNgay && tbThang ? ME.tv('ct.tbThang', { so: so(tbThang) }) + ' · ' + ME.tz('ct.tbThang') : '', chon: stCT.chon, nhanX: laNgay ? null : nhanThang,
            onChon: function (i) { stCT.chon = i; ME.veLai(); }, moTa: (laNgay ? tieu.vi : ME.tv('dn.thang12')) + ' ' + ct.MaCT
          }),
          laNgay ? h('div', { class: 'chu-giai' },
            h('div', null, h('span', { class: 'o-mau', style: 'background:' + (loai === 'dien' ? ME.bd.MAU.dien : ME.bd.MAU.nuoc) }), h('span', { class: 'chu' }, ME.L('ct.binhThuong'))),
            h('div', null, h('span', { class: 'o-mau', style: 'background:' + ME.bd.MAU.vuot }), h('span', { class: 'chu' }, ME.L('ct.batThuong'))),
            tbThang ? h('div', null, h('span', { style: 'width:14px;border-top:2px dashed #475467;flex-shrink:0' }), h('span', { class: 'chu' }, h('span', { class: 'vi' }, ME.tv('ct.tbThang', { so: so(tbThang) })), h('span', { class: 'zh' }, ME.tz('ct.tbThang')))) : null) : null,
          laNgay ? h('div', { class: 'chan-the' }, h('div', { class: 'ghi' }, ME.L('ct.giaiBatThuong', { n: soNgayTB, pt: nguong }))) : null));
      } else if (!d) {
        noiDung.push(ME.coMang() ? ME.ui.dangTai('dn.dangTaiSo') : h('div', { class: 'hop-cb' }, ME.ic('matMang', 20, 2), h('div', { class: 'chu' }, ME.L('dn.canMangThang'))));
      }
      const ls = bangLichSu(ct, dsGhi);
      noiDung.push(h('section', { class: 'the', style: 'padding:14px 14px 4px' },
        ME.ui.theTieuDe('ct.lichSu', null, h('button', { type: 'button', class: 'nut-vien mo', onClick: function () { xuatCsv(ct, ls._ds); } }, ME.ic('taiXuong', 18, 2), h('span', null, ME.L('ct.xuat')))),
        h('div', { style: 'margin-top:8px' }, ls)));
      const cha = ct.MaCTCha ? ME.du.lay('CongTo', ct.MaCTCha) : null;
      const dong = function (k, vi, zh) { return vi === '' || vi === null || vi === undefined ? ME.ui.dongTT(k, '—', '', true) : ME.ui.dongTT(k, vi, zh || ''); };
      noiDung.push(h('section', { class: 'the', style: 'padding:14px 14px 4px' }, ME.ui.theTieuDe('ct.ttCongTo'),
        h('dl', { class: 'ds-tt', style: 'margin-top:6px' },
          dong('ct.heSoNhan', '×' + ME.soVi(hs) + (ct.GhiChu ? ' (' + ct.GhiChu + ')' : '')),
          dong('ct.loai', tLoai.vi, tLoai.zh),
          ct.MaCTCha ? h('a', { class: 'dong', href: '#/dn/ct/' + enc(ct.MaCTCha), style: 'text-decoration:none;color:inherit' }, h('dt', null, ME.L('ct.ctCha')),
            h('dd', null, ME.L2(ct.MaCTCha + (cha && cha.TenVi ? ' · ' + cha.TenVi : ''), cha ? cha.TenZh : ''))) : dong('ct.ctCha', ''),
          dong('ct.soToiDa', ct.SoToiDa ? ME.soVi(ct.SoToiDa, 3) : ''),
          dong('ct.dinhMuc', ct.DinhMucNgay ? so(ct.DinhMucNgay, dv) : ''),
          dong('ct.khuVuc', ct.KhuVuc ? ME.dmTen('KHU_VUC', ct.KhuVuc).vi : '', ct.KhuVuc ? ME.dmTen('KHU_VUC', ct.KhuVuc).zh : ''),
          dong('ct.viTri', ct.ViTri || ''),
          dong('ct.ngayLap', ct.NgayLap ? ME.ngayVi(ct.NgayLap) : '', ct.NgayLap ? ME.ngayZh(ct.NgayLap) : ''),
          dong('ct.maQR', ct.MaQR || ct.MaCT))));
      return h('div', { class: 'trang' }, dau, h('main', { class: 'noi-dung' }, noiDung));
    },
    sauVe: function (el, ts) { taiTongHop(dn.thangChon, function () { const ht = ME.hienTai(); if (ht && ht.duong === '/dn/ct/' + ts.ma) ME.veLai(); }); },
    capNhat: function (el, loai) { if (loai !== 'dong-bo') ME.veLai(); }
  });

  // ═════════ Thay công tơ ═════════
  ME.tuyen('/dn/ct/:ma/thay', {
    ve: function (ts) {
      const ct = ME.du.lay('CongTo', ts.ma);
      if (!ct || !ME.co('QUAN_LY_DIEN_NUOC')) return ME.ui.manKhongQuyen('ct.thayCT');
      const khung = dn.khungCua(ct);
      const cuoi = {};
      const dau = {};
      const truong = [];
      const t = ME.t('thay.tieuDe', { ma: ct.MaCT });
      khung.forEach(function (k) {
        const tk = khung.length > 1 ? tenKhung(k) : { vi: '', zh: '' };
        cuoi[k] = ME.ui.oNhap({ inputmode: 'decimal' });
        dau[k] = ME.ui.oNhap({ inputmode: 'decimal', value: '0' });
        truong.push(h('div', { class: 'luoi-2' },
          ME.ui.truong([ME.tv('thay.soCuoi') + (tk.vi ? ' · ' + tk.vi : ''), ME.tz('thay.soCuoi') + (tk.zh ? ' · ' + tk.zh : '')], cuoi[k], true),
          ME.ui.truong([ME.tv('thay.soDau') + (tk.vi ? ' · ' + tk.vi : ''), ME.tz('thay.soDau') + (tk.zh ? ' · ' + tk.zh : '')], dau[k], true)));
      });
      const heSo = ME.ui.oNhap({ inputmode: 'decimal', value: ME.soVi(Number(ct.HeSoNhan) || 1) });
      const soToiDa = ME.ui.oNhap({ inputmode: 'decimal', value: ct.SoToiDa ? ME.soVi(ct.SoToiDa, 3) : '' });
      const gc = ME.ui.oNhap({ maxlength: 300 });
      let anh = null;
      const chonAnh = ME.ui.chonAnh({ onAnh: function (a) { anh = a; }, onBo: function () { anh = null; } });
      function luu(xacNhan) {
        const docKhung = function (o) {
          const ra = {};
          for (let i = 0; i < khung.length; i++) {
            const n = ME.docSo(o[khung[i]].value, true);
            if (isNaN(n) || n < 0) { ME.baoLoi(ME.loiMoi('SO_SAI', { gt: o[khung[i]].value })); return null; }
            ra[khung[i]] = n;
          }
          return khung.length === 1 ? ra.BT : ra;
        };
        const c = docKhung(cuoi);
        if (c === null) return;
        const d = docKhung(dau);
        if (d === null) return;
        const data = { maCT: ct.MaCT, soCuoiCu: c, soDauMoi: d, heSoMoi: heSo.value.trim() === '' ? '' : ME.docSo(heSo.value), soToiDaMoi: soToiDa.value.trim() === '' ? '' : ME.docSo(soToiDa.value, true), ghiChu: gc.value.trim() };
        if (anh) data.anh = anh.base64;
        if (xacNhan) data.xacNhan = true;
        ME.goiMang('thayCongTo', data, { nhan: 'chung.dangLuu', khongBao: true }).then(function () {
          ME.thongBao('thay.xong', null, { ma: ct.MaCT });
          return ME.dongBo().then(function () { ME.di('/dn/ct/' + enc(ct.MaCT), true); });
        }).catch(function (e) {
          if (e && e.ma === 'CAN_XAC_NHAN') {
            return ME.hoi({ tieuDe: 'ui.choXacNhan', loiNhan: { vi: e.vi, zh: e.zh }, nut: [{ nhan: 'chung.vanLuu', gt: true, chinh: true }, { nhan: 'chung.suaLai', gt: false }] })
              .then(function (ok) { if (ok) luu(true); });
          }
          if (e && !e.huy && !ME.laLoiPhien(e)) ME.baoLoi(e);
        });
      }
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: [t.vi, t.zh], nho: true, quayLai: '/dn/ct/' + enc(ct.MaCT) }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('thay.giai'))),
          h('div', { class: 'bieu-mau' }, truong,
            h('div', { class: 'luoi-2' }, ME.ui.truong('thay.heSoMoi', heSo), ME.ui.truong('thay.soToiDaMoi', soToiDa)),
            ME.ui.truong('thay.anh', chonAnh),
            ME.ui.truong('chung.ghiChu', gc))),
        h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: function () { luu(false); } }, ME.L('thay.luu'))));
    }
  });

  // ═════════ Danh sách công tơ ═════════
  ME.tuyen('/dn/cong-to', {
    ve: function () {
      const ds = ME.du.ds('CongTo').filter(function (c) { return c.MaCT; }).sort(function (a, b) { return String(a.MaCT).localeCompare(String(b.MaCT), 'vi', { numeric: true }); });
      const dung = function (c) { return !c.TrangThai || c.TrangThai === 'DANG_DUNG'; };
      const nhom = [
        ['ctds.dien', ds.filter(function (c) { return dung(c) && dn.loai(c) === 'dien'; })],
        ['ctds.nuoc', ds.filter(function (c) { return dung(c) && dn.loai(c) === 'nuoc'; })],
        ['ctds.ngung', ds.filter(function (c) { return !dung(c); })]
      ].filter(function (n) { return n[1].length; });
      const quanLy = ME.co('QUAN_LY_DIEN_NUOC');
      return h('div', { class: 'trang' },
        ME.ui.dau({ tieuDe: 'ctds.tieuDe', quayLai: '/dn', phai: quanLy ? ME.ui.nutIcon('cong', 'dn.themCongTo', '/dn/cong-to/them', 'phai') : null }),
        h('main', { class: 'noi-dung' },
          nhom.length ? nhom.map(function (n) {
            return h('section', { class: 'the', style: 'padding:14px 14px 4px' }, ME.ui.theTieuDe(n[0]), h('div', { style: 'margin-top:4px' }, n[1].map(function (c) { return dongCT(c); })));
          }) : h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('dn.chuaCoCongTo'))),
          ds.length ? h('a', { class: 'nut-vien', href: '#/tb/in-tem?ct=' + enc(ds.map(function (c) { return c.MaCT; }).join(',')) }, ME.ic('mayIn', 18, 2), h('span', null, ME.L('ctds.inTem'))) : null,
          quanLy && !ds.length ? h('a', { class: 'nut-chinh', href: '#/dn/cong-to/them' }, ME.L('dn.themCongTo')) : null));
    },
    tuLamMoi: true
  });

  // ═════════ Thêm / sửa công tơ ═════════
  function formCT(maSua) {
    if (!ME.co('QUAN_LY_DIEN_NUOC')) return ME.ui.manKhongQuyen(maSua ? 'ctf.sua' : 'ctf.them');
    const r = maSua ? ME.du.lay('CongTo', maSua) : {};
    if (maSua && !r) return ME.ui.manKhongQuyen('ctf.sua');
    const coSo = maSua && ME.du.ds('ChiSo').some(function (x) { return x.MaCT === maSua; });
    const f = {
      MaCT: ME.ui.oNhap({ value: r.MaCT || '', disabled: !!maSua, autocapitalize: 'characters', maxlength: 30 }),
      TenVi: ME.ui.oNhap({ value: r.TenVi || '', maxlength: 200 }),
      TenZh: ME.ui.oNhap({ value: r.TenZh || '', maxlength: 200, lang: 'zh-Hans' }),
      Loai: ME.ui.chonO(ME.dsDM('LOAI_CONG_TO', true), { giaTri: r.Loai || 'DIEN_1_GIA', trong: false, disabled: coSo }),
      KhuVuc: ME.ui.chonO(ME.dsDM('KHU_VUC'), { giaTri: r.KhuVuc, nhanTrong: 'chung.khongChon' }),
      ViTri: ME.ui.oNhap({ value: r.ViTri || '' }),
      MaCTCha: ME.ui.chonO(ME.du.ds('CongTo').filter(function (c) { return c.MaCT && c.MaCT !== maSua; }).sort(function (a, b) { return String(a.MaCT).localeCompare(String(b.MaCT), 'vi', { numeric: true }); })
        .map(function (c) { return { gt: c.MaCT, vi: c.MaCT + ' · ' + (c.TenVi || ''), zh: '' }; }), { giaTri: r.MaCTCha, nhanTrong: 'chung.khongChon' }),
      HeSoNhan: ME.ui.oNhap({ inputmode: 'decimal', value: r.HeSoNhan ? ME.soVi(r.HeSoNhan) : '1' }),
      SoToiDa: ME.ui.oNhap({ inputmode: 'decimal', value: r.SoToiDa ? ME.soVi(r.SoToiDa, 3) : '' }),
      DinhMucNgay: ME.ui.oNhap({ inputmode: 'decimal', value: r.DinhMucNgay ? ME.soVi(r.DinhMucNgay) : '' }),
      MaQR: ME.ui.oNhap({ value: r.MaQR || '', autocapitalize: 'characters', maxlength: 100 }),
      TrangThai: ME.ui.chonO(ME.dsDM('TRANG_THAI_CONG_TO', true), { giaTri: r.TrangThai || 'DANG_DUNG', trong: false }),
      NgayLap: ME.ui.oNhap({ type: 'date', value: r.NgayLap || '' }),
      GhiChu: ME.ui.oNhap({ value: r.GhiChu || '', maxlength: 500 })
    };
    const vungLoi = h('div');
    function luu() {
      ME.xoaCon(vungLoi);
      const ct = {};
      ct.MaCT = maSua || ME.chuanMa(f.MaCT.value);
      if (!/^[A-Z0-9][A-Z0-9._-]{0,29}$/.test(ct.MaCT)) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiMoi('MA_SAI'))); return; }
      ['TenVi', 'TenZh', 'Loai', 'KhuVuc', 'ViTri', 'MaCTCha', 'MaQR', 'TrangThai', 'NgayLap', 'GhiChu'].forEach(function (k) { ct[k] = String(f[k].value || '').trim(); });
      if (coSo) delete ct.Loai;
      if (!ct.TenVi) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiThieu('ctf.tenVi'))); return; }
      const docSoTruong = function (k, batBuoc) {
        const v = f[k].value.trim();
        if (v === '') { if (batBuoc) throw ME.loiMoi('SO_SAI', { gt: v }); return ''; }
        const n = ME.docSo(v, k === 'SoToiDa');
        if (!(n > 0)) throw ME.loiMoi('SO_SAI', { gt: v });
        return n;
      };
      try {
        ct.HeSoNhan = docSoTruong('HeSoNhan', true);
        ct.SoToiDa = docSoTruong('SoToiDa');
        ct.DinhMucNgay = docSoTruong('DinhMucNgay');
      } catch (e) { vungLoi.appendChild(ME.ui.loiTruong(e)); return; }
      if (maSua && r.PhienBan !== undefined && r.PhienBan !== '') ct.PhienBan = r.PhienBan;
      ME.goiMang('luuCongTo', { ct: ct }, { nhan: 'chung.dangLuu' }).then(function () {
        ME.thongBao('ctf.daLuu', null, { ma: ct.MaCT });
        return ME.dongBo().then(function () { ME.di('/dn/ct/' + enc(ct.MaCT), true); });
      }).catch(ME.boQua);
    }
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: maSua ? 'ctf.sua' : 'ctf.them', nho: true, quayLai: maSua ? '/dn/ct/' + enc(maSua) : '/dn/cong-to' }),
      h('main', { class: 'noi-dung' },
        h('div', { class: 'bieu-mau' },
          ME.ui.truongGY('ctf.ma', f.MaCT, !maSua, maSua ? null : 'ctf.maGoiY'),
          ME.ui.truong('ctf.tenVi', f.TenVi, true),
          ME.ui.truong('ctf.tenZh', f.TenZh),
          ME.ui.truongGY('ctf.loai', f.Loai, true, coSo ? 'ctf.loaiKhoa' : null),
          h('div', { class: 'luoi-2' }, ME.ui.truong('ct.khuVuc', f.KhuVuc), ME.ui.truong('ct.viTri', f.ViTri)),
          ME.ui.truong('ctf.cha', f.MaCTCha),
          ME.ui.truongGY('ctf.heSo', f.HeSoNhan, true, 'ctf.heSoGoiY'),
          ME.ui.truongGY('ctf.soToiDa', f.SoToiDa, false, 'ctf.soToiDaGoiY'),
          ME.ui.truongGY('ctf.dinhMuc', f.DinhMucNgay, false, 'ctf.dinhMucGoiY'),
          h('div', { class: 'luoi-2' }, ME.ui.truong('ct.trangThai', f.TrangThai), ME.ui.truong('ct.ngayLap', f.NgayLap)),
          ME.ui.truongGY('ctf.maQR', f.MaQR, false, 'ctf.maQRGoiY'),
          ME.ui.truong('chung.ghiChu', f.GhiChu),
          vungLoi)),
      h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('ctf.luu'))));
  }
  ME.tuyen('/dn/cong-to/them', { ve: function () { return formCT(null); } });
  ME.tuyen('/dn/cong-to/:ma/sua', { ve: function (ts) { return formCT(ts.ma); } });

  // ═════════ Bảng giá ═════════
  ME.tuyen('/dn/bang-gia', {
    ve: function () {
      if (!ME.co('QUAN_LY_DIEN_NUOC')) return ME.ui.manKhongQuyen('bg.tieuDe');
      const ds = ME.du.ds('BieuGia').filter(function (r) { return r.TuNgay && r.DonGia !== ''; });
      const hn = ME.homNay();
      const nhom = ME.dsDM('LOAI_GIA', true).map(function (l) {
        const cua = ds.filter(function (r) { return r.Loai === l.gt; }).sort(function (a, b) { return a.TuNgay < b.TuNgay ? 1 : -1; });
        const dangAD = cua.filter(function (r) { return r.TuNgay <= hn && (!r.DenNgay || r.DenNgay >= hn); })[0];
        return { l: l, ds: cua, dangAD: dangAD };
      });
      function them() {
        const loai = ME.ui.chonO(ME.dsDM('LOAI_GIA', true), { trong: false });
        const gia = ME.ui.oNhap({ inputmode: 'decimal' });
        const tu = ME.ui.oNhap({ type: 'date', value: hn });
        const den = ME.ui.oNhap({ type: 'date' });
        const gc = ME.ui.oNhap({ maxlength: 300 });
        ME.hoi({
          tieuDe: 'bg.them', noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            ME.ui.truong('bg.loai', loai), ME.ui.truong('bg.donGia', gia, true), h('div', { class: 'luoi-2' }, ME.ui.truong('chung.tuNgay', tu, true), ME.ui.truong('chung.denNgay', den)), ME.ui.truong('chung.ghiChu', gc)),
          nut: [{ nhan: 'chung.luu', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true, dongNgoai: false
        }).then(function (ok) {
          if (!ok) return;
          const n = ME.docSo(gia.value);
          if (!(n > 0)) { ME.baoLoi(ME.loiMoi('SO_SAI', { gt: gia.value })); return; }
          ME.goiMang('luuBieuGia', { ds: [{ Loai: loai.value, DonGia: n, TuNgay: tu.value, DenNgay: den.value, GhiChu: gc.value.trim() }] }, { nhan: 'chung.dangLuu' })
            .then(function () { ME.thongBao('bg.daLuu'); return ME.dongBo(); }).catch(ME.boQua);
        });
      }
      function xoa(r) {
        ME.hoi({ loiNhan: 'bg.xoaHoi', nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true }).then(function (ok) {
          if (!ok) return;
          ME.goiMang('luuBieuGia', { ds: [{ Loai: r.Loai, TuNgay: r.TuNgay, xoa: true }] }, { nhan: 'chung.dangLuu' }).then(function () { return ME.dongBo(); }).catch(ME.boQua);
        });
      }
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'bg.tieuDe', quayLai: '/dn', phai: ME.ui.nutIcon('cong', 'bg.them', them, 'phai') }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('bg.giai'))),
          ds.length ? nhom.filter(function (n) { return n.ds.length; }).map(function (n) {
            const dvk = n.l.gt === 'NUOC' ? 'bg.dvNuoc' : 'bg.dvDien';
            return h('section', { class: 'the', style: 'padding:14px 14px 4px' }, ME.ui.theTieuDe([n.l.vi, n.l.zh]),
              n.ds.map(function (r) {
                const ad = r === n.dangAD;
                return h('div', { class: 'dong-hang' },
                  h('div', { class: 'giua' }, h('span', { class: 'vi' }, ME.soVi(r.DonGia) + ' ' + ME.tv(dvk)),
                    h('div', { class: 'phu' }, ME.tv('bg.tu', { ngay: ME.ngayVi(r.TuNgay) }) + (r.DenNgay ? ME.tv('bg.den', { ngay: ME.ngayVi(r.DenNgay) }) : '') + (r.GhiChu ? ' · ' + r.GhiChu : ''))),
                  ad ? ME.ui.nhanTTK('bg.dangApDung', 'xanh') : null,
                  h('button', { type: 'button', class: 'nut-icon', 'aria-label': ME.t1('chung.xoa'), onClick: function () { xoa(r); } }, ME.ic('thungRac', 18, 1.8)));
              }));
          }) : h('div', { class: 'trong-rong' }, ME.L('bg.trong')),
          h('button', { type: 'button', class: 'nut-vien', onClick: them }, ME.ic('cong', 18, 2), h('span', null, ME.L('bg.them')))));
    },
    tuLamMoi: true
  });
})();

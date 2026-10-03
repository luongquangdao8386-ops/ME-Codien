/* ME – Quản lý Cơ điện · 机电管理系统
   man-thiet-bi.js — Danh sách thiết bị (bản vẽ 4), Chi tiết thiết bị: Thông số (bản vẽ 5), Linh kiện của máy (bản vẽ 6),
   Lịch sử, Tài liệu; thêm / sửa thiết bị, gắn linh kiện, đổi trạng thái, tem QR, in tem. */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;
  const enc = encodeURIComponent;

  ME.nhan('Thiết bị', {
    'tb.tieuDe': ['Thiết bị', '设备'],
    'tb.tim': ['Tìm mã, tên, model', '搜索设备'],
    'tb.quet': ['Quét mã QR thiết bị', '扫描设备二维码'],
    'tb.them': ['Thêm thiết bị', '新增设备'],
    'tb.khuVuc': ['Khu vực', '区域'],
    'tb.tatCaKhuVuc': ['Tất cả khu vực', '全部区域'],
    'tb.chuaCoKhuVuc': ['Chưa xếp khu vực', '未分区域'],
    'tb.trong': ['Chưa có thiết bị nào', '暂无设备'],
    'tb.trongLoc': ['Không có thiết bị khớp bộ lọc', '没有符合条件的设备'],
    'tb.chiTiet': ['Chi tiết thiết bị', '设备详情'],
    'tb.suaTB': ['Sửa thiết bị', '编辑设备'],
    'tb.themTuyChon': ['Thêm tùy chọn', '更多'],
    'tb.anhMay': ['Ảnh máy', '设备照片'],
    'tb.doiTrangThai': ['Đổi trạng thái', '更改状态'],
    'tb.temQR': ['Tem QR', '二维码'],
    'tb.tabThongSo': ['Thông số', '参数'],
    'tb.tabLinhKien': ['Linh kiện', '备件'],
    'tb.tabLichSu': ['Lịch sử', '履历'],
    'tb.tabTaiLieu': ['Tài liệu', '资料'],
    'tb.ttChung': ['Thông tin chung', '基本信息'],
    'tb.ma': ['Mã thiết bị', '设备编号'],
    'tb.tenVi': ['Tên tiếng Việt', '越南语名称'],
    'tb.tenZh': ['Tên tiếng Trung', '中文名称'],
    'tb.loaiTB': ['Loại thiết bị', '设备类别'],
    'tb.viTri': ['Vị trí', '位置'],
    'tb.hangSX': ['Hãng sản xuất', '制造商'],
    'tb.model': ['Model', '型号'],
    'tb.soSeri': ['Số seri', '出厂编号'],
    'tb.namSX': ['Năm sản xuất', '出厂年份'],
    'tb.ngaySD': ['Ngày đưa vào sử dụng', '投用日期'],
    'tb.mucQT': ['Mức quan trọng', '重要等级'],
    'tb.nguoiPT': ['Người phụ trách', '负责人'],
    'tb.mayCha': ['Máy cha', '上级设备'],
    'tb.trangThai': ['Trạng thái', '状态'],
    'tb.taiLieuUrl': ['Link tài liệu', '资料链接'],
    'tb.mauTS': ['Mẫu thông số: {loai} · Cập nhật {ngay}', '参数模板：{loai} · 更新于 {ngay}'],
    'tb.suaTS': ['Sửa thông số', '编辑参数'],
    'tb.chuaCoTS': ['Chưa có mẫu thông số cho loại máy này. Quản trị thêm ở Tất cả → Mẫu thông số.', '此设备类别尚无参数模板，管理员可在“全部 → 参数模板”中添加。'],
    'tb.tsKhac': ['Thông số khác', '其他参数'],
    'tb.lkTomTat': ['{n} linh kiện · {m} cần chú ý', '{n}种备件 · {m}项需关注'],
    'tb.ganLK': ['Gắn linh kiện', '添加备件'],
    'tb.tonTheoFile': ['Tồn kho theo file kho ngày {ngay}', '库存数据截至 {ngay}'],
    'tb.lap': ['Lắp ({dv})', '用量（{dv}）'],
    'tb.chuKy': ['Chu kỳ thay ({dv})', '更换周期（{dv}）'],
    'tb.chuKyKhong': ['Chu kỳ thay', '更换周期'],
    'tb.theoTinhTrang': ['Theo tình trạng', '视状态'],
    'tb.ton': ['Tồn kho ({dv})', '库存（{dv}）'],
    'tb.thayCuoi': ['Thay lần cuối: {ngay}', '上次更换：{ngay}'],
    'tb.chuaThay': ['Chưa ghi lần thay', '暂无更换记录'],
    'tb.choDuyet': ['Chờ duyệt', '待审核'],
    'tb.duyet': ['Duyệt', '审核'],
    'tb.chuaGanLK': ['Máy chưa gắn linh kiện nào', '该设备尚未关联备件'],
    'tb.lichSuDot2': ['Lịch sử sửa chữa, bảo trì có từ đợt 2, khi dùng phiếu sửa chữa và phiếu bảo trì.', '维修、保养履历将在第二期启用维修单和保养单后提供。'],
    'tb.hoSo': ['Hồ sơ máy', '设备档案'],
    'tb.capNhatCuoi': ['Cập nhật lần cuối', '最后更新'],
    'tb.nguoiSua': ['Người sửa', '修改人'],
    'tb.khongTaiLieu': ['Chưa có link tài liệu.', '暂无资料链接。'],
    'tb.moTaiLieu': ['Mở tài liệu', '打开资料'],
    'tb.taiLieuGoiY': ['Dán link thư mục Drive chứa bản vẽ, catalogue, hướng dẫn vận hành ở Sửa thiết bị → Link tài liệu.', '在“编辑设备 → 资料链接”中粘贴存放图纸、样本、操作说明的Drive文件夹链接。'],
    'tb.xoaTB': ['Xóa thiết bị', '删除设备'],
    'tb.xoaHoi': ['Xóa {ma}? Thông số và linh kiện của máy vẫn giữ trong file để khôi phục được.', '删除{ma}？设备参数和备件关联仍保留在表格中，可恢复。'],
    'tb.daXoa': ['Đã xóa thiết bị', '设备已删除'],
    'tb.khongTimThay': ['Không tìm thấy thiết bị {ma} trên máy. Đồng bộ rồi thử lại.', '本机上未找到设备{ma}，请同步后重试。'],
    'tb.daDoiTT': ['Đã đổi trạng thái', '状态已更改'],
    'tb.themTieuDe': ['Thêm thiết bị', '新增设备'],
    'tb.suaTieuDe': ['Sửa thiết bị', '编辑设备'],
    'tb.maGoiY': ['Chữ in hoa không dấu, số, dấu . - _ · VD MNK-03', '大写无声调字母、数字、. - _ · 例 MNK-03'],
    'tb.dich': ['Dịch tự động', '自动翻译'],
    'tb.ttKyThuat': ['Thông số kỹ thuật', '技术参数'],
    'tb.chonLoaiTruoc': ['Chọn loại thiết bị để hiện mẫu thông số.', '选择设备类别后显示参数模板。'],
    'tb.luu': ['Lưu thiết bị', '保存设备'],
    'tb.daLuu': ['Đã lưu {ma}', '已保存{ma}'],
    'tb.trungMa': ['Mã {ma} đã có trên máy.', '编号{ma}已存在。'],
    'tb.namSai': ['Năm sản xuất không hợp lệ.', '出厂年份无效。'],
    'tb.inTemTieuDe': ['In tem QR', '打印二维码'],
    'tb.thietBi': ['Thiết bị', '设备'],
    'tb.congTo': ['Công tơ', '电表'],
    'tb.chonHet': ['Chọn hết', '全选'],
    'tb.boChon': ['Bỏ chọn', '取消全选'],
    'tb.inN': ['In {n} tem', '打印{n}个标签'],
    'tb.inGoiY': ['Tem in 3 cái mỗi hàng trên giấy A4 hoặc decal, mỗi tem có mã QR, mã và tên hai thứ tiếng. Trên iPhone: In → chọn máy in, hoặc chụm hai ngón trên bản xem trước để lưu PDF.',
      '每行3个标签，可打印在A4纸或不干胶纸上，标签含二维码、编号和中越文名称。iPhone上：打印 → 选择打印机，或在预览上双指放大保存为PDF。'],
    'tb.chuaChon': ['Chọn ít nhất một tem.', '请至少选择一个标签。'],
    'tb.mayIn': ['Máy không mở được hộp in. Chụp màn hình phần tem bên dưới để in.', '无法打开打印窗口，请截屏下方标签后打印。'],
    'tb.temCua': ['Tem QR · {ma}', '二维码 · {ma}'],
    'tb.inTem1': ['In tem này', '打印此标签'],
    'tb.choGuiMay': ['Thiết bị mới, chờ gửi', '新设备，待发送'],
    'tb.soMay': ['{n} thiết bị', '{n}台设备']
  });
  ME.nhan('Gắn linh kiện', {
    'gan.tieuDe': ['Gắn linh kiện', '添加备件'],
    'gan.suaTieuDe': ['Linh kiện của máy', '设备备件'],
    'gan.lk': ['Linh kiện', '备件'],
    'gan.chonLK': ['Chọn linh kiện', '选择备件'],
    'gan.timLK': ['Tìm mã, tên linh kiện', '搜索备件'],
    'gan.soLuong': ['Số lượng lắp', '安装数量'],
    'gan.chuKy': ['Chu kỳ thay', '更换周期'],
    'gan.donViChuKy': ['Đơn vị chu kỳ', '周期单位'],
    'gan.lanThayCuoi': ['Lần thay cuối', '上次更换'],
    'gan.viTriVi': ['Vị trí lắp', '安装位置'],
    'gan.viTriZh': ['Vị trí lắp (tiếng Trung)', '安装位置（中文）'],
    'gan.deXuat': ['Bạn là kỹ thuật viên: linh kiện gắn sẽ chờ tổ trưởng duyệt.', '您是技术员：添加的备件需组长审核。'],
    'gan.boLK': ['Bỏ linh kiện khỏi máy', '从设备移除备件'],
    'gan.boHoi': ['Bỏ {ma} khỏi máy {may}?', '将{ma}从设备{may}移除？'],
    'gan.daGan': ['Đã gắn linh kiện', '已添加备件'],
    'gan.daDeXuat': ['Đã gửi đề xuất, chờ duyệt', '已提交，待审核'],
    'gan.daDuyet': ['Đã duyệt', '已审核'],
    'gan.daBo': ['Đã bỏ linh kiện khỏi máy', '已从设备移除备件'],
    'gan.luu': ['Lưu', '保存'],
    'gan.daCo': ['Linh kiện này đã gắn với máy. Mở để sửa.', '该备件已关联此设备，请打开编辑。']
  });

  // ───────── Tiện ích ─────────
  const IC_LOAI = { MNK: 'gio', CHL: 'nhiet', MBA: 'set', TU_DIEN: 'tuDien', DONG_CO_BOM: 'vongBi', MPD: 'nguon' };
  ME.icTB = function (loai) { return IC_LOAI[loai] || 'banhRang'; };
  const MAU_TT = {
    DANG_CHAY: { loai: 'xanh', cham: '#12A150', chu: '#0B6234' },
    SU_CO: { loai: 'do', cham: '#D92D20', chu: '#A3141D' },
    CHO_LK: { loai: 'cam', cham: '#F79009', chu: '#8A3E00' },
    DUNG: { loai: 'xam', cham: '#667085', chu: '#344054' }
  };
  ME.nhanTB = function (tt, lop) {
    const t = ME.dmTen('TRANG_THAI_TB', tt);
    return ME.ui.nhanTT(t.vi || tt || '—', t.zh, (MAU_TT[tt] || { loai: 'than' }).loai, lop);
  };
  /** Thay đổi thiết bị đang chờ gửi trên máy này (để hiện ngay, kể cả khi mất mạng). */
  function tbCho(maTB) {
    let o = null;
    ME.hang.ds().forEach(function (m) {
      if (m.action === 'luuThietBi' && m.data && m.data.tb && ME.chuanMa(m.data.tb.MaTB) === maTB) o = Object.assign(o || {}, m.data.tb);
    });
    return o;
  }
  function xoaCho(maTB) {
    return ME.hang.ds().some(function (m) { return m.action === 'xoaThietBi' && ME.chuanMa(m.data.maTB) === maTB; });
  }
  ME.layTB = function (maTB) {
    const r = ME.du.lay('ThietBi', maTB);
    const c = tbCho(maTB);
    if (!r && !c) return null;
    if (xoaCho(maTB)) return null;
    return c ? Object.assign({}, r || { MaTB: maTB }, c, { _cho: true }) : r;
  };
  function dsTB() {
    const theoMa = new Map();
    ME.du.ds('ThietBi').forEach(function (r) { theoMa.set(r.MaTB, r); });
    ME.hang.ds().forEach(function (m) {
      if (m.action === 'luuThietBi' && m.data && m.data.tb) {
        const ma = ME.chuanMa(m.data.tb.MaTB);
        theoMa.set(ma, Object.assign({}, theoMa.get(ma) || { MaTB: ma }, m.data.tb, { MaTB: ma, _cho: true }));
      } else if (m.action === 'xoaThietBi') theoMa.delete(ME.chuanMa(m.data.maTB));
    });
    return Array.from(theoMa.values());
  }
  ME.dsTB = dsTB;
  function tomTatTB(r, viec) { return { vi: viec.vi + ' ' + r.MaTB, zh: viec.zh + ' ' + r.MaTB }; }
  function ngayHaiDong(ngay) { return ngay ? { vi: ME.ngayVi(ngay), zh: ME.ngayZh(ngay) } : null; }

  // ═════════ Danh sách thiết bị (bản vẽ 4) ═════════
  const locTB = { tu: '', tt: '', kv: '' };
  ME.tuyen('/tb', {
    ve: function (ts, q) {
      if (q.tt !== undefined) locTB.tt = q.tt;
      if (q.kv !== undefined) locTB.kv = q.kv;
      const ds = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      const hangChip = h('div', { class: 'hang-chip nen-trang' });
      const self = this;
      function veChip() {
        ME.xoaCon(hangChip);
        hangChip.appendChild(ME.ui.chip('chung.tatCa', { chon: !locTB.tt, onClick: function () { locTB.tt = ''; veChip(); veDS(); } }));
        ME.dm('TRANG_THAI_TB').forEach(function (r) {
          hangChip.appendChild(ME.ui.chip([r.TenVi, r.TenZh], { chon: locTB.tt === r.Ma, onClick: function () { locTB.tt = locTB.tt === r.Ma ? '' : r.Ma; veChip(); veDS(); } }));
        });
        const kv = locTB.kv ? ME.dmTen('KHU_VUC', locTB.kv) : ME.t('tb.khuVuc');
        hangChip.appendChild(ME.ui.chip([kv.vi, kv.zh], {
          chon: !!locTB.kv, vien: true, icPhai: 'xuong',
          onClick: function () {
            ME.chonTu({ tieuDe: 'tb.khuVuc', hienTai: locTB.kv, ds: [{ gt: '', vi: ME.tv('tb.tatCaKhuVuc'), zh: ME.tz('tb.tatCaKhuVuc') }].concat(ME.dsDM('KHU_VUC')) })
              .then(function (gt) { if (gt === undefined) return; locTB.kv = gt; veChip(); veDS(); });
          }
        }));
      }
      function veDS() {
        ME.xoaCon(ds);
        const q2 = ME.boDau(locTB.tu);
        const tatCa = dsTB();
        if (!tatCa.length) {
          ds.appendChild(ME.ui.trong('tb.trong', null, 'banhRang'));
          if (ME.co('SUA_THIET_BI')) ds.appendChild(h('a', { class: 'nut-chinh', href: '#/tb/them' }, ME.L('tb.them')));
          return;
        }
        const loc = tatCa.filter(function (r) {
          if (locTB.tt && r.TrangThai !== locTB.tt) return false;
          if (locTB.kv && r.KhuVuc !== locTB.kv) return false;
          if (!q2) return true;
          return ME.boDau([r.MaTB, r.TenVi, r.TenZh, r.Model, r.HangSX, r.SoSeri, r.ViTri, ME.dmTen('LOAI_TB', r.LoaiTB).vi].join(' ')).indexOf(q2) >= 0 ||
            String(r.TenZh || '').indexOf(locTB.tu.trim()) >= 0;
        });
        if (!loc.length) { ds.appendChild(ME.ui.trong('tb.trongLoc', null, 'tim')); return; }
        const thuTuKV = {};
        ME.dm('KHU_VUC', true).forEach(function (r, i) { thuTuKV[r.Ma] = i; });
        const nhom = new Map();
        loc.forEach(function (r) { const k = r.KhuVuc || ''; if (!nhom.has(k)) nhom.set(k, []); nhom.get(k).push(r); });
        const khoa = Array.from(nhom.keys()).sort(function (a, b) {
          const x = a === '' ? 9999 : (thuTuKV[a] === undefined ? 5000 : thuTuKV[a]);
          const y = b === '' ? 9999 : (thuTuKV[b] === undefined ? 5000 : thuTuKV[b]);
          return x - y || String(a).localeCompare(String(b));
        });
        let dem = 0;
        khoa.forEach(function (k) {
          const t = k ? ME.dmTen('KHU_VUC', k) : ME.t('tb.chuaCoKhuVuc');
          ds.appendChild(h('h2', { class: 'nhom-tieu' }, ME.L2(t.vi, t.zh)));
          nhom.get(k).sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); }).forEach(function (r) {
            dem++;
            if (dem > 400) return;
            ds.appendChild(h('a', { class: 'muc', href: '#/tb/' + enc(r.MaTB) },
              ME.ui.oAnhNho(r.AnhId, ME.icTB(r.LoaiTB)),
              h('div', { class: 'giua' }, h('div', { class: 'ten' }, ME.L2(r.TenVi, r.TenZh)), h('div', { class: 'ma' }, r.MaTB + (r._cho ? ' · ' + ME.tv('chung.choGui') : ''))),
              ME.nhanTB(r.TrangThai, 'rong')));
          });
        });
        if (dem > 400) ds.appendChild(h('div', { class: 'ghi-chu', style: 'text-align:center' }, ME.L('chung.hienSo', { n: 400, tong: dem })));
      }
      self._veDS = veDS;
      veChip();
      veDS();
      const phai = [ME.ui.nutTron('qr', 'tb.quet', function () {
        ME.quet({ tieuDe: 'tb.quet' }).then(function (chu) { if (chu) ME.moTheoMa(chu); });
      })];
      if (ME.co('SUA_THIET_BI')) phai.push(ME.ui.nutTron('cong', 'tb.them', '/tb/them', true));
      return h('div', { class: 'trang' },
        ME.ui.dauLon({ tieuDe: 'tb.tieuDe', phai: phai, duoi: ME.ui.oTim({ goiY: 'tb.tim', giaTri: locTB.tu, onTim: function (tu) { locTB.tu = tu; veDS(); } }) }),
        hangChip,
        h('main', { class: 'noi-dung', style: 'padding-top:4px;gap:8px' }, ds),
        ME.ui.thanhDuoi('/tb'));
    },
    capNhat: function (el, loai) { if (this._veDS && loai !== 'dong-bo') this._veDS(); }
  });

  // ═════════ Thêm / sửa thiết bị ═════════
  function formTB(maSua) {
    const cu = maSua ? ME.layTB(maSua) : null;
    if (maSua && !cu) return manKhongThay(maSua);
    if (!ME.co('SUA_THIET_BI')) return ME.ui.manKhongQuyen(maSua ? 'tb.suaTieuDe' : 'tb.themTieuDe');
    const r = cu || {};
    const loi = {};
    const o = {};
    const tsCu = maSua ? (ME.du.theo('ThongSoTB', 'MaTB').get(maSua) || []) : [];
    let anh = null;
    const truong = function (khoa, el, batBuoc, goiY) { const t = ME.ui.truongGY(khoa, el, batBuoc, goiY); loi[khoa] = t; return t; };
    o.MaTB = ME.ui.oNhap({ id: 'f-ma', autocapitalize: 'characters', value: r.MaTB || '', disabled: !!maSua, maxlength: 30 });
    o.TenVi = ME.ui.oNhap({ id: 'f-tenvi', value: r.TenVi || '', maxlength: 200 });
    o.TenZh = ME.ui.oNhap({ id: 'f-tenzh', value: r.TenZh || '', maxlength: 200, lang: 'zh-Hans' });
    const vungTS = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
    const giaTriTS = {};
    tsCu.forEach(function (x) { giaTriTS[x.MaTS] = x.GiaTri; });
    o.LoaiTB = ME.ui.chonO(ME.dsDM('LOAI_TB'), { id: 'f-loai', giaTri: r.LoaiTB, onChange: veTS });
    o.KhuVuc = ME.ui.chonO(ME.dsDM('KHU_VUC'), { id: 'f-kv', giaTri: r.KhuVuc, nhanTrong: 'chung.khongChon' });
    o.ViTri = ME.ui.oNhap({ id: 'f-vitri', value: r.ViTri || '' });
    o.HangSX = ME.ui.oNhap({ id: 'f-hang', value: r.HangSX || '' });
    o.Model = ME.ui.oNhap({ id: 'f-model', value: r.Model || '' });
    o.SoSeri = ME.ui.oNhap({ id: 'f-seri', value: r.SoSeri || '' });
    o.NamSX = ME.ui.oNhap({ id: 'f-nam', inputmode: 'numeric', value: r.NamSX === undefined || r.NamSX === null ? '' : String(r.NamSX), maxlength: 4 });
    o.NgayDuaVaoSD = ME.ui.oNhap({ id: 'f-ngaysd', type: 'date', value: r.NgayDuaVaoSD || '' });
    o.MucQuanTrong = ME.ui.chonO(ME.dsDM('MUC_QUAN_TRONG'), { id: 'f-mqt', giaTri: r.MucQuanTrong, nhanTrong: 'chung.khongChon' });
    o.TrangThai = ME.ui.chonO(ME.dsDM('TRANG_THAI_TB'), { id: 'f-tt', giaTri: r.TrangThai || 'DANG_CHAY', trong: false });
    o.NguoiPhuTrach = ME.ui.chonO(ME.du.ds('NguoiDung').filter(function (x) { return x.TrangThai !== 'NGUNG'; })
      .sort(function (a, b) { return String(a.HoTen).localeCompare(String(b.HoTen), 'vi'); })
      .map(function (x) { return { gt: x.MaNV, vi: x.HoTen + ' (' + x.MaNV + ')', zh: '' }; }), { id: 'f-npt', giaTri: r.NguoiPhuTrach, nhanTrong: 'chung.khongChon' });
    o.MaTBCha = ME.ui.chonO(dsTB().filter(function (x) { return x.MaTB !== r.MaTB; })
      .sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); })
      .map(function (x) { return { gt: x.MaTB, vi: x.MaTB + ' · ' + x.TenVi, zh: '' }; }), { id: 'f-cha', giaTri: r.MaTBCha, nhanTrong: 'chung.khongChon' });
    o.TaiLieuUrl = ME.ui.oNhap({ id: 'f-tl', type: 'url', inputmode: 'url', value: r.TaiLieuUrl || '', placeholder: 'https://drive.google.com/…', autocapitalize: 'off' });
    o.GhiChu = h('textarea', { class: 'o-nhap', id: 'f-gc', rows: 3 });
    o.GhiChu.value = r.GhiChu || '';
    const oTS = {};
    function veTS() {
      Object.keys(oTS).forEach(function (k) { giaTriTS[k] = oTS[k].value; delete oTS[k]; delete loi['ts.' + k]; });
      ME.xoaCon(vungTS);
      const loai = o.LoaiTB.value;
      if (!loai) { vungTS.appendChild(h('div', { class: 'ghi-chu' }, ME.L('tb.chonLoaiTruoc'))); return; }
      const mau = ME.du.ds('MauThongSo').filter(function (m) { return m.LoaiTB === loai; });
      const thuTuNhom = {};
      ME.dm('NHOM_TS', true).forEach(function (x, i) { thuTuNhom[x.Ma] = i; });
      mau.sort(function (a, b) { return (thuTuNhom[a.Nhom] || 0) - (thuTuNhom[b.Nhom] || 0) || (Number(a.ThuTu) || 0) - (Number(b.ThuTu) || 0); });
      const daCo = {};
      let nhomTruoc = null;
      const themO = function (m, laMau) {
        daCo[m.MaTS] = true;
        if (m.Nhom !== nhomTruoc) {
          nhomTruoc = m.Nhom;
          const tn = ME.dmTen('NHOM_TS', m.Nhom);
          vungTS.appendChild(h('div', { class: 'nhom-tieu', style: 'margin:4px 0 -6px' }, ME.L2(tn.vi || ME.tv('tb.tsKhac'), tn.zh || ME.tz('tb.tsKhac'))));
        }
        const id = 'ts-' + m.MaTS;
        let el;
        const kieu = laMau ? String(m.KieuDL || 'CHU') : 'CHU';
        if (kieu === 'CHON') el = ME.ui.chonO(ME.dsDM(m.MaTS), { id: id, giaTri: giaTriTS[m.MaTS], nhanTrong: 'chung.khongChon' });
        else el = ME.ui.oNhap({ id: id, value: giaTriTS[m.MaTS] === undefined ? '' : (kieu === 'SO' && giaTriTS[m.MaTS] !== '' ? ME.soVi(giaTriTS[m.MaTS]) : giaTriTS[m.MaTS]), inputmode: kieu === 'SO' ? 'decimal' : 'text' });
        el._kieu = kieu;
        el._m = m;
        oTS[m.MaTS] = el;
        const o2 = m.DonVi && kieu !== 'CHON' ? h('div', { class: 'hang-o', style: 'align-items:center' }, el, h('span', { class: 'chu-zh-gt', style: 'flex-shrink:0;min-width:28px' }, m.DonVi)) : el;
        const t = ME.ui.truong([m.TenVi, m.TenZh || ''], o2, laMau && m.BatBuoc === true, id);
        loi['ts.' + m.MaTS] = t;
        vungTS.appendChild(t);
      };
      mau.forEach(function (m) { themO(m, true); });
      tsCu.filter(function (x) { return !daCo[x.MaTS]; }).forEach(function (x) { themO(Object.assign({}, x, { Nhom: 'KHAC_' }), false); });
      if (!mau.length && !tsCu.length) vungTS.appendChild(h('div', { class: 'ghi-chu' }, ME.L('tb.chuaCoTS')));
    }
    veTS();
    const nutDich = h('button', {
      type: 'button', class: 'nut-canh', onClick: function () {
        if (!o.TenVi.value.trim()) { o.TenVi.focus(); return; }
        ME.goiMang('dichTen', { ds: [o.TenVi.value.trim()] }, { nhan: 'chung.dangXuLy' }).then(function (d) { if (d.ds && d.ds[0]) o.TenZh.value = d.ds[0]; }).catch(ME.boQua);
      }
    }, ME.ic('dich', 18, 2), h('span', null, ME.L('tb.dich')));
    const chonAnh = ME.ui.chonAnh({ anhUrl: r.AnhId ? ME.anhUrl(r.AnhId, 600) : '', onAnh: function (a) { anh = a; }, onBo: function () { anh = null; o._boAnh = true; } });
    function baoLoi(khoa, x) {
      const t = loi[khoa];
      if (!t) return ME.baoLoi(x);
      const cu2 = t.querySelector('.loi-truong');
      if (cu2) cu2.remove();
      t.appendChild(ME.ui.loiTruong(x));
      const inp = t.querySelector('input,select,textarea');
      if (inp) { inp.classList.add('loi'); inp.focus(); }
      t.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    function luu() {
      Array.prototype.forEach.call(document.querySelectorAll('.loi-truong'), function (x) { x.remove(); });
      Array.prototype.forEach.call(document.querySelectorAll('.o-nhap.loi'), function (x) { x.classList.remove('loi'); });
      const tb = { MaTB: maSua || ME.chuanMa(o.MaTB.value) };
      if (!maSua) {
        if (!tb.MaTB) return baoLoi('tb.ma', ME.loiThieu('tb.ma'));
        if (!/^[A-Z0-9][A-Z0-9._-]{0,29}$/.test(tb.MaTB)) return baoLoi('tb.ma', ME.loiMoi('MA_SAI'));
        if (ME.layTB(tb.MaTB)) return baoLoi('tb.ma', { vi: ME.tv('tb.trungMa', { ma: tb.MaTB }), zh: ME.tz('tb.trungMa', { ma: tb.MaTB }) });
        tb.laMoi = true;
      }
      ['TenVi', 'TenZh', 'ViTri', 'HangSX', 'Model', 'SoSeri', 'TaiLieuUrl', 'GhiChu', 'LoaiTB', 'KhuVuc', 'MucQuanTrong', 'TrangThai', 'NguoiPhuTrach', 'MaTBCha', 'NgayDuaVaoSD']
        .forEach(function (k) { tb[k] = String(o[k].value || '').trim(); });
      if (!tb.TenVi) return baoLoi('tb.tenVi', ME.loiThieu('tb.tenVi'));
      if (!tb.LoaiTB) return baoLoi('tb.loaiTB', ME.loiThieu('tb.loaiTB'));
      const nam = o.NamSX.value.trim();
      if (nam && !/^(19|20)\d\d$/.test(nam)) return baoLoi('tb.namSX', ME.t('tb.namSai'));
      tb.NamSX = nam;
      if (maSua && r.PhienBan !== undefined && r.PhienBan !== '' && !r._cho) tb.PhienBan = r.PhienBan;
      if (anh) tb.anh = anh.base64;
      else if (o._boAnh) tb.AnhId = '';
      const thongSo = [];
      const loaiDoi = maSua && r.LoaiTB && r.LoaiTB !== tb.LoaiTB;
      for (const k in oTS) {
        const el = oTS[k];
        let v = String(el.value || '').trim();
        if (el._kieu === 'SO' && v !== '') {
          const n = ME.docSo(v);
          if (isNaN(n)) return baoLoi('ts.' + k, ME.loiMoi('SO_SAI', { gt: v }));
          v = String(n);
        }
        if (!maSua && el._m.BatBuoc === true && v === '') return baoLoi('ts.' + k, { vi: ME.tv('loi.THIEU', { truong: el._m.TenVi }), zh: ME.tz('loi.THIEU', { truong: el._m.TenZh || el._m.TenVi }) });
        const cuGT = tsCu.filter(function (x) { return x.MaTS === k; })[0];
        if (!maSua || !cuGT || String(cuGT.GiaTri) !== v || loaiDoi) {
          if (v !== '' || cuGT) thongSo.push({ MaTS: k, GiaTri: v });
        }
      }
      // Đổi loại máy: bỏ thông số của mẫu cũ không còn trong mẫu mới.
      if (loaiDoi) tsCu.forEach(function (x) { if (!oTS[x.MaTS]) thongSo.push({ MaTS: x.MaTS, xoa: true }); });
      ME.luuQuaHang('luuThietBi', { tb: tb, thongSo: thongSo }, tomTatTB(tb, ME.t(maSua ? 'tb.suaTieuDe' : 'tb.themTieuDe'))).then(function (kq) {
        if (kq.ok) ME.thongBao('tb.daLuu', null, { ma: tb.MaTB });
        ME.di('/tb/' + enc(tb.MaTB), true);
      }).catch(ME.boQua);
    }
    return h('div', { class: 'trang' },
      ME.ui.dau({ tieuDe: maSua ? 'tb.suaTieuDe' : 'tb.themTieuDe', quayLai: maSua ? '/tb/' + enc(maSua) : '/tb', nho: true }),
      h('main', { class: 'noi-dung' },
        h('div', { class: 'bieu-mau' },
          truong('tb.ma', o.MaTB, !maSua, maSua ? null : 'tb.maGoiY'),
          truong('tb.tenVi', o.TenVi, true),
          truong('tb.tenZh', h('div', { class: 'hang-o' }, o.TenZh, ME.co('THEM_LINH_KIEN') ? nutDich : null)),
          h('div', { class: 'luoi-2' }, truong('tb.loaiTB', o.LoaiTB, true), truong('tb.trangThai', o.TrangThai)),
          h('div', { class: 'luoi-2' }, truong('tb.khuVuc', o.KhuVuc), truong('tb.viTri', o.ViTri)),
          h('div', { class: 'luoi-2' }, truong('tb.hangSX', o.HangSX), truong('tb.model', o.Model)),
          h('div', { class: 'luoi-2' }, truong('tb.soSeri', o.SoSeri), truong('tb.namSX', o.NamSX)),
          h('div', { class: 'luoi-2' }, truong('tb.ngaySD', o.NgayDuaVaoSD), truong('tb.mucQT', o.MucQuanTrong)),
          truong('tb.nguoiPT', o.NguoiPhuTrach),
          truong('tb.mayCha', o.MaTBCha),
          ME.ui.truong('tb.anhMay', chonAnh)),
        h('div', { class: 'bieu-mau', id: 'thong-so' },
          h('div', { class: 'tieu-the' }, h('h2', { class: 'vi', style: 'margin:0' }, ME.tv('tb.ttKyThuat')), h('span', { class: 'zh' }, ME.tz('tb.ttKyThuat'))),
          vungTS),
        h('div', { class: 'bieu-mau' }, truong('tb.taiLieuUrl', o.TaiLieuUrl), truong('chung.ghiChu', o.GhiChu))),
      h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('tb.luu'))));
  }
  ME.tuyen('/tb/them', { ve: function () { return formTB(null); } });

  // ═════════ In tem QR ═════════
  ME.tuyen('/tb/in-tem', {
    ve: function (ts, q) {
      const st = { loai: q.ct ? 'ct' : 'tb', tu: '', chon: new Set() };
      if (q.tb) q.tb.split(',').forEach(function (m) { st.chon.add('tb|' + m); });
      if (q.ct) q.ct.split(',').forEach(function (m) { st.chon.add('ct|' + m); });
      const ds = h('div', { class: 'the', style: 'padding:4px 14px' });
      const chip = h('div', { class: 'hang-chip' });
      const nutIn = h('button', { type: 'button', class: 'nut-chinh', onClick: inTem });
      const xem = h('div', { class: 'vung-xem-tem' });
      function muc() {
        if (st.loai === 'ct') {
          return ME.du.ds('CongTo').filter(function (c) { return c.MaCT; }).sort(function (a, b) { return String(a.MaCT).localeCompare(String(b.MaCT), 'vi', { numeric: true }); })
            .map(function (c) { return { k: 'ct|' + c.MaCT, ma: c.MaCT, qr: c.MaQR || c.MaCT, vi: c.TenVi || '', zh: c.TenZh || '' }; });
        }
        return dsTB().sort(function (a, b) { return String(a.MaTB).localeCompare(String(b.MaTB), 'vi', { numeric: true }); })
          .map(function (r) { return { k: 'tb|' + r.MaTB, ma: r.MaTB, qr: r.MaTB, vi: r.TenVi || '', zh: r.TenZh || '' }; });
      }
      function tatCaDaChon() {
        const all = {};
        ME.du.ds('CongTo').forEach(function (c) { all['ct|' + c.MaCT] = { ma: c.MaCT, qr: c.MaQR || c.MaCT, vi: c.TenVi || '', zh: c.TenZh || '' }; });
        dsTB().forEach(function (r) { all['tb|' + r.MaTB] = { ma: r.MaTB, qr: r.MaTB, vi: r.TenVi || '', zh: r.TenZh || '' }; });
        return Array.from(st.chon).map(function (k) { return all[k]; }).filter(Boolean);
      }
      function veNut() {
        const n = st.chon.size;
        ME.xoaCon(nutIn);
        ME.them(nutIn, ME.L('tb.inN', { n: n }));
        nutIn.disabled = !n;
        veXem();
      }
      function veXem() {
        ME.xoaCon(xem);
        const chon = tatCaDaChon();
        if (!chon.length) return;
        ME.napQR().then(function () {
          ME.xoaCon(xem);
          xem.appendChild(luoiTem(chon));
        }).catch(function (e) { xem.appendChild(ME.ui.loiTruong(e)); });
      }
      function veDS() {
        ME.xoaCon(ds);
        const q2 = ME.boDau(st.tu);
        const all = muc().filter(function (x) { return !q2 || ME.boDau(x.ma + ' ' + x.vi + ' ' + x.zh).indexOf(q2) >= 0; });
        const tatChon = all.length && all.every(function (x) { return st.chon.has(x.k); });
        ds.appendChild(h('div', { class: 'the-dau', style: 'padding:8px 0' },
          h('div', { class: 'ghi-chu' }, ME.L(st.loai === 'ct' ? 'tb.congTo' : 'tb.thietBi')),
          h('button', { type: 'button', class: 'lien-ket-phai nho', onClick: function () { all.forEach(function (x) { if (tatChon) st.chon.delete(x.k); else st.chon.add(x.k); }); veDS(); veNut(); } },
            ME.L(tatChon ? 'tb.boChon' : 'tb.chonHet'))));
        all.forEach(function (x) {
          const cb = h('input', { type: 'checkbox', checked: st.chon.has(x.k), style: 'width:22px;height:22px;flex-shrink:0;accent-color:#1B365D' });
          cb.addEventListener('change', function () { if (cb.checked) st.chon.add(x.k); else st.chon.delete(x.k); veNut(); });
          ds.appendChild(h('label', { class: 'dong-qt' }, cb, h('div', { class: 'giua' }, h('span', { class: 'vi' }, x.ma + ' · ' + x.vi), x.zh ? h('span', { class: 'zh' }, x.zh) : null)));
        });
        if (!all.length) ds.appendChild(ME.ui.trong('chung.khongThay'));
      }
      function veChip() {
        ME.xoaCon(chip);
        chip.appendChild(ME.ui.chip('tb.thietBi', { chon: st.loai === 'tb', onClick: function () { st.loai = 'tb'; veChip(); veDS(); } }));
        chip.appendChild(ME.ui.chip('tb.congTo', { chon: st.loai === 'ct', onClick: function () { st.loai = 'ct'; veChip(); veDS(); } }));
      }
      function inTem() {
        const chon = tatCaDaChon();
        if (!chon.length) { ME.thongBao('tb.chuaChon', 'loi'); return; }
        ME.napQR().then(function () {
          const vung = h('div', { class: 'vung-in' }, luoiTem(chon));
          document.body.appendChild(vung);
          const xoa = function () { vung.remove(); window.removeEventListener('afterprint', xoa); };
          window.addEventListener('afterprint', xoa);
          setTimeout(function () {
            try { window.print(); } catch (e) { ME.thongBao('tb.mayIn', 'loi'); }
            setTimeout(xoa, 60000);
          }, 100);
        }).catch(function (e) { ME.baoLoi(e); });
      }
      veChip();
      veDS();
      veNut();
      return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'tb.inTemTieuDe', quayLai: '/tat-ca' }),
        h('main', { class: 'noi-dung' },
          h('div', { class: 'hop-tin' }, ME.ic('mayIn', 20, 2), h('div', { class: 'chu' }, ME.L('tb.inGoiY'))),
          chip, ME.ui.oTim({ goiY: 'chung.timNhanh', onTim: function (tu) { st.tu = tu; veDS(); } }), ds, xem),
        h('div', { class: 'thanh-nut' }, nutIn));
    }
  });
  /** Lưới tem để xem và in: QR + mã + tên hai thứ tiếng. */
  function luoiTem(ds) {
    return h('div', { class: 'luoi-tem' }, ds.map(function (x) {
      return h('div', { class: 'tem' }, ME.taoQR(x.qr, 96),
        h('div', { class: 'chu-tem' }, h('div', { class: 'ma' }, x.ma), h('div', { class: 'vi' }, x.vi), x.zh ? h('div', { class: 'zh', lang: 'zh-Hans' }, x.zh) : null));
    }));
  }

  // ═════════ Chi tiết thiết bị ═════════
  function manKhongThay(ma) {
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'tb.chiTiet', quayLai: '/tb' }),
      h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('tb.khongTimThay', { ma: ma })))));
  }
  function moTemQR(r) {
    const oQR = h('div', { class: 'ma-qr' }, ME.ui.dangTai());
    ME.napQR().then(function () { ME.xoaCon(oQR).appendChild(ME.taoQR(r.MaTB, 220)); }, function (e) { ME.xoaCon(oQR).appendChild(ME.ui.loiTruong(e)); });
    ME.hoi({
      tieuDe: { vi: ME.tv('tb.temCua', { ma: r.MaTB }), zh: ME.tz('tb.temCua', { ma: r.MaTB }) },
      noiDung: h('div', { style: 'display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center' }, oQR, h('div', { class: 'ghi-chu' }, ME.L2(r.TenVi, r.TenZh))),
      nut: [{ nhan: 'tb.inTem1', gt: 'in', chinh: true }, { nhan: 'chung.dong', gt: null }]
    }).then(function (gt) { if (gt === 'in') ME.di('/tb/in-tem?tb=' + enc(r.MaTB)); });
  }
  function doiTrangThai(r) {
    ME.chonTu({ tieuDe: 'tb.doiTrangThai', hienTai: r.TrangThai, ds: ME.dsDM('TRANG_THAI_TB').map(function (x) {
      const m = MAU_TT[x.gt] || { cham: '#667085' };
      return Object.assign(x, { ic: h('span', { style: 'width:12px;height:12px;border-radius:6px;flex-shrink:0;background:' + m.cham }) });
    }) }).then(function (gt) {
      if (!gt || gt === r.TrangThai) return;
      const t = ME.dmTen('TRANG_THAI_TB', gt);
      ME.luuQuaHang('luuThietBi', { tb: { MaTB: r.MaTB, TrangThai: gt } }, { vi: ME.tv('tb.doiTrangThai') + ' ' + r.MaTB + ' → ' + t.vi, zh: ME.tz('tb.doiTrangThai') + ' ' + r.MaTB + ' → ' + t.zh })
        .then(function (kq) { if (kq.ok) ME.thongBao('tb.daDoiTT'); ME.veLai(); }).catch(ME.boQua);
    });
  }
  function luuAnhMay(r, file) {
    const dong = ME.ui.choXuLy('chung.dangNenAnh');
    ME.nenAnh(file).then(function (a) {
      dong();
      return ME.luuQuaHang('luuThietBi', { tb: { MaTB: r.MaTB, anh: a.base64 } }, { vi: ME.tv('tb.anhMay') + ' ' + r.MaTB, zh: ME.tz('tb.anhMay') + ' ' + r.MaTB });
    }, function (e) { dong(); throw e; }).then(function () { ME.veLai(); }).catch(function (e) { if (e && !e.daBao && !e.huy) ME.baoLoi(e); });
  }
  function thaoTacKhac(r) {
    const ds = [];
    if (ME.co('SUA_THIET_BI')) ds.push({ nhan: 'tb.suaTB', ic: 'but', gt: 'sua' });
    ds.push({ nhan: 'tb.temQR', ic: 'qr', gt: 'qr' });
    ds.push({ nhan: 'tb.inTem1', ic: 'mayIn', gt: 'in' });
    if (ME.co('XOA_THIET_BI')) ds.push({ nhan: 'tb.xoaTB', ic: 'thungRac', gt: 'xoa', nguy: true });
    ME.thaoTac('tb.themTuyChon', ds).then(function (gt) {
      if (gt === 'sua') ME.di('/tb/' + enc(r.MaTB) + '/sua');
      else if (gt === 'qr') moTemQR(r);
      else if (gt === 'in') ME.di('/tb/in-tem?tb=' + enc(r.MaTB));
      else if (gt === 'xoa') {
        ME.hoi({ tieuDe: 'tb.xoaTB', loiNhan: ME.t('tb.xoaHoi', { ma: r.MaTB }), nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true })
          .then(function (ok) {
            if (!ok) return;
            ME.luuQuaHang('xoaThietBi', { maTB: r.MaTB }, tomTatTB(r, ME.t('tb.xoaTB'))).then(function () { ME.thongBao('tb.daXoa'); ME.di('/tb', true); }).catch(ME.boQua);
          });
      }
    });
  }
  /** Đầu trang chi tiết thiết bị + thanh 4 mục. */
  function dauTB(r, tab) {
    const m = MAU_TT[r.TrangThai] || { cham: '#667085', chu: '#344054' };
    const t = ME.dmTen('TRANG_THAI_TB', r.TrangThai);
    let anhEl;
    const anhCho = r._cho && r.anh ? 'data:image/jpeg;base64,' + r.anh : '';
    const coSua = ME.co('SUA_THIET_BI');
    if (anhCho || r.AnhId) {
      const img = h('img', { alt: ME.t1('tb.anhMay'), src: anhCho || ME.anhUrl(r.AnhId, 300) });
      anhEl = h(coSua ? 'label' : 'div', { class: 'o-anh-may co-anh' }, ME.ic('anh', 24, 1.8), img);
      img.addEventListener('error', function () { img.remove(); anhEl.classList.remove('co-anh'); });
      if (!coSua) {
        anhEl = h('a', { class: 'o-anh-may co-anh', href: anhCho || ME.anhUrl(r.AnhId, 1600), target: '_blank', rel: 'noopener' }, ME.ic('anh', 24, 1.8), img);
      }
    } else {
      anhEl = h(coSua ? 'label' : 'div', { class: 'o-anh-may' }, ME.ic('mayAnh', 24, 1.8), ME.L('tb.anhMay'));
    }
    if (coSua) {
      const inp = h('input', { type: 'file', accept: 'image/*', 'aria-label': ME.t1('tb.anhMay') });
      inp.addEventListener('change', function () { const f = inp.files && inp.files[0]; inp.value = ''; if (f) luuAnhMay(r, f); });
      anhEl.appendChild(inp);
    }
    const nut = [];
    if (coSua) nut.push(h('button', { type: 'button', class: 'nut-tron-dau vang', onClick: function () { doiTrangThai(r); } }, ME.ic('hoatDong', 18, 2), h('span', null, ME.L('tb.doiTrangThai'))));
    nut.push(h('button', { type: 'button', class: 'nut-tron-dau', onClick: function () { moTemQR(r); } }, ME.ic('qr', 18, 2), h('span', null, ME.L('tb.temQR'))));
    const base = '#/tb/' + enc(r.MaTB);
    const tabs = [['', 'tb.tabThongSo'], ['/lk', 'tb.tabLinhKien'], ['/ls', 'tb.tabLichSu'], ['/tl', 'tb.tabTaiLieu']];
    return [
      ME.ui.dau({
        tieuDe: 'tb.chiTiet', nho: true, quayLai: '/tb', lop: 'd18',
        phai: [coSua ? ME.ui.nutIcon('but', 'tb.suaTB', '/tb/' + enc(r.MaTB) + '/sua') : null, ME.ui.nutIcon('baCham', 'tb.themTuyChon', function () { thaoTacKhac(r); }, 'phai')],
        duoi: [
          h('div', { class: 'ct-dau' },
            h('div', { class: 'giua' },
              h('span', { class: 'nhan-trang', style: 'color:' + m.chu }, h('span', { class: 'cham', style: 'background:' + m.cham }), h('span', null, ME.L2(t.vi || r.TrangThai || '—', t.zh))),
              h('h1', null, r.TenVi || r.MaTB), r.TenZh ? h('div', { class: 'zh-lon', lang: 'zh-Hans' }, r.TenZh) : null,
              h('div', { class: 'ma-dau' }, r.MaTB + (r._cho ? ' · ' + ME.tv('chung.coThayDoiCho') : ''))),
            anhEl),
          h('div', { style: 'display:flex;gap:8px' }, nut)]
      }),
      h('nav', { class: 'the-tab', 'aria-label': ME.t1('tb.chiTiet') }, tabs.map(function (x) {
        return h('a', {
          href: base + x[0], 'aria-current': tab === x[0] ? 'page' : null,
          onClick: function (e) { e.preventDefault(); if (tab !== x[0]) ME.di('/tb/' + enc(r.MaTB) + x[0], true); }
        }, ME.L(x[1]));
      }))
    ];
  }
  function trangTB(ma, tab, noiDung) {
    const r = ME.layTB(ma);
    if (!r) return manKhongThay(ma);
    return h('div', { class: 'trang' }, dauTB(r, tab), h('main', { class: 'noi-dung' }, noiDung(r)));
  }

  // ── Tab Thông số (bản vẽ 5) ──
  const IC_NHOM = { DIEN: 'set', CO: 'coLe', VAN_HANH: 'hoatDong' };
  function khoiTT(ic, tieu, dong) {
    return h('section', { class: 'the', style: 'padding:14px 14px 4px' },
      h('div', { class: 'dau-nhom' }, h('span', { class: 'bieu-tuong b34' }, ME.ic(ic, 18, 1.9)), h('div', { class: 'tieu-the' }, ME.L2(tieu.vi, tieu.zh))),
      h('dl', { class: 'ds-tt' }, dong));
  }
  function dongGT(nhan, x) {
    if (!x || (!x.vi && !x.zh)) return ME.ui.dongTT(nhan, '—', '', true);
    return ME.ui.dongTT(nhan, x.vi, x.zh && x.zh !== x.vi ? x.zh : '');
  }
  function veThongSo(r) {
    const dmL = function (loai, ma) { return ma ? ME.dmTen(loai, ma) : null; };
    const txt = function (v) { return v === undefined || v === null || v === '' ? null : { vi: String(v), zh: '' }; };
    const cha = r.MaTBCha ? ME.layTB(r.MaTBCha) : null;
    const chung = [
      dongGT('tb.loaiTB', dmL('LOAI_TB', r.LoaiTB)),
      dongGT('tb.khuVuc', dmL('KHU_VUC', r.KhuVuc)),
      r.ViTri ? dongGT('tb.viTri', txt(r.ViTri)) : null,
      dongGT('tb.hangSX', txt(r.HangSX)),
      dongGT('tb.model', txt(r.Model)),
      dongGT('tb.soSeri', txt(r.SoSeri)),
      dongGT('tb.namSX', txt(r.NamSX)),
      dongGT('tb.ngaySD', ngayHaiDong(r.NgayDuaVaoSD)),
      dongGT('tb.mucQT', dmL('MUC_QUAN_TRONG', r.MucQuanTrong)),
      dongGT('tb.nguoiPT', r.NguoiPhuTrach ? { vi: ME.tenNguoi(r.NguoiPhuTrach), zh: '' } : null),
      r.MaTBCha ? h('a', { class: 'dong', href: '#/tb/' + enc(r.MaTBCha), style: 'text-decoration:none;color:inherit' }, h('dt', null, ME.L('tb.mayCha')),
        h('dd', null, ME.L2(r.MaTBCha + (cha ? ' · ' + cha.TenVi : ''), cha ? cha.TenZh : ''))) : null
    ];
    const ra = [khoiTT('thongTin', ME.t('tb.ttChung'), chung)];
    const ts = (ME.du.theo('ThongSoTB', 'MaTB').get(r.MaTB) || []).slice();
    const mau = ME.du.ds('MauThongSo').filter(function (m) { return m.LoaiTB === r.LoaiTB; });
    const theoMa = {};
    ts.forEach(function (x) { theoMa[x.MaTS] = x; });
    const mauMa = {};
    mau.forEach(function (m) { mauMa[m.MaTS] = m; });
    const dong = mau.map(function (m) { return { m: m, x: theoMa[m.MaTS] || null }; })
      .concat(ts.filter(function (x) { return !mauMa[x.MaTS]; }).map(function (x) { return { m: { MaTS: x.MaTS, TenVi: x.TenVi, TenZh: x.TenZh, Nhom: x.Nhom || 'VAN_HANH', DonVi: x.DonVi, ThuTu: x.ThuTu, KieuDL: 'CHU' }, x: x }; }));
    const thuTuNhom = {};
    ME.dm('NHOM_TS', true).forEach(function (x, i) { thuTuNhom[x.Ma] = i; });
    const nhom = new Map();
    dong.sort(function (a, b) { return (Number(a.m.ThuTu) || 0) - (Number(b.m.ThuTu) || 0); }).forEach(function (d) {
      const k = d.m.Nhom || 'VAN_HANH';
      if (!nhom.has(k)) nhom.set(k, []);
      nhom.get(k).push(d);
    });
    Array.from(nhom.keys()).sort(function (a, b) { return (thuTuNhom[a] === undefined ? 99 : thuTuNhom[a]) - (thuTuNhom[b] === undefined ? 99 : thuTuNhom[b]); }).forEach(function (k) {
      const tn = ME.dmTen('NHOM_TS', k);
      ra.push(khoiTT(IC_NHOM[k] || 'thanhTruot', { vi: tn.vi || ME.tv('tb.tsKhac'), zh: tn.zh || ME.tz('tb.tsKhac') }, nhom.get(k).map(function (d) {
        const gt = d.x ? d.x.GiaTri : '';
        let x = null;
        if (gt !== '' && gt !== undefined && gt !== null) {
          const kieu = String(d.m.KieuDL || 'CHU');
          if (kieu === 'CHON') x = ME.dmTen(d.m.MaTS, gt);
          else if (kieu === 'SO') { const n = Number(gt); x = { vi: (isFinite(n) ? ME.soVi(n) : String(gt)) + (d.m.DonVi ? ' ' + d.m.DonVi : ''), zh: '' }; } else x = { vi: String(gt) + (d.m.DonVi ? ' ' + d.m.DonVi : ''), zh: '' };
        }
        return dongGT([d.m.TenVi, d.m.TenZh || ''], x);
      })));
    });
    let capNhat = '';
    ts.forEach(function (x) { if (String(x.CapNhatLuc || '') > capNhat) capNhat = String(x.CapNhatLuc); });
    if (!capNhat) capNhat = String(r.CapNhatLuc || '');
    const loai = ME.dmTen('LOAI_TB', r.LoaiTB);
    const ngay = ME.ngayCua(capNhat);
    if (!mau.length && !ts.length) ra.push(h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('tb.chuaCoTS'))));
    ra.push(h('div', { class: 'the-dau', style: 'padding:4px;align-items:center' },
      h('div', { class: 'ghi-chu' }, h('span', { class: 'vi' }, ME.tv('tb.mauTS', { loai: loai.vi || r.LoaiTB || '', ngay: ngay ? ME.ngayVi(ngay) : '—' })),
        h('span', { class: 'zh' }, ME.tz('tb.mauTS', { loai: loai.zh || loai.vi || '', ngay: ngay ? ME.ngayZh(ngay) : '—' }))),
      ME.co('SUA_THIET_BI') ? h('a', { class: 'nut-vien mo', style: 'flex-direction:column;gap:0', href: '#/tb/' + enc(r.MaTB) + '/sua' }, ME.L('tb.suaTS')) : null));
    return ra;
  }

  // ── Tab Linh kiện (bản vẽ 6) ──
  /** Linh kiện gắn với máy (gồm thao tác chờ gửi trên máy này). */
  function lkCuaMay(ma) {
    const m = new Map();
    (ME.du.theo('LinhKienTB', 'MaTB').get(ma) || []).forEach(function (x) { m.set(x.MaLK, Object.assign({}, x)); });
    ME.hang.ds().forEach(function (q) {
      if (q.action !== 'luuLinhKienTB' || ME.chuanMa(q.data.maTB) !== ma) return;
      (q.data.ds || []).forEach(function (x) {
        if (x.xoa) m.delete(x.MaLK);
        else m.set(x.MaLK, Object.assign({}, m.get(x.MaLK) || { MaTB: ma, MaLK: x.MaLK }, x, { _cho: true }));
      });
    });
    return Array.from(m.values());
  }
  function veLinhKien(r) {
    const ds = lkCuaMay(r.MaTB).map(function (x) {
      const lk = ME.du.lay('KhoLinhKien', x.MaLK) || { MaLK: x.MaLK, TenVi: x.MaLK };
      return { x: x, lk: lk, tt: ME.ttTon(lk) };
    });
    const uu = { het: 0, duoiMin: 1, chuaCo: 3, du: 4 };
    ds.sort(function (a, b) { return (uu[a.tt.ma] - uu[b.tt.ma]) || String(a.x.MaLK).localeCompare(String(b.x.MaLK), 'vi', { numeric: true }); });
    const canChuY = ds.filter(function (d) { return d.tt.ma === 'het' || d.tt.ma === 'duoiMin'; }).length;
    let ngayFile = '';
    ds.forEach(function (d) { if (String(d.lk.NgayFile || '') > ngayFile) ngayFile = String(d.lk.NgayFile); });
    const coGan = ME.co('DE_XUAT_LINH_KIEN');
    const ra = [h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:12px' },
      ME.ui.theTieuDe([ME.tv('tb.lkTomTat', { n: ds.length, m: canChuY }), ME.tz('tb.lkTomTat', { n: ds.length, m: canChuY })], null,
        coGan ? h('a', { class: 'nut-vien mo', href: '#/tb/' + enc(r.MaTB) + '/gan' }, ME.ic('cong', 18, 2), h('span', null, ME.L('tb.ganLK'))) : null),
      ngayFile ? h('div', { style: 'display:flex;align-items:center;gap:10px;background:#F5F7FA;border-radius:12px;padding:8px 10px;color:#344054' }, ME.ic('lich', 18, 1.8),
        h('div', { class: 'ghi-chu' }, h('span', { class: 'vi', style: 'color:#344054' }, ME.tv('tb.tonTheoFile', { ngay: ME.ngayVi(ngayFile) })), h('span', { class: 'zh' }, ME.tz('tb.tonTheoFile', { ngay: ME.ngayZh(ngayFile) })))) : null)];
    if (!ds.length) ra.push(ME.ui.trong('tb.chuaGanLK', null, 'hop'));
    ds.forEach(function (d) {
      const x = d.x;
      const lk = d.lk;
      const dvVi = lk.DVT || 'cái';
      const dvZh = ME.dvtZh(lk.DVT) || '个';
      const ck = x.ChuKyThay !== '' && x.ChuKyThay !== undefined && x.ChuKyThay !== null && Number(x.ChuKyThay) > 0;
      const DV_NGAN = { GIO: ['giờ', '小时'], NGAY: ['ngày', '天'], TUAN: ['tuần', '周'], THANG: ['tháng', '月'], NAM: ['năm', '年'] };
      const dvCK = DV_NGAN[x.DonViChuKy] ? { vi: DV_NGAN[x.DonViChuKy][0], zh: DV_NGAN[x.DonViChuKy][1] } : (x.DonViChuKy ? ME.dmTen('DON_VI_CHU_KY', x.DonViChuKy) : { vi: '', zh: '' });
      const ton = lk.TonKho === '' || lk.TonKho === undefined || lk.TonKho === null ? '–' : ME.soVi(lk.TonKho);
      const choDuyet = x.TrangThaiDuyet === 'CHO_DUYET';
      const coSua = ME.co('GAN_LINH_KIEN') || (choDuyet && x.CapNhatBoi === (ME.tt.phien && ME.tt.phien.maNV));
      ra.push(h('article', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
        h('div', { style: 'display:flex;align-items:flex-start;gap:12px' },
          h('a', { href: '#/kho/' + enc(lk.MaLK), style: 'display:flex;gap:12px;flex-grow:1;min-width:0;text-decoration:none;color:inherit' },
            ME.ui.oAnhNho(lk.AnhId, ME.icLK(lk.NhomLK), 'b42 ' + (d.tt.ma === 'het' ? 'do' : (d.tt.ma === 'duoiMin' ? 'cam' : '')), 22),
            h('div', { class: 'giua', style: 'min-width:0' }, h('h3', { style: 'margin:0;font-size:14.5px;font-weight:600;line-height:1.35' }, lk.TenVi || lk.MaLK),
              lk.TenZh ? h('div', { style: 'font-size:12.5px;line-height:1.35;color:#475467' }, lk.TenZh) : null,
              h('div', { class: 'ghi-chu', style: 'margin-top:2px' }, h('span', { class: 'vi', style: 'color:#667085' }, lk.MaLK + (x.ViTriLapVi ? ' · ' + x.ViTriLapVi : ''))))),
          h('div', { style: 'display:flex;flex-direction:column;gap:4px;align-items:flex-end' },
            ME.ui.nhanTTK(d.tt.nhan, d.tt.mau),
            choDuyet ? ME.ui.nhanTTK('tb.choDuyet', 'tim') : null,
            x._cho ? ME.ui.nhanTTK('chung.choGui', 'cam') : null)),
        h('div', { class: 'luoi-3so' },
          h('div', null, ME.L('tb.lap', { dv: [dvVi, dvZh] }), h('div', { class: 'so-gt' }, ME.soVi(x.SoLuongLap || 1))),
          h('div', null, ck ? ME.L('tb.chuKy', { dv: [dvCK.vi || '', dvCK.zh || ''] }) : ME.L('tb.chuKyKhong'),
            h('div', { class: 'so-gt' + (ck ? '' : ' nho') }, ck ? ME.soVi(x.ChuKyThay) : ME.L('tb.theoTinhTrang'))),
          h('div', null, ME.L('tb.ton', { dv: [dvVi, dvZh] }), h('div', { class: 'so-gt ' + (d.tt.ma === 'het' ? 'so-do' : (d.tt.ma === 'duoiMin' ? 'so-cam' : '')) }, ton,
            Number(lk.TonToiThieu) > 0 && d.tt.ma !== 'du' ? h('small', null, ' / min ' + ME.soVi(lk.TonToiThieu)) : null))),
        h('div', { class: 'the-dau', style: 'align-items:center' },
          h('div', { class: 'ghi-chu' }, x.LanThayCuoi
            ? [h('span', { class: 'vi' }, ME.tv('tb.thayCuoi', { ngay: ME.ngayVi(x.LanThayCuoi) })), h('span', { class: 'zh' }, ME.tz('tb.thayCuoi', { ngay: ME.ngayZh(x.LanThayCuoi) }))]
            : ME.L('tb.chuaThay')),
          h('div', { style: 'display:flex;gap:6px' },
            choDuyet && ME.co('GAN_LINH_KIEN') ? h('button', { type: 'button', class: 'nut-vien', onClick: function () { duyetGan(r, x); } }, h('span', null, ME.L('tb.duyet'))) : null,
            coSua ? ME.ui.nutIcon('but', 'chung.sua', '/tb/' + enc(r.MaTB) + '/gan?lk=' + enc(x.MaLK)) : null))));
    });
    return ra;
  }
  function duyetGan(r, x) {
    // Cấp 1–3 gửi lại dòng đề xuất là duyệt nó (máy chủ ghi DA_DUYET).
    ME.luuQuaHang('luuLinhKienTB', { maTB: r.MaTB, ds: [{ MaLK: x.MaLK }] }, { vi: ME.tv('tb.duyet') + ' ' + x.MaLK + ' → ' + r.MaTB, zh: ME.tz('tb.duyet') + ' ' + x.MaLK + ' → ' + r.MaTB })
      .then(function (kq) { if (kq.ok) ME.thongBao('gan.daDuyet'); ME.veLai(); }).catch(ME.boQua);
  }

  // ── Tab Lịch sử, Tài liệu ──
  function veLichSu(r) {
    return [
      h('div', { class: 'hop-tin' }, ME.ic('lichSu', 20, 2), h('div', { class: 'chu' }, ME.L('tb.lichSuDot2'))),
      khoiTT('tep', ME.t('tb.hoSo'), [
        dongGT('tb.capNhatCuoi', r.CapNhatLuc ? { vi: ME.ngayGioVi(r.CapNhatLuc), zh: ME.ngayGioZh(r.CapNhatLuc) } : null),
        dongGT('tb.nguoiSua', r.CapNhatBoi ? { vi: ME.tenNguoi(r.CapNhatBoi) === 'SUA_TAY' ? 'Sửa tay trong file' : ME.tenNguoi(r.CapNhatBoi), zh: r.CapNhatBoi === 'SUA_TAY' ? '在表格中手动修改' : '' } : null)
      ])
    ];
  }
  function veTaiLieu(r) {
    const ra = [];
    if (r.TaiLieuUrl && /^https?:\/\//i.test(r.TaiLieuUrl)) {
      ra.push(h('section', { class: 'the', style: 'display:flex;flex-direction:column;gap:10px' },
        h('div', { class: 'ghi-chu', style: 'overflow-wrap:anywhere' }, h('span', { class: 'vi' }, r.TaiLieuUrl)),
        h('a', { class: 'nut-chinh', href: r.TaiLieuUrl, target: '_blank', rel: 'noopener noreferrer' }, ME.L('tb.moTaiLieu'))));
    } else {
      ra.push(h('div', { class: 'hop-tin' }, ME.ic('tep', 20, 2), h('div', { class: 'chu' }, ME.L('tb.khongTaiLieu'), h('span', { class: 'vi', style: 'margin-top:4px' }, ME.tv('tb.taiLieuGoiY')), h('span', { class: 'zh' }, ME.tz('tb.taiLieuGoiY')))));
    }
    if (r.GhiChu) ra.push(h('section', { class: 'the' }, ME.ui.theTieuDe('chung.ghiChu'), h('div', { style: 'white-space:pre-wrap;margin-top:8px;font-size:14px;line-height:1.5' }, r.GhiChu)));
    return ra;
  }

  // ═════════ Gắn / sửa linh kiện của máy ═════════
  function formGan(ma, maLK, chon) {
    const r = ME.layTB(ma);
    if (!r) return manKhongThay(ma);
    if (!ME.co('DE_XUAT_LINH_KIEN')) return ME.ui.manKhongQuyen('gan.tieuDe');
    const cu = maLK ? lkCuaMay(ma).filter(function (x) { return x.MaLK === maLK; })[0] : null;
    const st = { maLK: maLK || chon || '' };
    const oLK = h('button', { type: 'button', class: 'o-nhap', style: 'text-align:left;display:flex;align-items:center;gap:8px;height:auto;min-height:46px;padding:8px 12px' });
    function veLK() {
      ME.xoaCon(oLK);
      const lk = st.maLK ? ME.du.lay('KhoLinhKien', st.maLK) : null;
      if (lk) ME.them(oLK, [h('div', { style: 'flex-grow:1;min-width:0;line-height:1.35' }, h('div', { style: 'font-weight:600' }, lk.MaLK + ' · ' + lk.TenVi), lk.TenZh ? h('div', { style: 'font-size:12px;color:#475467' }, lk.TenZh) : null), ME.ic('xuong', 18, 2)]);
      else ME.them(oLK, [h('span', { style: 'flex-grow:1;color:#667085' }, ME.t1('gan.chonLK')), ME.ic('xuong', 18, 2)]);
    }
    if (!maLK) {
      oLK.addEventListener('click', function () {
        const daGan = {};
        lkCuaMay(ma).forEach(function (x) { daGan[x.MaLK] = true; });
        ME.chonTu({
          tieuDe: 'gan.chonLK', timKiem: true, hienTai: st.maLK,
          ds: ME.du.ds('KhoLinhKien').filter(function (x) { return !daGan[x.MaLK]; })
            .sort(function (a, b) { return String(a.MaLK).localeCompare(String(b.MaLK), 'vi', { numeric: true }); })
            .map(function (x) { return { gt: x.MaLK, vi: x.TenVi || x.MaLK, zh: x.TenZh || '', phu: x.MaLK + (x.QuyCach ? ' · ' + x.QuyCach : '') + (x.ViTriKho ? ' · ' + x.ViTriKho : '') }; })
        }).then(function (gt) { if (gt) { st.maLK = gt; veLK(); } });
      });
    } else oLK.disabled = true;
    veLK();
    const x = cu || {};
    const sl = ME.ui.soTang(x.SoLuongLap === undefined ? 1 : x.SoLuongLap, 1);
    const ck = ME.ui.oNhap({ id: 'g-ck', inputmode: 'decimal', value: x.ChuKyThay === undefined || x.ChuKyThay === '' ? '' : ME.soVi(x.ChuKyThay) });
    const dvck = ME.ui.chonO(ME.dsDM('DON_VI_CHU_KY'), { id: 'g-dvck', giaTri: x.DonViChuKy || 'GIO', trong: false });
    const ltc = ME.ui.oNhap({ id: 'g-ltc', type: 'date', value: x.LanThayCuoi || '' });
    const vtVi = ME.ui.oNhap({ id: 'g-vtvi', value: x.ViTriLapVi || '' });
    const vtZh = ME.ui.oNhap({ id: 'g-vtzh', value: x.ViTriLapZh || '', lang: 'zh-Hans' });
    const gc = h('textarea', { class: 'o-nhap', id: 'g-gc', rows: 2 });
    gc.value = x.GhiChu || '';
    const vungLoi = h('div');
    function luu() {
      ME.xoaCon(vungLoi);
      if (!st.maLK) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiThieu('gan.lk'))); return; }
      const so = ME.docSo(sl.lay());
      if (!(so > 0)) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiMoi('SO_SAI', { gt: sl.lay() }))); return; }
      const ckS = ck.value.trim();
      const ckN = ckS === '' ? '' : ME.docSo(ckS);
      if (ckS !== '' && !(ckN > 0)) { vungLoi.appendChild(ME.ui.loiTruong(ME.loiMoi('SO_SAI', { gt: ckS }))); return; }
      const d = { MaLK: st.maLK, SoLuongLap: so, ChuKyThay: ckN, DonViChuKy: dvck.value, LanThayCuoi: ltc.value, ViTriLapVi: vtVi.value.trim(), ViTriLapZh: vtZh.value.trim(), GhiChu: gc.value.trim() };
      const tt = ME.t(maLK ? 'gan.suaTieuDe' : 'gan.tieuDe');
      ME.luuQuaHang('luuLinhKienTB', { maTB: ma, ds: [d] }, { vi: tt.vi + ' ' + st.maLK + ' → ' + ma, zh: tt.zh + ' ' + st.maLK + ' → ' + ma }).then(function (kq) {
        if (kq.ok) ME.thongBao(kq.data && kq.data.choDuyet ? 'gan.daDeXuat' : 'gan.daGan');
        ME.di('/tb/' + enc(ma) + '/lk', true);
      }).catch(ME.boQua);
    }
    function bo() {
      ME.hoi({ tieuDe: 'gan.boLK', loiNhan: ME.t('gan.boHoi', { ma: maLK, may: ma }), nut: [{ nhan: 'chung.xoa', gt: true, nguy: true }, { nhan: 'chung.huy', gt: false, chinh: true }], ngang: true })
        .then(function (ok) {
          if (!ok) return;
          ME.luuQuaHang('luuLinhKienTB', { maTB: ma, ds: [{ MaLK: maLK, xoa: true }] }, { vi: ME.tv('gan.boLK') + ' ' + maLK + ' · ' + ma, zh: ME.tz('gan.boLK') + ' ' + maLK + ' · ' + ma })
            .then(function (kq) { if (kq.ok) ME.thongBao('gan.daBo'); ME.di('/tb/' + enc(ma) + '/lk', true); }).catch(ME.boQua);
        });
    }
    return h('div', { class: 'trang' },
      ME.ui.dau({ tieuDe: maLK ? 'gan.suaTieuDe' : 'gan.tieuDe', nho: true, quayLai: '/tb/' + enc(ma) + '/lk' }),
      h('main', { class: 'noi-dung' },
        h('div', { class: 'ghi-chu', style: 'padding:0 4px' }, ME.L2(ma + ' · ' + (r.TenVi || ''), r.TenZh)),
        !ME.co('GAN_LINH_KIEN') ? h('div', { class: 'hop-tin' }, ME.ic('thongTin', 20, 2), h('div', { class: 'chu' }, ME.L('gan.deXuat'))) : null,
        h('div', { class: 'bieu-mau' },
          ME.ui.truong('gan.lk', oLK, true),
          h('div', { class: 'luoi-2' }, ME.ui.truong('gan.soLuong', sl), ME.ui.truong('gan.lanThayCuoi', ltc, false, 'g-ltc')),
          h('div', { class: 'luoi-2' }, ME.ui.truong('gan.chuKy', ck, false, 'g-ck'), ME.ui.truong('gan.donViChuKy', dvck, false, 'g-dvck')),
          ME.ui.truong('gan.viTriVi', vtVi, false, 'g-vtvi'),
          ME.ui.truong('gan.viTriZh', vtZh, false, 'g-vtzh'),
          ME.ui.truong('chung.ghiChu', gc, false, 'g-gc'),
          vungLoi),
        maLK && ME.co('GAN_LINH_KIEN') ? h('button', { type: 'button', class: 'nut-phu', style: 'color:#A3141D;border-color:#F3B5B9', onClick: bo }, ME.L('gan.boLK')) : null),
      h('div', { class: 'thanh-nut' }, h('button', { type: 'button', class: 'nut-chinh', onClick: luu }, ME.L('gan.luu'))));
  }

  ME.tuyen('/tb/:ma', { ve: function (ts) { return trangTB(ts.ma, '', veThongSo); }, capNhat: function (el, loai) { if (loai !== 'dong-bo') ME.veLai(); } });
  ME.tuyen('/tb/:ma/lk', { ve: function (ts) { return trangTB(ts.ma, '/lk', veLinhKien); }, capNhat: function (el, loai) { if (loai !== 'dong-bo') ME.veLai(); } });
  ME.tuyen('/tb/:ma/ls', { ve: function (ts) { return trangTB(ts.ma, '/ls', veLichSu); }, tuLamMoi: true });
  ME.tuyen('/tb/:ma/tl', { ve: function (ts) { return trangTB(ts.ma, '/tl', veTaiLieu); }, tuLamMoi: true });
  ME.tuyen('/tb/:ma/sua', { ve: function (ts) { return formTB(ts.ma); } });
  ME.tuyen('/tb/:ma/gan', { ve: function (ts, q) { return formGan(ts.ma, q.lk || '', q.chon || ''); } });
})();

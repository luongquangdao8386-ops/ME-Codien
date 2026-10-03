/* ME – Quản lý Cơ điện · 机电管理系统
   ui.js — khối giao diện dùng lại ở nhiều màn: đầu trang lớn, ô tìm, chip, ô chọn, bàn phím PIN, chọn ảnh,
   quét QR bằng camera, vẽ mã QR, lưu qua hàng chờ, gọi máy chủ có màn chờ. */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;

  ME.nhan('Giao diện chung', {
    'ui.quetTieuDe': ['Quét mã QR', '扫描二维码'],
    'ui.quetGoiY': ['Đưa mã QR vào giữa khung', '将二维码对准框内'],
    'ui.nhapTay': ['Nhập mã bằng tay', '手动输入编号'],
    'ui.nhapMa': ['Nhập mã', '输入编号'],
    'ui.dangMoCamera': ['Đang mở camera…', '正在打开相机…'],
    'ui.giam': ['Giảm', '减少'],
    'ui.tang': ['Tăng', '增加'],
    'ui.daChup': ['Đã chụp, ảnh tự nén còn khoảng {kb} KB', '已拍摄，照片自动压缩至约{kb} KB'],
    'ui.xoaSo': ['Xóa số', '删除'],
    'ui.choXacNhan': ['Cần xác nhận', '需要确认']
  });

  // ───────── Đầu trang lớn (màn chính: Thiết bị, Kho, Tài khoản) ─────────
  /** o: { tieuDe: khoa, ts, phai: [phần tử], duoi: [phần tử], keo: true (thẻ phía dưới đè lên) } */
  ME.ui.dauLon = function (o) {
    const t = ME.t(o.tieuDe, o.ts);
    return h('header', { class: 'dau-lon' + (o.keo ? ' keo' : '') },
      h('div', { class: 'hang' }, h('div', { class: 'tieu' }, h('h1', null, t.vi), h('span', { class: 'zh', lang: 'zh-Hans' }, t.zh)), o.phai || null),
      o.duoi || null);
  };
  /** Nút tròn trên đầu trang. dich: đường dẫn hoặc hàm. */
  ME.ui.nutTron = function (ic, nhanKhoa, dich, trangNen) {
    const p = { class: 'nut-tron' + (trangNen ? ' trang-nen' : ''), 'aria-label': ME.t1(nhanKhoa) };
    if (typeof dich === 'function') return h('button', Object.assign(p, { type: 'button', onClick: dich }), ME.ic(ic, 22, 2));
    return h('a', Object.assign(p, { href: '#' + dich }), ME.ic(ic, 22, 2));
  };
  ME.ui.nutIcon = function (ic, nhanKhoa, dich, lop) {
    const p = { class: 'nut-icon' + (lop ? ' ' + lop : ''), 'aria-label': ME.t1(nhanKhoa) };
    if (typeof dich === 'function') return h('button', Object.assign(p, { type: 'button', onClick: dich }), ME.ic(ic, 22, 2));
    return h('a', Object.assign(p, { href: '#' + dich }), ME.ic(ic, 22, 2));
  };

  // ───────── Ô tìm kiếm ─────────
  /** o: { goiY: khoa, giaTri, onTim(tu), xam, tre } */
  ME.ui.oTim = function (o) {
    const inp = h('input', {
      type: 'search', enterkeyhint: 'search', placeholder: ME.t1(o.goiY), 'aria-label': ME.t1(o.goiY), value: o.giaTri || '',
      autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false'
    });
    const xoa = h('button', { type: 'button', class: 'xoa-tim', 'aria-label': ME.t1('chung.xoa'), hidden: !o.giaTri }, ME.ic('dong', 18, 2));
    const goi = ME.tre(function () { o.onTim(inp.value); }, o.tre || 180);
    inp.addEventListener('input', function () { xoa.hidden = !inp.value; goi(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
    xoa.addEventListener('click', function (e) { e.preventDefault(); inp.value = ''; xoa.hidden = true; o.onTim(''); inp.focus(); });
    return h('label', { class: 'o-tim' + (o.xam ? ' xam' : '') }, ME.ic('tim', 20, 1.8), inp, xoa);
  };

  // ───────── Chip lọc ─────────
  /** nhan: khoa | [vi, zh]. o: { chon, onClick, dem, mauDem: 'do'|'tim'|'xam'|'cam', vien } */
  ME.ui.chip = function (nhan, o) {
    const x = Array.isArray(nhan) ? { vi: nhan[0], zh: nhan[1] } : ME.t(nhan, o.ts);
    const mau = { do: 'background:#FDECEC;color:#A3141D', tim: 'background:#F1EBFF;color:#5B2BB5', xam: 'background:#EAECF0;color:#344054', cam: 'background:#FFF1E0;color:#8A3E00', than: 'background:#E7EDF5;color:#0F2440' };
    const coDem = o.dem !== undefined && o.dem !== null;
    return h('button', {
      type: 'button', class: 'chip' + (o.chon ? ' chon' : '') + (coDem || o.vien ? ' vien' : ''), 'aria-pressed': o.chon ? 'true' : 'false', onClick: o.onClick
    }, h('span', null, ME.L2(x.vi, x.zh)),
    coDem ? h('span', { class: 'dem-chip', style: o.chon ? 'background:rgba(255,255,255,0.2);color:#FFFFFF' : (mau[o.mauDem || 'xam']) }, ME.soVi(o.dem)) : null,
    o.icPhai ? ME.ic(o.icPhai, 16, 2) : null);
  };

  // ───────── Ô nhập, ô chọn ─────────
  ME.ui.oNhap = function (p) { return h('input', Object.assign({ class: 'o-nhap', type: 'text', autocomplete: 'off' }, p || {})); };
  /** ds: [{ gt, vi, zh }]. o: { giaTri, trong: true (thêm dòng trống), nhanTrong: khoa, onChange, id, disabled } */
  ME.ui.chonO = function (ds, o) {
    o = o || {};
    const sel = h('select', { class: 'o-nhap', id: o.id || null, disabled: !!o.disabled });
    if (o.trong !== false) sel.appendChild(h('option', { value: '' }, ME.t1(o.nhanTrong || 'chung.chonDi')));
    let coGT = false;
    ds.forEach(function (x) {
      const op = h('option', { value: String(x.gt) }, x.vi + (x.zh ? ' · ' + x.zh : ''));
      if (String(x.gt) === String(o.giaTri === undefined || o.giaTri === null ? '' : o.giaTri)) { op.selected = true; coGT = true; }
      sel.appendChild(op);
    });
    // Giá trị cũ không còn trong danh sách (mã đã tắt) vẫn hiện để không mất dữ liệu.
    if (!coGT && o.giaTri !== undefined && o.giaTri !== null && String(o.giaTri) !== '') {
      const op = h('option', { value: String(o.giaTri) }, String(o.giaTri));
      op.selected = true;
      sel.appendChild(op);
    }
    if (o.onChange) sel.addEventListener('change', function () { o.onChange(sel.value); });
    return sel;
  };
  /** Danh mục → mảng lựa chọn. */
  ME.dsDM = function (loai, caTat) {
    return ME.dm(loai, caTat).map(function (r) { return { gt: r.Ma, vi: r.TenVi || r.Ma, zh: r.TenZh || '' }; });
  };
  /** Trường có dòng gợi ý phía dưới. */
  ME.ui.truongGY = function (nhanKhoa, o, batBuoc, goiYKhoa, ts) {
    const t = ME.ui.truong(nhanKhoa, o, batBuoc, o && o.id);
    if (goiYKhoa) t.appendChild(h('div', { class: 'ghi-chu c11' }, ME.L(goiYKhoa, ts)));
    return t;
  };
  /** Ô số có nút − / +. */
  ME.ui.soTang = function (giaTri, buoc, onDoi) {
    const inp = h('input', { type: 'text', inputmode: 'decimal', value: giaTri === '' || giaTri === undefined || giaTri === null ? '' : ME.soVi(giaTri), 'aria-label': ME.t1('ui.tang') });
    const doi = function (d) {
      let n = ME.docSo(inp.value);
      if (isNaN(n)) n = 0;
      n = Math.max(0, ME.lamTron(n + d, 3));
      inp.value = ME.soVi(n);
      if (onDoi) onDoi(inp.value);
    };
    inp.addEventListener('input', function () { if (onDoi) onDoi(inp.value); });
    const el = h('div', { class: 'so-tang' },
      h('button', { type: 'button', 'aria-label': ME.t1('ui.giam'), onClick: function () { doi(-(buoc || 1)); } }, ME.ic('tru', 20, 2)),
      inp,
      h('button', { type: 'button', 'aria-label': ME.t1('ui.tang'), onClick: function () { doi(buoc || 1); } }, ME.ic('cong', 20, 2)));
    el.lay = function () { return inp.value; };
    el.input = inp;
    return el;
  };
  ME.ui.loiTruong = function (e) {
    const x = ME.loiChu(e);
    return h('div', { class: 'loi-truong', role: 'alert' }, ME.L2(x.vi, x.zh));
  };

  // ───────── Ảnh đại diện có dự phòng biểu tượng ─────────
  /** Ảnh chia sẻ (thiết bị, linh kiện) hiện trong ô .bieu-tuong; mất mạng hoặc lỗi thì hiện biểu tượng. */
  ME.ui.oAnhNho = function (anhId, ic, lop, co) {
    const o = h('span', { class: 'bieu-tuong ' + (lop || '') }, ME.ic(ic, co || 24, 1.8));
    if (anhId) {
      const img = h('img', { alt: '', loading: 'lazy', decoding: 'async', src: ME.anhUrl(anhId, 200) });
      img.addEventListener('load', function () { ME.xoaCon(o).appendChild(img); });
      img.addEventListener('error', function () { img.remove(); });
    }
    return o;
  };

  // ───────── Màn chờ, gọi máy chủ ─────────
  /** Lớp che có vòng quay (chặn bấm hai lần). Trả hàm đóng. */
  ME.ui.choXuLy = function (khoa, ts) {
    const nhan = h('div', { class: 'chu' }, ME.L(khoa || 'chung.dangXuLy', ts));
    const che = h('div', { class: 'man-che giua', role: 'status', 'aria-live': 'polite' },
      h('div', { class: 'hop-thoai', style: 'align-items:center;text-align:center;max-width:280px;gap:12px' }, h('div', { class: 'vong-quay' }), nhan));
    document.body.appendChild(che);
    const dong = function () { che.remove(); };
    dong.doiChu = function (k, t) { ME.xoaCon(nhan); ME.them(nhan, ME.L(k, t)); };
    return dong;
  };
  function laLoiPhien(e) { return e && (e.ma === 'PHIEN_HET_HAN' || e.ma === 'TAI_KHOAN_NGUNG' || e.ma === 'PHAI_DOI_PIN'); }
  ME.laLoiPhien = laLoiPhien;
  /**
   * Gọi máy chủ cho việc cần mạng (không qua hàng chờ): hiện màn chờ, báo lỗi bằng hộp thoại.
   * opt: như ME.api.goi + { nhan: khoa màn chờ, im: không màn chờ, khongBao: không tự báo lỗi }
   * Lỗi ném ra có { huy: true } khi mất mạng (đã báo).
   */
  ME.goiMang = function (action, data, opt) {
    opt = opt || {};
    if (!ME.coMang()) {
      return ME.hoi({ tieuDe: 'chung.matMangNgan', loiNhan: 'chung.canMang' }).then(function () { const e = new Error('mat mang'); e.huy = true; e.mang = true; throw e; });
    }
    const dong = opt.im ? function () {} : ME.ui.choXuLy(opt.nhan || 'chung.dangXuLy');
    return ME.api.goi(action, data, opt).then(function (d) { dong(); return d; }, function (e) {
      dong();
      if (opt.khongBao || laLoiPhien(e)) throw e;
      return ME.baoLoi(e).then(function () { e.daBao = true; throw e; });
    });
  };

  /**
   * Lưu qua hàng chờ (được cả khi mất mạng). Có mạng thì chờ kết quả tối đa ~25 giây.
   * Máy chủ hỏi xác nhận → hộp thoại "Vẫn lưu / Sửa lại". Lỗi khác → bỏ thao tác khỏi hàng chờ, báo lỗi, ném lỗi.
   * Trả { ok, data } hoặc { choGui: true }.
   */
  ME.luuQuaHang = function (action, data, tomTat, opt) {
    opt = opt || {};
    let dong = ME.ui.choXuLy(opt.nhan || 'chung.dangLuu');
    const xuLy = function (kq) {
      dong();
      if (kq.choGui) {
        if (!opt.imCho) ME.thongBao('chung.daLuuCho');
        return { choGui: true, muc: kq.muc };
      }
      if (kq.ok) return { ok: true, data: kq.data || {} };
      const l = kq.loi || {};
      const id = kq.muc && kq.muc.id;
      if (l.ma === 'CAN_XAC_NHAN' && id) {
        return ME.hoi({
          tieuDe: 'ui.choXacNhan', loiNhan: { vi: l.vi, zh: l.zh },
          nut: [{ nhan: 'chung.vanLuu', gt: true, chinh: true }, { nhan: 'chung.suaLai', gt: false }], dongNgoai: false
        }).then(function (dongY) {
          if (!dongY) {
            ME.hang.xoa(id);
            const e = new Error('huy');
            e.huy = true;
            throw e;
          }
          dong = ME.ui.choXuLy(opt.nhan || 'chung.dangLuu');
          const doi = ME.hang.cho(id, opt.cho || 25000);
          ME.hang.xacNhan(id);
          return doi.then(function (kq2) { return xuLy(Object.assign({ muc: kq.muc }, kq2)); });
        });
      }
      if (id) ME.hang.xoa(id);
      const e = new Error(l.vi || 'Lỗi');
      Object.assign(e, l);
      if (laLoiPhien(e)) throw e;
      return ME.baoLoi(e).then(function () { e.daBao = true; throw e; });
    };
    return ME.hang.themVaCho(action, data, tomTat, { daXacNhan: opt.daXacNhan, cho: opt.cho || 25000 }).then(xuLy, function (e) {
      dong();
      return ME.baoLoi(e).then(function () { e.daBao = true; throw e; });
    });
  };
  /** Bỏ qua lỗi đã báo / người dùng hủy (dùng ở .catch). */
  ME.boQua = function (e) { if (e && !e.huy && !e.daBao && !laLoiPhien(e)) console.error(e); };

  // ───────── Thao tác ẩn sau nút "…" ─────────
  /** ds: [{ nhan: khoa, ic, gt, nguy }] → Promise gt */
  ME.thaoTac = function (tieuDe, ds) {
    return ME.chonTu({
      tieuDe: tieuDe,
      ds: ds.map(function (x) {
        const t = ME.t(x.nhan, x.ts);
        return { gt: x.gt, vi: t.vi, zh: t.zh, ic: x.ic ? h('span', { class: 'bieu-tuong b34' + (x.nguy ? ' do' : '') }, ME.ic(x.ic, 18, 2)) : null };
      })
    });
  };

  // ───────── Chọn ảnh, chụp ảnh ─────────
  /**
   * Hai ô "Chụp ảnh" và "Chọn ảnh có sẵn"; chọn xong nén trên máy rồi gọi onAnh({ base64, dataUrl, kb, luc }).
   * o: { anh (đã có), anhUrl (ảnh cũ), onAnh, onBo, batBuoc, motO (chỉ ô chụp, dùng cho ảnh công tơ) }
   */
  ME.ui.chonAnh = function (o) {
    const vo = h('div', { class: 'chon-anh' });
    let anh = o.anh || null;
    function oChon(chup) {
      const inp = h('input', { type: 'file', accept: 'image/*', 'aria-label': ME.t1(chup ? 'chung.chupAnh' : 'chung.chonAnh') });
      if (chup) inp.setAttribute('capture', 'environment');
      inp.addEventListener('change', function () {
        const f = inp.files && inp.files[0];
        inp.value = '';
        if (!f) return;
        const dong = ME.ui.choXuLy('chung.dangNenAnh');
        ME.nenAnh(f).then(function (a) {
          dong();
          a.luc = Date.now();
          anh = a;
          ve();
          if (o.onAnh) o.onAnh(a);
        }, function (e) { dong(); ME.baoLoi(e); });
      });
      return h('label', { class: 'o-anh' }, ME.ic(chup ? 'mayAnh' : 'anh', 24, 1.8), ME.L(chup ? 'chung.chupAnh' : 'chung.chonAnh'), inp);
    }
    function ve() {
      ME.xoaCon(vo);
      if (anh || o.anhUrl) {
        const src = anh ? anh.dataUrl : o.anhUrl;
        const inpLai = h('input', { type: 'file', accept: 'image/*', style: 'position:absolute;inset:0;opacity:0;width:100%;height:100%', 'aria-label': ME.t1('chung.chupLai') });
        inpLai.setAttribute('capture', 'environment');
        inpLai.addEventListener('change', function () {
          const f = inpLai.files && inpLai.files[0];
          inpLai.value = '';
          if (!f) return;
          const dong = ME.ui.choXuLy('chung.dangNenAnh');
          ME.nenAnh(f).then(function (a) { dong(); a.luc = Date.now(); anh = a; ve(); if (o.onAnh) o.onAnh(a); }, function (e) { dong(); ME.baoLoi(e); });
        });
        vo.appendChild(h('div', { style: 'display:flex;gap:12px;align-items:center' },
          h('img', { class: 'anh-xem', src: src, alt: '' }),
          h('div', { style: 'line-height:1.35;min-width:0' },
            anh ? h('div', { class: 'ghi-chu' }, h('span', { class: 'vi', style: 'color:#344054' }, ME.tv('ui.daChup', { kb: anh.kb }) + ' · ' + ME.gio(ME.isoVN(anh.luc))),
              h('span', { class: 'zh' }, ME.tz('ui.daChup', { kb: anh.kb }))) : null,
            h('div', { style: 'display:flex;gap:16px;margin-top:6px' },
              h('label', { class: 'lien-ket-phai', style: 'position:relative;text-align:left' }, ME.L('chung.chupLai'), inpLai),
              o.batBuoc ? null : h('button', { type: 'button', class: 'lien-ket-phai', style: 'text-align:left;color:#A3141D', onClick: function () { anh = null; o.anhUrl = ''; ve(); if (o.onBo) o.onBo(); } }, ME.L('chung.boAnh'))))));
        return;
      }
      vo.appendChild(o.motO ? oChon(true) : h('div', { class: 'luoi-2', style: 'gap:10px' }, oChon(true), oChon(false)));
    }
    ve();
    vo.lay = function () { return anh; };
    return vo;
  };

  // ───────── Bàn phím PIN ─────────
  /** o: { onSo(d), onXoa(), trai: phần tử ô trái (VD Quên PIN?) } */
  ME.ui.banPhim = function (o) {
    const nut = [];
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (d) {
      nut.push(h('button', { type: 'button', onClick: function () { o.onSo(d); } }, d));
    });
    nut.push(o.trai || h('span'));
    nut.push(h('button', { type: 'button', onClick: function () { o.onSo('0'); } }, '0'));
    nut.push(h('button', { type: 'button', class: 'xoa', 'aria-label': ME.t1('ui.xoaSo'), onClick: o.onXoa }, ME.ic('xoaPhim', 26, 1.8)));
    return h('div', { class: 'ban-phim' }, nut);
  };
  ME.ui.chamPin = function (n) {
    const el = h('div', { class: 'cham-pin', role: 'img', 'aria-label': n + '/6' });
    for (let i = 0; i < 6; i++) el.appendChild(h('span', { class: i < n ? 'du' : '' }));
    return el;
  };

  // ───────── Mã QR ─────────
  let qrSan = null;
  ME.napQR = function () {
    if (!qrSan) {
      qrSan = ME.napThuVien('js/lib/qrcode.js').then(function () {
        if (window.qrcode && window.qrcode.stringToBytesFuncs && window.qrcode.stringToBytesFuncs['UTF-8']) {
          window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8'];
        }
      }, function (e) { qrSan = null; throw e; });
    }
    return qrSan;
  };
  /** Vẽ mã QR thành SVG (gọi sau ME.napQR). */
  ME.taoQR = function (chu, co) {
    const q = window.qrcode(0, 'M');
    q.addData(String(chu), 'Byte');
    q.make();
    const n = q.getModuleCount();
    const le = 3;
    const tong = n + le * 2;
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + le) + ' ' + (r + le) + 'h1v1h-1z';
    }
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + tong + ' ' + tong);
    svg.setAttribute('width', co || 220);
    svg.setAttribute('height', co || 220);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'QR');
    const nen = document.createElementNS(NS, 'rect');
    nen.setAttribute('width', tong);
    nen.setAttribute('height', tong);
    nen.setAttribute('fill', '#FFFFFF');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', '#000000');
    svg.appendChild(nen);
    svg.appendChild(p);
    return svg;
  };

  // ───────── Quét QR bằng camera ─────────
  /**
   * Mở camera sau, quét liên tục tới khi đọc được mã. o: { tieuDe: khoa, goiY: khoa, nhapTay: true }
   * Trả Promise chuỗi đọc được, hoặc null khi đóng.
   */
  ME.quet = function (o) {
    o = o || {};
    return new Promise(function (xong) {
      let dung = false;
      let luong = null;
      let hen = 0;
      const video = h('video', { muted: true, autoplay: true, 'aria-hidden': 'true' });
      video.setAttribute('playsinline', '');
      video.muted = true;
      const tb = h('div', null, ME.L(o.goiY || 'ui.quetGoiY'));
      const tieu = ME.t(o.tieuDe || 'ui.quetTieuDe');
      const lop = h('div', { class: 'quet', role: 'dialog', 'aria-modal': 'true', 'aria-label': tieu.vi + ' · ' + tieu.zh },
        video,
        h('div', { class: 'lop-tren' },
          h('button', { type: 'button', class: 'nut-icon trai', 'aria-label': ME.t1('chung.dong'), onClick: function () { ket(null); } }, ME.ic('dong', 26, 2)),
          h('div', { class: 'dau-tieu-de' }, h('h1', { class: 'vi' }, tieu.vi), h('span', { class: 'zh', lang: 'zh-Hans' }, tieu.zh))),
        h('div', { class: 'khung' }),
        h('div', { class: 'lop-duoi' }, tb,
          o.nhapTay === false ? null : h('button', { type: 'button', class: 'nut-tron-dau', style: 'flex-grow:0;padding:6px 18px', onClick: nhapTay },
            ME.ic('chu', 18, 2), h('span', null, ME.L('ui.nhapTay')))));
      document.body.appendChild(lop);
      function dungCam() {
        clearTimeout(hen);
        if (luong) luong.getTracks().forEach(function (t) { t.stop(); });
        luong = null;
      }
      function ket(gt) {
        if (dung) return;
        dung = true;
        dungCam();
        lop.remove();
        xong(gt);
      }
      function nhapTay() {
        const inp = ME.ui.oNhap({ autocapitalize: 'characters', 'aria-label': ME.t1('ui.nhapMa') });
        ME.hoi({ tieuDe: 'ui.nhapMa', noiDung: inp, nut: [{ nhan: 'chung.xacNhan', gt: true, chinh: true }, { nhan: 'chung.huy', gt: false }], ngang: true })
          .then(function (ok) { if (ok && inp.value.trim()) ket(inp.value.trim()); });
      }
      const c = document.createElement('canvas');
      const g = c.getContext('2d', { willReadFrequently: true });
      function vong() {
        if (dung) return;
        try {
          if (video.readyState >= 2 && video.videoWidth) {
            const k = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
            const w = Math.round(video.videoWidth * k);
            const hh = Math.round(video.videoHeight * k);
            if (c.width !== w) c.width = w;
            if (c.height !== hh) c.height = hh;
            g.drawImage(video, 0, 0, w, hh);
            const anh = g.getImageData(0, 0, w, hh);
            const kq = window.jsQR(anh.data, w, hh, { inversionAttempts: 'attemptBoth' });
            if (kq && kq.data) {
              if (navigator.vibrate) navigator.vibrate(60);
              return ket(kq.data);
            }
          }
        } catch (e) { console.warn(e); }
        hen = setTimeout(vong, 150);
      }
      ME.xoaCon(tb).appendChild(h('div', null, ME.L('ui.dangMoCamera')));
      ME.napThuVien('js/lib/jsqr.js').then(function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('khong co camera');
        return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      }).then(function (s) {
        if (dung) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        luong = s;
        video.srcObject = s;
        return video.play();
      }).then(function () {
        if (dung) return;
        ME.xoaCon(tb).appendChild(h('div', null, ME.L(o.goiY || 'ui.quetGoiY')));
        vong();
      }).catch(function (e) {
        console.warn(e);
        if (dung) return;
        ME.xoaCon(tb).appendChild(h('div', { style: 'color:#FFC72C' }, ME.L(e && e.ma === 'THU_VIEN' ? 'loi.THU_VIEN' : 'loi.CAMERA')));
      });
    });
  };

  // ───────── Sao chép ─────────
  ME.saoChep = function (chu) {
    const xong = function () { ME.thongBao('chung.daSaoChep'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(chu).then(xong, function () { ME.thongBao('chung.khongSaoChep', 'loi'); });
    }
    ME.thongBao('chung.khongSaoChep', 'loi');
    return Promise.resolve();
  };

  // ───────── Số liệu chung ─────────
  /** Tên danh mục hai dòng (dùng cho ô thông số). */
  ME.dmL = function (loai, ma) { const t = ME.dmTen(loai, ma); return ME.L2(t.vi, t.zh); };
  /** Đơn vị tính tiếng Trung từ danh mục DVT (lưu bằng tên Việt). */
  ME.dvtZh = function (dvt) {
    if (!dvt) return '';
    const r = ME.dm('DVT', true).filter(function (x) { return String(x.TenVi).toLowerCase() === String(dvt).toLowerCase() || x.Ma === String(dvt).toUpperCase(); })[0];
    return r ? r.TenZh || '' : '';
  };
  /** Thanh tiến độ. */
  ME.ui.thanhTien = function (phan, tong, mau, nhan) {
    const pt = tong > 0 ? Math.round(phan / tong * 100) : 0;
    return h('div', { class: 'thanh-tien', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(tong), 'aria-valuenow': String(phan), 'aria-label': nhan || (phan + '/' + tong) },
      h('div', { style: 'width:' + pt + '%' + (mau ? ';background:' + mau : '') }));
  };
  /** Mục "chưa làm ở đợt này": báo bằng thông báo nổi. */
  ME.sapCo = function (dot) {
    const d = ME.t(dot === 3 ? 'chung.dot3' : 'chung.dot2');
    ME.thongBao({ vi: ME.tv('chung.sapCo', { dot: d.vi }), zh: ME.tz('chung.sapCo', { dot: d.zh }) });
  };
  /** Màn báo không có quyền. */
  ME.ui.manKhongQuyen = function (tieuDe) {
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: tieuDe || 'chung.coLoi', quayLai: '/' }),
      h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb' }, ME.ic('khoa', 20, 2), h('div', { class: 'chu' }, ME.L('chung.khongQuyen')))));
  };
  /** Thẻ có tiêu đề hai dòng và nút phải. */
  ME.ui.theTieuDe = function (khoa, ts, phai, them) {
    const t = Array.isArray(khoa) ? { vi: khoa[0], zh: khoa[1] } : ME.t(khoa, ts);
    return h('div', { class: 'the-dau' + (them ? ' ' + them : '') }, h('div', { class: 'tieu tieu-the' }, h('h2', { class: 'vi' }, t.vi), h('span', { class: 'zh', lang: 'zh-Hans' }, t.zh)), phai || null);
  };
  ME.ui.lienKetPhai = function (khoa, dich, ts) {
    if (typeof dich === 'function') return h('button', { type: 'button', class: 'lien-ket-phai', onClick: dich }, ME.L(khoa, ts));
    return h('a', { class: 'lien-ket-phai', href: '#' + dich }, ME.L(khoa, ts));
  };
  /** Danh sách dài: hiện từng phần (mỗi lần n dòng) cho máy chạy mượt. */
  ME.ui.dsDai = function (ds, veDong, n, goc) {
    n = n || 80;
    goc = goc || h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
    let da = 0;
    const them = function () {
      ds.slice(da, da + n).forEach(function (x) { goc.insertBefore(veDong(x), nut); });
      da = Math.min(ds.length, da + n);
      nut.hidden = da >= ds.length;
      if (!nut.hidden) { ME.xoaCon(nut); ME.them(nut, ME.L('chung.taiThem')); ME.them(nut, h('span', { class: 'zh' }, da + ' / ' + ds.length)); }
    };
    const nut = h('button', { type: 'button', class: 'nut-xam', style: 'flex-direction:column;width:100%', onClick: them });
    goc.appendChild(nut);
    them();
    // Tự hiện thêm khi cuộn gần cuối.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (vao) { if (vao[0].isIntersecting && !nut.hidden) them(); }, { rootMargin: '600px' });
      io.observe(nut);
    }
    return goc;
  };
})();

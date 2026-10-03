/* ME – Quản lý Cơ điện · 机电管理系统
   du-lieu.js — dữ liệu trên máy (IndexedDB), gọi máy chủ Apps Script, hàng chờ gửi khi mất mạng, đồng bộ, phiên đăng nhập và PIN. */
(function () {
  'use strict';
  const ME = window.ME;

  // ───────── Sự kiện ─────────
  const nghe = {};
  ME.su = {
    nghe: function (ten, fn) { (nghe[ten] = nghe[ten] || []).push(fn); },
    bo: function (ten, fn) { nghe[ten] = (nghe[ten] || []).filter(function (f) { return f !== fn; }); },
    phat: function (ten, d) { (nghe[ten] || []).slice().forEach(function (fn) { try { fn(d); } catch (e) { console.error(e); } }); }
  };

  // ───────── IndexedDB ─────────
  let moDB = null;
  function db() {
    if (!moDB) {
      moDB = new Promise(function (xong, loi) {
        const r = indexedDB.open('me-app', 1);
        r.onupgradeneeded = function () {
          const d = r.result;
          ['meta', 'bang', 'hang', 'anh'].forEach(function (s) { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); });
        };
        r.onsuccess = function () { const d = r.result; d.onversionchange = function () { d.close(); }; xong(d); };
        r.onerror = function () { moDB = null; loi(r.error); };
      });
    }
    return moDB;
  }
  function yc(store, che, fn) {
    return db().then(function (d) {
      return new Promise(function (xong, loi) {
        const gd = d.transaction(store, che);
        const s = gd.objectStore(store);
        let kq;
        const r = fn(s);
        if (r) r.onsuccess = function () { kq = r.result; };
        gd.oncomplete = function () { xong(kq); };
        gd.onerror = function () { loi(gd.error); };
        gd.onabort = function () { loi(gd.error || new Error('abort')); };
      });
    });
  }
  ME.kho = {
    lay: function (store, k) { return yc(store, 'readonly', function (s) { return s.get(k); }); },
    dat: function (store, k, v) { return yc(store, 'readwrite', function (s) { return s.put(v, k); }); },
    xoa: function (store, k) { return yc(store, 'readwrite', function (s) { return s.delete(k); }); },
    xoaHet: function (store) { return yc(store, 'readwrite', function (s) { return s.clear(); }); },
    tatCa: function (store) {
      return db().then(function (d) {
        return new Promise(function (xong, loi) {
          const ra = [];
          const gd = d.transaction(store, 'readonly');
          const r = gd.objectStore(store).openCursor();
          r.onsuccess = function () { const c = r.result; if (c) { ra.push({ k: c.key, v: c.value }); c.continue(); } };
          gd.oncomplete = function () { xong(ra); };
          gd.onerror = function () { loi(gd.error); };
        });
      });
    }
  };

  // ───────── Trạng thái phiên ─────────
  ME.tt = {
    mayChu: '',
    phien: null,      // { maNV, token, hetHan, hoSo, phaiDoiPin, hetHieuLuc }
    pin: null,        // { muoi, vong, bam } – để mở khóa bằng PIN ngay trên máy
    khoaPin: { sai: 0, khoaDen: 0, lanKhoa: 0 },
    dongBo: { moc: '', luc: 0, cauHinh: {}, loi: null },
    moKhoa: false,
    tuDienBoSung: ''
  };
  function luuMeta(k) { return ME.kho.dat('meta', k, ME.tt[k]).catch(function (e) { console.warn('Không lưu được ' + k, e); }); }
  ME.luuMeta = luuMeta;
  ME.cauHinh = function (k) { const c = ME.tt.dongBo.cauHinh || {}; return c[k] === undefined ? '' : c[k]; };
  ME.hoSo = function () { return (ME.tt.phien && ME.tt.phien.hoSo) || null; };
  ME.co = function (q) { const hs = ME.hoSo(); return !!(hs && hs.quyen && hs.quyen.indexOf(q) >= 0); };
  ME.cap = function () { const hs = ME.hoSo(); return hs ? Number(hs.Cap) : 9; };

  // ───────── Bảng dữ liệu trên máy ─────────
  const BANG = {};          // ten → { khoa: [...], dong: Map }
  const DEM = {};           // ten → số lần đổi (để làm mới chỉ mục)
  const DS = {};            // bộ nhớ đệm danh sách
  const CM = {};            // bộ nhớ đệm chỉ mục theo cột
  const KHOA_MAC_DINH = {
    NguoiDung: ['MaNV'], TuDien: ['Khoa'], DanhMuc: ['Loai', 'Ma'], ThietBi: ['MaTB'], MauThongSo: ['LoaiTB', 'MaTS'],
    ThongSoTB: ['MaTB', 'MaTS'], LinhKienTB: ['MaTB', 'MaLK'], KhoLinhKien: ['MaLK'], LanNhapKho: ['MaLan'], GhepCotKho: ['TruongApp'],
    CongTo: ['MaCT'], ChiSo: ['MaGhi'], BieuGia: ['Loai', 'TuNgay']
  };
  function khoaDong(khoa, d) {
    let s = '';
    for (let i = 0; i < khoa.length; i++) s += (i ? '\u0001' : '') + String(d[khoa[i]] === undefined ? '' : d[khoa[i]]);
    return s;
  }
  function bang(ten) {
    if (!BANG[ten]) BANG[ten] = { khoa: KHOA_MAC_DINH[ten] || [], dong: new Map() };
    return BANG[ten];
  }
  function doi(ten) {
    DEM[ten] = (DEM[ten] || 0) + 1;
    delete DS[ten];
    Object.keys(CM).forEach(function (k) { if (k.indexOf(ten + '|') === 0) delete CM[k]; });
    if (ten === 'TuDien') tuDienMap = null;
    if (ten === 'DanhMuc') dmMap = null;
  }
  ME.du = {
    dem: function (ten) { return DEM[ten] || 0; },
    ds: function (ten) {
      if (!DS[ten]) DS[ten] = Array.from(bang(ten).dong.values());
      return DS[ten];
    },
    lay: function (ten, dk) {
      const b = bang(ten);
      if (typeof dk === 'string') return b.dong.get(dk) || null;
      return b.dong.get(khoaDong(b.khoa, dk)) || null;
    },
    /** Chỉ mục: Map giá trị cột → mảng dòng. */
    theo: function (ten, cot) {
      const k = ten + '|' + cot;
      if (!CM[k]) {
        const m = new Map();
        ME.du.ds(ten).forEach(function (d) {
          const v = String(d[cot] === undefined ? '' : d[cot]);
          const a = m.get(v);
          if (a) a.push(d); else m.set(v, [d]);
        });
        CM[k] = m;
      }
      return CM[k];
    },
    soDong: function (ten) { return bang(ten).dong.size; }
  };

  /** Gói bảng của máy chủ { khoa, cot, dong: [[...]] } → mảng đối tượng. */
  function moGoi(goi) {
    const cot = goi.cot || [];
    return (goi.dong || []).map(function (r) {
      const o = {};
      for (let i = 0; i < cot.length; i++) o[cot[i]] = r[i];
      return o;
    });
  }
  function luuBang(ten) {
    const b = bang(ten);
    return ME.kho.dat('bang', ten, { khoa: b.khoa, dong: Array.from(b.dong.values()) }).catch(function (e) { console.warn('Không lưu được bảng ' + ten, e); });
  }
  /** Tải lần đầu: thay toàn bộ các bảng. */
  function apToanBo(d) {
    const ten = Object.keys(d.bang || {});
    Object.keys(BANG).forEach(function (t) { if (ten.indexOf(t) < 0) { BANG[t].dong = new Map(); doi(t); } });
    ten.forEach(function (t) {
      const goi = d.bang[t];
      const b = bang(t);
      b.khoa = goi.khoa && goi.khoa.length ? goi.khoa : b.khoa;
      b.dong = new Map();
      moGoi(goi).forEach(function (r) { if (r.DaXoa !== true) b.dong.set(khoaDong(b.khoa, r), r); });
      doi(t);
    });
    return Promise.all(Object.keys(BANG).map(luuBang));
  }
  /** Đồng bộ: thêm, sửa, xóa các dòng đổi sau mốc. */
  function apThayDoi(d) {
    const ten = Object.keys(d.bang || {});
    ten.forEach(function (t) {
      const goi = d.bang[t];
      const b = bang(t);
      if (goi.khoa && goi.khoa.length) b.khoa = goi.khoa;
      moGoi(goi).forEach(function (r) {
        const k = khoaDong(b.khoa, r);
        if (r.DaXoa === true) b.dong.delete(k); else b.dong.set(k, Object.assign({}, b.dong.get(k) || {}, r));
      });
      doi(t);
    });
    return Promise.all(ten.map(luuBang));
  }
  ME.du.apThayDoi = apThayDoi;

  // Từ điển: dòng do app tự nạp (GhiChu bắt đầu "App ") mà chưa ai sửa (PhienBan 1) thì dùng chữ mặc định trong mã,
  // để bản app mới sửa chữ vẫn hiện đúng; dòng đã sửa trong sheet hoặc trong app thì luôn được ưu tiên.
  let tuDienMap = null;
  ME.tuDien = function (khoa) {
    if (!tuDienMap) {
      tuDienMap = new Map();
      ME.du.ds('TuDien').forEach(function (r) {
        const tuNap = Number(r.PhienBan) <= 1 && /^App /.test(String(r.GhiChu || '')) && r.CapNhatBoi !== 'SUA_TAY';
        if (!tuNap) tuDienMap.set(String(r.Khoa), r);
      });
    }
    return tuDienMap.get(khoa) || null;
  };

  // Danh mục
  let dmMap = null;
  function napDM() {
    dmMap = new Map();
    ME.du.ds('DanhMuc').forEach(function (r) {
      let m = dmMap.get(r.Loai);
      if (!m) { m = []; dmMap.set(r.Loai, m); }
      m.push(r);
    });
    dmMap.forEach(function (m) { m.sort(function (a, b) { return (Number(a.ThuTu) || 0) - (Number(b.ThuTu) || 0); }); });
  }
  /** Danh mục theo loại (đang kích hoạt), xếp theo ThuTu. */
  ME.dm = function (loai, caTat) {
    if (!dmMap) napDM();
    const m = dmMap.get(loai) || [];
    return caTat ? m : m.filter(function (r) { return r.KichHoat !== false; });
  };
  ME.dmTen = function (loai, ma) {
    if (ma === '' || ma === null || ma === undefined) return { vi: '', zh: '' };
    if (!dmMap) napDM();
    const r = (dmMap.get(loai) || []).filter(function (x) { return String(x.Ma) === String(ma); })[0];
    return r ? { vi: r.TenVi || String(ma), zh: r.TenZh || '' } : { vi: String(ma), zh: '' };
  };
  ME.tenNguoi = function (maNV) {
    const r = ME.du.lay('NguoiDung', String(maNV || ''));
    return r && r.HoTen ? r.HoTen : String(maNV || '');
  };

  /** Nạp dữ liệu đã lưu trên máy khi mở app (hiện ngay, chưa cần mạng). */
  ME.napMay = function () {
    return Promise.all([ME.kho.tatCa('meta'), ME.kho.tatCa('bang'), ME.hang.napLai()]).then(function (kq) {
      kq[0].forEach(function (x) { if (Object.prototype.hasOwnProperty.call(ME.tt, x.k)) ME.tt[x.k] = x.v; });
      ME.tt.dongBo = Object.assign({ moc: '', luc: 0, cauHinh: {}, loi: null }, ME.tt.dongBo || {});
      ME.tt.khoaPin = Object.assign({ sai: 0, khoaDen: 0, lanKhoa: 0 }, ME.tt.khoaPin || {});
      kq[1].forEach(function (x) {
        const b = bang(x.k);
        b.khoa = (x.v && x.v.khoa) || b.khoa;
        b.dong = new Map();
        ((x.v && x.v.dong) || []).forEach(function (r) { b.dong.set(khoaDong(b.khoa, r), r); });
        doi(x.k);
      });
      if (!ME.tt.mayChu && window.ME_CAU_HINH && window.ME_CAU_HINH.mayChuMacDinh) ME.tt.mayChu = window.ME_CAU_HINH.mayChuMacDinh;
    });
  };

  // ───────── Gọi máy chủ ─────────
  ME.api = {};
  const LOI_MANG = { MAT_MANG: 1, HET_GIO: 1, GOOGLE_DOI_GET: 1, HTML: 1, MAY_CHU_BAN: 1 };
  ME.laLoiMang = function (e) { return !!(e && (e.mang || LOI_MANG[e.ma])); };
  ME.coMang = function () { return navigator.onLine !== false; };

  /** Đọc phản hồi: Google có lúc trả trang web (HTML) thay vì JSON. */
  function docPhanHoi(res) {
    return res.text().then(function (s) {
      let r;
      try { r = JSON.parse(s); } catch (e) {
        const tieu = (s.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
        throw ME.loiMoi(res.status === 404 ? 'HTML_404' : 'HTML', { ma: res.status, tieu: tieu.trim() }, { mang: true, status: res.status });
      }
      if (!r || typeof r !== 'object') throw ME.loiMoi('LA');
      return r;
    });
  }
  /** Kết quả doGet trả cho POST: Google đã đổi POST thành GET, thao tác chưa chạy → gửi lại cùng clientId. */
  function laKetQuaGet(r) { return r.app === 'ME' && !!r.kiemTra && r.data === undefined && r.loi === undefined; }

  function layUrl() { return String(ME.tt.mayChu || '').trim(); }

  /**
   * Gọi một action. opt: { khongToken, clientId, thoiGian (ms), khongXuLyPhien }
   * Trả data; lỗi máy chủ ném Error có { ma, vi, zh, chiTiet }; lỗi mạng có { mang: true }.
   */
  ME.api.goi = function (action, data, opt) {
    opt = opt || {};
    const url = layUrl();
    if (!url) return Promise.reject(ME.loiMoi('CHUA_KET_NOI'));
    if (!ME.coMang()) return Promise.reject(ME.loiMoi('MAT_MANG', null, { mang: true }));
    const goiYC = {
      action: action, data: data || {}, clientId: opt.clientId || ME.idMoi('c'), phienBanApp: ME.PHIEN_BAN
    };
    if (!opt.khongToken && ME.tt.phien && ME.tt.phien.token) goiYC.token = ME.tt.phien.token;
    const than = JSON.stringify(goiYC);
    let lan = 0;
    function mot() {
      lan++;
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const hen = setTimeout(function () { if (ctrl) ctrl.abort(); }, opt.thoiGian || 60000);
      return fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: than,
        redirect: 'follow', credentials: 'omit', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        clearTimeout(hen);
        return docPhanHoi(res);
      }, function (e) {
        clearTimeout(hen);
        throw ME.loiMoi(e && e.name === 'AbortError' ? 'HET_GIO' : 'MAT_MANG', null, { mang: true });
      }).then(function (r) {
        if (laKetQuaGet(r)) {
          if (lan < 3) return ME.ngu(700 * lan).then(mot);
          throw ME.loiMoi('GOOGLE_DOI_GET', null, { mang: true });
        }
        if (r.tokenMoi && r.tokenMoi.token) capNhatToken(r.tokenMoi);
        if (!r.ok) {
          const l = r.loi || {};
          const e = new Error(l.vi || 'Lỗi');
          e.ma = l.ma;
          e.vi = l.vi;
          e.zh = l.zh;
          e.chiTiet = l.chiTiet;
          if (!opt.khongXuLyPhien) xuLyLoiPhien(e);
          throw e;
        }
        return r.data;
      });
    }
    return mot();
  };
  /** GET /exec: kiểm tra địa chỉ máy chủ khi kết nối lần đầu. */
  ME.api.kiemTra = function (url) {
    return fetch(url, { redirect: 'follow', credentials: 'omit', cache: 'no-store' }).then(docPhanHoi, function () {
      throw ME.loiMoi('MAT_MANG', null, { mang: true });
    });
  };
  function capNhatToken(t) {
    if (!ME.tt.phien) return;
    ME.tt.phien.token = t.token;
    ME.tt.phien.hetHan = t.hetHan;
    luuMeta('phien');
  }
  function xuLyLoiPhien(e) {
    if (e.ma === 'PHIEN_HET_HAN' || e.ma === 'TAI_KHOAN_NGUNG') {
      if (ME.tt.phien) {
        ME.tt.phien.hetHieuLuc = true;
        ME.tt.phien.lyDo = e.ma;
        luuMeta('phien');
      }
      ME.su.phat('phien-het');
    } else if (e.ma === 'PHAI_DOI_PIN') {
      if (ME.tt.phien) { ME.tt.phien.phaiDoiPin = true; luuMeta('phien'); }
      ME.su.phat('phai-doi-pin');
    } else if (e.ma === 'CAN_CAP_NHAT_APP') {
      ME.su.phat('can-cap-nhat');
    }
  }

  // ───────── Hàng chờ gửi ─────────
  // Thao tác ghi đi qua hàng chờ: lưu vào IndexedDB trước, gửi bằng guiHangDoi; mất mạng thì để đó, có mạng tự gửi.
  // Mỗi thao tác có clientId riêng, gửi lại bao nhiêu lần máy chủ cũng chỉ ghi một lần.
  const HANG = { ds: [], dangGui: null, cho: {}, guiLai: false };
  ME.hang = {
    ds: function () { return HANG.ds; },
    soCho: function () { return HANG.ds.length; },
    soLoi: function () { return HANG.ds.filter(function (x) { return x.trangThai === 'loi' || x.trangThai === 'canXacNhan'; }).length; },
    napLai: function () {
      return ME.kho.tatCa('hang').then(function (ds) {
        HANG.ds = ds.map(function (x) { return x.v; }).sort(function (a, b) { return a.tao - b.tao; });
        HANG.ds.forEach(function (x) { if (x.trangThai === 'dangGui') x.trangThai = 'cho'; });
      });
    },
    /**
     * Thêm thao tác. tomTat: { vi, zh, loai } để hiện ở danh sách chờ gửi. opt: { daXacNhan: [lyDo] }.
     * Trả mục vừa thêm (có id = clientId).
     */
    them: function (action, data, tomTat, opt) {
      opt = opt || {};
      const muc = {
        id: ME.idMoi('h'), action: action, data: data, tomTat: tomTat || { vi: action, zh: action }, tao: Date.now(),
        trangThai: 'cho', loi: null, lanGui: 0, daXacNhan: opt.daXacNhan || [], maNV: ME.tt.phien ? ME.tt.phien.maNV : ''
      };
      HANG.ds.push(muc);
      if (HANG.dangGui) HANG.guiLai = true;
      ME.su.phat('hang');
      return ME.kho.dat('hang', muc.id, muc).then(function () { return muc; });
    },
    /** Thêm rồi chờ kết quả gửi (tối đa ms). Trả { ok, data } | { ok: false, loi } | { choGui: true } (mất mạng, lưu trên máy). */
    themVaCho: function (action, data, tomTat, opt) {
      opt = opt || {};
      return ME.hang.them(action, data, tomTat, opt).then(function (muc) {
        if (!ME.coMang()) return { choGui: true, muc: muc };
        const doi = new Promise(function (xong) { (HANG.cho[muc.id] = HANG.cho[muc.id] || []).push(xong); });
        const hen = ME.ngu(opt.cho || 20000).then(function () { return { choGui: true, muc: muc }; });
        ME.hang.gui();
        return Promise.race([doi, hen]);
      });
    },
    xoa: function (id) {
      HANG.ds = HANG.ds.filter(function (x) { return x.id !== id; });
      ME.su.phat('hang');
      return ME.kho.xoa('hang', id);
    },
    /** Chờ kết quả gửi của một mục (tối đa ms). */
    cho: function (id, ms) {
      const doi = new Promise(function (xong) { (HANG.cho[id] = HANG.cho[id] || []).push(xong); });
      return Promise.race([doi, ME.ngu(ms || 20000).then(function () { return { choGui: true }; })]);
    },
    lay: function (id) { return HANG.ds.filter(function (x) { return x.id === id; })[0] || null; },
    /** Người dùng xác nhận "vẫn lưu" cho thao tác bị máy chủ hỏi lại. */
    xacNhan: function (id) {
      const m = HANG.ds.filter(function (x) { return x.id === id; })[0];
      if (!m) return Promise.resolve();
      datXacNhan(m);
      m.trangThai = 'cho';
      m.loi = null;
      if (HANG.dangGui) HANG.guiLai = true;
      return ME.kho.dat('hang', m.id, m).then(function () { ME.su.phat('hang'); return ME.hang.gui(); });
    },
    thuLai: function (id) {
      const m = HANG.ds.filter(function (x) { return x.id === id; })[0];
      if (!m) return Promise.resolve();
      m.trangThai = 'cho';
      m.loi = null;
      if (HANG.dangGui) HANG.guiLai = true;
      return ME.kho.dat('hang', m.id, m).then(function () { ME.su.phat('hang'); return ME.hang.gui(); });
    },
    /** Gửi các thao tác đang chờ (mỗi lần tối đa 10, lặp tới khi hết hoặc lỗi mạng). */
    gui: function () {
      if (HANG.dangGui) return HANG.dangGui;
      if (!ME.tt.phien || ME.tt.phien.hetHieuLuc || ME.tt.phien.phaiDoiPin || !ME.coMang()) return Promise.resolve({ coGui: false });
      let coThanhCong = false;
      let daAp = false;
      const vong = function (lan) {
        const lo = HANG.ds.filter(function (x) { return x.trangThai === 'cho' && x.maNV === ME.tt.phien.maNV; }).slice(0, 10);
        if (!lo.length || lan > 12) return Promise.resolve();
        lo.forEach(function (x) { x.trangThai = 'dangGui'; x.lanGui++; });
        ME.su.phat('hang');
        return ME.api.goi('guiHangDoi', { thaoTac: lo.map(function (x) { return { clientId: x.id, action: x.action, data: x.data }; }) }, { thoiGian: 180000 })
          .then(function (d) {
            const theoId = {};
            (d.ketQua || []).forEach(function (r) { theoId[r.clientId] = r; });
            const viec = lo.map(function (m) {
              const r = theoId[m.id];
              if (!r) { m.trangThai = 'cho'; return ME.kho.dat('hang', m.id, m); }
              if (r.ok) {
                coThanhCong = true;
                // Ghi tạm kết quả vào dữ liệu trên máy ngay (lần đồng bộ sau sẽ thay bằng dòng chuẩn của máy chủ),
                // để số vừa ghi, trạng thái vừa đổi không "biến mất" trong lúc chờ đồng bộ.
                try { if (apKetQua(m, r.data || {})) daAp = true; } catch (e) { console.warn('Không ghi tạm được kết quả', m.action, e); }
                HANG.ds = HANG.ds.filter(function (x) { return x.id !== m.id; });
                baoXong(m.id, { ok: true, data: r.data });
                return ME.kho.xoa('hang', m.id);
              }
              const l = r.loi || {};
              const lyDo = l.chiTiet && l.chiTiet.lyDo;
              if (l.ma === 'CAN_XAC_NHAN' && lyDo && m.daXacNhan.indexOf(lyDo) >= 0 && !daCoXacNhan(m)) {
                datXacNhan(m);
                m.trangThai = 'cho';
              } else if (r.thuLai || l.ma === 'MAY_CHU_BAN' || l.ma === 'HET_THOI_GIAN') {
                m.trangThai = 'cho';
              } else if (l.ma === 'PHAI_DOI_PIN') {
                m.trangThai = 'cho';
                xuLyLoiPhien({ ma: 'PHAI_DOI_PIN' });
              } else {
                m.trangThai = l.ma === 'CAN_XAC_NHAN' ? 'canXacNhan' : 'loi';
                m.loi = { ma: l.ma, vi: l.vi, zh: l.zh, chiTiet: l.chiTiet };
                baoXong(m.id, { ok: false, loi: m.loi, muc: m });
              }
              return ME.kho.dat('hang', m.id, m);
            });
            if (daAp) { daAp = false; ME.su.phat('du-lieu'); }
            return Promise.all(viec).then(function () { ME.su.phat('hang'); return vong(lan + 1); });
          }, function (e) {
            lo.forEach(function (m) { m.trangThai = 'cho'; ME.kho.dat('hang', m.id, m); });
            ME.su.phat('hang');
            throw e;
          });
      };
      HANG.guiLai = false;
      HANG.dangGui = vong(1).then(function () {
        HANG.dangGui = null;
        ME.su.phat('hang');
        // Có thao tác mới (hoặc vừa xác nhận) trong lúc đang gửi → gửi tiếp một lượt.
        if (HANG.guiLai) { HANG.guiLai = false; setTimeout(function () { ME.hang.gui(); }, 50); }
        // Gửi được (ngoài lúc đồng bộ) → đồng bộ để lấy dòng chuẩn của máy chủ (mã ghi, tiêu thụ tính lại…).
        else if (coThanhCong && !ME.dangDongBo()) setTimeout(function () { ME.dongBo(); }, 300);
        return { coGui: true, coThanhCong: coThanhCong };
      }, function (e) {
        HANG.dangGui = null;
        HANG.guiLai = false;
        ME.su.phat('hang');
        return { coGui: false, loi: e };
      });
      return HANG.dangGui;
    }
  };
  /** Ghi một dòng vào bảng trên máy (gộp với dòng cũ). chiSua: chỉ sửa khi đã có dòng. */
  function ghiTam(ten, o, chiSua) {
    const b = bang(ten);
    if (chiSua && !b.dong.has(khoaDong(b.khoa, o))) return false;
    const cot = Object.keys(o);
    apThayDoi({ bang: { [ten]: { khoa: b.khoa, cot: cot, dong: [cot.map(function (c) { return o[c]; })] } } });
    return true;
  }
  function xoaTam(ten, o) { return ghiTam(ten, Object.assign({}, o, { DaXoa: true })); }
  function dvtTen(v) {
    if (!v) return v;
    const r = ME.du.ds('DanhMuc').filter(function (z) { return z.Loai === 'DVT' && (z.Ma === v || String(z.TenVi).toLowerCase() === String(v).toLowerCase()); })[0];
    return r ? r.TenVi : v;
  }
  /** Kết quả thao tác hàng chờ → dòng tạm trên máy. Trả true khi có ghi. */
  function apKetQua(m, d) {
    if (d.daXuLy) return false;
    const x = m.data || {};
    const nv = m.maNV;
    const luc = ME.isoVN();
    const heThong = { CapNhatLuc: luc, CapNhatBoi: nv };
    switch (m.action) {
      case 'luuChiSo':
        if (!d.maGhi) return false;
        return ghiTam('ChiSo', Object.assign({
          MaGhi: d.maGhi, ClientId: m.id, MaCT: d.maCT || x.MaCT, GhiLuc: d.ghiLuc || x.GhiLuc, NgayTinh: d.ngayTinh, NguoiGhi: nv,
          ChiSoBT: x.ChiSoBT, ChiSoCD: x.ChiSoCD === undefined ? '' : x.ChiSoCD, ChiSoTD: x.ChiSoTD === undefined ? '' : x.ChiSoTD,
          TieuThuBT: d.tieuThuBT, TieuThuCD: d.tieuThuCD, TieuThuTD: d.tieuThuTD, TieuThu: d.tieuThu, HeSoDung: d.heSo, Co: d.co,
          AnhId: d.anhId || '', GhiChu: x.GhiChu || '', NguoiDuyet: '', DuyetLuc: ''
        }, heThong));
      case 'duyetChiSo': {
        const r = ME.du.lay('ChiSo', String(x.maGhi || ''));
        if (!r) return false;
        const o = Object.assign({ MaGhi: r.MaGhi }, x.sua || {}, heThong);
        if (d.tieuThu !== undefined) o.TieuThu = d.tieuThu;
        if (d.co) o.Co = d.co;
        if (d.daDuyet) { o.NguoiDuyet = nv; o.DuyetLuc = luc; }
        if (x.ghiChu) o.GhiChu = (r.GhiChu ? r.GhiChu + ' · ' : '') + x.ghiChu;
        return ghiTam('ChiSo', o, true);
      }
      case 'xoaChiSo':
        return xoaTam('ChiSo', { MaGhi: String(x.maGhi || '') });
      case 'luuThietBi': {
        const o = Object.assign({}, x.tb || {});
        ['anh', 'laMoi', 'PhienBan'].forEach(function (k) { delete o[k]; });
        o.MaTB = d.maTB || ME.chuanMa(o.MaTB);
        if (d.anhId !== undefined) o.AnhId = d.anhId;
        if (d.phienBan !== undefined) o.PhienBan = d.phienBan;
        ghiTam('ThietBi', Object.assign(o, heThong));
        const tb = ME.du.lay('ThietBi', o.MaTB) || {};
        (x.thongSo || []).forEach(function (t) {
          if (t.xoa) { xoaTam('ThongSoTB', { MaTB: o.MaTB, MaTS: t.MaTS }); return; }
          const mau = ME.du.lay('MauThongSo', { LoaiTB: tb.LoaiTB, MaTS: t.MaTS }) || {};
          const cu = ME.du.lay('ThongSoTB', { MaTB: o.MaTB, MaTS: t.MaTS });
          ghiTam('ThongSoTB', cu ? { MaTB: o.MaTB, MaTS: t.MaTS, GiaTri: t.GiaTri, CapNhatLuc: luc } : {
            MaTB: o.MaTB, MaTS: t.MaTS, GiaTri: t.GiaTri, TenVi: mau.TenVi || t.MaTS, TenZh: mau.TenZh || '', Nhom: mau.Nhom || 'VAN_HANH',
            DonVi: mau.DonVi || '', ThuTu: mau.ThuTu === undefined ? 900 : mau.ThuTu, CapNhatLuc: luc
          });
        });
        return true;
      }
      case 'xoaThietBi':
        return xoaTam('ThietBi', { MaTB: ME.chuanMa(x.maTB) });
      case 'luuLinhKienTB': {
        const maTB = ME.chuanMa(x.maTB);
        const duyet = ME.co('GAN_LINH_KIEN') ? 'DA_DUYET' : 'CHO_DUYET';
        (x.ds || []).forEach(function (l) {
          if (l.xoa) { xoaTam('LinhKienTB', { MaTB: maTB, MaLK: l.MaLK }); return; }
          const o = Object.assign({}, l, { MaTB: maTB, TrangThaiDuyet: duyet }, heThong);
          if (o.SoLuongLap === undefined && !ME.du.lay('LinhKienTB', { MaTB: maTB, MaLK: l.MaLK })) o.SoLuongLap = 1;
          ghiTam('LinhKienTB', o);
        });
        return true;
      }
      case 'themLinhKien': {
        if (!d.maLK) return false;
        const lk = Object.assign({}, x.lk || {});
        const dsMay = lk.dsMaTB || [];
        const dichMay = lk.dichMay === true;
        ['anh', 'dsMaTB', 'xacNhan', 'dichMay'].forEach(function (k) { delete lk[k]; });
        Object.assign(lk, { MaLK: d.maLK, Nguon: 'THU_CONG', TrangThaiFile: '', TrangThaiDuyet: d.choDuyet ? 'CHO_DUYET' : 'DA_DUYET', DichMay: dichMay, AnhId: d.anhId || '', DVT: dvtTen(lk.DVT) || '' }, heThong);
        ghiTam('KhoLinhKien', lk);
        const duyet = ME.co('GAN_LINH_KIEN') ? 'DA_DUYET' : 'CHO_DUYET';
        dsMay.forEach(function (maTB) { ghiTam('LinhKienTB', Object.assign({ MaTB: ME.chuanMa(maTB), MaLK: d.maLK, SoLuongLap: 1, TrangThaiDuyet: duyet }, heThong)); });
        return true;
      }
      case 'suaLinhKien': {
        const lk = Object.assign({}, x.lk || {});
        if (lk.duyetDich) lk.DichMay = false;
        if (lk.TenZh !== undefined) lk.DichMay = lk.dichMay === true;
        ['anh', 'PhienBan', 'duyetDich', 'dichMay'].forEach(function (k) { delete lk[k]; });
        if (lk.DVT !== undefined) lk.DVT = dvtTen(lk.DVT);
        if (d.anhId !== undefined) lk.AnhId = d.anhId;
        if (d.phienBan !== undefined) lk.PhienBan = d.phienBan;
        return ghiTam('KhoLinhKien', Object.assign(lk, heThong), true);
      }
      case 'duyetLinhKien':
        return ghiTam('KhoLinhKien', Object.assign({ MaLK: x.maLK, TrangThaiDuyet: 'DA_DUYET' }, heThong), true);
      default:
        return false;
    }
  }
  function daCoXacNhan(m) { return m.action === 'themLinhKien' ? !!(m.data.lk && m.data.lk.xacNhan) : !!m.data.xacNhan; }
  function datXacNhan(m) {
    if (m.action === 'themLinhKien') m.data.lk = Object.assign({}, m.data.lk, { xacNhan: true });
    else m.data = Object.assign({}, m.data, { xacNhan: true });
  }
  function baoXong(id, kq) {
    (HANG.cho[id] || []).forEach(function (fn) { fn(kq); });
    delete HANG.cho[id];
  }

  // ───────── Đồng bộ ─────────
  let dangDB = null;
  /** Gửi hàng chờ rồi tải phần dữ liệu đã đổi (hoặc tải lại toàn bộ khi máy chủ yêu cầu). */
  ME.dongBo = function (opt) {
    opt = opt || {};
    if (dangDB) return dangDB;
    if (!ME.tt.phien || ME.tt.phien.hetHieuLuc || ME.tt.phien.phaiDoiPin) return Promise.resolve(false);
    if (!ME.coMang()) {
      ME.tt.dongBo.loi = { ma: 'MAT_MANG' };
      ME.su.phat('dong-bo');
      return Promise.resolve(false);
    }
    dangDB = ME.hang.gui().then(function () {
      const moc = ME.tt.dongBo.moc;
      if (!moc || opt.toanBo) return ME.api.goi('taiBanDau', {}, { thoiGian: 120000 }).then(function (d) { return apToanBo(d).then(function () { return d; }); });
      return ME.api.goi('dongBo', { moc: moc }, { thoiGian: 90000 }).then(function (d) {
        if (d.taiLai) return ME.api.goi('taiBanDau', {}, { thoiGian: 120000 }).then(function (d2) { return apToanBo(d2).then(function () { return d2; }); });
        return apThayDoi(d).then(function () { return d; });
      });
    }).then(function (d) {
      ME.tt.dongBo.moc = d.moc;
      ME.tt.dongBo.luc = Date.now();
      ME.tt.dongBo.cauHinh = d.cauHinh || ME.tt.dongBo.cauHinh;
      ME.tt.dongBo.loi = null;
      if (d.hoSo && ME.tt.phien) { ME.tt.phien.hoSo = d.hoSo; luuMeta('phien'); }
      luuMeta('dongBo');
      dangDB = null;
      ME.su.phat('du-lieu');
      ME.su.phat('dong-bo');
      boSungTuDien();
      return true;
    }, function (e) {
      dangDB = null;
      ME.tt.dongBo.loi = { ma: e.ma || 'LOI', vi: e.vi, zh: e.zh };
      ME.su.phat('dong-bo');
      if (!ME.laLoiMang(e) && e.ma !== 'PHIEN_HET_HAN') console.warn('Đồng bộ lỗi', e);
      return false;
    });
    ME.su.phat('dong-bo', { dang: true });
    return dangDB;
  };
  ME.dangDongBo = function () { return !!dangDB; };

  /** Nạp nhãn giao diện mặc định vào sheet TuDien (chỉ thêm khóa thiếu, không ghi đè bản dịch đã sửa). Một lần cho mỗi phiên bản app. */
  function boSungTuDien() {
    if (!ME.co('QUAN_TRI') || ME.tt.tuDienBoSung === ME.PHIEN_BAN) return;
    const coSan = new Set(ME.du.ds('TuDien').map(function (r) { return String(r.Khoa); }));
    const ds = Object.keys(ME.NHAN).filter(function (k) { return !coSan.has(k); }).map(function (k) {
      const p = ME.NHAN[k];
      return { Khoa: k, Vi: p[0], Zh: p[1], GhiChu: 'App ' + ME.PHIEN_BAN + ' · ' + (p[2] || '') };
    });
    const xong = function () { ME.tt.tuDienBoSung = ME.PHIEN_BAN; luuMeta('tuDienBoSung'); };
    if (!ds.length) { xong(); return; }
    ME.api.goi('boSungTuDien', { ds: ds.slice(0, 3000) }, { thoiGian: 90000 }).then(xong, function (e) { console.warn('Chưa bổ sung được từ điển', e); });
  }

  // ───────── Phiên đăng nhập, PIN ─────────
  function b64(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function tuB64(s) { const t = atob(s); const b = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; }
  function bamPin(pin, muoi, vong) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(ME.loiMoi('TRINH_DUYET_CU'));
    return crypto.subtle.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: tuB64(muoi), iterations: vong, hash: 'SHA-256' }, k, 256);
    }).then(b64);
  }
  function luuPinMay(pin) {
    const m = new Uint8Array(16);
    crypto.getRandomValues(m);
    const muoi = b64(m);
    return bamPin(pin, muoi, 120000).then(function (bam) {
      ME.tt.pin = { muoi: muoi, vong: 120000, bam: bam };
      return luuMeta('pin');
    });
  }
  function soSanh(a, b) {
    if (a.length !== b.length) return false;
    let k = 0;
    for (let i = 0; i < a.length; i++) k |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return k === 0;
  }
  ME.phien = {
    /** PIN dễ đoán (giống máy chủ BaoMat.gs). */
    deDoan: function (s) {
      const DS_HAY_DUNG = ['147258', '258369', '147369', '369258', '159753', '357159', '951753', '753951', '159357', '741852', '852963', '963852',
        '789456', '456123', '112358', '100200', '102030', '520520', '521521', '131420', '201314', '520131', '168168', '668668', '686868', '868686', '888999', '999888'];
      if (!/^\d{6}$/.test(s)) return true;
      if (/^(\d)\1{5}$/.test(s)) return true;
      const d = s.split('').map(Number);
      let tang = true;
      let giam = true;
      for (let i = 1; i < 6; i++) {
        if ((d[i] - d[i - 1] + 10) % 10 !== 1) tang = false;
        if ((d[i - 1] - d[i] + 10) % 10 !== 1) giam = false;
      }
      if (tang || giam) return true;
      if (/^(\d\d)\1\1$/.test(s) || /^(\d{3})\1$/.test(s) || /^(\d)\1(\d)\2(\d)\3$/.test(s) || /^(\d)\1\1(\d)\2\2$/.test(s) || /^(\d)(\d)(\d)\3\2\1$/.test(s)) return true;
      return DS_HAY_DUNG.indexOf(s) >= 0;
    },
    /** Còn khóa trên máy (sai PIN nhiều lần lúc mất mạng)? Trả thời điểm hết khóa (ms) hoặc 0. */
    dangKhoa: function () {
      const k = ME.tt.khoaPin;
      return k.khoaDen && k.khoaDen > Date.now() ? k.khoaDen : 0;
    },
    /** Đăng nhập qua máy chủ (lần đầu trên máy, hoặc khi phiên hết hạn). */
    dangNhap: function (maNV, pin) {
      maNV = ME.chuanMaNV(maNV);
      return ME.api.goi('dangNhap', { maNV: maNV, pin: pin }, { khongToken: true, khongXuLyPhien: true }).then(function (d) {
        const cu = ME.tt.phien;
        const doiNguoi = !cu || cu.maNV !== d.hoSo.MaNV;
        ME.tt.phien = { maNV: d.hoSo.MaNV, token: d.token, hetHan: d.hetHan, hoSo: d.hoSo, phaiDoiPin: !!d.phaiDoiPin, hetHieuLuc: false };
        ME.tt.khoaPin = { sai: 0, khoaDen: 0, lanKhoa: 0 };
        const viec = [luuMeta('phien'), luuMeta('khoaPin'), luuPinMay(pin)];
        if (doiNguoi) viec.push(ME.phien.xoaDuLieu());
        return Promise.all(viec).then(function () { ME.tt.moKhoa = true; return d; });
      });
    },
    doiPin: function (pinCu, pinMoi) {
      return ME.api.goi('doiPin', { pinCu: pinCu, pinMoi: pinMoi }, { khongXuLyPhien: true }).then(function (d) {
        ME.tt.phien.token = d.token;
        ME.tt.phien.hetHan = d.hetHan;
        ME.tt.phien.hoSo = d.hoSo;
        ME.tt.phien.phaiDoiPin = false;
        ME.tt.phien.hetHieuLuc = false;
        return Promise.all([luuMeta('phien'), luuPinMay(pinMoi)]).then(function () { return d; });
      });
    },
    /**
     * Mở khóa bằng PIN: kiểm ngay trên máy (được cả khi mất mạng). Sai trên máy mà có mạng thì hỏi máy chủ
     * (PIN có thể vừa đổi trên máy khác). Phiên đã hết hạn thì bắt buộc hỏi máy chủ.
     * Trả { ok } | { ok: false, loi }.
     */
    moKhoa: function (pin) {
      const p = ME.tt.phien;
      const khoaDen = ME.phien.dangKhoa();
      if (khoaDen) return Promise.resolve({ ok: false, loi: ME.loiMoi('KHOA_MAY', { gio: ME.gio(ME.isoVN(khoaDen)) }) });
      const quaMayChu = function () {
        return ME.phien.dangNhap(p.maNV, pin).then(function () { return { ok: true }; }, function (e) { return { ok: false, loi: e }; });
      };
      if (p.hetHieuLuc || !ME.tt.pin) {
        if (!ME.coMang()) return Promise.resolve({ ok: false, loi: ME.loiMoi('CAN_MANG_DANG_NHAP') });
        return quaMayChu();
      }
      return bamPin(pin, ME.tt.pin.muoi, ME.tt.pin.vong).then(function (bam) {
        if (soSanh(bam, ME.tt.pin.bam)) {
          ME.tt.khoaPin = { sai: 0, khoaDen: 0, lanKhoa: 0 };
          luuMeta('khoaPin');
          ME.tt.moKhoa = true;
          return { ok: true };
        }
        if (ME.coMang()) return quaMayChu();
        const toiDa = Number(ME.cauHinh('SO_LAN_SAI_PIN_TOI_DA')) || 5;
        const phut = Number(ME.cauHinh('PHUT_KHOA_PIN')) || 15;
        const k = ME.tt.khoaPin;
        k.sai++;
        let loi;
        if (k.sai % toiDa === 0) {
          k.lanKhoa++;
          k.khoaDen = Date.now() + Math.min(phut * Math.pow(2, k.lanKhoa - 1), 1440) * 60000;
          loi = ME.loiMoi('KHOA_MAY', { gio: ME.gio(ME.isoVN(k.khoaDen)) });
        } else {
          loi = ME.loiMoi('SAI_PIN_MAY', { con: toiDa - (k.sai % toiDa) });
        }
        luuMeta('khoaPin');
        return { ok: false, loi: loi };
      });
    },
    khoa: function () { ME.tt.moKhoa = false; },
    /** Xóa dữ liệu bảng trên máy (đổi người dùng). Giữ link máy chủ. */
    xoaDuLieu: function () {
      Object.keys(BANG).forEach(function (t) { BANG[t].dong = new Map(); doi(t); });
      ME.tt.dongBo = { moc: '', luc: 0, cauHinh: ME.tt.dongBo.cauHinh || {}, loi: null };
      return Promise.all([ME.kho.xoaHet('bang'), ME.kho.xoaHet('anh'), luuMeta('dongBo')]);
    },
    /** Đăng xuất khỏi máy này: xóa phiên, PIN, dữ liệu. Không cho khi còn thao tác chờ gửi. */
    dangXuat: function () {
      ME.tt.phien = null;
      ME.tt.pin = null;
      ME.tt.moKhoa = false;
      ME.tt.khoaPin = { sai: 0, khoaDen: 0, lanKhoa: 0 };
      return Promise.all([ME.kho.xoa('meta', 'phien'), ME.kho.xoa('meta', 'pin'), luuMeta('khoaPin'), ME.phien.xoaDuLieu(), ME.kho.xoaHet('hang')])
        .then(function () { HANG.ds = []; ME.su.phat('hang'); });
    }
  };

  // ───────── Ảnh ─────────
  /** Ảnh chia sẻ (thiết bị, linh kiện): link khó đoán của Drive, hiện nhanh. */
  ME.anhUrl = function (anhId, rong) { return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(anhId) + '&sz=w' + (rong || 800); };
  /** Ảnh riêng tư (công tơ…): tải qua máy chủ (layAnh), lưu trên máy tối đa 60 ảnh. */
  ME.anhRieng = function (anhId) {
    return ME.kho.lay('anh', anhId).then(function (c) {
      if (c && c.url) return c.url;
      return ME.api.goi('layAnh', { anhId: anhId }, { thoiGian: 60000 }).then(function (d) {
        const url = 'data:' + (d.mime || 'image/jpeg') + ';base64,' + d.base64;
        ME.kho.dat('anh', anhId, { url: url, luc: Date.now() }).then(donAnh);
        return url;
      });
    });
  };
  function donAnh() {
    ME.kho.tatCa('anh').then(function (ds) {
      if (ds.length <= 60) return;
      ds.sort(function (a, b) { return (a.v.luc || 0) - (b.v.luc || 0); });
      ds.slice(0, ds.length - 60).forEach(function (x) { ME.kho.xoa('anh', x.k); });
    });
  }
})();

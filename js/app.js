/* ME – Quản lý Cơ điện · 机电管理系统
   app.js — điều hướng giữa các màn (đường dẫn sau dấu #), chặn màn khi chưa mở khóa, vòng đời app trên iPhone
   (mở lại từ nền, mất mạng, có mạng), Service Worker và thông báo có bản mới. Nạp sau cùng. */
(function () {
  'use strict';
  const ME = window.ME;
  const h = ME.h;

  // ───────── Điều hướng ─────────
  // Danh sách màn (ME.tuyen) khai ở nen.js để các tệp man-*.js đăng ký trước khi app.js chạy.
  const TUYEN = ME.TUYEN;
  const nganXep = [];
  const cuon = {};
  let hienTai = null;
  let sauMoKhoa = '';

  function tachHash() {
    let s = location.hash.replace(/^#/, '') || '/';
    if (s.charAt(0) !== '/') s = '/' + s;
    const i = s.indexOf('?');
    const duong = i >= 0 ? s.slice(0, i) : s;
    const q = {};
    if (i >= 0) s.slice(i + 1).split('&').forEach(function (p) {
      if (!p) return;
      const j = p.indexOf('=');
      const k = j < 0 ? p : p.slice(0, j);
      const v = j < 0 ? '' : p.slice(j + 1);
      try { q[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { q[k] = v; }
    });
    return { duong: duong, q: q, day: s };
  }
  ME.di = function (duong, thay) {
    if (thay) {
      history.replaceState(null, '', '#' + duong);
      nganXep.pop();
      xuLy();
    } else if (location.hash === '#' + duong) {
      xuLy();
    } else {
      location.hash = duong;
    }
  };
  /** Quay lại màn trước trong app; mở thẳng (không có màn trước) thì về macDinh. */
  ME.quayLai = function (macDinh) {
    if (nganXep.length > 1) history.back();
    else ME.di(macDinh || '/', true);
  };
  ME.hienTai = function () { return hienTai; };

  function chan(duong) {
    const t = ME.tt;
    if (!t.mayChu) return duong === '/ket-noi' ? null : '/ket-noi';
    if (!t.phien) return duong === '/dang-nhap' || duong === '/ket-noi' ? null : '/dang-nhap';
    if (!t.moKhoa) return duong === '/dang-nhap' || duong === '/ket-noi' ? null : '/dang-nhap';
    if (t.phien.phaiDoiPin && duong !== '/doi-pin') return '/doi-pin';
    return null;
  }

  function xuLy() {
    const x = tachHash();
    const re = chan(x.duong);
    if (re) {
      if (re === '/dang-nhap' && x.duong !== '/' && x.duong !== '/dang-nhap') sauMoKhoa = x.day;
      history.replaceState(null, '', '#' + re);
      return ve(re, {});
    }
    // Ngăn xếp để biết đang quay lại (giữ vị trí cuộn).
    let laQuayLai = false;
    if (nganXep.length > 1 && nganXep[nganXep.length - 2] === x.day) { nganXep.pop(); laQuayLai = true; }
    else if (nganXep[nganXep.length - 1] !== x.day) nganXep.push(x.day);
    if (nganXep.length > 60) nganXep.splice(0, nganXep.length - 60);
    ve(x.duong, x.q, laQuayLai, x.day);
  }

  function timTuyen(duong) {
    for (let i = 0; i < TUYEN.length; i++) {
      const m = duong.match(TUYEN[i].re);
      if (m) {
        const ts = {};
        TUYEN[i].ten.forEach(function (k, j) { ts[k] = decodeURIComponent(m[j + 1]); });
        return { t: TUYEN[i], ts: ts };
      }
    }
    return null;
  }

  function ve(duong, q, laQuayLai, day) {
    const goc = document.getElementById('app');
    if (hienTai && hienTai.day) cuon[hienTai.day] = window.scrollY;
    if (hienTai && hienTai.man.roiDi) { try { hienTai.man.roiDi(); } catch (e) { console.error(e); } }
    const tim = timTuyen(duong) || timTuyen('/');
    if (!tim) return;
    let el;
    try {
      el = tim.t.man.ve(tim.ts, q || {});
    } catch (e) {
      console.error(e);
      el = manLoi(e);
    }
    ME.xoaCon(goc);
    goc.appendChild(el);
    hienTai = { man: tim.t.man, ts: tim.ts, q: q || {}, duong: duong, day: day || duong, el: el };
    window.scrollTo(0, laQuayLai ? (cuon[day] || 0) : 0);
    if (tim.t.man.sauVe) { try { tim.t.man.sauVe(el, tim.ts, q || {}); } catch (e) { console.error(e); } }
  }
  /** Vẽ lại màn đang mở (khi dữ liệu đổi), giữ vị trí cuộn. */
  ME.veLai = function () {
    if (!hienTai) return;
    const y = window.scrollY;
    const goc = document.getElementById('app');
    let el;
    try { el = hienTai.man.ve(hienTai.ts, hienTai.q); } catch (e) { console.error(e); return; }
    ME.xoaCon(goc);
    goc.appendChild(el);
    hienTai.el = el;
    window.scrollTo(0, y);
    if (hienTai.man.sauVe) { try { hienTai.man.sauVe(el, hienTai.ts, hienTai.q, true); } catch (e) { console.error(e); } }
  };
  function manLoi(e) {
    return h('div', { class: 'trang' }, ME.ui.dau({ tieuDe: 'chung.coLoi', quayLai: '/' }),
      h('main', { class: 'noi-dung' }, h('div', { class: 'hop-cb do' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L2(ME.loiChu(e).vi, ME.loiChu(e).zh)))));
  }
  function capNhatHienTai(loai) {
    if (!hienTai) return;
    const m = hienTai.man;
    if (m.capNhat) { try { m.capNhat(hienTai.el, loai); } catch (e) { console.error(e); } return; }
    if (m.tuLamMoi && loai === 'du-lieu') ME.veLai();
  }
  ME.su.nghe('du-lieu', function () { capNhatHienTai('du-lieu'); });
  ME.su.nghe('hang', function () { capNhatHienTai('hang'); });
  ME.su.nghe('dong-bo', function () { capNhatHienTai('dong-bo'); });

  /** Sau khi mở khóa: về màn đang định mở (nếu có), không thì Trang chủ. */
  ME.vaoApp = function () {
    const d = sauMoKhoa || '/';
    sauMoKhoa = '';
    nganXep.length = 0;
    ME.di(d.split('?')[0] === '/dang-nhap' ? '/' : d, true);
    batDauChay();
  };

  // ───────── Vòng đời trên iPhone ─────────
  const KHOA_SAU_PHUT = 10;
  let anLuc = 0;
  let henKy = null;
  function batDauChay() {
    ME.dongBo();
    clearInterval(henKy);
    henKy = setInterval(function () {
      if (document.visibilityState === 'visible' && ME.tt.moKhoa && Date.now() - (ME.tt.dongBo.luc || 0) > 5 * 60000) ME.dongBo();
    }, 60000);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { anLuc = Date.now(); return; }
    if (swDangKy) swDangKy.update().catch(function () {});
    if (!ME.tt.moKhoa || !ME.tt.phien) return;
    if (anLuc && Date.now() - anLuc > KHOA_SAU_PHUT * 60000) {
      ME.phien.khoa();
      sauMoKhoa = location.hash.replace(/^#/, '') || '/';
      ME.di('/dang-nhap', true);
      return;
    }
    if (Date.now() - (ME.tt.dongBo.luc || 0) > 60000 || ME.hang.soCho()) ME.dongBo();
  });
  window.addEventListener('online', function () {
    if (!ME.tt.moKhoa) return;
    ME.thongBao('chung.coMangLai', null, { n: ME.hang.soCho() });
    ME.dongBo();
  });
  window.addEventListener('offline', function () {
    if (!ME.tt.moKhoa) return;
    ME.thongBao('chung.matMang', 'loi');
    ME.su.phat('dong-bo');
  });
  ME.su.nghe('phien-het', function () {
    if (!ME.tt.moKhoa) return;
    ME.phien.khoa();
    sauMoKhoa = location.hash.replace(/^#/, '') || '/';
    ME.di('/dang-nhap', true);
  });
  ME.su.nghe('phai-doi-pin', function () { if (ME.tt.moKhoa) ME.di('/doi-pin', true); });

  // ───────── Service Worker, bản mới ─────────
  let swDangKy = null;
  let dangTaiLai = false;
  function hienBanMoi(reg) {
    if (ME.$('.dai-ban-moi')) return;
    const dai = h('button', {
      type: 'button', class: 'dai-ban-moi',
      onClick: function () {
        if (reg.waiting) reg.waiting.postMessage({ lenh: 'KICH_HOAT' });
        else location.reload();
      }
    }, ME.ic('dongBo', 20, 2), h('span', null, ME.L('chung.coBanMoi')));
    const vo = h('div', { class: 'bang-moi' }, dai);
    document.body.insertBefore(vo, document.body.firstChild);
  }
  ME.su.nghe('can-cap-nhat', function () {
    if (swDangKy) swDangKy.update().then(function () { if (swDangKy.waiting) hienBanMoi(swDangKy); });
    ME.thongBao('loi.CAN_CAP_NHAT_APP_NGAN', 'loi');
  });
  ME.kiemBanMoi = function () {
    if (!swDangKy) return Promise.resolve(false);
    return swDangKy.update().then(function () {
      if (swDangKy.waiting || swDangKy.installing) { hienBanMoi(swDangKy); return true; }
      return false;
    });
  };
  function dangKySW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      if (!reg) return;
      swDangKy = reg;
      if (reg.waiting && navigator.serviceWorker.controller) hienBanMoi(reg);
      reg.addEventListener('updatefound', function () {
        const moi = reg.installing;
        if (!moi) return;
        moi.addEventListener('statechange', function () {
          if (moi.state === 'installed' && navigator.serviceWorker.controller) hienBanMoi(reg);
        });
      });
    }).catch(function (e) { console.warn('Không đăng ký được Service Worker', e); });
    // Lần cài đầu, SW nhận quyền điều khiển trang (clients.claim) → không tải lại; chỉ tải lại khi thay bản cũ bằng bản mới.
    let coDieuKhien = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!coDieuKhien) { coDieuKhien = true; return; }
      if (dangTaiLai) return;
      dangTaiLai = true;
      location.reload();
    });
  }

  // ───────── Khởi động ─────────
  function khoiDong() {
    dangKySW();
    ME.napMay().then(function () {
      window.addEventListener('hashchange', xuLy);
      xuLy();
    }, function (e) {
      console.error(e);
      const goc = document.getElementById('app');
      ME.xoaCon(goc).appendChild(h('div', { class: 'trang' }, h('main', { class: 'noi-dung', style: 'padding-top:calc(24px + env(safe-area-inset-top))' },
        h('div', { class: 'hop-cb do' }, ME.ic('canhBaoTron', 20, 2), h('div', { class: 'chu' }, ME.L('loi.KHONG_LUU_TRU'))))));
    });
  }
  khoiDong();
})();

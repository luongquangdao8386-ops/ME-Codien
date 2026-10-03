/* ME – Quản lý Cơ điện · 机电管理系统
   nen.js — tiện ích dùng chung: dựng giao diện an toàn (không dùng innerHTML cho dữ liệu), biểu tượng, nhãn song ngữ,
   định dạng số và ngày kiểu Việt / Trung, giờ Việt Nam, hộp thoại, thông báo, thanh điều hướng, nén ảnh. */
(function () {
  'use strict';
  const ME = window.ME = window.ME || {};
  const CH = window.ME_CAU_HINH || {};
  ME.PHIEN_BAN = CH.phienBan || '1.0.0';

  /** Đăng ký màn: ME.tuyen('/tb/:ma', { ve(ts, q), tuLamMoi, capNhat(el, loai), sauVe(el, ts, q, laVeLai), roiDi() }). */
  ME.TUYEN = [];
  ME.tuyen = function (mau, man) {
    const ten = [];
    const re = new RegExp('^' + mau.replace(/:(\w+)/g, function (m, k) { ten.push(k); return '([^/]+)'; }) + '$');
    ME.TUYEN.push({ mau: mau, re: re, ten: ten, man: man });
  };

  // ───────── Dựng phần tử ─────────
  const THUOC_TINH_PROP = { value: 1, checked: 1, disabled: 1, selected: 1, readOnly: 1, multiple: 1, hidden: 1 };
  function them(el, c) {
    if (c === null || c === undefined || c === false || c === true) return;
    if (Array.isArray(c)) { for (let i = 0; i < c.length; i++) them(el, c[i]); return; }
    if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
  /** h('div', { class, style, onClick, ... }, con...) — chữ luôn vào bằng text node (chống chèn mã). */
  function h(tag, props) {
    const el = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style') {
          if (typeof v === 'string') el.style.cssText = v; else Object.assign(el.style, v);
        } else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (THUOC_TINH_PROP[k]) el[k] = v;
        else el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    for (let i = 2; i < arguments.length; i++) them(el, arguments[i]);
    return el;
  }
  ME.h = h;
  ME.them = them;
  ME.$ = function (s, goc) { return (goc || document).querySelector(s); };
  ME.$$ = function (s, goc) { return Array.prototype.slice.call((goc || document).querySelectorAll(s)); };
  ME.xoaCon = function (el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; };

  // ───────── Biểu tượng (nét, 24×24) — chuỗi cố định, không chứa dữ liệu người dùng ─────────
  const IC = {
    lui: '<polyline points="15 18 9 12 15 6"/>',
    phai: '<polyline points="9 18 15 12 9 6"/>',
    xuong: '<polyline points="6 9 12 15 18 9"/>',
    dong: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    tim: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    cong: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    tru: '<line x1="5" y1="12" x2="19" y2="12"/>',
    qr: '<path d="M3 7V4a1 1 0 0 1 1-1h3"/><path d="M17 3h3a1 1 0 0 1 1 1v3"/><path d="M21 17v3a1 1 0 0 1-1 1h-3"/><path d="M7 21H4a1 1 0 0 1-1-1v-3"/><rect x="7" y="7" width="4" height="4"/><rect x="13" y="7" width="4" height="4"/><rect x="7" y="13" width="4" height="4"/><line x1="14" y1="14" x2="17" y2="14"/><line x1="14" y1="17" x2="17" y2="17"/>',
    qrVuong: '<path d="M3 7V4a1 1 0 0 1 1-1h3"/><path d="M17 3h3a1 1 0 0 1 1 1v3"/><path d="M21 17v3a1 1 0 0 1-1 1h-3"/><path d="M7 21H4a1 1 0 0 1-1-1v-3"/><rect x="8" y="8" width="8" height="8"/>',
    nha: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    banhRang: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    hop: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    nguoi: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    nhom: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chuong: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    dongBo: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    checkTron: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    canhBao: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    canhBaoTron: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    thongTin: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    viec: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><polyline points="9 14 11 16 15 12"/>',
    coLe: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    lichCheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>',
    lich: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    set: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    cot: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    cot2: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    luoi: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    vuongCong: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    danhSach: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    mayIn: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    thanhTruot: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    tep: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    tepLen: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>',
    tepCheck: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/>',
    lichSu: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 14"/>',
    khoa: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    lienKet: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    chu: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    but: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    baCham: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    mayAnh: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    anh: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    dich: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    giot: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    nhiet: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    gio: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
    tuDien: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    nguon: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
    vongBi: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    xoaPhim: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>',
    matMang: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    taiXuong: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    muiTenPhai: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    nhan: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    hoatDong: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    dangXuat: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    thungRac: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    dienThoai: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    cauChi: '<rect x="7" y="3" width="10" height="18" rx="2"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>',
    saoChep: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    duyet: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    gop: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    mayChu: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'
  };
  const MANG_SVG = 'http://www.w3.org/2000/svg';
  /** Biểu tượng nét: ic('tim', 20, 1.8). */
  ME.ic = function (ten, co, net, them) {
    const t = document.createElement('template');
    t.innerHTML = '<svg xmlns="' + MANG_SVG + '" width="' + (co || 24) + '" height="' + (co || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (net || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[ten] || '') + '</svg>';
    const s = t.content.firstChild;
    if (them) Object.keys(them).forEach(function (k) { s.setAttribute(k, them[k]); });
    return s;
  };
  /** Logo ME (mũ bảo hộ + cờ lê), vẽ tay theo bảng Logo của bản vẽ. */
  ME.logo = function (co, nen) {
    const t = document.createElement('template');
    t.innerHTML = '<svg xmlns="' + MANG_SVG + '" width="' + co + '" height="' + co + '" viewBox="0 0 100 100" role="img" aria-label="Logo ME">' +
      (nen ? '<rect width="100" height="100" rx="22" fill="#1B365D"/>' : '') +
      '<g transform="translate(50 49) rotate(-45)" fill="#DCE4EE"><rect x="-29" y="-4.5" width="57" height="9" rx="4.5"/><path d="M45.31 -4 A12 12 0 1 0 45.31 4 L31 4 L31 -4 Z"/><path fill-rule="evenodd" d="M-45 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 Z M-40.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 Z"/></g>' +
      '<g fill="#1B365D" stroke="#1B365D" stroke-width="5" stroke-linejoin="round"><path d="M24 61 C24 40.5 35.6 27.5 50 27.5 C64.4 27.5 76 40.5 76 61 Z"/><rect x="14" y="59" width="72" height="10" rx="5"/></g>' +
      '<path d="M24 61 C24 40.5 35.6 27.5 50 27.5 C64.4 27.5 76 40.5 76 61 Z" fill="#FFC72C"/><rect x="14" y="59" width="72" height="10" rx="5" fill="#FFC72C"/>' +
      '<rect x="24" y="59" width="52" height="2.6" rx="1.3" fill="#E0A800"/><path d="M43.6 30.5 L42.6 58.5 M56.4 30.5 L57.4 58.5" stroke="#E0A800" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '<path d="M31.5 50 C32.5 42 37.2 36 43 33" stroke="#FFE7A0" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
    return t.content.firstChild;
  };

  // ───────── Nhãn song ngữ ─────────
  // ME.NHAN[khoa] = [Việt, Trung, nhóm]. Bản dịch sửa ở sheet TuDien (đồng bộ về) được ưu tiên.
  ME.NHAN = {};
  ME.nhan = function (nhom, bo) {
    Object.keys(bo).forEach(function (k) { ME.NHAN[k] = [bo[k][0], bo[k][1], nhom]; });
  };
  function thayThamSo(s, ts, zh) {
    if (!ts) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      let v = ts[k];
      if (v === undefined || v === null) return '';
      if (Array.isArray(v)) v = zh ? v[1] : v[0];
      if (typeof v === 'number') return zh ? ME.soZh(v) : ME.soVi(v);
      return String(v);
    });
  }
  /** t('khoa', { n: 3 }) → { vi, zh } */
  ME.t = function (khoa, ts) {
    let p = ME.NHAN[khoa];
    const td = ME.tuDien && ME.tuDien(khoa);
    let vi = p ? p[0] : khoa;
    let zh = p ? p[1] : khoa;
    if (td) {
      if (td.Vi) vi = td.Vi;
      if (td.Zh) zh = td.Zh;
    }
    return { vi: thayThamSo(vi, ts, false), zh: thayThamSo(zh, ts, true) };
  };
  /** Hai dòng: [span.vi, span.zh] từ khóa nhãn. */
  ME.L = function (khoa, ts) {
    const x = ME.t(khoa, ts);
    return [h('span', { class: 'vi' }, x.vi), h('span', { class: 'zh', lang: 'zh-Hans' }, x.zh)];
  };
  /** Hai dòng từ chữ có sẵn (dữ liệu). zh trống thì chỉ một dòng. */
  ME.L2 = function (vi, zh) {
    return [h('span', { class: 'vi' }, vi === undefined || vi === null ? '' : vi),
      zh ? h('span', { class: 'zh', lang: 'zh-Hans' }, zh) : null];
  };
  /** Một dòng "Việt · 中文" cho ô nhập, lựa chọn, nhãn đọc màn hình. */
  ME.t1 = function (khoa, ts) { const x = ME.t(khoa, ts); return x.vi + ' · ' + x.zh; };
  ME.tv = function (khoa, ts) { return ME.t(khoa, ts).vi; };
  ME.tz = function (khoa, ts) { return ME.t(khoa, ts).zh; };

  // ───────── Số ─────────
  /** Đọc số kiểu Việt và kiểu Anh, giống máy chủ (docSo_): "7,5" = "7.5"; "4.000" = 4000; chỉ số công tơ (thapPhan) "250.125" = 250,125. */
  ME.docSo = function (v, thapPhan) {
    if (typeof v === 'number') return isFinite(v) ? v : NaN;
    if (v === null || v === undefined || typeof v === 'boolean') return NaN;
    let s = String(v).normalize('NFC').replace(/[\s  ]/g, '');
    if (!s) return NaN;
    let dau = '';
    if (s.charAt(0) === '-' || s.charAt(0) === '+') { dau = s.charAt(0) === '-' ? '-' : ''; s = s.slice(1); }
    if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
    const nhomNghin = function (x, k) { return new RegExp('^\\d{1,3}(\\' + k + '\\d{3})+$').test(x); };
    const coCham = s.indexOf('.') >= 0;
    const coPhay = s.indexOf(',') >= 0;
    if (coCham && coPhay) {
      const viTri = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
      const tp = s.charAt(viTri);
      const nghin = tp === ',' ? '.' : ',';
      const nguyen = s.slice(0, viTri);
      const le = s.slice(viTri + 1);
      if (nguyen.indexOf(tp) >= 0 || !/^\d*$/.test(le)) return NaN;
      if (nguyen.indexOf(nghin) >= 0 && !nhomNghin(nguyen, nghin)) return NaN;
      s = nguyen.split(nghin).join('') + '.' + le;
    } else if (coCham || coPhay) {
      const k = coCham ? '.' : ',';
      const dem = s.split(k).length - 1;
      if (dem > 1) {
        if (!nhomNghin(s, k)) return NaN;
        s = s.split(k).join('');
      } else if (k === '.' && !thapPhan && s.charAt(0) !== '0' && nhomNghin(s, '.')) {
        s = s.replace('.', '');
      } else {
        s = s.replace(k, '.');
      }
    }
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return Number(dau + s);
  };
  ME.lamTron = function (x, so) {
    const f = Math.pow(10, so === undefined ? 2 : so);
    return Math.round((Number(x) + (x >= 0 ? 1e-9 : -1e-9)) * f) / f;
  };
  function dinhDangSo(x, le, nghin, tp) {
    const n = Number(x);
    if (x === '' || x === null || x === undefined || !isFinite(n)) return x === null || x === undefined ? '' : String(x);
    const s = ME.lamTron(Math.abs(n), le === undefined ? 3 : le).toString();
    if (/e/.test(s)) return String(n);
    const p = s.split('.');
    return (n < 0 && Number(s) !== 0 ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, nghin) + (p[1] ? tp + p[1] : '');
  }
  /** 1.234,5 */
  ME.soVi = function (x, le) { return dinhDangSo(x, le, '.', ','); };
  /** 1,234.5 */
  ME.soZh = function (x, le) { return dinhDangSo(x, le, ',', '.'); };
  /** Số cố định số chữ số lẻ (VD chỉ số công tơ 12.458,62). */
  ME.soViCoDinh = function (x, le) {
    const n = Number(x);
    if (!isFinite(n)) return '';
    const s = Math.abs(n).toFixed(le);
    const p = s.split('.');
    return (n < 0 ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (p[1] ? ',' + p[1] : '');
  };
  /** Tiền gọn: ≈ 940 triệu đ */
  ME.tienGon = function (x) {
    const n = Number(x) || 0;
    if (n >= 1e9) return { vi: ME.soVi(n / 1e9, n >= 1e10 ? 1 : 2) + ' tỷ đ', zh: ME.soZh(n / 1e8, 1) + '亿越南盾' };
    if (n >= 1e6) return { vi: ME.soVi(Math.round(n / 1e6)) + ' triệu đ', zh: ME.soZh(n / 1e4, 0) + '万越南盾' };
    return { vi: ME.soVi(Math.round(n)) + ' đ', zh: ME.soZh(Math.round(n)) + '越南盾' };
  };
  ME.soLe = function (x) { const s = String(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };

  // ───────── Giờ Việt Nam (+07:00, cố định) ─────────
  const VN = 7 * 3600000;
  const p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  ME.p2 = p2;
  function vn(ms) { return new Date((ms === undefined ? Date.now() : ms) + VN); }
  ME.isoVN = function (ms) {
    const d = vn(ms);
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + 'T' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ':' +
      p2(d.getUTCSeconds()) + '.' + ('00' + d.getUTCMilliseconds()).slice(-3) + '+07:00';
  };
  ME.homNay = function () { return ME.isoVN().slice(0, 10); };
  ME.ngayCua = function (iso) {
    const t = new Date(String(iso || '')).getTime();
    return isNaN(t) ? '' : ME.isoVN(t).slice(0, 10);
  };
  /** Số ghi sáng ngày D+1 tính cho ngày D. */
  ME.ngayTinhCua = function (ms) { return ME.isoVN(ms - 86400000).slice(0, 10); };
  ME.congNgay = function (ngay, n) {
    const p = String(ngay).split('-');
    const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n));
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate());
  };
  ME.soNgayGiua = function (a, b) {
    const x = String(a).split('-');
    const y = String(b).split('-');
    return Math.round((Date.UTC(+y[0], +y[1] - 1, +y[2]) - Date.UTC(+x[0], +x[1] - 1, +x[2])) / 86400000);
  };
  ME.congThang = function (th, n) {
    const p = String(th).split('-');
    const t = Number(p[0]) * 12 + Number(p[1]) - 1 + n;
    return Math.floor(t / 12) + '-' + p2(t % 12 + 1);
  };
  ME.soNgayTrongThang = function (th) { const p = String(th).split('-'); return new Date(Date.UTC(+p[0], +p[1], 0)).getUTCDate(); };
  const THU_VI = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const THU_NGAN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const THU_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function thuCua(ngay) { const p = String(ngay).split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); }
  ME.thuVi = function (ngay) { return THU_VI[thuCua(ngay)]; };
  ME.thuNgan = function (ngay) { return THU_NGAN[thuCua(ngay)]; };
  ME.thuZh = function (ngay) { return THU_ZH[thuCua(ngay)]; };
  /** 'YYYY-MM-DD' → dòng Việt 28/09/2026 (ngan: 28/09), dòng Trung 2026-09-28 (ngan: 9月28日). */
  ME.ngayVi = function (ngay, ngan) {
    const m = String(ngay || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(ngay || '');
    return ngan ? m[3] + '/' + m[2] : m[3] + '/' + m[2] + '/' + m[1];
  };
  ME.ngayZh = function (ngay, ngan) {
    const m = String(ngay || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(ngay || '');
    return ngan ? Number(m[2]) + '月' + Number(m[3]) + '日' : m[1] + '-' + m[2] + '-' + m[3];
  };
  /** Giờ VN của một thời điểm ISO: 07:05 */
  ME.gio = function (iso) {
    const t = new Date(String(iso || '')).getTime();
    if (isNaN(t)) return '';
    return ME.isoVN(t).slice(11, 16);
  };
  ME.ngayGioVi = function (iso) {
    const t = new Date(String(iso || '')).getTime();
    if (isNaN(t)) return String(iso || '');
    const s = ME.isoVN(t);
    return s.slice(8, 10) + '/' + s.slice(5, 7) + ' ' + s.slice(11, 16);
  };
  ME.ngayGioZh = function (iso) {
    const t = new Date(String(iso || '')).getTime();
    if (isNaN(t)) return String(iso || '');
    const s = ME.isoVN(t);
    return Number(s.slice(5, 7)) + '月' + Number(s.slice(8, 10)) + '日 ' + s.slice(11, 16);
  };
  ME.thangVi = function (th) { const p = String(th).split('-'); return 'Tháng ' + Number(p[1]) + '/' + p[0]; };
  ME.thangZh = function (th) { const p = String(th).split('-'); return p[0] + '年' + Number(p[1]) + '月'; };
  /** "4 ngày trước" / "4天前" */
  ME.baoLau = function (iso) {
    const t = new Date(String(iso || '')).getTime();
    if (isNaN(t)) return { vi: '', zh: '' };
    const ngay = ME.soNgayGiua(ME.isoVN(t).slice(0, 10), ME.homNay());
    if (ngay <= 0) return { vi: 'hôm nay', zh: '今天' };
    if (ngay === 1) return { vi: 'hôm qua', zh: '昨天' };
    return { vi: ngay + ' ngày trước', zh: ngay + '天前' };
  };

  // ───────── Chữ ─────────
  /** Bỏ dấu, chữ thường: "Máy nén khí" → "may nen khi" (chữ Trung giữ nguyên). */
  ME.boDau = function (s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
  };
  ME.chuanMa = function (v) { return String(v === null || v === undefined ? '' : v).normalize('NFC').replace(/\s+/g, '').toUpperCase(); };
  ME.chuanMaLK = function (v) { return String(v === null || v === undefined ? '' : v).normalize('NFC').replace(/\s+/g, ' ').trim(); };
  ME.chuanMaNV = function (v) { return String(v === null || v === undefined ? '' : v).normalize('NFC').replace(/\s+/g, '').toUpperCase(); };
  /** Mã thao tác ngẫu nhiên (clientId), 8–64 ký tự [A-Za-z0-9_-]. */
  ME.idMoi = function (tienTo) {
    const b = new Uint8Array(9);
    crypto.getRandomValues(b);
    let s = '';
    for (let i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
    return (tienTo || 'a') + Date.now().toString(36) + '-' + s;
  };
  ME.chuCaiDau = function (hoTen) {
    const p = String(hoTen || '').trim().split(/\s+/).filter(String);
    if (!p.length) return '?';
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[p.length - 2].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
  };
  ME.tre = function (fn, ms) {
    let t = null;
    return function () {
      const a = arguments;
      const self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms);
    };
  };
  ME.ngu = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  // ───────── Giao diện dùng chung ─────────
  ME.ui = {};

  /** Đầu trang có nút quay lại. o: { tieuDe: khoa | [vi, zh], quayLai: đường dẫn | hàm, phai: [phần tử], lop, nho, tren: [phần tử dưới hàng tiêu đề] } */
  ME.ui.dau = function (o) {
    const tieu = Array.isArray(o.tieuDe) ? ME.L2(o.tieuDe[0], o.tieuDe[1]) : ME.L(o.tieuDe, o.ts);
    const hangTieu = h('div', { class: 'dau-tieu-de' + (o.nho ? ' nho' : '') + (o.zh12 ? ' zh12' : '') },
      h('h1', { class: 'vi' }, tieu[0].textContent), tieu[1]);
    const nutLui = o.quayLai === false ? null : h('button', {
      type: 'button', class: 'nut-icon trai', 'aria-label': ME.t1('chung.quayLai'),
      onClick: function () { if (typeof o.quayLai === 'function') o.quayLai(); else ME.quayLai(o.quayLai || '/'); }
    }, ME.ic('lui', 24, 2));
    return h('header', { class: 'dau ' + (o.lop || '') }, h('div', { class: 'dau-hang' }, nutLui, hangTieu, o.phai || null), o.duoi || null);
  };

  const THANH = [
    ['/', 'nha', 'nav.trangChu'],
    ['/tb', 'banhRang', 'nav.thietBi'],
    ['/quet', 'qr', 'nav.quetQR'],
    ['/kho', 'hop', 'nav.khoLK'],
    ['/tai-khoan', 'nguoi', 'nav.taiKhoan']
  ];
  /** Thanh dưới 5 mục; nút Quét QR nổi giữa. */
  ME.ui.thanhDuoi = function (hienTai) {
    return h('nav', { class: 'thanh-duoi', 'aria-label': ME.t1('nav.nhan') }, THANH.map(function (x) {
      if (x[0] === '/quet') {
        return h('a', { href: '#/quet', class: 'giua', 'aria-label': ME.t1('nav.quetQR') },
          h('span', { class: 'nut-qr' }, ME.ic('qr', 26, 1.8)), ME.L(x[2]));
      }
      return h('a', { href: '#' + x[0], 'aria-current': hienTai === x[0] ? 'page' : null }, ME.ic(x[1], 24, 1.8), ME.L(x[2]));
    }));
  };

  /** Nhãn trạng thái (có chữ, không chỉ màu). loai: 'xanh' | 'do' | 'cam' | 'xam' | 'than' | 'tim'. */
  ME.ui.nhanTT = function (vi, zh, loai, lop) {
    return h('span', { class: 'nhan-tt tt-' + (loai || 'xam') + (lop ? ' ' + lop : '') }, ME.L2(vi, zh));
  };
  ME.ui.nhanTTK = function (khoa, loai, lop, ts) {
    const x = ME.t(khoa, ts);
    return ME.ui.nhanTT(x.vi, x.zh, loai, lop);
  };

  ME.ui.dangTai = function (khoa) {
    return h('div', { class: 'dang-tai', role: 'status' }, h('div', { class: 'vong-quay' }), ME.L(khoa || 'chung.dangTai'));
  };
  ME.ui.trong = function (khoa, ts, ic) {
    return h('div', { class: 'trong-rong' }, ic ? ME.ic(ic, 28, 1.6) : null, ME.L(khoa, ts));
  };

  // Thông báo nổi (tự ẩn)
  let tbHen = null;
  /** thongBao('khoa' | {vi, zh}, 'loi'?) */
  ME.thongBao = function (nd, loai, ts) {
    const x = typeof nd === 'string' ? ME.t(nd, ts) : nd;
    const cu = ME.$('.thong-bao-noi');
    if (cu) cu.remove();
    const el = h('div', { class: 'thong-bao-noi' + (loai === 'loi' ? ' loi' : ''), role: loai === 'loi' ? 'alert' : 'status' },
      ME.ic(loai === 'loi' ? 'canhBaoTron' : 'checkTron', 20, 2), h('div', null, ME.L2(x.vi, x.zh)));
    document.body.appendChild(el);
    clearTimeout(tbHen);
    tbHen = setTimeout(function () { el.remove(); }, loai === 'loi' ? 6000 : 3200);
    el.addEventListener('click', function () { el.remove(); });
  };

  /**
   * Hộp thoại. o: { tieuDe: {vi, zh} | khoa, loiNhan: {vi, zh} | khoa, nut: [{ nhan: khoa | {vi,zh}, gt, chinh, nguy }], ngang, noiDung: phần tử }
   * Trả Promise giá trị nút được bấm (bấm ra ngoài = null).
   */
  ME.hoi = function (o) {
    return new Promise(function (xong) {
      const lay = function (x) { return typeof x === 'string' ? ME.t(x, o.ts) : x; };
      const tieu = o.tieuDe ? lay(o.tieuDe) : null;
      const ln = o.loiNhan ? lay(o.loiNhan) : null;
      const nut = (o.nut || [{ nhan: 'chung.dong', gt: true, chinh: true }]).map(function (b) {
        const x = lay(b.nhan);
        return h('button', {
          type: 'button', class: b.chinh ? 'nut-chinh n14' : (b.nguy ? 'nut-phu nguy' : 'nut-phu'),
          style: b.nguy ? 'color:#A3141D;border-color:#F3B5B9' : null,
          onClick: function () { dong(b.gt); }
        }, ME.L2(x.vi, x.zh));
      });
      const hop = h('div', { class: 'hop-thoai', role: 'dialog', 'aria-modal': 'true' },
        tieu ? h('div', { class: 'tieu' }, h('h2', { class: 'vi' }, tieu.vi), h('span', { class: 'zh' }, tieu.zh)) : null,
        ln ? h('div', { class: 'loi-nhan' }, ME.L2(ln.vi, ln.zh)) : null,
        o.noiDung || null,
        h('div', { class: 'cac-nut' + (o.ngang ? ' ngang' : '') }, nut));
      const che = h('div', { class: 'man-che giua', onClick: function (e) { if (e.target === che && o.dongNgoai !== false) dong(null); } }, hop);
      function dong(gt) { che.remove(); xong(gt); }
      document.body.appendChild(che);
      const dau = hop.querySelector('input, select, textarea');
      if (dau) setTimeout(function () { dau.focus(); }, 50);
    });
  };
  ME.baoLoi = function (e, tieuDe) {
    const x = ME.loiChu(e);
    return ME.hoi({ tieuDe: tieuDe || 'chung.coLoi', loiNhan: x, nut: [{ nhan: 'chung.dong', gt: true, chinh: true }] });
  };
  /** Lỗi bất kỳ → { vi, zh } để hiện. */
  ME.loiChu = function (e) {
    if (!e) return ME.t('loi.khongRo');
    if (e.vi) return { vi: e.vi, zh: e.zh || e.vi };
    return ME.t('loi.heThong', { chiTiet: String(e.message || e).slice(0, 200) });
  };

  /**
   * Ngăn kéo chọn một mục. o: { tieuDe: khoa | {vi,zh}, ds: [{ gt, vi, zh, phu, ic }], hienTai, timKiem: true }
   * Trả Promise gt (hoặc undefined khi đóng).
   */
  ME.chonTu = function (o) {
    return new Promise(function (xong) {
      const tieu = typeof o.tieuDe === 'string' ? ME.t(o.tieuDe) : o.tieuDe;
      const than = h('div', { class: 'than-ngan' });
      let tu = '';
      function ve() {
        ME.xoaCon(than);
        const q = ME.boDau(tu);
        const ds = q ? o.ds.filter(function (x) { return ME.boDau([x.vi, x.zh, x.phu, x.gt].join(' ')).indexOf(q) >= 0; }) : o.ds;
        ds.slice(0, 300).forEach(function (x) {
          than.appendChild(h('button', {
            type: 'button', class: 'lua-chon', 'aria-selected': String(x.gt === o.hienTai),
            onClick: function () { dong(x.gt); }
          }, x.ic || null, h('span', { class: 'giua' }, ME.L2(x.vi, x.zh), x.phu ? h('span', { class: 'phu', style: 'display:block' }, x.phu) : null),
          x.gt === o.hienTai ? ME.ic('check', 20, 2.4) : null));
        });
        if (!ds.length) than.appendChild(ME.ui.trong('chung.khongThay'));
      }
      const oTim = o.timKiem ? h('label', { class: 'o-tim xam', style: 'margin:0 16px 8px' }, ME.ic('tim', 20, 1.8),
        h('input', { type: 'search', placeholder: ME.t1('chung.timNhanh'), 'aria-label': ME.t1('chung.timNhanh'), onInput: function (e) { tu = e.target.value; ve(); } })) : null;
      const ngan = h('div', { class: 'ngan-keo', role: 'dialog', 'aria-modal': 'true' },
        h('div', { class: 'tay' }),
        h('div', { class: 'dau-ngan' }, h('div', null, ME.L2(tieu.vi, tieu.zh)),
          h('button', { type: 'button', class: 'nut-icon', 'aria-label': ME.t1('chung.dong'), onClick: function () { dong(undefined); } }, ME.ic('dong', 22, 2))),
        oTim, than);
      const che = h('div', { class: 'man-che', onClick: function (e) { if (e.target === che) dong(undefined); } }, ngan);
      function dong(gt) { che.remove(); xong(gt); }
      ve();
      document.body.appendChild(che);
    });
  };

  /** Ô thông số "dt / dd" hai dòng. */
  ME.ui.dongTT = function (nhanKhoa, viGT, zhGT, trong) {
    const n = Array.isArray(nhanKhoa) ? ME.L2(nhanKhoa[0], nhanKhoa[1]) : ME.L(nhanKhoa);
    return h('div', { class: 'dong' }, h('dt', null, n),
      h('dd', null, trong ? h('span', { class: 'vi trong' }, viGT) : ME.L2(viGT, zhGT)));
  };

  /** Trường biểu mẫu: nhãn hai dòng + ô. */
  ME.ui.truong = function (nhanKhoa, o, batBuoc, id) {
    const n = Array.isArray(nhanKhoa) ? { vi: nhanKhoa[0], zh: nhanKhoa[1] } : ME.t(nhanKhoa);
    return h('div', { class: 'truong' },
      h('label', { for: id || null }, h('span', { class: 'vi' }, n.vi, batBuoc ? h('span', { class: 'bat-buoc' }, ' *') : null), h('span', { class: 'zh' }, n.zh)),
      o);
  };

  // ───────── Ảnh ─────────
  /** Nén ảnh trên máy: cạnh dài tối đa (CauHinh ANH_CANH_DAI_PX, mặc định 1.280 px), JPEG. Trả { base64, dataUrl, kb }. */
  ME.nenAnh = function (file, canhDai) {
    canhDai = canhDai || Number((ME.cauHinh && ME.cauHinh('ANH_CANH_DAI_PX')) || 1280) || 1280;
    return new Promise(function (xong, loi) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        let w = img.naturalWidth;
        let hh = img.naturalHeight;
        const k = Math.min(1, canhDai / Math.max(w, hh));
        w = Math.round(w * k);
        hh = Math.round(hh * k);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = hh;
        const g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, w, hh);
        g.drawImage(img, 0, 0, w, hh);
        URL.revokeObjectURL(url);
        let q = 0.72;
        let d = c.toDataURL('image/jpeg', q);
        while (d.length > 2.6 * 1024 * 1024 * 4 / 3 && q > 0.35) { q -= 0.12; d = c.toDataURL('image/jpeg', q); }
        const b64 = d.slice(d.indexOf(',') + 1);
        xong({ base64: b64, dataUrl: d, kb: Math.round(b64.length * 3 / 4 / 1024) });
      };
      img.onerror = function () { URL.revokeObjectURL(url); loi(ME.loiMoi('ANH_DOC_LOI')); };
      img.src = url;
    });
  };

  /** Tạo lỗi có mã + hai dòng chữ từ nhãn 'loi.<MA>'. */
  ME.loiMoi = function (ma, ts, them) {
    const x = ME.t('loi.' + ma, ts);
    const e = new Error(x.vi);
    e.ma = ma;
    e.vi = x.vi;
    e.zh = x.zh;
    if (them) Object.keys(them).forEach(function (k) { e[k] = them[k]; });
    return e;
  };

  /** Lưu chữ thành tệp tải về (CSV danh sách lỗi…). */
  ME.taiTep = function (ten, noiDung, kieu) {
    const blob = new Blob([noiDung], { type: kieu || 'text/csv;charset=utf-8' });
    const a = h('a', { href: URL.createObjectURL(blob), download: ten });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  };
  ME.csv = function (dong) {
    return '﻿' + dong.map(function (r) {
      return r.map(function (v) {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');
  };

  /** Nạp thư viện chỉ khi cần (đọc Excel, quét QR, vẽ mã QR); Service Worker lưu lại để dùng khi mất mạng. */
  const daNap = {};
  ME.napThuVien = function (duongDan) {
    if (!daNap[duongDan]) {
      daNap[duongDan] = new Promise(function (xong, loi) {
        const s = document.createElement('script');
        s.src = duongDan;
        s.onload = function () { xong(); };
        s.onerror = function () { delete daNap[duongDan]; s.remove(); loi(ME.loiMoi('THU_VIEN')); };
        document.head.appendChild(s);
      });
    }
    return daNap[duongDan];
  };
})();

/* ME – Quản lý Cơ điện · 机电管理系统
   bieu-do.js — biểu đồ SVG tự viết (không thư viện), theo bản vẽ 10 và 12:
   cột theo ngày (chạm cột xem số của ngày), đường nhỏ 12 tháng, thanh 3 khung giờ, thanh ngang theo khu vực.
   Màu: điện #E0A800, nước #2A78D6, vượt định mức / bất thường #D03B3B; khung giờ #8EA2C1 → #4E6A93 → #1B365D.
   Vàng hổ phách tương phản thấp trên nền trắng (2,1:1) nên số luôn ghi bằng chữ cạnh biểu đồ và có bảng số. */
(function () {
  'use strict';
  const ME = window.ME;
  const NS = 'http://www.w3.org/2000/svg';
  const bd = ME.bd = {};
  bd.MAU = { dien: '#E0A800', nuoc: '#2A78D6', vuot: '#D03B3B', khung: { TD: '#8EA2C1', BT: '#4E6A93', CD: '#1B365D' } };

  function s(tag, attrs, chu) {
    const el = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, String(attrs[k])); });
    if (chu !== undefined) el.textContent = chu;
    return el;
  }
  const r1 = function (x) { return Math.round(x * 10) / 10; };

  /** Bước chia trục đẹp: 1, 2, 2,5, 5 × 10^k. */
  function buocDep(x) {
    if (!(x > 0)) return 1;
    const mu = Math.pow(10, Math.floor(Math.log10(x)));
    const cs = [1, 2, 2.5, 5, 10];
    for (let i = 0; i < cs.length; i++) if (cs[i] * mu >= x) return cs[i] * mu;
    return 10 * mu;
  }

  /**
   * Cột theo ngày. o: { gt: [số|null] (theo ngày 1..n), mau, do: {ngay: true} (ngày tô đỏ), duongNgang: số | null,
   *   nhanDuong: 'Định mức · 定额', chon: chỉ số ngày đang chọn (0-based), onChon(i), moTa: chữ cho đọc màn hình }
   */
  bd.cotNgay = function (o) {
    const W = 338;
    const H = 172;
    const X0 = 40;
    const X1 = 336;
    const Y0 = 150;
    const n = o.gt.length;
    let lon = 0;
    o.gt.forEach(function (v) { if (v !== null && v > lon) lon = v; });
    if (o.duongNgang > lon) lon = o.duongNgang;
    const buoc = buocDep(lon / 3.2 || 1);
    const soVach = Math.max(1, Math.ceil(lon / buoc - 1e-9));
    let tran = Math.max(soVach * buoc, lon * 1.08);
    if (!(tran > 0)) tran = buoc * 3;
    const y = function (v) { return Y0 - v / tran * Y0; };
    const svg = s('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': o.moTa || '', style: 'display:block;max-width:100%;overflow:visible' });
    svg.appendChild(s('line', { x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: '#D0D5DD', 'stroke-width': 1 }));
    svg.appendChild(s('text', { x: 34, y: r1(Y0 + 3.8), 'text-anchor': 'end', 'font-size': 11, fill: '#667085', style: 'font-variant-numeric:tabular-nums' }, '0'));
    for (let k = 1; k <= soVach; k++) {
      const yy = r1(y(k * buoc));
      if (yy < 6) break;
      svg.appendChild(s('line', { x1: X0, y1: yy, x2: X1, y2: yy, stroke: '#EAECF0', 'stroke-width': 1 }));
      svg.appendChild(s('text', { x: 34, y: r1(yy + 3.8), 'text-anchor': 'end', 'font-size': 11, fill: '#667085', style: 'font-variant-numeric:tabular-nums' }, ME.soVi(k * buoc)));
    }
    const buocX = (X1 - X0) / n;
    const rong = Math.max(3, Math.min(8, buocX - 3.8));
    const giua = function (i) { return X0 + i * buocX + buocX / 2; };
    if (o.chon !== null && o.chon !== undefined && o.chon >= 0) {
      svg.appendChild(s('line', { x1: r1(giua(o.chon)), y1: 0, x2: r1(giua(o.chon)), y2: Y0, stroke: '#1B365D', 'stroke-width': 1 }));
    }
    o.gt.forEach(function (v, i) {
      if (v === null || v === undefined || !(v > 0)) return;
      const x = X0 + i * buocX + (buocX - rong) / 2;
      const tren = Math.min(Y0 - 1, y(v));
      const bk = Math.min(2, (Y0 - tren) / 2, rong / 2);
      const d = 'M' + r1(x) + ' ' + Y0 + ' V' + r1(tren + bk) + ' Q' + r1(x) + ' ' + r1(tren) + ' ' + r1(x + bk) + ' ' + r1(tren) +
        ' H' + r1(x + rong - bk) + ' Q' + r1(x + rong) + ' ' + r1(tren) + ' ' + r1(x + rong) + ' ' + r1(tren + bk) + ' V' + Y0 + ' Z';
      svg.appendChild(s('path', { d: d, fill: o.do && o.do[i + 1] ? bd.MAU.vuot : o.mau }));
    });
    if (o.duongNgang > 0) {
      const yd = r1(y(o.duongNgang));
      svg.appendChild(s('line', { x1: X0, y1: yd, x2: X1, y2: yd, stroke: '#475467', 'stroke-width': 1.25, 'stroke-dasharray': '4 3' }));
      if (o.nhanDuong) svg.appendChild(s('text', { x: 44, y: r1(yd < 16 ? yd + 13 : yd - 5), 'font-size': 11, fill: '#475467' }, o.nhanDuong));
    }
    // Nhãn trục ngang: mặc định ngày 1, 5, 10…; o.nhanX = [[chỉ số, chữ], …] cho trục tháng.
    const nhanX = o.nhanX || [1, 5, 10, 15, 20, 25, 30].filter(function (d) { return d <= n; }).map(function (d) { return [d - 1, String(d)]; });
    nhanX.forEach(function (x) {
      svg.appendChild(s('text', { x: r1(giua(x[0])), y: 166, 'text-anchor': 'middle', 'font-size': 11, fill: '#667085', style: 'font-variant-numeric:tabular-nums' }, x[1]));
    });
    if (o.onChon) {
      // Vùng chạm rộng hơn cột (cả chiều cao), để ngón tay dễ trúng.
      o.gt.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        const vung = s('rect', { x: r1(X0 + i * buocX), y: 0, width: r1(buocX), height: Y0 + 20, fill: 'transparent', style: 'cursor:pointer' });
        vung.addEventListener('click', function () { o.onChon(i); });
        svg.appendChild(vung);
      });
    }
    return svg;
  };

  /** Đường nhỏ 12 tháng: xám, chấm cuối theo màu điện / nước. */
  bd.duongNho = function (gt, mau) {
    const W = 132;
    const H = 30;
    const svg = s('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', style: 'display:block;max-width:100%' });
    const ds = gt.map(function (v) { return Number(v) || 0; });
    let lo = Math.min.apply(null, ds);
    let hi = Math.max.apply(null, ds);
    if (hi === lo) { hi = lo + 1; lo = lo - 1; }
    const diem = ds.map(function (v, i) { return r1(4 + i * (124 / Math.max(1, ds.length - 1))) + ',' + r1(4 + (1 - (v - lo) / (hi - lo)) * 22); });
    svg.appendChild(s('polyline', { points: diem.join(' '), fill: 'none', stroke: '#98A2B3', 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    const cuoi = diem[diem.length - 1].split(',');
    svg.appendChild(s('circle', { cx: cuoi[0], cy: cuoi[1], r: 4, fill: mau, stroke: '#FFFFFF', 'stroke-width': 2 }));
    return svg;
  };

  /** Thanh chia 3 đoạn (thấp điểm, bình thường, cao điểm), % ghi trong đoạn. */
  bd.thanhKhung = function (khung, moTa) {
    const tong = (khung.TD || 0) + (khung.BT || 0) + (khung.CD || 0);
    const doan = [['TD', '#8EA2C1', '#0F2440'], ['BT', '#4E6A93', '#FFFFFF'], ['CD', '#1B365D', '#FFFFFF']].filter(function (x) { return khung[x[0]] > 0; });
    return ME.h('div', { class: 'thanh-khung', role: 'img', 'aria-label': moTa || '' }, doan.map(function (x, i) {
      const pt = tong > 0 ? Math.round(khung[x[0]] / tong * 100) : 0;
      return ME.h('div', {
        style: 'flex:' + khung[x[0]] + ' 1 0;background:' + x[1] + ';color:' + x[2] + ';border-radius:' +
          (doan.length === 1 ? '6px' : (i === 0 ? '6px 0 0 6px' : (i === doan.length - 1 ? '0 6px 6px 0' : '0')))
      }, pt >= 6 ? pt + '%' : '');
    }));
  };

  /** Thanh ngang (theo khu vực): ds [{ vi, zh, gt }], xếp sẵn từ lớn đến nhỏ. */
  bd.thanhNgang = function (ds, mau) {
    const lon = ds.reduce(function (m, x) { return Math.max(m, x.gt); }, 0) || 1;
    const tong = ds.reduce(function (s2, x) { return s2 + Math.max(0, x.gt); }, 0) || 1;
    return ME.h('div', null, ds.map(function (x) {
      return ME.h('div', { class: 'dong-kv' },
        ME.h('div', { class: 'ten' }, ME.L2(x.vi, x.zh)),
        ME.h('div', { class: 'vach' }, ME.h('div', { style: 'width:' + Math.max(0.5, x.gt / lon * 100).toFixed(1) + '%;background:' + mau })),
        ME.h('div', { class: 'gt' }, ME.h('div', { class: 'so1' }, ME.soVi(Math.round(x.gt))), ME.h('div', { class: 'pt' }, Math.round(x.gt / tong * 100) + '%')));
    }));
  };

  /** Cột nhỏ trang trí trên thẻ vàng (tiến độ ghi 7 ngày gần nhất). */
  bd.cotNho = function (gt, mau) {
    const svg = s('svg', { width: 64, height: 28, viewBox: '0 0 64 28', 'aria-hidden': 'true' });
    const lon = Math.max.apply(null, gt.concat([1]));
    gt.slice(-5).forEach(function (v, i) {
      const hh = Math.max(3, Math.round(v / lon * 26));
      svg.appendChild(s('rect', { x: 2 + i * 12, y: 28 - hh, width: 8, height: hh, rx: 2, fill: mau }));
    });
    return svg;
  };
})();

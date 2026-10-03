/* ME – Quản lý Cơ điện · 机电管理系统
   chi-so.js — quy tắc tính tiêu thụ và cảnh báo chỉ số công tơ, chép nguyên từ máy chủ (Code.gs: kiemTraChiSo_, phanBoNgay_,
   trungBinhNgay_, tinhTongHop_) để app tính và cảnh báo ngay trên máy, kể cả khi mất mạng. Sửa ở máy chủ thì sửa cả ở đây. */
(function () {
  'use strict';
  const ME = window.ME;
  const dn = ME.dn = {};

  dn.khungCua = function (ct) { return String(ct.Loai) === 'DIEN_3_GIA' ? ['BT', 'CD', 'TD'] : ['BT']; };
  dn.loai = function (ct) { return String(ct.Loai).indexOf('NUOC') === 0 ? 'nuoc' : 'dien'; };
  dn.donVi = function (ct) { return ct.DonVi || (dn.loai(ct) === 'nuoc' ? 'm³' : 'kWh'); };
  dn.soSanh = function (a, b) {
    const x = String(a.GhiLuc);
    const y = String(b.GhiLuc);
    if (x !== y) return x < y ? -1 : 1;
    const m = String(a.MaGhi);
    const n = String(b.MaGhi);
    return m === n ? 0 : (m.length !== n.length ? m.length - n.length : (m < n ? -1 : 1));
  };

  /** Giống kiemTraChiSo_ của máy chủ. */
  dn.kiemTra = function (congTo, truoc, moi, thamSo) {
    const khung = String(congTo.Loai) === 'DIEN_3_GIA' ? ['BT', 'CD', 'TD'] : ['BT'];
    const heSo = Number(moi.HeSo) > 0 ? Number(moi.HeSo) : (Number(congTo.HeSoNhan) > 0 ? Number(congTo.HeSoNhan) : 1);
    const kq = { TieuThuBT: '', TieuThuCD: '', TieuThuTD: '', TieuThu: '', HeSoDung: heSo, soNgay: 0, moiNgay: null, Co: 'BINH_THUONG', canhBao: [], chan: null, canXacNhan: null };
    if (!truoc) return kq;
    const lamTron = function (x) { return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 1000) / 1000; };
    const ngay = function (s) { const p = String(s).split('-'); return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])); };
    const soNgay = Math.max(1, Math.round((ngay(moi.NgayTinh) - ngay(truoc.NgayTinh)) / 86400000));
    const toiDa = Number(congTo.SoToiDa) || 0;
    let tong = 0;
    for (let i = 0; i < khung.length; i++) {
      const k = khung[i];
      const a = Number(truoc['ChiSo' + k]) || 0;
      const b = Number(moi['ChiSo' + k]) || 0;
      let d = b - a;
      if (d < 0) {
        if (toiDa > 0 && a >= toiDa * 0.9 && b <= toiDa * 0.1) {
          d = toiDa - a + b;
          kq.canhBao.push({ ma: 'QUAY_VONG', khung: k });
        } else {
          kq.chan = { ma: 'SO_NHO_HON_TRUOC', khung: k, truoc: a, moi: b };
          return kq;
        }
      }
      const t = lamTron(d * heSo);
      kq['TieuThu' + k] = t;
      tong += t;
    }
    kq.TieuThu = lamTron(tong);
    kq.soNgay = soNgay;
    kq.moiNgay = lamTron(tong / soNgay);
    if (soNgay > 1) {
      kq.Co = 'GOP';
      kq.canhBao.push({ ma: 'GOP', soNgay: soNgay });
    }
    const tb = thamSo && thamSo.tbNgay;
    if (tb) {
      const nguong = 1 + (Number(thamSo.nguongPT) > 0 ? Number(thamSo.nguongPT) : 30) / 100;
      const nghi = Number(thamSo.heSoNghiSai) > 0 ? Number(thamSo.heSoNghiSai) : 5;
      if (tb.tong > 0 && kq.moiNgay > tb.tong * nguong) {
        kq.Co = 'BAT_THUONG';
        kq.canhBao.push({ ma: 'VUOT_NGUONG', tb: lamTron(tb.tong), phanTram: Math.round((kq.moiNgay / tb.tong - 1) * 100) });
      }
      const phan = [{ khung: 'TONG', gt: kq.moiNgay, tb: tb.tong }];
      if (khung.length > 1) khung.forEach(function (k) { phan.push({ khung: k, gt: Number(kq['TieuThu' + k]) / soNgay, tb: tb[k] }); });
      const nghiSai = phan.filter(function (p) { return p.tb > 0 && p.gt >= p.tb * nghi; })
        .map(function (p) { return { khung: p.khung, moiNgay: lamTron(p.gt), tb: lamTron(p.tb), lan: Math.round(p.gt / p.tb * 10) / 10 }; })
        .sort(function (x, y) { return y.lan - x.lan; });
      if (nghiSai.length) kq.canXacNhan = { ma: 'NGHI_NHAP_SAI', ds: nghiSai };
    }
    const dm = Number(congTo.DinhMucNgay);
    if (dm > 0 && kq.moiNgay > dm) kq.canhBao.push({ ma: 'VUOT_DINH_MUC', dinhMuc: dm, phanTram: Math.round((kq.moiNgay / dm - 1) * 1000) / 10 });
    return kq;
  };

  /** Giống phanBoNgay_: chia tiêu thụ mỗi lần ghi cho các ngày nó phủ, trong [tu, den]. */
  dn.phanBo = function (ds, tu, den) {
    const kq = { ngay: {}, gop: {}, batThuong: {} };
    for (let i = 1; i < ds.length; i++) {
      const r = ds[i];
      if (r.TieuThu === '' || r.TieuThu === null || r.TieuThu === undefined) continue;
      const b = String(r.NgayTinh);
      if (b < tu) continue;
      let soNgay = ME.soNgayGiua(String(ds[i - 1].NgayTinh), b);
      const dau = soNgay >= 1 ? ME.congNgay(String(ds[i - 1].NgayTinh), 1) : b;
      if (soNgay < 1) soNgay = 1;
      if (dau > den) continue;
      for (let k = 0; k < soNgay; k++) {
        const d = k === 0 ? dau : ME.congNgay(dau, k);
        if (d < tu) continue;
        if (d > den) break;
        const o = kq.ngay[d] || (kq.ngay[d] = { tong: 0, BT: 0, CD: 0, TD: 0 });
        o.tong += (Number(r.TieuThu) || 0) / soNgay;
        o.BT += (Number(r.TieuThuBT) || 0) / soNgay;
        o.CD += (Number(r.TieuThuCD) || 0) / soNgay;
        o.TD += (Number(r.TieuThuTD) || 0) / soNgay;
        if (soNgay > 1) kq.gop[d] = true;
        if (r.Co === 'BAT_THUONG') kq.batThuong[d] = true;
      }
    }
    return kq;
  };

  dn.trungBinhNgay = function (ds, ngayTinh, soNgay) {
    const tu = ME.congNgay(ngayTinh, -soNgay);
    const den = ME.congNgay(ngayTinh, -1);
    const pb = dn.phanBo(ds, tu, den);
    const cacNgay = Object.keys(pb.ngay);
    if (cacNgay.length < Math.min(3, soNgay)) return null;
    const tb = { tong: 0, BT: 0, CD: 0, TD: 0 };
    cacNgay.forEach(function (d) { ['tong', 'BT', 'CD', 'TD'].forEach(function (k) { tb[k] += pb.ngay[d][k]; }); });
    ['tong', 'BT', 'CD', 'TD'].forEach(function (k) { tb[k] = tb[k] / cacNgay.length; });
    return tb;
  };
  function kep(v, md, lo, hi) { let n = ME.docSo(v); if (isNaN(n)) n = md; return Math.min(hi, Math.max(lo, n)); }
  dn.thamSo = function (dsTruoc, ngayTinh) {
    const soNgay = kep(ME.cauHinh('SO_NGAY_TRUNG_BINH'), 7, 3, 60);
    return {
      tbNgay: dn.trungBinhNgay(dsTruoc, ngayTinh, soNgay), soNgayTB: soNgay,
      nguongPT: kep(ME.cauHinh('NGUONG_BAT_THUONG_PT'), 30, 1, 1000), heSoNghiSai: kep(ME.cauHinh('HE_SO_NGHI_NHAP_SAI'), 5, 2, 100)
    };
  };

  /**
   * Các lần ghi của một công tơ (đã xếp theo giờ ghi): dữ liệu đồng bộ + thao tác đang chờ gửi trên máy này
   * (luuChiSo; duyetChiSo sửa số; xoaChiSo) — để khi mất mạng vẫn thấy số mình vừa ghi và tính đúng lần sau.
   */
  dn.dsGhi = function (maCT) {
    const ct = ME.du.lay('CongTo', maCT);
    let ds = (ME.du.theo('ChiSo', 'MaCT').get(maCT) || []).filter(function (r) { return r.DaXoa !== true; }).map(function (r) { return Object.assign({}, r); });
    ME.hang.ds().forEach(function (m) {
      if (m.action === 'luuChiSo' && m.data.MaCT === maCT) {
        const gl = m.data.GhiLuc || ME.isoVN(m.tao);
        ds.push({
          MaGhi: 'cho:' + m.id, MaCT: maCT, GhiLuc: gl, NgayTinh: ME.ngayTinhCua(new Date(gl).getTime()), NguoiGhi: m.maNV,
          ChiSoBT: m.data.ChiSoBT, ChiSoCD: m.data.ChiSoCD === undefined ? '' : m.data.ChiSoCD, ChiSoTD: m.data.ChiSoTD === undefined ? '' : m.data.ChiSoTD,
          GhiChu: m.data.GhiChu || '', _cho: m.trangThai, _hang: m.id, Co: 'BINH_THUONG'
        });
      } else if (m.action === 'xoaChiSo') {
        ds = ds.filter(function (r) { return r.MaGhi !== m.data.maGhi; });
      } else if (m.action === 'duyetChiSo' && m.data.sua) {
        ds.forEach(function (r) { if (r.MaGhi === m.data.maGhi) { Object.assign(r, m.data.sua); r._cho = m.trangThai; } });
      }
    });
    ds.sort(dn.soSanh);
    // Tính lại tiêu thụ cho các dòng chờ gửi / vừa sửa trên máy (dòng của máy chủ giữ số máy chủ đã tính).
    if (ct) {
      for (let i = 0; i < ds.length; i++) {
        if (!ds[i]._cho) continue;
        if (ds[i].Co === 'THAY_CONG_TO') continue;
        const kq = dn.kiemTra(ct, i > 0 ? ds[i - 1] : null, { ChiSoBT: ds[i].ChiSoBT, ChiSoCD: ds[i].ChiSoCD, ChiSoTD: ds[i].ChiSoTD, NgayTinh: ds[i].NgayTinh, HeSo: ct.HeSoNhan },
          dn.thamSo(ds.slice(0, i), ds[i].NgayTinh));
        ds[i].TieuThuBT = kq.TieuThuBT;
        ds[i].TieuThuCD = kq.TieuThuCD;
        ds[i].TieuThuTD = kq.TieuThuTD;
        ds[i].TieuThu = kq.TieuThu;
        ds[i].HeSoDung = kq.HeSoDung;
        ds[i].Co = kq.Co;
      }
    }
    return ds;
  };

  /** Công tơ đang dùng (không xóa, trạng thái DANG_DUNG hoặc trống), xếp theo mã. */
  dn.congToDung = function () {
    return ME.du.ds('CongTo').filter(function (c) { return c.MaCT && (!c.TrangThai || c.TrangThai === 'DANG_DUNG'); })
      .sort(function (a, b) { return String(a.MaCT).localeCompare(String(b.MaCT), 'vi', { numeric: true }); });
  };
  /** Tiến độ ghi hôm nay (tính trên máy, gồm cả số chờ gửi). */
  dn.tienDo = function () {
    const hn = ME.homNay();
    const ds = dn.congToDung();
    const daGhi = {};
    ds.forEach(function (c) {
      const g = dn.dsGhi(c.MaCT).filter(function (r) { return ME.ngayCua(r.GhiLuc) === hn; });
      if (g.length) daGhi[c.MaCT] = g[g.length - 1];
    });
    const chuaGhi = ds.filter(function (c) { return !daGhi[c.MaCT]; }).map(function (c) { return c.MaCT; });
    const gioHan = String(ME.cauHinh('GIO_HAN_GHI_CHI_SO') || '');
    const gioNay = ME.isoVN().slice(11, 16);
    return { tong: ds.length, daGhi: ds.length - chuaGhi.length, chuaGhi: chuaGhi, ghiHomNay: daGhi, gioGhi: String(ME.cauHinh('GIO_GHI_CHI_SO') || ''),
      gioHan: gioHan, quaHan: !!(gioHan && chuaGhi.length && gioNay >= gioHan) };
  };

  /** Đơn giá theo loại và ngày (giống taoBangGia_). */
  function bangGia(dsGia) {
    const theoLoai = {};
    (dsGia || []).forEach(function (d) {
      if (d.DaXoa === true || !(Number(d.DonGia) > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.TuNgay))) return;
      (theoLoai[d.Loai] = theoLoai[d.Loai] || []).push(d);
    });
    Object.keys(theoLoai).forEach(function (k) { theoLoai[k].sort(function (a, b) { return a.TuNgay < b.TuNgay ? 1 : -1; }); });
    return {
      coGia: Object.keys(theoLoai).length > 0,
      gia: function (loai, ngay) {
        const ds = theoLoai[loai] || [];
        for (let i = 0; i < ds.length; i++) if (ds[i].TuNgay <= ngay && (!ds[i].DenNgay || ds[i].DenNgay >= ngay)) return Number(ds[i].DonGia);
        return null;
      }
    };
  }
  function vongCha(dong, ma, cha) {
    const theoMa = {};
    dong.forEach(function (d) { theoMa[d.MaCT] = d; });
    let hienTai = cha;
    const daQua = {};
    while (hienTai) {
      if (hienTai === ma || daQua[hienTai]) return true;
      daQua[hienTai] = true;
      const d = theoMa[hienTai];
      hienTai = d ? d.MaCTCha : '';
    }
    return false;
  }

  /**
   * Tổng hợp một tháng ngay trên máy, cùng dạng với tongHopDienNuoc của máy chủ (tinhTongHop_).
   * Máy chỉ giữ chỉ số khoảng 62 ngày nên xu hướng 12 tháng chỉ đúng cho các tháng còn dữ liệu (cucBo: true).
   */
  dn.tinhTongHop = function (thang) {
    const homNay = ME.homNay();
    const coChiPhi = ME.co('QUAN_LY_DIEN_NUOC');
    const lt = function (x) { return ME.lamTron(x, 2); };
    const pad2 = ME.p2;
    const dsCT = ME.du.ds('CongTo').filter(function (d) { return d.MaCT; });
    const theoMa = {};
    dsCT.forEach(function (c) { theoMa[c.MaCT] = c; });
    const chaHopLe = function (c) {
      const p = c.MaCTCha;
      return p && theoMa[p] && p !== c.MaCT && dn.loai(theoMa[p]) === dn.loai(c) && !vongCha(dsCT, c.MaCT, p) ? p : '';
    };
    const con = {};
    dsCT.forEach(function (c) { const p = chaHopLe(c); if (p) (con[p] = con[p] || []).push(c.MaCT); });
    const soNgay = ME.soNgayTrongThang(thang);
    const cacThang = [];
    for (let k = 11; k >= 0; k--) cacThang.push(ME.congThang(thang, -k));
    const thangTruoc = cacThang[10];
    const tu = cacThang[0] + '-01';
    const den = thang + '-' + pad2(soNgay);
    const theoCT = {};
    dsCT.forEach(function (c) { theoCT[c.MaCT] = dn.dsGhi(c.MaCT); });
    const pb = {};
    dsCT.forEach(function (c) { pb[c.MaCT] = dn.phanBo(theoCT[c.MaCT] || [], tu, den); });
    const ngayCua = function (th, d) { return th + '-' + pad2(d); };
    const tongThang = function (ma, th, denNgay) {
      const n = Math.min(ME.soNgayTrongThang(th), denNgay || 31);
      let s = 0;
      for (let d = 1; d <= n; d++) { const o = pb[ma].ngay[ngayCua(th, d)]; if (o) s += o.tong; }
      return s;
    };
    const giaBang = coChiPhi ? bangGia(ME.du.ds('BieuGia')) : null;
    const chiPhiThang = function (dsGoc, th, loai) {
      if (!giaBang || !giaBang.coGia) return null;
      const kq = { tong: 0, BT: 0, CD: 0, TD: 0, khongChia: 0, thieuGia: false };
      const n = ME.soNgayTrongThang(th);
      dsGoc.forEach(function (c) {
        const baGia = String(c.Loai) === 'DIEN_3_GIA';
        for (let d = 1; d <= n; d++) {
          const ngay = ngayCua(th, d);
          const o = pb[c.MaCT].ngay[ngay];
          if (!o || !o.tong) continue;
          if (loai === 'nuoc') {
            const g = giaBang.gia('NUOC', ngay);
            if (g === null) kq.thieuGia = true; else kq.khongChia += o.tong * g;
          } else if (baGia) {
            ['BT', 'CD', 'TD'].forEach(function (k) {
              const g = giaBang.gia('DIEN_' + k, ngay);
              if (g === null) { if (o[k]) kq.thieuGia = true; } else kq[k] += o[k] * g;
            });
          } else {
            const g = giaBang.gia('DIEN_BT', ngay);
            if (g === null) kq.thieuGia = true; else kq.khongChia += o.tong * g;
          }
        }
      });
      kq.tong = kq.BT + kq.CD + kq.TD + kq.khongChia;
      Object.keys(kq).forEach(function (k) { if (typeof kq[k] === 'number') kq[k] = Math.round(kq[k]); });
      return kq;
    };
    let ngayCuoiCoSo = 0;
    dsCT.forEach(function (c) {
      for (let d = soNgay; d > ngayCuoiCoSo; d--) if (pb[c.MaCT].ngay[ngayCua(thang, d)]) { ngayCuoiCoSo = d; break; }
    });
    const tongHopLoai = function (loai) {
      const cua = dsCT.filter(function (c) { return dn.loai(c) === loai; });
      const goc = cua.filter(function (c) { return !chaHopLe(c); });
      const la = cua.filter(function (c) { return !con[c.MaCT]; });
      const theoNgay = [];
      const ngayVuot = [];
      const ngayBatThuong = [];
      const ngayGop = [];
      const coDM = goc.filter(function (c) { return Number(c.DinhMucNgay) > 0; });
      const dinhMuc = coDM.length ? coDM.reduce(function (s, c) { return s + Number(c.DinhMucNgay); }, 0) : null;
      for (let d = 1; d <= soNgay; d++) {
        const ngay = ngayCua(thang, d);
        let s = 0;
        let sDM = 0;
        let co = false;
        goc.forEach(function (c) {
          const o = pb[c.MaCT].ngay[ngay];
          if (o) { s += o.tong; if (Number(c.DinhMucNgay) > 0) sDM += o.tong; co = true; }
          if (pb[c.MaCT].batThuong[ngay] && ngayBatThuong.indexOf(d) < 0) ngayBatThuong.push(d);
          if (pb[c.MaCT].gop[ngay] && ngayGop.indexOf(d) < 0) ngayGop.push(d);
        });
        theoNgay.push(co ? lt(s) : null);
        if (co && dinhMuc !== null && sDM > dinhMuc) ngayVuot.push(d);
      }
      const tong = goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thang); }, 0);
      const tongTruoc = goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thangTruoc); }, 0);
      const cungKy = ngayCuoiCoSo ? goc.reduce(function (s, c) { return s + tongThang(c.MaCT, thangTruoc, ngayCuoiCoSo); }, 0) : 0;
      const khung = { BT: 0, CD: 0, TD: 0, khongChia: 0 };
      goc.forEach(function (c) {
        for (let d = 1; d <= soNgay; d++) {
          const o = pb[c.MaCT].ngay[ngayCua(thang, d)];
          if (!o) continue;
          if (String(c.Loai) === 'DIEN_3_GIA') { khung.BT += o.BT; khung.CD += o.CD; khung.TD += o.TD; } else khung.khongChia += o.tong;
        }
      });
      Object.keys(khung).forEach(function (k) { khung[k] = lt(khung[k]); });
      const theoCongTo = la.map(function (c) { return { MaCT: c.MaCT, KhuVuc: c.KhuVuc || '', tong: lt(tongThang(c.MaCT, thang)) }; })
        .sort(function (a, b) { return b.tong - a.tong; });
      const kv = {};
      theoCongTo.forEach(function (x) { kv[x.KhuVuc] = (kv[x.KhuVuc] || 0) + x.tong; });
      let khac = 0;
      cua.forEach(function (c) {
        if (!con[c.MaCT]) return;
        const nhanh = con[c.MaCT].reduce(function (s, m) { return s + tongThang(m, thang); }, 0);
        khac += tongThang(c.MaCT, thang) - nhanh;
      });
      return {
        donVi: loai === 'nuoc' ? 'm³' : 'kWh', soCongTo: cua.length, tong: lt(tong), tongTruoc: lt(tongTruoc), cungKyTruoc: lt(cungKy),
        theoNgay: theoNgay, dinhMucNgay: dinhMuc, ngayVuot: ngayVuot, ngayBatThuong: ngayBatThuong.sort(function (a, b) { return a - b; }),
        ngayGop: ngayGop.sort(function (a, b) { return a - b; }), khungGio: loai === 'dien' ? khung : null,
        theoCongTo: theoCongTo, theoKhuVuc: Object.keys(kv).map(function (k) { return { KhuVuc: k, tong: lt(kv[k]) }; }).sort(function (a, b) { return b.tong - a.tong; }),
        khacChuaDo: lt(khac),
        xuHuong: cacThang.map(function (th) { return { thang: th, tong: lt(goc.reduce(function (s, c) { return s + tongThang(c.MaCT, th); }, 0)) }; }),
        chiPhi: coChiPhi ? chiPhiThang(goc, thang, loai) : null,
        chiPhiThangTruoc: coChiPhi ? chiPhiThang(goc, thangTruoc, loai) : null
      };
    };
    const congTo = {};
    dsCT.forEach(function (c) {
      const ds = theoCT[c.MaCT] || [];
      const cuoi = ds.length ? ds[ds.length - 1] : null;
      const homNayGhi = ds.filter(function (d) { return ME.ngayCua(d.GhiLuc) === homNay; });
      const theoNgay = [];
      let cao = null;
      let tong = 0;
      let soNgayCo = 0;
      for (let d = 1; d <= soNgay; d++) {
        const o = pb[c.MaCT].ngay[ngayCua(thang, d)];
        theoNgay.push(o ? lt(o.tong) : null);
        if (o) { tong += o.tong; soNgayCo++; if (!cao || o.tong > cao.giaTri) cao = { ngay: d, giaTri: lt(o.tong) }; }
      }
      const ngayIdx = function (m) {
        return Object.keys(m).filter(function (x) { return x.slice(0, 7) === thang; }).map(function (x) { return Number(x.slice(8)); }).sort(function (a, b) { return a - b; });
      };
      congTo[c.MaCT] = {
        loai: dn.loai(c), tongThang: lt(tong), tbNgay: soNgayCo ? lt(tong / soNgayCo) : null, caoNhat: cao, theoNgay: theoNgay,
        ngayBatThuong: ngayIdx(pb[c.MaCT].batThuong), ngayGop: ngayIdx(pb[c.MaCT].gop),
        thang12: cacThang.map(function (th) { return lt(tongThang(c.MaCT, th)); }),
        cuoi: cuoi ? { MaGhi: cuoi.MaGhi, GhiLuc: cuoi.GhiLuc, NgayTinh: cuoi.NgayTinh, TieuThu: cuoi.TieuThu, Co: cuoi.Co, NguoiGhi: cuoi.NguoiGhi } : null,
        daGhiHomNay: homNayGhi.length ? String(homNayGhi[homNayGhi.length - 1].GhiLuc) : ''
      };
    });
    const td = dn.tienDo();
    return {
      thang: thang, soNgay: soNgay, ngayCuoiCoSo: ngayCuoiCoSo, homNay: homNay, cacThang: cacThang,
      dien: tongHopLoai('dien'), nuoc: tongHopLoai('nuoc'), congTo: congTo, tienDo: td, coChiPhi: coChiPhi, tinhLuc: ME.isoVN(), cucBo: true
    };
  };

  /** Tháng nào còn đủ dữ liệu trên máy (chỉ số tải về khoảng 62 ngày). */
  dn.thangCoTrenMay = function (thang) {
    const dauThang = thang + '-01';
    const ds = ME.du.ds('ChiSo');
    if (!ds.length) return false;
    let nhoNhat = '9999';
    ds.forEach(function (r) { if (r.NgayTinh && r.NgayTinh < nhoNhat) nhoNhat = r.NgayTinh; });
    return nhoNhat <= dauThang || thang >= ME.homNay().slice(0, 7);
  };
})();

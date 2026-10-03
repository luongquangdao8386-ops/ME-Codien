/**
 * ME – Quản lý Cơ điện · 机电管理系统
 * BaoMat.gs — băm PIN, kiểm PIN, tạo PIN tạm, chuẩn hóa mã nhân viên, token đăng nhập.
 *
 * Khóa bí mật nằm trong Script Properties (KHOA_PIN, KHOA_TOKEN), do menu ME → Cài đặt tạo một lần.
 * Không bao giờ viết khóa, mật khẩu hay PIN vào code: mã nguồn app để công khai trên GitHub.
 *
 * Bản băm PIN lưu dạng "v1$<số vòng>$<base64>": HMAC-SHA256 lặp nhiều vòng, khóa là KHOA_PIN,
 * trộn muối riêng của từng người (cột PinSalt). Đổi số vòng sau này không làm hỏng PIN cũ.
 *
 * Token đăng nhập (bước 2): "me1.<nội dung>.<chữ ký>", nội dung là JSON { n: mã NV, v: TokenVer, i: lúc cấp,
 * e: hết hạn (giây) }, chữ ký HMAC-SHA256 bằng KHOA_TOKEN. Token có hạn dùng (CauHinh THOI_HAN_PHIEN_NGAY);
 * tăng cột TokenVer của một người là mọi token cũ của người đó hết hiệu lực trên mọi máy.
 */

const PIN_SO_VONG = 200;
const MA_NV_HOP_LE = /^[A-Z0-9][A-Z0-9._-]{1,19}$/;

/** PIN dễ đoán ngoài các kiểu lặp, dãy liên tiếp, đối xứng đã chặn bằng quy tắc. */
const PIN_DE_DOAN = [
  '147258', '258369', '147369', '369258', '159753', '357159', '951753', '753951', '159357',
  '741852', '852963', '963852', '789456', '456123', '112358', '100200', '102030',
  '520520', '521521', '131420', '201314', '520131', '168168', '668668', '686868', '868686',
  '888999', '999888'
];

/** Lấy khóa bí mật trong Script Properties. */
function layKhoa_(ten) {
  const v = PropertiesService.getScriptProperties().getProperty(ten);
  if (!v) throw new Error('Thiếu khóa bí mật ' + ten + '. Mở file Sheets → menu ME → Cài đặt.');
  return v;
}

function byteSangHex_(bytes) {
  return Array.prototype.map.call(bytes, function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

/** Chuỗi ngẫu nhiên 64 ký tự hex (256 bit), từ UUID ngẫu nhiên của Google băm SHA-256. */
function taoChuoiNgauNhien_() {
  const nguon = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid() + Date.now();
  return byteSangHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, nguon, Utilities.Charset.UTF_8));
}

/** Muối riêng cho PIN của một người (32 ký tự hex). */
function taoMuoi_() {
  return taoChuoiNgauNhien_().slice(0, 32);
}

/** Băm PIN. Trả "v1$<số vòng>$<base64>". */
function bamPin_(pin, muoi, soVong) {
  soVong = soVong || PIN_SO_VONG;
  const khoa = Utilities.newBlob(layKhoa_('KHOA_PIN')).getBytes();
  const muoiByte = Array.prototype.slice.call(Utilities.newBlob(String(muoi)).getBytes());
  let h = Utilities.computeHmacSha256Signature(Utilities.newBlob(String(muoi) + '|' + String(pin)).getBytes(), khoa);
  for (let i = 1; i < soVong; i++) {
    h = Utilities.computeHmacSha256Signature(Array.prototype.slice.call(h).concat(muoiByte), khoa);
  }
  return 'v1$' + soVong + '$' + Utilities.base64Encode(h);
}

/** So PIN người dùng nhập với bản băm đã lưu. */
function kiemTraPin_(pin, muoi, banBam) {
  const p = String(banBam || '').split('$');
  if (p.length !== 3 || p[0] !== 'v1') return false;
  const soVong = parseInt(p[1], 10);
  if (!(soVong >= 1 && soVong <= 100000)) return false;
  if (!pinHopLe_(pin)) return false;
  return soSanhAnToan_(bamPin_(pin, muoi, soVong), String(banBam));
}

/** So hai chuỗi trong thời gian không phụ thuộc vị trí khác nhau. */
function soSanhAnToan_(a, b) {
  a = String(a);
  b = String(b);
  let khac = a.length ^ b.length;
  const n = Math.max(b.length, 1);
  for (let i = 0; i < a.length; i++) khac |= a.charCodeAt(i) ^ (b.charCodeAt(i % n) || 0);
  return khac === 0;
}

function pinHopLe_(pin) {
  return /^\d{6}$/.test(String(pin));
}

/** PIN dễ đoán: lặp (000000), dãy liên tiếp (123456, 654321, 890123), cặp lặp (121212),
 *  bộ ba lặp (123123), đôi (112233), nửa (111222), đối xứng (123321), danh sách hay dùng. */
function pinDeDoan_(pin) {
  const s = String(pin);
  if (!pinHopLe_(s)) return true;
  if (/^(\d)\1{5}$/.test(s)) return true;
  const d = s.split('').map(Number);
  let tang = true;
  let giam = true;
  for (let i = 1; i < 6; i++) {
    if ((d[i] - d[i - 1] + 10) % 10 !== 1) tang = false;
    if ((d[i - 1] - d[i] + 10) % 10 !== 1) giam = false;
  }
  if (tang || giam) return true;
  if (/^(\d\d)\1\1$/.test(s)) return true;
  if (/^(\d{3})\1$/.test(s)) return true;
  if (/^(\d)\1(\d)\2(\d)\3$/.test(s)) return true;
  if (/^(\d)\1\1(\d)\2\2$/.test(s)) return true;
  if (/^(\d)(\d)(\d)\3\2\1$/.test(s)) return true;
  return PIN_DE_DOAN.indexOf(s) >= 0;
}

/** PIN tạm 6 số ngẫu nhiên, không dễ đoán. */
function taoPinTam_() {
  for (let lan = 0; lan < 20; lan++) {
    const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid(), Utilities.Charset.UTF_8);
    for (let i = 0; i + 3 < b.length; i += 4) {
      const n = (((b[i] & 0xff) << 24) >>> 0) + ((b[i + 1] & 0xff) << 16) + ((b[i + 2] & 0xff) << 8) + (b[i + 3] & 0xff);
      if (n >= 4294000000) continue; // bỏ phần dư để mọi PIN có xác suất như nhau
      const pin = ('00000' + (n % 1000000)).slice(-6);
      if (!pinDeDoan_(pin)) return pin;
    }
  }
  throw new Error('Không tạo được PIN tạm, thử lại.');
}

/** Mã NV: bỏ khoảng trắng, chữ in hoa, chuẩn Unicode NFC. */
function chuanMaNV_(s) {
  return String(s === null || s === undefined ? '' : s).normalize('NFC').replace(/\s+/g, '').toUpperCase();
}

// ───────────────────────── Token đăng nhập (bước 2) ─────────────────────────

const TOKEN_PHIEN_BAN = 'me1';

/** Base64 an toàn cho URL, bỏ dấu = ở cuối. */
function base64Url_(duLieu) {
  return Utilities.base64EncodeWebSafe(duLieu).replace(/=+$/, '');
}

function kyToken_(noiDung) {
  return base64Url_(Utilities.computeHmacSha256Signature(TOKEN_PHIEN_BAN + '.' + noiDung, layKhoa_('KHOA_TOKEN')));
}

/** Cấp token cho người dùng (cần MaNV, TokenVer); soNgay = số ngày hiệu lực. Trả { token, hetHan }. */
function taoToken_(user, soNgay) {
  const bayGioGiay = Math.floor(Date.now() / 1000);
  const hetHan = bayGioGiay + Math.round(Math.max(Number(soNgay) || 30, 0.01) * 86400);
  const noiDung = base64Url_(Utilities.newBlob(JSON.stringify({
    n: String(user.MaNV), v: Number(user.TokenVer) || 0, i: bayGioGiay, e: hetHan, r: taoChuoiNgauNhien_().slice(0, 8)
  })).getBytes());
  return { token: TOKEN_PHIEN_BAN + '.' + noiDung + '.' + kyToken_(noiDung), hetHan: bayGio_(new Date(hetHan * 1000)) };
}

/** Đọc token: kiểm chữ ký và hạn dùng; sai hoặc hết hạn trả null. Chưa kiểm người dùng. */
function moToken_(token) {
  const p = String(token || '').split('.');
  if (p.length !== 3 || p[0] !== TOKEN_PHIEN_BAN || !p[1] || !p[2] || p[1].length > 1000) return null;
  if (!soSanhAnToan_(kyToken_(p[1]), p[2])) return null;
  let tai;
  try {
    const dem = (4 - (p[1].length % 4)) % 4;
    tai = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p[1] + '===='.slice(0, dem))).getDataAsString('UTF-8'));
  } catch (e) {
    return null;
  }
  if (!tai || typeof tai.n !== 'string' || !(Number(tai.e) > Date.now() / 1000)) return null;
  return tai;
}

/**
 * Kiểm token của một yêu cầu: chữ ký, hạn dùng, người dùng còn hoạt động và TokenVer khớp.
 * Trả { user, tai }; sai thì báo lỗi PHIEN_HET_HAN để app đăng nhập lại.
 */
function kiemTraToken_(token) {
  const tai = moToken_(token);
  if (!tai) throw loi_('PHIEN_HET_HAN');
  const d = timNguoiDung_(tai.n);
  if (!d || laDung_(d.DaXoa)) throw loi_('PHIEN_HET_HAN');
  if (String(d.TrangThai || '') === 'NGUNG') throw loi_('TAI_KHOAN_NGUNG');
  if ((Number(d.TokenVer) || 0) !== Number(tai.v)) throw loi_('PHIEN_HET_HAN');
  return { user: taoNguoiDung_(d), tai: tai };
}

/**
 * ME – Quản lý Cơ điện · 机电管理系统
 * BaoMat.gs — băm PIN, kiểm PIN, tạo PIN tạm, chuẩn hóa mã nhân viên.
 * Bước 2 sẽ thêm token đăng nhập (ký HMAC-SHA256, thu hồi bằng TokenVer) vào file này.
 *
 * Khóa bí mật nằm trong Script Properties (KHOA_PIN, KHOA_TOKEN), do menu ME → Cài đặt tạo một lần.
 * Không bao giờ viết khóa, mật khẩu hay PIN vào code: mã nguồn app để công khai trên GitHub.
 *
 * Bản băm PIN lưu dạng "v1$<số vòng>$<base64>": HMAC-SHA256 lặp nhiều vòng, khóa là KHOA_PIN,
 * trộn muối riêng của từng người (cột PinSalt). Đổi số vòng sau này không làm hỏng PIN cũ.
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

/* ME – Quản lý Cơ điện · 机电管理系统
   sw.js — Service Worker: lưu sẵn toàn bộ app trên máy để mở được khi mất mạng.
   Mỗi lần sửa bất kỳ tệp nào của app: đổi PHIEN_BAN bên dưới (VD me-1.0.1) để máy người dùng nhận bản mới
   (app hiện dải vàng "Có bản mới – bấm để cập nhật"). Không đổi PHIEN_BAN thì máy cũ vẫn dùng bản đã lưu. */
'use strict';
const PHIEN_BAN = 'me-1.0.0';
const TEP = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/cau-hinh.js',
  'js/nen.js',
  'js/nhan.js',
  'js/du-lieu.js',
  'js/chi-so.js',
  'js/bieu-do.js',
  'js/ui.js',
  'js/man-chung.js',
  'js/man-thiet-bi.js',
  'js/man-kho.js',
  'js/man-dien-nuoc.js',
  'js/man-quan-tri.js',
  'js/app.js',
  'js/lib/jszip.min.js',
  'js/lib/jsqr.js',
  'js/lib/qrcode.js',
  'fonts/BeVietnamPro-Regular.woff',
  'fonts/BeVietnamPro-Medium.woff',
  'fonts/BeVietnamPro-SemiBold.woff',
  'fonts/BeVietnamPro-Bold.woff',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  // Tải mới từng tệp (bỏ qua bộ nhớ đệm HTTP của GitHub Pages) rồi mới coi là cài xong.
  e.waitUntil(caches.open(PHIEN_BAN).then(function (c) {
    return c.addAll(TEP.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }));
});

// Bản mới chờ người dùng bấm dải vàng rồi mới kích hoạt (không tự tải lại giữa lúc đang ghi số).
self.addEventListener('message', function (e) {
  if (e.data && e.data.lenh === 'KICH_HOAT') self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ds) {
    return Promise.all(ds.filter(function (k) { return k !== PHIEN_BAN && k.indexOf('me-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Thư mục gốc của app, VD /ME-Codien/
const GOC = new URL('./', self.location).pathname;

self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Chỉ phục vụ tệp của app. Máy chủ Apps Script, ảnh Drive… đi thẳng ra mạng.
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    // Chỉ trang app (gốc hoặc index.html) lấy từ máy; trang khác trong kho (VD may-chu/…) đi thẳng ra mạng.
    if (u.pathname === GOC || u.pathname === GOC + 'index.html') {
      e.respondWith(caches.match('index.html').then(function (c) { return c || fetch(r); }));
    }
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (c) {
    return c || fetch(r);
  }));
});

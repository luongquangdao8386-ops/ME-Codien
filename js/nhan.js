/* ME – Quản lý Cơ điện · 机电管理系统
   nhan.js — nhãn song ngữ dùng chung (nút, thông báo, lỗi của app). Nhãn riêng của từng màn nằm đầu tệp man-*.js.
   Quản trị sửa bản dịch trong app (Quản trị → Từ điển song ngữ) hoặc ở sheet TuDien; app ưu tiên bản đã sửa. */
(function () {
  'use strict';
  const ME = window.ME;

  ME.nhan('Chung', {
    'chung.quayLai': ['Quay lại', '返回'],
    'chung.dong': ['Đóng', '关闭'],
    'chung.coLoi': ['Có lỗi', '出错了'],
    'chung.dangTai': ['Đang tải…', '加载中…'],
    'chung.dangLuu': ['Đang lưu…', '保存中…'],
    'chung.dangGui': ['Đang gửi…', '发送中…'],
    'chung.khongThay': ['Không tìm thấy', '未找到'],
    'chung.timNhanh': ['Tìm nhanh', '快速搜索'],
    'chung.coMangLai': ['Có mạng trở lại, đang đồng bộ.', '网络已恢复，正在同步。'],
    'chung.matMang': ['Mất mạng. Vẫn xem và ghi được, app tự gửi khi có mạng.', '网络已断开。仍可查看和记录，联网后自动发送。'],
    'chung.matMangNgan': ['Đang mất mạng', '当前离线'],
    'chung.coBanMoi': ['Có bản mới – bấm để cập nhật', '有新版本 – 点击更新'],
    'chung.luu': ['Lưu', '保存'],
    'chung.huy': ['Hủy', '取消'],
    'chung.sua': ['Sửa', '编辑'],
    'chung.xoa': ['Xóa', '删除'],
    'chung.them': ['Thêm', '新增'],
    'chung.xacNhan': ['Xác nhận', '确认'],
    'chung.vanLuu': ['Vẫn lưu', '仍然保存'],
    'chung.suaLai': ['Sửa lại', '返回修改'],
    'chung.thuLai': ['Thử lại', '重试'],
    'chung.daLuu': ['Đã lưu', '已保存'],
    'chung.daLuuCho': ['Đã lưu trên máy, app tự gửi khi có mạng.', '已保存在本机，联网后自动发送。'],
    'chung.xemTatCa': ['Xem tất cả', '查看全部'],
    'chung.xemThem': ['Xem thêm', '查看更多'],
    'chung.tatCa': ['Tất cả', '全部'],
    'chung.chon': ['Chọn', '选择'],
    'chung.chonDi': ['— Chọn —', '— 请选择 —'],
    'chung.khongChon': ['Không chọn', '不选'],
    'chung.chuaCo': ['Chưa có', '暂无'],
    'chung.chuaCoDuLieu': ['Chưa có dữ liệu', '暂无数据'],
    'chung.batBuoc': ['Bắt buộc', '必填'],
    'chung.ghiChu': ['Ghi chú', '备注'],
    'chung.chupAnh': ['Chụp ảnh', '拍照'],
    'chung.chonAnh': ['Chọn ảnh có sẵn', '从相册选择'],
    'chung.chupLai': ['Chụp lại', '重拍'],
    'chung.boAnh': ['Bỏ ảnh', '移除照片'],
    'chung.dangNenAnh': ['Đang nén ảnh…', '正在压缩照片…'],
    'chung.anhDaNen': ['Ảnh đã nén còn khoảng {kb} KB', '照片已压缩至约{kb} KB'],
    'chung.khongQuyen': ['Bạn không có quyền xem màn này.', '您没有查看此页面的权限。'],
    'chung.canMang': ['Việc này cần có mạng. Kết nối mạng rồi thử lại.', '此操作需要联网，请联网后重试。'],
    'chung.dot2': ['Đợt 2', '第二期'],
    'chung.dot3': ['Đợt 3', '第三期'],
    'chung.sapCo': ['Chức năng này làm ở {dot}.', '该功能将在{dot}上线。'],
    'chung.saoChep': ['Sao chép', '复制'],
    'chung.daSaoChep': ['Đã sao chép', '已复制'],
    'chung.khongSaoChep': ['Máy không cho sao chép tự động. Bấm giữ để chọn và sao chép.', '无法自动复制，请长按选择后复制。'],
    'chung.ngay': ['Ngày', '日期'],
    'chung.tuNgay': ['Từ ngày', '起始日期'],
    'chung.denNgay': ['Đến ngày', '截止日期'],
    'chung.capN': ['Cấp {n}', '{n}级'],
    'chung.choGui': ['Chờ gửi', '待发送'],
    'chung.loiGui': ['Lỗi gửi', '发送失败'],
    'chung.hienSo': ['Đang hiện {n} / {tong}. Gõ tìm để thu hẹp.', '显示{n}/{tong}项，请输入关键词缩小范围。'],
    'chung.taiThem': ['Hiện thêm', '显示更多'],
    'chung.coThayDoiCho': ['Có thay đổi chờ gửi', '有待发送的修改'],
    'chung.trong': ['(trống)', '（空）'],
    'chung.in': ['In', '打印'],
    'chung.tiepTuc': ['Tiếp tục', '继续'],
    'chung.hoanTat': ['Hoàn tất', '完成'],
    'chung.dangXuLy': ['Đang xử lý…', '处理中…'],
    'chung.taiLai': ['Tải lại', '刷新'],
    'chung.capNhatLuc': ['Cập nhật {luc} · {nguoi}', '{luc}更新 · {nguoi}']
  });

  ME.nhan('Điều hướng', {
    'nav.nhan': ['Điều hướng chính', '主导航'],
    'nav.trangChu': ['Trang chủ', '首页'],
    'nav.thietBi': ['Thiết bị', '设备'],
    'nav.quetQR': ['Quét QR', '扫码'],
    'nav.khoLK': ['Kho LK', '备件'],
    'nav.taiKhoan': ['Tài khoản', '我的']
  });

  ME.nhan('Lỗi', {
    'loi.khongRo': ['Có lỗi không rõ. Thử lại sau.', '发生未知错误，请稍后重试。'],
    'loi.heThong': ['Lỗi: {chiTiet}', '错误：{chiTiet}'],
    'loi.ANH_DOC_LOI': ['Không đọc được ảnh này. Chọn ảnh khác.', '无法读取此照片，请换一张。'],
    'loi.THU_VIEN': ['Không tải được phần mở rộng của app. Kiểm tra mạng rồi thử lại.', '无法加载应用组件，请检查网络后重试。'],
    'loi.MAT_MANG': ['Không có mạng hoặc không kết nối được máy chủ.', '无网络或无法连接服务器。'],
    'loi.HET_GIO': ['Máy chủ trả lời quá lâu. Thử lại sau ít phút.', '服务器响应超时，请几分钟后重试。'],
    'loi.HTML_404': ['Máy chủ báo không tìm thấy (404). Nếu vừa triển khai, đợi vài phút rồi thử lại; vẫn lỗi thì kiểm tra lại link /exec.',
      '服务器返回404。如刚部署，请等几分钟再试；仍出错请检查/exec链接。'],
    'loi.HTML': ['Máy chủ trả về trang web thay vì dữ liệu (mã {ma}). Kiểm tra link /exec và quyền truy cập "Bất kỳ ai".',
      '服务器返回了网页而不是数据（代码{ma}）。请检查/exec链接及“任何人”访问权限。'],
    'loi.GOOGLE_DOI_GET': ['Google chưa chuyển yêu cầu tới máy chủ dù đã gửi lại 3 lần. Thử lại sau ít phút.', 'Google多次未将请求转给服务器，请几分钟后重试。'],
    'loi.LA': ['Máy chủ trả dữ liệu lạ.', '服务器返回了异常数据。'],
    'loi.CHUA_KET_NOI': ['Chưa kết nối máy chủ.', '尚未连接服务器。'],
    'loi.TRINH_DUYET_CU': ['Trình duyệt quá cũ. Cập nhật iOS hoặc dùng Safari mới.', '浏览器版本过旧，请更新iOS或使用新版Safari。'],
    'loi.KHOA_MAY': ['Sai PIN nhiều lần. Tạm khóa trên máy này đến {gio}.', 'PIN码多次错误，本机暂时锁定至{gio}。'],
    'loi.SAI_PIN_MAY': ['PIN không đúng. Còn {con} lần thử.', 'PIN码错误，还可尝试{con}次。'],
    'loi.CAN_MANG_DANG_NHAP': ['Phiên đăng nhập đã hết hạn. Cần có mạng để đăng nhập lại.', '登录已过期，需要联网才能重新登录。'],
    'loi.KHONG_LUU_TRU': ['Máy không cho app lưu dữ liệu (có thể đang ở chế độ duyệt riêng tư). Mở bằng Safari thường hoặc từ biểu tượng trên màn hình chính.',
      '设备不允许应用保存数据（可能处于无痕浏览模式）。请用普通Safari或主屏幕图标打开。'],
    'loi.CAN_CAP_NHAT_APP_NGAN': ['App cần cập nhật bản mới. Bấm dải vàng ở đầu màn hình.', '应用需要更新，请点击屏幕顶部的黄色横条。'],
    'loi.LINK_SAI': ['Link chưa đúng. Cần link Web App kết thúc bằng /exec.', '链接不正确，需要以/exec结尾的Web App链接。'],
    'loi.KHONG_PHAI_ME': ['Link này không phải máy chủ app ME.', '此链接不是ME应用的服务器。'],
    'loi.CAMERA': ['Không mở được camera. Cho phép app dùng camera (Cài đặt → Safari → Camera) hoặc nhập mã bằng tay.',
      '无法打开相机。请允许使用相机（设置 → Safari → 相机），或手动输入编号。'],
    'loi.SO_SAI': ['Số không hợp lệ: «{gt}».', '数字无效：「{gt}」。'],
    'loi.THIEU': ['Thiếu {truong}.', '缺少{truong}。'],
    'loi.MA_SAI': ['Mã chỉ dùng chữ in hoa không dấu, số, dấu chấm, gạch ngang, gạch dưới (tối đa 30 ký tự).', '编号只能使用无声调大写字母、数字、点、横线、下划线（最多30个字符）。'],
    'loi.TEP_LA': ['Không đọc được tệp này. Dùng tệp Excel .xlsx hoặc .csv.', '无法读取此文件，请使用Excel .xlsx或.csv文件。'],
    'loi.TEP_XLS': ['Tệp .xls (Excel đời cũ) chưa đọc được. Mở bằng Excel rồi lưu lại dạng .xlsx.', '暂不支持.xls旧格式，请用Excel另存为.xlsx。'],
    'loi.TEP_TRONG': ['Tệp không có dòng dữ liệu nào.', '文件中没有数据行。']
  });

  /** Lỗi thiếu trường: tên trường hai thứ tiếng. */
  ME.loiThieu = function (khoaNhan) {
    const t = ME.t(khoaNhan);
    const e = new Error(ME.tv('loi.THIEU', { truong: t.vi }));
    e.vi = ME.tv('loi.THIEU', { truong: t.vi });
    e.zh = ME.tz('loi.THIEU', { truong: t.zh });
    e.ma = 'THIEU';
    return e;
  };
})();

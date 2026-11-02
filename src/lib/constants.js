// Trạng thái sửa chữa theo thứ tự luồng nghiệp vụ
export const STATUSES = [
  { key: 'cho_xac_nhan', label: 'Chờ xác nhận', tone: 'gray' },
  { key: 'da_xac_nhan', label: 'Đã xác nhận lịch', tone: 'blue' },
  { key: 'da_tiep_nhan', label: 'Đã tiếp nhận máy', tone: 'blue' },
  { key: 'dang_sua', label: 'Đang sửa chữa', tone: 'amber' },
  { key: 'cho_linh_kien', label: 'Chờ linh kiện', tone: 'amber' },
  { key: 'hoan_thanh', label: 'Sửa xong, chờ nhận máy', tone: 'green' },
  { key: 'da_tra_may', label: 'Đã trả máy', tone: 'green' },
  { key: 'da_huy', label: 'Đã hủy', tone: 'red' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s]));

// Trạng thái kỹ thuật viên được phép chuyển sang
export const TECH_STATUSES = ['da_tiep_nhan', 'dang_sua', 'cho_linh_kien', 'hoan_thanh'];

// Các bước hiển thị trên thanh tiến độ cho khách hàng
export const PROGRESS_STEPS = ['cho_xac_nhan', 'da_xac_nhan', 'da_tiep_nhan', 'dang_sua', 'hoan_thanh', 'da_tra_may'];

export const TIME_SLOTS = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30', '18:00'];
export const SLOT_CAPACITY = 3;

export const DEVICE_BRANDS = ['Asus', 'Acer', 'Dell', 'HP', 'Lenovo', 'MSI', 'Apple MacBook', 'Gigabyte', 'LG', 'Khác'];

export const ISSUE_TYPES = [
  'Không lên nguồn',
  'Màn hình hỏng / sọc',
  'Bàn phím / touchpad lỗi',
  'Pin chai, sạc không vào',
  'Máy chạy chậm, cài lại Windows',
  'Quá nhiệt, quạt kêu',
  'Vệ sinh, tra keo tản nhiệt',
  'Nâng cấp RAM / SSD',
  'Vào nước',
  'Khác',
];

export const PART_CATEGORIES = ['Màn hình', 'Bàn phím', 'Pin', 'Sạc', 'RAM', 'SSD', 'Quạt tản nhiệt', 'Mainboard', 'Dịch vụ', 'Khác'];

export const ROLES = {
  customer: 'Khách hàng',
  technician: 'Kỹ thuật viên',
  admin: 'Quản lý',
};

export const HOME_BY_ROLE = {
  customer: '/khach-hang/lich-hen',
  technician: '/ktv',
  admin: '/admin',
};

export const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${formatDate(date)}`;
};

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const isValidPhone = (p) => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test((p || '').replace(/\s/g, ''));
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

// Bộ dữ liệu mẫu lưu trong localStorage, dùng khi chưa cấu hình Supabase.
// Hàm nào cũng trả về Promise để giao diện dùng chung với supabaseApi.
import { SLOT_CAPACITY, todayISO } from '../lib/constants';

const DB_KEY = 'pvhc_demo_db_v1';
const SESSION_KEY = 'pvhc_demo_session_v1';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));
const addDays = (n) => {
  const d = new Date(todayISO());
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const isoAgo = (days, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();

export const makeCode = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `PV${ymd}${Math.floor(1000 + Math.random() * 9000)}`;
};

function seed() {
  const profiles = [
    { id: 'u-admin', full_name: 'Nguyễn Quản Lý', email: 'admin@phongvu.demo', phone: '0901000001', role: 'admin', password: '123456' },
    { id: 'u-ktv1', full_name: 'Trần Văn Kỹ', email: 'ktv1@phongvu.demo', phone: '0901000002', role: 'technician', password: '123456' },
    { id: 'u-ktv2', full_name: 'Lê Minh Thuật', email: 'ktv2@phongvu.demo', phone: '0901000003', role: 'technician', password: '123456' },
    { id: 'u-kh1', full_name: 'Phạm Thị Lan', email: 'khach@phongvu.demo', phone: '0912345678', role: 'customer', password: '123456' },
  ];
  const branches = [
    { id: 'b1', name: 'Help Center Quận 10', address: '264 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM' },
    { id: 'b2', name: 'Help Center Quận 1', address: '132 Nguyễn Thị Minh Khai, Quận 1, TP.HCM' },
    { id: 'b3', name: 'Help Center Thủ Đức', address: '15 Võ Văn Ngân, TP. Thủ Đức, TP.HCM' },
  ];
  const parts = [
    { id: 'p1', name: 'Màn hình 15.6" FHD IPS 144Hz', category: 'Màn hình', price: 2450000, stock: 6 },
    { id: 'p2', name: 'Màn hình 14" FHD IPS', category: 'Màn hình', price: 1850000, stock: 4 },
    { id: 'p3', name: 'Bàn phím Asus TUF F15', category: 'Bàn phím', price: 650000, stock: 8 },
    { id: 'p4', name: 'Pin Dell Latitude 3 cell', category: 'Pin', price: 890000, stock: 5 },
    { id: 'p5', name: 'Sạc Lenovo 65W USB-C', category: 'Sạc', price: 450000, stock: 12 },
    { id: 'p6', name: 'RAM DDR4 8GB 3200MHz', category: 'RAM', price: 520000, stock: 20 },
    { id: 'p7', name: 'SSD NVMe 512GB', category: 'SSD', price: 1090000, stock: 15 },
    { id: 'p8', name: 'Quạt tản nhiệt MSI GF63', category: 'Quạt tản nhiệt', price: 380000, stock: 3 },
    { id: 'p9', name: 'Vệ sinh + tra keo tản nhiệt', category: 'Dịch vụ', price: 250000, stock: 999 },
    { id: 'p10', name: 'Cài đặt Windows + driver', category: 'Dịch vụ', price: 150000, stock: 999 },
  ];
  const mk = (o) => ({
    id: uid(), customer_id: null, email: '', note: '', technician_id: null,
    created_at: isoAgo(o.ago || 0, 2), updated_at: isoAgo(o.ago || 0, 1), ...o,
  });
  const bookings = [
    mk({ code: 'PV2610281234', customer_id: 'u-kh1', customer_name: 'Phạm Thị Lan', phone: '0912345678', email: 'khach@phongvu.demo', branch_id: 'b1', brand: 'Asus', model: 'TUF Gaming F15', issue_type: 'Màn hình hỏng / sọc', description: 'Màn hình bị sọc ngang sau khi rơi nhẹ', appointment_date: addDays(-5), time_slot: '09:30', status: 'dang_sua', technician_id: 'u-ktv1', ago: 6 }),
    mk({ code: 'PV2610305521', customer_id: 'u-kh1', customer_name: 'Phạm Thị Lan', phone: '0912345678', email: 'khach@phongvu.demo', branch_id: 'b1', brand: 'Dell', model: 'Latitude 5420', issue_type: 'Pin chai, sạc không vào', description: 'Pin chỉ giữ được 20 phút', appointment_date: addDays(-3), time_slot: '13:30', status: 'hoan_thanh', technician_id: 'u-ktv2', ago: 4 }),
    mk({ code: 'PV2611017788', customer_name: 'Võ Thành Nam', phone: '0987654321', branch_id: 'b2', brand: 'Lenovo', model: 'ThinkPad E14', issue_type: 'Máy chạy chậm, cài lại Windows', description: 'Máy khởi động mất 5 phút', appointment_date: addDays(0), time_slot: '11:00', status: 'da_xac_nhan', technician_id: 'u-ktv1', ago: 1 }),
    mk({ code: 'PV2611024410', customer_name: 'Đỗ Mỹ Linh', phone: '0938111222', branch_id: 'b1', brand: 'MSI', model: 'GF63 Thin', issue_type: 'Quá nhiệt, quạt kêu', description: 'Quạt kêu to khi chơi game', appointment_date: addDays(1), time_slot: '15:00', status: 'cho_xac_nhan', ago: 0 }),
    mk({ code: 'PV2611029001', customer_name: 'Hoàng Gia Bảo', phone: '0909555666', branch_id: 'b3', brand: 'HP', model: 'Pavilion 15', issue_type: 'Không lên nguồn', description: 'Cắm sạc đèn sáng nhưng không lên', appointment_date: addDays(2), time_slot: '08:00', status: 'cho_xac_nhan', ago: 0 }),
    mk({ code: 'PV2610259930', customer_name: 'Ngô Quốc Huy', phone: '0977333444', branch_id: 'b2', brand: 'Acer', model: 'Aspire 7', issue_type: 'Nâng cấp RAM / SSD', description: 'Nâng cấp thêm 8GB RAM', appointment_date: addDays(-8), time_slot: '16:30', status: 'da_tra_may', technician_id: 'u-ktv2', ago: 9 }),
    mk({ code: 'PV2610293377', customer_name: 'Trịnh Bảo Ngọc', phone: '0966777888', branch_id: 'b1', brand: 'Asus', model: 'Vivobook 14', issue_type: 'Bàn phím / touchpad lỗi', description: 'Liệt vài phím hàng trên', appointment_date: addDays(-4), time_slot: '09:30', status: 'cho_linh_kien', technician_id: 'u-ktv1', ago: 5 }),
  ];
  const logs = [];
  const flow = ['cho_xac_nhan', 'da_xac_nhan', 'da_tiep_nhan', 'dang_sua', 'hoan_thanh', 'da_tra_may'];
  bookings.forEach((b) => {
    const target = b.status === 'cho_linh_kien' ? 'dang_sua' : b.status;
    const idx = flow.indexOf(target);
    flow.slice(0, idx + 1).forEach((s, i) => logs.push({ id: uid(), booking_id: b.id, status: s, note: '', changed_by: null, created_at: isoAgo(Math.max((b.ago || 0) - i, 0), 6 - i) }));
    if (b.status === 'cho_linh_kien') logs.push({ id: uid(), booking_id: b.id, status: 'cho_linh_kien', note: 'Đặt bàn phím thay thế, dự kiến 2 ngày', changed_by: 'u-ktv1', created_at: isoAgo(1) });
  });
  const quotes = [
    { id: uid(), booking_id: bookings[0].id, part_id: 'p1', description: 'Màn hình 15.6" FHD IPS 144Hz', quantity: 1, unit_price: 2450000 },
    { id: uid(), booking_id: bookings[0].id, part_id: null, description: 'Công thay màn hình', quantity: 1, unit_price: 200000 },
    { id: uid(), booking_id: bookings[1].id, part_id: 'p4', description: 'Pin Dell Latitude 3 cell', quantity: 1, unit_price: 890000 },
    { id: uid(), booking_id: bookings[5].id, part_id: 'p6', description: 'RAM DDR4 8GB 3200MHz', quantity: 1, unit_price: 520000 },
    { id: uid(), booking_id: bookings[6].id, part_id: 'p3', description: 'Bàn phím Asus TUF F15', quantity: 1, unit_price: 650000 },
  ];
  return { profiles, branches, parts, bookings, logs, quotes };
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* bỏ qua, tạo lại dữ liệu mẫu */ }
  const db = seed();
  save(db);
  return db;
}
function save(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* bộ nhớ đầy hoặc bị chặn */ }
}
const publicProfile = (p) => p && { id: p.id, full_name: p.full_name, email: p.email, phone: p.phone, role: p.role };

function withRelations(db, b) {
  return {
    ...b,
    branch: db.branches.find((x) => x.id === b.branch_id) || null,
    technician: publicProfile(db.profiles.find((x) => x.id === b.technician_id)) || null,
  };
}

export const mockApi = {
  mode: 'demo',

  resetDemo() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  // ---------- Xác thực ----------
  async getCurrentUser() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return publicProfile(load().profiles.find((p) => p.id === id)) || null;
  },
  async signIn(email, password) {
    await wait();
    const p = load().profiles.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!p || p.password !== password) throw new Error('Email hoặc mật khẩu không đúng.');
    localStorage.setItem(SESSION_KEY, p.id);
    return publicProfile(p);
  },
  async signUp({ full_name, email, phone, password }) {
    await wait();
    const db = load();
    if (db.profiles.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) throw new Error('Email này đã được đăng ký.');
    const p = { id: uid(), full_name, email: email.trim(), phone, password, role: 'customer' };
    db.profiles.push(p);
    save(db);
    localStorage.setItem(SESSION_KEY, p.id);
    return publicProfile(p);
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ---------- Danh mục ----------
  async getBranches() { return load().branches; },
  async listTechnicians() { return load().profiles.filter((p) => p.role === 'technician').map(publicProfile); },

  async getSlotUsage(branch_id, date) {
    const usage = {};
    load().bookings
      .filter((b) => b.branch_id === branch_id && b.appointment_date === date && b.status !== 'da_huy')
      .forEach((b) => { usage[b.time_slot] = (usage[b.time_slot] || 0) + 1; });
    return usage;
  },

  // ---------- Lịch hẹn ----------
  async createBooking(input) {
    await wait(250);
    const db = load();
    const used = db.bookings.filter((b) => b.branch_id === input.branch_id && b.appointment_date === input.appointment_date && b.time_slot === input.time_slot && b.status !== 'da_huy').length;
    if (used >= SLOT_CAPACITY) throw new Error('Khung giờ này vừa kín chỗ, vui lòng chọn giờ khác.');
    const now = new Date().toISOString();
    const b = { id: uid(), code: makeCode(), status: 'cho_xac_nhan', technician_id: null, note: '', created_at: now, updated_at: now, ...input };
    db.bookings.push(b);
    db.logs.push({ id: uid(), booking_id: b.id, status: 'cho_xac_nhan', note: 'Khách hàng đặt lịch online', changed_by: input.customer_id || null, created_at: now });
    save(db);
    return withRelations(db, b);
  },

  async trackBooking(code, phone) {
    await wait();
    const db = load();
    const b = db.bookings.find((x) => x.code.toUpperCase() === code.trim().toUpperCase() && x.phone.replace(/\s/g, '') === phone.replace(/\s/g, ''));
    if (!b) return null;
    return this._detail(db, b);
  },

  async getBooking(id) {
    const db = load();
    const b = db.bookings.find((x) => x.id === id);
    return b ? this._detail(db, b) : null;
  },

  _detail(db, b) {
    return {
      ...withRelations(db, b),
      logs: db.logs.filter((l) => l.booking_id === b.id).sort((a, c) => a.created_at.localeCompare(c.created_at)),
      quote_items: db.quotes.filter((q) => q.booking_id === b.id),
    };
  },

  async listMyBookings(user) {
    const db = load();
    return db.bookings
      .filter((b) => b.customer_id === user.id || b.phone === user.phone)
      .sort((a, c) => c.created_at.localeCompare(a.created_at))
      .map((b) => withRelations(db, b));
  },

  async listBookings() {
    const db = load();
    return db.bookings.sort((a, c) => c.created_at.localeCompare(a.created_at)).map((b) => withRelations(db, b));
  },

  async listTechJobs(techId) {
    const db = load();
    return db.bookings
      .filter((b) => b.technician_id === techId)
      .sort((a, c) => (a.appointment_date + a.time_slot).localeCompare(c.appointment_date + c.time_slot))
      .map((b) => withRelations(db, b));
  },

  async assignTechnician(bookingId, techId, userId) {
    await wait();
    const db = load();
    const b = db.bookings.find((x) => x.id === bookingId);
    b.technician_id = techId || null;
    b.updated_at = new Date().toISOString();
    if (techId && b.status === 'cho_xac_nhan') {
      b.status = 'da_xac_nhan';
      const tech = db.profiles.find((p) => p.id === techId);
      db.logs.push({ id: uid(), booking_id: b.id, status: 'da_xac_nhan', note: `Phân công KTV ${tech?.full_name || ''}`, changed_by: userId, created_at: b.updated_at });
    }
    save(db);
    return withRelations(db, b);
  },

  async updateStatus(bookingId, status, note, userId) {
    await wait();
    const db = load();
    const b = db.bookings.find((x) => x.id === bookingId);
    b.status = status;
    b.updated_at = new Date().toISOString();
    db.logs.push({ id: uid(), booking_id: b.id, status, note: note || '', changed_by: userId, created_at: b.updated_at });
    save(db);
    return this._detail(db, b);
  },

  async saveQuote(bookingId, items) {
    await wait();
    const db = load();
    db.quotes = db.quotes.filter((q) => q.booking_id !== bookingId);
    items.forEach((it) => db.quotes.push({ id: uid(), booking_id: bookingId, part_id: it.part_id || null, description: it.description, quantity: Number(it.quantity) || 1, unit_price: Number(it.unit_price) || 0 }));
    save(db);
    return db.quotes.filter((q) => q.booking_id === bookingId);
  },

  // ---------- Linh kiện ----------
  async listParts() { return load().parts.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)); },
  async savePart(part) {
    await wait();
    const db = load();
    if (part.id) {
      const i = db.parts.findIndex((p) => p.id === part.id);
      db.parts[i] = { ...db.parts[i], ...part };
    } else {
      db.parts.push({ ...part, id: uid() });
    }
    save(db);
  },
  async deletePart(id) {
    const db = load();
    db.parts = db.parts.filter((p) => p.id !== id);
    save(db);
  },

  // ---------- Thống kê ----------
  async getStatsSource() {
    const db = load();
    return { bookings: db.bookings, quotes: db.quotes, technicians: db.profiles.filter((p) => p.role === 'technician').map(publicProfile) };
  },
};

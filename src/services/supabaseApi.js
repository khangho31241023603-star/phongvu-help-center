// Cài đặt cùng giao diện với mockApi nhưng đọc/ghi Supabase thật.
// Tên bảng và cột khớp với file supabase/schema.sql (đề xuất cho BE).
import { supabase } from './supabaseClient';
import { makeCode } from './mockApi';

const BOOKING_SELECT = '*, branch:branches(*), technician:profiles!bookings_technician_id_fkey(id, full_name, email, phone, role)';

const must = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

async function getProfile(userId) {
  return must(await supabase.from('profiles').select('id, full_name, email, phone, role').eq('id', userId).single());
}

export const supabaseApi = {
  mode: 'supabase',
  resetDemo() {},

  // ---------- Xác thực ----------
  async getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    return user ? getProfile(user.id) : null;
  },
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error('Email hoặc mật khẩu không đúng.');
    return getProfile(data.user.id);
  },
  async signUp({ full_name, email, phone, password }) {
    // Trigger handle_new_user trong schema.sql tự tạo dòng profiles với role customer
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name, phone } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản rồi đăng nhập.');
    return getProfile(data.user.id);
  },
  async signOut() {
    await supabase.auth.signOut();
  },

  // ---------- Danh mục ----------
  async getBranches() {
    return must(await supabase.from('branches').select('*').order('name'));
  },
  async listTechnicians() {
    return must(await supabase.from('profiles').select('id, full_name, email, phone, role').eq('role', 'technician').order('full_name'));
  },
  async getSlotUsage(branch_id, date) {
    const rows = must(await supabase.rpc('get_slot_usage', { p_branch_id: branch_id, p_date: date }));
    return Object.fromEntries((rows || []).map((r) => [r.time_slot, Number(r.total)]));
  },

  // ---------- Lịch hẹn ----------
  async createBooking(input) {
    const code = makeCode();
    must(await supabase.from('bookings').insert({ ...input, code, status: 'cho_xac_nhan' }));
    // Khách vãng lai không có quyền đọc bảng bookings nên tra lại qua RPC
    return this.trackBooking(code, input.phone);
  },
  async trackBooking(code, phone) {
    const data = must(await supabase.rpc('track_booking', { p_code: code.trim().toUpperCase(), p_phone: phone.replace(/\s/g, '') }));
    return data || null;
  },
  async getBooking(id) {
    const b = must(await supabase.from('bookings').select(BOOKING_SELECT).eq('id', id).maybeSingle());
    if (!b) return null;
    const [logs, quote_items] = await Promise.all([
      supabase.from('booking_logs').select('*').eq('booking_id', id).order('created_at'),
      supabase.from('quote_items').select('*').eq('booking_id', id),
    ]);
    return { ...b, logs: must(logs), quote_items: must(quote_items) };
  },
  async listMyBookings(user) {
    return must(await supabase.from('bookings').select(BOOKING_SELECT).or(`customer_id.eq.${user.id},phone.eq.${user.phone}`).order('created_at', { ascending: false }));
  },
  async listBookings() {
    return must(await supabase.from('bookings').select(BOOKING_SELECT).order('created_at', { ascending: false }));
  },
  async listTechJobs(techId) {
    return must(await supabase.from('bookings').select(BOOKING_SELECT).eq('technician_id', techId).order('appointment_date').order('time_slot'));
  },
  async assignTechnician(bookingId, techId, userId) {
    const current = must(await supabase.from('bookings').select('status').eq('id', bookingId).single());
    const patch = { technician_id: techId || null, updated_at: new Date().toISOString() };
    const confirm = techId && current.status === 'cho_xac_nhan';
    if (confirm) patch.status = 'da_xac_nhan';
    must(await supabase.from('bookings').update(patch).eq('id', bookingId));
    if (confirm) {
      must(await supabase.from('booking_logs').insert({ booking_id: bookingId, status: 'da_xac_nhan', note: 'Đã phân công kỹ thuật viên', changed_by: userId }));
    }
  },
  async updateStatus(bookingId, status, note, userId) {
    must(await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', bookingId));
    must(await supabase.from('booking_logs').insert({ booking_id: bookingId, status, note: note || '', changed_by: userId }));
    return this.getBooking(bookingId);
  },
  async saveQuote(bookingId, items) {
    must(await supabase.from('quote_items').delete().eq('booking_id', bookingId));
    if (items.length) {
      must(await supabase.from('quote_items').insert(items.map((it) => ({
        booking_id: bookingId,
        part_id: it.part_id || null,
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0,
      }))));
    }
    return must(await supabase.from('quote_items').select('*').eq('booking_id', bookingId));
  },

  // ---------- Linh kiện ----------
  async listParts() {
    return must(await supabase.from('parts').select('*').order('category').order('name'));
  },
  async savePart(part) {
    const { id, ...rest } = part;
    if (id) must(await supabase.from('parts').update(rest).eq('id', id));
    else must(await supabase.from('parts').insert(rest));
  },
  async deletePart(id) {
    must(await supabase.from('parts').delete().eq('id', id));
  },

  // ---------- Thống kê ----------
  async getStatsSource() {
    const [bookings, quotes, technicians] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('quote_items').select('*'),
      this.listTechnicians(),
    ]);
    return { bookings: must(bookings), quotes: must(quotes), technicians };
  },
};

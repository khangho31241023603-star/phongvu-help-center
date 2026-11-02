import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  DEVICE_BRANDS, ISSUE_TYPES, SLOT_CAPACITY, TIME_SLOTS,
  formatDate, isValidEmail, isValidPhone, todayISO,
} from '../lib/constants';

const empty = {
  customer_name: '', phone: '', email: '',
  branch_id: '', appointment_date: todayISO(), time_slot: '',
  brand: '', model: '', issue_type: '', description: '',
};

const slotPassed = (date, slot) => {
  if (date !== todayISO()) return false;
  const [h, m] = slot.split(':').map(Number);
  const now = new Date();
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30;
};

export default function Booking() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [usage, setUsage] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getBranches().then((b) => {
      setBranches(b);
      setForm((f) => ({ ...f, branch_id: f.branch_id || b[0]?.id || '' }));
    });
  }, []);

  useEffect(() => {
    if (user && user.role === 'customer') {
      setForm((f) => ({ ...f, customer_name: f.customer_name || user.full_name, phone: f.phone || user.phone || '', email: f.email || user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!form.branch_id || !form.appointment_date) return;
    api.getSlotUsage(form.branch_id, form.appointment_date).then(setUsage).catch(() => setUsage({}));
  }, [form.branch_id, form.appointment_date]);

  const maxDate = useMemo(() => {
    const d = new Date(todayISO());
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v, ...(k === 'appointment_date' || k === 'branch_id' ? { time_slot: '' } : {}) }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.customer_name.trim().length < 2) er.customer_name = 'Vui lòng nhập họ tên.';
    if (!isValidPhone(form.phone)) er.phone = 'Số điện thoại chưa đúng định dạng (10 số, bắt đầu bằng 0).';
    if (form.email && !isValidEmail(form.email)) er.email = 'Email chưa đúng định dạng.';
    if (!form.branch_id) er.branch_id = 'Vui lòng chọn chi nhánh.';
    if (!form.appointment_date || form.appointment_date < todayISO()) er.appointment_date = 'Ngày hẹn không hợp lệ.';
    if (!form.time_slot) er.time_slot = 'Vui lòng chọn khung giờ.';
    if (!form.brand) er.brand = 'Vui lòng chọn hãng máy.';
    if (!form.issue_type) er.issue_type = 'Vui lòng chọn tình trạng lỗi.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        ...form,
        customer_name: form.customer_name.trim(),
        phone: form.phone.replace(/\s/g, ''),
        customer_id: user?.role === 'customer' ? user.id : null,
      });
      setResult(booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="container narrow section">
        <div className="card success-card">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h1>Đặt lịch thành công</h1>
          <p className="muted">Vui lòng lưu lại mã lịch hẹn để tra cứu tiến độ và đọc tại quầy khi mang máy đến.</p>
          <div className="code-box" data-testid="booking-code">{result.code}</div>
          <dl className="info-list">
            <div><dt>Khách hàng</dt><dd>{result.customer_name} · {result.phone}</dd></div>
            <div><dt>Chi nhánh</dt><dd>{result.branch?.name}</dd></div>
            <div><dt>Thời gian</dt><dd>{result.time_slot} ngày {formatDate(result.appointment_date)}</dd></div>
            <div><dt>Thiết bị</dt><dd>{result.brand} {result.model}</dd></div>
            <div><dt>Tình trạng</dt><dd>{result.issue_type}</dd></div>
          </dl>
          <div className="row-actions center">
            <Link className="btn btn-primary" to={`/tra-cuu?ma=${result.code}&sdt=${result.phone}`}>Xem tiến độ</Link>
            <button className="btn btn-outline" onClick={() => { setResult(null); setForm({ ...empty, branch_id: branches[0]?.id || '' }); }}>Đặt lịch khác</button>
          </div>
        </div>
      </div>
    );
  }

  const Err = ({ k }) => (errors[k] ? <small className="error-text">{errors[k]}</small> : null);

  return (
    <div className="container section">
      <div className="page-head">
        <h1>Đặt lịch sửa chữa</h1>
        <p className="muted">Điền thông tin bên dưới, cửa hàng sẽ xác nhận và phân công kỹ thuật viên cho bạn.</p>
      </div>

      <form className="booking-layout" onSubmit={submit} noValidate>
        <div className="booking-form">
          <fieldset className="card">
            <legend>1. Thông tin liên hệ</legend>
            <div className="grid-2">
              <label className="field">
                <span>Họ và tên *</span>
                <input name="customer_name" value={form.customer_name} onChange={set('customer_name')} placeholder="Nguyễn Văn A" />
                <Err k="customer_name" />
              </label>
              <label className="field">
                <span>Số điện thoại *</span>
                <input name="phone" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="09xxxxxxxx" />
                <Err k="phone" />
              </label>
              <label className="field span-2">
                <span>Email (không bắt buộc)</span>
                <input name="email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                <Err k="email" />
              </label>
            </div>
          </fieldset>

          <fieldset className="card">
            <legend>2. Thiết bị và tình trạng</legend>
            <div className="grid-2">
              <label className="field">
                <span>Hãng máy *</span>
                <select name="brand" value={form.brand} onChange={set('brand')}>
                  <option value="">Chọn hãng</option>
                  {DEVICE_BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
                <Err k="brand" />
              </label>
              <label className="field">
                <span>Dòng máy / model</span>
                <input name="model" value={form.model} onChange={set('model')} placeholder="VD: TUF Gaming F15" />
              </label>
              <label className="field span-2">
                <span>Tình trạng lỗi *</span>
                <select name="issue_type" value={form.issue_type} onChange={set('issue_type')}>
                  <option value="">Chọn tình trạng</option>
                  {ISSUE_TYPES.map((i) => <option key={i}>{i}</option>)}
                </select>
                <Err k="issue_type" />
              </label>
              <label className="field span-2">
                <span>Mô tả thêm</span>
                <textarea name="description" rows={3} value={form.description} onChange={set('description')} placeholder="Máy bị từ khi nào, đã thử cách nào..." />
              </label>
            </div>
          </fieldset>

          <fieldset className="card">
            <legend>3. Chi nhánh và thời gian</legend>
            <div className="branch-list" role="radiogroup" aria-label="Chi nhánh">
              {branches.map((b) => (
                <label key={b.id} className={form.branch_id === b.id ? 'branch-option selected' : 'branch-option'}>
                  <input type="radio" name="branch_id" value={b.id} checked={form.branch_id === b.id} onChange={set('branch_id')} />
                  <strong>{b.name}</strong>
                  <span className="muted">{b.address}</span>
                </label>
              ))}
            </div>
            <Err k="branch_id" />

            <label className="field date-field">
              <span>Ngày hẹn *</span>
              <input name="appointment_date" type="date" min={todayISO()} max={maxDate} value={form.appointment_date} onChange={set('appointment_date')} />
              <Err k="appointment_date" />
            </label>

            <div className="field">
              <span>Khung giờ * <small className="muted">(mỗi khung nhận tối đa {SLOT_CAPACITY} máy)</small></span>
              <div className="slots">
                {TIME_SLOTS.map((s) => {
                  const used = usage[s] || 0;
                  const full = used >= SLOT_CAPACITY;
                  const passed = slotPassed(form.appointment_date, s);
                  const disabled = full || passed;
                  return (
                    <button
                      type="button"
                      key={s}
                      className={form.time_slot === s ? 'slot selected' : 'slot'}
                      disabled={disabled}
                      onClick={() => { setForm((f) => ({ ...f, time_slot: s })); setErrors((er) => ({ ...er, time_slot: undefined })); }}
                    >
                      <strong>{s}</strong>
                      <small>{passed ? 'Đã qua' : full ? 'Hết chỗ' : `Còn ${SLOT_CAPACITY - used}`}</small>
                    </button>
                  );
                })}
              </div>
              <Err k="time_slot" />
            </div>
          </fieldset>
        </div>

        <aside className="card summary">
          <h3>Tóm tắt lịch hẹn</h3>
          <dl className="info-list">
            <div><dt>Chi nhánh</dt><dd>{branches.find((b) => b.id === form.branch_id)?.name || '...'}</dd></div>
            <div><dt>Ngày</dt><dd>{formatDate(form.appointment_date) || '...'}</dd></div>
            <div><dt>Giờ</dt><dd>{form.time_slot || '...'}</dd></div>
            <div><dt>Thiết bị</dt><dd>{[form.brand, form.model].filter(Boolean).join(' ') || '...'}</dd></div>
            <div><dt>Tình trạng</dt><dd>{form.issue_type || '...'}</dd></div>
          </dl>
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {Object.values(errors).some(Boolean) && <div className="alert alert-error">Vui lòng kiểm tra lại các trường được đánh dấu.</div>}
          <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
          </button>
          <p className="muted small">Kiểm tra máy miễn phí. Bạn chỉ trả phí khi đồng ý báo giá.</p>
        </aside>
      </form>
    </div>
  );
}

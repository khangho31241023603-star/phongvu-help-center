import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate, formatDateTime } from '../lib/constants';
import StatusBadge from '../components/StatusBadge';
import ProgressTracker from '../components/ProgressTracker';
import QuoteTable from '../components/QuoteTable';

export default function Tracking() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('ma') || '');
  const [phone, setPhone] = useState(params.get('sdt') || '');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (c = code, p = phone) => {
    setError('');
    setBooking(null);
    if (!c.trim() || !p.trim()) {
      setError('Vui lòng nhập đủ mã lịch hẹn và số điện thoại.');
      return;
    }
    setLoading(true);
    try {
      const b = await api.trackBooking(c, p);
      if (!b) setError('Không tìm thấy lịch hẹn. Kiểm tra lại mã và số điện thoại đã dùng khi đặt lịch.');
      else {
        setBooking(b);
        setParams({ ma: c.trim(), sdt: p.trim() }, { replace: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get('ma') && params.get('sdt')) lookup(params.get('ma'), params.get('sdt'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container section">
      <div className="page-head">
        <h1>Tra cứu tiến độ sửa chữa</h1>
        <p className="muted">Nhập mã lịch hẹn và số điện thoại đã dùng khi đặt lịch.</p>
      </div>

      <form className="card track-form" onSubmit={(e) => { e.preventDefault(); lookup(); }}>
        <label className="field">
          <span>Mã lịch hẹn</span>
          <input name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PV2610281234" />
        </label>
        <label className="field">
          <span>Số điện thoại</span>
          <input name="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Đang tìm...' : 'Tra cứu'}</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {booking && (
        <div className="track-result">
          <div className="card">
            <div className="card-head">
              <div>
                <span className="muted small">Mã lịch hẹn</span>
                <h2 className="mono">{booking.code}</h2>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <ProgressTracker status={booking.status} logs={booking.logs} />
          </div>

          <div className="grid-2 align-start">
            <div className="card">
              <h3>Thông tin lịch hẹn</h3>
              <dl className="info-list">
                <div><dt>Khách hàng</dt><dd>{booking.customer_name}</dd></div>
                <div><dt>Chi nhánh</dt><dd>{booking.branch?.name}</dd></div>
                <div><dt>Lịch hẹn</dt><dd>{booking.time_slot} ngày {formatDate(booking.appointment_date)}</dd></div>
                <div><dt>Thiết bị</dt><dd>{booking.brand} {booking.model}</dd></div>
                <div><dt>Tình trạng</dt><dd>{booking.issue_type}</dd></div>
                <div><dt>Kỹ thuật viên</dt><dd>{booking.technician?.full_name || 'Chưa phân công'}</dd></div>
                <div><dt>Cập nhật lúc</dt><dd>{formatDateTime(booking.updated_at)}</dd></div>
              </dl>
            </div>
            <div className="card">
              <h3>Báo giá sửa chữa</h3>
              <QuoteTable items={booking.quote_items} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

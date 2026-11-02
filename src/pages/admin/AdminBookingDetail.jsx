import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { STATUSES, STATUS_MAP, formatDate, formatDateTime } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';
import QuoteEditor from '../../components/QuoteEditor';
import Loading, { EmptyState } from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [b, setB] = useState(undefined);
  const [techs, setTechs] = useState([]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => api.getBooking(id).then(setB), [id]);
  useEffect(() => { load(); api.listTechnicians().then(setTechs); }, [load]);

  if (b === undefined) return <Loading />;
  if (!b) return <EmptyState title="Không tìm thấy lịch hẹn"><Link to="/admin/lich-hen" className="btn btn-outline">Quay lại</Link></EmptyState>;

  const assign = async (techId) => {
    await api.assignTechnician(b.id, techId, user.id);
    toast('Đã cập nhật phân công');
    load();
  };

  const changeStatus = async (e) => {
    e.preventDefault();
    if (!status) return;
    if (status === 'da_huy' && !note.trim()) {
      toast('Vui lòng ghi lý do hủy.', 'error');
      return;
    }
    await api.updateStatus(b.id, status, note.trim(), user.id);
    toast(`Đã chuyển sang: ${STATUS_MAP[status].label}`);
    setStatus('');
    setNote('');
    load();
  };

  return (
    <>
      <Link to="/admin/lich-hen" className="back-link">← Danh sách lịch hẹn</Link>
      <div className="page-head row-between">
        <div>
          <h1 className="mono">{b.code}</h1>
          <p className="muted">Tạo lúc {formatDateTime(b.created_at)}</p>
        </div>
        <StatusBadge status={b.status} />
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="card">
            <h3>Phân công và trạng thái</h3>
            <label className="field">
              <span>Kỹ thuật viên phụ trách</span>
              <select value={b.technician_id || ''} onChange={(e) => assign(e.target.value)}>
                <option value="">Chưa phân công</option>
                {techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </label>
            <form onSubmit={changeStatus} className="inline-form">
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Trạng thái mới">
                <option value="">Chuyển trạng thái...</option>
                {STATUSES.filter((s) => s.key !== b.status).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (bắt buộc khi hủy)" aria-label="Ghi chú" />
              <button className="btn btn-primary btn-sm" disabled={!status}>Lưu</button>
            </form>
          </div>
          <div className="card">
            <h3>Báo giá</h3>
            <QuoteEditor bookingId={b.id} initial={b.quote_items} readOnly={b.status === 'da_huy'} onSaved={load} />
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <h3>Thông tin</h3>
            <dl className="info-list">
              <div><dt>Khách hàng</dt><dd>{b.customer_name}</dd></div>
              <div><dt>Điện thoại</dt><dd>{b.phone}</dd></div>
              {b.email && <div><dt>Email</dt><dd>{b.email}</dd></div>}
              <div><dt>Lịch hẹn</dt><dd>{b.time_slot} ngày {formatDate(b.appointment_date)}</dd></div>
              <div><dt>Chi nhánh</dt><dd>{b.branch?.name}</dd></div>
              <div><dt>Thiết bị</dt><dd>{b.brand} {b.model}</dd></div>
              <div><dt>Tình trạng</dt><dd>{b.issue_type}</dd></div>
              <div><dt>Mô tả</dt><dd>{b.description || 'Không có'}</dd></div>
            </dl>
          </div>
          <div className="card">
            <h3>Tiến độ</h3>
            <ProgressTracker status={b.status} logs={b.logs} />
          </div>
        </div>
      </div>
    </>
  );
}

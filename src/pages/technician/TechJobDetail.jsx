import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { STATUS_MAP, TECH_STATUSES, formatDate } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';
import QuoteEditor from '../../components/QuoteEditor';
import Loading, { EmptyState } from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function TechJobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [job, setJob] = useState(undefined);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api.getBooking(id).then((b) => { setJob(b); setStatus(''); setNote(''); }), [id]);
  useEffect(() => { load(); }, [load]);

  if (job === undefined) return <Loading />;
  if (!job || job.technician_id !== user.id) {
    return <EmptyState title="Không tìm thấy công việc hoặc công việc không được giao cho bạn."><Link to="/ktv" className="btn btn-outline">Quay lại</Link></EmptyState>;
  }

  const locked = ['da_tra_may', 'da_huy'].includes(job.status);

  const submitStatus = async (e) => {
    e.preventDefault();
    if (!status) return;
    if (status === 'cho_linh_kien' && !note.trim()) {
      toast('Vui lòng ghi chú linh kiện đang chờ.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateStatus(job.id, status, note.trim(), user.id);
      setJob(updated);
      setStatus('');
      setNote('');
      toast(`Đã cập nhật: ${STATUS_MAP[status].label}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link to="/ktv" className="back-link">← Danh sách công việc</Link>
      <div className="page-head row-between">
        <div>
          <h1 className="mono">{job.code}</h1>
          <p className="muted">{job.brand} {job.model} · {job.issue_type}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="card">
            <h3>Cập nhật trạng thái</h3>
            {locked ? <p className="muted">Lịch hẹn đã đóng, không thể cập nhật thêm.</p> : (
              <form onSubmit={submitStatus} className="status-form">
                <div className="status-options" role="radiogroup" aria-label="Trạng thái mới">
                  {TECH_STATUSES.map((s) => (
                    <label key={s} className={status === s ? 'status-option selected' : 'status-option'}>
                      <input type="radio" name="status" value={s} checked={status === s} disabled={s === job.status} onChange={() => setStatus(s)} />
                      {STATUS_MAP[s].label}
                    </label>
                  ))}
                </div>
                <label className="field">
                  <span>Ghi chú cho khách hàng</span>
                  <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Đã kiểm tra, lỗi do cáp màn hình" />
                </label>
                <button className="btn btn-primary" disabled={!status || saving}>{saving ? 'Đang lưu...' : 'Cập nhật'}</button>
              </form>
            )}
          </div>

          <div className="card">
            <h3>Báo giá sửa chữa</h3>
            <QuoteEditor bookingId={job.id} initial={job.quote_items} readOnly={locked} onSaved={load} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h3>Thông tin khách hàng</h3>
            <dl className="info-list">
              <div><dt>Họ tên</dt><dd>{job.customer_name}</dd></div>
              <div><dt>Điện thoại</dt><dd><a href={`tel:${job.phone}`}>{job.phone}</a></dd></div>
              <div><dt>Lịch hẹn</dt><dd>{job.time_slot} ngày {formatDate(job.appointment_date)}</dd></div>
              <div><dt>Chi nhánh</dt><dd>{job.branch?.name}</dd></div>
              <div><dt>Mô tả lỗi</dt><dd>{job.description || 'Không có'}</dd></div>
            </dl>
          </div>
          <div className="card">
            <h3>Tiến độ</h3>
            <ProgressTracker status={job.status} logs={job.logs} />
          </div>
        </div>
      </div>
    </>
  );
}

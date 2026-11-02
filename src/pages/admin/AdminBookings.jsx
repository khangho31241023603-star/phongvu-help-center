import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { STATUSES, formatDate } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import Loading, { EmptyState } from '../../components/Loading';
import { useToast } from '../../components/Toast';

export default function AdminBookings() {
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [techs, setTechs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [q, setQ] = useState('');
  const status = params.get('trang-thai') || '';
  const branch = params.get('chi-nhanh') || '';
  const date = params.get('ngay') || '';

  const load = () => api.listBookings().then(setItems);

  useEffect(() => {
    load();
    api.listTechnicians().then(setTechs);
    api.getBranches().then(setBranches);
  }, []);

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return (items || []).filter((b) =>
      (!status || b.status === status)
      && (!branch || b.branch_id === branch)
      && (!date || b.appointment_date === date)
      && (!kw || [b.code, b.customer_name, b.phone, b.brand, b.model].join(' ').toLowerCase().includes(kw)));
  }, [items, q, status, branch, date]);

  const assign = async (b, techId) => {
    try {
      await api.assignTechnician(b.id, techId, user.id);
      const t = techs.find((x) => x.id === techId);
      toast(techId ? `Đã phân công ${t?.full_name} cho ${b.code}` : `Đã bỏ phân công ${b.code}`);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Lịch hẹn và phân công</h1>
        <p className="muted">Xác nhận lịch hẹn bằng cách phân công kỹ thuật viên phụ trách.</p>
      </div>

      <div className="card filters">
        <input className="grow" placeholder="Tìm mã, tên khách, số điện thoại, model..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm kiếm" />
        <select value={status} onChange={(e) => setFilter('trang-thai', e.target.value)} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={branch} onChange={(e) => setFilter('chi-nhanh', e.target.value)} aria-label="Lọc chi nhánh">
          <option value="">Mọi chi nhánh</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setFilter('ngay', e.target.value)} aria-label="Lọc ngày hẹn" />
        {(status || branch || date || q) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setQ(''); setParams({}, { replace: true }); }}>Xóa lọc</button>
        )}
      </div>

      {!items ? <Loading /> : filtered.length === 0 ? <EmptyState title="Không có lịch hẹn phù hợp" /> : (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã</th><th>Khách hàng</th><th>Thiết bị / lỗi</th><th>Lịch hẹn</th><th>Trạng thái</th><th>Kỹ thuật viên</th><th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="mono">{b.code}</td>
                    <td><strong>{b.customer_name}</strong><br /><span className="muted small">{b.phone}</span></td>
                    <td>{b.brand} {b.model}<br /><span className="muted small">{b.issue_type}</span></td>
                    <td>{b.time_slot} · {formatDate(b.appointment_date)}<br /><span className="muted small">{b.branch?.name}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <select
                        className="input-sm"
                        value={b.technician_id || ''}
                        disabled={['da_tra_may', 'da_huy'].includes(b.status)}
                        onChange={(e) => assign(b, e.target.value)}
                        aria-label={`Phân công KTV cho ${b.code}`}
                      >
                        <option value="">Chưa phân công</option>
                        {techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                      </select>
                    </td>
                    <td><Link to={`/admin/lich-hen/${b.id}`} className="btn btn-ghost btn-sm">Chi tiết</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small table-foot">Hiển thị {filtered.length} / {items.length} lịch hẹn</p>
        </div>
      )}
    </>
  );
}

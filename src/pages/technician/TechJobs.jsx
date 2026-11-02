import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate, todayISO } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import Loading, { EmptyState } from '../../components/Loading';

const TABS = [
  { key: 'active', label: 'Đang xử lý', match: (b) => ['da_xac_nhan', 'da_tiep_nhan', 'dang_sua', 'cho_linh_kien'].includes(b.status) },
  { key: 'today', label: 'Lịch hôm nay', match: (b) => b.appointment_date === todayISO() },
  { key: 'done', label: 'Đã hoàn thành', match: (b) => ['hoan_thanh', 'da_tra_may'].includes(b.status) },
  { key: 'all', label: 'Tất cả', match: () => true },
];

export default function TechJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [tab, setTab] = useState('active');

  useEffect(() => { api.listTechJobs(user.id).then(setJobs).catch(() => setJobs([])); }, [user.id]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, (jobs || []).filter(t.match).length])), [jobs]);
  const list = (jobs || []).filter(TABS.find((t) => t.key === tab).match);

  return (
    <>
      <div className="page-head">
        <h1>Công việc được phân công</h1>
        <p className="muted">Chọn một máy để cập nhật trạng thái sửa chữa và lập báo giá.</p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'tab active' : 'tab'} onClick={() => setTab(t.key)}>
            {t.label} <span className="count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      {!jobs ? <Loading /> : list.length === 0 ? (
        <EmptyState title="Không có công việc nào trong mục này" />
      ) : (
        <div className="booking-cards">
          {list.map((b) => (
            <Link key={b.id} to={`/ktv/cong-viec/${b.id}`} className="card booking-card">
              <div className="row-between">
                <span className="mono strong">{b.code}</span>
                <StatusBadge status={b.status} />
              </div>
              <h3>{b.brand} {b.model}</h3>
              <p className="muted">{b.issue_type}</p>
              <div className="meta">
                <span>{b.customer_name} · {b.phone}</span>
                <span>{b.time_slot} · {formatDate(b.appointment_date)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

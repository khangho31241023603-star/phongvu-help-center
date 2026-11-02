import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate } from '../../lib/constants';
import StatusBadge from '../../components/StatusBadge';
import Loading, { EmptyState } from '../../components/Loading';

export default function MyBookings() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.listMyBookings(user).then(setItems).catch(() => setItems([]));
  }, [user]);

  return (
    <div className="container section">
      <div className="page-head row-between">
        <div>
          <h1>Lịch hẹn của tôi</h1>
          <p className="muted">Toàn bộ máy bạn đã gửi sửa tại cửa hàng.</p>
        </div>
        <Link to="/dat-lich" className="btn btn-primary">Đặt lịch mới</Link>
      </div>

      {!items ? <Loading /> : items.length === 0 ? (
        <EmptyState title="Bạn chưa có lịch hẹn nào">
          <Link to="/dat-lich" className="btn btn-primary">Đặt lịch đầu tiên</Link>
        </EmptyState>
      ) : (
        <div className="booking-cards">
          {items.map((b) => (
            <Link key={b.id} to={`/tra-cuu?ma=${b.code}&sdt=${b.phone}`} className="card booking-card">
              <div className="row-between">
                <span className="mono strong">{b.code}</span>
                <StatusBadge status={b.status} />
              </div>
              <h3>{b.brand} {b.model}</h3>
              <p className="muted">{b.issue_type}</p>
              <div className="meta">
                <span>{b.time_slot} · {formatDate(b.appointment_date)}</span>
                <span>{b.branch?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

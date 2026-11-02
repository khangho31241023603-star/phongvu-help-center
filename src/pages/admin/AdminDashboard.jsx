import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { STATUSES, formatMoney, todayISO } from '../../lib/constants';
import Loading from '../../components/Loading';

const lastDays = (n) => Array.from({ length: n }, (_, i) => {
  const d = new Date(todayISO());
  d.setDate(d.getDate() - (n - 1 - i));
  return d.toISOString().slice(0, 10);
});

export default function AdminDashboard() {
  const [src, setSrc] = useState(null);

  useEffect(() => { api.getStatsSource().then(setSrc); }, []);

  const stats = useMemo(() => {
    if (!src) return null;
    const { bookings, quotes, technicians } = src;
    const today = todayISO();
    const active = ['da_xac_nhan', 'da_tiep_nhan', 'dang_sua', 'cho_linh_kien'];
    const doneIds = new Set(bookings.filter((b) => ['hoan_thanh', 'da_tra_may'].includes(b.status)).map((b) => b.id));
    const revenue = quotes.filter((q) => doneIds.has(q.booking_id)).reduce((s, q) => s + q.quantity * q.unit_price, 0);

    const byStatus = STATUSES.map((s) => ({ ...s, count: bookings.filter((b) => b.status === s.key).length }));
    const days = lastDays(7).map((d) => ({ d, count: bookings.filter((b) => b.created_at.slice(0, 10) === d).length }));
    const maxDay = Math.max(1, ...days.map((x) => x.count));

    const partCount = {};
    quotes.filter((q) => q.part_id).forEach((q) => { partCount[q.description] = (partCount[q.description] || 0) + q.quantity; });
    const topParts = Object.entries(partCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const workload = technicians.map((t) => ({
      ...t,
      active: bookings.filter((b) => b.technician_id === t.id && active.includes(b.status)).length,
      done: bookings.filter((b) => b.technician_id === t.id && ['hoan_thanh', 'da_tra_may'].includes(b.status)).length,
    }));

    return {
      total: bookings.length,
      today: bookings.filter((b) => b.appointment_date === today).length,
      pending: bookings.filter((b) => b.status === 'cho_xac_nhan').length,
      inProgress: bookings.filter((b) => active.includes(b.status)).length,
      revenue, byStatus, days, maxDay, topParts, workload,
    };
  }, [src]);

  if (!stats) return <Loading />;

  return (
    <>
      <div className="page-head">
        <h1>Tổng quan</h1>
        <p className="muted">Số liệu lịch hẹn và sửa chữa toàn hệ thống.</p>
      </div>

      <div className="kpis">
        <div className="card kpi"><span>Tổng lịch hẹn</span><strong>{stats.total}</strong></div>
        <div className="card kpi"><span>Lịch hẹn hôm nay</span><strong>{stats.today}</strong></div>
        <Link to="/admin/lich-hen?trang-thai=cho_xac_nhan" className="card kpi kpi-alert"><span>Chờ xác nhận</span><strong>{stats.pending}</strong></Link>
        <div className="card kpi"><span>Đang sửa chữa</span><strong>{stats.inProgress}</strong></div>
        <div className="card kpi"><span>Doanh thu đã hoàn thành</span><strong>{formatMoney(stats.revenue)}</strong></div>
      </div>

      <div className="grid-2 align-start">
        <div className="card">
          <h3>Lịch hẹn mới 7 ngày qua</h3>
          <div className="bar-chart" role="img" aria-label="Biểu đồ số lịch hẹn mới theo ngày">
            {stats.days.map((x) => (
              <div className="bar-col" key={x.d}>
                <span className="bar-val">{x.count}</span>
                <div className="bar" style={{ height: `${(x.count / stats.maxDay) * 100}%` }} />
                <span className="bar-label">{x.d.slice(8, 10)}/{x.d.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Phân bố theo trạng thái</h3>
          <ul className="hbar-list">
            {stats.byStatus.map((s) => (
              <li key={s.key}>
                <span className="hbar-label">{s.label}</span>
                <span className="hbar-track"><span className={`hbar-fill tone-${s.tone}`} style={{ width: `${stats.total ? (s.count / stats.total) * 100 : 0}%` }} /></span>
                <span className="hbar-val">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Khối lượng công việc KTV</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Kỹ thuật viên</th><th className="num">Đang xử lý</th><th className="num">Đã xong</th></tr></thead>
              <tbody>
                {stats.workload.map((t) => (
                  <tr key={t.id}><td>{t.full_name}</td><td className="num">{t.active}</td><td className="num">{t.done}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Linh kiện được báo giá nhiều nhất</h3>
          {stats.topParts.length === 0 ? <p className="muted">Chưa có dữ liệu.</p> : (
            <ol className="rank-list">
              {stats.topParts.map(([name, qty]) => <li key={name}><span>{name}</span><strong>{qty}</strong></li>)}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}

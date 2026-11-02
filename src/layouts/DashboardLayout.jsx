import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../lib/constants';
import { DemoBanner, Logo } from './PublicLayout';

const Icon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const MENUS = {
  admin: [
    { to: '/admin', label: 'Tổng quan', end: true, icon: 'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z' },
    { to: '/admin/lich-hen', label: 'Lịch hẹn & phân công', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { to: '/admin/linh-kien', label: 'Danh mục linh kiện', icon: 'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7 12 12l8.7-5M12 22V12' },
  ],
  technician: [
    { to: '/ktv', label: 'Công việc của tôi', end: true, icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  ],
};

export default function DashboardLayout({ area }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const logout = async () => {
    await signOut();
    navigate('/dang-nhap');
  };

  return (
    <div className="dash">
      <DemoBanner />
      <div className="dash-body">
        <aside className={open ? 'sidebar open' : 'sidebar'}>
          <Logo />
          <p className="sidebar-role">{ROLES[area]}</p>
          <nav>
            {MENUS[area].map((m) => (
              <NavLink key={m.to} to={m.to} end={m.end}>
                <Icon d={m.icon} />
                {m.label}
              </NavLink>
            ))}
            <NavLink to="/" end>
              <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              Trang khách hàng
            </NavLink>
          </nav>
          <div className="sidebar-user">
            <div className="avatar">{user?.full_name?.split(' ').pop()?.[0] || '?'}</div>
            <div>
              <strong>{user?.full_name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất</button>
          </div>
        </aside>
        {open && <div className="backdrop" onClick={() => setOpen(false)} />}
        <div className="dash-main">
          <div className="dash-topbar">
            <button className="menu-btn" aria-label="Mở menu" onClick={() => setOpen(true)}>
              <span /><span /><span />
            </button>
            <span className="dash-topbar-title">{ROLES[area]}</span>
          </div>
          <div className="dash-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

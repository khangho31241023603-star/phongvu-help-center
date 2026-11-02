import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE, ROLES } from '../lib/constants';
import { api } from '../services/api';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Về trang chủ">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z" />
        </svg>
      </span>
      <span className="logo-text">Phong Vũ <b>Help Center</b></span>
    </Link>
  );
}

export function DemoBanner() {
  if (api.mode !== 'demo') return null;
  return (
    <div className="demo-banner">
      Đang chạy bằng dữ liệu mẫu. Tài khoản thử: admin@phongvu.demo, ktv1@phongvu.demo, khach@phongvu.demo (mật khẩu 123456).
      <button type="button" onClick={() => { api.resetDemo(); window.location.href = '/'; }}>Khôi phục dữ liệu mẫu</button>
    </div>
  );
}

export default function PublicLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="public">
      <DemoBanner />
      <header className="topbar">
        <div className="container topbar-inner">
          <Logo />
          <button className="menu-btn" aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span /><span /><span />
          </button>
          <nav className={open ? 'nav open' : 'nav'}>
            <NavLink to="/" end>Trang chủ</NavLink>
            <NavLink to="/dat-lich">Đặt lịch sửa chữa</NavLink>
            <NavLink to="/tra-cuu">Tra cứu tiến độ</NavLink>
            {user ? (
              <>
                <NavLink to={HOME_BY_ROLE[user.role]}>
                  {user.role === 'customer' ? 'Lịch hẹn của tôi' : `Trang ${ROLES[user.role]}`}
                </NavLink>
                <span className="nav-user">{user.full_name}</span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Đăng xuất</button>
              </>
            ) : (
              <>
                <NavLink to="/dang-nhap">Đăng nhập</NavLink>
                <Link to="/dang-ky" className="btn btn-primary btn-sm">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Logo />
            <p className="muted">Đặt lịch sửa chữa, theo dõi tiến độ và nhận báo giá minh bạch cho laptop của bạn.</p>
          </div>
          <div>
            <h4>Giờ làm việc</h4>
            <p className="muted">08:00 - 19:00, Thứ 2 đến Chủ nhật</p>
          </div>
          <div>
            <h4>Hotline kỹ thuật</h4>
            <p className="muted">1800 0000 (số minh họa cho bản demo)</p>
          </div>
        </div>
        <div className="container footer-note">Đồ án môn Quản lý Dự án CNTT, Nhóm 5, UEH</div>
      </footer>
    </div>
  );
}

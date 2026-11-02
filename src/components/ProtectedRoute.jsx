import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE } from '../lib/constants';
import Loading from './Loading';

// Chặn truy cập theo vai trò: chưa đăng nhập thì về trang đăng nhập,
// sai vai trò thì về trang chính của vai trò đó.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading full />;
  if (!user) return <Navigate to="/dang-nhap" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;
  return children;
}

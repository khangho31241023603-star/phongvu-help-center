import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE, isValidEmail } from '../lib/constants';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const DEMO = [
  { label: 'Quản lý', email: 'admin@phongvu.demo' },
  { label: 'Kỹ thuật viên', email: 'ktv1@phongvu.demo' },
  { label: 'Khách hàng', email: 'khach@phongvu.demo' },
];

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) return setError('Email chưa đúng định dạng.');
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự.');
    setLoading(true);
    try {
      const u = await signIn(email, password);
      toast(`Xin chào ${u.full_name}`);
      const from = location.state?.from;
      navigate(from && from !== '/dang-nhap' ? from : HOME_BY_ROLE[u.role], { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Đăng nhập</h1>
        <p className="muted">Dành cho khách hàng, kỹ thuật viên và quản lý cửa hàng.</p>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <input name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        <p className="muted center">Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link></p>

        {api.mode === 'demo' && (
          <div className="demo-accounts">
            <span className="muted small">Đăng nhập nhanh bằng tài khoản thử</span>
            <div className="chip-row">
              {DEMO.map((d) => (
                <button type="button" key={d.email} className="chip" onClick={() => { setEmail(d.email); setPassword('123456'); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

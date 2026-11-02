import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE, isValidEmail, isValidPhone } from '../lib/constants';
import { useToast } from '../components/Toast';

export default function Register() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = {};
    if (form.full_name.trim().length < 2) er.full_name = 'Vui lòng nhập họ tên.';
    if (!isValidPhone(form.phone)) er.phone = 'Số điện thoại chưa đúng định dạng.';
    if (!isValidEmail(form.email)) er.email = 'Email chưa đúng định dạng.';
    if (form.password.length < 6) er.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.confirm !== form.password) er.confirm = 'Mật khẩu nhập lại không khớp.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await signUp({ full_name: form.full_name.trim(), phone: form.phone.replace(/\s/g, ''), email: form.email, password: form.password });
      toast('Tạo tài khoản thành công');
      navigate('/khach-hang/lich-hen', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const F = ({ k, label, type = 'text', auto }) => (
    <label className="field">
      <span>{label}</span>
      <input name={k} type={type} autoComplete={auto} value={form[k]} onChange={set(k)} />
      {errors[k] && <small className="error-text">{errors[k]}</small>}
    </label>
  );

  return (
    <div className="container auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Tạo tài khoản khách hàng</h1>
        <p className="muted">Lưu lại lịch sử sửa chữa và báo giá của bạn.</p>
        {F({ k: 'full_name', label: 'Họ và tên', auto: 'name' })}
        {F({ k: 'phone', label: 'Số điện thoại', type: 'tel', auto: 'tel' })}
        {F({ k: 'email', label: 'Email', type: 'email', auto: 'email' })}
        {F({ k: 'password', label: 'Mật khẩu', type: 'password', auto: 'new-password' })}
        {F({ k: 'confirm', label: 'Nhập lại mật khẩu', type: 'password', auto: 'new-password' })}
        {serverError && <div className="alert alert-error">{serverError}</div>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Đang tạo...' : 'Đăng ký'}</button>
        <p className="muted center">Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
      </form>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section center">
      <h1 className="big-404">404</h1>
      <p className="muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="btn btn-primary">Về trang chủ</Link>
    </div>
  );
}

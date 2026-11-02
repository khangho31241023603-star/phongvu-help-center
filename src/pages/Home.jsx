import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STEPS = [
  { t: 'Đặt lịch online', d: 'Chọn chi nhánh, ngày giờ và mô tả lỗi. Nhận mã lịch hẹn ngay lập tức.' },
  { t: 'Mang máy đến đúng giờ', d: 'Đọc mã lịch hẹn tại quầy, kỹ thuật viên tiếp nhận máy không cần xếp hàng.' },
  { t: 'Nhận báo giá', d: 'Kỹ thuật viên kiểm tra và lập báo giá chi tiết từng linh kiện, công sửa.' },
  { t: 'Theo dõi và nhận máy', d: 'Tra cứu tiến độ bằng mã lịch hẹn và số điện thoại bất cứ lúc nào.' },
];

const SERVICES = [
  'Thay màn hình, bàn phím, pin, sạc',
  'Nâng cấp RAM, SSD',
  'Vệ sinh, tra keo tản nhiệt',
  'Sửa mainboard, lỗi không lên nguồn',
  'Cài đặt hệ điều hành, phần mềm',
  'Cứu dữ liệu, xử lý máy vào nước',
];

export default function Home() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Dịch vụ bảo trì laptop</span>
            <h1>Đặt lịch sửa laptop trong 1 phút, không phải chờ ở quầy</h1>
            <p>Hẹn giờ mang máy đến chi nhánh, theo dõi từng bước sửa chữa và xem báo giá trước khi đồng ý thay linh kiện.</p>
            <div className="hero-actions">
              <Link to="/dat-lich" className="btn btn-primary btn-lg">Đặt lịch ngay</Link>
              <Link to="/tra-cuu" className="btn btn-outline btn-lg">Tra cứu tiến độ</Link>
            </div>
          </div>
          <form
            className="card hero-card"
            onSubmit={(e) => { e.preventDefault(); navigate(`/tra-cuu?ma=${encodeURIComponent(code.trim())}`); }}
          >
            <h3>Đã có mã lịch hẹn?</h3>
            <p className="muted">Nhập mã để xem máy của bạn đang ở bước nào.</p>
            <label className="field">
              <span>Mã lịch hẹn</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: PV2610281234" />
            </label>
            <button className="btn btn-primary btn-block" disabled={!code.trim()}>Tra cứu</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Quy trình 4 bước</h2>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <div className="card step-card" key={s.t}>
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container two-col">
          <div>
            <h2 className="section-title">Dịch vụ hỗ trợ</h2>
            <ul className="check-list">
              {SERVICES.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div className="card cta-card">
            <h3>Khách hàng thường xuyên?</h3>
            <p className="muted">Tạo tài khoản để xem lại toàn bộ lịch sử sửa chữa và báo giá của các máy đã gửi.</p>
            <Link to="/dang-ky" className="btn btn-primary">Tạo tài khoản</Link>
          </div>
        </div>
      </section>
    </>
  );
}

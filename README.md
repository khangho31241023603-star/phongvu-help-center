# Phong Vũ Help Center - Frontend

Giao diện web cho hệ thống đặt lịch sửa chữa và quản lý dịch vụ bảo trì laptop (Nhóm 5, môn Quản lý Dự án CNTT).
Phụ trách Frontend: Hồ Minh Khang.

Công nghệ: React 18, Vite 5, React Router 6, Supabase JS.

## Chạy thử trên máy

Yêu cầu: Node.js 18 trở lên (tải tại nodejs.org).

```bash
npm install
npm run dev
```

Trình duyệt tự mở http://localhost:5173.

Khi chưa có file `.env`, app chạy bằng **dữ liệu mẫu** lưu trong trình duyệt. Tài khoản thử (mật khẩu `123456`):

| Vai trò | Email |
|---|---|
| Quản lý | admin@phongvu.demo |
| Kỹ thuật viên | ktv1@phongvu.demo, ktv2@phongvu.demo |
| Khách hàng | khach@phongvu.demo |

Mã lịch hẹn mẫu để tra cứu: `PV2610281234`, số điện thoại `0912345678`.
Nút "Khôi phục dữ liệu mẫu" trên thanh đen đầu trang đưa dữ liệu về ban đầu.

## Kết nối Supabase thật

1. Sao chép `.env.example` thành `.env`.
2. Điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (Supabase > Project Settings > API).
3. Nếu BE chưa tạo bảng, chạy `supabase/schema.sql` trong SQL Editor. Nếu BE đã có bảng khác tên, chỉ sửa `src/services/supabaseApi.js`.
4. Chạy lại `npm run dev`.

Tạo tài khoản Admin/KTV: đăng ký trên web rồi đổi cột `role` trong bảng `profiles` thành `admin` hoặc `technician`.

## Chức năng theo vai trò

| Vai trò | Trang | Chức năng |
|---|---|---|
| Khách (không cần đăng nhập) | `/`, `/dat-lich`, `/tra-cuu` | Đặt lịch, chọn chi nhánh và khung giờ còn chỗ, nhận mã lịch hẹn, tra cứu tiến độ và báo giá |
| Khách hàng có tài khoản | `/khach-hang/lich-hen` | Xem lại toàn bộ lịch hẹn của mình |
| Kỹ thuật viên | `/ktv`, `/ktv/cong-viec/:id` | Xem việc được phân công, cập nhật trạng thái sửa chữa, lập báo giá từ danh mục linh kiện |
| Quản lý | `/admin`, `/admin/lich-hen`, `/admin/linh-kien` | Thống kê, lọc lịch hẹn, phân công KTV, đổi/hủy trạng thái, quản lý danh mục linh kiện |

Luồng trạng thái: Chờ xác nhận → Đã xác nhận lịch (khi phân công KTV) → Đã tiếp nhận máy → Đang sửa chữa (hoặc Chờ linh kiện) → Sửa xong, chờ nhận máy → Đã trả máy.

## Cấu trúc thư mục

```
src/
  App.jsx                 Khai báo toàn bộ route
  layouts/                Khung trang công khai và khung trang quản trị (sidebar)
  components/             Thành phần dùng chung: ProtectedRoute, StatusBadge, ProgressTracker, QuoteEditor...
  context/AuthContext.jsx Trạng thái đăng nhập
  services/api.js         Điểm gọi dữ liệu duy nhất (tự chọn mockApi hoặc supabaseApi)
  pages/                  Các trang theo vai trò
  lib/constants.js        Trạng thái, khung giờ, hàm định dạng
supabase/schema.sql       Lược đồ CSDL đề xuất + phân quyền RLS
screenshots/              Ảnh minh chứng cho từng task trên ClickUp
```

## Build

```bash
npm run build     # xuất ra thư mục dist/
npm run preview   # chạy thử bản build
```

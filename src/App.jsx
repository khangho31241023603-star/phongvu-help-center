import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Booking from './pages/Booking';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import MyBookings from './pages/customer/MyBookings';
import TechJobs from './pages/technician/TechJobs';
import TechJobDetail from './pages/technician/TechJobDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminParts from './pages/admin/AdminParts';

export default function App() {
  return (
    <Routes>
      {/* Trang công khai */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dat-lich" element={<Booking />} />
        <Route path="/tra-cuu" element={<Tracking />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route
          path="/khach-hang/lich-hen"
          element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>}
        />
      </Route>

      {/* Kỹ thuật viên */}
      <Route element={<ProtectedRoute roles={['technician']}><DashboardLayout area="technician" /></ProtectedRoute>}>
        <Route path="/ktv" element={<TechJobs />} />
        <Route path="/ktv/cong-viec/:id" element={<TechJobDetail />} />
      </Route>

      {/* Quản lý */}
      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout area="admin" /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/lich-hen" element={<AdminBookings />} />
        <Route path="/admin/lich-hen/:id" element={<AdminBookingDetail />} />
        <Route path="/admin/linh-kien" element={<AdminParts />} />
      </Route>

      <Route path="/trang-chu" element={<Navigate to="/" replace />} />
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

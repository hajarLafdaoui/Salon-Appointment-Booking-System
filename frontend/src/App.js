import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';
import Home from './pages/public/Home';
import BrowseServices from './pages/public/BrowseServices';
import HowItWorks from './pages/public/HowItWorks';
import Staff from './pages/public/Staff';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import MyAppointments from './pages/public/MyAppointments';

import Booking from './pages/public/Booking';
import Profile from './pages/public/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminServices from './pages/admin/Services';
import AdminStaff from './pages/admin/Staff';
import AdminCustomers from './pages/admin/Customers';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<BrowseServices />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/staff/dashboard" element={<div>Staff Dashboard</div>} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:serviceId" element={<Booking />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

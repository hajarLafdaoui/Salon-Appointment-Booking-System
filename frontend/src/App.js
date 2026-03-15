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

import Booking from './pages/public/Booking';

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
            <Route path="/my-appointments" element={<div>My Appointments</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/staff/dashboard" element={<div>Staff Dashboard</div>} />
            <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:serviceId" element={<Booking />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

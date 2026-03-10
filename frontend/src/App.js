import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import HowItWorks from './pages/public/HowItWorks';
import Staff from './pages/public/Staff';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/my-appointments" element={<div>My Appointments</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        <Route path="/staff/dashboard" element={<div>Staff Dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/booking" element={<div>Booking Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;

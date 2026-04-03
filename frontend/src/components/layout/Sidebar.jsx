import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar,
  Scissors,
  Users,
  User,
  LogOut
} from 'lucide-react';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import './Sidebar.css';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoClick = () => {
    navigate('/admin/dashboard');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo clickable" onClick={handleLogoClick}>
        <span className="logo-text">Velora</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutGrid className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/appointments"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Calendar className="nav-icon" />
          <span>Appointments</span>
        </NavLink>

        <NavLink
          to="/admin/services"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Scissors className="nav-icon" />
          <span>Services</span>
        </NavLink>

        <NavLink
          to="/admin/staff"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Users className="nav-icon" />
          <span>Staff</span>
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <User className="nav-icon" />
          <span>Customers</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogoutClick} className="logout-btn">
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        roleLabel="the Admin Dashboard"
      />
    </aside>
  );
};

export default Sidebar;

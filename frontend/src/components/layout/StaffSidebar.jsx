import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../ui/Loader';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import './Sidebar.css';

const StaffSidebar = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/staff/dashboard');
    }, 800);
  };

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo clickable" onClick={handleLogoClick}>
        <span className="logo-text">Velora</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/staff/dashboard"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutGrid className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/staff/appointments"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Calendar className="nav-icon" />
          <span>My Appointments</span>
        </NavLink>

        <NavLink
          to="/staff/schedule"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Clock className="nav-icon" />
          <span>Today's Schedule</span>
        </NavLink>

        <NavLink
          to="/staff/profile"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <User className="nav-icon" />
          <span>Profile</span>
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
        roleLabel="the Staff Dashboard"
      />
    </aside>
  );
};

export default StaffSidebar;

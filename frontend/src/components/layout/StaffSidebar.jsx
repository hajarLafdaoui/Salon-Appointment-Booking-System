import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, Clock, User, LogOut } from 'lucide-react';
import './Sidebar.css';

const StaffSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
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
        <button onClick={handleLogout} className="logout-btn">
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;

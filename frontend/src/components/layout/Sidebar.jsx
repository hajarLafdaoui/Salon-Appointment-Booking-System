import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Calendar, 
  Scissors, 
  Users, 
  User, 
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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
        <button onClick={handleLogout} className="logout-btn">
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

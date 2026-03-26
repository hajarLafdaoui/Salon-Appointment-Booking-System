import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import searchIcon from '../../assets/icons/search-black.png';
import './DashboardHeader.css';

const DashboardHeader = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const role = user?.role || 'admin';
  const roleLabel = role === 'staff' ? 'Staff' : role === 'admin' ? 'Admin' : 'Account';
  const profileRoute = role === 'staff' ? '/staff/profile' : '/profile';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm(`Are you sure you want to log out from the ${roleLabel} Dashboard?`)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      navigate('/login');
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="welcome-text">
          Hello, <span className="highlight">{user?.name || 'Admin'}!</span>
          <span className="role-tag">{roleLabel}</span>
        </h1>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <img src={searchIcon} alt="Search" className="search-icon-asset" />
          <input type="text" placeholder="Search appointments, customers..." />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="dot"></span>
        </button>
        
        <div className="admin-profile-wrapper" ref={dropdownRef}>
          <div className="avatar-circle clickable" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          {dropdownOpen && (
            <div className="admin-dropdown">
              <div className="dropdown-header">
                <div className="header-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="header-info">
                  <span className="user-name-display">{user?.name}</span>
                  <span className="user-role-display">{roleLabel}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to={profileRoute} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                Profile
              </Link>
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item logout-item">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

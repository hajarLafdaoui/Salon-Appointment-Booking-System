import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import searchIcon from '../../assets/icons/search-black.png';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import './DashboardHeader.css';

const DashboardHeader = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  const role = user?.role || 'admin';
  const roleLabel = role === 'staff' ? 'Staff' : role === 'admin' ? 'Admin' : 'Account';
  const profileRoute = role === 'staff' ? '/staff/profile' : '/profile';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();

      // Navigate to appropriate page based on search term
      if (term.includes('appointment') || term.includes('booking') || term.includes('schedule')) {
        navigate('/admin/appointments', { state: { search: searchTerm } });
      } else if (term.includes('customer') || term.includes('client') || term.includes('user')) {
        navigate('/admin/customers', { state: { search: searchTerm } });
      } else if (term.includes('service') || term.includes('treatment') || term.includes('hair') || term.includes('nail') || term.includes('spa')) {
        navigate('/admin/services', { state: { search: searchTerm } });
      } else if (term.includes('staff') || term.includes('employee') || term.includes('worker')) {
        navigate('/admin/staff', { state: { search: searchTerm } });
      } else {
        // Default to appointments if no specific match
        navigate('/admin/appointments', { state: { search: searchTerm } });
      }

      setSearchTerm('');
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
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
          <input
            type="text"
            placeholder="Search appointments, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="notifications-wrapper" ref={notificationsRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="dot"></span>
          </button>
          <NotificationsDropdown 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)}
            userRole={role}
          />
        </div>

        <div className="admin-profile-wrapper" ref={dropdownRef}>
          <div className="avatar-circle clickable" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'A'
            )}
          </div>

          {dropdownOpen && (
            <div className="admin-dropdown">
              <div className="dropdown-header">
                <div className="header-avatar">
                  {user?.avatar ? (
                    <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'A'
                  )}
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
              <button onClick={handleLogoutClick} className="dropdown-item logout-item">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        roleLabel={`${roleLabel} Dashboard`}
      />
    </header>
  );
};

export default DashboardHeader;

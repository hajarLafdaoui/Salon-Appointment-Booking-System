import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import LogoutConfirmModal from '../ui/LogoutConfirmModal';
import './Navbar.css';

const Navbar = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useToast();

    // No local user state needed - we use context now
    // Effects for scroll and outside click remain unchanged

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.user-profile-wrapper')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        showToast('Logged out successfully', 'success');
        navigate('/');
    };

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setShowLogoutModal(true);
    };


    return (
        <nav className={`navbar ${['/', '/staff', '/login', '/register'].includes(location.pathname) ? 'navbar--white' : ''} ${isHidden ? 'hidden' : ''}`}>
            <div className="navbar-container">
                {/* Left Navigation Links */}
                <div className="navbar-left">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/staff" className="nav-link">Staff</Link>
                    <button
                        onClick={() => {
                            if (!user) {
                                navigate('/login', {
                                    state: {
                                        from: '/booking',
                                        message: 'Please log in first to book an appointment'
                                    }
                                });
                            } else {
                                navigate('/booking');
                            }
                        }}
                        className="nav-link"
                    >
                        Booking
                    </button>
                </div>

                {/* Center Logo */}
                <div className="navbar-center">
                    <button
                        className="navbar-logo clickable"
                        onClick={() => {
                            if (user?.role === 'admin') {
                                navigate('/admin/dashboard');
                            } else if (user?.role === 'staff') {
                                navigate('/staff/dashboard');
                            } else {
                                navigate('/');
                            }
                        }}
                    >
                        Velora
                    </button>
                </div>

                {/* Right Navigation Links and Button */}
                <div className="navbar-right">
                    {user ? (
                        <div className="user-profile-wrapper">
                            <div
                                className="user-avatar"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {user.avatar ? (
                                    <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                                ) : (
                                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>

                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <div className="header-avatar">
                                            {user.avatar ? (
                                                <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                                            ) : (
                                                user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <span className="user-name-display">{user.name}</span>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link to="/my-appointments" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Appointments</Link>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                    <div className="dropdown-divider" />
                                    <button onClick={handleLogoutClick} className="dropdown-item logout-item">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : location.pathname !== '/login' && location.pathname !== '/register' ? (
                        <Link to="/login" className="btn-primary">Log In</Link>
                    ) : null}
                </div>
            </div>

            <LogoutConfirmModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                roleLabel="your account"
            />
        </nav>
    );
};

export default Navbar;

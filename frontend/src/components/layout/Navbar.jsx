import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }

        // Listen for storage changes (logout from other tabs)
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            if (updatedUser) {
                setUser(JSON.parse(updatedUser));
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [location]);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };


    return (
        <nav className={`navbar ${location.pathname === '/services' ? 'navbar--services' : ''} ${isHidden ? 'hidden' : ''}`}>
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
                    <span className="navbar-logo">Velora</span>
                </div>

                {/* Right Navigation Links and Button */}
                <div className="navbar-right">
                    {user ? (
                        <div className="user-profile-wrapper">
                            <div 
                                className="user-avatar" 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            
                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <div className="header-avatar">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="user-name-display">{user.name}</span>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link to="/my-appointments" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Appointments</Link>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                    <button className="dropdown-item" onClick={() => {
                                        setDropdownOpen(false);
                                        // future: toggle change password modal
                                    }}>Change Password</button>
                                    <div className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item logout-item">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary">Log In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

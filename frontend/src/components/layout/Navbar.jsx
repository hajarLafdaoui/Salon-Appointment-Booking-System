import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [user, setUser] = useState(null);
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    const handleBookClick = (e) => {
        e.preventDefault();
        alert("Please choose a service to book first.");
        navigate('/services');
    };

    return (
        <nav className={`navbar ${location.pathname === '/services' ? 'navbar--services' : ''} ${isHidden ? 'hidden' : ''}`}>
            <div className="navbar-container">
                {/* Left Navigation Links */}
                <div className="navbar-left">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/staff" className="nav-link">Staff</Link>
                    {user && <Link to="/my-appointments" className="nav-link">My Appointments</Link>}
                </div>

                {/* Center Logo */}
                <div className="navbar-center">
                    <span className="navbar-logo">Velora</span>
                </div>

                {/* Right Navigation Links and Button */}
                <div className="navbar-right">
                    {user ? (
                        <>
                            <Link to="/profile" className="nav-link">Profile</Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                            <button onClick={handleBookClick} className="btn-primary">Book Appointment</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

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

    return (
        <nav className={`navbar ${isHidden ? 'hidden' : ''}`}>
            <div className="navbar-container">
                {/* Left Navigation Links */}
                <div className="navbar-left">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/staff" className="nav-link">Staff</Link>
                    <Link to="/" className="nav-link">How It Works</Link>
                </div>

                {/* Center Logo */}
                <div className="navbar-center">
                    <span className="navbar-logo">Velora</span>
                </div>

                {/* Right Navigation Links and Button */}
                <div className="navbar-right">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/booking" className="btn-primary">Book Appointment</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

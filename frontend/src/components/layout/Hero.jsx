import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                {/* Left - Text Content */}
                <div className="hero-left">
                    <h1 className="hero-headline">Book Your Beauty Appointment in Seconds</h1>
                    <p className="hero-subtext">Choose your service, pick a stylist, and reserve your time instantly. No phone calls required.</p>

                    <div className="hero-buttons">
                        <Link to="/booking" className="btn-primary">Book Appointment</Link>
                        <Link to="/services" className="btn-secondary">View Services</Link>
                    </div>

                    <div className="hero-trust">
                        <span className="trust-icon">⭐</span>
                        <span className="trust-text">Rated 4.9 by 300+ clients</span>
                    </div>
                </div>

                {/* Right - Image/Illustration */}
                <div className="hero-right">
                    <div className="hero-image-placeholder">Image / Illustration</div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

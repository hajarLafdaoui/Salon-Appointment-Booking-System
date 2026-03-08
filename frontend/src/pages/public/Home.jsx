import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import heroImage from '../../assets/images/8.jpg';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar />
            <div className="home-content">
                {/* Left Half - Hero Content */}
                <div className="home-left">
                    <div className="hero-content">
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
                </div>

                {/* Right Half - Image Section */}
                <div className="home-right">
                    <img src={heroImage} alt="Beauty Appointment" className="hero-image" />
                </div>
            </div>
        </div>
    );
};

export default Home;

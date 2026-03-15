import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import './HowItWorks.css';

const HowItWorks = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleBookClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { 
                    from: '/booking',
                    message: 'Please log in first to book an appointment'
                } 
            });
            return;
        }
        navigate('/booking');
    };

    return (
        <div className="how-it-works-page">
            <Navbar />

            {/* How Booking Works Section */}
            <div className="booking-works-section">
                <div className="booking-works-header">
                    <h2 className="booking-works-title">How Booking Works</h2>
                    <p className="booking-works-subtitle">Simple, fast, and hassle-free. Get your appointment in just 3 steps.</p>
                </div>

                <div className="booking-steps-container">
                    <div className="booking-step">
                        <div className="step-icon">
                            <span className="icon-number">1</span>
                            <span className="icon-emoji">✨</span>
                        </div>
                        <h3 className="step-title">Choose a Service</h3>
                        <p className="step-description">Browse our available beauty treatments and find exactly what you need.</p>
                    </div>

                    <div className="step-connector"></div>

                    <div className="booking-step">
                        <div className="step-icon">
                            <span className="icon-number">2</span>
                            <span className="icon-emoji">📅</span>
                        </div>
                        <h3 className="step-title">Select Date & Time</h3>
                        <p className="step-description">Pick the date and time that fits your schedule perfectly.</p>
                    </div>

                    <div className="step-connector"></div>

                    <div className="booking-step">
                        <div className="step-icon">
                            <span className="icon-number">3</span>
                            <span className="icon-emoji">✅</span>
                        </div>
                        <h3 className="step-title">Confirm Your Appointment</h3>
                        <p className="step-description">You're all set! Your appointment is confirmed and ready to go.</p>
                    </div>
                </div>

                <div className="booking-works-cta">
                    <button onClick={handleBookClick} className="cta-button">Start Booking Now</button>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;

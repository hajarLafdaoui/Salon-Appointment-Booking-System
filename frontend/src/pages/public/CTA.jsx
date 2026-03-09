import React from 'react';
import { Link } from 'react-router-dom';
import './CTA.css';

const CTA = () => {
    return (
        <div className="cta-section">
            <div className="cta-content">
                <h2 className="cta-title">Ready for Your Next Appointment?</h2>
                <p className="cta-subtext">Book your beauty treatment in less than 60 seconds.</p>
                <Link to="/booking" className="cta-button">Book Appointment</Link>
            </div>
        </div>
    );
};

export default CTA;

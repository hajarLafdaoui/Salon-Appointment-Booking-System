import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleBookClick = (e) => {
        e.preventDefault();
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
        <section className="hero">
            <div className="hero-container">
                {/* Left - Text Content */}
                <div className="hero-left">
                    <h1 className="hero-headline">Book Your Beauty Appointment in Seconds</h1>
                    <p className="hero-subtext">Choose your service, pick a stylist, and reserve your time instantly. No phone calls required.</p>

                    <div className="hero-buttons">
                        <button onClick={handleBookClick} className="btn-primary">Book Appointment</button>
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

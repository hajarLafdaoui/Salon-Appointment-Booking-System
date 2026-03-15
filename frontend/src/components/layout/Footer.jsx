import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import instagramIcon from '../../assets/icons/instagram.png';
import facebookIcon from '../../assets/icons/facebook.png';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Column 1 - Brand */}
                <div className="footer-column">
                    <h3 className="footer-brand">BeautyGlow</h3>
                    <p className="footer-description">Premium beauty services and easy online booking.</p>
                </div>

                {/* Column 2 - Quick Links */}
                <div className="footer-column">
                    <h4 className="footer-title">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/staff">Staff</Link></li>
                        <li><Link to="/how-it-works">How It Works</Link></li>
                        <li>
                            <button 
                                onClick={(e) => {
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
                                }} 
                                className="footer-booking-btn"
                                style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                            >
                                Book Appointment
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Column 3 - Contact */}
                <div className="footer-column">
                    <h4 className="footer-title">Contact</h4>
                    <div className="footer-contact">
                        <p>123 Main Street<br />New York, NY</p>
                        <p><a href="tel:+15551234567">+1 555 123 4567</a></p>
                        <p><a href="mailto:contact@beautyglow.com">contact@beautyglow.com</a></p>
                    </div>
                </div>

                {/* Column 4 - Social Media */}
                <div className="footer-column">
                    <h4 className="footer-title">Follow Us</h4>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Instagram">
                            <img src={instagramIcon} alt="Instagram" />
                        </a>
                        <a href="#" className="social-link" aria-label="Facebook">
                            <img src={facebookIcon} alt="Facebook" />
                        </a>
                        <a href="#" className="social-link emoji-link" aria-label="Twitter">𝕏</a>
                    </div>
                </div>
            </div>

            {/* Bottom Line */}
            <div className="footer-bottom">
                <p>&copy; 2026 BeautyGlow. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

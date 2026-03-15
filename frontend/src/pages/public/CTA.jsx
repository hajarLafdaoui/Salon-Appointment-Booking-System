import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './CTA.css';

const CTA = () => {
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
        <div className="cta-section">
            <div className="cta-content">
                <h2 className="cta-title">Ready for Your Next Appointment?</h2>
                <p className="cta-subtext">Book your beauty treatment in less than 60 seconds.</p>
                <button onClick={handleBookClick} className="cta-button">Book Appointment</button>
            </div>
        </div>
    );
};

export default CTA;

import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import Footer from '../../components/layout/Footer';
import HowItWorks from './HowItWorks';
import Staff from './Staff';
import Testimonials from './Testimonials';
import CTA from './CTA';
import heroImage from '../../assets/images/8.jpg';
import hairImage from '../../assets/images/Hair.jpg';
import './Home.css';

const Home = () => {
    const sliderRef = useRef(null);
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isAuthenticated } = useAuth();
    
    const handleBookClick = (e, serviceId = null) => {
        if (e) e.preventDefault();
        
        const targetPath = serviceId ? `/booking/${serviceId}` : '/booking';
        
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { 
                    from: targetPath,
                    message: 'Please log in first to book an appointment'
                } 
            });
            return;
        }
        navigate(targetPath);
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/services');
                const data = await response.json();
                
                const mappedServices = data.map(service => ({
                    id: service._id,
                    title: service.name,
                    description: service.description,
                    image: service.image || hairImage 
                }));
                
                setServices([...mappedServices, ...mappedServices]);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const currentSlider = sliderRef.current;
        if (!loading && services.length > 0 && currentSlider) {
            currentSlider.classList.add('animate');
        }

        return () => {
            if (currentSlider) {
                currentSlider.classList.remove('animate');
            }
        };
    }, [services, loading]);

    return (
        <div className="landing-page">
            <Navbar />

            {/* Hero Section */}
            <div className="hero-section">
                <div className="home-content">
                    <div className="home-left">
                        <div className="hero-content">
                            <h1 className="hero-headline">Book Your Beauty Appointment in Seconds</h1>
                            <p className="hero-subtext">Choose your service, pick a stylist, and reserve your time instantly. No phone calls required.</p>

                            <div className="hero-buttons">
                                <button onClick={(e) => handleBookClick(e)} className="btn-primary">Book Appointment</button>
                                <Link to="/services" className="btn-secondary">View Services</Link>
                            </div>

                            <div className="hero-trust">
                                <span className="trust-icon">⭐</span>
                                <span className="trust-text">Rated 4.9 by 300+ clients</span>
                            </div>
                        </div>
                    </div>

                    <div className="home-right">
                        <img src={heroImage} alt="Beauty Appointment" className="hero-image" />
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="services-section">
                <div className="services-header">
                    <h2 className="services-title">Our Services</h2>
                    <p className="services-subtitle">Discover a wide range of beauty services designed to help you look and feel your best.</p>
                </div>

                <div className="services-slider-container">
                    <div className="services-slider" ref={sliderRef}>
                        {services.map((service, index) => (
                            <div key={`${service.id}-${index}`} className="service-card">
                                <div className="service-image-wrapper">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="service-image"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="service-content">
                                    <h3 className="service-title">{service.title}</h3>
                                    <p className="service-description">{service.description}</p>
                                    <button 
                                        onClick={(e) => handleBookClick(e, service.id)} 
                                        className="service-link"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        Explore →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="services-footer">
                    <Link to="/services" className="view-all-link">Browse All Services →</Link>
                </div>
            </div>

            <HowItWorks />
            <Staff isLandingPage={true} />
            <Testimonials />
            <CTA />
            <Footer />
        </div>
    );
};

export default Home;

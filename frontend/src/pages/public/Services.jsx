import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import hairImage from '../../assets/images/Hair.jpg';
import skincareImage from '../../assets/images/Skincare.jpg';
import nailsImage from '../../assets/images/Nails.jpg';
import makeupImage from '../../assets/images/Makeup.jpg';
import browsImage from '../../assets/images/Brows.jpg';
import spaImage from '../../assets/images/Spa.jpg';
import './Services.css';

const Services = () => {
    const navigate = useNavigate();
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

    const services = [
        {
            id: 1,
            title: 'Hair',
            description: 'Haircuts, styling, coloring and treatments.',
            image: hairImage
        },
        {
            id: 2,
            title: 'Skincare',
            description: 'Facials and treatments for glowing healthy skin.',
            image: skincareImage
        },
        {
            id: 3,
            title: 'Nails',
            description: 'Manicure, pedicure and nail beauty services.',
            image: nailsImage
        },
        {
            id: 4,
            title: 'Makeup',
            description: 'Professional makeup for events and special occasions.',
            image: makeupImage
        },
        {
            id: 5,
            title: 'Brows & Lashes',
            description: 'Eyebrow shaping and eyelash enhancement services.',
            image: browsImage
        },
        {
            id: 6,
            title: 'Spa & Massage',
            description: 'Relaxing body treatments and massage therapy.',
            image: spaImage
        }
    ];

    return (
        <div className="services-page">
            <Navbar />

            {/* Services Section */}
            <div className="services-section">
                <div className="services-header">
                    <h2 className="services-title">Our Services</h2>
                    <p className="services-subtitle">Discover a wide range of beauty services designed to help you look and feel your best.</p>
                </div>

                <div className="services-grid-container">
                    <div className="services-grid">
                        {services.map((service) => (
                            <div key={service.id} className="service-card">
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
                                    >
                                        Explore →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="services-footer">
                    <button onClick={(e) => handleBookClick(e)} className="view-all-link">Book a Service Now →</button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Services;
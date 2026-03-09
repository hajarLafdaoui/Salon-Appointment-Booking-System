import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import heroImage from '../../assets/images/8.jpg';
import hairImage from '../../assets/images/Hair.jpg';
import skincareImage from '../../assets/images/Skincare.jpg';
import nailsImage from '../../assets/images/Nails.jpg';
import makeupImage from '../../assets/images/Makeup.jpg';
import browsImage from '../../assets/images/Brows.jpg';
import spaImage from '../../assets/images/Spa.jpg';
import './Home.css';

const Home = () => {
    const sliderRef = useRef(null);

    const baseServices = [
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

    const services = baseServices;

    useEffect(() => {
        if (sliderRef.current) {
            sliderRef.current.classList.add('animate');
        }

        return () => {
            if (sliderRef.current) {
                sliderRef.current.classList.remove('animate');
            }
        };
    }, []);

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
                                <Link to="/booking" className="btn-primary">Book Appointment</Link>
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
                                    <Link to="/booking" className="service-link">Explore →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="services-footer">
                    <Link to="/booking" className="view-all-link">Book a Service →</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;

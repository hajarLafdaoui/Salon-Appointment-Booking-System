import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import hairImage from '../../assets/images/Hair.jpg';
import skincareImage from '../../assets/images/Skincare.jpg';
import nailsImage from '../../assets/images/Nails.jpg';
import makeupImage from '../../assets/images/Makeup.jpg';
import browsImage from '../../assets/images/Brows.jpg';
import spaImage from '../../assets/images/Spa.jpg';
import './Services.css';

const Services = () => {
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
        <div className="services-page">
            <Navbar />

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

export default Services;
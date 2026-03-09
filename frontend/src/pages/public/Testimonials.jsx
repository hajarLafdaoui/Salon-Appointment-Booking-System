import React, { useState } from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            rating: 5,
            text: 'The booking process was so easy and the staff were amazing. I got exactly what I wanted!',
            author: 'Sarah M.',
            service: 'Hair Styling'
        },
        {
            id: 2,
            rating: 5,
            text: 'I love being able to book online instead of calling. The whole experience was seamless.',
            author: 'Emily R.',
            service: 'Skincare Treatment'
        },
        {
            id: 3,
            rating: 5,
            text: 'Professional service, friendly staff, and convenient scheduling. Highly recommend!',
            author: 'Jessica L.',
            service: 'Nail Care'
        },
        {
            id: 4,
            rating: 5,
            text: 'Best beauty salon experience I\'ve had. Will definitely be coming back!',
            author: 'Michelle K.',
            service: 'Makeup Application'
        },
        {
            id: 5,
            rating: 5,
            text: 'Amazing service and very professional. Highly satisfied with the results!',
            author: 'Lisa T.',
            service: 'Spa Treatment'
        }
    ];

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === testimonials.length - 3 ? 0 : prevIndex + 1
        );
    };

    const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

    return (
        <div className="testimonials-section">
            <div className="testimonials-header">
                <h2 className="testimonials-title">What Our Clients Say</h2>
            </div>
            <p className="testimonials-subtitle">Real feedback from real customers who love our service.</p>

            <div className="testimonials-grid">
                {visibleTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="testimonial-card">
                        <div className="testimonial-rating">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <span key={i} className="star">⭐</span>
                            ))}
                        </div>
                        <p className="testimonial-text">"{testimonial.text}"</p>
                        <div className="testimonial-author">
                            <p className="author-name">— {testimonial.author}</p>
                            <p className="author-service">{testimonial.service}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="testimonials-footer">
                <button className="arrow-button prev-button" onClick={handlePrev} aria-label="Previous testimonials">
                    ←
                </button>
                <button className="arrow-button next-button" onClick={handleNext} aria-label="Next testimonials">
                    →
                </button>
            </div>
        </div>
    );
};

export default Testimonials;

import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const StarDisplay = ({ rating }) => (
    <div className="testimonial-rating">
        {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className="star" style={{ color: star <= rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
        ))}
    </div>
);

const FALLBACK = [
    { _id: 'f1', rating: 5, comment: 'The booking process was so easy and the staff were amazing. I got exactly what I wanted!', user: { name: 'Sarah M.' }, service: { name: 'Hair Styling' } },
    { _id: 'f2', rating: 5, comment: 'I love being able to book online instead of calling. The whole experience was seamless.', user: { name: 'Emily R.' }, service: { name: 'Skincare Treatment' } },
    { _id: 'f3', rating: 5, comment: 'Professional service, friendly staff, and convenient scheduling. Highly recommend!', user: { name: 'Jessica L.' }, service: { name: 'Nail Care' } },
];

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const perPage = 3;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    // Only show reviews with comments
                    const filtered = data.filter(r => r.comment && r.comment.trim() !== '');
                    setTestimonials(filtered.length > 0 ? filtered : FALLBACK);
                } else {
                    setTestimonials(FALLBACK);
                }
            } catch {
                setTestimonials(FALLBACK);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const totalPages = Math.ceil(testimonials.length / perPage);
    const visible = testimonials.slice(currentIndex * perPage, currentIndex * perPage + perPage);

    const handlePrev = () => setCurrentIndex(i => Math.max(0, i - 1));
    const handleNext = () => setCurrentIndex(i => Math.min(totalPages - 1, i + 1));

    return (
        <div className="testimonials-section">
            <div className="testimonials-header">
                <h2 className="testimonials-title">What Our Clients Say</h2>
            </div>
            <p className="testimonials-subtitle">Real feedback from real customers who love our service.</p>

            {loading ? (
                <div className="testimonials-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="testimonial-card testimonial-skeleton">
                            <div className="skel-line short"></div>
                            <div className="skel-line long"></div>
                            <div className="skel-line medium"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="testimonials-grid">
                    {visible.map((t) => (
                        <div key={t._id} className="testimonial-card">
                            <StarDisplay rating={t.rating} />
                            <p className="testimonial-text">"{t.comment}"</p>
                            <div className="testimonial-author">
                                <p className="author-name">— {t.user?.name || 'Anonymous'}</p>
                                {t.service?.name && <p className="author-service">{t.service.name}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button className="page-btn" onClick={handlePrev} disabled={currentIndex === 0} aria-label="Previous">←</button>
                    <div className="page-numbers">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`page-number ${i === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button className="page-btn" onClick={handleNext} disabled={currentIndex === totalPages - 1} aria-label="Next">→</button>
                </div>
            )}
        </div>
    );
};

export default Testimonials;

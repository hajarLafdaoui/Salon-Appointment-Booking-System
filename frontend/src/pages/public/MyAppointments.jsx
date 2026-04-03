import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Star } from 'lucide-react';
import './MyAppointments.css';

const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="star-input">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hovered || value) ? 'filled' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                >
                    <Star size={28} fill={star <= (hovered || value) ? '#f59e0b' : 'none'} />
                </button>
            ))}
        </div>
    );
};

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [reviewedIds, setReviewedIds] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const { token } = useAuth();
    const { showToast } = useToast();

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/appointments/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) { setAppointments([]); return; }
            const data = await response.json();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewedIds = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/reviews/my-reviewed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReviewedIds(data);
            }
        } catch (error) {
            console.error('Error fetching reviewed IDs:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAppointments();
            fetchReviewedIds();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleCancelClick = (app) => {
        setSelectedAppointment(app);
        setShowCancelModal(true);
    };

    const confirmCancellation = async () => {
        if (!selectedAppointment) return;
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setShowCancelModal(false);
                setSelectedAppointment(null);
                showToast('Appointment cancelled successfully', 'success');
                fetchAppointments();
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to cancel appointment', 'error');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    };

    const openReviewModal = (app) => {
        setReviewTarget(app);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (reviewRating === 0) {
            showToast('Please select a star rating', 'error');
            return;
        }
        setReviewSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointmentId: reviewTarget._id,
                    rating: reviewRating,
                    comment: reviewComment
                })
            });
            if (response.ok) {
                showToast('Review submitted! Thank you 🎉', 'success');
                setShowReviewModal(false);
                setReviewedIds(prev => [...prev, reviewTarget._id]);
            } else {
                const err = await response.json();
                showToast(err.message || 'Failed to submit review', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const filterAppointments = () => {
        const now = new Date();
        if (activeTab === 'upcoming') {
            return appointments.filter(app => (app.status === 'pending' || app.status === 'confirmed') && new Date(app.date) >= now);
        } else if (activeTab === 'completed') {
            return appointments.filter(app => app.status === 'completed' || (new Date(app.date) < now && app.status !== 'cancelled'));
        } else {
            return appointments.filter(app => app.status === 'cancelled');
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredList = filterAppointments();

    return (
        <div className="my-appointments-container">
            <Navbar />
            <div className="appointments-content">
                <div className="appointments-header">
                    <h1>My Appointments</h1>
                    <p>View and manage your salon bookings.</p>
                </div>

                <div className="appointment-tabs">
                    <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                    <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Past</button>
                    <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
                </div>

                {loading ? (
                    <div className="skeleton-list">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-avatar"></div>
                                <div className="skeleton-info">
                                    <div className="skeleton-line short"></div>
                                    <div className="skeleton-line long"></div>
                                    <div className="skeleton-line medium"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredList.length > 0 ? (
                    <div className="appointments-list">
                        {filteredList.map((app) => {
                            const isReviewed = reviewedIds.includes(app._id);
                            return (
                                <div key={app._id} className="appointment-card">
                                    <div className="appointment-info">
                                        <div className="staff-img-wrapper">
                                            <img
                                                src={app.staff?.image || "https://via.placeholder.com/80"}
                                                alt={app.staff?.name}
                                                className="staff-img"
                                            />
                                        </div>
                                        <div className="details-wrapper">
                                            <span className="staff-name">{app.staff?.name} • {app.staff?.specialty}</span>
                                            <h3 className="service-name">{app.service?.name}</h3>
                                            <span className="appointment-time">{formatDate(app.date)}</span>
                                            <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                        </div>
                                    </div>
                                    <div className="appointment-actions">
                                        <span className="price-tag">${app.service?.price}</span>
                                        {activeTab === 'upcoming' && app.status !== 'cancelled' && (
                                            <button className="cancel-btn" onClick={() => handleCancelClick(app)}>
                                                Cancel Booking
                                            </button>
                                        )}
                                        {app.status === 'completed' && (
                                            isReviewed ? (
                                                <div className="reviewed-badge">✓ Reviewed</div>
                                            ) : (
                                                <button className="leave-review-btn" onClick={() => openReviewModal(app)}>
                                                    ⭐ Leave Review
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No appointments found</h3>
                        <p>You don't have any {activeTab} appointments at the moment.</p>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content cancellation-modal">
                        <div className="modal-icon-wrapper"><span className="modal-icon">⚠️</span></div>
                        <h2>Cancel Appointment?</h2>
                        <p className="modal-description">
                            Are you sure you want to cancel your <strong>{selectedAppointment?.service?.name}</strong> with <strong>{selectedAppointment?.staff?.name}</strong>?
                        </p>
                        <div className="modal-details">
                            <div className="detail-item">
                                <span className="detail-label">Date & Time:</span>
                                <span className="detail-value">{formatDate(selectedAppointment?.date)}</span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Appointment</button>
                            <button className="modal-btn-danger" onClick={confirmCancellation}>Confirm Cancellation</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && reviewTarget && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h2>Leave a Review</h2>
                            <button className="review-close-btn" onClick={() => setShowReviewModal(false)}>×</button>
                        </div>
                        <div className="review-service-info">
                            <span className="review-service-name">{reviewTarget.service?.name}</span>
                            <span className="review-staff-name">with {reviewTarget.staff?.name}</span>
                        </div>
                        <div className="review-rating-section">
                            <p className="rating-label">Your Rating</p>
                            <StarRating value={reviewRating} onChange={setReviewRating} />
                            <p className="rating-hint">
                                {reviewRating === 0 && 'Tap a star to rate'}
                                {reviewRating === 1 && 'Poor'}
                                {reviewRating === 2 && 'Fair'}
                                {reviewRating === 3 && 'Good'}
                                {reviewRating === 4 && 'Very Good'}
                                {reviewRating === 5 && 'Excellent! ✨'}
                            </p>
                        </div>
                        <div className="review-comment-section">
                            <label>Your Comment (optional)</label>
                            <textarea
                                rows={4}
                                placeholder="Share your experience with other clients..."
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                            />
                        </div>
                        <button
                            className="submit-review-btn"
                            onClick={submitReview}
                            disabled={reviewSubmitting}
                        >
                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyAppointments;

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import './MyAppointments.css';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab ] = useState('upcoming');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const { token } = useAuth();
    const { showToast } = useToast();

    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/appointments/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData.message);
                setAppointments([]);
                return;
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setAppointments(data);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAppointments();
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
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
                    <button 
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Past
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        Cancelled
                    </button>
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
                        {filteredList.map((app) => (
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
                                        <span className={`status-badge status-${app.status}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <span className="price-tag">${app.service?.price}</span>
                                    {activeTab === 'upcoming' && app.status !== 'cancelled' && (
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => handleCancelClick(app)}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No appointments found</h3>
                        <p>You don't have any {activeTab} appointments at the moment.</p>
                    </div>
                )}
            </div>

            {/* Cancellation Confirmation Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content cancellation-modal">
                        <div className="modal-icon-wrapper">
                            <span className="modal-icon">⚠️</span>
                        </div>
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
                            <button className="modal-btn-secondary" onClick={() => setShowCancelModal(false)}>
                                Keep Appointment
                            </button>
                            <button className="modal-btn-danger" onClick={confirmCancellation}>
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyAppointments;

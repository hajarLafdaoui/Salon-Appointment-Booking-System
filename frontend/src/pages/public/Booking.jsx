import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Booking.css';
import placeholderImage from '../../assets/images/Hair.jpg';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const Booking = () => {

    const { serviceId: urlServiceId } = useParams();
    const [selectedService, setSelectedService] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [currentStep, setCurrentStep] = useState(urlServiceId ? 2 : 1);
    const [selectedDetailsStaff, setSelectedDetailsStaff] = useState(null);

    // Date & Time state
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedTime, setSelectedTime] = useState(null);
    const [showMoreSlots, setShowMoreSlots] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [services, setServices] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [staffPage, setStaffPage] = useState(1);
    const staffPerPage = 4;
    const [servicePage, setServicePage] = useState(1);
    const servicePerPage = 6;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'];

    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Check for staffId passed via state (from Staff Page)
    useEffect(() => {
        if (location.state?.staffId) {
            setSelectedStaff(location.state.staffId);
            setCurrentStep(3);
        }
    }, [location.state]);

    // Fetch staff from backend
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/staff');
                if (!response.ok) throw new Error("Failed to fetch staff");
                const data = await response.json();
                // API now returns { staff: [...], ... }
                setStaffMembers(Array.isArray(data) ? data : (data.staff || []));
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    // Fetch services from backend
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/services');
                if (!res.ok) throw new Error('Failed to fetch services');
                const data = await res.json();
                setServices(data);
                
                if (urlServiceId) {
                    const matched = data.find(s => s._id === urlServiceId);
                    if (matched) {
                        setSelectedService(urlServiceId);
                        setCurrentStep(2);
                    }
                }
            } catch (err) {
                console.error('Error fetching services:', err);
                showToast('Error fetching services.', 'error');
            }
        };
        fetchServices();
    }, [urlServiceId]);

    // Fetch booked slots for selected staff and date
    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (!selectedStaff || !selectedDate) return;
            setBookedSlots([]); // Clear previous slots while loading new ones
            try {
                // Formatting date to YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/appointments/staff/${selectedStaff}?date=${dateStr}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch booked slots');
                const data = await response.json();
                
                // Assuming data is an array of appointments, extract the times
                const times = data.map(app => {
                    const d = new Date(app.date);
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                });
                setBookedSlots(times);
            } catch (error) {
                console.error("Error fetching booked slots:", error);
                showToast('Error fetching booked slots.', 'error');
            }
        };

        fetchBookedSlots();
    }, [selectedStaff, selectedDate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    /* ─── Icons ─── */
    const CheckmarkIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );

    const ThreeDotsIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
        </svg>
    );

    /* ─── Staff handlers ─── */
    const handleMenuClick = (e, staffId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === staffId ? null : staffId);
    };

    const handleBookNow = (e, staffId) => {
        e.stopPropagation();
        setSelectedStaff(staffId);
        setActiveMenu(null);
        setCurrentStep(3);
    };

    const handleOpenDetails = (staff) => {
        setSelectedDetailsStaff(staff);
    };

    const handleCloseDetails = () => {
        setSelectedDetailsStaff(null);
    };

    const handleViewDetails = (e, staff) => {
        e.stopPropagation();
        setActiveMenu(null);
        handleOpenDetails(staff);
    };

    /* ─── Navigation handlers ─── */
    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedService) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!selectedStaff) return;
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!selectedDate || !selectedTime) return;
            if (!selectedService) {
                showToast('Please select a service before confirming.', 'info');
                setCurrentStep(1);
                return;
            }
            setCurrentStep(4);
        } else if (currentStep === 4) {
            handleConfirm();
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setBookingError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                const msg = 'You must be logged in to book an appointment.';
                setBookingError(msg);
                showToast(msg, 'error');
                setIsSubmitting(false);
                return;
            }

            // Build ISO date-time string: selectedDate + selectedTime (HH:MM)
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const appointmentDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                hours,
                minutes,
                0
            );

            // Pick selected service
            const serviceId = selectedService;
            if (!serviceId) {
                const msg = 'Please select a service first.';
                setBookingError(msg);
                showToast(msg, 'error');
                setIsSubmitting(false);
                return;
            }

            const body = {
                staffId: selectedStaff,
                serviceId,
                date: appointmentDate.toISOString(),
                notes: '',
            };

            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.message || 'Failed to create appointment.';
                console.error('Appointment creation failed:', data);
                setBookingError(errMsg);
                showToast(`Booking failed: ${errMsg}`, 'error');
                setIsSubmitting(false);
                return;
            }

            // Success
            console.log('Appointment created successfully:', data);
            showToast('✅ Booking confirmed! Your appointment has been saved.', 'success');
            setBookingConfirmed(true);

        } catch (err) {
            console.error('Unexpected error during booking:', err);
            const errMsg = 'An unexpected error occurred. Please try again.';
            setBookingError(errMsg);
            showToast(`Error: ${errMsg}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/services');
        }
    };

    /* ─── Date/Time helpers ─── */
    const MONTH_NAMES = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ];
    const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const buildDays = () => {
        const days = [];
        const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
        const startDate = isCurrentMonth
            ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
            : new Date(viewYear, viewMonth, 1);
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const getDayLabel = (date) => {
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diff = Math.round((d - t) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        return DAY_NAMES[date.getDay()];
    };

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    const prevMonth = () => {
        if (isCurrentMonth) return;
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedTime(null);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedTime(null);
    };

    // Mock time slots
    const ALL_SLOTS = [
        '07:00','07:15','07:30','07:45',
        '08:30','08:45','09:15','09:45',
        '10:00','10:30','11:00','11:15',
        '11:30','11:45','12:00','12:30',
    ];
    const VISIBLE_COUNT = 10;
    const slots = showMoreSlots ? ALL_SLOTS : ALL_SLOTS.slice(0, VISIBLE_COUNT);
    const hiddenCount = ALL_SLOTS.length - VISIBLE_COUNT;

    const formatSelectedDateTime = () => {
        if (!selectedDate || !selectedTime) return null;
        const monthName = MONTH_NAMES[selectedDate.getMonth()];
        const dateNum = selectedDate.getDate();
        const dayName = DAY_NAMES[selectedDate.getDay()];
        const [h, m] = selectedTime.split(':').map(Number);
        const endMin = m + 15;
        const endH = h + (endMin >= 60 ? 1 : 0);
        const endM = endMin % 60;
        const pad = n => String(n).padStart(2, '0');
        return `${dayName}, ${monthName} ${dateNum}, ${selectedTime} - ${pad(endH)}:${pad(endM)}`;
    };

    const visibleDays = buildDays();
    const filteredServices = services.filter(s => selectedCategory === 'All' || s.category === selectedCategory);

    /* ─── Confirm Step helpers ─── */
    const selectedStaffObj = staffMembers.find(s => s._id === selectedStaff);
    const selectedServiceObj = services.find(s => s._id === selectedService);

    const formatConfirmDate = () => {
        if (!selectedDate) return '';
        const day = DAY_NAMES[selectedDate.getDay()];
        const month = MONTH_NAMES[selectedDate.getMonth()];
        const date = selectedDate.getDate();
        const year = selectedDate.getFullYear();
        return `${day}, ${month} ${date}, ${year}`;
    };

    const formatConfirmTime = () => {
        if (!selectedTime) return '';
        const [h, m] = selectedTime.split(':').map(Number);
        const endMin = m + 45; // ~45 min service
        const endH = h + Math.floor(endMin / 60);
        const endM = endMin % 60;
        const pad = n => String(n).padStart(2, '0');
        return `${selectedTime} – ${pad(endH)}:${pad(endM)}`;
    };

    const bookingRef = `SLN-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    /* ─── Confirm Step UI ─── */
    const ConfirmStep = () => (
        <div className="confirm-wrapper">

            {/* Summary card */}
            <div className="confirm-card">
                <div className="confirm-card-header">
                    <span className="confirm-card-title">Booking Summary</span>
                    <span className="confirm-badge">Review</span>
                </div>

                <div className="confirm-rows">

                    {/* Service row */}
                    <div className="confirm-row">
                        <div className="confirm-row-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                                <path d="M8 12h8M12 8v8"/>
                            </svg>
                        </div>
                        <div className="confirm-row-content">
                            <span className="confirm-row-label">Service</span>
                            <span className="confirm-row-value">{selectedServiceObj?.name || 'Hair Styling'}</span>
                            <span className="confirm-row-sub">~{selectedServiceObj?.duration || 45} minutes · From ${selectedServiceObj?.price || 45}</span>
                        </div>
                        <button className="confirm-edit-btn" onClick={() => setCurrentStep(1)}>Edit</button>
                    </div>

                    <div className="confirm-divider-row" />

                    {/* Staff row */}
                    <div className="confirm-row">
                        <div className="confirm-row-avatar">
                            <img
                                src={selectedStaffObj?.image || placeholderImage}
                                alt={selectedStaffObj?.name}
                            />
                        </div>
                        <div className="confirm-row-content">
                            <span className="confirm-row-label">Specialist</span>
                            <span className="confirm-row-value">{selectedStaffObj?.name || 'Any Available'}</span>
                            <span className="confirm-row-sub">{selectedStaffObj?.specialty || ''}</span>
                        </div>
                        <button className="confirm-edit-btn" onClick={() => setCurrentStep(2)}>Edit</button>
                    </div>

                    <div className="confirm-divider-row" />

                    {/* Date row */}
                    <div className="confirm-row">
                        <div className="confirm-row-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div className="confirm-row-content">
                            <span className="confirm-row-label">Date</span>
                            <span className="confirm-row-value">{formatConfirmDate()}</span>
                        </div>
                        <button className="confirm-edit-btn" onClick={() => setCurrentStep(3)}>Edit</button>
                    </div>

                    <div className="confirm-divider-row" />

                    {/* Time row */}
                    <div className="confirm-row">
                        <div className="confirm-row-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div className="confirm-row-content">
                            <span className="confirm-row-label">Time</span>
                            <span className="confirm-row-value">{formatConfirmTime()}</span>
                        </div>
                        <button className="confirm-edit-btn" onClick={() => setCurrentStep(3)}>Edit</button>
                    </div>

                </div>
            </div>

            {/* Price summary */}
            <div className="confirm-price-card">
                <div className="confirm-price-row">
                    <span>{selectedServiceObj?.name || 'Service'}</span>
                    <span>${selectedServiceObj?.price || '0.00'}.00</span>
                </div>
                <div className="confirm-price-row">
                    <span>Service Fee</span>
                    <span>$2.50</span>
                </div>
                <div className="confirm-price-divider" />
                <div className="confirm-price-row confirm-price-total">
                    <span>Total</span>
                    <span>${(selectedServiceObj?.price || 0) + 2.5}.50</span>
                </div>
            </div>

            {/* Policy notice */}
            <div className="confirm-policy">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Free cancellation up to <strong>24 hours</strong> before your appointment. By confirming, you agree to our <a href="#">booking policy</a>.</span>
            </div>

        </div>
    );

    /* ─── Booking Success Screen ─── */
    const BookingSuccessScreen = () => (
        <div className="success-screen">
            <div className="success-checkmark">
                <svg viewBox="0 0 52 52" className="success-svg">
                    <circle className="success-circle" cx="26" cy="26" r="25" fill="none"/>
                    <polyline className="success-check" points="14,27 22,35 38,17" fill="none"/>
                </svg>
            </div>
            <h2 className="success-title">Booking Confirmed!</h2>
            <p className="success-sub">Your appointment has been successfully booked.</p>

            <div className="success-ref-box">
                <span className="success-ref-label">Booking Reference</span>
                <span className="success-ref-code">{bookingRef}</span>
            </div>

            <div className="success-details">
                <div className="success-detail-item">
                    <span className="success-detail-label">Service</span>
                    <span className="success-detail-value">{selectedServiceObj?.name || 'Service'}</span>
                </div>
                <div className="success-detail-item">
                    <span className="success-detail-label">Specialist</span>
                    <span className="success-detail-value">{selectedStaffObj?.name || 'Any Available'}</span>
                </div>
                <div className="success-detail-item">
                    <span className="success-detail-label">Date</span>
                    <span className="success-detail-value">{formatConfirmDate()}</span>
                </div>
                <div className="success-detail-item">
                    <span className="success-detail-label">Time</span>
                    <span className="success-detail-value">{formatConfirmTime()}</span>
                </div>
                <div className="success-detail-item">
                    <span className="success-detail-label">Total Paid</span>
                    <span className="success-detail-value success-detail-price">${(selectedServiceObj?.price || 0) + 2.5}.50</span>
                </div>
            </div>

            <div className="success-actions">
                <button className="success-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                <button className="success-btn-secondary" onClick={() => { setBookingConfirmed(false); setCurrentStep(2); setSelectedStaff(null); setSelectedTime(null); setSelectedDate(today); }}>Book Another</button>
            </div>
        </div>
    );

    /* ─── DateTimePicker ─── */
    const DateTimePicker = () => (
        <div className="dtp-wrapper">
            {/* Month navigator */}
            <div className="dtp-month-nav">
                <button
                    className={`dtp-month-btn${isCurrentMonth ? ' dtp-month-btn--disabled' : ''}`}
                    onClick={prevMonth}
                    disabled={isCurrentMonth}
                >&#8249;</button>
                <span className="dtp-month-label">{MONTH_NAMES[viewMonth]}, {viewYear}</span>
                <button className="dtp-month-btn" onClick={nextMonth}>&#8250;</button>
            </div>

            {/* Day strip */}
            <div className="dtp-day-strip">
                {visibleDays.map((day, i) => {
                    const active = isSameDay(day, selectedDate);
                    return (
                        <button
                            key={i}
                            className={`dtp-day-cell${active ? ' dtp-day-cell--active' : ''}`}
                            onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                        >
                            <span className="dtp-day-name">{getDayLabel(day)}</span>
                            <span className="dtp-day-num">{day.getDate()}</span>
                            {active && <span className="dtp-day-underline" />}
                        </button>
                    );
                })}
            </div>

            <div className="dtp-divider" />

            {/* Time slots */}
            <div className="dtp-slots-grid">
                {slots.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                        <button
                            key={slot}
                            className={`dtp-slot${selectedTime === slot ? ' dtp-slot--active' : ''}${isBooked ? ' dtp-slot--disabled' : ''}`}
                            onClick={() => !isBooked && setSelectedTime(slot)}
                            disabled={isBooked}
                        >
                            {slot}
                        </button>
                    );
                })}
            </div>

            {/* Show more */}
            {hiddenCount > 0 && (
                <button className="dtp-show-more" onClick={() => setShowMoreSlots(s => !s)}>
                    {showMoreSlots ? 'Show less' : 'Show more slots'}
                    <span className="dtp-show-more-arrow">{showMoreSlots ? ' ▲' : ' ▼'}</span>
                    {!showMoreSlots && <span className="dtp-available">({hiddenCount} available)</span>}
                </button>
            )}

            {/* Currently selected */}
            {selectedDate && selectedTime && (
                <div className="dtp-selected-bar">
                    <span className="dtp-selected-label">Currently Selected:</span>
                    <div className="dtp-selected-value">
                        <span className="dtp-clock-icon">🕐</span>
                        <strong>{formatSelectedDateTime()}</strong>
                    </div>
                </div>
            )}
        </div>
    );

    /* ─── Main render ─── */
    return (
        <div className="booking-viewport">
            <Navbar />
            <div className={`booking-container ${selectedDetailsStaff ? 'sidebar-open' : ''}`}>

                {/* Sidebar Steps */}
                <div className="booking-sidebar">
                    <div className="steps-container">

                        <div className={`booking-stepp ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : ''}`}>
                            <div className="step-number">{currentStep > 1 ? <CheckmarkIcon /> : '1'}</div>
                            <div className="step-label">SERVICE</div>
                        </div>

                        <div className={`booking-stepp ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : ''}`}>
                            <div className="step-number">{currentStep > 2 ? <CheckmarkIcon /> : '2'}</div>
                            <div className="step-label">STAFF</div>
                        </div>

                        <div className={`booking-stepp ${currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : ''}`}>
                            <div className="step-number">{currentStep > 3 ? <CheckmarkIcon /> : '3'}</div>
                            <div className="step-label">DATE &amp; TIME</div>
                        </div>

                        <div className={`booking-stepp ${bookingConfirmed ? 'completed' : currentStep === 4 ? 'active' : ''}`}>
                            <div className="step-number">{bookingConfirmed ? <CheckmarkIcon /> : '4'}</div>
                            <div className="step-label">CONFIRM</div>
                        </div>

                    </div>
                </div>

                {/* Main Content */}
                <div className="booking-main-content">
                    {currentStep === 1 && (
                        <>
                            <div className="booking-header">
                                <h2>Select a Service</h2>
                                <p>Choose the service you would like to book today.</p>
                            </div>
                            
                            <div className="booking-category-tabs">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => { setSelectedCategory(cat); setServicePage(1); }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="service-selection-grid">
                                {filteredServices
                                    .slice((servicePage - 1) * servicePerPage, servicePage * servicePerPage)
                                    .map(service => (
                                        <div 
                                            key={service._id} 
                                            className={`service-selection-card ${selectedService === service._id ? 'selected' : ''}`}
                                            onClick={() => { setSelectedService(service._id); setCurrentStep(2); }}
                                        >
                                            <div className="service-selection-content">
                                                <h3 className="service-selection-name">{service.name}</h3>
                                                <p className="service-selection-price">${service.price}</p>
                                                <p className="service-selection-duration">{service.duration} min</p>
                                            </div>
                                            {service.image && (
                                                <div className="service-selection-image">
                                                    <img src={service.image} alt={service.name} />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>

                            {filteredServices.length > servicePerPage && (
                                <div className="pagination">
                                    <button 
                                        className="pagination-prev" 
                                        disabled={servicePage === 1}
                                        onClick={() => setServicePage(p => Math.max(1, p - 1))}
                                    >
                                        <img src={leftArrow} alt="Prev" className="pagination-icon" />
                                    </button>
                                    <div className="pagination-pages">
                                        {Array.from({ length: Math.ceil(filteredServices.length / servicePerPage) }).map((_, i) => (
                                            <button 
                                                key={i} 
                                                className={`pagination-num ${servicePage === i + 1 ? 'active' : ''}`}
                                                onClick={() => setServicePage(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        className="pagination-btn pagination-next"
                                        disabled={servicePage === Math.ceil(filteredServices.length / servicePerPage)}
                                        onClick={() => setServicePage(p => Math.min(Math.ceil(filteredServices.length / servicePerPage), p + 1))}
                                    >
                                        <img src={rightArrow} alt="Next" className="pagination-icon" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="booking-header">
                                <h2>Select a Specialist</h2>
                                <p>Choose who you would like to book your service with.</p>
                            </div>
                            {loading ? (
                                <div className="loading">Loading staff members...</div>
                            ) : (
                                <>
                                    <div className="staff-grid-two-columns">
                                        {staffMembers
                                            .slice((staffPage - 1) * staffPerPage, staffPage * staffPerPage)
                                            .map((staff) => (
                                                <div
                                                    key={staff._id}
                                                    className={`staff-card-compact ${selectedStaff === staff._id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedStaff(staff._id)}
                                                >
                                                    <div className="staff-image-small">
                                                        <img src={staff.image || placeholderImage} alt={staff.name} className="staff-image" />
                                                    </div>
                                                    <div className="staff-info-compact">
                                                        <h3 className="staff-name-compact">{staff.name}</h3>
                                                        <p className="staff-specialty-compact">{staff.specialty}</p>
                                                        <div className="staff-rating-compact">
                                                            <span>★</span> {staff.rating || "4.9"}
                                                        </div>
                                                    </div>
                                                    <div className="staff-menu-container">
                                                        <button className="three-dots-button" onClick={(e) => handleMenuClick(e, staff._id)}>
                                                            <ThreeDotsIcon />
                                                        </button>
                                                        {activeMenu === staff._id && (
                                                            <div className="staff-menu-dropdown">
                                                                <button className="menu-item" onClick={(e) => handleBookNow(e, staff._id)}>
                                                                    Book with {staff.name?.split(' ')[0]}
                                                                </button>
                                                                <button className="menu-item" onClick={(e) => handleViewDetails(e, staff)}>
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    
                                    {staffMembers.length > staffPerPage && (
                                        <div className="pagination">
                                            <button 
                                                className="pagination-prev" 
                                                disabled={staffPage === 1}
                                                onClick={() => setStaffPage(prev => Math.max(1, prev - 1))}
                                            >
                                                <img src={leftArrow} alt="Prev" className="pagination-icon" />
                                            </button>
                                            
                                            <div className="pagination-pages">
                                                {Array.from({ length: Math.ceil(staffMembers.length / staffPerPage) }).map((_, i) => (
                                                    <button 
                                                        key={i} 
                                                        className={`pagination-num ${staffPage === i + 1 ? 'active' : ''}`}
                                                        onClick={() => setStaffPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <button 
                                                className="pagination-btn pagination-next"
                                                disabled={staffPage === Math.ceil(staffMembers.length / staffPerPage)}
                                                onClick={() => setStaffPage(prev => Math.min(Math.ceil(staffMembers.length / staffPerPage), prev + 1))}
                                            >
                                                <img src={rightArrow} alt="Next" className="pagination-icon" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="booking-header">
                                <h2>Select Date &amp; Time</h2>
                                <p>Pick a convenient time for your appointment.</p>
                            </div>
                            <DateTimePicker />
                        </>
                    )}

                    {currentStep === 4 && (
                        <>
                            {bookingConfirmed ? (
                                <BookingSuccessScreen />
                            ) : (
                                <>
                                    <div className="booking-header">
                                        <h2>Confirm Booking</h2>
                                        <p>Review your details below before confirming your appointment.</p>
                                    </div>
                                    <ConfirmStep />
                                </>
                            )}
                        </>
                    )}

                    {/* Navigation Buttons */}
                    {!bookingConfirmed && (
                        <div className="navigation-buttons">
                            <button className="back-button" onClick={handleBack}>Back</button>
                            <button
                                className={`next-button${isSubmitting ? ' next-button--loading' : ''}`}
                                disabled={
                                    (currentStep === 1 && !selectedService) ||
                                    (currentStep === 2 && !selectedStaff) ||
                                    (currentStep === 3 && (!selectedDate || !selectedTime)) ||
                                    isSubmitting
                                }
                                onClick={handleNext}
                            >
                                {currentStep === 4
                                    ? (isSubmitting ? 'Confirming…' : 'Confirm Booking')
                                    : 'Next'
                                }
                            </button>
                        </div>
                    )}

                </div>

                {/* Staff Details Sidebar */}
                {selectedDetailsStaff && (
                    <aside className="staff-details-sidebar">
                        <div className="sidebar-header">
                            <button className="close-sidebar" onClick={handleCloseDetails}>×</button>
                            <div className="sidebar-profile-main">
                                <div className="sidebar-avatar-wrapper">
                                    <img src={selectedDetailsStaff.image || placeholderImage} alt={selectedDetailsStaff.name} />
                                    <span className="availability-dot"></span>
                                </div>
                                <div className="sidebar-info-main">
                                    <h2>{selectedDetailsStaff.name}</h2>
                                    <span className="sidebar-specialty-tag">{selectedDetailsStaff.specialty}</span>
                                    <div className="sidebar-rating">
                                        <span className="stars">★★★★★</span>
                                        <span className="rating-num">{selectedDetailsStaff.rating || '4.9'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-scroll-content">
                            <div className="sidebar-section">
                                <h3>About Specialist</h3>
                                <p className="sidebar-bio-full">{selectedDetailsStaff.bio}</p>
                            </div>

                            <div className="sidebar-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{selectedDetailsStaff.experienceYears || '0'}y+</span>
                                    <span className="stat-label">Exp</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">1.2k+</span>
                                    <span className="stat-label">Clients</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{selectedDetailsStaff.rating || '4.9'}</span>
                                    <span className="stat-label">Rating</span>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <div className="section-header-flex">
                                    <h3>Recent Work</h3>
                                    <button className="see-all-link">See All</button>
                                </div>
                                <div className="work-gallery-grid">
                                    {selectedDetailsStaff.portfolioImages && selectedDetailsStaff.portfolioImages.length > 0 ? (
                                        selectedDetailsStaff.portfolioImages.map((img, idx) => (
                                            <div key={idx} className="work-item-thumb"><img src={img} alt="Work" /></div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="work-item-thumb"><img src={placeholderImage} alt="Work" /></div>
                                            <div className="work-item-thumb"><img src={placeholderImage} alt="Work" /></div>
                                            <div className="work-item-thumb"><img src={placeholderImage} alt="Work" /></div>
                                            <div className="work-item-thumb"><img src={placeholderImage} alt="Work" /></div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h3>Contact Info</h3>
                                <div className="contact-list">
                                    {selectedDetailsStaff.websiteUrl && (
                                        <div className="contact-item">
                                            <span className="contact-icon">🌐</span>
                                            <span className="contact-text">{selectedDetailsStaff.websiteUrl}</span>
                                        </div>
                                    )}
                                    <div className="contact-item">
                                        <span className="contact-icon">📧</span>
                                        <span className="contact-text">{selectedDetailsStaff.user?.email || `hello@${selectedDetailsStaff.name.toLowerCase().replace(' ', '')}.com`}</span>
                                    </div>
                                    <div className="contact-item">
                                        <span className="contact-icon">📞</span>
                                        <span className="contact-text">{selectedDetailsStaff.phoneNumber || '+1 (555) 123-4567'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-footer">
                            <button 
                                className="sidebar-book-btn"
                                onClick={() => {
                                    handleBookNow(null, selectedDetailsStaff._id);
                                    handleCloseDetails();
                                }}
                            >
                                Book Appointment
                            </button>
                        </div>
                    </aside>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Booking;
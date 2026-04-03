import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import placeholderImage from '../../assets/images/Hair.jpg';
import searchIcon from '../../assets/icons/search.png';
import downIcon from '../../assets/icons/down.png';
import './Staff.css';

// Memoized Staff Card for zero-lag rendering
const StaffProfileCard = memo(({ staff, onBook, onDetails }) => {
    const hasValidImage = staff.image && !staff.image.includes('via.placeholder.com') && staff.image.trim() !== '';

    return (
        <div className="staff-profile-card">
            {hasValidImage && (
                <div className="card-image-wrapper">
                    <img 
                        src={staff.image} 
                        alt={staff.name} 
                        className="staff-profile-img"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="staff-rating-badge">
                        <span>★</span> {staff.rating || '4.9'}
                    </div>
                </div>
            )}
            
            <div className="card-details">
                <div className="card-header-info" style={!hasValidImage ? { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } : {}}>
                    <div>
                        <h3 className="staff-full-name">{staff.name}</h3>
                        <span className="staff-specialty-primary">{staff.specialty}</span>
                    </div>
                    {!hasValidImage && (
                        <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#2d2d2d', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '50px'}}>
                            <span style={{color: '#f1c40f'}}>★</span> {staff.rating || '4.9'}
                        </div>
                    )}
                </div>
                
                <p className="staff-bio">{staff.bio}</p>
                
                <div className="card-actions">
                    <button 
                        className="staff-book-btn"
                        onClick={() => onBook(staff._id)}
                    >
                        Book Now
                    </button>
                    <button 
                        className="staff-secondary-btn"
                        onClick={() => onDetails(staff)}
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
});

const Staff = ({ isLandingPage = false }) => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [selectedDetailsStaff, setSelectedDetailsStaff] = useState(null);
    const [prefetchedData, setPrefetchedData] = useState({});
    
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 300); // Snappier search
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Main Fetch logic with "Background Refresh" pattern
    useEffect(() => {
        const fetchStaff = async () => {
            if (staffMembers.length === 0) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            try {
                const cacheKey = `${page}-${debouncedSearch}-${specialty}`;
                if (prefetchedData[cacheKey]) {
                    setStaffMembers(prefetchedData[cacheKey].staff);
                    setPages(prefetchedData[cacheKey].pages);
                    setLoading(false);
                    setIsRefreshing(false);
                    return;
                }

                const queryParams = new URLSearchParams({
                    page,
                    limit: isLandingPage ? 4 : 8,
                    name: debouncedSearch,
                    specialty: specialty
                });
                
                const response = await fetch(`http://localhost:5000/api/staff?${queryParams}`);
                if (!response.ok) throw new Error("Failed to fetch staff");
                const data = await response.json();
                
                setStaffMembers(data.staff || []);
                setPages(data.pages || 1);
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
                setIsRefreshing(false);
            }
        };
        fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, specialty, isLandingPage, prefetchedData]); // Fixed dependency

    // Pre-fetching Next Page logic
    useEffect(() => {
        if (page < pages && !isLandingPage) {
            const prefetchNext = async () => {
                const nextPage = page + 1;
                const cacheKey = `${nextPage}-${debouncedSearch}-${specialty}`;
                if (prefetchedData[cacheKey]) return;

                const queryParams = new URLSearchParams({
                    page: nextPage,
                    limit: 8,
                    name: debouncedSearch,
                    specialty: specialty
                });

                try {
                    const response = await fetch(`http://localhost:5000/api/staff?${queryParams}`);
                    if (response.ok) {
                        const data = await response.json();
                        setPrefetchedData(prev => ({ ...prev, [cacheKey]: data }));
                    }
                } catch (e) {}
            };
            const timer = setTimeout(prefetchNext, 1000);
            return () => clearTimeout(timer);
        }
    }, [page, pages, debouncedSearch, specialty, isLandingPage, prefetchedData]);

    const handleBookNow = useCallback((staffId) => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { 
                    from: '/booking',
                    staffId: staffId,
                    message: 'Please log in first to book an appointment'
                } 
            });
            return;
        }
        navigate('/booking', { state: { staffId: staffId } });
    }, [isAuthenticated, navigate]);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= pages) {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: 'instant' });
        }
    }, [pages]);

    const handleOpenDetails = useCallback((staff) => {
        setSelectedDetailsStaff(staff);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedDetailsStaff(null);
    }, []);

    const staffGrid = useMemo(() => {
        if (loading) {
            return (
                <div className="staff-premium-grid">
                    {[...Array(isLandingPage ? 4 : 8)].map((_, i) => (
                        <div key={i} className="shimmer-card"></div>
                    ))}
                </div>
            );
        }

        if (staffMembers.length === 0) {
            return (
                <div className="no-staff-found">
                    <h3>No beauty specialists found matching your search.</h3>
                    <button 
                        className="reset-btn"
                        onClick={() => {
                            setSearchQuery('');
                            setSpecialty('');
                            setPage(1);
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            );
        }

        return (
            <div className={`staff-premium-grid ${isRefreshing ? 'refreshing' : ''}`}>
                {isRefreshing && <div className="background-refresh-bar"></div>}
                {staffMembers.map((staff) => (
                    <StaffProfileCard 
                        key={staff._id} 
                        staff={staff} 
                        onBook={handleBookNow} 
                        onDetails={handleOpenDetails} 
                    />
                ))}
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffMembers, loading, isRefreshing, isLandingPage, handleBookNow, handleOpenDetails, searchQuery, specialty]);

    return (
        <div className={`staff-page ${isLandingPage ? 'is-landing' : ''}`}>
            {!isLandingPage && <Navbar />}
            
            <header className="staff-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Our Artisans</h1>
                    <p className="hero-subtitle">Discover our curated team of beauty specialists dedicated to your transformation.</p>
                    
                    <div className="staff-filters-container">
                        <div className="specialty-filter-wrapper">
                            <select 
                                className="specialty-filter"
                                value={specialty}
                                onChange={(e) => {
                                    setSpecialty(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All Categories</option>
                                <option value="Hair">Hair</option>
                                <option value="Skincare">Skincare</option>
                                <option value="Nails">Nails</option>
                                <option value="Makeup">Makeup</option>
                                <option value="Brows & Lashes">Brows & Lashes</option>
                                <option value="Spa & Massage">Spa & Massage</option>
                            </select>
                            <img src={downIcon} alt="Down" className="select-arrow-icon" />
                        </div>
                        <div className="search-box">
                            <img src={searchIcon} alt="Search" className="search-icon-img" />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className={`staff-main-layout ${selectedDetailsStaff ? 'sidebar-open' : ''}`}>
                <div className="staff-content-area">
                    <div className="staff-container">
                        {staffGrid}

                        {staffMembers.length > 0 && pages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    className="page-btn"
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                >
                                    ←
                                </button>
                                
                                <div className="page-numbers">
                                    {[...Array(pages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`page-number ${page === i + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    className="page-btn"
                                    disabled={page === pages}
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>

                    <section className="join-team-section">
                        <div className="join-content">
                            <h2>Want to join our team?</h2>
                            <p>We're always looking for talented artisans to join our community.</p>
                            <button className="join-btn" onClick={() => navigate('/apply')}>Apply Now</button>
                        </div>
                    </section>
                </div>

                {/* Staff Details Sidebar */}
                {selectedDetailsStaff && (
                    <aside className="staff-details-sidebar">
                        <div className="sidebar-header">
                            <button className="close-sidebar" onClick={handleCloseDetails}>×</button>
                            <div className="sidebar-profile-main">
                                <div className="sidebar-avatar-wrapper">
                                    {selectedDetailsStaff.image && !selectedDetailsStaff.image.includes('via.placeholder.com') ? (
                                        <img src={selectedDetailsStaff.image} alt={selectedDetailsStaff.name} />
                                    ) : (
                                        <div style={{width: '100%', height: '100%', borderRadius: '20px', background: '#bf5128', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold'}}>
                                            {selectedDetailsStaff.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
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
                                    handleCloseDetails();
                                    handleBookNow(selectedDetailsStaff._id);
                                }}
                            >
                                Book Appointment
                            </button>
                        </div>
                    </aside>
                )}
            </main>
            {!isLandingPage && <Footer />}
        </div>
    );
};

export default Staff;

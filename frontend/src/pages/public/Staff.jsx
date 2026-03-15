import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import placeholderImage from '../../assets/images/Hair.jpg';
import searchIcon from '../../assets/icons/search.png';
import downIcon from '../../assets/icons/down.png';
import './Staff.css';

const Staff = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [selectedDetailsStaff, setSelectedDetailsStaff] = useState(null);
    const navigate = useNavigate();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page,
                    limit: 8,
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
            }
        };
        fetchStaff();
    }, [page, debouncedSearch, specialty]);

    const handleBookNow = (staffId) => {
        navigate('/booking', { state: { staffId: staffId } });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pages) {
            setPage(newPage);
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

    const handleOpenDetails = (staff) => {
        setSelectedDetailsStaff(staff);
    };

    const handleCloseDetails = () => {
        setSelectedDetailsStaff(null);
    };

    return (
        <div className="staff-page">
            <Navbar />
            
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
                                <option value="">All Specialties</option>
                                <option value="Hair Stylist">Hair Stylist</option>
                                <option value="Colorist">Colorist</option>
                                <option value="Makeup Artist">Makeup Artist</option>
                                <option value="Nail Technician">Nail Technician</option>
                                <option value="Esthetician">Esthetician</option>
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
                        {loading ? (
                            <div className="staff-premium-grid">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="shimmer-card"></div>
                                ))}
                            </div>
                        ) : staffMembers.length > 0 ? (
                            <>
                                <div className="staff-premium-grid">
                                    {staffMembers.map((staff) => (
                                        <div key={staff._id} className="staff-profile-card">
                                            <div className="card-image-wrapper">
                                                <img 
                                                    src={staff.image || placeholderImage} 
                                                    alt={staff.name} 
                                                    className="staff-profile-img"
                                                />
                                                <div className="staff-rating-badge">
                                                    <span>★</span> {staff.rating || '4.9'}
                                                </div>
                                            </div>
                                            
                                            <div className="card-details">
                                                <div className="card-header-info">
                                                    <h3 className="staff-full-name">{staff.name}</h3>
                                                    <span className="staff-specialty-primary">{staff.specialty}</span>
                                                </div>
                                                
                                                <p className="staff-bio">{staff.bio}</p>
                                                
                                                <div className="card-actions">
                                                    <button 
                                                        className="staff-book-btn"
                                                        onClick={() => handleBookNow(staff._id)}
                                                    >
                                                        Book Now
                                                    </button>
                                                    <button 
                                                        className="staff-secondary-btn"
                                                        onClick={() => handleOpenDetails(staff)}
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {pages > 1 && (
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
                            </>
                        ) : (
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
                        )}
                    </div>

                    <section className="join-team-section">
                        <div className="join-content">
                            <h2>Want to join our team?</h2>
                            <p>We're always looking for talented artisans to join our community.</p>
                            <button className="join-btn">Apply Now</button>
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
        </div>
    );
};

export default Staff;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';
import './BrowseServices.css';

const BrowseServices = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredServices, setFilteredServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 3 rows x 4 columns
    const gridWrapperRef = React.useRef(null);

    const categories = ['All', 'Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'];

    const { data: services, loading, error } = useFetch(
        selectedCategory === 'All'
            ? '/api/services'
            : `/api/services?category=${selectedCategory}`
    );

    const handleBookClick = (serviceId) => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { 
                    from: `/booking/${serviceId}`,
                    message: 'Please log in first to book an appointment'
                } 
            });
        } else {
            navigate(`/booking/${serviceId}`);
        }
    };

    useEffect(() => {
        if (services) {
            let filtered = services;
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                filtered = services.filter(service => 
                    service.name.toLowerCase().includes(query) ||
                    (service.description && service.description.toLowerCase().includes(query))
                );
            }
            setFilteredServices(filtered);
            setCurrentPage(1);
        }
    }, [services, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServices = filteredServices.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        gridWrapperRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goPrev = () => {
        setCurrentPage((p) => Math.max(1, p - 1));
        gridWrapperRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goNext = () => {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
        gridWrapperRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="browse-services-page">
            <Navbar />

            {/* Header Controls - Categories & Search */}
            <div className="browse-header-controls">
                <div className="category-tabs-container">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="service-search-input" 
                        placeholder="Search services..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="services-container">
                {loading && <div className="loading">Loading services...</div>}
                {error && <div className="error">Failed to load services</div>}

                {!loading && filteredServices.length === 0 && (
                    <div className="no-services">No services available in this category.</div>
                )}

                {!loading && filteredServices.length > 0 && (
                    <>
                        <div className="services-grid-wrapper" ref={gridWrapperRef}>
                            <div className="services-grid">
                                {currentServices.map((service) => (
                                    <div key={service._id} className="service-card">
                                        <div className="service-card-content">
                                            <div className="service-header">
                                                <h3 className="service-name">{service.name}</h3>
                                                {service.duration && (
                                                    <div className="service-duration">
                                                        <svg className="watch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                        <span>{service.duration} min</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="service-spacer" />
                                            <p className="service-price">${service.price}</p>
                                            <button
                                                className="service-book-link"
                                                onClick={() => handleBookClick(service._id)}
                                            >
                                                Book appointment
                                            </button>
                                        </div>
                                        {service.image && (
                                            <div className="service-image-wrapper">
                                                <img
                                                    src={service.image}
                                                    alt={service.name}
                                                    className="service-image"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination - Previous | 1 2 3 | Next */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    type="button"
                                    className="pagination-prev"
                                    onClick={goPrev}
                                    disabled={currentPage <= 1}
                                >
                                    <img src={leftArrow} alt="Previous" className="pagination-icon" />
                                </button>
                                <div className="pagination-pages">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            className={`pagination-num ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => handlePageChange(page)}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="pagination-next"
                                    onClick={goNext}
                                    disabled={currentPage >= totalPages}
                                >
                                    <img src={rightArrow} alt="Next" className="pagination-icon" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BrowseServices;

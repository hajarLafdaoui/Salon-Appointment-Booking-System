import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useFetch } from '../../hooks/useFetch';
import leftArrow from '../../assets/icons/left-arrow.png';
import rightArrow from '../../assets/icons/right-arrow.png';
import './BrowseServices.css';

const BrowseServices = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
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

    useEffect(() => {
        if (services) {
            setFilteredServices(services);
            setCurrentPage(1);
        }
    }, [services]);

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

            {/* Category Tabs - Below Navbar on new line */}
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
                                            <h3 className="service-name">{service.name}</h3>
                                            <div className="service-spacer" />
                                            <p className="service-price">${service.price}</p>
                                            <Link
                                                to={`/booking/${service._id}`}
                                                className="service-book-link"
                                            >
                                                Book appointment
                                            </Link>
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
        </div>
    );
};

export default BrowseServices;

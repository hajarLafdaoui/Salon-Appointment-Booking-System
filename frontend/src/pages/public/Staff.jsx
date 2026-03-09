import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import './Staff.css';

const Staff = () => {
    const staffMembers = [
        {
            id: 1,
            name: 'Anna Smith',
            title: 'Senior Hair Stylist',
            specialties: ['Haircuts', 'Coloring', 'Styling'],
            rating: 4.8,
            reviews: 156
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            title: 'Skincare Specialist',
            specialties: ['Facials', 'Treatments', 'Skincare'],
            rating: 4.9,
            reviews: 203
        },
        {
            id: 3,
            name: 'Emma Davis',
            title: 'Nail Technician',
            specialties: ['Manicure', 'Pedicure', 'Nail Art'],
            rating: 4.7,
            reviews: 189
        }
    ];

    return (
        <div className="staff-page">
            <Navbar />

            {/* Staff Section */}
            <div className="staff-section">
                <div className="staff-header">
                    <h2 className="staff-title">Meet Our Team</h2>
                    <p className="staff-subtitle">Experienced professionals dedicated to making you look and feel your best.</p>
                </div>

                <div className="staff-grid">
                    {staffMembers.map((member) => (
                        <div key={member.id} className="staff-card">
                            <div className="staff-avatar">
                                <div className="avatar-circle"></div>
                            </div>
                            <div className="staff-info">
                                <h3 className="staff-name">{member.name}</h3>
                                <p className="staff-title-text">{member.title}</p>

                                <div className="staff-specialties">
                                    {member.specialties.map((specialty, index) => (
                                        <span key={index} className="specialty-tag">{specialty}</span>
                                    ))}
                                </div>

                                <div className="staff-rating">
                                    <span className="rating-stars">⭐ {member.rating}</span>
                                    <span className="rating-count">({member.reviews})</span>
                                </div>

                                <Link to="/booking" className="book-button">Book Now</Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="staff-footer">
                    <Link to="/staff" className="see-more-link">See All Staff →</Link>
                </div>
            </div>
        </div>
    );
};

export default Staff;

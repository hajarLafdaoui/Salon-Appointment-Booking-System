import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useToast } from '../../context/ToastContext';
import './ApplyStaff.css';

const ApplyStaff = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experienceYears: '',
        bio: '',
        portfolioLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok) {
                showToast('Application submitted successfully! We will contact you soon.', 'success');
                navigate('/');
            } else {
                showToast(data.message || 'Failed to submit application', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Network error while submitting application', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="apply-page">
            <Navbar />
            <div className="apply-container">
                <div className="apply-header">
                    <h2>Join Our Talent Network</h2>
                    <p>Apply to become part of our elite salon staff</p>
                </div>

                <div className="apply-form-wrapper">
                    <form onSubmit={handleSubmit} className="apply-form">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Sarah Ahmed" />
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="sarah@mail.com" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 890" />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Specialty *</label>
                                <select name="specialty" value={formData.specialty} onChange={handleChange} required>
                                    <option value="" disabled>Select your specialty...</option>
                                    <option value="Hair">Hair Stylist</option>
                                    <option value="Skincare">Skincare Specialist</option>
                                    <option value="Nails">Nail Technician</option>
                                    <option value="Makeup">Makeup Artist</option>
                                    <option value="Brows & Lashes">Brows & Lashes</option>
                                    <option value="Spa & Massage">Massage Therapist</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Years of Experience *</label>
                                <input type="number" name="experienceYears" min="0" value={formData.experienceYears} onChange={handleChange} required placeholder="e.g. 3" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Short Bio *</label>
                            <textarea 
                                name="bio" 
                                value={formData.bio} 
                                onChange={handleChange} 
                                required 
                                rows="4" 
                                placeholder="Tell us a little about yourself, your style, and what you specialize in..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Portfolio Link (Optional)</label>
                            <input type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
                        </div>

                        <button type="submit" className="submit-app-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ApplyStaff;

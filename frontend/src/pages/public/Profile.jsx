import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdminLayout from '../../components/layout/AdminLayout';
import './Profile.css';

const Profile = () => {
    const { user, token, login } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [stats, setStats] = useState({ appointments: 0, spent: 0 });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            fetchUserStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/appointments/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const totalSpent = data
                    .filter(app => app.status === 'completed')
                    .reduce((sum, app) => sum + (app.service?.price || 0), 0);
                setStats({
                    appointments: data.length,
                    spent: totalSpent
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setRemoveAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            setLoading(false);
            return;
        }

        try {
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('email', formData.email);
            formDataObj.append('phone', formData.phone);
            
            if (formData.newPassword) {
                formDataObj.append('password', formData.newPassword);
            }

            if (avatarFile) {
                formDataObj.append('avatar', avatarFile);
            }
            if (removeAvatar) {
                formDataObj.append('removeAvatar', 'true');
            }

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataObj
            });

            const data = await response.json();

            if (response.ok) {
                login(data, data.token); // Update AuthContext and LocalStorage
                showToast('Profile updated successfully', 'success');
                setEditMode(false);
                setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
                setAvatarFile(null);
                setRemoveAvatar(false);
            } else {
                showToast(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('An error occurred during update', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="profile-loading">Please log in to view profile</div>;

    const renderProfileContent = () => {
        const currentAvatar = avatarPreview || (user.avatar && !removeAvatar ? `http://localhost:5000${user.avatar}` : null);

        return (
        <main className={`profile-content ${user?.role === 'admin' ? 'user-profile-admin' : ''}`}>
            <div className="profile-header-premium">
                <div className="profile-avatar-large">
                    {currentAvatar ? (
                        <img src={currentAvatar} alt="Profile" className="profile-avatar-img" />
                    ) : (
                        user.name?.charAt(0).toUpperCase()
                    )}
                </div>
                {editMode && (
                    <div className="avatar-edit-actions">
                        <label className="btn-upload-avatar">
                            Upload Picture
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display: 'none'}} />
                        </label>
                        {(currentAvatar || user.avatar) && (
                            <button className="btn-remove-avatar" onClick={handleRemoveAvatar}>Remove</button>
                        )}
                    </div>
                )}
                <div className="profile-title-section">
                    <h1>{user.name}</h1>
                    <p className="profile-role-badge">{user.role}</p>
                    <p className="profile-description">Welcome back! Manage your profile information and view your appointment history below.</p>
                </div>
            </div>

            <div className="profile-main-grid">
                {/* Stats Section - Only show for customers, not admins */}
                {(user.role !== 'admin' && user.role !== 'staff') && (
                    <div className="profile-stats-card">
                        <div className="stat-box">
                            <span className="stat-number">{fetching ? '...' : stats.appointments}</span>
                            <span className="stat-label">Total Bookings</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{fetching ? '...' : `$${stats.spent}`}</span>
                            <span className="stat-label">Total Spent</span>
                        </div>
                    </div>
                )}

                {/* Info/Edit Section */}
                <div className="profile-info-card">
                    <div className="card-header">
                        <h2>Personal Information</h2>
                        {!editMode && (
                            <button className="edit-toggle-btn" onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className={`profile-form ${editMode ? 'edit-active' : ''}`}>
                        <div className="form-group-row">
                            <div className="form-input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="form-input-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-input-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    placeholder="Not provided"
                                />
                            </div>
                        </div>

                        {editMode && (
                            <div className="password-update-section">
                                <h3>Change Password <span className="optional">(Leave blank to keep current)</span></h3>
                                <div className="form-group-row">
                                    <div className="form-input-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="form-input-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {editMode && (
                            <div className="form-actions-premium">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setEditMode(false);
                                        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
        );
    };

    if (user.role === 'admin') {
        return <AdminLayout>{renderProfileContent()}</AdminLayout>;
    }

    return (
        <div className="profile-page-container">
            <Navbar />
            {renderProfileContent()}
            <Footer />
        </div>
    );
};

export default Profile;

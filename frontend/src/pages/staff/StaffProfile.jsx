import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Camera, Save, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import { useToast } from '../../context/ToastContext';
import '../admin/Staff.css';
import '../admin/Appointments.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const API = 'http://localhost:5000';

const StaffProfile = () => {
  const { showToast } = useToast();

  const initialForm = useMemo(() => ({
    name: '',
    bio: '',
    workingDays: [],
    workingHours: { start: '09:00', end: '18:00' },
    imagePreview: '',
    imageFile: null,
    newPassword: '',
    confirmPassword: '',
  }), []);

  const [formData, setFormData] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profileSnapshot, setProfileSnapshot] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/staff/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const staff = res.data?.staff;
        const user = res.data?.user;
        setAuthUser(user);

        const snapshot = {
          name: staff?.name || '',
          bio: staff?.bio || '',
          workingDays: staff?.workingDays || [],
          workingHours: staff?.workingHours || { start: '09:00', end: '18:00' },
          imagePreview: staff?.image || '',
          imageFile: null,
          newPassword: '',
          confirmPassword: '',
        };

        setProfileSnapshot(snapshot);
        setFormData(snapshot);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load staff profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData((f) => ({
          ...f,
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    } else if (name === 'start' || name === 'end') {
      setFormData(f => ({ ...f, workingHours: { ...f.workingHours, [name]: value } }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const toggleDay = (day) => {
    setFormData(f => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter(d => d !== day)
        : [...f.workingDays, day],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
      if (formData.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('bio', formData.bio || '');
      fd.append('workingDays', JSON.stringify(formData.workingDays || []));
      fd.append('workingHours', JSON.stringify(formData.workingHours || { start: '09:00', end: '18:00' }));
      if (formData.imageFile) fd.append('image', formData.imageFile);

      const staffRes = await axios.put(`${API}/api/staff/me`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedStaff = staffRes.data?.staff;
      const updatedUserFromStaff = staffRes.data?.user;

      const newSnapshot = {
        name: updatedStaff?.name || formData.name,
        bio: updatedStaff?.bio || formData.bio || '',
        workingDays: updatedStaff?.workingDays || formData.workingDays || [],
        workingHours: updatedStaff?.workingHours || formData.workingHours || { start: '09:00', end: '18:00' },
        imagePreview: updatedStaff?.image || formData.imagePreview || '',
        imageFile: null,
        newPassword: '',
        confirmPassword: '',
      };

      setProfileSnapshot(newSnapshot);
      setAuthUser(updatedUserFromStaff || authUser);
      setFormData((f) => ({ ...f, ...newSnapshot }));

      // Optional password update
      if (formData.newPassword) {
        const passwordRes = await axios.put(
          `${API}/api/auth/profile`,
          {
            name: newSnapshot.name,
            email: updatedUserFromStaff?.email || authUser?.email,
            phone: updatedUserFromStaff?.phone || authUser?.phone,
            password: formData.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (passwordRes.data?.token) localStorage.setItem('token', passwordRes.data.token);
        if (passwordRes.data) localStorage.setItem('user', JSON.stringify(passwordRes.data));
        setAuthUser(passwordRes.data);
      }

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <StaffLayout>
        <div style={{ padding: '1.5rem 0' }}>Loading profile…</div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="appointments-page" style={{ paddingBottom: '3rem' }}>
        <header className="page-header-compact" style={{ marginBottom: '1.25rem' }}>
          <div className="header-titles">
            <h1>Profile</h1>
            <p className="subtitle-block">Update your personal information and availability</p>
          </div>
        </header>

        <motion.div
          className="table-card"
          style={{ padding: 0, overflow: 'hidden' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="table-header">
            <h3>Staff Profile</h3>
          </div>

          <form className="sm-form" onSubmit={handleSave} style={{ paddingTop: '1.2rem' }}>
            {/* Image upload */}
            <div className="sm-image-upload-section">
              <div className="sm-img-preview-wrap">
                <img src={formData.imagePreview} alt="Profile Preview" className="sm-img-preview" />
                <label htmlFor="staffImage" className="sm-img-overlay">
                  <Camera size={18} />
                  <span>Change</span>
                </label>
                <input
                  id="staffImage"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInput}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="sm-img-hint">
                <p className="sm-img-hint-title">Profile Photo</p>
                <p className="sm-img-hint-sub">JPG, PNG or WebP · Max 5MB</p>
              </div>
            </div>

            <div className="sm-form-grid">
              <div className="sm-field">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInput} required />
              </div>

              <div className="sm-field">
                <label>Bio</label>
                <textarea name="bio" rows={2} value={formData.bio} onChange={handleInput} />
              </div>
            </div>

            <div className="sm-section-label">Working Schedule</div>

            <div className="sm-form-grid">
              <div className="sm-field sm-full">
                <label>Working Days</label>
                <div className="sm-day-selector">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`sm-day-chip ${formData.workingDays.includes(day) ? 'sel' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm-field">
                <label>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Start Time
                </label>
                <input type="time" name="start" value={formData.workingHours.start} onChange={handleInput} required />
              </div>

              <div className="sm-field">
                <label>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> End Time
                </label>
                <input type="time" name="end" value={formData.workingHours.end} onChange={handleInput} required />
              </div>
            </div>

            <div className="sm-section-label">Security</div>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInput}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="sm-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInput}
                  placeholder="Re-type new password"
                />
              </div>
            </div>

            <div className="sm-modal-actions">
              <button
                type="button"
                className="sm-btn-cancel"
                onClick={() => setFormData(profileSnapshot || initialForm)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="sm-btn-save" disabled={saving}>
                {saving ? 'Saving...' : <><Save size={16} /> Save Profile</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </StaffLayout>
  );
};

export default StaffProfile;

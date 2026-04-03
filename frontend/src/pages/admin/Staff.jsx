import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Search, Edit2, Trash2, X, AlertTriangle,
  Users, UserCheck, UserX, Clock, Upload,
  MoreVertical, Calendar, Briefcase, ChevronLeft,
  ChevronRight, Power, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { useToast } from '../../context/ToastContext';
import './Staff.css';

const API = 'http://localhost:5000';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultForm = {
  name: '',
  email: '',
  specialty: '',
  bio: '',
  experienceYears: '',
  workingDays: [],
  workingHours: { start: '09:00', end: '18:00' },
  services: [],
  isActive: true,
  imageFile: null,
  password: '',
};

/* ─── Star renderer ─── */
const Stars = ({ rating = 4.5 }) => (
  <div className="s-stars">
    {Array.from({ length: 5 }, (_, i) => {
      const full = i < Math.floor(rating);
      const half = !full && i < rating;
      return (
        <span key={i} className={`s-star ${full ? 'full' : half ? 'half' : ''}`}>★</span>
      );
    })}
    <span className="s-rating-val">{(rating || 4.5).toFixed(1)}</span>
  </div>
);

/* ─── Stat pill ─── */
const StatPill = ({ icon: Icon, label, value, variant }) => (
  <div className={`sm-stat-pill ${variant || ''}`}>
    <div className="sm-stat-icon"><Icon size={16} /></div>
    <div className="sm-stat-text">
      <span className="sm-stat-value">{value}</span>
      <span className="sm-stat-label">{label}</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const StaffAdmin = () => {
  const { showToast } = useToast();
  const location = useLocation();

  const [staffList, setStaffList] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS = 6;

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    fetchStaff();
    fetchServices();
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Set search term from navigation state
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/staff?admin=true`);
      setStaffList(res.data.staff || []);
    } catch {
      showToast('Failed to load staff.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API}/api/services`);
      setAllServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  /* ── Form helpers ── */
  const handleInput = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(f => ({ ...f, imageFile: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    } else if (type === 'checkbox' && name === 'isActive') {
      setFormData(f => ({ ...f, isActive: checked }));
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

  const toggleService = (id) => {
    setFormData(f => ({
      ...f,
      services: f.services.includes(id)
        ? f.services.filter(s => s !== id)
        : [...f.services, id],
    }));
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setImagePreview(null);
    setEditingStaff(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: '',
      specialty: member.specialty,
      bio: member.bio || '',
      experienceYears: member.experienceYears || '',
      workingDays: member.workingDays || [],
      workingHours: member.workingHours || { start: '09:00', end: '18:00' },
      services: (member.services || []).map(s => s._id || s),
      isActive: member.isActive,
      imageFile: null,
      password: '',
    });
    setImagePreview(member.image || null);
    setShowModal(true);
    setActiveMenu(null);
  };

  /* ── CRUD ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('name', formData.name);
      if (!editingStaff) fd.append('email', formData.email);
      fd.append('specialty', formData.specialty);
      fd.append('bio', formData.bio);
      fd.append('experienceYears', formData.experienceYears);
      fd.append('workingDays', JSON.stringify(formData.workingDays));
      fd.append('workingHours', JSON.stringify(formData.workingHours));
      fd.append('services', JSON.stringify(formData.services));
      fd.append('isActive', formData.isActive);
      if (formData.password) fd.append('password', formData.password);
      if (formData.imageFile) fd.append('image', formData.imageFile);

      const cfg = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

      if (editingStaff) {
        await axios.put(`${API}/api/staff/${editingStaff._id}`, fd, cfg);
        showToast('Staff member updated!', 'success');
      } else {
        await axios.post(`${API}/api/staff`, fd, cfg);
        showToast('Staff member added!', 'success');
      }
      fetchStaff();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save staff member.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member) => {
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('isActive', !member.isActive);
      await axios.put(`${API}/api/staff/${member._id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showToast(member.isActive ? 'Staff deactivated.' : 'Staff activated!', 'success');
      fetchStaff();
      setActiveMenu(null);
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/staff/${staffToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Staff member deleted.', 'success');
      fetchStaff();
      setShowDeleteModal(false);
      setStaffToDelete(null);
    } catch {
      showToast('Failed to delete staff.', 'error');
    }
  };

  /* ── Derived state ── */
  const filtered = staffList.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.specialty.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Active' ? m.isActive : !m.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);
  const stats = {
    total: staffList.length,
    active: staffList.filter(m => m.isActive).length,
    inactive: staffList.filter(m => !m.isActive).length,
  };

  /* ─────────────────────────────────────────── */
  return (
    <AdminLayout>
      <div className="sm-container">

        {/* ── PAGE HEADER ── */}
        <div className="sm-header">
          <div className="sm-header-left">
            <h1 className="sm-title">Staff Management</h1>
            <p className="sm-subtitle">Manage your salon team &amp; assign services</p>
          </div>
          <button className="sm-add-btn" onClick={openAdd}>
            <Plus size={17} />
            <span>Add Staff</span>
          </button>
        </div>

        {/* ── STAT PILLS ── */}
        <div className="sm-stats">
          <StatPill icon={Users} label="Total Staff" value={stats.total} variant="neutral" />
          <StatPill icon={UserCheck} label="Active" value={stats.active} variant="green" />
          <StatPill icon={UserX} label="Inactive" value={stats.inactive} variant="red" />
        </div>

        {/* ── TOOLBAR ── */}
        <div className="sm-toolbar">
          <div className="sm-search-wrap">
            <Search className="sm-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by name or specialty…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="sm-clear-search" onClick={() => setSearchTerm('')}><X size={14} /></button>
            )}
          </div>
          <div className="sm-filter-tabs">
            {['All', 'Active', 'Inactive'].map(s => (
              <button
                key={s}
                className={`sm-filter-tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="sm-loading">
            <div className="sm-spinner" />
            <p>Loading staff members…</p>
          </div>
        ) : paginated.length > 0 ? (
          <>
            <motion.div className="sm-grid" layout>
              <AnimatePresence mode="popLayout">
                {paginated.map(member => (
                  <motion.div
                    key={member._id}
                    className="sm-card"
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Status badge */}
                    <span className={`sm-badge ${member.isActive ? 'active' : 'inactive'}`}>
                      <span className="sm-badge-dot" />
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Action menu */}
                    <div className="sm-menu-wrap" ref={activeMenu === member._id ? menuRef : null}>
                      <button
                        className="sm-dots-btn"
                        onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === member._id ? null : member._id); }}
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {activeMenu === member._id && (
                          <motion.div
                            className="sm-dropdown"
                            initial={{ opacity: 0, scale: 0.92, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -6 }}
                            transition={{ duration: 0.15 }}
                          >
                            <button className="sm-dd-item edit" onClick={() => openEdit(member)}>
                              <Edit2 size={13} /> Edit
                            </button>
                            <button className="sm-dd-item toggle" onClick={() => toggleActive(member)}>
                              <Power size={13} />
                              {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="sm-dd-divider" />
                            <button
                              className="sm-dd-item del"
                              onClick={() => { setStaffToDelete(member); setShowDeleteModal(true); setActiveMenu(null); }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <div className="sm-avatar-ring">
                      <img
                        src={
                          member.image && !member.image.includes('placeholder')
                            ? member.image
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b2018&color=f0cb37&size=160&bold=true`
                        }
                        alt={member.name}
                        className="sm-avatar"
                      />
                    </div>

                    {/* Info */}
                    <div className="sm-card-body">
                      <h3 className="sm-card-name">{member.name}</h3>
                      <p className="sm-card-spec">{member.specialty}</p>

                      <Stars rating={member.rating} />

                      <div className="sm-meta-list">
                        <div className="sm-meta-row">
                          <Briefcase size={12} />
                          <span>{member.experienceYears || 0} yrs experience</span>
                        </div>
                        {member.workingHours?.start && (
                          <div className="sm-meta-row">
                            <Clock size={12} />
                            <span>{member.workingHours.start} – {member.workingHours.end}</span>
                          </div>
                        )}
                        {member.workingDays?.length > 0 && (
                          <div className="sm-meta-row">
                            <Calendar size={12} />
                            <span>{member.workingDays.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      {member.services?.length > 0 && (
                        <div className="sm-services">
                          {member.services.slice(0, 3).map(s => (
                            <span key={s._id || s} className="sm-svc-chip">{s.name || s}</span>
                          ))}
                          {member.services.length > 3 && (
                            <span className="sm-svc-chip more">+{member.services.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick action row */}
                    <div className="sm-card-actions">
                      <button className="sm-action-btn edit-btn" onClick={() => openEdit(member)}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        className={`sm-action-btn ${member.isActive ? 'deact-btn' : 'act-btn'}`}
                        onClick={() => toggleActive(member)}
                      >
                        <Power size={13} />
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="sm-action-btn del-btn"
                        onClick={() => { setStaffToDelete(member); setShowDeleteModal(true); }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="sm-pagination">
                <span className="sm-page-info">
                  Showing {(currentPage - 1) * ITEMS + 1}–{Math.min(currentPage * ITEMS, filtered.length)} of {filtered.length}
                </span>
                <div className="sm-page-controls">
                  <button className="sm-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`sm-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                  <button className="sm-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div className="sm-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="sm-empty-icon"><Users size={40} /></div>
            <h3>No staff found</h3>
            <p>
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Add your first staff member to get started.'}
            </p>
            {(searchTerm || filterStatus !== 'All') && (
              <button className="sm-empty-clear" onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}>
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* ── ADD / EDIT MODAL ── */}
        <AnimatePresence>
          {showModal && (
            <div className="sm-overlay" onClick={() => setShowModal(false)}>
              <motion.div
                className="sm-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                {/* Modal Header */}
                <div className="sm-modal-header">
                  <div className="sm-modal-title-wrap">
                    <div className="sm-modal-icon">
                      {editingStaff ? <Edit2 size={18} /> : <Plus size={18} />}
                    </div>
                    <div>
                      <h2 className="sm-modal-title">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                      <p className="sm-modal-sub">Fill in the details below</p>
                    </div>
                  </div>
                  <button className="sm-close-btn" onClick={() => setShowModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form className="sm-form" onSubmit={handleSubmit}>
                  {/* Image upload */}
                  <div className="sm-image-upload-section">
                    <div className="sm-img-preview-wrap">
                      <img
                        src={
                          imagePreview ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'S')}&background=3b2018&color=f0cb37&size=120&bold=true`
                        }
                        alt="Preview"
                        className="sm-img-preview"
                      />
                      <label htmlFor="staffImageInput" className="sm-img-overlay">
                        <Camera size={18} />
                        <span>Change</span>
                      </label>
                      <input
                        type="file"
                        id="staffImageInput"
                        name="image"
                        accept="image/*"
                        onChange={handleInput}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="sm-img-hint">
                      <p className="sm-img-hint-title">Profile Photo</p>
                      <p className="sm-img-hint-sub">JPG, PNG or WebP · Max 5MB</p>
                      <label htmlFor="staffImageInput" className="sm-img-upload-btn">
                        <Upload size={13} /> Upload Photo
                      </label>
                    </div>
                  </div>

                  <div className="sm-form-grid">
                    {/* Name */}
                    <div className="sm-field">
                      <label>Full Name <span className="req">*</span></label>
                      <input type="text" name="name" required placeholder="e.g. Sophie Turner" value={formData.name} onChange={handleInput} />
                    </div>
                    {/* Email (add only) */}
                    {!editingStaff && (
                      <div className="sm-field">
                        <label>Staff Email <span className="req">*</span></label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="e.g. staff@salon.com"
                          value={formData.email}
                          onChange={handleInput}
                        />
                      </div>
                    )}
                    {/* Category (Specialty) */}
                    <div className="sm-field">
                      <label>Category <span className="req">*</span></label>
                      <select name="specialty" required value={formData.specialty} onChange={handleInput}>
                        <option value="" disabled>Select Category</option>
                        {['Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'].map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Password (add only) */}
                    {!editingStaff && (
                      <div className="sm-field">
                        <label>Staff Password <span className="req">*</span></label>
                        <input
                          type="password"
                          name="password"
                          required
                          minLength={6}
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={handleInput}
                        />
                      </div>
                    )}
                    {/* Experience */}
                    <div className="sm-field">
                      <label>Experience (years)</label>
                      <input type="number" name="experienceYears" min="0" max="50" placeholder="5" value={formData.experienceYears} onChange={handleInput} />
                    </div>
                    {/* Status */}
                    <div className="sm-field sm-status-field">
                      <label>Status</label>
                      <div className="sm-toggle-wrap">
                        <button
                          type="button"
                          className={`sm-toggle-btn ${formData.isActive ? 'on' : 'off'}`}
                          onClick={() => setFormData(f => ({ ...f, isActive: !f.isActive }))}
                        >
                          <span className="sm-toggle-thumb" />
                        </button>
                        <span className="sm-toggle-label">{formData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="sm-field sm-full">
                    <label>Bio / Description</label>
                    <textarea name="bio" rows={2} placeholder="Short description about this staff member…" value={formData.bio} onChange={handleInput} />
                  </div>

                  {/* Working Hours */}
                  <div className="sm-section-label">Working Schedule</div>
                  <div className="sm-form-grid">
                    <div className="sm-field">
                      <label>Start Time</label>
                      <input type="time" name="start" value={formData.workingHours.start} onChange={handleInput} />
                    </div>
                    <div className="sm-field">
                      <label>End Time</label>
                      <input type="time" name="end" value={formData.workingHours.end} onChange={handleInput} />
                    </div>
                  </div>

                  {/* Working Days */}
                  <div className="sm-field sm-full">
                    <label>Working Days</label>
                    <div className="sm-day-selector">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`sm-day-chip ${formData.workingDays.includes(day) ? 'sel' : ''}`}
                          onClick={() => toggleDay(day)}
                        >{day}</button>
                      ))}
                    </div>
                  </div>

                  {/* Assign Services */}
                  {allServices.length > 0 && (
                    <div className="sm-field sm-full">
                      <div className="sm-section-label">Assign Services</div>
                      <div className="sm-services-picker">
                        {allServices.map(s => (
                          <button
                            key={s._id}
                            type="button"
                            className={`sm-svc-pick-chip ${formData.services.includes(s._id) ? 'sel' : ''}`}
                            onClick={() => toggleService(s._id)}
                          >
                            {formData.services.includes(s._id) && <span className="sm-svc-check">✓</span>}
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="sm-modal-actions">
                    <button type="button" className="sm-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="sm-btn-save" disabled={saving}>
                      {saving ? (
                        <><span className="sm-btn-spinner" /> Saving…</>
                      ) : (
                        <>{editingStaff ? 'Update Staff' : 'Add Staff'}</>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DELETE MODAL ── */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="sm-overlay" onClick={() => setShowDeleteModal(false)}>
              <motion.div
                className="sm-delete-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
              >
                <div className="sm-del-icon"><AlertTriangle size={28} /></div>
                <h3>Delete Staff Member?</h3>
                <p>
                  You are about to permanently delete <strong>{staffToDelete?.name}</strong>.
                  This action cannot be undone.
                </p>
                <div className="sm-del-actions">
                  <button className="sm-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="sm-btn-del" onClick={confirmDelete}>Yes, Delete</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

export default StaffAdmin;

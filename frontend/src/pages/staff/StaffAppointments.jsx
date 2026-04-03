import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Check,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import Loader from '../../components/ui/Loader';
import { useToast } from '../../context/ToastContext';
import '../admin/Appointments.css';

const API = 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red'
  };
  return (
    <span className={`status-badge ${styles[status] || 'badge-gray'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StaffAppointments = () => {
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/appointments/staff/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load appointments.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [showToast]);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/api/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI state
      setAppointments((prev) => prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app)));
      setSelectedAppointment((prev) => (prev?._id === id ? { ...prev, status: newStatus } : prev));
      setActiveMenu(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update appointment.', 'error');
    }
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <StaffLayout>
      <div className="appointments-page">
        {/* Header Section */}
        <header className="page-header-compact" style={{ marginBottom: '1rem' }}>
          <div className="header-titles">
            <h1>My Appointments</h1>
            <p className="subtitle-block">Manage your assigned bookings</p>
          </div>
        </header>

        {/* Action Bar */}
        <div className="toolbar-compact">
          <div className="search-box-compact">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search customer, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <div className="filter-select">
              <Filter size={16} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Status: All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="table-wrapper-compact shadow-sm">
          {loading ? (
            <Loader message="Loading appointments..." />
          ) : filteredAppointments.length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredAppointments.map((app) => (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td>
                        <div className="td-customer">
                          <div className="td-avatar">
                            {app.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="td-name-stack">
                            <span className="td-name">{app.user?.name}</span>
                            <span className="td-subtitle">{app.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="td-service-cell">
                          <span className="td-service-name">{app.service?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="td-date-cell">
                          <span className="td-date">{new Date(app.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          <span className="td-time">{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                      </td>
                      <td>
                        <span className="td-price">${app.service?.price}</span>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="actions-cell">
                        <div className="menu-container" ref={activeMenu === app._id ? menuRef : null}>
                          <button
                            className="actions-trigger"
                            onClick={() => setActiveMenu(activeMenu === app._id ? null : app._id)}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenu === app._id && (
                            <div className="actions-dropdown-compact">
                              <button onClick={() => {
                                setSelectedAppointment(app);
                                setShowModal(true);
                                setActiveMenu(null);
                              }}>
                                <Eye size={14} /> View Details
                              </button>

                              {app.status === 'pending' && (
                                <button onClick={() => updateStatus(app._id, 'confirmed')} className="confirm-opt">
                                  <Check size={14} /> Accept / Confirm Appointment
                                </button>
                              )}

                              {app.status === 'confirmed' && (
                                <button onClick={() => updateStatus(app._id, 'completed')} className="complete-opt">
                                  <CheckCircle size={14} /> Mark as Completed
                                </button>
                              )}

                              {(app.status === 'pending' || app.status === 'confirmed') && (
                                <button onClick={() => updateStatus(app._id, 'cancelled')} className="cancel-opt">
                                  <XCircle size={14} /> Cancel Appointment
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No appointments found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="details-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h3>Appointment Details</h3>
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>

              <div className="modal-body-compact">
                <div className="modal-header-compact">
                  <div className="compact-avatar">
                    {selectedAppointment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="compact-info">
                    <h4>{selectedAppointment.user?.name}</h4>
                    <p>{selectedAppointment.user?.email}</p>
                  </div>
                </div>

                <div className="compact-details-grid">
                  <div className="compact-detail-item">
                    <span className="label">Service</span>
                    <span className="value">{selectedAppointment.service?.name}</span>
                  </div>
                  <div className="compact-detail-item">
                    <span className="label">Date & Time</span>
                    <span className="value">
                      {new Date(selectedAppointment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {new Date(selectedAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="compact-detail-item">
                    <span className="label">Total Price</span>
                    <span className="value-price">${selectedAppointment.service?.price}</span>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="compact-detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                      <span className="label">Notes</span>
                      <span className="value" style={{ fontStyle: 'italic', fontWeight: 'normal', color: '#64748b' }}>{selectedAppointment.notes}</span>
                    </div>
                  )}
                </div>

                <div className="modal-status-footer">
                  <span className="label">Current Status</span>
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StaffLayout>
  );
};

export default StaffAppointments;

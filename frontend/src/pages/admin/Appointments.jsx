import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Check,
  Calendar,
  Clock,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import Loader from '../../components/ui/Loader';
import './Appointments.css';

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

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Set search term from navigation state
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh local state to reflect update
      setAppointments(appointments.map(app =>
        app._id === id ? { ...app, status: newStatus } : app
      ));
      setActiveMenu(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const exportToCSV = () => {
    if (filteredAppointments.length === 0) return;

    const headers = ['Customer', 'Email', 'Service', 'Staff', 'Date', 'Time', 'Price', 'Status'];
    const csvData = filteredAppointments.map(app => [
      app.user?.name || 'Unknown',
      app.user?.email || 'N/A',
      app.service?.name || 'N/A',
      app.staff?.name || 'Assigned',
      new Date(app.date).toLocaleDateString(),
      new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      app.service?.price || 0,
      app.status
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    // Simple date filter logic
    const appDate = new Date(app.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = appDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'thisWeek') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      matchesDate = appDate >= today && appDate < nextWeek;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  return (
    <AdminLayout>
      <div className="appointments-page">
        {/* Header Section */}
        <header className="page-header-compact">
          <div className="header-titles">
            <h1>Appointments</h1>
            <p className="subtitle-block">Manage and track all bookings</p>
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </header>

        {/* Stats Row */}
        <div className="stats-row-compact">
          <div className="mini-stat-card">
            <div className="mini-icon-circle"><FileText size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Total Appointments</span>
              <span className="mini-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="mini-stat-card border-yellow">
            <div className="mini-icon-circle yellow-bg"><Clock size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Pending</span>
              <span className="mini-stat-value yellow-text">{stats.pending}</span>
            </div>
          </div>
          <div className="mini-stat-card border-blue">
            <div className="mini-icon-circle blue-bg"><CheckCircle size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Confirmed</span>
              <span className="mini-stat-value blue-text">{stats.confirmed}</span>
            </div>
          </div>
          <div className="mini-stat-card border-red">
            <div className="mini-icon-circle red-bg"><XCircle size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Cancelled</span>
              <span className="mini-stat-value red-text">{stats.cancelled}</span>
            </div>
          </div>
        </div>

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

            <div className="filter-select">
              <Calendar size={16} />
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">Date: All Time</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
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
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
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
                        <span className="td-staff-name">{app.staff?.name || 'Assigned'}</span>
                      </td>
                      <td>
                        <div className="td-date-cell">
                          <span className="td-date">{new Date(app.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          <span className="td-time">{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                                  <Check size={14} /> Confirm
                                </button>
                              )}

                              {app.status === 'confirmed' && (
                                <button onClick={() => updateStatus(app._id, 'completed')} className="complete-opt">
                                  <CheckCircle size={14} /> Complete
                                </button>
                              )}

                              {app.status !== 'cancelled' && app.status !== 'completed' && (
                                <button onClick={() => updateStatus(app._id, 'cancelled')} className="cancel-opt">
                                  <XCircle size={14} /> Cancel
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
              <FileText size={48} />
              <h3>No appointments found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        <div className="pagination-compact">
          <p>Showing {filteredAppointments.length} results</p>
          <div className="pagi-buttons">
            <button disabled>Previous</button>
            <button disabled>Next</button>
          </div>
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
                <div className="section-title">Customer</div>
                <div className="modal-header-compact">
                  <div className="compact-avatar">
                    {selectedAppointment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="compact-info">
                    <h4>{selectedAppointment.user?.name}</h4>
                    <p>{selectedAppointment.user?.email}</p>
                  </div>
                </div>

                {selectedAppointment.staff?.name && (
                  <>
                    <div className="section-title">Staff</div>
                    <div className="modal-header-compact staff-section">
                      <div className="compact-avatar staff-avatar">
                        {selectedAppointment.staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="compact-info">
                        <h4>{selectedAppointment.staff.name}</h4>
                        <p>{selectedAppointment.staff.specialty}</p>
                      </div>
                    </div>
                  </>
                )}

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
                </div>

                <div className="modal-status-footer">
                  <span className="label">Current Status</span>
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>

              <div className="modal-footer-compact">
                {selectedAppointment.status === 'pending' && (
                  <button className="btn-primary-compact" onClick={() => {
                    updateStatus(selectedAppointment._id, 'confirmed');
                    setShowModal(false);
                  }}>Confirm Booking</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Appointments;

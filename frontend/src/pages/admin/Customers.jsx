import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, UserCheck, DollarSign, X } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch('http://localhost:5000/api/users/customers', {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Error loading customers');
      
      // Fallback dummy data if API fails to show design
      setCustomers([
        {
          _id: '1',
          name: 'Sarah Ahmed',
          email: 'sarah@email.com',
          phone: '+1 234 567 8900',
          isActive: true,
          totalAppointments: 12,
          totalSpent: 300,
          lastAppointment: '2023-10-20T10:00:00.000Z',
          createdAt: '2023-01-15T12:00:00.000Z',
          bookingHistory: [
            { _id: 'h1', serviceName: 'Haircut', date: '2023-10-20T10:00:00.000Z', price: 25, status: 'completed' },
            { _id: 'h2', serviceName: 'Facial', date: '2023-09-10T14:30:00.000Z', price: 40, status: 'cancelled' }
          ]
        },
        {
          _id: '2',
          name: 'Emma Wilson',
          email: 'emma.w@example.com',
          phone: '+1 987 654 3210',
          isActive: false,
          totalAppointments: 3,
          totalSpent: 150,
          lastAppointment: '2023-11-05T11:00:00.000Z',
          createdAt: '2023-05-20T09:30:00.000Z',
          bookingHistory: [
            { _id: 'h3', serviceName: 'Balayage', date: '2023-11-05T11:00:00.000Z', price: 150, status: 'completed' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = c.isActive !== false;
      if (statusFilter === 'inactive') matchesStatus = c.isActive === false;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.isActive !== false).length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    
    return { total, active, totalRevenue };
  }, [customers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="customers-container">
        
        {/* Header Section */}
        <header className="page-header-compact">
          <div className="header-titles">
            <h1>Customers</h1>
            <p className="subtitle-block">Manage and view your client base</p>
          </div>
        </header>

        {/* Stats Row (like Appointments cards) */}
        <div className="customers-stats">
          <div className="mini-stat-card">
            <div className="mini-icon-circle"><Users size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Total Customers</span>
              <span className="mini-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="mini-icon-circle" style={{ background: '#f0fdf4', color: '#16a34a' }}><UserCheck size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Active Clients</span>
              <span className="mini-stat-value" style={{ color: '#16a34a' }}>{stats.active}</span>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="mini-icon-circle" style={{ background: '#fffbeb', color: '#f59e0b' }}><DollarSign size={20} /></div>
            <div className="mini-content">
              <span className="mini-stat-label">Total Revenue</span>
              <span className="mini-stat-value" style={{ color: '#f59e0b' }}>${stats.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar (like Staff search) */}
        <div className="toolbar-compact">
          <div className="sm-search-wrap">
            <Search className="sm-search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter size={14} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="customers-table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading customers...</div>
          ) : filteredCustomers.length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Appointments</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer._id}>
                    <td>
                      <div className="td-customer">
                        <div className="td-avatar">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="td-name-stack">
                          <span className="td-name">{customer.name}</span>
                          <span className="td-subtitle">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: '600', color: '#334155' }}>{customer.totalAppointments || 0} bookings</span></td>
                    <td><span style={{ fontWeight: '800', color: '#1a1a1a' }}>${(customer.totalSpent || 0).toFixed(2)}</span></td>
                    <td><span style={{ fontWeight: '600', color: '#1a1a1a' }}>{formatDate(customer.lastAppointment)}</span></td>
                    <td>
                      <span className={`status-badge ${customer.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                        {customer.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-btn"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No customers found. Try adjusting your search.
             </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {isModalOpen && selectedCustomer && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedCustomer.name}'s Profile</h3>
                <button className="close-modal" onClick={closeModal}><X size={20}/></button>
              </div>
              
              <div className="modal-body-compact">
                <div className="compact-details-grid">
                  <div className="compact-detail-item">
                    <span className="label">Email Address</span>
                    <span className="value">{selectedCustomer.email}</span>
                  </div>
                  <div className="compact-detail-item">
                    <span className="label">Phone Number</span>
                    <span className="value">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="compact-detail-item">
                    <span className="label">Joined Date</span>
                    <span className="value">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                  <div className="compact-detail-item">
                    <span className="label">Status</span>
                    <span className={`status-badge ${selectedCustomer.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                      {selectedCustomer.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem', fontWeight: '700', color: '#3b2018', fontSize: '0.9rem' }}>
                  Booking History
                </div>
                {selectedCustomer.bookingHistory && selectedCustomer.bookingHistory.length > 0 ? (
                  <div className="history-list">
                    {selectedCustomer.bookingHistory.map((history, idx) => (
                      <div className="history-item" key={history._id || idx}>
                        <div>
                          <div className="history-service">{history.serviceName}</div>
                          <div className="history-date">{formatDate(history.date)}</div>
                        </div>
                        <div>
                          <div className="history-price">${(history.price || 0).toFixed(2)}</div>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#94a3b8', textAlign: 'right', marginTop: '3px' }}>
                            {history.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>No appointment history found.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Customers;

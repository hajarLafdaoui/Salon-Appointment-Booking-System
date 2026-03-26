import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, DollarSign, CheckCircle, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import { useToast } from '../../context/ToastContext';
import '../admin/Dashboard.css';
import '../admin/Appointments.css';

const API = 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';

  return <span className={`status-badge ${styles[status] || 'badge-gray'}`}>{label}</span>;
};

const StatCard = ({ title, value, label, trend, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="stat-card"
  >
    <div className="stat-card-header">
      <div className={`icon-container ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>
          {trend}
        </div>
      )}
    </div>
    <div className="stat-card-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
      <span className="stat-label">{label}</span>
    </div>
  </motion.div>
);

const StaffDashboard = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/staff/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load staff dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [showToast]);

  const stats = data?.stats || {};
  const todayAppointmentsList = data?.todayAppointmentsList || [];

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ padding: '1.5rem 0' }}>Loading staff dashboard…</div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <StatCard 
          title="Today's Appointments" 
          value={stats.todayAppointments} 
          label="Appointments scheduled today" 
          trend="+2 today" 
          icon={Clock}
          color="gold"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value={stats.upcomingAppointments} 
          label="Future bookings" 
          trend="+4 this week" 
          icon={Calendar}
          color="blue"
        />
        <StatCard 
          title="Completed Appointments" 
          value={stats.completedAppointments} 
          label="Total completed so far" 
          trend="+15 this month" 
          icon={CheckCircle}
          color="green"
        />
        <StatCard 
          title="Total Earnings" 
          value={`$${(stats.totalEarnings || 0).toLocaleString()}`} 
          label="Your generated revenue" 
          trend="+$120 this week" 
          icon={DollarSign}
          color="brown"
        />
      </div>

      {/* Today's Schedule Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="table-card"
        style={{ marginTop: '2rem' }}
      >
        <div className="table-header">
          <h3>Today's Schedule</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointmentsList.length > 0 ? todayAppointmentsList.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="time-tag">
                      <Clock size={14} />
                      {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </td>
                  <td>
                    <div className="service-tag">
                      <Scissors size={14} />
                      {app.service?.name}
                    </div>
                  </td>
                  <td>
                    <span className="customer-name" style={{ fontWeight: '600' }}>{app.user?.name}</span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="empty-table">No appointments for today yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </StaffLayout>
  );
};

export default StaffDashboard;

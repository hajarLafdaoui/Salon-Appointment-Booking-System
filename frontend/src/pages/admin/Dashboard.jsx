import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Scissors, 
  Clock, 
  XCircle,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import './Dashboard.css';

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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  const { stats, charts, todayAppointmentsList } = data;

  const COLORS = ['#c9a86a', '#1a1a1a', '#64748b', '#94a3b8', '#cbd5e1'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <AdminLayout>
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard 
              title="Total Appointments" 
              value={stats.totalAppointments} 
              label="All bookings ever" 
              trend="+12 this week" 
              icon={Calendar}
              color="brown"
            />
            <StatCard 
              title="Today's Appointments" 
              value={stats.todayAppointments} 
              label="Today" 
              trend={`${stats.upcomingToday} upcoming now`} 
              icon={Clock}
              color="gold"
            />
            <StatCard 
              title="Total Revenue" 
              value={`$${stats.totalRevenue.toLocaleString()}`} 
              label="Money generated" 
              trend="+$320 this week" 
              icon={DollarSign}
              color="green"
            />
            <StatCard 
              title="Total Customers" 
              value={stats.totalCustomers} 
              label="Users" 
              trend="+5 new" 
              icon={Users}
              color="blue"
            />
            <StatCard 
              title="Active Staff" 
              value={stats.activeStaff} 
              label="Staff currently working" 
              trend="6 Staff Members" 
              icon={Briefcase}
              color="purple"
            />
            <StatCard 
              title="Cancelled Appointments" 
              value={stats.cancelledAppointments} 
              label="Business problem indicator" 
              trend="Down 2% vs last week" 
              icon={XCircle}
              color="red"
            />
          </div>

          <div className="charts-grid">
            {/* Appointments Trend Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="chart-card large"
            >
              <div className="chart-header">
                <h3>Appointments Over Time</h3>
                <p>Last 7 days activity</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={charts.appointmentsTrend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a86a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c9a86a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#c9a86a" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Services Popularity Chart */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="chart-card"
            >
              <div className="chart-header">
                <h3>Popular Services</h3>
                <p>Booking distribution</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.popularServices} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#1a1a1a', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {charts.popularServices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Today's Appointments Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="table-card"
          >
            <div className="table-header">
              <h3>Today's Appointments</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointmentsList.length > 0 ? todayAppointmentsList.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="customer-cell">
                          <div className="small-avatar">
                            {app.user?.name ? app.user.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="customer-info-small">
                            <span className="customer-name">{app.user?.name}</span>
                            <span className="customer-email">{app.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="service-tag">
                          <Scissors size={14} />
                          {app.service?.name}
                        </div>
                      </td>
                      <td>
                        <div className="time-tag">
                          <Clock size={14} />
                          {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Manage</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="empty-table">No appointments for today yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import StaffLayout from '../../components/layout/StaffLayout';
import { useToast } from '../../context/ToastContext';
import '../admin/Appointments.css';
import '../admin/Dashboard.css';
import './StaffSchedule.css';

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

const StaffSchedule = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [todayAppointmentsList, setTodayAppointmentsList] = useState([]);

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/api/staff/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodayAppointmentsList(res.data?.todayAppointmentsList || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load today schedule.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySchedule();
  }, [showToast]);

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const todayApps = useMemo(() => {
    return [...todayAppointmentsList].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [todayAppointmentsList]);

  const morningAppointments = todayApps.filter((a) => new Date(a.date).getHours() < 12);
  const afternoonAppointments = todayApps.filter((a) => new Date(a.date).getHours() >= 12);

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ padding: '1.5rem 0' }}>Loading today schedule…</div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="appointments-page">
        <header className="page-header-compact">
          <div className="header-titles">
            <h1>Today's Schedule</h1>
            <p className="subtitle-block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="table-card"
          style={{ padding: '1.5rem', marginTop: '0.75rem' }}
        >
          <div className="staff-schedule-wrap">
            <div className="staff-schedule-groups">
              <section className="staff-schedule-group">
                <h2 className="staff-schedule-group-title">
                  <span className="staff-schedule-dot" style={{ background: '#f0cb37' }} />
                  Morning
                </h2>

                {morningAppointments.length > 0 ? (
                  <ul className="staff-schedule-list">
                    {morningAppointments.map((app) => (
                      <motion.li
                        key={app._id}
                        className="staff-schedule-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="staff-schedule-item-left">
                          <div className="staff-schedule-time">
                            {formatTime(app.date)}
                          </div>
                          <div className="staff-schedule-text">
                            <div className="staff-schedule-main">{app.service?.name}</div>
                            <div className="staff-schedule-sub">{app.user?.name}</div>
                          </div>
                        </div>
                        <StatusBadge status={app.status} />
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                    <Clock size={34} />
                    <h3>No morning appointments</h3>
                    <p>You're all set.</p>
                  </div>
                )}
              </section>

              <section className="staff-schedule-group">
                <h2 className="staff-schedule-group-title">
                  <span className="staff-schedule-dot" style={{ background: '#3b2018' }} />
                  Afternoon
                </h2>

                {afternoonAppointments.length > 0 ? (
                  <ul className="staff-schedule-list">
                    {afternoonAppointments.map((app) => (
                      <motion.li
                        key={app._id}
                        className="staff-schedule-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="staff-schedule-item-left">
                          <div className="staff-schedule-time">
                            {formatTime(app.date)}
                          </div>
                          <div className="staff-schedule-text">
                            <div className="staff-schedule-main">{app.service?.name}</div>
                            <div className="staff-schedule-sub">{app.user?.name}</div>
                          </div>
                        </div>
                        <StatusBadge status={app.status} />
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                    <Calendar size={34} />
                    <h3>No afternoon appointments</h3>
                    <p>You're all set.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </StaffLayout>
  );
};

export default StaffSchedule;

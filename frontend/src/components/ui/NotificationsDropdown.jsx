import React from 'react';
import { Bell, Check, Circle, Calendar, XCircle, UserPlus, CheckCircle, Clock } from 'lucide-react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ isOpen, onClose, userRole }) => {
  const [notifications, setNotifications] = React.useState([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
        fetchNotifications();
    }
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking_new':
        return <Calendar size={16} className="text-blue-500" />;
      case 'booking_cancel':
        return <XCircle size={16} className="text-red-500" />;
      case 'customer_new':
        return <UserPlus size={16} className="text-green-500" />;
      case 'booking_completed':
        return <CheckCircle size={16} className="text-purple-500" />;
      case 'reminder':
        return <Clock size={16} className="text-orange-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case 'booking_new': return 'bg-blue-100';
      case 'booking_cancel': return 'bg-red-100';
      case 'customer_new': return 'bg-green-100';
      case 'booking_completed': return 'bg-purple-100';
      case 'reminder': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3 className="notifications-title">
          Notifications
          {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={handleMarkAllRead}>
            <Check size={14} />
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">No new notifications</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification._id)}
            >
              <div className={`notification-icon-wrapper ${getIconBackground(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
              </div>
              {!notification.isRead && (
                <div className="notification-unread-dot">
                  <Circle size={8} fill="currentColor" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;

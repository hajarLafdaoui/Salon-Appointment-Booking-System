import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <DashboardHeader user={user} />
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

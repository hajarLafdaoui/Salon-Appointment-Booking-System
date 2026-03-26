import React from 'react';
import StaffSidebar from './StaffSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import './AdminLayout.css';

const StaffLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Staff Member', role: 'staff' };

  return (
    <div className="admin-layout">
      <StaffSidebar />
      <main className="admin-main">
        <DashboardHeader user={user} />
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;

import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const Staff = () => {
  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Staff Members</h1>
        <p>Manage salon specialists</p>
      </div>
      <div className="admin-page-content">
        <div className="placeholder-card">
          <p>Staff management coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Staff;

import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const Customers = () => {
  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Customers</h1>
        <p>Your client list and insights</p>
      </div>
      <div className="admin-page-content">
        <div className="placeholder-card">
          <p>Customer management coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Customers;

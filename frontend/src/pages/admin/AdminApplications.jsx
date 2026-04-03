import React, { useState, useEffect } from 'react';
import { Eye, XCircle, Mail } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useToast } from '../../context/ToastContext';
import './AdminApplications.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setApplications(data);
      } else {
        showToast('Failed to fetch applications', 'error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        showToast('Application rejected.', 'success');
        setSelectedApp(null);
        fetchApplications();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to reject application', 'error');
      }
    } catch (error) {
      console.error('Reject error:', error);
      showToast('Error rejecting application', 'error');
    }
  };

  const buildApprovalEmail = (app) => {
    const subject = encodeURIComponent(`Your Application Has Been Approved – Welcome to the Team!`);
    const body = encodeURIComponent(
      `Hi ${app.name},\n\n` +
      `We are thrilled to inform you that your application for the ${app.specialty} position has been APPROVED! 🎉\n\n` +
      `We were impressed by your experience and look forward to welcoming you to our team.\n\n` +
      `Next Steps:\n` +
      `- We will reach out shortly to schedule your onboarding.\n` +
      `- Please reply to this email to confirm your availability.\n\n` +
      `Warm regards,\n` +
      `The Salon Team`
    );
    return `mailto:${app.email}?subject=${subject}&body=${body}`;
  };

  return (
    <AdminLayout>
      <div className="customers-container">
        <header className="page-header-compact">
          <div className="header-titles">
            <h1>Staff Applications</h1>
            <p className="subtitle-block">Review and process new staff applications.</p>
          </div>
        </header>

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="no-data">No applications found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Experience</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td><div className="user-name">{app.name}</div></td>
                    <td>{app.specialty}</td>
                    <td>{app.experienceYears} yrs</td>
                    <td>{app.email}</td>
                    <td>
                      <span className={`status-badge ${app.status}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view-btn"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedApp && (
        <div className="app-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="app-modal-content" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <div className="app-modal-title-block">
                <h3>Application Details</h3>
                <span className={`status-badge ${selectedApp.status}`}>
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="app-modal-body">
              <div className="detail-grid">
                <div className="detail-row">
                  <strong>Name</strong>
                  <span>{selectedApp.name}</span>
                </div>
                <div className="detail-row">
                  <strong>Email</strong>
                  <a href={`mailto:${selectedApp.email}`}>{selectedApp.email}</a>
                </div>
                <div className="detail-row">
                  <strong>Phone</strong>
                  <span>{selectedApp.phone}</span>
                </div>
                <div className="detail-row">
                  <strong>Specialty</strong>
                  <span>{selectedApp.specialty}</span>
                </div>
                <div className="detail-row">
                  <strong>Experience</strong>
                  <span>{selectedApp.experienceYears} Years</span>
                </div>
                {selectedApp.portfolioLink && (
                  <div className="detail-row">
                    <strong>Portfolio</strong>
                    <a href={selectedApp.portfolioLink} target="_blank" rel="noreferrer">
                      View Portfolio →
                    </a>
                  </div>
                )}
              </div>

              <div className="detail-bio">
                <strong>Bio</strong>
                <p>{selectedApp.bio}</p>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="app-modal-footer">
                <button
                  className="reject-app-btn"
                  onClick={() => handleReject(selectedApp._id)}
                >
                  <XCircle size={16} /> Reject
                </button>

                <a
                  href={buildApprovalEmail(selectedApp)}
                  className="approve-email-btn"
                >
                  <Mail size={16} />
                  Send Approval Email
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminApplications;

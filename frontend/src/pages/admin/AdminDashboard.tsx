import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, Feedback } from '../../api/admin';
import { VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import Icons from '../../components/Icons';
import './AdminPages.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingVendors: 0,
    totalVendors: 0,
    totalFeedbacks: 0,
    totalStudents: 0,
  });
  const [recentVendors, setRecentVendors] = useState<VendorProfile[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await adminAPI.getDashboardStats();
      
      setStats({
        pendingVendors: dashboardStats.pendingVendors,
        totalVendors: dashboardStats.totalVendors,
        totalFeedbacks: dashboardStats.totalFeedbacks,
        totalStudents: dashboardStats.totalStudents,
      });

      setRecentVendors(dashboardStats.recentVendors as any);
      setRecentFeedbacks(dashboardStats.recentFeedbacks as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-badge status-approved';
    if (statusLower === 'pending') return 'status-badge status-pending';
    if (statusLower === 'rejected') return 'status-badge status-rejected';
    if (statusLower === 'resolved') return 'status-badge status-approved';
    if (statusLower === 'forwarded') return 'status-badge status-pending';
    return 'status-badge status-pending';
  };

  const getVendorStatus = (vendor: any) => {
    if (vendor.approved) return 'APPROVED';
    if (vendor.rejectedReason) return 'REJECTED';
    return 'PENDING';
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card stat-card-warning">
          <div className="stat-icon-wrapper stat-icon-warning">
            <Icons name="clock" size={32} />
          </div>
          <h3>Pending Vendors</h3>
          <p className="stat-value stat-value-warning">{stats.pendingVendors}</p>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon-wrapper stat-icon-info">
            <Icons name="store" size={32} />
          </div>
          <h3>Total Vendors</h3>
          <p className="stat-value stat-value-info">{stats.totalVendors}</p>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-icon-wrapper stat-icon-danger">
            <Icons name="file" size={32} />
          </div>
          <h3>Feedback</h3>
          <p className="stat-value stat-value-danger">{stats.totalFeedbacks}</p>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon-wrapper stat-icon-success">
            <Icons name="user" size={32} />
          </div>
          <h3>Total Students</h3>
          <p className="stat-value stat-value-success">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          Recent Activity
        </h2>
        <div className="recent-activity-grid">
          {/* Recent Signups */}
          <div className="recent-activity-card">
            <h3 className="activity-card-title">Recent Signups</h3>
            {recentVendors.length > 0 ? (
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVendors.map((vendor) => (
                      <tr key={vendor._id}>
                        <td>
                          <Link to={`/admin/vendor/${vendor._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            {vendor.businessName}
                          </Link>
                        </td>
                        <td>{vendor.createdAt ? formatDate(vendor.createdAt) : 'N/A'}</td>
                        <td>
                          <span className={getStatusBadgeClass(getVendorStatus(vendor))}>
                            {getVendorStatus(vendor)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-activity">No recent signups</p>
            )}
          </div>

          {/* Recent Feedback */}
          <div className="recent-activity-card">
            <h3 className="activity-card-title">Recent Feedback</h3>
            {recentFeedbacks.length > 0 ? (
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFeedbacks.map((feedback) => (
                      <tr key={feedback._id}>
                        <td>
                          <Link to="/admin/feedback-monitors" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                            {feedback.category}
                          </Link>
                        </td>
                        <td>{formatDate(feedback.createdAt)}</td>
                        <td>
                          <span className={`status-badge status-${feedback.status.toLowerCase()}`}>
                            {feedback.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-activity">No recent feedback</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



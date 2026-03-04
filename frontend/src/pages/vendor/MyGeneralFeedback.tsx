import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../api/vendor';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import './VendorPages.css';

interface Feedback {
  _id: string;
  category: string;
  message: string;
  contactPhone: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

const MyGeneralFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await vendorAPI.getMyGeneralFeedback();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#3b82f6';
      default:
        return '#f59e0b';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">My General Feedback</h1>

      {error && <div className="error-message">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="no-results">
          <p>You haven't submitted any general feedback yet.</p>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Use the Feedback button in the navigation bar to share your thoughts and suggestions.
          </p>
        </div>
      ) : (
        <div className="reports-list">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="report-card">
              <div className="report-info">
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    marginRight: '0.5rem'
                  }}>
                    {feedback.category}
                  </span>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: getStatusColor(feedback.status) + '20',
                    color: getStatusColor(feedback.status)
                  }}>
                    {feedback.status}
                  </span>
                </div>
                <p><strong>Your Feedback:</strong> {feedback.message}</p>
                <p><strong>Submitted:</strong> {new Date(feedback.createdAt).toLocaleString()}</p>
                {feedback.adminReply && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e40af' }}>Admin Reply:</p>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#1e3a8a' }}>{feedback.adminReply}</p>
                    {feedback.repliedAt && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Replied on: {new Date(feedback.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGeneralFeedback;





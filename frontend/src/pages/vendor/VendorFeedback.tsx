import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../api/vendor';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import './VendorPages.css';

interface VendorFeedback {
  _id: string;
  message: string;
  contactPhone?: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  vendorId: string;
}

const VendorFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<VendorFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await vendorAPI.getFeedbacks();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (feedbackId: string) => {
    setProcessing(feedbackId);
    try {
      await vendorAPI.resolveFeedback(feedbackId);
      setFeedbacks(feedbacks.map(f => 
        f._id === feedbackId ? { ...f, status: 'RESOLVED' } : f
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve feedback.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">Customer Feedback</h1>

      {error && <div className="error-message">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="no-results">No feedback to review.</div>
      ) : (
        <div className="reports-list">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="report-card">
              <div className="report-info">
                <p><strong>Feedback:</strong> {feedback.message}</p>
                <p><strong>Status:</strong> <span className={`status-${feedback.status.toLowerCase()}`}>{feedback.status}</span></p>
                <p><strong>Date:</strong> {new Date(feedback.createdAt).toLocaleString()}</p>
                {feedback.contactPhone && (
                  <div style={{ marginTop: '10px' }}>
                    <a 
                      href={`https://wa.me/${feedback.contactPhone.replace(/\D/g,'')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        backgroundColor: '#25D366',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        width: 'fit-content',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Contact Customer ({feedback.contactPhone})
                    </a>
                  </div>
                )}
              </div>
              {feedback.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolve(feedback._id)}
                  className="resolve-button"
                  disabled={processing === feedback._id}
                  title="Mark as Resolved"
                >
                  {processing === feedback._id ? 'Resolving...' : 'Resolve'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorFeedback;





import React, { useState, useEffect } from 'react';
import { adminAPI, Feedback } from '../../api/admin';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import './AdminPages.css';

const FeedbackMonitors: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await adminAPI.getFeedbacks();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    setProcessing(feedbackId);
    try {
      await adminAPI.updateFeedbackStatus(feedbackId, status);
      setFeedbacks(feedbacks.map(f => 
        f._id === feedbackId ? { ...f, status } : f
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update feedback status.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReply = async (feedbackId: string) => {
    if (!replyText.trim()) {
      setError('Please enter a reply.');
      return;
    }

    setReplyingTo(feedbackId);
    setError('');
    try {
      await adminAPI.replyToFeedback(feedbackId, replyText.trim());
      await loadFeedbacks(); // Reload to get the reply
      setShowReplyForm(null);
      setReplyText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setReplyingTo(null);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    setProcessing(feedbackId);
    try {
      await adminAPI.deleteFeedback(feedbackId);
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete feedback.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">Feedback Monitors</h1>

      {error && <div className="error-message">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="no-results">No feedback to review.</div>
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
                    color: '#4338ca'
                  }}>
                    {feedback.category}
                  </span>
                </div>
                <p><strong>Feedback:</strong> {feedback.message}</p>
                <p><strong>Phone:</strong> {feedback.contactPhone}</p>
                <p><strong>Status:</strong> <span className={`status-${feedback.status.toLowerCase()}`}>{feedback.status}</span></p>
                <p><strong>Date:</strong> {new Date(feedback.createdAt).toLocaleString()}</p>
                {feedback.createdBy && (
                  <p><strong>From:</strong> {feedback.createdBy.name} ({feedback.createdBy.role})</p>
                )}
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
              <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select
                    value={feedback.status}
                    onChange={(e) => handleStatusChange(feedback._id, e.target.value as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED')}
                    disabled={processing === feedback._id}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '0.9rem',
                      cursor: processing === feedback._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  {feedback.status === 'RESOLVED' && !feedback.adminReply && (
                    <button
                      onClick={() => setShowReplyForm(showReplyForm === feedback._id ? null : feedback._id)}
                      className="resolve-button"
                      disabled={processing === feedback._id}
                    >
                      {showReplyForm === feedback._id ? 'Cancel Reply' : 'Add Reply'}
                    </button>
                  )}
                  {feedback.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setShowReplyForm(showReplyForm === feedback._id ? null : feedback._id)}
                      className="resolve-button"
                      disabled={processing === feedback._id}
                    >
                      {showReplyForm === feedback._id ? 'Cancel Reply' : 'Reply'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(feedback._id)}
                    className="delete-button"
                    disabled={processing === feedback._id}
                    title="Delete Feedback"
                  >
                    {processing === feedback._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {showReplyForm === feedback._id && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Enter your reply..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <button
                      onClick={() => handleReply(feedback._id)}
                      className="resolve-button"
                      disabled={replyingTo === feedback._id || !replyText.trim()}
                      style={{ width: '100%' }}
                    >
                      {replyingTo === feedback._id ? 'Submitting...' : 'Submit Reply'}
                    </button>
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

export default FeedbackMonitors;





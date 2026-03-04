import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import './VendorPages.css';

const VendorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  // #region agent log
  useEffect(() => {
    const measureSpacing = () => {
      const navbar = document.querySelector('.navbar');
      const layoutMain = document.querySelector('.layout-main');
      const pageContainer = document.querySelector('.page-container');
      const pageTitle = document.querySelector('.page-title');
      
      if (navbar && layoutMain && pageContainer && pageTitle) {
        const navbarRect = navbar.getBoundingClientRect();
        const pageTitleRect = pageTitle.getBoundingClientRect();
        
        const navbarHeight = navbarRect.height;
        const layoutMainPaddingTop = window.getComputedStyle(layoutMain).paddingTop;
        const pageContainerPaddingTop = window.getComputedStyle(pageContainer).paddingTop;
        const pageTitleMarginTop = window.getComputedStyle(pageTitle).marginTop;
        const spacingFromNavbar = pageTitleRect.top - navbarRect.bottom;
        
        fetch('http://127.0.0.1:7242/ingest/f66f5750-cf54-4ed3-b984-2b9a5b6acd7e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'VendorDashboard.tsx:useEffect',
            message: 'Spacing measurements',
            data: {
              navbarHeight,
              navbarBottom: navbarRect.bottom,
              layoutMainPaddingTop,
              pageContainerPaddingTop,
              pageTitleMarginTop,
              pageTitleTop: pageTitleRect.top,
              spacingFromNavbar,
              windowWidth: window.innerWidth,
              isMobile: window.innerWidth <= 768
            },
            timestamp: Date.now(),
            runId: 'initial',
            hypothesisId: 'A,B,C,D,E'
          })
        }).catch(() => {});
      }
    };
    
    // Measure after render
    setTimeout(measureSpacing, 100);
    window.addEventListener('resize', measureSpacing);
    window.addEventListener('scroll', measureSpacing);
    
    return () => {
      window.removeEventListener('resize', measureSpacing);
      window.removeEventListener('scroll', measureSpacing);
    };
  }, []);
  // #endregion

  const loadProfile = async () => {
    try {
      const data = await vendorAPI.getProfile();
      setProfile(data);

      try {
        const feedbacksData = await vendorAPI.getFeedbacks();
        setFeedbacks(feedbacksData);
      } catch (err) {
        console.error("Failed to load feedback", err);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Vendor Dashboard</h1>
      <p className="page-subtitle">Manage your campus storefront from here.</p>

      {error && <div className="error-message">{error}</div>}

      {!profile ? (
        <>
          <div className="no-profile-card">
            <div className="no-profile-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="60" height="50" rx="4" fill="#8B5CF6" opacity="0.2"/>
                <rect x="10" y="20" width="60" height="35" rx="4" fill="#60A5FA"/>
                <rect x="25" y="30" width="15" height="15" rx="2" fill="#1E40AF"/>
                <rect x="45" y="30" width="15" height="15" rx="2" fill="#1E40AF"/>
                <rect x="10" y="20" width="60" height="8" rx="4" fill="#7C3AED"/>
                <text x="40" y="75" textAnchor="middle" fontSize="10" fill="#1E40AF" fontWeight="bold">24 H</text>
              </svg>
            </div>
            <h2 className="no-profile-title">No profile yet</h2>
            <p className="no-profile-description">Set up your vendor profile to start reaching students across campus.</p>
            <Link to="/vendor/profile" className="create-profile-button">
              Create Profile
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          {/* Mobile: Show TOTAL VIEWS card even when no profile */}
          <div className="dashboard-stats-mobile-no-profile">
            <div className="stat-card stat-card-views">
              <h3>TOTAL VIEWS</h3>
              <p>0</p>
            </div>
          </div>
        </>
      ) : (
        <>
        <div className="dashboard-stats">
          <div className="stat-card stat-card-desktop-only">
            <h3>Business Name</h3>
            <p>{profile.businessName}</p>
          </div>
          <div className="stat-card stat-card-desktop-only">
            <h3>Status</h3>
            <span className={`status-badge status-${profile.status.toLowerCase()}`}>
              {profile.status}
            </span>
          </div>
          <div className="stat-card stat-card-desktop-only">
            <h3>Rating</h3>
            <div className="rating-display">
              <div className="rating-stars">
                {Array.from({ length: 5 }, (_, i) => {
                  const rating = profile.rating || 0;
                  const filled = i < Math.floor(rating);
                  const half = i === Math.floor(rating) && rating % 1 >= 0.5;
                  return (
                    <span key={i} className={`star ${filled ? 'filled' : ''} ${half ? 'half' : ''}`}>
                      ★
                    </span>
                  );
                })}
              </div>
              <span className="rating-number">{profile.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="stat-card stat-card-desktop-only">
            <h3>Reviews</h3>
            <p>{profile.reviewCount || 0}</p>
          </div>
          <div className="stat-card stat-card-views">
            <h3>TOTAL VIEWS</h3>
            <p>{profile.viewCount || 0}</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section" style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Quick Actions
          </h2>
          <div className="quick-actions-grid">
            <Link to="/vendor/upload-flyers" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <h3>Upload New Flyer</h3>
              <p>Add new promotional images to showcase your business</p>
            </Link>

            <Link to="/vendor/profile" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Edit Profile Details</h3>
              <p>Update your business information and contact details</p>
            </Link>

            <Link to="/vendor/feedback" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>View Recent Feedback</h3>
              <p>Review and respond to customer feedback and issues</p>
            </Link>
          </div>
        </div>

        {feedbacks.length > 0 && (
          <div className="feedbacks-section" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Customer Feedback</h2>
            <div className="reviews-list">
              {feedbacks.map((feedback) => (
                 <div key={feedback._id} className="review-card" style={{ borderColor: 'var(--primary-500)' }}>
                   <div className="review-header">
                     <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Status: {feedback.status || 'PENDING'}</span>
                     <span className="review-date">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                   <p className="review-comment"><strong>Feedback:</strong> {feedback.message}</p>
                 </div>
              ))}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default VendorDashboard;



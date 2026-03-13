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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Reset copied to clipboard state after 2 seconds
  useEffect(() => {
    if (copiedToClipboard) {
      const timer = setTimeout(() => setCopiedToClipboard(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedToClipboard]);

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

            <button 
              onClick={() => setShowShareModal(true)} 
              className="quick-action-card"
              style={{ 
                cursor: 'pointer'
              }}
            >
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: 'var(--purple-600)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <h3>Share My Store</h3>
              <p>Generate a public link to share your store on social media</p>
            </button>
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

      {/* Share My Store Modal */}
      {showShareModal && profile && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h2>Share Your Store</h2>
              <button 
                className="share-modal-close" 
                onClick={() => setShowShareModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="share-modal-body">
              <p className="share-modal-description">
                Anyone with this link can view your store and products. They'll need to log in to leave reviews or place orders.
              </p>

              <div className="share-link-section">
                <label htmlFor="shareLink" className="share-link-label">Your Public Store Link:</label>
                <div className="share-link-input-wrapper">
                  <input 
                    id="shareLink"
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/vendor/${profile.businessName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="share-link-input"
                  />
                  <button
                    type="button"
                    className={`share-copy-button ${copiedToClipboard ? 'copied' : ''}`}
                    onClick={() => {
                      const link = `${window.location.origin}/vendor/${profile.businessName.toLowerCase().replace(/\s+/g, '-')}`;
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(link)
                          .then(() => {
                            setCopiedToClipboard(true);
                          })
                          .catch(() => {
                            alert('Failed to copy. Please copy manually.');
                          });
                      } else {
                        // fallback for insecure context
                        const input = document.createElement('input');
                        input.value = link;
                        document.body.appendChild(input);
                        input.select();
                        try {
                          document.execCommand('copy');
                          setCopiedToClipboard(true);
                        } catch (err) {
                          alert('Failed to copy. Please copy manually.');
                        }
                        document.body.removeChild(input);
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {copiedToClipboard ? (
                        <path d="M20 6L9 17l-5-5" />
                      ) : (
                        <>
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </>
                      )}
                    </svg>
                    {copiedToClipboard ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {(profile.whatsapp || profile.instagram || profile.snapchat || profile.tiktok || profile.facebook || profile.twitter) && (
                <div className="share-social-section">
                  <p className="share-social-label">Connect on Social Media:</p>
                  <div className="share-social-buttons">
                    {profile.whatsapp && (
                      <a 
                        href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn whatsapp"
                        title="Chat on WhatsApp"
                      >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    )}
                    {profile.instagram && (
                      <a 
                        href={`https://instagram.com/${profile.instagram.replace(/[^a-zA-Z0-9._]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn instagram"
                        title="View on Instagram"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {profile.snapchat && (
                      <a 
                        href={`https://snapchat.com/add/${profile.snapchat.replace(/[^a-zA-Z0-9._-]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn snapchat"
                        title="Add on Snapchat"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.07 2.2c-4.11 0-6.9 2.5-7.1 6.36-.06 1.14.33 2.13.56 2.67.16.38.07.82-.23 1.11-.27.26-1.12.96-1.36 2.37-.13.78.33 1.45.92 1.45.26 0 .5-.11.68-.3.33-.35.65-.67 1.25-.67.36 0 .7.12.98.36.72.6 1.72 1.07 3.6 1.07 1.8 0 2.92-.48 3.64-1.07.28-.24.62-.36.98-.36.6 0 .93.32 1.26.67.18.19.42.3.68.3.6 0 1.05-.67.92-1.45-.24-1.41-1.09-2.11-1.36-2.37-.3-.29-.39-.73-.23-1.11.23-.54.62-1.53.56-2.67-.2-3.86-2.99-6.36-7.1-6.36z"/>
                        </svg>
                      </a>
                    )}
                    {profile.tiktok && (
                      <a 
                        href={`https://tiktok.com/@${profile.tiktok.replace(/[^a-zA-Z0-9._-]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn tiktok"
                        title="Follow on TikTok"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {profile.facebook && (
                      <a 
                        href={profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn facebook"
                        title="Visit Facebook Page"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {profile.twitter && (
                      <a 
                        href={`https://twitter.com/${profile.twitter.replace(/[^a-zA-Z0-9_]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-share-btn twitter"
                        title="Follow on Twitter/X"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="share-modal-note">
                <p>
                  <strong>Note:</strong> Your store page is publicly accessible. Visitors can view your products and information, but must log in to leave reviews or place orders. You maintain full control over your store visibility and can manage it from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;



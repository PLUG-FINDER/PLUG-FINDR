import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, Review } from '../../api/student';
import Loader from '../../components/Loader';
import './StudentPages.css';

const Reviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await studentAPI.getMyReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setDeleting(reviewId);
    try {
      await studentAPI.deleteReview(reviewId);
      // Remove the review from the list
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleting(null);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getVendorName = (review: Review) => {
    if (typeof review.vendor === 'object' && review.vendor?.businessName) {
      return review.vendor.businessName;
    }
    return 'Unknown Vendor';
  };

  const getVendorId = (review: Review) => {
    if (typeof review.vendor === 'object' && review.vendor?._id) {
      return review.vendor._id;
    }
    return review.vendorId || '';
  };

  const getProductName = (review: Review) => {
    if (typeof review.product === 'object' && review.product?.name) {
      return review.product.name;
    }
    return 'Unknown Product';
  };

  // No need for getProductId - not used in the component

  return (
    <div className="page-container">
      <h1 className="page-title">My Reviews</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <Loader />
      ) : reviews.length === 0 ? (
        <div className="no-results">
          <p>You haven't written any reviews yet.</p>
          <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>
            Visit a vendor's page to leave your first review!
          </p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => {
            const isVendorReview = !!review.vendor;
            const isProductReview = !!review.product;
            
            return (
              <div key={review._id} className="review-card">
                <div className="review-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    {isVendorReview ? (
                      <h3 
                        className="review-vendor-name"
                        onClick={() => {
                          const vendorId = getVendorId(review);
                          if (vendorId) navigate(`/student/vendor/${vendorId}`);
                        }}
                        style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                      >
                        {getVendorName(review)}
                      </h3>
                    ) : isProductReview ? (
                      <h3 
                        className="review-vendor-name"
                        onClick={() => {
                          const vendorId = getVendorId(review);
                          if (vendorId) navigate(`/student/vendor/${vendorId}`);
                        }}
                        style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                      >
                        Product: {getProductName(review)}
                      </h3>
                    ) : null}
                    <div className="review-stars">{renderStars(review.rating)}</div>
                    <span className="review-date" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={deleting === review._id}
                    style={{
                      background: deleting === review._id ? '#ccc' : 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      cursor: deleting === review._id ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (deleting !== review._id) {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {deleting === review._id ? (
                      <>Deleting...</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { vendorAPI, VendorProfile, Product } from '../../api/vendor';
import { studentAPI, Review } from '../../api/student';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageUtils';
import {
  getWhatsAppLink,
  getInstagramLink,
  getSnapchatLink,
  getTikTokLink,
  getFacebookLink,
  getTwitterLink,
} from '../../utils/socialMediaUtils';
import { createCountryCodesWithFlags } from '../../utils/countryFlags';
import './StudentPages.css';

const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<Record<string, Review[]>>({});
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [productHoveredRatings, setProductHoveredRatings] = useState<Record<string, number>>({});
  const [productComments, setProductComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [productReviewsLoading, setProductReviewsLoading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [productSuccess, setProductSuccess] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Login Prompt State
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [_pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCountryCode, setFeedbackCountryCode] = useState('+233');
  const [feedbackPhone, setFeedbackPhone] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    if (user?.whatsappNumber) {
      // Extract country code and phone number
      const phone = user.whatsappNumber;
      const countryCodeMatch = phone.match(/^(\+\d{1,4})/);
      if (countryCodeMatch) {
        setFeedbackCountryCode(countryCodeMatch[1]);
        setFeedbackPhone(phone.replace(countryCodeMatch[1], '').replace(/^\s+/, ''));
      } else {
        setFeedbackPhone(phone);
      }
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      loadVendor();
      loadReviews();
      loadProducts();
    }
  }, [id]);

  useEffect(() => {
    // Load reviews for each product
    if (products.length > 0) {
      products.forEach((product) => {
        loadProductReviews(product._id);
      });
    }
  }, [products]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowFeedbackModal(false);
      setPendingAction(() => () => setShowFeedbackModal(true));
      setShowLoginPrompt(true);
      return;
    }
    
    if (!id || !feedbackMessage.trim() || !feedbackPhone.trim()) return;

    setFeedbackSubmitting(true);
    setFeedbackError('');
    try {
      const fullPhoneNumber = `${feedbackCountryCode}${feedbackPhone.replace(/^\+/, '')}`;
      await studentAPI.createVendorFeedback({
        vendorId: id,
        message: feedbackMessage.trim(),
        contactPhone: fullPhoneNumber
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
        setFeedbackMessage('');
        setFeedbackPhone('');
      }, 2000);
    } catch (err: any) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Common country codes with flags
  const countryCodes = createCountryCodesWithFlags([
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+234', country: 'NG' },
    { code: '+233', country: 'GH' },
    { code: '+254', country: 'KE' },
    { code: '+27', country: 'ZA' },
    { code: '+91', country: 'IN' },
    { code: '+86', country: 'CN' },
    { code: '+81', country: 'JP' },
    { code: '+82', country: 'KR' },
    { code: '+61', country: 'AU' },
    { code: '+64', country: 'NZ' },
    { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' },
    { code: '+39', country: 'IT' },
    { code: '+34', country: 'ES' },
    { code: '+31', country: 'NL' },
    { code: '+32', country: 'BE' },
    { code: '+41', country: 'CH' },
    { code: '+46', country: 'SE' },
    { code: '+47', country: 'NO' },
    { code: '+45', country: 'DK' },
    { code: '+358', country: 'FI' },
    { code: '+351', country: 'PT' },
    { code: '+353', country: 'IE' },
    { code: '+48', country: 'PL' },
    { code: '+7', country: 'RU/KZ' },
    { code: '+90', country: 'TR' },
    { code: '+971', country: 'AE' },
    { code: '+966', country: 'SA' },
    { code: '+20', country: 'EG' },
    { code: '+212', country: 'MA' },
    { code: '+255', country: 'TZ' },
    { code: '+256', country: 'UG' },
    { code: '+250', country: 'RW' },
    { code: '+251', country: 'ET' },
  ]);

  const loadVendor = async () => {
    try {
      const data = await vendorAPI.getVendorById(id!);
      setVendor(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendor details.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const data = await studentAPI.getReviews(id);
      setReviews(data);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!id) return;
    try {
      const data = await studentAPI.getVendorProducts(id);
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products:', err);
    }
  };

  const loadProductReviews = async (productId: string) => {
    try {
      setProductReviewsLoading(prev => ({ ...prev, [productId]: true }));
      const data = await studentAPI.getProductReviews(productId);
      setProductReviews(prev => ({ ...prev, [productId]: data }));
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    } finally {
      setProductReviewsLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductReviewSubmit = async (productId: string) => {
    if (!user) {
      setPendingAction(() => () => {
        // Scroll to the product after login
        setTimeout(() => {
          document.querySelector(`[data-product-id="${productId}"]`)?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      });
      setShowLoginPrompt(true);
      return;
    }
    
    const productRating = productRatings[productId] || 0;
    const productComment = productComments[productId] || '';

    if (!productRating) {
      setProductErrors(prev => ({ ...prev, [productId]: 'Please select a rating' }));
      return;
    }

    setProductSubmitting(prev => ({ ...prev, [productId]: true }));
    setProductErrors(prev => ({ ...prev, [productId]: '' }));

    try {
      console.log('Submitting product review:', { productId, rating: productRating, comment: productComment });
      await studentAPI.createProductReview({
        productId,
        rating: productRating,
        comment: productComment
      });
      console.log('✓ Product review submitted successfully');
      setProductSuccess(prev => ({ ...prev, [productId]: true }));
      setProductRatings(prev => ({ ...prev, [productId]: 0 }));
      setProductComments(prev => ({ ...prev, [productId]: '' }));
      await loadProductReviews(productId);
      setTimeout(() => {
        setProductSuccess(prev => ({ ...prev, [productId]: false }));
      }, 3000);
    } catch (err: any) {
      console.error('❌ Product review submission failed:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit review';
      setProductErrors(prev => ({ ...prev, [productId]: errorMsg }));
    } finally {
      setProductSubmitting(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductStarClick = (productId: string, starValue: number) => {
    const currentRating = productRatings[productId] || 0;
    // If clicking the same star that's already selected, deselect it (set to 0)
    if (currentRating === starValue) {
      setProductRatings(prev => ({ ...prev, [productId]: 0 }));
      setProductHoveredRatings(prev => ({ ...prev, [productId]: 0 }));
    } else {
      setProductRatings(prev => ({ ...prev, [productId]: starValue }));
    }
  };

  const handleDeleteReview = async (reviewId: string, productId?: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await studentAPI.deleteReview(reviewId);
      if (productId) {
        // Reload product reviews
        await loadProductReviews(productId);
      } else {
        // Reload vendor reviews
        await loadReviews();
        await loadVendor();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setPendingAction(() => () => {
        // Refocus on review form after login
        setTimeout(() => {
          document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      });
      setShowLoginPrompt(true);
      return;
    }
    
    if (!id) return;

    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      console.log('Submitting vendor review:', { vendorId: id, rating, comment });
      await studentAPI.createReview({ vendorId: id, rating, comment });
      console.log('✓ Vendor review submitted successfully');
      setSuccess(true);
      setComment('');
      setRating(0);
      setHoveredRating(0);
      loadVendor();
      loadReviews();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('❌ Vendor review submission failed:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (starValue: number) => {
    // If clicking the same star that's already selected, deselect it (set to 0)
    if (rating === starValue) {
      setRating(0);
    } else {
      setRating(starValue);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    const displayRating = interactive ? (hoveredRating || rating) : rating;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= displayRating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
          title={interactive && rating === i ? 'Click to unrate' : interactive ? `Rate ${i} star${i > 1 ? 's' : ''}` : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <Loader />;
  if (!vendor) return <div className="error-message">Vendor not found</div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <div className="vendor-detail">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {vendor.businessName}
            {vendor.isMetaVerified && (
              <span style={{ marginLeft: '8px', display: 'inline-flex', verticalAlign: 'middle', color: '#3B82F6' }} title="Verified">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5 12.5C22.5 12.9 22.5 13.2 22.5 13.5C22.5 17.5 19.5 21 15.5 21.5C14.5 21.6 13.5 21.6 12.5 21.5C8.5 21 5.5 17.5 5.5 13.5C5.5 13.2 5.5 12.9 5.5 12.5C5.5 8.5 8.5 5 12.5 4.5C13.5 4.4 14.5 4.4 15.5 4.5C19.5 5 22.5 8.5 22.5 12.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </h1>
          <button 
            onClick={() => {
              if (!user) {
                setPendingAction(() => () => setShowFeedbackModal(true));
                setShowLoginPrompt(true);
              } else {
                setShowFeedbackModal(true);
              }
            }} 
            className="report-btn"
          >
            Feedback
          </button>
        </div>
        
        <div className="vendor-detail-info">
          <p><strong>Category:</strong> {vendor.category}</p>
          
          {/* Location Display */}
          {vendor.hostelName && (
            <div style={{ 
              margin: '1rem 0', 
              padding: '1rem', 
              backgroundColor: 'var(--primary-50)', 
              borderRadius: '8px',
              border: '1px solid var(--primary-200)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--primary-700)', fontSize: '1rem' }}>
                📍 Location Details
              </p>
              {vendor.hostelName && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                  <strong>Hostel:</strong> {vendor.hostelName}
                </p>
              )}
              {vendor.location && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {vendor.location}
                </p>
              )}
            </div>
          )}
          
          {!vendor.hostelName && vendor.location && (
            <p><strong>Location:</strong> {vendor.location}</p>
          )}
          
          <p><strong>Email:</strong> {vendor.contactEmail}</p>
          <p><strong>Phone:</strong> {vendor.contactPhone}</p>
          <div className="vendor-rating">
            <strong>Rating:</strong> {renderStars(Math.round(vendor.rating || 0))} 
            {vendor.rating?.toFixed(1)} ({vendor.reviewCount || 0} reviews)
          </div>
        </div>

        <p className="vendor-description">{vendor.description}</p>

        {(getWhatsAppLink(vendor) || getInstagramLink(vendor) || getSnapchatLink(vendor) || 
          getTikTokLink(vendor) || getFacebookLink(vendor) || getTwitterLink(vendor)) && (
          <div className="vendor-social-media">
            <h3>Connect with us</h3>
            <div className="vendor-social-icons">
              {getWhatsAppLink(vendor) && (
                <a
                  href={getWhatsAppLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon whatsapp"
                  title="Chat on WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
              {getInstagramLink(vendor) && (
                <a
                  href={getInstagramLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon instagram"
                  title="View on Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {getSnapchatLink(vendor) && (
                <a
                  href={getSnapchatLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon snapchat"
                  title="Add on Snapchat"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.07 2.2c-4.11 0-6.9 2.5-7.1 6.36-.06 1.14.33 2.13.56 2.67.16.38.07.82-.23 1.11-.27.26-1.12.96-1.36 2.37-.13.78.33 1.45.92 1.45.26 0 .5-.11.68-.3.33-.35.65-.67 1.25-.67.36 0 .7.12.98.36.72.6 1.72 1.07 3.6 1.07 1.8 0 2.92-.48 3.64-1.07.28-.24.62-.36.98-.36.6 0 .93.32 1.26.67.18.19.42.3.68.3.6 0 1.05-.67.92-1.45-.24-1.41-1.09-2.11-1.36-2.37-.3-.29-.39-.73-.23-1.11.23-.54.62-1.53.56-2.67-.2-3.86-2.99-6.36-7.1-6.36z"/>
                  </svg>
                </a>
              )}
              {getTikTokLink(vendor) && (
                <a
                  href={getTikTokLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon tiktok"
                  title="Follow on TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {getFacebookLink(vendor) && (
                <a
                  href={getFacebookLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon facebook"
                  title="Visit Facebook Page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {getTwitterLink(vendor) && (
                <a
                  href={getTwitterLink(vendor)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon twitter"
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

        {vendor.flyerImages && vendor.flyerImages.length > 0 && (
          <div className="vendor-flyers">
            <h2>Flyers</h2>
            <div className="flyers-grid">
              {vendor.flyerImages.map((image, index) => (
                <div 
                  key={index} 
                  className="flyer-image-wrapper"
                  onClick={() => setSelectedImage(getImageUrl(image))}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Flyer ${index + 1}`} 
                    className="flyer-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error(`[Image Error] Failed to load flyer ${index + 1} for ${vendor.businessName}:`, {
                        originalUrl: image,
                        fullUrl: getImageUrl(image),
                        vendorId: vendor._id
                      });
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(`[Image Success] Loaded flyer ${index + 1} for ${vendor.businessName}:`, getImageUrl(image));
                    }}
                  />
                  <div className="flyer-overlay">
                    <span className="flyer-view-text">Click to view</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="vendor-flyers" style={{ marginTop: '3rem' }}>
            <h2>Market</h2>
            <div className="flyers-grid market-products-grid">
              {products.map((product) => {
                const productReviewList = productReviews[product._id] || [];
                const productRating = productRatings[product._id] || 0;
                const productHoveredRating = productHoveredRatings[product._id] || 0;
                const productComment = productComments[product._id] || '';
                const productError = productErrors[product._id] || '';
                const productSuccessMsg = productSuccess[product._id] || false;
                const isProductSubmitting = productSubmitting[product._id] || false;
                const isProductReviewsLoading = productReviewsLoading[product._id] || false;
                
                // Calculate average rating
                const avgRating = productReviewList.length > 0
                  ? productReviewList.reduce((sum, r) => sum + r.rating, 0) / productReviewList.length
                  : 0;

                return (
                  <div 
                    key={product._id} 
                    className="flyer-image-wrapper"
                    data-product-id={product._id}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name} 
                      className="flyer-image"
                      style={{ height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setSelectedImage(getImageUrl(product.image))}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.error(`[Image Error] Failed to load product image for ${product.name}:`, {
                          originalUrl: product.image,
                          fullUrl: getImageUrl(product.image),
                          productId: product._id
                        });
                        img.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                      onLoad={() => {
                        console.log(`[Image Success] Loaded product image for ${product.name}:`, getImageUrl(product.image));
                      }}
                    />
                    <div className="market-product-content" style={{ padding: '1rem', width: '100%' }}>
                      <h3 className="market-product-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h3>
                      {product.description && (
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {product.description}
                        </p>
                      )}
                      {product.price && (
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--primary-600)' }}>
                          {product.currency || '₦'}{product.price.toLocaleString()}
                        </p>
                      )}
                      
                      {/* Product Rating Display */}
                      {avgRating > 0 && (
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {renderStars(Math.round(avgRating))}
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            ({productReviewList.length} {productReviewList.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {/* Product Reviews Section */}
                      <div className="market-product-review-section" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
                        <h4 className="market-product-review-heading" style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                          Reviews ({productReviewList.length})
                        </h4>
                        
                        {isProductReviewsLoading ? (
                          <Loader />
                        ) : productReviewList.length > 0 ? (
                            <div className="market-product-review-list" style={{ marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {productReviewList.slice(0, 3).map((review) => (
                              <div key={review._id} className="market-product-review-item" style={{ 
                                marginBottom: '0.75rem', 
                                padding: '0.75rem', 
                                borderRadius: '8px' 
                              }}>
                                <div className="product-review-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                  <div className="product-review-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    {renderStars(review.rating)}
                                    {review.student && (
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {review.student.name}
                                      </span>
                                    )}
                                  </div>
                                  {review.student && user && review.student._id === user._id && (
                                    <button
                                      className="review-delete-btn"
                                      onClick={() => handleDeleteReview(review._id, product._id)}
                                      style={{
                                        background: 'var(--error)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                        minWidth: 'fit-content',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.8';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                      }}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                {review.comment && (
                                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                            {productReviewList.length > 3 && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                +{productReviewList.length - 3} more reviews
                              </p>
                            )}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                            No reviews yet. Be the first to review!
                          </p>
                        )}

                        {/* Write Product Review Form */}
                        <div style={{ marginTop: '1rem' }}>
                          {!user ? (
                            <div style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.05)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                              borderRadius: '0.7rem',
                              padding: '1rem',
                              textAlign: 'center'
                            }}>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                                Sign in to leave a review
                              </p>
                              <button
                                onClick={() => {
                                  setPendingAction(() => () => {
                                    document.querySelector(`[data-product-id="${product._id}"]`)?.scrollIntoView({ behavior: 'smooth' });
                                  });
                                  setShowLoginPrompt(true);
                                }}
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem 1rem',
                                  backgroundColor: 'var(--primary-600)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.6rem',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--primary-700)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--primary-600)';
                                }}
                              >
                                Sign In
                              </button>
                            </div>
                          ) : (
                            <>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>
                                  Your Rating
                                </label>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleProductStarClick(product._id, star)}
                                      onMouseEnter={() => setProductHoveredRatings(prev => ({ ...prev, [product._id]: star }))}
                                      onMouseLeave={() => setProductHoveredRatings(prev => ({ ...prev, [product._id]: 0 }))}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: '1.5rem',
                                        color: star <= (productHoveredRating || productRating) ? '#fbbf24' : '#d1d5db',
                                        transition: 'color 0.2s'
                                      }}
                                      title={productRating === star ? 'Click to unrate' : `Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <textarea
                                  className="market-product-review-textarea"
                                  value={productComment}
                                  onChange={(e) => setProductComments(prev => ({ ...prev, [product._id]: e.target.value }))}
                                  placeholder="Write your review..."
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    minHeight: '60px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </div>
                              {productError && (
                                <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                  {productError}
                                </div>
                              )}
                              {productSuccessMsg && (
                                <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                  Review submitted successfully!
                                </div>
                              )}
                              <button
                                onClick={() => handleProductReviewSubmit(product._id)}
                                disabled={isProductSubmitting || !productRating}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: productRating ? 'var(--primary-600)' : '#ccc',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: isProductSubmitting || !productRating ? 'not-allowed' : 'pointer',
                                  opacity: isProductSubmitting ? 0.6 : 1
                                }}
                              >
                                {isProductSubmitting ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Modal/Lightbox */}
        {selectedImage && (
          <div 
            className="image-modal-backdrop"
            onClick={() => setSelectedImage(null)}
          >
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="image-modal-close"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="image-modal-actions">
                <button
                  className="image-download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Create a temporary link to download the image
                    const link = document.createElement('a');
                    link.href = selectedImage;
                    link.download = `flyer-${vendor.businessName.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
              </div>
              <img 
                src={selectedImage} 
                alt="Full size flyer" 
                className="image-modal-image"
              />
            </div>
          </div>
        )}

        {/* Existing Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews ({reviews.length})</h2>
          {reviewsLoading ? (
            <Loader />
          ) : reviews.length === 0 ? (
            <div className="no-reviews">No reviews yet. Be the first to review!</div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="review-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <div className="review-stars">{renderStars(review.rating)}</div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {review.student && user && review.student._id === user._id && (
                      <button
                        className="review-delete-btn"
                        onClick={() => handleDeleteReview(review._id)}
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                          minWidth: 'fit-content',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  {review.student && (
                    <p className="review-author">By {review.student.name || 'Anonymous'}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write Review Form */}
        <div className="review-form-section">
          <h2>Write a Review</h2>
          {!user ? (
            <div className="login-prompt-inline" style={{
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              border: '2px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                Sign in to share your review
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem 0' }}>
                Log in or create an account to leave a review and help other students find great vendors.
              </p>
              <button
                onClick={() => {
                  setPendingAction(() => () => {
                    document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
                  });
                  setShowLoginPrompt(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--primary-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.7rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-700)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-600)';
                }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {success && (
                <div className="success-message">
                  ✓ Review submitted successfully! Thank you for your feedback.
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-field">
                  <label>Your Rating <span style={{ color: 'var(--error)' }}>*</span></label>
                  <div className="star-rating-selector">
                    {renderStars(rating, true)}
                    <span className="rating-text">
                      {rating === 0 ? 'Click to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                    </span>
                  </div>
                </div>
                <div className="form-field">
                  <label>Your Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    required
                    placeholder="Share your experience with this vendor..."
                    minLength={10}
                  />
                  <span className="char-count">{comment.length} characters</span>
                </div>
                <button type="submit" className="submit-button" disabled={submitting || !comment.trim() || rating === 0}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="share-modal-backdrop" onClick={() => setShowLoginPrompt(false)}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <h2>Sign In Required</h2>
                <button 
                  className="share-modal-close" 
                  onClick={() => setShowLoginPrompt(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="share-modal-body">
                <p className="share-modal-description">
                  You need to be signed in to perform this action. Create an account or log in to your existing account to continue.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      navigate('/auth/login');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--primary-600)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.7rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-700)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-600)';
                    }}
                  >
                    Sign In
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      navigate('/auth/register');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: 'var(--primary-600)',
                      border: '2px solid var(--primary-600)',
                      borderRadius: '0.7rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && user && (
          <div className="report-modal-backdrop" onClick={() => setShowFeedbackModal(false)}>
            <div className="report-modal vendor-feedback-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Submit Feedback</h2>
              {feedbackSuccess ? (
                <div className="success-message">Feedback submitted successfully. Thank you for your input!</div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  {feedbackError && <div className="error-message">{feedbackError}</div>}
                  
                  <div className="form-field">
                    <label htmlFor="feedbackPhone">Phone Number <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div className="feedback-phone-input">
                      <select
                        value={feedbackCountryCode}
                        onChange={(e) => setFeedbackCountryCode(e.target.value)}
                        className="feedback-country-code"
                      >
                        {countryCodes.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.flag} {cc.code} {cc.country}
                          </option>
                        ))}
                      </select>
                      <input
                        id="feedbackPhone"
                        type="tel"
                        value={feedbackPhone}
                        onChange={(e) => setFeedbackPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Phone number"
                        required
                        className="feedback-phone-number"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="feedbackMessage">Your Feedback <span style={{ color: 'var(--error)' }}>*</span></label>
                    <textarea
                      id="feedbackMessage"
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Please share your feedback, suggestions, or concerns about this vendor..."
                      rows={4}
                      required
                      style={{ minHeight: '100px' }}
                    />
                  </div>
                  <div className="report-actions">
                    <button type="button" onClick={() => setShowFeedbackModal(false)} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-report-btn" disabled={feedbackSubmitting}>
                      {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;
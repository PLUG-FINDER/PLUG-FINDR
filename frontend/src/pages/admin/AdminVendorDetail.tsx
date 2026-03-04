import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageUtils';
import BackButton from '../../components/BackButton';
import {
  getWhatsAppLink,
  getInstagramLink,
  getSnapchatLink,
  getTikTokLink,
  getFacebookLink,
  getTwitterLink,
} from '../../utils/socialMediaUtils';
import './AdminPages.css';

const AdminVendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVendor();
    }
  }, [id]);

  const loadVendor = async () => {
    try {
      const allVendors = await adminAPI.getAllVendors();
      const found = allVendors.find(v => v._id === id);
      
      const getStatus = (v: any) => v.status || (v.approved ? 'APPROVED' : (v.rejectedReason ? 'REJECTED' : 'PENDING'));

      if (found) {
        setVendor({ ...found, status: getStatus(found) });
      } else {
        // Fallback to pending if not in all list (though getAll should have all)
        const pendingVendors = await adminAPI.getPendingVendors();
        const foundPending = pendingVendors.find(v => v._id === id);
        if (foundPending) {
          setVendor({ ...foundPending, status: getStatus(foundPending) });
        } else {
          setError('Vendor not found.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendor details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!vendor) return;
    setProcessing('approve');
    try {
      const updated = await adminAPI.approveVendor(vendor._id);
      setVendor({ ...updated, status: 'APPROVED' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve vendor.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!vendor) return;
    setProcessing('reject');
    try {
      await adminAPI.rejectVendor(vendor._id);
      navigate('/admin/vendor-approvals');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject vendor.');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleVerify = async () => {
    if (!vendor) return;
    setProcessing('verify');
    try {
      const updated = await adminAPI.toggleVendorVerification(vendor._id);
      
      const getStatus = (v: any) => v.status || (v.approved ? 'APPROVED' : (v.rejectedReason ? 'REJECTED' : 'PENDING'));
      setVendor({ ...updated, status: getStatus(updated) }); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;
  if (!vendor) return <div className="error-message">{error || 'Vendor not found'}</div>;

  return (
    <div className="page-container">
      <BackButton />

      <div className="vendor-detail-admin">
        <div className="detail-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {vendor.businessName}
            {vendor.isMetaVerified && (
              <span className="verified-badge" title="Meta Verified">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5 12.5C22.5 12.9 22.5 13.2 22.5 13.5C22.5 17.5 19.5 21 15.5 21.5C14.5 21.6 13.5 21.6 12.5 21.5C8.5 21 5.5 17.5 5.5 13.5C5.5 13.2 5.5 12.9 5.5 12.5C5.5 8.5 8.5 5 12.5 4.5C13.5 4.4 14.5 4.4 15.5 4.5C19.5 5 22.5 8.5 22.5 12.5Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </h1>
          
          <div className="admin-actions">
            {vendor.status === 'PENDING' && (
              <>
                <button 
                  onClick={handleApprove} 
                  className="approve-button"
                  disabled={!!processing}
                >
                  {processing === 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button 
                  onClick={handleReject} 
                  className="reject-button"
                  disabled={!!processing}
                >
                  {processing === 'reject' ? 'Reject...' : 'Reject'}
                </button>
              </>
            )}
            
            {vendor.status === 'APPROVED' && (
              <button 
                onClick={handleToggleVerify} 
                className={`verify-button ${vendor.isMetaVerified ? 'active' : ''}`}
                disabled={!!processing}
              >
                {processing === 'verify' ? 'Processing...' : vendor.isMetaVerified ? 'Remove Verification' : 'Add Meta Verified'}
              </button>
            )}
          </div>
        </div>

        <div className="status-banner">
          <span className={`status-${vendor.status.toLowerCase()}`}>
            Status: {vendor.status}
          </span>
        </div>
        
        <div className="vendor-detail-info">
          <p><strong>Category:</strong> {vendor.category}</p>
          <p><strong>Location:</strong> {vendor.location}</p>
          <p><strong>Email:</strong> {vendor.contactEmail}</p>
          <p><strong>Phone:</strong> {vendor.contactPhone}</p>
        </div>

        <p className="vendor-description">{vendor.description}</p>

        {(getWhatsAppLink(vendor) || getInstagramLink(vendor) || getSnapchatLink(vendor) || 
          getTikTokLink(vendor) || getFacebookLink(vendor) || getTwitterLink(vendor)) && (
          <div className="vendor-social-media">
            <h3>Social Media</h3>
            <div className="vendor-social-icons">
              {getWhatsAppLink(vendor) && (
                <a href={getWhatsAppLink(vendor)!} target="_blank" className="contact-icon whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              )}
              {getInstagramLink(vendor) && (
                <a href={getInstagramLink(vendor)!} target="_blank" className="contact-icon instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {getSnapchatLink(vendor) && (
                <a href={getSnapchatLink(vendor)!} target="_blank" className="contact-icon snapchat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.07 2.2c-4.11 0-6.9 2.5-7.1 6.36-.06 1.14.33 2.13.56 2.67.16.38.07.82-.23 1.11-.27.26-1.12.96-1.36 2.37-.13.78.33 1.45.92 1.45.26 0 .5-.11.68-.3.33-.35.65-.67 1.25-.67.36 0 .7.12.98.36.72.6 1.72 1.07 3.6 1.07 1.8 0 2.92-.48 3.64-1.07.28-.24.62-.36.98-.36.6 0 .93.32 1.26.67.18.19.42.3.68.3.6 0 1.05-.67.92-1.45-.24-1.41-1.09-2.11-1.36-2.37-.3-.29-.39-.73-.23-1.11.23-.54.62-1.53.56-2.67-.2-3.86-2.99-6.36-7.1-6.36z"/></svg>
                </a>
              )}
              {getTikTokLink(vendor) && (
                <a href={getTikTokLink(vendor)!} target="_blank" className="contact-icon tiktok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
              {getFacebookLink(vendor) && (
                <a href={getFacebookLink(vendor)!} target="_blank" className="contact-icon facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {getTwitterLink(vendor) && (
                <a href={getTwitterLink(vendor)!} target="_blank" className="contact-icon twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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
                <div key={index} className="flyer-image-wrapper" onClick={() => setSelectedImage(getImageUrl(image))}>
                  <img src={getImageUrl(image)} alt={`Flyer ${index + 1}`} className="flyer-image" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="image-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <img src={selectedImage} alt="Full size" className="image-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorDetail;

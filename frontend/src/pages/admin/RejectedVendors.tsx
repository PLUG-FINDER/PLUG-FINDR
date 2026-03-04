import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import './AdminPages.css';

const RejectedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadRejectedVendors();
  }, []);

  const loadRejectedVendors = async () => {
    try {
      const data = await adminAPI.getRejectedVendors();
      setVendors(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rejected vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (vendorId: string) => {
    setVendorToDelete(vendorId);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    
    try {
      setDeleting(vendorToDelete);
      await adminAPI.deleteVendor(vendorToDelete);
      setVendorToDelete(null);
      await loadRejectedVendors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete vendor.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setVendorToDelete(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">Rejected Vendors</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Delete Confirmation Modal */}
      {vendorToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleDeleteCancel}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to permanently delete this rejected vendor? This action cannot be undone. All associated products, reviews, and feedback will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting === vendorToDelete}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting === vendorToDelete ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  opacity: deleting === vendorToDelete ? 0.6 : 1
                }}
              >
                {deleting === vendorToDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="no-results">No rejected vendors found.</div>
      ) : (
        <div className="vendors-list">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="vendor-approval-card" style={{ cursor: 'default' }}>
              <div className="vendor-info">
                <h3>{vendor.businessName}</h3>
                <p><strong>Category:</strong> {vendor.category || 'N/A'}</p>
                <p><strong>Location:</strong> {vendor.location || vendor.hostelName || 'N/A'}</p>
                <p><strong>Email:</strong> {vendor.contactEmail || 'N/A'}</p>
                <p><strong>Phone:</strong> {vendor.contactPhone || 'N/A'}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="status-rejected" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    REJECTED
                  </span>
                  {(vendor as any).rejectedReason && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.75rem', 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <strong style={{ color: '#DC2626' }}>Rejection Reason:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#991b1b' }}>
                        {(vendor as any).rejectedReason}
                      </p>
                    </div>
                  )}
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
                  <strong>Rejected on:</strong> {new Date((vendor as any).updatedAt || vendor.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="vendor-actions" style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <Link to={`/admin/vendor/${vendor._id}`} className="view-details-button">
                  View Details
                </Link>
                <button
                  onClick={() => handleDeleteClick(vendor._id)}
                  disabled={deleting === vendor._id}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deleting === vendor._id ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    opacity: deleting === vendor._id ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  title="Permanently delete this rejected vendor"
                >
                  {deleting === vendor._id ? 'Deleting...' : '🗑️ Delete Permanently'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RejectedVendors;


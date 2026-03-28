import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
// import BackButton from '../../components/BackButton';
import './AdminPages.css';

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freezing, setFreezing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await adminAPI.getAllVendors();
      // Backend now only returns approved vendors, but we still ensure status is set for display
      const vendorsWithStatus = data.map((v: any) => ({
        ...v,
        status: v.status || 'APPROVED'
      }));
      
      setVendors(vendorsWithStatus);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeToggle = async (vendorId: string, _currentFreezeStatus: boolean) => {
    try {
      setFreezing(vendorId);
      await adminAPI.toggleVendorFreeze(vendorId);
      // Reload vendors to get updated status
      await loadVendors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle freeze status.');
    } finally {
      setFreezing(null);
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
      await loadVendors();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Approved Vendors</h1>
        <Link 
          to="/admin/vendors/rejected" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#EF4444',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DC2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#EF4444';
          }}
        >
          View Rejected Vendors
        </Link>
      </div>

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
              Are you sure you want to delete this vendor? This action cannot be undone. All associated products, reviews, and feedback will also be deleted.
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
        <div className="no-results">No approved vendors found.</div>
      ) : (
        <div className="vendors-list">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="vendor-approval-card" style={{ cursor: 'default' }}>
              <div className="vendor-info">
                <h3>{vendor.businessName}</h3>
                <p><strong>Category:</strong> {vendor.category}</p>
                <p><strong>Location:</strong> {vendor.location}</p>
                <p><strong>Email:</strong> {vendor.contactEmail}</p>
                <p><strong>Phone:</strong> {vendor.contactPhone}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                   <span className={`status-${vendor.status.toLowerCase()}`} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                     {vendor.status}
                   </span>
                   {vendor.isMetaVerified && (
                     <span style={{ color: '#3B82F6', fontSize: '0.85rem' }}>
                       Verified ✓
                     </span>
                   )}
                   {(vendor as any).isFrozen && (
                     <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                       🧊 FROZEN
                     </span>
                   )}
                </div>
              </div>
              <div className="vendor-actions" style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <Link to={`/admin/vendor/${vendor._id}`} className="view-details-button">
                  View Details
                </Link>
                <button
                  onClick={() => handleFreezeToggle(vendor._id, (vendor as any).isFrozen || false)}
                  disabled={freezing === vendor._id}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: (vendor as any).isFrozen ? '#10B981' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: freezing === vendor._id ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    opacity: freezing === vendor._id ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: freezing === vendor._id ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (freezing !== vendor._id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                      if ((vendor as any).isFrozen) {
                        e.currentTarget.style.backgroundColor = '#059669';
                      } else {
                        e.currentTarget.style.backgroundColor = '#DC2626';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (freezing !== vendor._id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.backgroundColor = (vendor as any).isFrozen ? '#10B981' : '#EF4444';
                    }
                  }}
                  title={(vendor as any).isFrozen ? 'Unfreeze vendor (make visible to students)' : 'Freeze vendor (hide from students)'}
                >
                  {freezing === vendor._id ? '...' : (vendor as any).isFrozen ? '🧊 Unfreeze' : '❄️ Freeze'}
                </button>
                <button
                  onClick={() => handleDeleteClick(vendor._id)}
                  disabled={deleting === vendor._id}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: deleting === vendor._id ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    opacity: deleting === vendor._id ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: deleting === vendor._id ? 'none' : '0 2px 8px rgba(220, 38, 38, 0.25)',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (deleting !== vendor._id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
                      e.currentTarget.style.backgroundColor = '#B91C1C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deleting !== vendor._id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.25)';
                      e.currentTarget.style.backgroundColor = '#DC2626';
                    }
                  }}
                  title="Delete vendor permanently"
                >
                  {deleting === vendor._id ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorList;


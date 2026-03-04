import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import './AdminPages.css';

const VendorApprovals: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingVendors();
  }, []);

  const loadPendingVendors = async () => {
    try {
      const data = await adminAPI.getPendingVendors();
      setVendors(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    setProcessing(vendorId);
    try {
      await adminAPI.approveVendor(vendorId);
      setVendors(vendors.filter((v) => v._id !== vendorId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve vendor.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    setProcessing(vendorId);
    try {
      await adminAPI.rejectVendor(vendorId);
      setVendors(vendors.filter((v) => v._id !== vendorId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject vendor.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">Vendor Approvals</h1>

      {error && <div className="error-message">{error}</div>}

      {vendors.length === 0 ? (
        <div className="no-results">No pending vendor approvals.</div>
      ) : (
        <div className="vendors-list">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="vendor-approval-card">
              <div className="vendor-info">
                <h3>{vendor.businessName}</h3>
                <p><strong>Category:</strong> {vendor.category}</p>
                <p><strong>Location:</strong> {vendor.location}</p>
                <p><strong>Email:</strong> {vendor.contactEmail}</p>
                <p><strong>Phone:</strong> {vendor.contactPhone}</p>
                <p className="vendor-description">{vendor.description}</p>
              </div>
              <div className="vendor-actions">
                <Link to={`/admin/vendor/${vendor._id}`} className="view-details-button">
                  View Details
                </Link>
                <button
                  onClick={() => handleApprove(vendor._id)}
                  className="approve-button"
                  disabled={processing === vendor._id}
                >
                  {processing === vendor._id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(vendor._id)}
                  className="reject-button"
                  disabled={processing === vendor._id}
                >
                  {processing === vendor._id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorApprovals;



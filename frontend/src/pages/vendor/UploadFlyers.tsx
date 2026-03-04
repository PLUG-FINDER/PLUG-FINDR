import React, { useState, useEffect } from 'react';
import { vendorAPI, VendorProfile } from '../../api/vendor';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageUtils';
import './VendorPages.css';

const UploadFlyers: React.FC = () => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await vendorAPI.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const result = await vendorAPI.uploadFlyers(files);
      setSuccess(`Successfully uploaded ${files.length} file(s)!`);
      setFiles([]);
      loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this flyer?")) return;

    try {
        const result = await vendorAPI.deleteFlyer(imageUrl);
        // Update local state with the new list of flyers from backend
        if (profile) {
            setProfile({ ...profile, flyerImages: result.flyerImages });
        }
        setSuccess('Flyer deleted successfully');
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete flyer.');
    }
  };

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="page-container">
        <div className="error-message">Please create your vendor profile first.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Upload Flyers</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-field">
          <label htmlFor="flyers">Select Flyer Images</label>
          <input
            id="flyers"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {files.length > 0 && (
            <p className="file-info">{files.length} file(s) selected</p>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={uploading || files.length === 0}>
          {uploading ? 'Uploading...' : 'Upload Flyers'}
        </button>
      </form>

      {profile.flyerImages && profile.flyerImages.length > 0 && (
        <div className="flyers-section">
          <h2>Current Flyers</h2>
          <div className="flyers-grid">
            {profile.flyerImages.map((imageUrl, index) => (
              <div key={index} className="flyer-item">
                <img 
                  src={getImageUrl(imageUrl)} 
                  alt={`Flyer ${index + 1}`} 
                  className="flyer-image"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imageUrl)}
                  className="remove-button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFlyers;



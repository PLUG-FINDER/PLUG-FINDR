import React, { useState, useEffect } from 'react';
import { vendorAPI, VendorProfileUpdate } from '../../api/vendor';
import Loader from '../../components/Loader';
import HostelAutocomplete from '../../components/HostelAutocomplete';
import './VendorPages.css';

// Rename type to avoid conflict with component name
export interface VendorProfileType {
  businessName: string;
  description: string;
  category: string;
  location: string;
  hostelName: string;
  contactEmail: string;
  contactPhone: string;
}

const VendorProfile: React.FC = () => {
  // Available categories for vendors to select from
  const categories = [
    'Food & Drinks',
    'Fashion & Beauty',
    'Services & Creatives',
    'Tech',
    'Medicine'
  ];

  // KNUST Halls and Accredited Hostels on Campus
  // Annexes are grouped with their parent halls
  const knustHallsAndHostels = [
    // Unity Hall and its annex
    { value: 'Unity Hall', label: 'Unity Hall', group: 'Unity Hall' },
    { value: 'Unity Annex', label: 'Unity Annex', group: 'Unity Hall' },
    // Republic Hall and its annex
    { value: 'Republic Hall', label: 'Republic Hall', group: 'Republic Hall' },
    { value: 'Republic Annex', label: 'Republic Annex', group: 'Republic Hall' },
    // Independence Hall and its annex
    { value: 'Independence Hall', label: 'Independence Hall', group: 'Independence Hall' },
    { value: 'Independence Annex', label: 'Independence Annex', group: 'Independence Hall' },
    // Katanga Hall and its annex
    { value: 'Katanga Hall', label: 'Katanga Hall', group: 'Katanga Hall' },
    { value: 'Katanga Annex', label: 'Katanga Annex', group: 'Katanga Hall' },
    // Other Official KNUST Halls
    { value: 'Africa Hall', label: 'Africa Hall', group: 'Other Halls' },
    { value: 'Queen Elizabeth II Hall', label: 'Queen Elizabeth II Hall', group: 'Other Halls' },
    // Accredited Hostels on Campus
    { value: 'GUSSS Hostels (Brunei)', label: 'GUSSS Hostels (Brunei)', group: 'Accredited Hostels' },
    { value: 'SRC Hostel (Otumfuo Osei Tutu II Hostel)', label: 'SRC Hostel (Otumfuo Osei Tutu II Hostel)', group: 'Accredited Hostels' },
    { value: 'Engineering Guest House', label: 'Engineering Guest House', group: 'Accredited Hostels' },
    { value: 'SMS Guest House', label: 'SMS Guest House', group: 'Accredited Hostels' },
  ];

  const [profile, setProfile] = useState<VendorProfileType | null>(null);
  const [formData, setFormData] = useState<VendorProfileUpdate>({
    businessName: '',
    description: '',
    category: '',
    location: '',
    hostelName: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    instagram: '',
    snapchat: '',
    tiktok: '',
    facebook: '',
    twitter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const MIN_DESCRIPTION_LENGTH = 100; // Minimum 100 characters (roughly 2-3 lines)

  useEffect(() => {
    loadProfile();
  }, []);

  // Scroll to top when success or error messages appear
  useEffect(() => {
    if (success || error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success, error]);

  const loadProfile = async () => {
    try {
      const data = await vendorAPI.getProfile();
      setProfile(data);
      setFormData({
        businessName: data.businessName || '',
        description: data.description || '',
        category: data.category || '',
        location: data.location || '',
        hostelName: data.hostelName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        snapchat: data.snapchat || '',
        tiktok: data.tiktok || '',
        facebook: data.facebook || '',
        twitter: data.twitter || '',
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet, that's okay
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate description length
    const trimmedDescription = (formData?.description ?? '').trim();
    if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
      setError(`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters (approximately 2-3 lines). Please provide more details about your business.`);
      // Scroll to top to show error
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      return;
    }

    // Validate that at least one location field (Hall or Custom Hostel) is provided
    const trimmedHostelName = (formData.hostelName || '').trim();
    const trimmedLocation = (formData.location || '').trim();
    if (!trimmedHostelName && !trimmedLocation) {
      setError('Please provide either a Hall or Custom Hostel. At least one location is required.');
      // Scroll to top to show error
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (profile) {
        await vendorAPI.updateProfile(formData);
        setSuccess('Profile updated successfully!');
      } else {
        await vendorAPI.createProfile(formData);
        setSuccess('Profile created successfully!');
      }
      loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">{profile ? 'Edit Profile' : 'Create Profile'}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="businessName">Business Name *</label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="location-input"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="description">
            Description * 
            <span className="field-requirement">(Minimum 2-3 lines, {MIN_DESCRIPTION_LENGTH} characters)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData?.description ?? ''}
            onChange={handleChange}
            required
            rows={4}
            minLength={MIN_DESCRIPTION_LENGTH}
            placeholder="Provide a detailed description of your business (minimum 2-3 lines). Include what products or services you offer, your unique selling points, operating hours, special offers, and any other relevant information that would help students understand your business better..."
          />
          <div className="char-count-wrapper">
            <span className={`char-count ${(formData?.description ?? '').length < MIN_DESCRIPTION_LENGTH ? 'char-count-warning' : 'char-count-success'}`}>
              {(formData?.description ?? '').length} / {MIN_DESCRIPTION_LENGTH} characters
              {(formData?.description ?? '').length < MIN_DESCRIPTION_LENGTH && (
                <span className="char-count-message">
                  {' '}({MIN_DESCRIPTION_LENGTH - (formData?.description ?? '').length} more needed)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="form-section-divider">
          <h3>Location Details</h3>
          <p className="form-section-description">Provide at least one location (Hall or Custom Hostel) to help students find you. Students can filter vendors by their location.</p>
        </div>

        <div className="location-form-grid">
          <div className="form-field form-field-full">
            <label htmlFor="hostelName">
              Hall
            </label>
            <select
              id="hostelName"
              name="hostelName"
              value={formData.hostelName || ''}
              onChange={handleChange}
              className="location-input"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: '2px solid var(--gray-200)',
                fontSize: '1rem',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                appearance: 'auto',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist'
              }}
            >
              <option value="">Select Hall or Accredited Hostel</option>
              <optgroup label="Unity Hall">
                {knustHallsAndHostels.filter(h => h.group === 'Unity Hall').map((hall) => (
                  <option key={hall.value} value={hall.value}>
                    {hall.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Republic Hall">
                {knustHallsAndHostels.filter(h => h.group === 'Republic Hall').map((hall) => (
                  <option key={hall.value} value={hall.value}>
                    {hall.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Independence Hall">
                {knustHallsAndHostels.filter(h => h.group === 'Independence Hall').map((hall) => (
                  <option key={hall.value} value={hall.value}>
                    {hall.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Katanga Hall">
                {knustHallsAndHostels.filter(h => h.group === 'Katanga Hall').map((hall) => (
                  <option key={hall.value} value={hall.value}>
                    {hall.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Official Halls">
                {knustHallsAndHostels.filter(h => h.group === 'Other Halls').map((hall) => (
                  <option key={hall.value} value={hall.value}>
                    {hall.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Accredited Hostels on Campus">
                {knustHallsAndHostels.filter(h => h.group === 'Accredited Hostels').map((hostel) => (
                  <option key={hostel.value} value={hostel.value}>
                    {hostel.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>
              💡 Select your hall or accredited hostel from the list. If you're not in any of these, use Custom Hostel below.
            </p>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="location">
              Custom Hostel <span className="optional-text">(Optional)</span>
            </label>
            <HostelAutocomplete
              value={formData.location || ''}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Search for custom hostel or location near KNUST..."
              className="location-input"
            />
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>
              💡 Provide at least one location (Hall above or Custom Hostel here). This helps students locate you.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="contactEmail">Contact email *</label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="location-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactPhone">Contact phone *</label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              className="location-input"
            />
          </div>
        </div>

        <div className="form-section-divider">
          <h3>Social Media Links (Optional)</h3>
          <p className="form-section-description">Add your social media handles or links. Only added links will appear on your profile.</p>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              value={formData.whatsapp || ''}
              onChange={handleChange}
              placeholder="Phone number or WhatsApp link"
            />
          </div>

          <div className="form-field">
            <label htmlFor="instagram">Instagram</label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              value={formData.instagram || ''}
              onChange={handleChange}
              placeholder="@username or instagram.com/username"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="snapchat">Snapchat</label>
            <input
              id="snapchat"
              name="snapchat"
              type="text"
              value={formData.snapchat || ''}
              onChange={handleChange}
              placeholder="@username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="tiktok">TikTok</label>
            <input
              id="tiktok"
              name="tiktok"
              type="text"
              value={formData.tiktok || ''}
              onChange={handleChange}
              placeholder="@username or tiktok.com/@username"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="facebook">Facebook</label>
            <input
              id="facebook"
              name="facebook"
              type="text"
              value={formData.facebook || ''}
              onChange={handleChange}
              placeholder="facebook.com/username or username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="twitter">Twitter/X</label>
            <input
              id="twitter"
              name="twitter"
              type="text"
              value={formData.twitter || ''}
              onChange={handleChange}
              placeholder="@username or x.com/username"
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={saving}>
          {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default VendorProfile;

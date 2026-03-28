import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { studentAPI, DashboardData } from '../../api/student';
import { vendorAPI, VendorProfile } from '../../api/vendor';
import Icons from '../../components/Icons';
import Loader from '../../components/Loader';
import CustomSelect from '../../components/CustomSelect';
import HostelAutocomplete from '../../components/HostelAutocomplete';
import { getImageUrl } from '../../utils/imageUtils';
import './StudentPages.css';

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
  { value: 'GUSSS Hostel (Brunei)', label: 'GUSSS Hostel (Brunei)', group: 'Accredited Hostels' },
  { value: 'SRC Hostel (Otumfuo Osei Tutu II Hostel)', label: 'SRC Hostel (Otumfuo Osei Tutu II Hostel)', group: 'Accredited Hostels' },
  { value: 'Engineering Guest House', label: 'Engineering Guest House', group: 'Accredited Hostels' },
  { value: 'SMS Guest House', label: 'SMS Guest House', group: 'Accredited Hostels' },
];

// Hostel Hub Component
const HostelHubSection: React.FC<{
  hostelVendors: VendorProfile[];
  loadingHostelVendors: boolean;
  setHostelVendors: (vendors: VendorProfile[]) => void;
  setLoadingHostelVendors: (loading: boolean) => void;
}> = ({ hostelVendors, loadingHostelVendors, setHostelVendors, setLoadingHostelVendors }) => {
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');

  const loadHostelVendors = useCallback(async (hostel: string) => {
    if (!hostel.trim()) return;
    
    setLoadingHostelVendors(true);
    try {
      const vendors = await vendorAPI.getVendorsByHostel(hostel);
      setHostelVendors(vendors);
    } catch (err: any) {
      console.error('Failed to load hostel vendors:', err);
      setHostelVendors([]);
    } finally {
      setLoadingHostelVendors(false);
    }
  }, [setHostelVendors, setLoadingHostelVendors]);

  const handleHostelChange = (hostel: string) => {
    setSelectedHostel(hostel);
    setCustomLocation(''); // Clear custom location when hall is selected
    if (hostel) {
      loadHostelVendors(hostel);
    } else {
      setHostelVendors([]);
    }
  };

  const handleCustomLocationChange = (location: string) => {
    setCustomLocation(location);
    setSelectedHostel(''); // Clear hall selection when custom location is used
    // Clear vendors immediately when input is cleared
    if (!location.trim()) {
      setHostelVendors([]);
    }
    // Don't trigger API call here - let debounce handle it
  };

  // Debounce custom location search - only search after user stops typing for 500ms
  useEffect(() => {
    if (!customLocation.trim()) {
      return;
    }

    // Only search if there are at least 2 characters
    if (customLocation.trim().length < 2) {
      setHostelVendors([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      loadHostelVendors(customLocation);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [customLocation, loadHostelVendors]);

  const getDisplayLocation = () => {
    return selectedHostel || customLocation || '';
  };

  return (
    <div style={{ 
      marginBottom: '2rem',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '20px',
      padding: 'clamp(1rem, 5vw, 2rem)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(99, 102, 241, 0.3)'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: 700 }}>
          🏠 Hostel Hub
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', lineHeight: 1.4 }}>
          Find vendors selling in your hostel right now. No delivery fees, just walk over!
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '0.875rem', 
          marginBottom: '1rem' 
        }}>
          <div>
            <label htmlFor="hostel-select" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
            }}>
              Filter by Hall
            </label>
            <CustomSelect
              id="hostel-select"
              value={selectedHostel}
              onChange={handleHostelChange}
              options={[
                { value: '', label: 'Choose your hall or hostel...', group: '' },
                ...knustHallsAndHostels.map(h => ({
                  value: h.value,
                  label: h.label,
                  group: h.group
                }))
              ]}
              placeholder="Choose your hall or hostel..."
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor="custom-location" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
            }}>
              Or Search Custom Location
            </label>
            <HostelAutocomplete
              value={customLocation}
              onChange={handleCustomLocationChange}
              placeholder="Search for custom hostel or location..."
              className="location-input"
            />
          </div>
        </div>
        <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
          💡 Select a hall from the dropdown or search for a custom location to find vendors nearby.
        </p>
      </div>

      {loadingHostelVendors && (
        <div style={{ textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
          <Loader />
        </div>
      )}

      {getDisplayLocation() && !loadingHostelVendors && (
        <>
          {hostelVendors.length === 0 ? (
            <div style={{ 
              padding: 'clamp(1.5rem, 4vw, 2rem)', 
              textAlign: 'center', 
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: '12px'
            }}>
              <p style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
                No vendors found in {getDisplayLocation()} yet. Be the first to register!
              </p>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Vendors in {getDisplayLocation()} ({hostelVendors.length})
                </h3>
                <Link 
                  to={`/student/search?hostel=${encodeURIComponent(getDisplayLocation())}`}
                  style={{ 
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', 
                    color: 'var(--primary-600)', 
                    textDecoration: 'none',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  View All →
                </Link>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem'
              }}>
                {hostelVendors.slice(0, 6).map((vendor) => (
                  <Link
                    key={vendor._id}
                    to={`/student/vendor/${vendor._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid var(--gray-200)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = 'var(--primary-500)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                    }}
                    >
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {vendor.businessName}
                        {vendor.isMetaVerified && (
                          <span style={{ marginLeft: '0.5rem', color: '#3B82F6' }}>✓</span>
                        )}
                      </h4>
                      {vendor.category && (
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {vendor.category}
                        </p>
                      )}
                      {vendor.location && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          📍 {vendor.location}
                        </p>
                      )}
                      {vendor.rating > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hostelVendors, setHostelVendors] = useState<VendorProfile[]>([]);
  const [loadingHostelVendors, setLoadingHostelVendors] = useState(false);

  useEffect(() => {
    loadDashboardData();
    if (user?.whatsappNumber) {
      // Try to extract hostel from WhatsApp number or load vendors by user's hostel preference
      // For now, we'll show a section where students can select their hostel
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const data = await studentAPI.getDashboardData();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearRecentSearches = async () => {
    if (!window.confirm('Are you sure you want to clear all recent searches? This action cannot be undone.')) {
      return;
    }

    const prevLoading = loading;
    setLoading(true);
    try {
      await studentAPI.clearRecentSearches();
      // Reload dashboard data to reflect the changes
      await loadDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear recent searches.');
      setLoading(prevLoading);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }}>
        ★
      </span>
    ));
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <div className="user-avatar" style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-600)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          {getInitials(user?.name, user?.email)}
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}!</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Student Dashboard</p>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      {/* Hostel Hub Section */}
      <HostelHubSection 
        hostelVendors={hostelVendors}
        loadingHostelVendors={loadingHostelVendors}
        setHostelVendors={setHostelVendors}
        setLoadingHostelVendors={setLoadingHostelVendors}
      />
      
      <div className="dashboard-cards">
        <Link to="/student/search" className="dashboard-card">
          <div className="card-icon">
            <Icons name="search" size={48} />
          </div>
          <h3>Search Vendors</h3>
          <p>Find vendors and services</p>
        </Link>
        
        {(!dashboardData || dashboardData.reviewStats.totalReviews === 0) ? (
          <Link to="/student/search" className="dashboard-card" style={{
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%) !important',
            border: '2px dashed var(--primary-300)'
          }}>
            <div className="card-icon" style={{ color: 'var(--primary-600)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3>Review Your First Vendor</h3>
            <p>Start sharing your experiences and help others discover great vendors</p>
          </Link>
        ) : (
          <Link to="/student/reviews" className="dashboard-card">
            <div className="card-icon">
              <Icons name="star" size={48} />
            </div>
            <h3>My Reviews</h3>
            <p>View and manage your reviews</p>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      {dashboardData && dashboardData.reviewStats.totalReviews > 0 && (
        <div className="dashboard-stats-card" style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '2px solid rgba(99, 102, 241, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📊 Your Activity
          </h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dashboardData.reviewStats.totalReviews}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Reviews
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dashboardData.reviewStats.monthlyReviews}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                This Month
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData && (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Recent Activity
            </h2>
            {dashboardData.recentSearches.length > 0 && (
              <button
                onClick={handleClearRecentSearches}
                disabled={loading}
                style={{
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'transparent',
                  color: 'var(--error)',
                  border: '1px solid var(--error)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'var(--error-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {loading ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
          <div className="recent-activity-section" style={{
            backgroundColor: isDark ? '#111009' : 'white',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: isDark 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 107, 43, 0.15)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: isDark ? '2px solid rgba(255, 107, 43, 0.2)' : '1px solid #f0f0f0',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Recent Searches
            </h3>
            {dashboardData.recentSearches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%' }}>
                {dashboardData.recentSearches.map((search) => (
                  <div key={search._id} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : '#f8f9fa',
                    borderRadius: '10px',
                    width: '100%',
                    boxSizing: 'border-box',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    border: isDark ? '1px solid rgba(255, 107, 43, 0.2)' : '1px solid #e9ecef',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(0, 0, 0, 0.5)' : '#f0f4f9';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 107, 43, 0.4)' : '#d4dce8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(0, 0, 0, 0.3)' : '#f8f9fa';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 107, 43, 0.2)' : '#e9ecef';
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.875rem',
                      flex: '1',
                      minWidth: 0,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ flexShrink: 0, color: '#6366f1' }}>
                        <Icons name="search" size={18} />
                      </span>
                      <span style={{ 
                        fontWeight: 500, 
                        color: isDark ? '#cbd5e1' : '#1f2937',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                        fontSize: '0.95rem'
                      }}>
                        {search.query}
                      </span>
                      {(() => {
                        const category = search.filters?.category;
                        return category && typeof category === 'string' ? (
                          <span style={{
                            fontSize: '0.8rem',
                            color: isDark ? '#a78bfa' : '#6366f1',
                            backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#eef2ff',
                            padding: '0.375rem 0.625rem',
                            borderRadius: '6px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            border: isDark ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid #c7d2fe'
                          }}>
                            {category}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: isDark ? '#64748b' : '#9ca3af', 
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {formatDate(search.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '2.5rem 1.75rem', 
                textAlign: 'center', 
                color: isDark ? '#64748b' : '#9ca3af',
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f3f4f6',
                borderRadius: '10px'
              }}>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                  No recent searches yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Rated Vendors Recommendations */}
      {dashboardData && dashboardData.topVendors.length > 0 && (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem',
            padding: '0 0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
              ⭐ Top Rated Vendors
            </h2>
            <Link 
              to="/student/search" 
              style={{ 
                fontSize: '0.9rem', 
                color: 'var(--primary-600)', 
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              View All →
            </Link>
          </div>
          <div className="recommendations-scroll" style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--primary-300) var(--gray-100)'
          }}>
            {dashboardData.topVendors.map((vendor) => (
              <Link
                key={vendor._id}
                to={`/student/vendor/${vendor._id}`}
                style={{
                  flex: '0 0 280px',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div className="recommendation-card" style={{
                  backgroundColor: 'var(--card-bg)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
                >
                  {vendor.flyerImages && vendor.flyerImages.length > 0 && (
                    <div style={{
                      width: '100%',
                      height: '160px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--gray-100)'
                    }}>
                      <img
                        src={getImageUrl(vendor.flyerImages[0])}
                        alt={vendor.businessName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.error(`[Image Error] Failed to load image for ${vendor.businessName}:`, {
                            originalUrl: vendor.flyerImages[0],
                            fullUrl: getImageUrl(vendor.flyerImages[0]),
                            vendorId: vendor._id
                          });
                          img.src = 'https://via.placeholder.com/280x160?text=No+Image';
                        }}
                        onLoad={() => {
                          console.log(`[Image Success] Loaded image for ${vendor.businessName}:`, getImageUrl(vendor.flyerImages[0]));
                        }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {vendor.businessName}
                      </h3>
                      {vendor.isMetaVerified && (
                        <span style={{ color: '#3B82F6' }} title="Verified">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.5 12.5C22.5 12.9 22.5 13.2 22.5 13.5C22.5 17.5 19.5 21 15.5 21.5C14.5 21.6 13.5 21.6 12.5 21.5C8.5 21 5.5 17.5 5.5 13.5C5.5 13.2 5.5 12.9 5.5 12.5C5.5 8.5 8.5 5 12.5 4.5C13.5 4.4 14.5 4.4 15.5 4.5C19.5 5 22.5 8.5 22.5 12.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 13L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(Math.round(vendor.rating || 0))}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {vendor.rating?.toFixed(1)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        ({vendor.reviewCount} reviews)
                      </span>
                    </div>
                    {(vendor.area || vendor.hostelName) && (
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Icons name="location" size={14} />
                        {vendor.area && <span>{vendor.area}</span>}
                        {vendor.area && vendor.hostelName && <span> • </span>}
                        {vendor.hostelName && <span>{vendor.hostelName}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dashboardData && dashboardData.recentSearches.length === 0 && dashboardData.topVendors.length === 0 && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: 'var(--gray-50)',
          borderRadius: '20px'
        }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Start exploring! Search for vendors to see your activity and recommendations here.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { vendorAPI, VendorProfile } from '../../api/vendor';
import VendorCard from '../../components/VendorCard';
import Loader from '../../components/Loader';
import Icons from '../../components/Icons';
import BackButton from '../../components/BackButton';
import './StudentPages.css';

const VendorSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(true);

  // Category definitions
  const categories = {
    'Food & Drinks': {
      color: '#9333ea'
    },
    'Fashion & Beauty': {
      color: '#ec4899'
    },
    'Services & Creatives': {
      color: '#3b82f6'
    },
    'Tech': {
      color: '#6b7280'
    },
    'Medicine': {
      color: '#10b981'
    }
  };

  // Load all vendors on mount
  useEffect(() => {
    const hostelParam = searchParams.get('hostel');
    if (hostelParam) {
      setSelectedHostel(hostelParam);
      loadVendorsByHostel(hostelParam);
    } else {
      loadAllVendors();
    }
  }, [searchParams]);

  const loadAllVendors = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await vendorAPI.getAllVendors();
      setVendors(results);
      setShowAll(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorsByHostel = async (hostel: string) => {
    setLoading(true);
    setError('');
    setShowAll(false);
    try {
      const results = await vendorAPI.getVendorsByHostel(hostel);
      setVendors(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedHostel) {
      loadAllVendors();
      return;
    }

    setLoading(true);
    setError('');
    setShowAll(false);
    try {
      const results = await vendorAPI.searchVendors(
        searchQuery, 
        selectedCategory || undefined,
        selectedHostel || undefined
      );
      setVendors(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    // Filter vendors by category
    filterByCategory(category);
  };

  const filterByCategory = async (category: string) => {
    setLoading(true);
    setError('');
    setShowAll(false);
    try {
      const results = await vendorAPI.searchVendors(category, category);
      setVendors(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to filter vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get filtered vendors count for display
  const getCategoryCount = (category: string) => {
    if (showAll || !selectedCategory || selectedCategory === category) {
      return vendors.filter(v => {
        const vendorCategory = v.category?.toLowerCase() || '';
        const searchCategory = category.toLowerCase();
        // Match category keywords
        if (searchCategory.includes('food') || searchCategory.includes('drink')) {
          return vendorCategory.includes('food') || vendorCategory.includes('drink') || vendorCategory.includes('restaurant') || vendorCategory.includes('bakery');
        }
        if (searchCategory.includes('fashion') || searchCategory.includes('beauty')) {
          return vendorCategory.includes('fashion') || vendorCategory.includes('beauty') || vendorCategory.includes('clothing');
        }
        if (searchCategory.includes('service') || searchCategory.includes('creative')) {
          return vendorCategory.includes('service') || vendorCategory.includes('creative') || vendorCategory.includes('repair') || vendorCategory.includes('printing');
        }
        if (searchCategory.includes('tech')) {
          return vendorCategory.includes('tech') || vendorCategory.includes('laptop') || vendorCategory.includes('phone') || vendorCategory.includes('electronic');
        }
        return vendorCategory.includes(searchCategory);
      }).length;
    }
    return 0;
  };

  return (
    <div className="vendor-search-page">
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <BackButton />
      </div>
      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar-container">
          <div className="search-bar">
            <span className="search-icon">
              <Icons name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input-main"
            />
            <button onClick={handleSearch} className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>


        {/* Category Filters */}
        <div className="category-section">
          <h3 className="category-title">Browse by Category:</h3>
          <div className="category-buttons">
            {Object.entries(categories).map(([category, config]) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                style={{
                  backgroundColor: selectedCategory === category ? config.color : undefined,
                  color: selectedCategory === category ? 'white' : undefined
                }}
              >
                {category} {getCategoryCount(category) > 0 && `(${getCategoryCount(category)})`}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {error && <div className="error-message">{error}</div>}

        {loading && <Loader />}

        {!loading && vendors.length > 0 && (
          <div className="vendors-grid-modern">
            {vendors.map((vendor) => (
              <VendorCard key={vendor._id} vendor={vendor} />
            ))}
          </div>
        )}

        {!loading && vendors.length === 0 && (
          <div className="no-results">
            <p>No vendors found. Try a different search or browse by category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSearch;

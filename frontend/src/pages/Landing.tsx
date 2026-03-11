import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { vendorAPI, VendorProfile } from '../api/vendor';
import { getApiBaseUrl } from '../utils/imageUtils';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Landing.css';

interface UserLocation {
  lat: number;
  lng: number;
}

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [nearbyVendors, setNearbyVendors] = useState<VendorProfile[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Haversine formula to calculate distance between two coordinates in kilometers
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get approximate coordinates for a vendor based on location/hostel name
  // KNUST center: 6.6720° N, 1.5710° W
  const getVendorCoordinates = (vendor: VendorProfile): { lat: number; lng: number } => {
    // KNUST campus center coordinates
    const knustCenter = { lat: 6.6720, lng: -1.5710 };
    
    // If vendor has exact coordinates (future enhancement), use those
    // For now, we'll use approximate coordinates based on KNUST campus
    // Use a hash of vendor ID to create consistent but varied coordinates
    // In production, you could:
    // 1. Store exact coordinates when vendors register
    // 2. Use Google Geocoding API to convert location/hostel names to coordinates
    // 3. Maintain a database of known hostel coordinates
    
    // Create a simple hash from vendor ID for consistent positioning
    let hash = 0;
    for (let i = 0; i < vendor._id.length; i++) {
      hash = vendor._id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert hash to a value between -1 and 1
    const normalizedHash = (hash % 1000) / 1000;
    
    // Add small variations around KNUST center (within ~1.5km radius)
    const variation = 0.015; // ~1.5km variation
    return {
      lat: knustCenter.lat + (normalizedHash * variation),
      lng: knustCenter.lng + ((normalizedHash * 0.7) * variation) // Different multiplier for longitude
    };
  };

  // Calculate distance from user location to vendor
  const calculateDistance = (vendor: VendorProfile): string => {
    if (!userLocation) {
      return 'Nearby';
    }

    try {
      const vendorCoords = getVendorCoordinates(vendor);
      const distanceKm = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        vendorCoords.lat,
        vendorCoords.lng
      );

      // Format distance
      if (distanceKm < 1) {
        return `${(distanceKm * 1000).toFixed(0)} m away`;
      } else {
        return `${distanceKm.toFixed(1)} km away`;
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 'Nearby';
    }
  };

  // Get user location using browser Geolocation API
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error.message);
          setLocationError('Location access denied. Showing all vendors.');
          // Continue without location - will show all vendors
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation not supported by your browser.');
    }
  }, []);

  // Fetch vendors when component mounts or when user logs in
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        // Try to fetch vendors - if user is logged in, use authenticated endpoint
        // If not logged in, we'll need a public endpoint (you may need to create one)
        let vendors: VendorProfile[] = [];
        
        if (user) {
          // User is logged in - use authenticated endpoint
          vendors = await vendorAPI.getAllVendors();
        } else {
          // For non-logged-in users, fetch from public endpoint
          try {
            const apiBaseUrl = getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/public/vendors`);
            if (response.ok) {
              vendors = await response.json();
            } else {
              console.log('Public endpoint not available');
              vendors = [];
            }
          } catch (err) {
            console.log('Could not fetch vendors for non-logged-in user:', err);
            vendors = [];
          }
        }

        // Sort vendors by distance (if user location available) or by rating
        let sortedVendors = vendors.filter(v => v.status === 'APPROVED' && !v.isFrozen);
        
        if (userLocation) {
          // Sort by distance first, then by rating
          sortedVendors = sortedVendors.sort((a, b) => {
            const coordsA = getVendorCoordinates(a);
            const coordsB = getVendorCoordinates(b);
            const distanceA = calculateHaversineDistance(
              userLocation.lat,
              userLocation.lng,
              coordsA.lat,
              coordsA.lng
            );
            const distanceB = calculateHaversineDistance(
              userLocation.lat,
              userLocation.lng,
              coordsB.lat,
              coordsB.lng
            );
            
            // Sort by distance first (closest first)
            if (Math.abs(distanceA - distanceB) > 0.5) {
              return distanceA - distanceB;
            }
            // If distances are similar, sort by rating
            if (b.rating !== a.rating) {
              return (b.rating || 0) - (a.rating || 0);
            }
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          });
        } else {
          // No location - sort by rating and review count
          sortedVendors = sortedVendors.sort((a, b) => {
            if (b.rating !== a.rating) {
              return (b.rating || 0) - (a.rating || 0);
            }
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          });
        }
        
        sortedVendors = sortedVendors.slice(0, 3); // Show top 3 vendors

        setNearbyVendors(sortedVendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setNearbyVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [user, userLocation]);

  // Get category emoji
  const getCategoryEmoji = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Food': '🍕',
      'Fashion': '👕',
      'Services': '🎓',
      'Tech': '💻',
      'Medicine': '🏥'
    };
    return categoryMap[category] || '📍';
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Is PlugFindr free to use?",
      a: "Yes! PlugFindr is completely free for both students and vendors. No hidden fees or charges."
    },
    {
      q: "How do I verify my vendor account?",
      a: "Vendors go through a verification process where we review your business details. This ensures all vendors are legitimate and trustworthy."
    },
    {
      q: "How do reviews work?",
      a: "Students can leave reviews and ratings for vendors they've interacted with. This helps other students make informed decisions."
    },
    {
      q: "Can I search by location or hostel?",
      a: "Yes! You can filter vendors by specific hostels or campus locations to find services closest to you."
    },
    {
      q: "Is my personal information safe?",
      a: "Absolutely! We take your privacy seriously. Your personal information is encrypted and never shared with vendors without your consent."
    },
    {
      q: "How can I provide feedback or report issues?",
      a: "Use the Feedback button in the navigation bar to share your thoughts, report bugs, suggest features, or provide general feedback. We value your input and work on improvements regularly."
    }
  ];

  const categories = [
    { key: 'Food', icon: '🍕', label: 'Food', description: 'Meals, snacks, drinks & meal prep plugs.' },
    { key: 'Fashion', icon: '👕', label: 'Fashion', description: 'Clothing, sneakers, jewelry & styling.' },
    { key: 'Services', icon: '🎓', label: 'Services', description: 'Tutoring, printing, laundry and more.' },
    { key: 'Tech', icon: '💻', label: 'Tech', description: 'Phones, laptops, repairs & accessories.' },
    { key: 'Medicine', icon: '🏥', label: 'Medicine', description: 'Pharmacy, first‑aid and health services.' },
  ];

  return (
    <div className="landing-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-dots"></div>
        <div className="hero-scan"></div>
        
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="pulse-dot"></span>
              <span>Live Now</span>
            </div>
            
            <h1 className="hero-h1">
              Find Your <em>Perfect Plug</em> on Campus
              <span className="serif-accent">, Effortlessly</span>
            </h1>
            
            <p className="hero-desc">
              Connect with verified campus vendors, discover services near your hostel, 
              and get what you need with just a few taps. Your campus marketplace, reimagined.
            </p>
            
            <div className="hero-cta">
              <Link to="/register?role=STUDENT" className="btn-primary btn-xl">
                Register as Student
              </Link>
              <Link to="/register?role=VENDOR" className="btn-glass">
                Become a Vendor
              </Link>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="preview-card">
              <div className="live-badge">
                <span className="pulse-dot"></span>
                <span>Live Map</span>
              </div>
              
              <div className="map-canvas">
                <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Roads */}
                  <path d="M20 80 L180 80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <path d="M100 20 L100 140" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <path d="M40 40 L160 120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,2" />
                  
                  {/* Buildings */}
                  <rect x="30" y="30" width="20" height="20" fill="rgba(255,255,255,0.08)" />
                  <rect x="150" y="30" width="20" height="20" fill="rgba(255,255,255,0.08)" />
                  <rect x="30" y="110" width="20" height="20" fill="rgba(255,255,255,0.08)" />
                  <rect x="150" y="110" width="20" height="20" fill="rgba(255,255,255,0.08)" />
                  
                  {/* User Location (Center) */}
                  <circle cx="100" cy="80" r="8" fill="var(--brand)" opacity="0.8">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Vendor Pins - Dynamic based on fetched vendors */}
                  {nearbyVendors.slice(0, 4).map((vendor, index) => {
                    const positions = [
                      { x: 60, y: 50 },
                      { x: 140, y: 50 },
                      { x: 60, y: 110 },
                      { x: 140, y: 110 }
                    ];
                    const colors = ['var(--electric)', 'var(--electric)', 'var(--gold)', 'var(--brand)'];
                    const pos = positions[index] || { x: 100, y: 80 };
                    return (
                      <g key={vendor._id}>
                        <circle cx={pos.x} cy={pos.y} r="5" fill={colors[index] || 'var(--brand)'} />
                        <line 
                          x1="100" 
                          y1="80" 
                          x2={pos.x} 
                          y2={pos.y} 
                          stroke="rgba(255,107,43,0.3)" 
                          strokeWidth="1" 
                          strokeDasharray="2,2" 
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              <div className="vendor-rows">
                {loadingVendors ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                    Loading nearby vendors...
                  </div>
                ) : nearbyVendors.length > 0 ? (
                  nearbyVendors.slice(0, 3).map((vendor) => (
                    <div key={vendor._id} className="vendor-row">
                      <div className="vendor-icon">{getCategoryEmoji(vendor.category || '')}</div>
                      <div className="vendor-info">
                        <div className="vendor-name">{vendor.businessName}</div>
                        <div className="vendor-distance">{calculateDistance(vendor)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                    No vendors available yet
                  </div>
                )}
              </div>
            </div>
            
            {/* Floating Elements */}
            {nearbyVendors.length > 0 && (
              <>
                <div className="float-el float-1">
                  <span>⭐ {nearbyVendors[0]?.rating?.toFixed(1) || '4.8'}</span>
                </div>
                <div className="float-el float-2">
                  <span>🚀 Fast</span>
                </div>
                <div className="float-el float-3">
                  <span>✓ Verified</span>
                </div>
              </>
            )}
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">500<em>+</em></div>
              <div className="stat-label">Vendors</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">2<em>K</em>+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">10<em>K</em>+</div>
              <div className="stat-label">Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-hiw">
        <div className="section-inner">
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-h2">
            Get Started in <em>Three Simple Steps</em>
          </h2>
          
          <div className="hiw-grid">
            <div className="hiw-card" data-number="1">
              <div className="hiw-icon">1</div>
              <div className="hiw-content">
                <h3>Sign Up</h3>
                <p>Create your free account in seconds. Choose your role as a Student or Vendor.</p>
              </div>
            </div>
            <div className="hiw-card" data-number="2">
              <div className="hiw-icon">2</div>
              <div className="hiw-content">
                <h3>Explore</h3>
                <p>Browse through verified vendors, read reviews, and find what you need.</p>
              </div>
            </div>
            <div className="hiw-card" data-number="3">
              <div className="hiw-icon">3</div>
              <div className="hiw-content">
                <h3>Connect</h3>
                <p>Reach out directly via WhatsApp and get what you need, fast.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="section-features">
        <div className="section-inner">
          <div className="section-eyebrow">Why It Works</div>
          <h2 className="section-h2">
            Powerful, <em>Student‑First Features</em>
          </h2>
          <div className="features-grid">
            <div className="feature-tile">
              <div className="feature-icon-wrap">🔍</div>
              <h3>Easy Search</h3>
              <p>Find vendors by category, location, or hostel</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">⭐</div>
              <h3>Verified Vendors</h3>
              <p>All vendors are verified and reviewed</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">💬</div>
              <h3>Direct Contact</h3>
              <p>Connect instantly via WhatsApp</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Works perfectly on all devices</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">🔒</div>
              <h3>Safe & Secure</h3>
              <p>Your data is protected</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">📍</div>
              <h3>Location-Based</h3>
              <p>Find vendors near your hostel</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">⏰</div>
              <h3>24/7 Access</h3>
              <p>Browse anytime, anywhere</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap">💡</div>
              <h3>Feedback System</h3>
              <p>Share your thoughts and suggestions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-categories">
        <div className="section-inner">
          <div className="section-eyebrow">Categories</div>
          <h2 className="section-h2">
            Explore by <em>Category</em>
          </h2>
          
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                to={`/login?category=${encodeURIComponent(cat.key)}`}
                className="cat-tile-link"
              >
                <div className="cat-tile">
                  <div className="cat-icon">{cat.icon}</div>
                  <h3>{cat.label}</h3>
                  <p className="cat-description">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-testimonials">
        <div className="section-inner">
          <div className="section-eyebrow">Testimonials</div>
          <h2 className="section-h2">
            What <em>Students Say</em>
          </h2>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="t-quote">"</div>
              <p className="t-text">
                PlugFindr made finding vendors so easy! I found a great food vendor right in my hostel area. 
                The WhatsApp integration is super convenient.
              </p>
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-author">
                <div className="t-avatar">AK</div>
                <div>
                  <div className="t-name">Ama Kofi</div>
                  <div className="t-role">Student, Computer Science</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="t-quote">"</div>
              <p className="t-text">
                As a vendor, PlugFindr has helped me reach so many students. The platform is user-friendly 
                and I've seen a huge increase in customers!
              </p>
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-author">
                <div className="t-avatar">JM</div>
                <div>
                  <div className="t-name">John Mensah</div>
                  <div className="t-role">Vendor, Food Services</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="t-quote">"</div>
              <p className="t-text">
                The search feature is amazing! I can filter by category and hostel. Found exactly what I 
                needed in seconds. Highly recommend!
              </p>
              <div className="t-stars">⭐⭐⭐⭐⭐</div>
              <div className="t-author">
                <div className="t-avatar">SA</div>
                <div>
                  <div className="t-name">Sarah Adjei</div>
                  <div className="t-role">Student, Business</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-faq">
        <div className="section-inner">
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-h2">
            Frequently Asked <em>Questions</em>
          </h2>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-q">
                  {faq.q}
                  <div className="faq-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
                {openFaq === index && (
                  <div className="faq-a">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

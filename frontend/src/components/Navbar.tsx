import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Icons from './Icons';
import Logo from './Logo';
import GeneralFeedbackModal from './GeneralFeedbackModal';
import './Navbar.css';

interface NavbarProps {
  userRole?: 'STUDENT' | 'VENDOR' | 'ADMIN';
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user || !user.role) return '/login';
    const roleRoutes: Record<string, string> = {
      STUDENT: '/student/dashboard',
      VENDOR: '/vendor/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return roleRoutes[user.role] || '/login';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Lock body scroll when menu is open on mobile
  useEffect(() => {
    if (menuOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  // Define menu items based on role
  const getMenuItems = () => {
    const role = (user?.role || userRole) as 'STUDENT' | 'VENDOR' | 'ADMIN' | undefined;
    if (!role) return [];

    switch (role) {
      case 'STUDENT':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: 'home' },
          { path: '/student/search', label: 'Search Vendors', icon: 'search' },
          { path: '/student/reviews', label: 'My Reviews', icon: 'star' },
          { path: '/student/feedback', label: 'My Feedback', icon: 'file' },
          { path: '/student/about', label: 'About', icon: 'info' },
        ];
      case 'VENDOR':
        return [
          { path: '/vendor/dashboard', label: 'Dashboard', icon: 'home' },
          { path: '/vendor/profile', label: 'My Profile', icon: 'user' },
          { path: '/vendor/market', label: 'Market', icon: 'market' },
          { path: '/vendor/upload-flyers', label: 'Upload Flyers', icon: 'upload' },
          { path: '/vendor/feedback', label: 'Customer Feedback', icon: 'file' },
          { path: '/vendor/my-feedback', label: 'My Feedback', icon: 'file' },
          { path: '/vendor/about', label: 'About', icon: 'info' },
        ];
          case 'ADMIN':
            return [
              { path: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
              { path: '/admin/vendor-approvals', label: 'Vendor Approvals', icon: 'check' },
              { path: '/admin/vendors', label: 'Vendor List', icon: 'store' },
              { path: '/admin/students', label: 'Student List', icon: 'user' },
              { path: '/admin/feedback-monitors', label: 'Feedback Monitors', icon: 'file' },
              { path: '/admin/about', label: 'About', icon: 'info' },
            ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const getInitials = (name?: string, email?: string) => {
    if (name && typeof name === 'string' && name.trim()) {
      const parts = name.trim().split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email && typeof email === 'string' && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Add role-specific classes for consistent mobile styling
  const getNavbarClass = () => {
    const role = user?.role;
    if (role === 'VENDOR') return 'navbar-vendor';
    if (role === 'STUDENT') return 'navbar-student';
    if (role === 'ADMIN') return 'navbar-admin';
    return '';
  };

  return (
    <nav className={`navbar ${getNavbarClass()}`}>
      <div className="navbar-container">
        <Link to={user ? getDashboardLink() : '/'} className="navbar-brand" onClick={closeMenu}>
          <Logo size="medium" showText={true} variant="navbar" />
        </Link>
        
        {/* Desktop Navigation Links */}
        {user && (
          <div className="navbar-desktop-links">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-desktop-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        
        <div className="navbar-right">
          {user && (user.role === 'STUDENT' || user.role === 'VENDOR') && (
            <button
              className="navbar-feedback-btn"
              onClick={() => setShowFeedbackModal(true)}
              aria-label="Share Feedback"
              title="Share Feedback"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feedback-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="feedback-text">Feedback</span>
              <span className="feedback-dot"></span>
            </button>
          )}
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Icons name="moon" size={20} /> : <Icons name="sun" size={20} />}
          </button>
          
          {user ? (
            <>
              {/* Profile Dropdown - Desktop */}
              <div className="navbar-profile-dropdown desktop-only" ref={profileDropdownRef}>
                <button
                  className="navbar-profile-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User profile menu"
                >
                  <div className="navbar-profile-avatar">
                    {user ? getInitials(user.name, user.email) : 'U'}
                  </div>
                </button>
                {profileDropdownOpen && (
                  <div className="navbar-profile-menu">
                    <div className="profile-menu-header">
                      <div className="profile-menu-avatar">
                        {user ? getInitials(user.name, user.email) : 'U'}
                      </div>
                      <div className="profile-menu-info">
                        <div className="profile-menu-name">
                          {(user?.name && typeof user.name === 'string') 
                            ? user.name 
                            : (user?.email && typeof user.email === 'string')
                            ? user.email.split('@')[0]
                            : (user?.role === 'ADMIN' ? 'Admin' : 'User')}
                        </div>
                        <div className="profile-menu-email">
                          {(user?.email && typeof user.email === 'string') ? user.email : 'No email'}
                        </div>
                      </div>
                    </div>
                    <div className="profile-menu-divider"></div>
                    <Link
                      to={getDashboardLink().replace('/dashboard', '/settings')}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="profile-menu-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                      </svg>
                      Change Username
                    </Link>
                    <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="profile-menu-item logout-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                className="navbar-menu-btn mobile-only"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span className="menu-text">Menu</span>
                <span className="menu-icon-wrapper">
                  {menuOpen ? <Icons name="close" size={20} /> : <Icons name="menu" size={20} />} 
                </span>
              </button>
            </>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="navbar-login" onClick={closeMenu}>
                Login
              </Link>
              {location.pathname !== '/' && (
                <Link to="/register" className="navbar-register" onClick={closeMenu}>
                  Register
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Backdrop */}
        <div 
          className={`navbar-dropdown-backdrop ${menuOpen ? 'active' : ''}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Mobile Menu Dropdown */}
        <div className={`navbar-dropdown ${menuOpen ? 'active' : ''}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="dropdown-icon"><Icons name={item.icon} size={18} /></span>
              {item.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to={getDashboardLink().replace('/dashboard', '/settings')}
                className="navbar-dropdown-item"
                onClick={closeMenu}
              >
                <span className="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                  </svg>
                </span>
                Change Username
              </Link>
              <button onClick={handleLogout} className="navbar-dropdown-item logout-btn">
                <span className="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <GeneralFeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </nav>
  );
};

export default Navbar;

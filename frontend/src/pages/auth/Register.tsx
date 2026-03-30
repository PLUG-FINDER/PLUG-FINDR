import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { registerSchema, type RegisterFormData } from '../../validation/authSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification, ActionCodeSettings } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { createCountryCodesWithFlags } from '../../utils/countryFlags';
import './Auth.css';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+1');
  // const navigate = useNavigate();
  const adminPinInputRef = useRef<HTMLInputElement>(null);
  const authCardRef = useRef<HTMLDivElement>(null);

  // Get role from URL query parameter
  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'VENDOR' || roleParam === 'STUDENT' || roleParam === 'ADMIN') 
    ? roleParam 
    : 'STUDENT';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    mode: 'onChange',
    defaultValues: {
      role: initialRole as 'STUDENT' | 'VENDOR' | 'ADMIN',
    },
  });

  const currentRole = watch('role');

  // Set role from URL parameter on mount
  useEffect(() => {
    if (roleParam === 'VENDOR' || roleParam === 'STUDENT') {
      setValue('role', roleParam as 'STUDENT' | 'VENDOR');
    }
  }, [roleParam, setValue]);

  // Common country codes with flags
  const countryCodes = createCountryCodesWithFlags([
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+234', country: 'NG' },
    { code: '+233', country: 'GH' },
    { code: '+254', country: 'KE' },
    { code: '+27', country: 'ZA' },
    { code: '+91', country: 'IN' },
    { code: '+86', country: 'CN' },
    { code: '+81', country: 'JP' },
    { code: '+82', country: 'KR' },
    { code: '+61', country: 'AU' },
    { code: '+64', country: 'NZ' },
    { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' },
    { code: '+39', country: 'IT' },
    { code: '+34', country: 'ES' },
    { code: '+31', country: 'NL' },
    { code: '+32', country: 'BE' },
    { code: '+41', country: 'CH' },
    { code: '+46', country: 'SE' },
    { code: '+47', country: 'NO' },
    { code: '+45', country: 'DK' },
    { code: '+358', country: 'FI' },
    { code: '+351', country: 'PT' },
    { code: '+353', country: 'IE' },
    { code: '+48', country: 'PL' },
    { code: '+7', country: 'RU/KZ' },
    { code: '+90', country: 'TR' },
    { code: '+971', country: 'AE' },
    { code: '+966', country: 'SA' },
    { code: '+20', country: 'EG' },
    { code: '+212', country: 'MA' },
    { code: '+255', country: 'TZ' },
    { code: '+256', country: 'UG' },
    { code: '+250', country: 'RW' },
    { code: '+251', country: 'ET' },
  ]);

  // Handle role change - show PIN modal for Admin
  const handleRoleChange = (newRole: 'STUDENT' | 'VENDOR' | 'ADMIN') => {
    if (newRole === 'ADMIN') {
      setShowAdminPinModal(true);
    } else {
      setValue('role', newRole);
      setAdminPin(''); // Clear PIN when switching away from Admin
    }
  };

  // Handle admin PIN modal confirmation
  const handleAdminPinConfirm = () => {
    if (adminPin.trim()) {
      setValue('role', 'ADMIN');
      setShowAdminPinModal(false);
    } else {
      setError('Admin PIN is required');
    }
  };

  // Handle admin PIN modal cancellation
  const handleAdminPinCancel = () => {
    setAdminPin('');
    setValue('role', 'STUDENT');
    setShowAdminPinModal(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const passwordInputType = showPassword ? 'text' : 'password';

  // Remove readonly from admin PIN input when modal opens to allow typing while preventing autofill
  useEffect(() => {
    if (showAdminPinModal && adminPinInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        if (adminPinInputRef.current) {
          adminPinInputRef.current.removeAttribute('readonly');
        }
      }, 100);
    }
  }, [showAdminPinModal]);

  // #region agent log
  useEffect(() => {
    if (authCardRef.current) {
      const card = authCardRef.current;
      const computed = window.getComputedStyle(card);
      const viewportWidth = window.innerWidth;
      const mediaQueryMatch769 = window.matchMedia('(min-width: 769px)').matches;
      const mediaQueryMatch1025 = window.matchMedia('(min-width: 1025px)').matches;
      
      fetch('http://127.0.0.1:7242/ingest/f66f5750-cf54-4ed3-b984-2b9a5b6acd7e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Register.tsx:useEffect',
          message: 'Auth card computed styles check - post-fix',
          data: {
            viewportWidth,
            mediaQueryMatch769,
            mediaQueryMatch1025,
            computedWidth: computed.width,
            computedMaxWidth: computed.maxWidth,
            computedMargin: computed.margin,
            actualWidth: card.offsetWidth,
            actualClientWidth: card.clientWidth
          },
          timestamp: Date.now(),
          runId: 'post-fix',
          hypothesisId: 'A'
        })
      }).catch(() => {});
    }
  }, []);
  // #endregion

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    // If role is ADMIN but no PIN, show error
    if (data.role === 'ADMIN' && !adminPin) {
      setError('Admin PIN is required for admin registration.');
      return;
    }
    
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Combine country code with phone number for students
      let whatsappNumber = data.whatsappNumber;
      if (data.role === 'STUDENT' && data.whatsappNumber) {
        // Remove any existing country code and add the selected one
        const phoneOnly = data.whatsappNumber.replace(/^\+\d+/, '').replace(/\D/g, '');
        whatsappNumber = `${whatsappCountryCode}${phoneOnly}`;
      }

      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Step 2: Send email verification
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth-action`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(firebaseUser, actionCodeSettings);

      // Step 3: Register with backend (includes Firebase UID)
      await authAPI.register({
        email: data.email,
        password: data.password,
        role: data.role,
        name: data.name,
        whatsappNumber,
        adminPin: adminPin || undefined,
        firebaseUID: firebaseUser.uid, // Pass Firebase UID to backend
      });
      
      reset();
      setAdminPin('');
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="auth-title">Check Your Email</h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              We've sent a verification email to <strong>{registeredEmail}</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Please click the link in the email to verify your account before logging in.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <Link to="/resend-verification" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
                resend verification email
              </Link>
            </p>
            <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
      <div ref={authCardRef} className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="auth-title">Register for PlugFindr</h1>
        <form onSubmit={handleSubmit(onSubmit as any)} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Enter your name"
              className={errors.name ? 'auth-input-error' : ''}
            />
            {errors.name && (
              <span className="auth-field-error">{errors.name.message}</span>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={errors.email ? 'auth-input-error' : ''}
            />
            {errors.email && (
              <span className="auth-field-error">{errors.email.message}</span>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={passwordInputType}
                {...register('password')}
                placeholder="Min 6 chars, 1 letter & 1 number"
                title="Enter your password (minimum 6 characters, at least 1 letter and 1 number)"
                className={errors.password ? 'auth-input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={passwordInputType === 'text' ? 'Hide password' : 'Show password'}
              >
                {passwordInputType === 'text' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="auth-field-error">{errors.password.message}</span>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              {...register('role')}
              onChange={(e) => {
                const newRole = e.target.value as 'STUDENT' | 'VENDOR' | 'ADMIN';
                handleRoleChange(newRole);
              }}
              value={currentRole}
              className={errors.role ? 'auth-input-error' : ''}
            >
              <option value="STUDENT">Student</option>
              <option value="VENDOR">Vendor</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && (
              <span className="auth-field-error">{errors.role.message}</span>
            )}
          </div>

          {currentRole === 'STUDENT' && (
            <div className="auth-field">
              <label htmlFor="whatsappNumber">WhatsApp Number <span style={{ color: 'var(--error)' }}>*</span></label>
              <div className="phone-input-wrapper">
                <select
                  value={whatsappCountryCode}
                  onChange={(e) => setWhatsappCountryCode(e.target.value)}
                  style={{ fontFamily: 'inherit' }}
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code} {cc.country}
                    </option>
                  ))}
                </select>
                <input
                  id="whatsappNumber"
                  type="tel"
                  {...register('whatsappNumber')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setValue('whatsappNumber', value);
                  }}
                  placeholder="Phone number"
                  className={errors.whatsappNumber ? 'auth-input-error' : ''}
                />
              </div>
              {errors.whatsappNumber && (
                <span className="auth-field-error">{errors.whatsappNumber.message}</span>
              )}
            </div>
          )}

          <div className="auth-field-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined, fontWeight: 500 }}>
              I agree to the <button type="button" className="text-link" onClick={() => setShowTermsModal(true)} style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined }}>Terms and Conditions</button>
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={loading || !termsAccepted}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: window.innerWidth <= 768 ? '1.2rem' : '0.9rem', marginBottom: '1rem' }}>Or continue with</p>
          {currentRole === 'STUDENT' && !watch('whatsappNumber') && (
            <div style={{ color: '#dc2626', fontSize: window.innerWidth <= 768 ? '1.2rem' : '0.875rem', marginBottom: '0.75rem', textAlign: 'center', fontWeight: 500 }}>
              Please enter your WhatsApp number above to use Google Sign-Up
            </div>
          )}
          <GoogleSignInButton 
            role={currentRole} 
            isSignUp={true} 
            whatsappNumber={currentRole === 'STUDENT' ? `${whatsappCountryCode}${watch('whatsappNumber') || ''}`.replace(/^\+\d+/, whatsappCountryCode) : undefined}
          />
        </div>
        <p className="auth-link">
          <span style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined, fontWeight: 500 }}>
            Already have an account? <a href="/login" style={{ fontSize: window.innerWidth <= 768 ? '1.2rem' : undefined }}>Login here</a>
          </span>
        </p>
      </div>

      {showAdminPinModal && (
        <div className="terms-modal-backdrop" onClick={handleAdminPinCancel}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2>Admin Secret PIN Required</h2>
            <div className="terms-content" style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                To register as an Admin, you must provide the Admin Secret PIN.
              </p>
              <div className="auth-field">
                <label htmlFor="adminPin">Admin Secret PIN</label>
                <input
                  ref={adminPinInputRef}
                  id="adminPin"
                  name="admin-secret-pin"
                  type="password"
                  value={adminPin}
                  onChange={(e) => {
                    (e.target as HTMLInputElement).removeAttribute('readonly');
                    setAdminPin(e.target.value);
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).removeAttribute('readonly');
                  }}
                  onMouseDown={(e) => {
                    (e.target as HTMLInputElement).removeAttribute('readonly');
                  }}
                  placeholder="Enter Admin Secret PIN"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  readOnly
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleAdminPinCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminPinConfirm}
                disabled={!adminPin.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: adminPin.trim() ? '#ff6b2b' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: adminPin.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="terms-modal-backdrop" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: window.innerWidth <= 768 ? '2rem' : undefined }}>Terms and Conditions & Privacy Policy</h2>
            <div className="terms-content">
              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>1. Acceptance of Terms</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                By accessing and using PlugFindr ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                In addition, when using this Platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>2. User Accounts and Registration</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                To access certain features of the Platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process 
                and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and you agree not to disclose your password to any third party. 
                You are responsible for any activities or actions under your account, whether or not you have authorized such activities or actions. 
                PlugFindr reserves the right to terminate accounts that are inactive for an extended period or that violate our policies.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>3. Vendor Responsibilities</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                Vendors on PlugFindr certify that they have the legal right to sell the products or services listed. 
                Vendors must ensure that all product descriptions, prices, and availability are accurate and up-to-date. 
                Misrepresentation of products or services is strictly prohibited and may result in immediate account suspension.
                Vendors are solely responsible for fulfilling orders and resolving customer service issues in a timely manner.
                PlugFindr acts as a facilitator and is not a party to the actual transaction between buyers and sellers.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>4. Student/Buyer Responsibilities</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                Students and other buyers agree to use the Platform for lawful purposes only. 
                Harassment of vendors, posting of false reviews, or fraudulent activities are grounds for account termination.
                Buyers should exercise due diligence before making purchases. While PlugFindr verifies vendors, we cannot guarantee the quality or safety of every item or service listed.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>5. Intellectual Property</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                The Platform and its original content, features, and functionality are owned by PlugFindr and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                Users retain ownership of content they upload (such as flyers or reviews) but grant PlugFindr a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content in connection with the Platform.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>6. Limitation of Liability</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                In no event shall PlugFindr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; 
                (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, 
                whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
              </p>

              <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>7. Data Collection and Usage</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. 
                This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
                We use this data to facilitate transactions, improve our services, and communicate with you about updates and promotions.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>8. Information Sharing</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
                Through the Platform: We may share your information with other Users to enable them to provide the Services you request. For example, we share your name and delivery location with the Vendor.
                We do not sell your personal data to third parties for direct marketing purposes.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>9. Security</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                However, no internet transmission is completely secure, and we cannot guarantee the absolute security of your data.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>10. Cookies and Tracking Technologies</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                Cookies are files with small amount of data which may include an anonymous unique identifier.
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>

              <h3 style={{ fontSize: window.innerWidth <= 768 ? '1.4rem' : undefined }}>11. Contact Us</h3>
              <p style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
                If you have any questions about these Terms or our Privacy Policy, please contact us at kpetigojoseph4@gmail.com.
              </p>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="close-terms-btn" style={{ fontSize: window.innerWidth <= 768 ? '1.15rem' : undefined }}>
              Close (Terms and Conditions)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

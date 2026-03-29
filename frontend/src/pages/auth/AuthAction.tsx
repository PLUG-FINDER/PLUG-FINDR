import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';
import ResetPassword from './ResetPassword';
import './Auth.css';

const AuthAction: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'verifyEmail') {
    return <VerifyEmail />;
  }

  if (mode === 'resetPassword') {
    return <ResetPassword />;
  }

  return (
    <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="auth-title">Invalid Link</h1>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            This authentication link is invalid or unsupported.
          </p>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            You can request a new link below.
          </p>
          <Link to="/resend-verification" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
            Resend Verification Email
          </Link>
          <br />
          <Link to="/forgot-password" style={{ color: 'var(--primary-600)', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
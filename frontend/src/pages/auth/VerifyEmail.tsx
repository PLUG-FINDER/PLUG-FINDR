import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authAPI } from '../../api/auth';
import Loader from '../../components/Loader';
import './Auth.css';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode) {
        setError('Invalid verification link. Please use the link from your email.');
        setLoading(false);
        return;
      }

      if (mode !== 'verifyEmail') {
        setError('Invalid verification link. Please use the email verification link from your email.');
        setLoading(false);
        return;
      }

      setVerifying(true);

      try {
        // Verify the action code
        const actionCodeInfo = await checkActionCode(auth, oobCode);
        
        // Apply the action code to verify the email
        await applyActionCode(auth, oobCode);
        
        // Get the email from the action code info
        const email = actionCodeInfo.data.email;
        
        // Sync verification status to MongoDB backend
        if (email) {
          try {
            await authAPI.syncEmailVerification(email);
          } catch (syncError) {
            console.error('Failed to sync verification to backend:', syncError);
            // Continue even if sync fails - Firebase verification is done
          }
        }
        
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        if (err.code === 'auth/expired-action-code') {
          setError('The verification link has expired. Please request a new verification email.');
        } else if (err.code === 'auth/invalid-action-code') {
          setError('Invalid verification link. Please use the link from your email.');
        } else if (err.code === 'auth/user-disabled') {
          setError('This account has been disabled. Please contact support.');
        } else {
          setError(err.message || 'Failed to verify email. Please try again.');
        }
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (loading || verifying) {
    return (
      <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="auth-title">Verifying Email</h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Loader size="small" />
            <p style={{ color: '#64748b', marginTop: '1rem' }}>
              Please wait while we verify your email...
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              If you do not see future verification emails, check your spam or junk folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="auth-title">Email Verified!</h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Your email has been successfully verified.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              If you do not see future emails from us, please check your spam or junk folder.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="auth-title">Email Verification</h1>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            {error ? 'Verification failed. Please try again.' : 'Verifying your email...'}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            If you do not see the verification email, check your spam or junk folder.
          </p>
          <Link to="/resend-verification" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
            Resend Verification Email
          </Link>
          <br />
          <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendEmailVerification, ActionCodeSettings } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authAPI } from '../../api/auth';
import Loader from '../../components/Loader';
import './Auth.css';

const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

const ResendVerification: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ResendVerificationFormData) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Try to send via Firebase first (if user is logged in)
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === data.email) {
          const actionCodeSettings: ActionCodeSettings = {
            url: `${window.location.origin}/auth-action`,
            handleCodeInApp: false,
          };
          await sendEmailVerification(currentUser, actionCodeSettings);
          setSuccess(true);
          setLoading(false);
          return;
        }
      } catch (firebaseError: any) {
        // If Firebase fails, try backend
        console.log('Firebase send failed, trying backend:', firebaseError);
      }

      // Use backend API to resend verification
      await authAPI.resendVerificationEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
        <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="auth-title">Email Sent</h1>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              If that email exists and is not verified, a verification email has been sent.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Please check your inbox and click the verification link.
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
      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="auth-title">Resend Verification Email</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
          Enter your email address and we'll send you a new verification link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
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
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <Loader size="small" /> : 'Resend Verification Email'}
          </button>
        </form>
        <p className="auth-link">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerification;





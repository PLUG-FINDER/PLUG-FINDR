import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail, ActionCodeSettings } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Loader from '../../components/Loader';
import './Auth.css';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Configure the action code settings for password reset
      // This URL will be used in the email link
      const actionCodeSettings: ActionCodeSettings = {
        // Use a single Firebase action URL and branch by mode in-app
        url: `${window.location.origin}/auth-action`,
        // This must be true for email link sign-in
        handleCodeInApp: false,
      };

      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);
      setSuccess(true);
    } catch (err: any) {
      // Firebase will not reveal if email exists for security
      // But we'll show a generic error message
      if (err.code === 'auth/user-not-found') {
        // For security, don't reveal if email exists
        setSuccess(true); // Show success message even if user doesn't exist
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
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
              If that email exists, a password reset link has been sent to your email.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Please check your inbox and click the link to reset your password.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              If you do not see the email, please check your spam or junk folder.
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
        <h1 className="auth-title">Forgot Password</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          If you do not see the email, please check your spam or junk folder.
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
            {loading ? <Loader size="small" /> : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-link">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


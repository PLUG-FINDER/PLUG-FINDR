import React, { useState } from 'react';
import { studentAPI } from '../api/student';
import { vendorAPI } from '../api/vendor';
import { useAuth } from '../auth/AuthContext';
import { createCountryCodesWithFlags } from '../utils/countryFlags';
import './GeneralFeedbackModal.css';

interface GeneralFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralFeedbackModal: React.FC<GeneralFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+233');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Bug Report',
    'Feature Request',
    'Improvement',
    'Complaint',
    'Praise',
    'Other'
  ];

  const countryCodes = createCountryCodesWithFlags([
    { code: '+233', country: 'GH' },
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+234', country: 'NG' },
    { code: '+254', country: 'KE' },
    { code: '+27', country: 'ZA' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !message.trim() || !contactPhone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const fullPhoneNumber = `${countryCode}${contactPhone.replace(/^\+/, '')}`;
      const feedbackData = {
        category,
        message: message.trim(),
        contactPhone: fullPhoneNumber
      };
      
      // Use appropriate API based on user role
      if (user?.role === 'VENDOR') {
        await vendorAPI.createGeneralFeedback(feedbackData);
      } else {
        await studentAPI.createGeneralFeedback(feedbackData);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCategory('');
        setMessage('');
        setContactPhone('');
        setCountryCode('+233');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-backdrop" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>Share Your Feedback</h2>
          <button className="feedback-modal-close" onClick={onClose}>×</button>
        </div>
        <p className="feedback-modal-description">
          Help us improve the platform by sharing your thoughts, suggestions, or reporting issues.
        </p>
        {success ? (
          <div className="feedback-success-message">
            Feedback submitted successfully. Thank you for your input!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="feedback-error-message">{error}</div>}
            
            <div className="feedback-form-field">
              <label htmlFor="feedbackCategory">
                Category <span className="required">*</span>
              </label>
              <select
                id="feedbackCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="feedback-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="feedback-form-field">
              <label htmlFor="feedbackPhone">
                Phone Number <span className="required">*</span>
              </label>
              <div className="feedback-phone-input">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="feedback-country-code"
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code} {cc.country}
                    </option>
                  ))}
                </select>
                <input
                  id="feedbackPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Phone number"
                  className="feedback-phone-number"
                  required
                />
              </div>
            </div>

            <div className="feedback-form-field">
              <label htmlFor="feedbackMessage">
                Your Feedback <span className="required">*</span>
              </label>
              <textarea
                id="feedbackMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report any issues..."
                rows={5}
                className="feedback-textarea"
                required
              />
            </div>

            <div className="feedback-form-actions">
              <button type="button" onClick={onClose} className="feedback-cancel-btn">
                Cancel
              </button>
              <button type="submit" className="feedback-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GeneralFeedbackModal;


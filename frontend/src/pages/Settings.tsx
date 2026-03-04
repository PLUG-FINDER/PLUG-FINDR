import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { authAPI } from '../api/auth';
import './Settings.css';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (name.trim().length > 50) {
      setError('Name must not exceed 50 characters');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile(name.trim());
      updateUser(updatedUser);
      setSuccess('Username updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Change Username</h1>
        
        <form onSubmit={handleSubmit} className="settings-form">
          {error && <div className="settings-error">{error}</div>}
          {success && <div className="settings-success">{success}</div>}
          
          <div className="settings-field">
            <label htmlFor="name">Change Username</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              className={error ? 'settings-input-error' : ''}
              disabled={loading}
            />
            <p className="settings-hint">This is how your name will appear to others.</p>
          </div>

          <button 
            type="submit" 
            className="settings-button" 
            disabled={loading || !name.trim() || name.trim() === user?.name}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;


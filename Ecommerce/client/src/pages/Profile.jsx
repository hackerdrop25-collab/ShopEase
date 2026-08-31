/**
 * ShopEase - Profile Page
 *
 * User profile management:
 * - View profile info
 * - Update profile
 * - Change password
 * - Delete account
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout, updateProfile, changePassword } = useAuth();

  const [tab, setTab] = useState('profile'); // 'profile' or 'password'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Profile Form State
  // ─────────────────────────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Password Form State
  // ─────────────────────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Redirect if not authenticated
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialize forms from user data
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle profile form change
  // ─────────────────────────────────────────────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle password form change
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit profile update
  // ─────────────────────────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const result = await updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
    });

    setIsLoading(false);

    if (result.success) {
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit password change
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('❌ Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('❌ New password must be at least 8 characters!');
      setIsLoading(false);
      return;
    }

    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    setIsLoading(false);

    if (result.success) {
      setMessage('✅ Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle logout
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="auth-container">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setTab('profile');
              setMessage('');
            }}
          >
            Profile Info
          </button>
          <button
            className={`tab ${tab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setTab('password');
              setMessage('');
            }}
          >
            Change Password
          </button>
        </div>

        {/* Message */}
        {message && <div className="message">{message}</div>}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="auth-form">
            <div className="form-group">
              <label>Email (Cannot be changed)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="disabled"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout, updateProfile, changePassword } = useAuth();

  const [tab, setTab] = useState('profile'); // 'profile', 'password', or 'orders'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch orders when the orders tab is active
  useEffect(() => {
    if (tab === 'orders' && isAuthenticated) {
      fetchUserOrders();
    }
  }, [tab, isAuthenticated]);

  const fetchUserOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

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
      {/* Return to Home link */}
      <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
        ← Back to ShopEase Home
      </Link>

      <div className="auth-card profile-card" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="profile-header">
          <h1>My Profile</h1>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
          <button
            className={`tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setTab('orders');
              setMessage('');
            }}
          >
            My Orders
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

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="orders-tab" style={{ marginTop: '20px' }}>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '35px 20px', background: '#f7fafc', borderRadius: '12px' }}>
                <p style={{ color: '#718096', fontSize: '15px', fontWeight: '600', margin: 0 }}>No orders placed yet!</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '15px', display: 'inline-block' }}>Shop Now</Link>
              </div>
            ) : (
              <div className="orders-list" style={{ display: 'flex', flexDirection: 'col', gap: '20px' }}>
                {orders.map((order) => (
                  <div key={order._id} className="order-item-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block' }}>ORDER NUMBER</span>
                        <strong style={{ fontSize: '15px', color: '#2d3748' }}>{order.orderNumber}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block' }}>DATE PLACED</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block' }}>TOTAL AMOUNT</span>
                        <strong style={{ fontSize: '16px', color: '#48bb78' }}>₹{order.totalPrice}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block', textAlign: 'right' }}>STATUS</span>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: order.orderStatus === 'delivered' ? '#c6f6d5' : order.orderStatus === 'cancelled' ? '#fed7d7' : '#feebc8',
                          color: order.orderStatus === 'delivered' ? '#22543d' : order.orderStatus === 'cancelled' ? '#742a2a' : '#744210'
                        }}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: '#4a5568', fontWeight: '500' }}>
                            {item.title} <span style={{ color: '#a0aec0' }}>x {item.quantity}</span>
                          </span>
                          <span style={{ fontWeight: '600', color: '#2d3748' }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

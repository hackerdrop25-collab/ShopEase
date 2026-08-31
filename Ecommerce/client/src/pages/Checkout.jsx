/**
 * ShopEase - Checkout Page (Phase 5 & 6)
 *
 * Shipping address details, order summary, payment selection (COD vs Razorpay),
 * and order confirmation.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/shopping.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address state
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    fetchCart();
  }, []);

  const cartItems = cart?.items || [];
  const itemsPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingPrice = itemsPrice > 500 || itemsPrice === 0 ? 0 : 40;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create order in backend
      const res = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
      });

      const newOrder = res.data.order;

      // 2. If payment method is Razorpay, trigger online payment
      if (paymentMethod === 'razorpay') {
        const payRes = await api.post('/payment/create-order', { orderId: newOrder._id });
        
        // Verify payment
        await api.post('/payment/verify', {
          orderId: newOrder._id,
          razorpayPaymentId: `pay_demo_${Date.now()}`,
          razorpayOrderId: payRes.data.razorpayOrder.id,
        });
      }

      await fetchCart();
      alert('🎉 Order Placed Successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Your Cart is Empty</h2>
        <p>Add some products before proceeding to checkout!</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '15px' }}>
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '24px' }}>💳 Checkout & Payment</h2>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
        {/* Shipping Form & Payment Selection */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>📍 Shipping Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Street Address</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleChange}
                placeholder="Flat 101, Bluebell Apartments, Main St"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>City</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>State</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>💵 Payment Method</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                Cash on Delivery (COD)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                Razorpay / Online Payment 💳
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Processing Order...' : `Place Order (Total: ₹${totalPrice.toLocaleString('en-IN')})`}
          </button>
        </form>

        {/* Order Summary Column */}
        <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>🛍️ Order Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {cartItems.map((item) => (
              <div key={item.product?._id || item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>{item.product?.title || item.title} (x{item.quantity})</span>
                <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Items Total:</span>
              <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Shipping:</span>
              <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>GST (18%):</span>
              <span>₹{taxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <span>Total:</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

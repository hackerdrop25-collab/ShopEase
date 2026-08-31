/**
 * ShopEase - Orders Page (Phase 5)
 *
 * Displays user order history with live status tracking badges.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/shopping.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#dcfce7', color: '#15803d', icon: '✅' };
      case 'Shipped':
        return { bg: '#e0f2fe', color: '#0369a1', icon: '🚚' };
      case 'Processing':
      default:
        return { bg: '#fef3c7', color: '#b45309', icon: '⏳' };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading your orders...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '24px' }}>📦 My Orders</h2>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
          <h3>No Orders Found</h3>
          <p style={{ color: '#64748b' }}>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            return (
              <div
                key={order._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Order #{order._id.slice(-8)}</span>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '13px',
                      fontWeight: '700',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {badge.icon} {order.orderStatus || 'Processing'}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '10px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping address footer */}
                <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', fontSize: '13px', color: '#64748b' }}>
                  📍 <strong>Deliver to:</strong> {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode} (Ph: {order.shippingAddress?.phone})
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

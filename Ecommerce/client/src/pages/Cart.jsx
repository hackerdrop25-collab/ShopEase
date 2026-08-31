/**
 * ShopEase - Cart Page (Phase 5)
 *
 * Displays items in the cart, updates quantity, deletes items,
 * and allows checkout with shipping address inputs.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/shopping.css';
import '../styles/auth.css';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    cart,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
  } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [checkoutError, setCheckoutError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const handleQtyChange = async (productId, currentQty, increment) => {
    const newQty = currentQty + increment;
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCheckoutError(null);

    // Basic address validation
    const { name, phone, street, city, state, pincode } = shippingAddress;
    if (!name || !phone || !street || !city || !state || !pincode) {
      setCheckoutError('Please fill out all shipping address fields.');
      return;
    }

    const result = await checkout(shippingAddress, 'cod');
    if (result.success) {
      setSuccessOrder(result.order);
    } else {
      setCheckoutError(result.error || 'Failed to place order.');
    }
  };

  if (successOrder) {
    return (
      <div className="shopping-page">
        <div className="empty-state">
          <div className="empty-state-icon" style={{ color: '#4caf50' }}>🎉</div>
          <h3>Order Placed Successfully!</h3>
          <p>Thank you for shopping with us. Your Order Number is: <strong>{successOrder.orderNumber}</strong></p>
          <div className="hero-buttons" style={{ justifyContent: 'center' }}>
            <Link to="/profile" className="btn btn-primary">View My Orders</Link>
            <Link to="/" className="btn btn-secondary" style={{ color: '#667eea', borderColor: '#667eea' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="shopping-page">
        <header className="navbar" style={{ boxShadow: 'none', background: 'transparent', padding: 0, marginBottom: '40px' }}>
          <div className="navbar-content" style={{ padding: 0 }}>
            <Link to="/" style={{ textDecoration: 'none' }}><h1 className="logo">🛒 ShopEase</h1></Link>
            <nav className="navbar-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>
          </div>
        </header>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some premium products to your cart and they will show up here.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  // Calculate prices
  const subtotal = cart.subtotal || 0;
  const shippingPrice = subtotal > 500 ? 0 : 40;
  const taxPrice = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shippingPrice + taxPrice;

  return (
    <div className="shopping-page">
      <header className="navbar" style={{ boxShadow: 'none', background: 'transparent', padding: 0, marginBottom: '40px' }}>
        <div className="navbar-content" style={{ padding: 0 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><h1 className="logo">🛒 ShopEase</h1></Link>
          <nav className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
        </div>
      </header>

      <h2 className="page-title">Shopping Cart</h2>

      <div className="cart-container">
        {/* Left Side: Items */}
        <div>
          <div className="cart-items-list">
            {items.map((item) => (
              <div className="cart-item" key={item.product?._id || item.product}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                  alt={item.title}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <button
                    onClick={() => removeFromCart(item.product?._id || item.product)}
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                </div>
                <div className="quantity-controller">
                  <button
                    onClick={() => handleQtyChange(item.product?._id || item.product, item.quantity, -1)}
                    className="qty-btn"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.product?._id || item.product, item.quantity, 1)}
                    className="qty-btn"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-price" style={{ textAlign: 'right' }}>
                  {item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="btn btn-secondary"
            style={{ marginTop: '20px', color: '#e53e3e', borderColor: '#e53e3e' }}
            disabled={loading}
          >
            Clear Cart
          </button>
        </div>

        {/* Right Side: Checkout Address & Summary */}
        <div className="order-summary-card">
          <h3 className="summary-heading">Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? 'Free' : shippingPrice}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%)</span>
            <span>{taxPrice}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{total}</span>
          </div>

          {/* Shipping Details form */}
          <form onSubmit={handleCheckout} className="checkout-form">
            <h4 style={{ borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>Shipping Address</h4>
            {checkoutError && (
              <div className="error-message" style={{ margin: '10px 0', fontSize: '13px', padding: '8px' }}>
                {checkoutError}
              </div>
            )}
            <div className="checkout-grid">
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Recipient Full Name"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="street"
                  placeholder="Street / Apartment"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-full"
              style={{ marginTop: '20px', padding: '14px', fontSize: '15px' }}
            >
              ⚡ Proceed to Checkout & Payment
            </button>
            <button
              type="submit"
              className="btn btn-secondary btn-full"
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Processing Checkout...' : 'Quick Place Order (COD)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * ShopEase - Wishlist Page (Phase 5)
 *
 * Displays items added to the wishlist.
 * Allows adding items directly to the cart or removing them.
 */

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/shopping.css';

export default function Wishlist() {
  const { wishlist, loading, toggleWishlist, addToCart } = useCart();

  const items = wishlist?.products || [];

  const handleAddToCart = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      // Remove from wishlist on successful add-to-cart
      await toggleWishlist(productId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="shopping-page">
        <header className="navbar" style={{ boxShadow: 'none', background: 'transparent', padding: 0, marginBottom: '40px' }}>
          <div className="navbar-content" style={{ padding: 0 }}>
            <Link to="/" style={{ textDecoration: 'none' }}><h1 className="logo">🛒 ShopEase</h1></Link>
            <nav className="navbar-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/cart" className="nav-link">Cart</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>
          </div>
        </header>
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h3>Your Wishlist is Empty</h3>
          <p>Explore our premium collections and add items you love to your wishlist.</p>
          <Link to="/" className="btn btn-primary">Discover Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-page">
      <header className="navbar" style={{ boxShadow: 'none', background: 'transparent', padding: 0, marginBottom: '40px' }}>
        <div className="navbar-content" style={{ padding: 0 }}>
          <Link to="/" style={{ textDecoration: 'none' }}><h1 className="logo">🛒 ShopEase</h1></Link>
          <nav className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/cart" className="nav-link">Cart</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
        </div>
      </header>

      <h2 className="page-title">My Wishlist</h2>

      <div className="products-grid">
        {items.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div className="product-card" key={product._id}>
              <button
                className="wishlist-btn active"
                onClick={() => toggleWishlist(product._id)}
                title="Remove from Wishlist"
                disabled={loading}
              >
                ❤️
              </button>
              <div className="product-image-container">
                <img
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                  alt={product.title}
                  className="product-image"
                />
              </div>
              <div className="product-details">
                <span className="product-brand">{product.brand || 'Premium'}</span>
                <h3 className="product-title">{product.title}</h3>
                <div className="product-rating">
                  ⭐ {product.rating || '4.5'}
                  <span className="rating-count">({product.numReviews || '12'})</span>
                </div>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 15px' }}
                    disabled={loading}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ShopEase - Home Page (Phase 4 & 5 Connected)
 *
 * Fetches and displays products from MongoDB.
 * Supports:
 * - Search by text (title/description)
 * - Category filter tabs
 * - Add to Cart / Add to Wishlist actions
 * - Catalog Seeding (creates demo products if DB is empty)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import '../styles/home.css';
import '../styles/shopping.css';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Health & Wellness',
];

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart, wishlist, addToCart, toggleWishlist, loading: cartLoading } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/products?limit=20';
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      const response = await api.get(url);
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = `/products?search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist?.products?.some(
      (item) => (item.product?._id || item.product) === productId
    );
  };

  // Seeding helper if DB has no products
  const handleSeedProducts = async () => {
    if (!isAuthenticated) {
      alert('Please Login/Register first to seed products (requires admin/user JWT token).');
      return;
    }
    
    try {
      setIsSeeding(true);
      const demoProducts = [
        {
          title: 'Noise Cancelling Headphones',
          description: 'Deep bass, active noise cancellation, and all-day comfort for work and travel.',
          price: 9999,
          category: 'Electronics',
          brand: 'Auralis',
          stock: 15,
          images: [{ public_id: 'headphones', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80', altText: 'Headphones' }]
        },
        {
          title: 'Premium Smartwatch',
          description: 'Track health, workouts, and notifications all day on a crisp AMOLED screen.',
          price: 14999,
          category: 'Electronics',
          brand: 'Horizon',
          stock: 20,
          images: [{ public_id: 'smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', altText: 'Smartwatch' }]
        },
        {
          title: 'Minimal Desk Lamp',
          description: 'Modern lighting for focused work and cozy evenings. Adjustable brightness.',
          price: 2499,
          category: 'Home & Kitchen',
          brand: 'Luma',
          stock: 30,
          images: [{ public_id: 'lamp', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', altText: 'Desk lamp' }]
        },
        {
          title: 'Urban Travel Backpack',
          description: 'Weather-resistant and lightweight, with compartments for laptops and accessories.',
          price: 4999,
          category: 'Fashion',
          brand: 'Northline',
          stock: 25,
          images: [{ public_id: 'backpack', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', altText: 'Backpack' }]
        }
      ];

      for (const prod of demoProducts) {
        await api.post('/products', prod);
      }

      await fetchProducts();
      alert('Demo products seeded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seed products. Please check if your login expired.');
    } finally {
      setIsSeeding(false);
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-content">
          <Link to="/" style={{ textDecoration: 'none' }}><h1 className="logo">🛒 ShopEase</h1></Link>
          
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', gap: '10px', flexGrow: 0.5, margin: '0 20px' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #edf2f7', outline: 'none', width: '100%' }}
            />
          </form>

          <nav className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="nav-link" style={{ position: 'relative' }}>
                  ❤️ Wishlist {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                  🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </Link>
                <Link to="/profile" className="nav-link">
                  My Profile
                </Link>
                <button onClick={logout} className="btn btn-danger">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <div className="hero" style={{ padding: '50px 20px' }}>
        <h2>Welcome to ShopEase</h2>
        <p>Premium Catalog & Instant Checkout Demo</p>
      </div>

      <main className="home-content">
        {/* Category selection */}
        <div className="categories-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '20px',
                padding: '8px 20px',
                minWidth: '100px',
                color: selectedCategory === cat ? 'white' : '#667eea',
                borderColor: '#667eea',
                backgroundColor: selectedCategory === cat ? '#667eea' : 'white'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Your database catalog is currently empty. Click below to add sample products instantly!</p>
            <button
              onClick={handleSeedProducts}
              className="btn btn-primary"
              disabled={isSeeding}
            >
              {isSeeding ? 'Seeding Catalog...' : 'Seed Demo Products'}
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <div className="product-card" key={prod._id}>
                <button
                  className={`wishlist-btn ${isInWishlist(prod._id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(prod._id)}
                  disabled={cartLoading}
                >
                  {isInWishlist(prod._id) ? '❤️' : '🤍'}
                </button>
                <div className="product-image-container">
                  <img
                    src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                    alt={prod.title}
                    className="product-image"
                  />
                </div>
                <div className="product-details">
                  <span className="product-brand">{prod.brand || 'ShopEase'}</span>
                  <h3 className="product-title">{prod.title}</h3>
                  <div className="product-rating">
                    ⭐ {prod.rating || '4.5'}
                    <span className="rating-count">({prod.numReviews || '10'})</span>
                  </div>
                  <div className="product-footer">
                    <span className="product-price">{prod.price}</span>
                    <button
                      onClick={() => addToCart(prod._id, 1)}
                      className="btn btn-primary"
                      style={{ fontSize: '13px', padding: '8px 15px' }}
                      disabled={cartLoading}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

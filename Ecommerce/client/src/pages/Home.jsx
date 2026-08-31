/**
 * AgriFresh - Direct Farm Agriculture & Organic Produce Marketplace
 *
 * Displays full 100+ agriculture, fruits, vegetables, seeds & farming tools catalog from MongoDB.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../components/ProductDetailModal';
import api from '../services/api';
import '../styles/home.css';
import '../styles/shopping.css';

const CATEGORIES = [
  'All',
  'Fresh Fruits',
  'Fresh Vegetables',
  'Seeds & Saplings',
  'Farming Tools',
  'Organic Staples',
];

const SUBCATEGORIES = {
  'Fresh Fruits': ['All', 'Apples & Pears', 'Mangoes & Tropical', 'Berries & Grapes', 'Citrus & Watermelon'],
  'Fresh Vegetables': ['All', 'Leafy Greens', 'Daily Essentials', 'Exotic & Salad', 'Root & Squash'],
  'Seeds & Saplings': ['All', 'Crop Seeds', 'Vegetable Seeds', 'Fruit Saplings', 'Garden Seeds'],
  'Farming Tools': ['All', 'Irrigation & Sprayers', 'Cutting & Pruning', 'Soil Testing & Care', 'Farm Protection'],
  'Organic Staples': ['All', 'Ghee & Oils', 'Honey & Sweeteners', 'Grains & Flours', 'Spices & Pulses'],
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cart, wishlist, addToCart, toggleWishlist, loading: cartLoading } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [isSeeding, setIsSeeding] = useState(false);

  // Selected product for detail modal
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/products?limit=50&sort=${sortOption}`;
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (selectedSubcategory !== 'All') {
        url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
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
      const url = `/products?search=${encodeURIComponent(search)}&sort=${sortOption}`;
      const response = await api.get(url);
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  const isInWishlist = (productId) => {
    return wishlist?.products?.some(
      (item) => (item.product?._id || item.product) === productId
    );
  };

  const handleSeedProducts = async () => {
    try {
      setIsSeeding(true);
      await api.post('/products/seed');
      await fetchProducts();
      alert('🎉 100+ Agriculture & Organic Catalog Seeded Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seed catalog.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleBuyNowDirect = async (e, prod) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to purchase.');
      return;
    }
    await addToCart(prod._id, 1);
    navigate('/checkout');
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <div className="home">
      {/* Navbar */}
      <header className="navbar" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div className="navbar-content">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
              🌾 AgriFresh <span style={{ fontSize: '13px', background: '#15803d', color: '#ffffff', padding: '2px 8px', borderRadius: '12px' }}>Farm Direct</span>
            </h1>
          </Link>
          
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', gap: '10px', flexGrow: 0.5, margin: '0 20px' }}>
            <input
              type="text"
              placeholder="Search fresh apples, organic tomatoes, wheat seeds, sprayers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '10px 18px', borderRadius: '20px', border: '1px solid #334155', outline: 'none', width: '100%', fontSize: '14px', background: '#1e293b', color: '#f8fafc' }}
            />
          </form>

          <nav className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="nav-link">
                  📦 Orders
                </Link>
                <Link to="/wishlist" className="nav-link" style={{ position: 'relative' }}>
                  ❤️ Wishlist {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                  🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </Link>
                <Link to="/profile" className="nav-link">
                  👤 Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link" style={{ color: '#22c55e', fontWeight: '700' }}>
                    ⚙️ Admin
                  </Link>
                )}
                <button onClick={logout} className="btn btn-danger" style={{ fontSize: '13px', padding: '6px 14px' }}>
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
      <div className="hero" style={{ padding: '48px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #047857 100%)', color: '#ffffff', boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🌱 100% Farm Fresh & Organic Certified
          </span>
          <h2 style={{ fontSize: '36px', margin: '15px 0 10px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Fresh Harvest Directly from Farmers to Your Doorstep
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.95, margin: 0, lineHeight: 1.5 }}>
            Explore fresh fruits, organic vegetables, high-yield seeds, heavy-duty farming equipment & organic kitchen staples.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
              🚜 Direct Farm Sourcing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
              ⚡ Same-Day Express Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
              🛡️ 100% Quality Guarantee
            </div>
          </div>
        </div>
      </div>

      <main className="home-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Top Controls: Primary Category Tabs + Sort Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          <div className="categories-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  borderRadius: '20px',
                  padding: '10px 22px',
                  border: '1.5px solid #16a34a',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: selectedCategory === cat ? '#ffffff' : '#15803d',
                  backgroundColor: selectedCategory === cat ? '#16a34a' : '#ffffff',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated ⭐</option>
            </select>
          </div>
        </div>

        {/* Subcategory Pills */}
        {selectedCategory !== 'All' && SUBCATEGORIES[selectedCategory] && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', padding: '12px 18px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534', alignSelf: 'center' }}>Subcategory:</span>
            {SUBCATEGORIES[selectedCategory].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedSubcategory === sub ? '#15803d' : '#ffffff',
                  color: selectedSubcategory === sub ? '#ffffff' : '#166534',
                  boxShadow: selectedSubcategory === sub ? '0 2px 6px rgba(21, 128, 61, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#166534', fontSize: '16px', fontWeight: '600' }}>
            🌱 Fetching farm fresh catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div className="empty-state-icon" style={{ fontSize: '50px', marginBottom: '15px' }}>🥦</div>
            <h3 style={{ fontSize: '22px', color: '#0f172a' }}>No Produce Found</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Your database catalog is currently empty. Click below to populate the 100+ agricultural product catalog!</p>
            <button
              onClick={handleSeedProducts}
              className="btn btn-primary"
              disabled={isSeeding}
              style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '12px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              {isSeeding ? 'Seeding Agriculture Catalog...' : '🌿 Seed AgriFresh Catalog'}
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <div 
                className="product-card" 
                key={prod._id}
                onClick={() => setActiveModalProduct(prod)}
                style={{ cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              >
                <button
                  className={`wishlist-btn ${isInWishlist(prod._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(prod._id);
                  }}
                  disabled={cartLoading}
                  style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  {isInWishlist(prod._id) ? '❤️' : '🤍'}
                </button>

                <div className="product-image-container" style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                  <img
                    src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'}
                    alt={prod.title || prod.name}
                    className="product-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {prod.isOrganic !== false && (
                    <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#15803d', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px' }}>
                      🌿 Organic
                    </span>
                  )}
                </div>

                <div className="product-details" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="product-brand" style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>{prod.brand || 'AgriFresh'}</span>
                    {prod.unit && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>({prod.unit})</span>}
                  </div>

                  <h3 className="product-title" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '4px 0 8px', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {prod.title || prod.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    <span>⭐ {prod.rating || '4.8'} ({prod.numReviews || '24'})</span>
                    {prod.farmOrigin && <span style={{ color: '#475569' }}>• 📍 {prod.farmOrigin.split(',')[0]}</span>}
                  </div>

                  <div className="product-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="product-price" style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>₹{prod.price?.toLocaleString('en-IN')}</span>
                      {prod.comparePrice > prod.price && (
                        <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>₹{prod.comparePrice}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod._id, 1);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '10px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: '700' }}
                        disabled={cartLoading}
                      >
                        🛒 Cart
                      </button>
                      <button
                        onClick={(e) => handleBuyNowDirect(e, prod)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '10px', background: '#16a34a', borderColor: '#16a34a', fontWeight: '700' }}
                        disabled={cartLoading}
                      >
                        ⚡ Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          isInWishlist={isInWishlist(activeModalProduct._id)}
        />
      )}
    </div>
  );
}

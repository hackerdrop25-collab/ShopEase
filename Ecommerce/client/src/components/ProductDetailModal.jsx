/**
 * AgriFresh - Product Detail Modal
 *
 * Detailed produce & agricultural equipment view displaying farm origin,
 * organic badges, unit weight/pack size, rating, description, stock status,
 * quantity selector, Add to Cart, Buy Now, and Wishlist toggling.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/shopping.css';

export default function ProductDetailModal({ product, onClose, isInWishlist }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, loading } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      return;
    }
    setIsAdding(true);
    await addToCart(product._id, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed to checkout.');
      return;
    }
    setIsAdding(true);
    await addToCart(product._id, quantity);
    setIsAdding(false);
    onClose();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('Please log in to save items to your wishlist.');
      return;
    }
    toggleWishlist(product._id);
  };

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: 'none',
            background: '#f1f5f9',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Product Image Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0'
          }}>
            {hasDiscount && (
              <span style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {discountPercent}% OFF
              </span>
            )}

            {product.isOrganic !== false && (
              <span style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🌿 100% Organic Certified
              </span>
            )}

            <img 
              src={imageUrl} 
              alt={product.title || product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Farm Origin Badge */}
          {product.farmOrigin && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Farm Origin & Location</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>{product.farmOrigin}</div>
              </div>
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.brand || 'AgriFresh'} • {product.category} {product.subcategory ? `(${product.subcategory})` : ''}
            </span>
            <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '6px 0 10px', fontWeight: '800' }}>
              {product.title || product.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '3px 8px', borderRadius: '8px', fontWeight: '700' }}>
                ⭐ {product.rating || 4.8}
              </span>
              <span>({product.numReviews || 24} reviews)</span>
              <span style={{ color: product.stock > 0 ? '#16a34a' : '#ef4444', fontWeight: '700' }}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '6px 0' }}>
            <span style={{ fontSize: '30px', fontWeight: '800', color: '#15803d' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.unit && (
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                / {product.unit}
              </span>
            )}
            {hasDiscount && (
              <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through', marginLeft: 'auto' }}>
                ₹{product.comparePrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Quantity ({product.unit || 'Unit'}):</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '8px 16px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                -
              </button>
              <span style={{ padding: '8px 18px', fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                style={{ padding: '8px 16px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || loading || product.stock === 0}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#15803d',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isAdding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={isAdding || loading || product.stock === 0}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              ⚡ Buy Now
            </button>

            <button
              onClick={handleWishlistToggle}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: isInWishlist ? '#ffe4e6' : '#ffffff',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              {isInWishlist ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

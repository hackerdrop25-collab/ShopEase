/**
 * ShopEase - Cart & Wishlist Context
 *
 * Manages state for:
 * - Cart items, quantities, subtotal, and total price
 * - Wishlist items
 * - Checkout and order placement
 */

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart and wishlist whenever user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist(null);
    }
  }, [isAuthenticated]);

  // ── CART METHODS ─────────────────────────────────────────────────────────────
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.cart || response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await api.post('/cart/add', { productId, quantity });
      setCart(response.data.cart || response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add product to cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      setCart(response.data.cart || response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.cart || response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove product from cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/cart/clear');
      setCart({ items: [] });
      setError(null);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── WISHLIST METHODS ─────────────────────────────────────────────────────────

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data.wishlist || response.data);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      setLoading(true);
      const wishlistProducts = wishlist?.products || [];
      const isAlreadyInWishlist = wishlistProducts.some(
        (item) => (item._id || item.product?._id || item.product || item) === productId
      );

      let response;
      if (isAlreadyInWishlist) {
        response = await api.delete(`/wishlist/remove/${productId}`);
      } else {
        response = await api.post('/wishlist/add', { productId });
      }
      setWishlist(response.data.wishlist || response.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle wishlist';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── CHECKOUT / ORDERS ────────────────────────────────────────────────────────

  const checkout = async (shippingAddress, paymentMethod = 'cod') => {
    try {
      setLoading(true);
      const response = await api.post('/orders', { shippingAddress, paymentMethod });
      // Clear cart state since backend clears it
      setCart({ items: [] });
      return { success: true, order: response.data.order };
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    wishlist,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchWishlist,
    toggleWishlist,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

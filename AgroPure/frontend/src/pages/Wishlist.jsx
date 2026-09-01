import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../api/wishlistApi";
import { addToCart } from "../api/cartApi";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await getWishlist();
      setWishlist(data.wishlist);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const data = await removeFromWishlist(productId);
      setWishlist(data.wishlist);
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      await loadWishlist();
      alert("Moved to Cart! 🛒");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading wishlist...</div>;
  }

  const products = wishlist?.products || [];

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.5rem" }}>❤️ My Organic Wishlist</h1>

      {products.length === 0 ? (
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Your wishlist is empty.</p>
          <Link to="/products" className="btn-primary">Explore Fresh Harvests</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60"}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{product.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{product.category}</p>
                <div className="price-tag">₹{product.price} / {product.unit}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <button
                    onClick={() => handleMoveToCart(product._id)}
                    className="btn-primary"
                    style={{ flex: 1, padding: "0.5rem" }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="btn-outline"
                    style={{ padding: "0.5rem 0.75rem", borderColor: "#ef4444", color: "#ef4444" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

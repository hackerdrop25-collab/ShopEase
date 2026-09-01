import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { addToWishlist } from "../api/wishlistApi";
import { useAuth } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data.product);
      } catch (error) {
        console.error(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product._id, quantity);
      setMsg({ type: "success", text: "Product added to cart successfully! 🛒" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (error) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to add to cart" });
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await addToWishlist(product._id);
      setMsg({ type: "success", text: "Added to wishlist! ❤️" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch (error) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to add to wishlist" });
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {msg.text && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius)",
            marginBottom: "1.5rem",
            background: msg.type === "success" ? "var(--primary-light)" : "#fee2e2",
            color: msg.type === "success" ? "var(--primary)" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2.5rem",
          background: "var(--surface)",
          padding: "2rem",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60"}
            alt={product.name}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
          />
        </div>

        <div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <span className="badge-category">{product.category}</span>
            {product.organicCertified && <span className="badge-organic">🌱 100% Organic Certified</span>}
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>{product.name}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "1rem" }}>
            {product.description}
          </p>

          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", margin: "1rem 0" }}>
            ₹{product.price} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>/ {product.unit}</span>
          </div>

          <div style={{ background: "var(--surface-muted)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1.5rem" }}>
            <p><strong>Farm Location:</strong> {product.farmLocation || "Tamil Nadu Organic Cluster"}</p>
            <p><strong>Farmer:</strong> {product.farmer?.name || "Verified Local Farmer"}</p>
            <p><strong>Available Stock:</strong> {product.stock} {product.unit}</p>
            {product.certification && <p><strong>Certification:</strong> {product.certification}</p>}
          </div>

          {/* Quantity selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600 }}>Quantity ({product.unit}):</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="form-control"
              style={{ width: "80px", textAlign: "center" }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={handleAddToCart} className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
              🛒 Add to Cart
            </button>
            <button onClick={handleWishlist} className="btn-outline" style={{ padding: "0.75rem 1.5rem" }}>
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

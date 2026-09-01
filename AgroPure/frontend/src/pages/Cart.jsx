import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../api/cartApi";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data.cart);
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (productId, qty) => {
    if (qty < 1) return;
    try {
      const data = await updateCartItem(productId, qty);
      setCart(data.cart);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      setCart(data.cart);
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    try {
      await clearCart();
      setCart({ items: [] });
    } catch (error) {
      alert("Failed to clear cart");
    }
  };

  const items = cart?.items || [];

  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const gstRate = 0.05; // 5% GST on organic food
  const gstAmount = Math.round(subtotal * gstRate);
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const grandTotal = subtotal + gstAmount + deliveryFee;

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🛒</div>
        Loading your basket...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>🛒 Your Shopping Cart</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        {items.length} {items.length === 1 ? "item" : "items"} in your basket
      </p>

      {items.length === 0 ? (
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌿</div>
          <p style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your Cart is Empty</p>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Add some fresh organic produce to get started!</p>
          <Link to="/products" className="btn-primary" style={{ padding: "0.75rem 1.5rem" }}>Browse Fresh Produce</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "flex-start" }}>
          {/* Left: Cart Items */}
          <div>
            {items.map((item) => (
              <div
                key={item.product?._id}
                style={{
                  display: "flex",
                  gap: "1.25rem",
                  background: "var(--surface)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  marginBottom: "1rem",
                  boxShadow: "var(--shadow)",
                }}
              >
                {/* Product Image */}
                <img
                  src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60"}
                  alt={item.product?.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    flexShrink: 0,
                  }}
                />

                {/* Product Info */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <Link to={`/products/${item.product?._id}`} style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                          {item.product?.name}
                        </Link>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <span className="badge-category">{item.product?.category}</span>
                          {item.product?.organicCertified && <span className="badge-organic">🌱 Organic</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--primary)" }}>
                          ₹{((item.product?.price || 0) * item.quantity).toFixed(0)}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          ₹{item.product?.price} / {item.product?.unit}
                        </div>
                      </div>
                    </div>
                    {item.product?.farmLocation && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        📍 {item.product.farmLocation}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                      <button
                        onClick={() => handleUpdateQty(item.product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: "36px",
                          height: "36px",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          background: "var(--surface-muted)",
                          color: item.quantity <= 1 ? "var(--border)" : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        −
                      </button>
                      <span style={{ width: "44px", textAlign: "center", fontWeight: 800, fontSize: "1rem" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.product?._id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product?.stock || 999)}
                        style={{
                          width: "36px",
                          height: "36px",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          background: "var(--surface-muted)",
                          color: "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.product?._id)}
                      style={{ color: "#ef4444", background: "none", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleClear}
              style={{ color: "var(--text-muted)", background: "none", fontSize: "0.85rem", cursor: "pointer", marginTop: "0.5rem" }}
            >
              🗑️ Clear Entire Cart
            </button>
          </div>

          {/* Right: Order Summary */}
          <div style={{
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            position: "sticky",
            top: "5rem",
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem" }}>🧾 Price Details</h2>

            {/* Itemized breakdown */}
            <div style={{ marginBottom: "1rem" }}>
              {items.map((item) => (
                <div key={item.product?._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                  <span style={{ flex: 1 }}>{item.product?.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "1rem 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Items Total ({items.length} items)</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Shipping</span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "var(--primary)" : "var(--text-main)" }}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee === 0 && (
              <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginBottom: "0.5rem" }}>
                ✅ Free delivery on orders above ₹500
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>GST (5%)</span>
              <span style={{ fontWeight: 600 }}>₹{gstAmount}</span>
            </div>

            <hr style={{ border: "none", borderTop: "2px solid var(--border)", margin: "1rem 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem" }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--primary)" }}>₹{grandTotal}</span>
            </div>

            {subtotal > 0 && (
              <div style={{ background: "var(--primary-light)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                💚 You save more with organic direct-from-farm pricing!
              </div>
            )}

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
            >
              Proceed to Checkout →
            </button>

            <Link to="/products" style={{ display: "block", textAlign: "center", marginTop: "0.75rem", color: "var(--primary)", fontSize: "0.9rem", fontWeight: 600 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

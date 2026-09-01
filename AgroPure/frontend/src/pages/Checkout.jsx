import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cartApi";
import { createOrder, createRazorpayOrderApi, verifyRazorpayPaymentApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // Load cart for order summary
  useEffect(() => {
    const loadCart = async () => {
      try {
        setCartLoading(true);
        const data = await getCart();
        setCart(data.cart);
      } catch (err) {
        console.error(err);
      } finally {
        setCartLoading(false);
      }
    };
    loadCart();
  }, []);

  const items = cart?.items || [];

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0);

  const gstRate = 0.05;
  const gstAmount = Math.round(subtotal * gstRate);
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const grandTotal = subtotal + gstAmount + deliveryFee;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Please check internet connection.");
      return;
    }

    try {
      const razorpayData = await createRazorpayOrderApi();

      const options = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "AgroPure Organics",
        description: `Farm Fresh Order • ₹${grandTotal}`,
        order_id: razorpayData.orderId,
        handler: async (response) => {
          try {
            await verifyRazorpayPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: form,
            });
            alert("🎉 Payment Successful! Your organic order has been confirmed.");
            navigate("/my-orders");
          } catch (err) {
            alert(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: form.fullName,
          email: user?.email,
          contact: form.phone,
        },
        theme: {
          color: "#15803d",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initialize payment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (paymentMethod === "RAZORPAY") {
      await handleRazorpayPayment();
      setLoading(false);
      return;
    }

    try {
      await createOrder({
        shippingAddress: form,
        paymentMethod: "COD",
      });
      alert("🎉 Order placed successfully with Cash on Delivery!");
      navigate("/my-orders");
    } catch (error) {
      alert(error.response?.data?.message || "Order failed to process");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        Loading checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1.5rem" }}>Add some organic produce before checking out.</p>
        <button onClick={() => navigate("/products")} className="btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
        📦 Secure Checkout
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Complete your shipping details and payment to place your order
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", alignItems: "flex-start" }}>
        {/* Left: Shipping + Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Shipping Address Section */}
          <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: "1.5rem", boxShadow: "var(--shadow)" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem" }}>📍 Shipping Address</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="fullName"
                  className="form-control"
                  placeholder="e.g. Naveen Palani"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                name="street"
                className="form-control"
                placeholder="House/Plot No, Street, Area, Landmark"
                value={form.street}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  className="form-control"
                  placeholder="Coimbatore"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  className="form-control"
                  placeholder="Tamil Nadu"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  className="form-control"
                  placeholder="641001"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: "1.5rem", boxShadow: "var(--shadow)" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem" }}>💳 Payment Method</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label
                style={{
                  border: `2px solid ${paymentMethod === "COD" ? "var(--primary)" : "var(--border)"}`,
                  background: paymentMethod === "COD" ? "var(--primary-light)" : "var(--surface)",
                  padding: "1.25rem 1rem",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 700,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "1.5rem" }}>💵</span>
                <span>Cash on Delivery</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}>Pay when delivered</span>
              </label>

              <label
                style={{
                  border: `2px solid ${paymentMethod === "RAZORPAY" ? "var(--primary)" : "var(--border)"}`,
                  background: paymentMethod === "RAZORPAY" ? "var(--primary-light)" : "var(--surface)",
                  padding: "1.25rem 1rem",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 700,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "1.5rem" }}>💳</span>
                <span>Online Payment</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}>UPI / Card / Net Banking</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "1rem", fontSize: "1.05rem", fontWeight: 700 }}
          >
            {loading
              ? "Processing your order..."
              : paymentMethod === "RAZORPAY"
              ? `Pay ₹${grandTotal} with Razorpay`
              : `Place Order (Total: ₹${grandTotal})`}
          </button>
        </form>

        {/* Right: Order Summary Sidebar */}
        <div style={{
          background: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          position: "sticky",
          top: "5rem",
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem" }}>🧾 Order Summary</h2>

          {/* Items List */}
          <div style={{ maxHeight: "280px", overflowY: "auto", marginBottom: "1rem" }}>
            {items.map((item) => (
              <div
                key={item.product?._id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <img
                  src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60"}
                  alt={item.product?.name}
                  style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.3 }}>{item.product?.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {item.product?.unit} × {item.quantity}
                  </p>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  ₹{((item.product?.price || 0) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Items Total</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Shipping</span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "var(--primary)" : "var(--text-main)" }}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>GST (5%)</span>
              <span style={{ fontWeight: 600 }}>₹{gstAmount}</span>
            </div>

            <hr style={{ border: "none", borderTop: "2px solid var(--primary)", margin: "0.75rem 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>₹{grandTotal}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>🔒</span> Secure SSL Encrypted Checkout
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>🌱</span> 100% Organic & Pesticide-Free
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>📦</span> Same-day dispatch for local orders
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

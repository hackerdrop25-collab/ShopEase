import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading orders...</div>;
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.5rem" }}>📦 My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "1rem" }}>You have not placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: "var(--surface)",
                padding: "1.5rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Order #</span>
                  <strong style={{ fontSize: "0.95rem", marginLeft: "0.25rem" }}>{order._id}</strong>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem" }}>
                    {order.orderStatus}
                  </span>
                  <span style={{ fontWeight: 700 }}>₹{order.totalAmount}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Items:</h4>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                    <span>{item.name} × {item.quantity} ({item.unit})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                📍 Shipping to: {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

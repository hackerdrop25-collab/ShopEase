import { useEffect, useState } from "react";
import api from "../api/axios";

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders/farmer-orders");
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading incoming orders...</div>;
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>📦 Orders For My Farm Produce</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Customer orders containing harvests from your farm
      </p>

      {orders.length === 0 ? (
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
            No incoming customer orders yet.
          </p>
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
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Order ID:</span>{" "}
                  <strong>{order._id}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Customer: <strong>{order.user?.name || "Verified Customer"}</strong> ({order.user?.phone || "No phone"})
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.85rem" }}>
                    {order.orderStatus}
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Your Items Ordered:</h4>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px dashed var(--border)" }}>
                    <span>{item.name} × {item.quantity} {item.unit}</span>
                    <strong style={{ color: "var(--text-main)" }}>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                📍 Delivery Destination: {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;

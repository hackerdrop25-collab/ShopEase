import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderRes, prodRes] = await Promise.all([
        api.get("/orders/all-orders"),
        api.get("/products?limit=50"),
      ]);
      setOrders(orderRes.data.orders || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
      alert(`Order updated to ${newStatus}`);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading Admin Central...</div>;
  }

  const totalGross = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
          👑 AgroPure Platform Admin
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Oversee platform transactions, farmer inventories, and delivery statuses
        </p>
      </div>

      {/* Admin KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>🌾</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>{products.length}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Total Listed Products</p>
        </div>

        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>📦</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>{orders.length}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Total Platform Orders</p>
        </div>

        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>💳</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>₹{totalGross}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Gross Merchandise Value</p>
        </div>
      </div>

      {/* Orders Management */}
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem" }}>📦 Global Orders & Delivery Control</h2>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "1rem" }}>Order ID</th>
              <th style={{ padding: "1rem" }}>Customer</th>
              <th style={{ padding: "1rem" }}>Total</th>
              <th style={{ padding: "1rem" }}>Payment</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1rem", fontFamily: "monospace" }}>{o._id}</td>
                <td style={{ padding: "1rem" }}>{o.user?.name || "Customer"}<br /><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{o.user?.phone}</span></td>
                <td style={{ padding: "1rem", fontWeight: 700 }}>₹{o.totalAmount}</td>
                <td style={{ padding: "1rem" }}>{o.paymentMethod} ({o.paymentStatus})</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem" }}>
                    {o.orderStatus}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <select
                    value={o.orderStatus}
                    disabled={updatingId === o._id}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    style={{ padding: "0.4rem 0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", fontSize: "0.85rem" }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

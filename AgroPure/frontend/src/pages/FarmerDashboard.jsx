import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const prodRes = await api.get("/products/my-products");
        const prods = prodRes.data.products || [];
        setProductCount(prods.length);

        const orderRes = await api.get("/orders/farmer-orders");
        const orders = orderRes.data.orders || [];
        setOrderCount(orders.length);

        const rev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setTotalRevenue(rev);
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
          👨‍🌾 Farmer Command Hub
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Welcome back, {user?.name}! Manage your farm inventory and customer orders.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>🌾</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>{productCount}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Active Farm Products</p>
        </div>

        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>📦</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>{orderCount}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Incoming Orders</p>
        </div>

        <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "1.75rem" }}>💰</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 0.25rem", color: "var(--primary)" }}>₹{totalRevenue}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Total Farm Sales</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        <Link
          to="/farmer/products/add"
          style={{
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            display: "block",
            transition: "all 0.2s ease",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>➕ Add New Harvest</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            List freshly harvested organic vegetables, grains, or spices
          </p>
        </Link>

        <Link
          to="/farmer/products"
          style={{
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            display: "block",
            transition: "all 0.2s ease",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>🌾 My Harvest Inventory</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Update stock, change pricing, and manage your products
          </p>
        </Link>

        <Link
          to="/farmer/orders"
          style={{
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            display: "block",
            transition: "all 0.2s ease",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>📦 View Customer Orders</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Check pending shipments, destinations, and quantities
          </p>
        </Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;

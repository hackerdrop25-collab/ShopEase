import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        marginTop: "4rem",
        padding: "3rem 1.5rem 1.5rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.75rem" }}>
            🌱 AgroPure
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Connecting certified organic farmers directly with mindful consumers. 100% pure, natural, and transparent agriculture.
          </p>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.85rem", fontSize: "1rem" }}>Organic Categories</h4>
          <ul style={{ listStyle: "none", color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link to="/products?category=Vegetables">🥬 Farm Vegetables</Link></li>
            <li><Link to="/products?category=Fruits">🍎 Natural Fruits</Link></li>
            <li><Link to="/products?category=Grains%20%26%20Pulses">🌾 Grains & Pulses</Link></li>
            <li><Link to="/products?category=Spices">🌿 Herbal Spices</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.85rem", fontSize: "1rem" }}>Farmer & Partner</h4>
          <ul style={{ listStyle: "none", color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link to="/register">👨‍🌾 Sell Your Harvest</Link></li>
            <li><Link to="/farmer">📊 Farmer Dashboard</Link></li>
            <li><Link to="/products?organicCertified=true">🌱 Certified Farms</Link></li>
            <li><Link to="/admin">👑 Admin Central</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.85rem", fontSize: "1rem" }}>Trust & Quality</h4>
          <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            🌱 100% Pesticide & Chemical Free
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Direct-from-farm deliveries in eco-friendly packaging.
          </p>
        </div>
      </div>

      <div
        className="container"
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <p>© 2026 AgroPure Inc. All rights reserved.</p>
        <p>Built with React, Node.js, MongoDB Atlas, Cloudinary & Razorpay</p>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productApi";
import api from "../api/axios";

const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Grains & Pulses",
  "Spices",
  "Natural Products",
  "Seeds & Saplings",
  "Dairy",
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [organicOnly, setOrganicOnly] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (organicOnly) params.organicCertified = "true";

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, organicOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      await api.post("/products/seed");
      alert("🎉 AgroPure Catalog successfully seeded with organic produce, fruits, seeds, spices & natural products!");
      setSelectedCategory("All");
      setSearch("");
      await loadProducts();
    } catch (err) {
      alert("Failed to seed database: " + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--primary)" }}>
          🌱 Pure & Organic Farm Harvests
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Directly from certified organic farms to your doorstep
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search organic tomatoes, seeds, rice, spices, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          🔍 Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: selectedCategory === cat ? "var(--primary)" : "var(--surface)",
              color: selectedCategory === cat ? "#fff" : "var(--text-main)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}

        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
          />
          🌱 Organic Certified Only
        </label>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading fresh farm products...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🥦</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>No Produce Found</h2>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Your catalog is currently empty or no items match your filter. Click below to populate the full agricultural product catalog!
          </p>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="btn-primary"
            style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}
          >
            {seeding ? "Seeding Catalog..." : "🌾 Seed AgroPure Catalog"}
          </button>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="badge-category">{product.category}</span>
                  {product.organicCertified && (
                    <span className="badge-organic">🌱 Certified</span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1 }}>
                  {product.farmLocation ? `📍 ${product.farmLocation}` : "Organic Farm"}
                </p>
                <div className="price-tag">
                  ₹{product.price} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>/ {product.unit}</span>
                </div>
                <Link
                  to={`/products/${product._id}`}
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "0.5rem", textAlign: "center" }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

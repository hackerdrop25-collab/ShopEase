import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";

const CATEGORIES = [
  { name: "Vegetables", icon: "🥬", desc: "Fresh tomatoes, potatoes, greens & roots" },
  { name: "Fruits", icon: "🍎", desc: "Tree-ripened apples, bananas, mangoes" },
  { name: "Grains & Pulses", icon: "🌾", desc: "Traditional rice, millets, ragi & dals" },
  { name: "Spices", icon: "🌿", desc: "Pure turmeric, black pepper, cardamom" },
  { name: "Natural Products", icon: "🍯", desc: "Raw forest honey, wood-pressed oils" },
  { name: "Dairy", icon: "🥛", desc: "A2 farm milk, organic ghee & butter" },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ limit: 4, organicCertified: "true" });
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #166534 100%)",
          color: "white",
          padding: "5rem 1.5rem 6rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ maxWidth: "800px" }}>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              padding: "0.35rem 1rem",
              borderRadius: "999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              display: "inline-block",
              marginBottom: "1.25rem",
            }}
          >
            🌾 100% Certified Organic Farm Direct
          </span>
          <h1
            style={{
              fontSize: "3.25rem",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Fresh From Organic Farms To Your Kitchen
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              opacity: 0.9,
              marginBottom: "2.25rem",
              lineHeight: 1.6,
            }}
          >
            Pure vegetables, heritage grains, sun-dried spices, and raw natural honey harvested sustainably without synthetic chemicals.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/products"
              style={{
                background: "#ffffff",
                color: "var(--primary)",
                padding: "0.85rem 2rem",
                borderRadius: "var(--radius)",
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              }}
            >
              Shop Organic Produce
            </Link>
            <Link
              to="/register"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "1.5px solid rgba(255, 255, 255, 0.4)",
                padding: "0.85rem 1.75rem",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              👨‍🌾 Join as Farmer
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="container" style={{ marginTop: "-2.5rem", position: "relative", zIndex: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌱</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>100% Certified Organic</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Zero chemical fertilizers or synthetic pesticides.</p>
          </div>
          <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📍</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Direct Farm Traceability</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Know the exact farm location and harvest date for every item.</p>
          </div>
          <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🤝</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Fair Farmer Prices</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Direct buying empowers local farmers without middlemen.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container" style={{ padding: "4rem 1.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>Explore Harvest Categories</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>Curated organic nutrition for your everyday wellness</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/products?category=${encodeURIComponent(c.name)}`}
              style={{
                background: "var(--surface)",
                padding: "1.5rem 1rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "var(--shadow)",
                transition: "transform 0.2s ease",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{c.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{c.name}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Harvests Section */}
      <section className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>🌱 Featured Certified Harvests</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Top-rated organic produce picked this week</p>
          </div>
          <Link to="/products" className="btn-outline">
            View All Harvests →
          </Link>
        </div>

        {loading ? (
          <Loading message="Loading fresh featured harvests..." />
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products/my-products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading your harvests...</div>;
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>🌾 My Farm Products</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Manage inventory, pricing, and harvests</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary">
          + Add New Harvest
        </Link>
      </div>

      {products.length === 0 ? (
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "var(--radius)", textAlign: "center", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            You have not listed any farm products yet.
          </p>
          <Link to="/farmer/products/add" className="btn-primary">Add Your First Product</Link>
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
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="badge-category">{product.category}</span>
                  {product.organicCertified && <span className="badge-organic">🌱 Certified</span>}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0.5rem 0" }}>{product.name}</h3>
                <div className="price-tag">
                  ₹{product.price} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>/ {product.unit}</span>
                </div>
                <div style={{ background: "var(--surface-muted)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.85rem" }}>
                  <strong>Current Stock:</strong> {product.stock} {product.unit}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <Link
                    to={`/farmer/products/edit/${product._id}`}
                    className="btn-outline"
                    style={{ flex: 1, textAlign: "center", padding: "0.5rem" }}
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    style={{ padding: "0.5rem 0.75rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "var(--radius)", fontWeight: 600 }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;

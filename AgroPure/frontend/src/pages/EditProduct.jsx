import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/products/${id}`, {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        farmLocation: product.farmLocation,
        organicCertified: product.organicCertified,
      });

      alert("🎉 Product updated successfully!");
      navigate("/farmer/products");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading product...</div>;
  }

  if (!product) {
    return <div className="container" style={{ padding: "4rem", textAlign: "center" }}><h2>Product not found</h2></div>;
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div className="form-container" style={{ maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", textAlign: "center", marginBottom: "1.5rem" }}>
          ✏️ Edit Product Details
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              name="name"
              className="form-control"
              value={product.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={product.description || ""}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Price (₹ / {product.unit})</label>
              <input
                name="price"
                type="number"
                min="0"
                className="form-control"
                value={product.price || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock ({product.unit})</label>
              <input
                name="stock"
                type="number"
                min="0"
                className="form-control"
                value={product.stock || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Farm Location</label>
            <input
              name="farmLocation"
              className="form-control"
              value={product.farmLocation || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              id="organicCertified"
              name="organicCertified"
              type="checkbox"
              checked={!!product.organicCertified}
              onChange={handleChange}
            />
            <label htmlFor="organicCertified" style={{ margin: 0, cursor: "pointer", fontWeight: 700 }}>
              🌱 Organic Certified
            </label>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ flex: 1, padding: "0.85rem" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/farmer/products")}
              className="btn-outline"
              style={{ padding: "0.85rem 1.25rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

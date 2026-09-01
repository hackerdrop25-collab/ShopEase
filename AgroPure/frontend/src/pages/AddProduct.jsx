import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadProductImage } from "../api/uploadApi";
import api from "../api/axios";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    stock: "",
    farmLocation: "",
    harvestDate: "",
    organicCertified: false,
    certification: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let imageUrl = "";

      // Upload image to Cloudinary first if provided
      if (image) {
        const uploadResult = await uploadProductImage(image);
        imageUrl = uploadResult.imageUrl;
      }

      // Create organic product
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : [],
      });

      alert("🎉 Organic product published successfully!");
      navigate("/farmer/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div className="form-container" style={{ maxWidth: "650px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", textAlign: "center", marginBottom: "0.5rem" }}>
          🌱 Add Organic Farm Harvest
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Publish fresh farm produce directly to conscious consumers
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="e.g. Organic Hill Tomato"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Describe cultivation method, taste, freshness..."
              value={form.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Category</label>
              <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Grains & Pulses</option>
                <option>Spices</option>
                <option>Natural Products</option>
                <option>Dairy</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Unit</label>
              <select name="unit" className="form-control" value={form.unit} onChange={handleChange}>
                <option value="kg">kg</option>
                <option value="500g">500g</option>
                <option value="250g">250g</option>
                <option value="litre">litre</option>
                <option value="500ml">500ml</option>
                <option value="piece">piece</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                name="price"
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 80"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Available Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Farm Location</label>
              <input
                name="farmLocation"
                className="form-control"
                placeholder="e.g. Coimbatore, Tamil Nadu"
                value={form.farmLocation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Harvest Date</label>
              <input
                name="harvestDate"
                type="date"
                className="form-control"
                value={form.harvestDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              id="organicCertified"
              name="organicCertified"
              type="checkbox"
              checked={form.organicCertified}
              onChange={handleChange}
            />
            <label htmlFor="organicCertified" style={{ margin: 0, cursor: "pointer", fontWeight: 700 }}>
              🌱 100% Certified Organic
            </label>
          </div>

          <div className="form-group">
            <label>Certification Authority (Optional)</label>
            <input
              name="certification"
              className="form-control"
              placeholder="e.g. NPOP / PGS-India / Jaivik Bharat"
              value={form.certification}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Product Photo (Cloudinary Upload)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "1rem" }}
          >
            {loading ? "Uploading & Publishing..." : "Publish Harvest"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

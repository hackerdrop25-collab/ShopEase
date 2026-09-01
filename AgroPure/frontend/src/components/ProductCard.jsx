import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img
        src={
          product.images?.[0] ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60"
        }
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className="badge-category">{product.category}</span>
          {product.organicCertified && <span className="badge-organic">🌱 Certified</span>}
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>
          {product.name}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1 }}>
          {product.farmLocation ? `📍 ${product.farmLocation}` : "Organic Local Farm"}
        </p>
        <div className="price-tag">
          ₹{product.price}{" "}
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
            / {product.unit}
          </span>
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
  );
};

export default ProductCard;

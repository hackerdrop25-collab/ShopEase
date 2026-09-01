import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          🌱 AgroPure
        </Link>
        <div className="nav-links">
          <Link to="/products">Catalog</Link>
          {isLoggedIn ? (
            <>
              <Link to="/wishlist">❤️ Wishlist</Link>
              <Link to="/cart">🛒 Cart</Link>
              <Link to="/my-orders">📦 My Orders</Link>
              {(user?.role === "farmer" || user?.role === "admin") && (
                <Link to="/farmer" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  👨‍🌾 Farmer Hub
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin" style={{ color: "#7c3aed", fontWeight: 700 }}>
                  👑 Admin
                </Link>
              )}
              <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
                {user?.name} ({user?.role})
              </span>
              <button onClick={handleLogout} className="btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

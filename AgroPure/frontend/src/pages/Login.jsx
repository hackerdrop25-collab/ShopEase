import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const data = await loginApi({ email, password });
      login(data);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div className="form-container">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", textAlign: "center", marginBottom: "0.5rem" }}>
          Welcome Back to AgroPure
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Sign in to access your organic cart & orders
        </p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. farmer@gmail.com or customer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

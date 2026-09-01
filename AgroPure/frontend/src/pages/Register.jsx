import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const data = await registerApi(form);
      login(data);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div className="form-container">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", textAlign: "center", marginBottom: "0.5rem" }}>
          Create AgroPure Account
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Join as a Customer or Organic Farmer
        </p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="e.g. Naveen Palani"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. user@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password (min 6 characters)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              className="form-control"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <select
              name="role"
              className="form-control"
              value={form.role}
              onChange={handleChange}
            >
              <option value="customer">Customer (Buy organic produce)</option>
              <option value="farmer">Farmer (Sell organic harvests)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

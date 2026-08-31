/**
 * ShopEase - Home Page
 *
 * Welcome page with navigation
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-content">
          <h1 className="logo">🛒 ShopEase</h1>
          <nav className="navbar-links">
            {isAuthenticated ? (
              <>
                <span className="user-name">Welcome, {user?.name}!</span>
                <Link to="/profile" className="nav-link">
                  My Profile
                </Link>
                <button onClick={logout} className="btn btn-danger">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="home-content">
        <div className="hero">
          <h2>Welcome to ShopEase</h2>
          <p>Your favorite online shopping destination</p>

          {!isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/profile" className="btn btn-primary">
                Go to Profile
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <section className="features">
          <h3>Phase 3 Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>✅ User Registration</h4>
              <p>Create your account with email, name, and phone number</p>
            </div>
            <div className="feature-card">
              <h4>🔐 Secure Login</h4>
              <p>Login with encrypted passwords and JWT tokens</p>
            </div>
            <div className="feature-card">
              <h4>👤 Profile Management</h4>
              <p>View and update your profile information</p>
            </div>
            <div className="feature-card">
              <h4>🔑 Password Security</h4>
              <p>Change your password with secure validation</p>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="status">
          <h3>Project Status</h3>
          <div className="status-grid">
            <div className="status-item completed">
              <span>✓</span>
              <p>Phase 1: Setup & Database</p>
            </div>
            <div className="status-item completed">
              <span>✓</span>
              <p>Phase 2: Mongoose Models</p>
            </div>
            <div className="status-item in-progress">
              <span>→</span>
              <p>Phase 3: Authentication</p>
            </div>
            <div className="status-item">
              <span>•</span>
              <p>Phase 4: Product API & CRUD</p>
            </div>
            <div className="status-item">
              <span>•</span>
              <p>Phase 5: Shopping Features</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

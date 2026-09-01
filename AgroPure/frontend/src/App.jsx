import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import FarmerDashboard from "./pages/FarmerDashboard";
import AddProduct from "./pages/AddProduct";
import MyProducts from "./pages/MyProducts";
import EditProduct from "./pages/EditProduct";
import FarmerOrders from "./pages/FarmerOrders";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Protected Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Farmer Dashboard Routes */}
            <Route
              path="/farmer"
              element={
                <ProtectedRoute roles={["farmer", "admin"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products"
              element={
                <ProtectedRoute roles={["farmer", "admin"]}>
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/add"
              element={
                <ProtectedRoute roles={["farmer", "admin"]}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/products/edit/:id"
              element={
                <ProtectedRoute roles={["farmer", "admin"]}>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute roles={["farmer", "admin"]}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

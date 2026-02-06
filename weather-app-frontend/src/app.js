import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Welcome from "./components/welcome"
import Upload from "./components/ProductUpload"
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />  {/* Landing page */}
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
          <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}


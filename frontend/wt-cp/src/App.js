// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Cart from "./pages/Cart";
import Rent from "./pages/Rent";
import Liked from "./pages/Liked";
import Shopping from "./pages/Shopping";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyProducts from "./pages/myProducts";
import SplashScreen from "./pages/SplashScreen";
import UpdateProduct from "./pages/UpdateProduct";
import ProductCard from "./components/ProductCard";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Browsing products is public; only viewing a product's detail
            page or acting on it (like/cart/rent/profile) requires login. */}
        <Route path="/shopping" element={<Shopping />} />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-items"
          element={
            <ProtectedRoute>
              <Liked />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rent"
          element={
            <ProtectedRoute>
              <Rent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/splash"
          element={
            <ProtectedRoute>
              <SplashScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myProducts"
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/updateProduct/:id"
          element={
            <ProtectedRoute>
              <UpdateProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/shopping" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

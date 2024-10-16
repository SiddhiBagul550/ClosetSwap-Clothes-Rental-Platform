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
import CategoryPage from "./pages/CategoryPage";
import UpdateProduct from "./pages/UpdateProduct";

import ProductCard from "./components/ProductCard";
import MenShopping from "./components/MenShopping";
import KidsShopping from "./components/KidsShopping";
import WomenShopping from "./components/WomenShopping";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/category"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping"
          element={
            <ProtectedRoute>
              <Shopping />
            </ProtectedRoute>
          }
        />
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
          path="/men"
          element={
            <ProtectedRoute>
              <MenShopping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/women"
          element={
            <ProtectedRoute>
              <WomenShopping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kids"
          element={
            <ProtectedRoute>
              <KidsShopping />
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
        <Route
          path="/"
          element={
            localStorage.getItem("jwtToken") ? (
              <Navigate to="/splash" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

// src/App.js
import React from "react";
import CategoryPage from "./components/CategoryPage";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import SignupPage from "./components/SignupPage";
import SplashScreen from "./components/SplashScreen";
import Shopping from "./components/Shopping";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import MenShopping from "./components/MenShopping";
import WomenShopping from "./components/WomenShopping";
import KidsShopping from "./components/KidsShopping";
import Liked from "./components/Liked";
import Rent from "./components/Rent";
import MyProducts from "./components/myProducts";

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

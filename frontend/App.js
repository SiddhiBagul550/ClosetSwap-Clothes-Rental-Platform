// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // State to check login status
  const [showSplash, setShowSplash] = useState(true);   // State to control splash screen visibility

  // Display splash screen for 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Routes>
        {showSplash ? (
          <Route path="/" element={<SplashScreen />} />
        ) : (
          <>
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Navigate to={isLoggedIn ? "/login" : "/signup"} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

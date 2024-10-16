import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../css/Shopping.css";

function App() {
  return (
    <div className="app-container">
      {/* Search bar and profile */}
      <header className="header">
        <div className="search-bar">
          <input type="text" placeholder="Search for products" />
          <button className="voice-icon">🎤</button>
        </div>
        <div className="profile-icon">👤</div>
      </header>

      {/* Product grid */}
      <div className="product-grid">
        {[...Array(6)].map((_, index) => (
          <Link to={`/product/${index}`} key={index} className="product-link">
            {" "}
            {/* Wrap product in a Link */}
            <div className="product-card">
              <div className="image-placeholder"></div>
              <div className="product-actions">
                <span>💖</span>
                <span>🔗</span>
                <span>🛒</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom navigation bar */}
      <footer className="bottom-nav">
        <div className="nav-item">👗 Costumes</div>
        <div className="nav-item">👕 Clothing</div>
        <div className="nav-item add-button">➕</div>
        <div className="nav-item">👟 Footwear</div>
        <div className="nav-item">👜 Accessories</div>
      </footer>
    </div>
  );
}

export default App;

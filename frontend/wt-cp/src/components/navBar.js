import React, { useState } from "react";
import logo from "./assets/ClosetSwapNew.png";
import UserInfo from "./UserInfo";
import { Link } from "react-router-dom";

export default function NavBar() {
  const [showProfile, setShowProfile] = useState(false);
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  return (
    <header className="header">
      <img
        src={logo}
        alt="Closet Swap"
        style={{
          height: "7vh",
          width: "10vw",
          objectFit: "contain",
        }}
      />
      <div className="search-bar">
        <input type="text" placeholder="Search for products" />
        <button className="voice-icon">🎤</button>
      </div>
      <div className="top-bar-icons">
        <Link to="/rent" className="rent-button">
          ➕ Rent
        </Link>
        <Link to="/liked-items" className="top-icon">
          💖 Liked Items
        </Link>
        <Link to="/cart" className="top-icon">
          🛒 Cart
        </Link>
        <div className="profile-icon" onClick={toggleProfile}>
          👤 Profile
        </div>
      </div>
      {/* Profile section */}
      {showProfile && <UserInfo />}
    </header>
  );
}

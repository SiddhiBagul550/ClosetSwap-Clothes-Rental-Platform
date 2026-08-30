import React, { useState } from "react";
import logo from "../assets/ClosetSwapNew.png";
import UserInfo from "./UserInfo";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavBar.css";
import { isAuthenticated } from "./ProtectedRoutes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHeart,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleProfile = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setShowProfile(!showProfile);
  };
  const isActive = (path) => location.pathname.startsWith(path);
  return (
    <header className="header">
      <Link to={"/shopping"} className="brand-link">
        <img src={logo} alt="Closet Swap" className="brand-logo" />
      </Link>

      <div className="top-bar-icons">
        <Link to="/rent" className="rent-button">
          <FontAwesomeIcon icon={faPlus} /> Rent
        </Link>
        <Link
          to="/liked-items"
          className={`top-icon ${isActive("/liked-items") ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={faHeart} style={{ color: "var(--accent-deep)" }} />
          <span className="nav-label">Liked</span>
        </Link>
        <Link to="/cart" className={`top-icon ${isActive("/cart") ? "active" : ""}`}>
          <FontAwesomeIcon icon={faShoppingCart} />
          <span className="nav-label">Cart</span>
        </Link>
        <div
          className={`profile-icon ${showProfile ? "active" : ""}`}
          onClick={toggleProfile}
        >
          <FontAwesomeIcon icon={faUser} />
          <span className="nav-label">{isAuthenticated() ? "Profile" : "Login"}</span>
        </div>
      </div>
      {/* Profile section */}
      {showProfile && isAuthenticated() && <UserInfo />}
    </header>
  );
}

import React, { useState } from "react";
import logo from "../assets/ClosetSwapNew.png";
import UserInfo from "./UserInfo";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHeart,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
  const [showProfile, setShowProfile] = useState(false);
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  return (
    <header className="header">
      <Link to={"/shopping"}>
        <img
          src={logo}
          alt="Closet Swap"
          style={{
            height: "7vh",
            width: "10vw",
            objectFit: "contain",
          }}
        />
      </Link>
      {/* <div className="search-bar">
        <input type="text" placeholder="Search for products" />
        <button className="voice-icon">🎤</button>
      </div> */}
      <div className="top-bar-icons">
        <Link to="/rent" className="rent-button">
          <FontAwesomeIcon icon={faPlus} /> Rent
        </Link>
        <Link to="/liked-items" className="top-icon">
          <FontAwesomeIcon icon={faHeart} style={{ color: "red" }} /> Liked
          Items
        </Link>
        <Link to="/cart" className="top-icon">
          <FontAwesomeIcon icon={faShoppingCart} /> Cart
        </Link>
        <div className="profile-icon" onClick={toggleProfile}>
          <FontAwesomeIcon icon={faUser} /> Profile
        </div>
      </div>
      {/* Profile section */}
      {showProfile && <UserInfo />}
    </header>
  );
}

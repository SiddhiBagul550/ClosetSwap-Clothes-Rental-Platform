import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/NavBar.css";

export default function UserInfo() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState("");
  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/users/${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`, // Set your token or any other header
            },
          }
        );

        setUserData(response.data.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    getInfo();
  }, []);

  const logOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  const initial = userData.username ? userData.username.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-section">
      <div className="profile-details">
        <div className="profile-avatar">{initial}</div>
        <span className="username">Welcome, {userData.username}!</span>
        <span className="profile-email">{userData.email}</span>

        <button
          className="switch-account"
          onClick={() => navigate("/myProducts")}
        >
          🧺 My Products
        </button>

        <button className="switch-account" onClick={() => navigate("/login")}>
          🔁 Switch Account
        </button>
        <button className="switch-account danger" onClick={logOut}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}

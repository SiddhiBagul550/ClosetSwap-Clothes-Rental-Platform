import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Shopping.css";

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

  return (
    <div className="profile-section">
      <div className="profile-details">
        <p className="username">{userData.username}</p>
        <br />
        <p>Email: {userData.email}</p>
        <br />
        {/* <p>Member since: Jan 2021</p>
        <br />
        <p>Total Orders: 25</p>
        <br />
        <p>Items Added to Rent: 5</p>
        <br /> */}
        <button
          className="switch-account"
          onClick={() => navigate("/myProducts")}
        >
          My Products
        </button>

        <button className="switch-account" onClick={() => navigate("/login")}>
          Switch Account
        </button>
        <button className="switch-account" onClick={logOut}>
          Log Out
        </button>
      </div>
    </div>
  );
}

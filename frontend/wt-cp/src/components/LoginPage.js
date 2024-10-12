import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import back from './assets/image.png'; // Background image
import img from './assets/ClosetSwap.jpg'; // Image for the left side

const LoginPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/v1/users/login",
          {
            email,
            password,
          }
        );

        if (response.status === 200) {
          alert("Login successful");
          const jwtToken = response.data.token;
          localStorage.setItem("jwtToken", jwtToken);
          navigate("/home");
        } else {
          alert("Login failed, please try again.");
        }
      } catch (error) {
        alert("Error during login. Please try again.");
      }
    } else {
      alert("Please fill out all fields");
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side with Image and Description */}
      <div style={styles.leftSide}>
        <img 
          src={img} 
          alt="Closet Swap" 
          style={styles.image}
        />
        <p style={styles.description}>
          Hello!!! Welcome to ClosetSwap: Your e-rental store for clothing, accessories, footwear, and costumes!
        </p>
      </div>

      {/* Right Side with Login Form */}
      <div style={styles.rightSide}>
        <div style={styles.loginBox}>
          <h2 style={styles.heading}>Login to ClosetSwap</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.inputBlue} // Applying blue styles to email
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.inputBlue} // Applying blue styles to password
            />
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
          <p style={styles.text}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")} style={styles.link}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row", // Two-column layout
    justifyContent: "space-between",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#F2F6FF", // light pastel blue
  },
  leftSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    height: "100%",
    backgroundColor: "#D8ACA1", // soft pastel for the left side
  },
  image: {
    width: "80%",
    height: "auto",
    marginBottom: "20px",
  },
  description: {
    fontSize: "18px",
    color: "#4A4A4A",
    textAlign: "center",
    maxWidth: "300px",
  },
  rightSide: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    background: "linear-gradient(to left, #FFF8E1, #D8ACA1)", // Smooth gradient between soft pastel yellow and light pastel
  },
  loginBox: {
    backgroundColor: "#ffffff", // White box for the login
    padding: "40px",
    borderRadius: "20px", // Rounded edges
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Soft shadow for the rounded box
    width: "350px",
    textAlign: "center",
  },
  heading: {
    color: "#6B728E", // muted pastel purple
    marginBottom: "20px",
    fontSize: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputBlue: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #B0C4DE", // pastel blue border
    fontSize: "16px",
    backgroundColor: "#E0F7FA", // soft pastel blue background
    color: "#4A4A4A",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#FFD3B4", // pastel peach
    color: "#4A4A4A",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  text: {
    color: "#4A4A4A",
    marginTop: "10px",
  },
  link: {
    color: "#91A7FF", // pastel blue
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginPage;

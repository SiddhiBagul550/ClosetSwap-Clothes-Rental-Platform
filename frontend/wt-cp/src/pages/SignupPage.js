import axios from "axios";
import img from "../assets/ClosetSwapNew.png"; // Image for the left side
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (username && email && password && passwordConfirm) {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/v1/users/signup",
          {
            username,
            email,
            password,
            passwordConfirm,
            contactNumber,
            address,
          }
        );
        if (response.status === 201) {
          alert("Signup successful");
          navigate("/login");
        } else {
          alert("Signup failed, please try again.");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Error during signup. Please try again.");
      }
    } else {
      alert("Please fill out all fields");
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side with Image and Description */}
      <div style={styles.leftSide}>
        <img src={img} alt="Closet Swap" style={styles.image} />
        <p style={styles.description}>
          Join ClosetSwap: Your go-to e-rental store for fashion, accessories,
          and more. Sign up today!
        </p>
      </div>

      {/* Right Side with Signup Form */}
      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Create Account for ClosetSwap</h2>
          <form onSubmit={handleSignup} style={styles.form}>
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setName(e.target.value)}
              style={styles.inputBlue}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.inputBlue}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.inputBlue}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={styles.inputBlue}
            />
            <input
              type="number"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              style={styles.inputBlue}
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={styles.inputBlue}
            />
            <button type="submit" style={styles.button}>
              Sign Up
            </button>
          </form>
          <p style={styles.text}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={styles.link}>
              Log In
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
    backgroundColor: "#ACD1CB", // Solid mint color for the left side
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
    background: "linear-gradient(to right, #ACD1CB, #FFFFFF)", // Gradient from mint to white
  },
  formContainer: {
    backgroundColor: "#ffffff", // White box for the signup
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
    color: "#0E2656",
    marginTop: "10px",
  },
  link: {
    color: "#91A7FF", // pastel blue
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default SignupPage;

// src/components/LoginPage.js
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Add your login logic here
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
          // console.log(response);
          const jwtToken = response.data.token;
          localStorage.setItem("jwtToken", jwtToken);
          console.log(localStorage.getItem("jwtToken"));
          navigate("/login");
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
      <h2>Login to ClosetSwap</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <span onClick={() => navigate("/signup")} style={styles.link}>
          Sign Up
        </span>
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  link: {
    color: "#4CAF50",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginPage;

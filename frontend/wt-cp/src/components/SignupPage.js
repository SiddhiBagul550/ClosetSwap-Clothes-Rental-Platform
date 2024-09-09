// src/components/SignupPage.js
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (username && email && password && passwordConfirm) {
      try {
        // Sending signup data to the backend
        const response = await axios.post(
          "http://localhost:3001/api/v1/users/signup",
          {
            username,
            email,
            password,
            passwordConfirm,
          }
        );
        if (response.status === 201) {
          alert("Signup successful");
          console.log(response);
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
      <h2>Create Account for ClosetSwap</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
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
        />{" "}
        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Sign Up
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")} style={styles.link}>
          Log In
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

export default SignupPage;

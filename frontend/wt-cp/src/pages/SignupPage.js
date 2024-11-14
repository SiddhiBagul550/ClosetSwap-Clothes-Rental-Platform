import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/ClosetSwapNew.png"; // Image for the left side
import back from "../assets/back1.jpg"; // Background image

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false); // Animation state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (email && password && passwordConfirm && username) {
      try {
        const response = await axios.post(
          "http://localhost:3001/api/v1/users/signup",
          {
            email,
            password,
            passwordConfirm,
            username,
            contactNumber,
            address,
          }
        );

        if (response.status === 201) {
          alert("Signup successful");
          setIsSignedUp(true); // Trigger exit animation

          // Delay navigation to allow animation to complete
          setTimeout(() => navigate("/login"), 600);
        } else {
          alert("Signup failed, please try again.");
        }
      } catch (error) {
        alert("Error during signup. Please try again.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background} />
      <div style={styles.foreground}>
        <div
          style={styles.signupBox}
          className={isSignedUp ? "exit" : ""} // Apply exit animation after signup
        >
          <h2 style={styles.heading}>Create Account for ClosetSwap</h2>
          <form onSubmit={handleSignup} style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              type="text"
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
    position: "relative",
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${back})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(2px)",
    zIndex: 0,
  },
  foreground: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  signupBox: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    width: "350px",
    textAlign: "center",
    transition: "transform 0.6s ease", // Smooth exit transition
  },
  heading: {
    color: "#6B728E",
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
    border: "1px solid #B0C4DE",
    fontSize: "16px",
    backgroundColor: "#E0F7FA",
    color: "#4A4A4A",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#ffcbc4",
    border: "1px solid #cc9696",
    color: "#4A4A4A",
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
    color: "#91A7FF",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

// CSS-in-JS for animations
const customStyles = document.createElement("style");
customStyles.innerHTML = `
  .exit {
    transform: translateY(100vh); // Move box downwards on successful signup
  }
  .animateInput:focus {
    border-color: #91A7FF; // Change border color on focus
    transition: border-color 0.3s ease;
  }
  .animateButton:hover {
    background-color: #ffc1b2; // Lighter shade on hover
    transition: background-color 0.3s ease;
  }
`;
document.head.appendChild(customStyles);

export default SignupPage;

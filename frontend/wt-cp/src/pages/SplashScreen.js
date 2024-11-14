import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/ClosetSwapNew.png";
import back from "../assets/back1.jpg";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(true);
  const [isScaling, setIsScaling] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(false);
      setIsScaling(true);
    }, 2000); // Display text for 2 seconds

    const navigateTimer = setTimeout(() => {
      navigate("/shopping"); // Navigate to the category page
    }, 5000); // Total time to navigate (2s text + 2.5s logo animation)

    return () => {
      clearTimeout(textTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div style={styles.backgroundContainer}>
      <div style={styles.backgroundBlur}></div> {/* Blurred background layer */}
      {showText && (
        <h1 style={styles.text}>
          Rent, refresh, and revamp your style
        </h1>
      )}
      <img
        src={img}
        alt="Closet Swap"
        style={{
          ...styles.logo,
          transform: isScaling ? "scale(1.5)" : "scale(0.5)", // Start small, then grow
          opacity: isScaling ? 1 : 0, // Fade in logo after text disappears
        }}
      />
    </div>
  );
}

const styles = {
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  backgroundBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${back})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(4px)", // Background blur
    zIndex: 0,
  },
  text: {
    fontSize: "5rem", // Full-width text size
    color: "white",
    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000", // Black border effect
    fontFamily: "'Fredoka One', cursive, sans-serif", // Bubbly font style
    width: "100%", // Full width for large screen text
    textAlign: "center",
    opacity: 1,
    zIndex: 1,
    transition: "opacity 1s ease", // Fade-out transition
    padding: "0 20px",
  },
  logo: {
    height: "50vh",
    width: "50vh", // Ensure width and height are equal for a square shape
    objectFit: "contain",
    border: "5px solid #ffffff", // White border for prominence
    borderRadius: "50%", // Circular border for a square image
    zIndex: 1,
    transition: "transform 2.5s ease, opacity 1s ease", // Smooth scaling and fade-in
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)", // Shadow for depth
  },
};

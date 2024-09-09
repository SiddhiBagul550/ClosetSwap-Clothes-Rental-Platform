// src/components/SplashScreen.js
import React from "react";

const SplashScreen = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.text}>ClosetSwap</h1>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5", // Light background color
  },
  text: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#4CAF50", // Stylish green color
  },
};

export default SplashScreen;

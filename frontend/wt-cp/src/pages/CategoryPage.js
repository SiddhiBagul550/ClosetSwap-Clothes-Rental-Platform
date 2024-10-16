// src/components/CategoryPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import menImage from "../assets/men.jpg";
import womenImage from "../assets/women.jpg";
import kidsImage from "../assets/kids.jpg";

const CategoryPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Navigate to the corresponding category page
    navigate(`/${category}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Search for products</h1>
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => handleCategoryClick("men")}>
          <img src={menImage} alt="Men" style={styles.image} />
          <span style={styles.label}>Men</span>
        </div>
        <div style={styles.card} onClick={() => handleCategoryClick("women")}>
          <img src={womenImage} alt="Women" style={styles.image} />
          <span style={styles.label}>Women</span>
        </div>
        <div style={styles.card} onClick={() => handleCategoryClick("kids")}>
          <img src={kidsImage} alt="Kids" style={styles.image} />
          <span style={styles.label}>Kids</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F2F6FF", // Background color
    padding: "20px",
    height: "100vh",
  },
  header: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  label: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
  },
};

export default CategoryPage;
